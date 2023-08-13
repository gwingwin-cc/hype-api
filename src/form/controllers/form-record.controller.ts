import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import xlsx from 'node-xlsx';
import { InjectModel } from '@nestjs/sequelize';
import { HypeForm, HypeFormField } from '../../entity';
import { UserService } from '../../user/user.service';
import { FormService } from '../providers/form.service';
import { FormRecordService } from '../providers/form-record.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from '../../auth/permission.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { BlobStorageService } from '../../blob-storage/blob-storage.service';
import { TagsService } from '../providers/tags.service';
import {
  CreateFormRecordDto,
  FORM_RECORD_STATE,
  FORM_RECORD_TYPE,
  FormRecordDto,
} from '../dto/form-record.dto';
import { HypeAuthGuard } from '../../hype-auth.guard';

@Controller('forms')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class FormRecordController {
  constructor(
    @InjectModel(HypeForm)
    private formModel: typeof HypeForm,
    private blobService: BlobStorageService,
    private formService: FormService,
    private formRecordService: FormRecordService,
    private userService: UserService,
    private tagsService: TagsService,
  ) {}

  @Get(':fid/records')
  async getRecordList(
    @Request() req,
    @Param('fid') formId,
    @Query()
    body: {
      perPage: number;
      page: number;
      recordType?: 'DEV' | 'PROD';
      [key: string]: any;
      format: string;
    },
  ) {
    let form = null;
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

  @Get(':fid/records/:id')
  async getRecordById(
    @Request() req,
    @Param('fid') formId,
    @Param('id') id,
  ): Promise<FormRecordDto> {
    const form = await this.formModel.findOne({
      where: {
        id: formId,
      },
      include: [HypeFormField],
    });
    if (form == null) {
      throw new Error('Form not found.');
    }
    const where = {};
    where[`zz_${form.slug}.deletedAt`] = null;
    const data = await this.formRecordService.findOneById(form.slug, id);
    return {
      ...data,
    };
  }

  // TODO REPLACEMENT
  @Get('script-records')
  async getRecordListByScript(
    @Request() req,
    @Body()
    body: { perPage: number; page: number; [key: string]: any; format: string },
  ) {
    return this.formRecordService.getRecordListByScript(body);
  }

  // TODO REPLACEMENT
  @Post('excel-script-datalist')
  async exportExcelScriptDatalist(
    @Request() req,
    @Body()
    body: { [key: string]: any },
  ) {
    return this.formRecordService.exportExcelRecordListByScript(body);
  }

  @Delete(':fid/records/:id')
  async DeleteRecord(@Request() req, @Param('fid') formId, @Param('id') id) {
    const user = req.user;
    Logger.log(formId, 'Delete Record');
    await this.formRecordService.deleteRecord(user, formId, id);
  }

  @Patch(':fid/records/:id')
  @HttpCode(204)
  async updateRecord(
    @Request() req,
    @Param('fid') formId,
    @Param('id') recordId,
    @Body()
    body: {
      data: any;
      recordState: string;
    },
  ): Promise<void> {
    const user = req.user;
    await this.formRecordService.updateRecord(
      user,
      formId,
      recordId,
      body.data,
      body.recordState,
    );
  }

  @Post(':fid/records')
  async createRecord(
    @Request() req,
    @Param('fid') formId,
    @Body() body: CreateFormRecordDto,
  ) {
    const user = req.user;
    await this.formRecordService.checkPermission(user.id, formId);
    try {
      return {
        id: await this.formRecordService.createRecord(
          req.user,
          formId,
          body.data,
          body.recordState,
          body.recordType,
        ),
      };
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Post('import-data')
  @Permissions('form_management')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @Request() req,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
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
    @Request() req,
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
