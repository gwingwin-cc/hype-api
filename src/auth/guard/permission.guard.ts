import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PERMISSIONS_KEY } from '../permission.decorator';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class PermissionGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private sequelize: Sequelize) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseGuardResult = await super.canActivate(context);
    if (!baseGuardResult) {
      // unsuccessful authentication return false
      return false;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }

    // successful authentication, user is injected
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const tempRequiredPermissions = [...requiredPermissions];
    tempRequiredPermissions.push(`administrator`);
    const hasPermission = await this.sequelize.modelManager.sequelize.query(
      `SELECT ur.userId, ps.slug
             FROM hype_permissions ps
                      INNER JOIN hype_role_permissions rp ON rp.permissionId = ps.id
                      INNER JOIN hype_user_roles ur ON ur.roleId = rp.roleId
             WHERE slug IN (:requiredPermissions)
               AND userId = :userId
            `,
      {
        replacements: {
          requiredPermissions: tempRequiredPermissions,
          userId: user.id,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (hasPermission.length > 0) {
      return true;
    }
    throw new ForbiddenException();
  }
}
