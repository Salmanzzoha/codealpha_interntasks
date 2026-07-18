// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, username, email, password, bio } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "Name, username, email, and password are all required." });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers, underscores only." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ? OR username = ?")
    .get(email.toLowerCase(), username.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "That email or username is already taken." });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

  const result = db
    .prepare(
      "INSERT INTO users (name, username, email, password, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, username.toLowerCase(), email.toLowerCase(), hashed, bio || "", avatarUrl);

  req.session.userId = result.lastInsertRowid;

  res.status(201).json({
    id: result.lastInsertRowid,
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Email/username and password are required." });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? OR username = ?")
    .get(emailOrUsername.toLowerCase(), emailOrUsername.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  req.session.userId = user.id;

  res.json({ id: user.id, name: user.name, username: user.username, email: user.email });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out." });
  });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const user = db
    .prepare("SELECT id, name, username, email, bio, avatar_url FROM users WHERE id = ?")
    .get(req.session.userId);
  res.json(user);
});

module.exports = router;
