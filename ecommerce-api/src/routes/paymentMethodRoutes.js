const express = require('express');
const paymentMethodController = require('../controllers/paymentMethodController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, paymentMethodController.getPaymentMethods);
router.post('/', authMiddleware, paymentMethodController.addPaymentMethod);
router.delete('/:id', authMiddleware, paymentMethodController.deletePaymentMethod);
router.patch('/:id/default', authMiddleware, paymentMethodController.setDefault);

module.exports = router;
