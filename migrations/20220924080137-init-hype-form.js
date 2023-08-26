'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
            CREATE TABLE \`hype_forms\`
            (
                \`id\`        int(11)  NOT NULL AUTO_INCREMENT,
                \`name\`      varchar(255)                                       DEFAULT NULL,
                \`slug\`      varchar(255)                                       DEFAULT NULL,
                \`desc\`      text                                               DEFAULT NULL,
                \`tags\`      text                                               DEFAULT NULL,
                \`state\`     enum ('ACTIVE','CANCEL','OBSOLETE')                DEFAULT 'ACTIVE',
                \`scripts\`   longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`scripts\`)),
                \`createdBy\` int(11)                                            DEFAULT NULL,
                \`updatedBy\` int(11)                                            DEFAULT NULL,
                \`deletedBy\` int(11)                                            DEFAULT NULL,
                \`createdAt\` datetime NOT NULL,
                \`updatedAt\` datetime NOT NULL,
                \`deletedAt\` datetime                                           DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`createdBy\` (\`createdBy\`),
                KEY \`updatedBy\` (\`updatedBy\`),
                CONSTRAINT \`hype_forms_ibfk_1\` FOREIGN KEY (\`createdBy\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`hype_forms_ibfk_2\` FOREIGN KEY (\`updatedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
        `);

    await queryInterface.sequelize.query(`
            CREATE TABLE \`hype_form_fields\`
            (
                \`id\`                int(11)  NOT NULL AUTO_INCREMENT,
                \`formId\`            int(11)      DEFAULT NULL,
                \`name\`              varchar(255) DEFAULT NULL,
                \`slug\`              varchar(255) DEFAULT NULL,
                \`isUnique\`          tinyint(1)   DEFAULT NULL,
                \`fieldType\`         varchar(255) DEFAULT NULL,
                \`componentTemplate\` varchar(255) DEFAULT NULL,
                \`options\`           text         DEFAULT NULL,
                \`createdAt\`         datetime NOT NULL,
                \`updatedAt\`         datetime NOT NULL,
                \`deletedAt\`         datetime     DEFAULT NULL,
                \`createdBy\`         int(11)      DEFAULT NULL,
                \`updatedBy\`         int(11)      DEFAULT NULL,
                \`deletedBy\`         int(11)      DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`formId\` (\`formId\`),
                CONSTRAINT \`hype_form_fields_ibfk_1\` FOREIGN KEY (\`formId\`) REFERENCES \`hype_forms\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
        `);
    await queryInterface.sequelize.query(`
            CREATE TABLE \`hype_form_permissions\`
            (
                \`id\`           int(11)  NOT NULL AUTO_INCREMENT,
                \`formId\`       int(11)  DEFAULT NULL,
                \`permissionId\` int(11)  DEFAULT NULL,
                \`createdAt\`    datetime NOT NULL,
                \`deletedAt\`    datetime DEFAULT NULL,
                \`createdBy\`    int(11)  DEFAULT NULL,
                \`deletedBy\`    int(11)  DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`formId\` (\`formId\`),
                KEY \`permissionId\` (\`permissionId\`),
                CONSTRAINT \`hype_form_permissions_ibfk_1\` FOREIGN KEY (\`formId\`) REFERENCES \`hype_forms\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`hype_form_permissions_ibfk_2\` FOREIGN KEY (\`permissionId\`) REFERENCES \`hype_permissions\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
        `);
    await queryInterface.sequelize.query(`
            CREATE TABLE \`hype_form_layouts\`
            (
                \`id\`               int(11)  NOT NULL AUTO_INCREMENT,
                \`formId\`           int(11)                                            DEFAULT NULL,
                \`iconBlobId\`       int(11)                                            DEFAULT NULL,
                \`script\`           longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`script\`)),
                \`approval\`         longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`approval\`)),
                \`enableDraftMode\`  tinyint(1)                                         DEFAULT 0,
                \`requireCheckMode\` text                                               DEFAULT 'ALWAYS',
                \`state\`            enum ('DRAFT','ACTIVE','CANCEL','OBSOLETE')        DEFAULT 'DRAFT',
                \`layout\`           mediumtext                                         DEFAULT NULL,
                \`createdAt\`        datetime NOT NULL,
                \`updatedAt\`        datetime NOT NULL,
                \`deletedAt\`        datetime                                           DEFAULT NULL,
                \`createdBy\`        int(11)                                            DEFAULT NULL,
                \`updatedBy\`        int(11)                                            DEFAULT NULL,
                \`deletedBy\`        int(11)                                            DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`formId\` (\`formId\`),
                CONSTRAINT \`hype_form_layouts_ibfk_1\` FOREIGN KEY (\`formId\`) REFERENCES \`hype_forms\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
        `);

    await queryInterface.sequelize.query(`
            CREATE TABLE \`hype_form_relations\`
            (
                \`id\`               int(11)  NOT NULL AUTO_INCREMENT,
                \`formId\`           int(11)  DEFAULT NULL,
                \`referenceFieldId\` int(11)  DEFAULT NULL,
                \`targetFormId\`     int(11)  DEFAULT NULL,
                \`createdAt\`        datetime NOT NULL,
                \`deletedAt\`        datetime DEFAULT NULL,
                \`createdBy\`        int(11)  DEFAULT NULL,
                \`deletedBy\`        int(11)  DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`formId\` (\`formId\`),
                KEY \`referenceFieldId\` (\`referenceFieldId\`),
                KEY \`targetFormId\` (\`targetFormId\`),
                CONSTRAINT \`hype_form_relations_ibfk_1\` FOREIGN KEY (\`formId\`) REFERENCES \`hype_forms\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`hype_form_relations_ibfk_2\` FOREIGN KEY (\`referenceFieldId\`) REFERENCES \`hype_form_fields\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE,
                CONSTRAINT \`hype_form_relations_ibfk_3\` FOREIGN KEY (\`targetFormId\`) REFERENCES \`hype_forms\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
        `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hype_form_relations');
    await queryInterface.dropTable('hype_form_layouts');
    await queryInterface.dropTable('hype_form_fields');
    await queryInterface.dropTable('hype_form_permissions');
    await queryInterface.dropTable('hype_forms');
  },
};
