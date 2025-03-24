import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthLogoutStatusesProvider = makeCounterProvider({
  name: 'http_auth_logout_statuses',
  help: 'Total number of HTTP requests for auth logout, partitioned by status code',
  labelNames: ['status_code', 'auth'],
})

