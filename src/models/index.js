/**
 * Sequelize Models Loader
 */

const { sequelize } = require('../config/database');

const Admin = require('./Admin')(sequelize);
const WhatsAppSession = require('./WhatsAppSession')(sequelize);
const CollectedLink = require('./CollectedLink')(sequelize);

const db = {
  sequelize,
  Admin,
  WhatsAppSession,
  CollectedLink
};

module.exports = db;
