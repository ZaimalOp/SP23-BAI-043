// products.model.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['suits', 'shirts', 'knitwear', 'accessories', 'outerwear']
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
