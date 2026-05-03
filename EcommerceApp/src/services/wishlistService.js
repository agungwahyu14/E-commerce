import api from '../utils/api';

const wishlistService = {
  /**
   * Mengambil semua barang di wishlist user
   * @returns {Promise}
   */
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data.data;
  },

  /**
   * Toggle produk ke wishlist (tambah/hapus)
   * @param {string} productId 
   * @returns {Promise}
   */
  toggleWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  }
};

export default wishlistService;
