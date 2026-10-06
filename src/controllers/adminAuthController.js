const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.matchPassword(password))) {
    const accessToken = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const refreshAdminToken = asyncHandler(async (req, res) => {
  const token = req.cookies.adminRefreshToken;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no refresh token');
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateToken(decoded.id);

    res.json({ accessToken });
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, refresh token failed');
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie('adminRefreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');

const getDashboardStats = asyncHandler(async (req, res) => {
  const allProducts = await Product.find();
  const productsCount = allProducts.reduce((acc, p) => acc + (p.availableColours?.length || 1), 0);
  
  const customersCount = await Customer.countDocuments();
  
  const orders = await Order.find();
  const ordersCount = orders.length;
  
  const totalRevenue = orders.reduce((acc, order) => {
    return acc + (order.isPaid ? (order.pricingBreakdown?.totalPrice || 0) : 0);
  }, 0);

  res.json({
    products: productsCount,
    customers: customersCount,
    orders: ordersCount,
    revenue: totalRevenue
  });
});

module.exports = {
  registerAdmin,
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getDashboardStats,
};
