import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HypeScript, User } from '../entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class ScriptService {
  constructor(
    @InjectModel(HypeScript)
    private scriptModel: typeof HypeScript,
    private sequelize: Sequelize,
  ) {}

  async getScript({
    id = null,
    slug = null,
  }): Promise<Partial<HypeScript> & { permissions: any[] }> {
    const optExtra: { id?: number; slug?: string } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }

    const script$ = this.scriptModel.findOne({
      where: {
        ...optExtra,
        deletedAt: null,
      },
    });
    const permissions$ = this.sequelize.query(
      `SELECT hp.* FROM hype_permissions hp
    INNER JOIN hype_script_permissions hsp ON hsp.permissionId = hp.id AND hsp.deletedAt IS NULL
    WHERE hsp.scriptId = ${id} AND hp.deletedAt IS NULL
    `,
      { type: QueryTypes.SELECT },
    );

    const resultArr = await Promise.all([script$, permissions$]);
    const result: Partial<HypeScript> & { permissions: Array<any> } = {
      ...resultArr[0].toJSON(),
      permissions: resultArr[1],
    };
    return result;
  }

  async checkPermission(userId: number, scriptId: number) {
    const tempRequiredPermissions = ['administrator', 'script_management'];
    const hasAdminPermission = await this.sequelize.query(
      `SELECT ur.userId, ps.slug
             FROM hype_permissions ps
                      INNER JOIN hype_role_permissions rp ON rp.permissionId = ps.id
                      INNER JOIN hype_user_roles ur ON ur.roleId = rp.roleId
             WHERE slug IN (:requiredPermissions)
               AND userId = ${userId}
            `,
      {
        replacements: { requiredPermissions: tempRequiredPermissions },
        type: QueryTypes.SELECT,
      },
    );
    if (hasAdminPermission.length > 0) {
      return true;
    }

    const hasPermission = await this.sequelize.query(
      `
                SELECT ur.userId, ps.slug
                FROM hype_permissions ps
                         INNER JOIN hype_role_permissions rp ON rp.permissionId = ps.id AND rp.deletedAt IS null
                         INNER JOIN hype_user_roles ur ON ur.roleId = rp.roleId AND ur.deletedAt IS NULL
                         INNER JOIN hype_script_permissions sp
                                    ON sp.permissionId = sp.permissionId sp fp.deletedAt IS NULL
                WHERE sp.scriptId = ${scriptId}
                  AND userId
                    = ${userId}
            `,
      {
        type: QueryTypes.SELECT,
      },
    );
    if (hasPermission.length > 0) {
      return true;
    }
    throw new ForbiddenException('no permission to access script');
  }

  async execScriptSQLSlug(
    scriptSlug: string,
    params: object,
  ): Promise<{
    data: Array<any>;
    fields: any;
  }> {
    const existScript = await this.scriptModel.findOne({
      where: {
        slug: scriptSlug,
      },
    });
    return this.execScriptSQL(existScript.id, params);
  }

  async batchExecScriptSQL(slug: Array<string>, params: object) {
    const existScript = await this.scriptModel.findAll({
      where: {
        slug: slug,
      },
    });

    const promiseList = [];
    for (const sc of existScript) {
      promiseList.push(
        this.execScriptSQL(sc.id, params ? params[sc.slug] ?? {} : {}),
      );
    }
    const resultQuery = await Promise.all(promiseList);
    const result = {};
    for (const rIndex in resultQuery) {
      const slugKey = slug[rIndex];
      result[slugKey] = resultQuery[rIndex];
    }
    return result;
  }

  async execScriptSQLBySlug(
    slug,
    params,
  ): Promise<{
    data: Array<any>;
    fields: any;
  }> {
    const existScript = await this.scriptModel.findOne({
      where: {
        slug: slug,
      },
    });
    return this.execScriptSQL(existScript.id, params);
  }

  async execScriptSQL(
    scriptId,
    params,
  ): Promise<{
    data: Array<any>;
    fields: any;
  }> {
    const existScript = await this.scriptModel.findByPk(scriptId);
    const res = { data: [], fields: {} };
    let rawScript = existScript.script;
    if (params) {
      const paramKeys = Object.keys(params);
      for (const key of paramKeys) {
        rawScript = rawScript.replace(new RegExp(`{${key}}`, 'g'), params[key]);
      }
    }

    Logger.log(`Running Script ${rawScript}`, 'execScriptSQL');
    const resultQuery = await this.sequelize.query(rawScript, {
      type: QueryTypes.SELECT,
    });
    const result = [];
    for (const rIndex in resultQuery[0]) {
      result.push(rIndex);
    }
    res.data = resultQuery;
    res.fields = result;
    return res;
  }

  async execScriptSQLForSelect({
    scriptId,
    formSlug,
    targetFormSlug,
    search,
    params,
    dependValue,
  }): Promise<{
    data: Array<any>;
    fields: any;
  }> {
    const existScript = await this.scriptModel.findByPk(scriptId);
    // console.log(existScript);
    const res = { data: [], fields: {} };
    const scObj = JSON.parse(existScript.script);
    let rawSQL =
      'SELECT main.id as value, ' +
      scObj.select +
      ' as label ' +
      `FROM zz_${formSlug} AS main ` +
      `INNER JOIN zz_${targetFormSlug} AS relate ON relate.id = main.ref_asdas23_id AND relate.deletedAt IS NULL ` +
      scObj.join +
      ' WHERE main.deletedAt IS NULL ' +
      scObj.where;
    rawSQL = rawSQL.replace(/{search}/g, search ?? '');
    rawSQL = rawSQL.replace(/{dependValue}/g, dependValue ?? '');
    const paramKeys = Object.keys(params);
    for (const key of paramKeys) {
      rawSQL = rawSQL.replace(new RegExp(`{${key}}`, 'g'), params[key]);
    }
    Logger.log(`Running ScriptForSelect ${rawSQL}`, 'execScriptSQL');
    const resultQuery = await this.sequelize.query(rawSQL, {
      type: QueryTypes.SELECT,
    });
    const result = [];
    for (const rIndex in resultQuery[0]) {
      result.push(rIndex);
    }
    res.data = resultQuery;
    res.fields = result;
    return res;
  }

  async createScript(
    byUser,
    body: {
      slug: string;
      name: string;
      script: string;
      scriptType: string;
      state: 'ACTIVE' | 'DRAFT';
    },
  ) {
    if (body.slug == null) {
      throw new Error('createScript require createScript(slug) ');
    }
    const existScript = await this.scriptModel.findOne({
      where: {
        slug: body.slug,
      },
    });

    if (existScript == null) {
      return this.scriptModel.create({
        name: body.name,
        scriptType: body.scriptType,
        slug: body.slug,
        script: body.script,
        createdBy: byUser.id,
        state: 'DRAFT',
      });
    }
    throw new Error('createScript slug is exist');
  }

  async deleteScript(byUser: User, id: number) {
    return this.scriptModel.update(
      {
        deletedBy: byUser.id,
        deletedAt: new Date(),
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async updateScript(byUser: User, id: any, data: any) {
    if (id == null) {
      throw new Error('update require id');
    }
    delete data.createdBy;
    delete data.createdAt;
    delete data.deletedAt;
    delete data.deletedBy;
    await this.scriptModel.update(
      {
        ...data,
        updatedBy: byUser.id,
        state: data.state,
        updatedAt: new Date(),
      },
      {
        where: {
          id: id,
        },
      },
    );
    return await this.scriptModel.findOne({
      where: {
        id: id,
      },
    });
  }

  async publishScript(byUser: User, id: any) {
    if (id == null) {
      throw new BadRequestException('update require id');
    }

    const draftScript = await this.scriptModel.findOne({
      where: {
        id: id,
      },
    });

    let existScriptActive = await this.scriptModel.findOne({
      where: {
        slug: draftScript.slug,
        state: 'ACTIVE',
      },
    });

    if (existScriptActive == null) {
      existScriptActive = await this.createScript(byUser, {
        slug: draftScript.slug,
        name: draftScript.name,
        script: draftScript.script,
        scriptType: draftScript.scriptType,
        state: 'ACTIVE',
      });
    } else {
      await this.updateScript(byUser, existScriptActive.id, {
        name: draftScript.name,
        script: draftScript.script,
        scriptType: draftScript.scriptType,
      });
    }

    return await this.scriptModel.findOne({
      where: {
        id: existScriptActive.id,
      },
    });
  }
}
