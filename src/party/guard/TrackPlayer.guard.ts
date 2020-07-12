import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TrackPlayerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request: Request) {
    const countTracks = request['party'].tracks.length;

    if(countTracks <= 0) {
      throw new BadRequestException('Aucune piste dans cette fête');
    }

    return true;
  }
}

