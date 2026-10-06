const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'tshirt_customiser',
      format: 'webp', // auto convert everything to webp for performance
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500);
        throw new Error('Image upload failed');
      }

      res.status(200).json({
        message: 'Image uploaded successfully',
        url: result.secure_url,
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = {
  uploadImage,
};
