const sequelize = require('./database');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Collection = require('../models/Collection');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const PaymentMethod = require('../models/PaymentMethod');
const ChatbotRule = require('../models/ChatbotRule');

// Define Relationships here for seeder sync
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Orders Relationships
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Payment Methods Relationships
User.hasMany(PaymentMethod, { foreignKey: 'userId' });
PaymentMethod.belongsTo(User, { foreignKey: 'userId' });

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();

    console.log('Syncing database with force: true...');
    await sequelize.sync({ force: true });

    console.log('Generating dummy users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersData = [
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        phone: '08123456789',
        address: 'Admin Office, Jakarta',
        avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
      },
      {
        name: 'John Doe',
        email: 'user@gmail.com',
        password: hashedPassword,
        role: 'customer',
        phone: '08987654321',
        address: 'Pahlawan Street No. 42, Bandung',
        avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff',
        bio: 'I love shopping and quality products!'
      }
    ];
    const createdUsers = await User.bulkCreate(usersData);
    const customerUser = createdUsers.find(u => u.role === 'customer');

    console.log('Generating dummy categories...');
    const categoriesData = [
      { name: 'Electronics', icon: 'desktop-outline' },
      { name: 'Fashion', icon: 'shirt-outline' },
      { name: 'Food', icon: 'fast-food-outline' },
      { name: 'Beauty', icon: 'rose-outline' },
      { name: 'Sports', icon: 'basketball-outline' },
      { name: 'Home', icon: 'home-outline' },
      { name: 'Books', icon: 'book-outline' },
      { name: 'Toys', icon: 'game-controller-outline' }
    ];
    const createdCategories = await Category.bulkCreate(categoriesData);

    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('Generating dummy banners...');
    const bannersData = [
      {
        title: 'Summer Sale 50% Off!',
        subtitle: 'On all electronics and gadgets',
        imageUrl: 'https://picsum.photos/seed/banner1/800/400',
        isActive: true
      },
      {
        title: 'New Fashion Arrival',
        subtitle: 'Upgrade your wardrobe today',
        imageUrl: 'https://picsum.photos/seed/banner2/800/400',
        isActive: true
      },
      {
        title: 'Fresh Groceries',
        subtitle: 'Delivered straight to your door',
        imageUrl: 'https://picsum.photos/seed/banner3/800/400',
        isActive: true
      }
    ];
    await Banner.bulkCreate(bannersData);

    console.log('Generating dummy collections...');
    const collectionsData = [
      {
        title: 'Work From Home',
        imageUrl: 'https://picsum.photos/seed/col1/400/400',
        isActive: true
      },
      {
        title: 'Fitness Essentials',
        imageUrl: 'https://picsum.photos/seed/col2/400/400',
        isActive: true
      },
      {
        title: 'Gaming Gear',
        imageUrl: 'https://picsum.photos/seed/col3/400/400',
        isActive: true
      },
      {
        title: 'Skincare Routine',
        imageUrl: 'https://picsum.photos/seed/col4/400/400',
        isActive: true
      }
    ];
    await Collection.bulkCreate(collectionsData);

    console.log('Generating dummy products...');
    const productsData = [
      // Electronics
      {
        name: 'iPhone 15 Pro Max',
        description: 'Titanium design, A17 Pro chip, customizable Action button, and a more versatile Pro camera system.',
        price: 24999000,
        categoryId: categoryMap['Electronics'],
        isFeatured: true,
        isFlashSale: false,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8" flat display.',
        price: 21999000,
        categoryId: categoryMap['Electronics'],
        isFeatured: true,
        isFlashSale: false,
      },
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation, exceptional sound quality, and crystal clear hands-free calling.',
        price: 5999000,
        originalPrice: 6500000,
        discountPercentage: 8,
        categoryId: categoryMap['Electronics'],
        isFeatured: true,
        isFlashSale: true,
      },
      {
        name: 'MacBook Air 13" M2 Chip',
        description: 'Strikingly thin design, 13.6-inch Liquid Retina display, and up to 18 hours of battery life.',
        price: 18499000,
        categoryId: categoryMap['Electronics'],
        isFeatured: false,
        isFlashSale: false,
      },
      {
        name: 'PlayStation 5 Console',
        description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback.',
        price: 8999000,
        originalPrice: 9500000,
        discountPercentage: 5,
        categoryId: categoryMap['Electronics'],
        isFeatured: true,
        isFlashSale: true,
      },
      // Fashion
      {
        name: 'Nike Air Jordan 1 Low',
        description: 'Inspired by the original that debuted in 1985, the Air Jordan 1 Low offers a clean, classic look.',
        price: 1729000,
        categoryId: categoryMap['Fashion'],
        isFeatured: true,
        isFlashSale: false,
      },
      {
        name: 'Levi\'s 501 Original Fit Jeans',
        description: 'The original button fly jean. Our 501 Original Fit Jeans have been a canvas for self-expression since 1873.',
        price: 1099000,
        categoryId: categoryMap['Fashion'],
        isFeatured: false,
        isFlashSale: false,
      },
      {
        name: 'Adidas Samba OG Shoes',
        description: 'Born on the pitch, the Samba is a timeless icon of street style. This silhouette stays true to its legacy.',
        price: 1600000,
        originalPrice: 2000000,
        discountPercentage: 20,
        categoryId: categoryMap['Fashion'],
        isFeatured: true,
        isFlashSale: true,
      },
      // Food
      {
        name: 'Starbucks House Blend Ground Coffee',
        description: 'A blend of fine Latin American beans roasted to a glistening, dark chestnut color.',
        price: 145000,
        categoryId: categoryMap['Food'],
        isFeatured: false,
        isFlashSale: false,
      },
      {
        name: 'Ferrero Rocher T30 375g',
        description: 'Whole hazelnut in milk chocolate and chopped hazelnuts, surrounded by a crisp wafer.',
        price: 215000,
        categoryId: categoryMap['Food'],
        isFeatured: true,
        isFlashSale: false,
      },
      {
        name: 'Indomie Goreng Special (Pack of 5)',
        description: 'The world\'s favorite Indonesian instant noodles. Quick, delicious, and satisfying.',
        price: 15000,
        originalPrice: 17500,
        discountPercentage: 14,
        categoryId: categoryMap['Food'],
        isFeatured: false,
        isFlashSale: true,
      }
    ];

    const productsWithRandomData = productsData.map((item) => {
      const stock = Math.floor(Math.random() * 91) + 10;
      const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
      const seed = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      return {
        ...item,
        image_url: `https://picsum.photos/seed/${seed}/400/400`,
        stock,
        rating
      };
    });

    const createdProducts = await Product.bulkCreate(productsWithRandomData);

    console.log('Generating dummy wishlist items...');
    if (customerUser && createdProducts.length > 0) {
      const wishlistData = [
        { userId: customerUser.id, productId: createdProducts[0].id },
        { userId: customerUser.id, productId: createdProducts[5].id }
      ];
      await Wishlist.bulkCreate(wishlistData);
    }

    console.log('Generating dummy cart items...');
    if (customerUser && createdProducts.length > 0) {
      const cartData = [
        { userId: customerUser.id, productId: createdProducts[1].id, quantity: 1 },
        { userId: customerUser.id, productId: createdProducts[2].id, quantity: 2 }
      ];
      await Cart.bulkCreate(cartData);
    }

    console.log('Generating dummy orders...');
    if (customerUser && createdProducts.length >= 3) {
      // Order 1
      const order1 = await Order.create({
        userId: customerUser.id,
        status: 'delivered',
        totalAmount: createdProducts[0].price * 1,
        paymentMethod: 'Bank Transfer (BCA)',
        paymentStatus: 'paid',
        notes: 'Please deliver safely.'
      });
      await OrderItem.create({
        orderId: order1.id,
        productId: createdProducts[0].id,
        name: createdProducts[0].name,
        price: createdProducts[0].price,
        quantity: 1,
        image_url: createdProducts[0].image_url
      });

      // Order 2
      const order2 = await Order.create({
        userId: customerUser.id,
        status: 'processing',
        totalAmount: (createdProducts[1].price * 1) + (createdProducts[2].price * 2),
        paymentMethod: 'E-Wallet (GoPay)',
        paymentStatus: 'paid'
      });
      await OrderItem.bulkCreate([
        {
          orderId: order2.id,
          productId: createdProducts[1].id,
          name: createdProducts[1].name,
          price: createdProducts[1].price,
          quantity: 1,
          image_url: createdProducts[1].image_url
        },
        {
          orderId: order2.id,
          productId: createdProducts[2].id,
          name: createdProducts[2].name,
          price: createdProducts[2].price,
          quantity: 2,
          image_url: createdProducts[2].image_url
        }
      ]);

      // Order 3
      const order3 = await Order.create({
        userId: customerUser.id,
        status: 'pending',
        totalAmount: createdProducts[3].price * 1,
        paymentMethod: 'Bank Transfer (Mandiri)',
        paymentStatus: 'unpaid'
      });
      await OrderItem.create({
        orderId: order3.id,
        productId: createdProducts[3].id,
        name: createdProducts[3].name,
        price: createdProducts[3].price,
        quantity: 1,
        image_url: createdProducts[3].image_url
      });
    }

    // 10. Seed Chatbot Rules
    console.log('Seeding Chatbot Rules...');
    const chatbotRules = [
      {
        category: 'greeting',
        keywords: JSON.stringify(['halo', 'hi', 'hello', 'hai', 'selamat']),
        response: 'Halo {userName}! Saya adalah asisten belanja Anda. Ada yang bisa saya bantu?\n\nAnda bisa bertanya tentang:\n1. Status Pesanan (ketik: pesanan saya)\n2. Rekomendasi Produk (ketik: rekomendasi)\n3. Cari Kategori (ketik: elektronik/baju)\n4. Produk Termurah (ketik: harga murah)',
        priority: 10
      },
      {
        category: 'order',
        keywords: JSON.stringify(['order', 'pesanan', 'status', 'tracking']),
        response: 'Hai {userName}, Anda memiliki {orderCount} pesanan terbaru. Berikut adalah daftarnya:',
        priority: 5
      },
      {
        category: 'product',
        keywords: JSON.stringify(['rekomendasi', 'produk', 'suggest', 'pilih', 'bagus', 'terbaik']),
        response: 'Tentu {userName}! Berikut adalah produk-produk terbaik dengan rating tertinggi khusus untuk Anda:',
        priority: 5
      },
      {
        category: 'price',
        keywords: JSON.stringify(['harga', 'murah', 'hemat', 'price']),
        response: 'Sedang mencari barang ekonomis? Ini adalah 5 produk dengan harga termurah di toko kami:',
        priority: 5
      },
      {
        category: 'help',
        keywords: JSON.stringify(['bantuan', 'help', 'tolong', 'cara', 'fitur']),
        response: 'Saya bisa membantu Anda dengan perintah berikut:\n- "pesanan": Cek status pesanan terbaru\n- "rekomendasi": Lihat produk terbaik\n- "elektronik/baju": Cari produk per kategori\n- "harga murah": Lihat produk paling terjangkau',
        priority: 10
      },
      {
        category: 'custom',
        keywords: JSON.stringify(['elektronik', 'electronic', 'gadget', 'hp', 'laptop']),
        response: 'Mencari gadget baru? Berikut adalah koleksi elektronik terbaru kami:',
        priority: 3
      },
      {
        category: 'custom',
        keywords: JSON.stringify(['baju', 'pakaian', 'fashion', 'celana', 'kaos']),
        response: 'Tampil gaya setiap hari! Lihat koleksi fashion kami:',
        priority: 3
      }
    ];

    for (const rule of chatbotRules) {
      await ChatbotRule.create(rule);
    }

    console.log('Successfully seeded all tables!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedDatabase();
