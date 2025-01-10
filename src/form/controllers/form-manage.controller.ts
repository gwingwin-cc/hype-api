import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FormService } from '../providers/form.service';
import { Permissions } from '../../auth/permission.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { InjectModel } from '@nestjs/sequelize';
import {
  FormStateEnum,
  HypeForm,
  HypeFormField,
  HypeFormPermissions,
} from '../../entity';
import { Attributes, FindOptions } from 'sequelize/types/model';
import { TagsService } from '../providers/tags.service';
import { HypeAuthGuard } from '../../auth/guard/hype-auth.guard';
import { HypeRequest } from '../../interfaces/request';
import { Op } from 'sequelize';
import {
  AddFormFieldRequest,
  AddFormRelationRequest,
  CreateFormRequest,
  UpdateFieldRequest,
  UpdateFormRequest,
  UpdateFormScriptRequest,
  UpdaterFormPermissionDto,
} from '../dto/form.dto';
import { rethrow } from '@nestjs/core/helpers/rethrow';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Form - Management')
@ApiBearerAuth()
@Controller('forms')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class FormManageController {
  constructor(
    @InjectModel(HypeForm)
    private formModel: typeof HypeForm,
    @InjectModel(HypeFormField)
    private formFieldModel: typeof HypeFormField,
    @InjectModel(HypeFormPermissions)
    private formPermissionModel: typeof HypeFormPermissions,
    private formService: FormService,
    private tagsService: TagsService,
  ) {}

  @Permissions('form_management')
  @Get(':id/draft')
  async getFormDraft(@Param('id', new ParseIntPipe()) id: number) {
    return await this.formService.getForm({
      id,
      layoutState: FormStateEnum.DRAFT,
      excludeDeleteField: false,
    });
  }

  @Get('find')
  async getFormActive(
    @Query('id', new ParseIntPipe()) id: number,
    @Query('slug') slug?: string,
  ) {
    return await this.formService.getForm({
      id,
      slug,
      layoutState: FormStateEnum.ACTIVE,
      excludeDeleteField: true,
    });
  }

  @Permissions('form_management')
  @Get('')
  async getFormDatalist(@Query('deleted') deleted?: string) {
    const where = { deletedAt: null };
    const filterOnlyDelete = deleted == 'true' || deleted == '1';
    if (filterOnlyDelete) {
      where.deletedAt = { [Op.ne]: null };
    }
    const options: FindOptions<Attributes<HypeForm>> = {
      where: where,
      paranoid: !filterOnlyDelete,
    };
    const dataPromise = this.formModel.findAll(options);
    const [data, total] = await Promise.all([
      dataPromise,
      this.formModel.count(options),
    ]);
    return {
      data,
      total,
    };
  }

  @Permissions('form_management')
  @Patch(':id/permissions')
  async updatePermission(
    @Request() req: HypeRequest,
    @Param('id', ParseIntPipe) formId: number,
    @Body() body: UpdaterFormPermissionDto,
  ) {
    const forAdd = [];
    const forRemove = [];
    const existPermission = await this.formPermissionModel.findAll({
      where: {
        formId: formId,
        deletedAt: null,
      },
    });
    Logger.log('updatePermission', body);
    const permissionToApply = body.permissions;
    for (const pa of permissionToApply.filter((p) => p.val === true)) {
      if (
        existPermission.find(
          (rp) => rp.permissionId == pa.id && rp.grant == pa.grant,
        ) == null
      ) {
        forAdd.push({
          permissionId: pa.id,
          grant: pa.grant,
          formId: formId,
          createdBy: req.user.id,
        });
      }
    }

    for (const pa of permissionToApply.filter((p) => p.val === false)) {
      const existFormPermission = existPermission.find(
        (rp) => rp.permissionId == pa.id && rp.grant == pa.grant,
      );
      if (existFormPermission != null) {
        forRemove.push(existFormPermission.id);
      }
    }

    const removed = await this.formPermissionModel.update(
      {
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      {
        where: {
          id: forRemove,
        },
      },
    );

    const added = await this.formPermissionModel.bulkCreate(forAdd);
    return { added, removed };
  }

  @Permissions('form_management')
  @Post()
  async createForm(
    @Request() req: HypeRequest,
    @Body() body: CreateFormRequest,
  ) {
    const slug = body.slug.toLowerCase();
    Logger.log(`create table slug ${slug}`, 'createForm');

    try {
      await this.formService.createForm(req.user, {
        name: body.name,
        slug: body.slug,
      });
    } catch (e) {
      if (e.message == 'form_slug_already_exist')
        throw new HttpException(e.message, 400);
      rethrow(e);
    }
  }

  @Permissions('form_management')
  @Post(':id/fields')
  async addField(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) formId: number,
    @Body() body: AddFormFieldRequest,
  ) {
    const slug = body.slug.toLowerCase();
    Logger.log(`addField slug ${slug}`, 'addField');
    return await this.formService.addFormField(
      req.user,
      formId,
      body.fieldType,
      body.componentTemplate,
      slug,
      body.name,
    );
  }

  @Permissions('form_management')
  @Delete(':formId/fields/:fid')
  async softDeleteField(
    @Param('formId', new ParseIntPipe()) formId: number,
    @Param('fid', new ParseIntPipe()) id: number,
  ) {
    Logger.log(`delete id ${formId}, ${id}`, 'deleteField');
    await this.formService.softDeleteField(formId, id);
    return;
  }

  @Permissions('form_management')
  @Delete(':formId/fields/:fid/hard')
  async hardDeleteField(
    @Param('formId', new ParseIntPipe()) formId: number,
    @Param('fid', new ParseIntPipe()) id: number,
  ) {
    Logger.log(`delete id ${formId} ${id}`, 'deleteComponent');
    await this.formService.hardDeleteField(formId, id);
  }

  @Permissions('form_management')
  @Delete(':id')
  async deleteForm(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    await this.formModel.update(
      {
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      {
        where: {
          id,
        },
      },
    );
    return;
  }

  @Permissions('form_management')
  @Patch(':id/restore')
  async restoreForm(@Param('id', new ParseIntPipe()) id: number) {
    await this.formModel.update(
      {
        deletedAt: null,
        deletedBy: null,
      },
      {
        paranoid: false,
        where: {
          id: id,
        },
      },
    );
    return;
  }

  @Permissions('form_management')
  @Patch(':id/scripts')
  async updateFormScript(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateFormScriptRequest,
  ) {
    return await this.formModel.update(
      {
        scripts: body.scripts,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  @Permissions('form_management')
  @Patch(':id')
  async updateForm(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateFormRequest,
  ) {
    const payload = Object.assign({}, body);
    delete payload['scripts'];
    if (payload['tags']) {
      const obj = JSON.parse(payload['tags']);
      if (obj.length > 0) {
        for (const v of obj) {
          const findTag = await this.tagsService.findOne(v);
          if (!findTag) {
            await this.tagsService.createTags({ name: v });
          }
        }
      }
    }
    return await this.formModel.update(
      {
        ...payload,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  @Permissions('form_management')
  @Post(':id/add-relation')
  async addRelation(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) fid: number,
    @Body()
    body: AddFormRelationRequest,
  ) {
    try {
      return await this.formService.addRelation(
        req.user,
        fid,
        body.targetFormId,
        body.slug,
        {
          connectFromField: body.connectFromField,
          connectToField: body.connectToField,
        },
      );
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Permissions('form_management')
  @Patch(':id/fields/:fid')
  async updateField(
    @Request() req: HypeRequest,
    @Param('fid', new ParseIntPipe()) id: number,
    @Body() body: UpdateFieldRequest,
  ) {
    return await this.formFieldModel.update(
      {
        updatedBy: req.user.id,
        updatedAt: new Date(),
        name: body.name,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }
}
