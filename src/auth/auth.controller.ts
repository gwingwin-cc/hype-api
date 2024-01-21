import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { HypeRequest } from '../interfaces/request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: HypeRequest): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async profile(@Request() req: HypeRequest): Promise<any> {
    return this.authService.profile(req.user);
  }
}
