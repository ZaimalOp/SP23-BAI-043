const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const connectDB = require('./config/database');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const {
    handleDatabaseError,
    handleAuthError,
    handleAuthzError,
    handleFileUploadError,
    handleNotFoundError,
    handleGeneralError
} = require('./middleware/errorHandler');

const app = express();

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.originalUrl} (Path: ${req.path})`);
    next();
});

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('public/images'));

app.use(session({
    secret: 'your-secret-key',
    name: 'gieves-hawkes-session',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/gh_fashion' }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.messages = req.flash();
    console.log('Global middleware: res.locals.user =>', res.locals.user ? `Email: ${res.locals.user.email}, Role: ${res.locals.user.role}` : 'No user in res.locals');
    next();
});

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const ordersRoutes = require('./routes/orders');
const complaintRoutes = require('./routes/complaint');

app.use(complaintRoutes);

app.use('/admin', (req, res, next) => {
    console.log('Admin Route Middleware:');
    console.log('Original URL:', req.originalUrl);
    console.log('Base URL:', req.baseUrl);
    console.log('Path:', req.path);
    console.log('User:', req.session.user ? `Email: ${req.session.user.email}, Role: ${req.session.user.role}` : 'No user');
    next();
}, adminRoutes);

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/my-orders', ordersRoutes);

app.use('/', (req, res, next) => {
    console.log('Shop Route Middleware:');
    console.log('Original URL:', req.originalUrl);
    console.log('Base URL:', req.baseUrl);
    console.log('Path:', req.path);
    next();
}, shopRoutes);

app.use(handleDatabaseError);
app.use(handleAuthError);
app.use(handleAuthzError);
app.use(handleFileUploadError);
app.use(handleNotFoundError);
app.use(handleGeneralError);

const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to view the application`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();