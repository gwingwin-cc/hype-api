import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Reflector } from '@nestjs/core';
import { UserService } from './user/user.service';

@Injectable()
export class HypeAnonymousAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
      const user = await this.userService.getUserByApiKey(apiKey);
      request.user = user;
      return true;
    }
    if (authorization != null) {
      const token = authorization.split('Bearer ')[1];
      if (token != null) {
        if (token == 'null') {
          // default token for anonymous user
          return true;
        }
        const decoded = this.authService.validateJwt(
          authorization.split('Bearer ')[1],
        );
        if (decoded == false) {
          return false;
        }
        const user = await this.userService.findOne({
          id: decoded['sub'],
        });

        if (user == null) {
          throw new UnauthorizedException('token valid but user not exist');
        }
        request.user = user;
        return true;
      }
    } else {
      return true;
    }
    return false;
  }
}
