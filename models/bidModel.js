const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  c_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user making the bid
    ref: "User",
    required: true,
  },
  p_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Product
    ref: "Product",
    required: true,
  },
  s_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Sales
    ref: "Sales",
    required: true,
  },
  amount: {
    type: Number, // Bid amount
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Bid", bidSchema);
