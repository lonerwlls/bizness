// «The Ride» — пять понятий бегут по графику рынка; остаётся только PATIENCE. Финал: мир внутри телефона, факт, перемотка, петля.
import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { glslChart } from "./chart.js";
import { runnerAt, labelAt, fadeAt, labelAlpha } from "./people.js";
import { cameraAt, projector } from "./camera.js";
import { neonNodes } from "./neon.jsx";
const { DUR, N, FPS } = T;
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const kfs = (list) => list.map(([f, v, e]) => (e ? { at: f / FPS, value: v, easing: e } : { at: f / FPS, value: v }));
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null; try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
  const R = T.RUNNERS.map((_, i) => SF.map((s) => runnerAt(i, s)));
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const raw = SF.map((s) => cameraAt(s));
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const HI = T.RUNNERS.findIndex((r) => r[0] === "PATIENCE");
  const P = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    hx: (f) => R[HI][f].chest[0], hy: (f) => R[HI][f].chest[1], hz: (f) => R[HI][f].chest[2] };
  const params = {}; for (const k in P) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl").replace("vec2 map(vec3 p);", glslChart() + "vec2 map(vec3 p);") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(P).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const figs = [], labels = [];
  const order = T.RUNNERS.map((r, i) => i).sort((a, b) => T.RUNNERS[a][1] - T.RUNNERS[b][1]);   // от дальних к ближним
  const ty = { fontAssetId: font.id, axes: { wght: 500 }, script: "Latn", language: "en" };
  const tyB = { ...ty, axes: { wght: 700 } };
  let segs = 0;
  for (const i of order) {
    const [name, , , color] = T.RUNNERS[i];
    const g = (F) => fadeAt(i, SF[F]);
    const nn = neonNodes((F) => R[i][F], projs, g, { color, glass: false }); figs.push(...nn.nodes); segs += nn.segs;
    // подпись над головой: имя и деньги
    const kx = [], ky = [], ks = [], ko = [];
    for (const f of KEYF) { const pr = projs[f]([R[i][f].head[0], R[i][f].head[1] + 0.42, R[i][f].head[2]]); kx.push({ at: f / FPS, value: +(pr.x - 200).toFixed(1), easing: "linear" }); ky.push({ at: f / FPS, value: +(pr.y - 60).toFixed(1), easing: "linear" }); ks.push({ at: f / FPS, value: +Math.max(0.001, Math.min(1.6, pr.k * 0.0034)).toFixed(4), easing: "linear" }); ko.push({ at: f / FPS, value: +labelAlpha(i, SF[f]).toFixed(3), easing: "linear" }); }
    const vals = []; let f = 0;
    while (f < N) { const L = labelAt(i, SF[f]); let e = f + 3; while (e < N && labelAt(i, SF[e]).text === L.text && SF[e] - SF[f] === e - f && e - f < 60) e += 3; e = Math.min(e, N);
      const col = L.red ? "#FF5A4E" : (color === "#FFFFFF" ? "#BFBCC2" : "#FFB37A");
      vals.push(<text at={f / FPS} duration={(e - f - 0.02) / FPS} x={0} y={58} width={400} align="center" typography={ty} fontFamily="Tektur" fontSize={34} letterSpacing={2} color={col}>{L.text}</text>); f = e; }
    labels.push(<frame x={0} y={0} width={400} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kx }, { property: "offsetY", keyframes: ky }, { property: "scale", keyframes: ks }, { property: "opacity", keyframes: ko }]}>
      <text x={0} y={0} width={400} align="center" typography={ty} fontFamily="Tektur" fontSize={46} letterSpacing={4} color={color === "#FFFFFF" ? "#F4F3F5" : "#FFB37A"} shadow={{ x: 0, y: 0, blur: 12, color: color === "#FFFFFF" ? "#FFFFFF66" : "#FF7A2E99" }}>{name}</text>
      {vals}
    </frame>);
  }
  console.error("neon segments:", segs);
  // подписи этапов (экранные): исчезают при отъезде, первая возвращается к петле
  const txt = { x: 90, width: 900, align: "center", typography: { fontAssetId: font.id, axes: { wght: 400 }, script: "Latn", language: "en" }, fontFamily: "Tektur", fontSize: 34, letterSpacing: 8, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  const stage = (f0, f1, line, year, op) => { const d = (f1 - f0) / FPS; return (<frame x={0} y={0} width={1080} height={1920} layout="none" at={f0 / FPS} duration={d} animate={[{ property: "opacity", keyframes: op(d) }]}>
      <text {...txt} y={300}>{line}</text>
      <text {...txt} y={352} fontSize={22} letterSpacing={6} color="#8F8C90">{year}</text>
    </frame>); };
  const stages = T.STAGES.map(([f0, line, year], i) => { const last = i + 1 === T.STAGES.length, f1 = last ? T.PULL[0] + 14 : T.STAGES[i + 1][0];
    return stage(f0, f1, line, year, (d) => [{ at: 0, value: i === 0 ? 1 : 0, easing: "ease-out" }, { at: Math.min(0.3, d / 2), value: 1, easing: last ? "ease-in" : "hold" }, { at: last ? d - 0.45 : d, value: 1, easing: "ease-in" }, ...(last ? [{ at: d, value: 0 }] : [])]); });
  stages.push(stage(T.PUSH[0], N, T.STAGES[0][1], T.STAGES[0][2], (d) => [{ at: 0, value: 0, easing: "ease-in" }, { at: d, value: 1 }]));
  // телефон: экран = весь мир; масштаб и сдвиг
  const SC = 0.56, CY = -150;
  const scaleK = kfs([[0, 1, "hold"], [T.PULL[0], 1, "ease-in-out"], [T.PULL[1], SC, "hold"], [T.PUSH[0], SC, "ease-in"], [N, 1]]);
  const offK = kfs([[0, 0, "hold"], [T.PULL[0], 0, "ease-in-out"], [T.PULL[1], CY, "hold"], [T.PUSH[0], CY, "ease-in"], [N, 0]]);
  const bodyOp = kfs([[0, 0, "hold"], [T.PULL[0] + 8, 0, "ease-out"], [T.PULL[0] + 30, 1, "hold"], [T.PUSH[0] + 4, 1, "ease-in"], [N - 3, 0, "hold"], [N, 0]]);
  const phoneBody = (<frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={[{ property: "scale", keyframes: scaleK }, { property: "offsetY", keyframes: offK }, { property: "opacity", keyframes: bodyOp }]}>
    <rect x={-60} y={-70} width={1200} height={2060} radius={150} fill="#0C0C10" strokeColor="#4A4A52" strokeWidth={10} />
    <rect x={430} y={-40} width={220} height={22} radius={11} fill="#1C1C22" />
  </frame>);
  // скруглённые углы экрана (видны только в телефоне)
  const RC = 90, cp = (x, y, sx, sy) => `M${x} ${y} L${x + sx * RC} ${y} C${x + sx * RC * 0.4477} ${y} ${x} ${y + sy * RC * 0.4477} ${x} ${y + sy * RC} Z`;
  const corners = (<frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "opacity", keyframes: bodyOp }]}>
    {[[0, 0, 1, 1], [1080, 0, -1, 1], [0, 1920, 1, -1], [1080, 1920, -1, -1]].map(([x, y, sx, sy]) => <path x={0} y={0} width={1080} height={1920} d={cp(x, y, sx, sy)} fill="#0C0C10" />)}
  </frame>);
  // интерфейс брокерского приложения на экране
  const ui = kfs([[0, 0, "hold"], [T.PULL[0] + 12, 0, "ease-out"], [T.PULL[0] + 36, 1, "hold"], [T.REW[0], 1, "ease-in"], [T.REW[0] + 10, 0, "hold"], [N, 0]]);
  const tyU = (w) => ({ fontAssetId: font.id, axes: { wght: w }, script: "Latn", language: "en" });
  const appUI = (<frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "opacity", keyframes: ui }]}>
    <rect x={0} y={0} width={1080} height={330} fill="#000000" opacity={0.82} />
    <text x={0} y={90} width={1080} align="center" typography={tyU(500)} fontFamily="Tektur" fontSize={40} letterSpacing={10} color="#8F8C90">MY PORTFOLIO</text>
    <text x={0} y={150} width={1080} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={130} letterSpacing={4} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 24, color: "#FF7A2E88" }}>$71,750</text>
    <rect x={0} y={1650} width={1080} height={270} fill="#000000" opacity={0.82} />
    <rect x={90} y={1700} width={420} height={140} radius={70} fill="#00000000" strokeColor="#FF5A4E" strokeWidth={6} />
    <text x={90} y={1738} width={420} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={60} letterSpacing={10} color="#FF5A4E">SELL</text>
    <rect x={570} y={1700} width={420} height={140} radius={70} fill="#00000000" strokeColor="#F4F3F5" strokeWidth={6} />
    <text x={570} y={1738} width={420} align="center" typography={tyU(700)} fontFamily="Tektur" fontSize={60} letterSpacing={10} color="#F4F3F5">HOLD</text>
  </frame>);
  // факт (J.P. Morgan Asset Management, данные S&P 500 2005–2024, по CNBC)
  const fd = (T.FACT[1] - T.FACT[0]) / FPS;
  const fop = (d0) => [...(d0 > 0 ? [{ at: 0, value: 0, easing: "hold" }] : []), { at: d0, value: 0, easing: "ease-out" }, { at: d0 + 0.35, value: 1, easing: "hold" }, { at: fd + 0.1, value: 1, easing: "ease-in" }, { at: fd + 0.45, value: 0 }];
  const fact = (<frame x={0} y={0} width={1080} height={1920} layout="none" at={T.FACT[0] / FPS} duration={fd + 0.5}>
    <text x={60} y={1500} width={960} align="center" typography={tyU(400)} fontFamily="Tektur" fontSize={30} letterSpacing={5} color="#8F8C90" animate={[{ property: "opacity", keyframes: fop(0) }]}>$10,000 IN THE S&P 500, 2005–2024</text>
    <text x={60} y={1560} width={960} align="center" typography={tyU(600)} fontFamily="Tektur" fontSize={50} letterSpacing={4} color="#FFB37A" animate={[{ property: "opacity", keyframes: fop(0.25) }]}>STAYED IN: $71,750</text>
    <text x={60} y={1640} width={960} align="center" typography={tyU(600)} fontFamily="Tektur" fontSize={50} letterSpacing={4} color="#FF5A4E" animate={[{ property: "opacity", keyframes: fop(1.0) }]}>MISSED 10 BEST DAYS: $32,871</text>
    <text x={60} y={1735} width={960} align="center" typography={tyU(400)} fontFamily="Tektur" fontSize={22} letterSpacing={4} color="#5F5C62" animate={[{ property: "opacity", keyframes: fop(1.0) }]}>SOURCE: J.P. MORGAN ASSET MANAGEMENT</text>
  </frame>);
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#010002" />
      {phoneBody}
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" clip animate={[{ property: "scale", keyframes: scaleK }, { property: "offsetY", keyframes: offK }]}>
        <rect x={0} y={0} width={1080} height={1920} fill="#000000" effects={eff} animate={anim} />
        {figs}
        {labels}
        {appUI}
        {corners}
      </frame>
      {stages}
      {fact}
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
};
