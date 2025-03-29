import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginUserCommandHandler } from './login-user.command-handler';
import { LoginUserCommand } from '../commands';
import { UserRepository, SessionRepository, CryptoPort, User, Session } from '../../domain';
import { LoginVO, PasswordVO, PasswordHashVO, SessionIdVO, UserIdVO } from '../../domain';
import { UserWithLoginNotExistDomainError, InvalidPasswordDomainError } from '../../domain';
import { randomUUID } from 'node:crypto';
import { ok } from 'neverthrow';

describe('LoginUserCommandHandler', () => {
  let handler: LoginUserCommandHandler;
  let cryptoPort: CryptoPort;
  let userRepository: UserRepository;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        LoginUserCommandHandler,
        {
          provide: CryptoPort,
          useValue: {
            comparePassword: jest.fn().mockResolvedValue(true),
            generateSessionToken: jest.fn().mockResolvedValue('session-token'),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getUserByLogin: jest.fn(),
            save: jest.fn().mockResolvedValue(ok(null)),
          },
        },
        {
          provide: SessionRepository,
          useValue: {
            nextId: jest.fn().mockReturnValue(new SessionIdVO(randomUUID())),
          },
        },
      ],
    }).compile();

    handler = module.get<LoginUserCommandHandler>(LoginUserCommandHandler);
    cryptoPort = module.get<CryptoPort>(CryptoPort);
    userRepository = module.get<UserRepository>(UserRepository);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return session token for valid credentials', async () => {
    const registeredAt = new Date();
    const sessions = [];
    const user = new User(
      new UserIdVO(randomUUID()),
      new LoginVO('valid-user'),
      new PasswordHashVO('hashed-password'),
      registeredAt,
      sessions,
    );
    jest.spyOn(userRepository, 'getUserByLogin').mockResolvedValue(user);

    const command = new LoginUserCommand(new LoginVO('valid-user'), new PasswordVO('P@ssw0rd'));
    const result = await handler.execute(command);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe('session-token');
    expect(userRepository.getUserByLogin).toHaveBeenCalledWith(new LoginVO('valid-user'));
    expect(cryptoPort.comparePassword).toHaveBeenCalledWith(new PasswordVO('P@ssw0rd'), user.passwordHash);
  });

  it('should return error if user does not exist', async () => {
    jest.spyOn(userRepository, 'getUserByLogin').mockResolvedValue(null);

    const command = new LoginUserCommand(new LoginVO('invalid-user'), new PasswordVO('P@ssw0rd'));
    const result = await handler.execute(command);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UserWithLoginNotExistDomainError);
  });

  it('should return error if password is invalid', async () => {
    const registeredAt = new Date();
    const sessions = [];
    const user = new User(
      new UserIdVO(randomUUID()),
      new LoginVO('valid-user'),
      new PasswordHashVO('hashed-password'),
      registeredAt,
      sessions,
    );
    jest.spyOn(userRepository, 'getUserByLogin').mockResolvedValue(user);
    jest.spyOn(cryptoPort, 'comparePassword').mockResolvedValue(false);

    const command = new LoginUserCommand(new LoginVO('valid-user'), new PasswordVO('wrongP@ssw0rd'));
    const result = await handler.execute(command);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(InvalidPasswordDomainError);
  });
});
