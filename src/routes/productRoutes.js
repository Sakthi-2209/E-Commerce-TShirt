const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protectAdmin, createProduct);

router.route('/:slug')
  .get(getProductBySlug)
  .put(protectAdmin, updateProduct)
  .delete(protectAdmin, deleteProduct);

module.exports = router;
