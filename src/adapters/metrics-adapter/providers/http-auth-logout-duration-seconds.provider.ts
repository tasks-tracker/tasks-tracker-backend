import { makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthLogoutDurationSecondsProvider = makeHistogramProvider({
  name: 'http_auth_logout_duration_seconds',
  help: 'HTTP request duration in seconds for logout',
  labelNames: ['duration', 'auth'],
})

