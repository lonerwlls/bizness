import { add, sub, mul, lerp, mix, io, norm, cross, dot, sstep } from "./vec.js";
import { SHOTS, N, RUNNERS, S0, FOMO } from "./timing.js";
import { runnerState, GREED_FALL } from "./people.js";
import { chartY } from "./chart.js";
const X = (name, s) => runnerState(RUNNERS.findIndex((r) => r[0] === name), s).x;
// на кого смотрит камера по ходу сюжета: [с какого времени сцены, функция x]
const FOCUS = [
  [-1e9, (s) => (X("HYPE", s) + X("PATIENCE", s)) / 2],
  [282, (s) => X("GREED", Math.min(s, GREED_FALL + 22)) - 0.6],
  [378, (s) => (X("HYPE", s) + X("PATIENCE", s)) / 2],
  [468, (s) => X("PATIENCE", s) + 1.2],
  [572, (s) => (X("PATIENCE", s) + X("FOMO", s)) / 2],
  [662, (s) => X("PATIENCE", s) + 0.6],
];
const BL = 26;
function focusX(s) { let x = FOCUS[0][1](s); for (let k = 1; k < FOCUS.length; k++) { const w = io(Math.min(1, Math.max(0, (s - FOCUS[k][0]) / BL))); if (w > 0) x = mix(x, FOCUS[k][1](s), w); } return x; }
const S1 = N + 30, CX = [], CY = [];
for (let s = S0 - 30; s <= S1; s++) CX.push(focusX(s));
const at = (A, s) => A[Math.max(0, Math.min(A.length - 1, s - (S0 - 30)))];
const smA = (A, s, w) => { let t = 0, n = 0; for (let k = -w; k <= w; k++) { t += at(A, s + k); n++; } return t / n; };
const CXs = [], CYs = [];
for (let s = S0 - 30; s <= S1; s++) CXs.push(smA(CX, s, 12));
for (let s = S0 - 30; s <= S1; s++) CY.push(chartY(at(CXs, s)));
for (let s = S0 - 30; s <= S1; s++) CYs.push(smA(CY, s, 14));
const PLANS = {
  side: (cx, cy) => ({ ro: [cx + 0.3, cy + 2.6, 10.5], ta: [cx, cy + 1.25, 0], lens: 1.15 }),
  lowFront: (cx, cy) => ({ ro: [cx + 5.5, cy + 1.1, 7.0], ta: [cx + 0.3, cy + 1.0, 0], lens: 1.0 }),
  sideHigh: (cx, cy) => ({ ro: [cx - 0.5, cy + 5.0, 9.5], ta: [cx, cy + 0.6, 0], lens: 0.95 }),
};
// камера для времени сцены s (план выбирается по тому же s, поэтому перемотка и петля совпадают)
export function cameraAt(s) {
  const cx = at(CXs, s), cy = at(CYs, s);
  let k = 0; while (k + 1 < SHOTS.length && s >= SHOTS[k + 1][0]) k++;
  let c = PLANS[SHOTS[k][2]](cx, cy);
  const [s0, Tt] = SHOTS[k];
  if (k > 0 && Tt > 0 && s < s0 + Tt) { const p = PLANS[SHOTS[k - 1][2]](cx, cy), e = io((s - s0) / Tt); c = { ro: lerp(p.ro, c.ro, e), ta: lerp(p.ta, c.ta, e), lens: mix(p.lens, c.lens, e) }; }
  return c;
}
export function projector(c) {
  const ww = norm(sub(c.ta, c.ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww);
  return (X) => { const v = sub(X, c.ro), zc = dot(v, ww); const z = Math.max(zc, 0.05); const s = (c.lens * 1920) / z; return { x: 540 + dot(v, uu) * s, y: 960 - dot(v, vv) * s, k: s, z: zc }; };
}
