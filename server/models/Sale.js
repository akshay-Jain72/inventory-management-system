const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Product kis price par purchase hua
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // Sale se total profit
    profit: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Sale = mongoose.model("Sale", saleSchema);

module.exports = Sale;