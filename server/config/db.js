const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/srm";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Check your Atlas URI, database user credentials, IP access list, and Node.js TLS compatibility.");
    process.exit(1);
  }
};

module.exports = connectDB;
