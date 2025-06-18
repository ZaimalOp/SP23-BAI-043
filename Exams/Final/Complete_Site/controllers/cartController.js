const Cart = require('../models/cart');
const Product = require('../models/products');

// Initialize cart in session if not exists
const initCart = (req) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            total: 0
        };
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Product ID:', req.body.productId);
    console.log('Quantity:', req.body.quantity);
    
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        console.log('Product found:', product ? product.name : 'NOT FOUND');
        
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('back');
        }

        // Initialize session cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = {
                items: [],
                total: 0
            };
        }

        console.log('Current cart items:', req.session.cart.items.length);

        // Check if item already exists in cart
        const existingItem = req.session.cart.items.find(item => 
            item.productId === productId
        );

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            existingItem.subtotal = existingItem.quantity * existingItem.price;
            console.log('Updated existing item quantity to:', existingItem.quantity);
        } else {
            req.session.cart.items.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: parseInt(quantity),
                subtotal: product.price * parseInt(quantity)
            });
            console.log('Added new item to cart');
        }

        // Update cart total
        req.session.cart.total = req.session.cart.items.reduce((total, item) => total + item.subtotal, 0);
        console.log('Cart total updated to:', req.session.cart.total);

        req.flash('success', 'Product added to cart');
        console.log('Redirecting to /cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
        req.flash('error', 'Error adding product to cart');
        res.redirect('back');
    }
};

// View cart
exports.viewCart = async (req, res) => {
    try {
        // Use session cart only
        const cart = req.session.cart || { items: [], total: 0 };
        
        res.render('cart', {
            title: 'Shopping Cart',
            cart: cart
        });
    } catch (error) {
        console.error('Error viewing cart:', error);
        req.flash('error', 'Error loading cart');
        res.redirect('/cart');
    }
};

// Update cart item quantity
exports.updateQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        console.log('updateQuantity: Received itemId:', itemId, 'and quantity:', quantity);

        const cart = await Cart.findOne({ user: req.session.user.id });
        
        if (!cart) {
            console.log('updateQuantity: Cart not found for user', req.session.user.id);
            req.flash('error', 'Cart not found');
            return res.redirect('/cart');
        }

        const item = cart.items.id(itemId);
        if (!item) {
            console.log('updateQuantity: Item', itemId, 'not found in cart.');
            req.flash('error', 'Item not found in cart');
            return res.redirect('/cart');
        }

        console.log('updateQuantity: Item found. Current quantity:', item.quantity, 'New quantity proposed:', quantity);

        if (quantity <= 0) {
            cart.items.pull(itemId);
            console.log('updateQuantity: Item pulled due to quantity <= 0.');
        } else {
            item.quantity = quantity;
            console.log('updateQuantity: Item quantity updated to:', item.quantity);
        }

        await cart.save();
        console.log('updateQuantity: Cart saved successfully. Redirecting to /cart.');
        req.flash('success', 'Cart updated');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error updating cart:', error);
        req.flash('error', 'Error updating cart');
        res.redirect('/cart');
    }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const cart = await Cart.findOne({ user: req.session.user.id });
        
        if (!cart) {
            req.flash('error', 'Cart not found');
            return res.redirect('/cart');
        }

        cart.items.pull(itemId);
        await cart.save();
        
        req.flash('success', 'Item removed from cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing item:', error);
        req.flash('error', 'Error removing item from cart');
        res.redirect('/cart');
    }
};

// Get Cart
exports.getCart = (req, res) => {
    initCart(req);
    res.render('cart', {
        title: 'Shopping Cart',
        cart: req.session.cart
    });
};

// Update Cart
exports.updateCart = (req, res) => {
    try {
        const { productId, quantity } = req.body;
        initCart(req);

        const item = req.session.cart.items.find(item => item.productId.toString() === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            item.subtotal = item.quantity * item.price;
        }

        // Update cart total
        req.session.cart.total = req.session.cart.items.reduce((total, item) => total + item.subtotal, 0);

        res.json({
            success: true,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart'
        });
    }
};

// Remove from Cart
exports.removeFromCart = (req, res) => {
    try {
        const { productId } = req.params;
        initCart(req);

        req.session.cart.items = req.session.cart.items.filter(
            item => item.productId.toString() !== productId
        );

        // Update cart total
        req.session.cart.total = req.session.cart.items.reduce((total, item) => total + item.subtotal, 0);

        req.flash('success', 'Product removed from cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Remove from cart error:', error);
        req.flash('error', 'Error removing product from cart');
        res.redirect('/cart');
    }
};

// Clear Cart
exports.clearCart = (req, res) => {
    req.session.cart = {
        items: [],
        total: 0
    };
    req.flash('success', 'Cart cleared');
    res.redirect('/cart');
};

// Update session cart item quantity (for guest users)
exports.updateSessionQuantity = (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (!req.session.cart) {
            req.flash('error', 'Cart not found');
            return res.redirect('/cart');
        }

        const item = req.session.cart.items.find(item => item.productId === productId);
        if (!item) {
            req.flash('error', 'Item not found in cart');
            return res.redirect('/cart');
        }

        if (quantity <= 0) {
            req.session.cart.items = req.session.cart.items.filter(item => item.productId !== productId);
        } else {
            item.quantity = parseInt(quantity);
            item.subtotal = item.quantity * item.price;
        }

        // Update cart total
        req.session.cart.total = req.session.cart.items.reduce((total, item) => total + item.subtotal, 0);

        req.flash('success', 'Cart updated');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error updating session cart:', error);
        req.flash('error', 'Error updating cart');
        res.redirect('/cart');
    }
};

// Remove item from session cart (for guest users)
exports.removeSessionItem = (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.session.cart) {
            req.flash('error', 'Cart not found');
            return res.redirect('/cart');
        }

        req.session.cart.items = req.session.cart.items.filter(item => item.productId !== productId);
        
        // Update cart total
        req.session.cart.total = req.session.cart.items.reduce((total, item) => total + item.subtotal, 0);
        
        req.flash('success', 'Item removed from cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing session item:', error);
        req.flash('error', 'Error removing item from cart');
        res.redirect('/cart');
    }
}; 