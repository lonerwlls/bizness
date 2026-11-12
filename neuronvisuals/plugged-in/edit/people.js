// Герой сидит в кресле посреди экрана-телефона. Каждая подписка втыкает провод из иконки и тускнит неон.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import { iconPos } from "./world.js";
import * as T from "./timing.js";
const UP = [0, 1, 0], Fw = [0, 0, 1], L = norm(cross(Fw, UP));
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rH: 0.15, rL: 0.063 };
export const plugged = (f) => (f >= T.LOCK + 6 ? 0 : T.SUBS.filter((s) => f >= s[0]).length);
export function glowAt(f) {
  if (f >= T.UNLOCK) return sstep(T.UNLOCK, T.UNLOCK + 10, f);       // экран включился — снова ярок
  if (f >= T.TURN + 6) return 0;
  let g = 1;
  for (let i = 0; i < T.SUBS.length - 1; i++) { const t0 = T.SUBS[i][0]; if (f >= t0) { g -= 0.09 * sstep(t0, t0 + 14, f); if (f < t0 + 5) g *= 0.45 + 0.11 * (f - t0); } }
  const k = plugged(f);
  if (k >= 3) { const h = Math.sin(f * 12.9898) * 43758.5453, r = h - Math.floor(h); if (r < 0.025 * k) g *= 0.55; }
  if (f >= T.TURN) g *= [1.0, 0.2, 0.7, 0.0, 0.4, 0.0][f - T.TURN];          // последняя искра — и погас
  return Math.max(0, g);
}
function rig(pel, tu, o) {
  tu = norm(tu);
  const top = add(pel, mul(tu, B.top)), head = add(add(pel, mul(tu, B.head)), o.headOff || [0, 0, 0]);
  const shc = add(pel, mul(tu, B.sh)), shL = add(shc, mul(L, -0.14)), shR = add(shc, mul(L, 0.14)), hipL = add(pel, mul(L, -0.08)), hipR = add(pel, mul(L, 0.08));
  const pA = (sd) => add(add(mul(Fw, -0.6), mul(tu, -0.6)), mul(L, sd * 0.5));
  const [eL, hL] = ik3(shL, o.hL, B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, o.hR, B.uarm, B.farm, pA(1));
  const pK = add(Fw, UP);
  const [kL, aL] = ik3(hipL, o.fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, o.fR, B.thigh, B.shin, pK);
  return { J: { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR }, chest: add(pel, mul(tu, 0.35)), head };
}
export function heroAt(f) {
  const live = f < T.UNLOCK;
  const slump = live ? clamp(T.SUBS.reduce((a, s) => a + 0.11 * sstep(s[0], s[0] + 20, f), 0), 0, 1.25) : 0;
  let jerk = 0; if (live) for (const s of T.SUBS) if (f >= s[0] && f < s[0] + 10) jerk = Math.sin(((f - s[0]) / 10) * Math.PI);
  // попытка встать: поднимается и подаётся вперёд, провода дёргают обратно
  const [s0, s1] = T.STAND; const rise = live ? sstep(s0, s0 + 34, f) * (1 - sstep(s1 - 8, s1, f)) : 0;
  const strain = live && f > s0 + 34 && f < s1 - 8 ? 0.03 * Math.sin((f - s0) * 1.7) : 0;
  const pel = [0, 0.56 - 0.03 * slump + 0.16 * rise, -0.08 + 0.05 * slump + 0.2 * rise + strain];
  const tu = add(UP, mul(Fw, -0.18 + 0.32 * slump - 0.12 * jerk + 0.35 * rise));
  const handRest = (sx) => [sx * 0.4, 0.66 - 0.02 * slump, 0.12 + 0.05 * slump];
  const handPush = (sx) => [sx * 0.42, 0.66, 0.18];
  const hL = lerp(handRest(-1), handPush(-1), rise), hR = lerp(handRest(1), handPush(1), rise);
  return rig(pel, tu, { hL, hR, fL: [-0.13, B.rL, 0.52 + 0.04 * rise], fR: [0.13, B.rL, 0.52 + 0.04 * rise], headOff: [0, -0.05 * slump + 0.03 * jerk, 0.04 * slump] });
}
// провод: из иконки на экране дугой вверх и к суставу героя
export function cableCurve(i, f, hero) {
  const [t0, , , icon, joint, off] = T.SUBS[i];
  const A = iconPos(icon), P = add(hero.J[joint], off);
  const mid = add(lerp(A, P, 0.5), [0, 1.3 + 0.12 * Math.abs(A[2]), 0]);
  const pts = []; const n = 18;
  const grow = clamp((f - (t0 - T.FLY)) / T.FLY, 0, 1), u = io(grow);
  for (let j = 0; j <= n; j++) { const s = Math.min(j / n, u); const a = lerp(A, mid, s), b = lerp(mid, P, s); pts.push(lerp(a, b, s)); }
  return { pts, visible: f >= t0 - T.FLY && f < T.LOCK + 6, plugged: f >= t0, P };
}
