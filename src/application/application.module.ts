import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { BlobStorageModule } from '../blob-storage/blob-storage.module';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  HypeApplication,
  HypeApplicationLayout,
  HypeApplicationPermissions,
  Tags,
} from '../entity';
import { TagsService } from '../form/providers/tags.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      HypeApplication,
      HypeApplicationPermissions,
      HypeApplicationLayout,
      Tags,
    ]),
    BlobStorageModule,
  ],
  providers: [ApplicationService, TagsService],
  exports: [ApplicationService, TagsService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
