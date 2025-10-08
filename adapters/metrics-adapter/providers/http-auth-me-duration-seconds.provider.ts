import { makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthMeDurationSecondsProvider = makeHistogramProvider({
  name: 'http_auth_me_duration_seconds',
  help: 'HTTP request duration in seconds for me',
  labelNames: ['duration', 'auth'],
});
