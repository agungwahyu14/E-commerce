const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Get featured products (must be placed before /:id)
router.get('/featured', productController.getFeaturedProducts);

// Get all products (with filters and pagination)
router.get('/', productController.getAllProducts);

// Search products (must be placed before /:id)
router.get('/search', productController.searchProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

module.exports = router;
