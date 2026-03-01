const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the upload directory. Using '../uploads' means it's one level up from the current script.
// Ensure this path is correct relative to where your main server.js file is.
const uploadDir = path.join(__dirname, "../uploads");

// Create the 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true ensures parent directories are created if needed
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent conflicts
    // Example: myFile-1721200000000.jpg
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Configure Multer for multiple file uploads
// .array('myFiles', 10) means it expects files under the field name 'myFiles'
// and will accept up to 10 files. Adjust '10' as needed.
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit each file size to 10MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Error: Only images, videos, PDFs, and documents are allowed!")); // Pass an Error object for better handling
    }
  },
}).array("myFiles", 100); // Changed from .single('myFile') to .array('myFiles', <max_files>)

// Export the middleware function
exports.uploadMultipleFiles = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('One or more files exceed the 10MB limit.');
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).send('Too many files or unexpected field name.');
      }
      return res.status(400).send(`Multer Error: ${err.message}`);
    } else if (err) {
      // An unknown error occurred.
      return res.status(400).send(`Upload Error: ${err.message}`);
    }

    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files selected!");
    }

    
    // Process uploaded files
    const uploadedFileNames = req.files.map((file) => file.filename);
    res.status(200).send(`Files uploaded successfully: ${uploadedFileNames.join(', ')}`);
  });
};