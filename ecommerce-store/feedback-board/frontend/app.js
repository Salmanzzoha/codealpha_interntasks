const API_BASE = 'http://localhost:5001/api';

let selectedRating = 0;

// ---------- Elements ----------
const form = document.getElementById('feedback-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const formError = document.getElementById('form-error');
const starsContainer = document.getElementById('stars');
const starEls = starsContainer.querySelectorAll('span');
const feedbackList = document.getElementById('feedback-list');
const emptyMsg = document.getElementById('empty-msg');
const sortSelect = document.getElementById('sort-select');

// ---------- Star rating picker ----------
starEls.forEach((star) => {
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset.value);
    updateStars();
  });
});

function updateStars() {
  starEls.forEach((star) => {
    star.classList.toggle('active', Number(star.dataset.value) <= selectedRating);
  });
}

// ---------- Submit feedback ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!selectedRating) {
    formError.textContent = 'Please select a star rating.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message, rating: selectedRating })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not submit feedback.');

    form.reset();
    selectedRating = 0;
    updateStars();
    loadFeedback();
  } catch (err) {
    formError.textContent = err.message;
  }
});

// ---------- Sorting ----------
sortSelect.addEventListener('change', loadFeedback);

// ---------- Load & render ----------
async function loadFeedback() {
  try {
    const res = await fetch(`${API_BASE}/feedback?sort=${sortSelect.value}`);
    const items = await res.json();
    renderFeedback(items);
  } catch (err) {
    feedbackList.innerHTML = '';
    formError.textContent = 'Could not load feedback. Is the backend server running?';
  }
}

function renderFeedback(items) {
  feedbackList.innerHTML = '';
  emptyMsg.classList.toggle('hidden', items.length > 0);

  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.innerHTML = `
      <div class="feedback-top">
        <span class="feedback-name">${escapeHtml(item.name)}</span>
        <span class="feedback-stars">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</span>
      </div>
      <div class="feedback-message">${escapeHtml(item.message)}</div>
      <div class="feedback-bottom">
        <span class="feedback-date">${formatDate(item.created_at)}</span>
        <div class="feedback-actions">
          <button class="upvote-btn">👍 ${item.upvotes}</button>
          <button class="delete-btn">Delete</button>
        </div>
      </div>
    `;

    div.querySelector('.upvote-btn').addEventListener('click', () => upvote(item.id));
    div.querySelector('.delete-btn').addEventListener('click', () => deleteFeedback(item.id));

    feedbackList.appendChild(div);
  });
}

async function upvote(id) {
  try {
    await fetch(`${API_BASE}/feedback/${id}/upvote`, { method: 'POST' });
    loadFeedback();
  } catch (err) {
    formError.textContent = 'Could not upvote.';
  }
}

async function deleteFeedback(id) {
  try {
    await fetch(`${API_BASE}/feedback/${id}`, { method: 'DELETE' });
    loadFeedback();
  } catch (err) {
    formError.textContent = 'Could not delete feedback.';
  }
}

function formatDate(isoStr) {
  const d = new Date(isoStr.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Init ----------
loadFeedback();
