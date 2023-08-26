import { Injectable, Logger } from '@nestjs/common';
import { HypeScript } from '../entity';
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

  async getScript({ id = null, slug = null }) {
    const optExtra: { id?; slug? } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }

    return this.scriptModel.findOne({
      where: {
        ...optExtra,
        deletedAt: null,
      },
    });
  }

  async execScriptSQLSlug(
    scriptSlug,
    params,
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

  async createScript(byUser, body: { slug; name; script; scriptType; state }) {
    if (body.slug == null) {
      throw new Error('createScript require createScript(slug) ');
    }
    const existScript = await this.scriptModel.findOne({
      where: {
        slug: body.slug,
        state: body.state,
      },
    });

    if (existScript == null) {
      return this.scriptModel.create({
        name: body.name,
        scriptType: body.scriptType,
        slug: body.slug,
        script: body.script,
        createdBy: byUser.id,
        state: body.state,
      });
    }
    throw new Error('createScript slug is exist');
  }

  async deleteScript(byUser, id: number) {
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

  async updateScript(byUser: any, id: any, data: any) {
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

  async publishScript(byUser: any, id: any) {
    if (id == null) {
      throw new Error('update require id');
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
