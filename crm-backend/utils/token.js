const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_secret_key_change_in_prod";

/**
 * Generates a signed JWT for authentication
 * @param {Object} payload - Data to embed in the token (e.g., id, email, workspaceId, role)
 * @param {boolean} rememberMe - If true, extends expiration time
 */
function generateToken(payload, rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_EXPIRES_IN_REMEMBER_ME || "30d"
    : process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifies an incoming JWT
 * @param {string} token 
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };