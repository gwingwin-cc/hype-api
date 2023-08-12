import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HypeBlobInfo, HypeBlobStorage, User } from '../entity';
import { Express } from 'express';

@Injectable()
export class BlobStorageService {
  constructor(
    @InjectModel(HypeBlobInfo)
    private blobInfoModel: typeof HypeBlobInfo,
    @InjectModel(HypeBlobStorage)
    private blobModel: typeof HypeBlobStorage,
  ) {}

  async getBlob({
    id = null,
    slug = null,
    byte = true,
  }): Promise<HypeBlobInfo> {
    const optExtra: { id?; slug? } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }

    return await this.blobInfoModel.findOne({
      where: optExtra,
      include: byte ? [HypeBlobStorage] : [],
    });
  }

  async createBlob(byUser: User, file: Express.Multer.File) {
    const blob = await this.blobModel.create({
      bytes: file.buffer,
    });
    return this.blobInfoModel.create({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      createdBy: byUser.id,
      createdAt: new Date(),
      blobId: blob.id,
    });
  }
}
