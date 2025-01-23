const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
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
    logo: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    last_updated: {
        type: Date,
    },
    address: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    about: {
        type: String,
    },
    role: {
        type: String,
        default: 'vendor',
    },
    dash_type:{
        type: String,
        default: 'dashboard', // different dashboard types based on role
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Vendor', vendorSchema);
