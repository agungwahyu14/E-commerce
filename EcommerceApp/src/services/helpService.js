import api from '../utils/api';

const helpService = {
  /**
   * Mengambil daftar FAQ
   * @returns {Promise}
   */
  getFAQs: async () => {
    try {
      // Untuk demo, kita return data statis jika API belum ada
      // atau tetap panggil API jika sudah tersedia
      const response = await api.get('/help/faqs').catch(() => ({
        data: {
          success: true,
          data: [
            { id: 1, category: 'Pesanan', q: 'Bagaimana cara melacak pesanan?', a: 'Anda dapat melacak pesanan melalui menu "Pesanan Saya" dan menekan tombol "Lacak Pesanan" pada item yang dimaksud.' },
            { id: 2, category: 'Pesanan', q: 'Bisa saya batalkan pesanan yang sudah dibayar?', a: 'Pesanan yang sudah dibayar tidak dapat dibatalkan secara otomatis. Silakan hubungi Customer Service kami untuk bantuan lebih lanjut.' },
            { id: 3, category: 'Pembayaran', q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami menerima pembayaran melalui Transfer Bank (VA), E-Wallet (GoPay, OVO, Dana), dan Kartu Kredit.' },
            { id: 4, category: 'Pengiriman', q: 'Berapa lama estimasi pengiriman?', a: 'Estimasi pengiriman reguler adalah 2-5 hari kerja tergantung pada lokasi pengiriman Anda.' },
            { id: 5, category: 'Akun', q: 'Bagaimana cara mengubah alamat email?', a: 'Anda dapat mengubah alamat email melalui menu Pengaturan Profil di dalam aplikasi.' },
            { id: 6, category: 'Pembayaran', q: 'Apakah ada biaya admin?', a: 'Biaya admin bergantung pada metode pembayaran yang Anda pilih, berkisar antara Rp 1.000 - Rp 2.500.' },
          ]
        }
      }));
      return response.data.data;
    } catch (error) {
      console.error('Error in getFAQs:', error);
      throw error;
    }
  },

  /**
   * Mengambil informasi kontak support
   * @returns {Promise}
   */
  getContactInfo: async () => {
    try {
      const response = await api.get('/help/contact').catch(() => ({
        data: {
          success: true,
          data: {
            whatsapp: '628123456789',
            email: 'support@ecommerce.com',
            phone: '+628123456789'
          }
        }
      }));
      return response.data.data;
    } catch (error) {
      console.error('Error in getContactInfo:', error);
      throw error;
    }
  }
};

export default helpService;
