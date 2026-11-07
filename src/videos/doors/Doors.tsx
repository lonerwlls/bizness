// Composition: the cartoon-3d-short post chain (ink -> lens blur -> bloom -> NEUTRAL tone map -> grade) over DoorsWorld,
// plus big word-by-word subtitles, the narration and the sound bed.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, continueRender, delayRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../bridge/grade";
import { DoorsWorld, TOTAL, dofAt, FPS, wt } from "./world";
import { VOICE } from "./voice";

export const DOORS_FRAMES = TOTAL;
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.6, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3();
const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new DoorsWorld(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, target.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = dofAt(f).cInf;
  gradeFor(fx.grade, "day");
  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.lens.pre} dispose={null} />
        <primitive object={fx.lens.main} dispose={null} />
        <primitive object={fx.bloom} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.grade} dispose={null} />
      </EffectComposer>
    </>
  );
};

// ---------------- subtitles: 2-4 words, the spoken word lights up ----------------
type Tok = { w: string; t: number; e: number; brk: boolean };
const TOKS: Tok[] = (() => {
  const out: Tok[] = [];
  for (const x of VOICE.words) {
    if (["s", "ll", "t"].includes(x.w.toLowerCase()) && out.length) { const p = out[out.length - 1]; p.w += "'" + x.w; p.e = x.e; p.brk = x.end || x.pause; continue; }
    out.push({ w: x.w, t: x.t, e: x.e, brk: x.end || x.pause });
  }
  return out;
})();
const CHUNKS: { toks: Tok[]; a: number; b: number }[] = (() => {
  const ch: Tok[][] = [];
  let cur: Tok[] = [];
  for (const tk of TOKS) {
    cur.push(tk);
    const len = cur.reduce((s, x) => s + x.w.length, 0);
    if (tk.brk || cur.length >= 4 || (cur.length >= 3 && len > 14)) { ch.push(cur); cur = []; }
  }
  if (cur.length) ch.push(cur);
  return ch.map((toks, i) => ({ toks, a: toks[0].t - 0.05, b: i + 1 < ch.length ? ch[i + 1][0].t - 0.05 : toks[toks.length - 1].e + 0.6 }));
})();
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const pop = Math.min(1, (t - c.a) / 0.12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1620, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px",
      transform: `scale(${0.9 + 0.1 * pop})`, fontFamily: "Anton", fontSize: 100, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: 1 }}>
      {c.toks.map((tk, i) => (
        <span key={i} style={{ color: t >= tk.t - 0.03 && t < (c.toks[i + 1]?.t ?? c.b) ? "#ffd84a" : "#ffffff",
          WebkitTextStroke: "14px #241726", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(36,23,38,0.55)" }}>{tk.w}</span>
      ))}
    </div>
  );
};

// ---------------- chapter cards (title + "RULE N") at the top of the frame ----------------
type Card = { a: number; b: number; big: string; small: string };
const CARDS: Card[] = (() => {
  const c = (w: string, n: number, dur: number, big: string, small: string): Card => ({ a: wt(w, n) - 0.05, b: wt(w, n) + dur, big, small });
  return [
    c("weirder", 1, 1.6, "WHAT IF EVERY DOOR", "LED TO ANOTHER UNIVERSE?"),
    c("rule", 1, 2.2, "RULE 1", "YOU NEVER KNOW WHERE IT GOES"),
    c("rule", 2, 2.2, "RULE 2", "SCHOOL IS A GAMBLE"),
    c("rule", 3, 2.2, "RULE 3", "SOME DOORS ARE BETTER"),
    c("last", 1, 2.2, "THE LAST RULE", "ONE DOOR ALWAYS LEADS HOME"),
    c("monday", 2, 1.8, "NEXT MONDAY", "7:00 AM"),
  ];
})();
const Cards: React.FC<{ t: number }> = ({ t }) => {
  const c = CARDS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = Math.min(1, (t - c.a) / 0.15), out = Math.min(1, (c.b - t) / 0.2), op = Math.min(k, out);
  const stroke = { WebkitTextStroke: "16px #241726", paintOrder: "stroke fill" as const, textShadow: "0 10px 0 rgba(36,23,38,0.5)" };
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 170, textAlign: "center", fontFamily: "Anton", opacity: op, transform: `scale(${0.85 + 0.15 * k})` }}>
      <div style={{ fontSize: 150, lineHeight: 1.0, color: "#ffffff", ...stroke }}>{c.big}</div>
      <div style={{ fontSize: 76, lineHeight: 1.1, color: "#ffd84a", marginTop: 10, ...stroke }}>{c.small}</div>
    </div>
  );
};
let fontHandle: number | null = null;
if (typeof document !== "undefined" && fontHandle === null) {
  fontHandle = delayRender("font");
  const ff = new FontFace("Anton", `url(${staticFile("towers/fonts/Anton.woff2")})`);
  ff.load().then((x) => { document.fonts.add(x); continueRender(fontHandle!); }).catch(() => continueRender(fontHandle!));
}

export const DoorsShort: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 1500 }}>
          <Inner />
        </ThreeCanvas>
      </AbsoluteFill>
      <Cards t={f / FPS} />
      <Subs t={f / FPS} />
      <Audio src={staticFile("doors/voice.mp3")} />
      <Audio src={staticFile("doors/sound.wav")} />
    </AbsoluteFill>
  );
};
