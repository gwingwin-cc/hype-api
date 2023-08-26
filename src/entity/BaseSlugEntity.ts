import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  timestamps: true,
})
export class BaseSlugEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  slug: string;

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
}
