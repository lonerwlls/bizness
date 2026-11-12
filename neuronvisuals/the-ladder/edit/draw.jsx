// Рисование фигур по кадрам: проекция 3D-суставов, капсулы с обводкой, порядок частей по глубине,
// морф-сегменты (d → morphTo) там, где движение почти линейно.
import { FPS, N } from "./timing.js";
const q = (v) => (Math.round(v * 10) / 10).toString();
function capsule(a, b, r) {
  let ux = b.x - a.x, uy = b.y - a.y; const L = Math.hypot(ux, uy);
  if (L < 1e-4) { ux = 0; uy = 1; } else { ux /= L; uy /= L; }
  const nx = -uy, ny = ux, k = 0.5523 * r, P = (x, y) => `${q(x)} ${q(y)}`;
  const a0 = [a.x + nx * r, a.y + ny * r], b0 = [b.x + nx * r, b.y + ny * r], b1 = [b.x + ux * r, b.y + uy * r], b2 = [b.x - nx * r, b.y - ny * r];
  const a2 = [a.x - nx * r, a.y - ny * r], a1 = [a.x - ux * r, a.y - uy * r];
  return `M${P(...a0)} L${P(...b0)} C${P(b0[0] + ux * k, b0[1] + uy * k)} ${P(b1[0] + nx * k, b1[1] + ny * k)} ${P(...b1)} C${P(b1[0] - nx * k, b1[1] - ny * k)} ${P(b2[0] + ux * k, b2[1] + uy * k)} ${P(...b2)} L${P(...a2)} C${P(a2[0] - ux * k, a2[1] - uy * k)} ${P(a1[0] - nx * k, a1[1] - ny * k)} ${P(...a1)} C${P(a1[0] + nx * k, a1[1] + ny * k)} ${P(a0[0] - ux * k, a0[1] - uy * k)} ${P(...a0)} Z`;
}
const circle = (c, r) => capsule(c, { x: c.x, y: c.y + 0.001 }, r);
const quad = (pts) => "M" + pts.map((p) => `${q(p.x)} ${q(p.y)}`).join(" L") + " Z";
// sk: { J (3D), B (размеры), paper? }; proj: функция кадра
function project(sk, proj) {
  const P = {}; for (const k in sk.J) P[k] = proj(sk.J[k]);
  const paper = sk.paper ? sk.paper.map(proj) : null;
  return { P, B: sk.B, paper };
}
const rr = (a, b, rm) => rm * (a.k + b.k) / 2;
function layersOf(F, o) {
  const { P, B } = F, e = o ? B.o : 0;
  const leg = (h, k, a) => capsule(P[h], P[k], rr(P[h], P[k], B.rL + e)) + " " + capsule(P[k], P[a], rr(P[k], P[a], B.rL + e));
  const arm = (s, el, h) => capsule(P[s], P[el], rr(P[s], P[el], B.rA + e)) + " " + capsule(P[el], P[h], rr(P[el], P[h], B.rA + e));
  return {
    legs: leg("hipL", "kL", "aL") + " " + leg("hipR", "kR", "aR"),
    body: capsule(P.pel, P.top, rr(P.pel, P.top, B.rT + e)) + " " + circle(P.head, B.rH * P.head.k + e * P.head.k),
    arms: arm("shL", "eL", "hL") + " " + arm("shR", "eR", "hR"),
  };
}
function order(F) {
  const z = (ks) => ks.reduce((s, k) => s + F.P[k].z, 0) / ks.length;
  const tz = z(["pel", "top"]);
  return { armsFront: z(["eL", "eR", "hL", "hR"]) < tz - 0.01, legsFront: z(["kL", "kR", "aL", "aR"]) < tz - 0.01 };
}
const flatPts = (F) => { const v = []; for (const k in F.P) v.push(F.P[k].x, F.P[k].y, F.P[k].k * 0.1); if (F.paper) for (const p of F.paper) v.push(p.x, p.y); return v; };
const onScreen = (F) => Object.values(F.P).some((p) => p.z > 0.1 && p.x > -150 && p.x < 1230 && p.y > -150 && p.y < 2070);
// skAt(f) → скелет; projs[f] → проектор; возвращает узлы по слоям
export function figureNodes(skAt, projs, opt = {}) {
  const [r0, r1] = opt.range || [0, N];
  const opAt = (f) => { let o = 1; if (opt.fadeIn) o *= Math.min(1, Math.max(0, (f - opt.fadeIn[0]) / (opt.fadeIn[1] - opt.fadeIn[0]))); if (opt.fadeOut) o *= 1 - Math.min(1, Math.max(0, (f - opt.fadeOut[0]) / (opt.fadeOut[1] - opt.fadeOut[0]))); return o; };
  const col = opt.color || "#B2B0B4", ink = "#161616", tol = opt.tol || 0.7;
  const Fs = [], Os = [], Vs = [];
  for (let f = 0; f <= N; f++) { const F = project(skAt(Math.min(Math.max(f, r0), Math.min(r1, N) - 1)), projs[f]); Fs.push(F); Os.push(order(F)); Vs.push(flatPts(F)); }
  const segs = []; let a = r0;
  const brk = new Set([...(opt.fadeIn || []), ...(opt.fadeOut || [])]);
  while (a < r1) {
    let b = a + 1;
    while (b + 1 <= r1 && b + 1 - a <= 12 && !brk.has(b) && !(opAt(b) < 1 && opAt(b) > 0)) {
      const c = b + 1; let ok = Os[c].armsFront === Os[a].armsFront && Os[c].legsFront === Os[a].legsFront;
      for (let m = a + 1; m < c && ok; m++) { const t = (m - a) / (c - a); for (let i = 0; i < Vs[a].length; i++) if (Math.abs(Vs[m][i] - (Vs[a][i] + (Vs[c][i] - Vs[a][i]) * t)) > tol) { ok = false; break; } }
      if (!ok) break; b = c;
    }
    segs.push([a, b]); a = b;
  }
  const slots = { legsBack: [], armsBack: [], body: [], legsFront: [], armsFront: [], paper: [] };
  let count = 0;
  for (const [a, b] of segs) {
    if (!onScreen(Fs[a]) && !onScreen(Fs[b])) continue;
    if (Object.values(Fs[a].P).some((p) => p.z < 0.15) || Object.values(Fs[b].P).some((p) => p.z < 0.15)) continue;
    const LO0 = layersOf(Fs[a], true), LO1 = layersOf(Fs[b], true), L0 = layersOf(Fs[a], false), L1 = layersOf(Fs[b], false);
    const dur = (b - a) / FPS, base = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920 };
    const oa = opAt(a), ob = opAt(b); if (oa <= 0 && ob <= 0) continue;
    const mk = (d0, d1, fill, extra = {}) => { const p = { ...base, d: d0, fill, ...extra }; const an = []; if (d0 !== d1) { p.morphTo = d1; an.push({ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" }); } if (oa < 1 || ob < 1) an.push({ property: "opacity", from: oa, to: ob, at: 0, duration: dur, easing: "linear" }); if (an.length) p.animate = an; count++; return <path {...p} />; };
    const o = Os[a];
    for (const part of ["legs", "arms"]) {
      const slot = slots[part + (o[part + "Front"] ? "Front" : "Back")];
      slot.push(mk(LO0[part], LO1[part], ink)); slot.push(mk(L0[part], L1[part], col));
    }
    slots.body.push(mk(LO0.body, LO1.body, ink)); slots.body.push(mk(L0.body, L1.body, col));
  }
  return { nodes: [...slots.legsBack, ...slots.armsBack, ...slots.body, ...slots.legsFront, ...slots.armsFront, ...slots.paper], segs: segs.length, count };
}

// отдельный предмет-четырёхугольник (рисунок ребёнка)
export function quadNodes(ptsAt, projs, fill = "#EDEBE6") {
  const V = []; for (let f = 0; f <= N; f++) V.push(ptsAt(Math.min(f, N - 1)).map(projs[f]));
  const out = []; let a = 0;
  while (a < N) {
    let b = a + 1;
    while (b + 1 <= N && b + 1 - a <= 12) { const c = b + 1; let ok = true; for (let m = a + 1; m < c && ok; m++) { const t = (m - a) / (c - a); for (let i = 0; i < 4; i++) { if (Math.abs(V[m][i].x - (V[a][i].x + (V[c][i].x - V[a][i].x) * t)) > 0.6 || Math.abs(V[m][i].y - (V[a][i].y + (V[c][i].y - V[a][i].y) * t)) > 0.6) { ok = false; break; } } } if (!ok) break; b = c; }
    const vis = (P) => P.every((p) => p.z > 0.2) && P.some((p) => p.x > -100 && p.x < 1180 && p.y > -100 && p.y < 2020);
    if (vis(V[a]) || vis(V[b])) {
      const dur = (b - a) / FPS, d0 = quad(V[a]), d1 = quad(V[b]), w = Math.max(1.2, 0.01 * V[a][0].k);
      const p = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920, d: d0, fill, stroke: { width: w, color: "#161616" } };
      if (d0 !== d1) { p.morphTo = d1; p.animate = [{ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" }]; }
      out.push(<path {...p} />);
    }
    a = b;
  }
  return out;
}
