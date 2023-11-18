import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { HypePermission, HypeRole, User } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';
import {
  AdminAssignUserRoleRequest,
  AdminChangePasswordRequest,
  AdminCreatePermissionRequest,
  AdminCreateRoleRequest,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  UserResponseModel,
} from './admin.dto';
import { HypeRequest } from '../interfaces/request';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin')
export class AdminController {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    @InjectModel(HypePermission)
    private hypePermission: typeof HypePermission,
    @InjectModel(HypeRole)
    private hypeRole: typeof HypeRole,
  ) {}

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Post('user/datalist')
  async getUsers(): Promise<{
    data: Array<UserResponseModel>;
    total: number;
  }> {
    const where = {
      deletedAt: null,
    };
    const [data, total] = await Promise.all([
      this.userService.find({
        where,
      }),
      this.userService.count({
        where,
      }),
    ]);
    return { data, total };
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Post('user/:uid/password')
  async changePassword(
    @Body() body: AdminChangePasswordRequest,
  ): Promise<UserResponseModel> {
    const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const isUpperCase = (string) => /[A-Z]/.test(string);
    if (
      body.password.length >= 8 &&
      format.test(body.password) &&
      isUpperCase(body.password)
    ) {
      const hash = await this.userService.hashPassword(body.password);
      return this.userService.updateUser({
        where: {
          id: body.id,
        },
        data: {
          passwordHash: hash,
        },
      });
    }
    throw new HttpException(
      'Minimum 8 characters long, uppercase & symbol',
      400,
    );
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Patch('user/:uid/account')
  async updateUser(@Body() body: AdminUpdateUserRequest) {
    return this.userService.updateUser({
      where: {
        id: body.id,
      },
      data: body,
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Get('user/:uid')
  async getUser(@Param('uid') uid: string): Promise<User | null> {
    return this.userService.findOne({ id: parseInt(uid) });
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Post('users')
  async createUser(
    @Request() req: HypeRequest,
    @Body() body: AdminCreateUserRequest,
  ): Promise<UserResponseModel> {
    return this.adminService.createUser(req.user, body);
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

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Delete('user/:uid')
  async deleteUser(@Param('uid') uid: string): Promise<UserResponseModel> {
    return this.userService.updateUser({
      where: { id: parseInt(uid) },
      data: { deletedAt: new Date() },
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('admin')
  @Post('init-project')
  async initProject(@Request() req: HypeRequest) {
    return this.adminService.initProject(req.user);
  }

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
}
