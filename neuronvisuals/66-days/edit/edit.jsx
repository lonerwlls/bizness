// «66 Days» — трое ходят каждый по своей дорожке; двое бросают (на 3-й и 21-й день); у героя дорожка натаптывается и светится,
// к 66-му дню идти легко. Финал: весь мир — светящаяся дорожка внутри мозга. Факт: UCL (Lally et al.).
import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { poseAt, glowAt, pathAt, labelAt } from "./people.js";
import { cameraAt, projector } from "./camera.js";
import { neonNodes } from "./neon.jsx";
import { clamp, sstep } from "./vec.js";
const { DUR, N, FPS } = T;
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const kfs = (list) => list.map(([f, v, e]) => (e ? { at: f / FPS, value: v, easing: e } : { at: f / FPS, value: v }));
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null; try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
  const R = T.W.map((_, i) => SF.map((s) => poseAt(i, s)));
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const raw = SF.map((s) => cameraAt(s));
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const U = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    hx: (f) => R[0][f].chest[0], hy: (f) => R[0][f].chest[1], hz: (f) => R[0][f].chest[2], hg: (f) => glowAt(0, SF[f]),
    p0: (f) => pathAt(0, SF[f]), p1: (f) => pathAt(1, SF[f]), p2: (f) => pathAt(2, SF[f]) };
  const params = {}; for (const k in U) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(U).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const figs = [], labels = [];
  const tyU = (w) => ({ fontAssetId: font.id, axes: { wght: w }, script: "Latn", language: "en" });
  let segs = 0;
  for (const i of [2, 1, 0]) {
    const color = T.W[i].color;
    const nn = neonNodes((F) => R[i][F], projs, (F) => glowAt(i, SF[F]), { color, glass: false }); figs.push(...nn.nodes); segs += nn.segs;
    const kx = [], ky = [], ks = [], ko = [];
    for (const f of KEYF) { const h = R[i][f].head; const pr = projs[f]([h[0], h[1] + 0.45, h[2]]); kx.push({ at: f / FPS, value: +(pr.x - 250).toFixed(1), easing: "linear" }); ky.push({ at: f / FPS, value: +(pr.y - 60).toFixed(1), easing: "linear" }); ks.push({ at: f / FPS, value: +Math.max(0.001, Math.min(1.5, pr.k * 0.0034)).toFixed(4), easing: "linear" }); ko.push({ at: f / FPS, value: +(pr.z < 0.3 || (i === 0 && SF[f] > 612 && SF[f] < T.PULL[0]) ? 0 : clamp(glowAt(i, SF[f]) * 1.8, 0, 1) * (1 - sstep(T.PULL[0] - 12, T.PULL[0] + 6, SF[f]))).toFixed(3), easing: "linear" }); }
    const vals = []; let f = 0;
    while (f < N) { const L = labelAt(i, SF[f]); let e = f + 1; while (e < N && labelAt(i, SF[e]).text === L.text) e++;
      const col = L.red ? "#FF5A4E" : (i === 0 ? "#FFB37A" : "#E9E7EA");
      vals.push(<text at={f / FPS} duration={(e - f - 0.02) / FPS} x={0} y={0} width={500} align="center" typography={tyU(600)} fontFamily="Tektur" fontSize={L.red ? 40 : 46} letterSpacing={3} color={col} shadow={{ x: 0, y: 0, blur: 14, color: i === 0 ? "#FF7A2E99" : "#FFFFFF55" }}>{L.text}</text>); f = e; }
    labels.push(<frame x={0} y={0} width={500} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kx }, { property: "offsetY", keyframes: ky }, { property: "scale", keyframes: ks }, { property: "opacity", keyframes: ko }]}>{vals}</frame>);
  }
  console.error("neon segments:", segs);
  const txt = { x: 60, width: 960, align: "center", typography: tyU(400), fontFamily: "Tektur", fontSize: 36, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  const caps = T.CAPS.map(([f0, line], i) => { const f1 = i + 1 < T.CAPS.length ? T.CAPS[i + 1][0] : T.CAP_END, d = (f1 - f0) / FPS, last = i + 1 === T.CAPS.length;
    return <text {...txt} y={300} at={f0 / FPS} duration={d} animate={[{ property: "opacity", keyframes: [{ at: 0, value: i === 0 ? 1 : 0, easing: "ease-out" }, { at: Math.min(0.3, d / 2), value: 1, easing: last ? "ease-in" : "hold" }, ...(last ? [{ at: d - 0.3, value: 1, easing: "ease-in" }, { at: d, value: 0 }] : [{ at: d, value: 1 }])] }]}>{line}</text>; });
  caps.push(<text {...txt} y={300} at={T.PUSH[0] / FPS} duration={(N - T.PUSH[0]) / FPS} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "ease-in" }, { at: (N - T.PUSH[0]) / FPS, value: 1 }] }]}>{T.CAPS[0][1]}</text>);
  const bigs = T.BIG.map(([f0, num], i) => { const f1 = i + 1 < T.BIG.length ? T.BIG[i + 1][0] : T.PULL[0] - 4, d = (f1 - f0) / FPS, fin = i + 1 === T.BIG.length;
    return <text x={0} y={150} width={1080} align="center" at={f0 / FPS} duration={d} typography={tyU(700)} fontFamily="Tektur" fontSize={fin ? 150 : 120} letterSpacing={8} color={fin ? "#FFB37A" : "#F4F3F5"} shadow={{ x: 0, y: 0, blur: 30, color: fin ? "#FF7A2EAA" : "#FFFFFF55" }} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0.2, easing: "ease-out" }, { at: 0.12, value: 1, easing: "hold" }, { at: Math.max(0.2, d - 0.25), value: 1, easing: "ease-in" }, { at: d, value: fin ? 0 : 0.6 }] }, { property: "scale", keyframes: [{ at: 0, value: 1.25, easing: "ease-out" }, { at: 0.25, value: 1 }] }]}>{"DAY " + num}</text>; });
  // отъезд: весь мир внутри мозга
  const SC = 0.56, CY = -150;
  const scaleK = kfs([[0, 1, "hold"], [T.PULL[0], 1, "ease-in-out"], [T.PULL[1], SC, "hold"], [T.PUSH[0], SC, "ease-in"], [N, 1]]);
  const offK = kfs([[0, 0, "hold"], [T.PULL[0], 0, "ease-in-out"], [T.PULL[1], CY, "hold"], [T.PUSH[0], CY, "ease-in"], [N, 0]]);
  const outOp = kfs([[0, 0, "hold"], [T.PULL[0] + 4, 0, "ease-out"], [T.PULL[0] + 28, 1, "hold"], [T.PUSH[0] + 2, 1, "ease-in"], [N - 4, 0, "hold"], [N, 0]]);
  const BR = [[262, 815], [258, 735], [283, 655], [333, 590], [402, 542], [482, 512], [562, 502], [642, 512], [720, 540], [785, 585], [828, 648], [848, 720], [843, 792], [818, 850], [790, 878], [800, 910], [782, 950], [736, 970], [690, 962], [656, 937], [628, 958], [604, 1008], [578, 1030], [562, 1000], [556, 950], [520, 930], [450, 925], [380, 910], [322, 885], [282, 858]];
  const smooth = (pts) => { let d = `M${pts[0][0]} ${pts[0][1]}`; for (let k = 0; k < pts.length; k++) { const a = pts[k], b = pts[(k + 1) % pts.length], c = pts[(k + 2) % pts.length], m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m2 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]; if (k === 0) d = `M${m1[0]} ${m1[1]}`; d += ` Q${b[0]} ${b[1]} ${m2[0]} ${m2[1]}`; } return d + " Z"; };
  const brainD = smooth(BR), holeD = "M-200 -200 L1280 -200 L1280 2120 L-200 2120 Z " + smooth(BR.slice().reverse());
  const gyri = ["M330 640 Q380 600 430 640 Q470 680 520 640", "M560 560 Q610 590 600 640 Q590 690 650 700", "M700 600 Q760 640 740 700 Q720 750 780 780", "M300 760 Q360 730 400 770 Q440 810 500 790", "M560 760 Q620 730 660 780 Q690 820 750 810", "M380 860 Q440 830 500 870", "M680 880 Q720 850 760 880 M690 920 Q730 900 765 925"];
  const brain = (<frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "opacity", keyframes: outOp }]}>
    <path x={0} y={0} width={1080} height={1920} d={holeD} fill="#010002" />
    {gyri.map((d) => <path x={0} y={0} width={1080} height={1920} d={d} stroke={{ width: 4, color: "#B88C9C", cap: "round" }} animate={[{ property: "opacity", from: 0.35, to: 0.35, at: 0, duration: DUR }]} />)}
    <path x={0} y={0} width={1080} height={1920} d={brainD} stroke={{ width: 7, color: "#C99AAA", cap: "round" }} effects={[{ kind: "blur", params: { px: 1.2 } }]} />
    <path x={0} y={0} width={1080} height={1920} d={brainD} stroke={{ width: 22, color: "#C99AAA", cap: "round" }} animate={[{ property: "opacity", from: 0.25, to: 0.25, at: 0, duration: DUR }]} effects={[{ kind: "blur", params: { px: 14 } }]} />
  </frame>);
  // факт: Lally et al., UCL (European Journal of Social Psychology)
  const fd = (T.FACT[1] - T.FACT[0]) / FPS;
  const fop = (d0) => [...(d0 > 0 ? [{ at: 0, value: 0, easing: "hold" }] : []), { at: d0, value: 0, easing: "ease-out" }, { at: d0 + 0.4, value: 1, easing: "hold" }, { at: fd + 0.1, value: 1, easing: "ease-in" }, { at: fd + 0.45, value: 0 }];
  const fact = (<frame x={0} y={0} width={1080} height={1920} layout="none" at={T.FACT[0] / FPS} duration={fd + 0.5}>
    <text x={60} y={1140} width={960} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={44} letterSpacing={3} color="#F4F3F5" animate={[{ property: "opacity", keyframes: fop(0) }]}>A NEW HABIT TOOK 66 DAYS</text>
    <text x={60} y={1198} width={960} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={44} letterSpacing={3} color="#F4F3F5" animate={[{ property: "opacity", keyframes: fop(0.2) }]}>ON AVERAGE.</text>
    <text x={60} y={1280} width={960} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={96} letterSpacing={6} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 22, color: "#FF7A2E99" }} animate={[{ property: "opacity", keyframes: fop(0.9) }]}>NOT 21.</text>
    <text x={60} y={1420} width={960} align="center" typography={tyU(400)} fontFamily="Tektur" fontSize={24} letterSpacing={5} color="#8F8C90" animate={[{ property: "opacity", keyframes: fop(1.5) }]}>UCL STUDY · LALLY ET AL.</text>
  </frame>);
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#010002" />
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" clip animate={[{ property: "scale", keyframes: scaleK }, { property: "offsetY", keyframes: offK }]}>
        <frame x={135} y={240} width={810} height={1440} layout="none" origin="center" animate={[{ property: "scale", keyframes: [{ at: 0, value: 4 / 3 }, { at: DUR, value: 4 / 3 }] }]}><rect x={0} y={0} width={810} height={1440} fill="#000000" effects={eff} animate={anim} /></frame>
        {figs}
        {labels}
      </frame>
      {brain}
      {caps}
      {bigs}
      {fact}
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
};
