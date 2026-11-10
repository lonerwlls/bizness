// Часть 2/10: дни 2–3 — уходит вода, пир из размороженной еды, первая тёмная ночь со звёздами.
import React from "react";
import { Bean, Cam, Defs, Frame, Glow, HERO2D, Layer, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, GY, HS, Hero, INK, InBed, Kitchen, Rooftop, Stars, Street, Svg, YEL, walk, walkDx } from "./scenes";
import { VOICE } from "./voices/p2";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
// струя из крана: w — толщина (0 — нет воды)
const Stream: React.FC<{ w: number; f: number }> = ({ w, f }) => w <= 0 ? null : <g>
  <rect x={-30 - w / 2} y={GY - 310} width={w} height={90} fill="#9fdcff" stroke={INK} strokeWidth={3} />
  {w < 10 ? [0, 1].map((i) => <ellipse key={i} cx={-30} cy={GY - 300 + ((f * 6 + i * 45) % 90)} rx={6} ry={9} fill="#9fdcff" stroke={INK} strokeWidth={3} />) : null}
</g>;
const Pot: React.FC<{ x: number; y: number; c?: string; s?: number; full?: number }> = ({ x, y, c = "#8a86a8", s = 1, full = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-80} width={120} height={80} rx={10} fill={c} stroke={INK} strokeWidth={6} />
    {full > 0 ? <rect x={-50} y={-70} width={100} height={12} rx={6} fill="#9fdcff" /> : null}
    {[-1, 1].map((k) => <rect key={k} x={k * 60 + (k > 0 ? 0 : -24)} y={-66} width={24} height={14} rx={6} fill={c} stroke={INK} strokeWidth={5} />)}
  </g>
);
const Bottle: React.FC<{ x: number; y: number }> = ({ x, y }) => <g transform={`translate(${x} ${y})`}><rect x={-22} y={-110} width={44} height={110} rx={12} fill="#9fdcff" fillOpacity={0.7} stroke={INK} strokeWidth={5} /><rect x={-10} y={-130} width={20} height={22} fill="#5a7cf0" stroke={INK} strokeWidth={4} /></g>;
// ванная: плитка, ванна, которую наполняет герой
const Bathroom: React.FC<{ cam: Cam; f: number; lvl: number; children?: React.ReactNode }> = ({ cam, lvl, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-1500} y={-1000} width={5000} height={GY + 1000} fill="#4a6ab0" />
      {Array.from({ length: 160 }, (_, i) => <rect key={i} x={-600 + (i % 20) * 140} y={GY - 1100 + Math.floor(i / 20) * 140} width={140} height={140} fill={(i + Math.floor(i / 20)) % 2 ? "#5a7ac0" : "#6a8ad0"} stroke={INK} strokeWidth={3} />)}
      <rect x={-1500} y={GY} width={5000} height={700} fill="#3a4a8a" stroke={INK} strokeWidth={8} />
      <clipPath id="tub"><rect x={560} y={GY - 230} width={760} height={220} rx={40} /></clipPath>
      <rect x={560} y={GY - 230} width={760} height={220} rx={40} fill="#f4f2ff" stroke={INK} strokeWidth={8} />
      <g clipPath="url(#tub)"><rect x={560} y={GY - 30 - lvl * 170} width={760} height={240} fill="#9fdcff" stroke={INK} strokeWidth={4} /></g>
      <path d={`M 1260 ${GY - 230} L 1260 ${GY - 300} L 1200 ${GY - 300}`} stroke="#b8b4d0" strokeWidth={16} fill="none" strokeLinecap="round" />
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={0.25} />
  </Svg>
);
// запах: мягкие полупрозрачные зеленоватые облачка, медленно поднимаются и тают
const Smell: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => <g style={{ filter: "blur(6px)" }}>{[0, 1, 2, 3].map((i) => { const t = ((f * 0.6 + i * 25) % 100) / 100; return <ellipse key={i} cx={x + Math.sin(i * 2 + t * 4) * 40} cy={y - t * 200} rx={50 + t * 40} ry={30 + t * 20} fill="#9ad87a" opacity={0.35 * (1 - t)} />; })}</g>;
// пар: тонкие полупрозрачные завитки, размытые
const Steam2: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => <g style={{ filter: "blur(3px)" }}>{[0, 1, 2].map((i) => { const t = ((f * 0.8 + i * 33) % 100) / 100; return <path key={i} d={`M ${x - 30 + i * 30} ${y - t * 60} q 12 -20 0 -40 q -12 -20 0 -40`} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45 * Math.sin(t * Math.PI)} />; })}</g>;
// походная плитка на столешнице; сковорода стоит прямо на решётке, в ней стейк
const CampStove: React.FC<{ x: number; y: number; f: number; food?: "steak" | "pizza" }> = ({ x, y, f, food = "steak" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-100} y={-44} width={200} height={44} rx={8} fill="#5a5680" stroke={INK} strokeWidth={6} />
    <rect x={60} y={-34} width={26} height={24} rx={6} fill="#ff4a6a" stroke={INK} strokeWidth={4} />
    <rect x={-70} y={-58} width={140} height={14} rx={4} fill="#262838" stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-24 + i * 12} -58 q -5 -12 0 -20 q 5 8 0 20`} fill="#5ae0ff" stroke={INK} strokeWidth={2} transform={`scale(1 ${1 + 0.15 * Math.sin(f * 0.7 + i)})`} />)}
    <Glow x={0} y={-62} r={90} g="gC" o={0.5} />
    {/* сковорода на решётке */}
    <path d="M -90 -62 L 90 -62 L 80 -92 L -80 -92 Z" fill="#2a2840" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={90} y={-86} width={140} height={18} rx={8} fill="#2a2840" stroke={INK} strokeWidth={5} />
    {food === "steak" ? <g><path d="M -55 -92 Q -60 -116 -20 -118 Q 30 -124 50 -108 Q 62 -96 40 -92 Z" fill="#a8483a" stroke={INK} strokeWidth={4} /><path d="M -30 -108 L 20 -110 M -24 -100 L 30 -102" stroke="#6a2a20" strokeWidth={4} /></g>
      : <ellipse cx={0} cy={-98} rx={70} ry={10} fill="#ffb060" stroke={INK} strokeWidth={4} />}
  </g>
);
// рука «от первого лица» с фонариком/без
const PovHand: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={0} y={-70} width={700} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} />
    <rect x={-10} y={-80} width={60} height={160} rx={20} fill="#c8561a" stroke={INK} strokeWidth={9} />
    <ellipse cx={-70} cy={0} rx={80} ry={66} fill="#f8f6f0" stroke={INK} strokeWidth={10} />
    {[-1, 0, 1].map((k) => <rect key={k} x={-200} y={k * 34 - 14} width={120} height={28} rx={14} fill="#f8f6f0" stroke={INK} strokeWidth={8} />)}
  </g>
);

export const P2 = makePart(V, [
  // утро второго дня: открывает глаза, надеется, что это сон
  { at: "", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(640, GY - 150, 1.9), C(640, GY - 150, 2.2))} f={f} sleeping tally={1}><InBed f={f} expr={g > 30 ? "worried" : "sleep"} gaze={g > 40 ? 1 : 0} /></Apartment> },
  { at: "dream", s: (g, f, len) => <Apartment cam={C(1000, 560, 1.2)} f={f} tally={1}>
    <Hero x={1320} y={GY} f={f} expr="sad" gaze={1} pose={{ tilt: 10, armR: [140, 70], armL: [20, 30] }} /></Apartment> },
  // кран
  { at: "tap", s: (g, f, len) => <Kitchen cam={C(30, GY - 260, 2.0)} f={f}><Stream w={ip(g, [4, 10], [0, 26])} f={f} />
    <Hero x={190} y={GY} f={f} expr="neutral" gaze={-1} pose={{ armL: [100, 10], armR: [15, 8] }} /></Kitchen> },
  { at: "trickle", s: (g, f, len) => <Kitchen cam={C(-20, GY - 290, 3.2)} f={f}><Stream w={since("stops", "trickle", g) > 0 ? 0 : ip(g, [0, 20], [12, 5])} f={f} /></Kitchen> },
  { at: "stops", s: (g, f, len) => <Kitchen cam={C(110, GY - 300, 2.4)} f={f}>
    <Hero x={190} y={GY} f={f} expr="worried" open={0.3} gaze={-1} pose={{ armL: [100, 10], armR: [60, 60], tilt: -10 }} /></Kitchen> },
  // объяснение: насосы встали
  { at: "City", s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" />
    <rect x={260} y={420} width={420} height={360} rx={30} fill="#5a5680" stroke={INK} strokeWidth={10} />
    <g transform={`translate(470 600) rotate(${ip(g, [0, len], [0, 200], (t) => 1 - Math.pow(1 - t, 3))})`}><circle r={120} fill="#8a86a8" stroke={INK} strokeWidth={10} />{[0, 1, 2, 3].map((i) => <rect key={i} x={-14} y={-110} width={28} height={100} rx={10} fill="#b8b4d0" stroke={INK} strokeWidth={6} transform={`rotate(${i * 90})`} />)}</g>
    <path d="M 680 600 L 1700 600 L 1700 250" stroke={INK} strokeWidth={70} fill="none" /><path d="M 680 600 L 1700 600 L 1700 250" stroke="#8a86a8" strokeWidth={50} fill="none" />
    {Array.from({ length: 8 }, (_, i) => { const t = ((g * ip(g, [0, len], [8, 0]) + i * 130) % 1000); return <circle key={i} cx={700 + t} cy={600} r={14} fill="#9fdcff" opacity={ip(g, [0, len], [1, 0.2])} />; })}
    <path d="M 420 300 L 380 380 L 420 380 L 380 460" stroke={YEL} strokeWidth={14} fill="none" opacity={g < 20 ? 1 : 0} strokeLinejoin="round" />
  </Frame> },
  // набирает воду во всё подряд
  { at: "So", s: (g, f, len) => <Kitchen cam={C(100, GY - 250, 1.4)} f={f}>
    <Pot x={-300} y={GY - 225} c="#ff8a5a" /><Bottle x={-420} y={GY - 225} /><Bottle x={-480} y={GY - 225} />
    <Pot x={350} y={GY} c="#5ad8c8" s={1.2} />
    <Pot x={-30} y={GY - 225} full={1} />
    <rect x={-33} y={GY - 310} width={6} height={10 + 0 * f} fill="#9fdcff" />
    {[0, 1].map((i) => <ellipse key={i} cx={-30} cy={GY - 300 + ((f * 4 + i * 12) % 24)} rx={4} ry={6} fill="#9fdcff" stroke={INK} strokeWidth={2} />)}
    <Hero x={220} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [60, 40], armR: [15, 8] }} holdL={{ node: <Bottle x={0} y={40} />, k: 0.9 }} /></Kitchen> },
  { at: "fill", s: (g, f, len) => <Bathroom cam={C(960, GY - 250, 1.5)} f={f} lvl={ip(g, [0, len], [0.1, 0.6])}>
    {ip(g, [0, len], [1, 0]) > 0.1 ? <rect x={1196} y={GY - 300} width={10} height={180} fill="#9fdcff" /> : null}
    <Hero x={480} y={GY} f={f} expr="worried" gaze={1} pose={{ armR: [80, 40], tilt: 10 }} /></Bathroom> },
  { at: "That", s: (g, f, len) => <Bathroom cam={C(940, GY - 140, 2.6)} f={f} lvl={0.62} /> },
  // холодильник
  { at: "open", s: (g, f, len) => <Kitchen cam={C(700, GY - 280, 1.7)} f={f} open dark={0.4}>
    <Hero x={880} y={GY} f={f} expr={g > 18 ? "worried" : "neutral"} gaze={-1} pose={{ armL: [80, 30], armR: [15, 8] }} />
    <Glow x={610} y={GY - 260} r={160} g="gO" o={0.25} /></Kitchen> },
  { at: "Food", s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" />
    <rect x={560} y={240} width={360} height={600} rx={30} fill="#9fdcff" stroke={INK} strokeWidth={10} />
    <path d="M 860 300 L 860 420" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
    <g transform="translate(1320 540)"><circle r={240} fill="#fff6e0" stroke={INK} strokeWidth={12} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-6} y={-225} width={12} height={30} fill={INK} transform={`rotate(${i * 30})`} />)}
      <rect x={-9} y={-110} width={18} height={110} rx={9} fill={INK} transform={`rotate(${ip(g, [0, len], [0, 120])})`} />
      <rect x={-6} y={-180} width={12} height={180} rx={6} fill="#ff4a6a" transform={`rotate(${ip(g, [0, len], [0, 1440])})`} />
      <circle r={16} fill={INK} /></g>
  </Frame> },
  { at: "full", s: (g, f, len) => <Kitchen cam={C(610, GY - 250, 2.2)} f={f} open dark={0.4}><Smell x={560} y={GY - 280} f={f} /></Kitchen> },
  // пир на походной плитке
  { at: "tonight", s: (g, f, len) => <Kitchen cam={C(-120, GY - 300, 2.0)} f={f} dark={0.45}>
    <CampStove x={-230} y={GY - 225} f={f} /><Steam2 x={-230} y={GY - 345} f={f} />
    <Hero x={95} y={GY} f={f} expr="grin" gaze={-1} pose={{ armL: [66, 8], armR: [15, 8] }} /></Kitchen> },
  { at: "Ice", s: (g, f, len) => { const k = (Math.sin(f * 0.25) + 1) / 2;
    return <Kitchen cam={C(1160, GY - 250, 2.2)} f={f} dark={0.45}>
      <rect x={1100} y={GY - 80} width={130} height={80} rx={8} fill="#5a4a9a" stroke={INK} strokeWidth={6} />
      <Bean x={1165} y={GY} s={HS} look={HERO2D} f={f} expr={k > 0.7 ? "laugh" : "grin"} open={0.4} sit={80 / HS} pose={{ armR: [70 + k * 70, 120 - k * 40], armL: [40, 50] }}
        holdR={{ node: <g><rect x={-5} y={-50} width={10} height={50} rx={5} fill="#b8b4d0" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-56} rx={12} ry={9} fill="#ff9ac0" stroke={INK} strokeWidth={3} /></g>, k: 1, rot: 180 }} />
      <rect x={950} y={GY - 210} width={440} height={26} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={6} />
      {[980, 1350].map((x) => <rect key={x} x={x} y={GY - 186} width={22} height={186} fill="#a85a3a" stroke={INK} strokeWidth={5} />)}
      <g transform={`translate(1060 ${GY - 210})`}><path d="M -60 -40 Q -55 10 0 12 Q 55 10 60 -40 Z" fill="#5ad8c8" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={-42} rx={56} ry={12} fill="#ff9ac0" stroke={INK} strokeWidth={4} /></g>
      <g transform={`translate(1290 ${GY - 210})`}><ellipse cx={0} cy={-6} rx={70} ry={14} fill="#f4f2ff" stroke={INK} strokeWidth={5} /><path d="M -40 -12 Q -40 -34 -5 -36 Q 34 -38 40 -20 Q 44 -10 30 -10 Z" fill="#a8483a" stroke={INK} strokeWidth={4} /></g>
    </Kitchen>;
  } },
  { at: "Everything", s: (g, f, len) => <Kitchen cam={C(1160, GY - 250, 1.8)} f={f} dark={0.5}>
    <rect x={1100} y={GY - 80} width={130} height={80} rx={8} fill="#5a4a9a" stroke={INK} strokeWidth={6} />
    <Bean x={1165} y={GY} s={HS} look={HERO2D} f={f} expr="tired" sit={80 / HS} pose={{ armL: [60, 70], armR: [60, 70], lean: 4 }} />
    <rect x={950} y={GY - 210} width={440} height={26} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={6} />
    {[980, 1350].map((x) => <rect key={x} x={x} y={GY - 186} width={22} height={186} fill="#a85a3a" stroke={INK} strokeWidth={5} />)}
    {[1040, 1290].map((x) => <ellipse key={x} cx={x} cy={GY - 216} rx={60} ry={12} fill="#f4f2ff" stroke={INK} strokeWidth={5} />)}
  </Kitchen> },
  { at: "By", n: 2, s: (g, f, len) => <Kitchen cam={C(560, GY - 280, 1.7)} f={f} open dark={0.35}>
    <Smell x={520} y={GY - 280} f={f} /><Smell x={620} y={GY - 120} f={f + 10} />
    <Hero x={880} y={GY} f={f} expr="scared" gaze={-1} pose={{ armL: [150, 75], armR: [20, 20], tilt: 12, lean: 8 }} /></Kitchen> },
  { at: "party", s: (g, f, len) => <Apartment cam={C(-120, GY - 260, 2.0)} f={f} tally={g > 12 ? 3 : 2}>
    <Hero x={-80} y={GY} f={f} expr="tired" gaze={-1} pose={{ armL: [150, ip(g, [0, 12], [-10, 10])], armR: [15, 8], tilt: -8 }} holdL={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} /></Apartment> },
  // первая настоящая ночь
  { at: "first", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 560, 1.0), C(960, 600, 1.1))} f={f} tod="night">
    <Hero x={650 + walkDx(g, 0.16)} y={GY + 140} f={f} expr="worried" gaze={1} pose={walk(g, 0.16)} /></Street> },
  { at: "lights", s: (g, f, len) => <><Street cam={camLerp(g, len, C(960, GY - 100, 1.5), C(960, GY - 100, 1.7))} f={f} tod="night"><Hero x={960} y={GY + 140} f={f} expr="scared" gaze={Math.sin(f * 0.1)} pose={{ armL: [60, 40], armR: [60, 40], tilt: Math.sin(f * 0.1) * 6 }} /></Street><svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#02010a" opacity={ip(g, [0, len], [0.3, 0.75])} /></svg></> },
  { at: "can", n: 2, s: (g, f, len) => <Frame bg="#02010a"><rect width={1920} height={1080} fill="#03020c" />
    <g opacity={0.25}><PovHand x={1100} y={560} rot={-20} /></g>
    <circle cx={960} cy={540} r={900} fill="none" stroke="#000" strokeWidth={900} opacity={0.4} />
  </Frame> },
  // взгляд вверх — звёзды
  { at: "look", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 250, 1.8), C(960, GY - 300, 1.9))} f={f} tod="night">
    <Hero x={960} y={GY - 50} f={f} expr={g > 15 ? "shock" : "neutral"} open={0.3} pose={{ tilt: ip(g, [0, 15], [0, -6]), armL: [15, 8], armR: [15, 8] }} /></Rooftop> },
  { at: "sky", s: (g, f, len) => <Frame bg="#05030f"><Defs /><rect width={1920} height={1080} fill="#05030f" />
    <g transform={`translate(0 ${ip(g, [0, len], [0, 60])})`}><Stars n={260} o={ip(g, [0, 20], [0.3, 1])} />
      <path d="M -100 900 Q 600 300 2100 100" stroke="#b47aff" strokeWidth={180} opacity={0.18} fill="none" style={{ filter: "blur(30px)" }} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 523) % 1920} cy={(i * 331) % 900} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.1 + i)} />)}</g>
  </Frame> },
  { at: "thousands", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 300, 1.6), C(960, 420, 0.9))} f={f} tod="night">
    <rect x={880} y={GY - 120} width={160} height={70} rx={8} fill="#5a4a9a" stroke={INK} strokeWidth={6} />
    <Bean x={960} y={GY - 50} s={HS} look={HERO2D} f={f} expr="sad" sit={70 / HS} gaze={0} pose={{ armL: [30, 40], armR: [30, 40], tilt: -8 }} />
  </Rooftop> },
], { id: 2, dir: "bo" });
