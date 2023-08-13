import { Injectable, Logger } from '@nestjs/common';
import { AllowColumnTypes } from '../interfaces/constant';
import { InjectModel } from '@nestjs/sequelize';
import {
  HypeForm,
  HypeFormField,
  HypeFormLayout,
  HypeFormPermissions,
  HypeFormRelation,
  User,
} from '../../entity';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { InjectConnection } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class FormService {
  constructor(
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

  async createForm(byUser, { name, slug }) {
    const tableSlug = 'zz_' + slug.toLowerCase();
    Logger.log(`create table slug ${slug}`, 'createForm');
    const createTableRow = await this.sequelize.query(
      'SHOW CREATE TABLE hype_base_form',
      { type: QueryTypes.SELECT },
    );
    const form = await this.formModel.create({
      slug: slug,
      name: name,
      createdBy: byUser.id,
    });

    const num = await this.sequelize.query(
      createTableRow[0]['Create Table'].replace('hype_base_form', tableSlug),
      { type: QueryTypes.RAW },
    );
    await this.formLayoutModel.create({
      state: 'DRAFT',
      createdBy: byUser.id,
      layout: '[]',
      formId: form.id,
    });
    return {
      form,
      num,
    };
  }

  async getFormOnly({ id = null, slug = null, state = 'ACTIVE' }) {
    const optExtra: { id?; slug? } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }
    return this.formModel.findOne({
      where: {
        ...optExtra,
        deletedAt: null,
        state: state,
      },
    });
  }

  /**
   *
   * @param id
   * @param slug
   * @param layoutState 'ACTIVE' | 'DRAFT'
   * @param includeDeleteField
   */
  async getForm({
    id = null,
    slug = null,
    layoutState,
    excludeDeleteField = true,
  }) {
    const optExtra: { id?; slug? } = {};
    if (id != null) {
      optExtra.id = id;
    } else {
      optExtra.slug = slug;
    }

    const formSQL = this.knex
      .table('hype_forms')
      .select()
      .where({
        ...optExtra,
        deletedAt: null,
        state: 'ACTIVE',
      })
      .toString();

    const formArr = await this.sequelize.query<any>(formSQL, {
      type: QueryTypes.SELECT,
    });
    const form = formArr[0];
    if (form == null) {
      throw new Error('Form ID or Slug not exist.');
    }

    const layouts$ = this.sequelize.query(
      `SELECT hfl.* FROM hype_form_layouts hfl
             WHERE hfl.formId = ${form.id}  AND hfl.state = '${layoutState}' AND hfl.deletedAt IS NULL LIMIT 1
        `,
      { type: QueryTypes.SELECT },
    );

    const permissions$ = this.sequelize.query(
      `SELECT hp.* FROM hype_permissions hp
    INNER JOIN hype_form_permissions hfp ON hfp.permissionId = hp.id AND hfp.deletedAt IS NULL
    WHERE hfp.formId = ${form.id} AND hp.deletedAt IS NULL
    `,
      { type: QueryTypes.SELECT },
    );

    const whereFields = {
      formId: form.id,
    };
    const fields$ = this.formFieldModel.findAll({
      where: whereFields,
      paranoid: excludeDeleteField,
      include: [
        {
          model: HypeFormRelation,
          as: 'hasRelation',
          paranoid: false,
        },
      ],
    });

    const relations = await this.formRelationModel.findAll({
      where: {
        formId: form.id,
        deletedAt: null,
      },
      include: [
        HypeFormField,
        {
          model: HypeForm,
          as: 'targetForm',
          attributes: ['id', 'slug'],
          where: { deletedAt: null },
        },
      ],
    });

    // const relations = this.sequelize.query(
    //   `SELECT * FROM hype_form_relations hfr
    //          WHERE formId = ${form.id} AND deletedAt IS NULL`,
    //   { type: QueryTypes.SELECT },
    // );
    fields$.then();
    permissions$.then();
    layouts$.then();
    const resultArr = await Promise.all([
      fields$,
      relations,
      permissions$,
      layouts$,
    ]);
    form['fields'] = resultArr[0];
    form['relations'] = resultArr[1];
    form['permissions'] = resultArr[2];
    form['layouts'] = resultArr[3];
    return form;
    // return this.formModel.findOne({
    //   where: {
    //     ...optExtra,
    //     deletedAt: null,
    //     state: 'ACTIVE',
    //   },
    //   include: [
    //     HypeFormPermissions,
    //     {
    //       model: HypeFormField,
    //       include: [{ model: HypeFormRelation }],
    //     },
    //     HypeFormRelation,
    //     {
    //       model: HypeFormLayout,
    //       where: { state: state },
    //     },
    //   ],
    // });
  }

  async addRelation(requestUser: User, formId, targetFormId, slug, connect) {
    const type = 'relation';
    const fieldType = 'int';
    const targetForm = await this.formModel.findOne({
      where: {
        id: targetFormId,
      },
    });

    const baseForm = await this.formModel.findOne({
      where: {
        id: formId,
      },
    });

    const relationFieldSlug = slug + '_' + targetForm.slug + '_id';
    const field = await this.addFormField(
      requestUser,
      baseForm.id,
      fieldType,
      type,
      relationFieldSlug,
      'Relation with ' + targetForm.name,
    );

    await this.sequelize.query(
      `CREATE INDEX index_${relationFieldSlug}
                ON zz_${baseForm.slug} (${relationFieldSlug});
            `,
    );

    const relation = await this.formRelationModel.create({
      formId: baseForm.id,
      targetFormId: targetForm.id,
      referenceFieldId: field.id,
      createdBy: requestUser.id,
    });

    Logger.log('has connect', 'add relation');
    Logger.log(connect, 'add relation');
    if (connect.connectFromField != null && connect.connectToField != null) {
      await this.sequelize.query(
        `
                    UPDATE zz_${baseForm.slug} bf
                        INNER join zz_${targetForm.slug} tf
                        on bf.${connect.connectFromField} = tf.${connect.connectToField} AND tf.deletedAt is null
                    Set bf.${relationFieldSlug} = tf.id
                    where bf.id > 0`,
      );
    }
    return {
      field,
      relation,
    };
  }

  async addFormField(
    requestUser: User | any,
    formId: number,
    fieldTypeSlug: string,
    componentTemplate: string,
    slug: string,
    name: string,
  ) {
    const form = await this.formModel.findOne({
      where: {
        id: formId,
      },
    });

    const allowFieldType = AllowColumnTypes.find(
      (ct) => ct.slug == fieldTypeSlug,
    );
    if (allowFieldType == null) {
      throw new Error('your fieldType not allow');
    }

    const tableSlug = 'zz_' + form.slug;
    Logger.log(`to table slug ${tableSlug}`, 'addField');
    // // TODO add unit test and check exist column
    // const addColumnResult = await this.sequelize.query(
    //   `
    //             ALTER TABLE ${tableSlug}
    //                 ADD COLUMN ${slug} ${allowFieldType.columnType} NULL;
    //         `,
    // );

    return await this.formFieldModel.create({
      slug: slug,
      name: name,
      fieldType: allowFieldType.columnType,
      componentTemplate: componentTemplate,
      formId: formId,
      createdBy: requestUser.id,
    });
  }

  /**
   * This operation softDelete field
   * and relation
   * @param formId
   * @param id
   */
  async softDeleteField(formId: number, id: number) {
    await this.formRelationModel.update(
      {
        deletedAt: new Date(),
      },
      {
        where: {
          referenceFieldId: id,
          formId,
        },
      },
    );
    return await this.formFieldModel.update(
      {
        deletedAt: new Date(),
      },
      {
        where: {
          id,
        },
      },
    );
  }

  /**
   * This operation remove field
   * and relation
   * @param formId
   * @param id
   */
  async hardDeleteField(formId: number, id: number) {
    Logger.log(
      `Start hard delete form ${formId} field id ${id}`,
      'hardDeleteField',
    );
    const field = await this.formFieldModel.findOne({
      where: {
        id: id,
        formId: formId,
      },
      paranoid: false,
    });
    if (field.deletedAt == null) {
      throw new Error('field must soft delete first!');
    }
    const form = await this.formModel.findByPk(formId);
    Logger.log(`deleting formRelation of fieldId ${id}`, 'hardDeleteField');
    await this.formRelationModel.destroy({
      where: {
        referenceFieldId: field.id,
      },
    });
    Logger.log(
      `finish delete formRelation of fieldId ${id}`,
      'hardDeleteField',
    );
    const tableSlug = 'zz_' + form.slug;
    await this.sequelize.query(
      `
                ALTER TABLE ${tableSlug}
                    DROP
                        COLUMN
                        ${field.slug};
            `,
    );
    Logger.log(`deleting formField id ${id}`, 'hardDeleteField');
    await this.formFieldModel.destroy({
      force: true,
      where: {
        id: id,
      },
    });
    Logger.log(`finish delete formField id ${id}`, 'hardDeleteField');
    return field;
  }

  async publishLayout(byUser, { id }) {
    const layout = await this.formLayoutModel.findByPk(id);
    await this.formLayoutModel.update(
      {
        updatedAt: new Date(),
        updatedBy: byUser.id,
        state: 'OBSOLETE',
      },
      {
        where: {
          formId: layout.formId,
          state: 'ACTIVE',
        },
      },
    );
    await this.formLayoutModel.create({
      state: 'ACTIVE',
      createdBy: byUser.id,
      layout: layout.layout,
      formId: layout.formId,
      approval: layout.approval,
      script: layout.script,
      options: layout.options,
      enableDraftMode: layout.enableDraftMode,
      requireCheckMode: layout.requireCheckMode,
    });
  }

  async updateLayout(
    byUser,
    id: number,
    data: {
      layout: string;
      approval: Array<any>;
      script: string | any;
      options?: object | any;
      enableDraftMode: 0 | 1 | boolean;
      requireCheckMode: 'ALWAYS' | 'BEFORE_ACTIVE' | 'BEFORE_ACTIVELOCK';
    },
  ) {
    await this.formLayoutModel.update(
      {
        updatedAt: new Date(),
        updatedBy: byUser.id,
        layout: data.layout,
        approval: data.approval,
        script: data.script,
        options: data.options,
        enableDraftMode: data.enableDraftMode,
        requireCheckMode: data.requireCheckMode,
      },
      {
        where: {
          id,
        },
      },
    );
  }

  // async addMappingRelation(requestUser: User, formId, compId, targetFormId) {
  //   const targetForm = await this.prismaService.herpForm.findUnique({
  //     where: {
  //       id: targetFormId,
  //     },
  //   });
  //
  //   const baseForm = await this.prismaService.herpForm.findUnique({
  //     where: {
  //       id: formId,
  //     },
  //   });
  //
  //   const component = await this.addComponent(
  //     requestUser,
  //     baseForm.id,
  //     'INT',
  //     'mapping_relation',
  //     targetForm.slug + '_id',
  //     'Relation with ' + targetForm.name,
  //   );
  //
  //   const relation = await this.prismaService.herpFormRelation.create({
  //     data: {
  //       formId: baseForm.id,
  //       targetFormId: targetForm.id,
  //       referenceComponentId: component.id,
  //       createdBy: requestUser.id,
  //     },
  //   });
  //
  //   return {
  //     relation,
  //   };
  // }
}
