/**
 * The ten QCAA General Mathematics Units 3 & 4 topics.
 * Content follows the study booklet: big idea, mastery targets, core knowledge,
 * formula/method bank, a worked example, and the errors that cost marks.
 */

export const TOPICS = [
  {
    id: 'bivariate-1',
    number: '01',
    unit: 'Unit 3 · Topic 1',
    title: 'Bivariate data analysis 1',
    chapter: 'Textbook Chapter 1 (pp. 1–60)',
    summary: 'Two-way tables, conditional percentages, scatterplots, and what r and R² actually tell you.',
    bigIdea: 'Two variables recorded for the same observational units. First identify whether each variable is categorical or numerical.',
    targets: [
      'Construct and percentage two-way frequency tables',
      'Compare conditional percentages to identify association',
      'Identify explanatory and response variables',
      'Describe scatterplots by direction, form and strength',
      "Interpret Pearson's r and the coefficient of determination R²",
      'Convert between r and R² with attention to the sign of r'
    ],
    knowledge: [
      { term: 'Bivariate data', text: 'Two variables recorded for the same observational units. First identify whether each variable is categorical or numerical.' },
      { term: 'Categorical association', text: 'Compare percentages within the groups created by the explanatory variable. A difference in conditional percentages is evidence of an association.' },
      { term: 'Numerical association', text: "Describe direction, form and strength. Pearson's r measures only linear association and lies between −1 and 1." },
      { term: 'Explained variation', text: 'R² × 100% is the percentage of variation in the response variable explained by the fitted linear relationship.' }
    ],
    bank: [
      { rule: 'R² = r²', formulaId: 'r-squared', use: 'Square r. If moving backwards from R² to r, use the sign shown by the association.' },
      { rule: 'percentage = part ÷ total × 100', use: 'Use the relevant row or column total, not the grand total, when making a conditional comparison.' }
    ],
    worked: {
      title: 'Association from a two-way table',
      steps: [
        'In a survey, 18 of 30 regional students and 12 of 40 metropolitan students travel at least 30 minutes.',
        'Regional percentage = 18 ÷ 30 × 100 = 60%.',
        'Metropolitan percentage = 12 ÷ 40 × 100 = 30%.',
        'Compare in context: regional students are 30 percentage points more likely to travel at least 30 minutes.'
      ],
      answer: 'The systematic difference supports an association between location and travel time.'
    },
    errors: [
      'Using the grand total instead of a group total',
      'Calling r = 0.9 a "90% correlation"',
      'Claiming causation from association',
      'Reporting R² without naming the response-variable variation'
    ]
  },

  {
    id: 'bivariate-2',
    number: '02',
    unit: 'Unit 3 · Topic 2',
    title: 'Bivariate data analysis 2',
    chapter: 'Textbook Chapter 2 (pp. 61–114)',
    summary: 'Fitting a least-squares line from summary statistics, reading residual plots, and predicting responsibly.',
    bigIdea: 'A linear model that minimises the sum of squared vertical residuals.',
    targets: [
      'Fit and use a least-squares line y = mx + c',
      'Calculate m from r, sx and sy and calculate c from the means',
      'Construct and interpret residual plots',
      'Interpret slope and intercept in context',
      'Distinguish interpolation from extrapolation',
      'Explain the dangers of extrapolation',
      'Distinguish association from causation and suggest lurking variables'
    ],
    knowledge: [
      { term: 'Least-squares line', text: 'A linear model that minimises the sum of squared vertical residuals.' },
      { term: 'Residual', text: 'Observed y − predicted y. A random horizontal band around zero supports a linear model; curvature suggests it is inappropriate.' },
      { term: 'Slope', text: 'The predicted change in the response for each one-unit increase in the explanatory variable.' },
      { term: 'Prediction', text: 'Interpolation is within the observed x-range. Extrapolation extends beyond it and is less reliable.' },
      { term: 'Causation', text: 'Association alone does not prove cause. Coincidence, reverse causation and lurking variables may explain the pattern.' }
    ],
    bank: [
      { rule: 'm = r(s_y ÷ s_x)', formulaId: 'slope', use: 'Build the least-squares slope from summary statistics.' },
      { rule: 'c = ȳ − m x̄', formulaId: 'intercept', use: 'The fitted line passes through (x̄, ȳ).' },
      { rule: 'residual = y − ŷ', formulaId: 'residual', use: 'A positive residual means the point lies above the fitted line.' }
    ],
    worked: {
      title: 'Build and use a least-squares model',
      steps: [
        'Given x̄ = 12, ȳ = 47, s_x = 3, s_y = 9 and r = 0.80.',
        'm = 0.80 × (9 ÷ 3) = 2.4.',
        'c = 47 − 2.4 × 12 = 18.2, so ŷ = 2.4x + 18.2.',
        'At x = 14, ŷ = 51.8. Interpret the slope: each extra x-unit predicts 2.4 more y-units.'
      ],
      answer: 'ŷ = 2.4x + 18.2; predicted y = 51.8.'
    },
    errors: [
      'Reversing observed and predicted values in a residual',
      'Interpreting an intercept that is outside the meaningful domain',
      'Treating an extrapolated value as certain',
      'Saying "x causes y" without experimental evidence'
    ]
  },

  {
    id: 'time-series',
    number: '03',
    unit: 'Unit 3 · Topic 3',
    title: 'Time series analysis',
    chapter: 'Textbook Chapter 3 (pp. 115–173)',
    summary: 'Smoothing, seasonal indices, deseasonalising, and forecasts you can defend.',
    bigIdea: 'The long-term direction after short-term movement is smoothed.',
    targets: [
      'Construct and interpret time series plots',
      'Identify trend, seasonality and irregular fluctuation',
      'Calculate odd-order moving means and moving medians',
      'Calculate seasonal indices using the average percentage method',
      'Deseasonalise observed values',
      'Fit a trend model and forecast cautiously',
      'Solve practical time-series problems'
    ],
    knowledge: [
      { term: 'Trend', text: 'The long-term direction after short-term movement is smoothed.' },
      { term: 'Seasonality', text: 'A repeating calendar-related pattern with a fixed period.' },
      { term: 'Irregular fluctuation', text: 'Unsystematic movement that is not trend or seasonality.' },
      { term: 'Smoothing', text: 'An odd moving mean or median is centred on the middle time point.' },
      { term: 'Seasonal index', text: 'A multiplicative factor: above 1 means typically above trend; below 1 means below trend. The indices for one full cycle sum to the number of seasons.' },
      { term: 'Deseasonalising', text: 'Remove seasonality before fitting a trend: actual ÷ seasonal index.' }
    ],
    bank: [
      { rule: 'moving mean = sum ÷ number of terms', formulaId: 'moving-average', use: 'Use an odd number of terms so the value centres on an actual time point.' },
      { rule: 'seasonal index = actual ÷ seasonal average', formulaId: 'seasonal-index', use: 'Average the seasonal relatives for each season.' },
      { rule: 'deseasonalised = actual ÷ seasonal index', formulaId: 'deseasonalise', use: 'Removes the multiplicative seasonal effect.' },
      { rule: 'forecast = trend forecast × seasonal index', formulaId: 'reseasonalise', use: 'Restores seasonality to a trend prediction.' },
      { rule: 'y = mx + c', formulaId: 'linear-equation', use: 'Fit the trend line to deseasonalised data, then reseasonalise the prediction.' }
    ],
    worked: {
      title: 'Seasonal index and forecast',
      steps: [
        'Quarter 3 sales are $84 000 and the annual quarterly average is $40 000.',
        'Seasonal relative = 84 000 ÷ 40 000 = 2.10.',
        'If the fitted trend predicts $43 000 for a future Q3, reseasonalise: 43 000 × 2.10.',
        'State that the result assumes the trend and seasonal pattern continue.'
      ],
      answer: 'Forecast Q3 sales = $90 300.'
    },
    errors: [
      'Using calendar repetition as "trend"',
      'Placing a moving average at the first time point',
      'Multiplying when deseasonalising',
      'Forecasting without a reasonableness statement'
    ]
  },

  {
    id: 'sequences',
    number: '04',
    unit: 'Unit 3 · Topic 4',
    title: 'Growth and decay in sequences',
    chapter: 'Textbook Chapter 4 (pp. 174–234)',
    summary: 'Arithmetic and geometric sequences, recurrences, and depreciation models.',
    bigIdea: 'Arithmetic adds the same difference each step; geometric multiplies by the same ratio. Both graph as discrete points.',
    targets: [
      'Generate arithmetic and geometric sequences recursively',
      'Identify the common difference or common ratio',
      'Use nth-term rules',
      'Connect arithmetic sequences to discrete linear change',
      'Connect geometric sequences to discrete exponential change',
      'Model practical growth and depreciation',
      'Interpret term number carefully in context'
    ],
    knowledge: [
      { term: 'Arithmetic', text: 'Add the same difference d each step. Graphs form discrete points on a straight line.' },
      { term: 'Geometric', text: 'Multiply by the same ratio r each step. Growth has r > 1; decay has 0 < r < 1.' },
      { term: 'Recurrence', text: 'Defines each new term from the previous term and needs a starting value.' },
      { term: 'Explicit rule', text: 'Finds any term directly. Check whether the initial value corresponds to t₀ or t₁.' }
    ],
    bank: [
      { rule: 'tₙ = t₁ + (n − 1)d', formulaId: 'arithmetic', use: 'Arithmetic nth term.' },
      { rule: 'tₙ = t₁ r^(n−1)', formulaId: 'geometric', use: 'Geometric nth term.' },
      { rule: 'tₙ₊₁ = tₙ + d', formulaId: 'arith-recurrence', use: 'Arithmetic recurrence.' },
      { rule: 'tₙ₊₁ = r tₙ', formulaId: 'geom-recurrence', use: 'Geometric recurrence.' }
    ],
    worked: {
      title: 'Diminishing-value depreciation',
      steps: [
        'A machine is worth $48 000 at the end of year 1 and loses 18% of its value each year.',
        'The retained proportion is r = 1 − 0.18 = 0.82.',
        'Model: tₙ = 48 000(0.82)^(n−1).',
        'At the end of year 6: t₆ = 48 000(0.82)⁵.'
      ],
      answer: 't₆ ≈ $17 795.'
    },
    errors: [
      'Using 18 instead of 0.18',
      'Using n instead of n − 1 when t₁ is given',
      'Calling repeated percentage change arithmetic',
      'Forgetting that the graph is discrete'
    ]
  },

  {
    id: 'earth-geometry',
    number: '05',
    unit: 'Unit 3 · Topic 5',
    title: 'Earth geometry and time zones',
    chapter: 'Textbook Chapter 5 (pp. 235–269)',
    summary: 'Great-circle distances along meridians and parallels, UTC offsets, and travel across dates.',
    bigIdea: 'Latitude is measured north/south of the equator; longitude east/west of the prime meridian.',
    targets: [
      'Interpret latitude and longitude in decimal degrees and degrees/minutes',
      'Identify great circles and meridians',
      'Calculate same-meridian distances',
      'Calculate same-parallel distances',
      'Use GMT/UTC offsets and the International Date Line',
      'Connect longitude difference and time difference',
      'Allow for daylight saving',
      'Solve itinerary and travel problems across dates'
    ],
    knowledge: [
      { term: 'Coordinates', text: 'Latitude is measured north/south of the equator; longitude east/west of the prime meridian.' },
      { term: 'Same meridian', text: 'Distance depends on the latitude difference only.' },
      { term: 'Same parallel', text: 'Scale the east-west distance by cos(latitude).' },
      { term: 'Time', text: '15° of longitude corresponds to one hour. UTC offsets can be compared by destination minus origin.' },
      { term: 'Date changes', text: 'Track the day when crossing midnight and check any daylight-saving information supplied in the question.' }
    ],
    bank: [
      { rule: 'D = 111.2 × angular distance', formulaId: 'meridian-distance', use: 'Same meridian; D in kilometres.' },
      { rule: 'D = 111.2 cos θ × angular distance', formulaId: 'parallel-distance', use: 'Same parallel at latitude θ.' },
      { rule: 'time difference = longitude difference ÷ 15', formulaId: 'time-longitude', use: 'The ideal solar-time relationship.' }
    ],
    worked: {
      title: 'Distance along a parallel',
      steps: [
        'Locations are at 28°S, 146°E and 28°S, 153°E.',
        'Angular distance = 153 − 146 = 7°.',
        'D = 111.2 × cos(28°) × 7.',
        'Round only at the end and attach kilometres.'
      ],
      answer: 'D ≈ 687 km.'
    },
    errors: [
      'Adding N/S or E/W values incorrectly',
      'Using the same-meridian formula on a parallel',
      'Leaving the calculator in radians instead of degrees',
      'Ignoring a day change or daylight saving'
    ]
  },

  {
    id: 'finance-1',
    number: '06',
    unit: 'Unit 4 · Topic 1',
    title: 'Loans, investments and annuities 1',
    chapter: 'Textbook Chapter 7 (pp. 303–369)',
    summary: 'Compound interest, effective rates, reducing-balance loans and present-value annuities.',
    bigIdea: 'The interest rate i and the number of periods n must use the same time unit.',
    targets: [
      'Model compound growth with a recurrence and the compound-interest formula',
      'Convert annual nominal rates to period rates',
      'Calculate effective annual interest',
      'Compare compounding arrangements',
      'Model reducing-balance loans',
      'Use the present-value annuity formula',
      'Find repayments, total payments and total interest',
      'State financial answers with correct timing and rounding'
    ],
    knowledge: [
      { term: 'Period matching', text: 'The interest rate i and number of periods n must use the same time unit.' },
      { term: 'Effective annual rate', text: 'Converts a nominal compounded rate to the actual one-year growth rate.' },
      { term: 'Reducing-balance loan', text: 'Interest is added before the end-of-period repayment in the syllabus recurrence.' },
      { term: 'Present-value annuity', text: 'The value now of a stream of equal future end-of-period payments.' }
    ],
    bank: [
      { rule: 'A = P(1 + i)ⁿ', formulaId: 'compound-interest', use: 'Compound interest.' },
      { rule: 'i_effective = (1 + i)^k − 1', formulaId: 'effective-rate', use: 'k compounding periods per year.' },
      { rule: 'Aₙ₊₁ = (1 + i)Aₙ − d', formulaId: 'loan-recurrence', use: 'Reducing-balance loan recurrence.' },
      { rule: 'A_PV = d[1 − (1 + i)⁻ⁿ] ÷ i', formulaId: 'annuity-pv', use: 'Present value of an ordinary annuity.' }
    ],
    worked: {
      title: 'Monthly loan recurrence',
      steps: [
        'A $28 000 loan charges 6.0% p.a. compounded monthly and requires $620 monthly repayments.',
        'Monthly rate i = 0.06 ÷ 12 = 0.005; multiplier = 1.005.',
        'A₀ = 28 000 and Aₙ₊₁ = 1.005Aₙ − 620.',
        'A₁ = 1.005 × 28 000 − 620 = 27 520; A₂ = 1.005 × 27 520 − 620.'
      ],
      answer: 'A₂ = $27 037.60.'
    },
    errors: [
      'Using 6 instead of 0.06',
      'Failing to divide the rate by the compounding frequency',
      'Subtracting the repayment before interest when the model says otherwise',
      'Rounding every intermediate balance'
    ]
  },

  {
    id: 'finance-2',
    number: '07',
    unit: 'Unit 4 · Topic 2',
    title: 'Loans, investments and annuities 2',
    chapter: 'Textbook Chapter 8 (pp. 370–421)',
    summary: 'Future-value annuities, interest earned on a savings plan, and perpetuities.',
    bigIdea: 'Equal end-of-period deposits accumulate with interest.',
    targets: [
      'Model a future-value annuity recursively',
      'Use the future-value annuity formula',
      'Determine contributions, accumulated value and interest',
      'Use the perpetuity formula',
      'Solve for payment, principal or periodic rate',
      'Distinguish present value, future value and perpetuity contexts'
    ],
    knowledge: [
      { term: 'Future-value annuity', text: 'Equal end-of-period deposits accumulate with interest.' },
      { term: 'Recurrence timing', text: 'For the syllabus model, interest is applied before the new deposit is added.' },
      { term: 'Perpetuity', text: 'A fund designed so its periodic interest supports an indefinite payment without reducing the principal.' },
      { term: 'Context choice', text: 'PV: the value now of repayments. FV: accumulated deposits. Perpetuity: a payment funded by interest indefinitely.' }
    ],
    bank: [
      { rule: 'Aₙ₊₁ = (1 + i)Aₙ + d', formulaId: 'annuity-recurrence', use: 'Future-value ordinary annuity recurrence.' },
      { rule: 'A_FV = d[(1 + i)ⁿ − 1] ÷ i', formulaId: 'annuity-fv', use: 'Future value after n deposits.' },
      { rule: 'A = d ÷ i', formulaId: 'perpetuity', use: 'Value of a perpetuity.' }
    ],
    worked: {
      title: 'Perpetuity payment',
      steps: [
        'A scholarship fund contains $240 000 and earns 4.2% p.a. paid monthly.',
        'Monthly rate i = 0.042 ÷ 12 = 0.0035.',
        'For A = d ÷ i, rearrange to d = Ai.',
        'd = 240 000 × 0.0035.'
      ],
      answer: 'Monthly scholarship payment = $840.'
    },
    errors: [
      'Using an annual rate with a monthly payment',
      'Confusing total deposits with interest earned',
      'Using the PV annuity formula for a savings plan',
      'Assuming perpetuity payments reduce the principal'
    ]
  },

  {
    id: 'graphs-networks',
    number: '08',
    unit: 'Unit 4 · Topic 3',
    title: 'Graphs and networks',
    chapter: 'Textbook Chapter 9 (pp. 422–485)',
    summary: 'Graph vocabulary, adjacency matrices, planarity, Eulerian and Hamiltonian conditions, shortest paths.',
    bigIdea: 'Vertices represent objects; edges represent connections. Loops and multiple edges affect whether a graph is simple.',
    targets: [
      'Use graph and network terminology accurately',
      'Construct graphs and digraphs from contexts',
      'Construct and interpret adjacency matrices',
      "Apply Euler's planar formula",
      'Distinguish walks, trails, paths, circuits and cycles',
      'Identify bridges and connectedness',
      'Solve shortest-path problems by trial and error',
      'Test Eulerian and Hamiltonian conditions'
    ],
    knowledge: [
      { term: 'Graph language', text: 'Vertices represent objects; edges represent connections. Loops and multiple edges affect whether a graph is simple.' },
      { term: 'Adjacency matrix', text: 'Each entry records the number/direction of edges. Undirected simple graphs give symmetric matrices with a zero diagonal.' },
      { term: 'Planar graph', text: 'Can be redrawn without edge crossings. Faces include the exterior region.' },
      { term: 'Eulerian', text: 'Uses every edge exactly once. Circuit: all degrees even. Open trail: exactly two odd vertices.' },
      { term: 'Hamiltonian', text: 'Visits every vertex exactly once; there is no simple degree-only test.' },
      { term: 'Shortest path', text: 'Compare plausible routes and total weights; state the route as well as the weight.' }
    ],
    bank: [
      { rule: 'v + f − e = 2', formulaId: 'euler', use: "Euler's formula for a connected planar graph." },
      { rule: '∑ degree = 2e', formulaId: 'degree-sum', use: 'A useful check for undirected graphs.' }
    ],
    worked: {
      title: 'Eulerian classification',
      steps: [
        'A connected graph has vertex degrees 2, 4, 3, 3 and 2.',
        'Count odd vertices: exactly two (the two degree-3 vertices).',
        'A connected graph with exactly two odd vertices has an open Eulerian trail.',
        'It cannot have an Eulerian circuit because not all degrees are even.'
      ],
      answer: 'The graph is semi-Eulerian; the trail starts and ends at the odd vertices.'
    },
    errors: [
      'Counting a crossing as a vertex when it is not marked',
      'Forgetting the outside face',
      'Confusing Eulerian (edges) with Hamiltonian (vertices)',
      'Giving a distance without the route'
    ]
  },

  {
    id: 'networks-1',
    number: '09',
    unit: 'Unit 4 · Topic 4',
    title: 'Networks and decision mathematics 1',
    chapter: 'Textbook Chapter 10 (pp. 486–554)',
    summary: 'Spanning trees, minimum spanning trees, project networks, forward and backward scans, float.',
    bigIdea: 'A tree is a connected graph with no cycles. With v vertices, a tree has v − 1 edges.',
    targets: [
      'Identify trees and spanning trees',
      'Find a minimum spanning tree',
      'Construct activity-on-arc project networks',
      'Perform forward and backward scans',
      'Determine EST and LST',
      'Identify the critical path and project duration',
      'Calculate float',
      'Evaluate changes to activity duration'
    ],
    knowledge: [
      { term: 'Tree', text: 'A connected graph with no cycles. With v vertices, a tree has v − 1 edges.' },
      { term: 'Minimum spanning tree', text: 'Connects every vertex with the smallest total weight and no cycles.' },
      { term: 'Project network', text: 'Activities are arcs; vertices mark events. Prerequisites control placement.' },
      { term: 'Forward scan', text: 'Finds earliest event times and the minimum project duration.' },
      { term: 'Backward scan', text: 'Works back from the project duration to latest event times.' },
      { term: 'Float', text: 'Time an activity can be delayed without delaying the project. Critical activities have zero float.' }
    ],
    bank: [
      { rule: 'float = LST − EST', formulaId: 'float', use: 'For an activity once start times are known.' },
      { rule: 'tree edges = v − 1', formulaId: 'tree-edges', use: 'A necessary property of any tree.' }
    ],
    worked: {
      title: 'Critical path',
      steps: [
        'Two project routes have durations A–C–F = 18 days and B–D–F = 23 days.',
        'The project cannot finish before all required routes finish.',
        'The longest path controls the minimum completion time.',
        'Activities on that longest route have zero float unless another equally long path exists.'
      ],
      answer: 'Critical path B–D–F; minimum duration 23 days.'
    },
    errors: [
      'Using the shortest path instead of the longest path for critical path analysis',
      'Adding an edge to a spanning tree that creates a cycle',
      'Choosing locally shortest edges without checking connectivity',
      'Changing a non-critical activity and assuming the project duration changes'
    ]
  },

  {
    id: 'networks-2',
    number: '10',
    unit: 'Unit 4 · Topic 5',
    title: 'Networks and decision mathematics 2',
    chapter: 'Textbook Chapter 11 (pp. 555–590)',
    summary: 'Flow networks, cuts, max-flow min-cut, and assignment by inspection or the Hungarian algorithm.',
    bigIdea: 'Directed capacities limit how much can move from source to sink.',
    targets: [
      'Identify source, sink, cut, capacity and flow',
      'Determine the minimum cut and maximum flow',
      'Solve small flow networks systematically',
      'Represent allocation with bipartite graphs and matrices',
      'Find small optimum assignments by inspection',
      'Apply the Hungarian algorithm for minimum assignments',
      'Convert maximisation problems for Hungarian processing',
      'Interpret the optimum assignment in context'
    ],
    knowledge: [
      { term: 'Flow network', text: 'Directed capacities limit how much can move from source to sink.' },
      { term: 'Cut', text: 'A partition separating source and sink. Cut capacity is the total capacity of the forward arcs crossing the cut.' },
      { term: 'Max-flow / min-cut', text: 'The maximum feasible flow equals the capacity of a minimum cut.' },
      { term: 'Assignment', text: 'Match each agent to exactly one task, and each task to exactly one agent.' },
      { term: 'Hungarian algorithm', text: 'Reduce rows and columns, cover zeros with the minimum number of lines, adjust if needed, then select independent zeros.' },
      { term: 'Maximisation', text: 'Convert profits or scores to costs, commonly by subtracting every entry from the largest entry.' }
    ],
    bank: [
      { rule: 'maximum flow = minimum cut capacity', formulaId: 'max-flow-min-cut', use: 'After a feasible flow and a matching cut are established.' },
      { rule: 'converted cost = largest entry − original', formulaId: 'hungarian-convert', use: 'The standard maximisation conversion for Hungarian assignment.' }
    ],
    worked: {
      title: 'Assignment by inspection',
      steps: [
        'Three staff have task times A: 6, 8, 9; B: 7, 5, 8; C: 9, 7, 4.',
        'Select exactly one entry in every row and every column.',
        'The diagonal assignment A→1, B→2, C→3 gives 6 + 5 + 4 = 15.',
        'Compare the plausible alternatives; all are larger.'
      ],
      answer: 'Minimum total time = 15 units with A→1, B→2, C→3.'
    },
    errors: [
      'Adding backward arcs to a cut capacity',
      'Claiming a cut is minimum without comparing feasible cuts',
      'Selecting two assignments from the same row or column',
      'Forgetting to convert back to the original maximisation context'
    ]
  }
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

/** The 7-day revision cycle recommended by the study booklet. */
export const REVISION_CYCLE = [
  { day: 'Day 1', focus: 'Bivariate data 1 & 2', action: 'Diagnose, then work the topic questions' },
  { day: 'Day 2', focus: 'Time series + sequences', action: 'Practice ladder and corrections' },
  { day: 'Day 3', focus: 'Earth geometry + finance 1', action: 'Timed mixed set' },
  { day: 'Day 4', focus: 'Finance 2 + graphs', action: 'Practice ladder and topic questions' },
  { day: 'Day 5', focus: 'Trees/CPA + flow/assignment', action: 'Timed Paper 2 focus' },
  { day: 'Day 6', focus: 'Full mixed paper', action: 'Exam conditions, no notes' },
  { day: 'Day 7', focus: 'Error-driven retrieval', action: 'Redo missed skills only' }
];

/** How to study, from the booklet's six-step cycle. */
export const STUDY_CYCLE = [
  { title: 'Diagnose', text: 'Tick only the skills you can complete without help. Be honest — the list is for you.' },
  { title: 'Rebuild', text: 'Read the key ideas and cover the worked example before trying it yourself.' },
  { title: 'Practise', text: 'Move from Skill to Apply to Challenge. Show mathematical reasoning, not just a number.' },
  { title: 'Test', text: 'Attempt a mixed set against a timer with no notes but the formula sheet.' },
  { title: 'Correct', text: 'Compare with the worked steps. Record why the error happened, not just what it was.' },
  { title: 'Retrieve', text: 'Return 48 hours later and redo one missed item from memory.' }
];
