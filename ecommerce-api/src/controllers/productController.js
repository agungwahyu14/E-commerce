const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { formatResponse } = require('../utils/response');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    // Pagination setup
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    // Filter setup
    const whereClause = {};

    if (category && category !== 'semua' && category !== 'all') {
      whereClause.categoryId = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Query DB
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: limitNumber,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: Category }]
    });

    const totalPages = Math.ceil(count / limitNumber);

    const paginationData = {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: totalPages
    };

    return formatResponse(res, 200, true, 'Products retrieved successfully', {
      products,
      pagination: paginationData
    });
  } catch (error) {
    next(error); // Pass to errorMiddleware
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch the product with its category
    const product = await Product.findByPk(id, {
      include: [{ model: Category }]
    });

    if (!product) {
      return formatResponse(res, 404, false, 'Product not found');
    }

    // Fetch related products (same category, excluding current product)
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id }
      },
      limit: 6,
      order: [['rating', 'DESC']]
    });

    return formatResponse(res, 200, true, 'Product detail retrieved successfully', {
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};


const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      order: [['rating', 'DESC']],
      limit: 6
    });

    return formatResponse(res, 200, true, 'Featured products retrieved successfully', {
      products
    });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort = 'latest', page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const whereClause = {};

    // Search Keyword
    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }

    // Category Filter
    if (category && category !== 'semua' && category !== 'all') {
      whereClause.categoryId = category;
    }

    // Price Filter
    if (minPrice && maxPrice) {
      whereClause.price = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    } else if (minPrice) {
      whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice) {
      whereClause.price = { [Op.lte]: parseFloat(maxPrice) };
    }

    // Dynamic Sorting
    let orderClause = [['createdAt', 'DESC']]; // default latest
    if (sort === 'price_asc') {
      orderClause = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      orderClause = [['price', 'DESC']];
    } else if (sort === 'rating') {
      orderClause = [['rating', 'DESC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: limitNumber,
      offset: offset,
      order: orderClause,
      include: [{ model: Category }]
    });

    const totalPages = Math.ceil(count / limitNumber);

    return formatResponse(res, 200, true, 'Products search results', {
      products,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        totalPages
      },
      filters: {
        q,
        category,
        minPrice,
        maxPrice,
        sort
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts
};
