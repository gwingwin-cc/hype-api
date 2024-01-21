import { User, UserStatusType } from '../entity';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export type UserResponseModel = Omit<User, 'passwordHash'>;

export class AdminChangePasswordRequest {
  @IsString()
  password: string;

  @IsNumber()
  id: number;
}
export class AdminUpdateUserRequest {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  status?: UserStatusType;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
export class AdminCreateUserRequest {
  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  status: UserStatusType;
}
