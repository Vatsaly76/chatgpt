const chatModel = require('../models/chat.model');

async function createChat(req, res) {
    const { userId, message } = req.body;

    try {
        const newChat = new chatModel({ userId, message });
        await newChat.save();
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (error) {
        res.status(500).json({ error: "Failed to create chat" });
    }
}

async function getChats(req, res) {
    try {
        const chats = await chatModel.find().populate("userId", "name");
        res.status(200).json({ chats });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve chats" });
    }
}

module.exports = {
    createChat,
    getChats
};
