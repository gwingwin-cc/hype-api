import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { HypeBlobInfo } from './HypeBlobInfo';

@Table({
  tableName: 'hype_blob_storage',
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  deletedAt: false,
})
export class HypeBlobStorage extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @HasOne(() => HypeBlobInfo)
  info: HypeBlobInfo;

  @Column(DataType.BLOB('long'))
  bytes: Buffer;
}
