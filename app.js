const express = require("express");
const mongoose = require("mongoose");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");

// Create an Express app
const app = express();
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "frontend")));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "college",
  password: "root",
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// API to register a new user
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, mobileNumber, password } = req.body;

  if (!firstName || !lastName || !mobileNumber || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (first_name, last_name, mobile_number, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, mobileNumber, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Database error: " + err.message });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// API to login a user
app.post("/api/login", (req, res) => {
  const { mobileNumber, password } = req.body;

  if (!mobileNumber || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  db.query(
    "SELECT * FROM users WHERE mobile_number = ?",
    [mobileNumber],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.status(200).json({ message: `Welcome ${user.first_name} ${user.last_name}` });
    }
  );
});

app.get("/", (req,res) => {
    res.send("Hi,I am root");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080")
});
