/**
 * Database Configuration
 * Supports:
 * - PostgreSQL (Render / Production)
 * - SQLite (Local Development)
 */

const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  // Render / Production (PostgreSQL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development (SQLite)
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
