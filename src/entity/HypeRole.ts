import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseSlugEntity } from './BaseSlugEntity';
import { BaseEntity } from './BaseEntity';
import { User, UserRoles } from './User';
import { HypeApplication, HypeApplicationPermissions } from './HypeApplication';

@Table({
  timestamps: true,
  tableName: 'hype_role_permissions',
})
export class RolePermissions extends BaseEntity {
  @ForeignKey(() => HypeRole)
  @Column
  roleId: number;

  @ForeignKey(() => HypePermission)
  @Column
  permissionId: number;
}

@Table({
  timestamps: true,
  tableName: 'hype_roles',
})
export class HypeRole extends BaseSlugEntity {
  @Column({
    type: DataType.STRING,
    defaultValue: 'normal',
  })
  roleType: string;

  @BelongsToMany(() => HypePermission, () => RolePermissions)
  permissions: HypePermission[];

  @BelongsToMany(() => User, () => UserRoles)
  roleUsers: User[];
}

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_permissions',
})
export class HypePermission extends BaseSlugEntity {
  @Column({ type: DataType.STRING, defaultValue: 'normal' })
  permissionType: 'normal' | 'core';

  @BelongsToMany(() => HypeRole, () => RolePermissions)
  roles: HypeRole[];

  @BelongsToMany(() => HypeApplication, () => HypeApplicationPermissions)
  appPermission: HypeApplication[];
}
