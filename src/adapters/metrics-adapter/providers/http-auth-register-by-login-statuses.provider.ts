import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpAuthRegisterByLoginStatusesProvider = makeCounterProvider({
  name: 'http_auth_register_by_login_statuses',
  help: 'Total number of HTTP requests for auth register by login, partitioned by status code',
  labelNames: ['status_code', 'auth'],
})

