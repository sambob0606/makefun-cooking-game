// A tiny seeded random source so a ?seed=N visit always deals the same orders.
// One file, one job: deterministic numbers, nothing else.
export function createRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    int(max) {
      return Math.floor(next() * max);
    },
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
