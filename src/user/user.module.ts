import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  HypePermission,
  HypeRole,
  RolePermissions,
  User,
  UserApi,
  UserRoles,
} from '../entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserApi,
      UserRoles,
      HypeRole,
      RolePermissions,
      HypePermission,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
