const express = require('express');
const { getDiscount, updateDiscount } = require('../controllers/discountController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getDiscount)
  .put(protectAdmin, updateDiscount);

module.exports = router;
