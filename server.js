require("dotenv").config();
const app = (require('./src/app')); //importing the app instance from app.js
const connectDB = require('./src/db/db'); //importing the database connection function

connectDB(); //calling the database connection function



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

module.exports = app;