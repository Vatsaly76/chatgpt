const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');

const app = express(); //server instance
app.use(express.json()); //middleware to parse JSON bodies
app.use(cookieParser()); //middleware to parse cookies
app.use('/auth', authRoutes);


module.exports = app;