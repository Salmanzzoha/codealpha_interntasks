const API_BASE = 'http://localhost:5000/api';

// ---------- State ----------
let token = localStorage.getItem('tm_token') || null;
let currentUser = JSON.parse(localStorage.getItem('tm_user') || 'null');

// ---------- Elements ----------
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const taskError = document.getElementById('task-error');
const emptyMsg = document.getElementById('empty-msg');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// ---------- Tab switching ----------
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  authError.textContent = '';
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  authError.textContent = '';
});

// ---------- Auth ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');

    setSession(data.token, data.user);
  } catch (err) {
    authError.textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');

    setSession(data.token, data.user);
  } catch (err) {
    authError.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', () => {
  token = null;
  currentUser = null;
  localStorage.removeItem('tm_token');
  localStorage.removeItem('tm_user');
  showAuthView();
});

function setSession(newToken, user) {
  token = newToken;
  currentUser = user;
  localStorage.setItem('tm_token', token);
  localStorage.setItem('tm_user', JSON.stringify(user));
  showAppView();
}

function showAuthView() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
}

function showAppView() {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  userNameSpan.textContent = `Hi, ${currentUser.name}`;
  loadTasks();
}

// ---------- Tasks ----------
async function loadTasks() {
  taskError.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401 || res.status === 403) {
      logoutBtn.click();
      return;
    }
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    taskError.textContent = 'Could not load tasks. Is the backend server running?';
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  emptyMsg.classList.toggle('hidden', tasks.length > 0);

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.innerHTML = `
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="icon-btn toggle" title="Toggle complete">${task.completed ? '↺' : '✔'}</button>
        <button class="icon-btn delete" title="Delete">🗑</button>
      </div>
    `;

    li.querySelector('.toggle').addEventListener('click', () => toggleTask(task));
    li.querySelector('.delete').addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  taskError.textContent = '';
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create task.');

    taskForm.reset();
    loadTasks();
  } catch (err) {
    taskError.textContent = err.message;
  }
});

async function toggleTask(task) {
  try {
    await fetch(`${API_BASE}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ completed: !task.completed })
    });
    loadTasks();
  } catch (err) {
    taskError.textContent = 'Could not update task.';
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadTasks();
  } catch (err) {
    taskError.textContent = 'Could not delete task.';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Init ----------
if (token && currentUser) {
  showAppView();
} else {
  showAuthView();
}
