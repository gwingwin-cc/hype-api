import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { HypePermission, HypeRole } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';
import { HypeRequest } from '../interfaces/request';
import {
  AdminCreatePermissionRequest,
  AdminCreateRoleRequest,
} from './role-permission.dto';
import { AdminAssignUserRoleRequest } from './role-permission.dto';

@Controller('admin')
export class RolePermissionController {
  constructor(
    private adminService: AdminService,
    @InjectModel(HypePermission)
    private hypePermission: typeof HypePermission,
    @InjectModel(HypeRole)
    private hypeRole: typeof HypeRole,
  ) {}

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Get('roles')
  async getRoles(): Promise<{ data: Array<HypeRole>; total: number }> {
    const [data, total] = await Promise.all([
      this.hypeRole.findAll({
        where: {
          deletedAt: null,
        },
        include: [],
      }),
      this.hypeRole.count({ where: { deletedAt: null } }),
    ]);
    return {
      data,
      total,
    };
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Get('role/:id')
  async getRole(@Param('id') id: string) {
    return this.adminService.getRole(parseInt(id));
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('role')
  async createRole(@Body() body: AdminCreateRoleRequest) {
    return await this.adminService.creatRole({
      slug: body.slug,
      name: body.name,
      // createdBy: req.user.id,
      roleType: 'normal',
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('role/:id')
  async deleteRole(@Param('id') id: string, @Request() req: HypeRequest) {
    return this.adminService.deleteRole(req.user, {
      id: parseInt(id),
    });
  }

  @Get('assign-role/:uid')
  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  async getAssignRole(@Param('uid') id: string) {
    return this.adminService.getAssignRole(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('permission/datalist')
  async getPermissionList(): Promise<{
    data: Array<HypePermission>;
    total: number;
  }> {
    const [data, total] = await Promise.all([
      this.hypePermission.findAll({
        where: {
          deletedAt: null,
        },
        include: [HypeRole],
      }),
      this.hypePermission.count({
        where: { deletedAt: null },
      }),
    ]);
    return {
      data,
      total,
    };
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('permission')
  async createPermission(@Body() body: AdminCreatePermissionRequest) {
    return this.adminService.createPermission({
      name: body.name,
      slug: body.slug,
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('permission/:id')
  async deletePermission(@Param('id') id: string, @Request() req: HypeRequest) {
    return this.adminService.deletePermission(req.user, {
      id: parseInt(id),
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Patch('user-roles/:uid')
  async assignUserRole(
    @Param('uid', new ParseIntPipe()) uid: number,
    @Request() req: HypeRequest,
    @Body() body: AdminAssignUserRoleRequest,
  ) {
    if (body.roles != null) {
      return this.adminService.applyUserRoles(req.user, uid, body.roles);
    }
  }
}
