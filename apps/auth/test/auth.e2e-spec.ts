import type { StartedTestContainer } from 'testcontainers';
import type { DatabaseModuleOptions } from 'adapters/database-adapter';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../bootstrap/app.module';
import { loggerConfig } from 'adapters/config-adapter';
import { cacheConfig } from 'adapters/config-adapter';
import { databaseConfig } from 'adapters/config-adapter';
import { serviceConfig } from 'adapters/config-adapter';
import { sessionCookieConfig } from 'adapters/config-adapter';
import { swaggerConfig } from 'adapters/config-adapter';
import { kafkaConfig } from 'adapters/config-adapter';
import { corsConfig } from 'adapters/config-adapter';
import { metricsConfig } from 'adapters/config-adapter';
import { Network } from 'testcontainers';
import { GenericContainer } from 'testcontainers';
import { Wait } from 'testcontainers';
import { Logger } from 'libs/logger';
import * as request from 'supertest';
import { Migrator } from 'libs/migrator';
import * as pgPromise from 'pg-promise';
import { join } from 'path';
import { KafkaContainer } from '@testcontainers/kafka';

jest.setTimeout(100_000);

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let postgres: StartedTestContainer;
  let redis: StartedTestContainer;
  let zookeeper: StartedTestContainer;
  let kafka: StartedTestContainer;
  let server: App;

  beforeAll(async () => {
    const network = await new Network().start();
    postgres = await new GenericContainer('bitnami/postgresql:17.0.0')
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections'),
      )
      .withEnvironment({
        POSTGRESQL_PASSWORD: 'password',
        POSTGRESQL_DATABASE: 'db',
        POSTGRESQL_REPLICATION_USE_PASSFILE: 'false',
      })
      .withNetwork(network)
      .start();

    redis = await new GenericContainer('redis:6.2')
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .withNetwork(network)
      .start();

    zookeeper = await new GenericContainer('confluentinc/cp-zookeeper:7.6.5')
      .withWaitStrategy(Wait.forLogMessage('INFO ZooKeeper audit is disabled.'))
      .withEnvironment({
        ZOOKEEPER_CLIENT_PORT: '2181',
      })
      .withExposedPorts(2181)
      .withNetwork(network)
      .withNetworkAliases('zookeeper')
      .start();

    kafka = await new KafkaContainer()
      // @ts-expect-error KafkaContainer bad types
      .withNetwork(network)
      .withZooKeeper('zookeeper', 2181)
      .withExposedPorts(9093)
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(loggerConfig.KEY)
      .useValue({ logLevel: 'ERROR' })
      .overrideProvider(cacheConfig.KEY)
      .useValue({
        port: 6379,
        host: redis.getIpAddress(network.getName()),
      })
      .overrideProvider(databaseConfig.KEY)
      .useValue({
        ssl: false,
        host: postgres.getIpAddress(network.getName()),
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'db',
        poolSize: 20,
      })
      .overrideProvider(serviceConfig.KEY)
      .useValue({})
      .overrideProvider(sessionCookieConfig.KEY)
      .useValue({
        maxAge: 1000000000,
        secure: false,
      })
      .overrideProvider(swaggerConfig.KEY)
      .useValue({})
      .overrideProvider(corsConfig.KEY)
      .useValue({})
      .overrideProvider(metricsConfig.KEY)
      .useValue({})
      .overrideProvider(kafkaConfig.KEY)
      .useValue({
        clientId: 'backend',
        brokers: [`${kafka.getHost()}:${kafka.getMappedPort(9093)}`],
      })
      .compile();

    app = moduleFixture.createNestApplication({
      bufferLogs: true,
    });
    const logger = await app.resolve(Logger);
    app.useLogger(logger);
    await app.init();
    server = app.getHttpServer();
    const dbConfig = await app.resolve<DatabaseModuleOptions>(
      databaseConfig.KEY,
    );
    const pgp = pgPromise();
    const client = pgp({
      ssl: dbConfig.ssl,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });
    const migrator = new Migrator(
      client,
      join('./src/adapters/database-adapter/migrations'),
      'migrations',
      logger,
    );
    await migrator.migrateUp();
  });

  afterAll(async () => {
    await app.close();
    await zookeeper.stop();
    await kafka.stop();
    await postgres.stop();
    await redis.stop();
  });

  it('/auth/register-by-login (POST) - successful registration', async () => {
    const response = await request(server)
      .post('/auth/register-by-login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({ message: 'USER_REGISTERED_SUCCESSFULLY' });
  });

  it('/auth/login (POST) - successful login', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({ message: 'USER_LOGGED_IN_SUCCESSFULLY' });
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('/auth/me (GET) - get user info with valid session', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    const cookie = loginResponse.headers['set-cookie'];
    const response = await request(server)
      .get('/auth/me')
      .set('Cookie', cookie);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('login', 'testuser');
  });

  it('/auth/logout (POST) - successful logout', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    const cookie = loginResponse.headers['set-cookie'];
    const response = await request(server)
      .post('/auth/logout')
      .set('Cookie', cookie);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({ message: 'USER_LOGGED_OUT_SUCCESSFULLY' });

    const meResponse = await request(server)
      .get('/auth/me')
      .set('Cookie', cookie);

    expect(meResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
