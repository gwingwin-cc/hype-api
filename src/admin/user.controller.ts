import {
  Body,
  Patch,
  Controller,
  Request,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HypePermission, HypeRole, User } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';

@Controller('admin')
export class UserController {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    @InjectModel(HypePermission)
    private hypePermission: typeof HypePermission,
    @InjectModel(HypeRole)
    private hypeRole: typeof HypeRole,
  ) {}

  @UseGuards(PermissionGuard)
  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Get('users')
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
  @Post('users/:uid/password')
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
  @Patch('users/:uid/account')
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
  @Get('users/:uid')
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
  @Permissions('permission_management')
  @Patch('users/:uid/assign-roles')
  async applyRoles(
    @Param('uid') uid: string,
    @Request() req,
    @Body() body: any,
  ): Promise<any> {
    if (body.roles != null) {
      const userId = parseInt(uid);
      await this.adminService.applyUserRoles(req.user, userId, body.roles);
    }
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Delete('users/:uid')
  async deleteUser(@Param('uid') uid: string): Promise<any> {
    return this.userService.updateUser({
      where: { id: parseInt(uid) },
      data: { deletedAt: new Date() },
    });
  }
}
