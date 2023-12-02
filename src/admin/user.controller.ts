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
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HypePermission, HypeRole } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { InjectModel } from '@nestjs/sequelize';
import { HypeRequest } from '../interfaces/request';

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
  @Permissions('user_management')
  @Post('users/:uid/api-key')
  @HttpCode(201)
  async adminCreateApiKey(@Param('uid', ParseIntPipe) uid: number) {
    return this.userService.createApiKey(uid);
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Delete('users/:uid/api-key/:key')
  @HttpCode(204)
  async adminDeleteApiKey(@Param('key') key: string) {
    return this.userService.deleteApiKey(key);
  }

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
      ,
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
  async getUser(@Param('uid', ParseIntPipe) uid: number) {
    const apiKeys = await this.userService.getUserApiKey(uid);
    const user = await this.userService.findOne({ id: uid });
    return {
      user: user.toJSON(),
      apiKeys: apiKeys ? [apiKeys] : [],
    };
  }

  @UseGuards(PermissionGuard)
  @Permissions('user_management')
  @Post('users')
  async createUser(
    @Request() req: HypeRequest,
    @Body() body: any,
  ): Promise<any> {
    return this.adminService.createUser(req.user, body);
  }

  @UseGuards(PermissionGuard)
  @Permissions('permission_management')
  @Patch('users/:uid/assign-roles')
  async applyRoles(
    @Param('uid') uid: string,
    @Request() req: HypeRequest,
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
  @HttpCode(204)
  async deleteUser(@Param('uid') uid: string): Promise<any> {
    return this.userService.updateUser({
      where: { id: parseInt(uid) },
      data: { deletedAt: new Date() },
    });
  }
}
