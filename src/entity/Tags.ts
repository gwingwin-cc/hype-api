import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'tags',
})
export class Tags extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column(DataType.STRING)
  name: string;
}
