/**
 * Advertisement Model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Advertisement = sequelize.define(
    'Advertisement',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      adminTelegramId: {
        type: DataTypes.STRING,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM('text', 'image', 'video', 'contact'),
        allowNull: false
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: 'advertisements',
      timestamps: true
    }
  );

  return Advertisement;
};
