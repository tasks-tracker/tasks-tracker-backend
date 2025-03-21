import type { ConsoleLoggerOptions } from '@nestjs/common';
import type { Writable } from 'stream';

export interface LoggerOptions extends ConsoleLoggerOptions {
  stream?: Writable;
  colors?: boolean;
  context?: string;
  logLevelOrder?: Record<string, number>;
  logLevel?: string;
  space?: number;
}
