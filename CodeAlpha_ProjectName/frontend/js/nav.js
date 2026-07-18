// js/nav.js
// Renders the navbar's right-side links depending on login state,
// and updates the cart item-count badge. Included on every page.

async function initNavbar() {
  const authLinks = document.getElementById("auth-links");
  if (!authLinks) return;

  try {
    const user = await api.get("/auth/me");
    authLinks.innerHTML = `
      <span>Hi, ${escapeHtml(user.name)}</span>
      <a href="orders.html">My Orders</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.getElementById("logout-link").addEventListener("click", async (e) => {
      e.preventDefault();
      await api.post("/auth/logout");
      window.location.href = "index.html";
    });
    updateCartBadge();
  } catch {
    authLinks.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

async function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  try {
    const cart = await api.get("/cart");
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count > 0 ? count : "";
  } catch {
    badge.textContent = "";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initNavbar);
