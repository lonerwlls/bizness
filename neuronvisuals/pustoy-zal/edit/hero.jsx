// Герой: серый человечек-пиктограмма анфас. Позы — ключи, суставы считаются по кадрам (IK),
// силуэт выписывается морф-сегментами path (d → morphTo, morphProgress линейно).
import { D, capsule, circle, ellipse, EASE } from "./lib.js";
import { N, FPS } from "./timing.js";
export const CX = 540, FLOOR = 1185;
const RL = 0.21 * D, RA = 0.195 * D, RT = 0.3 * D, RH = 0.5 * D, O = 0.1 * D;
const L1 = 1.3 * D, L2 = 1.3 * D, A1 = 0.97 * D, A2 = 0.97 * D;
const AY = FLOOR - RL;
const GRAY = "#B2B0B4", INK = "#161616";
const S = { px: CX, py: 952, tl: 1, lk: 1, lean: 0, hdx: 0, hdy: 0, lhx: -0.52 * D, lhy: 0.22 * D, rhx: 0.52 * D, rhy: 0.22 * D };
const hands = (lx, ly, rx, ry) => ({ lhx: lx * D, lhy: ly * D, rhx: rx * D, rhy: ry * D });
const HANG = hands(-0.52, 0.22, 0.52, 0.22), HUG = hands(0.42, -1.12, -0.42, -1.12);
// [кадр, изменения позы, easing сегмента, который заканчивается на этом ключе]
const KEYS = [
  [0, {}], [44, {}],
  [49, { py: 958 }, "io"],
  [60, { py: 946, hdy: -0.05 * D, ...hands(-1.25, -1.0, 0.95, -3.3) }, "out"],     // попытка 1: рука вверх
  [66, {}],
  [74, { py: 956, tl: 0.95, hdy: 0.12 * D, ...hands(-0.2, -0.55, 0.2, -0.55) }, "io"], // отдёрнул, сутулится
  [108, {}],
  [116, { tl: 1, hdy: 0, ...hands(-0.7, -0.2, 0.7, -0.2) }, "io"],                    // собрался с духом
  [128, { py: 966 }, "io"], [146, { py: 980, ...hands(-0.95, -0.6, 0.95, -0.6) }, "io"], // шаг вперёд
  [156, {}],
  [170, { py: 966 }, "io"], [176, { tl: 0.93, hdy: 0.14 * D, ...HUG }, "io"], [184, { py: 954 }, "io"], // назад, обхватил себя
  [200, {}],
  [216, { py: 998, tl: 0.9, hdy: 0.12 * D, ...hands(-0.95, 0.05, 0.95, 0.05) }, "io"],  // присел для прыжка
  [222, {}],
  [236, { py: FLOOR - 0.32 * D, lk: 0.78, tl: 0.86, hdy: 0.3 * D, ...hands(0.1, -2.5, -0.1, -2.5) }, "in"], // сел, закрыл голову
  [262, {}],
  [286, { tl: 0.95, hdy: 0.04 * D, ...hands(-0.95, -0.05, 0.95, -0.05) }, "io"],          // опустил руки, поднял голову
  [294, {}],
  [310, { py: 1000, lk: 1, tl: 0.92, hdy: 0.08 * D, ...hands(-0.5, -0.1, 0.5, -0.1) }, "io"],     // встаёт
  [326, { py: 952, tl: 1, hdy: 0, ...HANG }, "io"],
  [332, {}], [340, { hdx: -0.12 * D }, "io"], [344, {}], [352, { hdx: 0.12 * D }, "io"], [356, {}], [362, { hdx: 0 }, "io"], // оглядывается
  [400, {}], [406, { hdx: -0.08 * D }, "io"],
  [418, { py: 956, tl: 0.93, hdy: 0.14 * D, ...HUG }, "io"],                           // страх вернулся
  [N, {}],
];
const LEFT_STEPS = [[112, 128, CX - 0.32 * D, AY + 28, 18], [172, 184, CX - 0.32 * D, AY, 14], [224, 236, CX - 0.2 * D, AY + 14, 0], [296, 308, CX - 0.32 * D, AY, 12]];
const RIGHT_STEPS = [[130, 146, CX + 0.32 * D, AY + 28, 18], [158, 170, CX + 0.32 * D, AY, 14], [224, 236, CX + 0.2 * D, AY + 14, 0], [310, 322, CX + 0.32 * D, AY, 12]];

function poseAt(f) {
  const full = []; let cur = { ...S };
  for (const [k, ch, e] of KEYS) { cur = { ...cur, ...ch }; full.push([k, cur, e || "io"]); }
  for (let i = 1; i < full.length; i++) {
    const [f0, p0] = full[i - 1], [f1, p1, e] = full[i];
    if (f <= f1) { const t = f1 > f0 ? Math.max(0, (f - f0) / (f1 - f0)) : 1; const u = EASE[e](t); const o = {}; for (const k in p0) o[k] = p0[k] + (p1[k] - p0[k]) * u; return o; }
  }
  return full[full.length - 1][1];
}
function footAt(steps, x0, f) {
  let x = x0, y = AY;
  for (const [f0, f1, tx, ty, h] of steps) {
    if (f >= f1) { x = tx; y = ty; continue; }
    if (f > f0) { const t = (f - f0) / (f1 - f0), u = EASE.contact(t); return [x + (tx - x) * u, y + (ty - y) * u - h * Math.sin(Math.PI * t)]; }
    break;
  }
  return [x, y];
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, s) => [a[0] * s, a[1] * s];
function ik(a, t, l1, l2, side, yb) {
  let dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy); const mx = l1 + l2 - 0.5;
  if (d < 1e-3) { dx = 0; dy = 1; d = 1e-3; }
  const ux = dx / d, uy = dy / d; if (d > mx) d = mx;
  const al = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - al * al));
  const m = [a[0] + ux * al, a[1] + uy * al], c1 = [m[0] - uy * h, m[1] + ux * h], c2 = [m[0] + uy * h, m[1] - ux * h];
  const sc = (c) => side * c[0] + yb * c[1];
  const j = sc(c1) >= sc(c2) ? c1 : c2;
  return [j, [a[0] + ux * d, a[1] + uy * d]];
}
function joints(f) {
  const p = poseAt(f), lf = footAt(LEFT_STEPS, CX - 0.32 * D, f), rf = footAt(RIGHT_STEPS, CX + 0.32 * D, f);
  const dir = [Math.sin(p.lean), -Math.cos(p.lean)], perp = [Math.cos(p.lean), Math.sin(p.lean)], pel = [p.px, p.py];
  const top = add(pel, mul(dir, 1.76 * D * p.tl));
  const head = add(add(pel, mul(dir, (1.76 * p.tl + 0.92) * D)), [p.hdx, p.hdy]);
  const sh = add(pel, mul(dir, 1.6 * D * p.tl));
  const shL = add(sh, mul(perp, -0.4 * D)), shR = add(sh, mul(perp, 0.4 * D));
  const hipL = add(pel, mul(perp, -0.2 * D)), hipR = add(pel, mul(perp, 0.2 * D));
  const [eL, hL] = ik(shL, [p.px + p.lhx, p.py + p.lhy], A1, A2, -1, 0.5);
  const [eR, hR] = ik(shR, [p.px + p.rhx, p.py + p.rhy], A1, A2, 1, 0.5);
  const [kL, aL] = ik(hipL, lf, L1 * p.lk, L2 * p.lk, -1, -0.25);
  const [kR, aR] = ik(hipR, rf, L1 * p.lk, L2 * p.lk, 1, -0.25);
  return { pel, top, head, shL, shR, eL, eR, hL, hR, hipL, hipR, kL, kR, aL, aR };
}
const flat = (j) => Object.values(j).flat();
function legs(j, r, m) { return [capsule(...m(j.hipL), ...m(j.kL), r), capsule(...m(j.kL), ...m(j.aL), r), capsule(...m(j.hipR), ...m(j.kR), r), capsule(...m(j.kR), ...m(j.aR), r)].join(" "); }
function body(j, rt, rh, m) { return capsule(...m(j.pel), ...m(j.top), rt) + " " + circle(...m(j.head), rh); }
function arms(j, r, m) { return [capsule(...m(j.shL), ...m(j.eL), r), capsule(...m(j.eL), ...m(j.hL), r), capsule(...m(j.shR), ...m(j.eR), r), capsule(...m(j.eR), ...m(j.hR), r)].join(" "); }
const id = (p) => p;
const LAYERS = [
  { name: "refl", d: (j) => { const ym = Math.max(j.aL[1], j.aR[1]) + RL; const m = (p) => [p[0], 2 * ym - p[1]]; return legs(j, RL, m) + " " + body(j, RT, RH, m) + " " + arms(j, RA, m); }, fill: GRAY, opacity: 0.16, refl: true },
  { name: "legsO", d: (j) => legs(j, RL + O, id), fill: INK },
  { name: "legs", d: (j) => legs(j, RL, id), fill: GRAY },
  { name: "bodyO", d: (j) => body(j, RT + O, RH + O, id), fill: INK },
  { name: "body", d: (j) => body(j, RT, RH, id), fill: GRAY },
  { name: "armsO", d: (j) => arms(j, RA + O, id), fill: INK },
  { name: "arms", d: (j) => arms(j, RA, id), fill: GRAY },
];
export function heroFrames() { const J = []; for (let f = 0; f <= N; f++) J.push(joints(Math.min(f, N - 1))); return J; }
function segments(J) {
  const V = J.map(flat), segs = []; let a = 0;
  while (a < N) {
    let b = a + 1;
    while (b + 1 <= N && b + 1 - a <= 24) {
      const c = b + 1; let ok = true;
      for (let m = a + 1; m < c && ok; m++) { const t = (m - a) / (c - a); for (let i = 0; i < V[a].length; i++) { if (Math.abs(V[m][i] - (V[a][i] + (V[c][i] - V[a][i]) * t)) > 0.45) { ok = false; break; } } }
      if (!ok) break; b = c;
    }
    segs.push([a, b]); a = b;
  }
  return segs;
}
export function heroNodes(stageMask) {
  const J = heroFrames(), segs = segments(J), out = [];
  for (const L of LAYERS) {
    for (const [a, b] of segs) {
      const d0 = L.d(J[a]), d1 = L.d(J[b]), dur = (b - a) / FPS, same = d0 === d1;
      const anim = [];
      if (!same) anim.push({ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" });
      if (L.opacity !== undefined) anim.push({ property: "opacity", keyframes: [{ at: 0, value: L.opacity }, { at: dur, value: L.opacity }] });
      const props = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920, d: d0, fill: L.fill };
      if (!same) props.morphTo = d1;
      if (anim.length) props.animate = anim;
      if (L.refl) props.mask = { shape: "path", d: stageMask, feather: 16 };
      out.push(<path {...props} />);
    }
  }
  return { nodes: out, segCount: segs.length };
}
