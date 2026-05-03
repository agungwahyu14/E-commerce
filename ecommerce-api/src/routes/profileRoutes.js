const express = require('express');
const { getProfile, updateProfile, uploadAvatar, changePassword } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

router.use(authMiddleware); // Protect all routes below

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);

module.exports = router;
