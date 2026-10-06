const express = require('express');
const router = express.Router();
const {
  createOrderAndCheckout,
  verifyPayment,
  verifyRazorpayWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protectCustomer, protectAdmin } = require('../middlewares/authMiddleware');

router.post('/checkout', protectCustomer, createOrderAndCheckout);
router.post('/verify', protectCustomer, verifyPayment);
router.get('/myorders', protectCustomer, getMyOrders);
router.get('/', protectAdmin, getAllOrders);
router.patch('/:id', protectAdmin, updateOrderStatus);

router.post('/webhook', verifyRazorpayWebhook);

module.exports = router;
