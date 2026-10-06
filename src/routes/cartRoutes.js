const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');
const { protectCustomer } = require('../middlewares/authMiddleware');

router.use(protectCustomer);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
