const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from .env"
      );
    }

    // serverSelectionTimeoutMS keeps a bad/unreachable connection string
    // from hanging the app for the default 30s - it fails fast instead.
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "✅ MongoDB Atlas connected successfully"
    );

    // Runtime connection health - these fire after the initial connect
    // above, e.g. if Atlas restarts or the network blips mid-session.
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected - Mongoose will attempt to reconnect automatically.");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected.");
    });
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    throw error;
  }
};

module.exports = connectDB;