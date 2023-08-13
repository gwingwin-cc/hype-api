'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    CREATE TABLE \`hype_permissions\`
      (
        \`id\`             int(11)  NOT NULL AUTO_INCREMENT,
        \`name\`           varchar(255) DEFAULT NULL,
        \`slug\`           varchar(255) DEFAULT NULL,
        \`permissionType\` varchar(255) DEFAULT 'normal',
        \`createdBy\`      int(11)      DEFAULT NULL,
        \`updatedBy\`      int(11)      DEFAULT NULL,
        \`deletedBy\`      int(11)      DEFAULT NULL,
        \`createdAt\`      datetime NOT NULL,
        \`updatedAt\`      datetime NOT NULL,
        \`deletedAt\`      datetime     DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4
    `);

    await queryInterface.sequelize.query(`
    CREATE TABLE \`hype_roles\` (
                              \`id\` int(11) NOT NULL AUTO_INCREMENT,
                              \`name\` varchar(255) DEFAULT NULL,
                              \`slug\` varchar(255) DEFAULT NULL,
                              \`roleType\` varchar(255) DEFAULT 'normal',
                              \`createdBy\` int(11) DEFAULT NULL,
                              \`updatedBy\` int(11) DEFAULT NULL,
                              \`deletedBy\` int(11) DEFAULT NULL,
                              \`createdAt\` datetime NOT NULL,
                              \`updatedAt\` datetime NOT NULL,
                              \`deletedAt\` datetime DEFAULT NULL,
                              PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE \`hype_user_roles\`
      (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`userId\`    int(11)  NOT NULL,
        \`roleId\`    int(11)  NOT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,
        \`createdBy\` int(11) DEFAULT NULL,
        \`updatedBy\` int(11) DEFAULT NULL,
        \`deletedBy\` int(11) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`roleId\` (\`roleId\`),
        KEY \`hype_user_roles_ibfk_1\` (\`userId\`) USING BTREE,
        CONSTRAINT \`hype_user_roles_ibfk_1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`hype_user_roles_ibfk_2\` FOREIGN KEY (\`roleId\`) REFERENCES \`hype_roles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE \`hype_role_permissions\`
      (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`roleId\`       int(11)  NOT NULL,
        \`permissionId\` int(11)  NOT NULL,
        \`createdAt\`    datetime NOT NULL,
        \`updatedAt\`    datetime NOT NULL,
        \`deletedAt\`    datetime DEFAULT NULL,
        \`createdBy\` int(11) DEFAULT NULL,
        \`updatedBy\` int(11) DEFAULT NULL,
        \`deletedBy\` int(11) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`permissionId\` (\`permissionId\`),
        CONSTRAINT \`hype_role_permissions_ibfk_1\` FOREIGN KEY (\`roleId\`) REFERENCES \`hype_roles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`hype_role_permissions_ibfk_2\` FOREIGN KEY (\`permissionId\`) REFERENCES \`hype_permissions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE = InnoDB
        DEFAULT CHARSET = utf8mb4
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hype_role_permissions');
    await queryInterface.dropTable('hype_user_roles');
    await queryInterface.dropTable('hype_permissions');
    await queryInterface.dropTable('hype_roles');
  },
};
