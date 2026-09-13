/** Home page: topic grid, progress dashboard, study cycle and revision plan. */
import { boot } from '../lib/ui.js';
import { TOPICS, STUDY_CYCLE, REVISION_CYCLE } from '../data/topics.js';
import { generatorCounts } from '../data/questions/index.js';
import { mastery, stats } from '../lib/store.js';
import { escapeHtml } from '../lib/fmt.js';

boot();

/* ---- Topic cards ---- */
const counts = generatorCounts();
document.getElementById('topic-grid').innerHTML = TOPICS.map(t => `
  <a class="topic-card" href="topics.html#${t.id}">
    <span class="topic-card__num">${t.number} &middot; ${escapeHtml(t.unit)}</span>
    <h3>${escapeHtml(t.title)}</h3>
    <p>${escapeHtml(t.summary)}</p>
    <span class="topic-card__meta">
      <span class="pill">${t.targets.length} skills</span>
      <span class="pill">${counts[t.id] || 0} question types</span>
    </span>
  </a>`).join('');

/* ---- Study cycle ---- */
document.getElementById('study-cycle').innerHTML = STUDY_CYCLE.map(s => `
  <li><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.text)}</p></li>`).join('');

/* ---- Revision plan ---- */
document.querySelector('#revision-table tbody').innerHTML = REVISION_CYCLE.map(r => `
  <tr><th scope="row">${escapeHtml(r.day)}</th><td>${escapeHtml(r.focus)}</td><td>${escapeHtml(r.action)}</td></tr>`).join('');

/* ---- Progress dashboard ---- */
const totalTargets = TOPICS.reduce((n, t) => n + t.targets.length, 0);
const ticked = TOPICS.reduce((n, t) => n + mastery.countFor(t.id, t.targets.length), 0);
const s = stats.read();

document.getElementById('stat-skills').textContent = `${ticked}`;
document.getElementById('stat-attempted').textContent = `${s.attempted}`;
document.getElementById('stat-accuracy').textContent =
  s.attempted ? `${Math.round(s.correct / s.attempted * 100)}%` : '–';

const pctDone = totalTargets ? Math.round(ticked / totalTargets * 100) : 0;
document.getElementById('progress-bar').style.width = `${pctDone}%`;
document.querySelector('.progress').setAttribute('aria-label',
  `Mastery targets ticked: ${ticked} of ${totalTargets}, ${pctDone} per cent`);
document.getElementById('progress-label').textContent = ticked
  ? `${ticked} of ${totalTargets} mastery targets ticked (${pctDone}%). Saved on this device only.`
  : 'Tick mastery targets as you go. They are saved on this device.';
