/**
 * Registry for every question generator.
 *
 * A generator is a pure function of a seeded Rng, so `generate(id, seed)` always
 * rebuilds exactly the same question — which is what makes a question shareable
 * by URL and re-checkable later.
 */
import { Rng, randomSeed } from '../../lib/rand.js';
import { bivariate1, bivariate2, timeSeries } from './data-topics.js';
import { sequences, earthGeometry } from './sequences-earth.js';
import { finance1, finance2 } from './finance.js';
import { graphsNetworks, networks1, networks2 } from './networks.js';

export const GENERATORS = [
  ...bivariate1, ...bivariate2, ...timeSeries,
  ...sequences, ...earthGeometry,
  ...finance1, ...finance2,
  ...graphsNetworks, ...networks1, ...networks2
];

export const GENERATOR_BY_ID = Object.fromEntries(GENERATORS.map(g => [g.id, g]));

export const TIERS = [
  { id: 'skill', label: 'Skill', blurb: 'Single-step recall and substitution. Do these without notes.' },
  { id: 'apply', label: 'Apply', blurb: 'Choose the method, then carry it through. Formula sheet allowed.' },
  { id: 'challenge', label: 'Challenge', blurb: 'Multi-step or interpretive. Treat these as timed exam responses.' }
];

/** Builds the full question for a generator id and seed. */
export function generate(generatorId, seed) {
  const g = GENERATOR_BY_ID[generatorId];
  if (!g) throw new Error(`unknown generator: ${generatorId}`);
  const useSeed = (seed ?? randomSeed()) >>> 0;
  const body = g.gen(new Rng(useSeed));
  return {
    generatorId: g.id,
    seed: useSeed,
    topicId: g.topicId,
    tier: g.tier,
    marks: g.marks,
    skill: g.skill,
    shareId: `${g.id}.${useSeed}`,
    ...body
  };
}

/** Generators matching the current filters. */
export function filterGenerators({ topics = [], tiers = [] } = {}) {
  return GENERATORS.filter(g =>
    (topics.length === 0 || topics.includes(g.topicId)) &&
    (tiers.length === 0 || tiers.includes(g.tier)));
}

/**
 * Random question honouring the filters.
 * `avoid` keeps the generator from repeating twice in a row when alternatives exist.
 */
export function generateRandom({ topics = [], tiers = [], avoid = null, seed = null } = {}) {
  let pool = filterGenerators({ topics, tiers });
  if (pool.length === 0) return null;
  if (pool.length > 1 && avoid) {
    const trimmed = pool.filter(g => g.id !== avoid);
    if (trimmed.length) pool = trimmed;
  }
  const rng = new Rng(seed ?? randomSeed());
  return generate(rng.pick(pool).id, randomSeed());
}

/** Parses "generatorId.seed" back into a question. */
export function fromShareId(shareId) {
  if (typeof shareId !== 'string') return null;
  const at = shareId.lastIndexOf('.');
  if (at < 1) return null;
  const id = shareId.slice(0, at);
  const seed = Number(shareId.slice(at + 1));
  if (!GENERATOR_BY_ID[id] || !Number.isFinite(seed)) return null;
  return generate(id, seed);
}

/** Count of generators per topic, for the topic cards. */
export function generatorCounts() {
  const out = {};
  for (const g of GENERATORS) out[g.topicId] = (out[g.topicId] || 0) + 1;
  return out;
}
