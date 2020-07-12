import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Party } from './interface/party.interface';
import { PARTY_MODEL } from '../constants';
import { CreatePartyDto } from './dto/createParty.dto';
import { EditPartyDto } from './dto/editParty.dto';
import { UserDto } from '../user/dto/user.dto';
import { AddTrackDto } from './dto/addTrack.dto';
import { CurrentTrackStatusEnum } from './enum/currentTrackStatus.enum';
import moment = require('moment');

@Injectable()
export class PartyService {

  constructor(
    @Inject(PARTY_MODEL) private partyModel: Model<Party>
  ) {}

  sortPartyTracks(party: Party): Party {
    party.tracks = party.tracks.sort((trackA, trackB) => trackB.votesCount - trackA.votesCount);
    return party;
  }

  async findPartyOfTheDay(userDto: UserDto): Promise<Party[]> {
    const beginOfDay = moment().startOf('day');
    return this.partyModel.find({ createdAt: { $gte: beginOfDay.toDate(), $lte: moment(beginOfDay).endOf('day').toDate() }, 'owner.id': userDto.userId }, function(error, result) {
      if(error) throw new InternalServerErrorException('Une erreur s\'est produite, veuillez réessayer plus tard');
      return result;
    });
  }

  async findOneById(partyId: string): Promise<Party> {
    return this.partyModel.findById(partyId);
  }

  async getParties(user) {
    return this.partyModel.find({ $or: [ {'owner.id': user.userId}, {'members.id': user.userId} ] })
  }

  async create(createPartyDto: CreatePartyDto, user: UserDto): Promise<Party> {
    const createParty = {owner: {id: user.userId, email: user.email, subscription: user.subscription}, name: createPartyDto.name, createdAt: new Date()};
    const createdParty = new this.partyModel(createParty);
    return createdParty.save();
  }

  async join(party: Party, userDto: UserDto): Promise<Party> {
    party.members.push({ id: userDto.userId, email: userDto.email, subscription: userDto.subscription });
    return party.save();
  }

  async leave(party: Party, memberId: number): Promise<Party> {
    const index = party.members.map(function(member) { return member.id; }).indexOf(memberId);
    party.members.splice(index,1);
    return party.save();
  }

  async delete(party: Party) {
    return this.partyModel.deleteOne({ _id: party._id });
  }

  async edit(party: Party, editPartyDto: EditPartyDto): Promise<Party> {
    return this.partyModel.findOneAndUpdate({ _id: party._id }, { name: editPartyDto.name }, { new: true });
  }

  async addTrack(party: Party, addTrackDto: AddTrackDto): Promise<Party> {
    const trackToAdd= {imageUrl: addTrackDto.imageUrl, name: addTrackDto.name, votes: [],votesCount: 0, id: addTrackDto.id};
    party.tracks.push(trackToAdd);
    const updatedParty = await party.save();
    return this.sortPartyTracks(updatedParty);
  }

  async voteTrack(party: Party, trackId: string, userDto: UserDto): Promise<Party> {
    const updatedParty = await this.partyModel.findOneAndUpdate(
      {"_id": party._id, "tracks.id": trackId},
      {
        $push: {"tracks.$.votes": userDto.userId},
        $inc: {"tracks.$.votesCount": 1}
      }, { new: true });
    return this.sortPartyTracks(updatedParty);
  }

  async unvoteTrack(party: Party, trackId: string, userDto: UserDto): Promise<Party> {
    const updatedParty = await this.partyModel.findOneAndUpdate(
      {"_id": party._id, "tracks.id": trackId},
      {
        $pull: {"tracks.$.votes": userDto.userId},
        $inc: {"tracks.$.votesCount": -1}
      }, { new: true });
    return this.sortPartyTracks(updatedParty);
  }

  async nextTrack(party: Party): Promise<Party> {
    const orderedParty = this.sortPartyTracks(party);
    const nextTrack = orderedParty.tracks.shift();
    orderedParty.currentTrack = {id: nextTrack.id, imageUrl: nextTrack.imageUrl, name: nextTrack.name, status: CurrentTrackStatusEnum.PLAY};
    return await orderedParty.save();
  }

  search(party: Party, input: string) {
    const inputNormalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return party.tracks.filter(track => track.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(inputNormalized));
  }

  async play(party: Party): Promise<Party> {
    party.currentTrack.status = CurrentTrackStatusEnum.PLAY;
    return party.save();
  }

  async pause(party: Party): Promise<Party> {
    party.currentTrack.status = CurrentTrackStatusEnum.PAUSE;
    return party.save();
  }
}
