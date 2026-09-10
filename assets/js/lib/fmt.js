/** Number, money and maths-markup formatting shared by every generator. */

/** Round half-up away from zero, avoiding the usual binary-float surprises. */
export function round(x, dp = 2) {
  const f = 10 ** dp;
  const v = x * f;
  const r = Math.round(Math.abs(v) + Number.EPSILON * Math.abs(v)) * Math.sign(v);
  return r / f;
}

/** Groups the integer part in threes, leaving the decimal part alone. */
function groupInteger(fixed) {
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${grouped}.${frac}` : grouped;
}

/** Fixed decimals, with thousands separators and a true minus sign. */
export function num(x, dp = 2) {
  return groupInteger(round(x, dp).toFixed(dp)).replace(/^-/, '−');
}

/** Trims trailing zeros: 2.50 -> "2.5", 7.00 -> "7". */
export function tidy(x, dp = 4) {
  const s = round(x, dp).toFixed(dp).replace(/\.?0+$/, '');
  return (s === '' || s === '-' ? '0' : s).replace(/^-/, '−');
}

/** Currency with the Australian convention used in the syllabus. */
export function money(x, dp = 2) {
  const neg = x < 0;
  return (neg ? '−$' : '$') + groupInteger(round(Math.abs(x), dp).toFixed(dp));
}

/** Percentage from a proportion. */
export function pct(x, dp = 2) { return `${num(x * 100, dp)}%`; }

/** Inline maths span with a spoken label for screen readers. */
export function math(markup, aria) {
  const label = aria ? ` aria-label="${escapeAttr(aria)}"` : '';
  return `<span class="math"${label}>${markup}</span>`;
}

export function frac(numerator, denominator) {
  return `<span class="frac"><span class="num">${numerator}</span><span class="den">${denominator}</span></span>`;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function escapeAttr(s) { return escapeHtml(s).replace(/\n/g, ' '); }

/** Renders a small numeric table. rows is an array of arrays. */
export function table(headers, rows, caption) {
  const cap = caption ? `<caption>${caption}</caption>` : '';
  const head = `<thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows.map(r =>
    `<tr>${r.map((c, i) => i === 0
      ? `<th scope="row">${c}</th>`
      : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
  // tabindex makes the horizontal scroll reachable from the keyboard (WCAG 2.1.1).
  return `<div class="table-scroll" tabindex="0"><table class="numeric">${cap}${head}${body}</table></div>`;
}

/** "1st", "2nd", "3rd"… */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Joins a list in prose: "a, b and c". */
export function listSentence(items) {
  if (items.length <= 1) return items[0] || '';
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
