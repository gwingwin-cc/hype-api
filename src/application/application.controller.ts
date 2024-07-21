import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ApplicationService } from './application.service';

import { Permissions } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TagsService } from '../form/providers/tags.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('applications')
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private tagsService: TagsService,
  ) {}

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Post()
  async createApp(
    @Request() req,
    @Body()
    body: {
      appType: 'COMPONENT' | 'APP';
      slug: string;
      name: string;
    },
  ) {
    return this.applicationService.createApp(req.user, body);
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Patch('update-permission')
  async updatePermission(
    @Request() req,
    @Body() body: { appId: number; permissions: Array<any> },
  ) {
    return this.applicationService.updatePermission(req.user, body);
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Get(':id/draft')
  async getAppDraft(@Request() req, @Param('id') id) {
    return await this.applicationService.getApp({
      id: parseInt(id),
      state: 'DRAFT',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug')
  async getApp(@Request() req, @Param('slug') slug) {
    return await this.applicationService.getApp({
      slug: slug,
      state: 'ACTIVE',
    });
  }

  // @Permissions('api_management')
  // @UseGuards(PermissionGuard)
  // @Get(':id/:version')
  // async getAppVersion(
  //   @Request() req,
  //   @Param('id') id,
  //   @Param('version') version,
  // ) {
  //   return await this.prismaService.herpApplication.findUnique({
  //     where: {
  //       id: parseInt(id),
  //     },
  //     include: {
  //       appPermissions: true,
  //       layouts: {
  //         where: {
  //           deletedAt: null,
  //           id: version,
  //         },
  //       },
  //       components: {
  //         where: {
  //           deletedAt: null,
  //         },
  //       },
  //     },
  //   });
  // }
  //

  /**
   * @param req
   * @param query
   */
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAppDatalist(@Request() req, @Query() query: any) {
    let where = { deletedAt: null };
    if (query.where != null) {
      where = { deletedAt: null, ...query.where };
    }
    return this.applicationService.getAppDatalist({ where });
  }

  /**
   * @deprecated
   * @param req
   * @param body
   */
  @UseGuards(JwtAuthGuard)
  @Post('datalist')
  async getAppDatalistUnUse(@Request() req, @Body() body: any) {
    let where = { deletedAt: null };
    if (body.where != null) {
      where = { deletedAt: null, ...body.where };
    }
    return this.applicationService.getAppDatalist({ where });
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Post(':id/publish')
  async publishLayout(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.applicationService.publishLayout(req.user, { id });
  }

  //
  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Patch('')
  async updateSetting(
    @Request() req,
    @Body() body: { id: number; data: object },
  ) {
    if (body.data['tags']) {
      const obj = JSON.parse(body.data['tags']);
      if (obj.length > 0) {
        for (const v of obj) {
          const findTag = await this.tagsService.findOne(v);
          if (!findTag) {
            await this.tagsService.createTags({ name: v });
          }
        }
      }
    }
    return await this.applicationService.updateApp(
      req.user,
      body.id,
      body.data,
    );
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Patch(':id/layout')
  async updateLayout(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { layout: string; scripts: object },
  ) {
    // todo check status not publish
    return await this.applicationService.updateLayout(req.user, id, {
      layout: body.layout,
      scripts: body.scripts,
    });
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Delete(':id')
  async deleteApp(@Request() req, @Param('id') id: string) {
    return this.applicationService.deleteApp(req.user, parseInt(id));
  }

  @Permissions('api_management')
  @UseGuards(PermissionGuard)
  @Post('clone')
  async cloneApp(
    @Request() req,
    @Body()
    body: {
      appId: number;
      slug: string;
      name: string;
    },
  ) {
    return this.applicationService.cloneApp(
      body.appId,
      body.slug,
      body.name,
      req.user,
    );
  }
}
