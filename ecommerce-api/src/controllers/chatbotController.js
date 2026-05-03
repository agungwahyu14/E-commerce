const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ChatbotRule = require('../models/ChatbotRule');
const { formatResponse } = require('../utils/response');
const { Op } = require('sequelize');

const processMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user;
    const msg = message.toLowerCase();

    // 1. Get all active rules ordered by priority
    const rules = await ChatbotRule.findAll({
      where: { isActive: true },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    let matchedRule = null;
    for (const rule of rules) {
      const keywords = JSON.parse(rule.keywords);
      const isMatch = keywords.some(k => msg.includes(k.toLowerCase()));
      if (isMatch) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return formatResponse(res, 200, true, 'Default response', {
        type: 'unknown',
        message: 'Maaf saya tidak mengerti maksud Anda. Ketik "bantuan" untuk melihat apa yang bisa saya lakukan.'
      });
    }

    // 2. Process Response Template
    let responseText = matchedRule.response;
    
    // Global variable replacement
    responseText = responseText.replace(/{userName}/g, user.name);

    // Contextual Data Fetching based on Category
    let products = [];
    let orders = [];

    if (matchedRule.category === 'order') {
      orders = await Order.findAll({
        where: { userId: user.id },
        limit: 3,
        order: [['createdAt', 'DESC']]
      });
      responseText = responseText.replace(/{orderCount}/g, orders.length);
    } 
    else if (matchedRule.category === 'product') {
      products = await Product.findAll({
        limit: 6,
        order: [['rating', 'DESC']]
      });
    }
    else if (matchedRule.category === 'price') {
      products = await Product.findAll({
        limit: 5,
        order: [['price', 'ASC']]
      });
    }

    return formatResponse(res, 200, true, 'Bot response', {
      type: matchedRule.category,
      message: responseText,
      products: products.length > 0 ? products : undefined,
      orders: orders.length > 0 ? orders : undefined
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  processMessage
};
