// Пробный ролик 16:9 «Imagine never seeing again» (10,5 сек) + обложка 1280×720.
// Стиль по описанию пользователя: яркая плоская 2D-мультяшка, толстый чёрный контур, розово-фиолетово-синий
// ночной свет с жёлтыми огнями. Герой — HERO2D (src/toontest/bean.tsx), у всех мутные глаза (blind).
// Рендер: bash scripts/make.sh blind   Обложка: npx remotion still src/blind/index.ts Thumb-blind videos/blind_thumb.png
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bean, BeanDefs, BeanLook, BeanPose, HERO2D, NEIGHBOR_A, NEIGHBOR_B } from "../toontest/bean";
import { VOICE } from "./voice";

const LEAD = 9; // озвучка начинается через 0,3 сек
export const BLIND_FRAMES = Math.round((VOICE.dur + 1.0) * 30);
// кадр, на котором звучит слово (n — какое по счёту повторение); склейки чуть раньше слова
const at = (w: string, n = 1) => { const x = VOICE.words.filter((v) => v.w === w)[n - 1]; return Math.round(x.t * 30) + LEAD; };
const INK = "#16131f";
const YEL = "#ffd23c";
const fontH = delayRender("blind fonts");
new FontFace("BlindMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load().then((f) => { document.fonts.add(f); continueRender(fontH); });

const ip = (f: number, a: number[], b: number[], e = Easing.inOut(Easing.cubic)) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

const LOOKS: BeanLook[] = [
  NEIGHBOR_A, NEIGHBOR_B,
  { head: "#f8f6f0", body: "#5a7cf0", body2: "#3a56c0", limb: "#262838", shoe: "#ffffff", hair: "#2a1a14" },
  { head: "#f2e2c8", body: "#b45ad8", body2: "#8a3ab0", limb: "#262838", shoe: "#2a2a30", hat: "bowler", hatC: "#2a2a40", hatC2: "#ff6fb5" },
  { head: "#f8f6f0", body: "#3cc6d8", body2: "#2496a8", limb: "#262838", shoe: "#f4c430", hair: "#6a3a22" },
  { head: "#f2e2c8", body: "#f4c430", body2: "#c8961a", limb: "#262838", shoe: "#2a2a30", hat: "beanie", hatC: "#d8406a", hatC2: "#ffffff" },
  { head: "#f8f6f0", body: "#ff6f8f", body2: "#d04868", limb: "#262838", shoe: "#ffffff", hair: "#1e1a1a" },
];

// ---------- камера с параллаксом: слой глубины d (0 — небо, 1 — улица) ----------
type Cam = { x: number; y: number; z: number; sx?: number; sy?: number };
const REF = { x: 1800, y: 560 };
const Layer: React.FC<{ cam: Cam; d: number; blur?: number; children: React.ReactNode }> = ({ cam, d, blur, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const x = REF.x + (cam.x - REF.x) * d + (cam.sx ?? 0) * d, y = REF.y + (cam.y - REF.y) * d + (cam.sy ?? 0) * d;
  return <g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};

// ---------- город ----------
const Defs: React.FC = () => (
  <defs>
    <BeanDefs />
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1a0f4a" /><stop offset="45%" stopColor="#5a2a9a" /><stop offset="75%" stopColor="#e0509a" /><stop offset="100%" stopColor="#ffa36a" />
    </linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c2a6a" /><stop offset="100%" stopColor="#1c1a48" /></linearGradient>
    {([["gY", "#ffd860"], ["gP", "#ff5fb0"], ["gR", "#ff3a4a"], ["gC", "#5ae0ff"], ["gW", "#fff2c0"]] as const).map(([id, c]) => (
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
const FAR = makeBlds(7, -1400, 5200, 380, 760, ["#3a2a86", "#46309a", "#33267a"]);
const MID = makeBlds(19, -900, 4700, 260, 560, ["#5a3ac0", "#7a3aa8", "#3a4ab8", "#8a4a9a"]);
const BASE = 705; // низ домов

const Building: React.FC<{ b: Bld; f: number; win: number; far?: boolean }> = ({ b, f, win, far }) => {
  const top = BASE - b.h, cols = Math.max(2, Math.floor((b.w - 30) / (win * 1.9))), rows = Math.floor((b.h - 60) / (win * 2.1));
  const gx = (b.w - cols * win) / (cols + 1);
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h + 40} fill={b.c} stroke={INK} strokeWidth={6} />
      <rect x={b.x + b.w - 16} y={top + 3} width={13} height={b.h + 34} fill="#ff6fb5" opacity={far ? 0.35 : 0.6} />
      <rect x={b.x - 6} y={top - 14} width={b.w + 12} height={18} fill={b.c} stroke={INK} strokeWidth={6} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols); const on = b.lit[i % 80];
        return <rect key={i} x={b.x + gx + cx * (win + gx)} y={top + 40 + cy * win * 2.1} width={win} height={win * 1.3} rx={3} fill={on ? YEL : "#241a5a"} stroke={INK} strokeWidth={far ? 3 : 4} />;
      })}
      {b.sign !== undefined && !far ? (() => {
        const c = ["#ff5fb0", "#5ae0ff", YEL][b.sign]; const flick = b.sign === 1 && f % 47 < 3 ? 0.3 : 1;
        return <g opacity={flick}><Glow x={b.x + b.w / 2} y={top + 70} r={150} g={["gP", "gC", "gY"][b.sign]} o={0.8} />
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
  const on = Math.floor((f + ph) / 14) % 2 === 0; // мигает жёлтым — все светофоры сбились
  const red = ph % 2 === 0;
  return (
    <g>
      <rect x={x - 8} y={y - 360} width={16} height={360} fill="#2a2450" stroke={INK} strokeWidth={5} />
      <rect x={x - 32} y={y - 500} width={64} height={156} rx={14} fill="#1c1838" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => {
        const c = i === 0 ? (red ? "#ff3a4a" : "#4a2a3a") : i === 1 ? (on ? YEL : "#4a4030") : "#24443a";
        return <circle key={i} cx={x} cy={y - 472 + i * 50} r={17} fill={c} stroke={INK} strokeWidth={4} />;
      })}
      {red ? <Glow x={x} y={y - 472} r={110} g="gR" /> : null}
      {on ? <Glow x={x} y={y - 422} r={120} g="gY" /> : null}
    </g>
  );
};

const Car: React.FC<{ x: number; y: number; s?: number; c: string; rot?: number; flip?: boolean; lights?: boolean; dent?: boolean }> = ({ x, y, s = 1, c, rot = 0, flip, lights = true, dent }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {lights ? <path d="M 150 -66 L 520 -130 L 520 20 Z" fill="url(#beam)" style={{ mixBlendMode: "screen" }} /> : null}
    <ellipse cx={0} cy={2} rx={170} ry={14} fill="rgba(10,6,30,0.45)" />
    <path d={dent ? "M -155 -30 L -155 -72 Q -150 -88 -122 -90 L -72 -92 Q -40 -142 10 -142 L 60 -142 Q 92 -140 112 -98 L 128 -84 L 140 -100 L 152 -70 L 158 -30 Z" : "M -155 -30 L -155 -72 Q -150 -88 -122 -90 L -72 -92 Q -40 -142 10 -142 L 60 -142 Q 92 -140 112 -98 L 140 -92 Q 158 -88 158 -70 L 158 -30 Z"} fill={c} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d="M -58 -94 Q -32 -130 6 -130 L 6 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 20 -130 L 56 -130 Q 80 -128 96 -94 L 20 -94 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -150 -58 L 154 -58" stroke={INK} strokeWidth={4} opacity={0.5} />
    <rect x={142} y={-80} width={18} height={14} rx={5} fill="#fff2c0" stroke={INK} strokeWidth={4} />
    <rect x={-160} y={-80} width={14} height={14} rx={4} fill="#ff3a4a" stroke={INK} strokeWidth={4} />
    {lights ? <><Glow x={152} y={-73} r={60} g="gW" /><Glow x={-154} y={-73} r={45} g="gR" /></> : null}
    {[-95, 95].map((k) => <g key={k}><circle cx={k} cy={-28} r={30} fill="#1c1a2a" stroke={INK} strokeWidth={6} /><circle cx={k} cy={-28} r={12} fill="#b8b4d0" /></g>)}
  </g>
);

const Smoke: React.FC<{ x: number; y: number; f: number; n?: number }> = ({ x, y, f, n = 7 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = ((f * 0.9 + i * 13) % 80) / 80;
      const r = 26 + t * 70;
      return <circle key={i} cx={x + Math.sin(i * 2.1 + t * 3) * 40 + t * 30} cy={y - t * 320} r={r} fill={i % 2 ? "#8a7fb8" : "#a497cc"} stroke={INK} strokeWidth={5} opacity={Math.min(1, (1 - t) * 1.6)} />;
    })}
  </g>
);

// ---------- люди ----------
const walkPose = (f: number, sp = 0.28, grope = true, a = 0): BeanPose => {
  const p = Math.sin(f * sp + a);
  return { legL: 4 + p * 16, legR: 4 - p * 16, bob: Math.abs(p) * 7, lean: -3,
    armL: grope ? [100 + Math.sin(f * 0.15 + a) * 12, -20] : [12 + p * 18, 8], armR: grope ? [96 + Math.sin(f * 0.15 + a + 1.5) * 12, -18] : [12 - p * 18, 8], tilt: Math.sin(f * 0.07 + a) * 9 };
};
type Npc = { x: number; y: number; s: number; look: number; a: number; vx: number; expr?: "shock" | "sad" | "neutral" };
const CROWD: Npc[] = [
  { x: 380, y: 760, s: 0.42, look: 0, a: 0, vx: 0.6 }, { x: 760, y: 790, s: 0.46, look: 3, a: 2, vx: -0.4 }, { x: 1020, y: 745, s: 0.4, look: 4, a: 4, vx: 0.5 },
  { x: 1500, y: 820, s: 0.5, look: 1, a: 1, vx: 0.8 }, { x: 1700, y: 770, s: 0.44, look: 5, a: 3, vx: -0.6 }, { x: 2050, y: 850, s: 0.52, look: 2, a: 5, vx: 0.4 },
  { x: 2950, y: 780, s: 0.45, look: 6, a: 2.5, vx: -0.5 }, { x: 3250, y: 830, s: 0.5, look: 0, a: 1.2, vx: 0.6 }, { x: 3500, y: 760, s: 0.42, look: 3, a: 3.3, vx: -0.3 },
  { x: 560, y: 900, s: 0.6, look: 5, a: 0.7, vx: 0.7 }, { x: 2700, y: 920, s: 0.62, look: 4, a: 2.2, vx: -0.7 },
];
const Crowd: React.FC<{ f: number; skip?: (n: Npc) => boolean }> = ({ f, skip }) => (
  <g>{CROWD.filter((n) => !skip?.(n)).sort((a, b) => a.y - b.y).map((n, i) => (
    <Bean key={i} x={n.x + f * n.vx} y={n.y} s={n.s} look={LOOKS[n.look]} expr={i % 3 === 0 ? "sad" : "shock"} open={0.4 + 0.3 * Math.sin(f * 0.2 + n.a)} f={f} blind flip={n.vx < 0} pose={walkPose(f, 0.22, true, n.a)} />
  ))}</g>
);

// пара: держатся за руки и ищут помощи
const Pair: React.FC<{ x: number; y: number; s: number; f: number; a?: number }> = ({ x, y, s, f, a = 0 }) => (
  <g>
    <Bean x={x} y={y} s={s} look={LOOKS[2]} expr="shock" open={0.5} f={f} blind pose={{ ...walkPose(f, 0.2, true, a), armR: [70, 20] }} />
    <Bean x={x + 200 * s} y={y} s={s * 0.96} look={LOOKS[6]} expr="sad" f={f} blind pose={{ ...walkPose(f, 0.2, true, a + 2), armL: [70, 20] }} />
  </g>
);

const World: React.FC<{ cam: Cam; f: number; crash: number; chain?: number; hero?: React.ReactNode; crowd?: boolean; near?: React.ReactNode }> = ({ cam, f, crash, chain, hero, crowd = true, near }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <Layer cam={cam} d={0.08}>
      <rect x={-3000} y={-1500} width={9000} height={2700} fill="url(#sky)" />
      <circle cx={1300} cy={250} r={90} fill="#fff0d0" stroke={INK} strokeWidth={6} /><Glow x={1300} y={250} r={320} g="gP" />
      {[[300, 160], [2200, 120], [2900, 260], [700, 320]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#fff" opacity={0.8} />)}
    </Layer>
    <Layer cam={cam} d={0.4} blur={4}>{FAR.map((b, i) => <Building key={i} b={{ ...b, h: b.h + 120 }} f={f} win={22} far />)}</Layer>
    <Layer cam={cam} d={0.7} blur={2}>
      {MID.map((b, i) => <Building key={i} b={b} f={f + i * 7} win={30} />)}
    </Layer>
    <Layer cam={cam} d={1}>
      {/* дальний тротуар, дорога, ближний тротуар */}
      <rect x={-2000} y={BASE} width={9000} height={60} fill="#6a4ab0" stroke={INK} strokeWidth={6} />
      <rect x={-2000} y={765} width={9000} height={210} fill="url(#road)" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + i * 180} y={862} width={90} height={12} rx={6} fill={YEL} opacity={0.85} />)}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1180 + i * 38} y={775} width={22} height={186} fill="#e8e4ff" opacity={0.75} />)}
      <rect x={-2000} y={975} width={9000} height={600} fill="#7a58c8" stroke={INK} strokeWidth={6} />
      <rect x={-2000} y={975} width={9000} height={22} fill="#9a7ae0" />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-1500 + i * 260} 997 L ${-1580 + i * 260} 1575`} stroke={INK} strokeWidth={4} opacity={0.35} />)}
      {[-300, 700, 1900, 3100, 4100].map((x) => <Lamp key={x} x={x} y={BASE + 30} />)}
      <TrafficLight x={1120} y={BASE + 40} f={f} ph={0} /><TrafficLight x={2280} y={BASE + 40} f={f} ph={7} />
      {/* брошенные машины */}
      <Car x={-150} y={845} c="#3cc6d8" rot={-4} lights={false} />
      <Car x={3500} y={930} c="#f4c430" rot={6} flip />
      {/* авария: синяя и красная машины лоб в лоб */}
      <g>
        <Car x={2400 - 330 * (1 - crash) - 40 * crash} y={905} c="#5a7cf0" rot={-8 * crash} dent={crash > 0.99} />
        <Car x={2700 + 330 * (1 - crash) + 30 * crash} y={905} c="#ff4a6a" rot={10 * crash} flip dent={crash > 0.99} />
        {crash > 0.99 ? <><Smoke x={2540} y={820} f={f} /><Glow x={2540} y={830} r={200} g="gY" o={0.6 + 0.3 * Math.sin(f * 0.7)} /></> : null}
      </g>
      {crowd ? <Crowd f={f} skip={(n) => crash > 0 && Math.abs(n.x + f * n.vx - 2550) < 300 && n.y > 800} /> : null}
      {chain !== undefined ? <Chain f={f} x={chain} /> : null}
      <Pair x={3000} y={1080} s={0.78} f={f} a={1} />
      {hero}
      {near}
    </Layer>
  </svg>
);

// цепочка: каждый держит предыдущего за плечо
const Chain: React.FC<{ f: number; x: number }> = ({ f, x }) => (
  <g>{[0, 1, 2, 3].map((i) => {
    const s = 0.7, px = x - i * 190 * s;
    const w = walkPose(f, 0.24, i === 0, i * 0.8);
    return <Bean key={i} x={px} y={1010} s={s} look={LOOKS[[4, 0, 5, 3][i]]} expr={i % 2 ? "sad" : "shock"} open={0.5} f={f} blind
      pose={i === 0 ? w : { ...w, armR: [92, -6], armL: [40, 30] }} />;
  })}</g>
);

// ---------- финал/обложка: герой тянется вперёд ----------
const HeroReach: React.FC<{ x: number; y: number; s: number; f: number; step?: boolean }> = ({ x, y, s, f, step }) => {
  const p = step ? Math.sin(f * 0.16) : 0;
  return <Bean x={x} y={y} s={s} look={HERO2D} expr="shock" open={0.7 + 0.2 * Math.sin(f * 0.3)} f={f} blind sweat
    pose={{ armL: [118 + Math.sin(f * 0.12) * 8, -30], armR: [108 + Math.sin(f * 0.12 + 1.3) * 8, -24], lean: -4 + p * 2, tilt: 7 + Math.sin(f * 0.06) * 5, legL: 6 + p * 10, legR: 6 - p * 10, bob: Math.abs(p) * 6 }} />;
};

const Grade: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 15% 0%, rgba(255,80,170,0.25), rgba(0,0,0,0) 55%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(30,20,110,0.35) 100%)" }} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 ${260 + dark * 200}px ${60 + dark * 120}px rgba(14,6,40,${0.6 + dark * 0.3})` }} />
  </>
);

// ---------- ролик ----------
const CUTS = [0, at("Not") - 3, at("Everyone") - 3, at("Cars") - 3, at("Strangers") - 3, at("And") - 3, BLIND_FRAMES];
const CRASH = at("crash");

export const BlindFilm: React.FC = () => {
  const f = useCurrentFrame();
  const shot = CUTS.findIndex((c, i) => f >= c && f < CUTS[i + 1]);
  const g = f - CUTS[shot];
  const crash = ip(f, [CUTS[3], CRASH], [0, 1], Easing.in(Easing.quad));
  const shake = f >= CRASH && f < CRASH + 14 ? (CRASH + 14 - f) * 2.4 : 0;
  let cam: Cam; let hero: React.ReactNode = null; let crowd = true; let chain: number | undefined; let dark = 0;
  const blindAt = at("can") - 2; // «can't see»
  if (shot === 0) {
    const isBlind = f >= blindAt;
    cam = { x: 1120 + g * 0.3, y: 470, z: ip(g, [0, 92], [1.65, 1.95]) };
    const look = Math.sin(f * 0.09) * 8;
    hero = <Bean x={1120} y={1050} s={1.45} look={HERO2D} expr={isBlind ? "shock" : "neutral"} open={isBlind ? 0.8 : 0} f={f} blind={isBlind} sweat={isBlind}
      pose={isBlind ? { armL: [150, 70], armR: [150, 70], tilt: Math.sin(f * 0.5) * 3, lean: -2 } : { armL: [12, 8], armR: [14, 8], tilt: look }} />;
    crowd = false;
  } else if (shot === 1) {
    cam = { x: ip(g, [0, 28], [1150, 1300]), y: 640, z: 1.25 };
    hero = <><HeroReach x={1120} y={1060} s={0.95} f={f} /><Bean x={1560} y={985} s={0.72} look={LOOKS[0]} expr="shock" open={0.6} f={f} blind flip pose={walkPose(f, 0.2, true, 1)} /></>;
  } else if (shot === 2) {
    cam = { x: ip(g, [0, 29], [1850, 1950]), y: ip(g, [0, 29], [600, 560]), z: 0.62 };
    hero = <HeroReach x={1120} y={1060} s={0.8} f={f} step />;
  } else if (shot === 3) {
    cam = { x: 2560, y: 700, z: ip(g, [0, 42], [1.25, 1.4]), sx: Math.sin(f * 2.1) * shake, sy: Math.cos(f * 1.7) * shake };
  } else if (shot === 4) {
    chain = 950 + g * 4.2;
    cam = { x: 820 + g * 4.2, y: 720, z: 1.35 };
  } else {
    cam = { x: ip(g, [0, 72], [1180, 1080]), y: ip(g, [0, 72], [620, 600]), z: ip(g, [0, 72], [1.45, 1.05], Easing.out(Easing.cubic)) };
    hero = <HeroReach x={1330} y={1075} s={1.0} f={f} step />;
    dark = ip(g, [20, 72], [0, 1]);
  }
  const flash = shot === 3 ? ip(f, [CRASH, CRASH + 2, CRASH + 9], [0, 0.85, 0], Easing.linear) : 0;
  const blackout = ip(f, [blindAt - 3, blindAt, blindAt + 4, blindAt + 14], [0, 0.92, 0.92, 0], Easing.linear);
  return (
    <AbsoluteFill style={{ background: "#120a30" }}>
      <World cam={cam} f={f} crash={shot >= 3 ? crash : 0} chain={chain} hero={hero} crowd={crowd} />
      <Grade dark={dark} />
      <AbsoluteFill style={{ background: "#fff6d0", opacity: flash }} />
      <AbsoluteFill style={{ background: "#07030f", opacity: blackout }} />
      <Sequence from={LEAD}><Audio src={staticFile("blind/voice.mp3")} volume={1} /></Sequence>
      <Audio src={staticFile("blind/sfx.wav")} volume={0.22} endAt={BLIND_FRAMES} />
    </AbsoluteFill>
  );
};

// ---------- обложка ----------
const Title: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode }> = ({ x, y, size, fill, children }) => (
  <g>
    <text x={x + size * 0.05} y={y + size * 0.09} fontFamily="BlindMont" fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.22} strokeLinejoin="round" letterSpacing={-size * 0.03}>{children}</text>
    <text x={x} y={y} fontFamily="BlindMont" fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.14} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.03}>{children}</text>
  </g>
);
export const ThumbBlind: React.FC = () => {
  const f = 40;
  return (
    <AbsoluteFill style={{ background: "#120a30" }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>
        <World cam={{ x: 1640, y: 560, z: 1.12 }} f={f} crash={1} crowd
          hero={<HeroReach x={1960} y={1330} s={1.6} f={f} />} />
        <Grade />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <Title x={60} y={210} size={168} fill="#ffffff">IMAGINE</Title>
          <Title x={60} y={400} size={168} fill={YEL}>NEVER</Title>
          <Title x={60} y={590} size={168} fill={YEL}>SEEING</Title>
          <Title x={60} y={780} size={168} fill="#ffffff">AGAIN...</Title>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
