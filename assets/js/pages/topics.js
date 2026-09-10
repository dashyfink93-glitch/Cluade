/** Topic explorer: list on the left, full topic content on the right. */
import { boot, formulaChip, swapPanel, announce } from '../lib/ui.js';
import { TOPICS, TOPIC_BY_ID } from '../data/topics.js';
import { FORMULA_BY_ID } from '../data/formulas.js';
import { generatorCounts } from '../data/questions/index.js';
import { mastery } from '../lib/store.js';
import { escapeHtml } from '../lib/fmt.js';

boot();

const listEl = document.getElementById('topic-list');
const panelEl = document.getElementById('topic-panel');
const counts = generatorCounts();
let activeId = null;

/* ---------------- Left-hand list ---------------- */
function renderList() {
  listEl.innerHTML = TOPICS.map(t => {
    const done = mastery.countFor(t.id, t.targets.length);
    return `<li>
      <button type="button" data-topic="${t.id}" aria-current="${t.id === activeId}">
        <span class="topic-nav__idx">${t.number}</span>
        <span>${escapeHtml(t.title)}</span>
        <span class="topic-nav__done ${done === t.targets.length ? '' : 'text-muted'}"
          aria-label="${done} of ${t.targets.length} skills ticked">${done}/${t.targets.length}</span>
      </button></li>`;
  }).join('');
}

listEl.addEventListener('click', e => {
  const btn = e.target.closest('button[data-topic]');
  if (!btn) return;
  location.hash = btn.dataset.topic;
});

/* ---------------- Topic panel ---------------- */
function renderPanel(topic) {
  const bank = topic.bank.map(b => `
    <tr>
      <th scope="row">${b.formulaId && FORMULA_BY_ID[b.formulaId]
        ? `<a href="formulas.html#f-${b.formulaId}"><span aria-label="${escapeHtml(FORMULA_BY_ID[b.formulaId].aria)}">${FORMULA_BY_ID[b.formulaId].expr}</span></a>`
        : `<span class="math">${escapeHtml(b.rule)}</span>`}</th>
      <td>${escapeHtml(b.use)}</td>
    </tr>`).join('');

  const targets = topic.targets.map((t, i) => `
    <li><label>
      <input type="checkbox" data-target="${i}" ${mastery.isDone(topic.id, i) ? 'checked' : ''}>
      <span>${escapeHtml(t)}</span>
    </label></li>`).join('');

  swapPanel(panelEl, `
    <header>
      <div class="topic-panel__meta">
        <span class="pill pill--unit">${escapeHtml(topic.unit)}</span>
        <span class="pill">${escapeHtml(topic.chapter)}</span>
        <span class="pill">${counts[topic.id] || 0} question types</span>
      </div>
      <h2 id="topic-title">${topic.number} &nbsp;${escapeHtml(topic.title)}</h2>
      <p class="lead text-muted mb-0">${escapeHtml(topic.summary)}</p>
    </header>

    <div class="callout callout--idea">
      <p class="callout__title">Big idea</p>
      <p class="mb-0">${escapeHtml(topic.bigIdea)}</p>
    </div>

    <h3 class="mt-3">Mastery targets</h3>
    <p class="text-muted">Tick a target only when you can do it unaided. Saved in this browser.</p>
    <ul class="checklist" id="targets">${targets}</ul>

    <h3 class="mt-3">Core knowledge</h3>
    <dl class="knowledge">
      ${topic.knowledge.map(k => `<div>
        <dt>${escapeHtml(k.term)}</dt><dd>${escapeHtml(k.text)}</dd></div>`).join('')}
    </dl>

    <h3 class="mt-3">Formula and method bank</h3>
    <div class="table-scroll" tabindex="0">
      <table>
        <thead><tr><th scope="col">Formula / rule</th><th scope="col">When and how to use it</th></tr></thead>
        <tbody>${bank}</tbody>
      </table>
    </div>

    <h3 class="mt-3">Worked example: ${escapeHtml(topic.worked.title)}</h3>
    <ol class="steps">
      ${topic.worked.steps.map(s => `<li><p class="mb-0">${escapeHtml(s)}</p></li>`).join('')}
    </ol>
    <div class="answer-box mt-2">
      <p class="answer-box__label">Answer</p>
      <p>${escapeHtml(topic.worked.answer)}</p>
    </div>

    <div class="callout callout--error mt-3">
      <p class="callout__title">Errors to eliminate</p>
      <ul class="mb-0">${topic.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    </div>

    <div class="flex-row mt-3">
      <a class="btn btn--primary" href="practice.html?topic=${topic.id}">Practise ${escapeHtml(topic.title)}</a>
      <a class="btn btn--ghost" href="formulas.html">Open the formula sheet</a>
    </div>
  `, { focus: true });

  panelEl.querySelectorAll('#targets input').forEach(input => {
    input.addEventListener('change', () => {
      mastery.toggle(topic.id, Number(input.dataset.target), input.checked);
      renderList();
    });
  });
}

/* ---------------- Routing ---------------- */
function show(id) {
  const topic = TOPIC_BY_ID[id] || TOPICS[0];
  activeId = topic.id;
  renderList();
  renderPanel(topic);
  document.title = `${topic.title} — General Maths Hub`;
  announce(`${topic.title} loaded.`);
}

window.addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1));
