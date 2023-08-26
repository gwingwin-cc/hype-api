import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseSlugEntity } from './BaseSlugEntity';
import { User } from './User';
import { BaseEntity } from './BaseEntity';
import { HypeFormRelation } from './HypeFormRelation';
import { HypeFormPermissions } from './HypeFormPermission';
import { HypeFormField } from './HypeFormField';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_forms',
})
export class HypeForm extends BaseSlugEntity {
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  desc?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  tags?: string;

  @Column({
    defaultValue: 'ACTIVE',
    type: DataType.ENUM('ACTIVE', 'DRAFT', 'CANCEL', 'OBSOLETE'),
  })
  state: 'ACTIVE' | 'CANCEL' | 'OBSOLETE' | string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  scripts?: object;

  @HasMany(() => HypeFormField)
  fields: HypeFormField[];

  @HasMany(() => HypeFormLayout)
  layouts: HypeFormLayout[];

  @HasMany(() => HypeFormRelation, 'formId')
  relations: HypeFormRelation[];

  @HasMany(() => HypeFormRelation, 'targetFormId')
  childRelations: HypeFormRelation[];

  @BelongsToMany(() => HypeForm, () => HypeFormRelation, 'formId')
  parentForms: HypeForm[];

  @BelongsToMany(() => HypeForm, () => HypeFormRelation, 'targetFormId')
  childForms: HypeForm[];

  @HasMany(() => HypeFormPermissions)
  permissions: HypeFormPermissions[];

  @BelongsTo(() => User, 'createdBy')
  createdByUser: User;

  @BelongsTo(() => User, 'updatedBy')
  updatedByUser: User;
}

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_form_layouts',
})
export class HypeFormLayout extends BaseEntity {
  @ForeignKey(() => HypeForm)
  @Column
  formId: number;

  @BelongsTo(() => HypeForm)
  form: HypeForm;

  @Column(DataType.TEXT('medium'))
  layout: string;

  @Column(DataType.ENUM('DRAFT', 'ACTIVE', 'CANCEL', 'OBSOLETE'))
  state: 'DRAFT' | 'ACTIVE' | 'CANCEL' | 'OBSOLETE';

  @Column(DataType.BOOLEAN)
  enableDraftMode: boolean;

  @Column(DataType.ENUM('ALWAYS', 'BEFORE_ACTIVE', 'BEFORE_ACTIVELOCK'))
  requireCheckMode: 'ALWAYS';

  @Column(DataType.INTEGER)
  iconBlobId: number;

  @Column(DataType.JSON)
  script: object;

  @Column(DataType.JSON)
  approval: object;

  @Column(DataType.JSON)
  options: object;

  @ForeignKey(() => User)
  @Column
  createdBy: number;
}
