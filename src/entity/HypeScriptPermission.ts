import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './User';
import { HypePermission } from './HypeRole';
import { HypeForm } from './HypeForm';
import { HypeScript } from './HypeScript';

@Table({
  timestamps: true,
  paranoid: true,
  updatedAt: false,
  tableName: 'hype_script_permissions',
})
export class HypeScriptPermissions extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => HypeScript)
  @Column
  scriptId: number;

  @BelongsTo(() => HypeScript, 'scriptId')
  script: HypeForm;

  @ForeignKey(() => HypePermission)
  @Column
  permissionId: number;

  @BelongsTo(() => HypePermission)
  permission: HypePermission;

  @CreatedAt
  createdAt: Date;

  @DeletedAt
  deletedAt: Date;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @Column
  deletedBy: number;
}
