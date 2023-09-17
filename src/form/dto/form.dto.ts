export class CreateFormDto {}
export class UpdateFormDto {}
export class FormDto {}

export class UpdaterFormPermissionDto {
  permissions: Array<{
    id: number;
    val: boolean;
    grant?: 'READ_ONLY' | 'EDITOR';
  }>;
}
