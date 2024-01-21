import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { BaseEntity } from './BaseEntity';
import { HypeRole } from './HypeRole';

// import { AccessToken, AccessTokenPermission } from './AccessToken';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'users',
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  username: string;

  @Column(DataType.TEXT)
  passwordHash: string;

  @Column({
    defaultValue: 'active',
    type: DataType.STRING,
  })
  status: UserStatusType;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column
  createdBy: number;

  @Column
  updatedBy: number;

  @Column
  deletedBy: number;

  @BelongsToMany(() => HypeRole, () => UserRoles)
  userRoles: HypeRole[];
}

export type UserStatusType = keyof typeof UserStatusEnum;
export enum UserStatusEnum {
  active = 'active',
  inactive = 'inactive',
  deleted = 'deleted',
}

@Table({
  timestamps: true,
  tableName: 'hype_user_roles',
})
export class UserRoles extends BaseEntity {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => HypeRole)
  @Column
  roleId: number;
}
