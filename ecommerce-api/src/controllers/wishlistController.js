const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { formatResponse } = require('../utils/response');

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          include: [{ model: Category }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Wishlist retrieved successfully', {
      wishlist: wishlistItems
    });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return formatResponse(res, 400, false, 'Product ID is required');
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return formatResponse(res, 404, false, 'Product not found');
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      where: { userId, productId }
    });

    if (existingWishlist) {
      // Remove from wishlist
      await existingWishlist.destroy();
      return formatResponse(res, 200, true, 'Product removed from wishlist', {
        isWishlisted: false
      });
    } else {
      // Add to wishlist
      await Wishlist.create({ userId, productId });
      return formatResponse(res, 201, true, 'Product added to wishlist', {
        isWishlisted: true
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist
};
