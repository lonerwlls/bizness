import { readFileSync } from "node:fs";
import * as T from "./timing.js";
import { glslDefines, BELT_Y, CARD } from "./world.js";
import { heroAt, itemPos, beltOffset, termX, glowAt, heroX } from "./people.js";
import { cameraTrack, projector } from "./camera.js";
import { neonNodes } from "./neon.jsx";
const { DUR, N, FPS } = T;
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const money = (v) => "$" + v.toLocaleString("en-US");
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
  const it = (name) => (f) => itemPos(name, f, hero[f].J.pel);
  const tv = it("tv"), sofa = it("sofa"), car = it("car"), house = it("house");
  const P = { rox: (f) => cams[f].ro[0], roy: (f) => cams[f].ro[1], roz: (f) => cams[f].ro[2], tax: (f) => cams[f].ta[0], tay: (f) => cams[f].ta[1], taz: (f) => cams[f].ta[2], lens: (f) => cams[f].lens,
    off: (f) => beltOffset(f), hx: (f) => hero[f].chest[0], hy: (f) => hero[f].chest[1], hz: (f) => hero[f].chest[2], glow: (f) => glowAt(f),
    tvx: (f) => tv(f)[0], tvy: (f) => tv(f)[1], tvz: (f) => tv(f)[2], sfx: (f) => sofa(f)[0], sfy: (f) => sofa(f)[1], sfz: (f) => sofa(f)[2],
    cax: (f) => car(f)[0], cay: (f) => car(f)[1], caz: (f) => car(f)[2], hox: (f) => house(f)[0], hoy: (f) => house(f)[1], hoz: (f) => house(f)[2],
    trx: (f) => termX(f), appr: (f) => (f >= T.APPROVED && f < T.APPROVED + 30 ? 1 : 0) };
  // ключи: камера — через кадр; мигание неона и «APPROVED» — без пропусков в нужных местах
  const params = {}; for (const k in P) params[k] = 0;
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl").replace("vec2 map(vec3 p);", glslDefines() + "vec2 map(vec3 p);") + read("./scene.glsl"), ...params } }];
  const anim = Object.entries(P).map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: KEYF.map((f) => ({ at: f / FPS, value: +fn(f).toFixed(5), easing: "linear" })) }));
  const H = neonNodes((f) => hero[f], projs, glowAt);
  const ty = { fontAssetId: font.id, axes: { wght: 400 }, script: "Latn", language: "en" };
  const txt = { x: 90, width: 900, align: "center", typography: ty, fontFamily: "Tektur", fontSize: 30, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  const inc = T.RAISES.map(([f0, v], i) => { const f1 = i + 1 < T.RAISES.length ? T.RAISES[i + 1][0] : N;
    return (<frame x={0} y={0} width={1080} height={1920} layout="none" at={f0 / FPS} duration={(f1 - f0) / FPS}>
      <frame x={290} y={440} width={500} height={60} layout="none" origin="center" animate={[{ property: "scale", keyframes: i === 0 ? [{ at: 0, value: 1 }, { at: (f1 - f0) / FPS, value: 1 }] : [{ at: 0, value: 1.25, easing: "ease-out" }, { at: 6 / FPS, value: 1, easing: "hold" }, { at: (f1 - f0) / FPS, value: 1 }] }]}>
        <text x={0} y={0} width={500} align="center" typography={ty} fontFamily="Tektur" fontSize={40} letterSpacing={4} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 14, color: "#FF7A2E88" }}>{"INCOME " + money(v)}</text>
      </frame></frame>); });
  // «SAVED $0»: на повороте вспыхивает красным, к петле снова белый
  const savedCol = [[0, "#D9D6DA", "hold"], [T.TURN, "#FF3B30", "linear"], [T.TURN + 4, "#D9D6DA", "linear"], [T.TURN + 8, "#FF3B30", "linear"], [T.TURN + 12, "#D9D6DA", "linear"], [T.TURN + 16, "#FF3B30", "hold"], [T.RESET, "#FF3B30", "linear"], [T.RESET + 14, "#D9D6DA", "hold"], [N, "#D9D6DA"]];
  const savedScale = [[0, 1, "hold"], [T.TURN, 1.3, "ease-out"], [T.TURN + 8, 1, "hold"], [N, 1]];
  // «APPROVED» над экраном терминала
  const apx = [], apy = [], aps = [];
  for (const f of KEYF) { const pr = projs[f]([termX(f), BELT_Y + 2.7, CARD.cz]); apx.push({ at: f / FPS, value: +(pr.x - 300).toFixed(1), easing: "linear" }); apy.push({ at: f / FPS, value: +(pr.y - 60).toFixed(1), easing: "linear" }); aps.push({ at: f / FPS, value: +Math.max(0.001, pr.k * 0.9 / 100).toFixed(5), easing: "linear" }); }
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" effects={eff} animate={anim} />
      {H.nodes}
      <frame x={0} y={0} width={600} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: apx }, { property: "offsetY", keyframes: apy }, { property: "scale", keyframes: aps }, { property: "opacity", keyframes: kfs([[0, 0, "hold"], [T.APPROVED, 1, "hold"], [T.APPROVED + 34, 1, "linear"], [T.APPROVED + 38, 0, "hold"], [N, 0]]) }]}>
        <text x={0} y={0} width={600} align="center" typography={ty} fontFamily="Tektur" fontSize={100} letterSpacing={10} color="#FFB37A" shadow={{ x: 0, y: 0, blur: 24, color: "#FF7A2E" }}>APPROVED</text>
      </frame>
      <rect x={0} y={220} width={1080} height={380} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#010002", opacity: 0 }, { offset: 0.25, color: "#010002", opacity: 0.85 }, { offset: 0.8, color: "#010002", opacity: 0.85 }, { offset: 1, color: "#010002", opacity: 0 }] }} />
      <text {...txt} y={325} animate={[{ property: "opacity", keyframes: kfs([[0, 1, "hold"], [T.TURN + 1, 1, "ease-out"], [T.TURN + 10, 0.65, "hold"], [T.RESET + 4, 0.65, "ease-in-out"], [T.RESET + 24, 1, "hold"], [N, 1]]) }]}>{T.LINE1}</text>
      <text {...txt} y={369} at={(T.TURN + 1) / FPS} duration={(T.RESET + 22 - T.TURN - 1) / FPS} motion={{ by: "character", from: { opacity: 0 }, at: 0, duration: 15 / FPS, overlap: 0, easing: "linear" }} animate={[{ property: "opacity", keyframes: kfs([[0, 1, "hold"], [T.RESET - T.TURN - 1, 1, "ease-in"], [T.RESET + 20 - T.TURN - 1, 0, "hold"], [T.RESET + 21 - T.TURN - 1, 0]]) }]}>{T.LINE2}</text>
      {inc}
      <frame x={290} y={500} width={500} height={60} layout="none" origin="center" animate={[{ property: "scale", keyframes: kfs(savedScale) }]}>
        <text x={0} y={0} width={500} align="center" typography={ty} fontFamily="Tektur" fontSize={40} letterSpacing={4} animate={[{ property: "color", keyframes: kfs(savedCol) }]}>SAVED $0</text>
      </frame>
      <text x={110} y={1560} width={860} align="center" typography={ty} fontFamily="Tektur" fontSize={36} lineHeight={1.35} color="#F4F3F5" at={(T.APPROVED + 4) / FPS} duration={(T.RESET + 10 - T.APPROVED - 4) / FPS} motion={{ by: "word", from: { opacity: 0 }, at: 0, duration: 0.8, overlap: 0.3, easing: "ease-out" }} animate={[{ property: "opacity", keyframes: kfs([[0, 1, "hold"], [T.RESET - 10 - T.APPROVED - 4, 1, "ease-in"], [T.RESET + 10 - T.APPROVED - 4, 0]]) }]}>{T.FACT}</text>
      <text x={110} y={1690} width={860} align="center" typography={ty} fontFamily="Tektur" fontSize={22} letterSpacing={3} color="#8F8C90" at={(T.APPROVED + 20) / FPS} duration={(T.RESET + 10 - T.APPROVED - 20) / FPS} animate={[{ property: "opacity", keyframes: kfs([[0, 0, "ease-out"], [8, 1, "hold"], [T.RESET - 10 - T.APPROVED - 20, 1, "ease-in"], [T.RESET + 10 - T.APPROVED - 20, 0]]) }]}>{"SOURCE: " + T.FACT_SRC}</text>
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
  console.error("neon segs", H.segs, "nodes", H.nodes.length);
};
