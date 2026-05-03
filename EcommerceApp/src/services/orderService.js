import api from '../utils/api';

const orderService = {
  /**
   * Mengambil daftar pesanan user
   * @param {string} status - Filter status (pending, processing, shipped, delivered, cancelled)
   * @returns {Promise}
   */
  getMyOrders: async (status = '') => {
    try {
      const params = status && status !== 'All' ? { status: status.toLowerCase() } : {};
      const response = await api.get('/orders', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error in getMyOrders:', error);
      throw error;
    }
  },

  /**
   * Mengambil detail pesanan berdasarkan ID
   * @param {string} id 
   * @returns {Promise}
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  },

  /**
   * Membatalkan pesanan
   * @param {string} id 
   * @returns {Promise}
   */
  cancelOrder: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  }
};

export default orderService;
