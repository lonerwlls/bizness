import { DUR, N, FPS, TURN, FADE0, LINE1, LINE2 } from "./timing.js";
import { kf } from "./lib.js";
import { heroNodes } from "./hero.jsx";
import { floorNodes, stageNodes, poolNodes, coneNodes, stageMask } from "./stage.jsx";
import { seatNodes } from "./seats.jsx";
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#010002" });
  const font = await p.add("Tektur.ttf");
  let audio = null;
  try { audio = await p.add("../out/audio.wav"); } catch (e) { audio = null; }
  const ty = { fontAssetId: font.id, axes: { wght: 400 }, script: "Cyrl", language: "ru" };
  const hero = heroNodes(stageMask());
  const CAM = kf([[0, 1.0, "ease-in-out"], [240, 1.04, "linear"], [248, 1.04, [0.3, 0, 0.15, 1]], [318, 0.97, "linear"], [376, 0.975, "ease-in-out"], [440, 1.03, "linear"], [N, 1.032]]);
  const txt = { x: 90, width: 900, align: "center", typography: ty, fontFamily: "Tektur", fontSize: 30, letterSpacing: 6, color: "#F4F3F5", shadow: { x: 0, y: 0, blur: 10, color: "#FFFFFF30" } };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={[{ property: "scale", keyframes: CAM }]}>
        {floorNodes()}
        {stageNodes()}
        {coneNodes()}
        {poolNodes()}
        {hero.nodes}
        {seatNodes({ fontAssetId: font.id, axes: { wght: 600 }, script: "Latn", language: "en" })}
        <rect x={-140} y={-140} width={1360} height={2200} fill="#FFF3E2" animate={[{ property: "opacity", keyframes: kf([[0, 0, "hold"], [TURN, 0.24, "ease-out"], [TURN + 7, 0, "hold"], [N, 0]]) }]} />
      </frame>
      <text {...txt} y={325} animate={[{ property: "opacity", keyframes: kf([[0, 1, "hold"], [TURN + 1, 1, "ease-out"], [TURN + 10, 0.65, "hold"], [N, 0.65]]) }]}>{LINE1}</text>
      <text {...txt} y={369} at={(TURN + 1) / FPS} duration={(N - TURN - 1) / FPS} motion={{ by: "character", from: { opacity: 0 }, at: 0, duration: 13 / FPS, overlap: 0, easing: "linear" }}>{LINE2}</text>
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" animate={[{ property: "opacity", keyframes: kf([[0, 0, "hold"], [FADE0, 0, "ease-in"], [N - 1, 1, "hold"], [N, 1]]) }]} />
    </frame>,
    { at: 0, dur: DUR }
  );
  if (audio) p.cut(audio, { at: 0 });
  console.error("hero segments:", hero.segCount, "nodes:", hero.nodes.length);
};
