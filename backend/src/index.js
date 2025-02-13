// Import express module
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON request body
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Define a sample route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
