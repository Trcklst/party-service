import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SubscriptionEnum } from '../../user/enum/subscription.enum';
import { PARTY_MEMBERS_LIMITATION_DEFAULT, PARTY_MEMBERS_LIMITATION_PREMIUM } from '../../constants';

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
    const isMember = (member) => member.id == user.userId;

    if(party.members.some(isMember)) {
      throw new UnauthorizedException('Vous êtes déjà présent dans la fête');
    }

    if(party.owner.subscription == null && party.members.length >= PARTY_MEMBERS_LIMITATION_DEFAULT) {
      throw new UnauthorizedException('Le compte du créateur de la playlist est limité à 10 participants');
    }

    if(party.owner.subscription == SubscriptionEnum.PREMIUM && party.members.length >= PARTY_MEMBERS_LIMITATION_PREMIUM) {
      throw new UnauthorizedException('Le compte du créateur de la playlist est limité à 25 participants');
    }

    return true;
  }
}
