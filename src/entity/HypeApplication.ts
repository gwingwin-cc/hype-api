import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { BaseSlugEntity } from './BaseSlugEntity';
import { HypePermission } from './HypeRole';
import { HypeBlobInfo } from './HypeBlobInfo';
import { HypeApplicationLayout } from './HypeApplicationLayout';
import { User } from './User';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_applications',
})
export class HypeApplication extends BaseSlugEntity {
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  desc?: string;

  @Column({
    type: DataType.ENUM('APP', 'COMPONENT'),
  })
  appType: AppType;

  @Column(DataType.INTEGER)
  iconBlobId: number;

  @BelongsTo(() => HypeBlobInfo, 'iconBlobId')
  icon: HypeBlobInfo;

  @BelongsToMany(() => HypePermission, () => HypeApplicationPermissions)
  permissions: HypePermission[];

  @HasMany(() => HypeApplicationLayout)
  layouts: HypeApplicationLayout;

  @BelongsTo(() => User, 'createdBy')
  createdByUser: User;

  @BelongsTo(() => User, 'updatedBy')
  updatedByUser: User;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  tags?: string;
}
export type AppType = keyof typeof AppTypeEnum;
export enum AppTypeEnum {
  APP = 'APP',
  COMPONENT = 'COMPONENT',
}

@Table({
  tableName: 'hype_application_permissions',
  timestamps: true,
  paranoid: true,
  updatedAt: false,
})
export class HypeApplicationPermissions extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => HypeApplication)
  @Column
  applicationId: number;

  @BelongsTo(() => HypeApplication, 'applicationId')
  app: HypeApplication;

  @ForeignKey(() => HypePermission)
  @Column
  permissionId: number;

  @BelongsTo(() => HypePermission, 'permissionId')
  permission: HypePermission;

  @Column
  createdAt: Date;

  @Column
  deletedAt: Date;

  @Column
  createdBy: number;

  @Column
  deletedBy: number;
}
