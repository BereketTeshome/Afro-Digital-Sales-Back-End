const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    s_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
    },
    v_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    c_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    p_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    o_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    b_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["product", "bid", "order"],
      required: true,
    },
    seen: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
