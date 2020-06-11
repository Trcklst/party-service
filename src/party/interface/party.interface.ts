import { Document } from 'mongoose';
import { CurrentTrackStatusEnum } from '../enum/currentTrackStatus.enum';

export interface Tracks {
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

export interface Party extends Document {
  name: string;
  ownerId: number;
  limited: boolean;
  currentTrack: CurrentTrack;
  members: Array<number>;
  tracks: Array<Tracks>;
}
