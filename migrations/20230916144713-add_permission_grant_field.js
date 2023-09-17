'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      alter table hype_form_permissions
        add \`grant\` VARCHAR(20) default 'READ_ONLY' not null comment 'READ_ONLY or EDITOR' after permissionId;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      alter table hype_form_permissions
        drop column permissionId;
    `);
  },
};
