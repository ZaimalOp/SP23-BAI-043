const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const { isAuthenticated } = require('../middleware/auth');

// Get user's orders
router.get('/my-orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.render('orders/my-orders', {
            title: 'My Orders',
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'Error loading orders');
        res.redirect('/');
    }
});

// Get order details
router.get('/my-orders/:orderId', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.session.user.id
        }).populate('items.product');

        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/my-orders');
        }

        res.render('orders/order-details', {
            title: 'Order Details',
            order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        req.flash('error', 'Error loading order details');
        res.redirect('/my-orders');
    }
});

module.exports = router; 