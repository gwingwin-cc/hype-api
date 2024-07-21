import {
  FormLayoutRequireCheckModeEnum,
  PermissionGrantType,
  PermissionGrantTypeEnum,
} from '../../entity';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormDto {}
export class UpdateFormDto {}
export class FormDto {}
class Permission {
  @ApiProperty({ description: 'id of the permission', example: 1 })
  id: number;

  @ApiProperty({ description: 'value of the permission', example: true })
  val: boolean;

  @ApiProperty({
    description: 'grant type of the permission',
    example: PermissionGrantTypeEnum.READ_ONLY_ALL,
  })
  grant: PermissionGrantType;
}
export class UpdaterFormPermissionDto {
  @ApiProperty({
    description: 'permission list to update',
    required: true,
    example: [
      {
        id: 1,
        val: true,
        grant: PermissionGrantTypeEnum.READ_ONLY_ALL,
      },
    ],
  })
  permissions: Array<{
    id: number;
    val: boolean;
    grant: PermissionGrantType;
  }>;
}

export class CreateFormRequest {
  @IsString()
  name: string;
  @IsString()
  slug: string;
}

export class AddFormFieldRequest {
  @IsString()
  name: string;
  @IsString()
  slug: string;
  @IsString()
  fieldType: string;
  @IsString()
  componentTemplate: string;
}

export class UpdateFormScriptRequest {
  @IsString()
  name: string;
  @IsString()
  desc: string;
  @IsString()
  scripts: string;
}

export class UpdateFormLayoutRequest {
  @IsString()
  layout: string;
  @IsString()
  @IsOptional()
  script?: string;
  @IsObject()
  @IsOptional()
  options?: object | any;
  @IsArray()
  @IsOptional()
  approval?: Array<any>;
  @IsBoolean()
  @IsOptional()
  enableDraftMode?: 0 | 1 | boolean;
  @IsString()
  @IsOptional()
  requireCheckMode: FormLayoutRequireCheckModeEnum;
}

export class UpdateFieldRequest {
  @IsString()
  name: string;
}

export class AddFormRelationRequest {
  @IsString()
  slug: string;
  @IsNumber()
  targetFormId: number;
  @IsString()
  connectFromField: string;
  @IsString()
  connectToField: string;
}

export class UpdateFormRequest {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  desc?: string;
}
