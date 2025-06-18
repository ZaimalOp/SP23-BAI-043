const Product = require('../models/products');
const Order = require('../models/orders');
const User = require('../models/user');

exports.getDashboard = async (req, res) => {
    console.log('Attempting to access Admin Dashboard...');
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

        console.log('Dashboard data fetched:', { totalProducts, totalOrders, pendingOrders, shippedOrders, deliveredOrders });

        res.render('admin/dashboard', {
            layout: 'admin/layout',
            pageTitle: 'Admin Dashboard',
            totalProducts,
            totalOrders,
            pendingOrders,
            shippedOrders,
            deliveredOrders
        });
        console.log('Admin Dashboard rendered successfully.');
    } catch (err) {
        console.error('Error in getDashboard:', err);
        req.flash('error', 'Failed to load dashboard. Please try again.');
        res.redirect('/admin/login');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', {
            layout: 'admin/layout',
            pageTitle: 'Manage Products',
            products
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/login');
    }
};

exports.getAddProduct = (req, res) => {
    res.render('admin/product-form', {
        layout: 'admin/layout',
        pageTitle: 'Add Product',
        editing: false,
        product: {}
    });
};

exports.postAddProduct = async (req, res) => {
    const { name, description, price, images, category, stock, featured } = req.body;
    try {
        const product = new Product({
            name,
            description,
            price,
            images,
            category,
            stock,
            featured: featured === 'on' ? true : false
        });
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.render('admin/product-form', {
            layout: 'admin/layout',
            pageTitle: 'Add Product',
            editing: false,
            product: req.body,
            errorMessage: 'Failed to add product.'
        });
    }
};

exports.getEditProduct = async (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/admin/products');
    }
    const prodId = req.params.productId;
    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.redirect('/admin/products');
        }
        res.render('admin/product-form', {
            layout: 'admin/layout',
            pageTitle: 'Edit Product',
            editing: editMode,
            product: product
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

exports.postEditProduct = async (req, res) => {
    const prodId = req.body.productId;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    const updatedImages = req.body.images;
    const updatedCategory = req.body.category;
    const updatedStock = req.body.stock;
    const updatedFeatured = req.body.featured === 'on' ? true : false;

    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.redirect('/admin/products');
        }
        product.name = updatedName;
        product.description = updatedDescription;
        product.price = updatedPrice;
        product.images = updatedImages;
        product.category = updatedCategory;
        product.stock = updatedStock;
        product.featured = updatedFeatured;
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.render('admin/product-form', {
            layout: 'admin/layout',
            pageTitle: 'Edit Product',
            editing: true,
            product: req.body,
            errorMessage: 'Failed to update product.'
        });
    }
};

exports.postDeleteProduct = async (req, res) => {
    const prodId = req.body.productId;
    try {
        await Product.findByIdAndRemove(prodId);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

exports.getOrders = async (req, res) => {
    console.log('getOrders controller triggered');
    console.log('Request details:', {
        path: req.path,
        originalUrl: req.originalUrl,
        method: req.method,
        user: req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user'
    });
    
    try {
        // Fetch orders with populated user and product data
        const orders = await Order.find()
            .populate({
                path: 'user',
                select: 'name email'
            })
            .populate({
                path: 'items.product',
                select: 'name price imageUrl'
            })
            .sort({ createdAt: -1 });

        console.log('Orders fetched successfully:', orders.length);

        // Render the admin orders view
        console.log('Rendering admin orders view');
        return res.render('admin/orders', {
            layout: 'admin/layout',
            pageTitle: 'Manage Orders',
            orders: orders || [],
            messages: req.flash()
        });
    } catch (err) {
        console.error('Error in getOrders:', err);
        req.flash('error', 'Failed to load orders. Please try again.');
        return res.redirect('/admin');
    }
};

exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        order.status = status;
        await order.save();
        req.flash('success', 'Order status updated successfully');
        res.redirect('/admin/orders');
    } catch (err) {
        console.error('Error in updateOrderStatus:', err);
        req.flash('error', 'Failed to update order status');
        res.redirect('/admin/orders');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render('admin/users', {
            layout: 'admin/layout',
            pageTitle: 'Manage Users',
            users: users
        });
    } catch (err) {
        console.error('Error in getUsers:', err);
        req.flash('error', 'Failed to load users.');
        res.redirect('/admin');
    }
}; 