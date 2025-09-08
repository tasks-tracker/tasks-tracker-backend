import { registerAs } from '@nestjs/config';
import { IsInt } from 'class-validator';
import { IsBoolean } from 'class-validator';

import { Yaml } from '@libs/yaml';

@Yaml({
  file:
    process.env.SESSION_COOKIE_CONFIG_FILE_PATH ||
    'configs/backend/dev.session-cookie.config.yml',
  encoding: 'utf-8',
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
