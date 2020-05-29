import { Connection } from 'mongoose';
import { DATABASE_CONNECTION, PARTY_MODEL } from '../../constants';
import { PartySchema } from '../party.schema';

export const partyProviders = [
  {
    provide: PARTY_MODEL,
    useFactory: (connection: Connection) => connection.model('Party', PartySchema),
    inject: [DATABASE_CONNECTION],
  },
];
