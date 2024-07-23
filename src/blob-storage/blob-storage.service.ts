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

  async createBlob(
    byUser: User,
    file: Express.Multer.File,
    storageType: string = 'hype_db',
  ) {
    let blobId: number;
    let meta: string;
    switch (storageType) {
      case 'hype_db':
        const blob = await this.blobModel.create({
          bytes: file.buffer,
        });
        meta = blob.id.toString();
        blobId = blob.id;
        break;
      default:
        throw new Error('Invalid storage type');
    }

    return this.blobInfoModel.create({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      storageType: storageType,
      createdBy: byUser.id,
      createdAt: new Date(),
      meta: meta,
      blobId: blobId,
    });
  }
}
