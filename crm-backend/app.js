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
  "https://crm-3gvs.vercel.app",
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CRM API is running",
    environment: "vercel",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/lead-discovery", leadDiscoveryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workspace", workspaceRoutes);

app.use(errorHandler);

module.exports = app;
