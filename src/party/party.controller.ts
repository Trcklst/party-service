import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, Headers,
  HttpCode, HttpService,
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
import configuration from '../config/configuration';
import { CurrentTrackGuard } from './guard/currentTrack.guard';

@Controller('party')
export class PartyController {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly partyService: PartyService,
    private httpService: HttpService
  ) {}

  @Post()
  @HttpCode(201)
  @UseFilters(MongoExceptionFilter)
  async createParty(@Body() createPartyDto: CreatePartyDto, @RequestUser() userDto: UserDto) {
    return await this.partyService.create(createPartyDto, userDto);
  }

  @Get()
  @UseFilters(MongoExceptionFilter)
  async getParties(@RequestUser() userDto : UserDto) {
    return this.partyService.getParties(userDto);
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
    const editedParty = await this.partyService.edit(party, editPartyDto);
    this.rabbitMqService.send('party-updated', editedParty);
    return editedParty;
  }

  @UseGuards(BouncerGuard)
  @Patch(':id/join')
  @UseFilters(MongoExceptionFilter)
  async joinParty(@RequestUser() userDto: UserDto, @RequestParty() party: Party) {
    const partyUpdated = await this.partyService.join(party, userDto.userId);
    this.rabbitMqService.send('party-joined', {
      party: partyUpdated,
      userId: userDto.userId
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
      userId: userDto.userId
    });
    return partyUpdated;
  }

  @UseGuards(PartyMemberGuard, AddTrackGuard)
  @Post(':id/add-track')
  @UseFilters(MongoExceptionFilter)
  async addTrack(@RequestParty() party: Party, @Body() addTrackDto: AddTrackDto, @Headers('authorization') token: string) {
    const trackInfo = await this.httpService
      .get(configuration.services.trackUploadService + addTrackDto.id, {
        headers: { 'Authorization': token }
      }).toPromise()

    if(!trackInfo.data) {
      throw new BadRequestException('Track not uploaded');
    }

    const updatedParty = await this.partyService.addTrack(party, addTrackDto);
    this.rabbitMqService.send('party-updated', updatedParty);
    return updatedParty;
  }

  @UseGuards(PartyMemberGuard, VoteGuard)
  @Patch(':id/vote-track/:trackId')
  @UseFilters(MongoExceptionFilter)
  async voteTrack(@RequestParty() party: Party, @Param('trackId') trackId: string, @RequestUser() userDto : UserDto) {
    const updatedParty = await this.partyService.voteTrack(party, trackId, userDto);
    this.rabbitMqService.send('party-updated', updatedParty);
    return updatedParty;
  }

  @UseGuards(OwnerGuard, TrackPlayerGuard)
  @Put(':id/next-track')
  @UseFilters(MongoExceptionFilter)
  async nextTrack(@RequestParty() party: Party) {
    const updatedParty = await this.partyService.nextTrack(party);
    this.rabbitMqService.send('party-updated',updatedParty);
    return updatedParty;
  }

  @UseGuards(OwnerGuard, CurrentTrackGuard)
  @Patch(':id/play')
  @HttpCode(204)
  async play(@RequestParty() party : Party) {
    const updatedParty = await this.partyService.play(party);
    this.rabbitMqService.send('party-updated', updatedParty);
    return;
  }

  @UseGuards(OwnerGuard, CurrentTrackGuard)
  @Patch(':id/pause')
  @HttpCode(204)
  async pause(@RequestParty() party : Party) {
    const updatedParty = await this.partyService.pause(party);
    this.rabbitMqService.send('party-updated', updatedParty);
    return;
  }

}
