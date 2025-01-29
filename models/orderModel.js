const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    p_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to product's ID
        ref: 'Product',
        required: true
    },    
    v_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to vendor's ID
        ref: 'Vendor',
        required: true
    },    
    s_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to sale's ID
        ref: 'Sales',
        required: true
    },
    c_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to customer's ID
        ref: 'Customer',
        required: true
    },
    status:{
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
