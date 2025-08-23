const express = require('express');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express(); //server instance

app.use(express.json()); //middleware to parse JSON bodies
app.use(cookieParser()); //middleware to parse cookies

/* using Routes */
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);


module.exports = app;