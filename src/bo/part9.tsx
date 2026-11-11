// Часть 9/10: дни 24–28 — жар прошёл, небоскрёб, огромное SOS, зеркала, маяк из ламп.
import React from "react";
import { Bean, Cam, Glow, HERO2D, Layer, Voice, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, ChalkHero, GY, InBed, HS, Hero, INK, Skyline, Svg, YEL, chalkCam, walk, walkDx } from "./scenes";
import { VOICE } from "./voices/p9";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
export const RY = GY - 50; // уровень крыши (ступни)
// буквы SOS на крыше (вид сверху-наискосок): p — сколько нарисовано 0..3
const SOS: React.FC<{ p: number; x?: number }> = ({ p, x = 400 }) => (
  <g fill="none" stroke={YEL} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round">
    <g opacity={Math.min(1, p)}><path d={`M ${x + 260} ${RY + 60} Q ${x + 60} ${RY + 50} ${x + 70} ${RY + 110} Q ${x + 80} ${RY + 160} ${x + 220} ${RY + 170} Q ${x + 280} ${RY + 220} ${x + 60} ${RY + 260}`} /></g>
    <g opacity={Math.max(0, Math.min(1, p - 1))}><ellipse cx={x + 560} cy={RY + 160} rx={150} ry={95} /></g>
    <g opacity={Math.max(0, Math.min(1, p - 2))}><path d={`M ${x + 1060} ${RY + 60} Q ${x + 860} ${RY + 50} ${x + 870} ${RY + 110} Q ${x + 880} ${RY + 160} ${x + 1020} ${RY + 170} Q ${x + 1080} ${RY + 220} ${x + 860} ${RY + 260}`} /></g>
  </g>
);
// крыша небоскрёба — отдельная сцена (парапет, тёмный город внизу далеко)
export const TopRoof: React.FC<{ cam: Cam; f: number; tod?: "dusk" | "night" | "day" | "dawn"; children?: React.ReactNode; sos?: number }> = ({ cam, f, tod = "day", children, sos = 0 }) => (
  <Svg>
    <Skyline cam={cam} f={f} tod={tod} midBase={GY + 160} k={0.6} />
    <Layer cam={cam} d={1}>
      <rect x={-3000} y={RY} width={9000} height={900} fill="#5a5090" stroke={INK} strokeWidth={7} />
      <rect x={-3000} y={RY - 30} width={9000} height={34} fill="#7a6ab8" stroke={INK} strokeWidth={6} />
      <SOS p={sos} />
      {children}
    </Layer>
  </Svg>
);
// лестница: пролёты, герой поднимается
const Stairs: React.FC<{ cam: Cam; g: number; f: number; rest?: boolean }> = ({ cam, g, f, rest }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-3000} width={6000} height={5000} fill="#4a4a8a" />
      {Array.from({ length: 6 }, (_, k) => { const y = GY - k * 360; return <g key={k}>
        <rect x={200} y={y} width={1500} height={30} fill="#6a6aaa" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, s) => <rect key={s} x={k % 2 ? 1500 - s * 90 - 90 : 400 + s * 90} y={y - (s + 1) * 36} width={92} height={36} fill="#8a86b8" stroke={INK} strokeWidth={4} />)}
        <rect x={180} y={y - 400} width={40} height={400} fill="#3a3a6a" stroke={INK} strokeWidth={4} />
      </g>; })}
      {rest ? <Bean x={1100} y={GY} s={HS} look={HERO2D} f={f} expr="tired" sweat sit={70 / HS} pose={{ armL: [40, 60], armR: [40, 60], tilt: -8 }} />
        : (() => { const s = Math.min(9, Math.floor(g / 7)), ph = (g % 7) / 7; return <Bean x={400 + 46 + s * 90 + ph * 90} y={GY - (s + ph) * 36} s={HS} look={HERO2D} f={f} expr="tired" sweat pose={{ legL: Math.sin(ph * Math.PI) * 30, legR: -Math.sin(ph * Math.PI) * 20, lean: 12, armL: [20, 20], armR: [30, 40] }} />; })()}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={0.25} />
  </Svg>
);
export const Mirror: React.FC<{ k?: number }> = ({ k = 1 }) => <g transform={`scale(${k})`}><rect x={-50} y={-70} width={100} height={140} rx={10} fill="#c8c4e0" stroke={INK} strokeWidth={6} /><rect x={-40} y={-60} width={80} height={120} rx={6} fill="#bff4ff" /><path d="M -26 -40 L 6 -50 M -30 -10 L 20 -30" stroke="#fff" strokeWidth={7} strokeLinecap="round" /></g>;
const Battery: React.FC<{ x: number; y: number }> = ({ x, y }) => <g transform={`translate(${x} ${y})`}><rect x={-50} y={-60} width={100} height={60} rx={6} fill="#3a3a5a" stroke={INK} strokeWidth={5} /><rect x={-36} y={-72} width={16} height={12} fill="#ff4a6a" stroke={INK} strokeWidth={3} /><rect x={20} y={-72} width={16} height={12} fill="#5a7cf0" stroke={INK} strokeWidth={3} /></g>;
// маяк: стойка с лампами, провода к аккумуляторам
export const Beacon: React.FC<{ x: number; on?: number; f: number }> = ({ x, on = 0, f }) => (
  <g>
    {on > 0 ? <><Glow x={x} y={RY - 330} r={900 * on} g="gW" o={0.5} /><path d={`M ${x} ${RY - 330} L ${x - 900} -1400 L ${x - 500} -1400 Z`} fill="#fff6d0" opacity={0.15 * on} /><path d={`M ${x} ${RY - 330} L ${x + 600} -1400 L ${x + 1000} -1400 Z`} fill="#fff6d0" opacity={0.15 * on} /></> : null}
    <path d={`M ${x} ${RY} L ${x} ${RY - 300} M ${x - 80} ${RY} L ${x} ${RY - 200} L ${x + 80} ${RY}`} stroke={INK} strokeWidth={14} fill="none" />
    {[-60, 0, 60].map((k, i) => <g key={k}><rect x={x + k - 30} y={RY - 370} width={60} height={60} rx={10} fill={on > 0 ? "#fff8d0" : "#8a86a8"} stroke={INK} strokeWidth={6} />{on > 0 ? <Glow x={x + k} y={RY - 340} r={90} g="gY" o={0.8 + 0.2 * Math.sin(f * 0.3 + i)} /> : null}</g>)}
    {[x + 180, x + 290].map((bx) => <g key={bx}><Battery x={bx} y={RY} /><path d={`M ${bx} ${RY - 72} Q ${(bx + x) / 2} ${RY - 140} ${x + 20} ${RY - 300}`} stroke={INK} strokeWidth={5} fill="none" /></g>)}
  </g>
);
const Night: React.FC<{ o: number }> = ({ o }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#03020c" opacity={o} /></svg>;

export const P9 = makePart(V, [
  // день 24: жар прошёл
  { at: "", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(640, GY - 150, 1.9), C(700, GY - 230, 1.8))} f={f} tally={23} dark={0.3} sleeping={g < 70}>
    {g < 70 ? <InBed f={f} expr={g > 40 ? "tired" : "sleep"} /> : <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="neutral" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40], tilt: -6 }} />}</Apartment> },
  { at: "And", n: 1, s: (g, f, len) => <Apartment cam={chalkCam(23)} f={f} tally={g > 15 ? 24 : 23}><ChalkHero i={23} g={g} f={f} expr="determined" /></Apartment> },
  { at: "It", s: (g, f, len) => <Apartment cam={C(1150, GY - 260, 1.8)} f={f} tally={24}><Hero x={1150} y={GY} f={f} expr="determined" pose={{ armL: [15, 8], armR: [15, 8] }} /></Apartment> },
  // день 25: небоскрёб, лестница
  { at: "twenty-five", s: (g, f, len) => <Svg><Skyline cam={camLerp(g, len, C(960, 700, 0.6), C(960, 200, 0.6))} f={f} tod="day" midBase={GY + 100} k={1.4} /></Svg> },
  { at: "Thirty", s: (g, f, len) => <Stairs cam={C(800 + Math.min(9, g / 7) * 90, GY - 250 - Math.min(9, g / 7) * 36, 1.3)} g={g} f={f} /> },
  { at: "stop", s: (g, f, len) => <Stairs cam={C(1000, GY - 250, 1.6)} g={g} f={f} rest /> },
  { at: "From", s: (g, f, len) => <TopRoof cam={camLerp(g, len, C(960, RY - 250, 1.6), C(960, 380, 0.6))} f={f}><Hero x={960} y={RY} f={f} expr="worried" gaze={1} pose={{ armL: [15, 8], armR: [15, 8] }} /></TopRoof> },
  { at: "Not", s: (g, f, len) => <><Svg><Skyline cam={C(960, 700, 0.5)} f={f} tod="dusk" midBase={GY + 500} k={0.9} /></Svg><Night o={0.3} /></> },
  // день 26: SOS
  { at: "twenty-six", s: (g, f, len) => <TopRoof cam={C(900, RY + 50, 0.9)} f={f} sos={ip(g, [0, len], [0, 1])}>
    <Hero x={400 + 260 - walkDx(Math.min(g, 40)) * 0.4} y={RY + 40} f={f} expr="determined" flip pose={{ armR: [60, 50], armL: [20, 20], lean: 10 }} holdR={{ node: <g><rect x={-6} y={-90} width={12} height={90} fill="#c87a4a" stroke={INK} strokeWidth={4} /><rect x={-18} y={-110} width={36} height={24} rx={4} fill={YEL} stroke={INK} strokeWidth={4} /></g>, k: 1, rot: 180 }} /></TopRoof> },
  { at: "letter", s: (g, f, len) => <TopRoof cam={C(960, RY + 150, 0.75)} f={f} sos={ip(g, [0, len], [1.2, 3])}>
    <Hero x={1300} y={RY + 40} f={f} expr="determined" pose={{ armR: [60, 50], armL: [20, 20], lean: 10 }} /></TopRoof> },
  { at: "Pilots", s: (g, f, len) => <TopRoof cam={camLerp(g, len, C(960, RY + 100, 0.8), C(960, RY - 300, 0.45))} f={f} sos={3} /> },
  // день 27: зеркала
  { at: "twenty-seven", s: (g, f, len) => <Apartment cam={C(1150, GY - 260, 1.6)} f={f} tally={27}>
    <Hero x={1150 + walkDx(g) * 0.5} y={GY} f={f} expr="determined" pose={{ ...walk(g), armL: [60, 40], armR: [60, 40] }} holdR={{ node: <Mirror k={0.6} />, k: 1 }} holdL={{ node: <Mirror k={0.6} />, k: 1 }} /></Apartment> },
  { at: "sunny", s: (g, f, len) => <TopRoof cam={C(960, RY - 250, 1.4)} f={f} sos={3}>
    <Hero x={960} y={RY} f={f} expr="determined" pose={{ armR: [130, 10], armL: [15, 8] }} holdR={{ node: <Mirror k={0.7} />, k: 1 }} />
    {g % 20 < 6 ? <Glow x={1060} y={RY - 360} r={260} g="gW" /> : null}</TopRoof> },
  { at: "seen", s: (g, f, len) => <Svg><Skyline cam={C(960, 700, 0.4)} f={f} tod="day" midBase={GY + 500} k={0.9} />
    {Math.floor(g / 6) % 2 ? <g><Glow x={960} y={560} r={200} g="gW" /><path transform="translate(960 560)" d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#fff" /></g> : null}</Svg> },
  { at: "spend", s: (g, f, len) => <TopRoof cam={camLerp(g, len, C(960, RY - 250, 1.2), C(960, RY - 250, 1.3))} f={f} tod="dusk" sos={3}>
    <rect x={900} y={RY - 60} width={120} height={60} rx={8} fill="#3a3a5a" stroke={INK} strokeWidth={5} />
    <Bean x={960} y={RY} s={HS} look={HERO2D} f={f} expr="tired" sit={60 / HS} pose={{ armR: [120 + Math.sin(f * 0.3) * 10, 10], armL: [30, 40] }} holdR={{ node: <Mirror k={0.7} />, k: 1 }} />
    </TopRoof> },
  // день 28: маяк
  { at: "twenty-eight", s: (g, f, len) => <TopRoof cam={C(1100, RY - 220, 1.2)} f={f} tod="dusk" sos={3}><Beacon x={1300} f={f} />
    <Hero x={900 + walkDx(g) * 0.5} y={RY} f={f} expr="tired" sweat pose={{ ...walk(g), armL: [40, 30], armR: [40, 30], lean: 8 }} holdR={{ node: <g transform="translate(0 70)"><Battery x={0} y={0} /></g>, k: 1 }} /></TopRoof> },
  { at: "build", s: (g, f, len) => <TopRoof cam={C(1300, RY - 250, 1.6)} f={f} tod="dusk" sos={3}><Beacon x={1300} f={f} />
    <Hero x={1100} y={RY} f={f} expr="determined" pose={{ armR: [90, 20], armL: [15, 8] }} /></TopRoof> },
  { at: "switch", s: (g, f, len) => <><TopRoof cam={C(1200, RY - 250, 1.2)} f={f} tod="night" sos={3}><Beacon x={1300} f={f} on={ip(g, [8, 14], [0, 1])} />
    <Hero x={1050} y={RY} f={f} expr={g > 14 ? "grin" : "determined"} pose={{ armR: [90, 20], armL: [15, 8] }} /></TopRoof><Night o={0.35} /></> },
  { at: "only", s: (g, f, len) => <><Svg><Skyline cam={C(960, 600, 0.35)} f={f} tod="night" midBase={GY + 500} k={0.9} />
    <Glow x={960} y={380} r={200} g="gY" /><circle cx={960} cy={380} r={12} fill="#fff8d0" /></Svg><Night o={0.3} /></> },
  { at: "tiny", s: (g, f, len) => <><Svg><Skyline cam={camLerp(g, len, C(960, 600, 0.35), C(960, 600, 0.25))} f={f} tod="night" midBase={GY + 500} k={0.9} />
    <Glow x={960} y={380} r={160} g="gY" /><circle cx={960} cy={380} r={9} fill="#fff8d0" /></Svg><Night o={0.3} /></> },
  { at: "sit", s: (g, f, len) => <><TopRoof cam={camLerp(g, len, C(1150, RY - 220, 1.6), C(1150, RY - 220, 1.4))} f={f} tod="night" sos={3}><Beacon x={1300} f={f} on={1} />
    <rect x={1000} y={RY - 60} width={120} height={60} rx={8} fill="#3a3a5a" stroke={INK} strokeWidth={5} />
    <Bean x={1050} y={RY} s={HS} look={HERO2D} f={f} expr="sad" sit={60 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} />
    </TopRoof><Night o={0.3} /></> },
], { id: 9, dir: "bo" });

