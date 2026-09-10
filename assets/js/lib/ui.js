/** Shared UI behaviour: theme, nav state, and a few small render helpers. */
import { get, set } from './store.js';
import { escapeHtml } from './fmt.js';
import { FORMULA_BY_ID } from '../data/formulas.js';

/* ---------------- Theme ---------------- */
const THEME_KEY = 'theme';

export function initTheme() {
  const saved = get(THEME_KEY, null);
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const sync = () => {
    const dark = currentTheme() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('aria-pressed', String(dark));
  };
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    set(THEME_KEY, next);
    sync();
  });
  sync();
}

function currentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr) return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* ---------------- Nav ---------------- */
export function markCurrentNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const target = a.getAttribute('href').split('/').pop().split('#')[0];
    if (target === here) a.setAttribute('aria-current', 'page');
  });
}

/* ---------------- Render helpers ---------------- */

/** A formula-book entry rendered as an inline chip, linked to the formula sheet. */
export function formulaChip(id) {
  const f = FORMULA_BY_ID[id];
  if (!f) return '';
  return `<a class="formula-chip" href="formulas.html#f-${f.id}">
    <span class="formula-chip__label">Formula book</span>
    <span aria-label="${escapeHtml(f.aria)}">${f.expr}</span>
  </a>`;
}

export function tierPill(tier) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return `<span class="pill pill--${tier}">${label}</span>`;
}

/** Replaces the contents of `el` and moves focus there for screen-reader users. */
export function swapPanel(el, html, { focus = false } = {}) {
  el.innerHTML = html;
  if (focus) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
}

/** Debounce for search-as-you-type. */
export function debounce(fn, ms = 160) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function announce(message) {
  let live = document.getElementById('sr-announcer');
  if (!live) {
    live = document.createElement('div');
    live.id = 'sr-announcer';
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.appendChild(live);
  }
  live.textContent = '';
  setTimeout(() => { live.textContent = message; }, 40);
}

export function boot() {
  initTheme();
  markCurrentNav();
}
