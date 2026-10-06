const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Customer = require('../models/customerModel');
const Admin = require('../models/adminModel');

const protectCustomer = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.customer = await Customer.findById(decoded.id).select('-password');
      
      if (!req.customer) {
        res.status(401);
        throw new Error('Not authorized, customer not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        res.status(401);
        throw new Error('Not authorized, admin not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protectCustomer, protectAdmin };
