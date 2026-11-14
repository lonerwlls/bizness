// Рабочие с кувалдами: замах → удар по камню; сдавшиеся опускают молот, разворачиваются и уходят в темноту.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import * as T from "./timing.js";
const UP = [0, 1, 0];
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rL: 0.063 };
const legLen = B.thigh + B.shin + B.rL, D2R = Math.PI / 180;
const TH_S = -15 * D2R, TH_TOP = 150 * D2R, TH_REST = -52 * D2R, ARM = 0.5, HANDLE = 0.8;
export const standX = (i) => T.ST[i].x - 2.2;
const eIn = (t) => t * t * t, eOut = (t) => 1 - Math.pow(1 - t, 3);
// угол молота в плоскости замаха (0 = вперёд к камню, 90° = вверх)
function swing(i, s) {
  const H = T.HITS[i];
  let k = -1; for (let j = 0; j < H.length; j++) if (H[j][0] <= s) k = j;
  const t1 = k + 1 < H.length ? H[k + 1][0] : null, t0 = k >= 0 ? H[k][0] : (t1 - 18);
  if (t1 === null) return { th: TH_S, after: s - t0, imp: s - t0 };          // после последнего удара
  const Tt = t1 - t0, dt = s - t0, dn = t1 - s;
  const strike = Math.min(6, 0.38 * Tt), raise = Math.min(14, 0.55 * Tt);
  let th;
  if (dn <= strike) th = mix(TH_TOP, TH_S, eIn((strike - dn) / strike));
  else if (dt <= raise) th = mix(TH_S, TH_TOP, io(dt / raise));
  else th = TH_TOP + 0.05 * Math.sin((s - t0) * 0.25);
  if (k >= 0 && dt < 3) th += (8 * D2R) * (1 - dt / 3);                   // отдача
  return { th, after: null, imp: k >= 0 ? dt : 99 };
}
export function countAt(i, s) { const H = T.HITS[i]; let c = 0; for (const [f, n] of H) if (f <= s) c = n; return c; }
export function quitAt(i) { return T.QUIT[i]; }
export function stateAt(i, s) {
  const st = T.ST[i], q = T.QUIT[i], A = T.AFTER;
  const o = { x: standX(i), z: st.z, a: 0, th: 0, mode: "swing", hold: 1, walk: 0, release: 0 };
  const sw = swing(i, s); o.th = sw.th; o.imp = sw.imp;
  if (sw.after !== null) {
    const t = sw.after;
    if (i === 0) { o.th = mix(TH_S, TH_REST, io(clamp((t - 14) / 30, 0, 1))); return o; }     // герой: опускает молот, стоит
    o.th = mix(TH_S, TH_REST, io(clamp(t / A.slump, 0, 1)));
    o.release = io(clamp((t - A.slump - A.release) / 8, 0, 1));
    if (t > A.turn[0]) { o.mode = "turn"; o.a = Math.PI * io(clamp((t - A.turn[0]) / (A.turn[1] - A.turn[0]), 0, 1)); }
    if (t > A.walk) { o.mode = "walk"; o.walk = t - A.walk; o.a = Math.PI; o.x = standX(i) - 0.06 * o.walk * sstep(0, 8, o.walk); }
  }
  return o;
}
// поза: суставы + молот (hA — нижний конец рукояти, hB — центр бойка, h1..h4 — углы бойка)
export function poseAt(i, s) {
  const o = stateAt(i, s), st = T.ST[i];
  const Fw = [Math.cos(o.a), 0, Math.sin(o.a)], L = norm(cross(Fw, UP));
  const strikeK = clamp(1 - (o.th - TH_S) / (TH_TOP - TH_S), 0, 1);
  let pel, tu, fL, fR, hand1, hand2, J;
  const dirOf = (th) => add(mul([1, 0, 0], Math.cos(th)), mul(UP, Math.sin(th)));
  if (o.mode === "walk") {
    const ph = o.walk / 22, STR = 0.36;
    const foot = (psi, side) => { psi = ((psi % 1) + 1) % 1; let d, lift = 0; if (psi < 0.5) d = STR * (0.5 - psi / 0.5); else { const t = (psi - 0.5) / 0.5; d = STR * (-0.5 + t); lift = 0.12 * Math.sin(Math.PI * t); }
      return [o.x + Fw[0] * d + L[0] * side * 0.11, B.rL + lift, o.z + Fw[2] * d + L[2] * side * 0.11]; };
    fL = foot(ph, -1); fR = foot(ph + 0.5, 1);
    pel = [o.x, legLen - 0.1 + 0.025 * Math.cos(4 * Math.PI * ph), o.z];
    tu = norm(add(UP, mul(Fw, 0.06))); const sw2 = Math.sin(2 * Math.PI * ph);
    hand1 = add(add(add(pel, mul(UP, -0.05)), mul(Fw, 0.12 * sw2)), mul(L, -0.2)); hand2 = add(add(add(pel, mul(UP, -0.05)), mul(Fw, -0.12 * sw2)), mul(L, 0.2));
  } else {
    // стойка: ноги на месте, при развороте крутятся вокруг таза
    const base = [standX(i), 0, st.z];
    const rot = (v) => [base[0] + v[0] * Math.cos(o.a) - v[2] * Math.sin(o.a), v[1], base[2] + v[0] * Math.sin(o.a) + v[2] * Math.cos(o.a)];
    fL = rot([0.3, B.rL, -0.13]); fR = rot([-0.28, B.rL, 0.13]);
    const crouch = o.mode === "swing" ? 0.09 * strikeK : 0.03;
    pel = [base[0], legLen - 0.1 - crouch, base[2]];
    tu = norm(add(UP, mul(Fw, -0.12 + 0.42 * strikeK)));
    if (o.mode === "swing" && o.release < 1) {
      const shc = add(pel, mul(tu, B.sh)), d = dirOf(o.th);
      const hc = add(shc, mul(d, ARM)); hand1 = hc; hand2 = add(hc, mul(d, 0.2));
      if (o.release > 0) { const hang1 = add(add(pel, mul(UP, -0.08)), mul(L, -0.2)), hang2 = add(add(pel, mul(UP, -0.08)), mul(L, 0.2)); hand1 = lerp(hand1, hang1, o.release); hand2 = lerp(hand2, hang2, o.release); }
    } else { hand1 = add(add(pel, mul(UP, -0.08)), mul(L, -0.2)); hand2 = add(add(pel, mul(UP, -0.08)), mul(L, 0.2)); }
  }
  const shc = add(pel, mul(tu, B.sh)), top = add(pel, mul(tu, B.top)), head = add(add(pel, mul(tu, B.head)), mul(Fw, 0.04 * strikeK));
  const shL = add(shc, mul(L, -0.13)), shR = add(shc, mul(L, 0.13)), hipL = add(pel, mul(L, -0.07)), hipR = add(pel, mul(L, 0.07));
  const pA = (sd) => add(add(mul(UP, -0.7), mul(L, sd * 0.45)), mul(Fw, -0.15));
  const [eL, hL] = ik3(shL, hand2, B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, hand1, B.uarm, B.farm, pA(1));
  const pK = add(Fw, mul(UP, 0.1));
  const [kL, aL] = ik3(hipL, fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, fR, B.thigh, B.shin, pK);
  J = { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR };
  // молот: в руках, а после «отпустить» — лежит на земле
  const gripAt = (th, k) => { const pl = [standX(i), legLen - 0.1 - 0.09 * k, st.z], t2 = norm(add(UP, mul([1, 0, 0], -0.12 + 0.42 * k))); const dd = dirOf(th); return [add(add(pl, mul(t2, B.sh)), mul(dd, ARM)), dd]; };
  let hA, hB, d;
  if (o.release > 0) {
    const [hc0, d0] = gripAt(TH_REST, 1), b0 = add(hc0, mul(d0, HANDLE)), a0 = add(hc0, mul(d0, -0.06));
    hB = [b0[0], 0.09, b0[2]]; hA = lerp(a0, [b0[0] - 0.86, 0.04, b0[2] + 0.05], o.release); d = norm(sub(hB, hA));
  } else { d = dirOf(o.th); hA = add(hand1, mul(d, -0.06)); hB = add(hand1, mul(d, HANDLE)); }
  const perp = norm(cross([0, 0, 1], d));
  const c = (u, v) => add(add(hB, mul(perp, u)), mul(d, v));
  J.hA = hA; J.hB = hB; J.h1 = c(0.15, -0.06); J.h2 = c(0.15, 0.06); J.h3 = c(-0.15, 0.06); J.h4 = c(-0.15, -0.06);
  return { J, chest: top, head, impact: o.imp, mode: o.mode };
}
// яркость неона и подписи
export function fadeAt(i, s) { const q = T.QUIT[i]; if (q === null || s <= q) return 1; const A = T.AFTER; return 1 - sstep(q + A.fade[0], q + A.fade[1], s); }
export function lightAt(i, s) { const q = T.QUIT[i]; if (q === null || s <= q + T.AFTER.lightOff) return 1; const t = s - q - T.AFTER.lightOff; if (t > 6) return 0; return [0.2, 1, 0, 0.7, 0, 0.3, 0][Math.min(6, Math.floor(t))]; }
export function labelAt(i, s) { s = Math.max(0, s); const q = T.QUIT[i]; const c = countAt(i, s); if (q !== null && s > q + 4) return { text: "QUIT AT " + c, red: true }; return { text: String(c), red: false }; }
