import api from '../utils/api';

const homeService = {
  /**
   * Mengambil semua data agregasi untuk halaman Home
   * Meliputi: banners, categories, collections, featuredProducts, flashSale, dan allProducts
   * @returns {Promise<Object>} Data home dari server
   */
  getHomeData: async () => {
    const response = await api.get('/home');
    
    // Asumsi backend merespons dengan format: { success: true, data: { banners: [...], ... } }
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Gagal mengambil data Home');
  }
};

export default homeService;
