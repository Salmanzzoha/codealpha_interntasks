# Buzz — Mini Social Media Platform

**CodeAlpha Full Stack Development Internship — Task 2**

A mini social media app built with a vanilla HTML/CSS/JS frontend and an Express.js + SQLite backend.

## Features

- **User profiles** — register, login, editable name/bio, auto-generated avatar
- **Posts** — create, view, delete your own posts
- **Comments** — comment on any post, view comment threads
- **Likes** — like/unlike posts with live counts
- **Follow system** — follow/unfollow users, follower/following counts
- **Feeds** — "For You" (global feed) and "Following" (posts from people you follow)
- **Database** — SQLite (file-based, zero setup) storing users, posts, comments, likes, and follows

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework, no build step)
- **Backend:** Node.js, Express.js
- **Database:** SQLite via `better-sqlite3`
- **Auth:** `express-session` + `bcryptjs`

## Project Structure

```
social-media-app/
├── backend/
│   ├── db/
│   │   ├── database.js     # DB connection + schema (creates tables on startup)
│   │   └── seed.js         # Populates 3 demo users + posts
│   ├── middleware/
│   │   └── auth.js         # requireAuth guard for protected routes
│   ├── routes/
│   │   ├── auth.js         # register, login, logout, /me
│   │   ├── posts.js        # create/delete posts, like, comment, feed
│   │   └── users.js        # profile, follow/unfollow, followers/following
│   ├── server.js           # Express app entry point (also serves the frontend)
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html           # Feed (For You / Following tabs) + post composer
    ├── profile.html         # User profile: bio, stats, posts, follow button
    ├── login.html
    ├── register.html
    ├── css/style.css
    └── js/
        ├── api.js           # fetch() wrapper + helpers (escapeHtml, timeAgo)
        ├── nav.js           # navbar auth state
        └── post.js          # shared post-card rendering + like/comment/delete logic
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

Defaults work fine for local development.

### 3. Seed demo data

```bash
npm run seed
```

Creates 3 demo users (`ayesha`, `rafiq`, `nadia` — password: `password123`) with a handful of posts and follow relationships, so the feed isn't empty on first run. Safe to skip.

### 4. Start the server

```bash
npm start
```

The app will be live at **http://localhost:5001** — this single server serves both the API (`/api/...`) and the frontend pages.

## How It Works

- The SQLite database file (`backend/db/social.db`) is created automatically the first time the server starts.
- Sessions are stored server-side (via cookie); posting, liking, commenting, and following all require being logged in — browsing the feed and profiles does not.
- Avatars are auto-generated via DiceBear based on username, so no image upload handling is needed.
- Likes and follows are toggle actions (POST the same endpoint again to undo).

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in (email or username) |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/posts` | Global feed (add `?feed=following` for following-only, auth required for that) |
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

## Notes

Built for the **CodeAlpha Full Stack Development Internship**, Task 2: Social Media Platform.
