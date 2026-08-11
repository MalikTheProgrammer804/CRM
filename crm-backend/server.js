require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    console.log("✅ Database ready.");

    const server = app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `🚀 Server running on port ${PORT}`
        );
        console.log(
          `   Local: http://localhost:${PORT}`
        );
      }
    );

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(
          `⚠️ Port ${PORT} is already in use.`
        );
        return;
      }

      console.error(
        "Server startup error:",
        err
      );
    });
  } catch (err) {
    console.error(
      "❌ Server startup failed:",
      err.message || err
    );

    process.exit(1);
  }
}

start();