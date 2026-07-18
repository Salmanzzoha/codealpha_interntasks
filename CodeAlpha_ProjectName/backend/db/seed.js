// db/seed.js
// Run with: npm run seed
// Populates the products table with sample data so the store isn't empty.

const db = require("./database");

const products = [
  {
    name: "Wireless Headphones",
    description: "Over-ear Bluetooth headphones with noise cancellation and 30-hour battery life.",
    price: 59.99,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "Electronics",
    stock: 25,
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking smart watch with heart rate monitor and sleep tracking.",
    price: 89.99,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "Electronics",
    stock: 15,
  },
  {
    name: "Cotton T-Shirt",
    description: "Soft, breathable 100% cotton t-shirt. Available in multiple colors.",
    price: 14.99,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "Clothing",
    stock: 100,
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned sole for daily training.",
    price: 74.5,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Footwear",
    stock: 40,
  },
  {
    name: "Backpack",
    description: "Durable 25L backpack with laptop compartment, perfect for daily commutes.",
    price: 39.99,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    category: "Accessories",
    stock: 30,
  },
  {
    name: "Coffee Maker",
    description: "12-cup programmable coffee maker with auto shut-off.",
    price: 45.0,
    image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
    category: "Home",
    stock: 20,
  },
  {
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness and USB charging port.",
    price: 24.99,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    category: "Home",
    stock: 50,
  },
  {
    name: "Yoga Mat",
    description: "Non-slip 6mm thick yoga mat with carrying strap.",
    price: 19.99,
    image_url: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500",
    category: "Fitness",
    stock: 60,
  },
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image_url, category, stock)
  VALUES (@name, @description, @price, @image_url, @category, @stock)
`);

const existingCount = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;

if (existingCount === 0) {
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log(`Products table already has ${existingCount} rows. Skipping seed.`);
}
