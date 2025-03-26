import type { LoggerService } from '@nestjs/common';
import type { LoggerOptions } from './interface';
import type { Writable } from 'node:stream';

import { DEFAULT_LOGGER_STREAM } from './constants';
import { DEFAULT_LOGGER_USE_COLORS } from './constants';
import { DEFAULT_LOGGER_SCOPE } from './constants';
import { DEFAULT_LOG_LEVELS_ORDER } from './constants';
import { DEFAULT_LOG_LEVEL } from './constants';
import { DEFAULT_LOGGER_COLORS } from './constants';
import { DEFAULT_LOGGER_SPACE } from './constants';

export class Logger implements LoggerService {
  private writeStream: Writable;
  private colors: boolean;
  private context: string;
  private minLogLevel: number;
  private logLevelsOrder: Record<string, number>;
  private space: number;

  constructor(loggerOptions?: LoggerOptions) {
    this.writeStream = loggerOptions?.stream ?? DEFAULT_LOGGER_STREAM;
    this.colors = loggerOptions?.colors ?? DEFAULT_LOGGER_USE_COLORS;
    this.context = loggerOptions?.context ?? DEFAULT_LOGGER_SCOPE;
    this.logLevelsOrder =
      loggerOptions?.logLevelOrder ?? DEFAULT_LOG_LEVELS_ORDER;
    this.minLogLevel =
      this.logLevelsOrder[loggerOptions?.logLevel ?? DEFAULT_LOG_LEVEL];
    this.space = loggerOptions?.space ?? DEFAULT_LOGGER_SPACE;
  }

  private getColor(logLevel: string): (msg: string) => string {
    if (!this.colors) return (msg) => msg;

    const reset = '\x1b[0m';
    return (msg) => `${DEFAULT_LOGGER_COLORS[logLevel] ?? ''}${msg}${reset}`;
  }

  private writeLog(log: { logLevel: string; data: any }) {
    if ((this.logLevelsOrder[log.logLevel] ?? 5) > this.minLogLevel) {
      return;
    }

    const finishLog = {
      timestamp: Date.now(),
      context: this.context,
      ...log,
    };

    try {
      const jsonData = JSON.stringify(finishLog, null, this.space);
      const colorize = this.getColor(log.logLevel);
      this.writeStream.write(`${colorize(jsonData)}\n`);
    } catch {
      const jsonErrorData = JSON.stringify(
        { timestamp: Date.now(), data: ['Error Log'] },
        null,
        2,
      );
      this.writeStream.write(`${jsonErrorData}\n`);
    }
  }

  log(...args: any[]) {
    this.writeLog({ logLevel: 'INFO', data: args });
  }

  error(...args: any[]) {
    this.writeLog({ logLevel: 'ERROR', data: args });
  }

  warn(...args: any[]) {
    this.writeLog({ logLevel: 'WARN', data: args });
  }

  debug(...args: any[]) {
    this.writeLog({ logLevel: 'DEBUG', data: args });
  }

  verbose(...args: any[]) {
    this.writeLog({ logLevel: 'VERBOSE', data: args });
  }

  setContext(context: string) {
    this.context = context;
  }
}
