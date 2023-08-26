import { BaseEntity } from './BaseEntity';
import { Column, DataType, Table } from 'sequelize-typescript';

type enums = 'DRAFT' | 'ACTIVE' | 'ACTIVE_LOCK' | 'CANCEL' | 'ARCHIVED';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_base_form',
})
export class HypeBaseForm extends BaseEntity {
  @Column(DataType.ENUM('DRAFT', 'ACTIVE', 'ACTIVE_LOCK', 'CANCEL', 'ARCHIVED'))
  recordState: enums;

  @Column(DataType.STRING)
  errors: string;

  [key: string]: any;
}
