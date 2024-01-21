import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FormRecordEnvType,
  FormRecordStateType,
} from '../../entity/HypeBaseForm';

export class CreateFormRecordDto {
  data: any;
  @IsOptional()
  recordState?: FormRecordStateType;
  @IsOptional()
  recordType?: FormRecordEnvType;
}
export class UpdateFormRecordRequest {
  data: any;
  recordState: FormRecordStateType;
}
export class FormRecordDto {}

export class FormRecordListQuery {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  perPage?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsString()
  @IsOptional()
  recordType?: FormRecordEnvType;

  @IsString()
  @IsOptional()
  format?: string;

  [key: string]: any;
}
