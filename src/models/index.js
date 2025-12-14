/**
 * Sequelize Models Loader
 */

const { sequelize } = require('../config/database');

const Admin = require('./Admin')(sequelize);
const WhatsAppSession = require('./WhatsAppSession')(sequelize);

const db = {
  sequelize,
  Admin,
  WhatsAppSession
};

module.exports = db;
