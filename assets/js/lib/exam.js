/**
 * Mock exam: paper construction, marking and grading.
 *
 * Only auto-markable question types are used (numeric and multiple choice), so a
 * paper can be marked without the student judging their own written response.
 */
import { Rng, randomSeed } from './rand.js';
import { GENERATORS, generate } from '../data/questions/index.js';
import { TOPICS } from '../data/topics.js';

export const PAPER_LENGTH = 14;

/** Roughly the Skill/Apply/Challenge balance of a real combination-response paper. */
const TIER_MIX = { skill: 5, apply: 6, challenge: 3 };

/** Auto-markable generators only — an open written response cannot be marked by the page. */
const MARKABLE = GENERATORS.filter(g => {
  try { return generate(g.id, 12345).check.type !== 'open'; }
  catch { return false; }
});

/**
 * Builds a paper: the requested tier mix, spread as widely across the ten
 * topics as the mix allows, with no generator used twice.
 */
export function buildPaper(seed = randomSeed()) {
  const rng = new Rng(seed);
  const chosen = [];
  const usedGenerators = new Set();
  const topicCount = Object.fromEntries(TOPICS.map(t => [t.id, 0]));

  for (const [tier, wanted] of Object.entries(TIER_MIX)) {
    for (let i = 0; i < wanted; i++) {
      const pool = MARKABLE.filter(g => g.tier === tier && !usedGenerators.has(g.id));
      if (!pool.length) break;
      // Prefer a topic that has come up least often so far.
      const fewest = Math.min(...pool.map(g => topicCount[g.topicId]));
      const best = pool.filter(g => topicCount[g.topicId] === fewest);
      const pick = rng.pick(best);
      usedGenerators.add(pick.id);
      topicCount[pick.topicId]++;
      chosen.push(pick);
    }
  }

  // Order the paper easiest-first, as a real paper broadly is.
  const order = { skill: 0, apply: 1, challenge: 2 };
  chosen.sort((a, b) => order[a.tier] - order[b.tier]);

  const questions = chosen.map((g, i) => ({
    ...generate(g.id, rng.int(1, 2 ** 30)),
    number: i + 1
  }));

  return {
    seed,
    questions,
    totalMarks: questions.reduce((n, q) => n + q.marks, 0)
  };
}

/** Grade bands, highest first. `min` is the lowest percentage in the band. */
export const GRADE_BANDS = [
  { grade: 'A+', min: 95 }, { grade: 'A', min: 90 }, { grade: 'A−', min: 85 },
  { grade: 'B+', min: 80 }, { grade: 'B', min: 75 }, { grade: 'B−', min: 70 },
  { grade: 'C+', min: 65 }, { grade: 'C', min: 60 }, { grade: 'C−', min: 55 },
  { grade: 'D+', min: 50 }, { grade: 'D', min: 45 }, { grade: 'D−', min: 0 }
];

export function gradeFor(percentage) {
  return GRADE_BANDS.find(b => percentage >= b.min) || GRADE_BANDS[GRADE_BANDS.length - 1];
}

/** Tone of the band, for styling only. */
export function gradeTone(grade) {
  const letter = grade[0];
  return letter === 'A' || letter === 'B' ? 'good' : letter === 'C' ? 'fair' : 'poor';
}

/** Marks a single response. Numeric answers are all-or-nothing against the tolerance. */
export function markResponse(question, response) {
  const c = question.check;
  if (response === null || response === undefined || response === '') {
    return { answered: false, correct: false, marks: 0 };
  }
  if (c.type === 'number') {
    const v = parseNumeric(response);
    if (v === null) return { answered: true, correct: false, marks: 0 };
    const correct = Math.abs(v - c.value) <= c.tol;
    return { answered: true, correct, marks: correct ? question.marks : 0 };
  }
  if (c.type === 'choice') {
    const correct = Number(response) === c.correct;
    return { answered: true, correct, marks: correct ? question.marks : 0 };
  }
  return { answered: true, correct: false, marks: 0 };
}

/** Accepts "$1 200", "1,200", "−45", "687 km" and similar. */
export function parseNumeric(raw) {
  const cleaned = String(raw)
    .replace(/[−–—]/g, '-')
    .replace(/[$,\s%]/g, '')
    .replace(/(km|days?|hours?|hrs?|h|min|minutes?)$/i, '');
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : null;
}

/** Marks a whole paper and summarises it by topic. */
export function markPaper(paper, responses) {
  const results = paper.questions.map((q, i) => ({
    question: q,
    response: responses[i],
    ...markResponse(q, responses[i])
  }));

  const earned = results.reduce((n, r) => n + r.marks, 0);
  const percentage = paper.totalMarks ? (earned / paper.totalMarks) * 100 : 0;

  const byTopic = {};
  for (const r of results) {
    const t = (byTopic[r.question.topicId] ||= { earned: 0, total: 0, correct: 0, count: 0 });
    t.earned += r.marks;
    t.total += r.question.marks;
    t.count++;
    if (r.correct) t.correct++;
  }

  return {
    results,
    earned,
    total: paper.totalMarks,
    percentage,
    band: gradeFor(percentage),
    byTopic,
    unanswered: results.filter(r => !r.answered).length
  };
}
