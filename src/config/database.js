/**
 * Database Configuration
 * Safe for Render (PostgreSQL) & Local (SQLite)
 */

const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (isProduction) {
  if (!databaseUrl) {
    throw new Error('❌ DATABASE_URL is not defined in production environment');
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/bot.sqlite',
    logging: false
  });
}

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed');
    throw error;
  }
}

module.exports = {
  sequelize,
  connectDatabase
};
