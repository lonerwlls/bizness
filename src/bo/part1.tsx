// Часть 1/10: день первый — ты проспал эвакуацию, город пуст и без света.
// Правдоподобно: спит под одеялом, сидит по-человечески, стучит в дверь, шнур в розетке, шаг без скольжения, мимика по ситуации.
import React from "react";
import { Bean, Cam, Frame, HERO2D, Phone, SoundRings, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, BoCar, Bench, Bus, GY, HS, Hallway, Hero, INK, InBed, Kitchen, LampPost, NoIcon, Notice, Rooftop, Skyline, Street, Svg, YEL, walk, walkSpeed } from "./scenes";
import { VOICE } from "./voices/p1";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const SoundOff: React.FC<{ x: number; y: number }> = ({ x, y }) => <g transform={`translate(${x} ${y})`}>{[30, 55].map((r) => <path key={r} d={`M ${r} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r} ${r * 0.7}`} stroke="#b8b4d0" strokeWidth={8} fill="none" />)}<path d="M 0 -50 L 90 50" stroke="#ff3a4a" strokeWidth={12} strokeLinecap="round" /></g>;
// брошенные машины
const Abandoned: React.FC = () => <>
  <BoCar x={-300} y={GY - 40} c="#5a7cf0" rot={-8} door /><BoCar x={420} y={GY - 120} c="#ff6a5a" rot={12} flip />
  <BoCar x={2350} y={GY - 50} c="#5ad8c8" rot={-14} door flip /><BoCar x={3000} y={GY - 110} c="#ffd23c" rot={6} />
</>;
// рука героя «от первого лица»: рукав куртки + кисть
const PovHand: React.FC<{ x: number; y: number; rot?: number; point?: boolean; s?: number }> = ({ x, y, rot = 0, point, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={0} y={-70} width={700} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} />
    <rect x={-10} y={-80} width={60} height={160} rx={20} fill="#c8561a" stroke={INK} strokeWidth={9} />
    <ellipse cx={-70} cy={0} rx={80} ry={66} fill="#f8f6f0" stroke={INK} strokeWidth={10} />
    {point ? <rect x={-230} y={-26} width={170} height={52} rx={26} fill="#f8f6f0" stroke={INK} strokeWidth={10} /> : null}
  </g>
);
// посадка на край кровати: матрас на высоте 70 px → sit = 100 / HS
const SIT_BED = 70 / HS;
// сидящий герой с телефоном, шнур идёт к розетке
const PhoneOnBed: React.FC<{ f: number; expr: any; open?: number }> = ({ f, expr, open = 0 }) => {
  const X = 640, hx = X + 143 * HS, hy = GY + (-306 + (168 - SIT_BED)) * HS;
  return <>
    <path d={`M ${hx} ${hy + 40} Q ${hx + 40} ${GY - 10} ${980} ${GY - 40} Q ${1030} ${GY - 50} ${1050} ${GY - 66}`} stroke="#f4f2ff" strokeWidth={7} fill="none" />
    <path d={`M ${hx} ${hy + 40} Q ${hx + 40} ${GY - 10} ${980} ${GY - 40} Q ${1030} ${GY - 50} ${1050} ${GY - 66}`} stroke={INK} strokeWidth={2} fill="none" opacity={0.6} />
    <Bean x={X} y={GY} s={HS} look={HERO2D} f={f} expr={expr} open={open} sit={SIT_BED} gaze={0.5} pose={{ armR: [30, 110], armL: [40, 70], tilt: 8 }} holdR={{ node: <Phone on={false} />, k: 1.3 }} />
  </>;
};

export const P1 = makePart(V, [
  // крючок: окна города гаснут
  { at: "", s: (g, f, len) => <Svg><Skyline cam={camLerp(g, len, C(960, 500, 0.9), C(960, 520, 1.0))} f={f} tod="night" lights={ip(g, [10, 70], [1, 0])} midBase={GY + 100} /></Svg> },
  // ты один посреди пустой улицы: озираешься
  { at: "and", n: 2, s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 560, 0.9), C(960, GY - 150, 1.4))} f={f}><Abandoned />
    <Hero x={960} y={GY + 130} f={f} expr="worried" gaze={Math.sin(f * 0.08) > 0 ? 1 : -1} pose={{ tilt: Math.sin(f * 0.08) * 10, armL: [20, 20], armR: [20, 20] }} /></Street> },
  // утро: спит под одеялом
  { at: "starts", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(900, 540, 1.0), C(640, GY - 200, 1.7))} f={f} sleeping><InBed f={f} expr={g > len - 12 ? "neutral" : "sleep"} /></Apartment> },
  { at: "fridge", s: (g, f, len) => <Kitchen cam={C(610, GY - 330, 1.7)} f={f}><SoundOff x={790} y={GY - 520} /></Kitchen> },
  { at: "traffic", s: (g, f, len) => <Street cam={camLerp(g, len, C(1100, 640, 1.2), C(1300, 640, 1.25))} f={f}><Abandoned /></Street> },
  { at: "alarm", s: (g, f, len) => <Apartment cam={C(640, GY - 140, 2.3)} f={f} sleeping>
    <g transform={`translate(925 ${GY - 110})`}><rect x={-60} y={-80} width={120} height={80} rx={10} fill="#262838" stroke={INK} strokeWidth={6} /><rect x={-46} y={-66} width={92} height={50} rx={4} fill="#141228" /></g>
    <InBed f={f} expr={g > 18 ? "worried" : "neutral"} gaze={g > 10 ? 1 : 0} raise={ip(g, [18, len], [0, 0.4])} /></Apartment> },
  // сидит на краю кровати, телефон на зарядке — но экран чёрный
  { at: "because", s: (g, f, len) => <Apartment cam={C(780, GY - 230, 2.0)} f={f}><PhoneOnBed f={f} expr={g > 20 ? "worried" : "neutral"} /></Apartment> },
  { at: "charger", s: (g, f, len) => <Frame bg="#3e4a96"><rect width={1920} height={1080} fill="#3e4a96" />
    <g transform="translate(960 560) scale(5)"><Phone on={false} /></g>
    <g transform="translate(960 560)"><rect x={-60} y={-40} width={110} height={56} rx={10} fill="none" stroke="#5a5680" strokeWidth={10} /><rect x={50} y={-22} width={14} height={20} fill="#5a5680" /><rect x={-48} y={-28} width={14} height={32} fill="#ff3a4a" opacity={(f % 20) < 10 ? 1 : 0.2} /></g>
    <path d="M 960 860 Q 960 1000 1100 1100" stroke="#f4f2ff" strokeWidth={22} fill="none" />
    <PovHand x={1250} y={760} rot={-30} s={1.2} /><g transform="scale(-1 1) translate(-1920 0)"><PovHand x={1250} y={760} rot={-30} s={1.2} /></g>
    <rect width={1920} height={1080} fill="#0a0628" opacity={0.25} />
  </Frame> },
  // выключатель — вид твоими глазами
  { at: "flip", s: (g, f, len) => {
    const down = since("switch", "flip", g) > 0;
    return <Frame bg="#3e4a96"><rect width={1920} height={1080} fill="#3e4a96" />
      <rect x={760} y={260} width={400} height={560} rx={40} fill="#e8e4ff" stroke={INK} strokeWidth={12} />
      <rect x={890} y={down ? 560 : 340} width={140} height={200} rx={20} fill="#b8b4d0" stroke={INK} strokeWidth={10} />
      <PovHand x={ip(g, [0, 12], [1700, 1260])} y={down ? 620 : 470} rot={-8} point />
      <g transform="translate(1500 170)"><circle r={90} fill="#8a86a8" stroke={INK} strokeWidth={10} /><rect x={-40} y={80} width={80} height={70} fill="#b8b4d0" stroke={INK} strokeWidth={8} /></g>
      <rect width={1920} height={1080} fill="#0a0628" opacity={0.25} />
    </Frame>;
  } },
  // у окна: смотрит наружу, тревога
  { at: "look", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(1300, 560, 1.3), C(1450, 520, 1.6))} f={f}><Hero x={1350} y={GY} f={f} expr={g > 25 ? "scared" : "worried"} gaze={1} pose={{ tilt: 12, armL: [20, 30], armR: [60, 60] }} /></Apartment> },
  { at: "Cars", s: (g, f, len) => <Street cam={camLerp(g, len, C(300, 620, 1.2), C(500, 620, 1.3))} f={f}><Abandoned /></Street> },
  { at: "bus", s: (g, f, len) => <Street cam={camLerp(g, len, C(1200, 600, 1.1), C(1300, 600, 1.2))} f={f}><Abandoned /><Bus x={1250} y={GY - 60} /></Street> },
  // далёкий звук: прислушивается у окна
  { at: "Somewhere", s: (g, f, len) => <Apartment cam={C(1400, GY - 330, 2.0)} f={f}>
    <Hero x={1350} y={GY} f={f} expr="worried" gaze={1} pose={{ tilt: 14, armR: [150, 80], armL: [20, 30] }} />
    {since("stops", "Somewhere", g) < 0 ? <SoundRings x={1700} y={GY - 520} f={f} c="#ff6fb5" n={3} /> : null}
  </Apartment> },
  // спускается по подъезду
  { at: "go", s: (g, f, len) => <Hallway cam={camLerp(g, len, C(500, 560, 1.0), C(600, 560, 1.05))} f={f}><Hero x={300 + g * walkSpeed()} y={GY} f={f} expr="worried" gaze={1} pose={walk(f)} /></Hallway> },
  // стучит в дверь соседа (дверь №3: x 900…1160, рука на двери)
  { at: "knock", n: 1, s: (g, f, len) => <Hallway cam={C(1100, GY - 280, 1.8)} f={f}>
    <Hero x={1239} y={GY} f={f} expr={since("answer", "knock", g) > 0 ? "sad" : "worried"} open={0.4} gaze={-1} pose={{ armL: [90 + Math.max(0, Math.sin(f * 0.7)) * 12, 0], armR: [15, 8], tilt: -10 }} />
    {Math.sin(f * 0.7) > 0.85 ? [0, 1].map((i) => <path key={i} d={`M ${1090 - i * 10} ${GY - 230 + i * 40} l -30 -14`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />) : null}
  </Hallway> },
  { at: "every", s: (g, f, len) => { const k = Math.min(3, Math.floor(g / 14)), dx = -900 + (k + 1) * 600;
    return <Hallway cam={C(dx + 200, GY - 280, 1.6)} f={f}>
      <Hero x={dx + 339} y={GY} f={f} expr={k > 1 ? "sad" : "worried"} gaze={-1} pose={{ armL: [90 + Math.max(0, Math.sin(f * 0.7)) * 12, 0], armR: [15, 8], tilt: -8 }} /></Hallway>; } },
  // объявление на фонаре
  { at: "On", n: 3, s: (g, f, len) => { const stop = Math.min(g, 40) * walkSpeed();
    return <Street cam={camLerp(g, len, C(900, 600, 1.0), C(1000, GY - 220, 1.5))} f={f}><Abandoned /><LampPost x={1000} y={GY + 120} notice={1} f={f} />
      <Hero x={620 + stop} y={GY + 140} f={f} expr={g > 40 ? "worried" : "neutral"} gaze={g > 40 ? 1 : 0} pose={g < 40 ? walk(f) : { tilt: 10, armL: [15, 8], armR: [15, 8] }} /></Street>; } },
  { at: "evacuated", s: (g, f, len) => <Frame bg="#2a2470"><rect width={1920} height={1080} fill="#4a3a8a" /><g transform={`translate(960 540) scale(${ip(g, [0, len], [3.2, 3.6])}) translate(-75 -95) skewY(${Math.sin(f * 0.4) * 3})`}><Notice /></g></Frame> },
  { at: "after", s: (g, f, len) => <Svg><Skyline cam={C(960, 540, 1.0)} f={f} tod="night" lights={ip(g, [0, 14], [1, 0])} midBase={GY + 100} />
    {[300, 960, 1620].map((x, i) => <g key={i} transform={`translate(${x} 1080) scale(1.6)`}><path d="M -60 0 L 0 -420 L 60 0 M -40 -140 L 40 -140 M -100 -360 L 100 -360" stroke={INK} strokeWidth={12} fill="none" /><path d="M -100 -360 L 100 -360" stroke="#b8b4d0" strokeWidth={6} />{g < 12 && (f + i * 3) % 6 < 3 ? <circle cx={100} cy={-360} r={30} fill={YEL} stroke={INK} strokeWidth={5} /> : null}</g>)}
  </Svg> },
  { at: "slept", s: (g, f, len) => <Apartment cam={C(640, GY - 200, 1.8)} f={f} tod="night" dark={0.45} sleeping><InBed f={f} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${360 + i * 50} ${GY - 260 - i * 50 - (g % 20)})`}><path d="M -14 -14 L 14 -14 L -14 14 L 14 14" stroke="#e8e4ff" strokeWidth={6} fill="none" strokeLinejoin="round" /></g>)}
  </Apartment> },
  // день первый: первая палочка мелом
  { at: "This", s: (g, f, len) => <Apartment cam={C(-120, GY - 260, 2.0)} f={f} tally={g > 14 ? 1 : 0}>
    <Hero x={-80} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [150, ip(g, [0, 14], [-10, 10])], armR: [15, 8], tilt: -8 }} holdL={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} />
  </Apartment> },
  { at: "power", n: 2, s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="bulb" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  { at: "phone", n: 2, s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="phone" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  { at: "internet", s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="wifi" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  // сидит на скамейке остановки и ждёт
  { at: "idea", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, GY - 60, 1.7), C(960, 600, 1.0))} f={f}><Abandoned />
    <Bench x={960} y={GY + 140} />
    <Bean x={960} y={GY + 140} s={HS} look={HERO2D} f={f} expr="sad" gaze={Math.sin(f * 0.05)} sit={70 / HS} pose={{ armL: [20, 40], armR: [20, 40], tilt: Math.sin(f * 0.05) * 6 }} /></Street> },
  // решение: выжить
  { at: "So", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 280, 1.8), C(960, 520, 0.95))} f={f}>
    <Hero x={960} y={GY - 50} f={f} expr="determined" pose={{ armL: [25, 10], armR: [25, 10], bob: Math.sin(f * 0.1) * 3 }} /></Rooftop> },
], { id: 1, dir: "bo" });
