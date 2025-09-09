const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.services");
const MessageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const { text } = require("express");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

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

            // Create user memory in background (non-blocking)
            createMemory({
                messageId: userMessage._id.toString(),
                vectors: vectors,
                metadata: {
                    chat: message.chat,
                    user: socket.userId,
                    text: message.content
                }
            }).catch(err => console.error('Error creating user memory:', err));

            // Get chat history immediately (faster than vector search)
            const chatHistory = await MessageModel.find({
                chat: message.chat
            }).sort({ createdAt: 1 });
            
            // Try to get memory but with a timeout to prevent blocking
            let memory = [];
            try {
                const memoryPromise = queryMemory({
                    queryVector: vectors,
                    topK: 3,
                    metadata: {}
                });
                
                // Use Promise.race with timeout to prevent blocking
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Vector query timeout')), 2000)
                );
                
                memory = await Promise.race([memoryPromise, timeoutPromise]);
            } catch (error) {
                memory = [];
            }

            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            });

            // Only include memory context if we have it
            const ltm = memory.length > 0 ? [
                {
                    role: 'user',
                    parts: [{
                        text: `Here is some relevant information from the chat history that might be useful for your next response: 
                        ${memory.map(item => item.metadata?.text || '').join("\n")}`
                    }]
                }
            ] : [];

            const aiResponse = await aiService.generateAIResponse([...ltm, ...stm]);

            socket.emit("ai-response", {
                content: aiResponse,
                chat: message.chat
            });

            // Save AI response and create memory in background (non-blocking)
            const aiMessage = await MessageModel.create({
                chat: message.chat,
                user: socket.userId,
                content: aiResponse,
                role: 'model'
            });
            
            // Generate vector and create memory in background
            aiService.generateVector(aiResponse)
                .then(responsevector => {
                    return createMemory({
                        vectors: responsevector,
                        messageId: aiMessage._id.toString(),
                        metadata: {
                            chat: message.chat,
                            user: socket.userId,
                            text: aiResponse
                        }
                    });
                })
                .catch(err => console.error('Error creating AI memory:', err));
        });
    });

    return io;
}

module.exports = initSocketServer;