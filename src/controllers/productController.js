const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { 'availableColours.name': { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  const query = { ...keyword };
  
  if (req.query.showAll !== 'true') {
    query.isActive = true;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, description, basePrice, baseImages, availableSizes, availableColours } = req.body;

  const productExists = await Product.findOne({ slug });
  if (productExists) {
    res.status(400);
    throw new Error('Product with this slug already exists');
  }

  const product = new Product({
    name,
    slug,
    description,
    basePrice,
    baseImages,
    availableSizes,
    availableColours,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, slug, description, basePrice, baseImages, availableSizes, availableColours, isActive } = req.body;

  const product = await Product.findOne({ slug: req.params.slug });

  if (product) {
    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.description = description || product.description;
    product.basePrice = basePrice || product.basePrice;

    if (baseImages && baseImages.length > 0) {
      product.baseImages = baseImages;
    }
    
    if (availableSizes) product.availableSizes = availableSizes;
    if (availableColours) product.availableColours = availableColours;
    if (isActive !== undefined) product.isActive = isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
