import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { FormRecordService } from './form/providers/form-record.service';
import { FormService } from './form/providers/form.service';
import { FormRecordStateEnum } from './entity/HypeBaseForm';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Public - Main')
@Controller()
export class AppController {
  constructor(
    private usersService: UserService,
    private formDataService: FormRecordService,
    private sequelize: Sequelize,
    private readonly formService: FormService,
  ) {}

  @Get('app-info')
  async getAppInfo(): Promise<object> {
    let appSettingData = null;

    appSettingData = await this.formDataService.findOneById('app_setting', 1);

    return {
      appName: appSettingData?.app_name,
      organizeName: appSettingData?.organize_name,
      email: appSettingData?.email,
      appIcon: appSettingData?.app_icon ? appSettingData.app_icon[0].id : -1,
      loginTitle: appSettingData?.login_title,
      loginSubTitle: appSettingData?.login_sub_title,
      loginImage: appSettingData?.login_image
        ? appSettingData.login_image[0].id
        : -1,
    };
  }
}
