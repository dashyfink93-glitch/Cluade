/**
 * The complete QCAA General Mathematics 2025 formula book, transcribed.
 * Source: Formula book — General Mathematics 2025, © State of Queensland (QCAA) 2025,
 * licensed CC BY 4.0. Each entry adds a plain-English "when and how to use it" note
 * and the Units 3 & 4 topics it belongs to.
 *
 *   id       stable key referenced by questions and topics
 *   section  formula-book section heading
 *   name     the label used in the formula book
 *   expr     display markup (see lib/mathml.js helpers for the conventions)
 *   aria     spoken form for screen readers
 *   use      how and when to reach for it
 *   topics   topic ids that examine it
 */

export const FORMULA_SECTIONS = [
  { id: 'data', title: 'Data', blurb: 'Bivariate analysis, least-squares lines and outliers.' },
  { id: 'sequences', title: 'Sequences', blurb: 'Arithmetic and geometric nth-term rules.' },
  { id: 'finance', title: 'Finance', blurb: 'Interest, loans, annuities and perpetuities.' },
  { id: 'earth', title: 'Earth geometry', blurb: 'Great-circle distances on the Earth.' },
  { id: 'networks', title: 'Graphs and networks', blurb: "Euler's planar formula." },
  { id: 'trig', title: 'Trigonometry', blurb: 'Right-angled and non-right-angled triangles.' },
  { id: 'mensuration', title: 'Mensuration', blurb: 'Perimeter, area, surface area and volume.' },
  { id: 'shape', title: 'Shape and measurement', blurb: "Sectors and Heron's rule." }
];

export const FORMULAS = [
  /* ---------------- Data ---------------- */
  {
    id: 'mean', section: 'data', name: 'mean',
    expr: '<span class="math"><span style="text-decoration:overline">x</span> <span class="op">=</span> <span class="frac"><span class="num">∑x</span><span class="den">n</span></span></span>',
    aria: 'x bar equals the sum of x divided by n',
    use: 'Add every value, then divide by how many values there are.',
    topics: ['bivariate-1', 'time-series']
  },
  {
    id: 'median', section: 'data', name: 'median',
    expr: '<span class="math"><span class="frac"><span class="num">n <span class="op">+</span> 1</span><span class="den">2</span></span> th data value</span>',
    aria: 'the n plus 1 over 2 th data value',
    use: 'Order the data first. With an even n the median sits between the two middle values.',
    topics: ['time-series']
  },
  {
    id: 'linear-equation', section: 'data', name: 'linear equation',
    expr: '<span class="math">y <span class="op">=</span> mx <span class="op">+</span> c</span>',
    aria: 'y equals m x plus c',
    use: 'The least-squares line. m is the predicted change in y per one-unit rise in x; c is the value of y when x = 0.',
    topics: ['bivariate-2', 'time-series']
  },
  {
    id: 'slope', section: 'data', name: 'slope',
    expr: '<span class="math">m <span class="op">=</span> r <span class="frac"><span class="num">s<sub>y</sub></span><span class="den">s<sub>x</sub></span></span></span>',
    aria: 'm equals r times s sub y over s sub x',
    use: 'Builds the least-squares slope from summary statistics. The slope keeps the sign of r.',
    topics: ['bivariate-2']
  },
  {
    id: 'intercept', section: 'data', name: 'y-intercept',
    expr: '<span class="math">c <span class="op">=</span> <span style="text-decoration:overline">y</span> <span class="op">−</span> m<span style="text-decoration:overline">x</span></span>',
    aria: 'c equals y bar minus m times x bar',
    use: 'Use after finding m. It forces the line through the point of means, (x̄, ȳ).',
    topics: ['bivariate-2']
  },
  {
    id: 'seasonal-index', section: 'data', name: 'seasonal index (derived)',
    expr: '<span class="math">seasonal index <span class="op">=</span> <span class="frac"><span class="num">actual value</span><span class="den">seasonal average</span></span></span>',
    aria: 'seasonal index equals the actual value divided by the seasonal average',
    use: 'Average the relatives for each season. Across one full cycle the indices sum to the number of seasons — 4 for quarterly data, 12 for monthly.',
    topics: ['time-series'], derived: true
  },
  {
    id: 'deseasonalise', section: 'data', name: 'deseasonalising (derived)',
    expr: '<span class="math">deseasonalised <span class="op">=</span> <span class="frac"><span class="num">actual value</span><span class="den">seasonal index</span></span></span>',
    aria: 'deseasonalised equals the actual value divided by the seasonal index',
    use: 'Seasonality is multiplicative, so you remove it by dividing. Multiplying does the opposite — it reseasonalises.',
    topics: ['time-series'], derived: true
  },
  {
    id: 'reseasonalise', section: 'data', name: 'seasonal forecast (derived)',
    expr: '<span class="math">forecast <span class="op">=</span> trend forecast <span class="op">×</span> seasonal index</span>',
    aria: 'forecast equals the trend forecast multiplied by the seasonal index',
    use: 'Fit the trend to deseasonalised data, predict, then put the seasonality back. Always add a statement about the assumptions the forecast rests on.',
    topics: ['time-series'], derived: true
  },
  {
    id: 'moving-average', section: 'data', name: 'moving average (derived)',
    expr: '<span class="math">moving mean <span class="op">=</span> <span class="frac"><span class="num">sum of the window</span><span class="den">number of terms</span></span></span>',
    aria: 'moving mean equals the sum of the window divided by the number of terms',
    use: 'Use an odd number of terms so the smoothed value sits on an actual time point — the centre of the window, never its first value.',
    topics: ['time-series'], derived: true
  },
  {
    id: 'outliers', section: 'data', name: 'outliers (identifying)',
    expr: '<span class="math">Q<sub>1</sub> <span class="op">−</span> 1.5 <span class="op">×</span> IQR <span class="op">≤</span> x <span class="op">≤</span> Q<sub>3</sub> <span class="op">+</span> 1.5 <span class="op">×</span> IQR</span>',
    aria: 'Q one minus 1.5 times I Q R is less than or equal to x is less than or equal to Q three plus 1.5 times I Q R',
    use: 'Any value outside this interval is an outlier. IQR = Q₃ − Q₁.',
    topics: ['bivariate-1', 'time-series']
  },
  {
    id: 'r-squared', section: 'data', name: 'coefficient of determination (derived)',
    expr: '<span class="math">R<sup>2</sup> <span class="op">=</span> r<sup>2</sup></span>',
    aria: 'R squared equals r squared',
    use: 'R² × 100% is the percentage of variation in the response variable explained by the linear relationship. Going backwards, take the sign of r from the direction of the association.',
    topics: ['bivariate-1', 'bivariate-2'],
    derived: true
  },
  {
    id: 'residual', section: 'data', name: 'residual (derived)',
    expr: '<span class="math">residual <span class="op">=</span> y <span class="op">−</span> ŷ</span>',
    aria: 'residual equals y minus y hat',
    use: 'Observed minus predicted. A positive residual means the point sits above the fitted line.',
    topics: ['bivariate-2'],
    derived: true
  },

  /* ---------------- Sequences ---------------- */
  {
    id: 'arithmetic', section: 'sequences', name: 'arithmetic sequence',
    expr: '<span class="math">t<sub>n</sub> <span class="op">=</span> t<sub>1</sub> <span class="op">+</span> (n <span class="op">−</span> 1)d</span>',
    aria: 't sub n equals t sub 1 plus open bracket n minus 1 close bracket times d',
    use: 'Adds a constant d each step. Check whether the value you were given is t₁ or t₀ before substituting n.',
    topics: ['sequences']
  },
  {
    id: 'geometric', section: 'sequences', name: 'geometric sequence',
    expr: '<span class="math">t<sub>n</sub> <span class="op">=</span> t<sub>1</sub> r<sup>(n <span class="op">−</span> 1)</sup></span>',
    aria: 't sub n equals t sub 1 times r to the power of n minus 1',
    use: 'Multiplies by a constant r each step. Growth has r > 1; decay has 0 < r < 1.',
    topics: ['sequences']
  },
  {
    id: 'arith-recurrence', section: 'sequences', name: 'arithmetic recurrence (derived)',
    expr: '<span class="math">t<sub>n+1</sub> <span class="op">=</span> t<sub>n</sub> <span class="op">+</span> d</span>',
    aria: 't sub n plus 1 equals t sub n plus d',
    use: 'A recurrence always needs its starting value stated alongside it.',
    topics: ['sequences'], derived: true
  },
  {
    id: 'geom-recurrence', section: 'sequences', name: 'geometric recurrence (derived)',
    expr: '<span class="math">t<sub>n+1</sub> <span class="op">=</span> r t<sub>n</sub></span>',
    aria: 't sub n plus 1 equals r times t sub n',
    use: 'For a p% decrease each period, r = 1 − p/100; for a p% increase, r = 1 + p/100.',
    topics: ['sequences'], derived: true
  },

  /* ---------------- Finance ---------------- */
  {
    id: 'simple-interest', section: 'finance', name: 'simple interest',
    expr: '<span class="math">I <span class="op">=</span> Pin</span>',
    aria: 'I equals P times i times n',
    use: 'Interest on the original principal only. i and n must use the same time unit.',
    topics: ['finance-1']
  },
  {
    id: 'compound-interest', section: 'finance', name: 'compound interest',
    expr: '<span class="math">A <span class="op">=</span> P(1 <span class="op">+</span> i)<sup>n</sup></span>',
    aria: 'A equals P times open bracket 1 plus i close bracket to the power of n',
    use: 'A is the total value, not the interest. Interest earned = A − P. Match i and n to the compounding period.',
    topics: ['finance-1']
  },
  {
    id: 'effective-rate', section: 'finance', name: 'effective annual rate of interest',
    expr: '<span class="math">i<sub>effective</sub> <span class="op">=</span> (1 <span class="op">+</span> i)<sup>k</sup> <span class="op">−</span> 1</span>',
    aria: 'i effective equals open bracket 1 plus i close bracket to the power of k minus 1',
    use: 'i is the rate per compounding period and k is the number of periods per year. Use it to compare loans quoted at different compounding frequencies.',
    topics: ['finance-1']
  },
  {
    id: 'compound-recurrence', section: 'finance', name: 'recurrence relation for compound interest',
    expr: '<span class="math">A<sub>n+1</sub> <span class="op">=</span> rA<sub>n</sub></span>',
    aria: 'A sub n plus 1 equals r times A sub n',
    use: 'r = 1 + i is the growth multiplier. Always state A₀ with the recurrence.',
    topics: ['finance-1']
  },
  {
    id: 'loan-recurrence', section: 'finance', name: 'recurrence relation for reducing balance loans',
    expr: '<span class="math">A<sub>n+1</sub> <span class="op">=</span> rA<sub>n</sub> <span class="op">−</span> d</span>',
    aria: 'A sub n plus 1 equals r times A sub n minus d',
    use: 'Interest is added first, then the repayment d is subtracted. r = 1 + i for the repayment period.',
    topics: ['finance-1']
  },
  {
    id: 'annuity-recurrence', section: 'finance', name: 'recurrence relation for annuities',
    expr: '<span class="math">A<sub>n+1</sub> <span class="op">=</span> rA<sub>n</sub> <span class="op">+</span> d</span>',
    aria: 'A sub n plus 1 equals r times A sub n plus d',
    use: 'A savings plan: interest is applied to the balance first, then the new deposit d is added.',
    topics: ['finance-2']
  },
  {
    id: 'annuity-pv', section: 'finance', name: 'annuity — present value',
    expr: '<span class="math">A<sub>PV</sub> <span class="op">=</span> d <span class="frac"><span class="num">1 <span class="op">−</span> (1 <span class="op">+</span> i)<sup>−n</sup></span><span class="den">i</span></span></span>',
    aria: 'A P V equals d times open bracket 1 minus open bracket 1 plus i close bracket to the power of negative n close bracket over i',
    use: 'The amount borrowed now that n equal end-of-period repayments of d will exactly clear. Rearrange for d to find the repayment.',
    topics: ['finance-1']
  },
  {
    id: 'annuity-fv', section: 'finance', name: 'annuity — future value',
    expr: '<span class="math">A<sub>FV</sub> <span class="op">=</span> d <span class="frac"><span class="num">(1 <span class="op">+</span> i)<sup>n</sup> <span class="op">−</span> 1</span><span class="den">i</span></span></span>',
    aria: 'A F V equals d times open bracket open bracket 1 plus i close bracket to the power of n minus 1 close bracket over i',
    use: 'The value a savings plan reaches after n equal deposits of d. Interest earned = A_FV − nd.',
    topics: ['finance-2']
  },
  {
    id: 'perpetuity', section: 'finance', name: 'perpetuity',
    expr: '<span class="math">A <span class="op">=</span> <span class="frac"><span class="num">d</span><span class="den">i</span></span></span>',
    aria: 'A equals d over i',
    use: 'The principal that pays d forever from interest alone. Rearranges to d = Ai for the payment.',
    topics: ['finance-2']
  },
  {
    id: 'dividend-yield', section: 'finance', name: 'dividend yield',
    expr: '<span class="math"><span class="frac"><span class="num">dividend</span><span class="den">share price</span></span> <span class="op">×</span> 100</span>',
    aria: 'dividend divided by share price, times 100',
    use: 'Annual dividend as a percentage of the current share price.',
    topics: ['finance-1']
  },
  {
    id: 'pe-ratio', section: 'finance', name: 'price-to-earnings ratio',
    expr: '<span class="math">P/E <span class="op">=</span> <span class="frac"><span class="num">market price per share</span><span class="den">annual earnings per share</span></span></span>',
    aria: 'P E ratio equals market price per share over annual earnings per share',
    use: 'How many years of current earnings the share price represents.',
    topics: ['finance-1']
  },

  /* ---------------- Earth geometry ---------------- */
  {
    id: 'meridian-distance', section: 'earth', name: 'distance (km) — same meridian',
    expr: '<span class="math">D <span class="op">=</span> 111.2 <span class="op">×</span> angular distance</span>',
    aria: 'D equals 111.2 times the angular distance',
    use: 'Two places on the same meridian (same longitude). Subtract latitudes in the same hemisphere, add them across the equator.',
    topics: ['earth-geometry']
  },
  {
    id: 'parallel-distance', section: 'earth', name: 'distance (km) — same parallel',
    expr: '<span class="math">D <span class="op">=</span> 111.2 cos θ <span class="op">×</span> angular distance</span>',
    aria: 'D equals 111.2 times cosine theta times the angular distance',
    use: 'Two places on the same parallel of latitude θ. Set your calculator to degrees.',
    topics: ['earth-geometry']
  },
  {
    id: 'time-longitude', section: 'earth', name: 'longitude and time (derived)',
    expr: '<span class="math">time difference <span class="op">=</span> <span class="frac"><span class="num">longitude difference</span><span class="den">15</span></span></span>',
    aria: 'time difference equals longitude difference divided by 15',
    use: '15° of longitude is one hour of solar time. Places further east are ahead.',
    topics: ['earth-geometry'], derived: true
  },

  /* ---------------- Graphs and networks ---------------- */
  {
    id: 'euler', section: 'networks', name: "Euler's formula",
    expr: '<span class="math">v <span class="op">+</span> f <span class="op">−</span> e <span class="op">=</span> 2</span>',
    aria: 'v plus f minus e equals 2',
    use: 'Connected planar graphs only. Count the infinite outside region as a face.',
    topics: ['graphs-networks']
  },
  {
    id: 'degree-sum', section: 'networks', name: 'handshake result (derived)',
    expr: '<span class="math">∑ degree <span class="op">=</span> 2e</span>',
    aria: 'the sum of the degrees equals 2 e',
    use: 'A quick check on a degree list, and the fastest route from degrees to the number of edges.',
    topics: ['graphs-networks'], derived: true
  },
  {
    id: 'tree-edges', section: 'networks', name: 'tree property (derived)',
    expr: '<span class="math">edges <span class="op">=</span> v <span class="op">−</span> 1</span>',
    aria: 'edges equals v minus 1',
    use: 'Any tree, including a spanning tree or a minimum spanning tree, on v vertices.',
    topics: ['networks-1'], derived: true
  },
  {
    id: 'float', section: 'networks', name: 'float (derived)',
    expr: '<span class="math">float <span class="op">=</span> LST <span class="op">−</span> EST</span>',
    aria: 'float equals L S T minus E S T',
    use: 'Delay an activity can absorb without pushing out the project. Critical activities have zero float.',
    topics: ['networks-1'], derived: true
  },
  {
    id: 'max-flow-min-cut', section: 'networks', name: 'max-flow min-cut (derived)',
    expr: '<span class="math">maximum flow <span class="op">=</span> minimum cut capacity</span>',
    aria: 'maximum flow equals the minimum cut capacity',
    use: 'Only forward arcs crossing the cut count towards its capacity.',
    topics: ['networks-2'], derived: true
  },
  {
    id: 'hungarian-convert', section: 'networks', name: 'maximisation conversion (derived)',
    expr: '<span class="math">converted cost <span class="op">=</span> largest entry <span class="op">−</span> original</span>',
    aria: 'converted cost equals the largest entry minus the original entry',
    use: 'Turns a "maximise the profit" assignment into a minimisation the Hungarian algorithm can handle. Read the final total off the original table.',
    topics: ['networks-2'], derived: true
  },

  /* ---------------- Trigonometry ---------------- */
  {
    id: 'pythagoras', section: 'trig', name: "Pythagoras' theorem",
    expr: '<span class="math">c<sup>2</sup> <span class="op">=</span> a<sup>2</sup> <span class="op">+</span> b<sup>2</sup></span>',
    aria: 'c squared equals a squared plus b squared',
    use: 'Right-angled triangles only; c is the hypotenuse.',
    topics: []
  },
  {
    id: 'trig-ratios', section: 'trig', name: 'trigonometric ratios',
    expr: '<span class="math">cos θ <span class="op">=</span> <span class="frac"><span class="num">adj</span><span class="den">hyp</span></span> &nbsp; sin θ <span class="op">=</span> <span class="frac"><span class="num">opp</span><span class="den">hyp</span></span> &nbsp; tan θ <span class="op">=</span> <span class="frac"><span class="num">opp</span><span class="den">adj</span></span></span>',
    aria: 'cosine theta equals adjacent over hypotenuse; sine theta equals opposite over hypotenuse; tangent theta equals opposite over adjacent',
    use: 'Right-angled triangles. Label the sides relative to the angle you are using.',
    topics: ['earth-geometry']
  },
  {
    id: 'cosine-rule', section: 'trig', name: 'cosine rule',
    expr: '<span class="math">c<sup>2</sup> <span class="op">=</span> a<sup>2</sup> <span class="op">+</span> b<sup>2</sup> <span class="op">−</span> 2ab cos C</span>',
    aria: 'c squared equals a squared plus b squared minus 2 a b cosine C',
    use: 'Two sides and the included angle, or all three sides.',
    topics: []
  },
  {
    id: 'sine-rule', section: 'trig', name: 'sine rule',
    expr: '<span class="math"><span class="frac"><span class="num">a</span><span class="den">sin A</span></span> <span class="op">=</span> <span class="frac"><span class="num">b</span><span class="den">sin B</span></span> <span class="op">=</span> <span class="frac"><span class="num">c</span><span class="den">sin C</span></span></span>',
    aria: 'a over sine A equals b over sine B equals c over sine C',
    use: 'A matching side-and-angle pair plus one more piece of information.',
    topics: []
  },
  {
    id: 'triangle-area-sin', section: 'trig', name: 'area of a triangle',
    expr: '<span class="math">area <span class="op">=</span> <span class="frac"><span class="num">1</span><span class="den">2</span></span> bc sin A</span>',
    aria: 'area equals one half b c sine A',
    use: 'Two sides with the angle between them.',
    topics: []
  },

  /* ---------------- Mensuration ---------------- */
  { id: 'circumference', section: 'mensuration', name: 'circumference of a circle',
    expr: '<span class="math">C <span class="op">=</span> 2πr</span>', aria: 'C equals 2 pi r',
    use: 'Distance around a full circle.', topics: [] },
  { id: 'circle-area', section: 'mensuration', name: 'area of a circle',
    expr: '<span class="math">A <span class="op">=</span> πr<sup>2</sup></span>', aria: 'A equals pi r squared',
    use: 'Halve the diameter first if that is what you were given.', topics: [] },
  { id: 'parallelogram-area', section: 'mensuration', name: 'area of a parallelogram',
    expr: '<span class="math">A <span class="op">=</span> bh</span>', aria: 'A equals b h',
    use: 'h is the perpendicular height, not the slant side.', topics: [] },
  { id: 'trapezium-area', section: 'mensuration', name: 'area of a trapezium',
    expr: '<span class="math">A <span class="op">=</span> <span class="frac"><span class="num">1</span><span class="den">2</span></span>(a <span class="op">+</span> b)h</span>',
    aria: 'A equals one half open bracket a plus b close bracket h',
    use: 'a and b are the two parallel sides.', topics: [] },
  { id: 'triangle-area', section: 'mensuration', name: 'area of a triangle',
    expr: '<span class="math">A <span class="op">=</span> <span class="frac"><span class="num">1</span><span class="den">2</span></span>bh</span>',
    aria: 'A equals one half b h', use: 'Perpendicular height to the chosen base.', topics: [] },
  { id: 'cone-tsa', section: 'mensuration', name: 'total surface area of a cone',
    expr: '<span class="math">S <span class="op">=</span> πrs <span class="op">+</span> πr<sup>2</sup></span>',
    aria: 'S equals pi r s plus pi r squared', use: 's is the slant height.', topics: [] },
  { id: 'cylinder-tsa', section: 'mensuration', name: 'total surface area of a cylinder',
    expr: '<span class="math">S <span class="op">=</span> 2πrh <span class="op">+</span> 2πr<sup>2</sup></span>',
    aria: 'S equals 2 pi r h plus 2 pi r squared', use: 'Drop a 2πr² term for an open cylinder.', topics: [] },
  { id: 'sphere-sa', section: 'mensuration', name: 'surface area of a sphere',
    expr: '<span class="math">S <span class="op">=</span> 4πr<sup>2</sup></span>', aria: 'S equals 4 pi r squared',
    use: 'Radius, not diameter.', topics: [] },
  { id: 'cone-volume', section: 'mensuration', name: 'volume of a cone',
    expr: '<span class="math">V <span class="op">=</span> <span class="frac"><span class="num">1</span><span class="den">3</span></span>πr<sup>2</sup>h</span>',
    aria: 'V equals one third pi r squared h', use: 'h is the perpendicular height, not the slant height.', topics: [] },
  { id: 'cylinder-volume', section: 'mensuration', name: 'volume of a cylinder',
    expr: '<span class="math">V <span class="op">=</span> πr<sup>2</sup>h</span>', aria: 'V equals pi r squared h',
    use: 'Circular cross-section times the height.', topics: [] },
  { id: 'prism-volume', section: 'mensuration', name: 'volume of a prism',
    expr: '<span class="math">V <span class="op">=</span> Ah</span>', aria: 'V equals A h',
    use: 'A is the area of the uniform cross-section.', topics: [] },
  { id: 'pyramid-volume', section: 'mensuration', name: 'volume of a pyramid',
    expr: '<span class="math">V <span class="op">=</span> <span class="frac"><span class="num">1</span><span class="den">3</span></span>Ah</span>',
    aria: 'V equals one third A h', use: 'One third of the prism on the same base.', topics: [] },
  { id: 'sphere-volume', section: 'mensuration', name: 'volume of a sphere',
    expr: '<span class="math">V <span class="op">=</span> <span class="frac"><span class="num">4</span><span class="den">3</span></span>πr<sup>3</sup></span>',
    aria: 'V equals four thirds pi r cubed', use: 'Cube the radius before multiplying.', topics: [] },

  /* ---------------- Shape and measurement ---------------- */
  { id: 'sector-perimeter', section: 'shape', name: 'perimeter of a sector',
    expr: '<span class="math">P <span class="op">=</span> 2r <span class="op">+</span> <span class="frac"><span class="num">θ</span><span class="den">180</span></span>πr</span>',
    aria: 'P equals 2 r plus theta over 180 times pi r',
    use: 'The two straight radii plus the arc. θ is in degrees.', topics: [] },
  { id: 'sector-area', section: 'shape', name: 'area of a sector',
    expr: '<span class="math">A <span class="op">=</span> <span class="frac"><span class="num">θ</span><span class="den">360</span></span>πr<sup>2</sup></span>',
    aria: 'A equals theta over 360 times pi r squared',
    use: 'The fraction θ/360 of the whole circle.', topics: [] },
  { id: 'herons-rule', section: 'shape', name: "Heron's rule",
    expr: '<span class="math">Area <span class="op">=</span> <span class="sqrt">√<span class="sqrt">s(s <span class="op">−</span> a)(s <span class="op">−</span> b)(s <span class="op">−</span> c)</span></span>, &nbsp; s <span class="op">=</span> <span class="frac"><span class="num">a <span class="op">+</span> b <span class="op">+</span> c</span><span class="den">2</span></span></span>',
    aria: 'Area equals the square root of s times s minus a times s minus b times s minus c, where s equals a plus b plus c all over 2',
    use: 'All three sides known and no angle. s is the semi-perimeter.', topics: [] }
];

export const FORMULA_BY_ID = Object.fromEntries(FORMULAS.map(f => [f.id, f]));

export function formulasForTopic(topicId) {
  return FORMULAS.filter(f => f.topics.includes(topicId));
}
