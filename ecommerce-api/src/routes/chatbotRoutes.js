const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/message', authMiddleware, chatbotController.processMessage);

module.exports = router;
