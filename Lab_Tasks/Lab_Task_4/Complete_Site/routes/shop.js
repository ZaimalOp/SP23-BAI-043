const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const checkoutController = require('../controllers/checkoutController');

// Test checkout route - simple response
router.get('/checkout-test', (req, res) => {
    console.log('=== CHECKOUT TEST ROUTE HIT ===');
    res.send('Checkout test route working!');
});

// Checkout route - handle it directly in shop routes
router.get('/checkout', checkoutController.showCheckout);

// Home/Landing page
router.get('/', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true }).limit(4);
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(4);
        
        res.render('index', {
            title: 'Home',
            featuredProducts,
            newArrivals
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'Error loading products');
        res.render('index', {
            title: 'Home',
            featuredProducts: [],
            newArrivals: []
        });
    }
});

// Products page with pagination and filtering
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12; // Products per page
        const skip = (page - 1) * limit;

        // Build query based on filters
        const query = {};
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Build sort object
        let sort = {};
        switch (req.query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'name_asc':
                sort = { name: 1 };
                break;
            case 'name_desc':
                sort = { name: -1 };
                break;
            default:
                sort = { createdAt: -1 }; // Default: newest first
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch products
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Build query string for pagination links
        const queryParams = new URLSearchParams(req.query);
        queryParams.delete('page');
        const queryString = queryParams.toString();

        res.render('products', {
            title: 'Products',
            products,
            currentPage: page,
            totalPages,
            queryString,
            search: req.query.search,
            category: req.query.category,
            sort: req.query.sort
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'Error loading products');
        res.render('products', {
            title: 'Products',
            products: [],
            currentPage: 1,
            totalPages: 1,
            queryString: '',
            search: '',
            category: '',
            sort: ''
        });
    }
});

// Product detail page
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }

        // Fetch related products (same category, excluding current product)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id } // Exclude the current product
        }).limit(4); // Limit to, say, 4 related products

        res.render('products/detail', {
            title: product.name,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        req.flash('error', 'Error loading product');
        res.redirect('/products');
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us'
    });
});

module.exports = router; 