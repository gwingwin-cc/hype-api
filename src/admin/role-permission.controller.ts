import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { HypePermission, HypeRole } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';

@Controller('admin')
export class RolePermissionController {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    @InjectModel(HypePermission)
    private hypePermission: typeof HypePermission,
    @InjectModel(HypeRole)
    private hypeRole: typeof HypeRole,
  ) {}

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Get('roles')
  async getRoles(): Promise<any> {
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
  @Get('roles/:id')
  async getRole(@Param('id') id: string): Promise<HypeRole> {
    return this.adminService.getRole(parseInt(id));
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('roles')
  async createRole(@Request() req, @Body() body: any): Promise<any> {
    return await this.adminService.creatRole({
      slug: body.slug,
      name: body.name,
      // createdBy: req.user.id,
      roleType: 'normal',
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Patch('roles/:id/assign-permissions')
  async applyPermission(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ): Promise<any> {
    if (body.permissions != null) {
      const roleId = parseInt(id);
      await this.adminService.applyRolePermission(
        req.user,
        roleId,
        body.permissions,
      );
      return this.adminService.getRole(roleId);
    }
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string, @Request() req): Promise<any> {
    return this.adminService.deleteRole(req.user, {
      id: parseInt(id),
    });
  }

  @Get('users/:uid/assigned-role')
  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  async getAssignRole(@Param('uid') id: string): Promise<any> {
    return this.adminService.getAssignRole(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getPermissionList(): Promise<any> {
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
  @Post('permissions')
  async createPermission(@Request() req, @Body() body: any): Promise<any> {
    return this.adminService.createPermission({
      name: body.name,
      slug: body.slug,
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('permissions/:id')
  async deletePermission(
    @Param('id') id: string,
    @Request() req,
  ): Promise<any> {
    return this.adminService.deletePermission(req.user, {
      id: parseInt(id),
    });
  }
}
