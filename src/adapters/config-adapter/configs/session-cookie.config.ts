import { LoggerModule } from '../../../libs/logger';

import { registerAs } from '@nestjs/config';
import { IsInt } from 'class-validator';
import { IsBoolean } from 'class-validator';

import { loggerConfigRaw } from '../raw-configs';
import { Yaml } from '../../../libs/yaml';

@Yaml({
  file:
    process.env.SESSION_COOKIE_CONFIG_FILE_PATH ||
    'configs/session-cookie.config.yml',
  encoding: 'utf-8',
  logger: LoggerModule.createLoggerByOptions({
    context: 'SessionCookieConfig',
    ...loggerConfigRaw,
  }),
})
export class SessionCookieConfig {
  @IsInt()
  maxAge: number;

  @IsBoolean()
  secure: boolean;
}

export const sessionCookieConfig = registerAs(
  'session-cookie',
  (): SessionCookieConfig => new SessionCookieConfig(),
);
