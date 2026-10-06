const mongoose = require('mongoose');

const discountSchema = mongoose.Schema(
  {
    flatCustomisationFee: {
      type: Number,
      required: true,
      default: 150, // Default INR 150
    },
    promoCode: {
      type: String,
      default: '',
    },
    promoDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
