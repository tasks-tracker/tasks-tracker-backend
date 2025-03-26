import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthMeStatusesProvider = makeCounterProvider({
  name: 'http_auth_me_statuses',
  help: 'Total number of HTTP requests for auth me, partitioned by status code',
  labelNames: ['status_code', 'auth'],
});
