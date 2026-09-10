# General Maths Hub

A free, public study site for **QCAA General Mathematics Units 3 & 4**.

Ten syllabus topics explained plainly, a random question generator that never runs out,
and step-by-step solutions that name the exact formula-book entry behind every line.

No build step, no dependencies, no tracking, no account. It is a folder of static files.

## What's in it

| Page | What it does |
| --- | --- |
| `index.html` | Overview, topic grid, study cycle, progress dashboard |
| `topics.html` | All ten topics: big idea, mastery targets, core knowledge, formula bank, worked example, common errors |
| `practice.html` | The question generator, with answer checking and worked steps |
| `formulas.html` | The complete QCAA 2025 formula book, searchable and annotated |

### The question generator

62 parameterised generators across the ten topics, in three tiers:

- **Skill** — one-step recall and substitution
- **Apply** — choose the method, then carry it through
- **Challenge** — multi-step or interpretive, written for exam conditions

Questions are *generated*, not drawn from a fixed bank: the numbers, contexts and
diagrams are built fresh each time, so the same skill can be practised repeatedly
without memorising an answer. Every question carries:

- the formula-book entries it expects you to use, linked to the formula sheet
- a numbered solution showing each substitution
- the final answer with units
- the specific error that loses marks on that question type

Each question is reproducible from a **seed**, so the URL
`practice.html?q=fin1-repayment.1234` always rebuilds exactly the same question —
handy for setting homework or comparing working with someone else.

## Running it locally

ES modules need a real HTTP origin, so open it through a server rather than
double-clicking the file:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works (`npx serve`, `php -S localhost:8000`, and so on).

## Verifying the maths

Every generator is exercised by a check harness that confirms each question is
well-formed, reproducible from its seed, free of `undefined`/`NaN` leakage, and
that each cited formula id actually exists in the formula book:

```sh
node tools/verify-questions.mjs 300   # 300 seeds per generator
```

This runs in CI before any deploy.

## Deploying

The site is plain static files, so it can be served from anywhere.

**GitHub Pages** — `.github/workflows/pages.yml` verifies the generators and then
publishes the repository root. Enable it once under
*Settings → Pages → Build and deployment → Source: **GitHub Actions***.
The `.nojekyll` file stops Jekyll from stripping paths.

**Anywhere else** — upload the repository contents to any static host
(Netlify, Cloudflare Pages, Vercel, S3, a university web folder). There is
nothing to build.

## Accessibility

The site is built to WCAG 2.1 AA and audited with `axe-core` across every page,
both colour themes, and all 62 question types at phone width — currently zero
violations. Specifically:

- semantic landmarks, a skip link, and a logical heading order
- every interactive control reachable and operable by keyboard
- generated questions announced through an ARIA live region
- mathematical notation carries a spoken `aria-label`
- network diagrams are decorative SVG, always paired with an equivalent data table
- light and dark themes, both meeting AA contrast
- honours `prefers-reduced-motion`
- horizontally scrolling tables are keyboard reachable

## Data and privacy

Nothing leaves the browser. Mastery ticks, practice statistics and the theme
choice are kept in `localStorage` on the device, and every read and write is
guarded so the site still works where storage is blocked.

## Project layout

```
index.html  topics.html  practice.html  formulas.html
assets/
  css/style.css
  js/
    lib/        rand.js  fmt.js  solvers.js  store.js  ui.js
    data/       formulas.js  topics.js
                questions/  index.js  data-topics.js  sequences-earth.js
                            finance.js  networks.js
    pages/      home.js  topics.js  practice.js  formulas.js
tools/verify-questions.mjs
```

### Adding a question type

Add a generator to the relevant file in `assets/js/data/questions/` and export it
from `index.js`. A generator is a pure function of a seeded `Rng`:

```js
{
  id: 'topic-slug', topicId: 'finance-1', tier: 'apply', marks: 3,
  skill: 'What this question practises',
  gen(rng) {
    const p = rng.step(1000, 5000, 100);
    return {
      prompt: '…',                     // HTML
      formulaIds: ['compound-interest'],
      steps: [{ t: 'Step title', h: '…', formulaId: 'compound-interest' }],
      answer: '…',
      pitfall: 'The error this question is designed to expose.',
      check: { type: 'number', value: p, tol: 0.5, label: 'amount ($)', unit: '$' }
    };
  }
}
```

`check` supports `number` (with tolerance), `choice` (multiple choice) and
`open` (self-marked written response). Run the verifier afterwards.

## Attribution and licence

Topic structure and formulas follow the QCAA General Mathematics 2025 syllabus
and formula book. Formula book content is
© State of Queensland (QCAA) 2025, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0).

This is an independent study resource. It is not endorsed by, affiliated with, or
produced by the QCAA.
