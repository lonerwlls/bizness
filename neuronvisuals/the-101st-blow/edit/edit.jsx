// «The 101st Blow» — четверо бьют по своим камням; трое сдаются (на 12, 40 и 99), наш герой раскалывает камень на 101-м ударе.
import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { poseAt, fadeAt, lightAt, labelAt } from "./people.js";
import { cameraAt, projector } from "./camera.js";
import { neonNodes } from "./neon.jsx";
import { clamp, sstep, io } from "./vec.js";
const { DUR, N, FPS } = T;
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const kfs = (list) => list.map(([f, v, e]) => (e ? { at: f / FPS, value: v, easing: e } : { at: f / FPS, value: v }));
const lastHit = (i, s) => { let a = 999; for (const [f] of T.HITS[i]) if (f <= s) a = s - f; return a; };
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null; try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
  const R = T.ST.map((_, i) => SF.map((s) => poseAt(i, s)));
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const raw = SF.map((s) => cameraAt(s));
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const crack0 = (s) => (s < 626 ? 0 : s < 656 ? 0.12 : s < 690 ? 0.4 : 1.0) * clamp((s - (s < 656 ? 626 : s < 690 ? 656 : 690)) / 4 + 0.25, 0.25, 1);
  const U = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    hg: (f) => 1, sp: (f) => io(clamp((SF[f] - T.SPLIT[0]) / (T.SPLIT[1] - T.SPLIT[0]), 0, 1)),
    c0: (f) => crack0(SF[f]), c1: (f) => (T.QUIT[1] !== null ? 0.6 * sstep(T.QUIT[1] + 30, T.QUIT[1] + 60, SF[f]) : 0) };
  for (let i = 0; i < 4; i++) { U["l" + i] = (f) => lightAt(i, SF[f]); U["f" + i] = (f) => { const a = lastHit(i, SF[f]); return (i === 0 && SF[f] >= 626 ? 1.6 : 1) * Math.exp(-a / 2.5); }; }
  const params = {}; for (const k in U) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(U).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const figs = [], labels = [];
  const ty = { fontAssetId: font.id, axes: { wght: 500 }, script: "Latn", language: "en" };
  const tyU = (w) => ({ fontAssetId: font.id, axes: { wght: w }, script: "Latn", language: "en" });
  let segs = 0;
  for (const i of [3, 2, 1, 0]) {          // от дальних к ближним
    const color = T.ST[i].color;
    const g = (F) => fadeAt(i, SF[F]);
    const nn = neonNodes((F) => R[i][F], projs, g, { color, glass: false }); figs.push(...nn.nodes); segs += nn.segs;
    const kx = [], ky = [], ks = [], ko = [];
    for (const f of KEYF) { const h = R[i][f].head; const pr = projs[f]([h[0], h[1] + 0.45, h[2]]); kx.push({ at: f / FPS, value: +(pr.x - 200).toFixed(1), easing: "linear" }); ky.push({ at: f / FPS, value: +(pr.y - 60).toFixed(1), easing: "linear" }); ks.push({ at: f / FPS, value: +Math.max(0.001, Math.min(1.6, pr.k * 0.0034)).toFixed(4), easing: "linear" }); ko.push({ at: f / FPS, value: +(pr.z < 0.3 ? 0 : clamp(fadeAt(i, SF[f]) * 1.5, 0, 1) * (1 - sstep(T.PULL[0] - 10, T.PULL[0] + 10, SF[f]))).toFixed(3), easing: "linear" }); }
    const vals = []; let f = 0;
    while (f < N) { const L = labelAt(i, SF[f]); let e = f + 1; while (e < N && labelAt(i, SF[e]).text === L.text) e++; 
      const col = L.red ? "#FF5A4E" : (i === 0 ? "#FFB37A" : "#E9E7EA");
      vals.push(<text at={f / FPS} duration={(e - f - 0.02) / FPS} x={0} y={0} width={400} align="center" typography={ty} fontFamily="Tektur" fontSize={L.red ? 46 : 64} letterSpacing={L.red ? 3 : 2} color={col} shadow={{ x: 0, y: 0, blur: 14, color: i === 0 ? "#FF7A2E99" : "#FFFFFF55" }}>{L.text}</text>); f = e; }
    labels.push(<frame x={0} y={0} width={400} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kx }, { property: "offsetY", keyframes: ky }, { property: "scale", keyframes: ks }, { property: "opacity", keyframes: ko }]}>{vals}</frame>);
  }
  console.error("neon segments:", segs);
  // подписи сверху
  const txt = { x: 60, width: 960, align: "center", typography: tyU(400), fontFamily: "Tektur", fontSize: 38, letterSpacing: 8, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  const capEnd = 618;
  const caps = T.CAPS.map(([f0, line], i) => { const f1 = i + 1 < T.CAPS.length ? T.CAPS[i + 1][0] : capEnd, d = (f1 - f0) / FPS, last = i + 1 === T.CAPS.length;
    return <text {...txt} y={300} at={f0 / FPS} duration={d} animate={[{ property: "opacity", keyframes: [{ at: 0, value: i === 0 ? 1 : 0, easing: "ease-out" }, { at: Math.min(0.3, d / 2), value: 1, easing: last ? "ease-in" : "hold" }, ...(last ? [{ at: d - 0.3, value: 1, easing: "ease-in" }, { at: d, value: 0 }] : [{ at: d, value: 1 }])] }]}>{line}</text>; });
  caps.push(<text {...txt} y={300} at={T.PUSH[0] / FPS} duration={(N - T.PUSH[0]) / FPS} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "ease-in" }, { at: (N - T.PUSH[0]) / FPS, value: 1 }] }]}>{T.CAPS[0][1]}</text>);
  // большие числа 99 / 100 / 101
  const bigs = T.BIG.map(([f0, num], i) => { const f1 = i + 1 < T.BIG.length ? T.BIG[i + 1][0] : T.PULL[0] - 4, d = (f1 - f0) / FPS;
    return <text x={0} y={250} width={1080} align="center" at={f0 / FPS} duration={d} typography={tyU(700)} fontFamily="Tektur" fontSize={num === "101" ? 300 : 240} letterSpacing={6} color={num === "101" ? "#FFB37A" : "#F4F3F5"} shadow={{ x: 0, y: 0, blur: 30, color: num === "101" ? "#FF7A2EAA" : "#FFFFFF55" }} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0.2, easing: "ease-out" }, { at: 0.12, value: 1, easing: "hold" }, { at: Math.max(0.2, d - 0.25), value: 1, easing: "ease-in" }, { at: d, value: i + 1 < T.BIG.length ? 0.6 : 0 }] }, { property: "scale", keyframes: [{ at: 0, value: 1.25, easing: "ease-out" }, { at: 0.25, value: 1 }] }]}>{num}</text>; });
  // отъезд: весь мир внутри камня
  const SC = 0.56, CY = -150;
  const scaleK = kfs([[0, 1, "hold"], [T.PULL[0], 1, "ease-in-out"], [T.PULL[1], SC, "hold"], [T.PUSH[0], SC, "ease-in"], [N, 1]]);
  const offK = kfs([[0, 0, "hold"], [T.PULL[0], 0, "ease-in-out"], [T.PULL[1], CY, "hold"], [T.PUSH[0], CY, "ease-in"], [N, 0]]);
  const rockOp = kfs([[0, 0, "hold"], [T.PULL[0] + 4, 0, "ease-out"], [T.PULL[0] + 28, 1, "hold"], [T.PUSH[0] + 2, 1, "ease-in"], [N - 4, 0, "hold"], [N, 0]]);
  const RK = [[540, 330], [700, 360], [800, 470], [830, 640], [810, 860], [835, 1060], [760, 1230], [600, 1300], [430, 1290], [300, 1210], [255, 1020], [270, 800], [250, 600], [320, 430], [430, 350]];
  const rockD = "M" + RK.map(([x, y]) => `${x} ${y}`).join(" L") + " Z";
  const holeD = "M-200 -200 L1280 -200 L1280 2120 L-200 2120 Z M" + RK.slice().reverse().map(([x, y]) => `${x} ${y}`).join(" L") + " Z";
  const rock = (<frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "opacity", keyframes: rockOp }]}>
    <path x={0} y={0} width={1080} height={1920} d={holeD} fill="#010002" />
    <path x={0} y={0} width={1080} height={1920} d={rockD} stroke={{ width: 7, color: "#4A4850", cap: "round" }} />
    <path x={0} y={0} width={1080} height={1920} d="M800 470 L770 520 L782 560 M255 1020 L300 990 L318 1010 M600 1300 L612 1250" stroke={{ width: 4, color: "#3A383F", cap: "round" }} />
  </frame>);
  // цитата (Jacob A. Riis, «The Making of an American», 1901)
  const fd = (T.FACT[1] - T.FACT[0]) / FPS;
  const fop = (d0) => [...(d0 > 0 ? [{ at: 0, value: 0, easing: "hold" }] : []), { at: d0, value: 0, easing: "ease-out" }, { at: d0 + 0.4, value: 1, easing: "hold" }, { at: fd + 0.1, value: 1, easing: "ease-in" }, { at: fd + 0.45, value: 0 }];
  const quote = (<frame x={0} y={0} width={1080} height={1920} layout="none" at={T.FACT[0] / FPS} duration={fd + 0.5}>
    <text x={60} y={1420} width={960} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={46} letterSpacing={3} color="#F4F3F5" animate={[{ property: "opacity", keyframes: fop(0) }]}>“IT WAS NOT THAT BLOW THAT DID IT,</text>
    <text x={60} y={1484} width={960} align="center" typography={tyU(600)} fontFamily="Tektur" fontSize={46} letterSpacing={3} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 16, color: "#FF7A2E88" }} animate={[{ property: "opacity", keyframes: fop(0.9) }]}>BUT ALL THAT HAD GONE BEFORE.”</text>
    <text x={60} y={1580} width={960} align="center" typography={tyU(400)} fontFamily="Tektur" fontSize={26} letterSpacing={5} color="#8F8C90" animate={[{ property: "opacity", keyframes: fop(1.7) }]}>JACOB RIIS, 1901</text>
  </frame>);
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#010002" />
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" clip animate={[{ property: "scale", keyframes: scaleK }, { property: "offsetY", keyframes: offK }]}>
        <frame x={135} y={240} width={810} height={1440} layout="none" origin="center" animate={[{ property: "scale", keyframes: [{ at: 0, value: 4 / 3 }, { at: DUR, value: 4 / 3 }] }]}><rect x={0} y={0} width={810} height={1440} fill="#000000" effects={eff} animate={anim} /></frame>
        {figs}
        {labels}
      </frame>
      {rock}
      {caps}
      {bigs}
      {quote}
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
};
