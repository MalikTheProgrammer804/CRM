const router = require("express").Router();

const protect = require("../middleware/auth");
const { requireAdmin } = require("../middleware/auth");

const controller = require("../controllers/workspaceController");


// ==========================================
// ALL WORKSPACE ROUTES REQUIRE LOGIN
// ==========================================
router.use(protect);


// ==========================================
// WORKSPACE
// ==========================================
router
  .route("/")
  .get(controller.get)
  .put(controller.update);


// ==========================================
// TEAM MEMBERS
// ==========================================
router.get(
  "/members",
  controller.members
);


// ==========================================
// GIVE ACCESS
// ADMIN ONLY
// ==========================================
router.post(
  "/members/access",
  requireAdmin,
  controller.giveAccess
);


// ==========================================
// REVOKE ACCESS
// ADMIN ONLY
// ==========================================
router.delete(
  "/members/:userId/access",
  requireAdmin,
  controller.revokeAccess
);


module.exports = router;
