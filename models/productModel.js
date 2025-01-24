const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    p_id: {
        type: String,
        required: true,
        unique: true,
    },
    p_name: { 
        type: String,
        required: true,
    },
    p_price: { 
        type: Number,
        required: true,
    },
    p_description: { 
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: true,
    },
    p_image: {
        type: String, // URL of the product image
        required: false,
    },
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to vendor's ID
        ref: 'Vendor',
        required: true,
    },
    discount: {
        type: Number, // Discount percentage or amount
        default: 0,
    },
    quantity: {
        type: Number, // Available stock
        required: true,
        default: 0,
    },
    featured: {
        type: Boolean, // Whether the product is featured or not
        default: false,
    },
    per_sales_drag: {
        type: Number, // Drag value for sales
        required: false,
    },
    lat: {
        type: Number, // Latitude of the product's location
        required: false,
    },
    long: {
        type: Number, // Longitude of the product's location
        required: false,
    },
    is_new: {
        type: Boolean, // Whether the product is new or not
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
