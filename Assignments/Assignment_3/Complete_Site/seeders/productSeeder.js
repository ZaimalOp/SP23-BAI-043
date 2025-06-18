const mongoose = require('mongoose');
const Product = require('../models/products');
const connectDB = require('../config/database');

const products = [
    {
        name: "Classic Navy Suit",
        description: "A timeless navy suit crafted from premium Italian wool, perfect for formal occasions.",
        price: 1299.99,
        category: "suits",
        images: "navywooltwillsuit.jpg"
    },
    {
        name: "Luxury Cashmere Sweater",
        description: "Ultra-soft cashmere sweater in a classic crew neck design.",
        price: 499.99,
        category: "knitwear",
        images: "cashmereovercoat.jpg"
    },
    {
        name: "White Dress Shirt",
        description: "Classic white dress shirt made from premium cotton.",
        price: 199.99,
        category: "shirts",
        images: "whitedressshirt.jpg"
    },
    {
        name: "Linen Summer Suit",
        description: "Lightweight linen suit perfect for summer occasions.",
        price: 899.99,
        category: "suits",
        images: "linensuit.jpg"
    },
    {
        name: "Tweed Hacking Jacket",
        description: "Traditional tweed hacking jacket for countryside pursuits.",
        price: 799.99,
        category: "outerwear",
        images: "tweedhackingjacket.jpg"
    },
    {
        name: "Silk Evening Scarf",
        description: "Elegant silk scarf perfect for evening wear.",
        price: 149.99,
        category: "accessories",
        images: "silkeveningscarf.jpg"
    },
    {
        name: "Black Dinner Suit",
        description: "Classic black dinner suit for formal evening events.",
        price: 1599.99,
        category: "suits",
        images: "blackdinnersuit.jpg"
    },
    {
        name: "Morning Suit",
        description: "Traditional morning suit for daytime formal events.",
        price: 1899.99,
        category: "suits",
        images: "morningsuit.jpg"
    },
    {
        name: "Charcoal Flannel Suit",
        description: "Warm charcoal flannel suit for winter wear.",
        price: 1399.99,
        category: "suits",
        images: "charcoalflannelsuit.jpg"
    },
    {
        name: "Classic Blue Suit",
        description: "Versatile classic blue suit for business and formal occasions.",
        price: 1199.99,
        category: "suits",
        images: "classicbluesuit.jpg"
    },
    {
        name: "Check Pattern Suit",
        description: "Stylish check pattern suit for a modern look.",
        price: 1099.99,
        category: "suits",
        images: "checksuit.jpg"
    },
    {
        name: "Double Breasted Navy Blazer",
        description: "Classic double breasted navy blazer for smart casual wear.",
        price: 899.99,
        category: "outerwear",
        images: "doublebreastednavyblazer.jpg"
    }
];

const seedProducts = async () => {
    try {
        await connectDB();
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Insert new products
        await Product.insertMany(products);
        
        console.log('Products seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts(); 