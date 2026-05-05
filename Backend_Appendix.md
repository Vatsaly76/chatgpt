# Backend Core Logic Implementation

### Module: `Backend/src/sockets/socket.server.js`

```javascript
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
            try {
                if (!message?.content || !message?.chat) {
                    throw new Error("Invalid AI message payload.");
                }

                const userMessage = await MessageModel.create({
                    chat: message.chat,
                    user: socket.userId,
                    content: message.content,
                    role: 'user'
                });

                let vectors = null;
                try {
                    vectors = await aiService.generateVector(message.content);
                } catch (err) {
                    console.error("Vector generation failed, proceeding without memory:", err.message);
                }

                // Create user memory in background (non-blocking)
                if (vectors) {
                    createMemory({
                        messageId: userMessage._id.toString(),
                        vectors: vectors,
                        metadata: {
                            chat: message.chat,
                            user: socket.userId,
                            text: message.content
                        }
                    }).catch(err => console.error('Error creating user memory:', err));
                }

                // Get chat history immediately (faster than vector search)
                const chatHistory = await MessageModel.find({
                    chat: message.chat
                }).sort({ createdAt: 1 });
                
                // Try to get memory but with a timeout to prevent blocking
                let memory = [];
                if (vectors) {
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
                }

                const recentMessages = chatHistory.slice(-12);
                const stm = recentMessages.map(item => {
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
            } catch (error) {
                console.error('Error handling ai-message event:', error);
                socket.emit("ai-error", {
                    chat: message?.chat || null,
                    error: error?.code || 'AI_ERROR',
                    message: error?.message || 'The AI assistant is temporarily unavailable. Please try again shortly.'
                });
            }
        });
    });

    return io;
}

module.exports = initSocketServer;
```


### Module: `Backend/src/services/vector.service.js`

```javascript
// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');
const { mapValues } = require('@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


const vectorChatGPTIndex = pc.Index('vector-chatgpt');

async function createMemory({vectors, metadata, messageId}) {
  if (!messageId) {
    throw new Error('A messageId must be provided to create a memory.');
  }
  
  await vectorChatGPTIndex.upsert([{
    id: messageId,
    values: vectors,
    metadata
  }]);
}
async function queryMemory({queryVector, limit = 5, metadata}) {
  try {
    const data = await vectorChatGPTIndex.query({
      vector: queryVector,
      topK: limit,
      filter: metadata ? { metadata } : undefined,
      includeMetadata: true
    });
    
    return data.matches;
  } catch (error) {
    console.error('Vector DB query failed:', error.message);
    return []; // Return empty array if query fails
  }
}

module.exports = {
  createMemory,
  queryMemory
};

```


### Module: `Backend/src/controllers/auth.controller.js`

```javascript
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    try {
        const newUser = new userModel({
            fullName: {
                firstName,
                lastName
            },
            email,
            password: hashedPassword
        });
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully',
            user: {
                id: newUser._id,
                fullName: {
                    firstName,
                    lastName
                },
                email: newUser.email
            },
            token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid user' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'User logged in successfully',
            user: {
                id: user._id,
                fullName: {
                    firstName: user.fullName.firstName,
                    lastName: user.fullName.lastName
                },
                email: user.email
            },
            token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function logoutUser(req, res) {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('token', { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
```


### Module: `Backend/src/controllers/chat.controller.js`

```javascript
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

```

