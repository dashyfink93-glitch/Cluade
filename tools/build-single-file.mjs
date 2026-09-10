/**
 * Builds a self-contained single-file version of the site from the multi-page
 * source, so there is exactly one source of truth for content and logic.
 *
 *   node tools/build-single-file.mjs [outPath]
 *
 * How the single-file build differs from the multi-page site:
 *   - CSS and every JS module are inlined into one document.
 *   - Pages are selected with a "?p=" query parameter instead of separate files,
 *     which leaves location.hash free — so the topic router (#topic-id) and the
 *     formula deep links (#f-formula-id) keep working untouched.
 *   - Only one page controller runs per load, so each is wrapped in its own
 *     function scope and the identifiers they share (render, etc.) cannot clash.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root, p), 'utf8');

/* Concatenation order matters: a module must appear after everything it uses. */
const MODULES = [
  'assets/js/lib/rand.js',
  'assets/js/lib/fmt.js',
  'assets/js/lib/solvers.js',
  'assets/js/lib/store.js',
  'assets/js/data/formulas.js',
  'assets/js/data/topics.js',
  'assets/js/lib/ui.js',
  'assets/js/data/questions/data-topics.js',
  'assets/js/data/questions/sequences-earth.js',
  'assets/js/data/questions/finance.js',
  'assets/js/data/questions/networks.js',
  'assets/js/data/questions/index.js'
];

const PAGES = [
  { id: 'home', file: 'index.html', controller: 'assets/js/pages/home.js', title: 'General Maths Hub — QCAA General Mathematics Units 3 & 4' },
  { id: 'topics', file: 'topics.html', controller: 'assets/js/pages/topics.js', title: 'Learning topics — General Maths Hub' },
  { id: 'practice', file: 'practice.html', controller: 'assets/js/pages/practice.js', title: 'Question generator — General Maths Hub' },
  { id: 'formulas', file: 'formulas.html', controller: 'assets/js/pages/formulas.js', title: 'Formula sheet — General Maths Hub' }
];

/** Removes ES module syntax so the file body can live in a shared scope. */
function stripModuleSyntax(src) {
  return src
    .replace(/^\s*import\s+[^;]*?;\s*$/gm, '')       // import { a } from '…';
    .replace(/^\s*export\s+(?=(const|let|var|function|class)\b)/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '') // export { a, b };
    .trimEnd();
}

/** Rewrites multi-page links to "?p=" routes, preserving any #fragment. */
function rewriteLinks(text) {
  return text
    .replace(/index\.html#/g, '?p=home#')
    .replace(/topics\.html#/g, '?p=topics#')
    .replace(/practice\.html\?/g, '?p=practice&')
    .replace(/formulas\.html#/g, '?p=formulas#')
    .replace(/index\.html/g, '?p=home')
    .replace(/topics\.html/g, '?p=topics')
    .replace(/practice\.html/g, '?p=practice')
    .replace(/formulas\.html/g, '?p=formulas');
}

/** Pulls one element (by its opening tag) out of a page, tags included. */
function extract(html, openTag, tagName) {
  const start = html.indexOf(openTag);
  if (start === -1) throw new Error(`could not find ${openTag}`);
  const close = `</${tagName}>`;
  const end = html.indexOf(close, start);
  if (end === -1) throw new Error(`could not find ${close}`);
  return html.slice(start, end + close.length);
}

const indexHtml = read('index.html');
const header = extract(indexHtml, '<header class="site-header">', 'header');
const footer = extract(indexHtml, '<footer class="site-footer">', 'footer');
const skipLink = '<a class="skip-link" href="#main">Skip to main content</a>';

const shells = Object.fromEntries(PAGES.map(p =>
  [p.id, rewriteLinks(extract(read(p.file), '<main id="main">', 'main'))]));

const library = MODULES.map(m =>
  `/* ── ${m} ── */\n${rewriteLinks(stripModuleSyntax(read(m)))}`).join('\n\n');

const controllers = PAGES.map(p => {
  let body = stripModuleSyntax(read(p.controller));
  body = rewriteLinks(body);
  // Keep the share link on the practice page pointing back at the practice route.
  body = body.replace(/\?q=\$\{encodeURIComponent\(/g, '?p=practice&q=${encodeURIComponent(');
  const indented = body.split('\n').map(l => (l ? '    ' + l : l)).join('\n');
  return `  ${p.id}() {\n${indented}\n  }`;
}).join(',\n');

const css = read('assets/css/style.css');
const title = 'General Maths Hub';

const out = `<title>${title}</title>
<style>
${css}
/* The single-file build has no separate document per page. */
[data-page-shell] { display: contents; }
</style>

${skipLink}
<div id="app-header"></div>
<div id="app-main"></div>
<div id="app-footer"></div>

<noscript>
  <div class="wrap" style="padding-block:40px">
    <p class="noscript-note">This version of General Maths Hub is a single interactive page and needs
      JavaScript. The multi-page site works the same way and is available in the project repository.</p>
  </div>
</noscript>

<script type="module">
/* The host wrapper supplies <html> without a language, so set it here. */
document.documentElement.lang = 'en-AU';

/* Restore a previously chosen theme before the page paints. */
try {
  const saved = JSON.parse(localStorage.getItem('gm-hub:v1') || '{}').theme;
  if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
} catch {}

const PAGE_SHELLS = ${JSON.stringify(shells, null, 2)};
const PAGE_TITLES = ${JSON.stringify(Object.fromEntries(PAGES.map(p => [p.id, p.title])), null, 2)};

${library}

/* ── page controllers ── */
const CONTROLLERS = {
${controllers}
};

/* ── dispatcher ──
   Page comes from ?p=; a bare ?q= (a shared question link) implies the
   practice page. Navigation between pages is an ordinary document load of
   this same file, so no client-side router is required. */
const params = new URLSearchParams(location.search);
let pageId = params.get('p');
if (!CONTROLLERS[pageId]) pageId = params.has('q') ? 'practice' : 'home';

document.getElementById('app-header').innerHTML = ${JSON.stringify(rewriteLinks(header))};
document.getElementById('app-main').innerHTML = PAGE_SHELLS[pageId];
document.getElementById('app-footer').innerHTML = ${JSON.stringify(rewriteLinks(footer))};
document.title = PAGE_TITLES[pageId];

CONTROLLERS[pageId]();

/* markCurrentNav() matches on filename, which cannot work here, so mark the
   active link ourselves — after the controller, so this is what sticks. */
for (const a of document.querySelectorAll('.nav a')) {
  a.removeAttribute('aria-current');
  if ((a.getAttribute('href') || '') === '?p=' + pageId) a.setAttribute('aria-current', 'page');
}
</script>
`;

const outPath = resolve(root, process.argv[2] || 'dist/general-maths-hub.html');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`Built ${outPath}`);
console.log(`  ${kb} KB · ${MODULES.length} modules · ${PAGES.length} pages inlined`);
for (const bad of ['index.html', 'topics.html', 'practice.html', 'formulas.html']) {
  if (out.includes(bad)) console.warn(`  ! still references ${bad}`);
}
if (out.indexOf('<title>') > 8192) console.warn('  ! <title> is beyond the first 8KB');
