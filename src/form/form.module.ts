import { Module } from '@nestjs/common';
// import {FormService} from "./form.service";
import { SequelizeModule } from '@nestjs/sequelize';
import {
  HypeForm,
  HypeFormField,
  HypeFormLayout,
  HypeFormPermissions,
  HypeFormRelation,
  Tags,
} from '../entity';
import { FormManageController } from './controllers/form-manage.controller';
import { HypeBaseForm } from '../entity/HypeBaseForm';
import { ScriptModule } from '../script/script.module';
import { BlobStorageModule } from '../blob-storage/blob-storage.module';
import { UserModule } from '../user/user.module';
import { FormRecordController } from './controllers/form-record.controller';
import { FormRecordService } from './providers/form-record.service';
import { TagsService } from './providers/tags.service';
import { FormService } from './providers/form.service';
import { FormLayoutController } from './controllers/form-layout.controller';
import { AuthModule } from '../auth/auth.module';
import { FormController } from './controllers/form.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      HypeForm,
      HypeFormField,
      HypeFormLayout,
      HypeFormRelation,
      HypeFormPermissions,
      HypeBaseForm,
      Tags,
    ]),
    ScriptModule,
    BlobStorageModule,
    UserModule,
    AuthModule,
  ],
  providers: [FormService, TagsService, FormRecordService],
  exports: [FormRecordService, FormService, TagsService],
  controllers: [
    FormController,
    FormManageController,
    FormRecordController,
    FormLayoutController,
  ],
})
export class FormModule {}
