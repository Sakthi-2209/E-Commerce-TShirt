const asyncHandler = require('express-async-handler');
const Customer = require('../models/customerModel');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

const registerCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const customerExists = await Customer.findOne({ email });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer already exists');
  }

  const customer = await Customer.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (customer) {
    const accessToken = generateToken(customer._id);
    const refreshToken = generateRefreshToken(customer._id);

    res.cookie('customerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      accessToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
});

const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email }).select('+password');

  if (customer && (await customer.matchPassword(password))) {
    const accessToken = generateToken(customer._id);
    const refreshToken = generateRefreshToken(customer._id);

    res.cookie('customerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const refreshCustomerToken = asyncHandler(async (req, res) => {
  const token = req.cookies.customerRefreshToken;

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

const logoutCustomer = asyncHandler(async (req, res) => {
  res.cookie('customerRefreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const getCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);

  if (customer) {
    res.json({
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      addresses: customer.addresses,
    });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

module.exports = {
  registerCustomer,
  loginCustomer,
  refreshCustomerToken,
  logoutCustomer,
  getCustomerProfile,
};
