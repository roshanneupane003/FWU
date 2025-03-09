const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config(); // Load environment variables

const app = express();

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGODB_URI);

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Serve static files from the html directory
app.use(express.static(path.join(__dirname, "html")));

// Function to populate predefined users in the database (run this once to populate the database)
async function populatePredefinedUsers() {
  const predefinedUsers = [
    { username: "roshan_neupane2", password: "roshan_2005" },
  ];

  for (const userData of predefinedUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      username: userData.username,
      password: hashedPassword,
    });
    await newUser.save();
  }
}
// Uncomment the following line to populate the database
// populatePredefinedUsers();

// Test endpoint
app.post("/test", (req, res) => {
  console.log("Received POST request at /test");
  res.send("POST request to the test endpoint successful!");
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.send("Signup failed: Username already exists.");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.send("Signup successful!");
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.send("Login successful!");
  } else {
    res.send("Incorrect username or password.");
  }
});

// Forgot password endpoint
app.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.send("Username not found.");
  }
  const token = Math.random().toString(36).substr(2); // Generate a simple token
  // In a real application, save this token to the database and send a link to the user's email
  res.send(`Password reset token: ${token}`);
});

// Start the server using the environment variable for the port
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
