/**
 * Input Validation Middleware
 * Validates form inputs before processing
 */

const { body, validationResult } = require('express-validator');

// User registration validation
const validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/auth/register');
        }
        next();
    }
];

// Login validation
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/auth/login');
        }
        next();
    }
];

// Product validation
const validateProduct = (req, res, next) => {
    const { name, price, stock, category, description } = req.body;
    const errors = [];

    if (!name || name.trim().length < 3) {
        errors.push('Product name must be at least 3 characters long');
    }

    if (!price || isNaN(price) || price <= 0) {
        errors.push('Please enter a valid price');
    }

    if (!stock || isNaN(stock) || stock < 0) {
        errors.push('Please enter a valid stock quantity');
    }

    if (!category) {
        errors.push('Please select a category');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }

    if (errors.length > 0) {
        req.flash('error', errors);
        return res.redirect(req.headers.referer || '/admin/products');
    }

    next();
};

// Checkout validation
const validateCheckout = (req, res, next) => {
    const { 
        street, 
        city, 
        state, 
        zipCode, 
        country,
        cardNumber,
        expiryDate,
        cvv
    } = req.body;
    const errors = [];

    // Address validation
    if (!street) errors.push('Street address is required');
    if (!city) errors.push('City is required');
    if (!state) errors.push('State is required');
    if (!zipCode) errors.push('ZIP code is required');
    if (!country) errors.push('Country is required');

    // Payment validation
    if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        errors.push('Please enter a valid 16-digit card number');
    }

    if (!expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        errors.push('Please enter a valid expiry date (MM/YY)');
    }

    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        errors.push('Please enter a valid CVV');
    }

    if (errors.length > 0) {
        req.flash('error', errors);
        return res.redirect('/checkout');
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateProduct,
    validateCheckout
}; 