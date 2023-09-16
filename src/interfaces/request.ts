import { User } from '../entity';
import { Request } from '@nestjs/common';

export interface HypeRequest extends Request {
  user: User;
}
