const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    // Reuse an existing Mongoose connection when available.
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    throw error;
  }
};

// Register connection events only once.
if (!mongoose.connection.__crmListenersRegistered) {
  mongoose.connection.on("error", (err) => {
    console.error(
      "❌ MongoDB connection error:",
      err.message
    );
  });

  mongoose.connection.on("disconnected", () => {
    console.warn(
      "⚠️ MongoDB disconnected."
    );
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected.");
  });

  mongoose.connection.__crmListenersRegistered = true;
}

module.exports = connectDB;
