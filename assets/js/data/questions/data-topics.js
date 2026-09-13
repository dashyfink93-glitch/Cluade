/**
 * Generators for Bivariate data analysis 1 & 2 and Time series analysis.
 * Every generator returns a fully-worked question: prompt, the formula-book entries
 * it uses, numbered steps, the answer, and the error it is designed to expose.
 */
import { round, num, tidy, math, frac, table, money } from '../../lib/fmt.js';
import { scatterPlot, timeSeriesPlot, residualPlot, twoWayTable } from '../../lib/charts.js';

/** Mean and sample standard deviation of a list. */
function meanSd(v) {
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1)) || 1;
  return { mean, sd };
}

/**
 * Points whose sample statistics are the ones the question quotes.
 *
 * A plot that disagrees with its own summary table teaches the wrong thing, so
 * rather than scattering points near a line and hoping, this builds y from two
 * exactly uncorrelated pieces: the standardised x, weighted r, and independent
 * noise weighted sqrt(1 - r squared). The result has the stated means, standard
 * deviations and correlation, up to rounding for display.
 */
function scatterWithR(rng, { n = 10, xbar, sx, ybar, sy, r, dp = 1 }) {
  const rawX = Array.from({ length: n }, (_, i) =>
    (i - (n - 1) / 2) / ((n - 1) / 2) + rng.float(-0.25, 0.25, 3));
  const mx = meanSd(rawX);
  const zx = rawX.map(v => (v - mx.mean) / mx.sd);

  // Noise, then strip out whatever part of it points along x.
  let noise = Array.from({ length: n }, () => rng.float(-1, 1, 4));
  const dot = noise.reduce((a, v, i) => a + v * zx[i], 0);
  const zxSq = zx.reduce((a, v) => a + v * v, 0);
  noise = noise.map((v, i) => v - (dot / zxSq) * zx[i]);
  const mn = meanSd(noise);
  const zn = noise.map(v => (v - mn.mean) / mn.sd);

  const k = Math.sqrt(Math.max(0, 1 - r * r));
  return zx.map((z, i) => ({
    x: round(xbar + sx * z, dp),
    y: round(ybar + sy * (r * z + k * zn[i]), dp)
  })).sort((a, b) => a.x - b.x);
}

/** A quarterly series with a trend and a repeating seasonal shape. */
function seasonalSeries(rng, { quarters = 8, base, growth, indices }) {
  const values = [], labels = [], deseasonalised = [];
  for (let i = 0; i < quarters; i++) {
    const q = i % 4;
    const trend = base + growth * i;
    const v = round(trend * indices[q] * rng.float(0.97, 1.03, 3), 0);
    values.push(v);
    labels.push(`Y${Math.floor(i / 4) + 1} Q${q + 1}`);
    deseasonalised.push(round(v / indices[q], 0));
  }
  return { values, labels, deseasonalised };
}

/* ------------------------------------------------------------------ contexts */
const TWO_WAY = [
  { ev: 'school location', a: 'Regional', b: 'Metropolitan', unit: 'students', rv: 'travel at least 30 minutes to school' },
  { ev: 'year level', a: 'Seniors', b: 'Juniors', unit: 'students', rv: 'have paid part-time work' },
  { ev: 'membership type', a: 'Members', b: 'Casual visitors', unit: 'visitors', rv: 'attend more than once a week' },
  { ev: 'shift worked', a: 'Night shift', b: 'Day shift', unit: 'employees', rv: 'report disturbed sleep' },
  { ev: 'household type', a: 'Apartments', b: 'Houses', unit: 'households', rv: 'own at least two vehicles' }
];

const SCATTER = [
  { x: 'hours of study per week', y: 'test score', dir: 'positive' },
  { x: 'age of a car in years', y: 'resale price in dollars', dir: 'negative' },
  { x: 'daily maximum temperature', y: 'electricity used for heating', dir: 'negative' },
  { x: 'weekly training hours', y: 'time for a 5 km run', dir: 'negative' },
  { x: 'rainfall in mm', y: 'crop yield in tonnes', dir: 'positive' },
  { x: 'advertising spend in $1000s', y: 'weekly sales in $1000s', dir: 'positive' }
];

const VARIABLE_POOL = [
  { name: 'method of travel to school', type: 'categorical' },
  { name: 'favourite sport', type: 'categorical' },
  { name: 'eye colour', type: 'categorical' },
  { name: 'level of agreement (agree / neutral / disagree)', type: 'categorical' },
  { name: 'postcode', type: 'categorical' },
  { name: 'height in centimetres', type: 'numerical' },
  { name: 'number of siblings', type: 'numerical' },
  { name: 'weekly income in dollars', type: 'numerical' },
  { name: 'reaction time in seconds', type: 'numerical' },
  { name: 'daily rainfall in millimetres', type: 'numerical' }
];

const SERIES_CONTEXT = [
  { thing: 'monthly visitor numbers at a museum', unit: 'visitors', season: 'month' },
  { thing: 'quarterly sales at a surf shop', unit: 'sales in $1000s', season: 'quarter' },
  { thing: 'quarterly electricity use for a household', unit: 'kWh', season: 'quarter' },
  { thing: 'monthly ice-cream sales at a kiosk', unit: 'sales in $1000s', season: 'month' },
  { thing: 'quarterly enrolments at a swim school', unit: 'enrolments', season: 'quarter' }
];

const strengthOf = a =>
  a >= 0.75 ? 'strong' : a >= 0.5 ? 'moderate' : a >= 0.25 ? 'weak' : 'very weak';

/* ================================================================== TOPIC 01 */

export const bivariate1 = [
  {
    id: 'bd1-r-to-r2', topicId: 'bivariate-1', tier: 'skill', marks: 2,
    skill: "Interpret Pearson's r and R²",
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const r = round(sign * rng.float(0.45, 0.95, 2), 2);
      const R2 = round(r * r, 4);
      return {
        prompt: `A study of ${c.x} and ${c.y} reports a correlation coefficient of ${math(`r <span class="op">=</span> ${tidy(r)}`, `r equals ${r}`)}.
                 <p class="mb-0">Calculate the coefficient of determination and interpret it as a percentage.</p>`,
        formulaIds: ['r-squared'],
        steps: [
          { t: 'Choose the rule', formulaId: 'r-squared',
            h: `<p>The coefficient of determination is the square of the correlation coefficient.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`R<sup>2</sup> <span class="op">=</span> (${tidy(r)})<sup>2</sup> <span class="op">=</span> ${tidy(R2)}`, `R squared equals ${r} squared equals ${R2}`)}</p>
                <p class="text-muted mb-0">Squaring removes the sign, so R² is always positive even when r is negative.</p>` },
          { t: 'Convert to a percentage',
            h: `<p>${math(`${tidy(R2)} <span class="op">×</span> 100 <span class="op">=</span> ${num(R2 * 100, 2)}%`, `${R2} times 100 equals ${num(R2 * 100, 2)} percent`)}</p>` },
          { t: 'Interpret in context',
            h: `<p>${num(R2 * 100, 2)}% of the variation in <strong>${c.y}</strong> is explained by the linear relationship with <strong>${c.x}</strong>.</p>` }
        ],
        answer: `${math(`R<sup>2</sup> <span class="op">=</span> ${tidy(R2)}`)}. That means ${num(R2 * 100, 2)}% of the variation in ${c.y} is explained by the linear relationship with ${c.x}.`,
        pitfall: 'A full-mark interpretation names the response variable and the word "variation". "R² is 70%" on its own does not earn the interpretation mark.',
        check: { type: 'number', value: R2, tol: 0.0005, label: 'R² (4 decimal places)' }
      };
    }
  },

  {
    id: 'bd1-r2-to-r', topicId: 'bivariate-1', tier: 'apply', marks: 2,
    skill: 'Convert between r and R² with attention to sign',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const r = round(sign * rng.float(0.5, 0.94, 2), 2);
      const R2 = round(r * r, 4);
      return {
        prompt: `For ${c.x} and ${c.y}, a scatterplot shows a <strong>${c.dir}</strong> linear association and the coefficient of determination is ${math(`R<sup>2</sup> <span class="op">=</span> ${tidy(R2)}`, `R squared equals ${R2}`)}.
                 <p class="mb-0">Determine Pearson's correlation coefficient r.</p>`,
        formulaIds: ['r-squared'],
        steps: [
          { t: 'Rearrange the rule', formulaId: 'r-squared',
            h: `<p>Since ${math('R<sup>2</sup> <span class="op">=</span> r<sup>2</sup>')}, taking the square root gives ${math('r <span class="op">=</span> ±<span class="sqrt">√<span class="sqrt">R<sup>2</sup></span></span>')}.</p>` },
          { t: 'Take the square root',
            h: `<p>${math(`<span class="sqrt">√<span class="sqrt">${tidy(R2)}</span></span> <span class="op">=</span> ${tidy(Math.abs(r))}`, `the square root of ${R2} equals ${Math.abs(r)}`)}</p>` },
          { t: 'Choose the sign from the association',
            h: `<p>The association is described as <strong>${c.dir}</strong>, so r must be ${sign > 0 ? 'positive' : 'negative'}.</p>
                <p class="mb-0">${math(`r <span class="op">=</span> ${tidy(r)}`, `r equals ${r}`)}</p>` }
        ],
        answer: math(`r <span class="op">=</span> ${tidy(r)}`),
        pitfall: 'R² carries no sign. The direction of the association is the only thing that tells you whether r is positive or negative.',
        check: { type: 'number', value: r, tol: 0.005, label: 'r (2 decimal places)' }
      };
    }
  },

  {
    id: 'bd1-two-way', topicId: 'bivariate-1', tier: 'apply', marks: 3,
    skill: 'Compare conditional percentages to identify association',
    gen(rng) {
      const c = rng.pick(TWO_WAY);
      const nA = rng.step(20, 60, 5);
      const nB = rng.step(20, 60, 5);
      const pA = rng.step(25, 80, 5);
      let pB = rng.step(15, 75, 5);
      if (Math.abs(pA - pB) < 12) pB = pA > 45 ? pA - 20 : pA + 20;
      const yesA = Math.round(nA * pA / 100);
      const yesB = Math.round(nB * pB / 100);
      const percA = round(yesA / nA * 100, 1);
      const percB = round(yesB / nB * 100, 1);
      const diff = round(Math.abs(percA - percB), 1);
      const higher = percA > percB ? c.a : c.b;
      return {
        prompt: `<p>A survey classified ${c.unit} by ${c.ev} and by whether they ${c.rv}.</p>
          ${twoWayTable({
            evName: c.ev, yesLabel: 'Yes', noLabel: 'No',
            groups: [{ name: c.a, yes: yesA, no: nA - yesA }, { name: c.b, yes: yesB, no: nB - yesB }]
          })}
          <p class="mb-0">Percentage the table by group and decide whether the data support an association between ${c.ev} and whether ${c.unit} ${c.rv}.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Choose the right total',
            h: `<p>${c.ev} is the explanatory variable, so percentage <em>across each row</em> using that group's own total, never the grand total of ${nA + nB}.</p>` },
          { t: `Percentage for ${c.a}`,
            h: `<p>${math(`${frac(yesA, nA)} <span class="op">×</span> 100 <span class="op">=</span> ${num(percA, 1)}%`, `${yesA} over ${nA} times 100 equals ${num(percA, 1)} percent`)}</p>` },
          { t: `Percentage for ${c.b}`,
            h: `<p>${math(`${frac(yesB, nB)} <span class="op">×</span> 100 <span class="op">=</span> ${num(percB, 1)}%`, `${yesB} over ${nB} times 100 equals ${num(percB, 1)} percent`)}</p>` },
          { t: 'Compare and justify',
            h: `<p>The difference is ${math(`${num(Math.max(percA, percB), 1)} <span class="op">−</span> ${num(Math.min(percA, percB), 1)} <span class="op">=</span> ${num(diff, 1)}`)} percentage points.</p>
                <p class="mb-0">${diff >= 10
                  ? `A difference of this size is systematic rather than a small fluctuation, so the data <strong>support an association</strong>: ${higher} are more likely to ${c.rv}.`
                  : `A difference this small is weak evidence, so the data give <strong>little support</strong> for an association.`}</p>` }
        ],
        answer: `${c.a}: ${num(percA, 1)}%; ${c.b}: ${num(percB, 1)}%. A difference of ${num(diff, 1)} percentage points, which ${diff >= 10 ? 'supports' : 'gives little support for'} an association.`,
        pitfall: 'Percentaging against the grand total is the single most common error here. Percentage within the groups made by the explanatory variable.',
        check: { type: 'number', value: percA, tol: 0.15, label: `Percentage of ${c.a} who ${c.rv} (1 dp)`, unit: '%' }
      };
    }
  },

  {
    id: 'bd1-classify', topicId: 'bivariate-1', tier: 'skill', marks: 2,
    skill: 'Identify variable types and explanatory/response roles',
    gen(rng) {
      const [v1, v2] = rng.sample(VARIABLE_POOL, 2);
      const correct = `${v1.name} is ${v1.type}; ${v2.name} is ${v2.type}`;
      const flip = t => (t === 'categorical' ? 'numerical' : 'categorical');
      const options = rng.shuffle([
        correct,
        `${v1.name} is ${flip(v1.type)}; ${v2.name} is ${v2.type}`,
        `${v1.name} is ${v1.type}; ${v2.name} is ${flip(v2.type)}`,
        `${v1.name} is ${flip(v1.type)}; ${v2.name} is ${flip(v2.type)}`
      ]);
      return {
        prompt: `<p>A researcher records two variables for each person in a sample:</p>
                 <ul><li>${v1.name}</li><li>${v2.name}</li></ul>
                 <p class="mb-0">Classify each variable.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Ask what each value looks like',
            h: `<p>A <strong>numerical</strong> variable records a quantity you could meaningfully average. A <strong>categorical</strong> variable records a label or group, even when that label is written with digits.</p>` },
          { t: `Classify ${v1.name}`,
            h: `<p>Values are ${v1.type === 'numerical' ? 'measured quantities that can be averaged' : 'labels placing each person in a group'} → <strong>${v1.type}</strong>.</p>` },
          { t: `Classify ${v2.name}`,
            h: `<p>Values are ${v2.type === 'numerical' ? 'measured quantities that can be averaged' : 'labels placing each person in a group'} → <strong>${v2.type}</strong>.</p>` },
          { t: 'Choose the display that follows',
            h: `<p class="mb-0">${v1.type === 'numerical' && v2.type === 'numerical'
              ? 'Two numerical variables → a scatterplot, and r is meaningful.'
              : v1.type === 'categorical' && v2.type === 'categorical'
                ? 'Two categorical variables → a percentaged two-way table. Pearson\'s r does not apply.'
                : 'One of each → parallel boxplots or back-to-back stem plots comparing the numerical variable across the categories.'}</p>` }
        ],
        answer: correct + '.',
        pitfall: 'A number is not automatically numerical. Postcodes and Likert codes are labels. Categorical.',
        check: { type: 'choice', options, correct: options.indexOf(correct) }
      };
    }
  },

  {
    id: 'bd1-describe-r', topicId: 'bivariate-1', tier: 'skill', marks: 2,
    skill: 'Describe a scatterplot by direction, form and strength',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const mag = rng.pick([0.32, 0.41, 0.58, 0.63, 0.71, 0.79, 0.86, 0.92]);
      const r = round(sign * mag, 2);
      const s = strengthOf(mag);
      const pts = scatterWithR(rng, {
        n: 10, xbar: rng.step(12, 24, 2), sx: rng.pick([3, 4, 5]),
        ybar: rng.step(40, 70, 5), sy: rng.pick([6, 8, 10]), r
      });
      const other = c.dir === 'positive' ? 'negative' : 'positive';
      const wrongStrength = s === 'strong' ? 'weak' : 'strong';
      const correct = `A ${s}, ${c.dir} linear association`;
      const options = rng.shuffle([
        correct,
        `A ${s}, ${other} linear association`,
        `A ${wrongStrength}, ${c.dir} linear association`,
        `A ${c.dir} association of ${num(mag * 100, 0)}% strength`
      ]);
      return {
        prompt: `<p>The scatterplot shows ${c.y} against ${c.x} for ${pts.length} observations. The correlation coefficient is ${math(`r <span class="op">=</span> ${tidy(r)}`, `r equals ${r}`)}.</p>
                 ${scatterPlot({ points: pts, xLabel: c.x, yLabel: c.y, title: `${c.y} against ${c.x}` })}
                 <p class="mb-0">Which description is correct?</p>`,
        formulaIds: [],
        steps: [
          { t: 'Read the direction from the sign',
            h: `<p>r is ${sign > 0 ? 'positive' : 'negative'}, so as ${c.x} increases, ${c.y} tends to <strong>${sign > 0 ? 'increase' : 'decrease'}</strong>. A ${c.dir} association.</p>` },
          { t: 'Read the strength from the size',
            h: `<p>Use ${math('|r|')} against the usual bands:</p>
                <ul class="mb-0">
                  <li>0.75 – 1.00 &nbsp;strong</li>
                  <li>0.50 – 0.75 &nbsp;moderate</li>
                  <li>0.25 – 0.50 &nbsp;weak</li>
                  <li>0.00 – 0.25 &nbsp;very weak</li>
                </ul>
                <p class="mt-2 mb-0">${math(`|r| <span class="op">=</span> ${tidy(mag)}`)} → <strong>${s}</strong>.</p>` },
          { t: 'State the form',
            h: `<p>No curvature is described, so the form is <strong>linear</strong>, which is what makes r appropriate in the first place.</p>` }
        ],
        answer: correct + '.',
        pitfall: 'r is not a percentage. "r = 0.9" is not a "90% correlation". The percentage figure comes from R², not r.',
        check: { type: 'choice', options, correct: options.indexOf(correct) }
      };
    }
  },

  {
    id: 'bd1-association-statement', topicId: 'bivariate-1', tier: 'challenge', marks: 4,
    skill: 'Write a justified association statement',
    gen(rng) {
      const c = rng.pick(TWO_WAY);
      const pA = rng.step(55, 85, 1);
      const pB = rng.step(25, 50, 1);
      return {
        prompt: `<p>A school finds that ${pA}% of ${c.a.toLowerCase()} and ${pB}% of ${c.b.toLowerCase()} ${c.rv}.</p>
                 <p class="mb-0">Write a justified statement about the association between ${c.ev} and whether ${c.unit} ${c.rv}. Then state one limitation of the conclusion.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Quote both conditional percentages',
            h: `<p>${c.a}: ${pA}%. ${c.b}: ${pB}%. Both are percentages <em>within</em> the groups made by the explanatory variable, so they can be compared directly.</p>` },
          { t: 'Quantify the difference',
            h: `<p>${math(`${pA} <span class="op">−</span> ${pB} <span class="op">=</span> ${pA - pB}`)} percentage points. A substantial, systematic gap rather than a small fluctuation.</p>` },
          { t: 'State the association in context',
            h: `<p>"There is an association between ${c.ev} and whether ${c.unit} ${c.rv}: ${c.a.toLowerCase()} are ${pA - pB} percentage points more likely to ${c.rv} than ${c.b.toLowerCase()}."</p>` },
          { t: 'Add the limitation',
            h: `<p class="mb-0">The data are observational, so the association does not establish that ${c.ev} <em>causes</em> the difference. A lurking variable may be responsible, and the result applies only to the population this sample was drawn from.</p>` }
        ],
        answer: `There is an association: ${c.a.toLowerCase()} are ${pA - pB} percentage points more likely to ${c.rv} (${pA}% vs ${pB}%). Because the data are observational, no causal claim is justified.`,
        pitfall: 'Marks are lost for stating "there is an association" without quoting the figures, and for sliding into causal language.',
        check: { type: 'open' }
      };
    }
  }
];

/* ================================================================== TOPIC 02 */

export const bivariate2 = [
  {
    id: 'bd2-least-squares', topicId: 'bivariate-2', tier: 'apply', marks: 4,
    skill: 'Calculate m from r, sx, sy and c from the means',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const r = round(sign * rng.pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9]), 2);
      const sx = rng.pick([2, 4, 5, 8]);
      const k = rng.pick([1.5, 2, 2.5, 3]);
      const sy = round(sx * k, 1);
      const xbar = rng.step(10, 40, 2);
      const ybar = rng.step(30, 90, 2);
      const m = round(r * (sy / sx), 4);
      const cc = round(ybar - m * xbar, 4);
      const pts = scatterWithR(rng, { n: 9, xbar, sx, ybar, sy, r });
      return {
        prompt: `<p>The scatterplot shows ${c.y} against ${c.x}, and the sample gives these summary statistics.</p>
          ${scatterPlot({ points: pts, xLabel: `${c.x} (x)`, yLabel: `${c.y} (y)`, title: `${c.y} against ${c.x}`, showTable: false })}
          ${table(['Statistic', 'x̄', 'ȳ', 's<sub>x</sub>', 's<sub>y</sub>', 'r'],
                  [['Value', tidy(xbar), tidy(ybar), tidy(sx), tidy(sy), tidy(r)]])}
          <p class="mb-0">Determine the equation of the least-squares line.</p>`,
        formulaIds: ['slope', 'intercept', 'linear-equation'],
        steps: [
          { t: 'Find the slope', formulaId: 'slope',
            h: `<p>${math(`m <span class="op">=</span> r ${frac('s<sub>y</sub>', 's<sub>x</sub>')} <span class="op">=</span> ${tidy(r)} <span class="op">×</span> ${frac(tidy(sy), tidy(sx))} <span class="op">=</span> ${tidy(m)}`, `m equals r times s y over s x equals ${r} times ${sy} over ${sx} equals ${m}`)}</p>
                <p class="text-muted mb-0">The slope takes its sign from r, so a ${c.dir} association gives a ${sign > 0 ? 'positive' : 'negative'} slope.</p>` },
          { t: 'Find the y-intercept', formulaId: 'intercept',
            h: `<p>${math(`c <span class="op">=</span> <span style="text-decoration:overline">y</span> <span class="op">−</span> m<span style="text-decoration:overline">x</span> <span class="op">=</span> ${tidy(ybar)} <span class="op">−</span> ${tidy(m)} <span class="op">×</span> ${tidy(xbar)} <span class="op">=</span> ${tidy(cc)}`, `c equals y bar minus m x bar equals ${ybar} minus ${m} times ${xbar} equals ${cc}`)}</p>
                <p class="text-muted mb-0">This forces the line through the point of means (${tidy(xbar)}, ${tidy(ybar)}).</p>` },
          { t: 'Write the equation', formulaId: 'linear-equation',
            h: `<p>${math(`ŷ <span class="op">=</span> ${tidy(m)}x ${cc < 0 ? '<span class="op">−</span> ' + tidy(Math.abs(cc)) : '<span class="op">+</span> ' + tidy(cc)}`, `y hat equals ${m} x ${cc < 0 ? 'minus' : 'plus'} ${Math.abs(cc)}`)}</p>` },
          { t: 'Interpret the slope',
            h: `<p class="mb-0">Each extra unit of ${c.x} predicts ${math(tidy(Math.abs(m)))} ${m > 0 ? 'more' : 'fewer'} units of ${c.y}.</p>` }
        ],
        answer: math(`ŷ <span class="op">=</span> ${tidy(m)}x ${cc < 0 ? '<span class="op">−</span> ' + tidy(Math.abs(cc)) : '<span class="op">+</span> ' + tidy(cc)}`),
        pitfall: 'Dividing s_x by s_y instead of s_y by s_x inverts the slope. The response-variable spread always goes on top.',
        check: { type: 'number', value: m, tol: 0.005, label: 'slope m (2+ decimal places)' }
      };
    }
  },

  {
    id: 'bd2-residual', topicId: 'bivariate-2', tier: 'skill', marks: 2,
    skill: 'Calculate and interpret a residual',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const pred = round(rng.float(20, 90, 1), 1);
      const res = round(rng.sign() * rng.float(0.8, 6.5, 1), 1);
      const obs = round(pred + res, 1);
      return {
        prompt: `<p>A least-squares model for ${c.y} predicts ${math(`ŷ <span class="op">=</span> ${tidy(pred)}`)} for one observation. The value actually recorded was ${math(`y <span class="op">=</span> ${tidy(obs)}`)}.</p>
                 <p class="mb-0">Calculate the residual and state what it says about that point.</p>`,
        formulaIds: ['residual'],
        steps: [
          { t: 'Choose the rule', formulaId: 'residual',
            h: `<p>Residual = observed − predicted. Observed always comes first.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`residual <span class="op">=</span> ${tidy(obs)} <span class="op">−</span> ${tidy(pred)} <span class="op">=</span> ${tidy(res)}`, `residual equals ${obs} minus ${pred} equals ${res}`)}</p>` },
          { t: 'Interpret the sign',
            h: `<p class="mb-0">The residual is ${res > 0 ? 'positive' : 'negative'}, so the observed value lies <strong>${res > 0 ? 'above' : 'below'}</strong> the fitted line. The model <strong>${res > 0 ? 'under' : 'over'}-predicted</strong> by ${math(tidy(Math.abs(res)))} units.</p>` }
        ],
        answer: `Residual = ${tidy(res)}; the point lies ${res > 0 ? 'above' : 'below'} the least-squares line.`,
        pitfall: 'Reversing the subtraction flips the sign and reverses the interpretation. Observed − predicted, every time.',
        check: { type: 'number', value: res, tol: 0.05, label: 'residual' }
      };
    }
  },

  {
    id: 'bd2-residual-from-line', topicId: 'bivariate-2', tier: 'apply', marks: 3,
    skill: 'Find a residual from the fitted line and a data point',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const m = round(sign * rng.float(1.2, 4.8, 1), 1);
      const cc = rng.step(10, 60, 2);
      const x = rng.int(4, 20);
      const pred = round(m * x + cc, 3);
      const res = round(rng.sign() * rng.float(1, 5, 1), 1);
      const obs = round(pred + res, 3);
      const residuals = Array.from({ length: 9 }, (_, i) => ({
        x: round(x - 4 + i, 1), r: round(rng.float(-4.5, 4.5, 1), 1)
      }));
      residuals[4] = { x, r: res };
      return {
        prompt: `<p>The least-squares line relating ${c.y} (y) to ${c.x} (x) is ${math(`ŷ <span class="op">=</span> ${tidy(m)}x <span class="op">+</span> ${tidy(cc)}`, `y hat equals ${m} x plus ${cc}`)}.</p>
                 <p class="mb-0">One observation is (${tidy(x)}, ${tidy(obs)}). Calculate its residual.</p>`,
        formulaIds: ['linear-equation', 'residual'],
        steps: [
          { t: 'Predict with the line', formulaId: 'linear-equation',
            h: `<p>${math(`ŷ <span class="op">=</span> ${tidy(m)} <span class="op">×</span> ${tidy(x)} <span class="op">+</span> ${tidy(cc)} <span class="op">=</span> ${tidy(pred)}`, `y hat equals ${m} times ${x} plus ${cc} equals ${pred}`)}</p>` },
          { t: 'Subtract from the observed value', formulaId: 'residual',
            h: `<p>${math(`residual <span class="op">=</span> ${tidy(obs)} <span class="op">−</span> ${tidy(pred)} <span class="op">=</span> ${tidy(res)}`, `residual equals ${obs} minus ${pred} equals ${res}`)}</p>` },
          { t: 'Say what it means',
            h: `<p>The point sits ${math(tidy(Math.abs(res)))} units <strong>${res > 0 ? 'above' : 'below'}</strong> the line.</p>
                <p>Plotting every residual this way is how you check the model. A random band around zero supports a straight line; a curve means a straight line was the wrong shape.</p>
                ${residualPlot({ points: residuals, xLabel: 'x', title: 'Residual plot for the full data set' })}` }
        ],
        answer: `Predicted ${tidy(pred)}; residual = ${tidy(res)} (the point lies ${res > 0 ? 'above' : 'below'} the line).`,
        pitfall: 'Round only at the end. Rounding the prediction first can shift the residual noticeably.',
        check: { type: 'number', value: res, tol: 0.05, label: 'residual' }
      };
    }
  },

  {
    id: 'bd2-predict', topicId: 'bivariate-2', tier: 'apply', marks: 3,
    skill: 'Predict, then distinguish interpolation from extrapolation',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const m = round(sign * rng.float(1.5, 5, 1), 1);
      const cc = rng.step(20, 70, 2);
      const lo = rng.int(5, 12), hi = lo + rng.int(8, 16);
      const outside = rng.bool(0.5);
      const x = outside ? hi + rng.int(4, 14) : rng.int(lo + 1, hi - 1);
      const yhat = round(m * x + cc, 2);
      return {
        prompt: `<p>Data on ${c.x} (x) collected over the range ${math(`${lo} <span class="op">≤</span> x <span class="op">≤</span> ${hi}`)} gives the least-squares line ${math(`ŷ <span class="op">=</span> ${tidy(m)}x <span class="op">+</span> ${tidy(cc)}`)} for ${c.y}.</p>
                 <p class="mb-0">Predict ${c.y} when ${math(`x <span class="op">=</span> ${x}`)}, and state whether the prediction is reliable.</p>`,
        formulaIds: ['linear-equation'],
        steps: [
          { t: 'Substitute into the line', formulaId: 'linear-equation',
            h: `<p>${math(`ŷ <span class="op">=</span> ${tidy(m)} <span class="op">×</span> ${x} <span class="op">+</span> ${tidy(cc)} <span class="op">=</span> ${tidy(yhat)}`, `y hat equals ${m} times ${x} plus ${cc} equals ${yhat}`)}</p>` },
          { t: 'Compare x with the data range',
            h: `<p>The data cover ${math(`${lo} <span class="op">≤</span> x <span class="op">≤</span> ${hi}`)}, and ${math(`x <span class="op">=</span> ${x}`)} lies <strong>${outside ? 'outside' : 'inside'}</strong> that range.</p>` },
          { t: 'Name it and judge reliability',
            h: `<p class="mb-0">${outside
              ? 'This is <strong>extrapolation</strong>. It assumes the linear pattern continues beyond the data, which was never observed. The relationship may change shape, so treat the value as unreliable.'
              : 'This is <strong>interpolation</strong>, made inside the observed range, so it is the more reliable kind of prediction. Provided the residual plot supported a linear model.'}</p>` }
        ],
        answer: `${math(`ŷ <span class="op">=</span> ${tidy(yhat)}`)}. This is ${outside ? 'extrapolation, so treat it as unreliable' : 'interpolation, so it is reasonably reliable'}.`,
        pitfall: 'Producing the number but not naming interpolation or extrapolation leaves the reliability mark on the table.',
        check: { type: 'number', value: yhat, tol: 0.05, label: 'predicted y' }
      };
    }
  },

  {
    id: 'bd2-interpret-slope', topicId: 'bivariate-2', tier: 'skill', marks: 2,
    skill: 'Interpret slope and intercept in context',
    gen(rng) {
      const c = rng.pick(SCATTER);
      const sign = c.dir === 'positive' ? 1 : -1;
      const m = round(sign * rng.float(1.2, 4.5, 1), 1);
      const cc = rng.step(15, 60, 5);
      const correct = `For each one-unit increase in ${c.x}, the model predicts ${tidy(Math.abs(m))} ${m > 0 ? 'more' : 'fewer'} units of ${c.y}.`;
      const options = rng.shuffle([
        correct,
        `For each one-unit increase in ${c.x}, ${c.y} ${m > 0 ? 'rises' : 'falls'} by exactly ${tidy(Math.abs(m))} units.`,
        `A one-unit increase in ${c.x} causes ${c.y} to change by ${tidy(Math.abs(m))} units.`,
        `For each one-unit increase in ${c.y}, the model predicts ${tidy(Math.abs(m))} ${m > 0 ? 'more' : 'fewer'} units of ${c.x}.`
      ]);
      return {
        prompt: `<p>A least-squares model gives ${math(`ŷ <span class="op">=</span> ${tidy(m)}x <span class="op">+</span> ${tidy(cc)}`)}, where x is ${c.x} and y is ${c.y}.</p>
                 <p class="mb-0">Which is the correct interpretation of the slope?</p>`,
        formulaIds: ['linear-equation'],
        steps: [
          { t: 'Identify what the slope measures', formulaId: 'linear-equation',
            h: `<p>In ${math('y <span class="op">=</span> mx <span class="op">+</span> c')}, m is the <em>predicted</em> change in the response for a one-unit rise in the explanatory variable.</p>` },
          { t: 'Keep the wording predictive',
            h: `<p>The model predicts an average change. It does not force every case to change by exactly ${tidy(Math.abs(m))}, and it does not establish cause.</p>` },
          { t: 'Interpret the intercept too',
            h: `<p class="mb-0">${math(`c <span class="op">=</span> ${tidy(cc)}`)} is the predicted ${c.y} when ${c.x} is 0. Say so only if ${math('x <span class="op">=</span> 0')} is meaningful for this context. Otherwise note that it lies outside the sensible domain.</p>` }
        ],
        answer: correct,
        pitfall: 'The words "causes" and "exactly" both cost marks. A regression slope is a predicted average change.',
        check: { type: 'choice', options, correct: options.indexOf(correct) }
      };
    }
  },

  {
    id: 'bd2-lurking', topicId: 'bivariate-2', tier: 'challenge', marks: 3,
    skill: 'Distinguish association from causation',
    gen(rng) {
      const pairs = [
        { a: 'sunscreen sales', b: 'ice-cream sales', lurk: 'hot summer weather', why: 'warm days independently drive both purchases' },
        { a: 'the number of firefighters at a fire', b: 'the damage bill', lurk: 'the size of the fire', why: 'larger fires both attract more crews and cause more damage' },
        { a: 'shoe size in children', b: 'reading ability', lurk: 'age', why: 'older children have both bigger feet and more reading practice' },
        { a: 'monthly drowning numbers', b: 'ice-cream consumption', lurk: 'the season', why: 'summer raises both swimming exposure and ice-cream sales' },
        { a: 'the number of pubs in a suburb', b: 'the number of churches', lurk: 'population size', why: 'a bigger population supports more of both' }
      ];
      const p = rng.pick(pairs);
      const r = round(rng.float(0.72, 0.93, 2), 2);
      return {
        prompt: `<p>A study finds a strong positive association (${math(`r <span class="op">=</span> ${tidy(r)}`)}) between ${p.a} and ${p.b}.</p>
                 <p class="mb-0">A news report claims that ${p.a} cause ${p.b}. Evaluate that claim.</p>`,
        formulaIds: ['r-squared'],
        steps: [
          { t: 'Accept what the statistic does show',
            h: `<p>${math(`r <span class="op">=</span> ${tidy(r)}`)} does establish a strong positive <em>linear association</em>, and ${math(`R<sup>2</sup> <span class="op">=</span> ${tidy(round(r * r, 4))}`)} means ${num(r * r * 100, 1)}% of the variation is explained by the linear relationship.</p>` },
          { t: 'Name why association is not causation',
            h: `<p>Observational data admit three rival explanations: coincidence, reverse causation, and a lurking variable influencing both.</p>` },
          { t: 'Give the lurking variable',
            h: `<p>Here the plausible lurking variable is <strong>${p.lurk}</strong>, because ${p.why}.</p>` },
          { t: 'State the evaluation',
            h: `<p class="mb-0">The causal claim is not justified. Establishing cause would need a controlled experiment in which ${p.a} were manipulated while other factors were held constant.</p>` }
        ],
        answer: `The claim is not justified. ${p.lurk.charAt(0).toUpperCase() + p.lurk.slice(1)} is a plausible lurking variable, because ${p.why}. So association here does not demonstrate causation.`,
        pitfall: 'Saying only "correlation is not causation" is worth little. Name a specific lurking variable and explain how it produces both effects.',
        check: { type: 'open' }
      };
    }
  }
];

/* ================================================================== TOPIC 03 */

export const timeSeries = [
  {
    id: 'ts-moving-mean', topicId: 'time-series', tier: 'skill', marks: 2,
    skill: 'Calculate an odd-order moving mean',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT);
      const base = rng.step(20, 90, 2);
      const vals = Array.from({ length: 5 }, () => base + rng.int(-12, 16));
      const at = 3;
      const window = vals.slice(at - 2, at + 1);
      const mm = round(window.reduce((a, b) => a + b, 0) / 3, 2);
      return {
        prompt: `<p>Five consecutive readings of ${c.thing}, measured in ${c.unit}.</p>
          ${timeSeriesPlot({ values: vals, labels: ['1', '2', '3', '4', '5'],
            xLabel: 'time period', yLabel: c.unit, title: `${c.thing} over five periods` })}
          <p class="mb-0">Calculate the 3-point moving mean centred at time ${at}.</p>`,
        formulaIds: ['moving-average'],
        steps: [
          { t: 'Choose the window', formulaId: 'moving-average',
            h: `<p>A 3-point moving mean centred at time ${at} uses times ${at - 1}, ${at} and ${at + 1}: ${window.join(', ')}.</p>
                <p class="text-muted mb-0">An odd number of terms is what lets the smoothed value sit on an actual time point.</p>` },
          { t: 'Add and divide',
            h: `<p>${math(`${frac(window.join(' <span class="op">+</span> '), '3')} <span class="op">=</span> ${frac(window.reduce((a, b) => a + b, 0), '3')} <span class="op">=</span> ${tidy(mm)}`, `${window.join(' plus ')} all over 3 equals ${mm}`)}</p>` },
          { t: 'Place the value',
            h: `<p class="mb-0">Record ${math(tidy(mm))} against <strong>time ${at}</strong>, not time ${at - 1}. Times 1 and 5 get no 3-point moving mean at all.</p>` }
        ],
        answer: `Moving mean at time ${at} = ${tidy(mm)} ${c.unit}.`,
        pitfall: 'Writing the smoothed value at the first time of the window rather than the centre shifts the whole smoothed series.',
        check: { type: 'number', value: mm, tol: 0.02, label: 'moving mean' }
      };
    }
  },

  {
    id: 'ts-moving-median', topicId: 'time-series', tier: 'skill', marks: 2,
    skill: 'Calculate a moving median',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT);
      const base = rng.step(30, 100, 5);
      const vals = Array.from({ length: 5 }, () => base + rng.int(-18, 22));
      const sorted = vals.slice().sort((a, b) => a - b);
      const med = sorted[2];
      return {
        prompt: `<p>Five consecutive readings of ${c.thing}, measured in ${c.unit}.</p>
          ${timeSeriesPlot({ values: vals, labels: ['1', '2', '3', '4', '5'],
            xLabel: 'time period', yLabel: c.unit, title: `${c.thing} over five periods` })}
          <p class="mb-0">Calculate the 5-point moving median centred at time 3.</p>`,
        formulaIds: ['median'],
        steps: [
          { t: 'Order the window', formulaId: 'median',
            h: `<p>Sort the five values: ${sorted.join(', ')}.</p>
                <p class="text-muted mb-0">The median needs ordered data. The time order is irrelevant once the window is chosen.</p>` },
          { t: 'Take the middle value',
            h: `<p>With ${math('n <span class="op">=</span> 5')}, the median is the ${math(`${frac('5 <span class="op">+</span> 1', '2')} <span class="op">=</span> 3`)}rd ordered value: <strong>${med}</strong>.</p>` },
          { t: 'Place it at the centre',
            h: `<p class="mb-0">Record ${med} against time 3. A moving median resists a single extreme reading far better than a moving mean, which is why it suits series with occasional spikes.</p>` }
        ],
        answer: `5-point moving median at time 3 = ${med} ${c.unit}.`,
        pitfall: 'Taking the middle value in time order instead of in size order.',
        check: { type: 'number', value: med, tol: 0.01, label: 'moving median' }
      };
    }
  },

  {
    id: 'ts-seasonal-index', topicId: 'time-series', tier: 'apply', marks: 2,
    skill: 'Calculate a seasonal index',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT);
      const avg = rng.step(80, 200, 10);
      const si = rng.pick([0.72, 0.85, 0.9, 1.1, 1.25, 1.3, 1.45]);
      const actual = round(avg * si, 0);
      const exact = round(actual / avg, 4);
      const seasonName = c.season === 'quarter' ? `Quarter ${rng.int(1, 4)}` : rng.pick(['January', 'April', 'July', 'October']);
      const series = seasonalSeries(rng, {
        quarters: 8, base: avg, growth: rng.float(-2, 6, 1),
        indices: rng.shuffle([si, round(2 - si, 2), rng.float(0.85, 1.15, 2), 1]).slice(0, 4)
      });
      return {
        prompt: `<p>The plot shows ${c.thing} over two years. Notice the shape repeating each year: that is seasonality.</p>
          ${series ? timeSeriesPlot({ values: series.values, labels: series.labels,
            xLabel: 'quarter', yLabel: c.unit, title: `${c.thing}, two years` }) : ''}
          <p>In ${seasonName} the value recorded was <strong>${actual}</strong> ${c.unit}, and the average across all ${c.season}s of that year was <strong>${avg}</strong> ${c.unit}.</p>
          <p class="mb-0">Calculate the seasonal index for ${seasonName}, and interpret it.</p>`,
        formulaIds: ['seasonal-index'],
        steps: [
          { t: 'State the rule', formulaId: 'seasonal-index',
            h: `<p>${math(`seasonal index <span class="op">=</span> ${frac('actual value', 'seasonal average')}`)}</p>` },
          { t: 'Substitute',
            h: `<p>${math(`${frac(actual, avg)} <span class="op">=</span> ${tidy(exact)}`, `${actual} over ${avg} equals ${exact}`)}</p>` },
          { t: 'Interpret against 1',
            h: `<p class="mb-0">The index is ${exact > 1 ? 'above' : 'below'} 1, so ${seasonName} is typically <strong>${exact > 1 ? `${num((exact - 1) * 100, 1)}% above` : `${num((1 - exact) * 100, 1)}% below`}</strong> the ${c.season}ly average. Across a full cycle the indices sum to the number of ${c.season}s.</p>` }
        ],
        answer: `Seasonal index = ${tidy(exact)}. ${seasonName} runs about ${num(Math.abs(exact - 1) * 100, 1)}% ${exact > 1 ? 'above' : 'below'} average.`,
        pitfall: 'Dividing the average by the actual value inverts the index and reverses the interpretation.',
        check: { type: 'number', value: exact, tol: 0.005, label: 'seasonal index' }
      };
    }
  },

  {
    id: 'ts-deseasonalise', topicId: 'time-series', tier: 'skill', marks: 2,
    skill: 'Deseasonalise an observed value',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT);
      const si = rng.pick([0.75, 0.8, 0.88, 1.12, 1.2, 1.25, 1.4]);
      const actual = rng.step(60, 260, 4);
      const des = round(actual / si, 2);
      return {
        prompt: `<p>${c.thing.charAt(0).toUpperCase() + c.thing.slice(1)} in one ${c.season} were <strong>${actual}</strong> ${c.unit}. The seasonal index for that ${c.season} is <strong>${tidy(si)}</strong>.</p>
                 <p class="mb-0">Deseasonalise the figure.</p>`,
        formulaIds: ['deseasonalise'],
        steps: [
          { t: 'Choose the operation', formulaId: 'deseasonalise',
            h: `<p>${math(`deseasonalised <span class="op">=</span> ${frac('actual value', 'seasonal index')}`)}</p>
                <p class="text-muted mb-0">Seasonality is multiplicative, so you remove it by dividing, never by multiplying.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`${frac(actual, tidy(si))} <span class="op">=</span> ${tidy(des)}`, `${actual} over ${si} equals ${des}`)}</p>` },
          { t: 'Sense-check the direction',
            h: `<p class="mb-0">The index is ${si > 1 ? 'above' : 'below'} 1, so the deseasonalised figure should be <strong>${si > 1 ? 'lower' : 'higher'}</strong> than ${actual}, and ${tidy(des)} is.</p>` }
        ],
        answer: `Deseasonalised value ≈ ${tidy(des)} ${c.unit}.`,
        pitfall: 'Multiplying by the index does the opposite of what is asked. It reseasonalises.',
        check: { type: 'number', value: des, tol: 0.05, label: 'deseasonalised value' }
      };
    }
  },

  {
    id: 'ts-reseasonalise', topicId: 'time-series', tier: 'apply', marks: 3,
    skill: 'Reseasonalise a trend forecast',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT);
      const trend = rng.step(120, 400, 10);
      const si = rng.pick([0.68, 0.78, 0.84, 1.15, 1.22, 1.36]);
      const fc = round(trend * si, 2);
      const series = seasonalSeries(rng, {
        quarters: 8, base: trend * 0.8, growth: rng.float(1, 8, 1),
        indices: rng.shuffle([si, round(2 - si, 2), 1.05, 0.95]).slice(0, 4)
      });
      return {
        prompt: `<p>The plot shows recorded ${c.thing} against the deseasonalised figures the trend line was fitted to. The seasonal swing is in the solid series; the dashed series has it removed.</p>
          ${series ? timeSeriesPlot({ values: series.values, labels: series.labels,
            xLabel: 'quarter', yLabel: c.unit, title: `${c.thing}: recorded and deseasonalised`,
            trend: { values: series.deseasonalised, label: 'deseasonalised' } }) : ''}
          <p>The trend line forecasts <strong>${trend}</strong> ${c.unit} for a future ${c.season}, and the seasonal index for that ${c.season} is <strong>${tidy(si)}</strong>.</p>
          <p class="mb-0">Determine the seasonal forecast, and comment on its reliability.</p>`,
        formulaIds: ['reseasonalise'],
        steps: [
          { t: 'Put the seasonality back', formulaId: 'reseasonalise',
            h: `<p>${math('forecast <span class="op">=</span> trend forecast <span class="op">×</span> seasonal index')}</p>
                <p class="text-muted mb-0">The trend line was fitted to deseasonalised data, so its prediction has the seasonal effect stripped out.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`${trend} <span class="op">×</span> ${tidy(si)} <span class="op">=</span> ${tidy(fc)}`, `${trend} times ${si} equals ${fc}`)}</p>` },
          { t: 'Add the reasonableness statement',
            h: `<p class="mb-0">The forecast is ${tidy(fc)} ${c.unit}, and it assumes both the trend and the seasonal pattern continue unchanged. Forecasts further into the future are progressively less trustworthy, and a one-off event would not be captured.</p>` }
        ],
        answer: `Forecast ≈ ${tidy(fc)} ${c.unit}, assuming the trend and seasonal pattern continue.`,
        pitfall: 'A forecast without a reasonableness statement drops a mark on almost every marking guide.',
        check: { type: 'number', value: fc, tol: 0.05, label: 'seasonal forecast' }
      };
    }
  },

  {
    id: 'ts-fourth-index', topicId: 'time-series', tier: 'apply', marks: 3,
    skill: 'Use the fact that seasonal indices sum to the number of seasons',
    gen(rng) {
      const a = rng.float(0.6, 0.95, 2);
      const b = rng.float(0.7, 1.1, 2);
      const cq = rng.float(1.05, 1.5, 2);
      const d = round(4 - a - b - cq, 4);
      const names = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
      return {
        prompt: `<p>Three of the four quarterly seasonal indices for a series are:</p>
          ${table(['Quarter', 'Q1', 'Q2', 'Q3', 'Q4'], [['Index', tidy(a), tidy(b), tidy(cq), '?']])}
          <p class="mb-0">Determine the missing index for Quarter 4.</p>`,
        formulaIds: ['seasonal-index'],
        steps: [
          { t: 'Recall the constraint', formulaId: 'seasonal-index',
            h: `<p>Seasonal indices average to 1 across a full cycle, so for quarterly data they <strong>sum to 4</strong>.</p>` },
          { t: 'Add the known indices',
            h: `<p>${math(`${tidy(a)} <span class="op">+</span> ${tidy(b)} <span class="op">+</span> ${tidy(cq)} <span class="op">=</span> ${tidy(a + b + cq)}`, `${a} plus ${b} plus ${cq} equals ${round(a + b + cq, 4)}`)}</p>` },
          { t: 'Subtract from the total',
            h: `<p>${math(`4 <span class="op">−</span> ${tidy(a + b + cq)} <span class="op">=</span> ${tidy(d)}`, `4 minus ${round(a + b + cq, 4)} equals ${d}`)}</p>` },
          { t: 'Interpret',
            h: `<p class="mb-0">Quarter 4 runs about ${num(Math.abs(d - 1) * 100, 1)}% ${d > 1 ? 'above' : 'below'} the quarterly average.</p>` }
        ],
        answer: `Q4 seasonal index = ${tidy(d)}.`,
        pitfall: 'For monthly data the indices sum to 12, not 4. The total is always the number of seasons in the cycle.',
        check: { type: 'number', value: d, tol: 0.005, label: 'Q4 index' }
      };
    }
  },

  {
    id: 'ts-trend-forecast', topicId: 'time-series', tier: 'challenge', marks: 4,
    skill: 'Fit a trend, forecast, then reseasonalise',
    gen(rng) {
      const c = rng.pick(SERIES_CONTEXT.filter(s => s.season === 'quarter'));
      const m = round(rng.float(2.5, 9, 1), 1);
      const cc = rng.step(90, 260, 5);
      const t = rng.int(14, 24);
      const si = rng.pick([0.72, 0.86, 1.14, 1.28, 1.35]);
      const trend = round(m * t + cc, 3);
      const fc = round(trend * si, 2);
      const series = { observed: [], fitted: [], labels: [] };
      for (let i = 1; i <= 8; i++) {
        series.labels.push(String(i));
        series.fitted.push(round(m * i + cc, 1));
        series.observed.push(round(m * i + cc + rng.float(-9, 9, 1), 1));
      }
      return {
        prompt: `<p>The plot shows deseasonalised ${c.thing} with the fitted trend line.</p>
          ${series ? timeSeriesPlot({ values: series.observed, labels: series.labels,
            xLabel: 'quarter number t', yLabel: c.unit, title: `Deseasonalised ${c.thing} with trend line`,
            trend: { values: series.fitted, label: 'trend line' } }) : ''}
          <p>The trend line is ${math(`ŷ <span class="op">=</span> ${tidy(m)}t <span class="op">+</span> ${tidy(cc)}`, `y hat equals ${m} t plus ${cc}`)}, where t is the quarter number.</p>
                 <p class="mb-0">Quarter number ${t} has a seasonal index of ${tidy(si)}. Forecast the actual value for that quarter, and justify how much confidence to place in it.</p>`,
        formulaIds: ['linear-equation'],
        steps: [
          { t: 'Forecast the deseasonalised trend', formulaId: 'linear-equation',
            h: `<p>${math(`ŷ <span class="op">=</span> ${tidy(m)} <span class="op">×</span> ${t} <span class="op">+</span> ${tidy(cc)} <span class="op">=</span> ${tidy(trend)}`, `y hat equals ${m} times ${t} plus ${cc} equals ${trend}`)}</p>
                <p class="text-muted mb-0">This is the value expected with the seasonal effect removed.</p>` },
          { t: 'Reseasonalise', formulaId: 'reseasonalise',
            h: `<p>${math(`${tidy(trend)} <span class="op">×</span> ${tidy(si)} <span class="op">=</span> ${tidy(fc)}`, `${trend} times ${si} equals ${fc}`)}</p>` },
          { t: 'State the forecast with units',
            h: `<p>Forecast ≈ <strong>${tidy(fc)}</strong> ${c.unit} for quarter ${t}.</p>` },
          { t: 'Justify the confidence',
            h: `<p class="mb-0">The forecast is only as good as its two assumptions: that the linear trend continues past the observed data, and that the seasonal pattern is stable. Quarter ${t} is an extrapolation beyond the fitted range, so the estimate should be treated as indicative rather than precise.</p>` }
        ],
        answer: `Trend ${tidy(trend)}, reseasonalised forecast ≈ ${tidy(fc)} ${c.unit}.`,
        pitfall: 'Applying the seasonal index to the raw data instead of to the trend prediction double-counts the seasonal effect.',
        check: { type: 'number', value: fc, tol: 0.1, label: 'seasonal forecast' }
      };
    }
  }
];
