const { verifyToken } = require("../utils/token");
const { User } = require("../models");

/**
 * Authentication Middleware
 * Verifies Bearer JWT and attaches authenticated user
 * and workspace context to req.
 */
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message:
        "Not authorized. No token provided.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    // Find user using MongoDB/Mongoose
    const user = await User.findOne({
      id: decoded.userId,
    }).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        message:
          "User no longer exists.",
      });
    }

    // Attach authenticated user
    req.user = user;

    // Attach workspace context
    req.workspaceId =
      decoded.workspaceId ||
      user.workspaceId;

    // Attach role
    req.role =
      decoded.role ||
      user.role;

    next();
  } catch (err) {
    console.error(
      "Authentication error:",
      err.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
}

module.exports = protect;