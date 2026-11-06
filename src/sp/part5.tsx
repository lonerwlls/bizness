// Часть 5/8: спасения — и понимание, что всех не спасти.
import React from "react";
import { Bay, Bean, BigWaves, Boat, Bowl, Cam, Car, Flames, FlyHero, Frame, GY, Glow, HERO2D, HS, INK, LOOKS, NightOver, Phone, Planet, Puff, Room, Sky, Smoke2, SoundRings, SpeedLines, Thought, Town, Truck, Voice, YEL, camLerp, floatPose, ip, makePart, shake } from "./kit";
import { VOICE } from "./voices/p5";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const Stars: React.FC = () => <>{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}</>;
const Clock: React.FC<{ x: number; y: number; r: number; f: number; sp?: number }> = ({ x, y, r, f, sp = 1 }) => (
  <g><circle cx={x} cy={y} r={r} fill="#fff6e0" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${x + Math.sin(i * 0.5236) * r * 0.8} ${y - Math.cos(i * 0.5236) * r * 0.8} L ${x + Math.sin(i * 0.5236) * r * 0.9} ${y - Math.cos(i * 0.5236) * r * 0.9}`} stroke={INK} strokeWidth={8} />)}
    <path d={`M ${x} ${y} L ${x + Math.sin(f * 0.02 * sp) * r * 0.5} ${y - Math.cos(f * 0.02 * sp) * r * 0.5}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d={`M ${x} ${y} L ${x + Math.sin(f * 0.24 * sp) * r * 0.75} ${y - Math.cos(f * 0.24 * sp) * r * 0.75}`} stroke="#ff4a6a" strokeWidth={8} strokeLinecap="round" />
    <circle cx={x} cy={y} r={14} fill={INK} /></g>
);
const Driver: React.FC<{ f: number }> = ({ f }) => (
  <g transform="translate(-20 -104)">
    <circle cx={0} cy={0} r={24} fill="#f2e2c8" stroke={INK} strokeWidth={4} />
    <circle cx={-7} cy={-4} r={4} fill={INK} /><circle cx={8} cy={-4} r={4} fill={INK} /><ellipse cx={1} cy={10} rx={5} ry={7} fill={INK} />
    <path d={`M -30 14 L -44 ${-20 + Math.sin(f) * 6} M 30 14 L 44 ${-20 + Math.cos(f) * 6}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const DOTS = Array.from({ length: 26 }, (_, i) => [Math.cos(i * 2.4) * (0.2 + (i % 5) * 0.15), Math.sin(i * 2.4) * (0.2 + (i % 5) * 0.15)]);
const Alarms: React.FC<{ x: number; y: number; r: number; f: number; n?: number }> = ({ x, y, r, f, n = 26 }) => (
  <g>{DOTS.slice(0, n).map(([a, b], i) => (f + i * 11) % 30 < 18 ? <g key={i}><Glow x={x + a * r} y={y + b * r} r={50} g="gR" /><circle cx={x + a * r} cy={y + b * r} r={10} fill="#ff3a4a" stroke={INK} strokeWidth={3} /></g> : null)}</g>
);
const lying = (f: number, expr: any, open = 0, sweat = false, pose: any = {}) => <Bean x={720} y={GY - 150} s={HS} look={HERO2D} expr={expr} open={open} f={f} lying shadow={false} sweat={sweat} pose={pose} />;

export const P5 = makePart(V, [
  { at: "", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 300, 1.8), C(960, GY - 300, 2.0))} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="smirk" pose={{ armL: [30, -60], armR: [30, -60] }} /></Bay> },
  { at: "first", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 480, 0.95), C(960, 460, 1.0))} f={f}>
    <Hero x={960} y={GY - 300} f={f} expr="neutral" shadow={false} pose={floatPose(f)} /></Town> },
  // машина без тормозов
  { at: "car", s: (g, f, len) => <Town cam={C(960, 560, 1.0)} f={f}>
    <g transform={`translate(${ip(g, [0, len], [200, 1400], (t) => t * t)} ${GY + 50}) rotate(10)`}>
      <Car x={0} y={0} c="#ff4a6a" />
      <Driver f={f} />
      {[0, 1, 2].map((i) => <circle key={i} cx={-160 - i * 30} cy={-10 + Math.sin(f + i) * 6} r={8} fill={YEL} stroke={INK} strokeWidth={3} />)}
    </g>
    <SpeedLines f={f} o={0.3} />
  </Town> },
  { at: "see", s: (g, f, len) => <Town cam={C(960, 560, 1.0)} f={f}>
    <rect x={-2000} y={-1000} width={6000} height={3000} fill="#06163a" opacity={0.75} />
    {[[300, 300], [800, 260], [1300, 320]].map(([x, h], i) => <rect key={i} x={x} y={GY - 40 - h * 1.6} width={400} height={h * 1.6} fill="none" stroke="#5ae0ff" strokeWidth={8} opacity={0.7} />)}
    <g transform={`translate(${ip(g, [0, len], [1300, 1500])} ${GY + 40}) rotate(10)`} opacity={0.9}><Car x={0} y={0} c="#5ae0ff" lights={false} /></g>
    <Hero x={150} y={GY + 30} f={f} expr="shock" open={0.3} />
    {[-26, 26].map((k) => <g key={k}><Glow x={150 + k} y={GY - 236} r={60} g="gC" /><path d={`M ${150 + k} ${GY - 236} L 1500 ${GY - 60 + k}`} stroke="#5ae0ff" strokeWidth={8} opacity={0.5} /></g>)}
  </Town> },
  { at: "reach", s: (g, f, len) => <Town cam={C(960, 560, 1.1)} f={f}>
    <FlyHero cx={ip(g, [0, len], [0, 1300])} cy={GY - 150} f={f} s={0.5} expr="grin" />
    <SpeedLines f={f} o={0.6} />
  </Town> },
  { at: "stop", s: (g, f, len) => <Town cam={{ ...camLerp(g, len, C(1100, GY - 200, 1.5), C(1100, GY - 200, 1.6)), ...shake(f, g < 8 ? 10 : 0) }} f={f}>
    <g transform={`translate(1350 ${GY + 50}) rotate(${g < 6 ? 6 : 0})`}><Car x={0} y={0} c="#ff4a6a" flip /><g transform="scale(-1 1)"><Driver f={f} /></g></g>
    <Hero x={1050} y={GY + 30} f={f} expr="grin" pose={{ armR: [92, 0], armL: [15, 8], lean: 8 }} />
    <Puff x={1200} y={GY + 10} p={g / 16} s={0.6} />
  </Town> },
  { at: "crowd", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 600, 1.1), C(960, 600, 1.2))} f={f}>
    {[[400, 0], [620, 3], [1300, 5], [1520, 6], [1720, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 40 - Math.abs(Math.sin(f * 0.3 + i)) * 30} s={HS} look={LOOKS[l]} f={f} expr="laugh" open={0.5} pose={{ armL: [165, 10], armR: [165, 10] }} />)}
    <Hero x={960} y={GY + 30} f={f} expr="grin" pose={{ armR: [150, 20] }} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(i * 173) % 1920} y={((f * 6 + i * 97) % 900) - 100} width={18} height={10} fill={["#ff4a6a", YEL, "#5ae0ff", "#ff6fb5"][i % 4]} transform={`rotate(${f * 6 + i * 30} ${(i * 173) % 1920} ${((f * 6 + i * 97) % 900) - 100})`} />)}
  </Town> },
  // шторм
  { at: "That", s: (g, f, len) => <>
    <Bay cam={C(960, 560, 1.0)} f={f} promenade={false} boats={false}>
      <g transform={`translate(1000 ${GY - 100}) rotate(${ip(g, [10, len], [0, 150])})`}><Boat x={0} y={0} f={f} c="#ff6a5a" s={1.1} /></g>
      <BigWaves y={GY - 60} f={f} />
    </Bay><NightOver f={f} rain flash o={0.5} /></> },
  { at: "hear", n: 1, s: (g, f, len) => <><Room cam={C(700, GY - 250, 1.8)} f={f}>{lying(f, "shock", 0.5, true, { armR: [150, 70] })}
    <Thought x={1000} y={GY - 520} s={0.6} icon="bolt" p={ip(g, [0, 8], [0, 1])} /><Thought x={500} y={GY - 560} s={0.5} icon="heart" p={ip(g, [8, 16], [0, 1])} />
    <SoundRings x={560} y={GY - 260} f={f} c="#5ae0ff" n={3} /></Room><NightOver f={f} o={0.4} /></> },
  { at: "fly", s: (g, f, len) => <><Sky cam={C(980, 560, 1.7)} f={f} alt={0.1} sp={14}>
      <FlyHero cx={960} cy={500} f={f} s={0.5} expr="neutral" arms="both" />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${900 + i * 70} 640)`}><Bean x={0} y={0} s={0.3} look={LOOKS[[2, 4, 1][i]]} f={f} expr="shock" open={0.4} shadow={false} pose={{ armL: [150, 0], armR: [150, 0] }} /></g>)}
    </Sky><NightOver f={f} rain flash o={0.5} /></> },
  { at: "hero", s: (g, f, len) => <><Bay cam={C(960, GY - 250, 1.5)} f={f}>
      {[[700, 2], [820, 4], [1150, 1]].map(([x, l], i) => <Bean key={i} x={x} y={GY - 40} s={HS} look={LOOKS[l]} f={f} expr="laugh" open={0.4} pose={{ armL: [150, 20], armR: [150, 20] }} flip={x > 960} />)}
      <Hero x={960} y={GY - 40} f={f} expr="grin" sweat />
    </Bay><NightOver f={f} rain o={0.35} /></> },
  // математика
  { at: "math", s: (g, f, len) => <Frame bg="#2a1a60"><rect width={1920} height={1080} fill="url(#wall)" /><Clock x={960} y={540} r={330} f={f} sp={4} /></Frame> },
  { at: "Somewhere", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={960} y={560} r={380} f={f * 2} /></Frame> },
  { at: "fire", s: (g, f, len) => <Town cam={C(960, 560, 1.1)} f={f} houses={false}>
    <rect x={700} y={360} width={520} height={500} fill="#ff8fb0" stroke={INK} strokeWidth={9} />
    <path d="M 660 370 L 960 140 L 1260 370 Z" fill="#3a3a8a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <Flames x={800} y={480} f={f} s={1.1} /><Flames x={1100} y={420} f={f + 9} s={1.3} /><Flames x={960} y={860} f={f + 4} s={1.4} />
  </Town> },
  { at: "crash", s: (g, f, len) => <Town cam={C(960, 640, 1.3)} f={f}>
    <Car x={820} y={GY + 50} c="#5a7cf0" rot={-8} /><Car x={1110} y={GY + 50} c="#ffd23c" rot={10} flip />
    <Smoke2 x={960} y={GY - 60} f={f} />
  </Town> },
  { at: "flood", s: (g, f, len) => <Town cam={C(960, 560, 1.0)} f={f}>
    <rect x={-2000} y={GY - 240 + Math.sin(f * 0.1) * 8} width={6000} height={800} fill="#3a6ad8" stroke={INK} strokeWidth={7} opacity={0.9} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${200 + i * 380} ${GY - 230} q 40 -16 80 0 q 40 16 80 0`} stroke="#bff4ff" strokeWidth={6} fill="none" />)}
    <g transform={`translate(${700 + Math.sin(f * 0.05) * 60} ${GY - 240})`}><Car x={0} y={20} c="#ff6a5a" rot={8} lights={false} /></g>
  </Town> },
  { at: "every", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={960} y={560} r={380} f={f * 2} /><Alarms x={960} y={560} r={380} f={f} /></Frame> },
  { at: "Even", s: (g, f, len) => <Sky cam={C(960, 540, 1.2)} f={f} alt={0.1} sp={40}>
    <FlyHero cx={960} cy={540} f={f} s={0.5} expr="neutral" />
    <circle cx={1060} cy={540} r={80 + (g % 20) * 20} fill="none" stroke="#fff" strokeWidth={10} opacity={1 - (g % 20) / 20} />
    <svg width={1920} height={1080}><SpeedLines f={f} o={0.6} /></svg>
  </Sky> },
  { at: "other", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={760} y={560} r={360} f={f} /><Alarms x={760} y={560} r={360} f={f} />
    {(() => { const a = -2.6 + g * 0.012; return <g transform={`translate(${760 + Math.cos(a) * 420} ${560 + Math.sin(a) * 420}) rotate(${a * 57 + 90})`}><FlyHero cx={0} cy={0} f={f} s={0.22} /></g>; })()}
    <Clock x={1550} y={540} r={200} f={f} sp={14} />
  </Frame> },
  { at: "everywhere", s: (g, f, len) => <Town cam={C(960, GY - 250, 2.0)} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="sad" sweat pose={{ armL: [30, 80], armR: [30, 80], tilt: Math.sin(f * 0.2) * 8 }} />
    {[[700, GY - 450], [1220, GY - 420], [760, GY - 200], [1200, GY - 160]].map(([x, y], i) => <SoundRings key={i} x={x} y={y} f={f + i * 10} c="#ff3a4a" n={2} />)}
  </Town> },
  { at: "save", s: (g, f, len) => <Bay cam={C(960, GY - 280, 1.6)} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armL: [70, 40], armR: [70, 40] }} />
    <g transform={`translate(960 ${GY - 210}) rotate(-80)`}><Bean x={0} y={0} s={0.35} look={LOOKS[5]} f={f} expr="grin" shadow={false} /></g>
  </Bay> },
  { at: "and", n: 3, s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={960} y={560} r={330} f={f} /><Alarms x={960} y={560} r={330} f={f} />
    {Array.from({ length: 10 }, (_, i) => { const a = i * 0.63; return <Thought key={i} x={960 + Math.cos(a) * 560} y={560 + Math.sin(a) * 420} s={0.45} icon={i % 2 ? "heart" : "bolt"} p={ip(g, [i * 2, i * 2 + 6], [0, 1])} />; })}
  </Frame> },
  { at: "Your", n: 2, s: (g, f, len) => <><Room cam={C(700, GY - 250, 1.8)} f={f}>{lying(f, "sad", 0.2, true, { armR: [150, 75], armL: [150, 75] })}
    {[0, 1, 2].map((i) => <SoundRings key={i} x={500 + i * 300} y={GY - 450} f={f + i * 13} c="#ff6fb5" n={2} />)}</Room><NightOver f={f} o={0.45} /></> },
  { at: "sleeping", s: (g, f, len) => <><Room cam={C(800, GY - 260, 2.4)} f={f}>{lying(f, "neutral", 0)}
    <g transform={`translate(900 ${GY - 250}) scale(0.35)`}><Clock x={0} y={0} r={140} f={f} sp={10} /></g></Room><NightOver f={f} o={0.45} /></> },
  { at: "eating", s: (g, f, len) => <><Room cam={C(1170, GY - 300, 2.2)} f={f} kind="kitchen" win={false}>
    <Bowl x={1170} y={GY - 250} full={1} />
    <Hero x={1000} y={GY} f={f} expr="sad" pose={{ armL: [15, 8], armR: [15, 8], tilt: 18, lean: 6 }} /></Room><NightOver f={f} o={0.3} /></> },
  { at: "friends", s: (g, f, len) => <><Room cam={C(1170, GY - 290, 3.2)} f={f} kind="kitchen" win={false}>
    <g transform={`translate(1170 ${GY - 266})`}><Phone rot={90} on={false} /></g></Room><NightOver f={f} o={0.3} /></> },
  { at: "truck", s: (g, f, len) => <Bay cam={C(960, GY - 380, 1.2)} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armL: [175, 0], armR: [175, 0] }} />
    <Truck x={960} y={GY - 370} s={0.9} />
  </Bay> },
  { at: "but", n: 2, s: (g, f, len) => <><Bay cam={camLerp(g, len, C(960, GY - 250, 1.8), C(960, 520, 1.0))} f={f}>
    <Hero x={960} y={GY - 46} f={f} expr="sad" pose={{ legL: 70, legR: 76, armL: [20, 40], armR: [20, 40], tilt: 15 }} /></Bay><NightOver f={f} o={0.5} /></> },
], { id: 5 });
