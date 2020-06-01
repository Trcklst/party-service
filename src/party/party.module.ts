import { HttpModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';
import { DatabaseModule } from '../database/database.module';
import { partyProviders } from './provider/party.provider';
import { PartyMiddleware } from './middleware/party.middleware';

@Module({
  imports: [RabbitMqModule, DatabaseModule, HttpModule],
  controllers: [PartyController],
  providers: [PartyService, ...partyProviders]
})
export class PartyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PartyMiddleware)
      .forRoutes(
        {path: 'party/:id*', method: RequestMethod.ALL}
        );
  }
}
