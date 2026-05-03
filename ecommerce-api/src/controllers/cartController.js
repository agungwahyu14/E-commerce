const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { formatResponse } = require('../utils/response');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          include: [{ model: Category }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate total
    let totalItems = 0;
    let totalPrice = 0;

    cartItems.forEach(item => {
      totalItems += item.quantity;
      const price = item.Product.isFlashSale && item.Product.discountPercentage 
        ? item.Product.price 
        : item.Product.price; // adjust logic if actual price changes during flash sale
      totalPrice += price * item.quantity;
    });

    return formatResponse(res, 200, true, 'Cart retrieved successfully', {
      cart: cartItems,
      summary: {
        totalItems,
        totalPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return formatResponse(res, 400, false, 'Product ID is required');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return formatResponse(res, 404, false, 'Product not found');
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (existingCartItem) {
      existingCartItem.quantity += parseInt(quantity, 10);
      await existingCartItem.save();
      return formatResponse(res, 200, true, 'Cart item updated', {
        cartItem: existingCartItem
      });
    }

    const newCartItem = await Cart.create({
      userId,
      productId,
      quantity: parseInt(quantity, 10)
    });

    return formatResponse(res, 201, true, 'Item added to cart', {
      cartItem: newCartItem
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return formatResponse(res, 400, false, 'Valid quantity is required');
    }

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return formatResponse(res, 404, false, 'Cart item not found');
    }

    cartItem.quantity = parseInt(quantity, 10);
    await cartItem.save();

    return formatResponse(res, 200, true, 'Cart item updated', {
      cartItem
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart item ID

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return formatResponse(res, 404, false, 'Cart item not found');
    }

    await cartItem.destroy();

    return formatResponse(res, 200, true, 'Cart item removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
