'use strict';

const { DataType } = require('sequelize-typescript');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
          CREATE TABLE \`users\`
          (
            \`id\`           int(11)  NOT NULL AUTO_INCREMENT,
            \`email\`        varchar(255) DEFAULT NULL,
            \`username\`     varchar(255) DEFAULT NULL,
            \`passwordHash\` text         DEFAULT NULL,
            \`status\`       varchar(255) DEFAULT 'active',
            \`createdBy\`    int(11)      DEFAULT NULL,
            \`updatedBy\`    int(11)      DEFAULT NULL,
            \`deletedBy\`    int(11)      DEFAULT NULL,
            \`createdAt\`    datetime NOT NULL,
            \`updatedAt\`    datetime NOT NULL,
            \`deletedAt\`    datetime     DEFAULT NULL,
            PRIMARY KEY (\`id\`) USING BTREE
          ) ENGINE = InnoDB
            DEFAULT CHARSET = utf8mb4;
`);

    await queryInterface.sequelize.query(`
      CREATE TABLE \`tags\`
      (
        \`id\`        int(11) NOT NULL AUTO_INCREMENT,
        \`name\`      varchar(255) DEFAULT NULL,
        \`createdAt\` datetime     DEFAULT NULL,
        \`updatedAt\` datetime     DEFAULT NULL,
        \`deletedAt\` datetime     DEFAULT NULL,
        PRIMARY KEY (\`id\`) USING BTREE
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('tags');
  },
};
