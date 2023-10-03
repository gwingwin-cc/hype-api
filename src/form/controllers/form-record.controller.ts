import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import xlsx from 'node-xlsx';
import { InjectModel } from '@nestjs/sequelize';
import { HypeForm, HypeFormField } from '../../entity';
import { FormService } from '../providers/form.service';
import { FormRecordService } from '../providers/form-record.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from '../../auth/permission.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { TagsService } from '../providers/tags.service';
import {
  CreateFormRecordDto,
  FORM_RECORD_STATE,
  FORM_RECORD_TYPE,
  FormRecordDto,
} from '../dto/form-record.dto';
import { HypeRequest } from '../../interfaces/request';
import { HypeAuthGuard } from '../../hype-auth.guard';
import { HypeAnonymousAuthGuard } from '../../hype-anonymous-auth.guard';

@Controller('forms')
export class FormRecordController {
  constructor(
    @InjectModel(HypeForm)
    private formModel: typeof HypeForm,
    private formService: FormService,
    private formRecordService: FormRecordService,
    private tagsService: TagsService,
  ) {}

  @UseGuards(HypeAnonymousAuthGuard)
  @Get(':fid/records')
  async getRecordList(
    @Req() req: HypeRequest,
    @Param('fid', ParseIntPipe) formId: number,
    @Query()
    body: {
      perPage: number;
      page: number;
      recordType?: 'DEV' | 'PROD';
      [key: string]: any;
      format: string;
    },
  ) {
    const granted = await this.formRecordService.validatePermissionGranted(
      formId,
      null,
      req.user,
      'read',
    );
    if (!granted) {
      throw new BadRequestException('You do not have permission to access.');
    }

    let form: HypeForm;
    if (body.includeForm) {
      form = await this.formService.getForm({
        id: formId,
        layoutState: 'ACTIVE',
      });
    } else {
      form = await this.formService.getFormOnly({
        id: formId,
        state: 'ACTIVE',
      });
    }

    if (form == null) {
      throw new Error('Form not found.');
    }

    if (body.recordType == null) {
      body.recordType = 'PROD';
    }
    const where = {};
    where[`${form.slug}.deletedAt`] = null;
    where[`${form.slug}.recordType`] = body.recordType;
    const [data, total] = await Promise.all([
      this.formRecordService.find(form.slug, { where }),
      this.formRecordService.count(form.slug, where),
    ]);
    return {
      form,
      data,
      total: total[0]['total'],
    };
  }

  @UseGuards(HypeAnonymousAuthGuard)
  @Get(':fid/records/:id')
  async getRecordById(
    @Req() req,
    @Param('fid', ParseIntPipe) formId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FormRecordDto> {
    const granted = await this.formRecordService.validatePermissionGranted(
      formId,
      id,
      req.user,
      'read',
    );
    if (!granted) {
      throw new BadRequestException('You do not have permission to access.');
    }
    const form = await this.formModel.findOne({
      where: {
        id: formId,
      },
      include: [HypeFormField],
    });
    if (form == null) {
      throw new BadRequestException('Form not found.');
    }
    const where = {};
    where[`zz_${form.slug}.deletedAt`] = null;
    const data = await this.formRecordService.findOneById(form.slug, id);
    if (data == null) {
      throw new BadRequestException('Record not found.');
    }
    return {
      ...data,
    };
  }
  @UseGuards(HypeAnonymousAuthGuard)
  @Delete(':fid/records/:id')
  async DeleteRecord(
    @Request() req: HypeRequest,
    @Param('fid') formId: number,
    @Param('id') id: number,
  ) {
    const granted = await this.formRecordService.validatePermissionGranted(
      formId,
      id,
      req.user,
      'delete',
    );
    if (!granted) {
      throw new BadRequestException('You do not have permission to access.');
    }
    const user = req.user;
    Logger.log(formId, 'Delete Record');
    await this.formRecordService.deleteRecord(user, formId, id);
  }

  @UseGuards(HypeAnonymousAuthGuard)
  @Patch(':fid/records/:id')
  @HttpCode(204)
  async updateRecord(
    @Request() req: HypeRequest,
    @Param('fid', ParseIntPipe) formId: number,
    @Param('id', ParseIntPipe) recordId: number,
    @Body()
    body: {
      data: any;
      recordState: string;
    },
  ): Promise<void> {
    const granted = await this.formRecordService.validatePermissionGranted(
      formId,
      recordId,
      req.user,
      'update',
    );
    if (!granted) {
      throw new BadRequestException(
        'You do not have permission to updateRecord.',
      );
    }
    const user = req.user;
    await this.formRecordService.updateRecord(
      user,
      formId,
      recordId,
      body.data,
      body.recordState,
    );
  }

  @UseGuards(HypeAnonymousAuthGuard)
  @Post(':fid/records')
  async createRecord(
    @Request() req: HypeRequest,
    @Param('fid', ParseIntPipe) formId: number,
    @Body() body: CreateFormRecordDto,
  ) {
    const granted = await this.formRecordService.validatePermissionGranted(
      formId,
      null,
      req.user,
      'create',
    );
    if (!granted) {
      throw new BadRequestException(
        'You do not have permission to createRecord.',
      );
    }
    return {
      id: await this.formRecordService.createRecord(
        req.user,
        formId,
        body.data,
        body.recordState,
        body.recordType,
      ),
    };
  }

  @Post('import-data')
  @UseGuards(HypeAuthGuard, PermissionGuard)
  @Permissions('form_management')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @Request() req: HypeRequest,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    req.headers['content-type'] = 'multipart/form-data';
    const workSheetsFromBuffer: Array<{ data: Array<any> }> = xlsx.parse(
      file.buffer,
    );
    const form = await this.formService.getForm({
      slug: body.formSlug,
      layoutState: 'ACTIVE',
    });
    const dataTemplate = [...workSheetsFromBuffer[0].data[0]];
    const dataToSaveArr = [];
    for (let i = 0; i < workSheetsFromBuffer[0].data.length; i++) {
      if (i == 0) {
        continue;
      }
      const r = workSheetsFromBuffer[0].data[i];
      const dataToSave = {};
      for (const cIndex in dataTemplate) {
        if (dataTemplate[cIndex] != 'id') {
          dataToSave[dataTemplate[cIndex]] = r[cIndex];
        }
      }
      dataToSaveArr.push(dataToSave);
    }

    const savedData = [];
    for (const d of dataToSaveArr) {
      const created = await this.formRecordService.createRecord(
        req.user,
        form.id,
        d,
        FORM_RECORD_STATE.ACTIVE,
        FORM_RECORD_TYPE.PROD,
      );
      savedData.push(created);
    }
    return savedData;
  }

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadBlob(
    @Request() req: HypeRequest,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = req.user;
    const blobIds = [];
    for (const f of files) {
      const resultRec = await this.formRecordService.saveBlob(user, f);
      blobIds.push(resultRec);
    }
    return blobIds;
  }

  @Get('get-tags-list')
  async getTagsList() {
    return this.tagsService.all();
  }
}
