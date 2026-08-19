const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    address: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;