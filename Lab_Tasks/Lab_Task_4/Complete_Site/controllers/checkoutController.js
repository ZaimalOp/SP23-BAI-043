const Order = require('../models/orders');
const Cart = require('../models/cart');

// Show checkout page
exports.showCheckout = async (req, res) => {
    console.log('=== CHECKOUT CONTROLLER CALLED ===');
    console.log('showCheckout function called');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Session ID:', req.sessionID);
    console.log('Session user:', req.session.user ? `Email: ${req.session.user.email}` : 'No user');
    console.log('Session cart:', req.session.cart);
    console.log('Session flash messages:', req.flash());
    console.log('Response headers:', res.getHeaders());
    
    try {
        // Use session cart only
        const cart = req.session.cart || { items: [], total: 0 };
        console.log('Cart being passed to view:', cart);
        
        // Always render checkout page for testing, even if cart is empty
        console.log('About to render checkout.ejs');
        
        // Check if checkout.ejs exists
        const fs = require('fs');
        const path = require('path');
        const checkoutViewPath = path.join(__dirname, '../views/checkout.ejs');
        console.log('Checkout view path:', checkoutViewPath);
        console.log('Checkout view exists:', fs.existsSync(checkoutViewPath));
        
        res.render('checkout', {
            title: 'Checkout',
            cart
        });
        console.log('Checkout page rendered successfully');
    } catch (error) {
        console.error('Error loading checkout:', error);
        console.error('Error stack:', error.stack);
        req.flash('error', 'Error loading checkout page');
        res.redirect('/cart');
    }
};

// Place order
exports.placeOrder = async (req, res) => {
    try {
        console.log('--- placeOrder function triggered ---');
        console.log('User ID from session:', req.session.user ? req.session.user.id : 'Not found');

        const cart = await Cart.findOne({ user: req.session.user.id })
            .populate('items.product');
        
        console.log('Cart found:', cart ? cart._id : 'None', 'Items in cart:', cart ? cart.items.length : 'N/A');

        if (!cart || cart.items.length === 0) {
            console.log('Redirecting to /cart: Cart is empty or not found.');
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        const { name, phone, address, city, postalCode, paymentMethod } = req.body;

        // Create new order
        const order = new Order({
            user: req.session.user.id,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            total: cart.total,
            shippingAddress: {
                name,
                phone,
                street: address,
                city,
                postalCode
            },
            paymentMethod
        });

        await order.save();
        console.log('Order saved to DB with ID:', order._id);

        // Clear cart
        cart.items = [];
        cart.total = 0;
        await cart.save();
        console.log('Cart cleared in DB.');

        req.flash('success', 'Order placed successfully!');
        res.redirect('/checkout/orderplaced?orderId=' + order._id);
        console.log('Redirecting to order confirmation page.');
    } catch (error) {
        console.error('Error placing order during processing:', error);
        req.flash('error', 'Error placing order');
        res.redirect('/checkout');
        console.log('Redirecting to /checkout due to an error.');
    }
};

// Order confirmation
exports.orderConfirmation = async (req, res) => {
    try {
        // Retrieve orderId from query parameter
        const orderId = req.query.orderId;
        if (!orderId) {
            req.flash('error', 'Order ID not provided.');
            return res.redirect('/checkout');
        }

        const order = await Order.findById(orderId)
            .populate('items.product');
        
        if (!order || order.user.toString() !== req.session.user.id.toString()) {
            req.flash('error', 'Order not found or not authorized.');
            return res.redirect('/checkout');
        }

        res.render('order-confirmation', {
            title: 'Order Confirmation',
            order
        });
    } catch (error) {
        console.error('Error loading order confirmation:', error);
        req.flash('error', 'Error loading order confirmation');
        res.redirect('/checkout'); // Redirect to checkout on error
        console.log('Redirecting to /checkout due to error in order confirmation.');
    }
}; 