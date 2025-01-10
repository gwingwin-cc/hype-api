import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { ScriptService } from './script.service';
import { InjectModel } from '@nestjs/sequelize';
import { HypeScript, HypeScriptPermissions, User } from '../entity';
import { HypeAuthGuard } from '../auth/guard/hype-auth.guard';
import { HypeRequest } from '../interfaces/request';
import { UpdaterFormPermissionDto } from '../form/dto/form.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Script')
@Controller('scripts')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class ScriptController {
  constructor(
    @InjectModel(HypeScript)
    private scriptModel: typeof HypeScript,
    @InjectModel(HypeScriptPermissions)
    private scriptPermissionModel: typeof HypeScriptPermissions,
    public serviceScript: ScriptService,
  ) {}

  @Permissions('script_management')
  @Patch(':id/permissions')
  async updatePermission(
    @Request() req: HypeRequest,
    @Param('id', ParseIntPipe) scriptId: number,
    @Body() body: UpdaterFormPermissionDto,
  ) {
    const forAdd = [];
    const forRemove = [];
    const existPermission = await this.scriptPermissionModel.findAll({
      where: {
        scriptId: scriptId,
        deletedAt: null,
      },
    });
    Logger.log('updateScriptPermission', body);
    const permissionToApply = body.permissions;
    for (const pa of permissionToApply.filter((p) => p.val === true)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) == null) {
        forAdd.push({
          permissionId: pa.id,
          scriptId: scriptId,
          createdBy: req.user.id,
        });
      }
    }

    for (const pa of permissionToApply.filter((p) => p.val === false)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) != null) {
        forRemove.push(pa.id);
      }
    }

    const removed = await this.scriptPermissionModel.update(
      {
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      {
        where: {
          permissionId: forRemove,
          scriptId: scriptId,
        },
      },
    );

    const added = await this.scriptPermissionModel.bulkCreate(forAdd);
    return { added, removed };
  }

  @Post('exec-sql-script')
  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  async execScriptBySlug(
    @Request() req: HypeRequest,
    @Body() body: { slug: string; params: object },
  ) {
    try {
      const result = await this.serviceScript.getScript({ slug: body.slug });
      if (result == null) {
        throw new BadRequestException('Script not found');
      }
      await this.serviceScript.checkPermission(req.user.id, result.id);
      // check permission
      return this.serviceScript.execScriptSQLSlug(body.slug, body.params);
    } catch (e) {
      throw new HttpException(
        'execScriptById error: ' + e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('exec-select-script-by-id')
  async execSelectScriptById(@Request() req, @Body() body: any) {
    return this.serviceScript.execScriptSQLForSelect({
      scriptId: body.id,
      formSlug: body.formSlug,
      targetFormSlug: body.targetFormSlug,
      dependValue: body.dependValue,
      search: body.search,
      params: body.params,
    });
  }

  @Permissions('api_management')
  @Post('datalist')
  async getScriptRecordDatalist(@Request() req, @Body() body: any) {
    let where = {
      deletedAt: null,
    };
    if (body.where != null) {
      where = { ...where, ...body.where };
    }
    const [data, total] = await Promise.all([
      this.scriptModel.findAll({
        where: where,
        include: [{ model: User, as: 'createdByUser' }],
        paranoid: body.paranoid ?? true,
      }),
      this.scriptModel.count({
        where: where,
      }),
    ]);

    return {
      data: data,
      total: total,
    };
  }

  @Post('')
  @Permissions('api_management')
  async createScript(@Request() req: HypeRequest, @Body() body: any) {
    return this.serviceScript.createScript(req.user, body);
  }

  @Get(':id')
  @Permissions('api_management')
  async getScript(@Param('id') id: any) {
    return this.serviceScript.getScript({
      id: parseInt(id),
    });
  }

  @Patch(':id')
  @Permissions('api_management')
  async updateScript(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: any,
  ) {
    return this.serviceScript.updateScript(req.user, id, { ...body });
  }

  @Post(':id/publish')
  @Permissions('api_management')
  async publishScript(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.serviceScript.publishScript(req.user, id);
  }

  @Delete(':id')
  @Permissions('api_management')
  async deleteScript(
    @Request() req,
    @Param('id')
    id: any,
  ) {
    return this.serviceScript.deleteScript(req.user, parseInt(id));
  }
}
