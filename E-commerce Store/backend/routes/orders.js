// routes/orders.js
const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// POST /api/orders - checkout: turns the cart into an order
router.post("/", (req, res) => {
  const { shippingAddress } = req.body;
  const userId = req.session.userId;

  if (!shippingAddress) {
    return res.status(400).json({ error: "Shipping address is required." });
  }

  const cartItems = db
    .prepare(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(userId);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for ${item.name}.` });
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = db.transaction(() => {
    const orderResult = db
      .prepare(
        "INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, 'pending', ?)"
      )
      .run(userId, total, shippingAddress);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)"
    );
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      decrementStock.run(item.quantity, item.product_id);
    }

    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);

    return orderId;
  });

  const orderId = placeOrder();

  res.status(201).json({
    message: "Order placed successfully.",
    orderId,
    total: Number(total.toFixed(2)),
  });
});

// GET /api/orders - order history for current user
router.get("/", (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.session.userId);

  const itemsStmt = db.prepare(
    `SELECT oi.*, p.name, p.image_url
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`
  );

  const withItems = orders.map((order) => ({
    ...order,
    items: itemsStmt.all(order.id),
  }));

  res.json(withItems);
});

// GET /api/orders/:id - single order detail
router.get("/:id", (req, res) => {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.session.userId);

  if (!order) return res.status(404).json({ error: "Order not found." });

  const items = db
    .prepare(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(order.id);

  res.json({ ...order, items });
});

module.exports = router;
