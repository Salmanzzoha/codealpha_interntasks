// routes/users.js
const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/:username - public profile
router.get("/:username", (req, res) => {
  const viewerId = req.session.userId || null;
  const user = db
    .prepare("SELECT id, name, username, bio, avatar_url, created_at FROM users WHERE username = ?")
    .get(req.params.username.toLowerCase());

  if (!user) return res.status(404).json({ error: "User not found." });

  const followerCount = db
    .prepare("SELECT COUNT(*) AS c FROM follows WHERE following_id = ?")
    .get(user.id).c;
  const followingCount = db
    .prepare("SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?")
    .get(user.id).c;
  const postCount = db.prepare("SELECT COUNT(*) AS c FROM posts WHERE user_id = ?").get(user.id).c;

  const isFollowedByViewer = viewerId
    ? !!db
        .prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?")
        .get(viewerId, user.id)
    : false;

  const posts = db
    .prepare(
      `SELECT p.*, u.name, u.username, u.avatar_url
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ? ORDER BY p.created_at DESC`
    )
    .all(user.id)
    .map((p) => {
      const likeCount = db.prepare("SELECT COUNT(*) AS c FROM likes WHERE post_id = ?").get(p.id).c;
      const commentCount = db.prepare("SELECT COUNT(*) AS c FROM comments WHERE post_id = ?").get(p.id).c;
      const likedByViewer = viewerId
        ? !!db.prepare("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?").get(p.id, viewerId)
        : false;
      return { ...p, likeCount, commentCount, likedByViewer };
    });

  res.json({
    ...user,
    followerCount,
    followingCount,
    postCount,
    isFollowedByViewer,
    isOwnProfile: viewerId === user.id,
    posts,
  });
});

// PUT /api/users/me - update own profile { name, bio, avatarUrl }
router.put("/me", requireAuth, (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const current = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId);

  db.prepare("UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?").run(
    name || current.name,
    bio !== undefined ? bio : current.bio,
    avatarUrl || current.avatar_url,
    req.session.userId
  );

  res.json({ message: "Profile updated." });
});

// POST /api/users/:username/follow - toggle follow
router.post("/:username/follow", requireAuth, (req, res) => {
  const target = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(req.params.username.toLowerCase());

  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.id === req.session.userId) {
    return res.status(400).json({ error: "You can't follow yourself." });
  }

  const existing = db
    .prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?")
    .get(req.session.userId, target.id);

  if (existing) {
    db.prepare("DELETE FROM follows WHERE id = ?").run(existing.id);
  } else {
    db.prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)").run(
      req.session.userId,
      target.id
    );
  }

  const followerCount = db
    .prepare("SELECT COUNT(*) AS c FROM follows WHERE following_id = ?")
    .get(target.id).c;

  res.json({ following: !existing, followerCount });
});

// GET /api/users/:username/followers
router.get("/:username/followers", (req, res) => {
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found." });

  const followers = db
    .prepare(
      `SELECT u.id, u.name, u.username, u.avatar_url
       FROM follows f JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ?`
    )
    .all(user.id);

  res.json(followers);
});

// GET /api/users/:username/following
router.get("/:username/following", (req, res) => {
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found." });

  const following = db
    .prepare(
      `SELECT u.id, u.name, u.username, u.avatar_url
       FROM follows f JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ?`
    )
    .all(user.id);

  res.json(following);
});

module.exports = router;
