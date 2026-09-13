# General Maths Hub

A free, public study site for **QCAA General Mathematics Units 3 & 4**.

Ten syllabus topics explained plainly, a random question generator that never runs out,
and step-by-step solutions that name the exact formula-book entry behind every line.

No build step, no dependencies, no tracking, no account. It is a folder of static files.

## What's in it

| Page | What it does |
| --- | --- |
| `index.html` | Overview, topic grid, study cycle, progress dashboard |
| `topics.html` | All ten topics, in three tabs: a teacher-voice **Lesson**, the syllabus **Reference**, and a **Skills checklist** |
| `practice.html` | The question generator, with answer checking and worked steps |
| `exam.html` | A marked mock exam: 14 questions, a grade, a topic breakdown and full solutions |
| `formulas.html` | The complete QCAA 2025 formula book, searchable and annotated, plus the printed pages |

### Design

Headings and the syllabus numerals are set in Fraunces, running text and the
interface in Public Sans, and anything that lines up in a column in IBM Plex
Mono. The maths keeps a Times-like serif, because italic serif variables are the
typesetting convention. Every stack falls back to a real local face, so the site
still reads if the webfonts never arrive.

One accent (a deep teal) carries the interface, with an ochre as a second voice
for annotations. Semantic colours are kept off both.

Explanations follow the humanizer guidance: no em dashes as punctuation, no
inflated vocabulary, active voice, varied sentence length. Mathematical ranges
(`pp. 1–60`) and edge labels (`A–B`) keep their dashes, because there they are
notation rather than punctuation.

### Charts

`assets/js/lib/charts.js` draws scatterplots, time series and residual plots as
inline SVG for the bivariate and time-series questions, in both the generator
and the mock exam.

Form follows the data's job, and both use emphasis rather than a categorical
palette: observed data takes the accent colour, and a fitted or trend line is a
recessive dashed grey with its own label, so the two differ by shape and dash as
well as hue. Chart colours were validated with the dataviz palette checker
(light ΔE 28.9 normal / 26.2 protan; dark 24.3 / 22.5). Every chart ships the
same numbers as a table, which is both the accessible form and the relief the
low-contrast context grey requires.

Scatterplot data is built to *have* the summary statistics the question quotes.
Rather than scattering points near a line and hoping, y is assembled from the
standardised x weighted by r plus exactly uncorrelated noise weighted by
sqrt(1 - r squared), so the picture and the table agree.

### Lessons

Each topic opens on a lesson rather than a definition list: a concrete hook, the
idea in plain words before any notation, a walk-through of how to think about it,
a "which method do I use" table, and the specific wrong belief behind each
common mistake. The register is deliberately plain, with everyday comparisons
rather than restated syllabus wording. That content lives in `assets/js/data/teaching.js`,
separate from the syllabus reference material in `topics.js`.

Inside a Claude viewer the lesson also carries an **Ask a tutor** panel, backed by
the artifact `sample` capability and grounded in that topic's material. On a plain
static host the capability is absent, the panel never renders, and nothing else
changes.

### The mock exam

`exam.html` builds a fresh 14-question paper spread across all ten topics, in
roughly the Skill/Apply/Challenge balance of a real combination-response paper.
Only auto-markable question types are drawn, so the paper is marked without the
student judging their own written response. Submitting gives a percentage, a
grade from A+ to D−, marks by topic weakest-first, and a full worked solution
for every question.

The grade bands are a self-tracking aid, not a QCAA prediction — QCAA reports on
its own scale and does not use plus/minus grades.

### The formula sheet

All **43** formulas printed on the official QCAA 2025 sheet are present, in the
book's own section order, and both printed pages are embedded as images. A
further 14 standard results the syllabus assumes but does not print (R² = r²,
the seasonal-index rules, float, max-flow/min-cut) are included and marked
`derived`, and can be filtered out. Every entry also lists what each letter
stands for, and the formula chips beside a question expand to show the same.

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

## Single-file build

`tools/build-single-file.mjs` bundles the whole site into one self-contained
HTML file, derived from the same source, so there is no second copy to maintain:

```sh
node tools/build-single-file.mjs        # -> dist/general-maths-hub.html
```

It inlines the CSS and every module, and swaps the four separate pages for a
`?p=` query parameter. That leaves `location.hash` free, so the topic router
(`#topic-id`) and formula deep links (`#f-formula-id`) keep working unchanged.
Only one page controller runs per load, so each is wrapped in its own function
scope. CI rebuilds it and fails if the committed file has drifted from source.

## Deploying

The site is plain static files, so it can be served from anywhere.

**GitHub Pages** — `.github/workflows/pages.yml` verifies the generators and then
publishes the repository root. Enable it once under
*Settings → Pages → Build and deployment → Source: **GitHub Actions***.
The `.nojekyll` file stops Jekyll from stripping paths.

**Anywhere else** — upload the repository contents to any static host
(Netlify, Cloudflare Pages, Vercel, S3, a university web folder). There is
nothing to build.

**As one file** — `dist/general-maths-hub.html` is the entire site in a single
document. Email it, drop it on a USB stick, or host it anywhere that serves one
file. It works offline once loaded.

## Webfonts

The type is Fraunces, Public Sans and IBM Plex Mono from Google Fonts. The
stylesheet is linked with `media="print"` and promoted to `all` by `boot()`, so
it never blocks the first paint, with a `<noscript>` copy for the JS-off case.
Every stack ends in real local faces, so a blocked or slow font CDN (common on
school networks) costs the reader nothing.

Measured with both font hosts blocked in the browser: DOMContentLoaded went from
12.5 s to 131 ms, and the page renders in the fallback faces with no layout
change beyond the type itself.

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
