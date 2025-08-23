const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");


const router = express.Router();

// Create a new chat
router.post("/", authMiddleware.authUser, chatController.createChat);

// Get all chats
router.get("/", authMiddleware.authUser, chatController.getChats);

module.exports = router;
