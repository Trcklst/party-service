import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PartyModule } from './party/party.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { DatabaseModule } from './database/database.module';
import { UserMiddleware } from './user/middleware/user.middleware';
import { UserModule } from './user/user.module';
import { EurekaModule } from 'nestjs-eureka';

import configuration from './config/configuration';
const Eureka = require('eureka-js-client').Eureka;

@Module({
  imports: [
    JwtModule.register({ secret: configuration.jwtSecret }),
    EurekaModule.forRoot({
      eureka: new Eureka({instance: configuration.eurekaClient.instance, eureka: configuration.eurekaClient.eureka }),
      disableDiscovery: Boolean(configuration.eurekaClient.enable),
      disable: Boolean(configuration.eurekaClient.enable),
    }),
    PartyModule,
    RabbitMqModule,
    DatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
