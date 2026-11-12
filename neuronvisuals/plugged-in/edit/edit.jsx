import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { glslDefines } from "./world.js";
import { heroAt, glowAt, plugged } from "./people.js";
import { sstep } from "./vec.js";
import { cameraTrack, projector } from "./camera.js";
import { neonNodes } from "./neon.jsx";
import { cableNodes } from "./cables.jsx";
const { DUR, N, FPS } = T;
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const usd = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kfs = (list) => list.map(([f, v, e]) => (e ? { at: f / FPS, value: v, easing: e } : { at: f / FPS, value: v }));
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null; try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const hero = []; for (let f = 0; f <= N; f++) hero.push(heroAt(Math.min(f, N)));
  const raw = cameraTrack();
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const P = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    hx: (f) => hero[f].chest[0], hy: (f) => hero[f].chest[1], hz: (f) => hero[f].chest[2], glow: (f) => glowAt(f), plugged: (f) => plugged(f),
    rev: (f) => sstep(T.REVEAL, T.REVEAL + 40, f) * (1 - sstep(T.UNLOCK, T.UNLOCK + 30, f)),
    scr: (f) => (f < T.LOCK ? 1 : f < T.LOCK + 2 ? 1 - (f - T.LOCK) / 2 : f < T.UNLOCK ? 0 : sstep(T.UNLOCK, T.UNLOCK + 8, f)) };
  const params = {}; for (const k in P) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl").replace("vec2 map(vec3 p);", glslDefines() + "vec2 map(vec3 p);") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(P).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const H = neonNodes((f) => hero[f], projs, glowAt);
  const ty = { fontAssetId: font.id, axes: { wght: 400 }, script: "Latn", language: "en" };
  const C = cableNodes(hero, projs, { fontAssetId: font.id, axes: { wght: 500 }, script: "Latn", language: "en" });
  const txt = { x: 90, width: 900, align: "center", typography: ty, fontFamily: "Tektur", fontSize: 30, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  // счётчик: сумма в месяц и в год растёт на каждом щелчке
  const steps = [[0, 0]]; let sum = 0; for (const s of T.SUBS) { sum += s[1]; steps.push([s[0], +sum.toFixed(2)]); } steps.push([T.UNLOCK, 0]);
  const counter = steps.map(([f0, v], i) => { const f1 = i + 1 < steps.length ? steps[i + 1][0] : N;
    return (<frame x={0} y={0} width={1080} height={1920} layout="none" at={f0 / FPS} duration={(f1 - f0) / FPS}>
      <frame x={240} y={440} width={600} height={60} layout="none" origin="center" animate={[{ property: "scale", keyframes: i === 0 ? [{ at: 0, value: 1 }, { at: (f1 - f0) / FPS, value: 1 }] : [{ at: 0, value: 1.25, easing: "ease-out" }, { at: 6 / FPS, value: 1, easing: "hold" }, { at: (f1 - f0) / FPS, value: 1 }] }]}>
        <text x={0} y={0} width={600} align="center" typography={ty} fontFamily="Tektur" fontSize={40} letterSpacing={4} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 14, color: "#FF7A2E88" }}>{"MONTHLY " + usd(v)}</text>
      </frame>
      <text x={240} y={500} width={600} align="center" typography={ty} fontFamily="Tektur" fontSize={32} letterSpacing={4} animate={[{ property: "color", keyframes: f0 === T.TURN ? [{ at: 0, value: "#FF3B30", easing: "linear" }, { at: 4 / FPS, value: "#D9D6DA", easing: "linear" }, { at: 8 / FPS, value: "#FF3B30", easing: "linear" }, { at: 12 / FPS, value: "#D9D6DA", easing: "linear" }, { at: 16 / FPS, value: "#FF3B30", easing: "hold" }, { at: (f1 - f0) / FPS, value: "#FF3B30" }] : [{ at: 0, value: "#D9D6DA" }, { at: (f1 - f0) / FPS, value: "#D9D6DA" }] }]}>{"YEARLY " + usd(v * 12)}</text>
    </frame>); });
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" effects={eff} animate={anim} />
      {C.nodes}
      {H.nodes}
      {C.labels}
      <rect x={0} y={220} width={1080} height={380} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#010002", opacity: 0 }, { offset: 0.25, color: "#010002", opacity: 0.85 }, { offset: 0.8, color: "#010002", opacity: 0.85 }, { offset: 1, color: "#010002", opacity: 0 }] }} />
      <text {...txt} y={325} animate={[{ property: "opacity", keyframes: kfs([[0, 1, "hold"], [T.TURN + 1, 1, "ease-out"], [T.TURN + 10, 0.65, "hold"], [T.UNLOCK, 0.65, "ease-in-out"], [T.UNLOCK + 20, 1, "hold"], [N, 1]]) }]}>{T.LINE1}</text>
      <text {...txt} y={369} at={(T.TURN + 1) / FPS} duration={(T.UNLOCK + 18 - T.TURN - 1) / FPS} motion={{ by: "character", from: { opacity: 0 }, at: 0, duration: 15 / FPS, overlap: 0, easing: "linear" }} animate={[{ property: "opacity", keyframes: kfs([[0, 1, "hold"], [T.UNLOCK - T.TURN - 1, 1, "ease-in"], [T.UNLOCK + 16 - T.TURN - 1, 0, "hold"], [T.UNLOCK + 17 - T.TURN - 1, 0]]) }]}>{T.LINE2}</text>
      <text x={60} y={1380} width={960} align="center" typography={ty} fontFamily="Tektur" fontSize={66} letterSpacing={4} color="#F4F3F5" at={(T.LOCK - 24) / FPS} duration={(T.UNLOCK + 6 - T.LOCK + 24) / FPS} animate={[{ property: "opacity", keyframes: kfs([[0, 0, "ease-out"], [6, 1, "hold"], [T.UNLOCK - 8 - T.LOCK + 24, 1, "ease-in"], [T.UNLOCK + 6 - T.LOCK + 24, 0]]) }]}>{T.FACT_A}</text>
      <frame x={60} y={1480} width={960} height={110} layout="none" origin="center" at={(T.LOCK - 6) / FPS} duration={(T.UNLOCK + 6 - T.LOCK + 6) / FPS} animate={[{ property: "scale", keyframes: kfs([[0, 1.3, "ease-out"], [6, 1, "hold"], [T.UNLOCK + 6 - T.LOCK + 6, 1]]) }, { property: "opacity", keyframes: kfs([[0, 0, "ease-out"], [4, 1, "hold"], [T.UNLOCK - 8 - T.LOCK + 6, 1, "ease-in"], [T.UNLOCK + 6 - T.LOCK + 6, 0]]) }]}>
        <text x={0} y={0} width={960} align="center" typography={ty} fontFamily="Tektur" fontSize={78} letterSpacing={4} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 22, color: "#FF7A2E" }}>{T.FACT_B}</text>
      </frame>
      <text x={110} y={1640} width={860} align="center" typography={ty} fontFamily="Tektur" fontSize={22} letterSpacing={3} color="#8F8C90" at={(T.LOCK) / FPS} duration={(T.UNLOCK + 6 - T.LOCK) / FPS} animate={[{ property: "opacity", keyframes: kfs([[0, 0, "ease-out"], [8, 1, "hold"], [T.UNLOCK - 8 - T.LOCK, 1, "ease-in"], [T.UNLOCK + 6 - T.LOCK, 0]]) }]}>{"SOURCE: " + T.FACT_SRC}</text>
      {counter}
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
  console.error("neon segs", H.segs, "nodes", H.nodes.length, "cable nodes", C.nodes.length);
};
