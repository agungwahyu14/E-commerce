const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/couriers', shippingController.getCouriers);
router.get('/services', shippingController.getServices);
router.post('/calculate', authMiddleware, shippingController.calculateShipping);
router.get('/all', shippingController.getAllShippingOptions);

module.exports = router;
