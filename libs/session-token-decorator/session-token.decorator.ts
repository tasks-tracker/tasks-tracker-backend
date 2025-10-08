/* eslint-disable */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookies = request.cookies;

    if (!cookies) return null;

    const sessionToken = cookies['session-token'];
    return sessionToken || null;
  },
);
