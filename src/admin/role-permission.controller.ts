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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiSpecAssignPermission,
  ApiSpecAssignRole,
  ApiSpecCreatePermission,
  ApiSpecCreateRole,
  ApiSpecDeletePermission,
  ApiSpecDeleteRole,
  ApiSpecGetAssignRole,
  ApiSpecGetPermissions,
  ApiSpecGetRole,
  ApiSpecGetRoles,
} from './role-permission.api-spec';

@ApiTags('Admin - Authorization Manage')
@Controller('admin')
export class RolePermissionController {
  constructor(
    private adminService: AdminService,
    @InjectModel(HypePermission)
    private hypePermission: typeof HypePermission,
    @InjectModel(HypeRole)
    private hypeRole: typeof HypeRole,
  ) {}

  @ApiSpecGetRoles()
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

  @ApiSpecGetRole()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Get('roles/:id')
  async getRole(@Param('id') id: string) {
    return this.adminService.getRole(parseInt(id));
  }

  @ApiSpecCreateRole()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('roles')
  async createRole(@Body() body: AdminCreateRoleRequest) {
    return await this.adminService.creatRole({
      slug: body.slug,
      name: body.name,
      // createdBy: req.user.id,
      roleType: 'normal',
    });
  }

  @ApiSpecDeleteRole()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('role/:id')
  async deleteRole(@Param('id') id: string, @Request() req: HypeRequest) {
    return this.adminService.deleteRole(req.user, {
      id: parseInt(id),
    });
  }

  @ApiSpecGetAssignRole()
  @Get('assign-role/:uid')
  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  async getAssignRole(@Param('uid') id: string) {
    return this.adminService.getAssignRole(parseInt(id));
  }

  @ApiSpecGetPermissions()
  @UseGuards(JwtAuthGuard)
  @Get('permissions')
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

  @ApiSpecCreatePermission()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('permissions')
  async createPermission(@Body() body: AdminCreatePermissionRequest) {
    return this.adminService.createPermission({
      name: body.name,
      slug: body.slug,
    });
  }

  @ApiSpecDeletePermission()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('permissions/:id')
  async deletePermission(@Param('id') id: string, @Request() req: HypeRequest) {
    return this.adminService.deletePermission(req.user, {
      id: parseInt(id),
    });
  }

  @ApiSpecAssignPermission()
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Patch('roles/:id/assign-permissions')
  async applyPermission(
    @Param('id') id: string,
    @Request() req: HypeRequest,
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

  @ApiSpecAssignRole()
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
