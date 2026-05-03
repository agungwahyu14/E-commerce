const express = require('express');
const chatbotAdminController = require('../../controllers/admin/chatbotAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

// All routes protected by adminMiddleware
router.get('/rules', authMiddleware, adminMiddleware, chatbotAdminController.getAllRules);
router.post('/rules', authMiddleware, adminMiddleware, chatbotAdminController.createRule);
router.put('/rules/:id', authMiddleware, adminMiddleware, chatbotAdminController.updateRule);
router.delete('/rules/:id', authMiddleware, adminMiddleware, chatbotAdminController.deleteRule);
router.patch('/rules/:id/toggle', authMiddleware, adminMiddleware, chatbotAdminController.toggleActive);
router.post('/test', authMiddleware, adminMiddleware, chatbotAdminController.testRule);

module.exports = router;
