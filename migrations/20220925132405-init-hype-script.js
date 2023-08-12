'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE TABLE \`hype_scripts\` (
                                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                                \`name\` varchar(255) DEFAULT NULL,
                                \`slug\` varchar(255) DEFAULT NULL,
                                \`script\` mediumtext DEFAULT NULL,
                                \`scriptType\` varchar(255) DEFAULT NULL,
                                \`createdAt\` datetime NOT NULL,
                                \`updatedAt\` datetime NOT NULL,
                                \`deletedAt\` datetime DEFAULT NULL,
                                \`createdBy\` int(11) DEFAULT NULL,
                                \`updatedBy\` int(11) DEFAULT NULL,
                                \`deletedBy\` int(11) DEFAULT NULL,
                                \`tags\` text DEFAULT NULL,
                                PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hype_scripts');
  },
};
