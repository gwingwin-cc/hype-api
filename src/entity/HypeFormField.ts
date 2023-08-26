import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { BaseSlugEntity } from './BaseSlugEntity';
import { HypeForm } from './HypeForm';
import { HypeFormRelation } from './HypeFormRelation';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_form_fields',
})
export class HypeFormField extends BaseSlugEntity {
  @ForeignKey(() => HypeForm)
  @Column
  formId: number;
  @BelongsTo(() => HypeForm)
  form: HypeForm;
  @Column(DataType.STRING)
  fieldType: string;
  @Column(DataType.STRING)
  componentTemplate: string;
  @Column(DataType.BOOLEAN)
  isUnique: boolean;
  @Column(DataType.TEXT)
  options: string;
  @HasOne(() => HypeFormRelation)
  hasRelation: HypeFormRelation;
}
