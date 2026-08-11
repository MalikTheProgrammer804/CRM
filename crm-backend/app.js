const express = require("express");
const cors = require("cors");
require("dotenv").config();
const taskRoutes = require("./routes/taskRoutes"); 
const authRoutes = require("./routes/authRoutes");
const leadDiscoveryRoutes = require("./routes/Leaddiscoveryroutes");
const leadRoutes = require("./routes/leadroute");
const workspaceRoutes = require("./routes/workspaceRoutes");
const errorHandler = require("./middleware/errorHandler");



const app = express();
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://0.0.0.0:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
  "http://localhost:5177",
  "http://127.0.0.1:5177",
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin);
      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/lead-discovery", leadDiscoveryRoutes);
app.use("/api/leads", require("./routes/leadroute"));
app.use("/api/tasks", taskRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/leads", leadRoutes);
// Register the route

// Error handler
app.use(errorHandler);

module.exports = app;
