import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { HypePermission, HypeRole, User } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';

// @UseGuards(JwtAuthGuard)
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
  async getUsers(): Promise<any> {
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
  async changePassword(@Request() req, @Body() body: any): Promise<any> {
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
      403,
    );
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Patch('user/:uid/account')
  async updateUser(@Request() req, @Body() body: any): Promise<any> {
    const updateData = {};
    if (body.status != null) {
      updateData['status'] = body.status;
    }

    if (body.username != null) {
      updateData['username'] = body.username;
    }

    if (body.email != null) {
      updateData['email'] = body.email;
    }

    return this.userService.updateUser({
      where: {
        id: body.id,
      },
      data: updateData,
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
  async createUser(@Request() req, @Body() body: any): Promise<any> {
    return this.adminService.createUser(req.user, body);
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Patch('user-roles/:uid')
  async assignUserRole(
    @Param('uid') uid: string,
    @Request() req,
    @Body() body: any,
  ): Promise<any> {
    if (body.roles != null) {
      const userId = parseInt(uid);
      return this.adminService.applyUserRoles(req.user, userId, body.roles);
    }
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Delete('user/:uid')
  async deleteUser(@Param('uid') uid: string): Promise<any> {
    return this.userService.updateUser({
      where: { id: parseInt(uid) },
      data: { deletedAt: new Date() },
    });
  }

  @UseGuards(PermissionGuard)
  @Permissions('admin')
  @Post('init-project')
  async initProject(@Request() req): Promise<any> {
    return this.adminService.initProject(req.user);
  }

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

  /**
   * @deprecated
   */
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Get('role/datalist')
  async getRolesOld(): Promise<any> {
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
  async getRole(@Param('id') id: string): Promise<HypeRole> {
    return this.adminService.getRole(parseInt(id));
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('role')
  async createRole(@Request() req, @Body() body: any): Promise<any> {
    return await this.adminService.creatRole({
      slug: body.slug,
      name: body.name,
      // createdBy: req.user.id,
      roleType: 'normal',
    });
  }

  // @UseGuards(PermissionGuard)
  // @Permissions('permission_management')
  // @Patch('role-permissions/:id')
  // async applyPermission(
  //   @Param('id') id: string,
  //   @Request() req,
  //   @Body() body: any,
  // ): Promise<any> {
  //   if (body.permissions != null) {
  //     const roleId = parseInt(id);
  //     await this.adminService.applyRolePermission(
  //       req.user,
  //       roleId,
  //       body.permissions,
  //     );
  //     return this.adminService.getRole(roleId);
  //   }
  // }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('role/:id')
  async deleteRole(@Param('id') id: string, @Request() req): Promise<any> {
    return this.adminService.deleteRole(req.user, {
      id: parseInt(id),
    });
  }

  @Get('assign-role/:uid')
  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  async getAssignRole(@Param('uid') id: string): Promise<any> {
    return this.adminService.getAssignRole(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('permission/datalist')
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

  // @UseGuards(JwtAuthGuard)
  // @Get('permission/:slug')
  // async getPermission(
  //   @Param('slug') slug: string,
  // ): Promise<HerpPermission | null> {
  //   return this.prismaService.herpPermission.findFirst({
  //     where: {
  //       slug: slug,
  //       deletedAt: null,
  //     },
  //   });
  // }
  //
  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Post('permission')
  async createPermission(@Request() req, @Body() body: any): Promise<any> {
    return this.adminService.createPermission({
      name: body.name,
      slug: body.slug,
    });
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch('permission/:id')
  // async updatePermission(
  //   @Param('id') id: string,
  //   @Request() req,
  //   @Body() body: any,
  // ): Promise<any> {
  //   return this.adminService.herpPermission.update({
  //     where: {
  //       id: parseInt(id),
  //     },
  //     data: {
  //       ...body,
  //     },
  //   });
  // }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Delete('permission/:id')
  async deletePermission(
    @Param('id') id: string,
    @Request() req,
  ): Promise<any> {
    return this.adminService.deletePermission(req.user, {
      id: parseInt(id),
    });
  }
}
