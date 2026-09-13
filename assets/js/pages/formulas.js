/** Formula sheet: the official book, annotated, searchable, plus the printed pages. */
import { boot, debounce, announce } from '../lib/ui.js';
import { FORMULAS, FORMULA_SECTIONS, FORMULA_BOOK_PAGES, OFFICIAL, DERIVED } from '../data/formulas.js';
import { TOPIC_BY_ID } from '../data/topics.js';
import { escapeHtml } from '../lib/fmt.js';

boot();

const root = document.getElementById('formula-root');
const search = document.getElementById('formula-search');
const status = document.getElementById('search-status');
const scopeChips = document.getElementById('scope-chips');
const sheetRoot = document.getElementById('official-sheet');

let scope = 'all';   // all | official | derived

document.getElementById('jump-nav').innerHTML = FORMULA_SECTIONS
  .map(s => `<a href="#s-${s.id}">${escapeHtml(s.title)}</a>`).join('');

document.getElementById('formula-counts').innerHTML =
  `<strong>${OFFICIAL.length}</strong> formulas are printed on the official QCAA sheet &mdash; every one of them is here.
   A further <strong>${DERIVED.length}</strong> standard results the syllabus expects you to know, but which the sheet does
   <em>not</em> print, are marked <span class="pill pill--derived">derived</span>.`;

/* ---- The printed pages, rendered from the source PDF ---- */
sheetRoot.innerHTML = FORMULA_BOOK_PAGES.map(p => `
  <figure class="sheet-page">
    <img src="${p.src}" alt="${escapeHtml(p.label)}. The same formulas are listed as searchable text below." loading="lazy" width="1406" height="1988">
    <figcaption>${escapeHtml(p.label)}</figcaption>
  </figure>`).join('');

/* ---- Search ---- */
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

function itemHtml(f) {
  const links = f.topics.map(id => {
    const t = TOPIC_BY_ID[id];
    return t ? `<a class="pill" href="topics.html#${t.id}">${escapeHtml(t.title)}</a>` : '';
  }).join('');
  return `<article class="formula-item" id="f-${f.id}">
    <h3 class="formula-item__name">
      ${escapeHtml(f.name.replace(/ \(derived\)$/, ''))}
      ${f.derived ? '<span class="pill pill--derived">derived</span>' : ''}
    </h3>
    <p class="formula-item__expr"><span aria-label="${escapeHtml(f.aria)}">${f.expr}</span></p>
    <p class="formula-item__use">${escapeHtml(f.use)}</p>
    ${links ? `<div class="formula-item__links">${links}</div>` : ''}
  </article>`;
}

function render(filter = '') {
  const q = filter.trim();
  const terms = stem(q).split(' ').filter(Boolean);
  const inScope = f => scope === 'all' || (scope === 'official' ? !f.derived : f.derived);
  const match = f => inScope(f) && (!terms.length || terms.every(t => haystack(f).includes(t)));

  let shown = 0;
  const html = FORMULA_SECTIONS.map(sec => {
    const items = FORMULAS.filter(f => f.section === sec.id && match(f));
    if (!items.length) return '';
    shown += items.length;
    return `<section class="formula-section" id="s-${sec.id}">
      <h2>${escapeHtml(sec.title)} <span class="pill">${items.length}</span>
        <span class="pill pill--page">sheet page ${sec.page}</span></h2>
      <p class="text-muted">${escapeHtml(sec.blurb)}</p>
      <div class="formula-list">${items.map(itemHtml).join('')}</div>
    </section>`;
  }).join('');

  root.innerHTML = html || `<p class="lead">Nothing matches &ldquo;${escapeHtml(filter)}&rdquo; in this view.
    Try a topic name, or widen the filter.</p>`;

  const scopeLabel = scope === 'all' ? '' : ` ${scope}`;
  status.textContent = q
    ? `${shown}${scopeLabel} formula${shown === 1 ? '' : 's'} match "${filter}".`
    : `Showing all ${shown}${scopeLabel} formulas.`;
}

/* ---- Scope filter ---- */
scopeChips.addEventListener('change', e => {
  if (!e.target.name) return;
  scope = e.target.value;
  render(search.value);
  announce(status.textContent);
});

search.addEventListener('input', debounce(e => render(e.target.value), 150));
render();

/* ---- Deep links, e.g. formulas.html#f-annuity-pv ---- */
function highlightTarget(retry = true) {
  document.querySelectorAll('.formula-item.is-target').forEach(el => el.classList.remove('is-target'));
  const id = location.hash.slice(1);
  if (!id || !id.startsWith('f-')) return;
  const el = document.getElementById(id);
  if (!el) {
    // The entry exists but the search or scope filter has hidden it — reset and retry.
    if (retry && (search.value || scope !== 'all')) {
      search.value = '';
      scope = 'all';
      const allChip = scopeChips.querySelector('input[value="all"]');
      if (allChip) allChip.checked = true;
      render();
      highlightTarget(false);
    }
    return;
  }
  if (el.classList.contains('formula-item')) {
    el.classList.add('is-target');
    el.scrollIntoView({ block: 'center' });
  }
}
window.addEventListener('hashchange', highlightTarget);
highlightTarget();
