// «What If You Woke Up With Every Superpower?» — общий набор (стиль 10-секундного примера src/blind/blind.tsx,
// но вместо ночного города — приморский городок на рассвете/закате: бухта, маяк, пастельные домики на холме).
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bean, BeanDefs, BeanLook, BeanPose, HERO2D, NEIGHBOR_A, NEIGHBOR_B } from "../toontest/bean";

export { Bean, HERO2D };
export type { BeanPose, BeanLook };
export const INK = "#16131f";
export const YEL = "#ffd23c";
export const FPS = 30;
export const LEAD = 9;
export const GY = 900; // пол / тротуар: здесь стоят ступни
export const HS = 0.62;
export const ip = (f: number, a: number[], b: number[], e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

export const LOOKS: BeanLook[] = [
  NEIGHBOR_A, NEIGHBOR_B,
  { head: "#f8f6f0", body: "#5a7cf0", body2: "#3a56c0", limb: "#262838", shoe: "#ffffff", hair: "#2a1a14" },
  { head: "#f2e2c8", body: "#b45ad8", body2: "#8a3ab0", limb: "#262838", shoe: "#2a2a30", hat: "bowler", hatC: "#2a2a40", hatC2: "#ff6fb5" },
  { head: "#f8f6f0", body: "#3cc6d8", body2: "#2496a8", limb: "#262838", shoe: "#f4c430", hair: "#6a3a22" },
  { head: "#f2e2c8", body: "#f4c430", body2: "#c8961a", limb: "#262838", shoe: "#2a2a30", hat: "beanie", hatC: "#d8406a", hatC2: "#ffffff" },
  { head: "#f8f6f0", body: "#ff6f8f", body2: "#d04868", limb: "#262838", shoe: "#ffffff", hair: "#1e1a1a" },
];
export const walkPose = (f: number, sp = 0.28, a = 0): BeanPose => {
  const p = Math.sin(f * sp + a);
  return { legL: 4 + p * 16, legR: 4 - p * 16, bob: Math.abs(p) * 7, lean: -3, armL: [12 + p * 18, 8], armR: [12 - p * 18, 8], tilt: Math.sin(f * 0.07 + a) * 6 };
};
export const floatPose = (f: number, a = 0): BeanPose => ({ legL: 10 + Math.sin(f * 0.08 + a) * 8, legR: -2 + Math.sin(f * 0.08 + a + 1) * 8, armL: [40 + Math.sin(f * 0.1) * 10, 30], armR: [44 + Math.sin(f * 0.1 + 1) * 10, 30], tilt: Math.sin(f * 0.05) * 6, bob: Math.sin(f * 0.09) * 10 });

// ---------- камера и слои ----------
export type Cam = { x: number; y: number; z: number; sx?: number; sy?: number };
const REF = { x: 960, y: 540 };
export const Layer: React.FC<{ cam: Cam; d: number; blur?: number; children: React.ReactNode }> = ({ cam, d, blur, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const x = REF.x + (cam.x - REF.x) * d + (cam.sx ?? 0), y = REF.y + (cam.y - REF.y) * d + (cam.sy ?? 0);
  return <g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};
export const camLerp = (g: number, len: number, a: Cam, b: Cam, e: (t: number) => number = Easing.inOut(Easing.sin)): Cam => {
  const k = e(Math.min(1, Math.max(0, g / Math.max(1, len))));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, sx: a.sx, sy: a.sy };
};
export const shake = (f: number, amt: number): Partial<Cam> => ({ sx: Math.sin(f * 2.1) * amt, sy: Math.cos(f * 1.7) * amt });

// ---------- общие defs ----------
export const Defs: React.FC = () => (
  <defs>
    <BeanDefs />
    <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2a1468" /><stop offset="38%" stopColor="#7a2ea8" /><stop offset="68%" stopColor="#f05a9a" /><stop offset="88%" stopColor="#ffa86a" /><stop offset="100%" stopColor="#ffd88a" />
    </linearGradient>
    <linearGradient id="skyHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0c0838" /><stop offset="55%" stopColor="#2a2a8a" /><stop offset="100%" stopColor="#7a5ad8" /></linearGradient>
    <linearGradient id="skyMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a2a9a" /><stop offset="60%" stopColor="#a85ac8" /><stop offset="100%" stopColor="#ff9ab0" /></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8fb0" /><stop offset="18%" stopColor="#8a5ad8" /><stop offset="100%" stopColor="#2a2a8a" /></linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a3098" /><stop offset="100%" stopColor="#6a42b8" /></linearGradient>
    <linearGradient id="xr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a2a5a" /><stop offset="100%" stopColor="#06163a" /></linearGradient>
    {([["gY", "#ffd860"], ["gP", "#ff5fb0"], ["gR", "#ff3a4a"], ["gC", "#5ae0ff"], ["gW", "#fff2c0"], ["gO", "#ff9a40"], ["gV", "#b47aff"]] as const).map(([id, c]) => (
      <radialGradient key={id} id={id}><stop offset="0%" stopColor={c} stopOpacity={0.9} /><stop offset="40%" stopColor={c} stopOpacity={0.35} /><stop offset="100%" stopColor={c} stopOpacity={0} /></radialGradient>
    ))}
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff2c0" stopOpacity={0.6} /><stop offset="100%" stopColor="#fff2c0" stopOpacity={0} /></linearGradient>
    {[2, 4, 7].map((b) => <filter key={b} id={`blur${b}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={b} /></filter>)}
  </defs>
);
export const Glow: React.FC<{ x: number; y: number; r: number; g: string; o?: number }> = ({ x, y, r, g, o = 1 }) => <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} style={{ mixBlendMode: "screen" }} />;

export const Grade: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 85% 5%, rgba(255,150,90,0.22), rgba(0,0,0,0) 55%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 10% 0%, rgba(255,80,170,0.2), rgba(0,0,0,0) 50%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(30,20,110,0.32) 100%)" }} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 ${260 + dark * 200}px ${60 + dark * 120}px rgba(14,6,40,${0.58 + dark * 0.3})` }} />
  </>
);
export const Frame: React.FC<{ children: React.ReactNode; dark?: number; bg?: string }> = ({ children, dark, bg = "#1a0f4a" }) => (
  <>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, background: bg }}><Defs />{children}</svg>
    {dark ? <AbsoluteFill style={{ background: "#07030f", opacity: dark * 0.5 }} /> : null}
  </>
);

// ---------- бухта ----------
export const Sun: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 120 }) => (
  <g><Glow x={x} y={y} r={r * 4} g="gO" /><Glow x={x} y={y} r={r * 2.4} g="gY" />
    <circle cx={x} cy={y} r={r} fill="#ffe9a0" stroke={INK} strokeWidth={6} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff8d8" opacity={0.7} /></g>
);
export const Cloud: React.FC<{ x: number; y: number; w?: number; f?: number }> = ({ x, y, w = 1, f = 0 }) => (
  <g transform={`translate(${x + f * 0.3} ${y}) scale(${w})`}>
    <path d="M -160 30 Q -170 -10 -120 -14 Q -110 -60 -50 -54 Q -20 -96 40 -70 Q 100 -86 112 -30 Q 170 -30 162 30 Z" fill="#ff9ac0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -130 22 L 140 22" stroke="#d86aa0" strokeWidth={10} strokeLinecap="round" />
  </g>
);
export const Lighthouse: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const a = (f * 2.4) % 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={-336} r={260} g="gW" o={0.4 + 0.4 * Math.abs(Math.cos(a * Math.PI / 180))} />
      <path d="M -60 0 L -38 -290 L 38 -290 L 60 0 Z" fill="#fff4f0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-56 + i * 7} ${-40 - i * 90} L ${-50 + i * 7} ${-80 - i * 90} L ${50 - i * 7} ${-80 - i * 90} L ${56 - i * 7} ${-40 - i * 90} Z`} fill="#ff4a6a" stroke={INK} strokeWidth={5} />)}
      <rect x={-52} y={-304} width={104} height={20} fill="#3a2a6a" stroke={INK} strokeWidth={6} />
      <rect x={-30} y={-366} width={60} height={62} fill={YEL} stroke={INK} strokeWidth={6} />
      <path d="M -42 -366 L 0 -410 L 42 -366 Z" fill="#ff4a6a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Glow x={0} y={-336} r={160} g="gY" />
    </g>
  );
};
type House = { x: number; y: number; w: number; h: number; c: string; roof: string; lit: boolean[] };
const HC = ["#ff8fb0", "#5ad8c8", "#ffd23c", "#b48aff", "#ff9a5a", "#7ab8ff", "#f8a8d8"];
const RC = ["#d8406a", "#3a3a8a", "#a8306a", "#2a6a9a"];
export const makeHouses = (seed: number, x0: number, x1: number, y0: number, slope: number, rows = 3): House[] => {
  const r = rand(seed); const out: House[] = [];
  for (let row = rows - 1; row >= 0; row--) for (let x = x0 + row * 40; x < x1;) {
    const w = 120 + r() * 90, h = 90 + r() * 70;
    out.push({ x, y: y0 - row * 110 - Math.max(0, (x1 - x) * slope) * (row + 1) * 0.3, w, h, c: HC[Math.floor(r() * HC.length)], roof: RC[Math.floor(r() * RC.length)], lit: Array.from({ length: 8 }, () => r() < 0.55) });
    x += w + 10 + r() * 30;
  }
  return out;
};
export const HouseG: React.FC<{ h: House; sw?: number }> = ({ h, sw = 6 }) => {
  const win = Math.min(26, h.w / 5);
  return (
    <g>
      <rect x={h.x} y={h.y - h.h} width={h.w} height={h.h + 40} fill={h.c} stroke={INK} strokeWidth={sw} />
      <path d={`M ${h.x - 14} ${h.y - h.h + 4} L ${h.x + h.w / 2} ${h.y - h.h - h.w * 0.42} L ${h.x + h.w + 14} ${h.y - h.h + 4} Z`} fill={h.roof} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => {
        const cx = h.x + h.w * (0.2 + (i % 2) * 0.45), cy = h.y - h.h + 22 + Math.floor(i / 2) * win * 1.9;
        if (cy + win > h.y + 10) return null;
        return <rect key={i} x={cx} y={cy} width={win} height={win * 1.25} rx={3} fill={h.lit[i] ? YEL : "#3a2a7a"} stroke={INK} strokeWidth={sw * 0.65} />;
      })}
    </g>
  );
};
const FARH = makeHouses(3, -900, 2900, 610, 0.02, 3);
export const Palm: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const sw = Math.sin(f * 0.05) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 0 Q 20 -150 -10 -320" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d="M 0 0 Q 20 -150 -10 -320" stroke="#c87a4a" strokeWidth={18} fill="none" strokeLinecap="round" />
      <g transform={`translate(-10 -320) rotate(${sw})`}>
        {[-150, -110, -60, -20, 30, 80].map((a, i) => (
          <path key={i} transform={`rotate(${a})`} d="M 0 0 Q 70 -40 150 10 Q 80 -10 0 14 Z" fill={i % 2 ? "#3ac88a" : "#2aa870"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        ))}
        <circle cx={0} cy={6} r={14} fill="#8a5a3a" stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};
export const Boat: React.FC<{ x: number; y: number; s?: number; f: number; c?: string; puffs?: boolean; sail?: boolean }> = ({ x, y, s = 1, f, c = "#ff6a5a", puffs, sail }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.1) * 6 * s}) scale(${s}) rotate(${Math.sin(f * 0.08) * 2})`}>
    {sail ? <><path d="M 0 -40 L 0 -250 L 110 -50 Z" fill="#fff4f0" stroke={INK} strokeWidth={6} strokeLinejoin="round" /><path d="M -8 -50 L -8 -200 L -80 -50 Z" fill="#ffd23c" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></>
      : <><rect x={-40} y={-110} width={90} height={70} fill="#fff4f0" stroke={INK} strokeWidth={6} /><rect x={-26} y={-96} width={26} height={22} fill="#9fdcff" stroke={INK} strokeWidth={4} />
        <rect x={-80} y={-130} width={22} height={80} fill="#3a3a6a" stroke={INK} strokeWidth={5} /></>}
    <path d="M -170 -50 L 170 -50 L 130 10 L -140 10 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -160 -32 L 160 -32" stroke="#fff4f0" strokeWidth={8} />
    {puffs ? Array.from({ length: 5 }, (_, i) => { const t = ((f * 1.2 + i * 16) % 80) / 80; return <circle key={i} cx={-70 - t * 120} cy={-140 - t * 140} r={14 + t * 40} fill="#c8b8e8" stroke={INK} strokeWidth={4} opacity={1 - t} />; }) : null}
  </g>
);
export const Waves: React.FC<{ y0: number; y1: number; f: number; x0?: number; x1?: number }> = ({ y0, y1, f, x0 = -2000, x1 = 4000 }) => (
  <g>{Array.from({ length: 14 }, (_, i) => {
    const y = y0 + ((i * 37) % (y1 - y0)), x = x0 + ((i * 523 + f * (1 + (i % 3))) % (x1 - x0));
    return <path key={i} d={`M ${x} ${y} q 30 -12 60 0 q 30 12 60 0`} stroke="#ffc8e0" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />;
  })}</g>
);
// вид на бухту: небо, солнце, дальний берег с домиками и маяком, море; наш берег — набережная (если promenade)
export const Bay: React.FC<{ cam: Cam; f: number; sun?: [number, number]; children?: React.ReactNode; promenade?: boolean; boats?: boolean; dark?: number; mid?: React.ReactNode }> = ({ cam, f, sun = [1250, 430], children, promenade = true, boats = true, mid }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <Layer cam={cam} d={0.05}>
      <rect x={-3000} y={-2500} width={9000} height={3200} fill="url(#skyS)" />
      <Sun x={sun[0]} y={sun[1]} />
      <Cloud x={300} y={180} w={1.1} f={f} /><Cloud x={1650} y={120} w={0.8} f={f} /><Cloud x={2400} y={260} w={1.2} f={f} /><Cloud x={-500} y={300} w={0.9} f={f} />
    </Layer>
    <Layer cam={cam} d={0.25} blur={4}>
      <path d="M -2600 640 Q -1800 470 -900 560 Q -300 500 200 590 L 200 700 L -2600 700 Z" fill="#6a3aa8" stroke={INK} strokeWidth={6} />
      <path d="M 1500 600 Q 2100 450 2800 520 Q 3600 470 4400 600 L 4400 700 L 1500 700 Z" fill="#6a3aa8" stroke={INK} strokeWidth={6} />
      <Lighthouse x={2250} y={540} f={f} s={0.7} />
    </Layer>
    <Layer cam={cam} d={0.4}>
      <rect x={-3000} y={600} width={9000} height={900} fill="url(#sea)" />
      <path d={`M ${sun[0] - 20} 610 L ${sun[0] + 20} 610 L ${sun[0] + 140} 900 L ${sun[0] - 140} 900 Z`} fill="#ffe9a0" opacity={0.35} style={{ mixBlendMode: "screen" }} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={sun[0] - 40 - i * 12 + Math.sin(f * 0.1 + i) * 14} y={620 + i * 30} width={80 + i * 24} height={8} rx={4} fill="#fff2c0" opacity={0.7} />)}
      <Waves y0={640} y1={980} f={f} />
    </Layer>
    <Layer cam={cam} d={0.45} blur={2}>
      <g transform="translate(-700 640) scale(0.45) translate(0 -640)">{FARH.map((h, i) => <HouseG key={i} h={h} sw={9} />)}</g>
      <path d="M -2600 640 L 650 640" stroke={INK} strokeWidth={6} />
    </Layer>
    {boats ? <Layer cam={cam} d={0.6}>
      <Boat x={300 + f * 0.6} y={760} s={0.45} f={f} sail c="#5a7cf0" />
      <Boat x={1700 - f * 0.4} y={790} s={0.5} f={f + 20} c="#ff6a5a" />
    </Layer> : null}
    {mid}
    <Layer cam={cam} d={1}>
      {promenade ? <>
        {/* перила набережной, фонари с гирляндой, плитка */}
        <rect x={-3000} y={GY - 40} width={9000} height={900} fill="#7a58c8" stroke={INK} strokeWidth={6} />
        <rect x={-3000} y={GY - 40} width={9000} height={20} fill="#9a7ae0" />
        {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${-2000 + i * 200} ${GY - 20} L ${-2080 + i * 200} ${GY + 700}`} stroke={INK} strokeWidth={4} opacity={0.3} />)}
        <path d={`M -3000 ${GY - 150} L 6000 ${GY - 150}`} stroke={INK} strokeWidth={16} />
        <path d={`M -3000 ${GY - 150} L 6000 ${GY - 150}`} stroke="#fff0f8" strokeWidth={7} />
        {Array.from({ length: 60 }, (_, i) => <rect key={i} x={-2000 + i * 90} y={GY - 150} width={10} height={110} fill="#fff0f8" stroke={INK} strokeWidth={3} />)}
        {[-900, 300, 1500, 2700].map((x, i) => <PostLamp key={x} x={x} f={f} next={i < 3 ? x + 1200 : undefined} />)}
      </> : null}
      {children}
    </Layer>
  </svg>
);
export const PostLamp: React.FC<{ x: number; f: number; next?: number; y?: number }> = ({ x, f, next, y = GY - 40 }) => (
  <g>
    {next !== undefined ? <>
      <path d={`M ${x} ${y - 330} Q ${(x + next) / 2} ${y - 230} ${next} ${y - 330}`} stroke={INK} strokeWidth={5} fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10, bx = x + (next - x) * t, by = y - 330 + 4 * 100 * t * (1 - t);
        const c = [YEL, "#ff6fb5", "#5ae0ff"][i % 3];
        return <g key={i}><circle cx={bx} cy={by + 14} r={11} fill={c} stroke={INK} strokeWidth={4} /><Glow x={bx} y={by + 14} r={50} g={["gY", "gP", "gC"][i % 3]} o={0.6 + 0.3 * Math.sin(f * 0.2 + i)} /></g>;
      })}</> : null}
    <rect x={x - 8} y={y - 340} width={16} height={340} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <circle cx={x} cy={y - 360} r={26} fill={YEL} stroke={INK} strokeWidth={5} />
    <Glow x={x} y={y - 360} r={130} g="gY" />
  </g>
);

// улица городка: ряд домиков вблизи (для сцен «у соседа», «собака»)
const NEARH = makeHouses(11, -1400, 3600, GY - 40, 0, 1).map((h) => ({ ...h, w: h.w * 2.4, h: h.h * 2.6 }));
const spreadNear = (() => { let x = -1400; return NEARH.map((h) => { const o = { ...h, x }; x += h.w + 60; return o; }); })();
export const Town: React.FC<{ cam: Cam; f: number; sun?: [number, number]; children?: React.ReactNode; houses?: boolean }> = ({ cam, f, sun = [1450, 300], children, houses = true }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <Layer cam={cam} d={0.05}>
      <rect x={-3000} y={-2500} width={9000} height={3200} fill="url(#skyS)" /><Sun x={sun[0]} y={sun[1]} r={90} />
      <Cloud x={500} y={160} f={f} /><Cloud x={1900} y={220} w={0.8} f={f} />
    </Layer>
    <Layer cam={cam} d={0.35} blur={4}><g transform="translate(-400 700) scale(0.7) translate(0 -650)">{FARH.map((h, i) => <HouseG key={i} h={h} sw={8} />)}{FARH.map((h, i) => <HouseG key={"b" + i} h={{ ...h, x: h.x + 3800 }} sw={8} />)}</g></Layer>
    <Layer cam={cam} d={0.6} blur={2}>
      {makeHouses(23, -1400, 3600, 760, 0, 2).map((h, i) => <HouseG key={i} h={{ ...h, w: h.w * 1.3, h: h.h * 1.4 }} />)}
      <Palm x={-200} y={760} s={0.8} f={f} /><Palm x={1400} y={760} s={0.9} f={f + 20} /><Palm x={2600} y={760} s={0.8} f={f + 9} />
    </Layer>
    <Layer cam={cam} d={1}>
      {houses ? spreadNear.map((h, i) => <HouseG key={i} h={h} sw={7} />) : null}
      <rect x={-3000} y={GY - 40} width={9000} height={900} fill="#7a58c8" stroke={INK} strokeWidth={6} />
      <rect x={-3000} y={GY - 40} width={9000} height={20} fill="#9a7ae0" />
      {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${-2000 + i * 200} ${GY - 20} L ${-2080 + i * 200} ${GY + 700}`} stroke={INK} strokeWidth={4} opacity={0.3} />)}
      {children}
    </Layer>
  </svg>
);

// ---------- спальня героя ----------
export const CEIL = GY - 820;
export type RoomKind = "bed" | "kitchen" | "bath";
export const Room: React.FC<{ cam: Cam; f: number; children?: React.ReactNode; xray?: number; win?: boolean; kind?: RoomKind; handle?: boolean }> = ({ cam, f, children, xray = 0, win = true, kind = "bed", handle = true }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <Layer cam={cam} d={1}>
      <rect x={-1500} y={CEIL - 600} width={5000} height={GY - CEIL + 600} fill="url(#wall)" />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + i * 120} y={CEIL} width={46} height={GY - CEIL} fill="#5a3aa8" opacity={0.5} />)}
      <rect x={-1500} y={CEIL - 600} width={5000} height={600} fill="#2a1a60" stroke={INK} strokeWidth={8} />
      <rect x={-1500} y={CEIL - 10} width={5000} height={26} fill="#ff6fb5" stroke={INK} strokeWidth={6} />
      {/* потолочная лампа */}
      <path d={`M 1050 ${CEIL + 16} L 1050 ${CEIL + 90}`} stroke={INK} strokeWidth={6} />
      <path d={`M 990 ${CEIL + 150} L 1010 ${CEIL + 90} L 1090 ${CEIL + 90} L 1110 ${CEIL + 150} Z`} fill="#ffd23c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* окно с видом на бухту */}
      {win ? <g>
        <clipPath id="winclip"><rect x={1300} y={CEIL + 160} width={480} height={420} /></clipPath>
        <g clipPath="url(#winclip)">
          <rect x={1300} y={CEIL + 160} width={480} height={420} fill="url(#skyS)" />
          <Sun x={1560} y={CEIL + 430} r={60} />
          <rect x={1300} y={CEIL + 460} width={480} height={200} fill="url(#sea)" />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={1530 - i * 8} y={CEIL + 470 + i * 22} width={60 + i * 16} height={6} rx={3} fill="#fff2c0" opacity={0.7} />)}
          <Lighthouse x={1380} y={CEIL + 470} f={f} s={0.35} />
          <Cloud x={1420} y={CEIL + 260} w={0.4} f={f} />
        </g>
        <rect x={1300} y={CEIL + 160} width={480} height={420} fill="none" stroke={INK} strokeWidth={10} />
        <path d={`M 1540 ${CEIL + 160} L 1540 ${CEIL + 580} M 1300 ${CEIL + 370} L 1780 ${CEIL + 370}`} stroke="#fff0f8" strokeWidth={12} />
        <path d={`M 1540 ${CEIL + 160} L 1540 ${CEIL + 580} M 1300 ${CEIL + 370} L 1780 ${CEIL + 370}`} stroke={INK} strokeWidth={3} />
        <rect x={1280} y={CEIL + 580} width={520} height={26} fill="#fff0f8" stroke={INK} strokeWidth={6} />
        <path d={`M 1300 ${CEIL + 160} L 1780 ${CEIL + 580}`} stroke="#fff" strokeWidth={0} />
        <path d={`M 1300 ${CEIL + 600} L 1100 ${GY} L 1900 ${GY} L 1780 ${CEIL + 600} Z`} fill="#ffd88a" opacity={0.18} style={{ mixBlendMode: "screen" }} />
        <Glow x={1560} y={CEIL + 400} r={360} g="gO" o={0.7} />
      </g> : null}
      {kind === "bath" ? <g>{Array.from({ length: 60 }, (_, i) => <rect key={i} x={-900 + (i % 20) * 140} y={GY - 420 + Math.floor(i / 20) * 140} width={140} height={140} fill={(i + Math.floor(i / 20)) % 2 ? "#5ad8c8" : "#8ae8dc"} stroke={INK} strokeWidth={4} />)}</g> : null}
      {/* постер-волна (без надписей) */}
      <rect x={-260} y={CEIL + 200} width={220} height={280} fill="#5ad8c8" stroke={INK} strokeWidth={7} />
      <path d={`M -240 ${CEIL + 400} q 50 -60 100 0 q 50 60 80 -10`} stroke="#fff0f8" strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={-110} cy={CEIL + 280} r={36} fill="#ffd23c" stroke={INK} strokeWidth={6} />
      {/* пол */}
      <rect x={-1500} y={GY} width={5000} height={700} fill={xray > 0 ? "#6a4a3a" : "#8a5a3a"} stroke={INK} strokeWidth={8} opacity={1 - xray * 0.8} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-1500 + i * 170} ${GY} L ${-1500 + i * 170} ${GY + 700}`} stroke={INK} strokeWidth={4} opacity={0.35 * (1 - xray)} />)}
      <rect x={-1500} y={GY} width={5000} height={16} fill="#b07a4a" opacity={1 - xray} />
      {xray > 0 ? <g opacity={xray}><Under f={f} /></g> : null}
      {kind === "bath" ? <BathSet /> : null}
      <Door x={2050} handle={handle} />
      {kind === "bed" ? <><Bed x={250} /><Nightstand x={900} /></> : kind === "kitchen" ? <KitchenSet /> : null}
      {children}
    </Layer>
  </svg>
);
export const Bed: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 40} y={GY - 330} width={36} height={330} rx={10} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    <rect x={x} y={GY - 170} width={560} height={110} rx={14} fill="#fff4f0" stroke={INK} strokeWidth={7} />
    <rect x={x + 180} y={GY - 186} width={400} height={86} rx={22} fill="#ff6fb5" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${x + 230 + i * 110} ${GY - 182} L ${x + 230 + i * 110} ${GY - 104}`} stroke="#d84a90" strokeWidth={8} />)}
    <rect x={x + 10} y={GY - 210} width={150} height={60} rx={26} fill="#ffffff" stroke={INK} strokeWidth={7} />
    <rect x={x} y={GY - 60} width={560} height={30} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    {[x + 20, x + 520].map((k) => <rect key={k} x={k} y={GY - 30} width={24} height={30} fill="#8a4a2a" stroke={INK} strokeWidth={5} />)}
  </g>
);
export const Nightstand: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 80} y={GY - 180} width={160} height={180} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    <rect x={x - 62} y={GY - 140} width={124} height={50} rx={6} fill="#a85a3a" stroke={INK} strokeWidth={5} />
    <circle cx={x} cy={GY - 115} r={7} fill={YEL} stroke={INK} strokeWidth={3} />
  </g>
);
export const Clock: React.FC<{ x: number; y: number; f: number; ring?: boolean; s?: number }> = ({ x, y, f, ring, s = 1 }) => {
  const sh = ring ? Math.sin(f * 2.2) * 7 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sh})`}>
      {[-1, 1].map((k) => <circle key={k} cx={k * 40} cy={-112} r={22} fill={YEL} stroke={INK} strokeWidth={5} />)}
      {[-1, 1].map((k) => <path key={"l" + k} d={`M ${k * 34} -10 L ${k * 46} 6`} stroke={INK} strokeWidth={8} strokeLinecap="round" />)}
      <circle cx={0} cy={-58} r={62} fill="#ff4a6a" stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-58} r={44} fill="#fff6e0" stroke={INK} strokeWidth={5} />
      <path d="M 0 -58 L 0 -88 M 0 -58 L 22 -50" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {ring ? [-1, 1].map((k) => <path key={"r" + k} d={`M ${k * 86} -120 l ${k * 30} -20 M ${k * 92} -70 l ${k * 38} 0 M ${k * 86} -24 l ${k * 30} 16`} stroke={INK} strokeWidth={7} strokeLinecap="round" />) : null}
    </g>
  );
};
// осколки часов разлетаются; p — время после взрыва в кадрах
export const Shards: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <g>
    <Glow x={x} y={y} r={260 * Math.min(1, p / 4) * Math.max(0, 1 - p / 30)} g="gY" />
    {Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + i, v = 14 + (i % 5) * 5;
      const px = x + Math.cos(a) * v * p, py = y + Math.sin(a) * v * p * 0.8 + 0.5 * 1.1 * p * p;
      const c = ["#ff4a6a", "#fff6e0", YEL, "#c8b8e8"][i % 4];
      return <rect key={i} x={px - 10} y={py - 7} width={20 + (i % 3) * 8} height={14} fill={c} stroke={INK} strokeWidth={4} transform={`rotate(${p * (i % 2 ? 18 : -14)} ${px} ${py})`} />;
    })}
    {Array.from({ length: 4 }, (_, i) => { const a = i * 1.7; const px = x + Math.cos(a) * 9 * p, py = y - 10 * p + 0.6 * p * p; return <g key={"s" + i} transform={`translate(${px} ${py}) rotate(${p * 20})`}><circle r={16} fill="none" stroke={INK} strokeWidth={5} /><path d="M -16 0 L 16 0 M 0 -16 L 0 16" stroke={INK} strokeWidth={4} /></g>; })}
  </g>
);
// под полом в рентгене: трубы, провода, мыши
export const Under: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-1500} y={GY} width={5000} height={700} fill="url(#xr)" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M ${-1500 + i * 220} ${GY} L ${-1500 + i * 220} ${GY + 700}`} stroke="#5ae0ff" strokeWidth={2} opacity={0.35} />)}
    <path d={`M -1500 ${GY + 70} L 3500 ${GY + 70}`} stroke="#5ae0ff" strokeWidth={4} opacity={0.6} />
    {/* трубы */}
    <path d={`M -1400 ${GY + 150} L 600 ${GY + 150} Q 680 ${GY + 150} 680 ${GY + 230} L 680 ${GY + 400}`} stroke="#bff4ff" strokeWidth={34} fill="none" />
    <path d={`M -1400 ${GY + 150} L 600 ${GY + 150} Q 680 ${GY + 150} 680 ${GY + 230} L 680 ${GY + 400}`} stroke="#1a6aa8" strokeWidth={20} fill="none" />
    {Array.from({ length: 8 }, (_, i) => { const t = ((f * 6 + i * 250) % 2000); return <circle key={i} cx={-1400 + t} cy={GY + 150} r={6} fill="#bff4ff" />; })}
    <path d={`M 900 ${GY + 120} L 2600 ${GY + 120}`} stroke="#bff4ff" strokeWidth={26} />
    <path d={`M 900 ${GY + 120} L 2600 ${GY + 120}`} stroke="#d84a6a" strokeWidth={14} />
    {/* провода */}
    {["#ffd23c", "#ff6fb5", "#5ae0ff"].map((c, i) => <path key={c} d={`M -1400 ${GY + 260 + i * 22} Q 0 ${GY + 320 + i * 22} 400 ${GY + 260 + i * 22} T 2600 ${GY + 270 + i * 22}`} stroke={c} strokeWidth={9} fill="none" opacity={0.9} />)}
    {Array.from({ length: 6 }, (_, i) => { const t = ((f * 12 + i * 400) % 4000); return <Glow key={i} x={-1400 + t} y={GY + 282} r={30} g="gY" />; })}
    {/* мыши */}
    {[0, 1, 2].map((i) => <Mouse key={i} x={1500 + i * 120 + Math.sin(f * 0.2 + i) * 10} y={GY + 520} s={1 - i * 0.2} f={f + i * 5} />)}
    <rect x={1380} y={GY + 540} width={400} height={30} rx={10} fill="#bff4ff" opacity={0.35} />
  </g>
);
export const Mouse: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -50 10 Q -110 ${10 + Math.sin(f * 0.3) * 20} -140 -10`} stroke="#ffb0d0" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={56} ry={36} fill="#c8c0e0" stroke={INK} strokeWidth={6} />
    <circle cx={40} cy={-34} r={20} fill="#ffb0d0" stroke={INK} strokeWidth={5} />
    <circle cx={52} cy={-6} r={7} fill={INK} /><circle cx={78} cy={8} r={8} fill="#ff6fb5" stroke={INK} strokeWidth={3} />
  </g>
);

// ---------- эффекты сил ----------
export const Aura: React.FC<{ x: number; y: number; f: number; r?: number; o?: number }> = ({ x, y, f, r = 300, o = 1 }) => (
  <g opacity={o}>
    <Glow x={x} y={y} r={r * (1 + 0.06 * Math.sin(f * 0.3))} g="gV" />
    <Glow x={x} y={y} r={r * 0.6} g="gY" o={0.6} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + f * 0.04, rr = r * (0.7 + 0.15 * Math.sin(f * 0.2 + i));
      return <path key={i} transform={`translate(${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}) scale(${0.6 + 0.4 * Math.sin(f * 0.3 + i)})`} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={i % 2 ? YEL : "#fff6f0"} stroke={INK} strokeWidth={3} />;
    })}
  </g>
);
export const SpeedLines: React.FC<{ f: number; n?: number; o?: number; c?: string }> = ({ f, n = 26, o = 0.8, c = "#fff6f0" }) => (
  <g opacity={o}>{Array.from({ length: n }, (_, i) => {
    const y = (i * 97) % 1080, x = 1920 - ((f * 90 + i * 337) % 2600);
    return <rect key={i} x={x} y={y} width={300 + (i % 4) * 120} height={8 + (i % 3) * 4} rx={6} fill={c} />;
  })}</g>
);
export const SoundRings: React.FC<{ x: number; y: number; f: number; c?: string; n?: number }> = ({ x, y, f, c = "#5ae0ff", n = 4 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const t = ((f * 0.04 + i / n) % 1); return <circle key={i} cx={x} cy={y} r={40 + t * 360} fill="none" stroke={c} strokeWidth={10 * (1 - t) + 2} opacity={1 - t} />; })}</g>
);
// облачко мысли с значком (без текста)
export const Thought: React.FC<{ x: number; y: number; s?: number; icon: "clock" | "lock" | "heart" | "bolt"; p?: number }> = ({ x, y, s = 1, icon, p = 1 }) => {
  const k = s * Math.min(1, p);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle cx={-90} cy={150} r={14} fill="#fff6f0" stroke={INK} strokeWidth={5} /><circle cx={-60} cy={110} r={22} fill="#fff6f0" stroke={INK} strokeWidth={5} />
      <path d="M -120 40 Q -150 -20 -90 -40 Q -80 -100 -10 -90 Q 50 -120 90 -70 Q 150 -60 130 10 Q 150 70 80 80 Q 20 100 -40 80 Q -130 90 -120 40 Z" fill="#fff6f0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <Glow x={0} y={0} r={160} g="gC" o={0.5} />
      {icon === "clock" ? <g><circle cx={0} cy={0} r={44} fill="#ff4a6a" stroke={INK} strokeWidth={6} /><circle cx={0} cy={0} r={30} fill="#fff6e0" stroke={INK} strokeWidth={4} /><path d="M 0 0 L 0 -20 M 0 0 L 16 6" stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>
        : icon === "lock" ? <g><path d="M -24 -10 L -24 -34 Q -24 -60 0 -60 Q 24 -60 24 -34 L 24 -10" stroke={INK} strokeWidth={10} fill="none" /><rect x={-40} y={-12} width={80} height={60} rx={10} fill={YEL} stroke={INK} strokeWidth={6} /><circle cx={0} cy={14} r={8} fill={INK} /><text x={56} y={30} fontSize={0}> </text></g>
        : icon === "heart" ? <path d="M 0 40 L -44 -4 Q -60 -40 -26 -50 Q 0 -54 0 -24 Q 0 -54 26 -50 Q 60 -40 44 -4 Z" fill="#ff4a6a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        : <path d="M 10 -60 L -30 6 L 0 6 L -12 60 L 34 -12 L 4 -12 Z" fill={YEL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
    </g>
  );
};
export const Toothbrush: React.FC = () => (
  <g><rect x={-8} y={-110} width={16} height={110} rx={6} fill="#5ad8c8" stroke={INK} strokeWidth={4} /><rect x={-14} y={-140} width={28} height={34} rx={6} fill="#fff" stroke={INK} strokeWidth={4} /></g>
);
export const Dog: React.FC<{ x: number; y: number; f: number; bark?: boolean; flip?: boolean; s?: number; c?: string }> = ({ x, y, f, bark, flip, s = 1, c = "#e8a050" }) => {
  const b = bark ? Math.max(0, Math.sin(f * 0.45)) : 0; // открытая пасть
  const wag = Math.sin(f * 0.6) * 14;
  const leg = (lx: number, back: boolean, ph: number) => (
    <g key={lx}>
      <path d={`M ${lx} -70 L ${lx + Math.sin(f * 0.1 + ph) * 2} -8`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d={`M ${lx} -70 L ${lx + Math.sin(f * 0.1 + ph) * 2} -8`} stroke={back ? "#c8803a" : c} strokeWidth={18} strokeLinecap="round" />
      <ellipse cx={lx + 10} cy={-4} rx={22} ry={11} fill="#fff0e0" stroke={INK} strokeWidth={5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={140} ry={16} fill="rgba(40,30,90,0.35)" />
      {leg(-80, true, 0)}{leg(60, true, 1)}
      {/* хвост */}
      <g transform={`translate(-112 -110) rotate(${-30 + wag})`}>
        <path d="M 0 0 Q -20 -50 -6 -96" stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M 0 0 Q -20 -50 -6 -96" stroke={c} strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
      {/* тело */}
      <path d="M -125 -120 Q -130 -165 -80 -165 L 70 -165 Q 125 -165 125 -110 Q 125 -62 80 -60 L -80 -60 Q -128 -62 -125 -120 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 60 -150 Q 110 -140 104 -90 Q 92 -66 64 -66 Q 40 -100 60 -150 Z" fill="#fff0e0" />
      <ellipse cx={-30} cy={-140} rx={34} ry={18} fill="#c8803a" />
      {leg(-50, false, 2)}{leg(90, false, 3)}
      {/* голова */}
      <g transform={`translate(120 -185) rotate(${-b * 10})`}>
        <path d="M -10 -10 Q 20 -110 -20 -120 Q -40 -60 -40 -20 Z" fill="#8a4a2a" stroke={INK} strokeWidth={6} strokeLinejoin="round" transform="translate(-24 4)" />
        <ellipse cx={0} cy={-40} rx={66} ry={60} fill={c} stroke={INK} strokeWidth={7} />
        {/* морда */}
        <path d={`M 30 -46 Q 110 -50 112 -18 Q 112 0 80 2 L 30 2 Z`} fill="#fff0e0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M 34 6 Q 70 ${14 + b * 34} 100 ${6 + b * 18} L 100 4 L 34 4 Z`} fill="#fff0e0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {b > 0.2 ? <path d={`M 50 8 Q 70 ${12 + b * 30} 88 8 Z`} fill="#d84a6a" stroke={INK} strokeWidth={4} /> : null}
        <ellipse cx={110} cy={-30} rx={15} ry={12} fill={INK} /><circle cx={106} cy={-34} r={4} fill="#fff" />
        <circle cx={22} cy={-58} r={10} fill={INK} /><circle cx={25} cy={-61} r={3.5} fill="#fff" />
        <path d={`M 8 -80 Q 22 ${-90 - b * 6} 36 -80`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* висячее ухо */}
        <path d={`M -40 -86 Q -10 -96 -6 -70 Q -10 -20 -38 ${-6 + Math.sin(f * 0.3) * 4} Q -60 -40 -40 -86 Z`} fill="#8a4a2a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* ошейник */}
        <path d="M -44 4 Q 0 24 40 8" stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d="M -44 4 Q 0 24 40 8" stroke="#ff4a6a" strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={0} cy={28} r={11} fill={YEL} stroke={INK} strokeWidth={4} />
      </g>
      {b > 0.3 ? [0, 1, 2].map((i) => <path key={i} d={`M ${260 + i * 8} ${-240 + i * 40} l 46 ${-18 + i * 18}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />) : null}
    </g>
  );
};

// ---------- предметы части 2 ----------
export const Door: React.FC<{ x: number; handle?: boolean }> = ({ x, handle = true }) => (
  <g>
    <rect x={x - 16} y={GY - 600} width={292} height={600} fill="#fff0f8" stroke={INK} strokeWidth={7} />
    <rect x={x} y={GY - 584} width={260} height={584} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    <rect x={x + 30} y={GY - 550} width={200} height={220} rx={10} fill="#a85a3a" stroke={INK} strokeWidth={5} />
    <rect x={x + 30} y={GY - 300} width={200} height={260} rx={10} fill="#a85a3a" stroke={INK} strokeWidth={5} />
    <rect x={x + 6} y={GY - 236} width={30} height={60} rx={8} fill="#8a8aa8" stroke={INK} strokeWidth={5} />
    {handle ? <DoorHandle x={x + 22} y={GY - 206} /> : <circle cx={x + 22} cy={GY - 206} r={8} fill={INK} />}
  </g>
);
export const DoorHandle: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><circle r={16} fill={YEL} stroke={INK} strokeWidth={5} /><rect x={-4} y={-12} width={70} height={22} rx={11} fill={YEL} stroke={INK} strokeWidth={5} /></g>
);
export const Sink: React.FC<{ x: number; crack?: number }> = ({ x, crack = 0 }) => (
  <g transform={`translate(${x} ${GY}) scale(0.65) translate(${-x} ${-GY})`}>
    <rect x={x - 26} y={GY - 300} width={52} height={300} fill="#fff4f0" stroke={INK} strokeWidth={7} />
    <g transform={`rotate(${-crack * 8} ${x - 10} ${GY - 300})`}><path d={`M ${x - 170} ${GY - 330} L ${x} ${GY - 330} L ${x} ${GY - 250} Q ${x - 140} ${GY - 250} ${x - 170} ${GY - 300} Z`} fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" /></g>
    <g transform={`rotate(${crack * 8} ${x + 10} ${GY - 300})`}><path d={`M ${x} ${GY - 330} L ${x + 170} ${GY - 330} Q ${x + 140} ${GY - 250} ${x} ${GY - 250} Z`} fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" /></g>
    {crack > 0 ? <path d={`M ${x} ${GY - 332} l -8 20 l 12 18 l -10 22 l 8 22`} stroke={INK} strokeWidth={5} fill="none" /> : null}
    <path d={`M ${x + 40} ${GY - 330} L ${x + 40} ${GY - 380} L ${x - 10} ${GY - 380}`} stroke="#b8b4d0" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d={`M ${x + 40} ${GY - 330} L ${x + 40} ${GY - 380} L ${x - 10} ${GY - 380}`} stroke={INK} strokeWidth={3} fill="none" />
    <rect x={x - 130} y={GY - 640} width={260} height={220} rx={110} fill="#bff4ff" stroke={INK} strokeWidth={8} />
    <path d={`M ${x - 70} ${GY - 590} L ${x - 20} ${GY - 620} M ${x - 80} ${GY - 550} L ${x + 10} ${GY - 600}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
  </g>
);
export const BathSet: React.FC = () => (
  <g>
    <rect x={-700} y={GY - 260} width={600} height={260} rx={40} fill="#ffffff" stroke={INK} strokeWidth={8} />
    <rect x={-680} y={GY - 240} width={560} height={30} rx={14} fill="#8ae8dc" stroke={INK} strokeWidth={5} />
  </g>
);
export const KitchenSet: React.FC = () => (
  <g>
    {/* шкафчики и столешница */}
    <rect x={-700} y={GY - 300} width={1200} height={300} fill="#ff8fb0" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3].map((i) => <g key={i}><rect x={-680 + i * 295} y={GY - 270} width={270} height={250} rx={8} fill="#ff9ac0" stroke={INK} strokeWidth={5} /><rect x={-560 + i * 295} y={GY - 200} width={30} height={10} rx={5} fill={INK} /></g>)}
    <rect x={-720} y={GY - 320} width={1240} height={30} fill="#fff4f0" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => <rect key={"u" + i} x={-680 + i * 380} y={CEIL + 140} width={340} height={200} rx={8} fill="#ff9ac0" stroke={INK} strokeWidth={6} />)}
    {/* холодильник */}
    <rect x={540} y={GY - 640} width={240} height={640} rx={20} fill="#9fdcff" stroke={INK} strokeWidth={7} />
    <path d={`M 540 ${GY - 420} L 780 ${GY - 420}`} stroke={INK} strokeWidth={6} />
    <rect x={740} y={GY - 560} width={16} height={90} rx={8} fill="#fff" stroke={INK} strokeWidth={4} /><rect x={740} y={GY - 380} width={16} height={120} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />
    {/* стол */}
    <rect x={950} y={GY - 250} width={440} height={30} rx={10} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    {[980, 1340].map((k) => <rect key={k} x={k} y={GY - 222} width={24} height={222} fill="#a85a3a" stroke={INK} strokeWidth={5} />)}
  </g>
);
export const Bowl: React.FC<{ x: number; y: number; full?: number }> = ({ x, y, full = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {full > 0 ? <ellipse cx={0} cy={-34} rx={66} ry={14 + full * 10} fill="#ffd27a" stroke={INK} strokeWidth={4} /> : null}
    {full > 0 ? [-30, -5, 20, 40].map((k, i) => <circle key={k} cx={k} cy={-40 - full * 10 + (i % 2) * 6} r={9} fill="#f0a040" stroke={INK} strokeWidth={3} />) : null}
    <path d="M -76 -36 Q -70 10 0 12 Q 70 10 76 -36 Z" fill="#5ad8c8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
export const CerealBox: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-50} y={-170} width={100} height={170} fill="#ff6a5a" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-100} r={30} fill={YEL} stroke={INK} strokeWidth={5} /><rect x={-36} y={-150} width={72} height={18} rx={6} fill="#fff4f0" stroke={INK} strokeWidth={4} />
  </g>
);
export const MilkCarton: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-40} y={-140} width={80} height={140} fill="#ffffff" stroke={INK} strokeWidth={6} />
    <path d="M -40 -140 L 0 -180 L 40 -140 Z" fill="#9fdcff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-40} y={-90} width={80} height={40} fill="#7ab8ff" />
  </g>
);
export const MilkSpray: React.FC<{ x: number; y: number; p: number; dir?: number }> = ({ x, y, p, dir = 1 }) => (
  <g>{Array.from({ length: 34 }, (_, i) => {
    const t = Math.min(1, Math.max(0, p - i * 0.6) / 14);
    if (t <= 0) return null;
    const ang = -0.25 + (i % 7) * 0.08, v = 900 + (i % 5) * 160;
    return <ellipse key={i} cx={x + dir * Math.cos(ang) * v * t} cy={y + Math.sin(ang) * v * t + 500 * t * t} rx={22 + (i % 3) * 8} ry={14} fill="#ffffff" stroke={INK} strokeWidth={4} />;
  })}</g>
);
export const Phone: React.FC<{ crack?: boolean; on?: boolean; rot?: number }> = ({ crack, on = true, rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <rect x={-32} y={-60} width={64} height={120} rx={12} fill="#262838" stroke={INK} strokeWidth={5} />
    <rect x={-24} y={-48} width={48} height={92} rx={4} fill={on && !crack ? "#5ae0ff" : "#1a1a3a"} />
    {on && !crack ? <><rect x={-16} y={-36} width={32} height={10} rx={4} fill="#fff" opacity={0.8} /><circle cx={0} cy={10} r={12} fill="#ff6fb5" /></> : null}
    {crack ? <path d="M -24 -30 L -4 -6 L -18 10 L 6 24 L -6 44 M -4 -6 L 20 -20 M 6 24 L 24 30" stroke="#ffffff" strokeWidth={4} fill="none" /> : null}
  </g>
);
export const Puff: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 || p > 1 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - p}>{Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 120 * p} cy={Math.sin(a) * 80 * p} r={30 + 30 * p} fill="#f0e8ff" stroke={INK} strokeWidth={5} />; })}</g>
);
export const Car: React.FC<{ x: number; y: number; s?: number; c: string; rot?: number; flip?: boolean; lights?: boolean }> = ({ x, y, s = 1, c, rot = 0, flip, lights = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={2} rx={170} ry={14} fill="rgba(10,6,30,0.45)" />
    <path d="M -155 -30 L -155 -72 Q -150 -88 -122 -90 L -72 -92 Q -40 -142 10 -142 L 60 -142 Q 92 -140 112 -98 L 140 -92 Q 158 -88 158 -70 L 158 -30 Z" fill={c} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d="M -58 -94 Q -32 -130 6 -130 L 6 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 20 -130 L 56 -130 Q 80 -128 96 -94 L 20 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -150 -58 L 154 -58" stroke={INK} strokeWidth={4} opacity={0.5} />
    <rect x={142} y={-80} width={18} height={14} rx={5} fill="#fff2c0" stroke={INK} strokeWidth={4} />
    <rect x={-160} y={-80} width={14} height={14} rx={4} fill="#ff3a4a" stroke={INK} strokeWidth={4} />
    {lights ? <><Glow x={152} y={-73} r={60} g="gW" /><Glow x={-154} y={-73} r={45} g="gR" /></> : null}
    {[-95, 95].map((k) => <g key={k}><circle cx={k} cy={-28} r={30} fill="#1c1a2a" stroke={INK} strokeWidth={6} /><circle cx={k} cy={-28} r={12} fill="#b8b4d0" /></g>)}
  </g>
);
export const Gull: React.FC<{ x: number; y: number; f: number; s?: number; cry?: boolean; fly?: boolean }> = ({ x, y, f, s = 1, cry, fly }) => {
  const w = fly ? Math.sin(f * 0.5) * 30 : 0, o = cry ? 0.5 + 0.5 * Math.sin(f * 0.8) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {!fly ? [-14, 14].map((k) => <path key={k} d={`M ${k} -10 L ${k} 30`} stroke="#ffb040" strokeWidth={8} strokeLinecap="round" />) : null}
      <ellipse cx={0} cy={-50} rx={70} ry={44} fill="#ffffff" stroke={INK} strokeWidth={6} />
      <path d={`M -30 -60 Q -100 ${-90 - w} -150 ${-60 - w * 2} Q -90 -40 -30 -40 Z`} fill="#c8c8e0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={60} cy={-100} r={36} fill="#ffffff" stroke={INK} strokeWidth={6} />
      <circle cx={70} cy={-108} r={6} fill={INK} />
      <path d={`M 90 -100 L 140 ${-104 - o * 10} L 92 -90 Z`} fill="#ffb040" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M 90 -92 L 136 ${-80 + o * 16} L 92 -86 Z`} fill="#ffb040" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};
// скелет «рентгеном» (рост как у Bean при s)
export const Skeleton: React.FC<{ x: number; y: number; s?: number; f: number; a?: number }> = ({ x, y, s = 1, f, a = 0 }) => {
  const p = Math.sin(f * 0.25 + a);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}><Glow x={0} y={-250} r={260} g="gC" o={0.35} />
    <g stroke="#e8fbff" strokeLinecap="round" fill="none">
      <path d={`M -20 -170 L ${-20 + p * 40} 0 M 20 -170 L ${20 - p * 40} 0`} strokeWidth={14} />
      <path d="M -50 -170 Q 0 -150 50 -170" strokeWidth={14} />
      <path d="M 0 -170 L 0 -330" strokeWidth={14} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M -50 ${-310 + i * 30} Q 0 ${-290 + i * 30} 50 ${-310 + i * 30}`} strokeWidth={9} />)}
      <path d={`M -56 -320 L ${-90 - p * 20} -200 M 56 -320 L ${90 + p * 20} -200`} strokeWidth={12} />
      <circle cx={0} cy={-420} r={78} fill="#e8fbff" stroke="none" />
      <circle cx={-26} cy={-430} r={20} fill="#0a2a5a" stroke="none" /><circle cx={26} cy={-430} r={20} fill="#0a2a5a" stroke="none" />
      <path d="M -24 -376 L 24 -376" stroke="#0a2a5a" strokeWidth={8} />
    </g></g>
  );
};
export const TV: React.FC<{ x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-30} y={0} width={60} height={60} fill="#3a2a6a" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={56} width={300} height={24} rx={10} fill="#3a2a6a" stroke={INK} strokeWidth={6} />
    <rect x={-300} y={-360} width={600} height={370} rx={22} fill="#262838" stroke={INK} strokeWidth={8} />
    <clipPath id="tvclip"><rect x={-276} y={-336} width={552} height={322} rx={10} /></clipPath>
    <g clipPath="url(#tvclip)"><rect x={-276} y={-336} width={552} height={322} fill="#3a4ab8" />{children}</g>
    <Glow x={0} y={-170} r={420} g="gC" o={0.35} />
  </g>
);
export const Bubble: React.FC<{ x: number; y: number; r?: number; f: number }> = ({ x, y, r = 60, f }) => (
  <g><circle cx={x} cy={y} r={r * (1 + 0.03 * Math.sin(f * 0.3))} fill="#bff4ff" fillOpacity={0.25} stroke="#ffffff" strokeWidth={5} />
    <path d={`M ${x - r * 0.5} ${y - r * 0.3} Q ${x - r * 0.4} ${y - r * 0.6} ${x - r * 0.1} ${y - r * 0.65}`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" />
    <Glow x={x} y={y} r={r * 1.6} g="gP" o={0.3} /></g>
);

// ---------- полёт (часть 3) ----------
// герой летит вправо, «как супергерой»: cx, cy — центр тела
export const FlyHero: React.FC<{ cx: number; cy: number; s?: number; f: number; expr?: any; open?: number; look?: BeanLook; sweat?: boolean; arms?: "fwd" | "both" | "back"; left?: boolean }> = ({ cx, cy, s = HS, f, expr = "grin", open = 0, look = HERO2D, sweat, arms = "fwd", left }) => {
  const w = Math.sin(f * 0.15) * 4;
  const pose: BeanPose = { armR: arms === "back" ? [20, 0] : [175, 0], armL: arms === "both" ? [175, 0] : [25, 5], legL: 4 + Math.sin(f * 0.3) * 4, legR: -4 - Math.sin(f * 0.3) * 4 };
  return <g transform={`translate(${cx} ${cy + w}) scale(${left ? -1 : 1} 1)`}><Bean x={-250 * s} y={0} s={s} look={look} expr={expr} open={open} f={f} lying flip shadow={false} sweat={sweat} pose={pose} /></g>;
};
// небо на высоте alt (0 — над морем на закате, 1 — у самолётов), облака летят навстречу со скоростью sp
export const Sky: React.FC<{ cam: Cam; f: number; alt?: number; sp?: number; children?: React.ReactNode; sea?: boolean }> = ({ cam, f, alt = 0, sp = 6, children, sea = true }) => {
  const r = rand(5); const CL = Array.from({ length: 14 }, () => ({ x: r() * 5000, y: r() * 1100 - 100, w: 0.6 + r() * 1.2, d: r() < 0.5 ? 0.5 : 1.3 }));
  const wrap = (x: number) => ((x % 5000) + 5000) % 5000 - 1500;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <Layer cam={cam} d={0.05}>
        <rect x={-3000} y={-2500} width={9000} height={3200} fill="url(#skyS)" /><rect x={-3000} y={690} width={9000} height={2000} fill="#ffd88a" />
        <rect x={-3000} y={-2500} width={9000} height={3200} fill="url(#skyMid)" opacity={Math.min(1, alt * 2)} />
        <rect x={-3000} y={-2500} width={9000} height={3200} fill="url(#skyHi)" opacity={Math.max(0, alt * 2 - 1)} />
        {alt > 0.5 ? Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 397) % 2400 - 200} cy={(i * 211) % 700} r={3} fill="#fff" opacity={(alt - 0.5) * 1.6} />) : null}
        <Sun x={1500} y={620 + alt * 300} r={110} />
      </Layer>
      {sea ? <Layer cam={cam} d={0.3}>
        <g transform={`translate(0 ${alt * 900})`}>
          <rect x={-3000} y={760} width={9000} height={1400} fill="url(#sea)" />
          <path d="M -3000 760 L 6000 760" stroke={INK} strokeWidth={6} />
          <Waves y0={790} y1={1300} f={f * sp * 0.5} />
          {alt < 0.3 ? <path d="M -2600 762 Q -1800 640 -900 700 Q -300 650 100 762 Z" fill="#6a3aa8" stroke={INK} strokeWidth={6} /> : null}
        </g>
      </Layer> : null}
      <Layer cam={cam} d={0.6} blur={2}>{CL.filter((c) => c.d < 1).map((c, i) => <Cloud key={i} x={wrap(c.x - f * sp * 0.6)} y={c.y + alt * 200} w={c.w} />)}</Layer>
      <Layer cam={cam} d={1}>{children}</Layer>
      <Layer cam={cam} d={1.3} blur={4}>{CL.filter((c) => c.d > 1).slice(0, 4).map((c, i) => <Cloud key={i} x={wrap(c.x - f * sp * 1.6)} y={i % 2 ? -60 + c.y * 0.1 : 1060 + c.y * 0.1} w={c.w} />)}</Layer>
    </svg>
  );
};
export const Jet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -380 -20 Q -380 -70 -300 -70 L 330 -70 Q 420 -66 440 -20 Q 420 26 330 30 L -300 30 Q -380 30 -380 -20 Z" fill="#f4f2ff" stroke={INK} strokeWidth={8} />
    <path d="M -300 -70 L -360 -190 L -280 -190 L -200 -70 Z" fill="#ff6fb5" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -40 10 L -200 160 L -100 160 L 100 10 Z" fill="#c8c0e8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-220 + i * 44} cy={-30} r={11} fill="#9fdcff" stroke={INK} strokeWidth={4} />)}
    <path d="M 360 -50 Q 400 -48 418 -24 L 360 -24 Z" fill="#5ae0ff" stroke={INK} strokeWidth={5} />
    <rect x={-120} y={30} width={110} height={44} rx={22} fill="#b8b4d0" stroke={INK} strokeWidth={6} />
  </g>
);
export const Thermo: React.FC<{ x: number; y: number; v: number; s?: number }> = ({ x, y, v, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-300} width={60} height={300} rx={30} fill="#fff4f0" stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={20} r={50} fill={v > 0.4 ? "#ff4a6a" : "#5ae0ff"} stroke={INK} strokeWidth={7} />
    <rect x={-14} y={-280 * v} width={28} height={280 * v + 20} rx={14} fill={v > 0.4 ? "#ff4a6a" : "#5ae0ff"} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M 30 ${-60 - i * 50} L 52 ${-60 - i * 50}`} stroke={INK} strokeWidth={5} />)}
  </g>
);
export const Egg: React.FC = () => <g><ellipse cx={0} cy={-40} rx={32} ry={42} fill="#fff8ec" stroke={INK} strokeWidth={6} /><ellipse cx={-10} cy={-56} rx={8} ry={12} fill="#fff" /></g>;
export const Shield: React.FC<{ x: number; y: number; r: number; f: number; o?: number }> = ({ x, y, r, f, o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="#ffd860" fillOpacity={0.12} stroke={YEL} strokeWidth={8} />
    {Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2 + f * 0.02; return <path key={i} transform={`translate(${x + Math.cos(a) * r * 0.75} ${y + Math.sin(a) * r * 0.75}) rotate(${a * 57})`} d="M -26 0 L -13 -22 L 13 -22 L 26 0 L 13 22 L -13 22 Z" fill="none" stroke="#fff2c0" strokeWidth={4} opacity={0.4 + 0.4 * Math.sin(f * 0.2 + i)} />; })}
    <Glow x={x} y={y} r={r * 1.3} g="gY" o={0.5} />
  </g>
);
export const Frost: React.FC<{ o: number }> = ({ o }) => o <= 0 ? null : (
  <g opacity={o}>{Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2, R = 560 + (i % 3) * 40; const x = 960 + Math.cos(a) * R * 1.6, y = 540 + Math.sin(a) * R; return <g key={i} transform={`translate(${x} ${y}) rotate(${a * 57})`} stroke="#e8fbff" strokeWidth={6} strokeLinecap="round"><path d="M -40 0 L 40 0 M 0 -40 L 0 40 M -28 -28 L 28 28 M -28 28 L 28 -28" /></g>; })}
    <rect width={1920} height={1080} fill="#bff4ff" opacity={0.15} /></g>
);

// ---------- переход между частями: вспышка солнечного света ----------
export const Flare: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0) return null;
  const r = p * 1400;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs><radialGradient id="flr"><stop offset="0%" stopColor="#fffbe8" /><stop offset="55%" stopColor="#ffe9a0" /><stop offset="80%" stopColor="#ff9ac0" stopOpacity={0.8} /><stop offset="100%" stopColor="#ff6fb5" stopOpacity={0} /></radialGradient></defs>
      {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`translate(960 540) rotate(${i * 30 + p * 40})`} d={`M 0 -20 L ${r * 1.4} -${60 + r * 0.12} L ${r * 1.4} ${60 + r * 0.12} L 0 20 Z`} fill="#fff2c0" opacity={0.35 * Math.min(1, p * 2)} />)}
      <circle cx={960} cy={540} r={r} fill="url(#flr)" />
      <rect width={1920} height={1080} fill="#fffbe8" opacity={Math.max(0, (p - 0.7) / 0.3)} />
    </svg>
  );
};

// ---------- движок части ----------
export type Voice = { dur: number; words: { t: number; e: number; w: string; end: boolean; pause: boolean }[] };
export type Shot = { at: string; n?: number; s: (g: number, f: number, len: number) => React.ReactNode };
export const atWord = (V: Voice, w: string, n = 1) => {
  const x = V.words.filter((v) => v.w.toLowerCase() === w.toLowerCase())[n - 1];
  if (!x) throw new Error(`нет слова «${w}» №${n}`);
  return Math.round(x.t * FPS) + LEAD;
};
export const TRANS = 18;
export const partFrames = (V: Voice) => Math.round((V.dur + 0.3) * FPS) + LEAD + TRANS;
export const makePart = (V: Voice, shots: Shot[], o: { id: number; last?: boolean }) => {
  const FR = partFrames(V);
  const starts = shots.map((s, i) => (i === 0 ? 0 : atWord(V, s.at, s.n) - 3));
  const Comp: React.FC = () => {
    const f = useCurrentFrame();
    let i = 0; while (i + 1 < starts.length && f >= starts[i + 1]) i++;
    const end = i + 1 < starts.length ? starts[i + 1] : FR;
    const inP = o.id === 1 ? 0 : 1 - ip(f, [0, 16], [0, 1], Easing.out(Easing.cubic));
    const outP = o.last ? 0 : ip(f, [FR - TRANS, FR - 1], [0, 1], Easing.in(Easing.cubic));
    const fade = o.id === 1 ? ip(f, [0, 12], [1, 0]) : 0;
    const fadeOut = o.last ? ip(f, [FR - 20, FR - 1], [0, 1]) : 0;
    return (
      <AbsoluteFill style={{ background: "#1a0f4a" }}>
        {shots[i].s(f - starts[i], f, end - starts[i])}
        <Grade />
        <Flare p={Math.max(inP, outP)} />
        <AbsoluteFill style={{ background: "#07030f", opacity: Math.max(fade, fadeOut) }} />
        <Sequence from={LEAD}><Audio src={staticFile(`sp/p${o.id}/voice.mp3`)} /></Sequence>
        <Audio src={staticFile(`sp/p${o.id}/sfx.wav`)} volume={0.5} />
      </AbsoluteFill>
    );
  };
  return { FR, Comp, starts };
};
