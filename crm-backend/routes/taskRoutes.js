const router = require("express").Router();
const protect = require("../middleware/auth");
const controller = require("../controllers/taskController");

router.use(protect);
router.route("/").get(controller.list).post(controller.create);
router.route("/:id").put(controller.update).delete(controller.remove);
module.exports = router;
