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

  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "http://localhost:5174",
  "http://127.0.0.1:5174",

  "http://localhost:5175",
  "http://127.0.0.1:5175",

  "http://localhost:5176",
  "http://127.0.0.1:5176",

  "http://localhost:5177",
  "http://127.0.0.1:5177",
].filter(Boolean);

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      // Exact allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost development ports
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin
      );

      if (isLocalhost) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked origin: ${origin}`);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ===============================
// Body Parsers
// ===============================

app.use(express.json());

// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CRM API is running",
    environment: process.env.VERCEL
      ? "vercel"
      : "local",
  });
});

// ===============================
// Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use(
  "/api/lead-discovery",
  leadDiscoveryRoutes
);

app.use("/api/leads", leadRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/workspace", workspaceRoutes);

// ===============================
// Error Handler
// ===============================

app.use(errorHandler);

module.exports = app;
