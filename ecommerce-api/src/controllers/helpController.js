const { formatResponse } = require('../utils/response');

const getFAQs = async (req, res, next) => {
  try {
    const faqs = [
      {
        category: 'Pesanan',
        items: [
          { q: 'Bagaimana cara melacak pesanan saya?', a: 'Anda dapat melacak pesanan di menu "Pesanan Saya" pada profil Anda.' },
          { q: 'Dapatkah saya mengubah alamat pengiriman?', a: 'Perubahan alamat hanya dapat dilakukan sebelum pesanan diproses oleh penjual.' },
          { q: 'Bagaimana jika barang yang diterima rusak?', a: 'Silakan ajukan komplain melalui menu pengembalian barang dalam 2x24 jam setelah diterima.' }
        ]
      },
      {
        category: 'Pembayaran',
        items: [
          { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami mendukung Transfer Bank, Kartu Kredit, dan E-Wallet (GoPay, OVO, Dana).' },
          { q: 'Berapa lama verifikasi pembayaran dilakukan?', a: 'Verifikasi otomatis dilakukan dalam waktu maksimal 10 menit setelah pembayaran.' },
          { q: 'Apakah saya bisa membayar dengan sistem COD?', a: 'Ya, metode COD tersedia untuk wilayah tertentu yang didukung kurir kami.' }
        ]
      },
      {
        category: 'Pengiriman',
        items: [
          { q: 'Kurir apa saja yang bekerja sama?', a: 'Kami bekerja sama dengan JNE, J&T, SiCepat, dan layanan pengiriman instan GoSend/GrabExpress.' },
          { q: 'Berapa lama estimasi pengiriman?', a: 'Estimasi pengiriman reguler adalah 2-4 hari kerja tergantung lokasi Anda.' },
          { q: 'Apakah melayani pengiriman internasional?', a: 'Saat ini kami hanya melayani pengiriman ke seluruh wilayah Indonesia.' }
        ]
      },
      {
        category: 'Akun',
        items: [
          { q: 'Bagaimana cara mengubah kata sandi?', a: 'Anda dapat mengubah kata sandi melalui menu Pengaturan Profil.' },
          { q: 'Saya lupa email akun saya, apa yang harus dilakukan?', a: 'Silakan hubungi tim dukungan kami dengan melampirkan nomor telepon yang terdaftar.' },
          { q: 'Apakah saya bisa menghapus akun secara permanen?', a: 'Ya, permintaan penghapusan akun dapat dilakukan melalui menu privasi di pengaturan.' }
        ]
      }
    ];

    return formatResponse(res, 200, true, 'FAQs retrieved successfully', { faqs });
  } catch (error) {
    next(error);
  }
};

const getContactInfo = async (req, res, next) => {
  try {
    const contactInfo = {
      email: 'support@ecommerceapp.com',
      whatsapp: '+6281234567890',
      operationalHours: 'Senin - Minggu, 09:00 - 21:00 WIB',
      address: 'Gedung Ecommerce, Lt. 5, Jakarta Selatan'
    };

    return formatResponse(res, 200, true, 'Contact info retrieved successfully', { contactInfo });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  getContactInfo
};
