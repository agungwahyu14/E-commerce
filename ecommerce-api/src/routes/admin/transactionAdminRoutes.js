const express = require('express');
const transactionAdminController = require('../../controllers/admin/transactionAdminController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, transactionAdminController.getAllTransactions);
router.post('/sync-all', authMiddleware, adminMiddleware, transactionAdminController.syncAllPendingOrders);
router.get('/:orderId', authMiddleware, adminMiddleware, transactionAdminController.getTransactionDetail);
router.post('/:orderId/retry-webhook', authMiddleware, adminMiddleware, transactionAdminController.retryWebhook);

module.exports = router;
