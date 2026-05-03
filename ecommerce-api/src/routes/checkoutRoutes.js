const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, checkoutController.createCheckout);
router.post('/webhook', checkoutController.handleWebhook);
router.post('/sync/:orderId', authMiddleware, checkoutController.syncOrderStatus);
router.get('/order/:orderId', authMiddleware, checkoutController.getOrderDetailWithSync);

module.exports = router;
