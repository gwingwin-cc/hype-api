import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class HypeAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const apiKey = headers['hype-api-key'];
    const authorization = headers['authorization'];

    if (apiKey != null) {
      await this.authService.validateApiKey(
        request.baseUrl,
        headers,
        request.body,
      );
      return true;
    }
    if (authorization != null) {
      this.authService.validateJwt(authorization.split('Bearer ')[1]);
      return true;
    }
    return false;
  }
}
