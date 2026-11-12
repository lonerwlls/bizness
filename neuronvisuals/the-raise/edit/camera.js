import { add, sub, mul, lerp, mix, io, norm, cross, dot } from "./vec.js";
import { SHOTS, N } from "./timing.js";
import { heroX } from "./people.js";
const loopDrift = (f) => 0.004 * (f < 450 ? f : f - N);   // в кадре 900 то же, что в кадре 0
const PLANS = {
  sideLow: (f, x) => ({ ro: [x + 0.6 - loopDrift(f), 1.15, 4.6], ta: [x - 0.4, 1.75, 0], lens: 1.1 }),
  front: (f, x) => ({ ro: [x - 4.4, 1.9, 1.5 - 0.006 * (f - 84)], ta: [x, 1.6, 0], lens: 1.2 }),
  itemCome: (f, x) => ({ ro: [x + 1.7, 1.75, 3.1], ta: [x - 1.0, 1.45, 0], lens: 1.0 }),
  top: (f, x) => ({ ro: [x + 1.0 - 0.006 * (f - 176), 4.6, 2.8], ta: [x - 0.6, 1.25, 0], lens: 0.95 }),
  close: (f, x) => ({ ro: [x - 2.0, 1.85, 2.4 + 0.004 * (f - 226)], ta: [x, 2.0, 0], lens: 1.15 }),
  itemCome2: (f, x) => ({ ro: [x + 1.8, 2.3, -3.2], ta: [x - 0.7, 1.75, 0], lens: 0.95 }),
  sideHigh: (f, x) => ({ ro: [x + 0.4, 2.6, 5.4 - 0.004 * (f - 356)], ta: [x - 0.4, 2.15, 0], lens: 0.95 }),
  front2: (f, x) => ({ ro: [x - 3.8, 2.8, 1.2 + 0.006 * (f - 430)], ta: [x, 2.3, 0], lens: 1.0 }),
  closeStruggle: (f, x) => ({ ro: [x - 2.2, 2.1, 2.4 + 0.003 * (f - 470)], ta: [x, 2.35, 0], lens: 1.05 }),
  top2: (f, x) => ({ ro: [x + 1.2, 5.6, 3.0], ta: [x - 0.4, 1.6, 0], lens: 0.95 }),
  sideLow2: (f, x) => ({ ro: [x + 0.8, 1.2, 4.3], ta: [x - 0.2, 1.95, 0], lens: 1.05 }),
  slideWatch: (f, x) => ({ ro: [-2.2, 1.7, 3.6], ta: [x + 0.3, 1.6, 0], lens: 1.1 }),
  reveal: (f, x) => ({ ro: [1.2 + 0.003 * (f - 704), 32, 20], ta: [0.8, 0.6, 0.8], lens: 0.9 }),
};
export function cameraTrack() {
  const out = [];
  for (let f = 0; f <= N; f++) {
    const x = heroX(Math.min(f, N));
    let k = 0; while (k + 1 < SHOTS.length && f >= SHOTS[k + 1][0]) k++;
    let c = PLANS[SHOTS[k][2]](f, x);
    const [s0, Tt] = SHOTS[k];
    if (k > 0 && Tt > 0 && f < s0 + Tt) { const p = PLANS[SHOTS[k - 1][2]](f, x), e = io((f - s0) / Tt); c = { ro: lerp(p.ro, c.ro, e), ta: lerp(p.ta, c.ta, e), lens: mix(p.lens, c.lens, e) }; }
    out.push(c);
  }
  return out;
}
export function projector(c) {
  const ww = norm(sub(c.ta, c.ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww);
  return (X) => { const v = sub(X, c.ro), zc = dot(v, ww); const z = Math.max(zc, 0.05); const s = (c.lens * 1920) / z; return { x: 540 + dot(v, uu) * s, y: 960 - dot(v, vv) * s, k: s, z: zc }; };
}
