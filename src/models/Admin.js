/**
 * Admin Model
 * Represents Telegram bot administrators
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define(
    'Admin',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      telegramId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },

      username: {
        type: DataTypes.STRING,
        allowNull: true
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: true
      },

      lastName: {
        type: DataTypes.STRING,
        allowNull: true
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      permissions: {
        type: DataTypes.JSON,
        defaultValue: ['admin']
      },

      settings: {
        type: DataTypes.JSON,
        defaultValue: {
          maxSessions: 5,
          notifications: true
        }
      },

      lastActivity: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'admins',
      timestamps: true,
      indexes: [
        { fields: ['telegramId'] },
        { fields: ['isActive'] }
      ]
    }
  );

  return Admin;
};
