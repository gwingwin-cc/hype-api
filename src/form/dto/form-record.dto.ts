import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FormRecordEnvType,
  FormRecordStateType,
} from '../../entity/HypeBaseForm';

export class CreateFormRecordDto {
  data: any;
  recordState: FormRecordStateType;
  recordType: FormRecordEnvType;
}
export class UpdateFormRecordRequest {
  data: any;
  recordState: FormRecordStateType;
}
export class FormRecordDto {}

export class FormRecordListQuery {
  @IsNumber()
  @Type(() => Number)
  perPage: number;

  @IsNumber()
  @Type(() => Number)
  page: number;

  @IsString()
  @IsOptional()
  recordType?: FormRecordEnvType;
  @IsString()
  format: string;

  [key: string]: any;
}
