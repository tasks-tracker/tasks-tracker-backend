import { makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthLoginDurationSecondsProvider = makeHistogramProvider({
  name: 'http_auth_login_duration_seconds',
  help: 'HTTP request duration in seconds for login',
  labelNames: ['duration', 'auth'],
})

