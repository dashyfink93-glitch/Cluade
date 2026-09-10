/** localStorage helpers. Every read and write is guarded — storage can be blocked entirely. */

const KEY = 'gm-hub:v1';

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}

export function get(path, fallback) {
  const data = readAll();
  return path in data ? data[path] : fallback;
}

export function set(path, value) {
  const data = readAll();
  data[path] = value;
  return writeAll(data);
}

export function update(path, fallback, fn) {
  const next = fn(get(path, fallback));
  set(path, next);
  return next;
}

export function clearAll() {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}

/* ---- Mastery targets ---- */
export const mastery = {
  isDone: (topicId, i) => Boolean(get('mastery', {})[`${topicId}:${i}`]),
  toggle(topicId, i, on) {
    return update('mastery', {}, m => ({ ...m, [`${topicId}:${i}`]: on }));
  },
  countFor(topicId, total) {
    const m = get('mastery', {});
    let n = 0;
    for (let i = 0; i < total; i++) if (m[`${topicId}:${i}`]) n++;
    return n;
  },
  all: () => get('mastery', {})
};

/* ---- Practice statistics ---- */
export const stats = {
  read: () => get('stats', { attempted: 0, correct: 0, streak: 0, bestStreak: 0, byTopic: {} }),
  record(topicId, wasCorrect) {
    return update('stats', { attempted: 0, correct: 0, streak: 0, bestStreak: 0, byTopic: {} }, s => {
      const t = s.byTopic[topicId] || { attempted: 0, correct: 0 };
      t.attempted++;
      if (wasCorrect) t.correct++;
      const streak = wasCorrect ? s.streak + 1 : 0;
      return {
        attempted: s.attempted + 1,
        correct: s.correct + (wasCorrect ? 1 : 0),
        streak,
        bestStreak: Math.max(s.bestStreak || 0, streak),
        byTopic: { ...s.byTopic, [topicId]: t }
      };
    });
  },
  reset() { set('stats', { attempted: 0, correct: 0, streak: 0, bestStreak: 0, byTopic: {} }); }
};
