// Часть 1/8: день первый — ты проспал эвакуацию, город пуст и без света.
import React from "react";
import { Bean, Cam, Dog, Frame, HERO2D, Phone, Voice, atWord, camLerp, ip, makePart, walkPose } from "../sp/kit";
import { Apartment, BoCar, Bus, GY, Hallway, Hero, INK, Kitchen, LampPost, NoIcon, Notice, Rooftop, Skyline, Street, Svg, YEL } from "./scenes";
import { VOICE } from "./voices/p1";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const SoundOff: React.FC<{ x: number; y: number }> = ({ x, y }) => <g transform={`translate(${x} ${y})`}>{[30, 55].map((r) => <path key={r} d={`M ${r} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r} ${r * 0.7}`} stroke="#b8b4d0" strokeWidth={8} fill="none" />)}<path d="M 0 -50 L 90 50" stroke="#ff3a4a" strokeWidth={12} strokeLinecap="round" /></g>;
const lyingHero = (f: number, expr: any = "neutral", open = 0) => <Bean x={720} y={GY - 150} s={0.62} look={HERO2D} expr={expr} open={open} f={f} lying shadow={false} />;
// обычная улица с брошенными машинами и автобусом
const Abandoned: React.FC<{ f: number }> = () => <>
  <BoCar x={-300} y={GY - 40} c="#5a7cf0" rot={-8} door /><BoCar x={420} y={GY - 120} c="#ff6a5a" rot={12} flip />
  <BoCar x={2350} y={GY - 50} c="#5ad8c8" rot={-14} door flip /><BoCar x={3000} y={GY - 110} c="#ffd23c" rot={6} />
</>;

export const P1 = makePart(V, [
  // крючок: город гаснет
  { at: "", s: (g, f, len) => <Svg><Skyline cam={camLerp(g, len, C(960, 500, 0.9), C(960, 520, 1.0))} f={f} tod="night" lights={ip(g, [10, 70], [1, 0])} midBase={GY + 100} /></Svg> },
  { at: "and", n: 2, s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 520, 0.85), C(960, 540, 0.95))} f={f}><Abandoned f={f} /><Hero x={960} y={GY + 120} f={f} expr="neutral" pose={{ tilt: Math.sin(f * 0.05) * 8 }} /></Street> },
  // утро в квартире
  { at: "starts", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(900, 540, 1.0), C(700, 600, 1.2))} f={f}>{lyingHero(f)}</Apartment> },
  { at: "fridge", s: (g, f, len) => <Kitchen cam={C(610, GY - 330, 1.7)} f={f}><SoundOff x={790} y={GY - 520} /></Kitchen> },
  { at: "traffic", s: (g, f, len) => <Street cam={camLerp(g, len, C(1100, 640, 1.2), C(1300, 640, 1.25))} f={f}><Abandoned f={f} /></Street> },
  { at: "alarm", s: (g, f, len) => <Apartment cam={C(820, GY - 260, 2.4)} f={f}>
    <g transform={`translate(900 ${GY - 180})`}><rect x={-60} y={-80} width={120} height={80} rx={10} fill="#262838" stroke={INK} strokeWidth={6} /><rect x={-46} y={-66} width={92} height={50} rx={4} fill="#141228" /></g>
    {lyingHero(f, g > 20 ? "shock" : "neutral", 0.3)}</Apartment> },
  { at: "because", s: (g, f, len) => <Apartment cam={C(660, GY - 300, 2.4)} f={f}>
    <Hero x={600} y={GY - 110} f={f} expr={since("nothing", "because", g) > 0 ? "sad" : "neutral"} pose={{ armR: [120, 40], legL: 70, legR: 76 }} holdR={{ node: <g><Phone on={false} /><path d="M 0 60 Q 0 120 60 140" stroke="#f4f2ff" strokeWidth={6} fill="none" /></g>, k: 1.3 }} />
  </Apartment> },
  { at: "flip", s: (g, f, len) => {
    const down = since("switch", "flip", g) > 0;
    return <Frame bg="#3e4a96"><rect width={1920} height={1080} fill="#3e4a96" />
      <rect x={760} y={260} width={400} height={560} rx={40} fill="#e8e4ff" stroke={INK} strokeWidth={12} />
      <rect x={890} y={down ? 560 : 340} width={140} height={200} rx={20} fill="#b8b4d0" stroke={INK} strokeWidth={10} />
      <g transform={`translate(${ip(g, [0, 12], [1500, 1000])} ${down ? 600 : 420})`}><rect x={0} y={-40} width={500} height={80} rx={40} fill="#f2e2c8" stroke={INK} strokeWidth={10} /></g>
      <g transform="translate(1500 200)"><circle r={90} fill="#8a86a8" stroke={INK} strokeWidth={10} /><rect x={-40} y={80} width={80} height={70} fill="#b8b4d0" stroke={INK} strokeWidth={8} /></g>
      <rect width={1920} height={1080} fill="#0a0628" opacity={0.25} />
    </Frame>;
  } },
  { at: "look", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(1300, 560, 1.3), C(1450, 520, 1.6))} f={f}><Hero x={1350} y={GY} f={f} expr="shock" open={0.4} /></Apartment> },
  // пустая улица
  { at: "Cars", s: (g, f, len) => <Street cam={camLerp(g, len, C(300, 620, 1.2), C(500, 620, 1.3))} f={f}><Abandoned f={f} /></Street> },
  { at: "bus", s: (g, f, len) => <Street cam={camLerp(g, len, C(1200, 600, 1.1), C(1300, 600, 1.2))} f={f}><Abandoned f={f} /><Bus x={1250} y={GY - 60} /></Street> },
  { at: "Somewhere", s: (g, f, len) => <Street cam={C(960, 560, 0.9)} f={f}><Abandoned f={f} /><Dog x={1900} y={GY - 140} f={f} bark s={0.25} /></Street> },
  // подъезд
  { at: "go", s: (g, f, len) => <Hallway cam={camLerp(g, len, C(600, 560, 1.0), C(900, 560, 1.05))} f={f}><Hero x={ip(g, [0, len], [400, 900])} y={GY} f={f} expr="neutral" pose={walkPose(f, 0.25)} /></Hallway> },
  { at: "knock", n: 1, s: (g, f, len) => <Hallway cam={C(1300, GY - 280, 1.8)} f={f}>
    <Hero x={1450} y={GY} f={f} expr="neutral" flip pose={{ armR: [100 + Math.abs(Math.sin(f * 0.6)) * 20, 30] }} />
    {Math.sin(f * 0.6) > 0.8 ? [0, 1].map((i) => <path key={i} d={`M ${1320 - i * 20} ${GY - 330 + i * 30} l -30 -10`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />) : null}
  </Hallway> },
  { at: "every", s: (g, f, len) => { const k = Math.min(3, Math.floor(g / 15)); return <Hallway cam={C(-150 + k * 600 + 250, GY - 280, 1.6)} f={f}>
    <Hero x={-150 + k * 600 + 380} y={GY} f={f} expr={k > 1 ? "sad" : "neutral"} flip pose={{ armR: [100 + Math.abs(Math.sin(f * 0.6)) * 20, 30] }} /></Hallway>; } },
  // объявление
  { at: "On", n: 3, s: (g, f, len) => <Street cam={camLerp(g, len, C(960, 560, 1.0), C(1050, 500, 1.4))} f={f}><Abandoned f={f} /><LampPost x={1000} y={GY + 120} notice={1} f={f} /><Hero x={760} y={GY + 140} f={f} expr="neutral" pose={walkPose(f, 0.2)} /></Street> },
  { at: "evacuated", s: (g, f, len) => <Frame bg="#2a2470"><rect width={1920} height={1080} fill="#4a3a8a" /><g transform={`translate(960 540) scale(${ip(g, [0, len], [3.2, 3.6])}) translate(-75 -95) skewY(${Math.sin(f * 0.4) * 3})`}><Notice /></g></Frame> },
  { at: "after", s: (g, f, len) => <Svg><Skyline cam={C(960, 540, 1.0)} f={f} tod="night" lights={ip(g, [0, 14], [1, 0])} midBase={GY + 100} />
    {[300, 960, 1620].map((x, i) => <g key={i} transform={`translate(${x} 1080) scale(1.6)`}><path d="M -60 0 L 0 -420 L 60 0 M -40 -140 L 40 -140 M -100 -360 L 100 -360" stroke={INK} strokeWidth={12} fill="none" /><path d="M -100 -360 L 100 -360" stroke="#b8b4d0" strokeWidth={6} />{g < 12 && (f + i * 3) % 6 < 3 ? <circle cx={100} cy={-360} r={30} fill={YEL} stroke={INK} strokeWidth={5} /> : null}</g>)}
  </Svg> },
  { at: "slept", s: (g, f, len) => <Apartment cam={C(700, GY - 260, 1.8)} f={f} tod="night" dark={0.4}>{lyingHero(f, "neutral")}
    {[0, 1, 2].map((i) => <g key={"z" + i} transform={`translate(${780 + i * 55} ${GY - 330 - i * 55 - (g % 20)})`}><path d="M -16 -16 L 16 -16 L -16 16 L 16 16" stroke="#e8e4ff" strokeWidth={7} fill="none" strokeLinejoin="round" /></g>)}
  </Apartment> },
  // день первый: первая отметка
  { at: "This", s: (g, f, len) => <Apartment cam={C(-150, GY - 380, 2.0)} f={f} tally={g > 12 ? 1 : 0}>
    <Hero x={30} y={GY} f={f} expr="neutral" flip pose={{ armR: [120, 20] }} holdR={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} />
  </Apartment> },
  { at: "power", n: 2, s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="bulb" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  { at: "phone", n: 2, s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="phone" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  { at: "internet", s: (g, f, len) => <Frame bg="#1e1a50"><rect width={1920} height={1080} fill="#2a2470" /><NoIcon x={960} y={540} k="wifi" p={ip(g, [0, 8], [0.3, 1])} /></Frame> },
  { at: "idea", s: (g, f, len) => <Street cam={camLerp(g, len, C(960, GY - 100, 1.6), C(960, 600, 1.0))} f={f}><Abandoned f={f} />
    <Hero x={960} y={GY + 154} f={f} expr="sad" pose={{ legL: 70, legR: 76, armL: [20, 40], armR: [20, 40] }} /></Street> },
  { at: "So", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 300, 1.6), C(960, 520, 0.95))} f={f}>
    <Hero x={960} y={GY - 50} f={f} expr="smirk" pose={{ armL: [30, -60], armR: [30, -60] }} /></Rooftop> },
], { id: 1, dir: "bo" });
