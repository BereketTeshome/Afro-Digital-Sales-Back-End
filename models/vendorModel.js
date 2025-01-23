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


//  check to the post mam 
// {
//     "username": "bestvendor",
//     "email": "vendor@example.com",
//     "password": "securepassword123",
//     "logo": "https://example.com/logo.png",
//     "phone": 1234567890,
//     "last_updated": "2025-01-23T10:00:00Z",
//     "address": "123 Vendor Street, Vendor City",
//     "country": "Ethiopia",
//     "about": "We are the best vendor providing quality products.",
//     "role": "vendor",
//     "dash_type": "dashboard",
//     "createdAt": "2025-01-23T09:30:00Z"
//   }
  