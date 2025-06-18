const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a user']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Order item must have a product']
        },
        quantity: {
            type: Number,
            required: [true, 'Order item must have a quantity'],
            min: [1, 'Quantity must be at least 1']
        },
        size: {
            type: String,
            required: [true, 'Size is required'],
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom']
        },
        color: {
            type: String,
            required: [true, 'Color is required']
        },
        price: {
            type: Number,
            required: [true, 'Price is required']
        },
        customization: {
            type: Map,
            of: String
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Order must have a total amount']
    },
    shippingAddress: {
        name: {
            type: String,
            required: [true, 'Recipient name is required']
        },
        phone: {
            type: String,
            required: [true, 'Recipient phone number is required']
        },
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'Pakistan'
        }
    },
    billingAddress: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'Pakistan'
        }
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash on Delivery']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String
    },
    estimatedDeliveryDate: {
        type: Date
    },
    notes: {
        type: String
    },
    discount: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        required: [true, 'Shipping cost is required'],
        default: 0
    },
    tax: {
        type: Number,
        required: [true, 'Tax amount is required'],
        default: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'PKR'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for final amount (including tax and shipping)
orderSchema.virtual('finalAmount').get(function() {
    return this.totalAmount + this.tax + this.shippingCost - this.discount;
});

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus) {
    this.orderStatus = newStatus;
    if (newStatus === 'shipped') {
        this.estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
    return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(newStatus) {
    this.paymentStatus = newStatus;
    return this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('items.product');
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ orderStatus: status })
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('items.product');
};

// Pre-save middleware to validate order
orderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        // Validate that all items have required fields
        const invalidItems = this.items.filter(item => 
            !item.product || !item.quantity || !item.size || !item.color || !item.price
        );
        if (invalidItems.length > 0) {
            return next(new Error('Invalid order items'));
        }
    }
    next();
});

// Method to calculate order totals
orderSchema.methods.calculateTotals = function() {
    this.totalAmount = this.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0);
    return this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
