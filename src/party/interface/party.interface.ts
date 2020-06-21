import { Document } from 'mongoose';
import { CurrentTrackStatusEnum } from '../enum/currentTrackStatus.enum';

export interface Track {
  id: string;
  name: string;
  imageUrl: string;
  votesCount: number;
  votes: Array<number>;
}

export interface CurrentTrack {
  id: string;
  name: string;
  imageUrl: string;
  status: CurrentTrackStatusEnum;
}

export interface Member {
  id: number;
  email: string;
}

export interface Party extends Document {
  name: string;
  owner: Member;
  limited: boolean;
  currentTrack: CurrentTrack;
  members: Array<Member>;
  tracks: Array<Track>;
  createAt: Date;
}
