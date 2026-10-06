const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Discount = require('../models/discountModel');

const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.customer._id);
  
  let discountData = await Discount.findOne();
  if (!discountData) {
    discountData = await Discount.create({ flatCustomisationFee: 50 });
  } else if (discountData.flatCustomisationFee !== 50) {
    discountData.flatCustomisationFee = 50;
    await discountData.save();
  }
  
  const flatFee = discountData.flatCustomisationFee;

  let subtotal = 0;
  cart.items.forEach((item) => {
    if (item.product) {
      let itemTotal = item.product.basePrice * item.quantity;
      if (item.customisation && item.customisation.type !== 'none') {
        itemTotal += (flatFee * item.quantity);
      }
      subtotal += itemTotal;
    }
  });

  res.json({
    _id: cart._id,
    items: cart.items,
    subtotal,
    flatCustomisationFee: flatFee,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, colour, quantity, customisation } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const cart = await getOrCreateCart(req.customer._id);

  cart.items.push({
    product: productId,
    size,
    colour,
    quantity: Number(quantity) || 1,
    customisation: customisation || { type: 'none' },
  });

  await cart.save();
  res.status(201).json(cart.items);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.customer._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  item.quantity = Number(req.body.quantity);
  await cart.save();
  
  res.json(cart.items);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.customer._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items.pull(req.params.itemId);
  await cart.save();
  
  res.json(cart.items);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
