import { Module } from '@nestjs/common';
import { BlobStorageController } from './blob-storage.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { HypeBlobInfo } from '../entity';
import { HypeBlobStorage } from '../entity';
import { BlobStorageService } from './blob-storage.service';

@Module({
  imports: [SequelizeModule.forFeature([HypeBlobInfo, HypeBlobStorage])],
  controllers: [BlobStorageController],
  providers: [BlobStorageService],
  exports: [BlobStorageService],
})
export class BlobStorageModule {}
