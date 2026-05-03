const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatbotRule = sequelize.define('ChatbotRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category: {
    type: DataTypes.ENUM('greeting', 'order', 'product', 'price', 'help', 'custom'),
    allowNull: false,
  },
  keywords: {
    type: DataTypes.TEXT, // Stored as JSON string array
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

module.exports = ChatbotRule;
