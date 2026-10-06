const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  size: { type: String, required: true },
  colour: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  customisation: {
    type: {
      type: String,
      enum: ['text', 'library_design', 'custom_upload', 'both', 'none'],
      default: 'none',
    },
    designId: { type: mongoose.Schema.Types.ObjectId, ref: 'DesignLibrary' },
    customDesignUrl: { type: String }, // Cloudinary URL for uploaded custom design
    textContent: { type: String },
    fontFamily: { type: String },
    textColor: { type: String },
    positionX: { type: Number },
    positionY: { type: Number },
    scale: { type: Number },
    rotation: { type: Number },
    previewImageUrl: { type: String }, // Very important for manufacturing
  },
});

const cartSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
