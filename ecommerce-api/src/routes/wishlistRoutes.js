const express = require('express');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Protect all routes below

router.get('/', getWishlist);
router.post('/', toggleWishlist);

module.exports = router;
