import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HypeAuthGuard extends AuthGuard('hype') {}
