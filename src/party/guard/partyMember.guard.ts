import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PartyMemberGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request: Request) {
    const party = request['party'];
    const user = request['user'];
    const isMember = (member) => member.id == user.userId;
    if(!party.members.some(isMember)) {
      throw new ForbiddenException('Vous n\'êtes pas un membre de la fête');
    }
    return true;
  }
}

