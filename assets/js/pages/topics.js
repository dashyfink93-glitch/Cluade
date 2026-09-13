/** Topic explorer: the lesson, then the reference material, then the practice links. */
import { boot, swapPanel, announce } from '../lib/ui.js';
import { TOPICS, TOPIC_BY_ID } from '../data/topics.js';
import { TEACHING } from '../data/teaching.js';
import { FORMULA_BY_ID } from '../data/formulas.js';
import { generatorCounts } from '../data/questions/index.js';
import { mastery } from '../lib/store.js';
import { mountTutor } from '../lib/tutor.js';
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
    const complete = done === t.targets.length;
    return `<li>
      <button type="button" data-topic="${t.id}" aria-current="${t.id === activeId}">
        <span class="topic-nav__idx">${t.number}</span>
        <span>${escapeHtml(t.title)}</span>
        <span class="topic-nav__done ${complete ? 'is-complete' : 'text-muted'}"
          aria-label="${done} of ${t.targets.length} skills ticked">${complete ? '✓ ' : ''}${done}/${t.targets.length}</span>
      </button></li>`;
  }).join('');
}

listEl.addEventListener('click', e => {
  const btn = e.target.closest('button[data-topic]');
  if (btn) location.hash = btn.dataset.topic;
});

/* ---------------- Panel sections ---------------- */
function lessonHtml(topic, teach) {
  if (!teach) return '';
  return `
    <div class="lesson">
      <p class="lesson__hook">${escapeHtml(teach.hook)}</p>

      <h3>The idea, before the notation</h3>
      <p class="lesson__intuition">${teach.intuition}</p>

      <h3>How I would work through it</h3>
      <ol class="steps steps--lesson">
        ${teach.board.map(s => `<li>
          <p class="steps__title">${escapeHtml(s.t)}</p>
          <p class="mb-0">${s.h}</p>
        </li>`).join('')}
      </ol>

      <h3>Choosing the right method</h3>
      <div class="table-scroll" tabindex="0">
        <table>
          <thead><tr><th scope="col">If the question says&hellip;</th><th scope="col">&hellip;then</th></tr></thead>
          <tbody>${teach.decide.map(d => `<tr><th scope="row">${d.when}</th><td>${d.then}</td></tr>`).join('')}</tbody>
        </table>
      </div>

      <h3>What students get wrong, and why</h3>
      <div class="misconceptions">
        ${teach.misconceptions.map(m => `
          <div class="misconception">
            <p class="misconception__wrong"><span class="misconception__tag">Wrong</span> ${escapeHtml(m.wrong)}</p>
            <p class="misconception__why">Why it is tempting: ${escapeHtml(m.why)}</p>
            <p class="misconception__right"><span class="misconception__tag misconception__tag--ok">Right</span> ${m.right}</p>
          </div>`).join('')}
      </div>

      <div class="callout callout--tip">
        <p class="callout__title">Check yourself</p>
        <p class="mb-0">${escapeHtml(teach.checkpoint)}</p>
      </div>
    </div>`;
}

function referenceHtml(topic) {
  const bank = topic.bank.map(b => `
    <tr>
      <th scope="row">${b.formulaId && FORMULA_BY_ID[b.formulaId]
        ? `<a href="formulas.html#f-${b.formulaId}"><span aria-label="${escapeHtml(FORMULA_BY_ID[b.formulaId].aria)}">${FORMULA_BY_ID[b.formulaId].expr}</span></a>`
        : `<span class="math">${escapeHtml(b.rule)}</span>`}</th>
      <td>${escapeHtml(b.use)}</td>
    </tr>`).join('');

  return `
    <h3>Core knowledge</h3>
    <dl class="knowledge">
      ${topic.knowledge.map(k => `<div><dt>${escapeHtml(k.term)}</dt><dd>${escapeHtml(k.text)}</dd></div>`).join('')}
    </dl>

    <h3>Formula and method bank</h3>
    <div class="table-scroll" tabindex="0">
      <table>
        <thead><tr><th scope="col">Formula / rule</th><th scope="col">When and how to use it</th></tr></thead>
        <tbody>${bank}</tbody>
      </table>
    </div>

    <h3>Worked example: ${escapeHtml(topic.worked.title)}</h3>
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
    </div>`;
}

function targetsHtml(topic) {
  return `<ul class="checklist" id="targets">${topic.targets.map((t, i) => `
    <li><label>
      <input type="checkbox" data-target="${i}" ${mastery.isDone(topic.id, i) ? 'checked' : ''}>
      <span>${escapeHtml(t)}</span>
    </label></li>`).join('')}</ul>`;
}

function prevNextHtml(topic) {
  const i = TOPICS.findIndex(t => t.id === topic.id);
  const prev = TOPICS[i - 1];
  const next = TOPICS[i + 1];
  return `<nav class="prev-next" aria-label="Topic navigation">
    ${prev ? `<a class="prev-next__link" href="#${prev.id}">
        <span class="prev-next__dir">← Previous</span>
        <span class="prev-next__title">${prev.number} ${escapeHtml(prev.title)}</span></a>` : '<span></span>'}
    ${next ? `<a class="prev-next__link prev-next__link--next" href="#${next.id}">
        <span class="prev-next__dir">Next →</span>
        <span class="prev-next__title">${next.number} ${escapeHtml(next.title)}</span></a>` : '<span></span>'}
  </nav>`;
}

/* ---------------- Panel ---------------- */
function renderPanel(topic) {
  const teach = TEACHING[topic.id];
  const i = TOPICS.findIndex(t => t.id === topic.id);

  swapPanel(panelEl, `
    <header>
      <p class="crumbs"><a href="topics.html">Learn</a> <span aria-hidden="true">›</span>
        ${escapeHtml(topic.unit)} <span aria-hidden="true">›</span> Topic ${i + 1} of ${TOPICS.length}</p>
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

    <div class="tabs" role="tablist" aria-label="Topic sections">
      <button role="tab" id="tab-lesson" aria-controls="pane-lesson" aria-selected="true">Lesson</button>
      <button role="tab" id="tab-reference" aria-controls="pane-reference" aria-selected="false" tabindex="-1">Reference</button>
      <button role="tab" id="tab-skills" aria-controls="pane-skills" aria-selected="false" tabindex="-1">Skills checklist</button>
    </div>

    <div role="tabpanel" id="pane-lesson" aria-labelledby="tab-lesson" tabindex="0">
      ${lessonHtml(topic, teach)}
      <div id="tutor-mount"></div>
    </div>
    <div role="tabpanel" id="pane-reference" aria-labelledby="tab-reference" tabindex="0" hidden>
      ${referenceHtml(topic)}
    </div>
    <div role="tabpanel" id="pane-skills" aria-labelledby="tab-skills" tabindex="0" hidden>
      <p class="text-muted">Tick a target only when you can do it unaided. Saved in this browser.</p>
      ${targetsHtml(topic)}
    </div>

    <div class="flex-row mt-3">
      <a class="btn btn--primary" href="practice.html?topic=${topic.id}">Practise ${escapeHtml(topic.title)}</a>
      <a class="btn btn--ghost" href="exam.html">Sit a mock exam</a>
    </div>

    ${prevNextHtml(topic)}
  `, { focus: true });

  wireTabs();

  panelEl.querySelectorAll('#targets input').forEach(input => {
    input.addEventListener('change', () => {
      mastery.toggle(topic.id, Number(input.dataset.target), input.checked);
      renderList();
    });
  });

  // Appears only inside a Claude viewer; a no-op everywhere else.
  mountTutor(panelEl.querySelector('#tutor-mount'), topic, teach);
}

/* ---------------- Tabs ---------------- */
function wireTabs() {
  const tabs = [...panelEl.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;

  const select = tab => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
  };

  panelEl.querySelector('.tabs').addEventListener('click', e => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select(tab);
  });

  panelEl.querySelector('.tabs').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); next.focus(); select(next); }
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
