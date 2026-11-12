// Неоновый герой на ленте-полосе карты: бег, предметы в стопку, остановка, лента тащит назад, петля.
import { add, sub, mul, norm, cross, lerp, mix, clamp, io, sstep, ik3 } from "./vec.js";
import { BELT_Y, HERO_Z, CARD } from "./world.js";
import * as T from "./timing.js";
const UP = [0, 1, 0], Fw = [-1, 0, 0], L = norm(cross(Fw, UP));
export const B = { thigh: 0.39, shin: 0.39, uarm: 0.29, farm: 0.29, top: 0.528, head: 0.805, sh: 0.48, rH: 0.15, rL: 0.063 };
const legLen = B.thigh + B.shin + B.rL;
// где герой вдоль ленты: с ростом дохода «продвигается» вперёд (-x), после остановки лента утаскивает к старту
export function heroX(f) {
  const prog = -3.6 * sstep(90, 600, f);
  if (f < T.SLIDE[0]) return prog;
  const t = clamp((f - T.SLIDE[0]) / (T.SLIDE[1] - T.SLIDE[0]), 0, 1);
  return -3.6 * (1 - t * t * (3 - 2 * t));
}
export const standAt = (f) => sstep(T.TURN, T.TURN + 6, f) * (1 - sstep(T.RESET - 26, T.RESET - 12, f));
function paceAt(f) { let P = T.PACE[0][1], Ls = T.PACE[0][2]; for (let i = 1; i < T.PACE.length; i++) { const [k, p2, l2] = T.PACE[i]; if (p2 === 999) continue; const t = sstep(k, k + 20, f); if (f >= k) { P = mix(P, p2, t); Ls = mix(Ls, l2, t); } } return { P, L: Ls }; }
const PH = [0], OFF = [0];
for (let f = 1; f <= T.N; f++) {
  const { P, L: Ls } = paceAt(f), run = 1 - standAt(f);
  let dOff = (Ls / (0.5 * P)) * run;
  if (f > T.SLIDE[0] && f <= T.SLIDE[1]) dOff = heroX(f) - heroX(f - 1);     // лента тащит его назад
  PH.push(PH[f - 1] + run / P); OFF.push(OFF[f - 1] + dOff);
}
// петля: фаза бега и рёбра ленты в кадре 900 совпадают с кадром 0
{ const a = T.RESET, dPh = Math.round(PH[T.N]) - PH[T.N], per = 1 / 3, dOf = Math.round(OFF[T.N] / per) * per - OFF[T.N];
  for (let f = a; f <= T.N; f++) { const t = (f - a) / (T.N - a); PH[f] += dPh * t; OFF[f] += dOf * t; } }
export const beltOffset = (f) => OFF[Math.max(0, Math.min(T.N, Math.round(f)))];
export const phaseAt = (f) => PH[Math.max(0, Math.min(T.N, f))];
// терминал: проезжает по всей карте, стоит с «APPROVED», уезжает
export function termX(f) {
  if (f < T.TERM[0]) return -40;
  if (f < T.TERM[1]) return mix(-9.8, 8.7, io((f - T.TERM[0]) / (T.TERM[1] - T.TERM[0])));
  if (f < T.APPROVED + 20) return 8.7;
  return mix(8.7, 40, sstep(T.APPROVED + 20, T.APPROVED + 44, f));
}
let VANISH = T.TERM[0]; for (let f = T.TERM[0]; f < T.TERM[1]; f++) if (termX(f) > -0.6) { VANISH = f; break; }
export const vanishF = VANISH;
export function glowAt(f) {
  let g = 1;
  const [s0, s1] = T.STRUGGLE;
  if (f > s0 && f < T.TURN) { const k = clamp((f - s0) / (s1 - s0), 0, 1); g = 1 - 0.3 * k;
    const h = Math.sin(f * 12.9898) * 43758.5453; const rnd = h - Math.floor(h);
    if (rnd < 0.06 + 0.22 * k) g *= 0.25 + 0.4 * rnd; }
  if (f >= T.TURN) g = 0.55 + 0.1 * Math.sin(f * 0.7);
  if (Math.abs(termX(f) - heroX(f)) < 1.1) g = 0;                 // проходит сквозь терминал
  if (f >= T.RESET - 30) g = mix(g, 1, sstep(T.RESET - 30, T.RESET, f));
  return g;
}
// предметы и стопка в руках
const ITEMS = [["tv", 0.24, 0], ["sofa", 0.16, 0.42], ["car", 0.13, 0.73], ["house", 0.24, 1.12]];
const carryCenter = (pel) => add(add(pel, [0, 0.36, 0]), mul(Fw, 0.36));
export function itemPos(name, f, pel) {
  const it = ITEMS.find((i) => i[0] === name), [ap, ct] = T.ITEMS[name];
  if (f < ap || f >= VANISH) return [0, -50, 0];
  const cx = heroX(ct - 6) - 0.45;
  if (f < ct - 6) return [cx - (beltOffset(ct - 6) - beltOffset(f)), BELT_Y + it[1], HERO_Z];
  const slot = add(carryCenter(pel), [0, it[2], 0]);
  return lerp([cx, BELT_Y + it[1], HERO_Z], slot, io(clamp((f - (ct - 6)) / 10, 0, 1)));
}
function rig(pel, tu, o) {
  tu = norm(tu);
  const top = add(pel, mul(tu, B.top)), head = add(add(pel, mul(tu, B.head)), o.headOff || [0, 0, 0]);
  const shc = add(pel, mul(tu, B.sh)), shL = add(shc, mul(L, -0.13)), shR = add(shc, mul(L, 0.13)), hipL = add(pel, mul(L, -0.07)), hipR = add(pel, mul(L, 0.07));
  const pA = (sd) => add(add(mul(Fw, -0.6), mul(tu, -0.8)), mul(L, sd * 0.3));
  const [eL, hL] = ik3(shL, o.hL, B.uarm, B.farm, pA(-1)), [eR, hR] = ik3(shR, o.hR, B.uarm, B.farm, pA(1));
  const pK = add(Fw, mul(tu, 0.2));
  const [kL, aL] = ik3(hipL, o.fL, B.thigh, B.shin, pK), [kR, aR] = ik3(hipR, o.fR, B.thigh, B.shin, pK);
  return { J: { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR }, chest: add(pel, mul(tu, 0.35)), head };
}
export function heroAt(f) {
  const ph = phaseAt(f), { L: stride } = paceAt(f), hx = heroX(f), st = standAt(f);
  const load = sstep(T.ITEMS.house[1], T.ITEMS.house[1] + 30, f) * (1 - st);
  const foot = (psi, side) => {
    psi = ((psi % 1) + 1) % 1; let x, y = BELT_Y + B.rL;
    if (psi < 0.5) x = stride * (psi / 0.5 - 0.5);
    else { const t = (psi - 0.5) / 0.5; x = stride * (0.5 - t); y += 0.2 * Math.sin(Math.PI * t) * (1 - 0.4 * load); }
    const run = [hx + x - 0.05, y, HERO_Z + side * 0.11], stand = [hx + 0.02, BELT_Y + B.rL, HERO_Z + side * 0.12];
    return lerp(run, stand, st);
  };
  const fL = foot(ph, -1), fR = foot(ph + 0.5, 1);
  const bob = 0.035 * Math.cos(4 * Math.PI * ph) * (1 - st);
  const pel = [hx - 0.08 * (1 - st), BELT_Y + legLen - 0.1 - 0.05 * load + 0.08 * st + bob, HERO_Z];
  const slideLean = sstep(T.SLIDE[0], T.SLIDE[0] + 6, f) * (1 - sstep(T.SLIDE[1], T.SLIDE[1] + 10, f));
  const tu = add(UP, mul(Fw, 0.2 + 0.12 * load - 0.25 * slideLean - 0.2 * st));
  const s = Math.sin(2 * Math.PI * ph);
  const swing = (sd, k) => add(add(add(pel, [0, 0.24, 0]), mul(Fw, 0.1 + 0.24 * k * (1 - st))), mul(L, sd * 0.2));
  let hL = swing(-1, s), hR = swing(1, -s);
  if (st > 0) { hL = lerp(hL, add(pel, add([0, -0.45, 0], mul(L, -0.22))), st); hR = lerp(hR, add(pel, add([0, -0.45, 0], mul(L, 0.22))), st); }
  const carry = sstep(T.ITEMS.tv[1] - 6, T.ITEMS.tv[1] + 4, f) * (1 - sstep(VANISH, VANISH + 6, f));
  if (carry > 0) { const c = carryCenter(pel); hL = lerp(hL, add(c, mul(L, -0.36)), carry); hR = lerp(hR, add(c, mul(L, 0.36)), carry); }
  const slump = sstep(T.SLIDE[1], T.SLIDE[1] + 20, f) * (1 - sstep(T.RESET - 26, T.RESET - 12, f));
  return rig(pel, tu, { hL, hR, fL, fR, headOff: [0.0, 0.01 * Math.cos(4 * Math.PI * ph) - 0.06 * slump, 0] });
}
