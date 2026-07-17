# Task Manager — Full Stack To-Do App

A full-stack task manager with user authentication. Users register/login and manage a private list of tasks (create, edit, complete, delete).

## Stack
- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT auth, bcrypt password hashing
- **Frontend:** Vanilla HTML/CSS/JavaScript (no build step required)

## Features
- Register / Login with hashed passwords and JWT tokens
- Each user only sees and manages their own tasks
- Create, list, update (edit/toggle complete), and delete tasks
- Clean, responsive UI

## Project Structure
```
task-manager/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js               # SQLite setup (users, tasks tables)
│   ├── middleware/auth.js  # JWT verification middleware
│   ├── routes/auth.js      # Register / login routes
│   ├── routes/tasks.js     # Task CRUD routes (protected)
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
# edit .env and set a real JWT_SECRET
npm start
```
Server runs on `http://localhost:5000`.

### 2. Frontend
Just open `frontend/index.html` directly in a browser, or serve it with any static server:
```bash
cd frontend
npx serve .
```
The frontend expects the backend at `http://localhost:5000/api` (see `API_BASE` in `app.js` — change it if you deploy the backend elsewhere).

## API Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|------------------------|------|---------------------------|
| POST   | /api/auth/register     | No   | Create a new account      |
| POST   | /api/auth/login        | No   | Log in, get a JWT         |
| GET    | /api/tasks             | Yes  | List your tasks           |
| GET    | /api/tasks/:id         | Yes  | Get a single task         |
| POST   | /api/tasks             | Yes  | Create a task             |
| PUT    | /api/tasks/:id         | Yes  | Update a task             |
| DELETE | /api/tasks/:id         | Yes  | Delete a task             |

Send the JWT as `Authorization: Bearer <token>` for protected routes.

## Notes
- The SQLite database file (`taskmanager.db`) is created automatically on first run and is git-ignored.
- Change `JWT_SECRET` in `.env` before any real/production use.
