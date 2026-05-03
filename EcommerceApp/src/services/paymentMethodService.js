import api from '../utils/api';

const paymentMethodService = {
  /**
   * Mengambil semua metode pembayaran user
   * @returns {Promise}
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payment-methods');
      return response.data.data;
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      throw error;
    }
  },

  /**
   * Menambah metode pembayaran baru
   * @param {Object} data - { type, provider, accountNumber, accountName, isDefault }
   * @returns {Promise}
   */
  addPaymentMethod: async (data) => {
    try {
      const response = await api.post('/payment-methods', data);
      return response.data;
    } catch (error) {
      console.error('Error in addPaymentMethod:', error);
      throw error;
    }
  },

  /**
   * Menghapus metode pembayaran
   * @param {string} id 
   * @returns {Promise}
   */
  deletePaymentMethod: async (id) => {
    try {
      const response = await api.delete(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deletePaymentMethod:', error);
      throw error;
    }
  },

  /**
   * Menjadikan metode pembayaran sebagai default
   * @param {string} id 
   * @returns {Promise}
   */
  setDefault: async (id) => {
    try {
      const response = await api.patch(`/payment-methods/${id}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Error in setDefault:', error);
      throw error;
    }
  }
};

export default paymentMethodService;
