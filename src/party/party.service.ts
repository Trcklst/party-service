import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Party } from './interface/party.interface';
import { PARTY_MODEL, YOUTUBE_IMAGE, YOUTUBE_IMAGE_URL } from '../constants';

import { CreatePartyDto } from './dto/createParty.dto';
import { EditPartyDto } from './dto/editParty.dto';
import { UserDto } from '../user/dto/user.dto';
import { SubscriptionEnum } from '../user/enum/subscription.enum';
import { AddTrackDto } from './dto/addTrack.dto';
import { CurrentTrackStatusEnum } from './enum/currentTrackStatus.enum';

@Injectable()
export class PartyService {

  constructor(
    @Inject(PARTY_MODEL) private partyModel: Model<Party>
  ) {}

  sortPartyTracks(party: Party): Party {
    party.tracks = party.tracks.sort((trackA, trackB) => trackB.votesCount - trackA.votesCount);
    return party;
  }

  async findOneById(partyId: string): Promise<Party> {
    return this.partyModel.findById(partyId);
  }

  async getParties(user) {
    return  this.partyModel.find({ $or: [ {'ownerId': user.userId}, {'members': user.userId} ] }, function(error, data) {
      if(error) return null;
      return data;
    })
  }

  async create(createPartyDto: CreatePartyDto, user: UserDto): Promise<Party> {
    const limited = !(user.subscription == SubscriptionEnum.PRO || user.subscription == SubscriptionEnum.PREMIUM);
    const createParty = {ownerId: user.userId, limited: limited,...createPartyDto};
    const createdParty = new this.partyModel(createParty);
    return createdParty.save();
  }

  async join(party: Party, memberId: number): Promise<Party> {
    party.members.push(memberId);
    return party.save();
  }

  async leave(party: Party, memberId: number): Promise<Party> {
    party.members.splice(party.members.indexOf(memberId),1);
    return party.save();
  }

  async delete(party: Party) {
    return this.partyModel.deleteOne({ _id: party._id });
  }

  async edit(party: Party, editPartyDto: EditPartyDto): Promise<Party> {
    return this.partyModel.findOneAndUpdate({ _id: party._id }, { name: editPartyDto.name }, { new: true });
  }

  async addTrack(party: Party, addTrackDto: AddTrackDto): Promise<Party> {
    const imageUrl = YOUTUBE_IMAGE_URL + addTrackDto.id + YOUTUBE_IMAGE;
    const trackToAdd= {imageUrl: imageUrl, name: addTrackDto.name, votes: [],votesCount: 0, id: addTrackDto.id};
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

  async nextTrack(party: Party): Promise<Party> {
    const nextTrack = party.tracks.shift();
    party.currentTrack = {id: nextTrack.id, imageUrl: nextTrack.imageUrl, name: nextTrack.name, status: CurrentTrackStatusEnum.PLAY}
    const updatedParty = await party.save()
    return this.sortPartyTracks(updatedParty);
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
