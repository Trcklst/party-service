import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class VoteGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request, request.params['trackId']);
  }

  validateRequest(request: Request, trackId){
    const track = request['party'].tracks.find(track => track.id == trackId);

    if(track.votes.includes(request['user'].userId)) {
      throw new UnauthorizedException('Vous avez déjà voté pour cette piste');
    }

    return true;
  }
}
