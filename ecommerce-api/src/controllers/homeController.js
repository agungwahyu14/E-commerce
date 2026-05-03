const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Collection = require('../models/Collection');

exports.getHomeData = async (req, res) => {
  try {
    // Run queries in parallel for performance
    const [banners, categories, collections, featured, flashSale, allProducts] = await Promise.all([
      Banner.findAll({ where: { isActive: true } }),
      Category.findAll(),
      Collection.findAll({ where: { isActive: true } }),
      Product.findAll({ where: { isFeatured: true }, limit: 5 }),
      Product.findAll({ where: { isFlashSale: true }, limit: 5 }),
      Product.findAll({ limit: 20 }) // Limit to 20 for initial load
    ]);

    res.status(200).json({
      success: true,
      data: {
        banners,
        categories,
        collections,
        featuredProducts: featured,
        flashSale,
        allProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
