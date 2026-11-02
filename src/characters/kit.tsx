// Общий набор для роликов в стиле «анимационная история»: фон, камера, шаг, собака, машины.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { D, Pose, V, stepFoot } from "./Rig";

// шрифт для вывесок/экранов (локально, латиница)
if (typeof document !== "undefined") {
  const h = delayRender("kit fonts");
  new FontFace("KitMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`)
    .load()
    .then((x) => document.fonts.add(x))
    .then(() => continueRender(h), () => continueRender(h));
}
export const MONT = "KitMont";

export const N0 = "#0e1628", N2 = "#2a3a5e", N3 = "#3a4c74", N4 = "#4d6190";
export const YEL = "#f5c84c", RED = "#e0524a", WH = "#eef2f8", INK = "#141b2e";

export const ip = (f: number, i: number[], o: number[], e?: (t: number) => number) =>
  interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t).toString(16).padStart(2, "0");
  return `#${c(16)}${c(8)}${c(0)}`;
};

export const Full: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
export const Sky: React.FC<{ id: string; stops: [number, string][]; h?: number }> = ({ id, stops, h = 1920 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
      </linearGradient>
    </defs>
    <rect width={1080} height={h} fill={`url(#${id})`} />
  </>
);
export const Stars: React.FC<{ f: number; n?: number; h?: number; o?: number }> = ({ f, n = 50, h = 900, o = 1 }) => (
  <g opacity={o}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * h} r={1 + rnd(i + 7) * 1.8} fill={WH} opacity={0.25 + 0.45 * Math.abs(Math.sin(f / 15 + i))} />)}</g>
);
export const Cam: React.FC<{ k: number; ox?: number; oy?: number; tx?: number; ty?: number; children: React.ReactNode }> = ({ k, ox = 540, oy = 960, tx = 0, ty = 0, children }) => (
  <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${k})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>
);
export const Grain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.1 }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <Img src={staticFile("towers/grain.png")} style={{ position: "absolute", width: 1600, height: 2800, left: -(rnd(f) * 500), top: -(rnd(f + 1) * 860) }} />
  </AbsoluteFill>
);

// шаг по поверхности (мир) → таз, руки и ступни в локальных координатах куклы. Для ходьбы влево: walkRig(-x, ...) и dir=-1.
export const walkRig = (xw: number, ground: (x: number) => number, s: number, S: number, hipH = 134, lift = 22) => {
  const fl = stepFoot(xw, S, 0, ground, lift), fr = stepFoot(xw, S, 0.5, ground, lift);
  const g = (ground(xw - S * 0.2) + ground(xw + S * 0.2)) / 2;
  const hy = g - hipH * s + Math.cos((xw / S) * Math.PI * 4) * 3 * s;
  const swL = (fr[0] - xw) / S, swR = (fl[0] - xw) / S;
  const pose: Pose = { lean: 4, aL: [swL * 80, swL * 80 + 22], aR: [swR * 80, swR * 80 + 22], lL: [0, 0], lR: [0, 0] };
  return { hip: [xw, hy] as V, pose, feet: { l: [(fl[0] - xw) / s, (fl[1] - hy) / s] as V, r: [(fr[0] - xw) / s, (fr[1] - hy) / s] as V } };
};
export const toLocal = (w: V, hip: V, s: number, dir = 1): V => [((w[0] - hip[0]) / s) * dir, (w[1] - hip[1]) / s];
export const toWorld = (l: V, hip: V, s: number, dir = 1): V => [hip[0] + l[0] * s * dir, hip[1] + l[1] * s];
export const sitPose = (lean: number, head = 0): Pose => ({ lean, head, aL: [0, 0], aR: [0, 0], lL: [88, 4], lR: [84, -2] });

// ---------- собака-напарник (Бадди) ----------
export const Dog: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; f: number; bark?: number; wag?: number; sit?: boolean; run?: boolean; tongue?: boolean }> = ({ x, y, s = 1, dir = 1, f, bark = 0, wag = 0.3, sit, run, tongue }) => {
  const C = "#c08a52", C2 = "#8a5a32";
  const tail = -40 + Math.sin(f / (wag > 0.5 ? 1.6 : 4)) * 30 * wag;
  const jaw = bark * 22;
  const lg = run ? Math.sin(f / 2) * 26 : 0;
  const leg = (x0: number, a: number, c: string, k: string) => <line key={k} x1={x0} y1={-50} x2={x0 + Math.sin(a * D) * 50} y2={-50 + Math.cos(a * D) * 50} stroke={c} strokeWidth={12} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <line x1={-50} y1={sit ? -40 : -62} x2={-50 + Math.cos((tail - 90) * D) * 45} y2={(sit ? -40 : -62) + Math.sin((tail - 90) * D) * 45} stroke={C} strokeWidth={9} strokeLinecap="round" />
      {sit ? <ellipse cx={-30} cy={-22} rx={34} ry={22} fill={C2} /> : <>{leg(-34, -lg, C2, "a")}{leg(-22, lg, C, "b")}</>}
      {leg(30, lg, C2, "c")}
      {leg(42, -lg, C, "d")}
      <g transform={sit ? "rotate(-28 -30 -30)" : ""}><ellipse cx={0} cy={-58} rx={58} ry={25} fill={C} /></g>
      <g transform={`translate(${sit ? 46 : 58} ${sit ? -98 : -84})`}>
        <circle cx={0} cy={0} r={25} fill={C} />
        <ellipse cx={22} cy={8} rx={18} ry={11} fill={C} />
        <path d={`M 10 14 L 40 ${14 + jaw * 0.2} L 36 ${18 + jaw} L 8 ${20 + jaw * 0.4} Z`} fill={bark > 0.1 ? "#7a2a2a" : C} />
        {tongue ? <ellipse cx={30} cy={24 + Math.sin(f / 3) * 2} rx={7} ry={11} fill="#e86a7a" /> : null}
        <circle cx={38} cy={4} r={6} fill={INK} />
        <circle cx={8} cy={-6} r={4} fill={INK} />
        <path d={`M -16 -16 Q -30 ${6 + (run ? Math.sin(f / 2) * 6 : 0)} -14 18 Q -6 0 -6 -14 Z`} fill={C2} />
        {bark > 0.2 ? [0, 1, 2].map((i) => <line key={i} x1={52} y1={-14 + i * 14} x2={72} y2={-22 + i * 22} stroke={WH} strokeWidth={4} strokeLinecap="round" opacity={bark} />) : null}
      </g>
    </g>
  );
};

// ---------- машины (вид сбоку, земля в y=0, смотрит вправо) ----------
export const Car: React.FC<{ x: number; y: number; s?: number; col: string; dir?: 1 | -1; door?: boolean; spin?: number; lights?: boolean; children?: React.ReactNode; uid?: string }> = ({ x, y, s = 1, col, dir = 1, door, spin = 0, lights, children, uid }) => {
  const dark = mixHex(col, "#000000", 0.3);
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -34) rotate(${spin})`}>
      <circle r={34} fill="#1b2033" />
      <circle r={14} fill="#aab6cc" />
      <rect x={-3} y={-30} width={6} height={20} fill="#5a6a8a" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <path d="M -185 -40 L -185 -92 Q -180 -104 -150 -106 L -110 -108 L -70 -160 Q -60 -168 -40 -168 L 60 -168 Q 80 -168 92 -156 L 130 -110 L 168 -104 Q 186 -100 188 -84 L 188 -40 Z" fill={col} />
      {uid ? <defs><clipPath id={uid}><path d="M -98 -108 L -64 -152 L 52 -152 L 116 -108 Z" /></clipPath></defs> : null}
      <path d="M -98 -108 L -64 -152 L 52 -152 L 116 -108 Z" fill="#26324f" />
      {uid ? <g clipPath={`url(#${uid})`}>{children}</g> : null}
      <path d="M -98 -108 L -64 -152 L -6 -152 L -6 -108 Z" fill="#9cc0e6" opacity={0.35} />
      <path d="M 4 -108 L 4 -152 L 52 -152 L 116 -108 Z" fill="#9cc0e6" opacity={0.35} />
      <rect x={-6} y={-152} width={10} height={46} fill={col} />
      <rect x={-185} y={-62} width={373} height={10} fill={dark} />
      <rect x={176} y={-96} width={12} height={14} rx={4} fill={lights ? "#fff6c8" : "#e8e0b8"} />
      <rect x={-185} y={-96} width={10} height={14} rx={3} fill={RED} />
      {door ? <path d="M -6 -108 L -70 -128 L -70 -30 L -6 -42 Z" fill={dark} /> : null}
      {wheel(-112)}
      {wheel(112)}
    </g>
  );
};
export const Bus: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = "#f2c230" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-330} y={-250} width={660} height={210} rx={24} fill={col} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-300 + i * 100} y={-226} width={80} height={70} rx={8} fill="#26324f" />)}
    <rect x={250} y={-140} width={50} height={96} rx={6} fill="#26324f" />
    <rect x={-330} y={-90} width={660} height={12} fill={mixHex(col, "#000000", 0.3)} />
    {[-220, 220].map((cx) => <g key={cx}><circle cx={cx} cy={-36} r={38} fill="#1b2033" /><circle cx={cx} cy={-36} r={15} fill="#aab6cc" /></g>)}
  </g>
);
