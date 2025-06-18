/**
 * Error Handling Middleware
 * Handles specific error cases and provides appropriate responses
 */

// Database error handler
const handleDatabaseError = (err, req, res, next) => {
    if (err.name === 'MongoError' || err.name === 'ValidationError') {
        console.error('Database Error:', {
            name: err.name,
            message: err.message,
            path: req.path,
            method: req.method
        });
        req.flash('error', 'A database error occurred. Please try again.');
        return res.redirect('back');
    }
    next(err);
};

// Authentication error handler
const handleAuthError = (err, req, res, next) => {
    if (err.name === 'AuthenticationError') {
        console.error('Authentication Error:', {
            name: err.name,
            message: err.message,
            path: req.path,
            method: req.method,
            user: req.session.user ? `Email: ${req.session.user.email}` : 'No user'
        });
        req.flash('error', 'Authentication failed. Please try again.');
        return res.redirect('/auth/login');
    }
    next(err);
};

// Authorization error handler
const handleAuthzError = (err, req, res, next) => {
    if (err.name === 'AuthorizationError') {
        console.error('Authorization Error:', {
            name: err.name,
            message: err.message,
            path: req.path,
            method: req.method,
            user: req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user'
        });
        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect('/');
    }
    next(err);
};

// File upload error handler
const handleFileUploadError = (err, req, res, next) => {
    if (err.name === 'MulterError') {
        console.error('File Upload Error:', {
            name: err.name,
            message: err.message,
            path: req.path,
            method: req.method
        });
        req.flash('error', 'Error uploading file. Please try again.');
        return res.redirect('back');
    }
    next(err);
};

// Not found error handler
const handleNotFoundError = (req, res, next) => {
    console.error('Not Found Error:', {
        path: req.path,
        method: req.method,
        originalUrl: req.originalUrl
    });
    req.flash('error', 'The requested page could not be found.');
    return res.redirect('/');
};

// General error handler
const handleGeneralError = (err, req, res, next) => {
    console.error('General Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        user: req.session.user ? `Email: ${req.session.user.email}` : 'No user'
    });
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!';
    req.flash('error', errorMessage);
    return res.redirect('/');
};

module.exports = {
    handleDatabaseError,
    handleAuthError,
    handleAuthzError,
    handleFileUploadError,
    handleNotFoundError,
    handleGeneralError
}; 