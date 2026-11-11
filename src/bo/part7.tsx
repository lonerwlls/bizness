// Часть 7/10: дни 15–18 — природа возвращается, пустой стадион и кинотеатр, лица на стене.
import React from "react";
import { Bean, Cam, Glow, HERO2D, Layer, Voice, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, GY, HS, Hero, INK, Street, Svg, YEL, walk, walkDx, ChalkHero, chalkCam } from "./scenes";
import { VOICE } from "./voices/p7";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
// трава из трещин тротуара; grow 0..1
const Weeds: React.FC<{ x: number; y: number; grow: number; f: number; n?: number }> = ({ x, y, grow, f, n = 5 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const h = (40 + (i % 3) * 25) * grow, a = -30 + i * 15 + Math.sin(f * 0.08 + i) * 6;
    return <path key={i} transform={`translate(${x + i * 10} ${y}) rotate(${a})`} d={`M 0 0 Q -8 ${-h * 0.6} 0 ${-h} Q 8 ${-h * 0.6} 0 0 Z`} fill={i % 2 ? "#5ac84a" : "#3aa85a"} stroke={INK} strokeWidth={3} />; })}</g>
);
const Crack: React.FC<{ x: number; y: number }> = ({ x, y }) => <path d={`M ${x - 60} ${y} l 30 -6 l 20 8 l 40 -4 l 30 6`} stroke={INK} strokeWidth={4} fill="none" />;
// светофор, обвитый лозой
const VineLight: React.FC<{ x: number; y: number; grow: number; f: number }> = ({ x, y, grow, f }) => (
  <g>
    <rect x={x - 9} y={y - 420} width={18} height={420} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <rect x={x - 34} y={y - 570} width={68} height={160} rx={14} fill="#1c1838" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <circle key={i} cx={x} cy={y - 540 + i * 50} r={17} fill="#3a3448" stroke={INK} strokeWidth={4} />)}
    <path d={`M ${x - 12} ${y} ${Array.from({ length: 12 }, (_, i) => `Q ${x + (i % 2 ? 26 : -26)} ${y - i * 45 - 22} ${x + (i % 2 ? -12 : 12)} ${y - (i + 1) * 45}`).join(" ")}`} stroke="#3aa85a" strokeWidth={9} fill="none" strokeDasharray={`${grow * 700} 1000`} />
    {Array.from({ length: 9 }, (_, i) => i / 9 < grow ? <path key={i} transform={`translate(${x + (i % 2 ? 22 : -22)} ${y - 30 - i * 55}) rotate(${(i % 2 ? 40 : -140) + Math.sin(f * 0.1 + i) * 5})`} d="M 0 0 Q 14 -12 30 0 Q 14 12 0 0 Z" fill="#5ac84a" stroke={INK} strokeWidth={3} /> : null)}
  </g>
);
const Tree: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -18 0 L -12 -220 L 12 -220 L 18 0 Z" fill="#8a5a3a" stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${Math.sin(f * 0.08) * 3} 0 -220)`}>{[[-70, -280, 90], [60, -300, 95], [0, -360, 110], [-20, -250, 80]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#3aa85a" : "#4ac06a"} stroke={INK} strokeWidth={6} />)}</g>
  </g>
);
const Wind: React.FC<{ f: number }> = ({ f }) => <g>{[0, 1, 2].map((i) => { const x = ((f * 6 + i * 500) % 2200) - 200; return <path key={i} d={`M ${x} ${280 + i * 90} q 60 -30 120 0 t 120 0 q 30 0 30 -30`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />; })}</g>;
// стадион: трибуны, площадка, кольцо
const HOOP: [number, number] = [1500, GY - 560];
const Stadium: React.FC<{ cam: Cam; children?: React.ReactNode }> = ({ cam, children }) => (
  <Svg>
    <Layer cam={cam} d={0.4} blur={2}>
      <rect x={-2000} y={-1500} width={6000} height={2500} fill="#3a2a7a" />
      {Array.from({ length: 12 }, (_, r) => Array.from({ length: 40 }, (_, c) => <rect key={r + "-" + c} x={-1400 + c * 120 + (r % 2) * 60} y={-200 + r * 70} width={90} height={44} rx={8} fill={["#5a7cf0", "#ff6a5a", "#5ad8c8"][(r + c) % 3]} stroke={INK} strokeWidth={3} opacity={0.85} />))}
      <rect x={-2000} y={640} width={6000} height={60} fill="#2a2a5a" stroke={INK} strokeWidth={5} />
    </Layer>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={GY - 40} width={6000} height={900} fill="#c87a4a" stroke={INK} strokeWidth={7} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-2000 + i * 200} ${GY - 40} L ${-2100 + i * 200} ${GY + 800}`} stroke="#a85a3a" strokeWidth={4} />)}
      <path d={`M ${HOOP[0] - 400} ${GY + 200} Q ${HOOP[0] - 200} ${GY - 40} ${HOOP[0] + 100} ${GY - 30}`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} />
      {/* стойка и щит */}
      <rect x={HOOP[0] + 140} y={GY - 760} width={26} height={720} fill="#8a86a8" stroke={INK} strokeWidth={6} />
      <rect x={HOOP[0] + 60} y={GY - 760} width={30} height={220} fill="#f4f2ff" stroke={INK} strokeWidth={6} />
      <path d={`M ${HOOP[0] + 90} ${GY - 640} L ${HOOP[0] + 140} ${GY - 640}`} stroke={INK} strokeWidth={8} />
      <ellipse cx={HOOP[0]} cy={HOOP[1]} rx={62} ry={12} fill="none" stroke="#ff6a3a" strokeWidth={8} />
      <path d={`M ${HOOP[0] - 56} ${HOOP[1] + 4} L ${HOOP[0] - 34} ${HOOP[1] + 80} L ${HOOP[0] + 34} ${HOOP[1] + 80} L ${HOOP[0] + 56} ${HOOP[1] + 4} M ${HOOP[0] - 20} ${HOOP[1] + 10} L ${HOOP[0] - 10} ${HOOP[1] + 80} M ${HOOP[0] + 20} ${HOOP[1] + 10} L ${HOOP[0] + 10} ${HOOP[1] + 80}`} stroke="#fff" strokeWidth={4} fill="none" />
      {children}
    </Layer>
  </Svg>
);
const Ball: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 30 }) => <g><circle cx={x} cy={y} r={r} fill="#ff8a3a" stroke={INK} strokeWidth={5} /><path d={`M ${x - r} ${y} L ${x + r} ${y} M ${x} ${y - r} L ${x} ${y + r}`} stroke={INK} strokeWidth={3} /></g>;
const BALL = <Ball x={0} y={-10} r={32} />;
// бросок: t 0..1 от рук к кольцу
const shot = (t: number, hx: number, hy: number): [number, number] => [hx + (HOOP[0] - hx) * t, hy + (HOOP[1] - 30 - hy) * t - 380 * 4 * t * (1 - t)];
// кинозал: ряды кресел, тёмный экран
const SEATY = GY - 80; // высота сиденья
const Theater: React.FC<{ cam: Cam; children?: React.ReactNode; glow?: number }> = ({ cam, children, glow = 0 }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-1000} width={6000} height={3000} fill="#1a1238" />
      <rect x={260} y={-300} width={1400} height={640} fill="#26204a" stroke={INK} strokeWidth={10} />
      {glow > 0 ? <rect x={260} y={-300} width={1400} height={640} fill="#fff2c0" opacity={glow * 0.15} /> : null}
      {[-1, 1].map((k) => <rect key={k} x={k < 0 ? 140 : 1660} y={-340} width={120} height={720} fill="#a8304a" stroke={INK} strokeWidth={8} />)}
      {[0, 1].map((row) => Array.from({ length: 14 }, (_, i) => { const x = -300 + i * 190 + row * 95, y = GY - 220 + row * 260; return <g key={row + "-" + i}>
        <rect x={x - 70} y={y - 150} width={140} height={160} rx={30} fill="#a8304a" stroke={INK} strokeWidth={6} />
        <rect x={x - 76} y={y} width={152} height={40} rx={12} fill="#c8405a" stroke={INK} strokeWidth={6} /></g>; }))}
      <rect x={-2000} y={GY + 100} width={6000} height={800} fill="#2a1a40" />
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#05030f" opacity={0.35} />
  </Svg>
);
const Popcorn: React.FC = () => <g><path d="M -34 0 L -44 -80 L 44 -80 L 34 0 Z" fill="#fff4f0" stroke={INK} strokeWidth={5} />{[-28, -8, 12, 30].map((k) => <rect key={k} x={k - 6} y={-80} width={12} height={80} fill="#ff4a6a" opacity={0.8} />)}{[-30, -10, 10, 30, -20, 0, 20].map((k, i) => <circle key={i} cx={k} cy={-86 - (i > 3 ? 14 : 0)} r={13} fill="#fff8d8" stroke={INK} strokeWidth={3} />)}</g>;
// афиша на остановке: улыбающаяся семья (без текста)
const FamilyPoster: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-440} width={320} height={440} fill="#9fdcff" stroke={INK} strokeWidth={8} />
    <circle cx={90} cy={-370} r={40} fill={YEL} stroke={INK} strokeWidth={5} />
    {[[-80, 0.5, "#ff6a5a", "#f2e2c8"], [0, 0.35, "#5ad8c8", "#f8f6f0"], [80, 0.52, "#5a7cf0", "#f2e2c8"]].map(([dx, k, c, h], i) => <Bean key={i} x={dx as number} y={-20} s={k as number} look={{ head: h as string, body: c as string, body2: c as string, limb: "#262838", shoe: "#ffffff", hair: "#4a2e1e" }} f={0} expr="grin" shadow={false} pose={{ armL: [40, 20], armR: [40, 20] }} />)}
  </g>
);
// лица мелом на стене (растут по одному)
const Faces: React.FC<{ n: number; big?: boolean }> = ({ n }) => (
  <g stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round">{[[-980, GY - 300, 70], [-800, GY - 320, 60], [-620, GY - 300, 70], [-450, GY - 315, 60], [-290, GY - 305, 65]].slice(0, n).map(([x, y, r], i) => <g key={i}>
    <circle cx={x} cy={y} r={r} /><circle cx={x - r * 0.35} cy={y - r * 0.2} r={6} fill="#fff" /><circle cx={x + r * 0.35} cy={y - r * 0.2} r={6} fill="#fff" />
    <path d={`M ${x - r * 0.45} ${y + r * 0.2} Q ${x} ${y + r * 0.65} ${x + r * 0.45} ${y + r * 0.2}`} /></g>)}</g>
);
const CHALK = { node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 };

export const P7 = makePart(V, [
  // день 15: природа возвращается
  { at: "", s: (g, f, len) => <Apartment cam={chalkCam(14)} f={f} tally={g > 18 ? 15 : 14}>
    <ChalkHero i={14} g={g} f={f} expr="neutral" /></Apartment> },
  { at: "notice", s: (g, f, len) => <Street cam={C(960, 600, 0.95)} f={f} tod="day"><Tree x={300} y={GY + 60} f={f} /><Tree x={1650} y={GY + 60} f={f} s={0.9} />
    <Hero x={960} y={GY + 150} f={f} expr="neutral" gaze={Math.sin(f * 0.06)} pose={{ tilt: 8, armL: [15, 8], armR: [15, 8] }} /></Street> },
  { at: "weeds", s: (g, f, len) => <Street cam={C(960, GY + 80, 2.0)} f={f} tod="day">{[[780, 0], [960, 8], [1150, 16]].map(([x, d]) => <g key={x}><Crack x={x} y={GY + 160} /><Weeds x={x - 20} y={GY + 160} grow={ip(g, [d, d + 20], [0, 1])} f={f} /></g>)}</Street> },
  { at: "Vines", s: (g, f, len) => <Street cam={C(960, GY - 250, 1.3)} f={f} tod="day"><VineLight x={960} y={GY + 60} grow={ip(g, [0, len], [0.1, 1])} f={f} /></Street> },
  { at: "morning", s: (g, f, len) => <Street cam={C(960, 560, 0.9)} f={f} tod="day"><Tree x={500} y={GY + 60} f={f} /><Tree x={1400} y={GY + 60} f={f + 10} s={1.1} /><Wind f={f} />
    <Hero x={960} y={GY + 150} f={f} expr="neutral" pose={{ armL: [15, 8], armR: [15, 8], tilt: 6 }} /></Street> },
  { at: "air", s: (g, f, len) => <Street cam={C(960, GY - 150, 1.8)} f={f} tod="day"><Tree x={1250} y={GY + 60} f={f} />
    <Hero x={960} y={GY + 150} f={f} expr="sleep" pose={{ armL: [40, 30], armR: [40, 30], tilt: -10, bob: Math.sin(f * 0.1) * 4 }} /></Street> },
  { at: "Without", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 560, 0.9), C(960, 250, 0.7))} f={f} tod="day"><Tree x={500} y={GY + 60} f={f} /><VineLight x={1400} y={GY + 60} grow={1} f={f} /></Street> },
  // день 16: стадион
  { at: "sixteen", s: (g, f, len) => <Stadium cam={C(900, 500, 0.75)}><Hero x={300 + walkDx(g)} y={GY + 40} f={f} expr="neutral" pose={{ ...walk(g), armR: [20, 10] }} holdR={{ node: BALL, k: 1 }} /></Stadium> },
  { at: "shoot", s: (g, f, len) => { const hx = 900, t = ip(g, [12, 34], [0, 1], (u) => u); const [bx, by] = shot(t, hx + 60, GY - 300);
    return <Stadium cam={C(1150, GY - 360, 1.0)}>
      <Hero x={hx} y={GY + 40} f={f} expr="determined" pose={g < 12 ? { armL: [160, 20], armR: [160, 20], bob: -ip(g, [0, 12], [0, 20]) } : { armL: [170, 0], armR: [170, 0] }} holdR={g < 12 ? { node: BALL, k: 1 } : undefined} />
      {g >= 12 ? <Ball x={t < 1 ? bx : HOOP[0]} y={t < 1 ? by : HOOP[1] + 60 + Math.min(200, (g - 34) * 20)} /> : null}
    </Stadium>; } },
  { at: "fifty", s: (g, f, len) => <Stadium cam={camLerp(g, len, C(900, 300, 0.55), C(900, 260, 0.5))}><Hero x={900} y={GY + 40} f={f} expr="neutral" gaze={-1} pose={{ armR: [20, 10] }} holdR={{ node: BALL, k: 1 }} /></Stadium> },
  { at: "score", s: (g, f, len) => { const t = ip(g, [0, 14], [0.7, 1], (u) => u); const [bx, by] = shot(t, 960, GY - 300);
    return <Stadium cam={C(1350, GY - 420, 1.3)}><Ball x={t < 1 ? bx : HOOP[0]} y={t < 1 ? by : HOOP[1] + 60 + Math.min(220, (g - 14) * 22)} />
      {g > 14 ? <Glow x={HOOP[0]} y={HOOP[1]} r={140} g="gY" o={ip(g, [14, 30], [0.8, 0])} /> : null}</Stadium>; } },
  { at: "nobody", s: (g, f, len) => <Stadium cam={camLerp(g, len, C(900, GY - 260, 1.6), C(900, 300, 0.6))}><Hero x={900} y={GY + 40} f={f} expr="sad" pose={{ armL: [150, 20], armR: [150, 20 + ip(g, [0, 20], [0, 120])] }} /></Stadium> },
  // день 17: кинотеатр
  { at: "seventeen", s: (g, f, len) => <Theater cam={C(960, 300, 0.75)}>
    <Bean x={840} y={GY - 140} s={HS} look={HERO2D} f={f} expr="neutral" sit={(80) / HS} pose={{ armR: [70, 60], armL: [30, 40] }} holdR={{ node: <Popcorn />, k: 0.8 }} />
    {Array.from({ length: 14 }, (_, i) => { const x = -205 + i * 190, y = GY + 40; return <g key={i}><rect x={x - 70} y={y - 150} width={140} height={160} rx={30} fill="#a8304a" stroke={INK} strokeWidth={6} /><rect x={x - 76} y={y} width={152} height={40} rx={12} fill="#c8405a" stroke={INK} strokeWidth={6} /></g>; })}</Theater> },
  { at: "popcorn", s: (g, f, len) => { const k = (Math.sin(f * 0.25) + 1) / 2;
    return <Theater cam={C(880, SEATY - 220, 2.2)}>
      <Bean x={840} y={GY - 140} s={HS} look={HERO2D} f={f} expr="neutral" open={k > 0.8 ? 0.3 : 0} sit={80 / HS} pose={{ armR: [70 + k * 60, 80 - k * 40], armL: [40, 60] }} holdL={{ node: <Popcorn />, k: 0.8 }} />
    </Theater>; } },
  { at: "imagine", s: (g, f, len) => <Theater cam={C(960, 100, 0.7)} glow={0.6}>
    <g opacity={ip(g, [0, 20], [0, 0.6])} stroke="#fff2c0" strokeWidth={10} fill="none" strokeLinecap="round"><circle cx={700} cy={0} r={90} /><path d="M 900 200 Q 1050 -150 1250 120 M 1100 -150 l 60 -60 l 60 60" /></g>
    <Bean x={840} y={GY - 140} s={HS} look={HERO2D} f={f} expr="grin" sit={80 / HS} pose={{ armR: [70, 60], armL: [30, 40] }} holdR={{ node: <Popcorn />, k: 0.8 }} /></Theater> },
  { at: "pretty", s: (g, f, len) => <Theater cam={C(880, SEATY - 250, 2.4)} glow={0.6}><Bean x={840} y={GY - 140} s={HS} look={HERO2D} f={f} expr="grin" sit={80 / HS} pose={{ armR: [70, 60], armL: [30, 40] }} holdR={{ node: <Popcorn />, k: 0.8 }} /></Theater> },
  // день 18: тоска по людям
  { at: "eighteen", n: 1, s: (g, f, len) => <Apartment cam={chalkCam(17)} f={f} tally={g > 15 ? 18 : 17} dark={0.4}>
    <ChalkHero i={17} g={g} f={f} expr="sad" /></Apartment> },
  { at: "haven", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(700, GY - 250, 1.8), C(700, GY - 250, 2.1))} f={f} tally={18} dark={0.45}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="sad" sit={70 / HS} pose={{ armL: [60, 70], armR: [60, 70], tilt: -12 }} /></Apartment> },
  { at: "catch", s: (g, f, len) => <Street cam={C(1050, GY - 220, 1.4)} f={f} tod="day">
    <FamilyPoster x={1250} y={GY + 140} />
    <Hero x={880} y={GY + 150} f={f} expr="sad" gaze={1} pose={{ armL: [15, 8], armR: [15, 8], tilt: 6 }} /></Street> },
  { at: "family", s: (g, f, len) => <Street cam={camLerp(g, len, C(1250, GY - 80, 2.2), C(1250, GY - 80, 2.5))} f={f} tod="day"><FamilyPoster x={1250} y={GY + 140} /></Street> },
  { at: "whole", s: (g, f, len) => <Street cam={C(1050, GY - 220, 1.4)} f={f} tod="dusk"><FamilyPoster x={1250} y={GY + 140} />
    <Hero x={880} y={GY + 150} f={f} expr="sad" gaze={1} pose={{ armL: [15, 8], armR: [30, 40], tilt: 6 }} /></Street> },
  // рисует лица на стене базы
  { at: "So", n: 2, s: (g, f, len) => <Apartment cam={C(-640, GY - 280, 1.5)} f={f} tally={18}>
    <Faces n={g > 20 ? 1 : 0} />
    <Hero x={-828} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [150 + Math.sin(g * 0.4) * 8, Math.sin(g * 0.5) * 10], armR: [15, 8] }} holdL={CHALK} /></Apartment> },
  { at: "Big", s: (g, f, len) => <Apartment cam={C(-640, GY - 280, 1.5)} f={f} tally={18}><Faces n={3} />
    <Hero x={-468} y={GY} f={f} expr="neutral" gaze={-1} pose={{ armL: [150 + Math.sin(g * 0.4) * 8, Math.sin(g * 0.5) * 10], armR: [15, 8] }} holdL={CHALK} /></Apartment> },
  { at: "Smiling", n: 2, s: (g, f, len) => <Apartment cam={C(-640, GY - 280, 1.5)} f={f} tally={18}><Faces n={5} />
    <Hero x={-140} y={GY} f={f} expr="grin" gaze={-1} pose={{ armL: [15, 8], armR: [15, 8] }} /></Apartment> },
  { at: "someone", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(-640, GY - 280, 1.5), C(150, 520, 0.95))} f={f} tally={18} dark={0.3}><Faces n={5} />
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="grin" gaze={-1} sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
], { id: 7, dir: "bo" });

