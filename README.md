# CodeAlpha Full Stack Development Internship

This repository contains completed tasks for the **CodeAlpha Full Stack Development Internship**.

- **Task 1:** ShopEase — Simple E-commerce Store (`/ecommerce-store`)
- **Task 2:** Buzz — Mini Social Media Platform (`/social-media-app`)

Both projects share the same stack philosophy: a vanilla HTML/CSS/JS frontend and an Express.js + SQLite backend, each fully self-contained and runnable with zero external database setup.

---

## Task 1: ShopEase — Simple E-commerce Store

A basic e-commerce site with product listings, cart, checkout, and order history.

### Features

- **Product listings** — browse, filter by category, search by keyword
- **Product details page** — full description, price, stock, add to cart
- **Shopping cart** — add/update/remove items, live totals
- **User registration/login** — bcrypt password hashing, session-based auth
- **Order processing** — checkout flow creates an order, decrements stock, clears cart
- **Order history** — view past orders and their items

### Tech Stack

Node.js, Express.js, SQLite (`better-sqlite3`), `express-session`, `bcryptjs`, vanilla HTML/CSS/JS.

### Project Structure

```
ecommerce-store/
├── backend/
│   ├── db/            # database.js (schema), seed.js (sample products)
│   ├── middleware/     # auth.js
│   ├── routes/        # auth.js, products.js, cart.js, orders.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── index.html, product.html, cart.html, checkout.html
    ├── order-confirmation.html, orders.html
    ├── login.html, register.html
    ├── css/style.css
    └── js/api.js, nav.js
```

### Getting Started

```bash
cd ecommerce-store/backend
npm install
npm run seed      # adds 8 sample products
npm start
```

App runs at **http://localhost:5000**.

### API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/products` | List products (`?category=` & `?search=`) |
| GET | `/api/products/:id` | Product detail |
| GET | `/api/cart` | View cart (auth required) |
| POST | `/api/cart` | Add item to cart (auth required) |
| PUT | `/api/cart/:id` | Update quantity (auth required) |
| DELETE | `/api/cart/:id` | Remove item (auth required) |
| POST | `/api/orders` | Checkout / place order (auth required) |
| GET | `/api/orders` | Order history (auth required) |
| GET | `/api/orders/:id` | Single order detail (auth required) |

---

## Task 2: Buzz — Mini Social Media Platform

A mini social media app with posts, comments, likes, and a follow system.

### Features

- **User profiles** — register, login, editable name/bio, auto-generated avatar
- **Posts** — create, view, delete your own posts
- **Comments** — comment on any post, view comment threads
- **Likes** — like/unlike posts with live counts
- **Follow system** — follow/unfollow users, follower/following counts
- **Feeds** — "For You" (global) and "Following" (posts from people you follow)

### Tech Stack

Node.js, Express.js, SQLite (`better-sqlite3`), `express-session`, `bcryptjs`, vanilla HTML/CSS/JS.

### Project Structure

```
social-media-app/
├── backend/
│   ├── db/            # database.js (schema), seed.js (3 demo users + posts)
│   ├── middleware/     # auth.js
│   ├── routes/        # auth.js, posts.js, users.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── index.html (feed), profile.html
    ├── login.html, register.html
    ├── css/style.css
    └── js/api.js, nav.js, post.js
```

### Getting Started

```bash
cd social-media-app/backend
npm install
npm run seed       # creates demo users: ayesha, rafiq, nadia (password: password123)
npm start
```

App runs at **http://localhost:5001**.

### API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in (email or username) |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/posts` | Global feed (`?feed=following` for following-only) |
| POST | `/api/posts` | Create a post (auth required) |
| GET | `/api/posts/:id` | Single post with comments |
| DELETE | `/api/posts/:id` | Delete your own post (auth required) |
| POST | `/api/posts/:id/like` | Toggle like (auth required) |
| POST | `/api/posts/:id/comments` | Add a comment (auth required) |
| GET | `/api/users/:username` | Public profile with posts + stats |
| PUT | `/api/users/me` | Update own name/bio/avatar (auth required) |
| POST | `/api/users/:username/follow` | Toggle follow (auth required) |
| GET | `/api/users/:username/followers` | List of followers |
| GET | `/api/users/:username/following` | List of who they follow |

---

## Notes

Both projects were built for the **CodeAlpha Full Stack Development Internship**. Each backend serves its own frontend on a separate port (5000 and 5001 respectively), so both can be run simultaneously without conflict.
