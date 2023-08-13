'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
                alter table hype_form_layouts
                    add options MEDIUMTEXT null after layout;
            `,
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
              alter table hype_form_layouts
                  drop column options;
          `,
    );
  },
};
