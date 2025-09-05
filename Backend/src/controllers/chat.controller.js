const chatModel = require('../models/chat.model');

async function createChat(req, res) {
    const { title } = req.body;
    const userId = req.user.id;

    try {
        const newChat = await chatModel.create({ 
            user: userId,
            title: title
        });
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (error) {
        console.log(error); // It's a good practice to log the actual error
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
