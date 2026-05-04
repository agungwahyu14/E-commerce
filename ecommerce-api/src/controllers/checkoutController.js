const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const sequelize = require('../config/database');
const snap = require('../config/midtrans');
const { formatResponse } = require('../utils/response');
const crypto = require('crypto');

const statusMapping = {
  capture: { paymentStatus: 'paid', orderStatus: 'processing' },
  settlement: { paymentStatus: 'paid', orderStatus: 'processing' },
  pending: { paymentStatus: 'unpaid', orderStatus: 'pending' },
  deny: { paymentStatus: 'failed', orderStatus: 'cancelled' },
  expire: { paymentStatus: 'expired', orderStatus: 'cancelled' },
  cancel: { paymentStatus: 'failed', orderStatus: 'cancelled' },
  refund: { paymentStatus: 'refunded', orderStatus: 'cancelled' },
};

const createCheckout = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, paymentMethod, notes, shippingData } = req.body;
    const user = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return formatResponse(res, 400, false, 'Items tidak boleh kosong');
    }

    if (!shippingData) {
      return res.status(400).json({ success: false, message: 'Informasi pengiriman tidak lengkap' });
    }

    const { courier, service, cost, etd, address, city, province, postalCode, receiverName, receiverPhone } = shippingData;

    if (!courier || !service || !cost || !address || !city || !receiverName) {
      return res.status(400).json({
        success: false,
        message: 'Informasi pengiriman tidak lengkap',
        errors: {
          courier: !courier ? 'Kurir wajib dipilih' : null,
          service: !service ? 'Layanan wajib dipilih' : null,
          address: !address ? 'Alamat wajib diisi' : null,
          city: !city ? 'Kota wajib diisi' : null,
          receiverName: !receiverName ? 'Nama penerima wajib diisi' : null,
        }
      });
    }

    let totalAmount = 0;
    let totalWeight = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return formatResponse(res, 404, false, `Produk dengan ID ${item.productId} tidak ditemukan`);
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return formatResponse(res, 400, false, `Stok produk ${product.name} tidak mencukupi`);
      }

      totalAmount += parseFloat(product.price) * item.quantity;
      // Calculate weight based on items (default 500g per item as per frontend logic)
      totalWeight += (product.weight || 500) * item.quantity;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image_url: product.image_url
      });

      await product.decrement('stock', { by: item.quantity, transaction: t });
    }

    const order = await Order.create({
      userId: user.id,
      totalAmount: totalAmount + parseFloat(cost),
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress: JSON.stringify({ receiverName, receiverPhone, address, city, province, postalCode }),
      shippingCity: city,
      shippingProvince: province || '',
      shippingCourier: `${courier} ${service}`,
      shippingCost: parseFloat(cost),
      shippingWeight: totalWeight
    }, { transaction: t });

    const orderItemsData = verifiedItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url
    }));
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    const midtransOrderId = `ORDER-${order.id.substring(0, 8)}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalAmount + parseFloat(cost),
      },
      customer_details: {
        first_name: receiverName || user.name,
        email: user.email,
        phone: receiverPhone || null,
      },
      item_details: [
        ...verifiedItems.map(item => ({
          id: item.productId,
          price: parseFloat(item.price),
          quantity: item.quantity,
          name: item.name,
        })),
        {
          id: 'SHIPPING',
          price: parseFloat(cost),
          quantity: 1,
          name: `Ongkos Kirim - ${courier} ${service}`,
        }
      ],
    };

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    await order.update({ snapToken, midtransOrderId }, { transaction: t });

    await t.commit();

    return formatResponse(res, 201, true, 'Checkout berhasil', {
      orderId: order.id,
      snapToken,
      midtransOrderId,
      totalAmount
    });
  } catch (error) {
    if (t) await t.rollback();
    next(error);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const notification = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type, transaction_time, transaction_id, va_numbers, pdf_url } = notification;
    
    const hash = crypto.createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (hash !== signature_key) {
      return formatResponse(res, 400, false, 'Invalid signature key');
    }

    const order = await Order.findOne({ where: { midtransOrderId: order_id } });
    if (!order) return formatResponse(res, 404, false, 'Order not found');

    const mapping = statusMapping[transaction_status] || { paymentStatus: 'unpaid', orderStatus: 'pending' };

    await order.update({
      paymentStatus: mapping.paymentStatus,
      status: mapping.orderStatus,
      paymentType: payment_type,
      transactionTime: transaction_time,
      transactionId: transaction_id,
      vaNumber: va_numbers?.[0]?.va_number || null,
      pdfUrl: pdf_url || null
    });

    return formatResponse(res, 200, true, 'Webhook handled successfully');
  } catch (error) {
    next(error);
  }
};

const syncOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order || !order.midtransOrderId) return formatResponse(res, 404, false, 'Order not found');

    const statusResponse = await snap.transaction.status(order.midtransOrderId);
    const mapping = statusMapping[statusResponse.transaction_status] || { paymentStatus: 'unpaid', orderStatus: 'pending' };

    if (order.paymentStatus !== mapping.paymentStatus || order.status !== mapping.orderStatus) {
      await order.update({
        paymentStatus: mapping.paymentStatus,
        status: mapping.orderStatus,
        paymentType: statusResponse.payment_type,
        transactionTime: statusResponse.transaction_time,
        transactionId: statusResponse.transaction_id,
        vaNumber: statusResponse.va_numbers?.[0]?.va_number || null,
        pdfUrl: statusResponse.pdf_url || null
      });
    }

    return formatResponse(res, 200, true, 'Order synced', { 
      paymentStatus: order.paymentStatus, 
      orderStatus: order.status 
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetailWithSync = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) return formatResponse(res, 404, false, 'Order not found');

    if (order.midtransOrderId && order.paymentStatus === 'unpaid') {
      try {
        const statusResponse = await snap.transaction.status(order.midtransOrderId);
        const mapping = statusMapping[statusResponse.transaction_status];
        if (mapping && (order.paymentStatus !== mapping.paymentStatus)) {
          await order.update({
            paymentStatus: mapping.paymentStatus,
            status: mapping.orderStatus,
            paymentType: statusResponse.payment_type,
            transactionId: statusResponse.transaction_id
          });
        }
      } catch (e) {
        console.log('Midtrans sync failed for detail view');
      }
    }

    return formatResponse(res, 200, true, 'Order detail retrieved', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckout,
  handleWebhook,
  syncOrderStatus,
  getOrderDetailWithSync
};
