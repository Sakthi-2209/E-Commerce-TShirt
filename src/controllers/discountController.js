const asyncHandler = require('express-async-handler');
const Discount = require('../models/discountModel');

const getDiscount = asyncHandler(async (req, res) => {
  let discount = await Discount.findOne();
  if (!discount) {
    discount = await Discount.create({
      flatCustomisationFee: 50,
      promoCode: '',
      promoDiscount: 0
    });
  }
  res.json(discount);
});

const updateDiscount = asyncHandler(async (req, res) => {
  let discount = await Discount.findOne();
  
  if (!discount) {
    discount = new Discount({});
  }

  discount.flatCustomisationFee = req.body.flatCustomisationFee ?? discount.flatCustomisationFee;
  discount.promoCode = req.body.promoCode ?? discount.promoCode;
  discount.promoDiscount = req.body.promoDiscount ?? discount.promoDiscount;

  const updatedDiscount = await discount.save();
  res.json(updatedDiscount);
});

module.exports = {
  getDiscount,
  updateDiscount,
};
