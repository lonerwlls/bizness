// Идущие по своим дорожкам туда и обратно. Герой сначала идёт тяжело (наклон, короткий шаг, тусклый неон),
// к 60-м дням — легко. Сдавшиеся останавливаются, отворачиваются и уходят в темноту.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import * as T from "./timing.js";
const UP = [0, 1, 0];
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rL: 0.063 };
const legLen = B.thigh + B.shin + B.rL;
export const heavyAt = (i, s) => (i === 0 ? 1 - sstep(38, 63, T.dayF(s)) : 1);
function speed(i, s) {
  const w = T.W[i], q = T.QUIT[i];
  if (i === 0) { let v = mix(0.085, 0.045, heavyAt(0, s)); if (s > T.TURN) v = mix(v, 0.115, sstep(T.TURN, T.TURN + 24, s)); return v; }
  if (q !== null && s > q) return w.v * Math.max(0, 1 - (s - q) / T.AFTER.stop);
  return w.v;
}
// пройденный путь по маршруту (туда-обратно)
const DD = T.W.map((w, i) => { const a = [w.u0 + speed(i, T.S0) * 0]; let d = w.u0 + speed(i, 0) * T.S0; const arr = []; for (let s = T.S0; s <= T.S1; s++) { arr.push(d); d += speed(i, s); } return arr; });
const Dat = (i, s) => DD[i][Math.max(0, Math.min(DD[i].length - 1, Math.round(s) - T.S0))];
function route(D) {
  const u = ((D % (2 * T.LEN)) + 2 * T.LEN) % (2 * T.LEN);
  const x = u < T.LEN ? T.X0 + u : T.X0 + 2 * T.LEN - u;
  const n = Math.round(D / T.LEN), e = D - T.LEN * n;
  const a = Math.PI * (n - 1 + sstep(-0.45, 0.45, e));
  return { x, a };
}
export function stateAt(i, s) {
  const w = T.W[i], q = T.QUIT[i], A = T.AFTER;
  let D = Dat(i, s), { x, a } = route(D), z = w.z, run = clamp(speed(i, s) / w.v, 0, 1.6), walkD = 0, away = false;
  if (i === 0) run = 1 + 0.6 * sstep(T.TURN, T.TURN + 24, s);
  if (q !== null && s > q) {
    const t = s - q, Dq = Dat(i, q + A.stop + 2), r = route(Dq);
    x = r.x; D = Dq;
    const aT = -Math.PI / 2, a0 = r.a; let da = ((aT - a0) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    a = a0 + da * io(clamp((t - A.turn[0]) / (A.turn[1] - A.turn[0]), 0, 1));
    run = t < A.stop ? 1 - t / A.stop : 0;
    if (t > A.turn[0] && t < A.turn[1]) run = 0.35;
    if (t > A.walk) { away = true; walkD = 0.028 * (t - A.walk) * sstep(0, 8, t - A.walk); z = w.z - walkD; run = 0.7; }
  }
  return { x, z, a, D: away ? walkD : D, run, heavy: heavyAt(i, s) };
}
export function poseAt(i, s) {
  const o = stateAt(i, s), hv = o.heavy;
  const Fw = [Math.cos(o.a), 0, Math.sin(o.a)], L = norm(cross(Fw, UP));
  const STR = (0.27 + 0.15 * (1 - hv)) * (i === 0 ? 1 + 0.35 * sstep(T.TURN, T.TURN + 24, s) : 1);
  const ph = o.D / (2 * STR), rk = Math.min(1, o.run);
  const foot = (psi, side) => { psi = ((psi % 1) + 1) % 1; let d, lift = 0; if (psi < 0.5) d = STR * (0.5 - psi / 0.5); else { const t = (psi - 0.5) / 0.5; d = STR * (-0.5 + t); lift = (0.09 + 0.06 * (1 - hv)) * Math.sin(Math.PI * t); }
    d *= rk; lift *= rk; return [o.x + Fw[0] * d + L[0] * side * 0.11, B.rL + lift, o.z + Fw[2] * d + L[2] * side * 0.11]; };
  const fL = foot(ph, -1), fR = foot(ph + 0.5, 1);
  const pel = [o.x, legLen - 0.04 - 0.02 * hv + 0.022 * Math.cos(4 * Math.PI * ph) * rk, o.z];
  const tu = norm(add(UP, mul(Fw, 0.04 + 0.22 * hv)));
  const sw = Math.sin(2 * Math.PI * ph) * rk, amp = 0.1 + 0.2 * (1 - hv);
  const base = add(add(pel, mul(UP, 0.0 - 0.04 * hv)), mul(Fw, 0.08 + 0.14 * hv));
  const hand1 = add(add(base, mul(Fw, amp * sw)), mul(L, -0.2)), hand2 = add(add(base, mul(Fw, -amp * sw)), mul(L, 0.2));
  const shc = add(pel, mul(tu, B.sh)), top = add(pel, mul(tu, B.top));
  const head = add(add(add(pel, mul(tu, B.head)), mul(Fw, 0.05 * hv)), mul(UP, -0.04 * hv));
  const shL = add(shc, mul(L, -0.13)), shR = add(shc, mul(L, 0.13)), hipL = add(pel, mul(L, -0.07)), hipR = add(pel, mul(L, 0.07));
  const pA = (sd) => add(add(mul(UP, -0.5), mul(L, sd * 0.55)), mul(Fw, -0.45));
  const [eL, hL] = ik3(shL, hand1, B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, hand2, B.uarm, B.farm, pA(1));
  const pK = add(Fw, mul(UP, 0.1));
  const [kL, aL] = ik3(hipL, fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, fR, B.thigh, B.shin, pK);
  return { J: { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR }, chest: top, head };
}
// стопа касается земли (для звука шагов)
export const phaseAt = (i, s) => { const o = stateAt(i, s); const STR = (0.27 + 0.15 * (1 - o.heavy)) * (i === 0 ? 1 + 0.35 * sstep(T.TURN, T.TURN + 24, s) : 1); return o.run > 0.2 ? o.D / (2 * STR) : null; };
export function glowAt(i, s) {
  const q = T.QUIT[i];
  if (i === 0) return Math.min(1, 0.42 + 0.58 * sstep(2, 60, T.dayF(s)));
  const g = 0.72; if (q === null || s <= q) return g; return g * (1 - sstep(q + T.AFTER.fade[0], q + T.AFTER.fade[1], s));
}
export function pathAt(i, s) {
  const d = T.dayF(s), q = T.QUIT[i];
  if (i === 0) return 0.06 + 0.94 * Math.pow(Math.min(d, 66) / 66, 1.5) + 0.8 * sstep(T.TURN + 4, T.TURN + 30, s);
  const dq = q === null ? d : Math.min(d, T.dayF(q)), v = 0.06 + 0.94 * Math.pow(dq / 66, 1.5);
  return q !== null && s > q ? v * (1 - sstep(q + T.AFTER.light[0], q + T.AFTER.light[1], s)) : v;
}
export function labelAt(i, s) { s = Math.max(0, s); const q = T.QUIT[i]; const d = T.dayAt(q !== null ? Math.min(s, q) : s); if (q !== null && s > q + 4) return { text: "QUIT · DAY " + d, red: true }; return { text: "DAY " + d, red: false }; }
