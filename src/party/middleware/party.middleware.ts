import {
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PartyService } from '../party.service';
import * as mongoose from 'mongoose';

@Injectable()
export class PartyMiddleware implements NestMiddleware {
  constructor(private readonly partyService: PartyService) {}

  async use(req: Request, res: Response, next: Function) {
    const params = req.params;
    const partyId = params["id"];

    if(!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new NotFoundException('Fête non trouvée');
    }

    const party = await this.partyService.findOneById(partyId);
    if(!party) {
      throw new NotFoundException('Fête non trouvée');
    }

    req["party"] = party;
    next();
  }
}
