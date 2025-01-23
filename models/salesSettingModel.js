const mongoose = require('mongoose');

const salesSettingSchema = new mongoose.Schema({
    sales_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to sales ID
        ref: 'Sales',
        required: false,
    },
    preferred_product: {
        type: [String], // Array of strings only
        required: false, 
    },
    sales_status: {
        type: String,
        enum: ['Active', 'Rejected', 'Pending'], 
        required: false,
    },
    price_limit: {
        type: Number,
        required: false,
    },
    rating: {
        type: Number,  
        required: false, 
        min: 0,  // Minimum value, adjust as needed
        max: 5,  // Maximum value, adjust as needed
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SalesSetting', salesSettingSchema);

