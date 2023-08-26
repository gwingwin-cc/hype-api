import { Test, TestingModule } from '@nestjs/testing';
import { FormRecordService } from './form-record.service';

describe('FormRecordService', () => {
  let service: FormRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormRecordService],
    }).compile();

    service = module.get<FormRecordService>(FormRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
