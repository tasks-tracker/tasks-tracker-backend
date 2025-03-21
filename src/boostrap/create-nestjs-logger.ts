import { LoggerModule } from '../libs';

export const createNestJsLogger = () => {
  const logger = LoggerModule.createLoggerByOptions({
    context: 'CreateNestJsLogger',
  });
  const NestJsLogger = LoggerModule.createLoggerByOptions({
    context: 'NestJs',
  });
  logger.debug('NestJsLogger created successfully.');
  return NestJsLogger;
};
