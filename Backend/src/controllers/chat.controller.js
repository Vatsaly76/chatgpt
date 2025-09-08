const chatModel = require('../models/chat.model');

async function createChat(req, res) {
    const { title } = req.body;
    const userId = req.user.id;

    try {
        const newChat = await chatModel.create({ 
            user: userId,
            title: title,
            messages: []
        });
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (error) {
        console.log(error); // It's a good practice to log the actual error
        res.status(500).json({ error: "Failed to create chat" });
    }
}

async function getChats(req, res) {
    const user = req.user;
    try {
        const chats = await chatModel.find({ user: user.id }).populate("user", "name");
        res.status(200).json({ chats });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve chats" });
    }
}

async function addMessage(req, res) {
    const { chatId } = req.params;
    const { role, content } = req.body;
    const userId = req.user.id;

    try {
        const chat = await chatModel.findOne({ _id: chatId, user: userId });

        if (!chat) {
            return res.status(404).json({ error: "Chat not found or user does not have permission" });
        }

        const newMessage = { role, content, timestamp: new Date() };
        chat.messages.push(newMessage);
        await chat.save();

        res.status(201).json({ message: "Message added successfully", chat: chat });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add message" });
    }
}

async function updateChat(req, res) {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    try {
        const updatedChat = await chatModel.findOneAndUpdate(
            { _id: chatId, user: userId },
            { title },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ error: "Chat not found or user does not have permission" });
        }

        res.status(200).json({ message: "Chat updated successfully", chat: updatedChat });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update chat" });
    }
}

module.exports = {
    createChat,
    getChats,
    addMessage,
    updateChat
};
