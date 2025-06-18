const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart routes - no authentication required
router.post('/add', cartController.addToCart);
router.get('/', cartController.viewCart);
router.post('/update-session/:productId', cartController.updateSessionQuantity);
router.post('/remove-session/:productId', cartController.removeSessionItem);

module.exports = router; 