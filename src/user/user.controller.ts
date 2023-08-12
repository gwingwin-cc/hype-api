import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('password')
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
