export const DEFAULT_LOGGER_STREAM = process.stdout;
export const DEFAULT_LOGGER_SPACE = 0;
export const DEFAULT_LOGGER_USE_COLORS = true;
export const DEFAULT_LOGGER_SCOPE = 'Default';
export const LOG_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE'];
export const DEFAULT_LOG_LEVELS_ORDER: Record<string, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4,
};
export const DEFAULT_LOG_LEVEL = 'INFO';
export const DEFAULT_LOGGER_COLORS: Record<string, string> = {
  INFO: '\x1b[32m',
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  DEBUG: '\x1b[35m',
  VERBOSE: '\x1b[36m',
};
