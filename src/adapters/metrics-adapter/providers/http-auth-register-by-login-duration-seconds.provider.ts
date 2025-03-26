import { makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthRegisterByLoginDurationSecondsProvider =
  makeHistogramProvider({
    name: 'http_auth_register_by_login_duration_seconds',
    help: 'HTTP request duration in seconds for register by login',
    labelNames: ['duration', 'auth'],
  });
