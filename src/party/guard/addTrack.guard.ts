import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AddTrackGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request, request.body.id);
  }

  validateRequest(request: Request, trackId: string) {
    const track = request['party'].tracks.find(track => track.id == trackId);

    if(track) {
      throw new BadRequestException('Piste déjà ajoutée');
    }

    return true;
  }
}

