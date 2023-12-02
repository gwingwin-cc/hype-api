'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
          create table user_apis
          (
              id        varchar(255)                         not null
                  primary key,
              userId    int                                  not null,
              status    varchar(50)                          null,
              createdBy int                                  not null,
              createdAt datetime default current_timestamp() null,
              updatedAt datetime                             null,
              updatedBy int                                  null,
              deletedAt datetime                             null,
              deletedBy int                                  null
          );


      `,
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
              drop table user_apis;
          `,
    );
  },
};
