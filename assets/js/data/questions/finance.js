/**
 * Generators for Loans, investments and annuities 1 & 2.
 * All money is computed at full precision and rounded once, at the end.
 */
import { round, num, tidy, math, frac, table, money, pct } from '../../lib/fmt.js';

const FREQ = [
  { name: 'monthly', k: 12, period: 'month' },
  { name: 'quarterly', k: 4, period: 'quarter' },
  { name: 'fortnightly', k: 26, period: 'fortnight' },
  { name: 'half-yearly', k: 2, period: 'half-year' },
  { name: 'weekly', k: 52, period: 'week' }
];

const LOAN_CTX = [
  'a car loan', 'a home renovation loan', 'a small-business equipment loan',
  'a personal loan', 'a study loan'
];
const SAVE_CTX = [
  'a house deposit', 'a gap-year travel fund', 'a first-car fund',
  'a home-office upgrade fund', 'a university-fees fund'
];
const FUND_CTX = [
  'a scholarship fund', 'a community grants fund', 'a prize fund',
  'a maintenance endowment', 'a research bursary'
];

/* ================================================================== TOPIC 06 */

export const finance1 = [
  {
    id: 'fin1-period-rate', topicId: 'finance-1', tier: 'skill', marks: 2,
    skill: 'Convert an annual nominal rate to a period rate',
    gen(rng) {
      const f = rng.pick(FREQ);
      const annual = rng.pick([3.6, 4.2, 4.8, 5.4, 5.76, 6.0, 6.6, 7.2, 8.4]);
      const i = round(annual / 100 / f.k, 8);
      return {
        prompt: `<p>An account pays <strong>${tidy(annual)}% p.a.</strong> compounded <strong>${f.name}</strong>.</p>
                 <p class="mb-0">Find the interest rate per compounding period, as a decimal.</p>`,
        formulaIds: ['compound-interest'],
        steps: [
          { t: 'Convert the percentage to a decimal',
            h: `<p>${math(`${tidy(annual)}% <span class="op">=</span> ${frac(tidy(annual), 100)} <span class="op">=</span> ${tidy(annual / 100)}`, `${annual} percent equals ${round(annual / 100, 6)}`)} per year</p>` },
          { t: 'Divide by the compounding frequency',
            h: `<p>There are <strong>${f.k}</strong> ${f.period}s in a year, so ${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`, `i equals ${round(annual / 100, 6)} over ${f.k} equals ${i}`)}.</p>` },
          { t: 'Match i and n', formulaId: 'compound-interest',
            h: `<p class="mb-0">Every later step must now count n in <strong>${f.period}s</strong>. The rate and the number of periods always use the same time unit.</p>` }
        ],
        answer: `${math(`i <span class="op">=</span> ${tidy(i, 8)}`)} per ${f.period}.`,
        pitfall: 'Using the annual rate with a monthly n. If the rate is per month, so is n.',
        check: { type: 'number', value: i, tol: 1e-7, label: 'period rate i (decimal)' }
      };
    }
  },

  {
    id: 'fin1-effective', topicId: 'finance-1', tier: 'apply', marks: 3,
    skill: 'Calculate an effective annual interest rate',
    gen(rng) {
      const f = rng.pick(FREQ.filter(x => x.k <= 26));
      const annual = rng.pick([4.2, 4.8, 5.4, 6.0, 6.6, 7.2, 7.8]);
      const i = annual / 100 / f.k;
      const eff = round((1 + i) ** f.k - 1, 8);
      return {
        prompt: `<p>A loan is advertised at <strong>${tidy(annual)}% p.a.</strong> compounded <strong>${f.name}</strong>.</p>
                 <p class="mb-0">Calculate the effective annual rate of interest, correct to three decimal places as a percentage.</p>`,
        formulaIds: ['effective-rate'],
        steps: [
          { t: 'Find the rate per period',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`, `i equals ${round(annual / 100, 6)} over ${f.k}`)}, with ${math(`k <span class="op">=</span> ${f.k}`)} periods per year.</p>` },
          { t: 'Select the formula', formulaId: 'effective-rate',
            h: `<p>${math('i<sub>effective</sub> <span class="op">=</span> (1 <span class="op">+</span> i)<sup>k</sup> <span class="op">−</span> 1')}</p>` },
          { t: 'Substitute',
            h: `<p>${math(`i<sub>effective</sub> <span class="op">=</span> (1 <span class="op">+</span> ${tidy(i, 8)})<sup>${f.k}</sup> <span class="op">−</span> 1 <span class="op">=</span> ${tidy(eff, 8)}`, `i effective equals one plus ${i} to the power of ${f.k} minus 1 equals ${eff}`)}</p>` },
          { t: 'Express as a percentage',
            h: `<p class="mb-0">${math(`${tidy(eff, 8)} <span class="op">×</span> 100 <span class="op">≈</span> ${num(eff * 100, 3)}%`)} per annum — higher than the ${tidy(annual)}% nominal rate, because interest earned within the year itself earns interest.</p>` }
        ],
        answer: `Effective annual rate ≈ ${num(eff * 100, 3)}%.`,
        pitfall: 'Forgetting the "− 1". Without it you have the annual growth multiplier, not the rate.',
        check: { type: 'number', value: round(eff * 100, 6), tol: 0.002, label: 'effective annual rate (%)', unit: '%' }
      };
    }
  },

  {
    id: 'fin1-compound', topicId: 'finance-1', tier: 'apply', marks: 3,
    skill: 'Use the compound interest formula',
    gen(rng) {
      const f = rng.pick(FREQ.filter(x => x.k <= 12));
      const P = rng.step(4000, 40000, 500);
      const annual = rng.pick([3.6, 4.2, 4.8, 5.1, 5.4, 6.0, 6.6]);
      const years = rng.int(3, 10);
      const i = annual / 100 / f.k;
      const n = years * f.k;
      const A = round(P * (1 + i) ** n, 6);
      const interest = round(A - P, 6);
      return {
        prompt: `<p>${money(P, 0)} is invested at <strong>${tidy(annual)}% p.a.</strong> compounded <strong>${f.name}</strong> for <strong>${years} years</strong>.</p>
                 <p class="mb-0">Find the value of the investment and the interest earned.</p>`,
        formulaIds: ['compound-interest'],
        steps: [
          { t: 'Match the rate to the period',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`)} per ${f.period}</p>` },
          { t: 'Count the periods',
            h: `<p>${math(`n <span class="op">=</span> ${years} <span class="op">×</span> ${f.k} <span class="op">=</span> ${n}`, `n equals ${years} times ${f.k} equals ${n}`)} ${f.period}s</p>
                <p class="text-muted mb-0">n counts compounding periods, not years.</p>` },
          { t: 'Substitute', formulaId: 'compound-interest',
            h: `<p>${math(`A <span class="op">=</span> ${tidy(P)}(1 <span class="op">+</span> ${tidy(i, 8)})<sup>${n}</sup> <span class="op">=</span> ${money(A)}`, `A equals ${P} times one plus ${i} to the power of ${n} equals ${round(A, 2)}`)}</p>` },
          { t: 'Separate the interest from the total',
            h: `<p class="mb-0">${math(`I <span class="op">=</span> A <span class="op">−</span> P <span class="op">=</span> ${money(A)} <span class="op">−</span> ${money(P, 0)} <span class="op">=</span> ${money(interest)}`, `interest equals ${round(A, 2)} minus ${P} equals ${round(interest, 2)}`)}</p>` }
        ],
        answer: `${money(A)} in total, of which ${money(interest)} is interest.`,
        pitfall: 'A is the total value, not the interest. If the question asks for interest, subtract the principal.',
        check: { type: 'number', value: A, tol: Math.max(0.5, A * 0.0005), label: 'final amount ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin1-loan-recurrence', topicId: 'finance-1', tier: 'apply', marks: 3,
    skill: 'Write and use a reducing-balance loan recurrence',
    gen(rng) {
      const ctx = rng.pick(LOAN_CTX);
      const P = rng.step(8000, 45000, 500);
      const annual = rng.pick([5.4, 6.0, 6.6, 7.2, 7.8, 8.4]);
      const i = round(annual / 100 / 12, 8);
      const r = round(1 + i, 8);
      const d = rng.step(Math.ceil(P * 0.014 / 10) * 10, Math.ceil(P * 0.025 / 10) * 10, 10);
      const A1 = round(r * P - d, 6);
      const A2 = round(r * A1 - d, 6);
      return {
        prompt: `<p>${ctx.charAt(0).toUpperCase() + ctx.slice(1)} of <strong>${money(P, 0)}</strong> charges <strong>${tidy(annual)}% p.a.</strong> compounded monthly, with monthly repayments of <strong>${money(d, 0)}</strong>.</p>
                 <p class="mb-0">Write a recurrence relation for the balance, and calculate the balance after two repayments.</p>`,
        formulaIds: ['loan-recurrence'],
        steps: [
          { t: 'Find the monthly rate and multiplier',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), 12)} <span class="op">=</span> ${tidy(i, 8)}`)}, so ${math(`r <span class="op">=</span> 1 <span class="op">+</span> i <span class="op">=</span> ${tidy(r, 8)}`)}.</p>` },
          { t: 'State the recurrence with its seed', formulaId: 'loan-recurrence',
            h: `<p>${math(`A<sub>0</sub> <span class="op">=</span> ${tidy(P)}, &nbsp; A<sub>n+1</sub> <span class="op">=</span> ${tidy(r, 8)}A<sub>n</sub> <span class="op">−</span> ${tidy(d)}`, `A sub 0 equals ${P}, A sub n plus 1 equals ${r} times A sub n minus ${d}`)}</p>
                <p class="text-muted mb-0">Interest is applied to the balance <em>first</em>, then the repayment is subtracted.</p>` },
          { t: 'Calculate the first balance',
            h: `<p>${math(`A<sub>1</sub> <span class="op">=</span> ${tidy(r, 8)} <span class="op">×</span> ${tidy(P)} <span class="op">−</span> ${tidy(d)} <span class="op">=</span> ${money(A1)}`, `A sub 1 equals ${round(A1, 2)}`)}</p>` },
          { t: 'Calculate the second balance',
            h: `<p class="mb-0">${math(`A<sub>2</sub> <span class="op">=</span> ${tidy(r, 8)} <span class="op">×</span> ${tidy(round(A1, 6))} <span class="op">−</span> ${tidy(d)} <span class="op">=</span> ${money(A2)}`, `A sub 2 equals ${round(A2, 2)}`)}</p>
                <p class="text-muted mb-0">Carry the unrounded ${math('A<sub>1</sub>')} into the next line — rounding each balance to the cent drifts over a full loan term.</p>` }
        ],
        answer: `${math(`A<sub>n+1</sub> <span class="op">=</span> ${tidy(r, 8)}A<sub>n</sub> <span class="op">−</span> ${tidy(d)}`)}, ${math(`A<sub>0</sub> <span class="op">=</span> ${tidy(P)}`)}; ${math('A<sub>2</sub>')} = ${money(A2)}.`,
        pitfall: 'Subtracting the repayment before adding interest gives a different (and, under the syllabus model, wrong) balance.',
        check: { type: 'number', value: A2, tol: 0.5, label: 'balance after 2 repayments ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin1-repayment', topicId: 'finance-1', tier: 'challenge', marks: 4,
    skill: 'Find a repayment with the present-value annuity formula',
    gen(rng) {
      const ctx = rng.pick(LOAN_CTX);
      const P = rng.step(12000, 60000, 1000);
      const annual = rng.pick([4.8, 5.4, 6.0, 6.6, 7.2]);
      const years = rng.int(3, 8);
      const i = annual / 100 / 12;
      const n = years * 12;
      const factor = (1 - (1 + i) ** -n) / i;
      const d = round(P / factor, 2);   // the repayment as actually quoted
      const totalRepaid = round(d * n, 2);
      return {
        prompt: `<p>${ctx.charAt(0).toUpperCase() + ctx.slice(1)} of <strong>${money(P, 0)}</strong> is taken at <strong>${tidy(annual)}% p.a.</strong> compounded monthly and is to be fully repaid with equal monthly repayments over <strong>${years} years</strong>.</p>
                 <p class="mb-0">Determine the monthly repayment.</p>`,
        formulaIds: ['annuity-pv'],
        steps: [
          { t: 'Identify the context', formulaId: 'annuity-pv',
            h: `<p>An amount borrowed <em>now</em>, cleared by equal future repayments, is a <strong>present-value annuity</strong>: ${math(`A<sub>PV</sub> <span class="op">=</span> d ${frac('1 <span class="op">−</span> (1 <span class="op">+</span> i)<sup>−n</sup>', 'i')}`)}.</p>` },
          { t: 'Set up i and n',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), 12)} <span class="op">=</span> ${tidy(i, 8)}`)} and ${math(`n <span class="op">=</span> ${years} <span class="op">×</span> 12 <span class="op">=</span> ${n}`)}.</p>` },
          { t: 'Rearrange for d',
            h: `<p>${math(`d <span class="op">=</span> ${frac('A<sub>PV</sub>', '[1 <span class="op">−</span> (1 <span class="op">+</span> i)<sup>−n</sup>] <span class="op">÷</span> i')}`)}</p>
                <p class="mb-0">The bracketed factor evaluates to ${math(tidy(factor, 6))}.</p>` },
          { t: 'Substitute and round up to the cent',
            h: `<p class="mb-0">${math(`d <span class="op">=</span> ${frac(tidy(P), tidy(factor, 6))} <span class="op">=</span> ${money(d)}`, `d equals ${P} over ${round(factor, 6)} equals ${round(d, 2)}`)} per month</p>
                <p class="text-muted mb-0">Total repaid ${math(`<span class="op">=</span> ${n} <span class="op">×</span> ${money(d)} <span class="op">=</span> ${money(totalRepaid)}`)}, so interest paid is ${money(round(totalRepaid - P, 2))}.</p>` }
        ],
        answer: `Monthly repayment ≈ ${money(d)}.`,
        pitfall: 'Note the negative exponent −n. Using +n gives a value that looks plausible but is wrong.',
        check: { type: 'number', value: d, tol: Math.max(0.5, d * 0.002), label: 'monthly repayment ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin1-total-interest', topicId: 'finance-1', tier: 'challenge', marks: 4,
    skill: 'Find total repayments and total interest',
    gen(rng) {
      const P = rng.step(15000, 55000, 1000);
      const annual = rng.pick([5.4, 6.0, 6.9, 7.2, 7.8]);
      const years = rng.int(4, 9);
      const i = annual / 100 / 12;
      const n = years * 12;
      const d = round(P / ((1 - (1 + i) ** -n) / i), 2);
      const total = round(d * n, 2);
      const interest = round(total - P, 2);
      return {
        prompt: `<p>A ${years}-year loan of <strong>${money(P, 0)}</strong> at <strong>${tidy(annual)}% p.a.</strong> compounded monthly requires monthly repayments of <strong>${money(d)}</strong>.</p>
                 <p class="mb-0">Calculate the total amount repaid and the total interest charged.</p>`,
        formulaIds: ['annuity-pv'],
        steps: [
          { t: 'Count the repayments',
            h: `<p>${math(`n <span class="op">=</span> ${years} <span class="op">×</span> 12 <span class="op">=</span> ${n}`)} monthly repayments</p>` },
          { t: 'Total the repayments',
            h: `<p>${math(`${n} <span class="op">×</span> ${money(d)} <span class="op">=</span> ${money(total)}`, `${n} times ${d} equals ${total}`)}</p>` },
          { t: 'Subtract the amount borrowed',
            h: `<p>${math(`I <span class="op">=</span> ${money(total)} <span class="op">−</span> ${money(P, 0)} <span class="op">=</span> ${money(interest)}`, `interest equals ${total} minus ${P} equals ${interest}`)}</p>` },
          { t: 'Interpret the result',
            h: `<p class="mb-0">Interest is ${num(interest / P * 100, 1)}% of the amount borrowed across the full ${years}-year term. Extending the term lowers each repayment but raises this total — the comparison a borrower actually needs.</p>` }
        ],
        answer: `Total repaid ${money(total)}; total interest ${money(interest)}.`,
        pitfall: 'Multiplying the repayment by the number of years instead of the number of repayments.',
        check: { type: 'number', value: interest, tol: Math.max(1, interest * 0.002), label: 'total interest ($)', unit: '$' }
      };
    }
  }
];

/* ================================================================== TOPIC 07 */

export const finance2 = [
  {
    id: 'fin2-recurrence', topicId: 'finance-2', tier: 'skill', marks: 2,
    skill: 'Write and use a future-value annuity recurrence',
    gen(rng) {
      const ctx = rng.pick(SAVE_CTX);
      const annual = rng.pick([3.6, 4.2, 4.8, 5.4, 6.0]);
      const d = rng.step(150, 800, 50);
      const i = round(annual / 100 / 12, 8);
      const r = round(1 + i, 8);
      const A1 = round(r * 0 + d, 6);
      const A2 = round(r * A1 + d, 6);
      return {
        prompt: `<p>Saving for ${ctx}, ${money(d, 0)} is deposited at the end of every month into an account paying <strong>${tidy(annual)}% p.a.</strong> compounded monthly. The account starts empty.</p>
                 <p class="mb-0">Write the recurrence relation and find the balance after two deposits.</p>`,
        formulaIds: ['annuity-recurrence'],
        steps: [
          { t: 'Find the monthly multiplier',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), 12)} <span class="op">=</span> ${tidy(i, 8)}`)}, so ${math(`r <span class="op">=</span> ${tidy(r, 8)}`)}.</p>` },
          { t: 'State the recurrence', formulaId: 'annuity-recurrence',
            h: `<p>${math(`A<sub>0</sub> <span class="op">=</span> 0, &nbsp; A<sub>n+1</sub> <span class="op">=</span> ${tidy(r, 8)}A<sub>n</sub> <span class="op">+</span> ${tidy(d)}`, `A sub 0 equals 0, A sub n plus 1 equals ${r} A sub n plus ${d}`)}</p>
                <p class="text-muted mb-0">A savings plan <em>adds</em> the deposit; a loan <em>subtracts</em> the repayment. That sign is the whole difference.</p>` },
          { t: 'Apply it twice',
            h: `<p>${math(`A<sub>1</sub> <span class="op">=</span> ${tidy(r, 8)} <span class="op">×</span> 0 <span class="op">+</span> ${tidy(d)} <span class="op">=</span> ${money(A1)}`)}</p>
                <p class="mb-0">${math(`A<sub>2</sub> <span class="op">=</span> ${tidy(r, 8)} <span class="op">×</span> ${tidy(A1)} <span class="op">+</span> ${tidy(d)} <span class="op">=</span> ${money(A2)}`, `A sub 2 equals ${round(A2, 2)}`)}</p>` },
          { t: 'Sanity-check',
            h: `<p class="mb-0">Two deposits total ${money(2 * d, 0)}, and ${money(A2)} is slightly more — the first deposit has earned one month of interest. The first deposit earns nothing in the month it is made, because it arrives at the <em>end</em> of that period.</p>` }
        ],
        answer: `${math(`A<sub>n+1</sub> <span class="op">=</span> ${tidy(r, 8)}A<sub>n</sub> <span class="op">+</span> ${tidy(d)}`)}, ${math('A<sub>0</sub> <span class="op">=</span> 0')}; ${math('A<sub>2</sub>')} = ${money(A2)}.`,
        pitfall: 'Using the loan recurrence (− d) for a savings plan. Deposits add to the balance.',
        check: { type: 'number', value: A2, tol: 0.05, label: 'balance after 2 deposits ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin2-fv-annuity', topicId: 'finance-2', tier: 'apply', marks: 3,
    skill: 'Use the future-value annuity formula',
    gen(rng) {
      const ctx = rng.pick(SAVE_CTX);
      const f = rng.pick(FREQ.filter(x => x.k === 12 || x.k === 4));
      const annual = rng.pick([3.6, 4.2, 4.8, 5.2, 5.4, 6.0]);
      const d = f.k === 12 ? rng.step(200, 900, 50) : rng.step(600, 2600, 100);
      const years = rng.int(4, 12);
      const i = annual / 100 / f.k;
      const n = years * f.k;
      const A = round(d * ((1 + i) ** n - 1) / i, 6);
      return {
        prompt: `<p>To build ${ctx}, ${money(d, 0)} is deposited at the end of each ${f.period} for <strong>${years} years</strong> into an account paying <strong>${tidy(annual)}% p.a.</strong> compounded ${f.name}.</p>
                 <p class="mb-0">Calculate the value of the fund at the end of the ${years} years.</p>`,
        formulaIds: ['annuity-fv'],
        steps: [
          { t: 'Recognise the context', formulaId: 'annuity-fv',
            h: `<p>Equal deposits accumulating towards a future total is a <strong>future-value annuity</strong>: ${math(`A<sub>FV</sub> <span class="op">=</span> d ${frac('(1 <span class="op">+</span> i)<sup>n</sup> <span class="op">−</span> 1', 'i')}`)}.</p>` },
          { t: 'Set up i and n',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`)}, &nbsp; ${math(`n <span class="op">=</span> ${years} <span class="op">×</span> ${f.k} <span class="op">=</span> ${n}`)} deposits</p>` },
          { t: 'Substitute',
            h: `<p>${math(`A<sub>FV</sub> <span class="op">=</span> ${tidy(d)} <span class="op">×</span> ${frac(`(1 <span class="op">+</span> ${tidy(i, 8)})<sup>${n}</sup> <span class="op">−</span> 1`, tidy(i, 8))} <span class="op">=</span> ${money(A)}`, `A F V equals ${round(A, 2)}`)}</p>` },
          { t: 'Check it is plausible',
            h: `<p class="mb-0">Deposits alone total ${math(`${n} <span class="op">×</span> ${money(d, 0)} <span class="op">=</span> ${money(d * n, 0)}`)}, and ${money(A)} exceeds that — as it must, since the balance also earns interest.</p>` }
        ],
        answer: `Fund value ≈ ${money(A)}.`,
        pitfall: 'Using the present-value formula for a savings plan. PV discounts backwards; FV accumulates forwards.',
        check: { type: 'number', value: A, tol: Math.max(1, A * 0.001), label: 'future value ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin2-interest-earned', topicId: 'finance-2', tier: 'apply', marks: 3,
    skill: 'Separate contributions from interest earned',
    gen(rng) {
      const annual = rng.pick([4.2, 4.8, 5.4, 6.0]);
      const d = rng.step(200, 700, 50);
      const years = rng.int(5, 12);
      const i = annual / 100 / 12;
      const n = years * 12;
      const A = round(d * ((1 + i) ** n - 1) / i, 6);
      const contrib = d * n;
      const earned = round(A - contrib, 6);
      return {
        prompt: `<p>${money(d, 0)} is deposited monthly for <strong>${years} years</strong> at <strong>${tidy(annual)}% p.a.</strong> compounded monthly. The fund reaches <strong>${money(A)}</strong>.</p>
                 <p class="mb-0">Determine how much of that total is interest.</p>`,
        formulaIds: ['annuity-fv'],
        steps: [
          { t: 'Total the deposits',
            h: `<p>${math(`n <span class="op">=</span> ${years} <span class="op">×</span> 12 <span class="op">=</span> ${n}`)} deposits, so contributions ${math(`<span class="op">=</span> ${n} <span class="op">×</span> ${money(d, 0)} <span class="op">=</span> ${money(contrib, 0)}`)}.</p>` },
          { t: 'Subtract from the final value', formulaId: 'annuity-fv',
            h: `<p>${math(`interest <span class="op">=</span> A<sub>FV</sub> <span class="op">−</span> nd <span class="op">=</span> ${money(A)} <span class="op">−</span> ${money(contrib, 0)} <span class="op">=</span> ${money(earned)}`, `interest equals ${round(A, 2)} minus ${contrib} equals ${round(earned, 2)}`)}</p>` },
          { t: 'Interpret',
            h: `<p class="mb-0">Interest makes up ${num(earned / A * 100, 1)}% of the final balance. That share rises sharply with the term, which is the argument for starting a savings plan early.</p>` }
        ],
        answer: `Interest earned ≈ ${money(earned)}.`,
        pitfall: 'Treating A_FV itself as the interest. Interest is the accumulated value minus everything you put in.',
        check: { type: 'number', value: earned, tol: Math.max(1, earned * 0.002), label: 'interest earned ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin2-perpetuity-value', topicId: 'finance-2', tier: 'skill', marks: 2,
    skill: 'Use the perpetuity formula',
    gen(rng) {
      const ctx = rng.pick(FUND_CTX);
      const f = rng.pick(FREQ.filter(x => x.k === 12 || x.k === 4 || x.k === 2));
      const annual = rng.pick([4.0, 4.8, 5.2, 5.6, 6.0, 6.4]);
      const d = f.k === 12 ? rng.step(400, 1600, 50) : rng.step(1000, 5000, 100);
      const i = annual / 100 / f.k;
      const A = round(d / i, 6);
      return {
        prompt: `<p>${ctx.charAt(0).toUpperCase() + ctx.slice(1)} must pay <strong>${money(d, 0)}</strong> every ${f.period}, indefinitely, from interest alone. The account earns <strong>${tidy(annual)}% p.a.</strong> compounded ${f.name}.</p>
                 <p class="mb-0">Determine the principal required.</p>`,
        formulaIds: ['perpetuity'],
        steps: [
          { t: 'Recognise the perpetuity', formulaId: 'perpetuity',
            h: `<p>The payment must never reduce the principal, so each period's payment is exactly that period's interest: ${math(`A <span class="op">=</span> ${frac('d', 'i')}`)}.</p>` },
          { t: 'Match the rate to the payment period',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`)} per ${f.period} — the same period as the payment.</p>` },
          { t: 'Substitute',
            h: `<p class="mb-0">${math(`A <span class="op">=</span> ${frac(tidy(d), tidy(i, 8))} <span class="op">=</span> ${money(A)}`, `A equals ${d} over ${round(i, 8)} equals ${round(A, 2)}`)}</p>` }
        ],
        answer: `Principal required = ${money(A)}.`,
        pitfall: 'Using the annual rate with a monthly payment inflates the principal twelvefold.',
        check: { type: 'number', value: A, tol: Math.max(1, A * 0.001), label: 'principal ($)', unit: '$' }
      };
    }
  },

  {
    id: 'fin2-perpetuity-payment', topicId: 'finance-2', tier: 'apply', marks: 2,
    skill: 'Rearrange the perpetuity formula for the payment',
    gen(rng) {
      const ctx = rng.pick(FUND_CTX);
      const f = rng.pick(FREQ.filter(x => x.k === 12 || x.k === 4));
      const A = rng.step(120000, 600000, 10000);
      const annual = rng.pick([3.6, 4.2, 4.8, 5.4, 6.0]);
      const i = annual / 100 / f.k;
      const d = round(A * i, 6);
      return {
        prompt: `<p>${ctx.charAt(0).toUpperCase() + ctx.slice(1)} holds <strong>${money(A, 0)}</strong> and earns <strong>${tidy(annual)}% p.a.</strong> compounded ${f.name}.</p>
                 <p class="mb-0">Determine the largest ${f.period}ly payment that can be made without ever reducing the principal.</p>`,
        formulaIds: ['perpetuity'],
        steps: [
          { t: 'Rearrange', formulaId: 'perpetuity',
            h: `<p>${math(`A <span class="op">=</span> ${frac('d', 'i')}`)} rearranges to ${math('d <span class="op">=</span> Ai')}.</p>` },
          { t: 'Find the period rate',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), f.k)} <span class="op">=</span> ${tidy(i, 8)}`)}</p>` },
          { t: 'Substitute',
            h: `<p>${math(`d <span class="op">=</span> ${tidy(A)} <span class="op">×</span> ${tidy(i, 8)} <span class="op">=</span> ${money(d)}`, `d equals ${A} times ${round(i, 8)} equals ${round(d, 2)}`)} per ${f.period}</p>` },
          { t: 'State the condition',
            h: `<p class="mb-0">Paying exactly ${money(d)} each ${f.period} withdraws only the interest earned, so the balance returns to ${money(A, 0)} every period and the fund lasts indefinitely. Paying more would erode the principal.</p>` }
        ],
        answer: `Maximum ${f.period}ly payment = ${money(d)}.`,
        pitfall: 'A perpetuity payment never touches the principal. If the balance falls, the payment was too large.',
        check: { type: 'number', value: d, tol: Math.max(0.5, d * 0.002), label: `payment per ${f.period} ($)`, unit: '$' }
      };
    }
  },

  {
    id: 'fin2-required-deposit', topicId: 'finance-2', tier: 'challenge', marks: 4,
    skill: 'Solve a future-value annuity for the deposit',
    gen(rng) {
      const ctx = rng.pick(SAVE_CTX);
      const target = rng.step(20000, 120000, 5000);
      const annual = rng.pick([3.6, 4.2, 4.8, 5.4, 6.0]);
      const years = rng.int(4, 12);
      const i = annual / 100 / 12;
      const n = years * 12;
      const factor = ((1 + i) ** n - 1) / i;
      const d = round(target / factor, 2);   // the deposit as actually quoted
      const contrib = round(d * n, 2);
      return {
        prompt: `<p>A saver wants <strong>${money(target, 0)}</strong> for ${ctx} in <strong>${years} years</strong>. The account pays <strong>${tidy(annual)}% p.a.</strong> compounded monthly and deposits are made at the end of each month.</p>
                 <p class="mb-0">Determine the required monthly deposit, and state how much of the target comes from interest.</p>`,
        formulaIds: ['annuity-fv'],
        steps: [
          { t: 'Identify the unknown', formulaId: 'annuity-fv',
            h: `<p>${math(`A<sub>FV</sub> <span class="op">=</span> ${money(target, 0)}`)} is known and d is unknown, so rearrange ${math(`A<sub>FV</sub> <span class="op">=</span> d ${frac('(1 <span class="op">+</span> i)<sup>n</sup> <span class="op">−</span> 1', 'i')}`)} for d.</p>` },
          { t: 'Set up i and n',
            h: `<p>${math(`i <span class="op">=</span> ${frac(tidy(annual / 100), 12)} <span class="op">=</span> ${tidy(i, 8)}`)}, &nbsp; ${math(`n <span class="op">=</span> ${years} <span class="op">×</span> 12 <span class="op">=</span> ${n}`)}</p>` },
          { t: 'Evaluate the annuity factor and divide',
            h: `<p>${math(`${frac(`(1 <span class="op">+</span> ${tidy(i, 8)})<sup>${n}</sup> <span class="op">−</span> 1`, tidy(i, 8))} <span class="op">=</span> ${tidy(factor, 6)}`)}</p>
                <p class="mb-0">${math(`d <span class="op">=</span> ${frac(tidy(target), tidy(factor, 6))} <span class="op">=</span> ${money(d)}`, `d equals ${target} over ${round(factor, 6)} equals ${round(d, 2)}`)} per month</p>` },
          { t: 'Split target into deposits and interest',
            h: `<p class="mb-0">Deposits total ${math(`${n} <span class="op">×</span> ${money(d)} <span class="op">≈</span> ${money(contrib)}`)}, so interest supplies about ${money(target - contrib)} of the ${money(target, 0)} target.</p>` }
        ],
        answer: `Monthly deposit ≈ ${money(d)}; interest contributes about ${money(target - contrib)}.`,
        pitfall: 'Rounding d down leaves the saver short of the target. Round the required deposit up.',
        check: { type: 'number', value: d, tol: Math.max(0.5, d * 0.002), label: 'monthly deposit ($)', unit: '$' }
      };
    }
  }
];
