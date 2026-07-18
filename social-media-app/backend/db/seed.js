// db/seed.js
// Run with: npm run seed
// Creates a few demo users and posts so the feed isn't empty on first run.

const bcrypt = require("bcryptjs");
const db = require("./database");

const existingCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

if (existingCount > 0) {
  console.log(`Users table already has ${existingCount} rows. Skipping seed.`);
  process.exit(0);
}

const users = [
  { name: "Ayesha Rahman", username: "ayesha", email: "ayesha@example.com", bio: "Photographer & traveler 📸" },
  { name: "Rafiq Islam", username: "rafiq", email: "rafiq@example.com", bio: "Software engineer, coffee addict ☕" },
  { name: "Nadia Chowdhury", username: "nadia", email: "nadia@example.com", bio: "Foodie. Always hungry." },
];

const insertUser = db.prepare(`
  INSERT INTO users (name, username, email, password, bio, avatar_url)
  VALUES (@name, @username, @email, @password, @bio, @avatar_url)
`);

const insertUsers = db.transaction((list) => {
  for (const u of list) {
    insertUser.run({
      ...u,
      password: bcrypt.hashSync("password123", 10),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
    });
  }
});
insertUsers(users);

const userRows = db.prepare("SELECT id, username FROM users").all();
const idOf = (username) => userRows.find((u) => u.username === username).id;

const posts = [
  { username: "ayesha", content: "Sunset over the hills today. Absolutely worth the hike! 🌄" },
  { username: "rafiq", content: "Finally shipped the new feature. Time for coffee #3 of the day." },
  { username: "nadia", content: "Tried making biryani from scratch — 8/10, needs more saffron next time." },
  { username: "ayesha", content: "New camera lens arrived. Testing it out this weekend!" },
];

const insertPost = db.prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
const insertPosts = db.transaction((list) => {
  for (const p of list) insertPost.run(idOf(p.username), p.content);
});
insertPosts(posts);

// A couple of follow relationships so the feed demonstrates the follow system
const insertFollow = db.prepare(
  "INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)"
);
insertFollow.run(idOf("rafiq"), idOf("ayesha"));
insertFollow.run(idOf("nadia"), idOf("ayesha"));
insertFollow.run(idOf("ayesha"), idOf("rafiq"));

console.log(`Seeded ${users.length} users and ${posts.length} posts.`);
console.log(`All demo accounts use the password: password123`);
