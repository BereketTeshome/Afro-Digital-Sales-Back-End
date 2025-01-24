const mongoose = require('mongoose');

const vendorSettingSchema = new mongoose.Schema({
    v_setting_id: {
        type: String,
        required: true,
        unique: true,
    },
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to vendor ID
        ref: 'Vendor',
        required: false,
    },
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

