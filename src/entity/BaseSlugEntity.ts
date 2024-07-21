import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  timestamps: true,
})
export class BaseSlugEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  @ApiProperty({ description: 'The id of the record' })
  id: number;

  @Column(DataType.STRING)
  @ApiProperty({ description: 'name of record' })
  name: string;

  @Column(DataType.STRING)
  @ApiProperty({ description: 'record unique code' })
  slug: string;

  @CreatedAt
  @ApiProperty({ description: 'created time (datetime) of record' })
  createdAt: Date;

  @UpdatedAt
  @ApiProperty({
    description: 'latest update time (datetime) of record',
    required: false,
  })
  updatedAt: Date;

  @DeletedAt
  @ApiProperty({
    description:
      'delete time (datetime) of record, if not null mean record was deleted',
    required: false,
  })
  deletedAt: Date;

  @Column
  @ApiProperty({ description: 'id of user that create this record' })
  createdBy: number;

  @Column
  @ApiProperty({
    description: 'id of user that latest update this record',
    required: false,
  })
  updatedBy: number;

  @Column
  @ApiProperty({
    description: 'id of user that latest delete this record',
    required: false,
  })
  deletedBy: number;
}
