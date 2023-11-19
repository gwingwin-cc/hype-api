import { Controller, Get } from '@nestjs/common';
import { UserService } from './user/user.service';
import { FormRecordService } from './form/providers/form-record.service';
import { FormService } from './form/providers/form.service';
import { FormLayoutStateEnum, User } from './entity';
import { FormRecordEnvEnum, FormRecordStateEnum } from './entity/HypeBaseForm';
@Controller()
export class InternalController {
  constructor(
    private usersService: UserService,
    private formDataService: FormRecordService,
    private readonly formService: FormService,
  ) {}

  @Get('internal/initial')
  async login(): Promise<void> {
    await this.formService.createForm({ id: 1 } as User, {
      slug: 'app_setting',
      name: 'App Setting',
    });
    await this.formService.createForm({ id: 1 } as User, {
      slug: 'profile',
      name: 'Profile',
    });

    await this.formService.createForm({ id: 1 } as User, {
      slug: 'notify',
      name: 'notify',
    });

    console.log('try create app setting');
    const profileForm = await this.formService.getForm({
      slug: 'profile',
      layoutState: FormLayoutStateEnum.DRAFT,
      excludeDeleteField: true,
    });

    console.log('try create app setting');
    const settingForm = await this.formService.getForm({
      slug: 'app_setting',
      layoutState: FormLayoutStateEnum.DRAFT,
      excludeDeleteField: true,
    });

    const notifyForm = await this.formService.getForm({
      slug: 'notify',
      layoutState: FormLayoutStateEnum.DRAFT,
      excludeDeleteField: true,
    });
    const user = await this.usersService.findOne({ id: 1 });
    await this.formService.addFormField(
      user,
      settingForm.id,
      'string',
      'text-input',
      'app_name',
      'App Name',
    );
    await this.formService.addFormField(
      user,
      settingForm.id,
      'json',
      'file-input',
      'app_icon',
      'App Icon',
    );

    await this.formService.addFormField(
      user,
      settingForm.id,
      'string',
      'text-input',
      'login_title',
      'Login title',
    );

    await this.formService.addFormField(
      user,
      settingForm.id,
      'string',
      'text-input',
      'login_sub_title',
      'Login sub title',
    );

    await this.formService.addFormField(
      user,
      settingForm.id,
      'json',
      'file-input',
      'login_image',
      'Login Image',
    );
    await this.formService.addFormField(
      user,
      settingForm.id,
      'string',
      'text-input',
      'organize_name',
      'Organize Name',
    );
    await this.formService.addFormField(
      user,
      settingForm.id,
      'string',
      'text-input',
      'main_profile',
      'Form main profile',
    );
    await this.formService.addFormField(
      user,
      profileForm.id,
      'int',
      'user-list',
      'user_id',
      'User ID',
    );
    await this.formService.addFormField(
      user,
      profileForm.id,
      'datetime',
      'datetime',
      'latest_noti',
      'latest_noti',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'int',
      'user-list',
      'user_id',
      'User ID',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'title',
      'Title',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'subtitle',
      'Sub Title',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'color',
      'Color',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'img_url',
      'Image URL',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'action_url',
      'Action Url',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'string',
      'text-input',
      'action_type',
      'Action Type',
    );

    await this.formService.addFormField(
      user,
      notifyForm.id,
      'datetime',
      'DATETIME',
      'read_at',
      'Read At',
    );

    await this.formService.updateLayout(user, profileForm.layouts[0].id, {
      requireCheckMode: 'ALWAYS',
      script: '{}',
      approval: [],
      enableDraftMode: 0,
      layout: JSON.stringify([
        {
          id: 'container_1669699561137',
          type: 'container',
          children: ['row_1669699562154'],
        },
        {
          id: 'row_1669699562154',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: ['col_1669699562946', 'col_1669699563393'],
        },
        {
          id: 'col_1669699562946',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699571163'],
        },
        {
          id: 'col_1669699563393',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699583942'],
        },
        {
          id: 'input_1669699571163',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'User ID',
            component: {
              slug: 'user_id',
              value: 8,
              layoutType: 'input',
              type: 'user-list',
              label: 'User ID-user_id (user-list)',
            },
            options: { type: 'single' },
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'user_id', type: 'user-list', id: 8 },
        },
        {
          id: 'input_1669699583942',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: '',
            component: {
              slug: 'latest_noti',
              value: 9,
              layoutType: 'input',
              type: 'datetime',
              label: 'latest_noti-latest_noti (datetime)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: true,
            activeCode: '1 != 1',
          },
          children: [],
          component: { slug: 'latest_noti', type: 'datetime', id: 9 },
        },
      ]),
    });

    await this.formService.updateLayout(user, notifyForm.layouts[0].id, {
      requireCheckMode: 'ALWAYS',
      script: {},
      approval: [],
      enableDraftMode: 0,
      layout: JSON.stringify([
        {
          id: 'container_1669699645553',
          type: 'container',
          children: ['row_1669699646801'],
        },
        {
          id: 'row_1669699646801',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: [
            'col_1669699648537',
            'col_1669699649826',
            'col_1669699649977',
            'col_1669699650145',
            'col_1669699650321',
            'col_1669699650489',
            'col_1669699650666',
          ],
        },
        {
          id: 'col_1669699648537',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699658730'],
        },
        {
          id: 'col_1669699649826',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699691186'],
        },
        {
          id: 'col_1669699649977',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699664979'],
        },
        {
          id: 'col_1669699650145',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: [],
        },
        {
          id: 'col_1669699650321',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669699675610'],
        },
        {
          id: 'col_1669699650489',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: [],
        },
        {
          id: 'col_1669699650666',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: [],
        },
        {
          id: 'input_1669699658730',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'User ID',
            component: {
              slug: 'user_id',
              value: 10,
              layoutType: 'input',
              type: 'user-list',
              label: 'User ID-user_id (user-list)',
            },
            options: { type: 'single' },
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'user_id', type: 'user-list', id: 10 },
        },
        {
          id: 'input_1669699664979',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Title',
            component: {
              slug: 'title',
              value: 11,
              layoutType: 'input',
              type: 'text-input',
              label: 'Title-title (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'title', type: 'text-input', id: 11 },
        },
        {
          id: 'input_1669699675610',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Sub title',
            component: {
              slug: 'subtitle',
              value: 12,
              layoutType: 'input',
              type: 'text-input',
              label: 'Sub Title-subtitle (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'subtitle', type: 'text-input', id: 12 },
        },
        {
          id: 'input_1669699691186',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: '',
            component: {
              slug: 'action_url',
              value: 15,
              layoutType: 'input',
              type: 'text-input',
              label: 'Action Type-action_url (text-input)',
            },
            options: { readonly: false },
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'action_url', type: 'text-input', id: 15 },
        },
      ]),
    });
    await this.formService.updateLayout(user, settingForm.layouts[0].id, {
      requireCheckMode: 'ALWAYS',
      script: '{}',
      approval: [],
      enableDraftMode: 0,
      layout: JSON.stringify([
        {
          id: 'container_1669696156446',
          type: 'container',
          children: [
            'row_1669696157505',
            'row_1669696160592',
            'row_1669696161521',
            'row_1669696261210',
          ],
        },
        {
          id: 'row_1669696157505',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: ['col_1669696162337'],
        },
        {
          id: 'row_1669696160592',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: ['col_1669696162849'],
        },
        {
          id: 'row_1669696161521',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: [
            'col_1669696163314',
            'col_1669696203410',
            'col_1669696204714',
            'col_1669696205794',
            'col_1669696206290',
          ],
        },
        {
          id: 'col_1669696162337',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696173363'],
        },
        {
          id: 'col_1669696162849',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696188507'],
        },
        {
          id: 'col_1669696163314',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['decorator_1669696201960'],
        },
        {
          id: 'input_1669696173363',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'App Name',
            component: {
              slug: 'app_name',
              value: 1,
              layoutType: 'input',
              type: 'text-input',
              label: 'App Name-app_name (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'app_name', type: 'text-input', id: 1 },
        },
        {
          id: 'input_1669696188507',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Project Icon',
            component: {
              slug: 'app_icon',
              value: 2,
              layoutType: 'input',
              type: 'file-input',
              label: 'App Icon-app_icon (file-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'app_icon', type: 'file-input', id: 2 },
        },
        {
          id: 'decorator_1669696201960',
          type: 'decorator',
          config: {
            sm: 6,
            lg: 6,
            label: 'Login Page',
            component: {
              layoutType: 'decorator',
              type: 'label',
              slug: '',
              value: 'label',
              label: 'Label',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: '', type: 'label', id: 'label' },
        },
        {
          id: 'col_1669696203410',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: [],
        },
        {
          id: 'col_1669696204714',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696219052'],
        },
        {
          id: 'col_1669696205794',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696253618'],
        },
        {
          id: 'col_1669696206290',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696226858'],
        },
        {
          id: 'input_1669696219052',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Title',
            component: {
              slug: 'login_title',
              value: 3,
              layoutType: 'input',
              type: 'text-input',
              label: 'Login title-login_title (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'login_title', type: 'text-input', id: 3 },
        },
        {
          id: 'input_1669696226858',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Sub Title',
            component: {
              slug: 'login_sub_title',
              value: 4,
              layoutType: 'input',
              type: 'text-input',
              label: 'Login sub title-login_sub_title (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'login_sub_title', type: 'text-input', id: 4 },
        },
        {
          id: 'input_1669696253618',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Page Image',
            component: {
              slug: 'login_image',
              value: 5,
              layoutType: 'input',
              type: 'file-input',
              label: 'Login Image-login_image (file-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'login_image', type: 'file-input', id: 5 },
        },
        {
          id: 'row_1669696261210',
          type: 'row',
          config: { lg: 6, sm: 6 },
          children: ['col_1669696262514', 'col_1669696264002'],
        },
        {
          id: 'col_1669696262514',
          type: 'col',
          config: {
            sm: '12',
            lg: '12',
            component: null,
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: ['decorator_1669696290658'],
        },
        {
          id: 'col_1669696264002',
          type: 'col',
          config: { lg: 6, sm: 6 },
          children: ['input_1669696310388'],
        },
        {
          id: 'decorator_1669696290658',
          type: 'decorator',
          config: {
            sm: '12',
            lg: '12',
            label: 'System',
            component: {
              layoutType: 'decorator',
              type: 'label',
              slug: '',
              value: 'label',
              label: 'Label',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: '', type: 'label', id: 'label' },
        },
        {
          id: 'input_1669696310388',
          type: 'input',
          config: {
            sm: 6,
            lg: 6,
            label: 'Profile form slug',
            component: {
              slug: 'main_profile',
              value: 7,
              layoutType: 'input',
              type: 'text-input',
              label: 'Form main profile-main_profile (text-input)',
            },
            options: {},
            ShowInput: '',
            id: '',
            enableActiveCode: false,
          },
          children: [],
          component: { slug: 'main_profile', type: 'text-input', id: 7 },
        },
      ]),
    });
    await this.formService.publishLayout(user, {
      id: settingForm.layouts[0].id,
    });
    await this.formService.publishLayout(user, {
      id: notifyForm.layouts[0].id,
    });
    await this.formService.publishLayout(user, {
      id: profileForm.layouts[0].id,
    });

    await this.formDataService.createRecord(
      user,
      settingForm.id,
      {
        app_name: 'New Hype',
        organize_name: 'Hype SDK',
        main_profile: 'profile',
      },
      FormRecordStateEnum.ACTIVE,
      FormRecordEnvEnum.PROD,
    );
    await this.formDataService.createRecord(
      user,
      profileForm.id,
      {
        user_id: '1',
      },
      FormRecordStateEnum.ACTIVE,
      FormRecordEnvEnum.PROD,
    );
  }
}
