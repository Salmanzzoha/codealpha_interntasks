// routes/posts.js
const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function attachPostMeta(post, viewerId) {
  const likeCount = db.prepare("SELECT COUNT(*) AS c FROM likes WHERE post_id = ?").get(post.id).c;
  const commentCount = db.prepare("SELECT COUNT(*) AS c FROM comments WHERE post_id = ?").get(post.id).c;
  const likedByViewer = viewerId
    ? !!db.prepare("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?").get(post.id, viewerId)
    : false;
  return { ...post, likeCount, commentCount, likedByViewer };
}

// GET /api/posts - global feed (or ?feed=following for logged-in user's following feed)
router.get("/", (req, res) => {
  const viewerId = req.session.userId || null;
  let posts;

  if (req.query.feed === "following" && viewerId) {
    posts = db
      .prepare(
        `SELECT p.*, u.name, u.username, u.avatar_url
         FROM posts p JOIN users u ON u.id = p.user_id
         WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
            OR p.user_id = ?
         ORDER BY p.created_at DESC`
      )
      .all(viewerId, viewerId);
  } else {
    posts = db
      .prepare(
        `SELECT p.*, u.name, u.username, u.avatar_url
         FROM posts p JOIN users u ON u.id = p.user_id
         ORDER BY p.created_at DESC`
      )
      .all();
  }

  res.json(posts.map((p) => attachPostMeta(p, viewerId)));
});

// POST /api/posts - create a new post { content, imageUrl }
router.post("/", requireAuth, (req, res) => {
  const { content, imageUrl } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Post content cannot be empty." });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: "Post is too long (max 1000 characters)." });
  }

  const result = db
    .prepare("INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)")
    .run(req.session.userId, content.trim(), imageUrl || "");

  const post = db
    .prepare(
      `SELECT p.*, u.name, u.username, u.avatar_url
       FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(attachPostMeta(post, req.session.userId));
});

// GET /api/posts/:id - single post with comments
router.get("/:id", (req, res) => {
  const viewerId = req.session.userId || null;
  const post = db
    .prepare(
      `SELECT p.*, u.name, u.username, u.avatar_url
       FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
    )
    .get(req.params.id);

  if (!post) return res.status(404).json({ error: "Post not found." });

  const comments = db
    .prepare(
      `SELECT c.*, u.name, u.username, u.avatar_url
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ? ORDER BY c.created_at ASC`
    )
    .all(post.id);

  res.json({ ...attachPostMeta(post, viewerId), comments });
});

// DELETE /api/posts/:id - only the author can delete
router.delete("/:id", requireAuth, (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  if (post.user_id !== req.session.userId) {
    return res.status(403).json({ error: "You can only delete your own posts." });
  }
  db.prepare("DELETE FROM posts WHERE id = ?").run(post.id);
  res.json({ message: "Post deleted." });
});

// POST /api/posts/:id/like - toggle like
router.post("/:id/like", requireAuth, (req, res) => {
  const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });

  const existing = db
    .prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?")
    .get(post.id, req.session.userId);

  if (existing) {
    db.prepare("DELETE FROM likes WHERE id = ?").run(existing.id);
  } else {
    db.prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)").run(post.id, req.session.userId);
  }

  const likeCount = db.prepare("SELECT COUNT(*) AS c FROM likes WHERE post_id = ?").get(post.id).c;
  res.json({ liked: !existing, likeCount });
});

// POST /api/posts/:id/comments - add a comment { content }
router.post("/:id/comments", requireAuth, (req, res) => {
  const { content } = req.body;
  const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment cannot be empty." });
  }

  const result = db
    .prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)")
    .run(post.id, req.session.userId, content.trim());

  const comment = db
    .prepare(
      `SELECT c.*, u.name, u.username, u.avatar_url
       FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(comment);
});

module.exports = router;
