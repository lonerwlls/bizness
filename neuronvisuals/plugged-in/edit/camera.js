import { add, sub, mul, lerp, mix, io, norm, cross, dot } from "./vec.js";
import { SHOTS, N, SUBS, STAND } from "./timing.js";
import { iconPos } from "./world.js";
const loopF = (f) => (f < 450 ? f : f - N);                     // кадр 900 ≡ кадр 0
const orbit = (f, r, h, a0, sp) => { const a = a0 + sp * f; return [Math.sin(a) * r, h, Math.cos(a) * r]; };
const cab = (i) => (f) => { const A = iconPos(SUBS[i][3]), sx = A[0] >= 0 ? 1 : -1, front = A[2] > 0;
  const ta = lerp([0, 1.0, 0], [A[0], 0.6, A[2]], 0.3);
  return { ro: add(ta, front ? [-sx * 2.2, 1.0, -2.6] : [-sx * 1.7, 0.35, 3.2]), ta, lens: 0.95 }; };
const PLANS = {
  front: (f) => ({ ro: orbit(loopF(f), 3.6, 1.45, -0.25, 0.0012), ta: [0, 1.15, 0], lens: 1.15 }),
  front2: (f) => ({ ro: orbit(f, 3.3, 1.7, 0.35, -0.0012), ta: [0, 1.15, 0], lens: 1.1 }),
  side: (f) => ({ ro: [3.1, 1.35, 1.6 - 0.002 * (f - 146)], ta: [0, 1.1, 0], lens: 1.05 }),
  sideL: (f) => ({ ro: [-3.1, 1.4, 1.4 + 0.002 * (f - 72)], ta: [0, 1.1, 0], lens: 1.05 }),
  standWatch: (f) => ({ ro: [2.9, 1.3, 2.2], ta: [0, 1.15, 0.1], lens: 1.0 }),
  top: (f) => ({ ro: [1.6, 4.6, 3.2], ta: [0, 0.8, -0.6], lens: 0.9 }),
  close: (f) => ({ ro: [1.3, 1.45, 1.7 - 0.004 * (f - 652)], ta: [0, 1.2, 0], lens: 1.2 }),
  darkClose: (f) => ({ ro: [0.9, 1.4, 1.35], ta: [0, 1.25, 0], lens: 1.25 }),
  reveal: (f) => ({ ro: [0.6, 27, 9.5 - 0.004 * (f - 700)], ta: [0, 0, -2.4], lens: 0.95 }),
};
SUBS.forEach((_, i) => (PLANS["cab" + i] = cab(i)));
export function cameraTrack() {
  const out = [];
  for (let f = 0; f <= N; f++) {
    let k = 0; while (k + 1 < SHOTS.length && f >= SHOTS[k + 1][0]) k++;
    let c = PLANS[SHOTS[k][2]](f);
    const [s0, Tt] = SHOTS[k];
    if (k > 0 && Tt > 0 && f < s0 + Tt) { const p = PLANS[SHOTS[k - 1][2]](f), e = io((f - s0) / Tt); c = { ro: lerp(p.ro, c.ro, e), ta: lerp(p.ta, c.ta, e), lens: mix(p.lens, c.lens, e) }; }
    out.push(c);
  }
  return out;
}
export function projector(c) {
  const ww = norm(sub(c.ta, c.ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww);
  return (X) => { const v = sub(X, c.ro), zc = dot(v, ww); const z = Math.max(zc, 0.05); const s = (c.lens * 1920) / z; return { x: 540 + dot(v, uu) * s, y: 960 - dot(v, vv) * s, k: s, z: zc }; };
}
