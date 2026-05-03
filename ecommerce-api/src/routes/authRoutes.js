const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name')
      .notEmpty().withMessage('Nama wajib diisi')
      .isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
    body('email')
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Format email tidak valid'),
    body('password')
      .notEmpty().withMessage('Password wajib diisi')
      .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
      .matches(/[A-Z]/).withMessage('Password harus mengandung minimal 1 huruf besar')
      .matches(/[a-z]/).withMessage('Password harus mengandung minimal 1 huruf kecil')
      .matches(/[0-9]/).withMessage('Password harus mengandung minimal 1 angka'),
    validateMiddleware
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .notEmpty().withMessage('Email wajib diisi')
      .isEmail().withMessage('Format email tidak valid'),
    body('password')
      .notEmpty().withMessage('Password wajib diisi'),
    validateMiddleware
  ],
  authController.login
);

// GET /api/auth/me (Protected)
router.get(
  '/me',
  authMiddleware,
  authController.getMe
);

// POST /api/auth/logout
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

module.exports = router;
