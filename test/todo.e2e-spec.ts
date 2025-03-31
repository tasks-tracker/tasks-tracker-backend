import type { DatabaseModuleOptions } from '@adapters/database-adapter';
import { StartedTestContainer } from 'testcontainers';
import { Network } from 'testcontainers';
import { GenericContainer } from 'testcontainers';
import { Wait } from 'testcontainers';
import { KafkaContainer } from '@testcontainers/kafka';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/bootstrap/app.module';
import { loggerConfig } from '@adapters/config-adapter';
import { cacheConfig } from '@adapters/config-adapter';
import { databaseConfig } from '@adapters/config-adapter';
import { serviceConfig } from '@adapters/config-adapter';
import { sessionCookieConfig } from '@adapters/config-adapter';
import { swaggerConfig } from '@adapters/config-adapter';
import { kafkaConfig } from '@adapters/config-adapter';
import { corsConfig } from '@adapters/config-adapter';
import { metricsConfig } from '@adapters/config-adapter';
import { Logger } from '@libs/logger';
import * as pgPromise from 'pg-promise';
import { Migrator } from '@libs/migrator';
import { join } from 'node:path';

jest.setTimeout(100_000);

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let authCookie: string;
  let todoId: string;
  let postgres: StartedTestContainer;
  let redis: StartedTestContainer;
  let zookeeper: StartedTestContainer;
  let kafka: StartedTestContainer;

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

    const authResponse = await request(server)
      .post('/auth/register-by-login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    expect(authResponse.status).toBe(HttpStatus.CREATED);

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ login: 'testuser', password: 'P@ssw0rd' });

    expect(loginResponse.status).toBe(HttpStatus.OK);
    authCookie = loginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await app.close();
    await zookeeper.stop();
    await kafka.stop();
    await postgres.stop();
    await redis.stop();
  });

  it('/todo/create (POST) - create a new todo', async () => {
    const response = await request(server)
      .post('/todo/create')
      .set('Cookie', authCookie)
      .send({ title: 'Test Todo', description: 'Test Description', deadline: new Date().toISOString() });

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
    todoId = response.body.id;
  });

  it('/todo/update (PUT) - update an existing todo', async () => {
    const response = await request(server)
      .put('/todo/update')
      .set('Cookie', authCookie)
      .send({ todoId, fields: { title: 'Updated Todo' } });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });

  it('/todo/mark-as-completed (PUT) - mark a todo as completed', async () => {
    const response = await request(server)
      .put('/todo/mark-as-completed')
      .set('Cookie', authCookie)
      .send({ todoId });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });

  it('/todo/mark-as-not-completed (PUT) - mark a todo as not completed', async () => {
    const response = await request(server)
      .put('/todo/mark-as-not-completed')
      .set('Cookie', authCookie)
      .send({ todoId });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });

  it('/todo/get-todos (GET) - get todos for user', async () => {
    const response = await request(server)
      .get('/todo/get-todos')
      .set('Cookie', authCookie);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });

  it('/todo/delete-by-id (DELETE) - delete a todo', async () => {
    const response = await request(server)
      .delete('/todo/delete-by-id')
      .set('Cookie', authCookie)
      .send({ todoId });

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
    const getResponse = await request(server)
      .get('/todo/get-todos')
      .set('Cookie', authCookie);

    expect(getResponse.status).toBe(HttpStatus.OK);
    expect(getResponse.body).toBeInstanceOf(Array);
    expect(getResponse.body.length).toBe(0);
  });
});
