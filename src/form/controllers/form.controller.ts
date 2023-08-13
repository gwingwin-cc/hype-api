import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  Param,
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
import { HypeForm, HypeFormField, HypeFormPermissions } from '../../entity';
import { Attributes, FindOptions } from 'sequelize/types/model';
import { TagsService } from '../providers/tags.service';
import { HypeAuthGuard } from '../../hype-auth.guard';

@Controller('forms')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class FormController {
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
  async getFormDraft(@Request() req, @Param('id') id) {
    return await this.formService.getForm({
      id,
      layoutState: 'DRAFT',
      excludeDeleteField: false,
    });
  }

  @Get('find')
  async getFormActive(@Request() req, @Query('id') id, @Query('slug') slug) {
    let intId = null;
    if (id != null) intId = parseInt(id);
    return await this.formService.getForm({
      id: intId,
      slug,
      layoutState: 'ACTIVE',
      excludeDeleteField: true,
    });
  }

  @Get(':id')
  async getForm(
    @Request() req,
    @Param('id') id,
    @Query() query: { layout_state: string },
  ) {
    const intId = parseInt(id);
    try {
      return await this.formService.getForm({
        id: intId,
        slug: null,
        layoutState: query.layout_state ? query.layout_state : 'ACTIVE',
      });
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Permissions('form_management')
  @Get('')
  async getFormDatalist(
    @Request() req,
    @Body()
    body: {
      [key: string]: any;
      format: string;
    },
  ) {
    let where = { deletedAt: null };
    if (body.where != null) {
      where = { ...body.where };
    }
    // let include = [
    //   HypeFormField,
    //   {
    //     model: User,
    //     as: 'createdByUser',
    //   },
    // ];
    // if (body.include != null) {
    //   include = body.include;
    // }
    const options: FindOptions<Attributes<HypeForm>> = {
      where: where,
      // include: include,
    };

    if (body.attributes != null) {
      options.attributes = body.attributes;
    }

    const dataPromise = this.formModel.findAll(options);
    const [data, total] = await Promise.all([
      dataPromise,
      this.formModel.count({
        where,
        // include: [...(body.include ?? [])],
      }),
    ]);
    return {
      data,
      total,
    };
  }

  @Permissions('form_management')
  @Patch(':id/permissions')
  async updatePermission(
    @Request() req,
    @Param('id') formId,
    @Body() body: { permissions: Array<any> },
  ) {
    const forAdd = [];
    const forRemove = [];
    const existPermission = await this.formPermissionModel.findAll({
      where: {
        formId: formId,
        deletedAt: null,
      },
    });
    const permissionToApply = body.permissions;
    for (const pa of permissionToApply.filter((p) => p.val === true)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) == null) {
        forAdd.push({
          permissionId: pa.id,
          formId: formId,
          createdBy: req.user.id,
        });
      }
    }

    for (const pa of permissionToApply.filter((p) => p.val === false)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) != null) {
        forRemove.push(pa.id);
      }
    }

    const removed = await this.formPermissionModel.update(
      {
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      {
        where: {
          permissionId: forRemove,
          formId: formId,
        },
      },
    );

    const added = await this.formPermissionModel.bulkCreate(forAdd);
    return { added, removed };
  }

  @Permissions('form_management')
  @Post()
  async createForm(
    @Request() req,
    @Body() body: { slug: string; name: string },
  ) {
    const slug = body.slug.toLowerCase();
    Logger.log(`create table slug ${slug}`, 'createForm');
    return this.formService.createForm(req.user, {
      name: body.name,
      slug: body.slug,
    });
  }

  @Permissions('form_management')
  @Post(':id/fields')
  async addField(
    @Request() req,
    @Param('id') id,
    @Body()
    body: {
      name: string;
      formId: number;
      slug: string;
      fieldType: string;
      componentTemplate: string;
    },
  ) {
    const slug = body.slug.toLowerCase();
    const formId = parseInt(id);
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
    @Request() req,
    @Param('formId') formId,
    @Param('fid') id,
  ) {
    Logger.log(`delete id ${formId}, ${id}`, 'deleteField');
    await this.formService.softDeleteField(parseInt(formId), parseInt(id));
    return;
  }

  @Permissions('form_management')
  @Delete(':formId/fields/:fid/hard')
  async hardDeleteField(
    @Request() req,
    @Param('formId') formId,
    @Param('fid') id,
  ) {
    Logger.log(`delete id ${formId} ${id}`, 'deleteComponent');
    try {
      await this.formService.hardDeleteField(parseInt(formId), parseInt(id));
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Permissions('form_management')
  @Delete(':id')
  async deleteForm(@Request() req, @Param('id') id) {
    await this.formModel.update(
      {
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      {
        where: {
          id: parseInt(id),
        },
      },
    );
    return;
  }

  @Permissions('form_management')
  @Patch(':id/restore')
  async restoreForm(@Request() req, @Param('id') id) {
    await this.formModel.update(
      {
        deletedAt: null,
        deletedBy: null,
      },
      {
        paranoid: false,
        where: {
          id: parseInt(id),
        },
      },
    );
    return;
  }

  @Permissions('form_management')
  @Patch(':id/scripts')
  async updateFormScript(
    @Request() req,
    @Param('id') id,
    @Body() body: { name: string; desc: string; scripts: any },
  ) {
    return await this.formModel.update(
      {
        scripts: body.scripts,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      {
        where: {
          id: parseInt(id),
        },
      },
    );
  }

  @Permissions('form_management')
  @Patch(':id')
  async updateForm(
    @Request() req,
    @Param('id') id,
    @Body() body: { name: string; desc: string },
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
          id: parseInt(id),
        },
      },
    );
  }

  @Permissions('form_management')
  @Post(':id/add-relation')
  async addRelation(
    @Request() req,
    @Param('id') fid,
    @Body()
    body: {
      slug: string;
      targetFormId: number;
      connectFromField: string;
      connectToField: string;
    },
  ) {
    const formId = parseInt(fid);
    try {
      return await this.formService.addRelation(
        req.user,
        formId,
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
    @Request() req,
    @Param('fid') id,
    @Body() body: { name: string },
  ) {
    return await this.formFieldModel.update(
      {
        updatedBy: req.user.id,
        updatedAt: new Date(),
        name: body.name,
      },
      {
        where: {
          id: parseInt(id),
        },
      },
    );
  }
}
