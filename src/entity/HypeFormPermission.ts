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

@Table({
  timestamps: true,
  paranoid: true,
  updatedAt: false,
  tableName: 'hype_form_permissions',
})
export class HypeFormPermissions extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => HypeForm)
  @Column
  formId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  grant: PermissionGrantType;

  @BelongsTo(() => HypeForm, 'formId')
  baseForm: HypeForm;

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

export type PermissionGrantType =
  | 'ACCESS_FORM'
  | 'CREATE'
  | 'READ_EDIT'
  | 'READ_EDIT_DELETE'
  | 'READ_ONLY_ALL'
  | 'READ_EDIT_ALL'
  | 'READ_EDIT_DELETE_ALL'
  | 'CUSTOM';

export enum PermissionGrantTypeEnum {
  ACCESS_FORM = 'ACCESS_FORM',
  CREATE = 'CREATE',
  READ_EDIT = 'READ_EDIT',
  READ_EDIT_DELETE = 'READ_EDIT_DELETE',
  READ_ONLY_ALL = 'READ_ONLY_ALL',
  READ_EDIT_ALL = 'READ_EDIT_ALL',
  READ_EDIT_DELETE_ALL = 'READ_EDIT_DELETE_ALL',
  CUSTOM = 'CUSTOM',
}
