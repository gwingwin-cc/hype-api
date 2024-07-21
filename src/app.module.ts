import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ScriptModule } from './script/script.module';
import { FormModule } from './form/form.module';
import { ApplicationModule } from './application/application.module';
import { BlobStorageModule } from './blob-storage/blob-storage.module';
import * as dotenv from 'dotenv';
import { KnexModule } from 'nestjs-knex';
import { Op } from 'sequelize';
import { HypeAuthGuard } from './hype-auth.guard';
import { HypeAnonymousAuthGuard } from './hype-anonymous-auth.guard';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage'),
      serveRoot: '/storage',
    }),
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
    AuthModule,
    UserModule,
    ScriptModule,
    FormModule,
    AdminModule,
    ApplicationModule,
    BlobStorageModule,
  ],
  controllers: [AppController],
  providers: [HypeAuthGuard, HypeAnonymousAuthGuard],
})
export class AppModule {}
