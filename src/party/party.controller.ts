import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { PartyService } from './party.service';

import { OwnerGuard } from './guard/owner.guard';

import { Party } from './interface/party.interface';
import { UserDto } from '../user/dto/user.dto';
import { CreatePartyDto } from './dto/createPartyDto.dto';
import { EditPartyDto } from './dto/editPartyDto.dto';
import { RequestUser } from '../user/decorator/user.decorator';
import { RequestParty } from './decorator/party.decorator';
import { BouncerGuard } from './guard/bouncer.guard';
import { VoteGuard } from './guard/vote.guard';
import { MongoExceptionFilter } from '../database/mongoException.filter';
import { PartyMemberGuard } from './guard/partyMember.guard';
import { AddTrackGuard } from './guard/addTrack.guard';
import { TrackPlayerGuard } from './guard/TrackPlayer.guard';

@Controller('party')
export class PartyController {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly partyService: PartyService
  ) {}

  @Post()
  @HttpCode(201)
  @UseFilters(MongoExceptionFilter)
  async createParty(@Body() createPartyDto: CreatePartyDto, @RequestUser() userDto: UserDto) {
    return await this.partyService.create(createPartyDto, userDto);
  }

  @UseGuards(PartyMemberGuard)
  @Get(':id')
  @HttpCode(201)
  @UseFilters(MongoExceptionFilter)
  async getParty(@RequestParty() party: Party) {
    return this.partyService.sortPartyTracks(party);
  }

  @UseGuards(OwnerGuard)
  @Delete(':id')
  @HttpCode(204)
  @UseFilters(MongoExceptionFilter)
  async deleteParty(@RequestParty() party: Party) {
    await this.partyService.delete(party);
    this.rabbitMqService.send('party-deleted', { partyId: party._id });
    return;
  }

  @UseGuards(OwnerGuard)
  @Put(':id')
  @UseFilters(MongoExceptionFilter)
  async editParty(@Body() editPartyDto: EditPartyDto, @RequestParty() party: Party) {
    const editedParty = await this.partyService.edit(party, editPartyDto);
    this.rabbitMqService.send('party-edited', editedParty);
    return editedParty;
  }

  @UseGuards(BouncerGuard)
  @Patch(':id/join')
  @UseFilters(MongoExceptionFilter)
  async joinParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    const partyUpdated = await this.partyService.join(party, userDto.id);
    this.rabbitMqService.send('party-joined', {
      partyId: partyUpdated._id,
      userId: userDto.id
    });
    return partyUpdated;
  }

  @UseGuards(PartyMemberGuard)
  @Patch(':id/leave')
  @UseFilters(MongoExceptionFilter)
  async leaveParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    const partyUpdated = await this.partyService.leave(party, userDto.id);
    this.rabbitMqService.send('party-leaved', {
      partyId: partyUpdated._id,
      userId: userDto.id
    });
    return partyUpdated;
  }

  @UseGuards(PartyMemberGuard, AddTrackGuard)
  @Patch(':id/add-track/:trackId')
  @UseFilters(MongoExceptionFilter)
  async addTrack(@RequestParty() party: Party, @Param('trackId') trackId: string) {
    // todo : verifier que le son est uploadé
    const updatedParty = await this.partyService.addTrack(party, trackId);
    this.rabbitMqService.send('tracks-updated', {
      currentTrack: updatedParty.currentTrack,
      tracks: updatedParty.tracks
    });
    return updatedParty;
  }

  @UseGuards(PartyMemberGuard, VoteGuard)
  @Patch(':id/vote-track/:trackId')
  @UseFilters(MongoExceptionFilter)
  async voteTrack(@RequestParty() party: Party, @Param('trackId') trackId: string, @RequestUser() userDto : UserDto) {
    const updatedParty = await this.partyService.voteTrack(party, trackId, userDto);
    this.rabbitMqService.send('tracks-updated', {
      currentTrack: updatedParty.currentTrack,
      tracks: updatedParty.tracks
    });
    return updatedParty;
  }

  @UseGuards(OwnerGuard, TrackPlayerGuard)
  @Put(':id/next-track')
  @UseFilters(MongoExceptionFilter)
  async nextTrack(@RequestParty() party: Party) {
    const updatedParty = await this.partyService.nextTrack(party);
    this.rabbitMqService.send('tracks-updated', {
      currentTrack: updatedParty.currentTrack,
      tracks: updatedParty.tracks
    });
    return updatedParty;
  }
}
