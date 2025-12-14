/**
 * Sequelize Models Loader
 */

const { sequelize } = require('../config/database');

// Import models
const Admin = require('./Admin')(sequelize);

// Export models & sequelize
const db = {
  sequelize,
  Admin
};

module.exports = db;
