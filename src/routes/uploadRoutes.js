const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const { protectCustomer, protectAdmin } = require('../middlewares/authMiddleware');

const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Admin = require('../models/adminModel');

const requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const customer = await Customer.findById(decoded.id).select('-password');
    if (customer) {
      req.customer = customer;
      return next();
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.admin = admin;
      return next();
    }
    
    res.status(401);
    return next(new Error('Not authorized, user not found'));
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized to upload'));
  }
};

router.post('/', requireAuth, upload.single('image'), uploadImage);

module.exports = router;
