import * as mongoose from 'mongoose';

const Member = new mongoose.Schema(
{
    id: Number,
    email: String,
    subscription: Number
  }
,{ _id : false });

const Track = new mongoose.Schema({
  id: String,
  name: String,
  imageUrl: String,
  votesCount: Number,
  votes: Array
}, { _id : false });


export const PartySchema = new mongoose.Schema({
  name: String,
  owner: Member,
  createdAt: Date,
  members: [Member],
  limited: Boolean,
  currentTrack: {
    id: String,
    imageUrl: String,
    name: String,
    status: Number
  },
  tracks: [Track]
});
