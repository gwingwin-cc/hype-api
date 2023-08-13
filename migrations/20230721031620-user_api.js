'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
          create table hype_refactor.user_api
          (
              id         VARCHAR(255)                         not null,
              user_id    int                                  not null,
              status     VARCHAR(50)                          null,
              created_at DATETIME default CURRENT_TIMESTAMP() null,
              updated_at DATETIME                             null,
              deleted_at DATETIME                             null,
              constraint pk
                  primary key (id)
          );
            `,
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
              drop table user_api;
          `,
    );
  },
};
