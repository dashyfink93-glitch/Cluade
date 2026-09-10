/** Seeded, reproducible pseudo-randomness so any generated question can be shared by URL. */

/** mulberry32 — small, fast, good enough for question parameters. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.seed = seed >>> 0;
    this._next = mulberry32(this.seed);
  }
  /** Float in [0, 1). */
  next() { return this._next(); }
  /** Integer in [min, max] inclusive. */
  int(min, max) { return min + Math.floor(this.next() * (max - min + 1)); }
  /** Multiple of `step` in [min, max]. */
  step(min, max, step) {
    const n = Math.floor((max - min) / step);
    return min + step * this.int(0, n);
  }
  /** Float in [min, max] rounded to dp decimal places. */
  float(min, max, dp = 2) {
    const f = 10 ** dp;
    return Math.round((min + this.next() * (max - min)) * f) / f;
  }
  pick(arr) { return arr[this.int(0, arr.length - 1)]; }
  /** n distinct items from arr, order randomised. */
  sample(arr, n) { return this.shuffle(arr.slice()).slice(0, n); }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  bool(p = 0.5) { return this.next() < p; }
  /** ± 1 */
  sign() { return this.bool() ? 1 : -1; }
}

export function randomSeed() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 0xFFFFFFFF);
}
