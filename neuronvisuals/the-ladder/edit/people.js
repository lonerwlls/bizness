// Человечки: 3D-скелеты (метры). Позы задаются целями (таз, направление корпуса, взгляд, кисти, стопы),
// локти и колени считает IK. Дальше draw.jsx проецирует их камерой кадра.
import { add, sub, mul, norm, cross, len, lerp, mix, clamp, io, contact, sstep, ik3 } from "./vec.js";
import { LAD_DIR, LAD_N, ladderAt, RUNG, CHAIR_KID, CHAIR_WIFE, TABLE, TABLE_H, WALL, LAMP } from "./world.js";
import * as T from "./timing.js";
const X = [1, 0, 0], UP = [0, 1, 0];
export const ADULT = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rH: 0.15, rL: 0.063, rA: 0.058, rT: 0.09, o: 0.03 };
const scaleBody = (B, k, hk) => ({ ...B, thigh: B.thigh * k, shin: B.shin * k, uarm: B.uarm * k, farm: B.farm * k, top: B.top * k, head: B.head * k + (hk - k) * 0.15, sh: B.sh * k, rH: B.rH * hk, rL: B.rL * k, rA: B.rA * k, rT: B.rT * k, o: B.o * hk });
export const KID = scaleBody(ADULT, 0.62, 0.82), TEEN = scaleBody(ADULT, 0.86, 0.93);
const legLen = (B) => B.thigh + B.shin + B.rL;
// общий риг: таз, «вверх» корпуса, «вперёд», цели кистей и стоп
function rig(B, pel, tu, Fw, o) {
  tu = norm(tu); const L = norm(cross(Fw, tu));
  const top = add(pel, mul(tu, B.top)), head = add(add(pel, mul(tu, B.head)), o.headOff || [0, 0, 0]);
  const shc = add(pel, mul(tu, B.sh)), w = B.rT * 1.35;
  const shL = add(shc, mul(L, -w)), shR = add(shc, mul(L, w)), hipL = add(pel, mul(L, -B.rT * 0.65)), hipR = add(pel, mul(L, B.rT * 0.65));
  const pA = (sd) => add(add(mul(Fw, -0.5), mul(tu, -1)), mul(L, sd * 0.6));
  const [eL, hL] = ik3(shL, o.hL, B.uarm, B.farm, o.poleL || pA(-1));
  const [eR, hR] = ik3(shR, o.hR, B.uarm, B.farm, o.poleR || pA(1));
  const pK = o.poleK || add(Fw, mul(tu, 0.3));
  const [kL, aL] = ik3(hipL, o.fL, B.thigh, B.shin, add(pK, mul(L, -0.15)));
  const [kR, aR] = ik3(hipR, o.fR, B.thigh, B.shin, add(pK, mul(L, 0.15)));
  return { J: { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR }, B, chest: add(pel, mul(tu, 0.35)), head };
}
const lerpObj = (a, b, t) => { const o = {}; for (const k in a) o[k] = Array.isArray(a[k]) ? lerp(a[k], b[k], t) : mix(a[k], b[k], t); return o; };
function keyed(keys, f) { // keys: [[кадр, объект целей], ...] → плавная интерполяция
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return lerpObj(keys[i - 1][1], keys[i][1], io((f - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  return keys[keys.length - 1][1];
}
// ходьба: от start в сторону dir; возвращает таз, стопы, взмах рук
function walk(B, start, dir, f, f0, S, step) {
  const L = norm(cross(dir, UP)), tau = Math.max(0, f - f0), j = Math.floor(tau / S), ph = (tau - j * S) / S;
  const P = (k) => add(start, mul(dir, step * k));
  const footPos = (q) => {
    if (j % 2 === q) { const a = j - 1 >= 0 ? P(j - 1) : P(0), b = P(j + 1), u = contact(ph); return add(lerp(a, b, u), [0, 0.12 * Math.sin(Math.PI * ph), 0]); }
    return j - 1 >= 0 && (j - 1) % 2 === q ? P(j) : (j >= 2 ? P(j - 1) : P(0));
  };
  const side = (q) => mul(L, q === 0 ? -0.1 : 0.1);
  const fl = add(footPos(0), side(0)), fr = add(footPos(1), side(1));
  const along = step * (tau / S);
  const pel = add(add(start, mul(dir, along)), [0, legLen(B) - 0.03 + 0.02 * Math.abs(Math.sin(Math.PI * ph)), 0]);
  const sw = Math.sin(Math.PI * (tau / S)) * 0.14 * (B.uarm / 0.29);
  return { pel, fL: [fl[0], B.rL, fl[2]], fR: [fr[0], B.rL, fr[2]], swing: sw, L };
}
// ---------- герой на лестнице
const CYCLE = ["RH", "LF", "LH", "RF"], START = { RH: 5, LH: 6, LF: 1, RF: 2 };
function moves() { const m = []; let i = 0; for (const [a, b, M] of T.CLIMB) for (let t = a; t + M <= b + 1e-6; t += M) m.push({ limb: CYCLE[i++ % 4], f0: t, f1: t + M }); return m; }
const MOVES = moves();
export const CLIMB_EVENTS = MOVES.map((m) => [Math.round(m.f1), m.limb]);
function limbS(limb, f) {
  let r = START[limb];
  for (const m of MOVES) { if (m.limb !== limb) continue; if (f >= m.f1) r += 2; else if (f > m.f0) { const t = (f - m.f0) / (m.f1 - m.f0); return { s: (r + 2 * contact(t)) * RUNG, lift: Math.sin(Math.PI * t) }; } }
  return { s: r * RUNG, lift: 0 };
}
function climbTargets(f) {
  const d = LAD_DIR, n = LAD_N;
  const lf = limbS("LF", f), rf = limbS("RF", f), lh = limbS("LH", f), rh = limbS("RH", f);
  const ps = (lf.s + rf.s) / 2 + 0.62;
  const pel = add(add(ladderAt(ps), mul(n, 0.3)), mul(X, 0.025 * (rf.s - lf.s) / RUNG));
  const look = sstep(T.LOOK[0], T.LOOK[0] + 10, f) * (1 - sstep(T.LOOK[1] - 6, T.LOOK[1], f));
  const sk = f > T.SHAKE[0] && f < T.SHAKE[1] ? (f - T.SHAKE[0]) / (T.SHAKE[1] - T.SHAKE[0]) : 0;
  const shake = Math.sin(sk * Math.PI * 4) * 0.05 * Math.sin(sk * Math.PI);
  const hand = (s, side, lift) => add(add(ladderAt(s), mul(X, side * 0.17)), mul(n, 0.035 + 0.1 * lift));
  const foot = (s, side, lift) => add(add(ladderAt(s), mul(X, side * 0.13)), mul(n, 0.07 + 0.12 * lift));
  return { pel, tu: d, Fw: mul(n, -1), headOff: add(add(mul(n, 0.02 + 0.09 * look), mul(d, -0.03 * look)), mul(X, 0.05 * look + shake)),
    hL: hand(lh.s, -1, lh.lift), hR: hand(rh.s, 1, rh.lift), fL: foot(lf.s, -1, lf.lift), fR: foot(rf.s, 1, rf.lift) };
}
const TOP = WALL.h, FR = ADULT.rL;
const standTop = (z, Fw, x = 0) => ({ pel: [x, TOP + legLen(ADULT) - 0.02, z], tu: UP, Fw, headOff: [0, 0, 0], hL: add([x, TOP + legLen(ADULT) - 0.02, z], add([-0.2, -0.55, 0], mul(Fw, 0.04))), hR: add([x, TOP + legLen(ADULT) - 0.02, z], add([0.2, -0.55, 0], mul(Fw, 0.04))), fL: [x - 0.12, TOP + FR, z], fR: [x + 0.12, TOP + FR, z] });
function heroTargets(f) {
  if (f <= T.MANTLE[0]) return climbTargets(f);
  const c0 = climbTargets(T.MANTLE[0]);
  const Fz = [0, 0, -1];
  const K1 = { ...c0, pel: [0, TOP - 0.25, 0.32], tu: norm([0, 1, -0.25]), Fw: Fz, headOff: [0, 0, 0], hL: [-0.24, TOP + 0.06, -0.14], hR: [0.24, TOP + 0.06, -0.14] };
  const K2 = { ...K1, pel: [0, TOP + 0.3, -0.05], tu: norm([0, 1, -0.9]), fR: [0.12, TOP + FR, -0.3], fL: add(c0.fL, [0, 0.45, -0.05]), hL: [-0.26, TOP + 0.06, -0.45], hR: [0.26, TOP + 0.06, -0.45] };
  const K3 = standTop(-1.0, Fz);
  if (f <= T.TURN) return keyed([[T.MANTLE[0], c0], [T.MANTLE[0] + 15, K1], [T.MANTLE[0] + 32, K2], [T.TURN, K3]], f);
  // стоит наверху и оглядывается
  if (f < T.TURN_BACK[0]) {
    const la = f > T.LOOK_AROUND[0] && f < T.LOOK_AROUND[1] ? Math.sin(((f - T.LOOK_AROUND[0]) / (T.LOOK_AROUND[1] - T.LOOK_AROUND[0])) * Math.PI * 2) : 0;
    return { ...K3, headOff: [0.09 * la, 0.0, 0] };
  }
  // разворот к краю (через +x), шаг ближе к краю
  const tt = io(clamp((f - T.TURN_BACK[0]) / (T.TURN_BACK[1] - T.TURN_BACK[0]), 0, 1)), a = Math.PI * (1 - tt);
  const Fw = [Math.sin(a), 0, Math.cos(a)], z = mix(-1.0, -0.3, tt), xx = mix(0, -0.95, tt);
  const S = standTop(z, Fw, xx), L = norm(cross(Fw, UP));
  S.fL = add([xx, TOP + FR, z], add(mul(L, -0.12), [0, 0.08 * Math.sin(Math.PI * clamp(tt * 2, 0, 1)), 0]));
  S.fR = add([xx, TOP + FR, z], add(mul(L, 0.12), [0, 0.08 * Math.sin(Math.PI * clamp(tt * 2 - 1, 0, 1)), 0]));
  S.hL = add(S.pel, add(mul(L, -0.2), [0, -0.55, 0])); S.hR = add(S.pel, add(mul(L, 0.2), [0, -0.55, 0]));
  if (f <= T.TURN_BACK[1] + 2) return S;
  const Edge = { ...S, headOff: [0, -0.04, 0.08] };
  const SX = -0.95, Sit = { pel: [SX, TOP + 0.1, -0.1], tu: norm([0, 1, 0.12]), Fw: [0, 0, 1], headOff: [0, -0.03, 0.05], hL: [SX - 0.3, TOP + 0.06, -0.12], hR: [SX + 0.3, TOP + 0.06, -0.12], fL: [SX - 0.1, TOP - 0.42, 0.34], fR: [SX + 0.1, TOP - 0.42, 0.34] };
  const Sit2 = { ...Sit, headOff: [0, -0.07, 0.09] };
  return keyed([[T.TURN_BACK[1] + 2, S], [T.TURN_BACK[1] + 12, Edge], [T.SIT[0], Edge], [T.SIT[1], Sit], [850, Sit], [872, Sit2]], f);
}
export function heroAt(f) {
  const t = heroTargets(f);
  const sitting = f > T.SIT[0];
  return rig(ADULT, t.pel, t.tu, t.Fw, { ...t, poleK: sitting ? add(t.Fw, [0, 1, 0]) : f <= T.MANTLE[0] ? add(LAD_N, [0, 0, 0]) : undefined,
    poleL: f <= T.MANTLE[0] ? add(add(mul(X, -1), mul(LAD_DIR, -0.6)), mul(LAD_N, 0.4)) : undefined,
    poleR: f <= T.MANTLE[0] ? add(add(mul(X, 1), mul(LAD_DIR, -0.6)), mul(LAD_N, 0.4)) : undefined });
}
// ---------- рисунок ребёнка (отдельный предмет)
const flatAt = (c) => [add(c, [-0.16, 0, -0.11]), add(c, [0.16, 0, -0.11]), add(c, [0.16, 0, 0.11]), add(c, [-0.16, 0, 0.11])];
const heldAt = (c) => [add(c, [-0.16, 0.23, 0.0]), add(c, [0.16, 0.23, 0.0]), add(c, [0.16, 0, 0.0]), add(c, [-0.16, 0, 0.0])];
const ON_TABLE = flatAt([2.02, TABLE_H + 0.012, 2.0]);
const ON_FLOOR = [[1.12, 0.004, 2.42], [1.42, 0.004, 2.5], [1.38, 0.004, 2.7], [1.08, 0.004, 2.62]];
const at = (base, Fw, fw, u, l) => add(add(add(base, mul(Fw, fw)), [0, u, 0]), mul(norm(cross(Fw, UP)), l));
// ---------- ребёнок (сидит, лицом к столу по +x)
export function kidAt(f) {
  const B = KID, Fw = [1, 0, 0], pel = add(add(CHAIR_KID, [0, 0.5, 0]), mul(Fw, -0.03));
  const up = sstep(T.KID_UP[0], T.KID_UP[1], f) * (1 - sstep(T.KID_DOWN[0], T.KID_DOWN[1], f));
  const wv = f > T.KID_WAVE[0] && f < T.KID_WAVE[1] ? Math.sin(((f - T.KID_WAVE[0]) / 8) * Math.PI) * 0.05 * Math.sin(((f - T.KID_WAVE[0]) / (T.KID_WAVE[1] - T.KID_WAVE[0])) * Math.PI) : 0;
  const pick = sstep(T.KID_PICK[0], T.KID_PICK[1], f) * (1 - sstep(T.KID_DOWN[1], T.KID_DOWN[1] + 8, f));
  const lapL = at(pel, Fw, 0.2, 0.07, -0.07), lapR = at(pel, Fw, 0.2, 0.07, 0.07), tbl = [1.98, TABLE_H + 0.03, 2.05];
  const hold = at(pel, Fw, 0.3, 0.5, 0);
  const hL = lerp(lapL, add(hold, [0, 0, -0.11 + wv]), up), hR = lerp(lerp(lapR, tbl, pick), add(hold, [0, 0, 0.11 + wv]), up);
  return rig(B, pel, UP, Fw, { hL, hR, fL: at(pel, Fw, 0.3, -0.33, -0.06), fR: at(pel, Fw, 0.3, -0.33, 0.06), headOff: [0.01, 0.01 * up, wv * 0.5], poleK: add(UP, Fw) });
}
// ---------- подросток: встаёт, роняет рисунок, уходит мимо лестницы в темноту
export function teenAt(f) {
  const B = TEEN, chairPel = add(CHAIR_KID, [-0.03, 0.5, 0]);
  const standPel = [CHAIR_KID[0] - 0.12, legLen(B) - 0.03, CHAIR_KID[2] + 0.12];
  const st = io(clamp((f - T.TEEN_STAND[0]) / (T.TEEN_STAND[1] - T.TEEN_STAND[0]), 0, 1));
  if (f < T.TEEN_WALK[0]) {
    const pel = lerp(chairPel, standPel, st), Fw = [1, 0, 0];
    const seatF = (l) => at(chairPel, Fw, 0.38, -0.44, l), standF = (l) => add([standPel[0], B.rL, standPel[2]], [0, 0, l]);
    const reach = sstep(T.TEEN_DROP[0] - 4, T.TEEN_DROP[0], f) * (1 - sstep(T.TEEN_DROP[1], T.TEEN_DROP[1] + 6, f));
    const hangR = at(pel, Fw, 0.12, -0.3, 0.22), hangL = at(pel, Fw, 0.12, -0.3, -0.22);
    const lapR = at(pel, Fw, 0.25, 0.08, 0.08), lapL = at(pel, Fw, 0.25, 0.08, -0.08);
    const hR = lerp(lerp(lapR, hangR, st), [1.95, TABLE_H + 0.06, 2.08], reach), hL = lerp(lapL, hangL, st);
    return rig(B, pel, norm(add(UP, mul(Fw, 0.15 * reach))), Fw, { hL, hR, fL: lerp(seatF(-0.07), standF(-0.1), st), fR: lerp(seatF(0.07), standF(0.1), st), poleK: add(UP, Fw) });
  }
  const turn = io(clamp((f - T.TEEN_WALK[0]) / 8, 0, 1)), a = Math.PI / 2 * (1 + turn); // +x → -x
  const Fw = [Math.sin(a), 0, Math.cos(a)];
  const W = walk(B, [standPel[0], 0, standPel[2] + 0.1], [-1, 0, 0], f, T.TEEN_WALK[0] + 6, 13, 0.42);
  const pel = f < T.TEEN_WALK[0] + 6 ? standPel : W.pel;
  const L = norm(cross(Fw, UP));
  return rig(B, pel, UP, Fw, { hL: add(pel, add(add(mul(L, -0.2), [0, -0.5, 0]), mul(Fw, -W.swing))), hR: add(pel, add(add(mul(L, 0.2), [0, -0.5, 0]), mul(Fw, W.swing))), fL: W.fL, fR: W.fR, headOff: [0, -0.02, 0] });
}
export function paperAt(f) {
  if (f < T.KID_PICK[0]) return ON_TABLE;
  if (f < T.KID_DOWN[1] + 8) {
    const K = kidAt(f), mid = lerp(K.J.hL, K.J.hR, 0.5), inHand = heldAt(add(mid, [0.04, -0.03, 0.06]));
    const tUp = clamp((f - T.KID_PICK[0]) / (T.KID_UP[1] - T.KID_PICK[0]), 0, 1), tDn = clamp((f - T.KID_DOWN[0]) / (T.KID_DOWN[1] + 8 - T.KID_DOWN[0]), 0, 1);
    return ON_TABLE.map((p, i) => lerp(lerp(p, inHand[i], io(tUp)), p, io(tDn)));
  }
  if (f < T.TEEN_DROP[0] + 2) return ON_TABLE;
  if (f < T.TEEN_DROP[1]) { const Tn = teenAt(f), c = Tn.J.hR; return heldAt(add(c, [-0.02, -0.12, 0.02])); }
  const t = clamp((f - T.TEEN_DROP[1]) / 14, 0, 1), Tn = teenAt(T.TEEN_DROP[1] - 1), from = heldAt(add(Tn.J.hR, [-0.02, -0.12, 0.02]));
  return from.map((p, i) => { const q = lerp(p, ON_FLOOR[i], io(t)); return add(q, [0.06 * Math.sin(t * Math.PI * 3), 0, 0]); });
}
// ---------- жена: сидит, встаёт, приглушает лампу, уходит
export function wifeAt(f) {
  const B = ADULT, Fw0 = [-1, 0, 0], chairPel = add(add(CHAIR_WIFE, [0, 0.5, 0]), mul(Fw0, -0.03));
  const lk = sstep(T.WIFE_LOOK_KID[0], T.WIFE_LOOK_KID[1], f), lu = sstep(T.WIFE_LOOK_UP[0], T.WIFE_LOOK_UP[1], f) * (1 - sstep(300, 320, f));
  const sitT = { pel: chairPel, headOff: [-0.035 * lk - 0.03 * lu, 0.02 * lu, -0.02 * lu], hL: [2.72, TABLE_H + 0.05, 1.98], hR: at(chairPel, Fw0, 0.32, 0.08, 0.1), fL: at(chairPel, Fw0, 0.45, -0.44, -0.1), fR: at(chairPel, Fw0, 0.45, -0.44, 0.1) };
  if (f < T.WIFE_WALK[0]) {
    const standPel = [2.88, legLen(B) - 0.03, 2.25];
    const st = io(clamp((f - T.WIFE_STAND[0]) / (T.WIFE_STAND[1] - T.WIFE_STAND[0]), 0, 1));
    const rc = sstep(T.WIFE_REACH[0], T.WIFE_REACH[1] - 6, f) * (1 - sstep(T.LAMP_DIM + 2, T.WIFE_WALK[0], f));
    const pel = lerp(sitT.pel, standPel, st);
    const standT = { pel, headOff: [0, 0, 0], hL: add(pel, [-0.05, -0.55, -0.2]), hR: add(pel, [-0.05, -0.55, 0.2]), fL: [2.92, B.rL, 2.12], fR: [2.92, B.rL, 2.38] };
    const o = lerpObj(sitT, standT, st);
    o.pel = pel; o.hL = lerp(o.hL, [2.36, TABLE_H + 0.3, 1.94], rc);
    return rig(B, pel, norm(add(UP, mul(Fw0, 0.25 * rc))), Fw0, { ...o, poleK: st < 0.5 ? add(UP, Fw0) : undefined });
  }
  const turn = io(clamp((f - T.WIFE_WALK[0]) / 8, 0, 1)), a = -Math.PI / 2 + Math.PI * turn; // -x → +x
  const Fw = [Math.sin(a), 0, Math.cos(a)];
  const W = walk(B, [2.88, 0, 2.25], [1, 0, 0], f, T.WIFE_WALK[0] + 6, 15, 0.42);
  const pel = f < T.WIFE_WALK[0] + 6 ? [2.88, legLen(B) - 0.03, 2.25] : W.pel;
  const L = norm(cross(Fw, UP));
  return rig(B, pel, UP, Fw, { hL: add(pel, add(add(mul(L, -0.2), [0, -0.52, 0]), mul(Fw, -W.swing))), hR: add(pel, add(add(mul(L, 0.2), [0, -0.52, 0]), mul(Fw, W.swing))), fL: W.fL, fR: W.fR, headOff: [0, -0.02, 0] });
}
