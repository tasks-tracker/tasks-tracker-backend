import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthLoginStatusesProvider = makeCounterProvider({
  name: 'http_auth_login_statuses',
  help: 'Total number of HTTP requests for auth login, partitioned by status code',
  labelNames: ['status_code', 'auth'],
});
