require('dotenv').config();

export default {
  jwtSecret: process.env.JWT_SECRET,
  app: {
    port: process.env.SERVER_PORT
  },
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbname: process.env.DB_NAME
  },
  eurekaClient: {
    instance: {
      hostName: process.env.EUREKA_INSTANCE_HOST,
    },
    eureka: {
      host : process.env.EUREKA_HOST,
      port: process.env.EUREKA_PORT,
    }
  },
  rabbitMq: {
    host: process.env.RABBITMQ_HOST,
    queue: process.env.RABBITMQ_QUEUE
  }
};
