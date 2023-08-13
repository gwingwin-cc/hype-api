import { BelongsTo, Column, DataType, Table } from 'sequelize-typescript';
import { BaseSlugEntity } from './BaseSlugEntity';
import { User } from './User';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'hype_scripts',
})
export class HypeScript extends BaseSlugEntity {
  @Column(DataType.TEXT('medium'))
  script: string;

  @Column(DataType.STRING)
  scriptType: string;

  @BelongsTo(() => User, 'createdBy')
  createdByUser: User;

  @BelongsTo(() => User, 'updatedBy')
  updatedByUser: User;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  tags?: string;

  @Column({
    type: DataType.ENUM('DRAFT', 'ACTIVE', 'CANCEL', 'OBSOLETE'),
    allowNull: false,
  })
  state: 'ACTIVE' | 'DRAFT' | 'OBSOLETE';
}
