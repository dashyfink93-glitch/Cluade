/**
 * Plain-language explanations, one per topic.
 *
 * The reference material in topics.js is written the way the syllabus writes it.
 * This is the other half: what the idea actually means, in ordinary words, with
 * everyday comparisons a student can hold onto.
 *
 *   hook           a real situation where the idea matters
 *   intuition      the idea in plain words, before any symbols
 *   board          how a teacher thinks it through, step by step
 *   decide         a quick "which method do I use" table
 *   misconceptions the wrong belief, why it feels right, and the fix
 *   checkpoint     one question that shows whether it landed
 */

export const TEACHING = {
  'bivariate-1': {
    hook: 'A school says its new tutoring program works, because 80% of the students who went to it passed. That number on its own tells you nothing. Working out why is this whole topic.',
    intuition: `Bivariate just means you measured two things about the same people. Height and shoe size. Hours of study and test score.
      You only ever ask one question: <em>if I know one, do I know anything about the other?</em>
      That is what association means. Nothing more complicated than that.`,
    board: [
      { t: 'First, what kind of thing is each one?', h: `Ask yourself: could I take an average of this and have it mean something? Average height, sure. Average income, sure. Those are numerical. Average eye colour makes no sense. Average postcode makes no sense either, even though postcodes are written with digits. Those are categorical, which is a long word for "it's a label, not a quantity."` },
      { t: 'Then, which one is doing the explaining?', h: `Pick the one you think is causing the change. That is the explanatory variable. The other one is the response. If you think tutoring changes results, tutoring explains and results respond. You have not proved anything yet. You are just deciding which way round to look at it.` },
      { t: 'Two labels? Compare percentages inside each group', h: `Here is the bit almost everyone gets wrong. Go back to that 80% pass rate. It means nothing until you ask the obvious follow-up: what percentage of the students who <em>did not</em> go to tutoring passed? If that answer is 78%, the program did nothing at all. You need both numbers, and you work each one out inside its own group.` },
      { t: 'Two numbers? Draw the picture first', h: `Plot the points and look at them. Does the cloud slope up or down? Is it a straight line or a curve? Are the points packed tight or sprayed all over? Do this before you touch r, because r only knows about straight lines. Data shaped like a smile can give you r near zero, and if you trusted that number you would report "no pattern" about a picture with an obvious pattern in it.` },
      { t: 'Now you can use r and R²', h: `r sits between −1 and 1. The sign tells you the direction, the size tells you how tight. Square it and you get R², and if you multiply that by 100 you get a percentage. Say the whole sentence out loud: "R² is 0.64, so 64% of the variation in test scores is explained by the straight-line relationship with study hours." Half of that sentence is not worth any marks. All of it is.` }
    ],
    decide: [
      { when: 'Both are labels (categorical)', then: 'Two-way table. Work out percentages inside each group, then compare them.' },
      { when: 'Both are numbers (numerical)', then: 'Scatterplot. Describe direction, shape and tightness, then use r and R².' },
      { when: 'One of each', then: 'Compare the numbers across the groups. Boxplots side by side, or just compare the averages.' }
    ],
    misconceptions: [
      { wrong: '"r = 0.9 means 90% correlation."', why: 'It is a number between 0 and 1, so it looks like a percentage.', right: 'r is not a percentage. Square it first. R² = 0.81, so 81%, and that 81% is about how much of the variation is explained. It is not "how correlated" anything is.' },
      { wrong: '"r is tiny, so nothing is going on."', why: 'r feels like a general strength meter for any kind of relationship.', right: 'r only measures straight lines. A strong curve can give you almost zero. Look at the plot before you trust the number.' },
      { wrong: '"80% of them passed, so it works."', why: 'A big percentage feels like strong evidence all by itself.', right: 'One percentage on its own means nothing. You need the group you are comparing it against.' },
      { wrong: '"There is a strong link, so one causes the other."', why: 'A cause would produce exactly this pattern, so the pattern feels like proof.', right: 'Something else could be causing both. The students who choose to turn up to tutoring might already be the keen ones, and keenness is what is really driving the results.' }
    ],
    checkpoint: 'In a survey, 45 out of 60 country students own a bike, and 40 out of 100 city students do. Is there an association? Show the numbers you used, then say what you still cannot claim.'
  },

  'bivariate-2': {
    hook: 'Your model says a 40-year-old will run 100 metres in negative time. The arithmetic is perfect. The thinking is not.',
    intuition: `Imagine laying a ruler across a cloud of dots and sliding it around until it sits as close to all of them as you can get.
      That is the least-squares line. Everything else in this topic is either building that line, checking a straight line was
      a sensible shape to use, or being careful about what you use it for.`,
    board: [
      { t: 'Build the slope out of the spreads', h: `m = r(s<sub>y</sub> ÷ s<sub>x</sub>) looks made up until you see what it does. The s<sub>y</sub> ÷ s<sub>x</sub> part converts one step of x-spread into one step of y-spread. Then multiplying by r flattens it off, because the relationship is not perfect. Weak relationship, flatter line. If r were exactly 1 the line would be as steep as the spreads allow. If r were 0 it would be flat, and the line would just predict the average every single time.` },
      { t: 'Pin the line down at the middle', h: `c = ȳ − m x̄ is just that same equation rearranged. Every least-squares line goes through the point of means, the balance point of the data. So you get the tilt from the spreads, then slide the line up or down until it sits on that point.` },
      { t: 'The slope is a prediction, not a promise', h: `"Each extra hour of study predicts about 3.2 more marks." That word <em>predicts</em> is doing real work. Not causes. Not exactly. Those two words are the difference between full marks and half of them.` },
      { t: 'Check the residuals before you believe any of it', h: `A residual is how wrong the line was at one point: what you measured, minus what the line said. Plot all of them. If they scatter randomly in a band around zero, a straight line was fine. If they bend into a curve, the real pattern was curved and your straight line is the wrong tool. It does not matter how good r looked.` },
      { t: 'Check where your prediction is standing', h: `Inside the range of x you actually measured, you are on solid ground. That is interpolation. Outside it, you are guessing that the pattern carries on into territory nobody ever looked at. That is extrapolation, and it is how you end up predicting negative sprint times.` }
    ],
    decide: [
      { when: 'You have r, both spreads and both means', then: 'Build the line. Slope first, then the intercept from the means.' },
      { when: 'You have the line and one data point', then: 'Predict with the line, then take measured minus predicted.' },
      { when: 'You are asked whether a prediction can be trusted', then: 'Check x against the range you measured. Name it, then mention the residual plot.' }
    ],
    misconceptions: [
      { wrong: 'Working out predicted minus measured.', why: 'Both orders feel equally natural when you are under time pressure.', right: 'Measured comes first. Get it backwards and every sign flips, so "above the line" turns into "below the line".' },
      { wrong: 'Dividing s<sub>x</sub> by s<sub>y</sub>.', why: 'The formula looks symmetrical, so it is easy to write down the wrong way round.', right: 'The y spread goes on top. Then look at your answer and ask whether a slope that size makes sense for this data.' },
      { wrong: '"The intercept is y when x is 0, so I should say what it means."', why: 'It is a perfectly true statement about the equation.', right: 'Only if x = 0 makes sense here. A car that is 0 years old costs $28 000, fine. A person who is 0 cm tall weighs −45 kg, not fine. Say the intercept sits outside the sensible range.' },
      { wrong: '"The residual plot curves, but r was 0.9, so the model is good."', why: 'A high r feels like the final verdict.', right: 'The residual plot wins. A curve in the residuals means a straight line was the wrong shape, however tightly the points cluster.' }
    ],
    checkpoint: 'A line fitted to children aged 5 to 12 is ŷ = 6x + 40, with height in cm. Predict the height of a 30-year-old, then say in one sentence why you would never report that number.'
  },

  'time-series': {
    hook: 'Ice-cream sales always jump in summer. So when December sales go up, has the business actually grown, or is it just December doing what December does?',
    intuition: `Anything measured over time is really three things stacked on top of each other. There is the long slow direction it is
      heading. There is the pattern that repeats every year. And there is random noise. The whole topic is about pulling those
      apart, because you cannot tell whether a business is growing until you take the calendar out of the numbers.`,
    board: [
      { t: 'Smooth it first, so you can see the direction', h: `A moving average swaps each value for the average of itself and its neighbours. The jumpy bits cancel out and the direction shows through. Use an odd number of values so the answer lands on a real time point. A 3-point mean centred at time 4 uses times 3, 4 and 5, and it belongs at time 4. Put it at time 3 and you have quietly slid your whole series sideways.` },
      { t: 'Compare each season to a normal one', h: `A seasonal index answers "how does this season compare to average?", written as a multiplier. 1.30 means this quarter usually runs 30% above the yearly average. 0.85 means 15% below. Over one full cycle they average out to 1, so four quarterly indexes add up to 4 and twelve monthly ones add up to 12. That is how you find a missing one.` },
      { t: 'Take the season out by dividing', h: `December sales of $130 000 with an index of 1.30 are really $100 000 of ordinary trading that happened to land in December. Divide, and now you can compare December against June honestly. Now the trend line has something sensible to work with.` },
      { t: 'Fit the line to the tidied-up numbers', h: `This is the step people skip. If you fit a line to the raw data, the line spends all its time fighting the seasonal zigzag. Take the season out first, then fit, and the line tells you the actual direction.` },
      { t: 'Predict, then put the season back', h: `Use the line to predict the period you want, then multiply by that period's index. And say what you assumed out loud: that the trend keeps going and the seasonal pattern holds. A forecast with no caveat loses a mark nearly every time.` }
    ],
    decide: [
      { when: 'Asked to smooth, or to find the direction', then: 'Moving mean or median with an odd number of terms, written at the centre.' },
      { when: 'Turning a raw figure into a comparable one', then: 'Divide by the seasonal index.' },
      { when: 'Turning a trend prediction into a real forecast', then: 'Multiply by the seasonal index, then say what you assumed.' },
      { when: 'Given all the indexes but one', then: 'They add to the number of seasons. Subtract to find the missing one.' }
    ],
    misconceptions: [
      { wrong: 'Multiplying by the index to take the season out.', why: 'Both operations use the same two numbers, so under pressure it is a coin flip.', right: 'Taking it out divides. Putting it back multiplies. Quick check: if the index is above 1, your tidied-up figure has to come out lower than the raw one.' },
      { wrong: '"Sales rise every December, so the trend is upward."', why: 'On the raw plot a repeating rise genuinely looks like growth.', right: 'If it repeats on the calendar it is the season, not the trend. The trend is whatever is left once you take the repetition away.' },
      { wrong: 'Writing a moving average at the first time in its window.', why: 'That is the natural reading order, left to right.', right: 'It goes in the middle. That is the entire reason for using an odd number of terms.' },
      { wrong: 'Building a one-off event into the seasonal pattern.', why: 'It shows up as a big deviation, and indexes are built from deviations.', right: 'A flood or a strike is random noise. It does not come back every year, so it must not go into the index.' }
    ],
    checkpoint: 'Quarterly indexes are Q1 0.80, Q2 0.95, Q3 1.45 and Q4 missing. Find Q4. Then take the season out of a Q3 figure of $87 000, and say in plain words what the answer means.'
  },

  'sequences': {
    hook: 'Two phone plans. One adds $12 a month. The other goes up by 12% a month. In month one they look the same. By month twenty, one costs three times the other.',
    intuition: `Every sequence here does the exact same thing at every step. Either it <strong>adds</strong> the same amount each time,
      which draws a straight line of dots, or it <strong>times</strong> by the same number each time, which draws a curve that
      keeps getting steeper. Your first job on any question is working out which one you have, and you do that by testing both.`,
    board: [
      { t: 'Test for adding, then test for timesing', h: `Subtract each term from the next one. Same answer every time? It adds, so it is arithmetic, and that number is d. If the subtractions do not match, try dividing instead. Same answer every time? It times, so it is geometric, and that number is r. Do both tests. Do not guess from a glance.` },
      { t: 'Turn the percentage into a multiplier straight away', h: `This is where most marks disappear. "Goes up 8% a year" means times by 1.08. "Loses 18% a year" means you keep 82% of it, so times by 0.82. Write r = 1.08 or r = 0.82 down before you do anything else and you have wiped out the single most common mistake in the topic.` },
      { t: 'Count the steps, not the terms', h: `The formula has (n − 1) in it for a reason. Getting from term 1 to term 5 takes four steps, not five. Same idea with money: if a machine is worth $48 000 at the end of year 1 and you want the end of year 6, that is five drops in value, so the power is 5.` },
      { t: 'A recurrence needs a starting point', h: `t<sub>n+1</sub> = 0.82 t<sub>n</sub> on its own describes infinitely many sequences. It only becomes <em>yours</em> once you also say t<sub>1</sub> = 48 000. Write the starting value every time, or the answer is not finished.` },
      { t: 'Remember these are dots, not a line', h: `Term 3.5 does not exist. You can draw a line through the points to show the shape, but the sequence itself only exists at whole numbers.` }
    ],
    decide: [
      { when: 'It changes by a fixed amount (+$50, −3 kg)', then: 'Arithmetic. Use tₙ = t₁ + (n − 1)d.' },
      { when: 'It changes by a percentage, or by a multiplier', then: 'Geometric. Use tₙ = t₁r^(n−1).' },
      { when: 'You are given a list and asked for the rule', then: 'Test the subtractions, then the divisions. Give the rule and the starting value.' }
    ],
    misconceptions: [
      { wrong: 'Using 18 instead of 0.18, or 0.18 instead of 0.82.', why: 'The question says 18%, so 18 is the number sitting right there in front of you.', right: 'Turn it into a decimal, then decide whether you want the bit that goes (0.18) or the bit that stays (0.82). For things losing value you nearly always want the bit that stays.' },
      { wrong: 'Using n where the formula wants n − 1.', why: 'Term 6 feels like it should have a 6 in it somewhere.', right: 'Count how many steps you took from the first term. Term 6 is five steps along.' },
      { wrong: '"It goes up by more every year, so d is getting bigger."', why: 'The gaps genuinely are getting bigger, so it is a fair thing to notice.', right: 'Growing gaps are the fingerprint of a geometric sequence, not an arithmetic one with a changing d. Check the divisions instead.' },
      { wrong: 'Assuming the percentage plan is ahead from the start.', why: 'Exponential growth gets described as fast, so it sounds like it wins immediately.', right: 'Percentage growth starts slower and overtakes later. Which one is ahead at term 10 is something you work out, not something you assume.' }
    ],
    checkpoint: 'A $2 400 laptop loses 25% of its value each year. Write the rule, then find what it is worth at the end of year 4. Say how many drops in value that is.'
  },

  'earth-geometry': {
    hook: 'You leave Sydney at 9pm on Tuesday, fly for 14 hours, and land in Los Angeles at 6pm on Tuesday. You got there before you left.',
    intuition: `Two different ideas share this topic. One is measuring distance on a ball, where how far apart two places are depends
      on <em>where</em> on the ball you measure. The other is time zones, which happen because the Earth spins once every 24 hours.
      Longitude ties them together. The same lines that say how far east you are also set your clock.`,
    board: [
      { t: 'Read the coordinates before you pick anything', h: `Same longitude means both places sit on the same line running north to south. Same latitude means they sit on the same ring running east to west. Which one matches decides your formula, so check it first, every single time.` },
      { t: 'Going north or south, every degree is worth the same', h: `The lines running north to south are all full circles around the Earth, all the same size. So one degree is about 111.2 km no matter where you are. Multiply 111.2 by the difference in latitude. Same side of the equator, subtract. Opposite sides, add, because you are crossing the middle.` },
      { t: 'Going east or west, degrees shrink as you go towards the poles', h: `Picture the rings around a globe. The one at the equator is huge. The one near the North Pole is tiny enough to step over. So one degree of longitude covers much less ground at 60° than it does at the equator. The cos θ does that shrinking for you. At the equator cos 0° = 1 and nothing shrinks. At 60°, cos 60° = 0.5, so distances halve.` },
      { t: 'Turn longitude into time', h: `360° in 24 hours works out to 15° per hour. Further east means further ahead. Real time zones are decided by governments rather than geometry, so questions usually hand you a UTC offset instead.` },
      { t: 'For any trip, go through UTC', h: `Trying to do the time difference and the flight time in one move is how people lose a whole day. Do it in three. Convert the departure to UTC. Add the flight time while you are in UTC. Convert to the destination's local time. Flight time is the same everywhere, so only the conversions need care. Then count the day changes.` }
    ],
    decide: [
      { when: 'The longitudes match', then: 'D = 111.2 × difference in latitude. No cosine anywhere.' },
      { when: 'The latitudes match', then: 'D = 111.2 × cos(latitude) × difference in longitude.' },
      { when: 'Converting a clock time between two places', then: 'Destination offset minus origin offset. Apply it, then check the date.' },
      { when: 'A trip with a flight time', then: 'Local, then UTC, add the flight, then local again. Never all at once.' }
    ],
    misconceptions: [
      { wrong: 'Subtracting latitudes that are on opposite sides of the equator.', why: 'Subtracting is what you normally do to find a difference.', right: '12°N to 27°S is 39° apart, not 15°. Sketch the equator between them and it becomes obvious.' },
      { wrong: 'Using cos on a north-south problem.', why: 'The version with cos in it looks like the more complete formula.', right: 'North-south distance never shrinks, because those circles are all the same size. The cosine only belongs to east-west distance.' },
      { wrong: 'Leaving the calculator in radians.', why: 'It hands you a believable-looking number instead of an error.', right: 'cos(28°) is about 0.88. If your calculator says −0.96 you are in radians, and every distance after that is wrong.' },
      { wrong: 'Getting the time right and forgetting the day.', why: 'The arithmetic finishes and the answer looks complete.', right: 'The day is part of the answer. Crossing midnight either way changes it, and a long flight west can land you on the day before you left.' }
    ],
    checkpoint: 'Two towns sit at 35°S, 140°E and 35°S, 149°E. Find the distance between them. Then say how much further apart they would be if they sat on the equator instead, and why.'
  },

  'finance-1': {
    hook: 'Two lenders both advertise 6% per annum. One of them costs you $180 a year more than the other. Nothing in the advertised rate tells you which.',
    intuition: `All of this comes from one idea. Money left alone grows by a percentage each period, and each period's growth is worked
      out on the <em>new</em> balance, not the original. The formulas just package that up for different situations: a lump sum
      sitting there growing, a debt you are paying off, two loans quoted in ways that are hard to compare. Get the period right
      and the rest follows.`,
    board: [
      { t: 'Match the rate to the period. Always. First.', h: `If interest is worked out monthly then i is the <em>monthly</em> rate and n counts <em>months</em>. 6% a year compounded monthly gives i = 0.06 ÷ 12 = 0.005, and 5 years gives n = 60. Write both down before you touch a formula. Almost every wrong answer in this topic starts with a yearly rate sitting next to a monthly n.` },
      { t: 'A is the total, not the interest', h: `A = P(1 + i)<sup>n</sup> tells you what the account is worth altogether. If the question asks how much interest you <em>earned</em>, you still have to take the original amount off. Read the question again before you write the last line.` },
      { t: 'The effective rate is how you compare two offers', h: `6% compounded monthly is a better deal for a saver than 6% compounded yearly, because the monthly one earns interest on its own interest eleven extra times. The effective rate turns any quoted rate into the true one-year growth, which is the only fair way to compare. Do not forget the "− 1" at the end. Without it you have the multiplier, not the rate.` },
      { t: 'On a loan, interest goes on first, then your payment comes off', h: `A<sub>n+1</sub> = (1 + i)A<sub>n</sub> − d. Read it left to right in that order. The bank adds a month of interest to what you owe, and then your repayment comes off what is left. Doing it the other way round makes the debt look smaller than it is. And carry the unrounded balance to the next line.` },
      { t: 'Use the annuity formula when you want the whole schedule at once', h: `If the question is "what repayment clears this loan in exactly 60 payments?", stepping through a recurrence sixty times is hopeless. The present-value annuity formula connects the amount borrowed straight to the repayment, so you rearrange for d. Watch the minus sign on the power. A plus there gives you a wrong answer that still looks perfectly reasonable.` }
    ],
    decide: [
      { when: 'A lump sum sitting there, nothing going in or out', then: 'A = P(1 + i)ⁿ.' },
      { when: 'Comparing two rates with different compounding', then: 'Work out the effective annual rate for each.' },
      { when: 'A debt with regular payments, and you want the balance after a few', then: 'Step through the recurrence.' },
      { when: 'A debt with regular payments, and you want the payment itself', then: 'Present-value annuity formula, rearranged for d.' }
    ],
    misconceptions: [
      { wrong: 'Using the yearly rate with a monthly n.', why: 'The rate in the question is a yearly one, so it feels like the rate to use.', right: 'Divide by how many times a year it compounds. The rate and n always have to agree on the time unit.' },
      { wrong: 'Writing down A when the question wanted the interest.', why: 'A is the number the formula gives you, so it feels like the answer.', right: 'Interest is A − P. Underline what the question actually asked for before you start.' },
      { wrong: 'Rounding the balance to the nearest cent on every line.', why: 'Money comes in cents, so rounding to cents looks like the right thing to do.', right: 'Round the final answer only. Rounding every line piles up error across a long loan.' },
      { wrong: 'Using +n instead of −n in the annuity formula.', why: 'A negative power looks like a typo.', right: 'The negative power is what brings future payments back to today. Use +n and the answer is wrong but still believable, which is why this one so often slips through.' }
    ],
    checkpoint: 'A $20 000 loan charges 7.2% a year compounded monthly, with $400 repayments. Write down i, write down n for 5 years, and write the recurrence. Then say, without calculating, whether the first repayment takes more or less than $400 off the debt.'
  },

  'finance-2': {
    hook: 'Put away $200 a month for 30 years at 5% and you will have handed over $72 000. The account will hold about $166 000. The rest was never yours to deposit.',
    intuition: `The last topic was money you already had, or money you owed. This is money you are <em>building up</em>. Equal deposits,
      over and over, each one earning interest for however long it has left. The only genuinely new idea is a perpetuity: a pot
      so big that the interest alone covers the payments, so you never touch the pot itself.`,
    board: [
      { t: 'Work out which of the three you are looking at', h: `Money borrowed now and cleared by future payments is present value. Deposits now building to a total later is future value. A payment that goes on forever without shrinking the pot is a perpetuity. Choosing the wrong one costs more marks than any arithmetic slip, so say which one it is in words before you reach for a formula.` },
      { t: 'Saving adds, borrowing subtracts', h: `A<sub>n+1</sub> = (1 + i)A<sub>n</sub> + d. Interest goes on first, then your deposit lands on top. That single plus sign is the whole difference from a loan, and it is worth saying to yourself each time. A loan takes money off the balance. A savings plan puts money on.` },
      { t: 'The interest is whatever you did not put in', h: `A<sub>FV</sub> is the entire balance. To find the interest, take off every deposit you made. Students hand in the balance as the interest all the time, and in the example at the top that overstates it by $72 000.` },
      { t: 'A perpetuity just means "only spend the interest"', h: `A = d ÷ i looks abstract until you flip it round: d = A × i. The payment is exactly one period's interest on the pot. Take that much and the balance goes right back to where it started, ready to do the same next period, forever. Take one dollar more and you are eating the pot.` },
      { t: 'Rearranging is normal in this topic', h: `Questions often give you the target and ask what you need to put away. There is no separate formula for that. It is the same one solved for d. Work out the bracketed factor, then divide the target by it. And round a required deposit <em>up</em>, because rounding down leaves you short of the target.` }
    ],
    decide: [
      { when: 'Regular deposits building towards a total', then: 'Future-value annuity.' },
      { when: 'Regular payments clearing something borrowed now', then: 'Present-value annuity, back in Topic 1.' },
      { when: 'A payment funded forever by interest alone', then: 'Perpetuity. A = d ÷ i.' },
      { when: 'You are given the end balance and asked for the payment', then: 'Same formula, rearranged for d.' }
    ],
    misconceptions: [
      { wrong: 'Using the present-value formula for a savings plan.', why: 'They are both called annuity formulas and they look alike on the page.', right: 'Present value works backwards to today. Future value works forwards to the end. Ask yourself which end of time the money is sitting at.' },
      { wrong: 'Reporting the final balance as the interest earned.', why: 'It is the number the formula hands you.', right: 'Take off the total of your deposits first.' },
      { wrong: '"A perpetuity must slowly run out."', why: 'Taking money out of an account normally makes it smaller.', right: 'You only take the interest, so the pot never moves. That is exactly why the payment can go on forever.' },
      { wrong: 'Using a yearly rate with a monthly payment.', why: 'The rate is quoted per year, so that is the number in front of you.', right: 'The rate has to match the payment period. Get it wrong and the pot you need is out by a factor of twelve.' }
    ],
    checkpoint: 'A fund holds $300 000 at 4.8% a year compounded monthly. Find the biggest monthly payment it can make forever. Then say what would happen if the trustees paid out $1 500 a month instead.'
  },

  'graphs-networks': {
    hook: 'A postie wants to walk down every street once and finish back at the van. Whether that is even possible has nothing to do with the map, and everything to do with counting.',
    intuition: `A graph throws away everything except what connects to what. Distances, angles, where things sit on the page: none of it
      matters. Only the dots and the lines between them. That is why the same picture works for roads, friendships, pipes and
      flight routes.`,
    board: [
      { t: 'Learn the words properly, because they get examined', h: `The degree of a dot is how many line-ends touch it. A loop touches twice. A <em>walk</em> is any journey at all. A <em>trail</em> never reuses a line. A <em>path</em> never revisits a dot. A <em>circuit</em> is a trail that gets back to where it started. A <em>cycle</em> is a path that does the same. When a question asks which word fits, it wants the fussiest one that is still true.` },
      { t: 'Read a matrix as "how many lines from this row to this column"', h: `For an ordinary graph the matrix is symmetric, because a line joins both ways. The diagonal is zero unless there are loops. Add up a row and you have that dot's degree. Add up the whole thing and halve it and you have the number of lines.` },
      { t: 'Every line has two ends, so degrees count everything twice', h: `That gives you a fast way to count lines, and a free check on your own work. It also means the number of odd dots is always even. If you counted three, you counted wrong.` },
      { t: "Euler's formula needs the graph connected and flat", h: `v + f − e = 2. Flat means you can redraw it with no lines crossing. And the regions include the endless one outside the drawing, which is the thing people forget more than anything else in this topic.` },
      { t: 'Eulerian is about lines. Hamiltonian is about dots.', h: `Can you use every <strong>line</strong> exactly once? Count the odd dots. None means yes, and you finish where you started. Exactly two means yes, but you have to start at one odd dot and finish at the other. Four or more means no. Can you visit every <strong>dot</strong> exactly once? There is no counting trick for that one. You have to build routes and compare them. Keeping those two apart is most of this topic.` }
    ],
    decide: [
      { when: 'Asked about using every road or line once', then: 'Eulerian. Count the odd-degree dots.' },
      { when: 'Asked about visiting every town or dot once', then: 'Hamiltonian. No shortcut. Build routes and compare.' },
      { when: 'Given a flat drawing and asked to count regions', then: "Euler's formula, and count the outside one." },
      { when: 'Asked for the quickest way between two dots', then: 'List the sensible routes, add up each one, give the route and the total.' }
    ],
    misconceptions: [
      { wrong: 'Using the odd-dot test on a Hamiltonian question.', why: 'It is the only test in the topic, so it gets used everywhere.', right: 'The counting test only works for Eulerian trails. Hamiltonian questions need you to build and compare.' },
      { wrong: 'Forgetting the outside region.', why: 'You can only see the ones with edges around them.', right: 'The endless space around the drawing is a region too. Count the enclosed ones and add one.' },
      { wrong: 'Treating a crossing point as a dot.', why: 'It looks like a junction on the page.', right: 'Only marked dots count. Two lines crossing is usually just how it got drawn, and often the graph can be redrawn with no crossings at all.' },
      { wrong: 'Answering a shortest-route question with just a number.', why: 'The number is what you calculated.', right: 'Give the route as well. The question is asking which way to go, not only how far it is.' }
    ],
    checkpoint: 'A connected graph has degrees 2, 3, 3, 4, 4. Can a postie walk every line exactly once? If so, where do they have to start and finish, and can they get back to the van?'
  },

  'networks-1': {
    hook: 'A project has forty tasks. Speed up the wrong one and you have spent money for nothing. The finish date will not move by a single day.',
    intuition: `Two separate problems live in this topic. One is joining everything up as cheaply as you can. The other is scheduling,
      where tasks wait on other tasks, and the finish date is set by the <em>longest</em> chain of waiting. Everything not on that
      chain has slack.`,
    board: [
      { t: 'A tree is "joined up with nothing spare"', h: `No loops, and on v dots exactly v − 1 lines. That count tells you when to stop building. Six sites means five cables, and if you find yourself with six you have made a loop somewhere.` },
      { t: 'Build the cheapest network greedily, but watch for loops', h: `Take the cheapest line, then the next cheapest, and skip any line whose two ends are already joined up to each other. That line would close a loop and cost money without connecting anything new. Stop at v − 1. Being greedy actually gives you the best answer here, which is not true of most problems like this.` },
      { t: 'For scheduling, the longest way through wins', h: `This is the opposite of the shortest-route work you just did, and the switch catches people out. The project cannot finish until every chain of waiting has finished, so the longest chain sets the date. That chain is the critical path.` },
      { t: 'Go forwards for the earliest times', h: `A task can only start once everything it waits on is done, so its earliest start is the <strong>biggest</strong> of its predecessors' earliest finishes. Work left to right. The biggest finish at the end is how long the project takes.` },
      { t: 'Go backwards for the latest times, then find the slack', h: `Start from the project length and work right to left. A task's latest finish is the <strong>smallest</strong> of its successors' latest starts. Smallest, because it must not hold up any of them. Then slack is latest start minus earliest start. Zero slack means the task is critical.` }
    ],
    decide: [
      { when: 'Join every site as cheaply as possible', then: 'Cheapest lines first, no loops, stop at v − 1.' },
      { when: 'How long will the project take?', then: 'Longest way through. Work forwards.' },
      { when: 'Can this task be delayed?', then: 'Slack is latest start minus earliest start.' },
      { when: 'Would speeding this task up help?', then: 'Only if its slack is zero, and only until another chain becomes the longest.' }
    ],
    misconceptions: [
      { wrong: 'Using the shortest way through for project length.', why: 'Shortest-route work is fresh from the topic before.', right: 'Scheduling uses the longest way. Every chain has to finish, so the slowest one decides the date.' },
      { wrong: 'Taking the biggest of the successors on the way back.', why: 'The forward pass used the biggest, so it feels like the backward one should too.', right: 'Going backwards you take the smallest. The task has to finish early enough for whichever successor is tightest.' },
      { wrong: 'Adding the cheapest line left without checking.', why: 'Greedy sounds like it means "always take the cheapest".', right: 'Skip any line whose ends are already joined. It closes a loop and buys you nothing.' },
      { wrong: '"Speeding up any task shortens the project."', why: 'It is obviously faster work getting done.', right: 'Only the critical tasks control the date. And once you shorten one enough, a different chain becomes the longest and the saving stops.' }
    ],
    checkpoint: 'Three chains through a project run 19, 24 and 24 days. Give the project length and the critical path or paths. Then say what the slack is on a task that only sits on the 19-day chain.'
  },

  'networks-2': {
    hook: 'Four drivers, four routes, and 24 ways to pair them up. Giving the best driver the best route first will often hand you the worst total.',
    intuition: `Both halves of this topic are about limits and choices. In a flow network you ask how much can get through when every pipe
      has a size limit, and the answer is set by the tightest squeeze anywhere along the way. In an assignment problem you ask how
      to pair people with jobs so the <em>total</em> comes out best, which is hardly ever the same as making each single choice
      look good.`,
    board: [
      { t: 'A cut is a way of proving the flow cannot beat some number', h: `Slice the network so the start is on one side and the end is on the other. Everything getting through has to cross your slice, so adding up the <em>forward</em> arrows crossing it gives you a ceiling. Arrows pointing the wrong way do not count at all.` },
      { t: 'The tightest slice is the real limit', h: `Every slice gives you a ceiling, so the smallest ceiling is the one that actually binds. Maximum flow equals the smallest cut. To be sure you found the smallest, compare a few. And to prove that much can genuinely get through, show an actual flow of that size. A ceiling on its own is only half the argument.` },
      { t: 'For assignment, being greedy is a trap', h: `Grabbing the smallest number in the table can force a terrible pairing on whatever is left over. With three people there are only six ways to do it, so list all six and add up each one. What is being asked for is the best <em>total</em>, not the best single pairing.` },
      { t: 'The Hungarian algorithm is organised subtracting', h: `Take the smallest number in each row off that whole row, then do the same down each column. Taking a constant off a whole row changes every possible total by the same amount, so it cannot change <em>which</em> pairing is best. What it does do is create zeros. A set of zeros with one in every row and column is your answer. If you cannot find such a set, cover the zeros with as few lines as you can, then adjust and try again.` },
      { t: 'To maximise, flip it first, then read the answer off the original', h: `The algorithm only minimises, so take every profit away from the biggest profit in the table. The best option turns into the cheapest one. Solve it as a minimising problem, then go back to the <strong>original</strong> table to add up the profit. The total from the flipped table means nothing.` }
    ],
    decide: [
      { when: 'Asked the most that can get from start to end', then: 'Find and compare cuts. The smallest one is the maximum flow.' },
      { when: 'Small table, pair people with jobs, make the total small', then: 'List every pairing and add each one up. Three by three is only six.' },
      { when: 'Bigger table, or the question names the algorithm', then: 'Hungarian. Rows, columns, cover the zeros, adjust, pick.' },
      { when: 'The table holds profits or scores', then: 'Flip with biggest minus entry, solve, then total it from the original table.' }
    ],
    misconceptions: [
      { wrong: 'Adding up every arrow that crosses the slice.', why: 'They all cross it, so they all look relevant.', right: 'Only the forward ones count. An arrow pointing back towards the start is not part of the ceiling.' },
      { wrong: '"The slice with the fewest arrows is the smallest cut."', why: 'Fewer arrows looks like less capacity.', right: 'Capacity is the total, not the count. Three pipes of size 2 let less through than one pipe of size 20.' },
      { wrong: 'Finding the smallest number in the table and building around it.', why: 'It is the cheapest thing available, so it looks like a good start.', right: 'You are making the total small, not any one entry. Compare whole pairings.' },
      { wrong: 'Handing in the total from the reduced table.', why: 'It is the number sitting at the end of your working.', right: 'The subtracting only finds you the right pairing. The value always comes from the original numbers.' }
    ],
    checkpoint: 'Three cuts have capacities 22, 17 and 19. Give the maximum flow. Then say what else you would have to show before claiming that figure can actually be reached.'
  }
};
