import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: Function) {
    const authorization = req.headers['authorization'];

    if(!authorization) {
      throw new UnauthorizedException();
    }

    const token = req.headers['authorization'].replace('Bearer ', '');

    req['user'] = this.jwtService.decode(token);
    next();
  }
}
