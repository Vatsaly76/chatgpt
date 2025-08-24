require("dotenv").config();
const app = (require('./src/app')); //importing the app instance from app.js
const connectDB = require('./src/db/db'); //importing the database connection function
const initSocketServer = require('./src/sockets/socket.server'); //importing the socket server initialization function
const httpServer = require('http').createServer(app); //creating an HTTP server using the app instance

connectDB(); //calling the database connection function
initSocketServer(httpServer); //initializing the socket server

httpServer.listen(5000, () => {
  console.log('Server is running on port 5000');
});

