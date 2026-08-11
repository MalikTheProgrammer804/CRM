require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

let dbConnectionPromise;

const ensureDatabaseConnection = async () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB();
  }

  await dbConnectionPromise;
};

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  const start = async () => {
    try {
      await connectDB();

      console.log("✅ Database ready.");

      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`   Local: http://localhost:${PORT}`);
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`⚠️ Port ${PORT} is already in use.`);
          return;
        }

        console.error("Server startup error:", err);
      });
    } catch (err) {
      console.error(
        "❌ Server startup failed:",
        err.message || err
      );

      process.exit(1);
    }
  };

  start();
}

// Vercel/serverless entry point
module.exports = async (req, res) => {
  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (err) {
    console.error("❌ Database connection failed:", err);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};
