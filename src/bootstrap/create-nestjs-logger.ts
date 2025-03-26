import { LoggerModule } from '@libs/logger';

export const createNestJsLogger = () => {
  const NestJsLogger = LoggerModule.createLoggerByOptions({
    context: 'NestJs',
  });
  return NestJsLogger;
};
