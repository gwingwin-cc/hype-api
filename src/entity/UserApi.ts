import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'user_apis',
})
export class UserApi extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @Column({
    defaultValue: 'active',
    type: DataType.STRING,
  })
  status: string;

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

  @BelongsTo(() => User, 'userId')
  user: User;
}
