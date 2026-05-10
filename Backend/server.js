// server.js

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

// Sample API
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Hardik" },
    { id: 2, name: "sam" },
    // { id: 3, name: "ram" },
  ];

  res.status(200).json({
    success: true,
    data: users,
  });
});

// POST API Example
app.post("/api/users", (req, res) => {
  const body = req.body;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: body,
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});