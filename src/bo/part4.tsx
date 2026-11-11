// Часть 4/10: дни 6–7 — дождевая вода, неделя одиночества, правила, чтобы не сойти с ума.
import React from "react";
import { Bean, Cam, Frame, Glow, HERO2D, SoundRings, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, BoCar, Can, GY, HS, Hero, INK, InBed, Kitchen, Rooftop, Street, Svg, Skyline, YEL, walk, walkDx } from "./scenes";
import { VOICE } from "./voices/p4";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
// дождь поверх кадра
const Rain: React.FC<{ f: number; o?: number }> = ({ f, o = 0.6 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <rect width={1920} height={1080} fill="#1a1a50" opacity={0.25} />
    {Array.from({ length: 110 }, (_, i) => { const x = (i * 211 + f * 7) % 2100 - 100, y = (i * 137 + f * 48) % 1200 - 100; return <path key={i} d={`M ${x} ${y} l -12 44`} stroke="#bfd8ff" strokeWidth={4} opacity={o} strokeLinecap="round" />; })}
  </svg>
);
const Bucket: React.FC<{ x: number; y: number; lvl: number; c?: string; w?: number }> = ({ x, y, lvl, c = "#5a7cf0", w = 110 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-w / 2} -110 L ${w / 2} -110 L ${w / 2 - 14} 0 L ${-w / 2 + 14} 0 Z`} fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={-110 + (1 - lvl) * 80} rx={w / 2 - 6} ry={10} fill="#9fdcff" stroke={INK} strokeWidth={3} opacity={lvl > 0.02 ? 1 : 0} />
    <ellipse cx={0} cy={-110} rx={w / 2} ry={12} fill="none" stroke={INK} strokeWidth={6} />
  </g>
);
const Pool: React.FC<{ x: number; y: number; lvl: number }> = ({ x, y, lvl }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-200} y={-70} width={400} height={70} rx={30} fill="#ff9ac0" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-70} rx={196} ry={18} fill={lvl > 0.1 ? "#9fdcff" : "#5a4a8a"} stroke={INK} strokeWidth={5} />
    {[-120, 0, 120].map((k) => <circle key={k} cx={k} cy={-35} r={10} fill="#fff" opacity={0.6} />)}
  </g>
);
const RoofCollect: React.FC<{ lvl: number }> = ({ lvl }) => <>
  <Bucket x={500} y={GY - 50} lvl={lvl} /><Bucket x={650} y={GY - 50} lvl={lvl} c="#ff6a5a" w={90} />
  <Pool x={1250} y={GY - 50} lvl={lvl} />
</>;
// растение Гэри в горшке
const Gary: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, -10, 20, 45].map((a, i) => <path key={i} transform={`rotate(${a + Math.sin(f * 0.05 + i) * 3})`} d="M 0 -60 Q -30 -130 0 -190 Q 30 -130 0 -60 Z" fill={i % 2 ? "#3ac88a" : "#2aa870"} stroke={INK} strokeWidth={5} />)}
    <path d="M -50 -70 L 50 -70 L 40 0 L -40 0 Z" fill="#c87a4a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-56} y={-82} width={112} height={18} rx={6} fill="#a85a3a" stroke={INK} strokeWidth={5} />
  </g>
);
// мусорные мешки
const Trash: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 4 }) => <g>{Array.from({ length: n }, (_, i) => <path key={i} transform={`translate(${x + i * 70 - (i > 2 ? 140 : 0)} ${y - (i > 2 ? 60 : 0)})`} d="M -40 0 Q -50 -60 -10 -70 L -14 -86 L 14 -86 L 10 -70 Q 50 -60 40 0 Z" fill={i % 2 ? "#262838" : "#3a3a5a"} stroke={INK} strokeWidth={5} />)}</g>;
// окно магазина в пыли
const DustyShop: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 400} y={GY - 620} width={800} height={360} fill="#ff8fb0" stroke={INK} strokeWidth={8} />
    <rect x={x - 340} y={GY - 560} width={680} height={290} fill="#5a6ab0" stroke={INK} strokeWidth={6} />
    <rect x={x - 340} y={GY - 560} width={680} height={290} fill="#c8b890" opacity={0.55} />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={x - 320 + (i * 97) % 640} cy={GY - 540 + (i * 53) % 260} r={4 + (i % 3) * 3} fill="#a89870" opacity={0.6} />)}
  </g>
);
// мигающая сигнализация машины
const AlarmCar: React.FC<{ on: boolean; f: number }> = ({ on, f }) => {
  const blink = on && Math.floor(f / 6) % 2 === 0;
  return <g><BoCar x={960} y={GY - 20} c="#5a7cf0" s={2.2} />
    {blink ? <><Glow x={1294} y={GY - 180} r={200} g="gY" /><Glow x={621} y={GY - 180} r={160} g="gR" /></> : null}
    {on ? <SoundRings x={960} y={GY - 330} f={f * 2} c={YEL} n={3} /> : null}</g>;
};
// дневник
const Diary: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={560} y={320} width={800} height={520} rx={20} fill="#c87a4a" stroke={INK} strokeWidth={10} />
    <rect x={590} y={340} width={360} height={480} fill="#fff8ec" stroke={INK} strokeWidth={6} />
    <rect x={970} y={340} width={360} height={480} fill="#fff8ec" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M 620 ${400 + i * 46} L ${620 + Math.min(300, Math.max(0, g * 30 - i * 300))} ${400 + i * 46}`} stroke="#5a56a0" strokeWidth={6} strokeLinecap="round" />)}
    {Array.from({ length: 9 }, (_, i) => <path key={"r" + i} d={`M 1000 ${400 + i * 46} L 1300 ${400 + i * 46}`} stroke="#c8b8e8" strokeWidth={4} />)}
  </g>
);
const PovPen: React.FC<{ g: number }> = ({ g }) => { const x = 620 + Math.min(300, (g * 30) % 300), y = 400 + Math.min(8, Math.floor(g / 10)) * 46;
  return <g transform={`translate(${x} ${y})`}>
    <rect x={-6} y={-150} width={14} height={150} rx={6} fill="#ffd23c" stroke={INK} strokeWidth={5} transform="rotate(25)" />
    <g transform="rotate(-35)"><rect x={20} y={-70} width={800} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} /><ellipse cx={0} cy={0} rx={70} ry={58} fill="#f8f6f0" stroke={INK} strokeWidth={10} /></g>
  </g>; };

export const P4 = makePart(V, [
  // день 6: дождь
  { at: "", s: (g, f, len) => <><Svg><Skyline cam={camLerp(g, len, C(960, 520, 0.9), C(960, 520, 1.0))} f={f} tod="dusk" midBase={GY + 100} /></Svg><Rain f={f} /></> },
  { at: "And", s: (g, f, len) => <><Apartment cam={C(1450, 520, 1.6)} f={f} tally={5}>
    <Hero x={1360} y={GY} f={f} expr={g > 25 ? "grin" : "neutral"} gaze={1} pose={{ armL: [20, 30], armR: [150, 30], tilt: 10 }} />
    <clipPath id="winrain"><rect x={1250} y={GY - 670} width={560} height={430} /></clipPath>
    <g clipPath="url(#winrain)">{Array.from({ length: 40 }, (_, i) => { const x = 1250 + (i * 137 + f * 5) % 600, y = GY - 700 + (i * 97 + f * 30) % 480; return <path key={i} d={`M ${x} ${y} l -8 30`} stroke="#bfd8ff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />; })}</g></Apartment></> },
  { at: "put", s: (g, f, len) => <><Rooftop cam={C(900, GY - 250, 1.15)} f={f} tod="dusk"><RoofCollect lvl={ip(g, [0, len], [0.05, 0.4])} />
    <Hero x={850} y={GY - 50} f={f} expr="determined" pose={{ armL: [60, 20], armR: [60, 20], lean: 10 }} holdL={{ node: <g transform="translate(0 40) scale(0.6)"><Bucket x={0} y={0} lvl={0} c="#5ac84a" /></g>, k: 1 }} /></Rooftop><Rain f={f} /></> },
  { at: "evening", s: (g, f, len) => <><Rooftop cam={C(900, GY - 220, 1.3)} f={f} tod="dusk"><RoofCollect lvl={0.85} /></Rooftop><Rain f={f} o={0.25} /></> },
  // кипятит на плитке
  { at: "boil", s: (g, f, len) => <Kitchen cam={C(-120, GY - 300, 2.0)} f={f} dark={0.4}>
    <g transform={`translate(-230 ${GY - 225})`}><rect x={-100} y={-44} width={200} height={44} rx={8} fill="#5a5680" stroke={INK} strokeWidth={6} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-24 + i * 12} -46 q -5 -12 0 -20 q 5 8 0 20`} fill="#5ae0ff" stroke={INK} strokeWidth={2} />)}
      <rect x={-80} y={-150} width={160} height={104} rx={12} fill="#8a86a8" stroke={INK} strokeWidth={6} /><rect x={-90} y={-160} width={180} height={20} rx={8} fill="#6a6688" stroke={INK} strokeWidth={5} />
      {g % 10 < 5 ? [-40, 0, 40].map((k) => <circle key={k} cx={k} cy={-172} r={7} fill="#bff4ff" stroke={INK} strokeWidth={2} />) : null}</g>
    <g style={{ filter: "blur(3px)" }}>{[0, 1, 2].map((i) => { const t = ((f * 0.8 + i * 33) % 100) / 100; return <path key={i} d={`M ${-260 + i * 30} ${GY - 400 - t * 60} q 12 -20 0 -40 q -12 -20 0 -40`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.45 * Math.sin(t * Math.PI)} />; })}</g>
    <Hero x={95} y={GY} f={f} expr="neutral" gaze={-1} pose={{ armL: [40, 40], armR: [15, 8] }} /></Kitchen> },
  // день 7: неделя
  { at: "Day", n: 2, s: (g, f, len) => <Apartment cam={C(-140, GY - 280, 2.0)} f={f} tally={since("seven", "Day", g, 1, 2) > 4 ? 7 : 6}>
    <Hero x={-80} y={GY} f={f} expr="tired" gaze={-1} pose={{ armL: [150, ip(g, [0, 20], [-10, 10])], armR: [15, 8], tilt: -8 }} holdL={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} /></Apartment> },
  { at: "week", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(-120, GY - 300, 2.4), C(-120, GY - 300, 2.8))} f={f} tally={7} /> },
  { at: "city", s: (g, f, len) => <Street cam={camLerp(g, len, C(800, 560, 0.95), C(1100, 560, 1.0))} f={f} tod="day"><BoCar x={300} y={GY - 40} c="#ff6a5a" rot={8} s={2.2} /></Street> },
  { at: "Trash", s: (g, f, len) => <Street cam={C(1000, GY - 100, 1.6)} f={f} tod="day"><Trash x={900} y={GY + 160} n={5} /></Street> },
  { at: "Shop", s: (g, f, len) => <Street cam={C(1000, GY - 400, 1.5)} f={f} tod="day" back={<DustyShop x={1000} />} /> },
  { at: "Somewhere", s: (g, f, len) => <Street cam={C(960, GY - 140, 0.95)} f={f} tod="day"><AlarmCar on={since("dies", "Somewhere", g) < 0} f={f} /></Street> },
  { at: "quiet", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, GY - 140, 0.95), C(960, 540, 0.8))} f={f} tod="day"><AlarmCar on={false} f={f} /></Street> },
  // разговаривает сам с собой
  { at: "start", s: (g, f, len) => <Apartment cam={C(1150, GY - 260, 1.8)} f={f} tally={7}>
    <Hero x={1150} y={GY} f={f} expr="talk" open={0.2 + 0.5 * Math.abs(Math.sin(f * 0.35))} pose={{ armR: [70 + Math.sin(f * 0.2) * 20, 50], armL: [20, 20] }} /></Apartment> },
  { at: "narrate", s: (g, f, len) => <Apartment cam={C(-300, GY - 230, 1.8)} f={f} tally={7}>
    {Array.from({ length: 30 }, (_, i) => <Can key={i} x={-560 + (i % 10) * 48} y={GY - Math.floor(i / 10) * 58} c={["#ff6a5a", "#5ac84a", "#ffd23c", "#5a7cf0"][i % 4]} />)}
    <Hero x={-20} y={GY} f={f} expr="talk" open={0.2 + 0.5 * Math.abs(Math.sin(f * 0.35))} gaze={-1} pose={{ armL: [90, 20] }} holdL={{ node: <Can x={0} y={30} />, k: 1 }} /></Apartment> },
  { at: "argue", s: (g, f, len) => { const side = Math.floor(g / 14) % 2 === 0;
    return <Kitchen cam={C(1160, GY - 220, 2.2)} f={f} dark={0.35}>
      <Bean x={1165} y={GY} s={HS} look={HERO2D} f={f} flip={!side} expr={side ? "talk" : "worried"} open={0.5} gaze={side ? 1 : -1} pose={{ armR: [100, 40], armL: [20, 20], tilt: side ? 8 : -8 }} />
      {[1040, 1290].map((x, i) => <g key={x} transform={`translate(${x} ${GY - 140})`}><Can x={0} y={0} c={i ? "#5ac84a" : "#ff6a5a"} s={1.2} /></g>)}
    </Kitchen>; } },
  // Гэри
  { at: "give", s: (g, f, len) => <Apartment cam={C(1480, GY - 420, 2.1)} f={f} tally={7}>
    <Gary x={1500} y={GY - 240} f={f} s={0.9} />
    <Hero x={1300} y={GY} f={f} expr="grin" gaze={1} pose={{ armR: [80, 20], tilt: 10 }} /></Apartment> },
  { at: "Gary", s: (g, f, len) => <Apartment cam={C(1510, GY - 430, 3.2)} f={f} tally={7}><Gary x={1500} y={GY - 240} f={f} s={0.9} /></Apartment> },
  // одиночество и мозг
  { at: "Scientists", s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" />
    <g transform="translate(960 520)"><circle r={300} fill="#3a3478" stroke={INK} strokeWidth={10} /><Bean x={0} y={240} s={0.75} look={HERO2D} f={f} expr="sad" sit={70 / 0.75} pose={{ armL: [30, 40], armR: [30, 40], tilt: -8 }} /></g>
    {[[560, 300], [1360, 300], [520, 760], [1400, 760]].map(([x, y], i) => <g key={i} opacity={ip(g, [i * 6, i * 6 + 8], [0, 1])}><circle cx={x} cy={y} r={70} fill="#4a3a8a" stroke={INK} strokeWidth={6} /></g>)}
  </Frame> },
  { at: "mood", s: (g, f, len) => <Apartment cam={C(700, GY - 250, 1.9)} f={f} tally={7} dark={0.4}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="sad" gaze={-1} sit={70 / HS} pose={{ armL: [60, 70], armR: [60, 70], tilt: -12 }} /></Apartment> },
  { at: "sleep", s: (g, f, len) => <Apartment cam={C(640, GY - 150, 1.9)} f={f} tally={7} tod="night" dark={0.5} sleeping>
    <Bean x={628} y={GY - 147} s={HS} look={HERO2D} f={f} expr="tired" lying shadow={false} gaze={0.5} />
    <path d={`M 400 ${GY - 66} Q 396 ${GY - 152} 470 ${GY - 156} L 790 ${GY - 130} Q 846 ${GY - 120} 840 ${GY - 66} Z`} fill="#5ad8c8" stroke={INK} strokeWidth={7} strokeLinejoin="round" /></Apartment> },
  { at: "memory", s: (g, f, len) => <Kitchen cam={C(700, GY - 280, 1.8)} f={f} dark={0.35}>
    <Hero x={880} y={GY} f={f} expr="worried" gaze={-1} pose={{ armR: [150, 80], armL: [20, 20], tilt: -12 }} /></Kitchen> },
  { at: "Humans", s: (g, f, len) => <Street cam={C(960, 560, 0.95)} f={f} tod="day">
    {[[400, 2], [1500, 5]].map(([x], i) => <g key={i} opacity={0.18}><Hero x={x} y={GY + 150} f={f} /></g>)}
    <Hero x={960} y={GY + 150} f={f} expr="sad" pose={{ armL: [15, 8], armR: [15, 8] }} /></Street> },
  // правила
  { at: "So", s: (g, f, len) => <Apartment cam={C(1150, GY - 270, 1.9)} f={f} tally={7}>
    <Hero x={1150} y={GY} f={f} expr="determined" pose={{ armR: [150, 10], armL: [15, 8] }} /></Apartment> },
  { at: "Wake", s: (g, f, len) => <Apartment cam={C(640, GY - 150, 1.9)} f={f} tally={7} sleeping>
    <g transform={`translate(925 ${GY - 110})`}><circle cx={0} cy={-50} r={44} fill="#ff4a6a" stroke={INK} strokeWidth={6} /><circle cx={0} cy={-50} r={30} fill="#fff6e0" stroke={INK} strokeWidth={4} /><path d="M 0 -50 L 0 -72 M 0 -50 L 14 -44" stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>
    {g < 16 ? <InBed f={f} expr={g > 8 ? "neutral" : "sleep"} /> : <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="determined" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} />}</Apartment> },
  { at: "Exercise", s: (g, f, len) => { const k = Math.abs(Math.sin(f * 0.25));
    return <Apartment cam={C(1150, GY - 250, 1.8)} f={f} tally={7}>
      <Bean x={1150} y={GY} s={HS} look={HERO2D} f={f} expr="determined" sweat sit={ip(k, [0, 1], [168, 80])} pose={{ armL: [90, 0], armR: [90, 0] }} /></Apartment>; } },
  { at: "Keep", s: (g, f, len) => <Frame bg="#3e4a96"><rect width={1920} height={1080} fill="#3e4a96" /><Diary g={g} /><PovPen g={g} /><rect width={1920} height={1080} fill="#0a0628" opacity={0.2} /></Frame> },
  { at: "Go", s: (g, f, len) => <Street cam={C(1000, 600, 1.0)} f={f} tod="day"><Hero x={500 + walkDx(g)} y={GY + 150} f={f} expr="neutral" pose={walk(g)} /></Street> },
  { at: "nobody", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 600, 1.0), C(960, 500, 0.75))} f={f} tod="day"><Hero x={960} y={GY + 150} f={f} expr="sad" gaze={Math.sin(f * 0.06)} pose={{ armL: [15, 8], armR: [15, 8] }} /></Street> },
  // тишина
  { at: "realize", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(700, GY - 250, 2.0), C(700, GY - 250, 2.3))} f={f} tally={7} dark={0.45}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="sad" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
  { at: "silence", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(700, GY - 250, 1.6), C(800, 520, 0.95))} f={f} tally={7} tod="night" dark={0.55}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="sad" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
], { id: 4, dir: "bo" });
