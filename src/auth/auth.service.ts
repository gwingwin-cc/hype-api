import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { User } from '../entity';
import { UserService } from '../user/user.service';
import { createHmac } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUserName(username);
    if (user == null) {
      return null;
    }

    const isMatch = await verify(user.passwordHash, password);
    if (isMatch) {
      return user;
    }
    return null;
  }

  async generateToken(user: any) {
    const userRoles = await this.usersService.getUserRoles(user);
    // const userRoles = userMapRole.map((ump) => ump.roles);
    // console.log(userRoles);
    const payload = {
      sub: user.id,
      username: user.username,
      roles: userRoles,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { expiresIn: 60 * 60 * 24 * 7 }),
    ]);
    return { accessToken, refreshToken };
  }

  async login(user: User) {
    const { accessToken, refreshToken } = await this.generateToken(user);
    // await this.saveRefreshToken(user, refreshToken);
    await this.usersService.findOne({
      id: user.id,
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async profile(user: User) {
    const userModel = await this.usersService.findOne({
      id: user.id,
    });
    return {
      id: userModel.id,
      username: userModel.username,
      email: userModel.email,
      roles: userModel.userRoles,
    };
  }

  async validateApiKey(url, headers, payload) {
    const apiUser = await this.usersService.findApiKey(headers['hype-api_key']);
    if (apiUser.deletedAt != null) {
      throw new UnauthorizedException('api key is deleted');
    }
    const signed = this.generateSignature(
      apiUser['secretKey'],
      url,
      headers['hype-timestamp'],
      payload,
    );
    return signed == headers['hype-signature'];
  }

  private generateSignature(
    secretKey: string,
    url: string,
    timestamp: string,
    payload: any,
  ): string {
    const hmac = createHmac('sha256', secretKey);
    const serializedPayload = JSON.stringify(payload);
    const signString = timestamp + ':' + url + ':' + serializedPayload;
    return hmac.update(signString).digest('hex');
  }

  validateJwt(token: string): object | false {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return false;
    }
  }
}
