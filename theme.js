// theme.js — shared across all pages
// Applies saved theme instantly on page load (no flash)
(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = saved === 'light' ? '🌙 Dark' : '☀ Light';
}

function toggleTheme() {
  const h = document.documentElement;
  const isDark = h.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  h.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = next === 'light' ? '🌙 Dark' : '☀ Light';
}

function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', initTheme);
