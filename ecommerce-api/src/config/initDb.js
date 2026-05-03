const sequelize = require('./database');

// Import all models to ensure they are registered with Sequelize
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const PaymentMethod = require('../models/PaymentMethod');
const ChatbotRule = require('../models/ChatbotRule');
require('../models/Banner');
require('../models/Collection');

// Define Relationships
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Orders Relationships
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Payment Methods Relationships
User.hasMany(PaymentMethod, { foreignKey: 'userId' });
PaymentMethod.belongsTo(User, { foreignKey: 'userId' });

const initDb = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // alter: true updates the tables to match the models without dropping them
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect or sync the database:', error);
    process.exit(1);
  }
};

module.exports = initDb;
