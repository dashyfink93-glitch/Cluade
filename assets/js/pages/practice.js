/** Practice page: filters, the generator, answer checking, and step-by-step solutions. */
import { boot, formulaChip, tierPill, announce } from '../lib/ui.js';
import { TOPICS, TOPIC_BY_ID } from '../data/topics.js';
import { generateRandom, fromShareId, filterGenerators, TIERS } from '../data/questions/index.js';
import { stats } from '../lib/store.js';
import { escapeHtml, round, num, money } from '../lib/fmt.js';

boot();

const region = document.getElementById('question-region');
const form = document.getElementById('filters');
const topicSelect = document.getElementById('topic-select');
const tierChips = document.getElementById('tier-chips');
let current = null;
let answered = false;

/* ---------------- Filters ---------------- */
topicSelect.insertAdjacentHTML('beforeend', TOPICS.map(t =>
  `<option value="${t.id}">${t.number}. ${escapeHtml(t.title)}</option>`).join(''));

tierChips.innerHTML = TIERS.map(t => `
  <label class="chip">
    <input type="checkbox" value="${t.id}" checked>
    <span title="${escapeHtml(t.blurb)}">${t.label}</span>
  </label>`).join('');

function activeFilters() {
  const tiers = [...tierChips.querySelectorAll('input:checked')].map(i => i.value);
  const topic = topicSelect.value;
  return { topics: topic ? [topic] : [], tiers };
}

/* ---------------- Rendering ---------------- */
function checkHtml(q) {
  if (q.check.type === 'number') {
    return `<form class="answer-form" id="answer-form">
      <div class="field">
        <label for="answer-input">Your answer: ${escapeHtml(q.check.label)}</label>
        <input type="text" inputmode="decimal" id="answer-input" autocomplete="off"
          aria-describedby="answer-feedback">
      </div>
      <button class="btn btn--primary" type="submit">Check</button>
    </form>
    <p class="feedback" id="answer-feedback" role="status"></p>`;
  }
  if (q.check.type === 'choice') {
    return `<form id="answer-form">
      <fieldset>
        <legend class="fieldset__legend mb-1">Choose one</legend>
        <ul class="options">
          ${q.check.options.map((o, i) => `<li><label data-idx="${i}">
            <input type="radio" name="choice" value="${i}">
            <span>${o}</span></label></li>`).join('')}
        </ul>
      </fieldset>
      <button class="btn btn--primary mt-2" type="submit">Check</button>
      <p class="feedback mt-2" id="answer-feedback" role="status"></p>
    </form>`;
  }
  return `<div class="callout callout--tip">
    <p class="callout__title">Written response</p>
    <p class="mb-0">Write your response in full sentences, then open the steps and compare.
      Mark yourself honestly. The model answer shows what a full-mark response contains.</p>
  </div>
  <div class="flex-row" id="self-mark">
    <button class="btn btn--ghost btn--sm" type="button" data-mark="1">I got this</button>
    <button class="btn btn--ghost btn--sm" type="button" data-mark="0">I missed something</button>
    <span class="feedback" id="answer-feedback" role="status"></span>
  </div>`;
}

function render(q) {
  const topic = TOPIC_BY_ID[q.topicId];
  const chips = (q.formulaIds || []).map(formulaChip).join('');

  region.innerHTML = `<article class="card card--pad-lg question-card">
    <div class="question-card__head">
      ${tierPill(q.tier)}
      <a class="pill" href="topics.html#${topic.id}">${topic.number} ${escapeHtml(topic.title)}</a>
      <span class="pill">${q.marks} mark${q.marks > 1 ? 's' : ''}</span>
      <span class="spacer"></span>
      <span class="question-id" title="Share this exact question by copying the link">${escapeHtml(q.shareId)}</span>
    </div>

    <h2 class="visually-hidden">Question</h2>
    <div class="question-prompt">${q.prompt}</div>

    ${chips ? `<div><p class="text-muted mb-1"><small>Formula sheet entries you are expected to use:</small></p>
      <div class="flex-row">${chips}</div></div>` : ''}

    <div id="check-area">${checkHtml(q)}</div>

    <details class="solution" id="solution">
      <summary>Show the step-by-step solution</summary>
      <div class="solution__body">
        <ol class="steps">
          ${q.steps.map(s => `<li>
            <p class="steps__title">${escapeHtml(s.t)}</p>
            ${s.h}
            ${s.formulaId ? `<div class="flex-row mt-2">${formulaChip(s.formulaId)}</div>` : ''}
          </li>`).join('')}
        </ol>
        <div class="answer-box">
          <p class="answer-box__label">Answer</p>
          <p>${q.answer}</p>
        </div>
        <div class="callout callout--error mb-0">
          <p class="callout__title">Where marks get lost</p>
          <p class="mb-0">${escapeHtml(q.pitfall)}</p>
        </div>
      </div>
    </details>

    <div class="flex-row">
      <button class="btn btn--primary" type="button" id="next-btn">Next question</button>
      <button class="btn btn--ghost" type="button" id="same-btn">Another like this one</button>
      <button class="btn btn--ghost" type="button" id="copy-btn">Copy link to this question</button>
    </div>
  </article>`;

  wireQuestion(q);
}

/* ---------------- Answer checking ---------------- */
function parseNumeric(raw) {
  const cleaned = String(raw)
    .replace(/[−–—]/g, '-')
    .replace(/[$,\s%]/g, '')
    .replace(/km|days|hours|hrs|h$/gi, '');
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : null;
}

/** Presents the expected value the way the question asked for it. */
function formatExpected(check) {
  const v = check.value;
  if (check.unit === '$') return money(v, Math.abs(v) >= 1000 ? 2 : 2);
  const dp = Number.isInteger(v) ? 0 : (Math.abs(v) < 0.01 ? 6 : 4);
  const text = num(v, dp).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return check.unit ? `${text} ${check.unit}` : text;
}

function settle(wasCorrect, message, cls) {
  const fb = document.getElementById('answer-feedback');
  if (fb) {
    fb.textContent = message;
    fb.className = `feedback feedback--${cls}`;
  }
  if (!answered) {
    answered = true;
    const s = stats.record(current.topicId, wasCorrect);
    paintStats(s);
  }
  document.getElementById('solution').open = true;
  announce(message);
}

function wireQuestion(q) {
  const af = document.getElementById('answer-form');

  if (af && q.check.type === 'number') {
    af.addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('answer-input');
      const v = parseNumeric(input.value);
      if (v === null) {
        document.getElementById('answer-feedback').textContent = 'Enter a number to check.';
        return;
      }
      const ok = Math.abs(v - q.check.value) <= q.check.tol;
      settle(ok, ok
        ? 'Correct. Compare your working with the steps below.'
        : `Not quite. The answer is ${formatExpected(q.check)}. Work through the steps to find where it diverged.`,
        ok ? 'right' : 'wrong');
    });
  }

  if (af && q.check.type === 'choice') {
    af.addEventListener('submit', e => {
      e.preventDefault();
      const picked = af.querySelector('input[name="choice"]:checked');
      if (!picked) {
        document.getElementById('answer-feedback').textContent = 'Choose an option first.';
        return;
      }
      const idx = Number(picked.value);
      const ok = idx === q.check.correct;
      af.querySelectorAll('.options label').forEach(l => {
        const i = Number(l.dataset.idx);
        if (i === q.check.correct) l.classList.add('is-correct');
        else if (i === idx) l.classList.add('is-wrong');
      });
      af.querySelectorAll('input').forEach(i => { i.disabled = true; });
      settle(ok, ok ? 'Correct.' : 'Not quite. The correct option is highlighted.', ok ? 'right' : 'wrong');
    });
  }

  const selfMark = document.getElementById('self-mark');
  if (selfMark) {
    selfMark.addEventListener('click', e => {
      const btn = e.target.closest('button[data-mark]');
      if (!btn) return;
      const ok = btn.dataset.mark === '1';
      settle(ok, ok ? 'Recorded as correct.' : 'Recorded. Reread the steps and try a fresh one.', ok ? 'right' : 'wrong');
    });
  }

  document.getElementById('next-btn').addEventListener('click', () => nextQuestion());
  document.getElementById('same-btn').addEventListener('click', () => nextQuestion(q.generatorId));
  document.getElementById('copy-btn').addEventListener('click', async e => {
    const url = `${location.origin}${location.pathname}?q=${encodeURIComponent(q.shareId)}`;
    try {
      await navigator.clipboard.writeText(url);
      e.target.textContent = 'Link copied';
      setTimeout(() => { e.target.textContent = 'Copy link to this question'; }, 2000);
    } catch {
      history.replaceState(null, '', `?q=${encodeURIComponent(q.shareId)}`);
      e.target.textContent = 'Link is in the address bar';
    }
  });
}

/* ---------------- Flow ---------------- */
function nextQuestion(sameGenerator = null) {
  const { topics, tiers } = activeFilters();
  if (!tiers.length) {
    region.innerHTML = `<div class="card"><p class="mb-0">Select at least one difficulty tier to generate a question.</p></div>`;
    return;
  }
  if (!filterGenerators({ topics, tiers }).length) {
    region.innerHTML = `<div class="card"><p class="mb-0">No question type matches that combination.
      Try adding a difficulty tier or choosing all topics.</p></div>`;
    return;
  }
  answered = false;
  const q = sameGenerator
    ? fromShareId(`${sameGenerator}.${(Math.random() * 4294967295) >>> 0}`)
    : generateRandom({ topics, tiers, avoid: current?.generatorId });
  current = q;
  render(q);
  history.replaceState(null, '', `?q=${encodeURIComponent(q.shareId)}`);
  region.scrollIntoView({ block: 'nearest' });
  announce(`New ${q.tier} question on ${TOPIC_BY_ID[q.topicId].title}.`);
}

function paintStats(s) {
  document.getElementById('s-attempted').textContent = s.attempted;
  document.getElementById('s-accuracy').textContent =
    s.attempted ? `${Math.round(s.correct / s.attempted * 100)}%` : '–';
  document.getElementById('s-streak').textContent = s.streak;
}

form.addEventListener('submit', e => { e.preventDefault(); nextQuestion(); });
topicSelect.addEventListener('change', () => nextQuestion());
document.getElementById('reset-stats').addEventListener('click', () => {
  stats.reset();
  paintStats(stats.read());
  announce('Statistics reset.');
});

document.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'g' || e.key === 'G') { e.preventDefault(); nextQuestion(); }
  if (e.key === 's' || e.key === 'S') {
    const sol = document.getElementById('solution');
    if (sol) { e.preventDefault(); sol.open = !sol.open; }
  }
});

/* ---- Initial state: a shared question, a topic from the URL, or a fresh one ---- */
const params = new URLSearchParams(location.search);
const shared = params.get('q') && fromShareId(params.get('q'));
const wantedTopic = params.get('topic');
if (wantedTopic && TOPIC_BY_ID[wantedTopic]) topicSelect.value = wantedTopic;

paintStats(stats.read());
if (shared) { current = shared; render(shared); }
else nextQuestion();
