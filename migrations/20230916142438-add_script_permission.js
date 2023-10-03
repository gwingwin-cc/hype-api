'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `create table hype_script_permissions
(
    id           int auto_increment
        primary key,
    scriptId       int      null,
    permissionId int      null,
    createdAt    datetime not null,
    deletedAt    datetime null,
    createdBy    int      null,
    deletedBy    int      null,
    constraint hype_script_permissions_ibfk_1
        foreign key (scriptId) references hype_scripts (id)
            on update cascade on delete cascade,
    constraint hype_script_permissions_ibfk_2
        foreign key (permissionId) references hype_permissions (id)
            on update cascade
);`,
    );
    await queryInterface.sequelize.query(`
    create index scriptId
    on hype_script_permissions (scriptId);
    `);

    await queryInterface.sequelize.query(`
  create index permissionId
    on hype_script_permissions (permissionId);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('hype_script_permissions');
  },
};
