import { readFileSync } from "node:fs";
import { DUR, N, FPS, LINE1, LINE2, TURN, FADE0, LAMP_DIM, LAMP_DIE, KID_OUT, TEEN_IN, TEEN_FADE, WIFE_FADE } from "./timing.js";
import { glslDefines, PLAQUES, ladderAt } from "./world.js";
import { heroAt, kidAt, teenAt, wifeAt, paperAt } from "./people.js";
import { cameraTrack, projector } from "./camera.js";
import { figureNodes, quadNodes } from "./draw.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null; try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const hero = []; for (let f = 0; f < N; f++) hero.push(heroAt(f));
  const raw = cameraTrack(hero);
  // ключи камеры через кадр (лимит движка 500); кадры между ними — та же линейная интерполяция, что у шейдера
  const KEYF = []; for (let f = 0; f <= N; f += 2) KEYF.push(f); if (KEYF[KEYF.length - 1] !== N) KEYF.push(N);
  const cams = []; for (let i = 0; i + 1 < KEYF.length; i++) { const a = KEYF[i], b = KEYF[i + 1]; for (let f = a; f < b; f++) { const t = (f - a) / (b - a), A = raw[a], B = raw[b]; cams.push({ ro: A.ro.map((v, j) => v + (B.ro[j] - v) * t), ta: A.ta.map((v, j) => v + (B.ta[j] - v) * t), lens: A.lens + (B.lens - A.lens) * t }); } }
  cams.push(raw[N]);
  const projs = cams.map(projector);
  const FL = [[0, 1], [LAMP_DIM, 1], [LAMP_DIM + 4, 0.35], [LAMP_DIE[0], 0.35], [LAMP_DIE[0] + 2, 0.05], [LAMP_DIE[0] + 4, 0.4], [LAMP_DIE[0] + 6, 0.0], [LAMP_DIE[0] + 8, 0.3], [LAMP_DIE[0] + 11, 0.0], [LAMP_DIE[0] + 13, 0.15], [LAMP_DIE[1], 0], [N, 0]];
  const lampLevel = (f) => { for (let i = 1; i < FL.length; i++) if (f <= FL[i][0]) { const [a, va] = FL[i - 1], [b, vb] = FL[i]; return va + (vb - va) * (f - a) / Math.max(1, b - a); } return 0; };
  const camKF = (fn) => KEYF.map((f) => ({ at: f / FPS, value: +fn(cams[f], f).toFixed(5) }));
  const params = { rox: 0, roy: 0, roz: 0, tax: 0, tay: 0, taz: 0, lens: 1, lamp: 1 };
  const eff = [{ kind: "shader", params: { glsl: read("./lib.glsl").replace("vec2 map(vec3 p);", glslDefines() + "vec2 map(vec3 p);") + read("./scene.glsl"), ...params } }];
  const anim = [["rox", (c) => c.ro[0]], ["roy", (c) => c.ro[1]], ["roz", (c) => c.ro[2]], ["tax", (c) => c.ta[0]], ["tay", (c) => c.ta[1]], ["taz", (c) => c.ta[2]], ["lens", (c) => c.lens], ["lamp", (c, f) => lampLevel(f)]]
    .map(([name, fn]) => ({ property: "effectParam", effectIndex: 0, effectParam: name, keyframes: camKF(fn).map((k) => ({ ...k, easing: "linear" })) }));
  const H = figureNodes((f) => hero[f], projs);
  const K = figureNodes(kidAt, projs, { tol: 0.6, range: [0, KID_OUT[1]], fadeOut: KID_OUT });
  const Tn = figureNodes(teenAt, projs, { tol: 0.6, range: [TEEN_IN[0], TEEN_FADE[1]], fadeIn: TEEN_IN, fadeOut: TEEN_FADE });
  const W = figureNodes(wifeAt, projs, { tol: 0.6, range: [0, WIFE_FADE[1]], fadeOut: WIFE_FADE });
  const PAPER = quadNodes(paperAt, projs);
  // таблички с суммами на стене
  const plaques = PLAQUES.map(([label, s]) => {
    const pos = ladderAt(s); const X3 = [-0.78, pos[1], 0.03];
    const kfX = [], kfY = [], kfS = [];
    for (const f of KEYF) { const pr = projs[f](X3); const sc = Math.max(0.001, (pr.k * 0.3) / 100); kfX.push({ at: f / FPS, value: +(pr.x - 250).toFixed(1), easing: "linear" }); kfY.push({ at: f / FPS, value: +(pr.y - 60).toFixed(1), easing: "linear" }); kfS.push({ at: f / FPS, value: +sc.toFixed(5), easing: "linear" }); }
    const passF = hero.findIndex((h) => h.chest[1] > pos[1]);
    const colKF = passF > 0 ? [{ at: 0, value: "#6E6B6F", easing: "hold" }, { at: passF / FPS, value: "#FFFFFF", easing: "ease-out" }, { at: Math.min(N, passF + 12) / FPS, value: "#C9C6CA", easing: "hold" }, { at: N / FPS, value: "#C9C6CA" }] : [{ at: 0, value: "#6E6B6F" }, { at: N / FPS, value: "#6E6B6F" }];
    return (<frame x={0} y={0} width={500} height={120} layout="none" origin="center" animate={[{ property: "offsetX", keyframes: kfX }, { property: "offsetY", keyframes: kfY }, { property: "scale", keyframes: kfS }, { property: "opacity", keyframes: [{ at: 0, value: 1, easing: "hold" }, { at: 754 / FPS, value: 1, easing: "linear" }, { at: 758 / FPS, value: 0, easing: "hold" }, { at: 808 / FPS, value: 0, easing: "linear" }, { at: 814 / FPS, value: 1, easing: "hold" }, { at: DUR, value: 1 }] }]}>
      <text x={0} y={0} width={500} align="center" typography={{ fontAssetId: font.id, axes: { wght: 500 }, script: "Latn", language: "en" }} fontFamily="Tektur" fontSize={100} animate={[{ property: "color", keyframes: colKF }]}>{label}</text>
    </frame>);
  });
  const ty = { fontAssetId: font.id, axes: { wght: 400 }, script: "Latn", language: "en" };
  const txt = { x: 90, width: 900, align: "center", typography: ty, fontFamily: "Tektur", fontSize: 30, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" effects={eff} animate={anim} />
      {plaques}
      {PAPER}
      {W.nodes}
      {K.nodes}
      {Tn.nodes}
      {H.nodes}
      <rect x={0} y={220} width={1080} height={280} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#010002", opacity: 0 }, { offset: 0.3, color: "#010002", opacity: 0.85 }, { offset: 0.72, color: "#010002", opacity: 0.85 }, { offset: 1, color: "#010002", opacity: 0 }] }} />
      <text {...txt} y={325} animate={[{ property: "opacity", keyframes: [{ at: 0, value: 1, easing: "hold" }, { at: (TURN + 1) / FPS, value: 1, easing: "ease-out" }, { at: (TURN + 10) / FPS, value: 0.65, easing: "hold" }, { at: DUR, value: 0.65 }] }]}>{LINE1}</text>
      <text {...txt} y={369} at={(TURN + 1) / FPS} duration={(N - TURN - 1) / FPS} motion={{ by: "character", from: { opacity: 0 }, at: 0, duration: 17 / FPS, overlap: 0, easing: "linear" }}>{LINE2}</text>
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: FADE0 / FPS, value: 0, easing: "ease-in" }, { at: (N - 1) / FPS, value: 1, easing: "hold" }, { at: DUR, value: 1 }] }]} />
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
  console.error("nodes hero/kid/teen/wife/paper:", H.count, K.count, Tn.count, W.count, PAPER.length);
};
