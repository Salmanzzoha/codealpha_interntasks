// middleware/auth.js
// Simple session-based auth guard used to protect routes like cart/orders.

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }
  next();
}

module.exports = { requireAuth };
