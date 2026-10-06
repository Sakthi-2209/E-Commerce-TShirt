const asyncHandler = require('express-async-handler');
const DesignLibrary = require('../models/designModel');

const getDesigns = asyncHandler(async (req, res) => {
  const designs = await DesignLibrary.find({}).sort('-createdAt');
  res.json(designs);
});

const addDesign = asyncHandler(async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    res.status(400);
    throw new Error('Please provide name and imageUrl');
  }

  const design = await DesignLibrary.create({
    name,
    imageUrl,
  });

  res.status(201).json(design);
});

const deleteDesign = asyncHandler(async (req, res) => {
  const design = await DesignLibrary.findById(req.params.id);

  if (design) {
    await design.deleteOne();
    res.json({ message: 'Design removed' });
  } else {
    res.status(404);
    throw new Error('Design not found');
  }
});

module.exports = { getDesigns, addDesign, deleteDesign };
