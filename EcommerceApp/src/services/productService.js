import api from '../utils/api';

const productService = {
  /**
   * Mengambil semua produk dengan filter
   * @param {Object} params - { category, search, page, limit }
   * @returns {Promise}
   */
  getProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Mengambil detail satu produk berdasarkan ID
   * @param {string} id 
   * @returns {Promise}
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Mengambil produk unggulan
   * @returns {Promise}
   */
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data.data;
  },

  /**
   * Mencari produk dengan filter lengkap
   * @param {Object} params - { q, category, minPrice, maxPrice, sort, page, limit }
   * @returns {Promise}
   */
  searchProducts: async (params) => {
    const response = await api.get('/products/search', { params });
    return response.data;
  }
};

export default productService;
