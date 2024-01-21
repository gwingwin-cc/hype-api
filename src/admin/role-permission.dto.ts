import { IsArray, IsString } from 'class-validator';

export class AdminCreatePermissionRequest {
  @IsString()
  name: string;
  @IsString()
  slug: string;
}
export class AdminCreateRoleRequest {
  @IsString()
  name: string;
  @IsString()
  slug: string;
}

export class AdminAssignUserRoleRequest {
  @IsArray()
  roles: Array<{
    id: number;
    val: boolean;
  }>;
}
