const router = require("express").Router();
const protect = require("../middleware/auth");
const controller = require("../controllers/ChatController");

// All chat routes require login
router.use(protect);

router.get("/conversations", controller.getConversations);
router.get("/:userId", controller.getMessages);
router.post("/:userId", controller.sendMessage);
router.patch("/:userId/read", controller.markRead);
router.delete("/message/:messageId", controller.deleteMessage);

module.exports = router;
