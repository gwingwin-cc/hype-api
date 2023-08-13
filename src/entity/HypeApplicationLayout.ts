import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './BaseEntity';
import { HypeApplication } from './HypeApplication';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_application_layouts',
})
export class HypeApplicationLayout extends BaseEntity {
  @ForeignKey(() => HypeApplication)
  @Column
  applicationId: number;

  @BelongsTo(() => HypeApplication, 'applicationId')
  app: HypeApplication;

  @Column(DataType.TEXT('medium'))
  layout: string;

  @Column(DataType.ENUM('DRAFT', 'ACTIVE', 'CANCEL', 'OBSOLETE'))
  state: string;

  @Column(DataType.JSON)
  scripts: object;
}
