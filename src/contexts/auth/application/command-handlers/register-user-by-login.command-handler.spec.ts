/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserByLoginCommandHandler } from './register-user-by-login.command-handler';
import { RegisterUserByLoginCommand } from '../commands';
import { UserRepository } from '../../domain';
import { CryptoPort } from '../../domain';
import { User } from '../../domain';
import { LoginVO } from '../../domain';
import { PasswordVO } from '../../domain';
import { PasswordHashVO } from '../../domain';
import { UserIdVO } from '../../domain';
import { randomUUID } from 'node:crypto';
import { ok, err } from 'neverthrow';

describe('RegisterUserByLoginCommandHandler', () => {
  let handler: RegisterUserByLoginCommandHandler;
  let cryptoPort: CryptoPort;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RegisterUserByLoginCommandHandler,
        {
          provide: CryptoPort,
          useValue: {
            hashPassword: jest
              .fn()
              .mockResolvedValue(new PasswordHashVO('hashed-password')),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            nextId: jest.fn().mockReturnValue(new UserIdVO(randomUUID())),
            save: jest.fn().mockResolvedValue(ok(null)),
          },
        },
      ],
    }).compile();

    handler = module.get<RegisterUserByLoginCommandHandler>(
      RegisterUserByLoginCommandHandler,
    );
    cryptoPort = module.get<CryptoPort>(CryptoPort);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hash the password and create a user', async () => {
    const command = new RegisterUserByLoginCommand(
      new LoginVO('test-login-0'),
      new PasswordVO('P@ssw0rd'),
    );
    await handler.execute(command);

    const lastCall = (cryptoPort.hashPassword as jest.Mock).mock.calls[0];
    const firstArg = lastCall[0];
    expect(firstArg.value).toBe('P@ssw0rd');
    expect(userRepository.nextId).toHaveBeenCalled();
    const saveCall = (userRepository.save as jest.Mock).mock.calls[0];
    const user: User = saveCall[0];
    expect(user.login.value).toBe('test-login-0');
    expect(user.passwordHash.value).toBe('hashed-password');
  });

  it('should save the user and commit the changes', async () => {
    const command = new RegisterUserByLoginCommand(
      new LoginVO('test-login-1'),
      new PasswordVO('P@ssw0rdoTesto'),
    );

    await handler.execute(command);

    const saveCall = (userRepository.save as jest.Mock).mock.calls[0];
    const user: User = saveCall[0];
    const events = user.getUncommittedEvents();
    expect(events.length).toBe(0);
  });

  it('should return error if saving user fails', async () => {
    jest
      .spyOn(userRepository, 'save')
      .mockResolvedValueOnce(err(new Error('Save failed')));
    const command = new RegisterUserByLoginCommand(
      new LoginVO('test-login-2'),
      new PasswordVO('P@ssw0rdoTestoSupro'),
    );

    const result = await handler.execute(command);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('Save failed');
  });
});
