/**
 * WhatsApp Session Model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WhatsAppSession = sequelize.define(
    'WhatsAppSession',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },

      adminTelegramId: {
        type: DataTypes.STRING,
        allowNull: false
      },

      status: {
        type: DataTypes.ENUM('pending', 'connected', 'disconnected'),
        defaultValue: 'pending'
      },

      connectedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'whatsapp_sessions',
      timestamps: true
    }
  );

  return WhatsAppSession;
};
