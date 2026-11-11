// Часть 6/10: дни 11–14 — заправки не работают, костёр в бочке на крыше, затопленное метро, ночь-лабиринт.
import React from "react";
import { Bean, Cam, Defs, Frame, Glow, HERO2D, Layer, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, Flashlight, GY, HS, Hero, INK, Rooftop, SkyDefs, Skyline, Stars, Street, Svg, Torch, YEL, walk, walkDx } from "./scenes";
import { VOICE } from "./voices/p6";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const sx = (wx: number, cam: Cam) => 960 + (wx - cam.x) * cam.z;
const sy = (wy: number, cam: Cam) => 540 + (wy - cam.y) * cam.z;
const TORCH = { node: <Flashlight />, k: 1.3, rot: 0 };
const Canister: React.FC = () => <g><rect x={-34} y={-90} width={68} height={90} rx={8} fill="#ff4a3a" stroke={INK} strokeWidth={5} /><rect x={-10} y={-108} width={20} height={20} fill="#262838" stroke={INK} strokeWidth={4} /><path d="M -20 -70 L 20 -30 M 20 -70 L -20 -30" stroke="#a82a2a" strokeWidth={5} /></g>;
// заправка: навес, колонка, подземные баки (разрез)
const GasStation: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 520} y={GY - 640} width={1040} height={70} fill="#ff6a5a" stroke={INK} strokeWidth={8} />
    {[-440, 440].map((k) => <rect key={k} x={x + k - 22} y={GY - 570} width={44} height={570} fill="#e8e4ff" stroke={INK} strokeWidth={6} />)}
    {[-180, 180].map((k) => <g key={k} transform={`translate(${x + k} ${GY})`}>
      <rect x={-60} y={-280} width={120} height={280} rx={12} fill="#5ad8c8" stroke={INK} strokeWidth={6} />
      <rect x={-40} y={-250} width={80} height={60} rx={6} fill="#1a1a3a" stroke={INK} strokeWidth={4} />
      <path d="M 60 -160 Q 110 -150 100 -60" stroke={INK} strokeWidth={10} fill="none" /><rect x={84} y={-70} width={30} height={50} rx={6} fill="#262838" stroke={INK} strokeWidth={4} />
    </g>)}
  </g>
);
// разрез под заправкой: баки с топливом и насосы без тока (рисуется поверх тротуара)
const Tanks: React.FC<{ x: number; cut: number }> = ({ x, cut }) => (
  <g>
    <g opacity={cut}>
      <rect x={x - 900} y={GY + 40} width={1800} height={700} fill="#4a3a2a" stroke={INK} strokeWidth={6} />
      {[-300, 300].map((k) => <g key={k}><rect x={x + k - 220} y={GY + 220} width={440} height={220} rx={110} fill="#8a86a8" stroke={INK} strokeWidth={8} /><rect x={x + k - 200} y={GY + 320} width={400} height={110} rx={50} fill="#ffd27a" /></g>)}
      {[-180, 180].map((k) => <path key={k} d={`M ${x + k} ${GY} L ${x + k} ${GY + 260}`} stroke="#b8b4d0" strokeWidth={16} />)}
      {[-180, 180].map((k) => <g key={"p" + k} transform={`translate(${x + k} ${GY + 130})`}><circle r={40} fill="#5a5680" stroke={INK} strokeWidth={6} /><path d="M -20 -20 L 20 20 M 20 -20 L -20 20" stroke="#ff3a4a" strokeWidth={8} /></g>)}
    </g>
  </g>
);
// бочка с огнём
const Barrel: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <Glow x={0} y={-200} r={260} g="gO" o={0.8} />
    {[[-40, 0.8, "#ff4a3a"], [30, 0.9, "#ff4a3a"], [0, 1.1, "#ff8a3a"], [-15, 0.7, YEL], [15, 0.6, YEL]].map(([dx, k, c], i) => { const h = 110 * (k as number) * (1 + 0.15 * Math.sin(f * 0.5 + i * 2)), w = 40 * (k as number);
      return <path key={i} d={`M ${(dx as number) - w} -180 Q ${(dx as number) - w} ${-180 - h * 0.5} ${(dx as number) + Math.sin(f * 0.3 + i) * 10} ${-180 - h} Q ${(dx as number) + w} ${-180 - h * 0.5} ${(dx as number) + w} -180 Z`} fill={c as string} stroke={INK} strokeWidth={5} strokeLinejoin="round" />; })}
    <rect x={-80} y={-190} width={160} height={190} rx={14} fill="#5a5680" stroke={INK} strokeWidth={7} />
    {[-130, -60].map((k) => <path key={k} d={`M -80 ${k} L 80 ${k}`} stroke={INK} strokeWidth={6} />)}
    <rect x={-100} y={-200} width={200} height={14} rx={4} fill="#262838" stroke={INK} strokeWidth={4} />
    <g transform="translate(0 -214)"><path d="M -60 0 L 60 0 L 50 -30 L -50 -30 Z" fill="#2a2840" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={-32} rx={40} ry={8} fill="#a8483a" stroke={INK} strokeWidth={3} /></g>
  </g>
);
const BigSmoke: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => <g style={{ filter: "blur(4px)" }}>{Array.from({ length: 7 }, (_, i) => { const t = ((f * 0.5 + i * 15) % 100) / 100; return <circle key={i} cx={x + Math.sin(i + t * 3) * 40 + t * 120} cy={y - t * 700} r={40 + t * 90} fill="#a497cc" opacity={0.55 * (1 - t)} />; })}</g>;
// метро: платформа, рельсы, вода
const Subway: React.FC<{ cam: Cam; water: number; children?: React.ReactNode }> = ({ cam, water, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-800} width={7000} height={GY + 800} fill="#3a3a6a" />
      {Array.from({ length: 60 }, (_, i) => <rect key={i} x={-1600 + (i % 30) * 200} y={GY - 700 + Math.floor(i / 30) * 120} width={200} height={120} fill={(i + Math.floor(i / 30)) % 2 ? "#4a4a7a" : "#44447a"} stroke={INK} strokeWidth={3} />)}
      <path d={`M -2000 ${GY - 760} Q 960 ${GY - 1100} 4000 ${GY - 760}`} stroke={INK} strokeWidth={8} fill="#2a2a5a" />
      {[-900, 0, 900, 1800, 2700].map((x) => <rect key={x} x={x - 30} y={GY - 700} width={60} height={700} fill="#5a5a8a" stroke={INK} strokeWidth={6} />)}
      {/* платформа слева, путь справа (ниже) */}
      <rect x={-2000} y={GY} width={2900} height={700} fill="#6a6a9a" stroke={INK} strokeWidth={8} />
      <rect x={-2000} y={GY} width={2900} height={24} fill={YEL} stroke={INK} strokeWidth={5} />
      <rect x={900} y={GY + 220} width={4000} height={500} fill="#2a2840" stroke={INK} strokeWidth={6} />
      {[960, 1400, 1840, 2280, 2720].map((x) => <rect key={x} x={x} y={GY + 200} width={80} height={24} fill="#5a4a3a" stroke={INK} strokeWidth={4} />)}
      <path d={`M 900 ${GY + 196} L 4900 ${GY + 196}`} stroke="#8a86a8" strokeWidth={10} />
      <rect x={900} y={GY + 220 - water * 240} width={4000} height={700} fill="#1a2a5a" stroke={INK} strokeWidth={5} opacity={0.92} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${1000 + i * 400} ${GY + 230 - water * 240} q 30 -10 60 0`} stroke="#5a7ac0" strokeWidth={5} fill="none" />)}
      {children}
    </Layer>
  </Svg>
);
const Night: React.FC<{ o?: number }> = ({ o = 0.6 }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#03020c" opacity={o} /></svg>;
// звезда-ориентир
const NorthStar: React.FC<{ x: number; y: number; f: number; k?: number }> = ({ x, y, f, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k * (1 + 0.08 * Math.sin(f * 0.2))})`}>
    <Glow x={0} y={0} r={120} g="gW" />
    <path d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#fffbe8" stroke={INK} strokeWidth={3} />
  </g>
);
// перекрёсток ночью: одинаковые тёмные дома с обеих сторон
const NightStreet: React.FC<{ cam: Cam; f: number; star?: number; children?: React.ReactNode }> = ({ cam, f, star = 0, children }) => (
  <>
    <Street cam={cam} f={f} tod="night">{children}</Street>
    <Night o={0.5} />
    {star > 0 ? <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><g opacity={star}><NorthStar x={1500} y={170} f={f} /></g></svg> : null}
  </>
);

export const P6 = makePart(V, [
  // день 11: ищет топливо
  { at: "", s: (g, f, len) => <Street cam={C(1000, 600, 1.0)} f={f} tod="day">
    <Hero x={500 + walkDx(g)} y={GY + 150} f={f} expr="determined" pose={{ ...walk(g), armR: [20, 10] }} holdR={{ node: <g transform="translate(0 90)"><Canister /></g>, k: 1.1 }} /></Street> },
  { at: "gas", s: (g, f, len) => <Street cam={C(1200, GY - 250, 0.8)} f={f} tod="day" back={<GasStation x={1200} />} /> },
  { at: "useless", s: (g, f, len) => <Street cam={C(1200, GY - 230, 1.3)} f={f} tod="day" back={<GasStation x={1200} />}>
    <Hero x={1290} y={GY + 150} f={f} expr={g > 10 ? "sad" : "neutral"} pose={{ armR: [100, 30] }} /></Street> },
  { at: "fuel", n: 2, s: (g, f, len) => <Street cam={camLerp(g, len, C(1200, GY + 50, 0.7), C(1200, GY + 220, 0.7))} f={f} tod="day" back={<GasStation x={1200} />}><Tanks x={1200} cut={ip(g, [0, 12], [0, 1])} /></Street> },
  { at: "pumps", s: (g, f, len) => <Street cam={C(1200, GY + 150, 1.1)} f={f} tod="day" back={<GasStation x={1200} />}><Tanks x={1200} cut={1} /></Street> },
  // день 12: костёр в бочке на крыше
  { at: "twelve", s: (g, f, len) => <Rooftop cam={C(960, GY - 250, 1.3)} f={f} tod="dusk"><Barrel x={900} y={GY - 50} f={f} />
    <Hero x={1150} y={GY - 50} f={f} expr="neutral" gaze={-1} flip pose={{ armR: [80, 10], armL: [15, 8] }} /></Rooftop> },
  { at: "metal", s: (g, f, len) => <Rooftop cam={C(900, GY - 270, 2.4)} f={f} tod="dusk"><Barrel x={900} y={GY - 50} f={f} /></Rooftop> },
  { at: "Smoke", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 300, 1.0), C(960, 300, 0.6))} f={f} tod="dusk"><Barrel x={900} y={GY - 50} f={f} /><BigSmoke x={900} y={GY - 260} f={f} />
    <Hero x={1150} y={GY - 50} f={f} expr="worried" gaze={-1} flip /></Rooftop> },
  { at: "moment", s: (g, f, len) => <Rooftop cam={C(1150, GY - 300, 2.2)} f={f} tod="dusk"><Barrel x={900} y={GY - 50} f={f} />
    <Hero x={1150} y={GY - 50} f={f} expr="worried" gaze={1} pose={{ tilt: 10, armL: [15, 8], armR: [15, 8] }} /></Rooftop> },
  // день 13: метро
  { at: "thirteen", s: (g, f, len) => <Street cam={C(1000, 580, 1.0)} f={f} tod="day" back={<g><rect x={800} y={GY - 520} width={500} height={320} fill="#3a3a6a" stroke={INK} strokeWidth={8} /><rect x={860} y={GY - 460} width={380} height={260} fill="#141228" stroke={INK} strokeWidth={6} /><rect x={760} y={GY - 600} width={580} height={90} fill="#5a7cf0" stroke={INK} strokeWidth={7} /></g>}>
    <Hero x={600 + walkDx(g)} y={GY + 150} f={f} expr="worried" pose={walk(g)} /></Street> },
  { at: "down", s: (g, f, len) => { const cam = C(300, 580, 1.0); return <><Subway cam={cam} water={0.6}>
    <Hero x={-200 + walkDx(g, 0.16)} y={GY} f={f} expr="scared" pose={{ ...walk(g, 0.16), armR: [80, 10] }} holdR={TORCH} /></Subway>
    <Torch cx={sx(100 + walkDx(g, 0.16), cam)} cy={sy(GY - 200, cam)} r={340} /></>; } },
  { at: "groundwater", s: (g, f, len) => { const cam = C(1600, GY + 100, 0.8); return <><Subway cam={cam} water={ip(g, [0, len], [0.5, 0.75])} /><Torch cx={ip(g, [0, len], [900, 1300])} cy={640} r={360} o={0.7} /></>; } },
  { at: "flashlight", n: 1, s: (g, f, len) => { const cam = C(800, GY - 80, 1.5); return <><Subway cam={cam} water={0.9}>
    <Hero x={700} y={GY} f={f} expr="scared" sweat pose={{ armR: [80, 30] }} holdR={TORCH} /></Subway>
    <Torch cx={sx(1150, cam)} cy={sy(GY + 30, cam)} r={300} /></>; } },
  { at: "turn", s: (g, f, len) => { const cam = C(400, 580, 1.2); return <><Subway cam={cam} water={0.95}>
    <Hero x={700 - walkDx(g, 0.3)} y={GY} f={f} expr="scared" flip pose={{ ...walk(g, 0.3), lean: -6, armL: [80, 10] }} holdL={TORCH} /></Subway>
    <Torch cx={sx(500 - walkDx(g, 0.3), cam)} cy={sy(GY - 200, cam)} r={340} /></>; } },
  // день 14: закат, темнеет
  { at: "fourteen", s: (g, f, len) => <Street cam={C(1000, 600, 0.9)} f={f} tod="dusk"><Hero x={600 + walkDx(g)} y={GY + 150} f={f} expr="neutral" pose={walk(g)} /></Street> },
  { at: "sun", s: (g, f, len) => <><Svg><Skyline_ cam={C(960, 520, 0.85)} f={f} /></Svg><Night o={ip(g, [0, len], [0, 0.55])} /></> },
  { at: "Without", n: 2, s: (g, f, len) => <NightStreet cam={C(960, 580, 0.9)} f={f}><Hero x={960} y={GY + 150} f={f} expr="worried" gaze={Math.sin(f * 0.1) > 0 ? 1 : -1} pose={{ tilt: Math.sin(f * 0.1) * 8, armR: [80, 10] }} holdR={TORCH} /></NightStreet> },
  { at: "Every", s: (g, f, len) => <NightStreet cam={C(960 + (Math.floor(g / 15) % 2 ? 600 : 0), 580, 0.9)} f={f}><Hero x={960 + (Math.floor(g / 15) % 2 ? 600 : 0)} y={GY + 150} f={f} expr="scared" gaze={-1} pose={{ armR: [80, 10] }} holdR={TORCH} /></NightStreet> },
  // фонарик мигает и гаснет
  { at: "flickers", s: (g, f, len) => { const on = since("dies", "flickers", g) < 0 && (g % 6 < 4); const cam = C(960, GY - 100, 1.5);
    return <><NightStreet cam={cam} f={f}><Hero x={960} y={GY + 150} f={f} expr="scared" sweat pose={{ armR: [80, 10] }} holdR={{ node: <Flashlight on={on} />, k: 1.3 }} /></NightStreet>
      {on ? <Torch cx={sx(1180, cam)} cy={sy(GY - 50, cam)} r={260} o={0.6} /> : <Night o={0.4} />}</>; } },
  { at: "stand", s: (g, f, len) => <><NightStreet cam={C(960, GY - 140, 1.9)} f={f}><Hero x={960} y={GY + 150} f={f} expr="scared" sweat pose={{ armL: [30, 30], armR: [30, 30], bob: Math.abs(Math.sin(f * 0.9)) * 3 }} /></NightStreet><Night o={0.3} /></> },
  { at: "look", s: (g, f, len) => <><NightStreet cam={C(960, GY - 140, 1.9)} f={f}><Hero x={960} y={GY + 150} f={f} expr="worried" pose={{ tilt: -6, armL: [15, 8], armR: [15, 8] }} /></NightStreet><Night o={0.3} /></> },
  { at: "brightest", s: (g, f, len) => <Frame bg="#05030f"><Defs /><SkyDefs /><rect width={1920} height={1080} fill="#05030f" /><Stars n={160} /><NorthStar x={960} y={480} f={f} k={ip(g, [0, 15], [0.5, 1.6])} /></Frame> },
  { at: "follow", s: (g, f, len) => <NightStreet cam={C(900 + walkDx(g) * 0.9, 580, 0.9)} f={f} star={1}><Hero x={600 + walkDx(g)} y={GY + 150} f={f} expr="determined" pose={walk(g)} /></NightStreet> },
  { at: "block", s: (g, f, len) => <NightStreet cam={C(1500 + walkDx(g) * 0.9, 580, 0.9)} f={f} star={1}><Hero x={1200 + walkDx(g)} y={GY + 150} f={f} expr="determined" pose={walk(g)} /></NightStreet> },
  // дома: правило
  { at: "From", n: 2, s: (g, f, len) => <Apartment cam={C(-140, GY - 280, 2.0)} f={f} tally={14} tod="night" dark={0.45}>
    <Hero x={-80} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [150, ip(g, [0, 20], [-10, 10])], armR: [15, 8], tilt: -8 }} holdL={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} /></Apartment> },
  { at: "always", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(700, GY - 250, 1.8), C(800, 520, 1.0))} f={f} tally={14} tod="night" dark={0.5}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="tired" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
], { id: 6, dir: "bo" });

// закатный город без героя
const Skyline_: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => <Skyline cam={cam} f={f} tod="dusk" midBase={GY + 100} />;
