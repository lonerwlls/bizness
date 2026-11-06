// «Что НА САМОМ ДЕЛЕ происходит, когда ты включаешь VPN?» — шортс 9:16 (1080×1920).
// Стиль — 10-секундный пример про слепоту (src/blind/blind.tsx, скилл flat-cartoon-video): обычный ночной город, плоская
// яркая 2D-мультяшка с толстым контуром, фиолетово-розовый свет, жёлтые окна, свечение, размытые дальние слои, параллакс.
// Озвучка Fish за кадром (русский, паузы между предложениями), склейки по словам, субтитры внизу.
import React from "react";
import { AbsoluteFill, Audio, Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bean, BeanDefs, BeanLook, BeanPose, HERO2D, NEIGHBOR_A, NEIGHBOR_B } from "../toontest/bean";
import { VOICE } from "./voices/p1";

export const W = 1080, H = 1920, FPS = 30, LEAD = 6;
type Word = { t: number; e: number; w: string; end: boolean; pause: boolean };
const V = VOICE as { dur: number; words: Word[] };
export const FRAMES = Math.round((V.dur + 1.2) * FPS) + LEAD;
const INK = "#16131f", YEL = "#ffd23c";

const fontH = delayRender("vpn fonts");
Promise.all(["latin", "cyrillic"].map((k) => new FontFace("VpnMont", `url(${staticFile(`towers/fonts/Montserrat-${k}.woff2`)}) format("woff2")`, { weight: "100 900" }).load()))
  .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontH); }).catch(() => continueRender(fontH));

const ip = (f: number, a: number[], b: number[], e = Easing.inOut(Easing.cubic)) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const at = (w: string, n = 1) => {
  const x = V.words.filter((v) => v.w.toLowerCase() === w.toLowerCase())[n - 1];
  if (!x) throw new Error(`нет слова «${w}» №${n}`);
  return Math.round(x.t * FPS) + LEAD;
};

const LOOKS: BeanLook[] = [
  NEIGHBOR_A, NEIGHBOR_B,
  { head: "#f8f6f0", body: "#5a7cf0", body2: "#3a56c0", limb: "#262838", shoe: "#ffffff", hair: "#2a1a14" },
  { head: "#f2e2c8", body: "#b45ad8", body2: "#8a3ab0", limb: "#262838", shoe: "#2a2a30", hat: "bowler", hatC: "#2a2a40", hatC2: "#ff6fb5" },
  { head: "#f8f6f0", body: "#3cc6d8", body2: "#2496a8", limb: "#262838", shoe: "#f4c430", hair: "#6a3a22" },
  { head: "#f2e2c8", body: "#f4c430", body2: "#c8961a", limb: "#262838", shoe: "#2a2a30", hat: "beanie", hatC: "#d8406a", hatC2: "#ffffff" },
  { head: "#f8f6f0", body: "#ff6f8f", body2: "#d04868", limb: "#262838", shoe: "#ffffff", hair: "#1e1a1a" },
];
const GUARD: BeanLook = { head: "#f2e2c8", body: "#2a3048", body2: "#ffd23c", limb: "#262838", shoe: "#1a1a22", hat: "bowler", hatC: "#1a1a22", hatC2: "#ffd23c" };

// ---------- камера с параллаксом (как в примере про слепоту), кадр 9:16 ----------
type Cam = { x: number; y: number; z: number; sx?: number; sy?: number; r?: number };
const REF = { x: 1800, y: 560 };
const Layer: React.FC<{ cam: Cam; d: number; blur?: number; children: React.ReactNode }> = ({ cam, d, blur, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const x = REF.x + (cam.x - REF.x) * d + (cam.sx ?? 0) * d, y = REF.y + (cam.y - REF.y) * d + (cam.sy ?? 0) * d;
  return <g transform={`translate(${W / 2} ${H / 2}) rotate(${(cam.r ?? 0) * d}) scale(${z}) translate(${-x} ${-y})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};
const lerpCam = (g: number, len: number, a: Cam, b: Cam, e = Easing.inOut(Easing.sin)): Cam => {
  const t = e(clamp01(g / Math.max(1, len)));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * t };
};

// ---------- город (из примера про слепоту) ----------
type Sky = "night" | "sunset";
const Defs: React.FC = () => (
  <defs>
    <BeanDefs />
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1a0f4a" /><stop offset="45%" stopColor="#5a2a9a" /><stop offset="75%" stopColor="#e0509a" /><stop offset="100%" stopColor="#ffa36a" />
    </linearGradient>
    <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3a1a7a" /><stop offset="40%" stopColor="#c8408a" /><stop offset="70%" stopColor="#ff8a5a" /><stop offset="100%" stopColor="#ffd27a" />
    </linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c2a6a" /><stop offset="100%" stopColor="#1c1a48" /></linearGradient>
    {([["gY", "#ffd860"], ["gP", "#ff5fb0"], ["gR", "#ff3a4a"], ["gC", "#5ae0ff"], ["gW", "#fff2c0"], ["gG", "#5aff9a"]] as const).map(([id, c]) => (
      <radialGradient key={id} id={id}><stop offset="0%" stopColor={c} stopOpacity={0.9} /><stop offset="40%" stopColor={c} stopOpacity={0.35} /><stop offset="100%" stopColor={c} stopOpacity={0} /></radialGradient>
    ))}
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff2c0" stopOpacity={0.7} /><stop offset="100%" stopColor="#fff2c0" stopOpacity={0} /></linearGradient>
    {[2, 4, 7].map((b) => <filter key={b} id={`blur${b}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={b} /></filter>)}
  </defs>
);
const Glow: React.FC<{ x: number; y: number; r: number; g: string; o?: number }> = ({ x, y, r, g, o = 1 }) => <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} style={{ mixBlendMode: "screen" }} />;

type Bld = { x: number; w: number; h: number; c: string; lit: boolean[]; sign?: number };
const makeBlds = (seed: number, x0: number, x1: number, hMin: number, hMax: number, cols: string[]): Bld[] => {
  const r = rand(seed); const out: Bld[] = [];
  for (let x = x0; x < x1;) {
    const w = 170 + r() * 190, h = hMin + r() * (hMax - hMin);
    out.push({ x, w, h, c: cols[Math.floor(r() * cols.length)], lit: Array.from({ length: 80 }, () => r() < 0.45), sign: r() < 0.4 ? Math.floor(r() * 3) : undefined });
    x += w + 8 + r() * 30;
  }
  return out;
};
const FAR = makeBlds(7, -1400, 5200, 520, 1100, ["#3a2a86", "#46309a", "#33267a"]);
const MID = makeBlds(19, -900, 4700, 360, 760, ["#5a3ac0", "#7a3aa8", "#3a4ab8", "#8a4a9a"]);
const FAR2 = makeBlds(31, -1400, 5200, 260, 520, ["#8a3a7a", "#a04a6a", "#7a3a8a"]);
const BASE = 705;

const Building: React.FC<{ b: Bld; f: number; win: number; far?: boolean; flick?: number }> = ({ b, f, win, far, flick = 0 }) => {
  const top = BASE - b.h, cols = Math.max(2, Math.floor((b.w - 30) / (win * 1.9))), rows = Math.floor((b.h - 60) / (win * 2.1));
  const gx = (b.w - cols * win) / (cols + 1);
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h + 40} fill={b.c} stroke={INK} strokeWidth={6} />
      <rect x={b.x + b.w - 16} y={top + 3} width={13} height={b.h + 34} fill="#ff6fb5" opacity={far ? 0.35 : 0.6} />
      <rect x={b.x - 6} y={top - 14} width={b.w + 12} height={18} fill={b.c} stroke={INK} strokeWidth={6} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols); let on = b.lit[i % 80];
        if (flick > 0) on = ((i * 7 + Math.floor(f / 3)) % 5) / 5 < 0.5 + 0.3 * Math.sin(f * 0.5 + i);
        return <rect key={i} x={b.x + gx + cx * (win + gx)} y={top + 40 + cy * win * 2.1} width={win} height={win * 1.3} rx={3} fill={on ? (flick > 0 && (i + Math.floor(f / 4)) % 3 === 0 ? "#5ae0ff" : YEL) : "#241a5a"} stroke={INK} strokeWidth={far ? 3 : 4} />;
      })}
      {b.sign !== undefined && !far ? (() => {
        const c = ["#ff5fb0", "#5ae0ff", YEL][b.sign]; const fl = b.sign === 1 && f % 47 < 3 ? 0.3 : 1;
        return <g opacity={fl}><Glow x={b.x + b.w / 2} y={top + 70} r={150} g={["gP", "gC", "gY"][b.sign]} o={0.8} />
          <rect x={b.x + 24} y={top + 40} width={b.w - 48} height={60} rx={22} fill="#1a1240" stroke={c} strokeWidth={9} />
          <rect x={b.x + 44} y={top + 62} width={(b.w - 88) * 0.7} height={16} rx={8} fill={c} /></g>;
      })() : null}
    </g>
  );
};
const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 7} y={y - 330} width={14} height={330} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <path d={`M ${x} ${y - 330} Q ${x} ${y - 370} ${x + 50} ${y - 368}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d={`M ${x} ${y - 330} Q ${x} ${y - 370} ${x + 50} ${y - 368}`} stroke="#2a2450" strokeWidth={7} fill="none" strokeLinecap="round" />
    <ellipse cx={x + 58} cy={y - 360} rx={30} ry={14} fill={YEL} stroke={INK} strokeWidth={5} />
    <path d={`M ${x + 30} ${y - 352} L ${x - 60} ${y} L ${x + 180} ${y} L ${x + 86} ${y - 352} Z`} fill="#ffd860" opacity={0.12} style={{ mixBlendMode: "screen" }} />
    <Glow x={x + 58} y={y - 360} r={130} g="gY" />
  </g>
);
const TrafficLight: React.FC<{ x: number; y: number; f: number; ph: number }> = ({ x, y, f, ph }) => {
  const green = Math.floor((f + ph) / 60) % 2 === 0;
  return (
    <g>
      <rect x={x - 8} y={y - 360} width={16} height={360} fill="#2a2450" stroke={INK} strokeWidth={5} />
      <rect x={x - 32} y={y - 500} width={64} height={156} rx={14} fill="#1c1838" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <circle key={i} cx={x} cy={y - 472 + i * 50} r={17} fill={i === 0 ? (green ? "#4a2a3a" : "#ff3a4a") : i === 1 ? "#4a4030" : green ? "#5aff9a" : "#24443a"} stroke={INK} strokeWidth={4} />)}
      {green ? <Glow x={x} y={y - 372} r={110} g="gG" /> : <Glow x={x} y={y - 472} r={110} g="gR" />}
    </g>
  );
};
const Car: React.FC<{ x: number; y: number; s?: number; c: string; rot?: number; flip?: boolean; lights?: boolean }> = ({ x, y, s = 1, c, rot = 0, flip, lights = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {lights ? <path d="M 150 -66 L 520 -130 L 520 20 Z" fill="url(#beam)" style={{ mixBlendMode: "screen" }} /> : null}
    <ellipse cx={0} cy={2} rx={170} ry={14} fill="rgba(10,6,30,0.45)" />
    <path d="M -155 -30 L -155 -72 Q -150 -88 -122 -90 L -72 -92 Q -40 -142 10 -142 L 60 -142 Q 92 -140 112 -98 L 140 -92 Q 158 -88 158 -70 L 158 -30 Z" fill={c} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d="M -58 -94 Q -32 -130 6 -130 L 6 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 20 -130 L 56 -130 Q 80 -128 96 -94 L 20 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={142} y={-80} width={18} height={14} rx={5} fill="#fff2c0" stroke={INK} strokeWidth={4} />
    <rect x={-160} y={-80} width={14} height={14} rx={4} fill="#ff3a4a" stroke={INK} strokeWidth={4} />
    {lights ? <><Glow x={152} y={-73} r={60} g="gW" /><Glow x={-154} y={-73} r={45} g="gR" /></> : null}
    {[-95, 95].map((k) => <g key={k}><circle cx={k} cy={-28} r={30} fill="#1c1a2a" stroke={INK} strokeWidth={6} /><circle cx={k} cy={-28} r={12} fill="#b8b4d0" /></g>)}
  </g>
);
const walkPose = (f: number, sp = 0.28, a = 0): BeanPose => {
  const p = Math.sin(f * sp + a);
  return { legL: 4 + p * 16, legR: 4 - p * 16, bob: Math.abs(p) * 7, lean: -2, armL: [12 + p * 18, 8], armR: [12 - p * 18, 8] };
};
type Npc = { x: number; y: number; s: number; look: number; a: number; vx: number };
const CROWD: Npc[] = [
  { x: 380, y: 760, s: 0.42, look: 0, a: 0, vx: 0.6 }, { x: 760, y: 790, s: 0.46, look: 3, a: 2, vx: -0.4 }, { x: 1020, y: 745, s: 0.4, look: 4, a: 4, vx: 0.5 },
  { x: 1500, y: 820, s: 0.5, look: 1, a: 1, vx: 0.8 }, { x: 1700, y: 770, s: 0.44, look: 5, a: 3, vx: -0.6 }, { x: 2050, y: 850, s: 0.52, look: 2, a: 5, vx: 0.4 },
  { x: 2950, y: 780, s: 0.45, look: 6, a: 2.5, vx: -0.5 }, { x: 3250, y: 830, s: 0.5, look: 0, a: 1.2, vx: 0.6 }, { x: 2400, y: 760, s: 0.42, look: 3, a: 3.3, vx: -0.3 },
];
const Crowd: React.FC<{ f: number }> = ({ f }) => (
  <g>{[...CROWD].sort((a, b) => a.y - b.y).map((n, i) => (
    <Bean key={i} x={n.x + f * n.vx} y={n.y} s={n.s} look={LOOKS[n.look]} expr={i % 3 === 0 ? "grin" : "neutral"} f={f + i * 9} flip={n.vx < 0} pose={walkPose(f, 0.22, n.a)} />
  ))}</g>
);

// ---------- новые предметы в том же стиле ----------
// телефон в руке: экран с большим переключателем VPN (on 0..1)
const Phone: React.FC<{ x: number; y: number; s?: number; on: number; f: number; screen?: "toggle" | "lock" | "web" }> = ({ x, y, s = 1, on, f, screen = "toggle" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={420} g={on > 0.5 ? "gG" : "gC"} o={0.55} />
    <rect x={-150} y={-300} width={300} height={600} rx={46} fill="#2a2450" stroke={INK} strokeWidth={10} />
    <rect x={-128} y={-268} width={256} height={536} rx={28} fill={on > 0.5 ? "#123a3a" : "#1a1440"} />
    <rect x={-40} y={-288} width={80} height={12} rx={6} fill={INK} />
    {screen === "toggle" ? <>
      <text x={0} y={-150} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={64} fill="#ffffff" stroke={INK} strokeWidth={10} paintOrder="stroke">VPN</text>
      <rect x={-90} y={-60} width={180} height={96} rx={48} fill={on > 0.5 ? "#3ad87a" : "#4a4466"} stroke={INK} strokeWidth={8} />
      <circle cx={-42 + 84 * on} cy={-12} r={38} fill="#ffffff" stroke={INK} strokeWidth={7} />
      <text x={0} y={130} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={44} fill={on > 0.5 ? "#5aff9a" : "#8a86b0"} stroke={INK} strokeWidth={8} paintOrder="stroke">{on > 0.5 ? "ВКЛ" : "ВЫКЛ"}</text>
      {on > 0.5 ? <g transform={`translate(0 200) rotate(${f * 4})`}>{[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={-6} y={-40} width={12} height={22} rx={6} fill="#5aff9a" transform={`rotate(${k * 60})`} opacity={0.4 + 0.6 * (k / 5)} />)}</g> : null}
    </> : screen === "lock" ? <ShieldLock x={0} y={0} s={1.3} /> : <>
      <rect x={-110} y={-240} width={220} height={40} rx={10} fill="#e8f4ff" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={-110} y={-170 + i * 120} width={220} height={96} rx={12} fill={["#ff8ab0", "#5ae0ff", YEL][i]} stroke={INK} strokeWidth={5} />)}
    </>}
  </g>
);
const ShieldLock: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#3ad87a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={190} g="gG" o={0.7} />
    <path d="M 0 -120 L 100 -80 L 92 30 Q 70 100 0 130 Q -70 100 -92 30 L -100 -80 Z" fill={c} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -26 -10 L -26 -34 Q -26 -62 0 -62 Q 26 -62 26 -34 L 26 -10" fill="none" stroke={INK} strokeWidth={14} />
    <rect x={-42} y={-12} width={84} height={70} rx={10} fill="#ffffff" stroke={INK} strokeWidth={8} />
    <rect x={-7} y={8} width={14} height={26} rx={7} fill={INK} />
  </g>
);
// пакет данных: открытый (видно содержимое) или зашифрованный (замок и «каша» символов)
const Packet: React.FC<{ x: number; y: number; s?: number; f: number; enc: number }> = ({ x, y, s = 1, f, enc }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.3 + x) * 6})`}>
    <Glow x={0} y={0} r={110} g={enc > 0.5 ? "gG" : "gY"} o={0.8} />
    <rect x={-56} y={-40} width={112} height={80} rx={10} fill={enc > 0.5 ? "#3ad87a" : YEL} stroke={INK} strokeWidth={7} />
    {enc > 0.5 ? <>
      <text x={0} y={12} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={34} fill={INK}>{["#@%&", "*$!?", "&%#@", "?!*$"][Math.floor(f / 4) % 4]}</text>
      <rect x={30} y={-58} width={34} height={30} rx={6} fill="#ffffff" stroke={INK} strokeWidth={5} />
    </> : <>
      <path d="M -56 -40 L 0 6 L 56 -40" fill="none" stroke={INK} strokeWidth={6} />
      <rect x={-30} y={14} width={60} height={8} rx={4} fill={INK} opacity={0.5} />
    </>}
  </g>
);
// здание-сервер VPN: высокая башня с антенной и зелёной вывеской-щитом
const ServerTower: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={-700} r={520} g="gG" o={0.5 + 0.2 * Math.sin(f * 0.15)} />
    <rect x={-160} y={-900} width={320} height={900} fill="#2a3a6a" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 16 }, (_, i) => <g key={i}>
      <rect x={-130} y={-860 + i * 52} width={260} height={38} fill="#1c2448" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-112 + k * 22} y={-848 + i * 52} width={12} height={12} fill={((i * 5 + k + Math.floor(f / 5)) % 7) < 4 ? ["#5aff9a", "#5ae0ff", YEL][k % 3] : "#141a30"} />)}
    </g>)}
    <rect x={-8} y={-1100} width={16} height={200} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-1110} r={18} fill="#ff3a4a" stroke={INK} strokeWidth={5} opacity={f % 30 < 15 ? 1 : 0.4} />
    {[1, 2, 3].map((k) => <circle key={k} cx={0} cy={-1110} r={30 + ((f * 2 + k * 30) % 90)} fill="none" stroke="#5aff9a" strokeWidth={6} opacity={1 - ((f * 2 + k * 30) % 90) / 90} />)}
    <ShieldLock x={0} y={-960} s={0.75} />
  </g>
);
// сайт: здание с витриной-«браузером» и охранником у двери
const SiteBuilding: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={-420} r={420} g="gP" o={0.5} />
    <rect x={-260} y={-700} width={520} height={700} fill="#c85a9a" stroke={INK} strokeWidth={9} />
    <rect x={-220} y={-650} width={440} height={300} rx={18} fill="#e8f4ff" stroke={INK} strokeWidth={8} />
    <rect x={-220} y={-650} width={440} height={46} rx={14} fill="#c8d4ea" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <circle key={i} cx={-190 + i * 30} cy={-627} r={9} fill={["#ff5a6a", "#ffd23c", "#5ac84a"][i]} stroke={INK} strokeWidth={3} />)}
    <rect x={-190} y={-580} width={380} height={70} rx={10} fill="#7a5ac8" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => <rect key={i} x={-190 + i * 130} y={-490} width={120} height={110} rx={10} fill={["#ff8ab0", "#5ae0ff", YEL][i]} stroke={INK} strokeWidth={5} opacity={0.6 + 0.4 * Math.sin(f * 0.1 + i)} />)}
    <rect x={-80} y={-260} width={160} height={260} rx={10} fill="#3a2858" stroke={INK} strokeWidth={8} />
    <circle cx={50} cy={-130} r={10} fill={YEL} stroke={INK} strokeWidth={4} />
  </g>
);
// бейдж с «IP-адресом»: цветной пропуск (оранжевый — твой, зелёный — сервера VPN)
const Badge: React.FC<{ x: number; y: number; s?: number; vpn: boolean; rot?: number }> = ({ x, y, s = 1, vpn, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-120} y={-80} width={240} height={160} rx={18} fill={vpn ? "#3ad87a" : "#f27a2a"} stroke={INK} strokeWidth={8} />
    <text x={0} y={-12} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={54} fill="#ffffff" stroke={INK} strokeWidth={9} paintOrder="stroke">IP</text>
    <rect x={-90} y={18} width={180} height={16} rx={8} fill={INK} opacity={0.6} />
    <rect x={-90} y={44} width={120} height={14} rx={7} fill={INK} opacity={0.4} />
    {vpn ? <ShieldLock x={92} y={-62} s={0.32} /> : null}
  </g>
);
// туннель: светящаяся труба по кривой (p — насколько проложена 0..1, pk — где пакет)
const Tunnel: React.FC<{ a: [number, number]; b: [number, number]; lift: number; p: number; f: number; w?: number; pk?: number; enc?: number; color?: string }> = ({ a, b, lift, p, f, w = 90, pk, enc = 1, color = "#3ad87a" }) => {
  const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - lift;
  const pt = (u: number): [number, number] => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
  const N = 48, n = Math.max(1, Math.round(N * clamp01(p)));
  const d = Array.from({ length: n + 1 }, (_, i) => pt(i / N)).map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const pp = pk !== undefined ? pt(clamp01(pk) * clamp01(p)) : null;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 20} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.85} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={w * 0.3} strokeLinecap="round" opacity={0.35} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={8} strokeDasharray="14 46" strokeDashoffset={-f * 7} opacity={0.9} />
      {Array.from({ length: Math.floor(n / 6) }, (_, i) => { const [x, y] = pt(((i + 1) * 6) / N); return <Glow key={i} x={x} y={y} r={w * 1.6} g="gG" o={0.45} />; })}
      {pp ? <Packet x={pp[0]} y={pp[1]} s={0.7} f={f} enc={enc} /> : null}
    </g>
  );
};
// прямой путь (пунктир) — как идут данные без VPN
const Dash: React.FC<{ a: [number, number]; b: [number, number]; p: number; f: number; c?: string }> = ({ a, b, p, f, c = YEL }) => {
  const x = a[0] + (b[0] - a[0]) * clamp01(p), y = a[1] + (b[1] - a[1]) * clamp01(p);
  return <g><line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={INK} strokeWidth={26} strokeLinecap="round" strokeDasharray="40 30" strokeDashoffset={-f * 4} />
    <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={c} strokeWidth={14} strokeLinecap="round" strokeDasharray="40 30" strokeDashoffset={-f * 4} /></g>;
};
// плащ-невидимка: полупрозрачный плащ поверх героя
const Cloak: React.FC<{ x: number; y: number; s: number; o: number; f: number }> = ({ x, y, s, o, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d={`M -150 -470 Q 0 -560 150 -470 L ${200 + Math.sin(f * 0.2) * 14} 0 Q 0 30 ${-200 + Math.sin(f * 0.2 + 1) * 14} 0 Z`} fill="#8ae0ff" fillOpacity={0.45} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${-120 + k * 80} -400 L ${-140 + k * 90} -40`} stroke="#ffffff" strokeWidth={6} opacity={0.5} />)}
  </g>
);
// куки: печенье с шоколадной крошкой и карточка аккаунта с лицом героя
const Cookie: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <Glow x={0} y={0} r={90} g="gY" o={0.5} />
    <circle cx={0} cy={0} r={52} fill="#e0a05a" stroke={INK} strokeWidth={7} />
    {[[-20, -14], [16, -22], [8, 12], [-24, 18], [26, 10]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={7} fill="#5a3418" />)}
  </g>
);
const Account: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-90} width={300} height={180} rx={20} fill="#ffffff" stroke={INK} strokeWidth={8} />
    <circle cx={-80} cy={-10} r={44} fill="#f8f6f0" stroke={INK} strokeWidth={6} />
    <path d="M -120 -30 Q -80 -86 -40 -30 Z" fill="#2c3552" stroke={INK} strokeWidth={5} />
    <circle cx={-80} cy={-80} r={10} fill="#f0f2f6" stroke={INK} strokeWidth={4} />
    <circle cx={-92} cy={-6} r={4} fill={INK} /><circle cx={-68} cy={-6} r={4} fill={INK} />
    <rect x={-20} y={-40} width={140} height={18} rx={9} fill="#f27a2a" />
    <rect x={-20} y={-6} width={110} height={14} rx={7} fill={INK} opacity={0.4} />
    <rect x={-20} y={22} width={130} height={14} rx={7} fill={INK} opacity={0.4} />
    <rect x={-150} y={60} width={300} height={30} rx={14} fill={f % 20 < 10 ? "#ff5fb0" : "#ff8ab0"} />
  </g>
);
const QMark: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <text x={x} y={y + Math.sin(f * 0.2 + x) * 10} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={120 * s} fill={YEL} stroke={INK} strokeWidth={14 * s} paintOrder="stroke">?</text>
);

// ---------- мир: ночная улица (как в примере), во весь вертикальный кадр ----------
const World: React.FC<{ cam: Cam; f: number; sky?: Sky; flick?: number; crowd?: boolean; palms?: boolean; children?: React.ReactNode; back?: React.ReactNode }> = ({ cam, f, sky = "night", flick = 0, crowd = true, palms, children, back }) => (
  <>
    <Layer cam={cam} d={0.08}>
      <rect x={-3000} y={-3000} width={9000} height={4200} fill={sky === "night" ? "url(#sky)" : "url(#skySunset)"} />
      <circle cx={1300} cy={-150} r={90} fill="#fff0d0" stroke={INK} strokeWidth={6} /><Glow x={1300} y={-150} r={320} g="gP" />
      {[[300, -260], [2200, -320], [2900, -140], [700, -80], [1700, -500], [100, -600]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#fff" opacity={0.8} />)}
    </Layer>
    <Layer cam={cam} d={0.4} blur={4}>{(sky === "night" ? FAR : FAR2).map((b, i) => <Building key={i} b={{ ...b, h: b.h + 120 }} f={f} win={22} far flick={flick} />)}</Layer>
    <Layer cam={cam} d={0.7} blur={2}>
      {palms ? Array.from({ length: 12 }, (_, i) => <Palm key={i} x={-600 + i * 420} y={BASE} f={f + i * 13} />)
        : MID.map((b, i) => <Building key={i} b={b} f={f + i * 7} win={30} flick={flick} />)}
    </Layer>
    {back ? <Layer cam={cam} d={0.85}>{back}</Layer> : null}
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={BASE} width={9000} height={60} fill="#6a4ab0" stroke={INK} strokeWidth={6} />
      <rect x={-2000} y={765} width={9000} height={210} fill="url(#road)" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + i * 180} y={862} width={90} height={12} rx={6} fill={YEL} opacity={0.85} />)}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1180 + i * 38} y={775} width={22} height={186} fill="#e8e4ff" opacity={0.75} />)}
      <rect x={-2000} y={975} width={9000} height={1600} fill="#7a58c8" stroke={INK} strokeWidth={6} />
      <rect x={-2000} y={975} width={9000} height={22} fill="#9a7ae0" />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-1500 + i * 260} 997 L ${-1640 + i * 260} 2575`} stroke={INK} strokeWidth={4} opacity={0.35} />)}
      {[-300, 700, 1900, 3100, 4100].map((x) => <Lamp key={x} x={x} y={BASE + 30} />)}
      <TrafficLight x={1120} y={BASE + 40} f={f} ph={0} /><TrafficLight x={2280} y={BASE + 40} f={f} ph={30} />
      <Car x={-150 + ((f * 6) % 4000)} y={845} c="#3cc6d8" />
      <Car x={3500 - ((f * 5) % 4200)} y={930} c="#f4c430" flip />
      {crowd ? <Crowd f={f} /> : null}
      {children}
    </Layer>
  </>
);
const Palm: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    <path d={`M ${x} ${y} Q ${x + 30} ${y - 260} ${x + 10} ${y - 520}`} stroke={INK} strokeWidth={42} fill="none" strokeLinecap="round" />
    <path d={`M ${x} ${y} Q ${x + 30} ${y - 260} ${x + 10} ${y - 520}`} stroke="#a8683a" strokeWidth={28} fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3, 4, 5].map((k) => { const a = -170 + k * 34 + Math.sin(f * 0.05 + k) * 4; const r = (a * Math.PI) / 180;
      return <path key={k} d={`M ${x + 10} ${y - 520} Q ${x + 10 + Math.cos(r) * 120} ${y - 560 + Math.sin(r) * 120} ${x + 10 + Math.cos(r) * 230} ${y - 500 + Math.sin(r) * 200}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />; })}
    {[0, 1, 2, 3, 4, 5].map((k) => { const a = -170 + k * 34 + Math.sin(f * 0.05 + k) * 4; const r = (a * Math.PI) / 180;
      return <path key={"g" + k} d={`M ${x + 10} ${y - 520} Q ${x + 10 + Math.cos(r) * 120} ${y - 560 + Math.sin(r) * 120} ${x + 10 + Math.cos(r) * 230} ${y - 500 + Math.sin(r) * 200}`} stroke="#3ab06a" strokeWidth={20} fill="none" strokeLinecap="round" />; })}
  </g>
);
const Grade: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 15% 0%, rgba(255,80,170,0.25), rgba(0,0,0,0) 55%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(30,20,110,0.35) 100%)" }} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 ${260 + dark * 200}px ${60 + dark * 120}px rgba(14,6,40,${0.6 + dark * 0.3})` }} />
  </>
);
const Frame: React.FC<{ dark?: number; children: React.ReactNode }> = ({ dark, children }) => (
  <><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}><Defs />{children}</svg><Grade dark={dark} /></>
);
const BigText: React.FC<{ lines: [string, string][]; y: number; size: number; p: number; shake?: number }> = ({ lines, y, size, p, shake = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${W / 2 + shake} ${y}) scale(${0.6 + 0.4 * Easing.out(Easing.back(2))(clamp01(p))}) rotate(${-3 + shake * 0.2})`} opacity={clamp01(p * 3)}>
      {lines.map(([t, c], i) => <g key={i}>
        <text x={8} y={i * size * 1.05 + 10} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.24} strokeLinejoin="round" letterSpacing={-size * 0.03}>{t}</text>
        <text x={0} y={i * size * 1.05} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={size} fill={c} stroke={INK} strokeWidth={size * 0.15} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.03}>{t}</text>
      </g>)}
    </g>
  </svg>
);

// ---------- субтитры: по 2–3 слова, внизу ----------
type Chunk = { t: number; e: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ t: cur[0].t, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  for (const w of V.words) { cur.push(w); const len = cur.reduce((a, x) => a + x.w.length, 0); if (w.end || w.pause || cur.length >= 3 || len > 14) flush(); }
  flush(); return out;
})();
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const i = CHUNKS.findIndex((c, k) => t >= c.t - 0.05 && t < (CHUNKS[k + 1] ? Math.min(CHUNKS[k + 1].t - 0.05, c.e + 0.35) : c.e + 0.6));
  if (i < 0) return null;
  const c = CHUNKS[i], pop = clamp01((t - c.t + 0.05) / 0.12), text = c.words.map((w) => w.w.toUpperCase());
  const fit = Math.min(1, 960 / (text.join(" ").length * 0.76 * 74));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${W / 2} 1580) scale(${(0.85 + 0.15 * pop) * fit})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={74} letterSpacing={-1} stroke={INK} strokeWidth={22} strokeLinejoin="round" paintOrder="stroke" fill="#fff">
          {text.map((w, k) => <tspan key={k} fill={t >= c.words[k].t - 0.03 && t < c.words[k].e + 0.1 ? YEL : "#ffffff"}>{(k ? " " : "") + w}</tspan>)}
        </text>
      </g>
    </svg>
  );
};

// ---------- склейки по словам ----------
type Shot = { at: string; n?: number; s: (g: number, f: number, len: number) => React.ReactNode; over?: (g: number, f: number, len: number) => React.ReactNode };
const Hero = (p: any) => <Bean look={HERO2D} {...p} />;
// координаты мира: улица BASE=705, тротуар 975+; герой стоит на ближнем тротуаре (y = 1080)
const HX = 1500;
const SHOTS: Shot[] = [
  // 0–3 с: крупная надпись + щелчок переключателя
  { at: "", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 600, z: 1.5, r: -4 }, { x: HX, y: 640, z: 1.8, r: 3 })} f={f} flick={1}>
      <Hero x={HX} y={1080} s={1.3} f={f} expr="shock" open={0.7} pose={{ armL: [150, 60], armR: [150, 60], tilt: Math.sin(f * 0.7) * 5 }} /></World></Frame>,
    over: (g) => <BigText lines={[["ТЫ НЕ ТАК", "#ffffff"], ["ПРЕДСТАВЛЯЕШЬ", YEL], ["VPN", "#5aff9a"]]} y={330} size={98} p={g / 8} shake={g < 10 ? Math.sin(g * 3) * 10 : 0} /> },
  { at: "кнопку", s: (g, f, len) => { const on = ip(g, [6, 10], [0, 1], Easing.out(Easing.back(2)));
    return <Frame><World cam={lerpCam(g, len, { x: HX, y: 620, z: 1.2 }, { x: HX, y: 640, z: 1.3 })} f={f} flick={on > 0.5 ? 1 : 0} crowd={false}>
      <Phone x={HX} y={520} s={1.25 + 0.06 * Math.max(0, 1 - Math.abs(g - 9) / 5)} on={on} f={f} />
      <Glow x={HX} y={520} r={700 * on} g="gG" o={on * Math.max(0.2, 1 - (g - 10) / 20)} /></World></Frame>; } },
  { at: "Но", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 700, z: 1.55 }, { x: HX, y: 720, z: 1.75 })} f={f} crowd={false}>
    <Hero x={HX} y={1080} s={1.3} f={f} expr="neutral" pose={{ armR: [150, 70], armL: [20, 10], tilt: Math.sin(f * 0.08) * 8 }} />
    <QMark x={HX - 260} y={420} f={f} /><QMark x={HX + 270} y={360} s={1.3} f={f} /><QMark x={HX + 120} y={180} s={0.8} f={f} /></World></Frame> },
  // 5–15 с: защищённое соединение с удалённым сервером
  { at: "Когда", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX + 200, y: 300, z: 0.75 }, { x: HX + 400, y: 200, z: 0.68 })} f={f}
      back={<ServerTower x={HX + 700} y={BASE + 200} s={0.9} f={f} />}>
    <Hero x={HX} y={1080} s={0.95} f={f} expr="grin" holdR={{ node: <Phone x={0} y={-60} s={0.32} on={1} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} />
    <Tunnel a={[HX + 60, 600]} b={[HX + 640, -330]} lift={300} p={ip(g, [8, 50], [0, 1])} f={f} w={70} /></World></Frame> },
  { at: "сервером", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 2600, y: 100, z: 0.8 }, { x: 2700, y: 60, z: 0.9 })} f={f} crowd={false}>
    <ServerTower x={2700} y={BASE + 30} s={1.15} f={f} />
    <Tunnel a={[1400, 500]} b={[2700, -600]} lift={300} p={1} f={f} w={80} pk={(g % 40) / 40} /></World></Frame> },
  { at: "И", n: 2, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 560, z: 1.1 }, { x: HX, y: 520, z: 1.8 }, Easing.in(Easing.cubic))} f={f} crowd={false}>
    <Phone x={HX} y={500} s={1.2} on={1} f={f} screen="lock" /></World></Frame> },
  // 15–30 с: трафик через сервер, шифрование
  { at: "Вместо", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 2100, y: 250, z: 0.62 }, { x: 2150, y: 250, z: 0.66 })} f={f}
      back={<SiteBuilding x={2700} y={BASE + 160} s={1.1} f={f} />}>
    <Hero x={1500} y={1080} s={0.9} f={f} expr="neutral" holdR={{ node: <Phone x={0} y={-60} s={0.32} on={0} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} />
    <Dash a={[1560, 640]} b={[2600, 200]} p={ip(g, [4, 30], [0, 1])} f={f} />
    {g > 34 ? <g transform="translate(2080 420)"><path d="M -60 -60 L 60 60 M 60 -60 L -60 60" stroke={INK} strokeWidth={46} strokeLinecap="square" /><path d="M -60 -60 L 60 60 M 60 -60 L -60 60" stroke="#ff3a4a" strokeWidth={26} strokeLinecap="square" /></g> : null}
  </World></Frame> },
  { at: "передаёт", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 2150, y: 150, z: 0.55 }, { x: 2150, y: 120, z: 0.6 })} f={f}
      back={<><ServerTower x={1500} y={BASE + 120} s={0.85} f={f} /><SiteBuilding x={2900} y={BASE + 160} s={1.0} f={f} /></>}>
    <Hero x={1150} y={1080} s={0.9} f={f} expr="grin" holdR={{ node: <Phone x={0} y={-60} s={0.32} on={1} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} />
    <Tunnel a={[1210, 640]} b={[1700, -260]} lift={200} p={ip(g, [0, 18], [0, 1])} f={f} w={60} pk={clamp01((g - 8) / 22)} enc={0} />
    <Tunnel a={[1900, -260]} b={[2850, 0]} lift={260} p={ip(g, [20, 38], [0, 1])} f={f} w={60} pk={clamp01((g - 30) / 22)} enc={0} color="#5ae0ff" />
  </World></Frame> },
  { at: "Данные", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 1700, y: 300, z: 1.15 }, { x: 1720, y: 300, z: 1.3 })} f={f} crowd={false}>
    <Tunnel a={[800, 520]} b={[2700, 520]} lift={0} p={1} f={f} w={240} />
    {[0, 1, 2].map((k) => { const u = ((g * 0.012 + k / 3) % 1); const x = 900 + u * 1700; return <Packet key={k} x={x} y={520} s={1.15} f={f + k * 9} enc={x > 1500 ? 1 : 0} />; })}
    <ShieldLock x={1700} y={180} s={0.9} /></World></Frame> },
  { at: "поэтому", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 1700, y: 360, z: 1.05 }, { x: 1700, y: 380, z: 1.12 })} f={f} crowd={false}>
    <Tunnel a={[800, 600]} b={[2700, 600]} lift={0} p={1} f={f} w={220} pk={(g % 45) / 45} />
    <Bean x={1720} y={1080} s={1.15} look={LOOKS[3]} f={f} expr={g > 25 ? "sad" : "shock"} open={0.5} sweat={g > 25} holdR={{ node: <g><circle cx={-24} cy={-40} r={26} fill="#bfe8ff" stroke={INK} strokeWidth={8} /><circle cx={24} cy={-40} r={26} fill="#bfe8ff" stroke={INK} strokeWidth={8} /></g>, rot: 0 }} pose={{ armR: [150, 30], tilt: Math.sin(f * 0.2) * 5 }} />
    {g > 25 ? <><QMark x={1550} y={250} f={f} /><QMark x={1900} y={210} s={0.8} f={f} /></> : null}
  </World></Frame> },
  // 30–42 с: сайт видит IP сервера; будто ты в другой стране
  { at: "А", n: 1, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 2050, y: 380, z: 0.95 }, { x: 2050, y: 400, z: 1.05 })} f={f} crowd={false}
      back={<SiteBuilding x={2300} y={BASE + 160} s={1.0} f={f} />}>
    <Bean x={2280} y={1080} s={1.05} look={GUARD} f={f} expr="neutral" holdR={{ node: <Badge x={0} y={-110} s={0.95} vpn={g > 30} />, rot: 0 }} pose={{ armR: [110, 20] }} />
    <Hero x={1820} y={1080} s={1.05} f={f} expr="smirk" pose={{ armL: [60, 20] }} />
  </World></Frame> },
  { at: "Из-за", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 1500, y: 560, z: 1.15 }, { x: 1500, y: 580, z: 1.25 })} f={f} sky="sunset" palms crowd={false}>
    <Hero x={1500} y={1080} s={1.3} f={f} expr="laugh" open={0.6} holdR={{ node: <g><rect x={-70} y={-30} width={60} height={34} rx={10} fill={INK} /><rect x={10} y={-30} width={60} height={34} rx={10} fill={INK} /></g>, rot: 0 }} pose={{ armR: [160, 40], armL: [130, 30], tilt: Math.sin(f * 0.1) * 5 }} />
  </World></Frame> },
  // 42–55 с: подвох — VPN не делает невидимым
  { at: "Но", n: 2, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 640, z: 1.35 }, { x: HX, y: 660, z: 1.45 })} f={f}>
    <Hero x={HX} y={1080} s={1.3} f={f} expr="grin" pose={{ armL: [40, 20], armR: [40, 20] }} />
    <Cloak x={HX} y={1100} s={1.3} o={ip(g, [4, 18], [0, 1])} f={f} /></World></Frame> },
  { at: "Сайты", n: 2, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX + 150, y: 520, z: 1.05 }, { x: HX + 150, y: 540, z: 1.12 })} f={f} crowd={false}
      back={<SiteBuilding x={HX + 650} y={BASE + 160} s={0.95} f={f} />}>
    <Hero x={HX - 120} y={1080} s={1.15} f={f} expr="shock" open={0.6} sweat pose={{ armL: [60, 30], armR: [40, 20] }} />
    <Cloak x={HX - 120} y={1100} s={1.15} o={0.8 - 0.4 * clamp01(g / 40)} f={f} />
    <Bean x={HX + 420} y={1080} s={1.05} look={GUARD} f={f} expr="smirk" holdR={{ node: <g><circle cx={0} cy={-70} r={46} fill="#bfe8ff" fillOpacity={0.5} stroke={INK} strokeWidth={10} /><rect x={-8} y={-26} width={16} height={60} fill="#7a4a2a" stroke={INK} strokeWidth={6} /></g>, rot: -20 }} pose={{ armR: [120, 30] }} flip />
    <Account x={HX - 120} y={240} s={0.9 * clamp01((g - 4) / 6)} f={f} />
    {[0, 1, 2, 3].map((k) => <Cookie key={k} x={HX - 400 + k * 190} y={460 + Math.sin(f * 0.15 + k) * 20} s={clamp01((g - 14 - k * 4) / 6)} rot={f * 2 + k * 40} />)}
  </World></Frame> },
  // 55–60 с: финал — туннель внутри интернета
  { at: "Так", s: (g, f, len) => <Frame dark={ip(g, [len - 30, len], [0, 0.6])}><World cam={lerpCam(g, len, { x: 2000, y: 200, z: 0.62 }, { x: 2000, y: 160, z: 0.75 })} f={f} flick={1}>
    <Tunnel a={[400, 560]} b={[3600, 300]} lift={500} p={1} f={f} w={150} pk={(g % 50) / 50} />
    <Hero x={2000} y={1080} s={1.0} f={f} expr="grin" pose={{ armR: [150, 40], armL: [20, 10] }} />
  </World></Frame> },
];
const STARTS = SHOTS.map((s, i) => (i === 0 ? 0 : at(s.at, s.n) - 3));

export const VpnShort: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0; while (i + 1 < STARTS.length && f >= STARTS[i + 1]) i++;
  const end = i + 1 < STARTS.length ? STARTS[i + 1] : FRAMES;
  const g = f - STARTS[i];
  const punch = 1 + 0.04 * Math.max(0, 1 - g / 6);
  const fadeOut = clamp01((f - (FRAMES - 24)) / 22);
  return (
    <AbsoluteFill style={{ background: "#120a30" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>{SHOTS[i].s(g, f, end - STARTS[i])}</AbsoluteFill>
      {SHOTS[i].over ? SHOTS[i].over!(g, f, end - STARTS[i]) : null}
      <Subs t={(f - LEAD) / FPS} />
      <AbsoluteFill style={{ background: "#07030f", opacity: fadeOut }} />
      <Audio src={staticFile("vpn/mix.wav")} />
    </AbsoluteFill>
  );
};
