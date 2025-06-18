const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/products');
const Order = require('../models/orders');
const { isAuthenticated } = require('../middleware/auth'); // Use the shared isAuthenticated middleware

// Product detail route
router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        res.render('product-detail', {
            title: product.name,
            product: product,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).render('error', { message: 'Error loading product' });
    }
});

// Profile route
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user.id })
            .sort({ createdAt: -1 });
        res.render('profile', {
            title: 'My Profile',
            user: req.session.user,
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).render('error', { message: 'Error loading profile' });
    }
});

module.exports = router;
