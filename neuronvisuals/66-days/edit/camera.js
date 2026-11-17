import { add, sub, mul, lerp, mix, io, norm, cross, dot } from "./vec.js";
import { SHOTS, W, S0, S1 } from "./timing.js";
import { stateAt } from "./people.js";
// сглаженная позиция того, за кем следим
const FX = W.map((_, i) => { const raw = []; for (let s = S0; s <= S1; s++) raw.push(stateAt(i, s).x); return raw.map((_, k) => { let t = 0, n = 0; for (let j = -22; j <= 22; j++) { const q = Math.max(0, Math.min(raw.length - 1, k + j)); t += raw[q]; n++; } return t / n; }); });
const fx = (i, s) => FX[i][Math.max(0, Math.min(FX[i].length - 1, Math.round(s) - S0))];
const PLANS = {
  side: (s, i) => { const x = fx(i, s), z = W[i].z; return { ro: [x - 0.3, 1.9, z + 5.4], ta: [x, 1.0, z - 0.3], lens: 1.1 }; },
  sideB: (s, i) => { const x = fx(i, s), z = W[i].z; return { ro: [x + 0.6, 3.2, z + 5.2], ta: [x, 0.8, z - 0.2], lens: 1.15 }; },
  low: (s, i) => { const x = fx(i, s), z = W[i].z; return { ro: [x + 0.7, 0.42, z + 3.3], ta: [x, 1.2, z - 0.8], lens: 1.0 }; },
  wide: (s, i) => { const x = mix(fx(i, s), fx(0, s), 0.5); return { ro: [x + 1.0, 5.4, 8.8], ta: [x, 0.3, -1.7], lens: 1.2 }; },
  top: (s, i) => { const x = fx(i, s) * 0.6; return { ro: [x, 11.5, 3.6], ta: [x, 0.0, -0.4], lens: 1.1 }; },
};
const plan = (k, s) => PLANS[SHOTS[k][2]](s, SHOTS[k][3]);
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
