/**
 * Admin Role Middleware
 * Checks if user is an admin
 */
const isAdmin = (req, res, next) => {
    // Check if user is logged in and is admin
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        req.flash('error', 'Access denied. Admin privileges required.');
        res.redirect('/auth/login');
    }
};

module.exports = {
    isAdmin
}; 