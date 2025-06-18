const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    // Link to the user who submitted the complaint
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your User model
        required: true
    },
    
    // The Order ID related to the complaint
    orderId: {
        type: String,
        required: [true, 'Order ID is required.']
    },
    
    // The complaint message from the user
    message: {
        type: String,
        required: [true, 'A message is required.']
    }
}, {
    // This automatically adds `createdAt` and `updatedAt` fields
    // The syntax error "ds" has been removed from here.
    timestamps: true 
});

module.exports = mongoose.model('Complaint', complaintSchema);