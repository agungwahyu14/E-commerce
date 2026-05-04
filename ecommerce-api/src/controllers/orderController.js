const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
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

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ where: { id: orderId, userId } });

    if (!order) {
      return formatResponse(res, 404, false, 'Pesanan tidak ditemukan');
    }

    if (!['pending', 'processing'].includes(order.status?.toLowerCase())) {
      return formatResponse(res, 400, false,
        `Pesanan tidak dapat dibatalkan karena status sudah ${order.status}`
      );
    }

    await order.update({
      status: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed',
    });

    const orderItems = await OrderItem.findAll({ where: { orderId } });
    for (const item of orderItems) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId }
      });
    }

    if (order.midtransOrderId) {
      try {
        const snap = require('../config/midtrans');
        await snap.transaction.cancel(order.midtransOrderId);
      } catch (midtransError) {
        console.warn('Midtrans cancel failed:', midtransError.message);
      }
    }

    return formatResponse(res, 200, true, 'Pesanan berhasil dibatalkan', {
      order: { id: order.id, status: 'cancelled', paymentStatus: order.paymentStatus }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return formatResponse(res, 500, false, 'Gagal membatalkan pesanan');
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  cancelOrder
};
