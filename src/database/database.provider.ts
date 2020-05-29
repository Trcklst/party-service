import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION } from '../constants';
import configuration from '../config/configuration';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(configuration.database.host, {
        useNewUrlParser: true,
        user: configuration.database.user,
        pass: configuration.database.password,
        dbName: configuration.database.dbname
      }),
  },
];
