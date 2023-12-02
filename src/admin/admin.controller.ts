import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { User } from '../entity';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import {
  AdminChangePasswordRequest,
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
}
