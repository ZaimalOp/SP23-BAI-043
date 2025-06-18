const User = require('../models/user');
const { validationResult } = require('express-validator');


exports.showLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        // The flash message will be available globally via res.locals.messages
    });
};


exports.showRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        // The flash message will be available globally via res.locals.messages
    });
};


exports.login = async (req, res, next) => { // Added 'next' for error handling
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        req.session.user = {
            _id: user._id, // It's best practice to use _id consistently
            name: user.name,
            email: user.email,
            role: user.role
        };

        // --- FIX APPLIED HERE ---
        // Manually save the session before redirecting to prevent race conditions.
        req.session.save((err) => {
            if (err) {
                // If there's an error saving the session, pass it to the error handler
                return next(err);
            }

            console.log('Login successful and session saved. req.session.user:', req.session.user);
            req.flash('success', 'Welcome back!');

            // Redirect logic is now inside the save callback
            if (user.role === 'admin') {
                console.log('Redirecting admin to /admin');
                return res.redirect('/admin');
            }

            console.log('Redirecting user to /');
            return res.redirect('/'); // Redirecting to home after login is common
        });

    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        return res.redirect('/auth/login');
    }
};

// Handle register
exports.register = async (req, res, next) => { // Added 'next'
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/auth/register');
        }

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        const user = new User({ name, email, password });
        await user.save();

        // After registering, it's common to ask them to log in.
        // If you want to log them in automatically, you must also use session.save().
        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/auth/login');

    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration');
        return res.redirect('/auth/register');
    }
};

// Handle logout
exports.logout = (req, res) => {
    // This function was already correctly using a callback. No changes needed.
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        // Use the _id from the session we defined during login
        const user = await User.findById(req.session.user._id).select('-password');
        res.render('auth/profile', {
            title: 'My Profile',
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/');
    }
};

// Update User Profile
exports.updateProfile = async (req, res, next) => { // Added 'next'
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.session.user._id);

        user.name = name;
        user.email = email;
        await user.save();

        // Update the session object as well
        req.session.user.name = name;
        req.session.user.email = email;
        
        // --- FIX APPLIED HERE ---
        req.session.save((err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Profile updated successfully');
            res.redirect('/profile'); // Assuming profile route is /profile
        });

    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/profile');
    }
};