const express = require('express');
const helpController = require('../controllers/helpController');

const router = express.Router();

router.get('/faqs', helpController.getFAQs);
router.get('/contact', helpController.getContactInfo);

module.exports = router;
