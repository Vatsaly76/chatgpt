const chatModel = require('../models/chat.model');
const MessageModel = require('../models/message.model');

async function createChat(req, res) {
    const { title } = req.body;
    const userId = req.user.id;

    try {
        // console.log('Creating new chat for user:', userId, 'with title:', title);
        const chatTitle = title || "New Chat";
        const newChat = await chatModel.create({ 
            user: userId,
            title: chatTitle,
            messages: []
        });
        // console.log('Chat created successfully:', newChat._id);
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: "Failed to create chat" });
    }
}

async function getChats(req, res) {
    const user = req.user;
    try {
        const chats = await chatModel.find({ user: user.id }).populate("user", "name");
        
        // Populate messages for each chat from the separate messages collection
        const chatsWithMessages = await Promise.all(chats.map(async (chat) => {
            const messages = await MessageModel.find({ chat: chat._id })
                .sort({ createdAt: 1 })
                .lean();
            
            // Convert 'model' role to 'ai' for frontend compatibility
            const formattedMessages = messages.map(msg => ({
                id: msg._id,
                role: msg.role === 'model' ? 'ai' : msg.role,
                content: msg.content,
                timestamp: msg.createdAt
            }));
            
            return {
                ...chat.toObject(),
                messages: formattedMessages
            };
        }));
        
        res.status(200).json({ chats: chatsWithMessages });
    } catch (error) {
        console.error('Error fetching chats:', error);
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

async function getChatById(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;

    try {
        const chat = await chatModel.findOne({ _id: chatId, user: userId });

        if (!chat) {
            return res.status(404).json({ error: "Chat not found or user does not have permission" });
        }

        // Fetch messages from the separate messages collection
        const messages = await MessageModel.find({ chat: chatId })
            .sort({ createdAt: 1 })
            .lean();
        
        // Convert 'model' role to 'ai' for frontend compatibility
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            role: msg.role === 'model' ? 'ai' : msg.role,
            content: msg.content,
            timestamp: msg.createdAt
        }));

        const chatWithMessages = {
            ...chat.toObject(),
            messages: formattedMessages
        };

        res.status(200).json({ chat: chatWithMessages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to retrieve chat" });
    }
}

async function deleteChat(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;

    try {
        // First check if the chat exists and belongs to the user
        const chat = await chatModel.findOne({ _id: chatId, user: userId });

        if (!chat) {
            return res.status(404).json({ error: "Chat not found or user does not have permission" });
        }

        // Delete all messages associated with this chat from the messages collection
        await MessageModel.deleteMany({ chat: chatId });

        // Delete the chat itself
        await chatModel.findOneAndDelete({ _id: chatId, user: userId });

        res.status(200).json({ message: "Chat deleted successfully", chatId });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: "Failed to delete chat" });
    }
}

module.exports = {
    createChat,
    getChats,
    addMessage,
    updateChat,
    getChatById,
    deleteChat
};
