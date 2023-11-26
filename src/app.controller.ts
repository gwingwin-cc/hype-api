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

@Controller()
export class AppController {
  constructor(
    private usersService: UserService,
    private formDataService: FormRecordService,
    private sequelize: Sequelize,
    private readonly formService: FormService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('user/noti')
  async getNotification(@Request() req): Promise<any> {
    let ring = false;
    const profileQuery = await this.sequelize.query(
      `
                SELECT *
                FROM zz_profile
                WHERE user_id = ${req.user.id}
                  AND deletedAt is null
                LIMIT 1
            `,
      {
        type: QueryTypes.SELECT,
      },
    );
    const profile = profileQuery[0];

    const notiList = await this.sequelize.query(
      `
                SELECT *
                FROM zz_notify
                WHERE user_id = ${req.user.id}
                ORDER BY createdAt DESC
                LIMIT 10
            `,
      {
        type: QueryTypes.SELECT,
      },
    );

    if (notiList.length > 0) {
      if (profile['latest_noti'] < notiList[0]['createdAt']) {
        await this.sequelize.query(
          `
                        UPDATE zz_profile
                        SET latest_noti = NOW()
                        WHERE user_id = ${req.user.id}
                    `,
          {
            type: QueryTypes.UPDATE,
          },
        );
        ring = true;
      }
    }

    return {
      ring,
      notiList,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/info')
  async Info(@Body() body, @Request() req) {
    const systemUser = await this.usersService.findOne({ id: req.user.id });
    const appSetting = await this.formDataService.findOne('app_setting', {});
    const profileForm = await this.formService.getFormOnly({
      slug: appSetting['main_profile'],
      state: FormRecordStateEnum.ACTIVE,
    });

    const profile = await this.formDataService.findOne(profileForm.slug, {
      where: { user_id: req.user.id },
    });

    if (systemUser == null || profile == null) {
      throw new HttpException('profile not found.', 404);
    }

    profile['avatarColor'] = 'light-primary';
    profile['email'] = systemUser.email;

    return { systemUser, profile, profileForm: profileForm };
  }

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
