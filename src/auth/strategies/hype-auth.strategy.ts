import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-custom';

@Injectable()
export class HypeAuthStrategy extends PassportStrategy(Strategy, 'hype') {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super();
  }

  async validate(req: Request) {
    const headers = req.headers;
    const apiKey = headers['hype-api-key'];
    const authorization = headers['authorization'];

    if (apiKey != null) {
      const allow = await this.authService.validateApiKey(headers);
      if (!allow) {
        throw new UnauthorizedException('API Key is invalid');
      }
      const user = await this.userService.getUserByApiKey(apiKey);
      return user;
    }
    if (authorization != null) {
      const result = this.authService.validateJwt(
        authorization.split('Bearer ')[1],
      );
      if (result == false) {
        throw new UnauthorizedException();
      }
      const user = await this.userService.findOne({
        id: result['sub'],
      });
      return user;
    }
    throw new UnauthorizedException();
  }
}
