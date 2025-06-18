const Product = require('../models/products');

// Get All Products with Filtering
exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Build sort
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
                sort = { createdAt: -1 };
        }

        // Get products
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.render('products', {
            title: 'Products',
            products,
            currentPage: page,
            totalPages,
            queryString: new URLSearchParams(req.query).toString(),
            category: req.query.category,
            sort: req.query.sort,
            search: req.query.search
        });
    } catch (error) {
        console.error('Get products error:', error);
        req.flash('error', 'Error loading products');
        res.redirect('/');
    }
};

// Get Single Product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }

        console.log('Product fetched for detail page:', product);
        console.log('Product images path:', product.images);

        // Get related products
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.render('products/detail', {
            title: product.name,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Get product error:', error);
        req.flash('error', 'Error loading product');
        res.redirect('/products');
    }
};

// Get Featured Products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true }).limit(4);
        return featuredProducts;
    } catch (error) {
        console.error('Get featured products error:', error);
        return [];
    }
};

// Get Latest Products
exports.getLatestProducts = async (req, res) => {
    try {
        const latestProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(4);
        return latestProducts;
    } catch (error) {
        console.error('Get latest products error:', error);
        return [];
    }
};

// Admin: Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            images: req.file ? req.file.path : 'default-product.jpg'
        });

        req.flash('success', 'Product created successfully');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Create product error:', error);
        req.flash('error', 'Error creating product');
        res.redirect('/admin/products/new');
    }
};

// Admin: Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.stock = stock;
        if (req.file) {
            product.images = req.file.path;
        }

        await product.save();

        req.flash('success', 'Product updated successfully');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error', 'Error updating product');
        res.redirect('/admin/products');
    }
};

// Admin: Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        await product.remove();

        req.flash('success', 'Product deleted successfully');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Delete product error:', error);
        req.flash('error', 'Error deleting product');
        res.redirect('/admin/products');
    }
}; 