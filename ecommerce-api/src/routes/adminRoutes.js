const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard/stats', authMiddleware, adminMiddleware, adminController.getDashboardStats);

// Products Management
router.get('/products', authMiddleware, adminMiddleware, adminController.getAdminProducts);
router.post('/products', authMiddleware, adminMiddleware, adminController.createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, adminController.updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, adminController.deleteProduct);

// Orders Management
router.get('/orders', authMiddleware, adminMiddleware, adminController.getAdminOrders);
router.get('/orders/:id', authMiddleware, adminMiddleware, adminController.getAdminOrderById);
router.put('/orders/:id/status', authMiddleware, adminMiddleware, adminController.updateOrderStatus);

// Users Management
router.get('/users', authMiddleware, adminMiddleware, adminController.getAdminUsers);
router.patch('/users/:id/toggle-active', authMiddleware, adminMiddleware, adminController.toggleUserActive);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, adminController.updateUserRole);

module.exports = router;
