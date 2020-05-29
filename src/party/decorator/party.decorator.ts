import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestParty = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.party;
  },
);
