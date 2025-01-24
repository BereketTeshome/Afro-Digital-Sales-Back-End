const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    s_id: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: { 
        type: String,
        required: true,
    },
    username: { 
        type: String,
        required: true,
        unique: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'sales',
    },
    phone: {
        type: Number, // Phone number of the user
        required: false,
    },
    address: {
        type: String, // Physical address of the user
        required: false,
    },
    logo: {
        type: String, // URL to the user’s logo or profile image
        required: false,
    },
    gender: {
        type: String, // Gender of the user (e.g., 'male', 'female', 'other')
        enum: ['male', 'female'], // Optional validation
        required: false,
    },
    about: {
        type: String, // A short description or bio about the user
        required: false,
    },
    country: {
        type: String, 
        required: false,
    },
    subscription_plan: {
        type: String, // The subscription plan of the user
        enum: ['basic', 'premium', 'enterprise'], // Example plans
        required: false,
    },
    last_updated: {
        type: Date,
    },
    balance: {
        type: Number, // User's current account balance
        default: 0,
    },
    dash_type: {
        type: String, // Type of dashboard the user is associated with
        required: false,
        default: "sales_dashboard"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Sales', salesSchema);
