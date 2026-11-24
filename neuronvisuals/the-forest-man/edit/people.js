// Герой сажает деревья по краю растущего леса: идёт по кругу, встаёт на колено, сажает, встаёт.
// Двое сомневающихся стоят, отворачиваются и уходят; в конце возвращаются посмотреть на лес.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import * as T from "./timing.js";
const UP = [0, 1, 0];
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rL: 0.063 };
const legLen = B.thigh + B.shin + B.rL;
// расписание героя: [начало, тип, длительность]
const SCHED = (() => {
  const ev = [[-200, "walk", 280], [80, "plant", 64], [144, "walk", 30]];
  let s = 174;
  while (s < T.TURN - 10) { const fast = s > 300 && s < 600; const w = fast ? 16 : 34, p = fast ? 14 : 30; ev.push([s, "plant", p]); ev.push([s + p, "walk", w]); s += p + w; }
  ev.push([s, "stand", 999]);
  return ev;
})();
export const PLANTS = SCHED.filter((e) => e[1] === "plant").map((e) => e[0]);
const evAt = (s) => { let e = SCHED[0]; for (const x of SCHED) if (x[0] <= s) e = x; return e; };
// пройденный по кругу путь (только во время ходьбы)
const vAt = (s) => { const e = evAt(s); if (e[1] !== "walk") return 0; return s > 300 && s < 600 ? 0.085 : 0.05; };
const ARC = (() => { const a = []; let d = 0; for (let s = T.S0; s <= T.S1; s++) { a.push(d); d += vAt(s); } return a; })();
const arcAt = (s) => ARC[Math.max(0, Math.min(ARC.length - 1, Math.round(s) - T.S0))];
export function heroState(s) {
  const e = evAt(s), R = T.forestR(s);
  let r, th, a, kneel = 0, run = 0;
  if (s < 80) { r = mix(3.0, 0.75, sstep(-60, 78, s)); th = 2.3; a = th + Math.PI; run = s < 76 ? 1 : 0; }
  else { r = Math.max(0.75, R + 0.55); th = 2.3 + (arcAt(s) - arcAt(80)) / Math.max(1.5, r); }
  const pos = [r * Math.cos(th), 0, r * Math.sin(th)];
  const inward = th + Math.PI, tang = th + Math.PI / 2;
  if (s >= 80) {
    if (e[1] === "walk") { a = tang; run = 1; const t = s - e[0]; if (t < 6) a = mix(inward, tang + 2 * Math.PI * (tang - inward < -Math.PI ? 1 : 0), t / 6); }
    else if (e[1] === "plant") { const t = s - e[0], L = e[2]; a = inward; kneel = sstep(0, 8, t) * (1 - sstep(L - 8, L, t)); }
    else { a = inward; }
  }
  return { pos, a, kneel, run, D: arcAt(s), th };
}
function dState(k, s) {
  const d = T.DOUBT[k], th = d.phi, out = [Math.cos(th), 0, Math.sin(th)];
  let r = d.r, a = th + Math.PI, run = 0, D = 0, alpha = 1;
  if (s > T.DLEAVE && s < T.DBACK) { const t = s - T.DLEAVE; a = th + Math.PI + Math.PI * io(clamp((t - 6) / 16, 0, 1)); if (t > 22) { const w = 0.034 * (t - 22); r = d.r + w; run = 0.8; D = w; } alpha = 1 - sstep(40, 70, t); }
  if (s >= T.DBACK) { const t = s - T.DBACK; const rb = T.RMAX + 1.3 + 0.2 * k; r = rb + Math.max(0, 1.3 - 0.034 * t); run = t < 38 ? 0.8 : 0; D = 0.034 * t; a = th + Math.PI; alpha = sstep(0, 14, t); }
  return { pos: [r * out[0], 0, r * out[2]], a, kneel: 0, run, D, alpha };
}
function pose(o, s) {
  const Fw = [Math.cos(o.a), 0, Math.sin(o.a)], L = norm(cross(Fw, UP)), STR = 0.36, k = o.kneel;
  const ph = o.D / (2 * STR), rk = Math.min(1, o.run) * (1 - k);
  const foot = (psi, side) => { psi = ((psi % 1) + 1) % 1; let d, lift = 0; if (psi < 0.5) d = STR * (0.5 - psi / 0.5); else { const t = (psi - 0.5) / 0.5; d = STR * (-0.5 + t); lift = 0.13 * Math.sin(Math.PI * t); }
    d *= rk; lift *= rk; const kd = side < 0 ? 0.32 : -0.38; d = mix(d, kd, k);
    return [o.pos[0] + Fw[0] * d + L[0] * side * 0.11, B.rL + lift, o.pos[2] + Fw[2] * d + L[2] * side * 0.11]; };
  const fL = foot(ph, -1), fR = foot(ph + 0.5, 1);
  const pel = [o.pos[0] - Fw[0] * 0.05 * k, legLen - 0.04 + 0.022 * Math.cos(4 * Math.PI * ph) * rk - 0.33 * k, o.pos[2] - Fw[2] * 0.05 * k];
  const tu = norm(add(UP, mul(Fw, 0.05 + 0.75 * k)));
  const sw = Math.sin(2 * Math.PI * ph) * rk, amp = 0.22;
  let hand1 = add(add(add(pel, mul(UP, 0.0)), mul(Fw, 0.08 + amp * sw)), mul(L, -0.2)), hand2 = add(add(add(pel, mul(UP, 0.0)), mul(Fw, 0.08 - amp * sw)), mul(L, 0.2));
  if (k > 0) { const g1 = [o.pos[0] + Fw[0] * 0.55 + L[0] * -0.1, 0.06, o.pos[2] + Fw[2] * 0.55 + L[2] * -0.1], g2 = [o.pos[0] + Fw[0] * 0.55 + L[0] * 0.1, 0.06, o.pos[2] + Fw[2] * 0.55 + L[2] * 0.1]; hand1 = lerp(hand1, g1, k); hand2 = lerp(hand2, g2, k); }
  const shc = add(pel, mul(tu, B.sh)), top = add(pel, mul(tu, B.top)), head = add(add(pel, mul(tu, B.head)), mul(Fw, 0.04 * k));
  const shL = add(shc, mul(L, -0.13)), shR = add(shc, mul(L, 0.13)), hipL = add(pel, mul(L, -0.07)), hipR = add(pel, mul(L, 0.07));
  const pA = (sd) => add(add(mul(UP, -0.5), mul(L, sd * 0.55)), mul(Fw, -0.45));
  const [eL, hL] = ik3(shL, hand1, B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, hand2, B.uarm, B.farm, pA(1));
  const pK = add(Fw, mul(UP, 0.1));
  const [kL, aL] = ik3(hipL, fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, fR, B.thigh, B.shin, pK);
  return { J: { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR }, chest: top, head };
}
export const NP = 3;   // 0 — герой, 1–2 — сомневающиеся
export const COLORS = ["#FF7A2E", "#FFFFFF", "#FFFFFF"];
export function stateAt(i, s) { return i === 0 ? heroState(s) : dState(i - 1, s); }
export function poseAt(i, s) { return pose(stateAt(i, s), s); }
export function glowAt(i, s) { if (i === 0) return 1; return 0.6 * dState(i - 1, s).alpha; }
export function stepPhase(i, s) { const o = stateAt(i, s); return o.run > 0.2 && o.kneel < 0.2 ? o.D / 0.72 : null; }
