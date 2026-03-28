const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    documentTitle: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      default: "markdown",
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      default: "",
    },
    pdfData: {
      type: String,
      default: "",
    },
    style: {
      type: String,
      default: "technical",
      trim: true,
    },
    videoTranscript: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "completed",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Document || mongoose.model("Document", documentSchema);
