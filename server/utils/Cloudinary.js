// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary using your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'edusoul_doubts', // Folder where files will be saved
      resource_type: 'auto',    // Supports all media types (image, video, audio)
      public_id: `${Date.now()}-${file.originalname}`, // Unique file name
    };
  },
});

module.exports = { cloudinary, storage };
