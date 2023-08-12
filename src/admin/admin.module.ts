import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { AdminService } from './admin.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  HypePermission,
  HypeRole,
  RolePermissions,
  UserRoles,
} from '../entity';
import { FormModule } from '../form/form.module';
import { ApplicationModule } from '../application/application.module';
import { RolePermissionController } from './role-permission.controller';
import { UserController } from './user.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      HypeRole,
      UserRoles,
      RolePermissions,
      HypePermission,
    ]),
    FormModule,
    ApplicationModule,
    UserModule,
  ],
  controllers: [AdminController, RolePermissionController, UserController],
  providers: [AdminService],
})
export class AdminModule {}
