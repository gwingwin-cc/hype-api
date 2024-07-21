import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Storage(File)')
@Controller('blob-storage')
export class BlobStorageController {
  constructor(private blobService: BlobStorageService) {}

  @Get('get-blob-info/:id')
  async getBlobInfo(@Param('id') id) {
    if (id == '' || id == 'undefined') {
      throw new HttpException('id require', HttpStatus.BAD_REQUEST);
    }
    const blobInfo = await this.blobService.getBlob({
      id: parseInt(id),
      byte: false,
    });
    if (blobInfo == null) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return blobInfo;
  }
}
