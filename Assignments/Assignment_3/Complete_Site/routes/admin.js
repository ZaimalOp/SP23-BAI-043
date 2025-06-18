const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Log all admin route requests
router.use((req, res, next) => {
    console.log('Admin Route Middleware - Request Details:');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('User:', req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user');
    next();
});

// Apply authentication middleware
router.use(authMiddleware.isAuthenticated);

// Apply admin middleware
router.use(authMiddleware.isAdmin);

// Admin Dashboard
router.get('/', adminController.getDashboard);

// Product Management
router.get('/products', adminController.getProducts);
router.get('/products/add', adminController.getAddProduct);
router.post('/products/add', adminController.postAddProduct);
router.get('/products/edit/:productId', adminController.getEditProduct);
router.post('/products/edit', adminController.postEditProduct);
router.post('/products/delete', adminController.postDeleteProduct);

// Order Management
router.get('/orders', (req, res, next) => {
    console.log('Accessing admin orders route...');
    console.log('Request details:', {
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method,
        user: req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user'
    });
    next();
}, adminController.getOrders);

router.post('/orders/:orderId/status', (req, res, next) => {
    console.log('Updating order status...');
    console.log('Order ID:', req.params.orderId);
    console.log('New status:', req.body.status);
    next();
}, adminController.updateOrderStatus);

// User Management
router.get('/users', adminController.getUsers);

// Catch-all route for admin panel
router.use((req, res) => {
    console.log('Admin catch-all route triggered for:', req.originalUrl);
    if (req.path === '/orders') {
        return res.redirect('/admin/orders');
    }
    res.redirect('/admin');
});

module.exports = router; 