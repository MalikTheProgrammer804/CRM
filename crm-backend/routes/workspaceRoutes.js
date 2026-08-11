const router = require("express").Router();
const protect = require("../middleware/auth");
const controller = require("../controllers/workspaceController");

router.use(protect);
router.route("/").get(controller.get).put(controller.update);
router.get("/members", controller.members);
module.exports = router;
