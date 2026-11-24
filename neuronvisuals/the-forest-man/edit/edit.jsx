// «The Forest Man» — на голом острове герой сажает дерево, потом ещё и ещё; сомневающиеся уходят. Лес растёт 40 лет.
// Финал: весь мир внутри семечка. Факт: Джадав Пайенг, лес Молаи (~1,360 акров; Центральный парк — 843).
import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { poseAt, glowAt, NP, COLORS } from "./people.js";
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
  const R = Array.from({ length: NP }, (_, i) => SF.map((s) => poseAt(i, s)));
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const raw = SF.map((s) => cameraAt(s));
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const U = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    hx: (f) => R[0][f].chest[0], hy: (f) => R[0][f].chest[1], hz: (f) => R[0][f].chest[2],
    R: (f) => T.forestR(SF[f]), st: (f) => SF[f], fg: (f) => 0.55 + 0.25 * sstep(150, 600, SF[f]) + 0.7 * sstep(T.TURN + 4, T.TURN + 30, SF[f]) };
  const params = {}; for (const k in U) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(U).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const figs = [];
  const tyU = (w) => ({ fontAssetId: font.id, axes: { wght: w }, script: "Latn", language: "en" });
  let segs = 0;
  for (const i of [2, 1, 0]) { const nn = neonNodes((F) => R[i][F], projs, (F) => glowAt(i, SF[F]), { color: COLORS[i], glass: false }); figs.push(...nn.nodes); segs += nn.segs; }
  console.error("neon segments:", segs);
  // подпись над героем: год и площадь леса
  const kx = [], ky = [], ks = [], ko = [];
  for (const f of KEYF) { const h = R[0][f].head; const pr = projs[f]([h[0], h[1] + 0.5, h[2]]); kx.push({ at: f / FPS, value: +(pr.x - 250).toFixed(1), easing: "linear" }); ky.push({ at: f / FPS, value: +(pr.y - 110).toFixed(1), easing: "linear" }); ks.push({ at: f / FPS, value: +Math.max(0.001, Math.min(1.4, pr.k * 0.0036)).toFixed(4), easing: "linear" }); ko.push({ at: f / FPS, value: +(pr.z < 0.3 || (SF[f] > 612 && SF[f] < T.PULL[0]) ? 0 : 1 - sstep(T.PULL[0] - 12, T.PULL[0] + 6, SF[f])).toFixed(3), easing: "linear" }); }
  const lab = []; let f = 0;
  const L = (s) => [`YEAR ${T.yearAt(Math.max(0, s))}`, `${T.acresAt(Math.max(0, s)).toLocaleString("en-US")} ACRES`];
  while (f < N) { const a = L(SF[f]); let e = f + 1; while (e < N && L(SF[e]).join() === a.join()) e++;
    lab.push(<text at={f / FPS} duration={(e - f - 0.02) / FPS} x={0} y={0} width={500} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={34} letterSpacing={4} color="#BFBCC2">{a[0]}</text>);
    lab.push(<text at={f / FPS} duration={(e - f - 0.02) / FPS} x={0} y={44} width={500} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={52} letterSpacing={3} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 14, color: "#FF7A2E99" }}>{a[1]}</text>); f = e; }
  const label = <frame x={0} y={0} width={500} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kx }, { property: "offsetY", keyframes: ky }, { property: "scale", keyframes: ks }, { property: "opacity", keyframes: ko }]}>{lab}</frame>;
  // подписи сверху
  const txt = { x: 60, width: 960, align: "center", typography: tyU(400), fontFamily: "Tektur", fontSize: 36, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  const cap = (f0, f1, line, first) => { const d = (f1 - f0) / FPS; return <text {...txt} y={300} at={f0 / FPS} duration={d} animate={[{ property: "opacity", keyframes: [{ at: 0, value: first ? 1 : 0, easing: "ease-out" }, { at: Math.min(0.3, d / 2), value: 1, easing: "ease-in" }, { at: d - 0.3, value: 1, easing: "ease-in" }, { at: d, value: 0 }] }]}>{line}</text>; };
  const caps = T.CAPS.map(([f0, line], i) => cap(f0, i + 1 < T.CAPS.length ? T.CAPS[i + 1][0] : T.CAP_END, line, i === 0));
  caps.push(cap(T.AFTER_CAP[0], T.AFTER_CAP[1], T.AFTER_CAP[2], false));
  caps.push(<text {...txt} y={300} at={T.PUSH[0] / FPS} duration={(N - T.PUSH[0]) / FPS} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "ease-in" }, { at: (N - T.PUSH[0]) / FPS, value: 1 }] }]}>{T.CAPS[0][1]}</text>);
  const bigs = T.BIG.map(([f0, txt2], i) => { const f1 = i + 1 < T.BIG.length ? T.BIG[i + 1][0] : T.AFTER_CAP[0] - 4, d = (f1 - f0) / FPS, fin = i + 1 === T.BIG.length;
    return <text x={0} y={170} width={1080} align="center" at={f0 / FPS} duration={d} typography={tyU(700)} fontFamily="Tektur" fontSize={fin ? 140 : 112} letterSpacing={8} color={fin ? "#FFB37A" : "#F4F3F5"} shadow={{ x: 0, y: 0, blur: 30, color: fin ? "#FF7A2EAA" : "#FFFFFF55" }} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0.2, easing: "ease-out" }, { at: 0.12, value: 1, easing: "hold" }, { at: Math.max(0.2, d - 0.25), value: 1, easing: "ease-in" }, { at: d, value: fin ? 0 : 0.6 }] }, { property: "scale", keyframes: [{ at: 0, value: 1.25, easing: "ease-out" }, { at: 0.25, value: 1 }] }]}>{txt2}</text>; });
  // отъезд: весь мир внутри семечка
  const SC = 0.56, CY = -150;
  const scaleK = kfs([[0, 1, "hold"], [T.PULL[0], 1, "ease-in-out"], [T.PULL[1], SC, "hold"], [T.PUSH[0], SC, "ease-in"], [N, 1]]);
  const offK = kfs([[0, 0, "hold"], [T.PULL[0], 0, "ease-in-out"], [T.PULL[1], CY, "hold"], [T.PUSH[0], CY, "ease-in"], [N, 0]]);
  const outOp = kfs([[0, 0, "hold"], [T.PULL[0] + 4, 0, "ease-out"], [T.PULL[0] + 28, 1, "hold"], [T.PUSH[0] + 2, 1, "ease-in"], [N - 4, 0, "hold"], [N, 0]]);
  const SEED = []; for (let k = 0; k < 48; k++) { const t = (k / 48) * 2 * Math.PI; const w = 255 * Math.sin(t) * (0.62 + 0.38 * (1 - Math.cos(t)) / 2); SEED.push([540 + w, 815 - 345 * Math.cos(t)]); }
  const poly = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + " Z";
  const seedD = poly(SEED), holeD = "M-200 -200 L1280 -200 L1280 2120 L-200 2120 Z " + poly(SEED.slice().reverse());
  const sprout = "M540 470 Q536 420 548 385 M546 400 Q590 360 640 372 Q600 410 546 400 M544 420 Q500 392 462 404 Q494 436 544 420";
  const seed = (<frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "opacity", keyframes: outOp }]}>
    <path x={0} y={0} width={1080} height={1920} d={holeD} fill="#010002" />
    <path x={0} y={0} width={1080} height={1920} d={seedD} stroke={{ width: 24, color: "#C08A52", cap: "round" }} animate={[{ property: "opacity", from: 0.25, to: 0.25, at: 0, duration: DUR }]} effects={[{ kind: "blur", params: { px: 14 } }]} />
    <path x={0} y={0} width={1080} height={1920} d={seedD} stroke={{ width: 7, color: "#D9A36A", cap: "round" }} />
    <path x={0} y={0} width={1080} height={1920} d={sprout} stroke={{ width: 16, color: "#40FFA0", cap: "round" }} animate={[{ property: "opacity", from: 0.35, to: 0.35, at: 0, duration: DUR }]} effects={[{ kind: "blur", params: { px: 10 } }]} />
    <path x={0} y={0} width={1080} height={1920} d={sprout} stroke={{ width: 6, color: "#9CFFD0", cap: "round" }} />
  </frame>);
  // факт: Джадав Пайенг, лес Молаи (Ассам, Индия)
  const fd = (T.FACT[1] - T.FACT[0]) / FPS;
  const fop = (d0) => [...(d0 > 0 ? [{ at: 0, value: 0, easing: "hold" }] : []), { at: d0, value: 0, easing: "ease-out" }, { at: d0 + 0.4, value: 1, easing: "hold" }, { at: fd + 0.1, value: 1, easing: "ease-in" }, { at: fd + 0.45, value: 0 }];
  const fact = (<frame x={0} y={0} width={1080} height={1920} layout="none" at={T.FACT[0] / FPS} duration={fd + 0.5}>
    <text x={60} y={1200} width={960} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={40} letterSpacing={3} color="#F4F3F5" animate={[{ property: "opacity", keyframes: fop(0) }]}>JADAV PAYENG STARTED IN 1979.</text>
    <text x={60} y={1268} width={960} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={56} letterSpacing={3} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 20, color: "#FF7A2E99" }} animate={[{ property: "opacity", keyframes: fop(0.7) }]}>HIS FOREST: 1,360 ACRES.</text>
    <text x={60} y={1350} width={960} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={36} letterSpacing={4} color="#BFBCC2" animate={[{ property: "opacity", keyframes: fop(1.4) }]}>CENTRAL PARK: 843.</text>
    <text x={60} y={1430} width={960} align="center" typography={tyU(400)} fontFamily="Tektur" fontSize={24} letterSpacing={5} color="#7F7C82" animate={[{ property: "opacity", keyframes: fop(1.8) }]}>MOLAI FOREST · ASSAM, INDIA</text>
  </frame>);
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#010002" />
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" clip animate={[{ property: "scale", keyframes: scaleK }, { property: "offsetY", keyframes: offK }]}>
        <frame x={135} y={240} width={810} height={1440} layout="none" origin="center" animate={[{ property: "scale", keyframes: [{ at: 0, value: 4 / 3 }, { at: DUR, value: 4 / 3 }] }]}><rect x={0} y={0} width={810} height={1440} fill="#000000" effects={eff} animate={anim} /></frame>
        {figs}
        {label}
      </frame>
      {seed}
      {caps}
      {bigs}
      {fact}
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
};
