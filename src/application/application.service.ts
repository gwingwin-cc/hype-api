import { HttpException, Injectable } from '@nestjs/common';
import {
  HypeApplication,
  HypeApplicationLayout,
  HypeApplicationPermissions,
  HypePermission,
  User,
} from '../entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(HypeApplication)
    private hypeAppModel: typeof HypeApplication,
    @InjectModel(HypeApplicationPermissions)
    private hypeAppPermissionModel: typeof HypeApplicationPermissions,
    @InjectModel(HypeApplicationLayout)
    private hypeAppLayoutModel: typeof HypeApplicationLayout,
  ) {}

  async createApp(
    byUser: User,
    body: {
      appType: 'COMPONENT' | 'APP';
      slug: string;
      name: string;
    },
  ) {
    const slug = body.slug.toLowerCase();
    const existApp = await this.hypeAppModel.findOne({
      where: {
        slug: slug,
      },
    });
    if (existApp != null) {
      throw new HttpException('App slug already exist', 500);
    }

    const app = await this.hypeAppModel.create({
      slug: slug,
      name: body.name,
      createdBy: byUser.id,
      appType: body.appType,
    });

    await this.hypeAppLayoutModel.create({
      state: 'DRAFT',
      createdBy: byUser.id,
      layout: '[]',
      applicationId: app.id,
    });

    return app;
  }

  /**
   *
   * @param id
   * @param slug
   * @param state 'ACTIVE' | 'DRAFT'
   */
  async getApp({ id = null, slug = null, state }) {
    const optExtra: { id?; slug? } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }

    // (await this.hypeAppPermissionModel.findOne()).updatedAt;
    return this.hypeAppModel.findOne({
      where: {
        ...optExtra,
        deletedAt: null,
      },
      include: [
        HypePermission,
        {
          model: HypeApplicationLayout,
          where: { state: state },
        },
      ],
    });
  }

  async getAppDatalist({ where }) {
    const opWhere = {};
    if (where.name != null) {
      opWhere['name'] = {
        [Op.like]: where.name,
      };
    }
    if (where.id) {
      opWhere['id'] = where.id;
    }
    const [data, total] = await Promise.all([
      this.hypeAppModel.findAll({
        where: opWhere,
        include: [{ model: User, as: 'createdByUser' }, HypePermission],
      }),
      this.hypeAppModel.count({
        where: opWhere,
      }),
    ]);
    return {
      data: data,
      total: total,
    };
  }

  async updateLayout(
    byUser,
    id: number,
    data: {
      layout?: string;
      approval?: Array<any>;
      scripts?: object;
    },
  ) {
    await this.hypeAppLayoutModel.update(
      {
        updatedAt: new Date(),
        updatedBy: byUser.id,
        layout: data.layout,
        scripts: data.scripts,
      },
      {
        where: {
          id,
        },
      },
    );
  }

  async publishLayout(byUser, { id }) {
    const layout = await this.hypeAppLayoutModel.findByPk(id);
    await this.hypeAppLayoutModel.update(
      {
        updatedAt: new Date(),
        updatedBy: byUser.id,
        state: 'OBSOLETE',
      },
      {
        where: {
          applicationId: layout.applicationId,
          state: 'ACTIVE',
        },
      },
    );
    await this.hypeAppLayoutModel.create({
      state: 'ACTIVE',
      createdBy: byUser.id,
      layout: layout.layout,
      applicationId: layout.applicationId,
      scripts: layout.scripts,
    });
  }

  async updatePermission(
    byUser: User,
    body: { appId: number; permissions: Array<any> },
  ) {
    const forAdd = [];
    const forRemove = [];
    const existPermission = await this.hypeAppPermissionModel.findAll({
      where: {
        applicationId: body.appId,
        deletedAt: null,
      },
    });
    const permissionToApply = body.permissions;
    for (const pa of permissionToApply.filter((p) => p.val === true)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) == null) {
        forAdd.push({
          permissionId: pa.id,
          createdBy: byUser.id,
          applicationId: body.appId,
        });
      }
    }

    for (const pa of permissionToApply.filter((p) => p.val === false)) {
      if (existPermission.find((rp) => rp.permissionId == pa.id) != null) {
        forRemove.push(pa.id);
      }
    }

    const removed = await this.hypeAppPermissionModel.update(
      {
        deletedAt: new Date(),
        deletedBy: byUser.id,
      },
      {
        where: {
          permissionId: forRemove,
          applicationId: body.appId,
        },
      },
    );

    const added = await this.hypeAppPermissionModel.bulkCreate(forAdd);
    return { added, removed };
  }

  async deleteApp(byUser: User, id: number) {
    return await this.hypeAppModel.update(
      {
        deletedAt: new Date(),
        deletedBy: byUser.id,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async updateApp(byUser, id, data) {
    return await this.hypeAppModel.update(
      {
        updatedAt: new Date(),
        updatedBy: byUser.id,
        ...data,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async cloneApp(appId, slug, name, user) {
    slug = slug.toLowerCase();
    let cloneApp = null;
    cloneApp = await this.hypeAppModel.findOne({
      where: { id: appId },
      raw: true,
    });

    delete cloneApp.id;
    delete cloneApp.createdAt;
    delete cloneApp.updatedAt;
    delete cloneApp.updatedBy;
    delete cloneApp.deletedAt;
    delete cloneApp.deletedBy;

    cloneApp.createdBy = user.id;
    cloneApp.slug = slug;
    cloneApp.name = name;
    const app = await this.hypeAppModel.create(cloneApp);
    let cloneLayout = null;
    cloneLayout = await this.hypeAppLayoutModel.findAll({
      where: {
        applicationId: appId,
        deletedAt: null,
      },
      raw: true,
    });
    let findLayout = cloneLayout.find((item) => item.state == 'ACTIVE');
    if (!findLayout) {
      findLayout = cloneLayout.find((item) => item.state == 'DRAFT');
    }
    delete findLayout.id;
    delete findLayout.createdAt;
    delete findLayout.updatedAt;
    delete findLayout.updatedBy;
    delete findLayout.deletedAt;
    delete findLayout.deletedBy;

    findLayout.applicationId = app.id;
    findLayout.state = 'DRAFT';
    findLayout.createdBy = user.id;
    await this.hypeAppLayoutModel.create(findLayout);
    return app;
  }
}
