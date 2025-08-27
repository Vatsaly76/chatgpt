const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.services");
const MessageModel = require("../models/message.model");
const ChatModel = require("../models/chat.model");

function initSocketServer(httpServer) {
    const io = new Server(httpServer);

    io.use((socket, next) => {
        const cookies = socket.handshake.headers.cookie;
        const parsedCookies = cookie.parse(cookies || "");
        const token = parsedCookies.token;
        if (!token) {
            return next(new Error("Unauthorized"));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error("Unauthorized"));
            }
            socket.userId = decoded.id;
            next();
        });
    });

    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("ai-message", async (message) => {
            let chatId = message.chatId;

            if (!chatId) {
                const newChat = await ChatModel.create({ user: socket.userId, title: message.content.substring(0, 20) });
                chatId = newChat._id;
            }

            await MessageModel.create({
                user: socket.userId,
                chat: chatId,
                content: message.content,
                role: 'user'
            });

            const chatHistory = await MessageModel.find({
                chat: message.chatId
            })

            console.log("Chat history:", chatHistory);

            const aiResponse = await aiService.generateAIResponse(message.content);

            await MessageModel.create({
                user: socket.userId,
                chat: chatId,
                content: aiResponse,
                role: 'model'
            });

            console.log("Received AI message:", message);
            socket.emit("ai-response", { content: aiResponse, chatId: chatId });
        });
    });

    return io;
}

module.exports = initSocketServer;