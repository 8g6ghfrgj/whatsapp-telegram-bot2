/**
 * Collected Links Model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CollectedLink = sequelize.define(
    'CollectedLink',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      sessionId: {
        type: DataTypes.STRING,
        allowNull: false
      },

      url: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM('whatsapp', 'telegram', 'website'),
        allowNull: false
      }
    },
    {
      tableName: 'collected_links',
      timestamps: true
    }
  );

  return CollectedLink;
};
