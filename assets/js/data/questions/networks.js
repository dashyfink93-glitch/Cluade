/**
 * Generators for Graphs and networks, and Networks and decision mathematics 1 & 2.
 * Diagrams are drawn as inline SVG (aria-hidden) and always paired with an
 * equivalent table, so nothing depends on being able to see the picture.
 */
import { round, num, tidy, math, frac, table } from '../../lib/fmt.js';
import { minimumSpanningTree, allPaths, criticalPath, bestAssignment, permutations, hungarianReduce } from '../../lib/solvers.js';

/* Fixed layout reused by the weighted-network questions. */
const LAYOUT = { A: [42, 92], B: [150, 26], C: [150, 158], D: [286, 26], E: [286, 158], F: [396, 92] };
const EDGE_SET = [
  ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']
];

/** Inline SVG of a weighted undirected network. Decorative — the table carries the data. */
function networkSvg(edges, highlight = []) {
  const hi = new Set(highlight.map(e => [e.a, e.b].sort().join('')));
  const lines = edges.map(e => {
    const [x1, y1] = LAYOUT[e.a], [x2, y2] = LAYOUT[e.b];
    const on = hi.has([e.a, e.b].sort().join(''));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor"
              stroke-width="${on ? 3.5 : 1.6}" opacity="${on ? 1 : .45}" />
            <rect x="${mx - 13}" y="${my - 11}" width="26" height="19" rx="5"
              fill="var(--surface)" stroke="currentColor" stroke-opacity=".25" />
            <text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="12.5"
              font-weight="700" fill="currentColor">${e.w}</text>`;
  }).join('');
  const nodes = Object.entries(LAYOUT).map(([id, [x, y]]) =>
    `<circle cx="${x}" cy="${y}" r="17" fill="var(--surface)" stroke="currentColor" stroke-width="2" />
     <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700"
       fill="currentColor">${id}</text>`).join('');
  return `<div style="margin-bottom:10px">
    <svg viewBox="0 0 440 190" width="440" height="190" role="presentation" aria-hidden="true"
      style="max-width:100%;height:auto;color:var(--text)">${lines}${nodes}</svg></div>`;
}

function edgeTable(edges) {
  return table(['Edge', ...edges.map(e => `${e.a}–${e.b}`)], [['Weight', ...edges.map(e => e.w)]]);
}

function randomWeightedNetwork(rng) {
  return EDGE_SET.map(([a, b]) => ({ a, b, w: rng.int(2, 14) }));
}

/* ================================================================== TOPIC 08 */

export const graphsNetworks = [
  {
    id: 'gn-euler', topicId: 'graphs-networks', tier: 'skill', marks: 2,
    skill: "Apply Euler's planar formula",
    gen(rng) {
      const v = rng.int(5, 12);
      const e = rng.int(v, Math.min(3 * v - 6, v + 9));
      const f = 2 - v + e;
      const unknown = rng.pick(['f', 'v', 'e']);
      const known = {
        f: `${math(`v <span class="op">=</span> ${v}`)} and ${math(`e <span class="op">=</span> ${e}`)}`,
        v: `${math(`e <span class="op">=</span> ${e}`)} and ${math(`f <span class="op">=</span> ${f}`)}`,
        e: `${math(`v <span class="op">=</span> ${v}`)} and ${math(`f <span class="op">=</span> ${f}`)}`
      }[unknown];
      const value = { f, v, e }[unknown];
      const nameOf = { f: 'faces', v: 'vertices', e: 'edges' }[unknown];
      const rearranged = {
        f: `f <span class="op">=</span> 2 <span class="op">−</span> v <span class="op">+</span> e <span class="op">=</span> 2 <span class="op">−</span> ${v} <span class="op">+</span> ${e}`,
        v: `v <span class="op">=</span> 2 <span class="op">−</span> f <span class="op">+</span> e <span class="op">=</span> 2 <span class="op">−</span> ${f} <span class="op">+</span> ${e}`,
        e: `e <span class="op">=</span> v <span class="op">+</span> f <span class="op">−</span> 2 <span class="op">=</span> ${v} <span class="op">+</span> ${f} <span class="op">−</span> 2`
      }[unknown];
      return {
        prompt: `<p>A connected planar graph has ${known}.</p>
                 <p class="mb-0">Determine the number of ${nameOf}.</p>`,
        formulaIds: ['euler'],
        steps: [
          { t: 'Check the conditions', formulaId: 'euler',
            h: `<p>${math('v <span class="op">+</span> f <span class="op">−</span> e <span class="op">=</span> 2')} applies to graphs that are both <strong>connected</strong> and <strong>planar</strong>. Both are stated here.</p>` },
          { t: 'Rearrange for the unknown',
            h: `<p>${math(rearranged)}</p>` },
          { t: 'Evaluate',
            h: `<p class="mb-0">${math(`${unknown} <span class="op">=</span> ${value}`)}${unknown === 'f' ? ' — and remember that count includes the infinite region outside the graph.' : '.'}</p>` }
        ],
        answer: `${value} ${nameOf}.`,
        pitfall: 'Forgetting the outside face. A planar drawing always has one more face than the enclosed regions you can see.',
        check: { type: 'number', value, tol: 0.01, label: `number of ${nameOf}` }
      };
    }
  },

  {
    id: 'gn-degree-sum', topicId: 'graphs-networks', tier: 'skill', marks: 2,
    skill: 'Use the relationship between degrees and edges',
    gen(rng) {
      const n = rng.int(5, 7);
      let degs;
      do { degs = Array.from({ length: n }, () => rng.int(1, 6)); }
      while (degs.reduce((a, b) => a + b, 0) % 2 !== 0);
      const sum = degs.reduce((a, b) => a + b, 0);
      const e = sum / 2;
      return {
        prompt: `<p>An undirected graph has ${n} vertices with degrees ${degs.join(', ')}.</p>
                 <p class="mb-0">How many edges does it have?</p>`,
        formulaIds: ['degree-sum'],
        steps: [
          { t: 'Why the sum is doubled', formulaId: 'degree-sum',
            h: `<p>Each edge has two ends, and each end contributes 1 to the degree of the vertex it touches. So every edge is counted twice: ${math('∑ degree <span class="op">=</span> 2e')}.</p>` },
          { t: 'Add the degrees',
            h: `<p>${math(`${degs.join(' <span class="op">+</span> ')} <span class="op">=</span> ${sum}`, `${degs.join(' plus ')} equals ${sum}`)}</p>` },
          { t: 'Halve the total',
            h: `<p class="mb-0">${math(`e <span class="op">=</span> ${frac(sum, 2)} <span class="op">=</span> ${e}`)} edges. ${degs.filter(d => d % 2).length} vertices have odd degree — always an even number of them, which is a useful check.</p>` }
        ],
        answer: `${e} edges.`,
        pitfall: 'Reporting the sum of degrees as the number of edges. Halve it.',
        check: { type: 'number', value: e, tol: 0.01, label: 'number of edges' }
      };
    }
  },

  {
    id: 'gn-eulerian', topicId: 'graphs-networks', tier: 'apply', marks: 3,
    skill: 'Test Eulerian conditions',
    gen(rng) {
      const kind = rng.pick(['circuit', 'trail', 'neither']);
      const n = rng.int(5, 6);
      let degs;
      const targetOdd = kind === 'circuit' ? 0 : kind === 'trail' ? 2 : 4;
      do {
        degs = Array.from({ length: n }, () => rng.int(2, 5));
        const odd = degs.filter(d => d % 2).length;
        if (odd !== targetOdd) continue;
        break;
      } while (true);
      const odd = degs.filter(d => d % 2).length;
      const correct = {
        0: 'It has an Eulerian circuit — a closed trail using every edge exactly once.',
        2: 'It is semi-Eulerian — an open Eulerian trail exists, starting and finishing at the two odd vertices.',
        4: 'It is neither Eulerian nor semi-Eulerian.'
      }[odd];
      const options = rng.shuffle([
        correct,
        'It has an Eulerian circuit — a closed trail using every edge exactly once.',
        'It is semi-Eulerian — an open Eulerian trail exists, starting and finishing at the two odd vertices.',
        'It is neither Eulerian nor semi-Eulerian.'
      ].filter((v, i, arr) => arr.indexOf(v) === i));
      return {
        prompt: `<p>A <strong>connected</strong> graph has vertex degrees ${degs.join(', ')}.</p>
                 <p class="mb-0">Classify it for Eulerian trails and circuits.</p>`,
        formulaIds: ['degree-sum'],
        steps: [
          { t: 'Count the odd-degree vertices',
            h: `<p>Degrees: ${degs.join(', ')}. Odd ones: ${degs.filter(d => d % 2).join(', ') || 'none'} → <strong>${odd}</strong> odd vertices.</p>` },
          { t: 'Apply the test',
            h: `<p>For a connected graph:</p>
                <ul class="mb-0">
                  <li>0 odd vertices → Eulerian <strong>circuit</strong> (starts and ends at the same vertex)</li>
                  <li>2 odd vertices → open Eulerian <strong>trail</strong>, semi-Eulerian</li>
                  <li>4 or more odd vertices → neither</li>
                </ul>` },
          { t: 'State the conclusion',
            h: `<p class="mb-0">${correct}${odd === 2 ? ' The start and finish must be the two odd vertices — no other choice works.' : ''}</p>` },
          { t: 'Keep Eulerian and Hamiltonian apart',
            h: `<p class="mb-0">This test concerns <strong>edges</strong>. A Hamiltonian cycle visits every <strong>vertex</strong> once, and there is no comparable degree test for it.</p>` }
        ],
        answer: correct,
        pitfall: 'Applying the degree test to Hamiltonian questions. It only governs Eulerian trails and circuits.',
        check: { type: 'choice', options, correct: options.indexOf(correct) }
      };
    }
  },

  {
    id: 'gn-adjacency', topicId: 'graphs-networks', tier: 'apply', marks: 3,
    skill: 'Interpret an adjacency matrix',
    gen(rng) {
      const labels = ['P', 'Q', 'R', 'S'];
      const m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
      for (const [i, j] of pairs) {
        const v = rng.bool(0.62) ? rng.int(1, 2) : 0;
        m[i][j] = v; m[j][i] = v;
      }
      if (m.flat().reduce((a, b) => a + b, 0) === 0) { m[0][1] = m[1][0] = 1; }
      const target = rng.int(0, 3);
      const deg = m[target].reduce((a, b) => a + b, 0);
      const edges = m.flat().reduce((a, b) => a + b, 0) / 2;
      return {
        prompt: `<p>An undirected graph on vertices P, Q, R, S has this adjacency matrix.</p>
          ${table(['', ...labels], labels.map((l, i) => [l, ...m[i]]))}
          <p class="mb-0">Find the degree of vertex ${labels[target]}, and the total number of edges.</p>`,
        formulaIds: ['degree-sum'],
        steps: [
          { t: 'Read what an entry means',
            h: `<p>Entry (i, j) is the number of edges joining vertex i to vertex j. The matrix is <strong>symmetric</strong> because an undirected edge joins both ways, and the zero diagonal tells you there are no loops.</p>` },
          { t: `Sum the row for ${labels[target]}`,
            h: `<p>${math(`${m[target].join(' <span class="op">+</span> ')} <span class="op">=</span> ${deg}`, `${m[target].join(' plus ')} equals ${deg}`)}, so ${math(`deg(${labels[target]}) <span class="op">=</span> ${deg}`)}.</p>` },
          { t: 'Count the edges', formulaId: 'degree-sum',
            h: `<p class="mb-0">Every entry is counted twice in the whole matrix, so ${math(`e <span class="op">=</span> ${frac('sum of all entries', '2')} <span class="op">=</span> ${frac(edges * 2, 2)} <span class="op">=</span> ${edges}`)}.</p>` }
        ],
        answer: `deg(${labels[target]}) = ${deg}; the graph has ${edges} edges.`,
        pitfall: 'On a matrix with loops, a loop adds 2 to the degree — the diagonal entry is not simply added once.',
        check: { type: 'number', value: deg, tol: 0.01, label: `degree of ${labels[target]}` }
      };
    }
  },

  {
    id: 'gn-shortest-path', topicId: 'graphs-networks', tier: 'apply', marks: 4,
    skill: 'Solve a shortest-path problem',
    gen(rng) {
      const edges = randomWeightedNetwork(rng);
      const paths = allPaths(edges, 'A', 'F');
      const best = paths[0];
      const shown = paths.slice(0, 5);
      return {
        prompt: `<p>The network shows travel times in minutes between six depots.</p>
          ${networkSvg(edges, [])}
          ${edgeTable(edges)}
          <p class="mb-0">Find the shortest route from A to F and state its total time.</p>`,
        formulaIds: [],
        steps: [
          { t: 'List the candidate routes',
            h: `<p>Work systematically outwards from A rather than guessing. Every route from A must start A–B or A–C.</p>
                ${table(['Route', 'Total'], shown.map(p => [p.route.join('–'), p.weight]))}` },
          { t: 'Compare the totals',
            h: `<p>The smallest total is ${math(`${best.weight}`)}, on route <strong>${best.route.join('–')}</strong>.</p>` },
          { t: 'Check no shorter route was missed',
            h: `<p>Any route not listed either revisits a vertex — which can only add weight — or exceeds ${best.weight} at its first few edges.</p>` },
          { t: 'State route and weight together',
            h: `<p class="mb-0">Shortest path: <strong>${best.route.join('–')}</strong>, total <strong>${best.weight} minutes</strong>.</p>
                <p class="text-muted mb-0">Both parts are required — a number without its route does not answer the question.</p>` }
        ],
        answer: `${best.route.join('–')}, total ${best.weight} minutes.`,
        pitfall: 'Giving the distance without the route, or stopping at the first route that "looks" short.',
        check: { type: 'number', value: best.weight, tol: 0.01, label: 'shortest total time' }
      };
    }
  },

  {
    id: 'gn-terminology', topicId: 'graphs-networks', tier: 'skill', marks: 2,
    skill: 'Distinguish walks, trails, paths, circuits and cycles',
    gen(rng) {
      const cases = [
        { seq: 'A–B–C–D', desc: 'no vertex and no edge is repeated, and it does not return to the start', ans: 'a path' },
        { seq: 'A–B–C–A', desc: 'no vertex is repeated except that it returns to the start', ans: 'a cycle' },
        { seq: 'A–B–C–B–D', desc: 'vertex B is repeated but no edge is', ans: 'a trail (but not a path)' },
        { seq: 'A–B–A–B–C', desc: 'edge A–B is used twice', ans: 'a walk only' },
        { seq: 'A–B–C–D–B–A', desc: 'it returns to the start and repeats vertex B but no edge', ans: 'a circuit (but not a cycle)' }
      ];
      const c = rng.pick(cases);
      const ALL = ['a path', 'a cycle', 'a trail (but not a path)', 'a walk only', 'a circuit (but not a cycle)'];
      const options = rng.shuffle([c.ans, ...rng.sample(ALL.filter(o => o !== c.ans), 3)]);
      return {
        prompt: `<p>In a graph, the sequence <strong>${c.seq}</strong> is traversed. In this sequence, ${c.desc}.</p>
                 <p class="mb-0">Which term describes it most precisely?</p>`,
        formulaIds: [],
        steps: [
          { t: 'Start from the definitions',
            h: `<ul class="mb-0">
                  <li><strong>Walk</strong> — any sequence of connected edges; repeats allowed.</li>
                  <li><strong>Trail</strong> — a walk with no repeated <em>edge</em>.</li>
                  <li><strong>Path</strong> — a trail with no repeated <em>vertex</em>.</li>
                  <li><strong>Circuit</strong> — a closed trail (starts and ends at the same vertex).</li>
                  <li><strong>Cycle</strong> — a closed path: no repeats other than the shared start and finish.</li>
                </ul>` },
          { t: 'Check repeats in this sequence',
            h: `<p>Here, ${c.desc}.</p>` },
          { t: 'Choose the most precise term',
            h: `<p class="mb-0">The sequence is <strong>${c.ans}</strong>. Every path is also a trail and a walk — the mark is for the most specific correct term.</p>` }
        ],
        answer: `It is ${c.ans}.`,
        pitfall: 'Trails restrict edges; paths restrict vertices. Mixing the two is the usual slip.',
        check: { type: 'choice', options, correct: options.indexOf(c.ans) }
      };
    }
  }
  ,
  {
    id: 'gn-route-planning', topicId: 'graphs-networks', tier: 'challenge', marks: 5,
    skill: 'Model a real route problem with Eulerian and Hamiltonian ideas',
    gen(rng) {
      const scenarios = [
        { who: 'a council street-sweeping crew', edgeThing: 'every street', vertexThing: 'every intersection', unit: 'streets' },
        { who: 'a postal contractor', edgeThing: 'every delivery road', vertexThing: 'every depot', unit: 'roads' },
        { who: 'a power-line inspector', edgeThing: 'every transmission line', vertexThing: 'every substation', unit: 'lines' },
        { who: 'a bus-route auditor', edgeThing: 'every road segment', vertexThing: 'every stop', unit: 'segments' }
      ];
      const s = rng.pick(scenarios);
      const target = rng.pick([0, 2, 4]);
      const n = rng.int(5, 6);
      let degs;
      for (;;) {
        degs = Array.from({ length: n }, () => rng.int(2, 5));
        if (degs.filter(d => d % 2).length === target) break;
      }
      const odd = degs.filter((d) => d % 2).length;
      const oddList = degs.map((d, i) => [d, i]).filter(([d]) => d % 2).map(([, i]) => `V${i + 1}`);
      const e = degs.reduce((a, b) => a + b, 0) / 2;
      const verdict = odd === 0
        ? `Yes. Every vertex has even degree, so an Eulerian circuit exists: the crew can start anywhere, cover ${s.edgeThing} exactly once, and finish back at the start.`
        : odd === 2
          ? `Partly. With exactly two odd vertices (${oddList.join(' and ')}) an open Eulerian trail exists, so ${s.edgeThing} can be covered once — but only by starting at one odd vertex and finishing at the other, not by returning to the depot.`
          : `No. With ${odd} odd vertices (${oddList.join(', ')}) neither an Eulerian circuit nor an open Eulerian trail exists, so some ${s.unit} must be repeated.`;
      return {
        prompt: `<p>${s.who.charAt(0).toUpperCase() + s.who.slice(1)} must travel along ${s.edgeThing} in a connected network of ${n} locations, ideally without repeating any.</p>
          ${table(['Vertex', ...degs.map((_, i) => `V${i + 1}`)], [['Degree', ...degs]])}
          <p class="mb-0">Determine whether the ideal route is possible, and explain why the problem of visiting ${s.vertexThing} once is a different question.</p>`,
        formulaIds: ['degree-sum'],
        steps: [
          { t: 'Identify which object the route must cover',
            h: `<p>The crew travels along ${s.edgeThing} — the <strong>edges</strong>. That makes this an <strong>Eulerian</strong> question, not a Hamiltonian one.</p>` },
          { t: 'Count the odd-degree vertices',
            h: `<p>Degrees ${degs.join(', ')} give <strong>${odd}</strong> odd vertices${oddList.length ? ` (${oddList.join(', ')})` : ''}.</p>` },
          { t: 'Apply the Eulerian conditions',
            h: `<p>${verdict}</p>` },
          { t: 'Size the network', formulaId: 'degree-sum',
            h: `<p>${math(`e <span class="op">=</span> ${frac('∑ degree', '2')} <span class="op">=</span> ${frac(e * 2, 2)} <span class="op">=</span> ${e}`)} — an ideal route would consist of exactly ${e} traversals${odd > 2 ? `, and any feasible route here must exceed that` : ''}.</p>` },
          { t: 'Separate the Hamiltonian question',
            h: `<p class="mb-0">Visiting ${s.vertexThing} exactly once is a <strong>Hamiltonian</strong> problem, about vertices rather than edges. There is no degree test for it: candidate cycles have to be constructed and compared. A graph can be Eulerian and not Hamiltonian, or the reverse.</p>` }
        ],
        answer: verdict,
        pitfall: 'Answering the Eulerian question with a Hamiltonian test, or assuming that "no Eulerian circuit" means no route at all — it only means some edges must be repeated.',
        check: { type: 'number', value: e, tol: 0.01, label: 'number of edges in the network' }
      };
    }
  }
];

/* ================================================================== TOPIC 09 */

export const networks1 = [
  {
    id: 'n1-tree-edges', topicId: 'networks-1', tier: 'skill', marks: 2,
    skill: 'Use the edge count of a tree',
    gen(rng) {
      const v = rng.int(6, 15);
      const extra = rng.int(3, 9);
      return {
        prompt: `<p>A connected network has <strong>${v} vertices</strong> and ${v - 1 + extra} edges.</p>
                 <p class="mb-0">How many edges does any spanning tree of this network have, and how many edges must be removed to obtain one?</p>`,
        formulaIds: ['tree-edges'],
        steps: [
          { t: 'Recall the property', formulaId: 'tree-edges',
            h: `<p>A tree is connected with no cycles, and on v vertices it always has exactly ${math('v <span class="op">−</span> 1')} edges. A spanning tree includes every vertex, so the same count applies.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`${v} <span class="op">−</span> 1 <span class="op">=</span> ${v - 1}`)} edges</p>` },
          { t: 'Find how many to remove',
            h: `<p class="mb-0">${math(`${v - 1 + extra} <span class="op">−</span> ${v - 1} <span class="op">=</span> ${extra}`)} edges must be removed, each one breaking a cycle without disconnecting the graph.</p>` }
        ],
        answer: `A spanning tree has ${v - 1} edges; ${extra} edges must be removed.`,
        pitfall: 'A tree cannot contain a cycle — a cycle would let you delete an edge and still stay connected, so the graph would not be minimal.',
        check: { type: 'number', value: v - 1, tol: 0.01, label: 'edges in a spanning tree' }
      };
    }
  },

  {
    id: 'n1-float', topicId: 'networks-1', tier: 'skill', marks: 2,
    skill: 'Calculate float',
    gen(rng) {
      const est = rng.int(3, 20);
      const fl = rng.pick([0, 2, 3, 4, 5, 6, 7]);
      const lst = est + fl;
      return {
        prompt: `<p>In a project network, an activity has ${math(`EST <span class="op">=</span> ${est}`)} days and ${math(`LST <span class="op">=</span> ${lst}`)} days.</p>
                 <p class="mb-0">Calculate its float and say what that means for the project.</p>`,
        formulaIds: ['float'],
        steps: [
          { t: 'Select the rule', formulaId: 'float',
            h: `<p>${math('float <span class="op">=</span> LST <span class="op">−</span> EST')} — the gap between the latest and earliest times the activity can start.</p>` },
          { t: 'Substitute',
            h: `<p>${math(`float <span class="op">=</span> ${lst} <span class="op">−</span> ${est} <span class="op">=</span> ${fl}`, `float equals ${lst} minus ${est} equals ${fl}`)} days</p>` },
          { t: 'Interpret',
            h: `<p class="mb-0">${fl === 0
              ? 'Zero float means the activity is <strong>critical</strong>: any delay at all pushes out the whole project, and it lies on the critical path.'
              : `The activity can start up to <strong>${fl} days</strong> late without delaying the project. It is <strong>not</strong> on the critical path.`}</p>` }
        ],
        answer: `Float = ${fl} days${fl === 0 ? ' — the activity is critical' : ''}.`,
        pitfall: 'Float is a property of a single activity. Delaying one activity by its full float can consume float shared with others.',
        check: { type: 'number', value: fl, tol: 0.01, label: 'float (days)' }
      };
    }
  },

  {
    id: 'n1-critical-path', topicId: 'networks-1', tier: 'apply', marks: 3,
    skill: 'Identify the critical path and project duration',
    gen(rng) {
      const routes = [
        { name: 'A–C–F', d: rng.int(12, 22) },
        { name: 'B–D–F', d: rng.int(12, 26) },
        { name: 'A–E–G', d: rng.int(12, 24) }
      ];
      const maxD = Math.max(...routes.map(r => r.d));
      const crit = routes.filter(r => r.d === maxD);
      return {
        prompt: `<p>Every activity in a project lies on one of three routes through the network:</p>
          ${table(['Route', ...routes.map(r => r.name)], [['Duration (days)', ...routes.map(r => r.d)]])}
          <p class="mb-0">State the critical path(s) and the minimum project duration.</p>`,
        formulaIds: ['float'],
        steps: [
          { t: 'Choose the longest, not the shortest',
            h: `<p>Every route must finish before the project finishes, so the project takes as long as the <strong>longest</strong> route. Shortest-path reasoning is the wrong tool here.</p>` },
          { t: 'Compare the routes',
            h: `<p>${routes.map(r => `${r.name}: ${r.d}`).join(' &nbsp;·&nbsp; ')} → the maximum is <strong>${maxD} days</strong>.</p>` },
          { t: 'Name the critical path(s)', formulaId: 'float',
            h: `<p>${crit.length > 1
              ? `Two routes tie at ${maxD} days: <strong>${crit.map(r => r.name).join(' and ')}</strong>. Both are critical, and every activity on either has zero float.`
              : `The critical path is <strong>${crit[0].name}</strong>, and each of its activities has zero float.`}</p>` },
          { t: 'State the duration',
            h: `<p class="mb-0">Minimum project duration = <strong>${maxD} days</strong>. Activities off the critical path carry float equal to ${maxD} minus their own route length.</p>` }
        ],
        answer: `Critical path${crit.length > 1 ? 's' : ''}: ${crit.map(r => r.name).join(' and ')}; minimum duration ${maxD} days.`,
        pitfall: 'A project can have more than one critical path. Ties must both be reported.',
        check: { type: 'number', value: maxD, tol: 0.01, label: 'minimum duration (days)' }
      };
    }
  },

  {
    id: 'n1-mst', topicId: 'networks-1', tier: 'apply', marks: 4,
    skill: 'Find a minimum spanning tree',
    gen(rng) {
      const edges = randomWeightedNetwork(rng);
      const mst = minimumSpanningTree(['A', 'B', 'C', 'D', 'E', 'F'], edges);
      const sorted = edges.slice().sort((a, b) => a.w - b.w);
      const chosen = new Set(mst.edges.map(e => e.a + e.b));
      return {
        prompt: `<p>The network shows the cost, in $1000s, of laying cable between six sites. Every site must be connected.</p>
          ${networkSvg(edges, [])}
          ${edgeTable(edges)}
          <p class="mb-0">Find a minimum spanning tree and state its total cost.</p>`,
        formulaIds: ['tree-edges'],
        steps: [
          { t: 'Know when to stop', formulaId: 'tree-edges',
            h: `<p>Six vertices means the tree needs exactly ${math('6 <span class="op">−</span> 1 <span class="op">=</span> 5')} edges. Stop as soon as you have five.</p>` },
          { t: 'Sort the edges and take them in order',
            h: `<p>Cheapest first, skipping any edge that would close a cycle:</p>
                ${table(['Edge', 'Weight', 'Action'], sorted.map(e => [
                  `${e.a}–${e.b}`, e.w, chosen.has(e.a + e.b) ? 'add' : 'skip — creates a cycle or not needed'
                ]))}` },
          { t: 'Read off the tree',
            h: `<p>Chosen edges: <strong>${mst.edges.map(e => `${e.a}–${e.b}`).join(', ')}</strong>. That is ${mst.edges.length} edges connecting all six sites with no cycle.</p>
                ${networkSvg(edges, mst.edges)}` },
          { t: 'Total the weights',
            h: `<p class="mb-0">${math(`${mst.edges.map(e => e.w).join(' <span class="op">+</span> ')} <span class="op">=</span> ${mst.weight}`, `total equals ${mst.weight}`)} → minimum cost <strong>$${mst.weight} 000</strong>.</p>` }
        ],
        answer: `MST: ${mst.edges.map(e => `${e.a}–${e.b}`).join(', ')}; total cost $${mst.weight} 000.`,
        pitfall: 'Taking the cheapest edge at every stage without checking for a cycle. An edge joining two already-connected vertices must be skipped.',
        check: { type: 'number', value: mst.weight, tol: 0.01, label: 'total weight of the MST' }
      };
    }
  },

  {
    id: 'n1-cpm-table', topicId: 'networks-1', tier: 'challenge', marks: 5,
    skill: 'Perform forward and backward scans',
    gen(rng) {
      const acts = [
        { name: 'A', dur: rng.int(3, 8), pred: [] },
        { name: 'B', dur: rng.int(4, 9), pred: [] },
        { name: 'C', dur: rng.int(2, 7), pred: ['A'] },
        { name: 'D', dur: rng.int(3, 8), pred: ['A'] },
        { name: 'E', dur: rng.int(2, 6), pred: ['B'] },
        { name: 'F', dur: rng.int(4, 9), pred: ['C', 'E'] },
        { name: 'G', dur: rng.int(2, 6), pred: ['D'] },
        { name: 'H', dur: rng.int(3, 7), pred: ['F', 'G'] }
      ];
      const cp = criticalPath(acts);
      const target = rng.pick(cp.activities.filter(a => a.float > 0)) || cp.activities[0];
      return {
        prompt: `<p>A project has these activities, in days.</p>
          ${table(['Activity', 'Duration', 'Immediate predecessors'],
            acts.map(a => [a.name, a.dur, a.pred.length ? a.pred.join(', ') : '—']))}
          <p class="mb-0">Determine the minimum project duration, the critical path, and the float of activity ${target.name}.</p>`,
        formulaIds: ['float'],
        steps: [
          { t: 'Forward scan for earliest start times',
            h: `<p>An activity can start only once every predecessor has finished, so ${math('EST <span class="op">=</span> max(EFT of predecessors)')} and ${math('EFT <span class="op">=</span> EST <span class="op">+</span> duration')}.</p>
                ${table(['Activity', 'Dur', 'EST', 'EFT'], cp.activities.map(a => [a.name, a.dur, a.est, a.eft]))}` },
          { t: 'Read the project duration',
            h: `<p>The project finishes when the last activity finishes: ${math(`<span class="op">=</span> ${cp.duration}`)} days.</p>` },
          { t: 'Backward scan for latest times',
            h: `<p>Start at ${cp.duration} days and work back: ${math('LFT <span class="op">=</span> min(LST of successors)')} and ${math('LST <span class="op">=</span> LFT <span class="op">−</span> duration')}.</p>
                ${table(['Activity', 'LST', 'LFT'], cp.activities.map(a => [a.name, a.lst, a.lft]))}` },
          { t: 'Calculate float and identify the critical path', formulaId: 'float',
            h: `<p>${math('float <span class="op">=</span> LST <span class="op">−</span> EST')}:</p>
                ${table(['Activity', ...cp.activities.map(a => a.name)], [['Float', ...cp.activities.map(a => a.float)]])}
                <p class="mb-0">Zero-float activities form the critical path: <strong>${cp.critical.join(' – ')}</strong>.</p>` },
          { t: 'Answer the specific question',
            h: `<p class="mb-0">Activity ${target.name} has ${math(`float <span class="op">=</span> ${target.lst} <span class="op">−</span> ${target.est} <span class="op">=</span> ${target.float}`)} days${target.float === 0 ? ', so it is critical' : ''}.</p>` }
        ],
        answer: `Duration ${cp.duration} days; critical path ${cp.critical.join('–')}; float of ${target.name} = ${target.float} days.`,
        pitfall: 'On the backward scan, LFT comes from the minimum of the successors\' LSTs — taking the maximum quietly destroys the critical path.',
        check: { type: 'number', value: cp.duration, tol: 0.01, label: 'minimum project duration (days)' }
      };
    }
  },

  {
    id: 'n1-crash', topicId: 'networks-1', tier: 'challenge', marks: 3,
    skill: 'Evaluate a change to an activity duration',
    gen(rng) {
      const fl = rng.int(3, 8);
      const cut = rng.int(1, 6);
      const dur = rng.int(cut + 1, 12);
      const critical = rng.bool(0.4);
      const effFloat = critical ? 0 : fl;
      return {
        prompt: `<p>An activity of ${dur} days has a float of <strong>${effFloat} days</strong>. A manager proposes shortening it by <strong>${cut} days</strong>.</p>
                 <p class="mb-0">Determine the effect on the minimum project duration, and justify your answer.</p>`,
        formulaIds: ['float'],
        steps: [
          { t: 'Decide whether the activity is critical', formulaId: 'float',
            h: `<p>Float is ${effFloat} days, so the activity ${effFloat === 0 ? '<strong>is</strong> on the critical path' : '<strong>is not</strong> on the critical path'}.</p>` },
          { t: 'Apply the rule that follows',
            h: `<p>${effFloat === 0
              ? 'Project duration is set by the longest path. Shortening a critical activity shortens that path.'
              : 'Project duration is set by the critical path, and this activity is not on it. Shortening it only increases its own slack.'}</p>` },
          { t: 'Work out the new duration',
            h: `<p>${effFloat === 0
              ? `Cutting ${cut} days from a critical activity reduces the project by up to <strong>${cut} days</strong> — but only until another path becomes the longest, at which point the saving stops.`
              : `Duration is <strong>unchanged</strong>. The activity's float simply rises from ${effFloat} to ${effFloat + cut} days.`}</p>` },
          { t: 'State the conclusion',
            h: `<p class="mb-0">${effFloat === 0
              ? `The project could finish up to ${cut} days earlier, provided no other path overtakes the current critical path. The critical path must be recalculated after the change.`
              : `The project still takes the same time. Resources spent shortening this activity buy nothing, because it was never controlling the finish date.`}</p>` }
        ],
        answer: effFloat === 0
          ? `Up to ${cut} days shorter, subject to another path becoming critical.`
          : 'No change — the activity is not on the critical path; its float rises instead.',
        pitfall: 'Assuming any speed-up helps. Only critical activities control the project duration — and only until the critical path shifts.',
        check: { type: 'open' }
      };
    }
  }
];

/* ================================================================== TOPIC 10 */

export const networks2 = [
  {
    id: 'n2-cut-capacity', topicId: 'networks-2', tier: 'skill', marks: 2,
    skill: 'Calculate the capacity of a cut',
    gen(rng) {
      const fwd = [rng.int(4, 15), rng.int(3, 14), rng.int(2, 12)];
      const back = rng.int(3, 9);
      const cap = fwd.reduce((a, b) => a + b, 0);
      return {
        prompt: `<p>A cut in a flow network is crossed by four arcs: three directed <strong>from the source side to the sink side</strong> with capacities ${fwd.join(', ')}, and one directed <strong>back</strong> towards the source with capacity ${back}.</p>
                 <p class="mb-0">Calculate the capacity of the cut.</p>`,
        formulaIds: ['max-flow-min-cut'],
        steps: [
          { t: 'Recall which arcs count',
            h: `<p>A cut's capacity counts only the arcs directed <strong>forward</strong> across it — from the source side towards the sink side. Backward arcs contribute nothing.</p>` },
          { t: 'Add the forward capacities',
            h: `<p>${math(`${fwd.join(' <span class="op">+</span> ')} <span class="op">=</span> ${cap}`, `${fwd.join(' plus ')} equals ${cap}`)}</p>` },
          { t: 'Discard the backward arc',
            h: `<p class="mb-0">The arc of capacity ${back} runs back towards the source, so it is excluded. Cut capacity = <strong>${cap}</strong>.</p>` }
        ],
        answer: `Cut capacity = ${cap}.`,
        pitfall: 'Adding every arc that crosses the cut. Direction decides inclusion.',
        check: { type: 'number', value: cap, tol: 0.01, label: 'cut capacity' }
      };
    }
  },

  {
    id: 'n2-min-cut', topicId: 'networks-2', tier: 'apply', marks: 3,
    skill: 'Determine maximum flow from minimum cut',
    gen(rng) {
      const cuts = [
        { name: 'Cut 1', arcs: [rng.int(5, 12), rng.int(4, 11), rng.int(3, 9)] },
        { name: 'Cut 2', arcs: [rng.int(6, 14), rng.int(5, 12)] },
        { name: 'Cut 3', arcs: [rng.int(4, 10), rng.int(3, 9), rng.int(2, 8)] }
      ].map(c => ({ ...c, cap: c.arcs.reduce((a, b) => a + b, 0) }));
      const min = Math.min(...cuts.map(c => c.cap));
      const winner = cuts.find(c => c.cap === min);
      return {
        prompt: `<p>Three cuts separating the source from the sink in a flow network have these forward-arc capacities.</p>
          ${table(['Cut', 'Forward arc capacities'], cuts.map(c => [c.name, c.arcs.join(' + ')]))}
          <p class="mb-0">Determine the capacity of each cut and the maximum possible flow through the network.</p>`,
        formulaIds: ['max-flow-min-cut'],
        steps: [
          { t: 'Total each cut',
            h: table(['Cut', ...cuts.map(c => c.name)], [['Capacity', ...cuts.map(c => c.cap)]]) },
          { t: 'Identify the minimum',
            h: `<p>The smallest capacity is <strong>${min}</strong>, at ${winner.name}.</p>` },
          { t: 'Apply max-flow min-cut', formulaId: 'max-flow-min-cut',
            h: `<p>All flow from source to sink must cross every cut, so no cut can pass more than its own capacity. The maximum flow is therefore limited by the <em>smallest</em> cut: ${math(`maximum flow <span class="op">=</span> ${min}`)}.</p>` },
          { t: 'Note what still needs proving',
            h: `<p class="mb-0">To confirm ${min} is actually achievable, exhibit a feasible flow of ${min} through the network. A cut gives the upper bound; a matching flow proves the bound is reached.</p>` }
        ],
        answer: `Minimum cut = ${winner.name} with capacity ${min}; maximum flow = ${min}.`,
        pitfall: 'Choosing the cut with the fewest arcs rather than the smallest total capacity.',
        check: { type: 'number', value: min, tol: 0.01, label: 'maximum flow' }
      };
    }
  },

  {
    id: 'n2-assignment-2x2', topicId: 'networks-2', tier: 'skill', marks: 2,
    skill: 'Find the optimum assignment by inspection',
    gen(rng) {
      const m = [[rng.int(3, 9), rng.int(3, 9)], [rng.int(3, 9), rng.int(3, 9)]];
      const diag = m[0][0] + m[1][1];
      const anti = m[0][1] + m[1][0];
      const best = Math.min(diag, anti);
      const which = diag <= anti ? 'X→1 and Y→2' : 'X→2 and Y→1';
      return {
        prompt: `<p>Two workers each complete one of two tasks. The table shows the time, in hours, each worker takes on each task.</p>
          ${table(['', 'Task 1', 'Task 2'], [['Worker X', m[0][0], m[0][1]], ['Worker Y', m[1][0], m[1][1]]])}
          <p class="mb-0">Determine the allocation that minimises the total time.</p>`,
        formulaIds: [],
        steps: [
          { t: 'List the valid allocations',
            h: `<p>Each worker takes exactly one task and each task goes to exactly one worker, so with two workers there are only two possibilities.</p>` },
          { t: 'Total each one',
            h: `<p>X→1, Y→2: ${math(`${m[0][0]} <span class="op">+</span> ${m[1][1]} <span class="op">=</span> ${diag}`)}<br>
                   X→2, Y→1: ${math(`${m[0][1]} <span class="op">+</span> ${m[1][0]} <span class="op">=</span> ${anti}`)}</p>` },
          { t: 'Choose the minimum',
            h: `<p class="mb-0">The smaller total is <strong>${best} hours</strong>, with <strong>${which}</strong>.</p>` }
        ],
        answer: `${which}, total ${best} hours.`,
        pitfall: 'Picking the smallest entry in the table first. That can force a very poor choice on the remaining row.',
        check: { type: 'number', value: best, tol: 0.01, label: 'minimum total time' }
      };
    }
  },

  {
    id: 'n2-assignment-3x3', topicId: 'networks-2', tier: 'apply', marks: 4,
    skill: 'Find a 3×3 optimum assignment by inspection',
    gen(rng) {
      const m = [0, 1, 2].map(() => [rng.int(3, 12), rng.int(3, 12), rng.int(3, 12)]);
      const best = bestAssignment(m, 'min');
      const names = ['A', 'B', 'C'];
      const rows = permutations([0, 1, 2]).map(p => [
        p.map((col, row) => `${names[row]}→${col + 1}`).join(', '),
        p.map((col, row) => m[row][col]).join(' + '),
        p.reduce((s, col, row) => s + m[row][col], 0)
      ]);
      return {
        prompt: `<p>Three staff must each be given one of three tasks. The table shows the time, in minutes, each would take.</p>
          ${table(['', 'Task 1', 'Task 2', 'Task 3'], names.map((n, i) => [n, ...m[i]]))}
          <p class="mb-0">Determine the assignment that minimises the total time.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Count the possibilities',
            h: `<p>With three staff and three tasks there are ${math('3! <span class="op">=</span> 6')} allocations — few enough to check every one.</p>` },
          { t: 'Total each allocation',
            h: table(['Allocation', 'Sum', 'Total'], rows) },
          { t: 'Select the minimum',
            h: `<p>The smallest total is <strong>${best.total} minutes</strong>, from <strong>${best.perm.map((c, r) => `${names[r]}→${c + 1}`).join(', ')}</strong>.</p>` },
          { t: 'Interpret in context',
            h: `<p class="mb-0">Assign ${best.perm.map((c, r) => `${names[r]} to Task ${c + 1}`).join(', ')}, for a combined ${best.total} minutes. Every staff member has exactly one task and every task exactly one person.</p>` }
        ],
        answer: `${best.perm.map((c, r) => `${names[r]}→Task ${c + 1}`).join(', ')}; total ${best.total} minutes.`,
        pitfall: 'Selecting two allocations from the same row or column. Each row and each column is used exactly once.',
        check: { type: 'number', value: best.total, tol: 0.01, label: 'minimum total time' }
      };
    }
  },

  {
    id: 'n2-max-convert', topicId: 'networks-2', tier: 'apply', marks: 3,
    skill: 'Convert a maximisation problem for Hungarian processing',
    gen(rng) {
      const m = [0, 1, 2].map(() => [rng.int(2, 18), rng.int(2, 18), rng.int(2, 18)]);
      const largest = Math.max(...m.flat());
      const conv = m.map(r => r.map(v => largest - v));
      const best = bestAssignment(m, 'max');
      const names = ['A', 'B', 'C'];
      return {
        prompt: `<p>Three sales staff are to be assigned to three regions. The table shows the profit, in $1000s, each would generate.</p>
          ${table(['', 'Region 1', 'Region 2', 'Region 3'], names.map((n, i) => [n, ...m[i]]))}
          <p class="mb-0">Convert the table so the Hungarian algorithm can be applied, then state the maximum total profit.</p>`,
        formulaIds: ['hungarian-convert'],
        steps: [
          { t: 'Recognise the problem type', formulaId: 'hungarian-convert',
            h: `<p>The Hungarian algorithm minimises. Profits must first be turned into costs, and the standard conversion subtracts every entry from the largest entry in the table.</p>` },
          { t: 'Find the largest entry',
            h: `<p>The largest profit is <strong>${largest}</strong>.</p>` },
          { t: 'Subtract every entry from it',
            h: `${table(['', 'Region 1', 'Region 2', 'Region 3'], names.map((n, i) => [n, ...conv[i]]))}
                <p class="mb-0">The best original entry becomes 0 — the cheapest cell in the converted table.</p>` },
          { t: 'Solve and convert back',
            h: `<p class="mb-0">Minimising the converted table gives ${best.perm.map((c, r) => `${names[r]}→Region ${c + 1}`).join(', ')}. Read the total from the <strong>original</strong> table: ${math(`${best.perm.map((c, r) => m[r][c]).join(' <span class="op">+</span> ')} <span class="op">=</span> ${best.total}`)}, i.e. $${best.total} 000.</p>` }
        ],
        answer: `Maximum profit $${best.total} 000 with ${best.perm.map((c, r) => `${names[r]}→Region ${c + 1}`).join(', ')}.`,
        pitfall: 'Reporting the converted total as the answer. The allocation comes from the converted table; the value comes from the original.',
        check: { type: 'number', value: best.total, tol: 0.01, label: 'maximum total profit ($1000s)' }
      };
    }
  },

  {
    id: 'n2-hungarian', topicId: 'networks-2', tier: 'challenge', marks: 5,
    skill: 'Apply the Hungarian algorithm',
    gen(rng) {
      const m = [0, 1, 2].map(() => [rng.int(4, 16), rng.int(4, 16), rng.int(4, 16)]);
      const { rowMins, afterRows, colMins, afterCols } = hungarianReduce(m);
      const best = bestAssignment(m, 'min');
      const names = ['A', 'B', 'C'];
      const zerosCoverable = afterCols.every(r => r.includes(0));
      return {
        prompt: `<p>Three machines must each be allocated one job. The table shows the set-up cost, in dollars.</p>
          ${table(['', 'Job 1', 'Job 2', 'Job 3'], names.map((n, i) => [n, ...m[i]]))}
          <p class="mb-0">Use the Hungarian algorithm to find the minimum-cost allocation.</p>`,
        formulaIds: [],
        steps: [
          { t: 'Row reduction',
            h: `<p>Subtract the smallest entry in each row from every entry in that row. Row minima: ${rowMins.join(', ')}.</p>
                ${table(['', 'Job 1', 'Job 2', 'Job 3'], names.map((n, i) => [n, ...afterRows[i]]))}
                <p class="text-muted mb-0">Subtracting a constant from a whole row changes every allocation total by the same amount, so the best allocation is unaffected.</p>` },
          { t: 'Column reduction',
            h: `<p>Now do the same down each column. Column minima: ${colMins.join(', ')}.</p>
                ${table(['', 'Job 1', 'Job 2', 'Job 3'], names.map((n, i) => [n, ...afterCols[i]]))}` },
          { t: 'Cover the zeros',
            h: `<p>Cover all zeros with the fewest possible horizontal and vertical lines. If that number equals ${math('n <span class="op">=</span> 3')}, an optimal allocation of independent zeros exists.</p>
                <p class="mb-0">${zerosCoverable
                  ? 'Here every row contains a zero, so proceed to selecting independent zeros.'
                  : 'If fewer than 3 lines suffice, subtract the smallest uncovered value from every uncovered entry, add it at each double-covered intersection, and repeat this step.'}</p>` },
          { t: 'Select independent zeros',
            h: `<p>Choose zeros so that no two share a row or a column. That gives <strong>${best.perm.map((c, r) => `${names[r]}→Job ${c + 1}`).join(', ')}</strong>.</p>` },
          { t: 'Cost the allocation from the original table',
            h: `<p class="mb-0">${math(`${best.perm.map((c, r) => m[r][c]).join(' <span class="op">+</span> ')} <span class="op">=</span> ${best.total}`, `total equals ${best.total}`)} → minimum total cost <strong>$${best.total}</strong>.</p>` }
        ],
        answer: `${best.perm.map((c, r) => `${names[r]}→Job ${c + 1}`).join(', ')}; minimum cost $${best.total}.`,
        pitfall: 'Stopping at the reduced table. The reductions locate the best allocation; the cost is always read from the original figures.',
        check: { type: 'number', value: best.total, tol: 0.01, label: 'minimum total cost ($)', unit: '$' }
      };
    }
  }
];
