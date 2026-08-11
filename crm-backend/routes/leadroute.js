const express = require("express");
const router = express.Router();

const leadController = require("../controllers/leadController");

// Support both:
// module.exports = protect
// and
// module.exports = { protect }
const authModule = require("../middleware/auth");
const protect = authModule.protect || authModule;

// Safety check
if (typeof protect !== "function") {
  throw new Error(
    "Auth middleware is not exporting a middleware function. Check middleware/auth.js"
  );
}

// Get all leads
router.get("/", protect, leadController.getLeads);

// IMPORTANT:
// /export must come BEFORE /:id
router.get("/export", protect, leadController.exportLeads);

// Get one lead
router.get("/:id", protect, leadController.getLead);

// Create lead
router.post("/", protect, leadController.createLead);

// Update lead
router.put("/:id", protect, leadController.updateLead);

// Delete lead
router.delete("/:id", protect, leadController.deleteLead);

// Add note
router.post("/:id/notes", protect, leadController.addNote);

module.exports = router;