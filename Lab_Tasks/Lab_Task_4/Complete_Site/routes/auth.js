const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isGuest, isNotAuthenticated } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validator');
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Login page
router.get('/login', isNotAuthenticated, authController.showLogin);

// Login process
router.post('/login', loginValidation, authController.login);

// Register page
router.get('/register', isNotAuthenticated, authController.showRegister);

// Register process
router.post('/register', registerValidation, authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router; 