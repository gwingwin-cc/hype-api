'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE \`hype_applications\`
      (
        \`id\`         int(11)  NOT NULL AUTO_INCREMENT,
        \`name\`       varchar(255)             DEFAULT NULL,
        \`slug\`       varchar(255)             DEFAULT NULL,
        \`desc\`       text                     DEFAULT NULL,
        \`appType\`    enum ('APP','COMPONENT') DEFAULT NULL,
        \`iconBlobId\` int(11)                  DEFAULT NULL,
        \`createdAt\`  datetime NOT NULL,
        \`updatedAt\`  datetime NOT NULL,
        \`deletedAt\`  datetime                 DEFAULT NULL,
        \`createdBy\`  int(11)                  DEFAULT NULL,
        \`updatedBy\`  int(11)                  DEFAULT NULL,
        \`deletedBy\`  int(11)                  DEFAULT NULL,
        \`tags\`       text                     DEFAULT NULL,
        PRIMARY KEY (\`id\`) USING BTREE,
        KEY \`iconBlobId\` (\`iconBlobId\`) USING BTREE,
        KEY \`createdBy\` (\`createdBy\`) USING BTREE,
        KEY \`updatedBy\` (\`updatedBy\`) USING BTREE,
        CONSTRAINT \`hype_applications_ibfk_1\` FOREIGN KEY (\`iconBlobId\`) REFERENCES \`hype_blob_info\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE,
        CONSTRAINT \`hype_applications_ibfk_2\` FOREIGN KEY (\`createdBy\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`hype_applications_ibfk_3\` FOREIGN KEY (\`updatedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE \`hype_application_permissions\`
      (
        \`id\`            int(11)  NOT NULL AUTO_INCREMENT,
        \`applicationId\` int(11)  DEFAULT NULL,
        \`permissionId\`  int(11)  DEFAULT NULL,
        \`createdAt\`     datetime NOT NULL,
        \`deletedAt\`     datetime DEFAULT NULL,
        \`createdBy\`     int(11)  DEFAULT NULL,
        \`deletedBy\`     int(11)  DEFAULT NULL,
        PRIMARY KEY (\`id\`) USING BTREE,
        KEY \`permissionId\` (\`permissionId\`) USING BTREE,
        KEY \`appId\` (\`applicationId\`) USING BTREE,
        CONSTRAINT \`hype_application_permissions_ibfk_1\` FOREIGN KEY (\`permissionId\`) REFERENCES \`hype_permissions\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE,
        CONSTRAINT \`hype_application_permissions_ibfk_2\` FOREIGN KEY (\`applicationId\`) REFERENCES \`hype_applications\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4;
`);
    await queryInterface.sequelize
      .query(`CREATE TABLE \`hype_application_layouts\`
              (
                \`id\`            int(11)  NOT NULL AUTO_INCREMENT,
                \`applicationId\` int(11)                                            DEFAULT NULL,
                \`layout\`        mediumtext                                         DEFAULT NULL,
                \`state\`         enum ('DRAFT','ACTIVE','CANCEL','OBSOLETE')        DEFAULT NULL,
                \`scripts\`       longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`scripts\`)),
                \`createdAt\`     datetime NOT NULL,
                \`updatedAt\`     datetime NOT NULL,
                \`deletedAt\`     datetime                                           DEFAULT NULL,
                \`createdBy\`     int(11)                                            DEFAULT NULL,
                \`updatedBy\`     int(11)                                            DEFAULT NULL,
                \`deletedBy\`     int(11)                                            DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`applicationId\` (\`applicationId\`),
                CONSTRAINT \`hype_application_layouts_ibfk_1\` FOREIGN KEY (\`applicationId\`) REFERENCES \`hype_applications\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
              ) ENGINE = InnoDB
                DEFAULT CHARSET = utf8mb4;`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hype_application_layouts');
    await queryInterface.dropTable('hype_application_permissions');
    await queryInterface.dropTable('hype_applications');
  },
};
