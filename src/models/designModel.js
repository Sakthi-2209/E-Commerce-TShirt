const mongoose = require('mongoose');

const designSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DesignLibrary = mongoose.model('DesignLibrary', designSchema);

module.exports = DesignLibrary;
