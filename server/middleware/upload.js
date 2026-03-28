const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, " ").trim();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, `upload_${Date.now()}_${sanitizeFilename(file.originalname)}`),
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

module.exports = {
  videoUpload,
};
