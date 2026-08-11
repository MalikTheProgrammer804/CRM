const express = require("express");
const router = express.Router();
const { signup, login, verifyEmail, forgotPassword, updateProfile, me } = require("../controllers/authController");
const protect = require("../middleware/auth");

// Public Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

// Protected Auth Routes
router.get("/me", protect, me);
router.put("/me", protect, updateProfile);

module.exports = router;
