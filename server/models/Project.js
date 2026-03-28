const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    documentCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    documentCount: {
      type: Number,
      default: 0,
    },
    sessions: {
      type: [sessionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);
