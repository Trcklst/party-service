import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PARTY_LIMITATION } from '../../constants';

@Injectable()
export class BouncerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request: Request) {
    const party = request['party'];
    const user = request['user'];
    return (!party.limited || party.members.length <= PARTY_LIMITATION) && !party.members.includes(user.id);
  }
}
