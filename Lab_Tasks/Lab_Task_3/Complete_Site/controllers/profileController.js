const User = require('../models/user');
const Order = require('../models/orders');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.render('profile', {
            title: 'My Profile',
            user,
            orders
        });
    } catch (error) {
        console.error('Profile Error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/profile');
        }

        // Update user fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        user.address = address;

        await user.save();

        // Update session
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        req.flash('success', 'Profile updated successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Profile Update Error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/profile');
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate passwords
        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/profile');
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/profile');
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/profile');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        req.flash('success', 'Password changed successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Password Change Error:', error);
        req.flash('error', 'Error changing password');
        res.redirect('/profile');
    }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.render('order-history', {
            title: 'Order History',
            orders
        });
    } catch (error) {
        console.error('Order History Error:', error);
        req.flash('error', 'Error loading order history');
        res.redirect('/profile');
    }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('user')
            .populate('items.product');

        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/profile/orders');
        }

        // Check if order belongs to user
        if (order.user._id.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized access');
            return res.redirect('/profile/orders');
        }

        res.render('order-details', {
            title: 'Order Details',
            order
        });
    } catch (error) {
        console.error('Order Details Error:', error);
        req.flash('error', 'Error loading order details');
        res.redirect('/profile/orders');
    }
}; 