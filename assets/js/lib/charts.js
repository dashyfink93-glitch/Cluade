/**
 * Charts for question prompts: scatterplots, time series and residual plots.
 *
 * Form follows the data's job. A scatterplot shows the relationship between two
 * numerical variables; a line shows change over time. Both use emphasis rather
 * than a categorical palette: the observed data carries the accent colour, and
 * any fitted or trend line is a recessive dashed grey with its own label, so the
 * two are told apart by shape and dash as well as hue.
 *
 * Colours come from CSS custom properties, so each theme gets its own chosen
 * steps rather than an automatic flip. Every chart ships with the same numbers
 * as a table, which is both the accessible form and the relief the low-contrast
 * context grey requires.
 */
import { round, tidy, table } from './fmt.js';

const W = 470, H = 300;
const M = { top: 20, right: 18, bottom: 46, left: 58 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

/** Rounded tick steps: 1, 2, 2.5 or 5 times a power of ten. */
function niceTicks(min, max, target = 5) {
  if (max === min) { max = min + 1; }
  const raw = (max - min) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find(m => raw <= m * mag) * mag;
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step / 2; v += step) ticks.push(round(v, 6));
  return ticks;
}

function scale(domainMin, domainMax, rangeMin, rangeMax) {
  const span = domainMax - domainMin || 1;
  return v => rangeMin + ((v - domainMin) / span) * (rangeMax - rangeMin);
}

function axes(xTicks, yTicks, xs, ys, xLabel, yLabel) {
  const grid = [
    ...yTicks.map(t => `<line x1="${M.left}" y1="${ys(t)}" x2="${M.left + PLOT_W}" y2="${ys(t)}" class="chart__grid" />`),
    ...xTicks.map(t => `<line x1="${xs(t)}" y1="${M.top}" x2="${xs(t)}" y2="${M.top + PLOT_H}" class="chart__grid" />`)
  ].join('');

  const xLabels = xTicks.map(t =>
    `<text x="${xs(t)}" y="${M.top + PLOT_H + 18}" text-anchor="middle" class="chart__tick">${tidy(t)}</text>`).join('');
  const yLabels = yTicks.map(t =>
    `<text x="${M.left - 9}" y="${ys(t) + 4}" text-anchor="end" class="chart__tick">${tidy(t)}</text>`).join('');

  return `${grid}
    <line x1="${M.left}" y1="${M.top}" x2="${M.left}" y2="${M.top + PLOT_H}" class="chart__axis" />
    <line x1="${M.left}" y1="${M.top + PLOT_H}" x2="${M.left + PLOT_W}" y2="${M.top + PLOT_H}" class="chart__axis" />
    ${xLabels}${yLabels}
    <text x="${M.left + PLOT_W / 2}" y="${H - 6}" text-anchor="middle" class="chart__axis-label">${xLabel}</text>
    <text x="14" y="${M.top + PLOT_H / 2}" text-anchor="middle" class="chart__axis-label"
      transform="rotate(-90 14 ${M.top + PLOT_H / 2})">${yLabel}</text>`;
}

function frame(inner, title) {
  return `<figure class="chart">
    <svg viewBox="0 0 ${W} ${H}" class="chart__svg" role="img" aria-label="${title}. The same values are in the table below.">
      ${inner}
    </svg>
    <figcaption class="chart__caption">${title}</figcaption>
  </figure>`;
}

/**
 * Scatterplot of paired data, optionally with a fitted line.
 * points: [{x, y}]   line: {m, c, label} or null
 */
export function scatterPlot({ points, xLabel, yLabel, title, line = null, showTable = true }) {
  const xsVals = points.map(p => p.x);
  const ysVals = points.map(p => p.y);
  const xTicks = niceTicks(Math.min(...xsVals), Math.max(...xsVals));
  const yTicks = niceTicks(Math.min(...ysVals, line ? line.m * Math.min(...xsVals) + line.c : Infinity),
                           Math.max(...ysVals, line ? line.m * Math.max(...xsVals) + line.c : -Infinity));
  const xs = scale(xTicks[0], xTicks[xTicks.length - 1], M.left, M.left + PLOT_W);
  const ys = scale(yTicks[0], yTicks[yTicks.length - 1], M.top + PLOT_H, M.top);

  let fitted = '';
  if (line) {
    const x1 = xTicks[0], x2 = xTicks[xTicks.length - 1];
    fitted = `<line x1="${xs(x1)}" y1="${ys(line.m * x1 + line.c)}"
                    x2="${xs(x2)}" y2="${ys(line.m * x2 + line.c)}"
                    class="chart__fit" />
      <text x="${M.left + PLOT_W - 4}" y="${ys(line.m * x2 + line.c) - 8}" text-anchor="end"
        class="chart__series-label">${line.label || 'line of best fit'}</text>`;
  }

  const marks = points.map(p =>
    `<circle cx="${xs(p.x)}" cy="${ys(p.y)}" r="5" class="chart__dot">
       <title>${xLabel} ${tidy(p.x)}, ${yLabel} ${tidy(p.y)}</title>
     </circle>`).join('');

  const svg = frame(`${axes(xTicks, yTicks, xs, ys, xLabel, yLabel)}${fitted}${marks}`, title);
  const tbl = showTable
    ? table([xLabel, ...points.map(p => tidy(p.x))], [[yLabel, ...points.map(p => tidy(p.y))]])
    : '';
  return svg + tbl;
}

/**
 * Time series line, optionally with a second recessive series (trend or
 * deseasonalised values) drawn dashed and labelled.
 * values: [number]   labels: [string]   trend: {values, label} or null
 */
export function timeSeriesPlot({ values, labels, xLabel, yLabel, title, trend = null, showTable = true }) {
  const all = trend ? [...values, ...trend.values] : values;
  const yTicks = niceTicks(Math.min(...all), Math.max(...all));
  const xs = scale(0, values.length - 1, M.left, M.left + PLOT_W);
  const ys = scale(yTicks[0], yTicks[yTicks.length - 1], M.top + PLOT_H, M.top);

  const xTickVals = values.map((_, i) => i);
  const grid = yTicks.map(t =>
    `<line x1="${M.left}" y1="${ys(t)}" x2="${M.left + PLOT_W}" y2="${ys(t)}" class="chart__grid" />`).join('');
  const xLabelsEls = labels.map((l, i) =>
    `<text x="${xs(i)}" y="${M.top + PLOT_H + 18}" text-anchor="middle" class="chart__tick">${l}</text>`).join('');
  const yLabelsEls = yTicks.map(t =>
    `<text x="${M.left - 9}" y="${ys(t) + 4}" text-anchor="end" class="chart__tick">${tidy(t)}</text>`).join('');

  const path = values.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ');
  const dots = values.map((v, i) =>
    `<circle cx="${xs(i)}" cy="${ys(v)}" r="4.5" class="chart__dot">
       <title>${labels[i]}: ${tidy(v)}</title>
     </circle>`).join('');

  let trendEls = '';
  if (trend) {
    const tp = trend.values.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ');
    const last = trend.values[trend.values.length - 1];
    trendEls = `<path d="${tp}" class="chart__fit" fill="none" />
      <text x="${M.left + PLOT_W - 4}" y="${ys(last) - 9}" text-anchor="end"
        class="chart__series-label">${trend.label}</text>`;
  }

  const inner = `${grid}
    <line x1="${M.left}" y1="${M.top}" x2="${M.left}" y2="${M.top + PLOT_H}" class="chart__axis" />
    <line x1="${M.left}" y1="${M.top + PLOT_H}" x2="${M.left + PLOT_W}" y2="${M.top + PLOT_H}" class="chart__axis" />
    ${xLabelsEls}${yLabelsEls}
    <text x="${M.left + PLOT_W / 2}" y="${H - 6}" text-anchor="middle" class="chart__axis-label">${xLabel}</text>
    <text x="14" y="${M.top + PLOT_H / 2}" text-anchor="middle" class="chart__axis-label"
      transform="rotate(-90 14 ${M.top + PLOT_H / 2})">${yLabel}</text>
    ${trendEls}
    <path d="${path}" class="chart__line" fill="none" />
    ${dots}`;

  const svg = frame(inner, title);
  const rows = [[yLabel, ...values.map(v => tidy(v))]];
  if (trend) rows.push([trend.label, ...trend.values.map(v => tidy(v))]);
  const tbl = showTable ? table([xLabel, ...labels], rows) : '';
  return svg + tbl;
}

/** Residual plot: residuals against x, with the zero line emphasised. */
export function residualPlot({ points, xLabel, title, showTable = true }) {
  const xsVals = points.map(p => p.x);
  const rs = points.map(p => p.r);
  const bound = Math.max(Math.abs(Math.min(...rs)), Math.abs(Math.max(...rs)));
  const xTicks = niceTicks(Math.min(...xsVals), Math.max(...xsVals));
  const yTicks = niceTicks(-bound, bound, 4);
  const xs = scale(xTicks[0], xTicks[xTicks.length - 1], M.left, M.left + PLOT_W);
  const ys = scale(yTicks[0], yTicks[yTicks.length - 1], M.top + PLOT_H, M.top);

  const zero = `<line x1="${M.left}" y1="${ys(0)}" x2="${M.left + PLOT_W}" y2="${ys(0)}" class="chart__zero" />
    <text x="${M.left + PLOT_W - 4}" y="${ys(0) - 8}" text-anchor="end" class="chart__series-label">residual = 0</text>`;
  const marks = points.map(p =>
    `<circle cx="${xs(p.x)}" cy="${ys(p.r)}" r="5" class="chart__dot">
       <title>${xLabel} ${tidy(p.x)}, residual ${tidy(p.r)}</title>
     </circle>`).join('');

  const svg = frame(`${axes(xTicks, yTicks, xs, ys, xLabel, 'residual')}${zero}${marks}`, title);
  const tbl = showTable
    ? table([xLabel, ...points.map(p => tidy(p.x))], [['residual', ...points.map(p => tidy(p.r))]])
    : '';
  return svg + tbl;
}

/** A percentaged two-way table, rendered as a real table rather than a chart. */
export function twoWayTable({ evName, groups, yesLabel, noLabel }) {
  const headers = ['', yesLabel, noLabel, 'Total'];
  const rows = groups.map(g => [g.name, g.yes, g.no, g.yes + g.no]);
  const totals = ['Total',
    groups.reduce((n, g) => n + g.yes, 0),
    groups.reduce((n, g) => n + g.no, 0),
    groups.reduce((n, g) => n + g.yes + g.no, 0)];
  return table(headers, [...rows, totals], `Counts by ${evName}`);
}
