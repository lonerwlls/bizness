// Бегуны-понятия на линии графика: бег вдоль x по поверхности, наклон по склону, сюжетные выбывания.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import { chartY, slopeAt } from "./chart.js";
import * as T from "./timing.js";
const UP = [0, 1, 0];
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rH: 0.15, rL: 0.063 };
const legLen = B.thigh + B.shin + B.rL, P = 16, STRIDE = T.SPEED * P / 2, G = 0.012;
const idx = (name) => T.RUNNERS.findIndex((r) => r[0] === name);
// торможение за кадры [s0,s1]: путь при линейном спаде скорости v → 0
const brake = (f, s0, s1, v) => { const t = clamp((f - s0) / (s1 - s0), 0, 1); return v * (s1 - s0) * 0.5 * (2 * t - t * t); };
function greedX(f) {
  const [g0, g1] = T.GREED.sprint, D = g1 - g0, x0 = T.RUNNERS[idx("GREED")][2];
  let x = x0 + T.SPEED * f;
  if (f > g0) { const t = Math.min(f, g1) - g0; x += T.SPEED * (t * t) / (2 * D); if (f > g1) x += T.SPEED * (f - g1); }
  return x;
}
export const GREED_FALL = (() => { for (let f = 0; f < 900; f++) if (greedX(f) >= T.GREED.peakX) return f; return 9999; })();
export function runnerState(i, f) {
  const [name, z0, x0] = T.RUNNERS[i];
  let x = x0 + T.SPEED * f, z = z0, a = 0, speed = 1, run = 1, dy = 0, fall = 0, ground = null;
  if (name === "FEAR") {
    const [s0, s1] = T.FEAR.stop, [t0, t1] = T.FEAR.turn, xs0 = x0 + T.SPEED * s0;
    if (f > s0) { x = xs0 + brake(f, s0, s1, T.SPEED); speed = 1 - clamp((f - s0) / (s1 - s0), 0, 1); }
    const xs1 = xs0 + T.SPEED * (s1 - s0) * 0.5;
    if (f > s1) { x = xs1; a = Math.PI * io(clamp((f - t0) / (t1 - t0), 0, 1)); speed = 0.25; run = 0.4; }
    if (f > t1) { x = xs1 - 1.15 * T.SPEED * (f - t1) * sstep(t1, t1 + 10, f) * 0.9; speed = 1.15; run = 1; }
  }
  if (name === "GREED") {
    const [g0, g1] = T.GREED.sprint; x = greedX(f);
    if (f > g0) speed = 1 + clamp((f - g0) / (g1 - g0), 0, 1) * 0.9;
    if (f > GREED_FALL) { const t = f - GREED_FALL, xf = greedX(GREED_FALL); x = xf + 0.13 * t; z = z0 + 0.075 * t; ground = chartY(xf); dy = 0.06 * t - 0.5 * 0.008 * t * t; fall = t; run = 1; }
  }
  if (name === "HYPE") {
    const [s0, s1] = T.HYPE.stop, [t0, t1] = T.HYPE.turn, xs0 = x0 + T.SPEED * s0;
    if (f > s0) { x = xs0 + brake(f, s0, s1, T.SPEED); speed = 1 - 0.8 * clamp((f - s0) / (s1 - s0), 0, 1); run = 1 - 0.7 * clamp((f - s0) / (s1 - s0), 0, 1); }
    if (f > s1) { x = xs0 + T.SPEED * (s1 - s0) * 0.5; a = -Math.PI / 2 * io(clamp((f - t0) / (t1 - t0), 0, 1)); speed = 0.25; run = 0.3; }
    if (f > t1) { z = z0 - 0.3 * T.SPEED * (f - t1); speed = 0.45; run = 0.45; }
  }
  if (name === "FOMO") {
    const L = T.FOMO.land, [s0, s1] = T.FOMO.stop, v = 0.6 * T.SPEED;
    if (f <= L) { x = x0; dy = 0.5 * 0.03 * (L - f) * (L - f); speed = 0.2; run = 0.15; }
    else if (f <= s0) { x = x0 + v * (f - L) * sstep(L, L + 6, f); speed = 0.6; run = 0.6; }
    else { x = x0 + v * (s0 - L) + brake(f, s0, s1, v); speed = 0.6 * (1 - clamp((f - s0) / (s1 - s0), 0, 1)) + 0.15; run = 0.6 * (1 - clamp((f - s0) / (s1 - s0), 0, 1)); }
  }
  return { name, z, x, a, speed, run, dy, fall, ground };
}
// фаза бега: накопленная по кадрам, для отрицательного времени — продолжение назад
const PH = T.RUNNERS.map(() => [0]);
for (let i = 0; i < T.RUNNERS.length; i++) for (let f = 1; f <= T.N; f++) PH[i].push(PH[i][f - 1] + runnerState(i, f).speed / P + 0.0025 * i / 16);
export function phase(i, f) { if (f < 0) return f * (1 / P + 0.0025 * i / 16); return PH[i][Math.min(f, T.N)]; }
export function runnerAt(i, f) {
  const st = runnerState(i, f), ph = phase(i, f);
  const Fw = [Math.cos(st.a), 0, Math.sin(st.a)], L = norm(cross(Fw, UP));
  const gy = (x) => (st.ground !== null ? st.ground : chartY(x));
  const sl = st.ground !== null ? 0 : slopeAt(st.x);
  const foot = (psi, side) => {
    psi = ((psi % 1) + 1) % 1; let d, lift = 0;
    if (psi < 0.5) d = STRIDE * (0.5 - psi / 0.5); else { const t = (psi - 0.5) / 0.5; d = STRIDE * (-0.5 + t); lift = 0.22 * Math.sin(Math.PI * t) * st.run; }
    d *= st.run; const fx = st.x + Fw[0] * d, fz = st.z + Fw[2] * d + L[2] * side * 0.11 + L[0] * 0;
    return [fx + L[0] * side * 0.11, gy(fx) + B.rL + lift, fz];
  };
  const fL = foot(ph, -1), fR = foot(ph + 0.5, 1);
  const bob = 0.04 * Math.cos(4 * Math.PI * ph) * st.run;
  const pel = [st.x - Fw[0] * 0.06, gy(st.x) + legLen - 0.12 + bob, st.z - Fw[2] * 0.06];
  const tu = norm(add(UP, mul(Fw, 0.22 * st.run + 0.25 * sl * Fw[0])));
  const s = Math.sin(2 * Math.PI * ph) * st.run;
  const top = add(pel, mul(tu, B.top)), head = add(pel, mul(tu, B.head));
  const shc = add(pel, mul(tu, B.sh)), shL = add(shc, mul(L, -0.13)), shR = add(shc, mul(L, 0.13)), hipL = add(pel, mul(L, -0.07)), hipR = add(pel, mul(L, 0.07));
  const hand = (sd, k) => add(add(add(pel, mul(tu, 0.22)), mul(Fw, 0.1 + 0.26 * k)), mul(L, sd * 0.2));
  const pA = (sd) => add(add(mul(Fw, -0.6), mul(tu, -0.8)), mul(L, sd * 0.3));
  const [eL, hL] = ik3(shL, hand(-1, s), B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, hand(1, -s), B.uarm, B.farm, pA(1));
  const pK = add(Fw, mul(tu, 0.2));
  const [kL, aL] = ik3(hipL, fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, fR, B.thigh, B.shin, pK);
  let J = { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR };
  if (st.fall > 0) {   // кувырок с обрыва к зрителю: поворот вокруг оси бега + раскрутка
    const th = 0.1 * st.fall, sp = 0.06 * st.fall, c = Math.cos(th), sn = Math.sin(th), c2 = Math.cos(sp), s2 = Math.sin(sp), M = {};
    for (const k in J) { let v = sub(J[k], pel); v = [v[0], v[1] * c - v[2] * sn, v[1] * sn + v[2] * c]; v = [v[0] * c2 - v[1] * s2, v[0] * s2 + v[1] * c2, v[2]]; M[k] = add(pel, v); }
    J = M;
  }
  if (st.dy) for (const k in J) J[k] = [J[k][0], J[k][1] + st.dy, J[k][2]];
  return { J, chest: J.top, head: J.head, x: st.x };
}
// деньги: $10,000 в первый год → $71,750 у PATIENCE в конце (J.P. Morgan / CNBC, S&P 500 2005–2024)
const Y0 = chartY(0), YF = chartY(T.RUNNERS[idx("PATIENCE")][2] + T.SPEED * T.FINAL);
export const K = Math.log(71750 / 10000) / (YF - Y0);
const val = (y, y0 = Y0) => 10000 * Math.exp(K * (y - y0));
// подпись под именем: {text, red}
export function labelAt(i, f) {
  f = Math.max(0, f);
  const st = runnerState(i, f), name = st.name, y0 = chartY(T.RUNNERS[i][2]);
  const m = (v) => ({ text: "$" + (Math.round(v / 50) * 50).toLocaleString("en-US"), red: v < 10000 });
  if (name === "FEAR") { if (f >= T.FEAR.turn[0]) return { text: "SOLD", red: true }; return m(val(chartY(runnerState(i, Math.min(f, T.FEAR.stop[1])).x), y0)); }
  if (name === "GREED") { if (f > GREED_FALL) return { text: "WIPED OUT", red: true }; return m(val(chartY(st.x), y0)); }
  if (name === "HYPE") { if (f >= T.HYPE.turn[0]) return { text: "BORED", red: false }; return m(val(chartY(runnerState(i, Math.min(f, T.HYPE.stop[1])).x), y0)); }
  if (name === "FOMO") { if (f >= T.FOMO.sold) return { text: "SOLD", red: true }; return m(val(chartY(st.x), chartY(T.RUNNERS[i][2]))); }
  if (f >= T.FINAL) return { text: "$71,750", red: false };
  return m(val(chartY(st.x)));
}
// яркость неона: выбывшие гаснут (с миганием)
const flick = (f, a, b) => { const t = clamp((f - a) / (b - a), 0, 1); if (t <= 0) return 1; if (t >= 1) return 0; return (1 - t) * (0.55 + 0.45 * Math.cos(f * 2.1) * Math.cos(f * 0.7)); };
export function fadeAt(i, f) {
  const n = T.RUNNERS[i][0];
  if (n === "FEAR") return 1 - sstep(T.FEAR.fade[0], T.FEAR.fade[1], f);
  if (n === "GREED") return f <= GREED_FALL + 4 ? 1 : flick(f, GREED_FALL + 4, GREED_FALL + 26);
  if (n === "HYPE") return 1 - sstep(T.HYPE.fade[0], T.HYPE.fade[1], f);
  if (n === "FOMO") return f < T.FOMO.show ? 0 : sstep(T.FOMO.show, T.FOMO.show + 6, f) * flick(f, T.FOMO.fade[0], T.FOMO.fade[1]);
  return 1;
}
// подпись видна, пока виден бегун
export function labelAlpha(i, f) { const n = T.RUNNERS[i][0]; if (n === "FOMO") return f < T.FOMO.land ? 0 : 1 - sstep(T.FOMO.fade[0] + 6, T.FOMO.fade[1], f); if (n === "GREED") return 1 - sstep(GREED_FALL + 10, GREED_FALL + 30, f); return clamp(fadeAt(i, f) * 1.6, 0, 1); }
