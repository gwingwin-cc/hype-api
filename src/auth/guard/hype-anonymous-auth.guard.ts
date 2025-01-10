import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HypeAnonymousAuthGuard extends AuthGuard('hype-anonymous') {}
