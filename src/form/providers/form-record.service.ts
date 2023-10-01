import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Knex, knex } from 'knex';
import { Express } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import {
  HypeForm,
  HypeFormField,
  HypeFormLayout,
  HypeFormPermissions,
  HypeFormRelation,
  HypePermission,
  PermissionGrantTypeEnum,
  User,
} from '../../entity';
import { QueryTypes } from 'sequelize';
import { ScriptService } from '../../script/script.service';
import * as fs from 'fs/promises';
import { join } from 'path';
import xlsx from 'node-xlsx';
import { FormService } from './form.service';
import { BlobStorageService } from '../../blob-storage/blob-storage.service';
import { InjectConnection } from 'nestjs-knex';
import { FORM_RECORD_STATE, FORM_RECORD_TYPE } from '../dto/form-record.dto';
import { HypeBaseForm } from '../../entity/HypeBaseForm';

@Injectable()
export class FormRecordService {
  constructor(
    public formService: FormService,
    public scriptService: ScriptService,
    public blobService: BlobStorageService,
    private sequelize: Sequelize,
    @InjectModel(HypeForm)
    private formModel: typeof HypeForm,
    @InjectModel(HypeFormField)
    private formFieldModel: typeof HypeFormField,
    @InjectModel(HypeFormLayout)
    private formLayoutModel: typeof HypeFormLayout,
    @InjectModel(HypeFormRelation)
    private formRelationModel: typeof HypeFormRelation,
    @InjectModel(HypeFormPermissions)
    private formPermissions: typeof HypeFormPermissions,
    @InjectConnection() private readonly knex: Knex,
  ) {}

  async findOneById(slug, fid): Promise<HypeBaseForm> {
    const tableSlug = 'zz_' + slug;
    const knexBuilder = knex({ client: 'mysql' });
    const sql = knexBuilder(tableSlug).where('id', '=', fid).toString();
    Logger.log(sql, 'findOneByID');
    const rows = await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    return rows[0] as HypeBaseForm;
  }

  sandboxFunction = {
    updateData: async ({ user, formSlug, dataId, data, recordState }) => {
      const form = await this.formModel.findOne({
        where: {
          slug: formSlug,
        },
      });
      if (form == null) {
        throw new Error('form not found:' + formSlug);
      }
      return this.updateRecord(user, form.id, dataId, data, recordState);
    },
    createData: async ({ user, formSlug, data }) => {
      const form = await this.formModel.findOne({
        where: {
          slug: formSlug,
        },
      });
      if (form == null) {
        throw new Error('form not found:' + formSlug);
      }
      return this.createRecord(
        user,
        form.id,
        data,
        FORM_RECORD_STATE.DRAFT,
        FORM_RECORD_TYPE.DEV,
      );
    },
    getDataList: async ({ formSlug, options }) => {
      return this.find(formSlug, options);
    },
    getData: async ({ formSlug, options }) => {
      return this.findOne(formSlug, options);
    },
    abort: ({ message }) => {
      throw new Error(message);
    },
    execScript: async ({ slug, params }) => {
      return this.scriptService.execScriptSQLBySlug(slug, params);
    },
  };

  /*
  @deprecated
   */
  async checkPermission(userId, formId) {
    const tempRequiredPermissions = ['administrator', 'form_management'];
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
                         INNER JOIN hype_form_permissions fp
                                    ON fp.permissionId = rp.permissionId AND fp.deletedAt IS NULL
                WHERE fp.formId = ${formId}
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
    throw new ForbiddenException('no permission add access form');
  }

  async createRecord(
    byUser: User,
    formId: number,
    data: any,
    recordState: FORM_RECORD_STATE,
    recordType: FORM_RECORD_TYPE,
  ) {
    const form = await this.formModel.findByPk(formId, {
      include: [HypeFormField],
    });
    if (form == null) {
      throw new Error('Form not found.');
    }
    let abort = false;
    let abortMessage = '';
    if (form.scripts != null && form.scripts['beforeSave'] != null) {
      const callbackOnSave = eval(
        'async ({user, fn, action}, s) => { ' +
          form.scripts['beforeSave'] +
          ' }',
      );

      try {
        await callbackOnSave(
          { user: byUser, fn: this.sandboxFunction, action: 'create' },
          form.slug,
        );
      } catch (e) {
        abort = true;
        abortMessage = e.message;
        Logger.error(e.message, `beforeCreate[${form.slug}]`);
      }
    }
    if (abort) {
      throw new HttpException(
        'Custom script error: ' + abortMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const dateTimeCol = form.fields.filter(
      (c) => c.fieldType == 'DATETIME' || c.fieldType == 'DATE',
    );
    for (const col of dateTimeCol) {
      if (data[col.slug] != null && data[col.slug].indexOf('Z') > -1) {
        data[col.slug] = data[col.slug].slice(0, -1);
      }
    }

    const jsonColArr = form.fields.filter((c) => c.fieldType == 'JSON');
    for (const col of jsonColArr) {
      if (data[col.slug] != null) {
        data[col.slug] = JSON.stringify(data[col.slug]);
      }
    }
    const tableSlug = 'zz_' + form.slug;
    const knexBuilder = knex({ client: 'mysql' });
    const sql = knexBuilder(tableSlug)
      .insert({
        recordState: recordState ?? 'DRAFT',
        recordType: recordType,
        createdAt: knexBuilder.fn.now(),
        updatedAt: knexBuilder.fn.now(),
        createdBy: byUser?.id ?? null,
        updatedBy: byUser?.id ?? null,
        ...data,
      })
      .toString();
    const t = await this.sequelize.transaction();
    try {
      await this.sequelize.query(sql, {
        transaction: t,
        type: QueryTypes.INSERT,
      });

      const getInsertedId = await this.sequelize.query(
        'SELECT LAST_INSERT_ID() AS id FROM ' + tableSlug,
        {
          transaction: t,
          type: QueryTypes.SELECT,
        },
      );

      await t.commit();
      const insertedId = getInsertedId[0]['id'];
      if (form.scripts != null && form.scripts['onSaved'] != null) {
        const evalScript =
          'async ({user, fn, action}, slug, insId) => { \n' +
          form.scripts['onSaved'] +
          ' \n}';
        console.log(evalScript);
        const callbackOnSave = eval(evalScript);
        try {
          await callbackOnSave(
            { user: byUser, fn: this.sandboxFunction, action: 'create' },
            form.slug,
            insertedId,
          );
        } catch (e) {
          Logger.error(e.message, `onCreated[${form.slug}]:${insertedId}`);
        }
      }
      return insertedId;
    } catch (e) {
      try {
        await t.rollback();
      } catch (er) {
        console.error('Rollback transaction', er.message);
      }
      console.error('Error on create data', e.message);
      console.error(e);
      throw new Error(e);
    }
  }

  async updateRecord(
    user: User,
    formId: number,
    dataId: number,
    data: any,
    recordState,
  ) {
    delete data.approval;
    // await this.checkPermission(user.id, formId);
    let checkedRecordState: 'DRAFT' | 'ACTIVE' | 'ACTIVE_LOCK' = 'DRAFT';
    switch (recordState) {
      case '':
      case null:
        checkedRecordState = 'DRAFT';
        break;
      case 'DRAFT':
      case 'ACTIVE_LOCK':
      case 'ACTIVE':
        checkedRecordState = recordState;
        break;
      default:
        throw new Error('record state not valid');
    }

    // if ACTIVE_LOCK Check is on signing
    // if on sign and current order is audit let pass
    const form = await this.formModel.findByPk(formId, {
      include: [HypeFormField],
    });

    if (form == null) {
      throw new Error('Form not found.');
    }

    let abort = false;
    let abortMessage = '';
    if (form.scripts != null && form.scripts['beforeSave'] != null) {
      const callbackOnSave = eval(
        'async ({user, fn, action}, s, insId) => { \n' +
          form.scripts['beforeSave'] +
          '\n }',
      );
      try {
        await callbackOnSave(
          { user, fn: this.sandboxFunction, action: 'update' },
          form.slug,
          dataId,
        );
      } catch (e) {
        abort = true;
        abortMessage = e.message;
        Logger.error(e.message, `beforeUpdate[${form.slug}]:${dataId}`);
      }
    }
    if (abort) {
      throw new HttpException(
        'Custom script error: ' + abortMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // const approval = await this.getRecordApproval(form.id, dataId);

    // if (approval != null && approval.status !== 'APPROVED') {
    //     const requestList = approval.approveRequests.filter(
    //         (rq) => rq.signStatus == null,
    //     );
    //     if (requestList.length > 0 && requestList[0].type == 'AUDIT') {
    //         if (user.id != requestList[0].requestUserId) {
    //             throw new Error(
    //                 'This document is in process and this user not has audit permission.',
    //             );
    //         }
    //     } else {
    //         throw new Error('This document is in process.');
    //     }
    // }

    // if (data['createdAt'] != null) {
    //   if (data['createdAt'].indexOf('Z') > -1) {
    //     data['createdAt'] = data['createdAt'].slice(0, -1);
    //   }
    // } else {
    //   delete data['createdAt'];
    // }
    // if (data['deletedAt'] != null) {
    //   if (data['deletedAt'].indexOf('Z') > -1) {
    //     data['deletedAt'] = data['deletedAt'].slice(0, -1);
    //   }
    // } else {
    // }

    delete data['createdAt'];
    delete data['deletedAt'];

    const datetimeCol = form.fields.filter(
      (c) => c.fieldType == 'DATETIME' || c.fieldType == 'DATE',
    );
    for (const col of datetimeCol) {
      if (data[col.slug] != null && data[col.slug].indexOf('Z') > -1) {
        data[col.slug] = data[col.slug].slice(0, -1);
      }
    }

    const jsonColArr = form.fields.filter((c) => c.fieldType == 'JSON');
    for (const col of jsonColArr) {
      if (data[col.slug] != null) {
        data[col.slug] = JSON.stringify(data[col.slug]);
      }
    }

    const tableSlug = 'zz_' + form.slug;
    const knexBuilder = knex({ client: 'mysql' });
    const sql = knexBuilder(tableSlug)
      .where('id', '=', dataId)
      .update({
        ...data,
        recordState: checkedRecordState,
        updatedAt: knexBuilder.fn.now(),
        updatedBy: user?.id ?? null,
      })
      .toString();
    Logger.log(`sql ${sql}`, 'sql');
    await this.sequelize.query(sql, {
      type: QueryTypes.UPDATE,
    });
    if (form.scripts != null && form.scripts['onSaved'] != null) {
      const callbackOnSave = eval(
        'async ({user, fn, action}, s, insId) => { ' +
          form.scripts['onSaved'] +
          ' }',
      );
      try {
        await callbackOnSave(
          { user, fn: this.sandboxFunction, action: 'update' },
          form.slug,
          dataId,
        );
      } catch (e) {
        Logger.error(e.message, `onSaved[${form.slug}]:${dataId}`);
      }
    }
  }

  async find(slug, options) {
    const tableSlug = 'zz_' + slug;
    // const knexBuilder = knex({ client: 'mysql' });
    let sqlBuild = this.knex
      .table(tableSlug + ` as ${slug}`)
      .select(`${slug}.* `, 'users.username as createdByUser');

    if (options.where != null) {
      sqlBuild.andWhere(options.where);
    }
    if (options.orWhere != null) {
      sqlBuild.orWhere(options.orWhere);
    }

    sqlBuild.leftJoin('users', 'users.id', `${slug}.createdBy`);
    if (options.sort != null) {
      sqlBuild = sqlBuild.orderBy(options.sort);
    }

    sqlBuild.as('base_table');
    const searchBuild = this.knex.from(sqlBuild);
    if (
      options != null &&
      options.columnList != null &&
      options.search != null
    ) {
      searchBuild.where((builder) => {
        for (const cl of options.columnList) {
          builder.orWhere(cl, 'like', `%${options.search}%`);
        }
        return searchBuild;
      });
    }

    let page = 1;
    let perPage = 10;
    if (options.page != null) {
      page = options.page;
      searchBuild.offset((page - 1) * perPage);
    }
    if (options.perPage != null) {
      perPage = options.perPage;
      searchBuild.limit(perPage);
    }
    const sql = searchBuild.toString();
    Logger.log(options, 'SQL[find]');
    Logger.log(sql, 'SQL[find]');
    return await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
  }

  async findOne(slug, options) {
    const tableSlug = 'zz_' + slug;
    const knexBuilder = knex({ client: 'mysql' });
    let sqlBuild = knexBuilder(tableSlug).select(
      `${tableSlug}.*`,
      'users.username as createdByUser',
    );
    if (
      options != null &&
      options.columnList != null &&
      options.search != null
    ) {
      sqlBuild.where((builder) => {
        for (const cl of options.columnList) {
          builder.orWhere(cl, 'like', `%${options.search}%`);
        }
        return builder;
      });
    }
    if (options.where != null) {
      sqlBuild.andWhere(options.where);
    }
    sqlBuild.leftJoin('users', 'users.id', `${tableSlug}.createdBy`);
    if (options.sort != null) {
      sqlBuild = sqlBuild.orderBy(options.sort);
    }
    const sql = sqlBuild.limit(options.limit ?? 1).toString();
    Logger.log(options, 'SQL[findone]');
    Logger.log(sql, 'SQL[findone]');
    const rows = await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    if (options.limit == null || options.limit == 1) {
      return rows[0];
    }
    return rows;
  }

  async count(slug, where) {
    const tableSlug = 'zz_' + slug;
    const knexBuilder = knex({ client: 'mysql' });
    const sql = knexBuilder(`${tableSlug} as ${slug}`)
      .count('* as total')
      .where(where)
      .toString();
    return await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
  }

  /**
   * @param user
   * @param file
   */
  async saveBlob(user, file: Express.Multer.File) {
    return this.blobService.createBlob(user, file);
  }

  async getRecordListByScript(body) {
    const existScript = await this.scriptService.getScript({
      id: body.scriptId,
    });
    let rawScript = existScript.script.replace(/^--.*\n?/gm, '');
    rawScript = rawScript.replace(/;/g, '');
    rawScript = rawScript.replace(/{search}/g, body.search ?? '');

    // assign params to script
    if (body.params != null) {
      for (const paramKey of Object.keys(body.params)) {
        rawScript = rawScript.replace(
          RegExp('{' + paramKey + '}', 'g'),
          body.params[paramKey],
        );
      }
    }
    // clear all param that not exist
    rawScript = rawScript.replace(/({)([A-Za-z0-9_]{0,300})(})/g, '');

    const countScript = `SELECT COUNT(*) as c
                             FROM (${rawScript}) as script_sql`;
    let dataScript = `SELECT *
                          FROM (${rawScript}) as script_sql`;
    if (body.perPage != null && body.page != null) {
      dataScript += ` LIMIT ${body.perPage} OFFSET ${
        (body.page - 1) * body.perPage
      } `;
    }
    Logger.log(rawScript, 'getScriptDatalist');
    try {
      const resultDataQuery = await this.sequelize.query(dataScript, {
        type: QueryTypes.SELECT,
      });
      const resultCountQuery = await this.sequelize.query(countScript, {
        type: QueryTypes.SELECT,
      });

      return {
        scriptId: body.scriptId,
        data: resultDataQuery,
        total: resultCountQuery[0]['c'],
      };
    } catch (e) {
      Logger.error(e, 'getScriptDatalist');
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async exportExcelRecordListByScript(body: { [p: string]: any }) {
    const existScript = await this.scriptService.getScript({
      slug: body.scriptSlug,
    });
    let rawScript = existScript.script.replace(/^--.*\n?/gm, '');
    rawScript = rawScript.replace(/;/g, '');
    rawScript = rawScript.replace(/{search}/g, body.search ?? '');

    // assign params to script
    if (body.params != null) {
      for (const paramKey of Object.keys(body.params)) {
        rawScript = rawScript.replace(
          RegExp('{' + paramKey + '}', 'g'),
          body.params[paramKey],
        );
      }
    }
    // clear all param that not exist
    rawScript = rawScript.replace(/({)([A-Za-z0-9_]{0,300})(})/g, '');

    const dataScript = `SELECT *
                            FROM (${rawScript}) as script_sql`;
    Logger.log(rawScript, 'exportExcelScriptDatalist');
    try {
      const resultDataQuery = await this.sequelize.query(dataScript, {
        type: QueryTypes.SELECT,
      });
      // console.log('resultDataQuery');
      // console.log(resultDataQuery);
      const fieldName = Object.keys(resultDataQuery[0]);
      const data = [fieldName];
      for (const row of resultDataQuery) {
        const arr = [];
        for (const cellKey in row) {
          arr.push(row[cellKey]);
        }
        data.push(arr);
      }
      const buffer = xlsx.build([
        {
          options: {},
          name: existScript.slug,
          data: data,
        },
      ]); // Returns a buffer
      const fPath = join(__dirname, '..', '..', 'storage');
      const fName = 'export-' + new Date().getTime() + '.xlsx';
      try {
        await fs.mkdir(fPath);
      } catch (e) {
        if (e.code != 'EEXIST') console.error(e);
      }
      await fs.writeFile(fPath + '/' + fName, buffer);
      return { fName: fName };
      // res.set({
      //   'Content-Type': 'xlsx',
      // });
      // res.end(buffer);
    } catch (e) {
      Logger.error(e, 'exportExcelScriptDatalist');
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteRecord(user: any, formId: number, id: number) {
    await this.checkPermission(user.id, formId);
    const form = await this.formService.getForm({
      id: formId,
      layoutState: 'ACTIVE',
    });

    const tableSlug = 'zz_' + form.slug;
    const knexBuilder = knex({ client: 'mysql' });
    const sql = knexBuilder(tableSlug)
      .where('id', '=', id)
      .update({
        deletedAt: knexBuilder.fn.now(),
        deletedBy: user.id,
      })
      .toString();
    Logger.log(`sql ${sql}`, 'sql');
    await this.sequelize.query(sql, {
      type: QueryTypes.UPDATE,
    });
  }

  async validatePermissionGranted(
    formId: number,
    recordId: number | null,
    user: undefined | User,
    action: 'create' | 'update' | 'delete' | 'read',
  ): Promise<boolean> {
    const form = await this.formModel.findByPk(formId, {
      include: [{ model: HypeFormPermissions, include: [HypePermission] }],
    });
    const matchGrants = [];
    if (user == null) {
      form.permissions = form.permissions.filter(
        (p) => p.permission.slug === 'public_user',
      );
    }

    if (user) {
      const tempRequiredPermissions = [
        ...form.permissions.map((p) => p.permission.slug),
      ];
      tempRequiredPermissions.push(`administrator`);
      const hasPermission = await this.sequelize.modelManager.sequelize.query<{
        slug: string;
      }>(
        `SELECT ps.slug
           FROM hype_permissions ps
                  INNER JOIN hype_role_permissions rp ON rp.permissionId = ps.id
                  INNER JOIN hype_user_roles ur ON ur.roleId = rp.roleId
           WHERE slug IN (:requiredPermissions)
             AND userId = :userId
          `,
        {
          replacements: {
            requiredPermissions: tempRequiredPermissions,
            userId: user.id,
          },
          type: QueryTypes.SELECT,
        },
      );
      form.permissions = form.permissions.filter(
        (p) => hasPermission.find((hp) => hp.slug == p.permission.slug) != null,
      );
    }

    if (action == 'read') {
      matchGrants.push(
        ...[
          PermissionGrantTypeEnum.READ_ONLY_ALL,
          PermissionGrantTypeEnum.READ_EDIT_ALL,
          PermissionGrantTypeEnum.READ_EDIT_DELETE_ALL,
        ],
      );
      if (recordId != null && user != null) {
        const record = await this.findOneById(form.slug, recordId);
        if (record.createdBy == user.id) {
          matchGrants.push(PermissionGrantTypeEnum.READ_EDIT);
          matchGrants.push(PermissionGrantTypeEnum.READ_EDIT_DELETE);
        }
      }
    }

    if (action == 'update') {
      // find recordId
      const record = await this.findOneById(form.slug, recordId);
      matchGrants.push(
        ...[
          PermissionGrantTypeEnum.READ_EDIT_ALL,
          PermissionGrantTypeEnum.READ_EDIT_DELETE_ALL,
        ],
      );
      if (record.createdBy == user?.id) {
        matchGrants.push(PermissionGrantTypeEnum.READ_EDIT);
        matchGrants.push(PermissionGrantTypeEnum.READ_EDIT_DELETE);
      }
    }
    if (action == 'delete') {
      // find recordId
      const record = await this.findOneById(form.slug, recordId);
      matchGrants.push(...[PermissionGrantTypeEnum.READ_EDIT_DELETE_ALL]);
      if (record.createdBy == user.id) {
        matchGrants.push(PermissionGrantTypeEnum.READ_EDIT_DELETE);
      }
    }
    if (action == 'create') {
      // find recordId
      matchGrants.push(
        ...[
          PermissionGrantTypeEnum.CREATE,
          PermissionGrantTypeEnum.READ_EDIT,
          PermissionGrantTypeEnum.READ_EDIT_ALL,
        ],
      );
    }

    const permissionGranted = form.permissions.filter(
      (p) => matchGrants.indexOf(p.grant) > -1,
    );
    return permissionGranted.length > 0;
  }
}
