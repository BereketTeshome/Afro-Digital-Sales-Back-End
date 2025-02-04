const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  s_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to sale's ID
    ref: "Sales",
    required: true,
  },
  p_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to product's ID
    ref: "Product",
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
