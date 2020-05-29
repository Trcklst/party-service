import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UseFilters,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PartyService } from '../party.service';
import { MongoExceptionFilter } from '../../database/mongoException.filter';
import * as mongoose from 'mongoose';

@Injectable()
export class PartyMiddleware implements NestMiddleware {
  constructor(private readonly partyService: PartyService) {}

  @UseFilters(MongoExceptionFilter)
  async use(req: Request, res: Response, next: Function) {
    const params = req.params;
    const partyId = params["id"];

    if(!mongoose.Types.ObjectId.isValid(partyId)) {
      throw new NotFoundException('Party not found');
    }

    const party = await this.partyService.findOneById(partyId);
    if(!party) {
      throw new NotFoundException('Party not found');
    }

    req["party"] = party;
    next();
  }
}
