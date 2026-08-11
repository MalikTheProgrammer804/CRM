const express = require("express");
const router = express.Router();
const { search, suggest } = require("../controllers/leadDiscoveryController");
const protect = require("../middleware/auth");

router.get("/search", protect, search);
router.get("/suggest", protect, suggest);

module.exports = router;