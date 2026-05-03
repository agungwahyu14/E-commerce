const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const initDb = require('./config/initDb');
const { formatResponse } = require('./utils/response');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const homeRoutes = require('./routes/homeRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const profileRoutes = require('./routes/profileRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const helpRoutes = require('./routes/helpRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const chatbotAdminRoutes = require('./routes/admin/chatbotAdminRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const transactionAdminRoutes = require('./routes/admin/transactionAdminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/chatbot', chatbotAdminRoutes);
app.use('/api/admin/transactions', transactionAdminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/checkout', checkoutRoutes);

// Admin UI - Serve static files from public/admin
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// Admin UI - Fallback for client-side routing
app.get(/^\/admin/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Basic route for testing
app.get('/', (req, res) => {
  formatResponse(res, 200, true, 'Welcome to Ecommerce API', null);
});

// 404 handler
app.use((req, res) => {
  formatResponse(res, 404, false, 'Route not found', null);
});

// Error handling middleware
app.use(errorMiddleware);

// Database connection & Server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
