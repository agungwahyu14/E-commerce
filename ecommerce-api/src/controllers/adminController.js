const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Product = require('../models/Product');
const { formatResponse } = require('../utils/response');
const { Op } = require('sequelize');
const Category = require('../models/Category');

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Stats
    const totalRevenue = await Order.sum('totalAmount', { where: { paymentStatus: 'paid' } }) || 0;
    const totalOrders = await Order.count();
    const totalUsers = await User.count({ where: { role: 'customer' } });
    const totalProducts = await Product.count();

    // 2. Recent Orders (Top 5)
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });

    // 3. Top Products (Top 5 based on OrderItem quantity)
    const topProducts = await Product.findAll({
      limit: 5,
      order: [['rating', 'DESC']]
    });

    // 4. Chart Data (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dailyRevenue = await Order.sum('totalAmount', {
        where: {
          paymentStatus: 'paid',
          createdAt: {
            [Op.gte]: new Date(dateString + ' 00:00:00'),
            [Op.lte]: new Date(dateString + ' 23:59:59')
          }
        }
      }) || 0;

      last7Days.push({
        date: dateString,
        revenue: dailyRevenue
      });
    }

    return formatResponse(res, 200, true, 'Dashboard stats retrieved successfully', {
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts
      },
      recentOrders,
      topProducts,
      revenueChart: last7Days
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
      where.categoryId = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['name'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Products retrieved successfully', {
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, stock, image_url } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      categoryId,
      stock,
      image_url,
      rating: 0 // Default for new products
    });

    return formatResponse(res, 201, true, 'Product created successfully', { product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, stock, image_url } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return formatResponse(res, 404, false, 'Product not found');

    await product.update({
      name,
      description,
      price,
      categoryId,
      stock,
      image_url
    });

    return formatResponse(res, 200, true, 'Product updated successfully', { product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return formatResponse(res, 404, false, 'Product not found');

    await product.destroy();
    return formatResponse(res, 200, true, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { status = '', search = '' } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { '$User.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Orders retrieved successfully', { orders });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ['name', 'email', 'phone', 'address'] },
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) return formatResponse(res, 404, false, 'Order not found');

    return formatResponse(res, 200, true, 'Order details retrieved successfully', { order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return formatResponse(res, 404, false, 'Order not found');

    await order.update({ status });

    return formatResponse(res, 200, true, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const { search = '', role = '' } = req.query;
    
    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const totalActive = await User.count({ where: { isActive: true } });
    const totalInactive = await User.count({ where: { isActive: false } });

    return formatResponse(res, 200, true, 'Users retrieved successfully', { 
      users,
      stats: { totalActive, totalInactive }
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deactivation
    if (id === req.user.id) {
      return formatResponse(res, 400, false, 'You cannot deactivate your own account.');
    }

    const user = await User.findByPk(id);
    if (!user) return formatResponse(res, 404, false, 'User not found');

    await user.update({ isActive: !user.isActive });
    return formatResponse(res, 200, true, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
      return formatResponse(res, 400, false, 'Invalid role');
    }

    // Prevent changing own role (to avoid accidentally locking oneself out)
    if (id === req.user.id) {
      return formatResponse(res, 400, false, 'You cannot change your own role.');
    }

    const user = await User.findByPk(id);
    if (!user) return formatResponse(res, 404, false, 'User not found');

    await user.update({ role });
    return formatResponse(res, 200, true, `User role updated to ${role}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminUsers,
  toggleUserActive,
  updateUserRole
};
