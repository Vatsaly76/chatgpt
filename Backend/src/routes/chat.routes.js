const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const chatController = require("../controllers/chat.controller");


const router = express.Router();

// Create a new chat
router.post("/", authMiddleware.authUser, chatController.createChat);

// Get all chats
router.get("/", authMiddleware.authUser, chatController.getChats);

// Get a chat by ID
router.get("/:chatId", authMiddleware.authUser, chatController.getChatById);

// Add a message to a chat
router.post("/:chatId/messages", authMiddleware.authUser, chatController.addMessage);

// Update a chat
router.put("/:chatId", authMiddleware.authUser, chatController.updateChat);

module.exports = router;
