/** Mock exam: sit a paper, submit once, then read the marked result. */
import { boot, formulaChip, tierPill, announce } from '../lib/ui.js';
import { TOPIC_BY_ID } from '../data/topics.js';
import { buildPaper, markPaper, gradeTone, GRADE_BANDS, PAPER_LENGTH } from '../lib/exam.js';
import { get, set } from '../lib/store.js';
import { escapeHtml, num, money, round } from '../lib/fmt.js';

boot();

const root = document.getElementById('exam-root');
const startPanel = document.getElementById('exam-start');

let paper = null;
let responses = [];
let current = 0;
let startedAt = 0;
let timerId = null;

/* ---------------- Start screen ---------------- */
function renderStart() {
  const best = get('examBest', null);
  startPanel.hidden = false;
  root.innerHTML = '';
  document.getElementById('best-result').innerHTML = best
    ? `Your best so far: <strong>${best.grade}</strong> &mdash; ${best.earned}/${best.total} marks
       (${num(best.percentage, 0)}%) on ${escapeHtml(best.date)}.`
    : 'You have not sat a paper yet.';
}

/* ---------------- Sitting the paper ---------------- */
function startExam() {
  paper = buildPaper();
  responses = new Array(paper.questions.length).fill('');
  current = 0;
  startedAt = Date.now();
  startPanel.hidden = true;
  renderQuestion();
  timerId = setInterval(updateTimer, 1000);
  announce(`Mock exam started. ${paper.questions.length} questions, ${paper.totalMarks} marks.`);
}

function elapsed() {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function updateTimer() {
  const el = document.getElementById('exam-timer');
  if (el) el.textContent = elapsed();
}

function paletteHtml() {
  return `<ol class="palette" aria-label="Question navigation">
    ${paper.questions.map((q, i) => `<li>
      <button type="button" data-goto="${i}"
        class="palette__btn ${i === current ? 'is-current' : ''} ${responses[i] !== '' ? 'is-answered' : ''}"
        aria-current="${i === current}"
        aria-label="Question ${i + 1}${responses[i] !== '' ? ', answered' : ', not yet answered'}">${i + 1}</button>
    </li>`).join('')}
  </ol>`;
}

function responseFieldHtml(q, i) {
  if (q.check.type === 'choice') {
    return `<ul class="options">
      ${q.check.options.map((o, oi) => `<li><label>
        <input type="radio" name="response" value="${oi}" ${String(responses[i]) === String(oi) ? 'checked' : ''}>
        <span>${o}</span></label></li>`).join('')}
    </ul>`;
  }
  return `<div class="field" style="max-width:340px">
    <label for="response">Your answer &mdash; ${escapeHtml(q.check.label)}</label>
    <input type="text" inputmode="decimal" id="response" name="response" autocomplete="off"
      value="${escapeHtml(String(responses[i]))}">
  </div>`;
}

function renderQuestion() {
  const q = paper.questions[current];
  const topic = TOPIC_BY_ID[q.topicId];
  const answered = responses.filter(r => r !== '').length;

  root.innerHTML = `
    <div class="exam-bar">
      <div>
        <p class="exam-bar__label">Question ${current + 1} of ${paper.questions.length}</p>
        <div class="progress" role="img" aria-label="${answered} of ${paper.questions.length} questions answered">
          <div class="progress__bar" style="width:${answered / paper.questions.length * 100}%"></div>
        </div>
      </div>
      <p class="exam-bar__timer"><span class="visually-hidden">Time elapsed </span><span id="exam-timer">${elapsed()}</span></p>
      <button class="btn btn--primary" type="button" id="submit-btn">Submit paper</button>
    </div>

    ${paletteHtml()}

    <article class="card card--pad-lg question-card">
      <div class="question-card__head">
        ${tierPill(q.tier)}
        <span class="pill">${escapeHtml(topic.title)}</span>
        <span class="pill">${q.marks} mark${q.marks > 1 ? 's' : ''}</span>
      </div>
      <h2 class="visually-hidden">Question ${current + 1}</h2>
      <div class="question-prompt">${q.prompt}</div>
      <form id="response-form">${responseFieldHtml(q, current)}</form>
      <p class="text-muted mb-0"><small>The formula sheet is open in the
        <a href="formulas.html" target="_blank" rel="noopener">Formula sheet</a> tab. Working is not marked here &mdash;
        only the final answer &mdash; so still write it out on paper.</small></p>
    </article>

    <div class="flex-row">
      <button class="btn btn--ghost" type="button" id="prev-btn" ${current === 0 ? 'disabled' : ''}>Previous</button>
      <button class="btn btn--ghost" type="button" id="next-btn" ${current === paper.questions.length - 1 ? 'disabled' : ''}>Next</button>
    </div>`;

  wireQuestion();
}

function captureResponse() {
  const form = document.getElementById('response-form');
  if (!form) return;
  const q = paper.questions[current];
  if (q.check.type === 'choice') {
    const picked = form.querySelector('input[name="response"]:checked');
    responses[current] = picked ? picked.value : '';
  } else {
    responses[current] = form.querySelector('#response').value.trim();
  }
}

function goTo(i) {
  captureResponse();
  current = Math.max(0, Math.min(paper.questions.length - 1, i));
  renderQuestion();
}

function wireQuestion() {
  document.getElementById('prev-btn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('next-btn').addEventListener('click', () => goTo(current + 1));
  document.getElementById('submit-btn').addEventListener('click', confirmSubmit);
  root.querySelector('.palette').addEventListener('click', e => {
    const btn = e.target.closest('button[data-goto]');
    if (btn) goTo(Number(btn.dataset.goto));
  });
  const form = document.getElementById('response-form');
  form.addEventListener('submit', e => { e.preventDefault(); goTo(current + 1); });
  form.addEventListener('change', captureResponse);
  const first = form.querySelector('input');
  if (first && first.type === 'text') first.focus();
}

function confirmSubmit() {
  captureResponse();
  const blank = responses.filter(r => r === '').length;
  if (blank > 0 && !confirm(
    `${blank} question${blank > 1 ? 's are' : ' is'} still unanswered. Unanswered questions score zero. Submit anyway?`)) {
    return;
  }
  clearInterval(timerId);
  renderResult(markPaper(paper, responses), elapsed());
}

/* ---------------- Result ---------------- */
function renderResult(result, time) {
  const tone = gradeTone(result.band.grade);
  const pct = num(result.percentage, 0);

  const topicRows = Object.entries(result.byTopic)
    .map(([id, t]) => ({ id, ...t, pct: t.total ? t.earned / t.total * 100 : 0 }))
    .sort((a, b) => a.pct - b.pct);

  const weakest = topicRows.filter(t => t.pct < 100).slice(0, 3);

  root.innerHTML = `
    <section class="result" aria-labelledby="result-heading">
      <div class="result__grade result__grade--${tone}">
        <p class="result__grade-label">Grade</p>
        <p class="result__grade-value">${result.band.grade}</p>
      </div>
      <div class="result__summary">
        <h2 id="result-heading">${result.earned} out of ${result.total} marks</h2>
        <p class="lead mb-1">${pct}% &middot; ${result.results.filter(r => r.correct).length} of
          ${result.results.length} questions correct &middot; ${time} taken</p>
        ${result.unanswered ? `<p class="text-muted mb-0">${result.unanswered} question${result.unanswered > 1 ? 's were' : ' was'} left unanswered.</p>` : ''}
      </div>
    </section>

    <h3 class="mt-3">Where the marks went</h3>
    <div class="table-scroll" tabindex="0">
      <table>
        <thead><tr><th scope="col">Topic</th><th scope="col">Marks</th><th scope="col">Questions</th><th scope="col">Revise</th></tr></thead>
        <tbody>
          ${topicRows.map(t => `<tr>
            <th scope="row">${escapeHtml(TOPIC_BY_ID[t.id].title)}</th>
            <td>${t.earned}/${t.total}</td>
            <td>${t.correct}/${t.count}</td>
            <td>${t.pct < 100 ? `<a href="topics.html#${t.id}">Open topic</a>` : '<span class="text-muted">—</span>'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    ${weakest.length ? `<div class="callout callout--tip mt-2">
      <p class="callout__title">What to do next</p>
      <p class="mb-0">Start with ${weakest.map(t => `<a href="topics.html#${t.id}">${escapeHtml(TOPIC_BY_ID[t.id].title)}</a>`).join(', ')}.
        Read the lesson, then drill that topic in the generator before sitting another paper.</p>
    </div>` : `<div class="callout callout--tip mt-2">
      <p class="callout__title">Full marks</p>
      <p class="mb-0">Nothing to revise from this paper. Sit another one &mdash; the questions will be different.</p>
    </div>`}

    <h3 class="mt-3">Every question</h3>
    <div class="review">
      ${result.results.map((r, i) => reviewCard(r, i)).join('')}
    </div>

    <div class="flex-row mt-3">
      <button class="btn btn--primary" type="button" id="again-btn">Sit another paper</button>
      <a class="btn btn--ghost" href="practice.html">Drill single topics</a>
    </div>`;

  document.getElementById('again-btn').addEventListener('click', startExam);

  const best = get('examBest', null);
  if (!best || result.percentage > best.percentage) {
    set('examBest', {
      grade: result.band.grade, earned: result.earned, total: result.total,
      percentage: result.percentage, date: new Date().toLocaleDateString('en-AU')
    });
  }

  root.scrollIntoView({ block: 'start' });
  announce(`Paper marked. ${result.earned} of ${result.total} marks, ${pct} per cent, grade ${result.band.grade}.`);
}

function reviewCard(r, i) {
  const q = r.question;
  const yours = r.answered
    ? (q.check.type === 'choice' ? q.check.options[Number(r.response)] : escapeHtml(String(r.response)))
    : '<em>not answered</em>';
  return `<details class="solution review__item ${r.correct ? 'is-right' : 'is-wrong'}">
    <summary>
      <span class="review__num">Q${i + 1}</span>
      <span class="review__verdict">${r.correct ? 'Correct' : r.answered ? 'Incorrect' : 'Not answered'}</span>
      <span class="review__marks">${r.marks}/${q.marks}</span>
      <span class="review__topic">${escapeHtml(TOPIC_BY_ID[q.topicId].title)}</span>
    </summary>
    <div class="solution__body">
      <div class="question-prompt">${q.prompt}</div>
      <p class="mb-1"><strong>Your answer:</strong> ${yours}</p>
      <ol class="steps">
        ${q.steps.map(s => `<li>
          <p class="steps__title">${escapeHtml(s.t)}</p>
          ${s.h}
          ${s.formulaId ? `<div class="flex-row mt-2">${formulaChip(s.formulaId)}</div>` : ''}
        </li>`).join('')}
      </ol>
      <div class="answer-box"><p class="answer-box__label">Answer</p><p>${q.answer}</p></div>
      <div class="callout callout--error mb-0">
        <p class="callout__title">Where marks get lost</p>
        <p class="mb-0">${escapeHtml(q.pitfall)}</p>
      </div>
    </div>
  </details>`;
}

/* ---------------- Boot ---------------- */
document.getElementById('grade-bands').innerHTML = GRADE_BANDS.map(b => {
  const next = GRADE_BANDS[GRADE_BANDS.indexOf(b) - 1];
  const upper = next ? next.min - 1 : 100;
  return `<tr><th scope="row">${b.grade}</th><td>${b.min}${b.min === 0 ? '' : '–' + upper}${b.min === 0 ? ' – 44' : ''}%</td></tr>`;
}).join('');
document.getElementById('paper-length').textContent = PAPER_LENGTH;
document.getElementById('start-btn').addEventListener('click', startExam);
renderStart();

window.addEventListener('beforeunload', e => {
  if (paper && timerId) { e.preventDefault(); e.returnValue = ''; }
});
