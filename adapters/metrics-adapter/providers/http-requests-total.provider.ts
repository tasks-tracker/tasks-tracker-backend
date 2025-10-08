import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpRequestTotalProvider = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
});
