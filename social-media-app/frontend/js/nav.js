// js/nav.js
async function initNavbar() {
  const authLinks = document.getElementById("auth-links");
  if (!authLinks) return;

  try {
    const user = await api.get("/auth/me");
    window.currentUser = user;
    authLinks.innerHTML = `
      <a href="profile.html?username=${encodeURIComponent(user.username)}">@${escapeHtml(user.username)}</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.getElementById("logout-link").addEventListener("click", async (e) => {
      e.preventDefault();
      await api.post("/auth/logout");
      window.location.href = "index.html";
    });
  } catch {
    window.currentUser = null;
    authLinks.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initNavbar);
