import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getAppInfo(): Promise<any> {
    // const data = await this.formDataService.findOneByID('app_setting', 1);
    // const app = data[0];
    // return {
    //   appName: app?.appname,
    //   organizeName: app?.organizename,
    //   email: app?.email,
    //   appIcon: app?.appicon[0].id,
    //   loginTitle: app?.login_title,
    //   loginSubTitle: app?.login_sub_title,
    //   loginImage: app?.login_image[0].id,
    // };
  }
}
