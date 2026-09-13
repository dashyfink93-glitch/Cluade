/**
 * "Ask a tutor" panel, backed by the artifact `sample` capability.
 *
 * The capability only exists when the page is open inside a Claude viewer. On a
 * plain static host (GitHub Pages, a local server, a file on a USB stick)
 * `window.claude` is absent, `use()` resolves null, and the panel never appears
 *. Everything else on the page works exactly the same.
 *
 * Model output is treated as untrusted text: it is escaped, then a small, fixed
 * set of formatting marks is applied. No HTML from the model ever reaches the DOM.
 */
import { escapeHtml } from './fmt.js';

const MAX_TURNS = 8;          // keeps the prompt small; older turns drop off
const SUGGESTIONS_SHOWN = 3;

/** Viewer-facing copy for each failure the capability can report. */
function messageFor(code) {
  switch (code) {
    case 'not_granted':
    case 'sampling_disabled':
    case 'not_declared':
    case 'capability_disabled':
    case 'capability_removed':
      return null;                    // hide the feature entirely
    case 'rate_limited':
      return 'Too many questions at once. Wait a moment and ask again.';
    case 'prompt_too_large':
      return 'That conversation got too long. Start a new one with the Clear button.';
    case 'session_expired':
      return 'Your session expired. Reload the page and ask again.';
    case 'refused':
      return 'The tutor could not answer that one. Try rephrasing it.';
    case 'cancelled':
      return null;
    case 'empty_completion':
    case 'upstream_error':
    case 'queue_overflow':
      return 'Something went wrong reaching the tutor. Try again.';
    default:
      return 'The tutor is unavailable right now.';
  }
}

/** Escapes, then applies a fixed, safe subset of markdown. */
function formatAnswer(text) {
  const esc = escapeHtml(text);
  const blocks = esc.split(/\n{2,}/).map(block => {
    const lines = block.split('\n');
    if (lines.every(l => /^\s*[-*]\s+/.test(l))) {
      return `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) {
      return `<ol>${lines.map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    }
    return `<p>${inline(lines.join('<br>'))}</p>`;
  });
  return blocks.join('');
}

function inline(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>');
}

/** The instruction and topic material every question is answered against. */
function framing(topic, teaching) {
  const targets = topic.targets.map(t => `- ${t}`).join('\n');
  const knowledge = topic.knowledge.map(k => `- ${k.term}: ${k.text}`).join('\n');
  const bank = topic.bank.map(b => `- ${b.rule}: ${b.use}`).join('\n');
  const errors = topic.errors.map(e => `- ${e}`).join('\n');
  const pitfalls = (teaching?.misconceptions || [])
    .map(m => `- Students often think: ${m.wrong} Correction: ${m.right}`).join('\n');

  return `You are a patient senior secondary mathematics teacher helping a student with
Queensland (QCAA) General Mathematics, Units 3 and 4. The student is working on this topic:

TOPIC: ${topic.title} (${topic.unit})
BIG IDEA: ${topic.bigIdea}

SKILLS IN THIS TOPIC:
${targets}

CORE KNOWLEDGE:
${knowledge}

FORMULAS AND METHODS AVAILABLE:
${bank}

MISTAKES THAT COST MARKS HERE:
${errors}
${pitfalls}

HOW TO ANSWER:
- Explain the reasoning, do not just state an answer. If the student asks you to do
  a calculation, show the substitution line by line.
- Use only methods that fit this syllabus. Students have a scientific calculator and
  the QCAA formula book; they do not have calculus or statistical software.
- Name the formula you are using, in the same words as the list above.
- Australian conventions: dollars, kilometres, degrees (not radians), and
  "practise" as the verb.
- Keep it to a few short paragraphs, or a short numbered list for a method.
- Plain text only. No headings, no tables, no LaTeX. Bold with **stars** if you must.
- If the question is outside this topic, answer briefly and say which topic it belongs to.`;
}

/**
 * Mounts the panel into `container`. Resolves to true if the tutor is available.
 * Safe to call when the capability is missing. It simply renders nothing.
 */
export async function mountTutor(container, topic, teaching) {
  if (!container) return false;

  let sample = null;
  try {
    sample = await globalThis.claude?.use?.('sample');
  } catch { sample = null; }
  if (typeof sample !== 'function') return false;

  const suggestions = [
    `Explain ${topic.title.toLowerCase()} to me like I have never seen it.`,
    'Give me a worked example and talk me through every step.',
    'What is the most common mistake here, and how do I avoid it?',
    'How do I know which formula to use?',
    'Give me a harder question on this, then check my reasoning.'
  ].slice(0, SUGGESTIONS_SHOWN);

  container.innerHTML = `
    <section class="tutor" aria-labelledby="tutor-heading">
      <div class="tutor__head">
        <h3 id="tutor-heading">Ask a tutor about ${escapeHtml(topic.title)}</h3>
        <button type="button" class="btn btn--ghost btn--sm" id="tutor-clear">Clear</button>
      </div>
      <p class="text-muted tutor__note">Answers come from Claude, using this topic's material. Check anything
        surprising against the worked example above. A tutor can be wrong.</p>
      <div class="chip-row" id="tutor-suggestions">
        ${suggestions.map((s, i) => `<button type="button" class="chip-btn" data-q="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
      </div>
      <div class="tutor__log" id="tutor-log" role="log" aria-live="polite" aria-label="Tutor conversation"></div>
      <form class="tutor__form" id="tutor-form">
        <label class="visually-hidden" for="tutor-input">Your question about ${escapeHtml(topic.title)}</label>
        <input type="text" id="tutor-input" autocomplete="off" placeholder="Ask anything about this topic&hellip;">
        <button class="btn btn--primary" type="submit" id="tutor-send">Ask</button>
        <button class="btn btn--ghost" type="button" id="tutor-stop" hidden>Stop</button>
      </form>
      <p class="feedback" id="tutor-error" role="status"></p>
    </section>`;

  const log = container.querySelector('#tutor-log');
  const form = container.querySelector('#tutor-form');
  const input = container.querySelector('#tutor-input');
  const send = container.querySelector('#tutor-send');
  const stop = container.querySelector('#tutor-stop');
  const errorEl = container.querySelector('#tutor-error');
  const suggestionRow = container.querySelector('#tutor-suggestions');

  let turns = [];
  let controller = null;

  function addBubble(role, html) {
    const el = document.createElement('div');
    el.className = `bubble bubble--${role}`;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  async function ask(question) {
    if (!question.trim() || controller) return;
    errorEl.textContent = '';
    suggestionRow.hidden = true;
    addBubble('you', `<p>${escapeHtml(question)}</p>`);
    const answerEl = addBubble('tutor', '<p class="tutor__thinking">Thinking&hellip;</p>');

    // The first turn carries the framing; later turns continue the conversation.
    const content = turns.length ? question : `${framing(topic, teaching)}\n\nSTUDENT'S QUESTION: ${question}`;
    const outgoing = [...turns, { role: 'user', content }].slice(-MAX_TURNS);

    controller = new AbortController();
    send.disabled = true;
    stop.hidden = false;
    input.value = '';

    try {
      const { text } = await sample(outgoing, {
        signal: controller.signal,
        modelTier: 'default',
        cache: false,
        onText: ({ text }) => { answerEl.innerHTML = formatAnswer(text); log.scrollTop = log.scrollHeight; }
      });
      answerEl.innerHTML = formatAnswer(text);
      turns = [...outgoing, { role: 'assistant', content: text }].slice(-MAX_TURNS);
    } catch (e) {
      const kept = e && e.text;
      if (kept) {
        answerEl.innerHTML = formatAnswer(kept);
      } else {
        answerEl.remove();
      }
      const msg = messageFor(e && e.code);
      if (msg) errorEl.textContent = msg;
      if (msg === null && e && e.code !== 'cancelled') container.innerHTML = '';   // capability withdrawn
    } finally {
      controller = null;
      send.disabled = false;
      stop.hidden = true;
      log.scrollTop = log.scrollHeight;
    }
  }

  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  stop.addEventListener('click', () => controller?.abort());
  suggestionRow.addEventListener('click', e => {
    const btn = e.target.closest('button[data-q]');
    if (btn) ask(btn.dataset.q);
  });
  container.querySelector('#tutor-clear').addEventListener('click', () => {
    turns = [];
    log.innerHTML = '';
    errorEl.textContent = '';
    suggestionRow.hidden = false;
    input.focus();
  });

  return true;
}
