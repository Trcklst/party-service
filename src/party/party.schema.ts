import * as mongoose from 'mongoose';

export const PartySchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  members: Array,
  limited: Boolean,
  currentTrack: {
    id: String,
    imageUrl: String,
  },
  tracks: [
    {
      id: String,
      imageUrl: String,
      votesCount: Number,
      votes: Array
    }
  ]
});
