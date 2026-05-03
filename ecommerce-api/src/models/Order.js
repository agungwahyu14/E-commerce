const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'failed', 'expired', 'refunded'),
    defaultValue: 'unpaid',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  snapToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  midtransOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vaNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Order;
