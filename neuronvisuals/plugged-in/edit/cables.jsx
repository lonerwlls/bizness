// Провода подписок: путь провода, бегущие огоньки (от героя в темноту), вспышка разъёма, ценник.
import { FPS, N, SUBS, LOCK } from "./timing.js";
import { cableCurve } from "./people.js";
const q = (v) => (Math.round(v * 10) / 10).toString();
const pl = (pts) => "M" + pts.map((p) => `${q(p.x)} ${q(p.y)}`).join(" L");
function along(P, s) { const n = P.length - 1, x = Math.max(0, Math.min(n - 1e-6, s * n)), i = Math.floor(x), t = x - i; return { x: P[i].x + (P[i + 1].x - P[i].x) * t, y: P[i].y + (P[i + 1].y - P[i].y) * t, k: P[i].k }; }
export function cableNodes(hero, projs, ty) {
  const out = [], labels = [];
  SUBS.forEach(([t0, price, name], i) => {
    const F0 = t0 - 9;
    const V = [];
    for (let f = 0; f <= N; f++) { const c = cableCurve(i, Math.min(f, N - 1), hero[Math.min(f, N - 1)]); const P = c.pts.map(projs[f]); 
      const ph = Math.max(0, f - t0) * 0.035, dashes = [0, 1, 2].map((j) => { const s0 = 1 - ((ph + j / 3) % 1); return [along(P, s0), along(P, Math.max(0, s0 - 0.05)), along(P, Math.max(0, s0 - 0.1))]; });
      V.push({ P, dashes, plugP: P[P.length - 1] }); }
    let a = F0; const END = LOCK + 6;
    while (a < END) {
      let b = a + 1;
      while (b + 1 <= END && b + 1 - a <= 8 && !(a < t0 && b + 1 > t0)) { const c = b + 1; let ok = true;
        for (let m = a + 1; m < c && ok; m++) { const t = (m - a) / (c - a); const chk = (A, Bp, M) => Math.abs(M.x - (A.x + (Bp.x - A.x) * t)) < 1.2 && Math.abs(M.y - (A.y + (Bp.y - A.y) * t)) < 1.2;
          for (let j = 0; j < V[a].P.length && ok; j++) ok = chk(V[a].P[j], V[c].P[j], V[m].P[j]);
          for (let d = 0; d < 3 && ok; d++) for (let e = 0; e < 3 && ok; e++) ok = chk(V[a].dashes[d][e], V[c].dashes[d][e], V[m].dashes[d][e]); }
        if (!ok) break; b = c; }
      const dur = (b - a) / FPS, base = { at: a / FPS, duration: dur, x: 0, y: 0, width: 1080, height: 1920 };
      const k = V[a].P[V[a].P.length - 1].k;
      const mk = (d0, d1, stroke, extra = {}) => { const p = { ...base, d: d0, stroke, ...extra }; if (d0 !== d1) { p.morphTo = d1; p.animate = [{ property: "morphProgress", from: 0, to: 1, at: 0, duration: dur, easing: "linear" }]; } return <path {...p} />; };
      out.push(mk(pl(V[a].P), pl(V[b].P), { width: Math.max(2, 0.03 * k), color: "#2B272E", cap: "round" }));
      out.push(mk(pl(V[a].P), pl(V[b].P), { width: Math.max(1, 0.008 * k), color: "#57525A", cap: "round" }));
      if (a >= t0) { const dd = (D) => D.map((s) => pl(s)).join(" ");
        out.push(mk(dd(V[a].dashes), dd(V[b].dashes), { width: Math.max(2, 0.03 * k), color: "#FF7A2E", cap: "round" }, { blendMode: "screen", effects: [{ kind: "blur", params: { px: +Math.max(1, 0.012 * k).toFixed(1) } }] })); }
      a = b;
    }
    // ценник рядом с проводом (ближе к герою), следует за ним
    const kx = [], ky = [], ks = [];
    for (let f = 0; f <= N; f += 2) { const P = V[f].P, s = along(P, 0.6); kx.push({ at: f / FPS, value: +(s.x - 250).toFixed(1), easing: "linear" }); ky.push({ at: f / FPS, value: +(s.y - 90).toFixed(1), easing: "linear" }); ks.push({ at: f / FPS, value: +Math.max(0.001, Math.min(1.1, (s.k * 0.085) / 50)).toFixed(5), easing: "linear" }); }
    labels.push(<frame x={0} y={0} width={500} height={70} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kx }, { property: "offsetY", keyframes: ky }, { property: "scale", keyframes: ks }, { property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: t0 / FPS, value: 1, easing: "hold" }, { at: (t0 + 40) / FPS, value: 1, easing: "linear" }, { at: (t0 + 52) / FPS, value: 0.45, easing: "hold" }, { at: Math.max(t0 + 53, LOCK - 2) / FPS, value: 0.45, easing: "linear" }, { at: Math.max(t0 + 54, LOCK + 4) / FPS, value: 0, easing: "hold" }, { at: N / FPS, value: 0 }] }]}>
      <text x={0} y={0} width={500} align="center" typography={ty} fontFamily="Tektur" fontSize={50} letterSpacing={3} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 14, color: "#FF7A2E99" }}>{"$" + price.toFixed(2) + " " + name}</text>
    </frame>);
  });
  return { nodes: out, labels };
}
