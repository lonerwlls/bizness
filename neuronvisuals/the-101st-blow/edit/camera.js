import { add, sub, mul, lerp, mix, io, norm, cross, dot } from "./vec.js";
import { SHOTS, ST } from "./timing.js";
const P = (i) => [ST[i].x, 0, ST[i].z];
const PLANS = {
  wide: (s) => ({ ro: [2.4 - 0.006 * s, 7.6, 10.0], ta: [-1.25, 0.3, -5.2], lens: 1.3 }),
  wide2: (s) => ({ ro: [-4.8, 7.5, 6.0], ta: [0.6, 0.2, -3.5], lens: 1.45 }),
  side: (s, p) => (p[2] < -3 && p[2] > -5 ? { ro: add(p, [-0.6 + 0.002 * (s % 200), 2.4, -7.8]), ta: add(p, [-1.1, 1.0, 0]), lens: 1.0 } : { ro: add(p, [-0.6 + 0.002 * (s % 200), 2.4, 7.8]), ta: add(p, [-1.1, 1.0, 0]), lens: 1.0 }),
  low: (s, p) => ({ ro: add(p, [0.9, 0.45, 3.4]), ta: add(p, [-1.2, 1.35, 0]), lens: 1.0 }),
  ots: (s, p) => ({ ro: add(p, [-4.9 + 0.004 * (s % 300), 2.3, 2.6]), ta: add(p, [-0.6, 1.15, 0]), lens: 1.1 }),
  top: (s, p) => ({ ro: add(p, [-3.0, 3.6, 3.4]), ta: add(p, [-0.3, 0.95, 0]), lens: 1.2 }),
};
const plan = (k, s) => PLANS[SHOTS[k][2]](s, P(SHOTS[k][3]));
export function cameraAt(s) {
  let k = 0; while (k + 1 < SHOTS.length && s >= SHOTS[k + 1][0]) k++;
  let c = plan(k, s);
  const [s0, Tt] = SHOTS[k];
  if (k > 0 && Tt > 0 && s < s0 + Tt) { const p = plan(k - 1, s), e = io((s - s0) / Tt); c = { ro: lerp(p.ro, c.ro, e), ta: lerp(p.ta, c.ta, e), lens: mix(p.lens, c.lens, e) }; }
  return c;
}
export function projector(c) {
  const ww = norm(sub(c.ta, c.ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww);
  return (X) => { const v = sub(X, c.ro), zc = dot(v, ww); const z = Math.max(zc, 0.05); const s = (c.lens * 1920) / z; return { x: 540 + dot(v, uu) * s, y: 960 - dot(v, vv) * s, k: s, z: zc }; };
}
