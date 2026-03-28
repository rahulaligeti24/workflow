const express = require("express");
const { videoUpload } = require("../middleware/upload");
const {
  detectOverlaps,
  transcriptToHtml,
  videoToText,
} = require("../controllers/mediaController");

const router = express.Router();

router.post("/video-to-text", videoUpload.single("video"), videoToText);
router.post("/transcript-to-html", transcriptToHtml);
router.post("/detect-overlaps", detectOverlaps);

module.exports = router;
