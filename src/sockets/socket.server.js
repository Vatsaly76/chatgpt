const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.services");
const MessageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
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

            const [userMessage, vectors] = await Promise.all([
                MessageModel.create({
                    chat: message.chat,
                    user: socket.userId,
                    content: message.content,
                    role: 'user'
                }),
                aiService.generateVector(message.content),
            ]);

            await createMemory({
                messageId: userMessage._id.toString(),
                vectors: vectors,
                metadata: {
                    chat: message.chat,
                    user: socket.userId,
                    text: message.content
                }
            });

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    topK: 3,
                    metadata: {}
                }),
                MessageModel.find({
                    chat: message.chat
                }).sort({ createdAt: 1 })
            ]);

            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            });

            const ltm = [
                {
                    role: 'user',
                    parts: [{
                        text: `Here is some relevant information from the chat history that might be useful for your next response: 
                        ${memory.map(item => item.metadata.text).join("\n")}`
                    }]
                }
            ];

            const aiResponse = await aiService.generateAIResponse([...ltm, ...stm]);

            socket.emit("ai-response", {
                content: aiResponse,
                chat: message.chat
            });

            const [aiMessage, responsevector] = await Promise.all([
                MessageModel.create({
                    chat: message.chat,
                    user: socket.userId,
                    content: aiResponse,
                    role: 'model'
                }),
                aiService.generateVector(aiResponse)
            ]);

            await createMemory({
                vectors: responsevector,
                messageId: aiMessage._id.toString(),
                metadata: {
                    chat: message.chat,
                    user: socket.userId,
                    text: aiResponse
                }
            });
        });
    });

    return io;
}

module.exports = initSocketServer;