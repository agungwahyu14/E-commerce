import api from '../utils/api';

const cartService = {
  /**
   * Mengambil semua barang di keranjang belanja
   * @returns {Promise}
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  /**
   * Menambahkan produk ke keranjang
   * @param {string} productId 
   * @param {number} quantity 
   * @returns {Promise}
   */
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  /**
   * Update quantity item di keranjang
   * @param {string} cartItemId 
   * @param {number} quantity 
   * @returns {Promise}
   */
  updateQuantity: async (cartItemId, quantity) => {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  /**
   * Menghapus item dari keranjang
   * @param {string} cartItemId 
   * @returns {Promise}
   */
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  }
};

export default cartService;
