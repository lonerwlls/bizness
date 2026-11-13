// Неоновый человечек: проекция суставов → линии-трубки (ореол, трубка, белая сердцевина), морф-сегменты.
import { FPS, N } from "./timing.js";
const q = (v) => (Math.round(v * 10) / 10).toString();
const pl = (pts) => "M" + pts.map((p) => `${q(p.x)} ${q(p.y)}`).join(" L");
function circle(c, r) { const k = 0.5523 * r, P = (x, y) => `${q(x)} ${q(y)}`;
  return `M${P(c.x + r, c.y)} C${P(c.x + r, c.y - k)} ${P(c.x + k, c.y - r)} ${P(c.x, c.y - r)} C${P(c.x - k, c.y - r)} ${P(c.x - r, c.y - k)} ${P(c.x - r, c.y)} C${P(c.x - r, c.y + k)} ${P(c.x - k, c.y + r)} ${P(c.x, c.y + r)} C${P(c.x + k, c.y + r)} ${P(c.x + r, c.y + k)} ${P(c.x + r, c.y)} Z`; }
function shapes(P, rH) {
  const lines = [pl([P.hipL, P.kL, P.aL]), pl([P.hipR, P.kR, P.aR]), pl([P.pel, P.top]), pl([P.shL, P.shR]), pl([P.hipL, P.hipR]), pl([P.shL, P.eL, P.hL]), pl([P.shR, P.eR, P.hR])].join(" ");
  return { lines, head: circle(P.head, rH * P.head.k) };
}
// glowAt(f) — яркость неона 0..1 (мигание, угасание)
export function neonNodes(skAt, projs, glowAt, opt = {}) {
  const color = opt.color || "#FF7A2E", tol = opt.tol || 0.8, rH = 0.15;
  const Ps = [], V = [];
  for (let f = 0; f <= N; f++) { const sk = skAt(Math.min(f, N - 1)), P = {}; for (const k in sk.J) P[k] = projs[f](sk.J[k]); Ps.push(P); const v = []; for (const k in P) v.push(P[k].x, P[k].y, P[k].k * 0.15); V.push(v); }
  const segs = []; let a = 0;
  while (a < N) { let b = a + 1;
    while (b + 1 <= N && b + 1 - a <= 10) { const c = b + 1; let ok = true; for (let m = a + 1; m <= c && ok; m++) { const t = (m - a) / (c - a); if (Math.abs(glowAt(m) - (glowAt(a) + (glowAt(c) - glowAt(a)) * t)) > 0.02) ok = false; }
      for (let m = a + 1; m < c && ok; m++) { const t = (m - a) / (c - a); for (let i = 0; i < V[a].length; i++) if (Math.abs(V[m][i] - (V[a][i] + (V[c][i] - V[a][i]) * t)) > tol) { ok = false; break; } }
      if (!ok) break; b = c; }
    segs.push([a, b]); a = b; }
  const layers = { glass: [], glow: [], tube: [], core: [] };
  for (const [a, b] of segs) {
    if (Object.values(Ps[a]).some((p) => p.z < 0.2)) continue;
    if (glowAt(a) < 0.003 && glowAt(b) < 0.003) continue;
    const S0 = shapes(Ps[a], rH), S1 = shapes(Ps[b], rH), k = Ps[a].pel.k, dur = (b - a) / FPS;
    const ga = glowAt(a), gb = glowAt(b);
    const mk = (d0, d1, w, col, blur, op) => {
      const p = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920, d: d0, stroke: { width: Math.max(1.2, w), color: col, cap: "round" }, blendMode: "screen" };
      if (blur > 0.5) p.effects = [{ kind: "blur", params: { px: +blur.toFixed(1) } }];
      const an = [{ property: "opacity", from: +(op * Math.pow(ga, 1.6)).toFixed(3), to: +(op * Math.pow(gb, 1.6)).toFixed(3), at: 0, duration: dur, easing: "linear" }];
      if (d0 !== d1) { p.morphTo = d1; an.push({ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" }); }
      p.animate = an; return <path {...p} />;
    };
    for (const [key, d0, d1] of [["l", S0.lines, S1.lines], ["h", S0.head, S1.head]]) {
      if (opt.glass !== false) { const p = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920, d: d0, stroke: { width: Math.max(1.5, 0.07 * k), color: "#3A3540", cap: "round" } }; if (d0 !== d1) { p.morphTo = d1; p.animate = [{ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" }]; } layers.glass.push(<path {...p} />); }
      layers.glow.push(mk(d0, d1, 0.16 * k, color, 0.14 * k, 0.5));
      layers.tube.push(mk(d0, d1, 0.07 * k, color, 0.012 * k, 1));
      layers.core.push(mk(d0, d1, 0.028 * k, "#FFF1DD", 0, 1));
    }
  }
  return { nodes: [...layers.glass, ...layers.glow, ...layers.tube, ...layers.core], segs: segs.length };
}
