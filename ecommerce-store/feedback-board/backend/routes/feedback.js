const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/feedback?sort=rating|date|upvotes
router.get('/', (req, res) => {
  const sort = req.query.sort || 'date';

  const sortMap = {
    rating: 'rating DESC, created_at DESC',
    date: 'created_at DESC',
    upvotes: 'upvotes DESC, created_at DESC'
  };

  const orderBy = sortMap[sort] || sortMap.date;

  const feedback = db.prepare(`SELECT * FROM feedback ORDER BY ${orderBy}`).all();
  res.json(feedback);
});

// POST /api/feedback - submit new feedback
router.post('/', (req, res) => {
  const { name, message, rating } = req.body;

  if (!name || !message || !rating) {
    return res.status(400).json({ error: 'Name, message, and rating are required.' });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5.' });
  }

  const result = db
    .prepare('INSERT INTO feedback (name, message, rating) VALUES (?, ?, ?)')
    .run(name.trim(), message.trim(), ratingNum);

  const created = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// POST /api/feedback/:id/upvote - increment upvote count
router.post('/:id/upvote', (req, res) => {
  const existing = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Feedback not found.' });

  db.prepare('UPDATE feedback SET upvotes = upvotes + 1 WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/feedback/:id - remove a feedback entry
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Feedback not found.' });

  db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);
  res.json({ message: 'Feedback deleted.' });
});

module.exports = router;
