const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price'],
    },
    baseImages: [
      {
        type: String, // URLs to Cloudinary
        required: true,
      },
    ],
    availableSizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    ],
    availableColours: [
      {
        name: { type: String },
        image: { type: String },
        sizes: [{ type: String }]
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
