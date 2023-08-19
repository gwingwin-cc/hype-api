import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { FormModule } from './form/form.module';
import * as dotenv from 'dotenv';
import { KnexModule } from 'nestjs-knex';
import { Op } from 'sequelize';
import { InternalController } from './internal.controller';
import { ScriptModule } from './script/script.module';
import { ApplicationModule } from './application/application.module';
import { BlobStorageModule } from './blob-storage/blob-storage.module';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),
    KnexModule.forRoot({
      config: {
        client: 'mysql',
        useNullAsDefault: true,
        connection: {
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT),
          user: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_DB,
        },
      },
    }),
    SequelizeModule.forRoot({
      dialect: 'mariadb',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      autoLoadModels: true,
      pool: {
        max: 20,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
      logging: false,
      operatorsAliases: {
        $or: Op.or,
        $like: Op.like,
        $and: Op.and,
        $ne: Op.ne,
        $gt: Op.gt,
        $lt: Op.lt,
        $gte: Op.gte,
        $lte: Op.lte,
      },
      synchronize: false,
    }),
    UserModule,
    FormModule,
    ScriptModule,
    ApplicationModule,
    BlobStorageModule,
  ],
  controllers: [InternalController],
})
export class InternalModule {}
