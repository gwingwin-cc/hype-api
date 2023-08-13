import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Request,
  Response,
} from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';

@Controller('blob-storage')
export class BlobStorageController {
  constructor(private blobService: BlobStorageService) {}
  @Get('viewfile/:id')
  @Header('Cache-Control', 'max-age=3600')
  async viewFile(@Request() req, @Response() res, @Param('id') id) {
    if (id == '' || id == 'undefined') {
      throw new HttpException('id require', HttpStatus.BAD_REQUEST);
    }
    const blobInfo = await this.blobService.getBlob({
      id: parseInt(id),
    });
    if (blobInfo == null) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    res.set({
      'Content-Type': blobInfo.mimetype,
      // 'Cache-Control': 'max-age=3600',
    });
    res.end(blobInfo.blob.bytes);
    // return new StreamableFile(blobInfo.blobData.bytes);
  }

  @Get('get-blob-info/:id')
  async getBlobInfo(@Request() req, @Param('id') id) {
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
