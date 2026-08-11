/**
 * Global Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  // Log full error for debugging
  console.error("❌ Operational Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (e) => e.message
    );

    return res.status(400).json({
      message: "Validation Error",
      errors: messages,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});

    return res.status(409).json({
      message: "Duplicate value already exists.",
      fields,
    });
  }

  // Mongoose CastError
  // Usually happens when an invalid ID/value is provided.
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${err.path || "value"}.`,
    });
  }

  const status =
    err.statusCode ||
    err.status ||
    500;

  const message =
    err.message ||
    "Something went wrong on the server.";

  res.status(status).json({
    message,

    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
}

module.exports = errorHandler;