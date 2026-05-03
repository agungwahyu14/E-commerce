const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { formatResponse } = require('../utils/response');

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [{ 
        model: OrderItem, 
        as: 'items' 
      }],
      order: [['createdAt', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Orders retrieved successfully', { orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{ 
        model: OrderItem, 
        as: 'items' 
      }]
    });

    if (!order) {
      return formatResponse(res, 404, false, 'Order not found');
    }

    return formatResponse(res, 200, true, 'Order details retrieved successfully', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById
};
