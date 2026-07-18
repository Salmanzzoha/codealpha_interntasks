// routes/cart.js
const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/cart - current user's cart with product details + total
router.get("/", (req, res) => {
  const items = db
    .prepare(
      `SELECT c.id AS cart_item_id, c.quantity, p.*
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(req.session.userId);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({ items, total: Number(total.toFixed(2)) });
});

// POST /api/cart - add product to cart { productId, quantity }
router.post("/", (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  if (quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1." });
  }
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} in stock.` });
  }

  const existing = db
    .prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(req.session.userId, productId);

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
      existing.quantity + quantity,
      existing.id
    );
  } else {
    db.prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)").run(
      req.session.userId,
      productId,
      quantity
    );
  }

  res.status(201).json({ message: "Added to cart." });
});

// PUT /api/cart/:cartItemId - update quantity { quantity }
router.put("/:cartItemId", (req, res) => {
  const { quantity } = req.body;
  const item = db
    .prepare("SELECT * FROM cart_items WHERE id = ? AND user_id = ?")
    .get(req.params.cartItemId, req.session.userId);

  if (!item) return res.status(404).json({ error: "Cart item not found." });
  if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1." });

  db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(quantity, item.id);
  res.json({ message: "Cart updated." });
});

// DELETE /api/cart/:cartItemId
router.delete("/:cartItemId", (req, res) => {
  const result = db
    .prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?")
    .run(req.params.cartItemId, req.session.userId);

  if (result.changes === 0) return res.status(404).json({ error: "Cart item not found." });
  res.json({ message: "Removed from cart." });
});

module.exports = router;
