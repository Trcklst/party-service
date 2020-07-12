import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TrackExistenceGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request, request.params['trackId']);
  }

  validateRequest(request: Request, trackId: string) {
    const track = request['party'].tracks.find(track => track.id == trackId);
    if(!track) {
      throw new NotFoundException('Piste non trouvée dans cette fête');
    }

    return true;
  }
}

