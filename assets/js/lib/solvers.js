/**
 * Small exact solvers shared by the network generators, so the published answer
 * is computed rather than hard-coded.
 */

/** Kruskal's minimum spanning tree. edges: [{a, b, w}]. Returns {edges, weight}. */
export function minimumSpanningTree(vertices, edges) {
  const parent = Object.fromEntries(vertices.map(v => [v, v]));
  const find = v => (parent[v] === v ? v : (parent[v] = find(parent[v])));
  const sorted = edges.slice().sort((x, y) => x.w - y.w || (x.a + x.b).localeCompare(y.a + y.b));
  const chosen = [];
  let weight = 0;
  for (const e of sorted) {
    const ra = find(e.a), rb = find(e.b);
    if (ra === rb) continue;
    parent[ra] = rb;
    chosen.push(e);
    weight += e.w;
    if (chosen.length === vertices.length - 1) break;
  }
  return { edges: chosen, weight };
}

/** Every simple path between two vertices, with total weight. */
export function allPaths(edges, start, end) {
  const adj = {};
  for (const e of edges) {
    (adj[e.a] ||= []).push({ to: e.b, w: e.w });
    (adj[e.b] ||= []).push({ to: e.a, w: e.w });
  }
  const out = [];
  (function walk(v, visited, route, weight) {
    if (v === end) { out.push({ route: route.slice(), weight }); return; }
    for (const nb of adj[v] || []) {
      if (visited.has(nb.to)) continue;
      visited.add(nb.to); route.push(nb.to);
      walk(nb.to, visited, route, weight + nb.w);
      route.pop(); visited.delete(nb.to);
    }
  })(start, new Set([start]), [start], 0);
  return out.sort((a, b) => a.weight - b.weight);
}

/**
 * Critical path analysis on an activity list.
 * activities: [{ name, dur, pred: [names] }]
 * Returns each activity with est, eft, lst, lft, float, plus duration and critical path.
 */
export function criticalPath(activities) {
  const byName = Object.fromEntries(activities.map(a => [a.name, { ...a }]));
  const order = topoSort(activities);

  for (const name of order) {
    const a = byName[name];
    a.est = a.pred.length ? Math.max(...a.pred.map(p => byName[p].eft)) : 0;
    a.eft = a.est + a.dur;
  }
  const duration = Math.max(...activities.map(a => byName[a.name].eft));

  const successors = Object.fromEntries(activities.map(a => [a.name, []]));
  for (const a of activities) for (const p of a.pred) successors[p].push(a.name);

  for (const name of order.slice().reverse()) {
    const a = byName[name];
    a.lft = successors[name].length
      ? Math.min(...successors[name].map(s => byName[s].lst))
      : duration;
    a.lst = a.lft - a.dur;
    a.float = a.lst - a.est;
  }

  const critical = order.filter(n => byName[n].float === 0);
  return { activities: order.map(n => byName[n]), duration, critical, byName };
}

function topoSort(activities) {
  const indeg = Object.fromEntries(activities.map(a => [a.name, a.pred.length]));
  const succ = Object.fromEntries(activities.map(a => [a.name, []]));
  for (const a of activities) for (const p of a.pred) succ[p].push(a.name);
  const queue = activities.filter(a => a.pred.length === 0).map(a => a.name).sort();
  const out = [];
  while (queue.length) {
    const n = queue.shift();
    out.push(n);
    for (const s of succ[n]) if (--indeg[s] === 0) queue.push(s);
    queue.sort();
  }
  if (out.length !== activities.length) throw new Error('project network contains a cycle');
  return out;
}

/** Optimal assignment by exhaustive search — correct and fast for the 2×2/3×3 exam cases. */
export function bestAssignment(matrix, mode = 'min') {
  const n = matrix.length;
  const idx = [...Array(n).keys()];
  let best = null;
  for (const perm of permutations(idx)) {
    const total = perm.reduce((s, col, row) => s + matrix[row][col], 0);
    const better = best === null || (mode === 'min' ? total < best.total : total > best.total);
    if (better) best = { total, perm: perm.slice() };
  }
  return best;
}

export function permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

/** Row then column reduction — the opening moves of the Hungarian algorithm. */
export function hungarianReduce(matrix) {
  const rowMins = matrix.map(r => Math.min(...r));
  const afterRows = matrix.map((r, i) => r.map(v => v - rowMins[i]));
  const colMins = afterRows[0].map((_, j) => Math.min(...afterRows.map(r => r[j])));
  const afterCols = afterRows.map(r => r.map((v, j) => v - colMins[j]));
  return { rowMins, afterRows, colMins, afterCols };
}
