/**
 * Cloudinary upload service.
 * Handles avatar and image uploads via multer + Cloudinary.
 */
const multer = require('multer');
const config = require('../config');

let cloudinary = null;

// Initialize Cloudinary only if config is present
if (config.cloudinary.cloudName && config.cloudinary.apiKey) {
  try {
    const cloudinaryModule = require('cloudinary').v2;
    cloudinaryModule.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    cloudinary = cloudinaryModule;
    console.log('✅ Cloudinary configured');
  } catch (err) {
    console.log('⚠️ Cloudinary module not available — avatar uploads will use URL mode');
  }
} else {
  console.log('⚠️ Cloudinary not configured — avatar uploads will use URL mode');
}

// Multer setup — store in memory for upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1,
  },
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} publicId - Optional public ID
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (buffer, folder = 'phantomvpn/avatars', publicId = null) => {
  if (!cloudinary) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!cloudinary) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
};

/**
 * Check if Cloudinary is available.
 */
const isCloudinaryConfigured = () => !!cloudinary;

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
