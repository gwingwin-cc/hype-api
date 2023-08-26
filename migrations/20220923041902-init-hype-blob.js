'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
    CREATE TABLE \`hype_blob_storage\` (
                                     \`id\` int(11) NOT NULL AUTO_INCREMENT,
                                     \`bytes\` longblob DEFAULT NULL,
                                     \`createdAt\` datetime NOT NULL,
                                     \`deletedAt\` datetime DEFAULT NULL,
                                     PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryInterface.sequelize.query(`
    CREATE TABLE \`hype_blob_info\` (
                                  \`id\` int(11) NOT NULL AUTO_INCREMENT,
                                  \`filename\` varchar(255) DEFAULT NULL,
                                  \`size\` int(11) DEFAULT NULL,
                                  \`mimetype\` varchar(255) DEFAULT NULL,
                                  \`blobId\` int(11) DEFAULT NULL,
                                  \`createdBy\` int(11) DEFAULT NULL,
                                  \`deletedBy\` int(11) DEFAULT NULL,
                                  \`createdAt\` datetime NOT NULL,
                                  \`deletedAt\` datetime DEFAULT NULL,
                                  PRIMARY KEY (\`id\`),
                                  KEY \`blobId\` (\`blobId\`),
                                  CONSTRAINT \`hype_blob_info_ibfk_1\` FOREIGN KEY (\`blobId\`) REFERENCES \`hype_blob_storage\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('hype_blob_info');
    await queryInterface.dropTable('hype_blob_storage');
  },
};
