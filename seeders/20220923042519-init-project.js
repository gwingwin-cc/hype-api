'use strict';
const { hash } = require('argon2');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await hash('Admin@hype');
    await queryInterface.bulkInsert(
      'users',
      [
        {
          username: 'admin',
          email: 'admin@hypesdk.com',
          passwordHash: passwordHash,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert('hype_roles', [
      {
        id: 1,
        name: 'Administrator',
        slug: 'admin',
        createdBy: 1,
        roleType: 'core',
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Developer',
        slug: 'developer',
        createdBy: 1,
        roleType: 'core',
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Manager',
        slug: 'manager',
        createdBy: 1,
        roleType: 'core',
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Users',
        slug: 'user',
        createdBy: 1,
        roleType: 'core',
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert(
      'hype_permissions',
      [
        {
          id: 1,
          name: 'Administrator Access',
          slug: 'administrator',
          createdBy: 1,
          permissionType: 'core',
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Permission Management',
          slug: 'permission_management',
          createdBy: 1,
          permissionType: 'core',
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'User Management',
          slug: 'user_management',
          createdBy: 1,
          permissionType: 'core',
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Role Management',
          slug: 'role_management',
          createdBy: 1,
          permissionType: 'core',
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Form Management',
          slug: 'form_management',
          createdBy: 1,
          permissionType: 'core',
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'API Management',
          slug: 'api_management',
          permissionType: 'core',
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: 'Public External User',
          slug: 'public_user',
          permissionType: 'core',
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'hype_role_permissions',
      [
        {
          roleId: 1,
          permissionId: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 2,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 5,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 6,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 2,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 4,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'hype_user_roles',
      [
        {
          roleId: 1,
          userId: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'hype_applications',
      [
        {
          name: 'main',
          slug: 'main',
          appType: 'APP',
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'hype_application_layouts',
      [
        {
          applicationId: 1,
          state: 'DRAFT',
          layout: JSON.stringify([
            {
              id: 'container_1669696377467',
              type: 'container',
              children: ['row_1669696378428'],
            },
            {
              id: 'row_1669696378428',
              type: 'row',
              config: { lg: 6, sm: 6 },
              children: ['col_1669696379698'],
            },
            {
              id: 'col_1669696379698',
              type: 'col',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                options: {},
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: ['decorator_1669696398043', 'utility_1669696467734'],
            },
            {
              id: 'decorator_1669696398043',
              type: 'decorator',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                label: 'Get Started - ',
                component: {
                  layoutType: 'decorator',
                  type: 'label',
                  slug: '',
                  value: 'label',
                  label: 'Label',
                },
                options: { labelVariant: { label: 'H1', value: 'h1' } },
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: [],
              component: { slug: '', type: 'label', id: 'label' },
            },
            {
              id: 'utility_1669696467734',
              type: 'utility',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                label: 'Get Started',
                component: {
                  layoutType: 'utility',
                  type: 'custom-html',
                  slug: '',
                  value: 'custom-html',
                  label: 'Html',
                },
                options: {
                  html: "<h1><a href='https://www.hypesdk.com/docs/project-setting'> Please visit our document site</h1>",
                },
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: [],
              component: { slug: '', type: 'custom-html', id: 'custom-html' },
            },
          ]),
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          applicationId: 1,
          state: 'ACTIVE',
          layout: JSON.stringify([
            {
              id: 'container_1669696377467',
              type: 'container',
              children: ['row_1669696378428'],
            },
            {
              id: 'row_1669696378428',
              type: 'row',
              config: { lg: 6, sm: 6 },
              children: ['col_1669696379698'],
            },
            {
              id: 'col_1669696379698',
              type: 'col',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                options: {},
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: ['decorator_1669696398043', 'utility_1669696467734'],
            },
            {
              id: 'decorator_1669696398043',
              type: 'decorator',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                label: 'Get Started - ',
                component: {
                  layoutType: 'decorator',
                  type: 'label',
                  slug: '',
                  value: 'label',
                  label: 'Label',
                },
                options: { labelVariant: { label: 'H1', value: 'h1' } },
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: [],
              component: { slug: '', type: 'label', id: 'label' },
            },
            {
              id: 'utility_1669696467734',
              type: 'utility',
              config: {
                isCard: false,
                style: '',
                classname: '',
                sm: '12',
                lg: '12',
                label: 'Get Started',
                component: {
                  layoutType: 'utility',
                  type: 'custom-html',
                  slug: '',
                  value: 'custom-html',
                  label: 'Html',
                },
                options: {
                  html: "<h1><a href='https://www.hypesdk.com/docs/project-setting'> Please visit our document site</h1>",
                },
                ShowInput: '',
                slug: '',
                customComponent: null,
              },
              children: [],
              component: { slug: '', type: 'custom-html', id: 'custom-html' },
            },
          ]),
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('hype_user_roles', null, {});
    await queryInterface.bulkDelete('hype_role_permissions', null, {});
    await queryInterface.bulkDelete('hype_permissions', null, {});
    await queryInterface.bulkDelete('hype_roles', null, {});
    await queryInterface.bulkDelete('hype_applications', null, {});
    await queryInterface.bulkDelete('hype_application_layouts', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
