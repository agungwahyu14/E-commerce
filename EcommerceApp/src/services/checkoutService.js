import api from '../utils/api';

const checkoutService = {
  /**
   * Membuat transaksi checkout baru
   * @param {Array} cartItems - Array of items from CartContext or route params
   * @param {string} paymentMethod - Selected payment method
   * @param {string} notes - Optional notes
   * @param {Object} shippingData - Optional shipping information
   * @returns {Promise} - { orderId, snapToken, midtransOrderId, totalAmount }
   */
  createCheckout: async (cartItems, paymentMethod, notes, shippingData) => {
    console.log('[Checkout] shippingData diterima:', JSON.stringify(shippingData, null, 2));

    const items = cartItems.map(item => ({
      productId: item.productId || item.id,
      name: item.Product?.name || item.name,
      price: parseFloat(item.Product?.price || item.price),
      quantity: item.quantity,
      image_url: item.Product?.image_url || item.image_url,
    }));

    const payload = {
      items,
      paymentMethod: paymentMethod || 'midtrans',
      notes: notes || '',
      shippingData: {
        courier: shippingData.courier,
        service: shippingData.service,
        cost: parseFloat(shippingData.cost),
        etd: shippingData.etd || '',
        address: shippingData.address,
        city: shippingData.city,
        province: shippingData.province || '',
        postalCode: shippingData.postalCode || '',
        receiverName: shippingData.receiverName,
        receiverPhone: shippingData.receiverPhone || '',
      },
    };

    console.log('[Checkout] Final payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/checkout', payload);
    return response.data.data;
  },

  /**
   * Mengambil detail order lengkap
   * @param {string} orderId 
   */
  getOrderDetail: async (orderId) => {
    const response = await api.get(`/checkout/order/${orderId}`);
    return response.data.data;
  },

  /**
   * Sinkronisasi status order dengan Midtrans
   * @param {string} orderId 
   */
  syncOrderStatus: async (orderId) => {
    const response = await api.post(`/checkout/sync/${orderId}`);
    return response.data.data;
  }
};

export default checkoutService;
