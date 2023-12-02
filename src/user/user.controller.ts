import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  Get,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { HypeRequest } from '../interfaces/request';
import { PermissionGuard } from '../auth/guard/permission.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('api-key')
  async createApiKey(@Request() req: HypeRequest) {
    return this.userService.createApiKey(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api-key')
  async getApiKey(@Request() req: HypeRequest) {
    return this.userService.getUserApiKey(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api-key/:key')
  async revokeApiKey(
    @Request() req: HypeRequest,
    @Param('key') key: string,
  ): Promise<any> {
    return this.userService.revokeUserApiKey(req.user.id, key);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password')
  async changePassword(
    @Request() req: HypeRequest,
    @Body() body: any,
  ): Promise<any> {
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
          id: req.user.id,
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
}
