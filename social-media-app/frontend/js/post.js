// js/post.js
// Renders a post card and wires up like/comment/delete interactions.
// Used by both the feed page and the profile page.

function renderPostCard(post) {
  const isOwner = window.currentUser && window.currentUser.id === post.user_id;
  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <a href="profile.html?username=${encodeURIComponent(post.username)}">
          <img class="avatar" src="${post.avatar_url}" alt="${escapeHtml(post.username)}" />
        </a>
        <div>
          <a href="profile.html?username=${encodeURIComponent(post.username)}">
            <span class="post-author">${escapeHtml(post.name)}</span>
          </a>
          <div class="post-username">@${escapeHtml(post.username)}</div>
        </div>
        <span class="post-time">${timeAgo(post.created_at)}</span>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="" />` : ""}
      <div class="post-actions">
        <button class="icon-btn like-btn ${post.likedByViewer ? "liked" : ""}">
          ${post.likedByViewer ? "❤️" : "🤍"} <span class="like-count">${post.likeCount}</span>
        </button>
        <button class="icon-btn comment-toggle-btn">💬 <span class="comment-count">${post.commentCount}</span></button>
        ${isOwner ? `<button class="icon-btn delete-post-btn" style="margin-left:auto; color:var(--danger);">🗑 Delete</button>` : ""}
      </div>
      <div class="comments-section" style="display:none;">
        <div class="comments-list"></div>
        ${
          window.currentUser
            ? `<form class="comment-form">
                <input type="text" class="comment-input" placeholder="Write a comment..." required />
                <button type="submit">Post</button>
              </form>`
            : `<p style="font-size:0.85rem; color:var(--text-light);"><a href="login.html">Log in</a> to comment.</p>`
        }
      </div>
    </div>
  `;
}

function renderComment(c) {
  return `
    <div class="comment-row">
      <img class="avatar small" src="${c.avatar_url}" alt="${escapeHtml(c.username)}" />
      <div class="comment-bubble">
        <span class="comment-author">${escapeHtml(c.name)}</span>${escapeHtml(c.content)}
      </div>
    </div>
  `;
}

// Attaches click handlers to all post-card elements within a container.
// Call this after injecting post-card HTML into the DOM.
function wirePostCards(container) {
  container.querySelectorAll(".post-card").forEach((card) => {
    const postId = card.dataset.postId;

    // Like toggle
    const likeBtn = card.querySelector(".like-btn");
    likeBtn.addEventListener("click", async () => {
      if (!window.currentUser) {
        window.location.href = "login.html";
        return;
      }
      try {
        const result = await api.post(`/posts/${postId}/like`);
        likeBtn.classList.toggle("liked", result.liked);
        likeBtn.querySelector(".like-count").textContent = result.likeCount;
        likeBtn.innerHTML = `${result.liked ? "❤️" : "🤍"} <span class="like-count">${result.likeCount}</span>`;
        likeBtn.classList.toggle("liked", result.liked);
      } catch (err) {
        alert(err.message);
      }
    });

    // Comment toggle + load
    const commentToggleBtn = card.querySelector(".comment-toggle-btn");
    const commentsSection = card.querySelector(".comments-section");
    const commentsList = card.querySelector(".comments-list");
    let loaded = false;

    commentToggleBtn.addEventListener("click", async () => {
      const showing = commentsSection.style.display !== "none";
      commentsSection.style.display = showing ? "none" : "block";
      if (!showing && !loaded) {
        try {
          const post = await api.get(`/posts/${postId}`);
          commentsList.innerHTML = post.comments.map(renderComment).join("") ||
            `<p style="font-size:0.85rem; color:var(--text-light);">No comments yet.</p>`;
          loaded = true;
        } catch (err) {
          commentsList.innerHTML = `<p style="color:var(--danger); font-size:0.85rem;">${err.message}</p>`;
        }
      }
    });

    // Add comment
    const commentForm = card.querySelector(".comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = commentForm.querySelector(".comment-input");
        const content = input.value.trim();
        if (!content) return;
        try {
          const comment = await api.post(`/posts/${postId}/comments`, { content });
          commentsList.insertAdjacentHTML("beforeend", renderComment(comment));
          input.value = "";
          const countEl = card.querySelector(".comment-count");
          countEl.textContent = parseInt(countEl.textContent, 10) + 1;
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Delete post
    const deleteBtn = card.querySelector(".delete-post-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Delete this post?")) return;
        try {
          await api.del(`/posts/${postId}`);
          card.remove();
        } catch (err) {
          alert(err.message);
        }
      });
    }
  });
}
