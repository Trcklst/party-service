import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbit-mq.service';
import configuration from '../config/configuration';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'rabbit-mq-module',
        transport: Transport.RMQ,
        options: {
          urls: [
            configuration.rabbitMq.host
          ],
          queue: configuration.rabbitMq.queue,
        },
      },
    ]),
  ],
  providers: [RabbitMqService],
  exports: [RabbitMqService]
})
export class RabbitMqModule {}
