import { add, sub, mul, lerp, mix, io, norm, cross, dot } from "./vec.js";
import { SHOTS, S0, S1, DOUBT, RMAX } from "./timing.js";
import { stateAt } from "./people.js";
const sm = (fn) => { const raw = []; for (let s = S0; s <= S1; s++) raw.push(fn(s)); return raw.map((_, k) => { let t = [0, 0, 0], n = 0; for (let j = -18; j <= 18; j++) { const q = raw[Math.max(0, Math.min(raw.length - 1, k + j))]; t = add(t, q); n++; } return mul(t, 1 / n); }); };
const HP = sm((s) => stateAt(0, s).pos);
const at = (A, s) => A[Math.max(0, Math.min(A.length - 1, Math.round(s) - S0))];
const radial = (p) => { const l = Math.hypot(p[0], p[2]) || 1; return [p[0] / l, 0, p[2] / l]; };
const tangent = (o) => [-o[2], 0, o[0]];
const DM = (() => { const th = (DOUBT[0].phi + DOUBT[1].phi) / 2; return [Math.cos(th), 0, Math.sin(th)]; })();
const PLANS = {
  hero: (s) => { const h = at(HP, s), o = Math.hypot(h[0], h[2]) < 1.5 ? [0.6, 0, 0.8] : radial(h), tg = tangent(o); return { ro: add(add(h, mul(o, 4.6)), add(mul(tg, 1.3), [0, 1.8, 0])), ta: add(h, add(mul(o, -1.0), [0, 0.95, 0])), lens: 1.05 }; },
  low: (s) => { const h = at(HP, s), o = Math.hypot(h[0], h[2]) < 1.5 ? [0.6, 0, 0.8] : radial(h), tg = tangent(o); return { ro: add(add(h, mul(o, 2.5)), add(mul(tg, -1.2), [0, 0.35, 0])), ta: add(h, add(mul(o, -1.6), [0, 1.15, 0])), lens: 0.95 }; },
  wide: (s) => { const a = 0.9 + s * 0.0011; return { ro: [Math.sin(a) * 23, 12.5, Math.cos(a) * 23], ta: [0, 0.6, 0], lens: 1.2 }; },
  top: (s) => ({ ro: [0, 33, 8], ta: [0, 0, 0], lens: 1.12 }),
  top2: (s) => ({ ro: [0, 58, 6], ta: [0, 0, 0], lens: 1.12 }),
  doubt: (s) => { const r = s < 500 ? 5.8 : RMAX + 1.4, D = mul(DM, r), tg = tangent(DM); return { ro: add(add(D, mul(DM, s < 500 ? 4.6 : 6.0)), add(mul(tg, 1.2), [0, 2.0, 0])), ta: add(D, add(mul(DM, -2.6), [0, 1.2, 0])), lens: 1.0 }; },
};
const plan = (k, s) => PLANS[SHOTS[k][2]](s);
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
