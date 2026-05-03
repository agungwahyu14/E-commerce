import api from '../utils/api';

const checkoutService = {
  /**
   * Membuat transaksi checkout baru
   * @param {Array} cartItems - Array of items from CartContext or route params
   * @param {string} paymentMethod - Selected payment method
   * @param {string} notes - Optional notes
   * @returns {Promise} - { orderId, snapToken, midtransOrderId, totalAmount }
   */
  createCheckout: async (cartItems, paymentMethod, notes) => {
    // 1. Mapping data cart dengan benar
    // Cart items usually have a nested Product object from Sequelize include
    const items = cartItems.map(item => {
      const product = item.Product || {};
      return {
        productId: product.id || item.productId || item.id,
        name: product.name || item.name,
        price: product.price || item.price,
        quantity: item.quantity,
        image_url: product.image_url || item.image_url,
      };
    });

    // 2. Validasi data sebelum kirim
    items.forEach(item => {
      if (!item.productId || !item.name || item.price === undefined || !item.quantity) {
        console.error('[Checkout Error] Incomplete item data:', item);
        throw new Error("Data produk tidak lengkap, silakan refresh keranjang");
      }
    });

    const requestData = {
      items,
      paymentMethod,
      notes: notes || ''
    };

    // 3. Log request data untuk debug
    console.log('[Checkout Service] Sending Request Body:', JSON.stringify(requestData, null, 2));

    try {
      const response = await api.post('/checkout', requestData);
      console.log('[Checkout Service] Success Response:', JSON.stringify(response.data, null, 2));
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Checkout Service] API Error:', errorMsg);
      throw new Error(errorMsg);
    }
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
