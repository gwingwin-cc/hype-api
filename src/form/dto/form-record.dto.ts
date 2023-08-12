export enum FORM_RECORD_STATE {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
}

export enum FORM_RECORD_TYPE {
  DEV = 'DEV',
  PROD = 'PROD',
}

export class CreateFormRecordDto {
  data: any;
  recordState: FORM_RECORD_STATE;
  recordType: FORM_RECORD_TYPE;
}
export class UpdateFormRecordDto {
  data: any;
  recordState: FORM_RECORD_STATE;
}
export class FormRecordDto {}
