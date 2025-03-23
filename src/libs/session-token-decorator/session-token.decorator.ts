/* eslint-disable */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionToken = createParamDecorator(
  (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookies = request.cookies;
    if (!cookies) return null;
    const sessionToken = cookies['session_token'];
    return sessionToken || null;
  },
);
