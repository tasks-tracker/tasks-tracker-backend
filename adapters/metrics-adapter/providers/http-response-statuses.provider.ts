import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const httpResponseStatusesProvider = makeCounterProvider({
  name: 'http_response_statuses',
  help: 'Total number of HTTP requests, partitioned by status code',
  labelNames: ['status_code'],
});
