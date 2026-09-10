/** Formula sheet: renders every entry, with search and section jump links. */
import { boot, debounce } from '../lib/ui.js';
import { FORMULAS, FORMULA_SECTIONS } from '../data/formulas.js';
import { TOPIC_BY_ID } from '../data/topics.js';
import { escapeHtml } from '../lib/fmt.js';

boot();

const root = document.getElementById('formula-root');
const search = document.getElementById('formula-search');
const status = document.getElementById('search-status');

document.getElementById('jump-nav').innerHTML = FORMULA_SECTIONS
  .map(s => `<a href="#s-${s.id}">${escapeHtml(s.title)}</a>`).join('');

function itemHtml(f) {
  const links = f.topics.map(id => {
    const t = TOPIC_BY_ID[id];
    return t ? `<a class="pill" href="topics.html#${t.id}">${escapeHtml(t.title)}</a>` : '';
  }).join('');
  return `<article class="formula-item" id="f-${f.id}">
    <h3 class="formula-item__name">${escapeHtml(f.name)}</h3>
    <p class="formula-item__expr"><span aria-label="${escapeHtml(f.aria)}">${f.expr}</span></p>
    <p class="formula-item__use">${escapeHtml(f.use)}</p>
    ${links ? `<div class="formula-item__links">${links}</div>` : ''}
  </article>`;
}

/** Light stemming so "annuity" also finds "annuities" and "graph" finds "graphs". */
function stem(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.replace(/ies$/, 'y').replace(/(ses|xes|zes|ches|shes)$/, m => m.slice(0, -2)).replace(/([^s])s$/, '$1'))
    .join(' ');
}

function haystack(f) {
  const topics = f.topics.map(id => TOPIC_BY_ID[id]?.title || '').join(' ');
  const section = FORMULA_SECTIONS.find(s => s.id === f.section)?.title || '';
  return stem(`${f.name} ${f.use} ${f.aria} ${section} ${topics}`);
}

function render(filter = '') {
  const q = filter.trim();
  const terms = stem(q).split(' ').filter(Boolean);
  const match = f => {
    if (!terms.length) return true;
    const hay = haystack(f);
    return terms.every(t => hay.includes(t));
  };

  let shown = 0;
  const html = FORMULA_SECTIONS.map(sec => {
    const items = FORMULAS.filter(f => f.section === sec.id && match(f));
    if (!items.length) return '';
    shown += items.length;
    return `<section class="formula-section" id="s-${sec.id}">
      <h2>${escapeHtml(sec.title)} <span class="pill">${items.length}</span></h2>
      <p class="text-muted">${escapeHtml(sec.blurb)}</p>
      <div class="formula-list">${items.map(itemHtml).join('')}</div>
    </section>`;
  }).join('');

  root.innerHTML = html || `<p class="lead">No formula matches &ldquo;${escapeHtml(filter)}&rdquo;.
    Try a topic name, or clear the search.</p>`;
  status.textContent = q
    ? `${shown} of ${FORMULAS.length} formulas match "${filter}".`
    : `Showing all ${FORMULAS.length} formulas.`;
}

render();
search.addEventListener('input', debounce(e => render(e.target.value), 150));

/* Highlight an entry linked to directly, e.g. formulas.html#f-annuity-pv */
function highlightTarget() {
  document.querySelectorAll('.formula-item.is-target').forEach(el => el.classList.remove('is-target'));
  const id = location.hash.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (el && el.classList.contains('formula-item')) {
    el.classList.add('is-target');
    el.scrollIntoView({ block: 'center' });
  }
}
window.addEventListener('hashchange', highlightTarget);
highlightTarget();
