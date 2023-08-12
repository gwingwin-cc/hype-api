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
import { HypeForm } from './HypeForm';
import { HypeFormField } from './HypeFormField';

@Table({
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  tableName: 'hype_form_relations',
})
export class HypeFormRelation extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => HypeForm)
  @Column
  formId: number;

  @BelongsTo(() => HypeForm, 'formId')
  baseForm: HypeForm;

  @ForeignKey(() => HypeFormField)
  @Column
  referenceFieldId: number;

  @BelongsTo(() => HypeFormField)
  referenceField: HypeFormField;

  @ForeignKey(() => HypeForm)
  @Column
  targetFormId: number;

  @BelongsTo(() => HypeForm, 'targetFormId')
  targetForm: HypeForm;

  @CreatedAt
  createdAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column
  createdBy: number;

  @Column
  deletedBy: number;
}
