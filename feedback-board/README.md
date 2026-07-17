# Feedback / Review Board — Full Stack App

A public feedback board where anyone can submit a star-rated review, browse all submissions, sort them, and upvote the ones they agree with. No login required.

## Stack
- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** Vanilla HTML/CSS/JavaScript (no build step required)

## Features
- Submit feedback: name, message, 1–5 star rating
- View all feedback in a list
- Sort by Newest, Highest Rated, or Most Upvoted
- Upvote any feedback entry
- Delete a feedback entry
- Server-side validation (rating must be 1–5, required fields enforced)

## Project Structure
```
feedback-board/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js               # SQLite setup (feedback table)
│   ├── routes/feedback.js  # Feedback CRUD + sort + upvote routes
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

## Setup & Run

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```
Server runs on `http://localhost:5001`.

### 2. Frontend
Open `frontend/index.html` directly in a browser, or serve it with VS Code's Live Server extension, or:
```bash
cd frontend
npx serve .
```
The frontend expects the backend at `http://localhost:5001/api` (see `API_BASE` in `app.js` — change it if you deploy the backend elsewhere).

## API Endpoints

| Method | Endpoint                    | Description                                  |
|--------|-------------------------------|-----------------------------------------------|
| GET    | /api/feedback?sort=date\|rating\|upvotes | List all feedback, sorted            |
| POST   | /api/feedback                 | Submit new feedback (name, message, rating)   |
| POST   | /api/feedback/:id/upvote      | Increment upvote count on an entry            |
| DELETE | /api/feedback/:id             | Delete a feedback entry                       |

## Notes
- The SQLite database file (`feedback.db`) is created automatically on first run and is git-ignored.
- No authentication by design — this is an open feedback wall. Add auth later if you want to restrict who can delete entries.
