// «Защищает ли VPN от хакеров?» — шортс 9:16 (1080×1920), тот же набор, что в src/vpn/vpn.tsx и src/slow/slow.tsx.
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

const fontH = delayRender("hack fonts");
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
const PROVIDER: BeanLook = { head: "#f8f6f0", body: "#3a8af0", body2: "#2a5ac0", limb: "#262838", shoe: "#2a2a30", hair: "#4a2e1e" };
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
const ServerTower: React.FC<{ x: number; y: number; s?: number; f: number; eye?: number }> = ({ x, y, s = 1, f, eye = 0 }) => (
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
    {eye > 0 ? <g transform={`translate(0 -520) scale(1 ${eye})`}>
      <Glow x={0} y={0} r={260} g="gY" o={0.6} />
      <path d="M -150 0 Q 0 -120 150 0 Q 0 120 -150 0 Z" fill="#ffffff" stroke={INK} strokeWidth={10} />
      <circle cx={Math.sin(f * 0.08) * 40} cy={0} r={50} fill="#3a8af0" stroke={INK} strokeWidth={8} /><circle cx={Math.sin(f * 0.08) * 40} cy={0} r={22} fill={INK} />
    </g> : null}
  </g>
);
// сайт: здание с витриной-«браузером» и охранником у двери
const SiteBuilding: React.FC<{ x: number; y: number; s?: number; f: number; lang?: number }> = ({ x, y, s = 1, f, lang }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={-420} r={420} g="gP" o={0.5} />
    <rect x={-260} y={-700} width={520} height={700} fill="#c85a9a" stroke={INK} strokeWidth={9} />
    <rect x={-220} y={-650} width={440} height={300} rx={18} fill="#e8f4ff" stroke={INK} strokeWidth={8} />
    <rect x={-220} y={-650} width={440} height={46} rx={14} fill="#c8d4ea" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <circle key={i} cx={-190 + i * 30} cy={-627} r={9} fill={["#ff5a6a", "#ffd23c", "#5ac84a"][i]} stroke={INK} strokeWidth={3} />)}
    <rect x={-190} y={-580} width={380} height={70} rx={10} fill="#7a5ac8" stroke={INK} strokeWidth={5} />
    {lang !== undefined ? <>
      <text x={0} y={-528} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={50} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke">{["HOLA!", "BONJOUR!", "HALLO!"][lang]}</text>
      <g transform="translate(150 -330) rotate(12)"><rect x={-90} y={-46} width={180} height={92} rx={14} fill={YEL} stroke={INK} strokeWidth={7} /><circle cx={-62} cy={0} r={10} fill={INK} />
        <text x={14} y={18} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={52} fill={INK}>{["9 €", "$12", "¥90"][lang]}</text></g>
    </> : null}
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

// ---------- новое для этого ролика (тот же стиль: плоско, толстый контур, свечение) ----------
// спидометр: v 0..1
const Speedo: React.FC<{ x: number; y: number; s?: number; v: number }> = ({ x, y, s = 1, v }) => {
  const a = -180 + 180 * clamp01(v), r = (a * Math.PI) / 180;
  const col = v < 0.35 ? "#ff3a4a" : v < 0.65 ? YEL : "#5aff9a";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={-40} r={300} g={v < 0.35 ? "gR" : v < 0.65 ? "gY" : "gG"} o={0.6} />
      <path d="M -200 0 A 200 200 0 0 1 200 0 Z" fill="#1c1838" stroke={INK} strokeWidth={10} />
      {[["#ff3a4a", -180, -120], [YEL, -120, -60], ["#5aff9a", -60, 0]].map(([c, a0, a1], i) => {
        const p = (d: number, rr: number) => `${Math.cos((d * Math.PI) / 180) * rr} ${Math.sin((d * Math.PI) / 180) * rr}`;
        return <path key={i} d={`M ${p(a0 as number, 170)} A 170 170 0 0 1 ${p(a1 as number, 170)}`} stroke={c as string} strokeWidth={28} fill="none" />;
      })}
      <line x1={0} y1={0} x2={Math.cos(r) * 150} y2={Math.sin(r) * 150} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.cos(r) * 150} y2={Math.sin(r) * 150} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={0} r={26} fill={col} stroke={INK} strokeWidth={8} />
    </g>
  );
};
// телефон с крутящейся загрузкой или со списком серверов
const PhoneX: React.FC<{ x: number; y: number; s?: number; f: number; mode: "load" | "list"; pick?: number }> = ({ x, y, s = 1, f, mode, pick = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={420} g={mode === "load" ? "gR" : "gG"} o={0.45} />
    <rect x={-150} y={-300} width={300} height={600} rx={46} fill="#2a2450" stroke={INK} strokeWidth={10} />
    <rect x={-128} y={-268} width={256} height={536} rx={28} fill="#1a1440" />
    <rect x={-40} y={-288} width={80} height={12} rx={6} fill={INK} />
    {mode === "load" ? <>
      <rect x={-110} y={-240} width={220} height={40} rx={10} fill="#e8f4ff" stroke={INK} strokeWidth={5} />
      <g transform={`translate(0 -10) rotate(${f * 6})`}>{Array.from({ length: 8 }, (_, k) => <rect key={k} x={-10} y={-82} width={20} height={42} rx={10} fill="#ffffff" opacity={0.25 + 0.75 * (k / 7)} transform={`rotate(${k * 45})`} />)}</g>
      <rect x={-100} y={140} width={200} height={26} rx={13} fill="#3a3460" stroke={INK} strokeWidth={5} />
      <rect x={-100} y={140} width={40 + 20 * Math.abs(Math.sin(f * 0.03))} height={26} rx={13} fill="#ff3a4a" />
    </> : <>
      <text x={0} y={-200} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={40} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke">СЕРВЕРЫ</text>
      {[0, 1, 2, 3].map((i) => <g key={i}>
        <rect x={-112} y={-160 + i * 100} width={224} height={80} rx={16} fill={i === pick ? "#3ad87a" : "#3a3460"} stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((k) => <rect key={k} x={-92 + k * 18} y={-112 + i * 100 - k * 10} width={12} height={16 + k * 10} fill={k < [1, 3, 2, 3][i] ? "#ffffff" : "#5a5480"} />)}
        <rect x={-20} y={-132 + i * 100} width={110} height={16} rx={8} fill="#ffffff" opacity={0.85} />
      </g>)}
    </>}
  </g>
);
// шестерёнка (вычисления при шифровании)
const Gear: React.FC<{ x: number; y: number; r: number; f: number; sp: number; c: string }> = ({ x, y, r, f, sp, c }) => (
  <g transform={`translate(${x} ${y}) rotate(${f * sp})`}>
    {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-r * 0.16} y={-r * 1.18} width={r * 0.32} height={r * 0.4} rx={6} fill={c} stroke={INK} strokeWidth={7} transform={`rotate(${k * 36})`} />)}
    <circle cx={0} cy={0} r={r} fill={c} stroke={INK} strokeWidth={9} />
    <circle cx={0} cy={0} r={r * 0.36} fill="#1c1838" stroke={INK} strokeWidth={7} />
  </g>
);
// карта мира: плоские материки, Казахстан и США подсвечены
const MW = 2200, MH = 1100;
const P = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * MW, ((90 - lat) / 180) * MH];
const poly = (pts: [number, number][]) => pts.map(([lo, la], i) => { const [x, y] = P(lo, la); return `${i ? "L" : "M"} ${x} ${y}`; }).join(" ") + " Z";
const CONTS: [number, number][][] = [
  [[-168, 65], [-140, 70], [-95, 75], [-80, 70], [-60, 55], [-75, 45], [-80, 30], [-97, 25], [-105, 20], [-90, 15], [-80, 8], [-105, 22], [-117, 32], [-125, 45], [-135, 58], [-150, 60]],
  [[-80, 10], [-60, 10], [-35, -5], [-40, -22], [-55, -35], [-68, -55], [-75, -45], [-72, -20], [-81, -5]],
  [[-10, 36], [-9, 44], [0, 50], [5, 58], [20, 70], [40, 68], [60, 72], [100, 78], [140, 72], [180, 68], [170, 60], [155, 55], [140, 45], [130, 35], [122, 25], [108, 18], [100, 10], [105, 2], [95, 15], [80, 8], [72, 20], [58, 25], [50, 30], [35, 32], [28, 40], [10, 38]],
  [[-17, 20], [-5, 35], [10, 37], [32, 31], [43, 12], [51, 12], [40, -15], [32, -30], [20, -35], [12, -18], [9, 4], [-8, 5], [-17, 14]],
  [[114, -22], [130, -12], [145, -15], [153, -28], [145, -38], [130, -32], [115, -34]],
  [[-55, 60], [-20, 70], [-25, 82], [-60, 82], [-70, 76]],
];
const KZ: [number, number][] = [[47, 50], [55, 52], [62, 54], [76, 54], [87, 49], [80, 42], [70, 41], [60, 42], [52, 42], [47, 46]];
const US: [number, number][] = [[-124, 48], [-95, 49], [-83, 46], [-70, 45], [-76, 38], [-81, 31], [-81, 25], [-97, 26], [-106, 31], [-117, 32], [-124, 40]];
export const KZ_P = P(67, 48), US_P = P(-98, 39);
const arcPt = (u: number): [number, number] => {
  const a = KZ_P, b = US_P, mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 420;
  return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
};
const Pin: React.FC<{ p: [number, number]; c: string; f: number }> = ({ p, c, f }) => (
  <g transform={`translate(${p[0]} ${p[1]})`}>
    <circle cx={0} cy={0} r={40 + ((f * 2) % 50)} fill="none" stroke={c} strokeWidth={6} opacity={1 - ((f * 2) % 50) / 50} />
    <path d="M 0 0 C -34 -40 -34 -80 0 -80 C 34 -80 34 -40 0 0 Z" fill={c} stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={-56} r={12} fill="#ffffff" stroke={INK} strokeWidth={5} />
  </g>
);
const MapScene: React.FC<{ cam: Cam; f: number; line: number; pk?: number; hero?: boolean }> = ({ cam, f, line, pk, hero }) => {
  const N = 60, n = Math.max(1, Math.round(N * clamp01(line)));
  const d = Array.from({ length: n + 1 }, (_, i) => arcPt(i / N)).map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const pp = pk !== undefined ? arcPt(clamp01(pk) * clamp01(line)) : null;
  return (
    <Frame>
      <Layer cam={cam} d={0.1}><rect x={-4000} y={-4000} width={9000} height={9000} fill="#1a0f4a" />{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={-1500 + ((i * 397) % 5000)} cy={-1500 + ((i * 631) % 4000)} r={4} fill="#fff" opacity={0.5} />)}</Layer>
      <Layer cam={cam} d={1}>
        <rect x={-40} y={-40} width={MW + 80} height={MH + 80} rx={40} fill="#2a4ab8" stroke={INK} strokeWidth={12} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={(i * MW) / 10} y1={0} x2={(i * MW) / 10} y2={MH} stroke="#3a5ad0" strokeWidth={4} />)}
        {Array.from({ length: 6 }, (_, i) => <line key={"h" + i} x1={0} y1={(i * MH) / 5} x2={MW} y2={(i * MH) / 5} stroke="#3a5ad0" strokeWidth={4} />)}
        {CONTS.map((c, i) => <path key={i} d={poly(c)} fill={["#7a5ac8", "#5a7cf0", "#8a4a9a", "#c85a9a", "#b45ad8", "#e8eaff"][i]} stroke={INK} strokeWidth={8} strokeLinejoin="round" />)}
        <path d={poly(KZ)} fill={YEL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={poly(US)} fill="#5ae0ff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#5aff9a" strokeWidth={18} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="12 40" strokeDashoffset={-f * 6} strokeLinecap="round" />
        {Array.from({ length: Math.floor(n / 6) }, (_, i) => { const [x, y] = arcPt(((i + 1) * 6) / N); return <Glow key={i} x={x} y={y} r={90} g="gG" o={0.5} />; })}
        <Pin p={KZ_P} c="#f27a2a" f={f} /><Pin p={US_P} c="#3ad87a" f={f} />
        {hero ? <Bean x={KZ_P[0] + 120} y={KZ_P[1] + 150} s={0.55} look={HERO2D} f={f} expr="grin" pose={{ armR: [130, 30] }} /> : null}
        {pp ? <Packet x={pp[0]} y={pp[1]} s={0.85} f={f} enc={0} /> : null}
      </Layer>
    </Frame>
  );
};
// вывеска магазина над дверью
const Shop: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <Glow x={0} y={-330} r={300} g="gY" o={0.5} />
    <rect x={-220} y={-420} width={440} height={420} fill="#3cc6d8" stroke={INK} strokeWidth={9} />
    <rect x={-240} y={-470} width={480} height={90} rx={18} fill="#1a1240" stroke={YEL} strokeWidth={10} />
    <text x={0} y={-410} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={56} fill={YEL} opacity={f % 40 < 3 ? 0.4 : 1}>МАГАЗИН</text>
    <rect x={-180} y={-330} width={160} height={150} rx={10} fill="#e8f4ff" stroke={INK} strokeWidth={7} />
    <rect x={40} y={-330} width={110} height={330} rx={10} fill="#2a2450" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => <circle key={i} cx={-140 + i * 50} cy={-230} r={16} fill={["#ff5a6a", YEL, "#5ac84a"][i]} stroke={INK} strokeWidth={5} />)}
  </g>
);
// старый телефон: с трещиной, греется
const OldPhone: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.9) * 2})`}>
    <Glow x={0} y={0} r={380} g="gR" o={0.5 + 0.2 * Math.sin(f * 0.3)} />
    <rect x={-140} y={-280} width={280} height={560} rx={40} fill="#6a6480" stroke={INK} strokeWidth={10} />
    <rect x={-118} y={-250} width={236} height={500} rx={24} fill="#2a1a3a" />
    <path d="M -60 -250 L -20 -120 L -70 -40 L 10 80 L -30 250" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.7} />
    <g transform={`translate(0 -20) rotate(${f * 3})`}>{Array.from({ length: 8 }, (_, k) => <rect key={k} x={-9} y={-70} width={18} height={36} rx={9} fill="#ffffff" opacity={0.25 + 0.75 * (k / 7)} transform={`rotate(${k * 45})`} />)}</g>
    {[0, 1, 2].map((k) => <path key={k} d={`M ${-60 + k * 60} ${-330 - ((f * 3 + k * 20) % 60)} q 16 -20 0 -40 q -16 -20 0 -40`} stroke="#ff8a5a" strokeWidth={10} fill="none" strokeLinecap="round" opacity={1 - ((f * 3 + k * 20) % 60) / 60} />)}
  </g>
);

// ---------- новое для этого ролика ----------
const HACKER: BeanLook = { head: "#d8d4e8", body: "#2a2440", body2: "#16131f", limb: "#16131f", shoe: "#16131f", hat: "beanie", hatC: "#16131f", hatC2: "#3a3460" };
// хакер: тёмный капюшон, ноутбук с зелёным кодом
const Hacker: React.FC<{ x: number; y: number; s?: number; f: number; expr?: any; laptop?: boolean; flip?: boolean }> = ({ x, y, s = 1, f, expr = "smirk", laptop = true, flip }) => (
  <g>
    <Bean x={x} y={y} s={s} look={HACKER} f={f} expr={expr} flip={flip} pose={{ armL: [70, 40], armR: [70, 40] }}
      holdR={laptop ? { node: <g><Glow x={0} y={-60} r={160} g="gG" o={0.6} /><rect x={-110} y={-140} width={220} height={140} rx={12} fill="#1a1440" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={-90} y={-122 + k * 28} width={60 + ((k * 37 + Math.floor(f / 4) * 13) % 100)} height={12} rx={6} fill="#5aff9a" />)}
        <rect x={-130} y={-4} width={260} height={22} rx={8} fill="#3a3460" stroke={INK} strokeWidth={6} /></g>, rot: 0 } : undefined} />
  </g>
);
// вирус: зелёный шарик с шипами и злыми глазами
const Virus: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.25 + x) * 14}) scale(${s}) rotate(${f * 2})`}>
    <Glow x={0} y={0} r={150} g="gG" o={0.6} />
    {Array.from({ length: 10 }, (_, k) => <g key={k} transform={`rotate(${k * 36})`}><rect x={-8} y={-96} width={16} height={36} fill="#3ad87a" stroke={INK} strokeWidth={6} /><circle cx={0} cy={-98} r={14} fill="#5aff9a" stroke={INK} strokeWidth={6} /></g>)}
    <circle cx={0} cy={0} r={66} fill="#3ad87a" stroke={INK} strokeWidth={9} />
    <g transform={`rotate(${-f * 2})`}>
      <path d="M -36 -18 L -10 -6 M 36 -18 L 10 -6" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <circle cx={-22} cy={6} r={10} fill={INK} /><circle cx={22} cy={6} r={10} fill={INK} />
      <path d="M -24 34 Q 0 20 24 34" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  </g>
);
// письмо-ловушка на крючке (фишинг)
const HookMail: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.15) * 8})`}>
    <line x1={0} y1={-500} x2={0} y2={-120} stroke={INK} strokeWidth={8} />
    <path d="M 0 -120 L 0 -70 Q 0 -30 30 -30 Q 50 -30 50 -60" stroke="#c8ccd8" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M 0 -120 L 0 -70 Q 0 -30 30 -30 Q 50 -30 50 -60" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    <Glow x={0} y={40} r={160} g="gR" o={0.5} />
    <rect x={-110} y={-30} width={220} height={150} rx={14} fill="#fff6e0" stroke={INK} strokeWidth={8} />
    <path d="M -110 -30 L 0 50 L 110 -30" fill="none" stroke={INK} strokeWidth={7} />
    <rect x={-70} y={70} width={140} height={30} rx={15} fill="#3a8af0" stroke={INK} strokeWidth={5} />
  </g>
);
// вредоносный файл: листок с черепом
const BadFile: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.2 + 1) * 12}) scale(${s}) rotate(${Math.sin(f * 0.1) * 6})`}>
    <Glow x={0} y={0} r={150} g="gR" o={0.5} />
    <path d="M -80 -100 L 40 -100 L 80 -60 L 80 100 L -80 100 Z" fill="#ffffff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 40 -100 L 40 -60 L 80 -60" fill="#d8dcf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={0} r={38} fill="#2a2440" stroke={INK} strokeWidth={6} />
    <circle cx={-14} cy={-4} r={10} fill="#ffffff" /><circle cx={14} cy={-4} r={10} fill="#ffffff" />
    <rect x={-20} y={22} width={40} height={20} rx={4} fill="#2a2440" stroke={INK} strokeWidth={5} />
    <path d="M -8 22 L -8 42 M 6 22 L 6 42" stroke="#ffffff" strokeWidth={4} />
  </g>
);
// коробка-загрузка: открывается, оттуда выпрыгивает вирус
const GiftBox: React.FC<{ x: number; y: number; s?: number; f: number; open: number }> = ({ x, y, s = 1, f, open }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {open > 0.3 ? <Virus x={0} y={-170 - 160 * open} s={0.8 * open} f={f} /> : null}
    <rect x={-150} y={-180} width={300} height={180} fill="#ff6fb5" stroke={INK} strokeWidth={9} />
    <rect x={-25} y={-180} width={50} height={180} fill={YEL} stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${-110 * open} -170 -180)`}><rect x={-170} y={-230} width={340} height={56} fill="#ff8ac8" stroke={INK} strokeWidth={9} /><rect x={-25} y={-230} width={50} height={56} fill={YEL} stroke={INK} strokeWidth={6} /></g>
    <path d="M -70 -60 L 70 -60" stroke={INK} strokeWidth={6} opacity={0} />
    <text x={0} y={-60} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={56} fill="#ffffff" stroke={INK} strokeWidth={9} paintOrder="stroke">.EXE</text>
  </g>
);
// фальшивая страница входа на телефоне
const FakeLogin: React.FC<{ x: number; y: number; s?: number; f: number; typed: number }> = ({ x, y, s = 1, f, typed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={420} g="gR" o={0.45} />
    <rect x={-170} y={-320} width={340} height={640} rx={46} fill="#2a2450" stroke={INK} strokeWidth={10} />
    <rect x={-148} y={-288} width={296} height={576} rx={28} fill="#f4f6ff" />
    <rect x={-128} y={-262} width={256} height={40} rx={10} fill="#ffd6d6" stroke={INK} strokeWidth={5} />
    <text x={-114} y={-234} fontFamily="VpnMont" fontWeight={700} fontSize={22} fill="#c83040">bаnk-l0gin.co</text>
    <circle cx={0} cy={-130} r={52} fill="#3a8af0" stroke={INK} strokeWidth={7} />
    <text x={0} y={-112} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={54} fill="#ffffff">?</text>
    <text x={-120} y={-36} fontFamily="VpnMont" fontWeight={900} fontSize={26} fill={INK}>ЛОГИН</text>
    <rect x={-120} y={-24} width={240} height={52} rx={12} fill="#ffffff" stroke={INK} strokeWidth={6} />
    <rect x={-104} y={-6} width={130} height={16} rx={8} fill="#8a86a8" />
    <text x={-120} y={70} fontFamily="VpnMont" fontWeight={900} fontSize={26} fill={INK}>ПАРОЛЬ</text>
    <rect x={-120} y={82} width={240} height={52} rx={12} fill="#ffffff" stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.round(8 * clamp01(typed)) }, (_, k) => <circle key={k} cx={-96 + k * 26} cy={108} r={9} fill={INK} />)}
    <rect x={-120} y={170} width={240} height={64} rx={32} fill="#3a8af0" stroke={INK} strokeWidth={7} />
    <text x={0} y={213} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={32} fill="#ffffff">ВОЙТИ</text>
  </g>
);
// ключ-пароль
const Key: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <Glow x={0} y={0} r={130} g="gY" o={0.7} />
    <circle cx={-50} cy={0} r={40} fill={YEL} stroke={INK} strokeWidth={8} /><circle cx={-50} cy={0} r={14} fill="#1a1440" stroke={INK} strokeWidth={5} />
    <rect x={-12} y={-12} width={120} height={24} fill={YEL} stroke={INK} strokeWidth={7} />
    <rect x={70} y={10} width={16} height={26} fill={YEL} stroke={INK} strokeWidth={6} /><rect x={96} y={10} width={14} height={20} fill={YEL} stroke={INK} strokeWidth={6} />
  </g>
);
// слои защиты: щит VPN — только один слой из нескольких
const Layers: React.FC<{ x: number; y: number; s?: number; f: number; n: number }> = ({ x, y, s = 1, f, n }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[["#ff6fb5", 360], ["#5ae0ff", 290], [YEL, 220]].map(([c, r], i) => i < n ? <circle key={i} cx={0} cy={0} r={(r as number) + Math.sin(f * 0.1 + i) * 6} fill="none" stroke={c as string} strokeWidth={26} strokeDasharray={i ? "60 26" : undefined} opacity={0.9} /> : null)}
    <ShieldLock x={0} y={0} s={1.0} />
  </g>
);
// значки-советы: обновление, двухфакторная защита, не открывать ссылки
const TipUpdate: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={0} r={95} fill="#3a8af0" stroke={INK} strokeWidth={9} />
    <g transform={`rotate(${f * 4})`}><path d="M -50 -10 A 52 52 0 0 1 40 -32" stroke="#ffffff" strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M 26 -54 L 48 -28 L 18 -18" fill="#ffffff" stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" />
      <path d="M 50 10 A 52 52 0 0 1 -40 32" stroke="#ffffff" strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M -26 54 L -48 28 L -18 18" fill="#ffffff" stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" /></g></g>
);
const Tip2FA: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={0} r={95} fill="#3ad87a" stroke={INK} strokeWidth={9} />
    <rect x={-40} y={-62} width={80} height={124} rx={14} fill="#2a2450" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((k) => <rect key={k} x={-28 + k * 20} y={-14} width={16} height={26} rx={4} fill="#ffffff" />)}</g>
);
const TipLink: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={0} r={95} fill="#ff4a6a" stroke={INK} strokeWidth={9} />
    <rect x={-56} y={-20} width={60} height={40} rx={20} fill="none" stroke="#ffffff" strokeWidth={12} /><rect x={-4} y={-20} width={60} height={40} rx={20} fill="none" stroke="#ffffff" strokeWidth={12} />
    <path d="M -64 -64 L 64 64" stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d="M -64 -64 L 64 64" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" /></g>
);
// кафе с общим Wi-Fi
const Cafe: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-700} y={-620} width={1400} height={620} fill="#b85a6a" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-720 + i * 160} y={-680} width={160} height={70} fill={i % 2 ? "#ffffff" : "#ff6fb5"} stroke={INK} strokeWidth={6} />)}
    <rect x={-640} y={-560} width={1280} height={360} rx={16} fill="#ffd9a0" stroke={INK} strokeWidth={8} />
    <rect x={-250} y={-860} width={500} height={110} rx={24} fill="#1a1240" stroke={YEL} strokeWidth={10} />
    <text x={-60} y={-786} textAnchor="middle" fontFamily="VpnMont" fontWeight={900} fontSize={66} fill={YEL}>КАФЕ</text>
    <g transform="translate(140 -805)">{[0, 1, 2].map((k) => <path key={k} d={`M ${-24 - k * 20} ${-k * 18} A ${30 + k * 20} ${30 + k * 20} 0 0 1 ${24 + k * 20} ${-k * 18}`} stroke="#5ae0ff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={(Math.floor(f / 8) % 4) > k ? 1 : 0.3} />)}<circle cx={0} cy={10} r={9} fill="#5ae0ff" /></g>
    <Glow x={140} y={-820} r={200} g="gC" o={0.6} />
  </g>
);

// ---------- склейки по словам ----------
type Shot = { at: string; n?: number; s: (g: number, f: number, len: number) => React.ReactNode; over?: (g: number, f: number, len: number) => React.ReactNode };
const Hero = (p: any) => <Bean look={HERO2D} {...p} />;
const HX = 1500;
const SHOTS: Shot[] = [
  // 0–5 с: хук
  { at: "", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 640, z: 1.35, r: -3 }, { x: HX, y: 660, z: 1.55, r: 2 })} f={f} crowd={false}>
      <Hacker x={HX + 330} y={1000} s={0.8} f={f} />
      <Hero x={HX - 120} y={1080} s={1.25} f={f} expr="grin" holdR={{ node: <ShieldLock x={0} y={-90} s={0.5} />, rot: 0 }} pose={{ armR: [130, 30], armL: [30, 20] }} /></World></Frame>,
    over: (g) => <BigText lines={[["VPN ЗАЩИТИТ", "#ffffff"], ["ОТ ХАКЕРОВ?", YEL]]} y={330} size={118} p={g / 7} shake={g < 10 ? Math.sin(g * 3) * 10 : 0} /> },
  { at: "На", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 700, z: 1.55 }, { x: HX, y: 720, z: 1.75 })} f={f} crowd={false}>
    <Hero x={HX} y={1080} s={1.3} f={f} expr="neutral" pose={{ armR: [150, 70], armL: [20, 10], tilt: Math.sin(f * 0.08) * 8 }} />
    <QMark x={HX - 260} y={420} f={f} /><QMark x={HX + 270} y={360} s={1.3} f={f} /></World></Frame> },
  // 5–17 с: зашифрованное соединение, общественный Wi-Fi
  { at: "VPN", n: 2, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX + 200, y: 300, z: 0.75 }, { x: HX + 300, y: 220, z: 0.7 })} f={f}
      back={<ServerTower x={HX + 700} y={BASE + 200} s={0.9} f={f} />}>
    <Hero x={HX} y={1080} s={0.95} f={f} expr="grin" holdR={{ node: <Phone x={0} y={-60} s={0.32} on={1} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} />
    <Tunnel a={[HX + 60, 600]} b={[HX + 640, -330]} lift={300} p={ip(g, [4, 40], [0, 1])} f={f} w={70} pk={clamp01((g - 40) / 30)} /></World></Frame> },
  { at: "Это", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 1700, y: 360, z: 1.05 }, { x: 1700, y: 380, z: 1.12 })} f={f} crowd={false}>
    <Tunnel a={[800, 600]} b={[2700, 600]} lift={0} p={1} f={f} w={220} pk={(g % 45) / 45} />
    <Hacker x={1720} y={1080} s={1.1} f={f} expr={g > 30 ? "sad" : "smirk"} />
    {g > 30 ? <><QMark x={1520} y={260} f={f} /><QMark x={1900} y={220} s={0.8} f={f} /></> : null}</World></Frame> },
  { at: "Например", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: 1800, y: 520, z: 0.8 }, { x: 1800, y: 540, z: 0.86 })} f={f} crowd={false}
      back={<Cafe x={1800} y={BASE + 160} f={f} />}>
    {[0, 1, 2, 3, 4].map((i) => <Bean key={i} x={1250 + i * 270} y={1060 + (i % 2) * 30} s={0.75} look={i === 2 ? HERO2D : LOOKS[i + 1]} f={f + i * 11} expr={i === 2 ? "grin" : "neutral"} holdR={{ node: <Phone x={0} y={-60} s={0.3} on={1} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} />)}
    <Hacker x={2550} y={1100} s={0.85} f={f} flip />
  </World></Frame> },
  // 17–30 с: VPN не остановит вирусы, фишинг и вредоносные файлы
  { at: "Но", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 680, z: 1.4 }, { x: HX, y: 700, z: 1.55 })} f={f} crowd={false}>
    <Hero x={HX} y={1080} s={1.3} f={f} expr="shock" open={0.7} sweat pose={{ armL: [150, 60], armR: [150, 60] }} /></World></Frame>,
    over: (g) => <BigText lines={[["НО ЕСТЬ", "#ffffff"], ["ПРОБЛЕМА!", "#ff5a6a"]]} y={330} size={120} p={g / 6} shake={g < 10 ? Math.sin(g * 3) * 10 : 0} /> },
  { at: "VPN", n: 3, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 560, z: 1.0 }, { x: HX, y: 580, z: 1.08 })} f={f} crowd={false}>
    <ShieldLock x={HX - 180} y={560} s={1.1} />
    <Virus x={HX - 330} y={240 + 60 * Math.sin(g * 0.05)} s={0.9 * clamp01((f - at("вирусы") + 3) / 6)} f={f} />
    <HookMail x={HX + 30} y={260} s={0.75 * clamp01((f - at("фишинговые") + 3) / 6)} f={f} />
    <BadFile x={HX + 330} y={260} s={0.95 * clamp01((f - at("вредоносные") + 3) / 6)} f={f} />
    <Hero x={HX + 300} y={1080} s={0.9} f={f} expr="shock" open={0.5} sweat pose={{ armL: [100, 40], armR: [100, 40] }} /></World></Frame> },
  { at: "Он", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 560, z: 1.0 }, { x: HX, y: 580, z: 1.08 })} f={f} crowd={false}>
    <Tunnel a={[600, 200]} b={[2500, 200]} lift={0} p={1} f={f} w={160} pk={(g % 40) / 40} />
    <GiftBox x={HX + 140} y={1060} s={1.0} f={f} open={ip(f, [at("скачиваешь") - 6, at("скачиваешь") + 6], [0, 1], Easing.out(Easing.back(2)))} />
    <Hero x={HX - 250} y={1080} s={1.1} f={f} expr={f > at("скачиваешь") ? "shock" : "grin"} open={0.6} sweat={f > at("скачиваешь")} pose={{ armR: [60, 30] }} /></World></Frame> },
  // 30–43 с: фишинговая ссылка и кража пароля
  { at: "Если", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX + 100, y: 560, z: 0.95 }, { x: HX + 100, y: 580, z: 1.02 })} f={f} crowd={false}>
    <Hacker x={HX + 420} y={1080} s={1.05} f={f} expr="smirk" flip />
    <HookMail x={ip(g, [0, 30], [HX + 320, HX - 150])} y={ip(g, [0, 30], [520, 640])} s={0.8} f={f} />
    <Hero x={HX - 280} y={1080} s={1.05} f={f} expr="neutral" holdR={{ node: <Phone x={0} y={-60} s={0.32} on={1} f={f} />, rot: -10 }} pose={{ armR: [120, 20] }} /></World></Frame> },
  { at: "Ты", n: 3, s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX + 100, y: 540, z: 1.0 }, { x: HX + 100, y: 560, z: 1.06 })} f={f} crowd={false}>
    <FakeLogin x={HX - 180} y={480} s={0.95} f={f} typed={ip(g, [4, 30], [0, 1])} />
    {g > 30 ? <Key x={ip(g, [30, 55], [HX - 180, HX + 400])} y={ip(g, [30, 55], [560, 520]) - 120 * Math.sin(clamp01((g - 30) / 25) * Math.PI)} s={1.0} rot={g * 6} /> : null}
    <Hacker x={HX + 400} y={1080} s={1.0} f={f} expr={g > 50 ? "laugh" : "smirk"} laptop={false} flip /></World></Frame> },
  // 43–55 с: дополнительный уровень защиты, советы
  { at: "Получается", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 560, z: 1.0 }, { x: HX, y: 580, z: 1.08 })} f={f} crowd={false}>
    <Layers x={HX - 120} y={500} s={0.85} f={f} n={1} />
    <Virus x={HX - 400} y={300} s={0.6} f={f} /><BadFile x={HX + 400} y={300} s={0.7} f={f} />
    <Hero x={HX + 330} y={1080} s={0.85} f={f} expr="neutral" pose={{ armL: [60, 30], armR: [60, 30] }} /></World></Frame> },
  { at: "Поэтому", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 560, z: 1.0 }, { x: HX, y: 580, z: 1.06 })} f={f} crowd={false}>
    <Layers x={HX} y={430} s={0.8} f={f} n={1 + (f > at("обновляй") ? 1 : 0) + (f > at("двухфакторную") ? 1 : 0)} />
    {f > at("обновляй") ? <TipUpdate x={HX - 330} y={830} s={0.9} f={f} /> : null}
    {f > at("двухфакторную") ? <Tip2FA x={HX} y={830} s={0.9} /> : null}
    {f > at("подозрительные") ? <TipLink x={HX + 330} y={830} s={0.9} /> : null}</World></Frame> },
  // 55–60 с: финал
  { at: "Запомни", s: (g, f, len) => <Frame><World cam={lerpCam(g, len, { x: HX, y: 700, z: 1.3 }, { x: HX, y: 720, z: 1.4 })} f={f} flick={1} crowd={false}>
    <Hero x={HX} y={1080} s={1.25} f={f} expr="grin" holdR={{ node: <ShieldLock x={0} y={-90} s={0.5} />, rot: 0 }} pose={{ armR: [130, 30] }} /></World></Frame>,
    over: (g) => <BigText lines={[["VPN ЗАЩИЩАЕТ", "#ffffff"], ["СОЕДИНЕНИЕ,", "#5aff9a"], ["НО НЕ ДЕЛАЕТ", "#ffffff"], ["ТЕБЯ НЕУЯЗВИМЫМ!", YEL]]} y={260} size={78} p={g / 7} /> },
  { at: "Подписывайся", s: (g, f, len) => <Frame dark={ip(g, [len - 30, len], [0, 0.6])}><World cam={lerpCam(g, len, { x: 2000, y: 700, z: 1.3 }, { x: 2000, y: 720, z: 1.38 })} f={f} flick={1} crowd={false}>
    <Hero x={2000} y={1080} s={1.25} f={f} expr="grin" pose={{ armR: [150 + Math.sin(f * 0.4) * 22, 40], armL: [20, 10] }} /></World></Frame> },
];
const STARTS = SHOTS.map((s, i) => (i === 0 ? 0 : at(s.at, s.n) - 3));
STARTS.forEach((v, i) => { if (i && v <= STARTS[i - 1]) throw new Error(`склейки не по порядку: сцена ${i} («${SHOTS[i].at}»)`); });

export const HackShort: React.FC = () => {
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
      <Audio src={staticFile("hack/mix.wav")} />
    </AbsoluteFill>
  );
};
void PROVIDER; void GUARD; void Badge; void Cloak; void Cookie; void Account; void Speedo; void PhoneX; void Gear; void MapScene; void Shop; void OldPhone; void SiteBuilding; void Dash; void KZ_P;
