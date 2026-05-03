const ChatbotRule = require('../../models/ChatbotRule');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { formatResponse } = require('../../utils/response');

const getAllRules = async (req, res, next) => {
  try {
    const rules = await ChatbotRule.findAll({
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    const parsedRules = rules.map(rule => ({
      ...rule.toJSON(),
      keywords: JSON.parse(rule.keywords)
    }));

    const stats = {
      total: rules.length,
      active: rules.filter(r => r.isActive).length,
      inactive: rules.filter(r => !r.isActive).length
    };

    return formatResponse(res, 200, true, 'Rules retrieved successfully', { rules: parsedRules, stats });
  } catch (error) {
    next(error);
  }
};

const createRule = async (req, res, next) => {
  try {
    const { category, keywords, response, priority, isActive } = req.body;

    if (!keywords || keywords.length === 0) {
      return formatResponse(res, 400, false, 'Keywords cannot be empty');
    }
    if (!response) {
      return formatResponse(res, 400, false, 'Response cannot be empty');
    }

    const rule = await ChatbotRule.create({
      category,
      keywords: JSON.stringify(keywords),
      response,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    return formatResponse(res, 201, true, 'Rule created successfully', rule);
  } catch (error) {
    next(error);
  }
};

const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, keywords, response, priority, isActive } = req.body;

    const rule = await ChatbotRule.findByPk(id);
    if (!rule) return formatResponse(res, 404, false, 'Rule not found');

    await rule.update({
      category,
      keywords: keywords ? JSON.stringify(keywords) : rule.keywords,
      response,
      priority,
      isActive
    });

    return formatResponse(res, 200, true, 'Rule updated successfully', rule);
  } catch (error) {
    next(error);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await ChatbotRule.findByPk(id);
    if (!rule) return formatResponse(res, 404, false, 'Rule not found');

    await rule.destroy();
    return formatResponse(res, 200, true, 'Rule deleted successfully');
  } catch (error) {
    next(error);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await ChatbotRule.findByPk(id);
    if (!rule) return formatResponse(res, 404, false, 'Rule not found');

    await rule.update({ isActive: !rule.isActive });
    return formatResponse(res, 200, true, `Rule ${rule.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

const testRule = async (req, res, next) => {
  try {
    const { message } = req.body;
    const msg = message.toLowerCase();

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

    if (matchedRule) {
      let previewResponse = matchedRule.response
        .replace('{userName}', 'Test Admin')
        .replace('{orderCount}', '5');

      return formatResponse(res, 200, true, 'Match found', {
        match: true,
        rule: {
          category: matchedRule.category,
          keywords: JSON.parse(matchedRule.keywords),
          priority: matchedRule.priority
        },
        previewResponse
      });
    }

    return formatResponse(res, 200, true, 'No match found', {
      match: false,
      previewResponse: 'Maaf saya tidak mengerti. Ketik bantuan untuk melihat apa yang bisa saya bantu.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  toggleActive,
  testRule
};
