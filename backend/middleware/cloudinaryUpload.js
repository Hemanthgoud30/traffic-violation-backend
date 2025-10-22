const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      if (req.originalUrl.includes('violations')) {
        return 'traffic-violations';
      } else if (req.originalUrl.includes('hazards')) {
        return 'road-hazards';
      }
      return 'general';
    },
    format: async (req, file) => 'jpg', // Supports promises as well
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return file.fieldname + '-' + uniqueSuffix;
    },
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check extension
  const extname = filetypes.test(file.originalname.toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;