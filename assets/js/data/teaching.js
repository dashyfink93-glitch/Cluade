/**
 * Teacher-voice explanations, one per topic.
 *
 * The topic pages already carry the syllabus content — definitions, formulas,
 * a worked example. This is the other half of a lesson: what the idea actually
 * means, how an experienced teacher decides what to do, and the specific wrong
 * belief that produces each common mistake.
 *
 *   hook          why anyone should care, in one concrete situation
 *   intuition     the idea in plain language, before any notation
 *   board         how a teacher talks through the reasoning, step by step
 *   decide        the "which method do I use?" decision, as a rule of thumb
 *   misconceptions the wrong belief, why it is tempting, and the correction
 *   checkpoint    one question that exposes whether the idea landed
 */

export const TEACHING = {
  'bivariate-1': {
    hook: 'A school claims its new tutoring program "works" because 80% of students who attended passed. That number on its own is worthless — and knowing why is the whole of this topic.',
    intuition: `Bivariate just means two things measured on the same people. The only question you ever ask is:
      <em>does knowing one tell me anything about the other?</em> That is what "association" means. It is not
      about totals or averages on their own — it is about whether the pattern in one variable shifts when the
      other changes.`,
    board: [
      { t: 'Decide what kind of variables you have', h: `Before anything else, ask of each variable: could I sensibly average it? Height, income, rainfall — yes, numerical. Transport mode, eye colour, postcode — no, these are labels, so categorical. A number is not automatically numerical; a postcode of 4000 is not "twice" 2000.` },
      { t: 'Pick the explanatory variable', h: `Which one do you think is doing the explaining? That is the explanatory variable; the other is the response. If you think tutoring affects results, tutoring is explanatory. You are not proving anything yet — you are just deciding which way round to look.` },
      { t: 'For two categorical variables, percentage within groups', h: `Here is the move almost everyone gets wrong. You compare the groups made by the <em>explanatory</em> variable, so you percentage across each of those groups separately. "80% of attendees passed" is only meaningful next to "and what percentage of non-attendees passed?" If 78% of non-attendees also passed, the program did nothing.` },
      { t: 'For two numerical variables, look at the scatterplot first', h: `Direction (does it slope up or down?), form (is it straight or curved?), strength (how tightly packed?). Do this by eye <em>before</em> you touch r, because r only measures how well a <strong>straight line</strong> fits. A perfect U-shaped curve can give you r near zero, and if you trusted the number you would report "no association" about data with an obvious pattern.` },
      { t: 'Then, and only then, read r and R²', h: `r runs from −1 to 1 and carries the direction in its sign. R² = r² tells you the share of the variation in the response that the linear relationship accounts for. Say it in full: "R² = 0.64, so 64% of the variation in test score is explained by the linear relationship with study hours."` }
    ],
    decide: [
      { when: 'Both variables categorical', then: 'Two-way table, percentage <em>within</em> the explanatory groups, compare the percentages.' },
      { when: 'Both variables numerical', then: 'Scatterplot; describe direction, form, strength; then r and R².' },
      { when: 'One of each', then: 'Compare the numerical variable across the categories — parallel boxplots, or compare the means.' }
    ],
    misconceptions: [
      { wrong: '"r = 0.9 means a 90% correlation."', why: 'It looks like a percentage because it sits between 0 and 1.', right: 'r is not a percentage at all. The percentage figure comes from R² = r² = 0.81, so 81% — and it describes explained variation, not "how correlated" things are.' },
      { wrong: '"r is small, so there is no relationship."', why: 'Students read r as a general strength-of-relationship meter.', right: 'r only measures <em>linear</em> association. A strong curved relationship can produce a tiny r. Always look at the plot before trusting the number.' },
      { wrong: '"80% of attendees passed, so the program works."', why: 'One large percentage feels like strong evidence on its own.', right: 'A single conditional percentage means nothing without its comparison group. You need the percentage for non-attendees too.' },
      { wrong: '"There is a strong association, so one causes the other."', why: 'Association is exactly what causation would look like in the data.', right: 'Observational data cannot separate cause from a lurking variable. Students who choose to attend tutoring may already be more motivated — motivation drives both.' }
    ],
    checkpoint: 'In a survey, 45 of 60 country students and 40 of 100 city students own a bike. Is there an association? Give the figures that justify your answer, and state what you cannot conclude.'
  },

  'bivariate-2': {
    hook: 'Your model predicts that a 40-year-old will run 100 m in negative time. The arithmetic is fine. The thinking is not.',
    intuition: `A least-squares line is the single straight line that sits as close as possible to all your points at once —
      "close" meaning the vertical gaps to the line, squared and added up, come out as small as they possibly can.
      Everything else in this topic is either building that line, checking it was a sensible thing to fit, or being
      careful about what you use it for.`,
    board: [
      { t: 'Build the slope from the spreads', h: `${'m = r(s<sub>y</sub> ÷ s<sub>x</sub>)'} looks arbitrary until you see what it is doing. ${'s<sub>y</sub> ÷ s<sub>x</sub>'} converts "one step of x-spread" into "one step of y-spread". Multiplying by r shrinks it, because the relationship is not perfect — the weaker the association, the flatter the line. If r were 1, the line would be as steep as the spreads allow; if r were 0, the line would be flat and predict the mean every time.` },
      { t: 'Anchor it at the point of means', h: `${'c = ȳ − m x̄'} is just rearranging ${'ȳ = m x̄ + c'}. Every least-squares line passes through (x̄, ȳ) — the balance point of the data. So you find the tilt from the spreads, then slide the line up or down until it sits on that point.` },
      { t: 'Interpret the slope as a prediction, not a promise', h: `"Each extra hour of study predicts 3.2 more marks" — <em>predicts</em>, on average. Not "causes", and not "exactly". Those two words are the difference between full marks and half.` },
      { t: 'Check the residual plot before you believe any of it', h: `A residual is observed minus predicted: how wrong the line was at that point. Plot all of them. If they scatter randomly in a band around zero, a straight line was appropriate. If they form a curve — up, down, up — then the real relationship was curved and your straight line is the wrong tool, no matter how good r looked.` },
      { t: 'Check where your prediction sits', h: `Inside the range of x you actually observed, that is interpolation and is reasonably safe. Outside it, that is extrapolation: you are assuming the pattern continues into territory you have never measured. That is how you get negative sprint times.` }
    ],
    decide: [
      { when: 'You are given r, the two spreads and the two means', then: 'Build the line: slope first, then intercept from the means.' },
      { when: 'You are given the line and a data point', then: 'Predict with the line, then residual = observed − predicted.' },
      { when: 'You are asked whether a prediction is trustworthy', then: 'Compare x with the observed range, name interpolation or extrapolation, and mention the residual plot.' }
    ],
    misconceptions: [
      { wrong: 'Residual = predicted − observed.', why: 'Both orders feel equally natural.', right: 'Observed comes first: residual = y − ŷ. Get it backwards and every sign flips, so "above the line" becomes "below".' },
      { wrong: 'Dividing sₓ by sᵧ in the slope.', why: 'The formula is symmetrical-looking and easy to write from memory the wrong way round.', right: 'The response variable spread goes on top: m = r(sᵧ ÷ sₓ). Sanity-check the size of your answer against the data.' },
      { wrong: '"The intercept is the value when x = 0, so I should always interpret it."', why: 'It is a true statement about the equation.', right: 'Only interpret it if x = 0 is meaningful. "A car of age 0 is worth $28 000" is fine. "A person of height 0 cm weighs −45 kg" is not — say the intercept lies outside the sensible domain.' },
      { wrong: '"The residual plot has a pattern, but r was 0.9, so the model is good."', why: 'A high r feels like the final word.', right: 'The residual plot overrules r. Systematic curvature in the residuals means a straight line was the wrong model, however tightly the points cluster.' }
    ],
    checkpoint: 'A line fitted to children aged 5–12 is ŷ = 6x + 40 (height in cm). Predict the height of a 30-year-old, then explain in one sentence why you should not report that number.'
  },

  'time-series': {
    hook: 'Ice-cream sales always spike in summer. So when sales jump in December, has the business grown — or is it just December again?',
    intuition: `Any series measured over time is really three things added together: a long-run direction (trend),
      a repeating calendar pattern (seasonality), and random noise. The whole topic is about pulling those apart,
      because you cannot see whether the business is actually growing until you strip the calendar out of the numbers.`,
    board: [
      { t: 'Smooth first, to see the trend', h: `A moving average replaces each value with the average of itself and its neighbours, which flattens the short-term jumps and leaves the direction visible. Use an <strong>odd</strong> number of terms so the smoothed value sits on a real time point — a 3-point mean centred at time 4 uses times 3, 4 and 5, and belongs at time 4. Put it at time 3 and you have shifted your whole series sideways.` },
      { t: 'Measure each season against a typical period', h: `A seasonal index is just "how does this season compare to average?", written as a multiplier. Index 1.30 means this quarter typically runs 30% above the yearly average; 0.85 means 15% below. Across one full cycle the indices average to 1, so four quarterly indices add to 4 and twelve monthly indices add to 12 — which is how you find a missing one.` },
      { t: 'Deseasonalise by dividing', h: `The seasonality is multiplicative, so you undo it by dividing: deseasonalised = actual ÷ index. December sales of $130 000 with an index of 1.30 are really $100 000 of "ordinary" trading. Now you can compare December with June honestly, and now the trend line has something sensible to fit.` },
      { t: 'Fit the trend to the deseasonalised numbers', h: `This is the step students skip. Fitting a line to the raw data gives you a line fighting the seasonal zigzag. Deseasonalise first, fit the line to those figures, and the line describes the underlying direction.` },
      { t: 'Forecast, then put the seasonality back', h: `Predict with the trend line for the period you want, then multiply by that period's seasonal index. And say out loud what you assumed: that the trend continues and the seasonal pattern holds. A forecast without that caveat loses a mark almost every time.` }
    ],
    decide: [
      { when: 'Asked to smooth or find the trend', then: 'Odd-order moving mean or median, value placed at the centre of the window.' },
      { when: 'Going from a raw value to a comparable one', then: 'Divide by the seasonal index (deseasonalise).' },
      { when: 'Going from a trend prediction to a real-world forecast', then: 'Multiply by the seasonal index (reseasonalise), then state your assumptions.' },
      { when: 'Given all but one seasonal index', then: 'They sum to the number of seasons — subtract.' }
    ],
    misconceptions: [
      { wrong: 'Multiplying by the index to deseasonalise.', why: 'Both operations use the same two numbers, so it is a coin flip under pressure.', right: 'Removing seasonality divides; restoring it multiplies. Sanity-check: if the index is above 1, the deseasonalised figure must come out <em>lower</em> than the actual.' },
      { wrong: '"Sales rise every December, so the trend is upward."', why: 'A repeating rise genuinely looks like growth on the raw plot.', right: 'A pattern that repeats on the calendar is seasonality, not trend. Trend is what is left once the repetition is removed.' },
      { wrong: 'Placing a moving average at the first time point of its window.', why: 'It is the natural reading order.', right: 'It goes at the centre. That is the whole reason for using an odd number of terms.' },
      { wrong: 'Treating a one-off event as part of the seasonal pattern.', why: 'It shows up as a big deviation, and seasonal indices are built from deviations.', right: 'A flood, a strike or a closure is irregular fluctuation — it does not repeat on a calendar, so it must not be built into the index.' }
    ],
    checkpoint: 'Quarterly indices are Q1 0.80, Q2 0.95, Q3 1.45 and Q4 unknown. Find Q4, then deseasonalise a Q3 figure of $87 000 and say what that number means in plain words.'
  },

  'sequences': {
    hook: 'Two phone plans: one adds $12 a month, the other rises 12% a month. They look identical in month one. By month twenty, one costs three times the other.',
    intuition: `Every sequence in this topic does the same thing at every step. Either it <strong>adds</strong> the same
      amount each time (arithmetic — a straight line of dots) or it <strong>multiplies</strong> by the same factor
      each time (geometric — a curve that accelerates). Your first job on any question is to find out which, and
      you do that by testing both.`,
    board: [
      { t: 'Test for a common difference, then a common ratio', h: `Subtract consecutive terms. If you get the same number every time, it is arithmetic and that number is d. If not, divide consecutive terms instead. Same answer every time? Geometric, and that is r. Do both tests — do not assume from a glance.` },
      { t: 'Turn a percentage into a multiplier immediately', h: `This is where most marks are lost. "Grows 8% a year" means multiply by 1.08. "Loses 18% a year" means you keep 82%, so multiply by 0.82. Write r = 1.08 or r = 0.82 down before you do anything else, and you have removed the single most common error in the topic.` },
      { t: 'Count the steps, not the terms', h: `${'t<sub>n</sub> = t<sub>1</sub> + (n − 1)d'} has that (n − 1) because getting from term 1 to term 5 takes four steps, not five. If a machine is worth $48 000 at the end of year 1 and you want the end of year 6, that is five reductions, so the exponent is 5.` },
      { t: 'Write recurrences with their starting value', h: `${'t<sub>n+1</sub> = 0.82 t<sub>n</sub>'} on its own describes infinitely many sequences. It only becomes <em>your</em> sequence once you state ${'t<sub>1</sub> = 48 000'} alongside it. A recurrence without its seed is an incomplete answer.` },
      { t: 'Remember these graphs are dots, not lines', h: `Term 3.5 does not exist. You can draw a line through the points to show the shape, but the sequence itself is only defined at whole term numbers.` }
    ],
    decide: [
      { when: 'The step is a fixed amount (+$50, −3 kg)', then: 'Arithmetic. Use tₙ = t₁ + (n − 1)d.' },
      { when: 'The step is a percentage or a factor (×1.05, −18% each year)', then: 'Geometric. Use tₙ = t₁r^(n−1).' },
      { when: 'Asked for "a rule" from a list of terms', then: 'Test differences, then ratios; state the rule <em>and</em> the starting value.' }
    ],
    misconceptions: [
      { wrong: 'Using 18 instead of 0.18, or 0.18 instead of 0.82.', why: 'The question says "18%", so 18 is what is in front of you.', right: 'Convert to a decimal, then decide whether you want the change (0.18) or what remains (0.82). For depreciation you almost always want what remains.' },
      { wrong: 'Using n instead of n − 1.', why: 'Term 6 feels like it should have a 6 in it.', right: 'Count the <em>steps</em> from the starting term. Term 6 is five steps after term 1.' },
      { wrong: '"It goes up by more each year, so d is increasing."', why: 'The differences genuinely do grow.', right: 'That is the signature of a geometric sequence, not an arithmetic one with a changing d. Check the ratios instead.' },
      { wrong: 'Assuming a percentage rise beats a fixed rise from the start.', why: '"Exponential growth" is described as fast.', right: 'Percentage growth starts slower and overtakes later. Which one is ahead at term 10 is a calculation, not an assumption.' }
    ],
    checkpoint: 'A $2 400 laptop loses 25% of its value each year. Write the rule, then find its value at the end of year 4 — and say how many reductions that is.'
  },

  'earth-geometry': {
    hook: 'You leave Sydney at 9 pm Tuesday, fly for 14 hours, and land in Los Angeles at 6 pm — on Tuesday. You have arrived before you left.',
    intuition: `Two separate ideas share this topic. The first is measuring distance on a sphere, where how far apart
      two places are depends on <em>where</em> on the globe you measure. The second is time zones, which come from
      the Earth turning 360° in 24 hours. They are joined by longitude: the same lines that locate you east-west
      also set your clock.`,
    board: [
      { t: 'Read the coordinates before choosing anything', h: `Same longitude means both places sit on the same meridian, running north-south. Same latitude means the same parallel, running east-west. Which one matches decides your formula, so check it first, every time.` },
      { t: 'On a meridian, every degree is worth the same', h: `Meridians are all full great circles, so 1° of latitude is about 111.2 km wherever you are. Distance = 111.2 × angular difference. Same hemisphere, subtract the latitudes; opposite hemispheres, add them, because you are crossing the equator.` },
      { t: 'On a parallel, degrees shrink as you leave the equator', h: `Picture the lines of latitude as hoops around a globe. The equator is the widest; near the pole a hoop is tiny. So 1° of longitude covers far less ground at 60°S than at the equator, and the ${'cos θ'} does that shrinking: Distance = 111.2 × cos(latitude) × angular difference. At the equator cos 0° = 1 and nothing shrinks; at 60°, cos 60° = 0.5, so distances halve.` },
      { t: 'Turn longitude into time', h: `360° in 24 hours is 15° per hour. Further east means further ahead. That gives you the ideal solar relationship; real time zones are political and get given to you as UTC offsets instead.` },
      { t: 'For any journey, go through UTC', h: `Trying to combine the time difference and the flight time in one step is how people lose a day. Do it in three: convert departure to UTC, add the flight time in UTC, then convert UTC to the destination's local time. Flight duration is the same everywhere, so only the conversions need care — and then count the day changes.` }
    ],
    decide: [
      { when: 'Longitudes match', then: 'Same meridian: D = 111.2 × angular difference. No cosine.' },
      { when: 'Latitudes match', then: 'Same parallel: D = 111.2 × cos(latitude) × angular difference.' },
      { when: 'Converting a clock time between places', then: 'Destination offset minus origin offset; apply it; then check whether the date moved.' },
      { when: 'A journey with a duration', then: 'Local → UTC → add duration → local. Never in one step.' }
    ],
    misconceptions: [
      { wrong: 'Subtracting latitudes that are in opposite hemispheres.', why: 'Subtracting is what you do for "difference".', right: '12°N to 27°S is 39° apart, not 15°. Sketch the equator between them and it becomes obvious.' },
      { wrong: 'Using the cosine on a meridian problem.', why: 'The cosine version feels like the more complete formula.', right: 'North-south distance never shrinks — meridians are all the same size. The cosine belongs only to east-west distances along a parallel.' },
      { wrong: 'Leaving the calculator in radians.', why: 'It gives a plausible-looking number rather than an error.', right: 'cos(28°) ≈ 0.88. If your calculator says −0.96, you are in radians and every distance will be wrong.' },
      { wrong: 'Getting the clock time right but forgetting the date.', why: 'The arithmetic finishes and the answer looks complete.', right: 'The day is part of the answer. Crossing midnight in either direction changes it, and a long westward flight can land you on the previous date.' }
    ],
    checkpoint: 'Two towns sit at 35°S, 140°E and 35°S, 149°E. Find the distance between them. Then say how much larger it would be if both were on the equator instead, and why.'
  },

  'finance-1': {
    hook: 'Two lenders offer you "6% per annum". One costs you $180 more a year than the other. Nothing about the advertised rate tells you which.',
    intuition: `Everything here comes from one idea: money left alone grows by a percentage each period, and each
      period's growth is calculated on the <em>new</em> balance. The formulas just package that up for different
      situations — a lump sum left to grow, a debt you are paying down, a loan quoted at different compounding
      frequencies. Get the period right and the rest follows.`,
    board: [
      { t: 'Match the rate to the period. Always, first.', h: `If interest compounds monthly, then i is the <em>monthly</em> rate and n counts <em>months</em>. 6% p.a. compounded monthly gives i = 0.06 ÷ 12 = 0.005, and 5 years gives n = 60. Write both down before touching a formula. Nearly every wrong answer in this topic starts with an annual rate sitting next to a monthly n.` },
      { t: 'A is the total, not the interest', h: `${'A = P(1 + i)<sup>n</sup>'} gives you everything the account is worth. If the question asks how much interest was <em>earned</em>, you still have to subtract: I = A − P. Read the question again before writing the final line.` },
      { t: 'Effective rate is how you compare unlike offers', h: `6% compounded monthly is not the same deal as 6% compounded annually, because the monthly one earns interest on its own interest eleven extra times. ${'i<sub>eff</sub> = (1 + i)<sup>k</sup> − 1'} converts any quoted rate into the true one-year growth, which is the only fair basis for comparison. The "− 1" matters: without it you have the growth multiplier, not the rate.` },
      { t: 'A reducing-balance loan: interest first, then the payment', h: `${'A<sub>n+1</sub> = (1 + i)A<sub>n</sub> − d'}. Read it left to right in that order: the bank adds a month of interest to what you owe, and <em>then</em> your repayment comes off. Doing it the other way round understates the debt. And keep the unrounded balance when you carry it to the next line.` },
      { t: 'The annuity formula is for a whole schedule at once', h: `When you need "what repayment clears this loan in exactly n payments?", stepping through a recurrence 60 times is hopeless. ${'A<sub>PV</sub> = d[1 − (1 + i)<sup>−n</sup>] ÷ i'} relates the amount borrowed now to the repayment directly — rearrange for d. Watch the negative exponent; a positive one gives a wrong answer that still looks reasonable.` }
    ],
    decide: [
      { when: 'A lump sum left to grow, nothing added or taken out', then: 'A = P(1 + i)ⁿ.' },
      { when: 'Comparing two quoted rates with different compounding', then: 'Effective annual rate for each.' },
      { when: 'A debt with regular repayments, and you want a balance after a few periods', then: 'The recurrence, stepped.' },
      { when: 'A debt with regular repayments, and you want the repayment or the amount borrowed', then: 'The present-value annuity formula.' }
    ],
    misconceptions: [
      { wrong: 'Using the annual rate with a monthly n.', why: 'The rate in the question is annual, so it feels like the rate to use.', right: 'Divide by the number of compounds per year first. Rate and n always share a time unit.' },
      { wrong: 'Reporting A when the question asked for interest.', why: 'A is the number the formula produces, so it feels like the answer.', right: 'Interest = A − P. Underline what the question actually asked for before you start.' },
      { wrong: 'Rounding the balance to the cent at every step of a recurrence.', why: 'Money is measured in cents, so rounding looks correct.', right: 'Round only the final answer. Rounding each line accumulates error across a long loan.' },
      { wrong: 'Using +n instead of −n in the annuity formula.', why: 'Negative exponents look like a typo.', right: 'The negative exponent is discounting future payments back to today. With +n the answer is wrong but still plausible, so this one rarely gets caught by a sanity check.' }
    ],
    checkpoint: 'A $20 000 loan charges 7.2% p.a. compounded monthly with $400 repayments. Write i, n for 5 years, and the recurrence — then say, without calculating, whether the first repayment reduces the debt by more or less than $400.'
  },

  'finance-2': {
    hook: 'Save $200 a month for 30 years at 5% and you will have put in $72 000. The account will hold about $166 000. The rest was never yours to deposit.',
    intuition: `Topic 1 was money you already have, or money you owe. This is money you are <em>building up</em>:
      equal deposits, made again and again, each one earning interest for however long it has left. The only
      genuinely new idea is a perpetuity — a fund so large that its interest alone covers the payments, so the
      capital is never touched.`,
    board: [
      { t: 'Spot which of the three situations you are in', h: `Present value: money borrowed now, cleared by future payments. Future value: deposits now, building to a total later. Perpetuity: a payment that continues forever without reducing the principal. Choosing wrongly here is worth more marks than any arithmetic slip, so name the situation in words before reaching for a formula.` },
      { t: 'The savings recurrence adds, the loan recurrence subtracts', h: `${'A<sub>n+1</sub> = (1 + i)A<sub>n</sub> + d'}. Interest goes on first, then your deposit lands. That single sign is the entire difference from a loan, and it is worth saying to yourself each time: a loan takes money off the balance, a savings plan puts money on.` },
      { t: 'Interest earned is the total minus what you put in', h: `${'A<sub>FV</sub>'} is the whole balance. To find the interest, subtract every deposit you made: interest = ${'A<sub>FV</sub>'} − n × d. Students routinely report the balance as the interest, which in the example above overstates it by $72 000.` },
      { t: 'A perpetuity is just "spend only the interest"', h: `${'A = d ÷ i'} looks abstract until you turn it around: d = A × i. The payment is exactly one period's interest on the fund. Take that much and the balance returns to where it started, so it can do the same next period, forever. Take a dollar more and you are eating the capital.` },
      { t: 'Rearranging is normal here', h: `Questions often give you the target and ask for the deposit. Do not look for a different formula — it is the same one solved for d. Find the bracketed annuity factor, then divide the target by it. And round a <em>required</em> deposit up: rounding down leaves the saver short.` }
    ],
    decide: [
      { when: 'Regular deposits building towards a total', then: 'Future-value annuity.' },
      { when: 'Regular repayments clearing an amount borrowed now', then: 'Present-value annuity (Topic 1).' },
      { when: 'A payment funded forever by interest alone', then: 'Perpetuity, A = d ÷ i.' },
      { when: 'The question gives the end balance and wants the payment', then: 'Same formula, rearranged for d.' }
    ],
    misconceptions: [
      { wrong: 'Using the present-value formula for a savings plan.', why: 'Both are "annuity" formulas and look alike.', right: 'PV discounts backwards to today; FV accumulates forwards to the end. Ask which end of time the money is sitting at.' },
      { wrong: 'Reporting the final balance as the interest earned.', why: 'It is the number the formula hands you.', right: 'Subtract total deposits: interest = A_FV − nd.' },
      { wrong: '"A perpetuity must slowly run down."', why: 'Paying money out of an account normally reduces it.', right: 'Only the interest is withdrawn, so the principal is untouched. That is exactly why the payment can continue indefinitely.' },
      { wrong: 'Using an annual rate with a monthly payment in a perpetuity.', why: 'The rate is quoted per annum.', right: 'i must match the payment period. Get it wrong and the required principal is out by a factor of twelve.' }
    ],
    checkpoint: 'A fund holds $300 000 at 4.8% p.a. compounded monthly. Find the largest monthly payment it can make forever — then explain what would happen if the trustees paid $1 500 a month instead.'
  },

  'graphs-networks': {
    hook: 'A postie wants to walk every street once and finish back at the van. Whether that is possible has nothing to do with the map, and everything to do with counting.',
    intuition: `A graph throws away everything except what is connected to what. Distances, angles and positions are
      irrelevant; only the vertices (the things) and edges (the connections) matter. That is what makes the same
      picture work for road networks, friendships, plumbing and flight routes.`,
    board: [
      { t: 'Get the vocabulary exactly right, because it is examined', h: `Degree is how many edge-ends meet at a vertex (a loop counts twice). A <em>walk</em> is any journey. A <em>trail</em> repeats no edge. A <em>path</em> repeats no vertex. A <em>circuit</em> is a closed trail; a <em>cycle</em> is a closed path. When a question asks "which term describes this?", it wants the most specific one that fits.` },
      { t: 'Read an adjacency matrix as "how many edges from row to column"', h: `For an undirected graph the matrix is symmetric, because an edge joins both ways, and the diagonal is zero unless there are loops. Sum a row and you have that vertex's degree; sum the whole matrix and halve it and you have the number of edges.` },
      { t: 'Every edge has two ends — so degrees double-count', h: `That gives you ${'∑ degree = 2e'}, which is both a fast way to count edges and a check on your own work. It also means the number of odd-degree vertices is always even, so if you have counted three, you have miscounted.` },
      { t: "Euler's formula needs connected and planar", h: `${'v + f − e = 2'}, where planar means you can redraw it with no edges crossing, and the faces include the infinite region outside the drawing. Forgetting that outside face is the single most common slip.` },
      { t: 'Eulerian is about edges; Hamiltonian is about vertices', h: `Can you use every <strong>edge</strong> exactly once? Count the odd-degree vertices: zero means yes and you finish where you started; exactly two means yes but you must start at one odd vertex and finish at the other; four or more means no. Can you visit every <strong>vertex</strong> exactly once? There is no such test — you have to construct and compare candidate routes. Keeping those two apart is most of this topic.` }
    ],
    decide: [
      { when: 'Asked about using every road/edge once', then: 'Eulerian. Count odd-degree vertices.' },
      { when: 'Asked about visiting every town/vertex once', then: 'Hamiltonian. No shortcut — construct routes.' },
      { when: 'Given a drawing with no crossings and asked to count regions', then: "Euler's formula, and remember the outside face." },
      { when: 'Asked for the quickest route between two vertices', then: 'List the plausible routes, total each, state route <em>and</em> weight.' }
    ],
    misconceptions: [
      { wrong: 'Using the odd-vertex test on a Hamiltonian question.', why: 'It is the only test in the topic, so it gets applied everywhere.', right: 'The degree test governs Eulerian trails only. Hamiltonian questions need construction and comparison.' },
      { wrong: 'Forgetting the outside face.', why: 'You can only see the enclosed regions.', right: 'The infinite region surrounding the drawing is a face too. Count the enclosed regions and add one.' },
      { wrong: 'Treating a point where two edges cross as a vertex.', why: 'It looks like a junction.', right: 'Only marked vertices count. Two edges crossing on the page is just a drawing artefact — and often means the graph can be redrawn planar.' },
      { wrong: 'Answering a shortest-path question with only a number.', why: 'The number is what was calculated.', right: 'State the route as well. The question asks which way to go, not just how far.' }
    ],
    checkpoint: 'A connected graph has degrees 2, 3, 3, 4, 4. Can a postie walk every edge exactly once? If so, where must they start and finish, and can they get back to the van?'
  },

  'networks-1': {
    hook: 'A project has forty tasks. Speed up the wrong one and you have spent money for nothing — the finish date will not move by a single day.',
    intuition: `Two separate problems live in this topic. One is connecting everything as cheaply as possible, which
      gives you a minimum spanning tree. The other is scheduling: when tasks depend on other tasks, the finish
      date is set by the <em>longest</em> chain of dependencies, and everything else has slack.`,
    board: [
      { t: 'A tree is "connected with nothing spare"', h: `No cycles, and on v vertices exactly v − 1 edges. That edge count tells you when to stop building: six sites means five cables, and if you have six you have made a cycle somewhere.` },
      { t: 'Build a minimum spanning tree greedily, but check for cycles', h: `Take the cheapest edge available, then the next cheapest, skipping any edge whose two ends are already connected to each other — that edge would close a cycle and add cost for no new connection. Stop at v − 1 edges. The greedy approach genuinely gives the optimum here, which is not true of most optimisation problems.` },
      { t: 'For scheduling, the longest path wins', h: `This is the opposite instinct from shortest-path work, and the switch catches people out. The project cannot finish until every chain of dependencies has finished, so the longest chain sets the minimum duration. That chain is the critical path.` },
      { t: 'Forward scan for the earliest times', h: `An activity can start only when all its predecessors are done, so its earliest start is the <strong>largest</strong> of its predecessors' earliest finishes. Work left to right; the biggest earliest-finish at the end is the project duration.` },
      { t: 'Backward scan for the latest times, then float', h: `Start from the project duration and work right to left. An activity's latest finish is the <strong>smallest</strong> of its successors' latest starts — smallest, because it must not delay any of them. Then float = LST − EST: how much an activity can slip without moving the finish date. Zero float means critical.` }
    ],
    decide: [
      { when: 'Connect every site as cheaply as possible', then: 'Minimum spanning tree. Cheapest edges, no cycles, stop at v − 1.' },
      { when: 'How long will the project take?', then: 'Longest path. Forward scan.' },
      { when: 'Can this task be delayed?', then: 'Float = LST − EST.' },
      { when: 'Would speeding up this task help?', then: 'Only if its float is zero — and only until another path becomes the longest.' }
    ],
    misconceptions: [
      { wrong: 'Using the shortest path for project duration.', why: 'Shortest-path work is fresh from the previous topic.', right: 'Scheduling uses the longest path. Every dependency chain must finish, so the slowest one controls the date.' },
      { wrong: 'Taking the maximum of successors on the backward scan.', why: 'The forward scan used a maximum, so symmetry suggests the same.', right: 'Backward uses the minimum. An activity must finish early enough for the tightest of its successors.' },
      { wrong: 'Adding the cheapest remaining edge without checking connectivity.', why: 'Greedy means "always take the cheapest".', right: 'Skip an edge whose ends are already joined. It closes a cycle and buys nothing.' },
      { wrong: '"Shortening any task shortens the project."', why: 'It is obviously faster work.', right: 'Only critical tasks control the finish date — and once you shorten one enough, a different path becomes critical and the saving stops.' }
    ],
    checkpoint: 'Three chains through a project run 19, 24 and 24 days. State the duration and the critical path(s), and say what the float is on a task that lies only on the 19-day chain.'
  },

  'networks-2': {
    hook: 'Four drivers, four routes, and 24 ways to pair them up. Picking the best driver for the best route first will often give you the worst total.',
    intuition: `Both halves of this topic are about limits and choices. In a flow network, the question is how much can
      get through when every pipe has a capacity — and the answer is set by the tightest bottleneck. In an assignment
      problem, the question is how to pair up agents and tasks so the <em>total</em> is best, which is rarely the same
      as making each individual choice look good.`,
    board: [
      { t: 'A cut is a way of proving flow cannot exceed something', h: `Slice the network so the source is on one side and the sink on the other. Everything that gets through must cross your slice, so the total capacity of the <em>forward</em> arcs crossing it is a ceiling on the flow. Backward arcs point the wrong way and contribute nothing.` },
      { t: 'The tightest cut is the real limit', h: `Every cut gives a ceiling, so the smallest ceiling is the binding one: maximum flow = minimum cut capacity. To be sure you have the minimum, you compare several cuts — and to prove the flow is actually achievable, you show a real flow of that size. A ceiling alone is only half the argument.` },
      { t: 'For assignment, the greedy choice is a trap', h: `Choosing the smallest number in the table first can force a terrible pairing on whatever is left. With three agents there are only six complete assignments, so just list them all and total each. The best <em>total</em> is what is being asked for, not the best individual pairing.` },
      { t: 'The Hungarian algorithm is systematic subtraction', h: `Subtract the smallest entry in each row from that row, then the smallest in each column from that column. Subtracting a constant from a whole row changes every possible total by the same amount, so it cannot change <em>which</em> assignment is best — but it creates zeros, and a set of zeros with one in each row and column is an optimal assignment. If you cannot find such a set, cover the zeros with the fewest lines and adjust.` },
      { t: 'For maximisation, flip it first — then read the answer from the original', h: `The algorithm minimises, so subtract every profit from the largest profit in the table; the best option becomes the cheapest. Solve as a minimisation, then go back to the <strong>original</strong> table to total the profit. The converted total is meaningless as an answer.` }
    ],
    decide: [
      { when: 'Asked the most that can get from source to sink', then: 'Find and compare cuts; the minimum is the maximum flow.' },
      { when: 'Small table, pair agents with tasks, minimise', then: 'List every assignment and total each (3×3 is only six).' },
      { when: 'Larger table, or asked for the algorithm', then: 'Hungarian: row reduce, column reduce, cover zeros, adjust, select.' },
      { when: 'The table holds profits or scores', then: 'Convert with largest − entry, solve, then cost it from the original table.' }
    ],
    misconceptions: [
      { wrong: 'Adding every arc that crosses the cut.', why: 'They all cross it.', right: 'Only forward arcs count. A backward arc carries flow towards the source, so it is not part of the ceiling.' },
      { wrong: '"The cut with the fewest arcs is the minimum cut."', why: 'Fewer arcs looks like less capacity.', right: 'Capacity is the sum, not the count. Three arcs of capacity 2 beat one arc of capacity 20.' },
      { wrong: 'Picking the single smallest entry in the table and building around it.', why: 'It is the cheapest thing available.', right: 'You are minimising the total, not any one entry. Compare complete assignments.' },
      { wrong: 'Reporting the reduced-table total as the answer.', why: 'It is the number at the end of the working.', right: 'The reductions locate the best pairing; the value always comes from the original figures.' }
    ],
    checkpoint: 'Three cuts have capacities 22, 17 and 19. State the maximum flow, and say what else you would need to show before claiming that figure is actually achievable.'
  }
};
