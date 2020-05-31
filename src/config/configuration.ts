require('dotenv').config();

export default {
  jwtSecret: process.env.JWT_SECRET,
  app: {
    port: process.env.EUREKA_INSTANCE_PORT
  },
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbname: process.env.DB_NAME
  },
  eurekaClient: {
    enable: process.env.EUREKA_ENABLE_DISCOVERY,
    instance: {
      app: process.env.EUREKA_INSTANCE_NAME,
      hostName: process.env.EUREKA_INSTANCE_HOST,
      port: process.env.EUREKA_PORT,
      vipAddress: process.env.EUREKA_INSTANCE_VIP_ADDRESS,
      dataCenterInfo: {
        name: process.env.EUREKA_INSTANCE_DATACENTER_NAME
      }
    },
    eureka: {
      name: process.env.EUREKA_NAME,
      host : process.env.EUREKA_HOST,
      port: process.env.EUREKA_PORT,
    }
  },
  rabbitMq: {
    host: process.env.RABBITMQ_HOST,
    queue: process.env.RABBITMQ_QUEUE
  }
};
