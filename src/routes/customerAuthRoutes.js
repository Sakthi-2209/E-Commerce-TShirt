const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  refreshCustomerToken,
  logoutCustomer,
  getCustomerProfile,
} = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middlewares/authMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/refresh', refreshCustomerToken);
router.post('/logout', protectCustomer, logoutCustomer);
router.get('/me', protectCustomer, getCustomerProfile);

module.exports = router;
