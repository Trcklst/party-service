import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PartyService } from '../party.service';
import { PARTY_CREATION_LIMITATION } from '../../constants';

@Injectable()
export class CreatePartyGuard implements CanActivate {

  constructor(
    private partyService: PartyService
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: Request) {
    const user = request['user'];
    const parties = await this.partyService.findPartyOfTheDay(user);

    if(user.subscription == null && parties.length >= PARTY_CREATION_LIMITATION) {
      throw new UnauthorizedException('Votre compte est limité à la création d\'une playlist par jour');
    }

    return true;
  }
}
