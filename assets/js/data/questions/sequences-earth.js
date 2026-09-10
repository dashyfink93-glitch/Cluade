/**
 * Generators for Growth and decay in sequences, and Earth geometry and time zones.
 */
import { round, num, tidy, math, frac, table, money } from '../../lib/fmt.js';

const ASSET = [
  { thing: 'a delivery van', unit: '$' }, { thing: 'a laptop', unit: '$' },
  { thing: 'an espresso machine', unit: '$' }, { thing: 'a tractor', unit: '$' },
  { thing: 'a 3D printer', unit: '$' }, { thing: 'a smartphone', unit: '$' }
];

const GROWTH_CTX = [
  { thing: 'the membership of a sports club', unit: 'members' },
  { thing: 'the number of native seedlings in a revegetation plot', unit: 'seedlings' },
  { thing: 'the weekly downloads of an app', unit: 'downloads' },
  { thing: 'the number of possums in a reserve', unit: 'possums' }
];

const CITY_PAIRS = [
  { a: 'Cairns', b: 'Melbourne', lat: 'S' }, { a: 'Darwin', b: 'Adelaide', lat: 'S' },
  { a: 'Brisbane', b: 'Hobart', lat: 'S' }, { a: 'Townsville', b: 'Canberra', lat: 'S' }
];

const PARALLEL_PAIRS = [
  { a: 'Perth', b: 'Sydney' }, { a: 'Geraldton', b: 'Brisbane' },
  { a: 'Cape Town', b: 'Sydney' }, { a: 'Santiago', b: 'Buenos Aires' }
];

const ZONES = [
  { name: 'Brisbane', off: 10 }, { name: 'Perth', off: 8 }, { name: 'Auckland', off: 12 },
  { name: 'Singapore', off: 8 }, { name: 'Tokyo', off: 9 }, { name: 'Dubai', off: 4 },
  { name: 'London', off: 0 }, { name: 'New York', off: -5 }, { name: 'Los Angeles', off: -8 },
  { name: 'Honolulu', off: -10 }, { name: 'Johannesburg', off: 2 }, { name: 'Mumbai', off: 5.5 }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Formats minutes-since-midnight as a 12-hour clock time. */
function clock(mins) {
  const m = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60), mm = m % 60;
  const suffix = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const label = (h24 === 0 && mm === 0) ? '12:00 am (midnight)' : `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
  return label;
}
/** Day rollover: returns {dayShift, mins}. */
function shiftClock(mins, deltaMins) {
  const total = mins + deltaMins;
  const dayShift = Math.floor(total / 1440);
  return { dayShift, mins: ((total % 1440) + 1440) % 1440 };
}
function offsetLabel(off) {
  const sign = off < 0 ? '−' : '+';
  const a = Math.abs(off);
  const h = Math.floor(a), m = Math.round((a - h) * 60);
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

/* ================================================================== TOPIC 04 */

export const sequences = [
  {
    id: 'seq-classify', topicId: 'sequences', tier: 'skill', marks: 2,
    skill: 'Identify a common difference or common ratio',
    gen(rng) {
      const isArith = rng.bool();
      let terms, param, kind;
      if (isArith) {
        const t1 = rng.step(8, 60, 1);
        const d = rng.sign() * rng.int(3, 12);
        terms = [0, 1, 2, 3].map(i => t1 + i * d);
        param = d; kind = 'arithmetic';
      } else {
        const t1 = rng.pick([16, 24, 32, 40, 48, 60, 80, 100, 200, 600]);
        const r = rng.pick([0.5, 0.75, 0.8, 0.85, 1.2, 1.25, 1.5, 2]);
        terms = [0, 1, 2, 3].map(i => round(t1 * r ** i, 4));
        param = r; kind = 'geometric';
      }
      return {
        prompt: `<p>Classify the sequence ${terms.map(tidy).join(', ')}, … and state its ${isArith ? 'common difference' : 'common ratio'}.</p>`,
        formulaIds: [isArith ? 'arithmetic' : 'geometric'],
        steps: [
          { t: 'Test for a common difference',
            h: `<p>${math(`t<sub>2</sub> <span class="op">−</span> t<sub>1</sub> <span class="op">=</span> ${tidy(terms[1])} <span class="op">−</span> ${tidy(terms[0])} <span class="op">=</span> ${tidy(round(terms[1] - terms[0], 4))}`)}, &nbsp;
                   ${math(`t<sub>3</sub> <span class="op">−</span> t<sub>2</sub> <span class="op">=</span> ${tidy(round(terms[2] - terms[1], 4))}`)}</p>
                <p class="mb-0">${isArith ? 'These match, so the differences are constant.' : 'These do not match, so the sequence is not arithmetic.'}</p>` },
          { t: 'Test for a common ratio',
            h: `<p>${math(`${frac('t<sub>2</sub>', 't<sub>1</sub>')} <span class="op">=</span> ${frac(tidy(terms[1]), tidy(terms[0]))} <span class="op">=</span> ${tidy(round(terms[1] / terms[0], 4))}`)}, &nbsp;
                   ${math(`${frac('t<sub>3</sub>', 't<sub>2</sub>')} <span class="op">=</span> ${tidy(round(terms[2] / terms[1], 4))}`)}</p>
                <p class="mb-0">${isArith ? 'These differ, so the sequence is not geometric.' : 'These match, so the ratios are constant.'}</p>` },
          { t: 'Name the sequence', formulaId: isArith ? 'arithmetic' : 'geometric',
            h: `<p class="mb-0">The sequence is <strong>${kind}</strong> with ${isArith ? math(`d <span class="op">=</span> ${tidy(param)}`) : math(`r <span class="op">=</span> ${tidy(param)}`)}${!isArith ? ` — a ${param > 1 ? 'growth' : 'decay'} sequence, since r is ${param > 1 ? 'greater than' : 'between 0 and'} 1.` : '.'}</p>` }
        ],
        answer: `${kind.charAt(0).toUpperCase() + kind.slice(1)}, ${isArith ? 'd' : 'r'} = ${tidy(param)}.`,
        pitfall: 'Repeated percentage change is geometric, not arithmetic — the step size grows or shrinks with the terms.',
        check: { type: 'number', value: param, tol: 0.005, label: isArith ? 'common difference d' : 'common ratio r' }
      };
    }
  },

  {
    id: 'seq-arith-nth', topicId: 'sequences', tier: 'skill', marks: 2,
    skill: 'Use the arithmetic nth-term rule',
    gen(rng) {
      const t1 = rng.step(20, 120, 4);
      const d = rng.sign() * rng.int(3, 14);
      const n = rng.int(8, 25);
      const tn = t1 + (n - 1) * d;
      return {
        prompt: `<p>An arithmetic sequence has ${math(`t<sub>1</sub> <span class="op">=</span> ${t1}`)} and ${math(`d <span class="op">=</span> ${tidy(d)}`)}.</p>
                 <p class="mb-0">Find ${math(`t<sub>${n}</sub>`, `t sub ${n}`)}.</p>`,
        formulaIds: ['arithmetic'],
        steps: [
          { t: 'Select the rule', formulaId: 'arithmetic',
            h: `<p>${math('t<sub>n</sub> <span class="op">=</span> t<sub>1</sub> <span class="op">+</span> (n <span class="op">−</span> 1)d')}</p>` },
          { t: 'Substitute — note the n − 1',
            h: `<p>${math(`t<sub>${n}</sub> <span class="op">=</span> ${t1} <span class="op">+</span> (${n} <span class="op">−</span> 1) <span class="op">×</span> ${tidy(d)}`, `t sub ${n} equals ${t1} plus open bracket ${n} minus 1 close bracket times ${d}`)}</p>
                <p class="text-muted mb-0">Because ${math(`t<sub>1</sub>`)} is the starting value, only ${n - 1} steps of size ${tidy(d)} have been taken by term ${n}.</p>` },
          { t: 'Evaluate',
            h: `<p>${math(`t<sub>${n}</sub> <span class="op">=</span> ${t1} <span class="op">+</span> ${tidy((n - 1) * d)} <span class="op">=</span> ${tidy(tn)}`, `t sub ${n} equals ${tn}`)}</p>` }
        ],
        answer: math(`t<sub>${n}</sub> <span class="op">=</span> ${tidy(tn)}`),
        pitfall: 'Using n rather than n − 1 adds one extra step and is the classic off-by-one in this topic.',
        check: { type: 'number', value: tn, tol: 0.01, label: `t${n}` }
      };
    }
  },

  {
    id: 'seq-geom-nth', topicId: 'sequences', tier: 'skill', marks: 2,
    skill: 'Use the geometric nth-term rule',
    gen(rng) {
      const c = rng.pick(GROWTH_CTX);
      const t1 = rng.step(400, 2000, 50);
      const pctRate = rng.pick([4, 5, 6, 7.5, 8, 10, 12]);
      const r = round(1 + pctRate / 100, 4);
      const n = rng.int(6, 14);
      const tn = round(t1 * r ** (n - 1), 4);
      return {
        prompt: `<p>${c.thing.charAt(0).toUpperCase() + c.thing.slice(1)} starts at <strong>${t1}</strong> ${c.unit} in year 1 and grows by <strong>${tidy(pctRate)}%</strong> each year.</p>
                 <p class="mb-0">Find the value in year ${n}, to the nearest whole number.</p>`,
        formulaIds: ['geometric'],
        steps: [
          { t: 'Turn the percentage into a ratio', formulaId: 'geom-recurrence',
            h: `<p>A ${tidy(pctRate)}% increase multiplies by ${math(`r <span class="op">=</span> 1 <span class="op">+</span> ${tidy(pctRate / 100)} <span class="op">=</span> ${tidy(r)}`)}.</p>` },
          { t: 'Select the rule', formulaId: 'geometric',
            h: `<p>${math('t<sub>n</sub> <span class="op">=</span> t<sub>1</sub> r<sup>(n <span class="op">−</span> 1)</sup>')}</p>` },
          { t: 'Substitute',
            h: `<p>${math(`t<sub>${n}</sub> <span class="op">=</span> ${t1} <span class="op">×</span> ${tidy(r)}<sup>${n - 1}</sup>`, `t sub ${n} equals ${t1} times ${r} to the power of ${n - 1}`)}</p>` },
          { t: 'Evaluate and round once',
            h: `<p>${math(`t<sub>${n}</sub> <span class="op">=</span> ${tidy(tn)} <span class="op">≈</span> ${Math.round(tn)}`)} ${c.unit}.</p>
                <p class="text-muted mb-0">Keep full precision in the calculator and round only at this final step.</p>` }
        ],
        answer: `${math(`t<sub>${n}</sub> <span class="op">≈</span> ${Math.round(tn)}`)} ${c.unit}.`,
        pitfall: 'Using the percentage itself (e.g. 8) instead of the multiplier (1.08) inflates the answer enormously.',
        check: { type: 'number', value: tn, tol: Math.max(1, tn * 0.002), label: `t${n}` }
      };
    }
  },

  {
    id: 'seq-recurrence', topicId: 'sequences', tier: 'apply', marks: 3,
    skill: 'Write a recurrence relation from terms',
    gen(rng) {
      const t1 = rng.pick([600, 800, 1200, 1500, 2400, 3000]);
      const r = rng.pick([0.85, 0.88, 0.9, 0.75, 1.15, 1.2]);
      const terms = [0, 1, 2].map(i => round(t1 * r ** i, 4));
      return {
        prompt: `<p>A sequence begins ${terms.map(tidy).join(', ')}, …</p>
                 <p class="mb-0">Write a recurrence relation that generates it.</p>`,
        formulaIds: ['geom-recurrence'],
        steps: [
          { t: 'Check the differences first',
            h: `<p>${math(`${tidy(terms[1])} <span class="op">−</span> ${tidy(terms[0])} <span class="op">=</span> ${tidy(round(terms[1] - terms[0], 4))}`)} but ${math(`${tidy(terms[2])} <span class="op">−</span> ${tidy(terms[1])} <span class="op">=</span> ${tidy(round(terms[2] - terms[1], 4))}`)} — not constant, so it is not arithmetic.</p>` },
          { t: 'Find the common ratio',
            h: `<p>${math(`${frac(tidy(terms[1]), tidy(terms[0]))} <span class="op">=</span> ${tidy(r)}`)} and ${math(`${frac(tidy(terms[2]), tidy(terms[1]))} <span class="op">=</span> ${tidy(r)}`)} — constant, so it is geometric with ${math(`r <span class="op">=</span> ${tidy(r)}`)}.</p>` },
          { t: 'State the recurrence with its seed', formulaId: 'geom-recurrence',
            h: `<p>${math(`t<sub>1</sub> <span class="op">=</span> ${tidy(t1)}, &nbsp; t<sub>n+1</sub> <span class="op">=</span> ${tidy(r)}t<sub>n</sub>`, `t sub 1 equals ${t1}, t sub n plus 1 equals ${r} times t sub n`)}</p>
                <p class="text-muted mb-0">A recurrence without its starting value defines nothing — the seed is part of the answer.</p>` },
          { t: 'Describe the behaviour',
            h: `<p class="mb-0">Since ${math(`r <span class="op">=</span> ${tidy(r)}`)} is ${r < 1 ? 'between 0 and 1, the terms decay — a ' + tidy(round((1 - r) * 100, 2)) + '% reduction each step' : 'greater than 1, the terms grow — a ' + tidy(round((r - 1) * 100, 2)) + '% increase each step'}.</p>` }
        ],
        answer: math(`t<sub>1</sub> <span class="op">=</span> ${tidy(t1)}, &nbsp; t<sub>n+1</sub> <span class="op">=</span> ${tidy(r)}t<sub>n</sub>`),
        pitfall: 'Omitting the initial value. A recurrence relation is only complete when the seed is stated with it.',
        check: { type: 'number', value: r, tol: 0.005, label: 'common ratio r' }
      };
    }
  },

  {
    id: 'seq-depreciation', topicId: 'sequences', tier: 'apply', marks: 3,
    skill: 'Model diminishing-value depreciation',
    gen(rng) {
      const a = rng.pick(ASSET);
      const v0 = rng.step(1200, 60000, 100);
      const p = rng.pick([12, 15, 18, 20, 22, 25]);
      const r = round(1 - p / 100, 4);
      const yr = rng.int(4, 8);
      const val = round(v0 * r ** (yr - 1), 4);
      return {
        prompt: `<p>${a.thing.charAt(0).toUpperCase() + a.thing.slice(1)} is worth <strong>${money(v0, 0)}</strong> at the end of year 1 and loses <strong>${p}%</strong> of its value each year.</p>
                 <p class="mb-0">Find its value at the end of year ${yr}.</p>`,
        formulaIds: ['geometric'],
        steps: [
          { t: 'Find the retained proportion', formulaId: 'geom-recurrence',
            h: `<p>Losing ${p}% means keeping ${100 - p}%, so ${math(`r <span class="op">=</span> 1 <span class="op">−</span> ${tidy(p / 100)} <span class="op">=</span> ${tidy(r)}`)}.</p>
                <p class="text-muted mb-0">Diminishing-value depreciation is geometric: the dollar loss shrinks each year because it is a percentage of a smaller value.</p>` },
          { t: 'Write the model', formulaId: 'geometric',
            h: `<p>${math(`t<sub>n</sub> <span class="op">=</span> ${tidy(v0)}(${tidy(r)})<sup>(n <span class="op">−</span> 1)</sup>`, `t sub n equals ${v0} times ${r} to the power of n minus 1`)}, with ${math('t<sub>1</sub>')} the value at the end of year 1.</p>` },
          { t: 'Substitute the year',
            h: `<p>${math(`t<sub>${yr}</sub> <span class="op">=</span> ${tidy(v0)}(${tidy(r)})<sup>${yr - 1}</sup>`, `t sub ${yr} equals ${v0} times ${r} to the power of ${yr - 1}`)}</p>
                <p class="text-muted mb-0">Year ${yr} is ${yr - 1} reductions after year 1 — not ${yr}.</p>` },
          { t: 'Evaluate and round to cents',
            h: `<p>${math(`t<sub>${yr}</sub> <span class="op">=</span> ${money(val)}`)}</p>` }
        ],
        answer: `Value at the end of year ${yr} ≈ ${money(val)}.`,
        pitfall: `Using ${p} instead of ${tidy(p / 100)}, or applying ${yr} reductions when only ${yr - 1} have happened.`,
        check: { type: 'number', value: val, tol: Math.max(0.5, val * 0.002), label: `value at end of year ${yr} ($)`, unit: '$' }
      };
    }
  },

  {
    id: 'seq-compare', topicId: 'sequences', tier: 'challenge', marks: 4,
    skill: 'Compare discrete linear and discrete exponential change',
    gen(rng) {
      const start = rng.step(40, 120, 10);
      const d = rng.int(8, 20);
      const p = rng.pick([12, 15, 18, 20, 24]);
      const r = round(1 + p / 100, 4);
      const n = rng.int(8, 14);
      const A = start + (n - 1) * d;
      const B = round(start * r ** (n - 1), 4);
      const bigger = B > A ? 'B' : 'A';
      return {
        prompt: `<p>Two cost models both start at <strong>${start}</strong> units.</p>
                 <ul><li><strong>Model A</strong> rises by ${d} units each period.</li>
                     <li><strong>Model B</strong> rises by ${p}% each period.</li></ul>
                 <p class="mb-0">Determine which is larger at term ${n}, and justify the result.</p>`,
        formulaIds: ['arithmetic', 'geometric'],
        steps: [
          { t: 'Model A is arithmetic', formulaId: 'arithmetic',
            h: `<p>${math(`t<sub>${n}</sub> <span class="op">=</span> ${start} <span class="op">+</span> (${n} <span class="op">−</span> 1) <span class="op">×</span> ${d} <span class="op">=</span> ${tidy(A)}`, `t sub ${n} equals ${start} plus ${n} minus 1 times ${d} equals ${A}`)}</p>` },
          { t: 'Model B is geometric', formulaId: 'geometric',
            h: `<p>${math(`r <span class="op">=</span> ${tidy(r)}`)}, so ${math(`t<sub>${n}</sub> <span class="op">=</span> ${start} <span class="op">×</span> ${tidy(r)}<sup>${n - 1}</sup> <span class="op">=</span> ${tidy(B)}`, `t sub ${n} equals ${start} times ${r} to the power of ${n - 1} equals ${B}`)}</p>` },
          { t: 'Compare',
            h: `<p>${math(`${tidy(Math.max(A, B))} <span class="op">></span> ${tidy(Math.min(A, B))}`)}, so <strong>Model ${bigger}</strong> is larger at term ${n} by ${math(tidy(round(Math.abs(B - A), 2)))} units.</p>` },
          { t: 'Justify with the structure',
            h: `<p class="mb-0">Model A adds a fixed ${d} units each period, so its graph is a set of discrete points on a straight line. Model B multiplies by ${tidy(r)}, so each increase is larger than the last. Exponential growth eventually overtakes any linear growth — the only question is whether it has done so by term ${n}${bigger === 'A' ? ', and here it has not yet' : ', and here it has'}.</p>` }
        ],
        answer: `Model A = ${tidy(A)}; Model B ≈ ${tidy(B)}. Model ${bigger} is larger at term ${n}.`,
        pitfall: 'Comparing the two at term 1 or term 2 and generalising. Exponential growth starts slowly and then overtakes.',
        check: { type: 'number', value: B, tol: Math.max(0.5, B * 0.002), label: `Model B at term ${n}` }
      };
    }
  }
];

/* ================================================================== TOPIC 05 */

export const earthGeometry = [
  {
    id: 'eg-dms', topicId: 'earth-geometry', tier: 'skill', marks: 2,
    skill: 'Convert degrees and minutes to decimal degrees',
    gen(rng) {
      const deg = rng.int(8, 48);
      const min = rng.pick([6, 12, 18, 24, 30, 36, 42, 45, 48, 54]);
      const hemi = rng.pick(['S', 'N']);
      const dec = round(deg + min / 60, 4);
      return {
        prompt: `<p>Convert ${math(`${deg}°${min}′${hemi}`, `${deg} degrees ${min} minutes ${hemi === 'S' ? 'south' : 'north'}`)} to decimal degrees.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Recall the subdivision',
            h: `<p>One degree is divided into 60 minutes, so ${math(`${min}′ <span class="op">=</span> ${frac(min, 60)}°`)}.</p>` },
          { t: 'Convert the minutes',
            h: `<p>${math(`${frac(min, 60)} <span class="op">=</span> ${tidy(min / 60)}`, `${min} over 60 equals ${round(min / 60, 4)}`)}</p>` },
          { t: 'Add to the whole degrees and keep the hemisphere',
            h: `<p>${math(`${deg} <span class="op">+</span> ${tidy(min / 60)} <span class="op">=</span> ${tidy(dec)}°${hemi}`, `${deg} plus ${round(min / 60, 4)} equals ${dec} degrees ${hemi === 'S' ? 'south' : 'north'}`)}</p>
                <p class="text-muted mb-0">Dropping the ${hemi} loses the hemisphere and can flip a later distance calculation.</p>` }
        ],
        answer: math(`${tidy(dec)}°${hemi}`),
        pitfall: 'Dividing by 100 instead of 60 — minutes are sixtieths, not hundredths.',
        check: { type: 'number', value: dec, tol: 0.005, label: 'decimal degrees' }
      };
    }
  },

  {
    id: 'eg-meridian', topicId: 'earth-geometry', tier: 'apply', marks: 3,
    skill: 'Calculate a same-meridian distance',
    gen(rng) {
      const cross = rng.bool(0.35);
      const lon = rng.int(100, 175);
      const latA = rng.int(5, 35);
      const latB = rng.int(5, 40);
      const hemiA = 'S';
      const hemiB = cross ? 'N' : 'S';
      const angular = cross ? latA + latB : Math.abs(latA - latB);
      const safeAngular = angular === 0 ? 12 : angular;
      const D = round(111.2 * safeAngular, 2);
      const p = rng.pick(CITY_PAIRS);
      return {
        prompt: `<p>Two places lie on the same meridian, ${lon}°E:</p>
          ${table(['Place', 'Latitude', 'Longitude'], [
            [p.a, `${latA}°${hemiA}`, `${lon}°E`],
            [p.b, `${cross ? latB : (angular === 0 ? latB + 12 : latB)}°${hemiB}`, `${lon}°E`]
          ])}
          <p class="mb-0">Calculate the distance between them along the meridian, to the nearest kilometre.</p>`,
        formulaIds: ['meridian-distance'],
        steps: [
          { t: 'Confirm it is a meridian problem', formulaId: 'meridian-distance',
            h: `<p>Both longitudes are ${lon}°E, so the two places lie on the same meridian — a great circle. Only the latitude difference matters, and no cosine factor is involved.</p>` },
          { t: 'Find the angular distance',
            h: `<p>${cross
              ? `The places are in <strong>opposite</strong> hemispheres, so <em>add</em> the latitudes: ${math(`${latA} <span class="op">+</span> ${latB} <span class="op">=</span> ${safeAngular}°`)}.`
              : `Both are in the <strong>same</strong> hemisphere, so <em>subtract</em> the latitudes: ${math(`|${latA} <span class="op">−</span> ${angular === 0 ? latB + 12 : latB}| <span class="op">=</span> ${safeAngular}°`)}.`}</p>` },
          { t: 'Apply the formula', formulaId: 'meridian-distance',
            h: `<p>${math(`D <span class="op">=</span> 111.2 <span class="op">×</span> ${safeAngular} <span class="op">=</span> ${tidy(D)}`, `D equals 111.2 times ${safeAngular} equals ${D}`)}</p>` },
          { t: 'Round and attach units',
            h: `<p class="mb-0">${math(`D <span class="op">≈</span> ${num(Math.round(D), 0)}`)} km.</p>` }
        ],
        answer: `D ≈ ${num(Math.round(D), 0)} km.`,
        pitfall: 'Subtracting latitudes that are in opposite hemispheres. Across the equator the angles add.',
        check: { type: 'number', value: D, tol: 2, label: 'distance (km)', unit: 'km' }
      };
    }
  },

  {
    id: 'eg-parallel', topicId: 'earth-geometry', tier: 'apply', marks: 3,
    skill: 'Calculate a same-parallel distance',
    gen(rng) {
      const p = rng.pick(PARALLEL_PAIRS);
      const lat = rng.int(12, 48);
      const hemi = rng.pick(['S', 'N']);
      const lonA = rng.int(100, 140);
      const lonB = lonA + rng.int(4, 22);
      const ang = lonB - lonA;
      const D = round(111.2 * Math.cos(lat * Math.PI / 180) * ang, 3);
      return {
        prompt: `<p>${p.a} and ${p.b} both lie on the parallel ${math(`${lat}°${hemi}`)}, at longitudes ${lonA}°E and ${lonB}°E.</p>
                 <p class="mb-0">Calculate the distance between them along that parallel, to the nearest kilometre.</p>`,
        formulaIds: ['parallel-distance'],
        steps: [
          { t: 'Identify the right formula', formulaId: 'parallel-distance',
            h: `<p>The latitudes match, so this is a <strong>same-parallel</strong> problem. Parallels other than the equator are smaller circles, so the distance is scaled by ${math('cos θ')}.</p>` },
          { t: 'Find the angular distance',
            h: `<p>Both longitudes are east, so subtract: ${math(`${lonB} <span class="op">−</span> ${lonA} <span class="op">=</span> ${ang}°`)}.</p>` },
          { t: 'Substitute', formulaId: 'parallel-distance',
            h: `<p>${math(`D <span class="op">=</span> 111.2 <span class="op">×</span> cos(${lat}°) <span class="op">×</span> ${ang}`, `D equals 111.2 times cosine ${lat} degrees times ${ang}`)}</p>
                <p class="text-muted mb-0">Check the calculator is in <strong>degrees</strong>: cos(${lat}°) = ${tidy(round(Math.cos(lat * Math.PI / 180), 4))}.</p>` },
          { t: 'Evaluate and round once',
            h: `<p class="mb-0">${math(`D <span class="op">=</span> ${tidy(D)} <span class="op">≈</span> ${num(Math.round(D), 0)}`)} km.</p>` }
        ],
        answer: `D ≈ ${num(Math.round(D), 0)} km.`,
        pitfall: 'Using the same-meridian formula on a parallel overstates the distance — everywhere except the equator.',
        check: { type: 'number', value: D, tol: 3, label: 'distance (km)', unit: 'km' }
      };
    }
  },

  {
    id: 'eg-long-to-time', topicId: 'earth-geometry', tier: 'skill', marks: 2,
    skill: 'Convert between longitude difference and time difference',
    gen(rng) {
      const toTime = rng.bool();
      if (toTime) {
        const deg = rng.pick([15, 30, 37.5, 45, 52.5, 60, 75, 82.5, 90, 105]);
        const hrs = round(deg / 15, 4);
        const h = Math.floor(hrs), mm = Math.round((hrs - h) * 60);
        return {
          prompt: `<p>Two places differ in longitude by ${math(`${tidy(deg)}°`)}.</p>
                   <p class="mb-0">Find the difference in their local solar times.</p>`,
          formulaIds: ['time-longitude'],
          steps: [
            { t: 'Recall the relationship', formulaId: 'time-longitude',
              h: `<p>The Earth turns 360° in 24 hours, so ${math(`${frac(360, 24)} <span class="op">=</span> 15°`)} per hour.</p>` },
            { t: 'Divide by 15',
              h: `<p>${math(`${frac(tidy(deg), 15)} <span class="op">=</span> ${tidy(hrs)}`, `${deg} over 15 equals ${hrs}`)} hours</p>` },
            { t: 'Express in hours and minutes',
              h: `<p class="mb-0">${math(`${tidy(hrs)}`)} hours = <strong>${h} h${mm ? ` ${mm} min` : ''}</strong>. The place further east is ahead.</p>` }
          ],
          answer: `${h} h${mm ? ` ${mm} min` : ''} (${tidy(hrs)} hours).`,
          pitfall: 'Multiplying by 15 instead of dividing. Degrees ÷ 15 gives hours; hours × 15 gives degrees.',
          check: { type: 'number', value: hrs, tol: 0.02, label: 'time difference (hours)', unit: 'h' }
        };
      }
      const h = rng.int(1, 7), mm = rng.pick([0, 20, 30, 40]);
      const hrs = h + mm / 60;
      const deg = round(hrs * 15, 4);
      return {
        prompt: `<p>Local solar times at two places differ by <strong>${h} h${mm ? ` ${mm} min` : ''}</strong>.</p>
                 <p class="mb-0">How many degrees of longitude separate them?</p>`,
        formulaIds: ['time-longitude'],
        steps: [
          { t: 'Rearrange the relationship', formulaId: 'time-longitude',
            h: `<p>${math(`time <span class="op">=</span> ${frac('longitude', '15')}`)} rearranges to ${math('longitude <span class="op">=</span> time <span class="op">×</span> 15')}.</p>` },
          { t: 'Write the time as a decimal',
            h: `<p>${math(`${h} h ${mm} min <span class="op">=</span> ${h} <span class="op">+</span> ${frac(mm, 60)} <span class="op">=</span> ${tidy(hrs)}`)} hours</p>` },
          { t: 'Multiply by 15',
            h: `<p class="mb-0">${math(`${tidy(hrs)} <span class="op">×</span> 15 <span class="op">=</span> ${tidy(deg)}°`, `${hrs} times 15 equals ${deg} degrees`)}</p>` }
        ],
        answer: math(`${tidy(deg)}°`),
        pitfall: 'Treating 30 minutes as 0.30 of an hour. Convert minutes with ÷ 60 first.',
        check: { type: 'number', value: deg, tol: 0.05, label: 'longitude difference (degrees)', unit: '°' }
      };
    }
  },

  {
    id: 'eg-utc', topicId: 'earth-geometry', tier: 'apply', marks: 3,
    skill: 'Convert local times between UTC offsets',
    gen(rng) {
      const [from, to] = rng.sample(ZONES, 2);
      const dayIdx = rng.int(0, 6);
      const mins = rng.int(0, 23) * 60 + rng.pick([0, 15, 30, 45]);
      const delta = (to.off - from.off) * 60;
      const res = shiftClock(mins, delta);
      const newDay = DAYS[((dayIdx + res.dayShift) % 7 + 7) % 7];
      return {
        prompt: `<p>It is <strong>${clock(mins)} on ${DAYS[dayIdx]}</strong> in ${from.name} (${offsetLabel(from.off)}).</p>
                 <p class="mb-0">Determine the local day and time in ${to.name} (${offsetLabel(to.off)}).</p>`,
        formulaIds: ['time-longitude'],
        steps: [
          { t: 'Find the offset difference',
            h: `<p>${math(`(${tidy(to.off)}) <span class="op">−</span> (${tidy(from.off)}) <span class="op">=</span> ${tidy(to.off - from.off)}`, `${to.off} minus ${from.off} equals ${to.off - from.off}`)} hours</p>
                <p class="text-muted mb-0">Destination minus origin. A ${to.off - from.off >= 0 ? 'positive' : 'negative'} result means ${to.name} is ${to.off - from.off >= 0 ? 'ahead of' : 'behind'} ${from.name}.</p>` },
          { t: 'Apply it to the clock',
            h: `<p>${clock(mins)} ${to.off - from.off >= 0 ? '+' : '−'} ${tidy(Math.abs(to.off - from.off))} h</p>` },
          { t: 'Handle any day change',
            h: `<p>${res.dayShift === 0
              ? 'The result stays inside the same calendar day.'
              : `The clock passes ${res.dayShift > 0 ? 'midnight going forward' : 'back through midnight'}, so the date moves ${res.dayShift > 0 ? 'forward' : 'back'} by ${Math.abs(res.dayShift)} day${Math.abs(res.dayShift) > 1 ? 's' : ''}.`}</p>
                <p class="mb-0">Local time in ${to.name} is <strong>${clock(res.mins)} on ${newDay}</strong>.</p>` }
        ],
        answer: `${clock(res.mins)} on ${newDay} in ${to.name}.`,
        pitfall: 'Getting the right clock time but forgetting the day change. The date is part of the answer.',
        check: { type: 'open' }
      };
    }
  },

  {
    id: 'eg-flight', topicId: 'earth-geometry', tier: 'challenge', marks: 4,
    skill: 'Solve an itinerary problem across dates',
    gen(rng) {
      const [from, to] = rng.sample(ZONES, 2);
      const dayIdx = rng.int(0, 6);
      const depart = rng.int(5, 22) * 60 + rng.pick([0, 15, 30, 45]);
      const durH = rng.int(6, 17), durM = rng.pick([0, 15, 30, 45]);
      const durMins = durH * 60 + durM;
      const utcDepart = shiftClock(depart, -from.off * 60);
      const utcArrive = shiftClock(depart, -from.off * 60 + durMins);
      const arrive = shiftClock(depart, (-from.off + to.off) * 60 + durMins);
      const arriveDay = DAYS[((dayIdx + arrive.dayShift) % 7 + 7) % 7];
      return {
        prompt: `<p>A flight departs ${from.name} (${offsetLabel(from.off)}) at <strong>${clock(depart)} on ${DAYS[dayIdx]}</strong>. The flight takes <strong>${durH} h${durM ? ` ${durM} min` : ''}</strong> and lands in ${to.name} (${offsetLabel(to.off)}).</p>
                 <p class="mb-0">Determine the local day and time of arrival.</p>`,
        formulaIds: ['time-longitude'],
        steps: [
          { t: 'Convert the departure to UTC',
            h: `<p>${from.name} is ${offsetLabel(from.off)}, so ${from.off >= 0 ? 'subtract' : 'add'} ${tidy(Math.abs(from.off))} h to get UTC: ${clock(depart)} ${DAYS[dayIdx]} → <strong>${clock(utcDepart.mins)} UTC</strong>${utcDepart.dayShift ? ` (${utcDepart.dayShift > 0 ? 'next' : 'previous'} day)` : ''}.</p>
                <p class="text-muted mb-0">Working through UTC keeps flight time and time-zone change separate, which is where most errors creep in.</p>` },
          { t: 'Add the flight duration in UTC',
            h: `<p>${clock(utcDepart.mins)} ${math('<span class="op">+</span>')} ${durH} h${durM ? ` ${durM} min` : ''} = <strong>${clock(utcArrive.mins)} UTC</strong>${utcArrive.dayShift ? `, ${utcArrive.dayShift > 0 ? 'crossing into the next day' : 'moving back a day'}` : ''}.</p>
                <p class="text-muted mb-0">Elapsed flight time is the same in every time zone.</p>` },
          { t: 'Convert UTC to the destination',
            h: `<p>${to.name} is ${offsetLabel(to.off)}, so ${to.off >= 0 ? 'add' : 'subtract'} ${tidy(Math.abs(to.off))} h: <strong>${clock(arrive.mins)}</strong>.</p>` },
          { t: 'Fix the date',
            h: `<p class="mb-0">Counting the day shifts, arrival is <strong>${clock(arrive.mins)} on ${arriveDay}</strong>. ${arrive.dayShift === 0
              ? 'The whole journey stays within the departure date.'
              : arrive.dayShift > 0
                ? `The traveller arrives ${arrive.dayShift} day${arrive.dayShift > 1 ? 's' : ''} later on the calendar.`
                : `Crossing eastward across the Date Line, the traveller arrives ${Math.abs(arrive.dayShift)} day${Math.abs(arrive.dayShift) > 1 ? 's' : ''} earlier on the calendar than departure.`}</p>` }
        ],
        answer: `Arrives ${clock(arrive.mins)} on ${arriveDay}, local time in ${to.name}.`,
        pitfall: 'Adding the time-zone difference and the flight time in one step. Convert to UTC, add the duration, then convert out.',
        check: { type: 'open' }
      };
    }
  }
];
