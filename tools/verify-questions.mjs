/**
 * Runs every generator many times and checks each output is well-formed and
 * internally consistent. Run with:  node tools/verify-questions.mjs
 */
import { GENERATORS, generate, fromShareId } from '../assets/js/data/questions/index.js';
import { FORMULA_BY_ID } from '../assets/js/data/formulas.js';
import { TOPIC_BY_ID } from '../assets/js/data/topics.js';

const RUNS = Number(process.argv[2] || 300);
const problems = [];
const fail = (gen, msg) => problems.push(`${gen}: ${msg}`);

let generated = 0;
for (const g of GENERATORS) {
  if (!TOPIC_BY_ID[g.topicId]) fail(g.id, `unknown topicId "${g.topicId}"`);
  if (!['skill', 'apply', 'challenge'].includes(g.tier)) fail(g.id, `bad tier "${g.tier}"`);
  if (!Number.isInteger(g.marks) || g.marks < 1) fail(g.id, 'marks must be a positive integer');
  if (!g.skill) fail(g.id, 'missing skill label');

  for (let i = 0; i < RUNS; i++) {
    const seed = (i * 2654435761 + 12345) >>> 0;
    let q;
    try { q = generate(g.id, seed); }
    catch (err) { fail(g.id, `threw on seed ${seed}: ${err.message}`); break; }
    generated++;

    if (!q.prompt || !q.prompt.trim()) fail(g.id, `empty prompt (seed ${seed})`);
    if (!q.answer || !String(q.answer).trim()) fail(g.id, `empty answer (seed ${seed})`);
    if (!q.pitfall) fail(g.id, `missing pitfall (seed ${seed})`);
    if (!Array.isArray(q.steps) || q.steps.length < 3) fail(g.id, `needs at least 3 steps (seed ${seed})`);

    for (const s of q.steps || []) {
      if (!s.t || !s.h) fail(g.id, `step missing title or body (seed ${seed})`);
      if (s.formulaId && !FORMULA_BY_ID[s.formulaId]) fail(g.id, `step cites unknown formula "${s.formulaId}"`);
      if (/undefined|NaN|\[object Object\]/.test(String(s.h))) fail(g.id, `step body contains undefined/NaN (seed ${seed})`);
    }
    for (const f of q.formulaIds || []) {
      if (!FORMULA_BY_ID[f]) fail(g.id, `cites unknown formula "${f}"`);
    }
    for (const field of ['prompt', 'answer']) {
      if (/undefined|NaN|\[object Object\]/.test(String(q[field]))) fail(g.id, `${field} contains undefined/NaN (seed ${seed})`);
    }

    const c = q.check;
    if (!c || !c.type) fail(g.id, `missing check (seed ${seed})`);
    else if (c.type === 'number') {
      if (!Number.isFinite(c.value)) fail(g.id, `check.value is not finite (seed ${seed})`);
      if (!(c.tol > 0)) fail(g.id, `check.tol must be positive (seed ${seed})`);
      if (!c.label) fail(g.id, `numeric check needs a label (seed ${seed})`);
    } else if (c.type === 'choice') {
      if (!Array.isArray(c.options) || c.options.length < 2) fail(g.id, `choice needs 2+ options (seed ${seed})`);
      if (!(c.correct >= 0 && c.correct < c.options.length)) fail(g.id, `choice.correct out of range (seed ${seed})`);
      if (new Set(c.options).size !== c.options.length) fail(g.id, `duplicate choice options (seed ${seed})`);
    } else if (c.type !== 'open') fail(g.id, `unknown check type "${c.type}"`);

    // Reproducibility: same seed must rebuild an identical question.
    const again = generate(g.id, seed);
    if (again.prompt !== q.prompt || String(again.answer) !== String(q.answer)) {
      fail(g.id, `not reproducible for seed ${seed}`);
    }
    // Share ids must round-trip.
    const rt = fromShareId(q.shareId);
    if (!rt || rt.prompt !== q.prompt) fail(g.id, `share id did not round-trip (seed ${seed})`);
  }
}

const byTopic = {};
for (const g of GENERATORS) (byTopic[g.topicId] ||= []).push(g.tier);

console.log(`Generators: ${GENERATORS.length}`);
console.log(`Questions generated and checked: ${generated}`);
for (const [t, tiers] of Object.entries(byTopic)) {
  const c = tiers.reduce((a, x) => ({ ...a, [x]: (a[x] || 0) + 1 }), {});
  console.log(`  ${t.padEnd(18)} ${tiers.length} generators  (skill ${c.skill || 0}, apply ${c.apply || 0}, challenge ${c.challenge || 0})`);
}
const missing = Object.keys(TOPIC_BY_ID).filter(t => !byTopic[t]);
if (missing.length) problems.push(`topics with no generators: ${missing.join(', ')}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of [...new Set(problems)].slice(0, 40)) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('\nAll checks passed.');
