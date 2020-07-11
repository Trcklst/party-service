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
import { CreatePartyDto } from './dto/createParty.dto';
import { EditPartyDto } from './dto/editParty.dto';
import { RequestUser } from '../user/decorator/user.decorator';
import { RequestParty } from './decorator/party.decorator';
import { BouncerGuard } from './guard/bouncer.guard';
import { VoteGuard } from './guard/vote.guard';
import { MongoExceptionFilter } from '../database/mongoException.filter';
import { PartyMemberGuard } from './guard/partyMember.guard';
import { AddTrackGuard } from './guard/addTrack.guard';
import { TrackPlayerGuard } from './guard/TrackPlayer.guard';
import { AddTrackDto } from './dto/addTrack.dto';
import { CurrentTrackGuard } from './guard/currentTrack.guard';
import { CreatePartyGuard } from './guard/createParty.guard';
import { TrackExistenceGuard } from './guard/trackExistence.guard';
import { UnvoteGuard } from './guard/unvote.guard';

@Controller('party')
export class PartyController {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly partyService: PartyService,
  ) {}

  @UseGuards(CreatePartyGuard)
  @Post()
  @HttpCode(201)
  @UseFilters(MongoExceptionFilter)
  async createParty(@Body() createPartyDto: CreatePartyDto, @RequestUser() userDto: UserDto) {
    return await this.partyService.create(createPartyDto, userDto);
  }

  @Get()
  @UseFilters(MongoExceptionFilter)
  async getParties(@RequestUser() userDto : UserDto) {
    return await this.partyService.getParties(userDto);
  }

  @UseGuards(PartyMemberGuard)
  @Get(':id')
  @UseFilters(MongoExceptionFilter)
  async getParty(@RequestParty() party: Party) {
    return this.partyService.sortPartyTracks(party);
  }

  @UseGuards(OwnerGuard)
  @Delete(':id')
  @HttpCode(204)
  @UseFilters(MongoExceptionFilter)
  async deleteParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    await this.partyService.delete(party);
    this.rabbitMqService.send('party-deleted', party);
    return;
  }

  @UseGuards(OwnerGuard)
  @Put(':id')
  @UseFilters(MongoExceptionFilter)
  async editParty(@Body() editPartyDto: EditPartyDto, @RequestParty() party: Party) {
    const updatedParty = await this.partyService.edit(party, editPartyDto);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'edit'});
    return updatedParty;
  }

  @UseGuards(BouncerGuard)
  @Patch(':id/join')
  @UseFilters(MongoExceptionFilter)
  async joinParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    const partyUpdated = await this.partyService.join(party, userDto);
    this.rabbitMqService.send('party-joined', {
      party: partyUpdated,
      user: userDto
    });
    return partyUpdated;
  }

  @UseGuards(PartyMemberGuard)
  @Patch(':id/leave')
  @UseFilters(MongoExceptionFilter)
  async leaveParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    const partyUpdated = await this.partyService.leave(party, userDto.userId);
    this.rabbitMqService.send('party-leaved', {
      party: partyUpdated,
      user: userDto
    });
    return partyUpdated;
  }

  @UseGuards(PartyMemberGuard, AddTrackGuard)
  @Post(':id/add-track')
  @UseFilters(MongoExceptionFilter)
  async addTrack(@RequestParty() party: Party, @Body() addTrackDto: AddTrackDto) {
    const updatedParty = await this.partyService.addTrack(party, addTrackDto);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'add-track'});
    return updatedParty;
  }

  @UseGuards(PartyMemberGuard, TrackExistenceGuard, VoteGuard)
  @Patch(':id/vote-track/:trackId')
  @UseFilters(MongoExceptionFilter)
  async voteTrack(@RequestParty() party: Party, @Param('trackId') trackId: string, @RequestUser() userDto : UserDto) {
    const updatedParty = await this.partyService.voteTrack(party, trackId, userDto);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'vote'});
    return updatedParty;
  }

  @UseGuards(PartyMemberGuard, TrackExistenceGuard, UnvoteGuard)
  @Patch(':id/unvote-track/:trackId')
  @UseFilters(MongoExceptionFilter)
  async unvoteTrack(@RequestParty() party: Party, @Param('trackId') trackId: string, @RequestUser() userDto : UserDto) {
    const updatedParty = await this.partyService.unvoteTrack(party, trackId, userDto);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'unvote'});
    return updatedParty;
  }


  @UseGuards(PartyMemberGuard)
  @Get(':id/search/:input')
  @UseFilters(MongoExceptionFilter)
  search(@RequestParty() party: Party, @Param('input') input: string) {
    return this.partyService.search(party, input);
  }

  @UseGuards(OwnerGuard, TrackPlayerGuard)
  @Put(':id/next-track')
  @UseFilters(MongoExceptionFilter)
  async nextTrack(@RequestParty() party: Party) {
    const updatedParty = await this.partyService.nextTrack(party);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'next-track'});
    return updatedParty;
  }

  @UseGuards(OwnerGuard, CurrentTrackGuard)
  @Patch(':id/play')
  @HttpCode(204)
  async play(@RequestParty() party : Party) {
    const updatedParty = await this.partyService.play(party);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'play'});
    return;
  }

  @UseGuards(OwnerGuard, CurrentTrackGuard)
  @Patch(':id/pause')
  @HttpCode(204)
  async pause(@RequestParty() party : Party) {
    const updatedParty = await this.partyService.pause(party);
    this.rabbitMqService.send('party-updated', {updatedParty, action: 'pause'});
    return;
  }

}
