const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.services");
const MessageModel = require("../models/message.model");
const { createMemory,queryMemory } = require("../services/vector.service");
const { text } = require("express");

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

            const userMessage = await MessageModel.create({
                chat: message.chat,
                user: socket.userId,
                content: message.content,
                role: 'user'
            });

            const vectors = await aiService.generateVector(message.content);
            
            await createMemory({
                messageId: userMessage._id.toString(),
                vectors: vectors,
                metadata: {
                    chat: message.chat,
                    user: socket.userId,
                    text: message.content
                }
            });

            const memory = await queryMemory({
                queryVector: vectors,
                topK: 3,
                metadata:{}
            });

            console.log("Memory:", memory);

            const chatHistory = await MessageModel.find({
                chat: message.chat
            }).sort({ createdAt: 1 });

            const aiResponse = await aiService.generateAIResponse(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [ { text: item.content } ]
                }
            }));

            const aiMessage = await MessageModel.create({
                chat: message.chat,
                user: socket.userId,
                content: aiResponse,
                role: 'model' 
            });

            const responsevector =  await aiService.generateVector(aiResponse);
            await createMemory({
                vectors: responsevector,
                messageId: aiMessage._id.toString(),
                metadata: {
                    user: socket.userId,
                    chat: message.chat,
                    text: aiResponse
                }
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