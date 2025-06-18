const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { isAuthenticated } = require('../middleware/auth');

// Debug middleware for checkout routes
router.use((req, res, next) => {
    console.log('=== CHECKOUT ROUTE DEBUG ===');
    console.log('Checkout route accessed:', req.method, req.path);
    console.log('Full URL:', req.originalUrl);
    next();
});

// Checkout routes
router.get('/', checkoutController.showCheckout);
router.post('/place-order', isAuthenticated, checkoutController.placeOrder);
router.get('/orderplaced', isAuthenticated, checkoutController.orderConfirmation);

module.exports = router; 