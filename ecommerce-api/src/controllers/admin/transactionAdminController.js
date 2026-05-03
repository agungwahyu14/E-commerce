const Order = require('../../models/Order');
const User = require('../../models/User');
const OrderItem = require('../../models/OrderItem');
const snap = require('../../config/midtrans');
const { formatResponse } = require('../../utils/response');
const { Op } = require('sequelize');

const statusMapping = {
  capture: { paymentStatus: 'paid', orderStatus: 'processing' },
  settlement: { paymentStatus: 'paid', orderStatus: 'processing' },
  pending: { paymentStatus: 'unpaid', orderStatus: 'pending' },
  deny: { paymentStatus: 'failed', orderStatus: 'cancelled' },
  expire: { paymentStatus: 'expired', orderStatus: 'cancelled' },
  cancel: { paymentStatus: 'failed', orderStatus: 'cancelled' },
  refund: { paymentStatus: 'refunded', orderStatus: 'cancelled' },
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { paymentStatus = '' } = req.query;
    const where = { midtransOrderId: { [Op.ne]: null } };
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const transactions = await Order.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    const totalRevenue = await Order.sum('totalAmount', { where: { paymentStatus: 'paid' } }) || 0;
    const totalTransactions = await Order.count({ where: { midtransOrderId: { [Op.ne]: null } } });
    const pendingTransactions = await Order.count({ where: { paymentStatus: 'unpaid', status: 'pending', midtransOrderId: { [Op.ne]: null } } });
    const failedTransactions = await Order.count({ where: { paymentStatus: { [Op.in]: ['failed', 'expired'] }, midtransOrderId: { [Op.ne]: null } } });

    return formatResponse(res, 200, true, 'Transactions retrieved', {
      transactions,
      stats: { totalRevenue, totalTransactions, pendingTransactions, failedTransactions }
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionDetail = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        { model: User, attributes: ['name', 'email', 'phone', 'address'] },
        { model: OrderItem, as: 'items' }
      ]
    });
    if (!order) return formatResponse(res, 404, false, 'Transaction not found');
    return formatResponse(res, 200, true, 'Transaction details retrieved', { order });
  } catch (error) {
    next(error);
  }
};

const retryWebhook = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order || !order.midtransOrderId) return formatResponse(res, 404, false, 'Order not found');

    const statusResponse = await snap.transaction.status(order.midtransOrderId);
    const mapping = statusMapping[statusResponse.transaction_status] || { paymentStatus: 'unpaid', orderStatus: 'pending' };

    await order.update({
      paymentStatus: mapping.paymentStatus,
      status: mapping.orderStatus,
      paymentType: statusResponse.payment_type,
      transactionTime: statusResponse.transaction_time,
      transactionId: statusResponse.transaction_id,
      vaNumber: statusResponse.va_numbers?.[0]?.va_number || null,
      pdfUrl: statusResponse.pdf_url || null
    });

    return formatResponse(res, 200, true, 'Status updated', {
      midtransStatus: statusResponse.transaction_status,
      paymentStatus: mapping.paymentStatus,
      orderStatus: mapping.orderStatus
    });
  } catch (error) {
    next(error);
  }
};

const syncAllPendingOrders = async (req, res, next) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingOrders = await Order.findAll({
      where: {
        paymentStatus: 'unpaid',
        midtransOrderId: { [Op.ne]: null },
        createdAt: { [Op.lt]: fiveMinutesAgo }
      }
    });

    let updated = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      try {
        const statusResponse = await snap.transaction.status(order.midtransOrderId);
        const mapping = statusMapping[statusResponse.transaction_status];
        
        if (mapping && (order.paymentStatus !== mapping.paymentStatus || order.status !== mapping.orderStatus)) {
          await order.update({
            paymentStatus: mapping.paymentStatus,
            status: mapping.orderStatus,
            paymentType: statusResponse.payment_type,
            transactionTime: statusResponse.transaction_time,
            transactionId: statusResponse.transaction_id,
            vaNumber: statusResponse.va_numbers?.[0]?.va_number || null,
            pdfUrl: statusResponse.pdf_url || null
          });
          updated++;
        }
      } catch (e) {
        failed++;
      }
    }

    return formatResponse(res, 200, true, 'Sync completed', {
      total: pendingOrders.length,
      updated,
      failed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionDetail,
  retryWebhook,
  syncAllPendingOrders
};
