const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // File storage based on type (image or audio)
    if (file.mimetype.startsWith('image')) {
      cb(null, 'uploads/images');
    } else if (file.mimetype.startsWith('audio')) {
      cb(null, 'uploads/audio');
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

// Multer upload handler
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB size limit

// Error handling middleware
const errorHandlingMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ message: `Internal server error: ${err.message}` });
  }
  next();
};

module.exports = { upload, errorHandlingMiddleware };
