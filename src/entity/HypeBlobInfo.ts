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
import { HypeBlobStorage } from './HypeBlobStorage';

@Table({
  tableName: 'hype_blob_info',
  timestamps: true,
  updatedAt: false,
})
export class HypeBlobInfo extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column(DataType.STRING)
  filename: string;

  @Column(DataType.INTEGER)
  size: number;

  @Column(DataType.STRING)
  mimetype: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'storage_type',
  })
  storageType: string;

  @Column(DataType.STRING)
  meta: string;

  @ForeignKey(() => HypeBlobStorage)
  @Column
  blobId: number;

  @BelongsTo(() => HypeBlobStorage)
  blob: HypeBlobStorage;

  @CreatedAt
  createdAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column
  createdBy: number;

  @Column
  deletedBy: number;
}
