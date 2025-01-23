const mongoose = require('mongoose');

const vendorSettingSchema = new mongoose.Schema({
    discount: {
        type: Number,
    },
    product_limit: {
        type: Number,
    },
    status: {
        type: Boolean,
    },
    payment_status: {
        type: String,
    },
    subscription_plan: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('VendorSetting', vendorSettingSchema);

