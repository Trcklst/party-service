import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PartyModule } from './party/party.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { DatabaseModule } from './database/database.module';
import { UserMiddleware } from './user/middleware/user.middleware';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    JwtModule.register({ secret: configuration.jwtSecret }),
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
