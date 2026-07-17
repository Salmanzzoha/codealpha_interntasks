# ShopEase — Simple E-commerce Store

**CodeAlpha Full Stack Development Internship — Task 1**

A simple e-commerce store built with a vanilla HTML/CSS/JS frontend and an Express.js + SQLite backend.

## Features

- **Product listings** — browse products, filter by category, search by keyword
- **Product details page** — full description, price, stock, add to cart
- **Shopping cart** — add/update/remove items, live totals
- **User registration/login** — secure password hashing (bcrypt), session-based auth
- **Order processing** — checkout flow that creates an order, decrements stock, and clears the cart
- **Order history** — logged-in users can view past orders and their items
- **Database** — SQLite (file-based, zero setup) storing products, users, cart items, orders, and order items

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework, no build step)
- **Backend:** Node.js, Express.js
- **Database:** SQLite via `better-sqlite3`
- **Auth:** `express-session` + `bcryptjs`

## Project Structure

```
CodeAlpha_ProjectName/
├── backend/
│   ├── db/
│   │   ├── database.js     # DB connection + schema (creates tables on startup)
│   │   └── seed.js         # Populates sample products
│   ├── middleware/
│   │   └── auth.js         # requireAuth guard for protected routes
│   ├── routes/
│   │   ├── auth.js         # register, login, logout, /me
│   │   ├── products.js     # list, search, filter, detail
│   │   ├── cart.js         # view, add, update, remove
│   │   └── orders.js       # checkout, order history, order detail
│   ├── server.js           # Express app entry point (also serves the frontend)
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html           # Product listing
    ├── product.html         # Product detail
    ├── cart.html            # Shopping cart
    ├── checkout.html        # Order processing / checkout form
    ├── order-confirmation.html
    ├── orders.html          # Order history
    ├── login.html
    ├── register.html
    ├── css/style.css
    └── js/
        ├── api.js           # fetch() wrapper for the API
        └── nav.js            # navbar auth state + cart badge
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. (Optional) Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if you want a custom port or session secret. Defaults work fine for local development.

### 3. Seed sample products

```bash
npm run seed
```

This adds 8 sample products to the database. Safe to skip — the app works with an empty catalog too, it'll just look empty until products are added.

### 4. Start the server

```bash
npm start
```

The app will be live at **http://localhost:5000** — this single server serves both the API (`/api/...`) and the frontend pages.

## How It Works

- The SQLite database file (`backend/db/store.db`) is created automatically the first time the server starts — no manual DB setup required.
- Sessions are stored server-side (via cookie) so cart and order actions require being logged in.
- Stock is checked and decremented at checkout time inside a transaction, so orders won't oversell inventory.
- Passwords are never stored in plain text — they're hashed with bcrypt before being saved.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/products` | List products (supports `?category=` & `?search=`) |
| GET | `/api/products/:id` | Product detail |
| GET | `/api/cart` | View cart (auth required) |
| POST | `/api/cart` | Add item to cart (auth required) |
| PUT | `/api/cart/:id` | Update item quantity (auth required) |
| DELETE | `/api/cart/:id` | Remove item (auth required) |
| POST | `/api/orders` | Checkout / place order (auth required) |
| GET | `/api/orders` | Order history (auth required) |
| GET | `/api/orders/:id` | Single order detail (auth required) |

## Notes

Built for the **CodeAlpha Full Stack Development Internship**, Task 1: Simple E-commerce Store.
