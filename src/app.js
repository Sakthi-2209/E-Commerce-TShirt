const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'https://e-commerce-t-shirt.vercel.app'], credentials: true }));
app.use(helmet());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const customerAuthRoutes = require('./routes/customerAuthRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const designRoutes = require('./routes/designRoutes');
const discountRoutes = require('./routes/discountRoutes');

app.use('/api/customers/auth', customerAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/discounts', discountRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint is working successfully!', 
    timestamp: new Date().toISOString() 
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
