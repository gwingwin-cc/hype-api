'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      alter table hype_blob_info
        add store_type VARCHAR(30) null comment 's3, hype, fs' after id;
    `);

    await queryInterface.sequelize.query(`
      alter table hype_blob_info
        add store_path VARCHAR(255) null comment 'info for storage' after blobId;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      alter table hype_blob_info
        drop column store_type;
    `);

    await queryInterface.sequelize.query(`
      alter table hype_blob_info
        drop column store_path;
    `);
  },
};
