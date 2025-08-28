const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.services");
const MessageModel = require("../models/message.model");
const chatmodel = require("../models/chat.model");

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

            await MessageModel.create({
                chat: message.chat,
                user: socket.userId,
                content: message.content,
                role: 'user'
            });

            const chatHistory = await MessageModel.find({
                chat: message.chat
            }).sort({ createdAt: -1 }).limit(10).lean().reverse();

            const aiResponse = await aiService.generateAIResponse(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [ { text: item.content } ]
                }
            }));

            await MessageModel.create({
                chat: message.chat,
                user: socket.userId,
                content: aiResponse,
                role: 'model' 
            });

            socket.emit("ai-response", {
                content: aiResponse,
                chat: message.chat
            });
        });
    });

    return io;
}

module.exports = initSocketServer;