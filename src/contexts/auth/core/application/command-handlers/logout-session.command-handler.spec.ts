/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { LogoutSessionCommandHandler } from './logout-session.command-handler';
import { LogoutSessionCommand } from '../commands';
import { SessionRepository } from '../../domain';
import { SessionTokenVO } from '../../domain';
import { ok } from 'neverthrow';

describe('LogoutSessionCommandHandler', () => {
  let handler: LogoutSessionCommandHandler;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        LogoutSessionCommandHandler,
        {
          provide: SessionRepository,
          useValue: {
            deleteSession: jest.fn().mockResolvedValue(ok(null)),
          },
        },
      ],
    }).compile();

    handler = module.get<LogoutSessionCommandHandler>(
      LogoutSessionCommandHandler,
    );
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hash the password and create a user', async () => {
    const command = new LogoutSessionCommand(
      new SessionTokenVO('test-session-token-0')
    );
    await handler.execute(command);

    const lastCall = (sessionRepository.deleteSession as jest.Mock).mock.calls[0];
    const firstArg = lastCall[0];
    expect(firstArg.value).toBe('test-session-token-0');
  });
});
