/**
 * Authentication Middleware
 * Checks if user is logged in
 */
const isAuthenticated = (req, res, next) => {
    console.log('isAuthenticated middleware triggered');
    console.log('Path:', req.path);
    console.log('Session user:', req.session.user ? `Email: ${req.session.user.email}` : 'No user');
    
    if (req.session.user) {
        console.log('User is authenticated, proceeding...');
        return next();
    }
    
    console.log('User is not authenticated, redirecting to login');
    req.flash('error', 'Please login to access this page');
    res.redirect('/auth/login');
};

/**
 * Guest Middleware
 * Redirects logged in users away from auth pages
 */
const isGuest = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    console.log('isAdmin middleware triggered');
    console.log('Path:', req.path);
    console.log('Session user:', req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user');
    
    if (!req.session.user) {
        console.log('No user session found, redirecting to login');
        req.flash('error', 'Please login to access this page');
        return res.redirect('/auth/login');
    }
    
    if (req.session.user.role === 'admin') {
        console.log('User is an admin, proceeding...');
        return next();
    }
    
    console.log('User is not an admin, redirecting to home');
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/admin');
};

// Middleware to check if user is not authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
    console.log('isNotAuthenticated middleware triggered');
    console.log('Path:', req.path);
    console.log('Session user:', req.session.user ? `Email: ${req.session.user.email}` : 'No user');

    if (!req.session.user) {
        console.log('User is not authenticated, proceeding...');
        return next();
    }
    
    console.log('User is authenticated, redirecting to admin dashboard');
    res.redirect('/admin');
};

module.exports = {
    isAuthenticated,
    isGuest,
    isAdmin,
    isNotAuthenticated
}; 