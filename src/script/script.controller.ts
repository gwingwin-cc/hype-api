import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { HypeScript, User } from '../entity';
import { HypeAuthGuard } from '../hype-auth.guard';

@Controller('scripts')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class ScriptController {
  constructor(
    @InjectModel(HypeScript)
    private scriptModel: typeof HypeScript,
    public serviceScript: ScriptService,
  ) {}

  @Post('exec-sql-script')
  async execScript(@Request() req, @Body() body: any) {
    return this.serviceScript.batchExecScriptSQL(body.slug, body.params);
  }

  @Post('exec-sql-script-by-id')
  async execScriptById(@Request() req, @Body() body: { id; params }) {
    try {
      return this.serviceScript.execScriptSQL(body.id, body.params);
    } catch (e) {
      throw new HttpException(
        'execScriptById error: ' + e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('exec-sql-script-by-slug')
  async execScriptBySlug(@Request() req, @Body() body: { slug; params }) {
    try {
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
  async createScript(@Request() req, @Body() body: any) {
    return this.serviceScript.createScript(req.user, body);
  }

  @Get(':id')
  @Permissions('api_management')
  async getScript(@Request() req, @Param('id') id: any) {
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
