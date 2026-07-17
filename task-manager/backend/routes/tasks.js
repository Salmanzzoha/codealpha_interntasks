const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All task routes require a valid token
router.use(authenticate);

// GET /api/tasks - list all tasks for the logged-in user
router.get('/', (req, res) => {
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(tasks);
});

// GET /api/tasks/:id - get a single task
router.get('/:id', (req, res) => {
  const task = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

// POST /api/tasks - create a new task
router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const result = db
    .prepare('INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)')
    .run(req.user.id, title, description || '');

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PUT /api/tasks/:id - update a task (title, description, completed)
router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  const title = req.body.title ?? existing.title;
  const description = req.body.description ?? existing.description;
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existing.completed;

  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, description, completed, req.params.id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ error: 'Task not found.' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted successfully.' });
});

module.exports = router;
