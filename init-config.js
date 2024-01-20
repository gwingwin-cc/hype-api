const dotenv = require('dotenv');
const { writeFileSync } = require('fs');
dotenv.config();

const config = {
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'mariadb',
  },
};
// create folder config
if (!require('fs').existsSync('config')) {
  require('fs').mkdirSync('config');
}
// write to config/config.json
writeFileSync('config/config.json', JSON.stringify(config));
