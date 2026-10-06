const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Discount = require('../models/discountModel');

const createOrderAndCheckout = asyncHandler(async (req, res) => {
  const { shippingAddress, promoCode } = req.body;
  const cart = await Cart.findOne({ customer: req.customer._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  let discountData = await Discount.findOne();
  if (!discountData) discountData = await Discount.create({ flatCustomisationFee: 50 });
  else if (discountData.flatCustomisationFee !== 50) {
    discountData.flatCustomisationFee = 50;
    await discountData.save();
  }
  const flatFee = discountData.flatCustomisationFee;

  let itemsPrice = 0;
  const orderItems = cart.items.map((item) => {
    let price = item.product.basePrice;
    let customisationFeeApplied = 0;
    
    if (item.customisation && item.customisation.type !== 'none') {
      customisationFeeApplied = flatFee;
      price += flatFee;
    }
    
    itemsPrice += (price * item.quantity);
    let image = item.product.baseImages[0] || '';
    if (item.product.availableColours?.length) {
      const matched = item.product.availableColours.find(c => {
        const cName = typeof c === 'string' ? c : c.name;
        return cName === item.colour;
      });
      if (matched && typeof matched === 'object' && matched.image) {
        image = matched.image;
      }
    }

    return {
      name: item.product.name,
      quantity: item.quantity,
      image: image,
      price: price,
      product: item.product._id,
      size: item.size,
      colour: item.colour,
      customisationFeeApplied,
      customisation: item.customisation,
    };
  });

  const taxPrice = 0; // add tax logic if needed
  const shippingPrice = 50; // Fixed delivery charge
  
  let discountPrice = 0;
  if (promoCode && discountData.promoCode && promoCode.toUpperCase() === discountData.promoCode.toUpperCase() && discountData.promoDiscount > 0) {
    discountPrice = (itemsPrice * discountData.promoDiscount) / 100;
  }

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountPrice;

  const order = new Order({
    customer: req.customer._id,
    orderItems,
    shippingAddress,
    pricingBreakdown: { itemsPrice, taxPrice, shippingPrice, discountPrice, totalPrice },
    status: 'Pending',
  });

  const createdOrder = await order.save();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const razorpayOptions = {
    amount: Math.round(totalPrice * 100), // paise
    currency: 'INR',
    receipt: `receipt_order_${createdOrder._id}`,
  };

  try {
    let razorpayOrderId = 'test_order_' + Date.now();
    let amount = Math.round(totalPrice * 100);
    let currency = 'INR';
    let isTestBypass = false;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key') {
      const razorpayOrder = await razorpay.orders.create(razorpayOptions);
      razorpayOrderId = razorpayOrder.id;
      amount = razorpayOrder.amount;
      currency = razorpayOrder.currency;
    } else {
      isTestBypass = true;
      createdOrder.isPaid = true;
      createdOrder.paidAt = Date.now();
      createdOrder.status = 'Paid';
      createdOrder.paymentResult = {
        razorpay_order_id: razorpayOrderId,
        status: 'test_success',
      };

      await Cart.findOneAndUpdate({ customer: createdOrder.customer }, { items: [], subtotal: 0 });
    }
    
    if (!isTestBypass) {
      createdOrder.paymentResult = { razorpay_order_id: razorpayOrderId };
    }
    
    await createdOrder.save();

    res.status(201).json({
      orderId: createdOrder._id,
      razorpayOrderId: razorpayOrderId,
      amount: amount,
      currency: currency,
      isTestBypass,
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500);
    throw new Error('Payment gateway error');
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const order = await Order.findOne({ 'paymentResult.razorpay_order_id': razorpay_order_id });
  
  if (order) {
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Paid';
      order.paymentResult.razorpay_payment_id = razorpay_payment_id;
      
      await order.save();

      await Cart.findOneAndUpdate({ customer: order.customer }, { items: [], subtotal: 0 });
    }
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const verifyRazorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Signature is legit');
    
    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpay_order_id = paymentEntity.order_id;
      
      const order = await Order.findOne({ 'paymentResult.razorpay_order_id': razorpay_order_id });
      
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Paid';
        order.paymentResult.razorpay_payment_id = paymentEntity.id;
        
        await order.save();

        await Cart.findOneAndUpdate({ customer: order.customer }, { items: [] });
      }
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 
    customer: req.customer._id,
    status: { $ne: 'Pending' }
  }).sort({ createdAt: -1 });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'Pending' } })
    .populate('customer', 'firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  createOrderAndCheckout,
  verifyPayment,
  verifyRazorpayWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
