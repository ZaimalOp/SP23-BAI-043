const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user storage (in production, use a database)
const users = [];

// Sample product data
const products = {
    featured: [
        {
            id: 1,
            name: 'Luxury Knitwear',
            description: 'Final end of season sale',
            image: 'Knitwear_4.webp',
            price: 299,
            category: 'knitwear'
        }
    ],
    collections: [
        {
            id: 2,
            name: 'Made to Measure Event',
            description: 'The personalised process of Made to Measure for less.',
            image: '3093129_005.webp',
            category: 'made-to-measure'
        },
        {
            id: 3,
            name: 'Wedding Edit',
            description: 'Discover our exclusive wedding collection.',
            image: 'Wedding_Collection.webp',
            category: 'wedding'
        },
        {
            id: 4,
            name: 'Morse Code',
            description: 'Explore the elegance of Morse code style in fashion.',
            image: 'Winter_Collection_65fcfd9f-cd5c-4ab7-ab00-d0448bf519fc.jpg',
            category: 'winter'
        },
        {
            id: 5,
            name: 'Shirts',
            description: 'Discover our wide collection of shirts tailored for every occasion.',
            image: 'Shirts.webp',
            category: 'shirts'
        }
    ],
    categories: [
        {
            id: 6,
            name: 'Suits',
            image: 'suits.webp',
            category: 'suits'
        },
        {
            id: 7,
            name: 'Accessories',
            image: 'Accessories_b667ad34-bc84-4465-ae32-7c99fa45b0b8.webp',
            category: 'accessories'
        },
        {
            id: 8,
            name: 'Autumn Winter 2024 Collection',
            image: '240730_GIEVES_AND_HAWKES_AW24_SHOT_21_0016_F1_01a6bc2e-56b2-4a96-a55f-3a8597420c5e.webp',
            category: 'autumn-winter'
        }
    ],
    services: [
        {
            id: 9,
            name: 'MTM',
            image: 'mtm.webp',
            category: 'services'
        },
        {
            id: 10,
            name: 'BESPOKE',
            image: 'bespoke.webp',
            category: 'services'
        },
        {
            id: 11,
            name: 'MILITARY',
            image: 'military.webp',
            category: 'services'
        },
        {
            id: 12,
            name: 'HISTORY',
            image: 'history.jpg',
            category: 'services'
        }
    ]
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'gieves-hawkes-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// EJS setup with layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const redirectIfAuth = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Make user available in all templates
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? users.find(u => u.id === req.session.userId) : null;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Gieves & Hawkes - Home',
        products: products,
        bodyClass: 'home-page'
    });
});

app.get('/products', (req, res) => {
    const allProducts = [
        ...products.featured,
        ...products.collections,
        ...products.categories,
        ...products.services
    ];
    
    res.render('products', {
        title: 'Products - Gieves & Hawkes',
        products: allProducts,
        bodyClass: 'products-page'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - Gieves & Hawkes',
        bodyClass: 'about-page'
    });
});

// Authentication routes
app.get('/login', redirectIfAuth, (req, res) => {
    res.render('auth/login', {
        title: 'Login - Gieves & Hawkes',
        layout: 'layouts/auth',
        error: null
    });
});

app.post('/login', redirectIfAuth, async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = users.find(u => u.email === email);
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.render('auth/login', {
                title: 'Login - Gieves & Hawkes',
                layout: 'layouts/auth',
                error: 'Invalid email or password'
            });
        }
        
        req.session.userId = user.id;
        res.redirect('/');
    } catch (error) {
        res.render('auth/login', {
            title: 'Login - Gieves & Hawkes',
            layout: 'layouts/auth',
            error: 'An error occurred during login'
        });
    }
});

app.get('/register', redirectIfAuth, (req, res) => {
    res.render('auth/register', {
        title: 'Register - Gieves & Hawkes',
        layout: 'layouts/auth',
        error: null
    });
});

app.post('/register', redirectIfAuth, async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    try {
        // Validation
        if (password !== confirmPassword) {
            return res.render('auth/register', {
                title: 'Register - Gieves & Hawkes',
                layout: 'layouts/auth',
                error: 'Passwords do not match'
            });
        }
        
        if (users.find(u => u.email === email)) {
            return res.render('auth/register', {
                title: 'Register - Gieves & Hawkes',
                layout: 'layouts/auth',
                error: 'Email already registered'
            });
        }
        
        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };
        
        users.push(user);
        req.session.userId = user.id;
        res.redirect('/');
    } catch (error) {
        res.render('auth/register', {
            title: 'Register - Gieves & Hawkes',
            layout: 'layouts/auth',
            error: 'An error occurred during registration'
        });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

// Protected route example
app.get('/profile', requireAuth, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    res.render('profile', {
        title: 'My Profile - Gieves & Hawkes',
        user,
        bodyClass: 'profile-page'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        bodyClass: 'error-page'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {
        title: '500 - Server Error',
        bodyClass: 'error-page'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});