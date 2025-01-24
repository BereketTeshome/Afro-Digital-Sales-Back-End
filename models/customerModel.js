const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    c_id: {
        type: String,
        required: true,
        unique: true,
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
    logo: {
        type: String,
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
        default: 'customer',
    },
    dash_type:{
        type: String,
        default: 'customer_dashboard', // different dashboard types based on role
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Customer', customerSchema);


//  check to the post mam 
// {
//     "username": "best",
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
  