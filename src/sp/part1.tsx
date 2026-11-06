// Часть 1/8: утро, когда проснулся со всеми суперсилами.
import React from "react";
import { Aura, Bay, Bean, CEIL, Cam, Clock, Dog, Frame, GY, Glow, HERO2D, HS, INK, LOOKS, Room, Shards, SoundRings, SpeedLines, Thought, Toothbrush, Town, Under, Voice, YEL, atWord, camLerp, floatPose, ip, makePart, shake, walkPose, Boat } from "./kit";
import { VOICE } from "./voices/p1";
import { Easing } from "remotion";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const lying = (f: number, expr: any = "neutral", open = 0, lift = 0) => (
  <g transform={`translate(0 ${-lift})`}><Bean x={720} y={GY - 150} s={HS} look={HERO2D} expr={expr} open={open} f={f} lying shadow={false} /></g>
);
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const HY = CEIL + 392; // ступни парящего героя: макушка у потолка
const HEAD = HY - 268, CHEST = HY - 160;
const SOCKS = { ...HERO2D, shoe: "#f0f2f6" };

export const P1 = makePart(V, [
  // крючок: герой парит над бухтой в сиянии
  { at: "", s: (g, f, len) => (
    <Bay cam={camLerp(g, len, C(960, 470, 1.35), C(960, 520, 1.0))} f={f}>
      <Aura x={960} y={GY - 520} f={f} r={330} />
      <Hero x={960} y={GY - 260} f={f} look={SOCKS} expr="grin" pose={{ ...floatPose(f), armL: [150, 20], armR: [150, 20] }} />
      {[[400, 0], [1500, 3], [1750, 5]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 60} s={HS * 0.9} look={LOOKS[l]} f={f + i * 9} expr="shock" open={0.6} pose={{ armR: [130, 20], tilt: -10 }} />)}
    </Bay>) },
  { at: "Not", s: (g, f, len) => (
    <Bay cam={camLerp(g, len, C(960, 300, 2.4), C(960, 330, 2.7))} f={f} boats={false}>
      <Aura x={960} y={GY - 520} f={f} r={260} />
      <Hero x={960} y={GY - 260} f={f} look={SOCKS} expr="laugh" open={0.6} pose={{ ...floatPose(f), armL: [60, 60], armR: [60, 60] }} />
      <Glow x={870} y={GY - 430} r={90} g="gC" /><Glow x={1050} y={GY - 430} r={90} g="gY" />
    </Bay>) },
  // спальня, рассвет
  { at: "Picture", s: (g, f, len) => <Room cam={camLerp(g, len, C(960, 540, 1.0), C(800, 600, 1.15))} f={f}><Clock x={900} y={GY - 180} f={f} />{lying(f)}</Room> },
  { at: "alarm", s: (g, f, len) => <Room cam={camLerp(g, len, C(900, GY - 280, 2.6), C(900, GY - 270, 2.9))} f={f}><Clock x={900} y={GY - 180} f={f} ring />{lying(f, "shock", 0.3)}</Room> },
  { at: "reach", s: (g, f, len) => {
    const boom = Math.max(0, g - (atWord(V, "explodes") - atWord(V, "reach") + 3));
    return <Room cam={{ ...camLerp(g, len, C(820, GY - 280, 1.9), C(860, GY - 280, 2.1)), ...shake(f, boom > 0 && boom < 12 ? (12 - boom) * 2 : 0) }} f={f}>
      {boom > 0 ? <Shards x={900} y={GY - 240} p={boom} /> : <Clock x={900} y={GY - 180} f={f} ring />}
      <Bean x={720} y={GY - 150} s={HS} look={HERO2D} expr={boom > 0 ? "shock" : "talk"} open={boom > 0 ? 0.9 : 0.2} f={f} lying shadow={false} pose={{ armR: [ip(g, [0, 20], [10, 175]), 0] }} />
    </Room>;
  } },
  { at: "Super", n: 1, s: (g, f, len) => <Room cam={camLerp(g, len, C(600, GY - 330, 2.2), C(600, GY - 320, 2.4))} f={f}>
    <Hero x={600} y={GY - 110} f={f} expr="shock" open={0.7} pose={{ armR: [120, 60], armL: [20, 10], legL: 70, legR: 76 }} />
    <Glow x={700} y={GY - 410} r={120} g="gY" o={0.6 + 0.3 * Math.sin(f * 0.5)} /></Room> },
  { at: "Okay", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, GY - 380, 2.9), C(600, GY - 380, 3.1))} f={f}>
    <Hero x={600} y={GY - 110} f={f} expr={g > 18 ? "smirk" : "neutral"} pose={{ armR: [40, 40], armL: [20, 10], legL: 70, legR: 76, tilt: g > 18 ? -12 : 0 }} /></Room> },
  { at: "sit", s: (g, f, len) => <Room cam={camLerp(g, len, C(650, GY - 380, 1.6), C(650, GY - 440, 1.6))} f={f}>
    <Hero x={600} y={GY - 110 - ip(g, [6, len], [0, 120])} f={f} expr="shock" open={0.5} pose={{ armR: [40, 40], armL: [40, 40], legL: 70, legR: 76 }} /></Room> },
  { at: "rising", s: (g, f, len) => <Room cam={camLerp(g, len, C(900, 560, 1.0), C(800, 470, 1.1))} f={f}>
    <Aura x={600} y={GY - 450 - ip(g, [0, len], [0, 260])} f={f} r={200} o={0.6} />
    <Hero x={600} y={GY - 230 - ip(g, [0, len], [0, 260])} f={f} look={SOCKS} expr="shock" open={0.6} pose={floatPose(f)} /></Room> },
  { at: "head", s: (g, f, len) => {
    const bump = ip(g, [6, 10], [0, 1], Easing.linear) - ip(g, [10, 18], [0, 1]);
    return <Room cam={{ ...camLerp(g, len, C(600, HEAD + 40, 2.0), C(600, HEAD + 60, 2.2)), ...shake(f, g > 8 && g < 16 ? 6 : 0) }} f={f}>
      <Hero x={600} y={HY + 10 - bump * 14} f={f} look={SOCKS} expr={g > 8 ? "shock" : "neutral"} open={0.6} sweat={g > 20} pose={{ ...floatPose(f), armL: [160, 10], armR: [160, 10] }} />
      {g > 9 ? [0, 1, 2].map((i) => { const a = f * 0.15 + i * 2.1; return <path key={i} transform={`translate(${600 + Math.cos(a) * 110} ${CEIL + 80 + Math.sin(a) * 30})`} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill={YEL} stroke={INK} strokeWidth={4} />; }) : null}
    </Room>;
  } },
  { at: "Then", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, HEAD + 80, 2.4), C(600, HEAD + 120, 2.0))} f={f}>
    <SoundRings x={600} y={HEAD} f={f} c="#5ae0ff" />
    <Hero x={600} y={HY} f={f} look={SOCKS} expr="shock" open={0.9} sweat pose={{ ...floatPose(f), armL: [150, 75], armR: [150, 75], tilt: Math.sin(f * 0.6) * 5 }} /></Room> },
  // сосед чистит зубы
  { at: "neighbor", s: (g, f, len) => <Town cam={camLerp(g, len, C(1300, 560, 1.5), C(1330, 560, 1.65))} f={f} houses={false}>
    <rect x={820} y={60} width={980} height={900} fill="#ff8fb0" stroke={INK} strokeWidth={10} />
    <path d="M 780 70 L 1310 -220 L 1840 70 Z" fill="#a8306a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <clipPath id="nwin"><rect x={1080} y={300} width={460} height={420} /></clipPath>
    <rect x={1080} y={300} width={460} height={420} fill="#ffe9a0" />
    <g clipPath="url(#nwin)">
      <rect x={1080} y={620} width={460} height={100} fill="#5ad8c8" stroke={INK} strokeWidth={6} />
      <Bean x={1310} y={900} s={0.8} look={LOOKS[0]} f={f} expr="talk" open={0.4} pose={{ armR: [130, 100] }} />
      <g transform={`translate(${1190 + Math.sin(f * 1.4) * 14} 596) rotate(90)`}><Toothbrush /></g>
      {[0, 1, 2].map((i) => <circle key={i} cx={1300 + Math.sin(f * 0.3 + i) * 12} cy={606 + i * 8} r={10} fill="#ffffff" stroke={INK} strokeWidth={4} />)}
    </g>
    <Glow x={1310} y={510} r={320} g="gY" o={0.4} />
    <rect x={1080} y={300} width={460} height={420} fill="none" stroke={INK} strokeWidth={10} />
    <rect x={1060} y={716} width={500} height={30} fill="#fff0f8" stroke={INK} strokeWidth={6} />
    <SoundRings x={1360} y={520} f={f} c="#ffffff" n={3} />
  </Town> },
  { at: "dog", s: (g, f, len) => <Town cam={camLerp(g, len, C(900, 640, 1.15), C(960, 650, 1.25))} f={f}>
    <Dog x={900} y={GY + 20} f={f} bark s={1.1} />
    <SoundRings x={1150} y={GY - 160} f={f} c="#ffd23c" n={3} />
  </Town> },
  { at: "boat", s: (g, f, len) => <Bay cam={camLerp(g, len, C(1600, 650, 1.6), C(1700, 650, 1.7))} f={f} boats={false} promenade={false}>
    <Boat x={1700 - g * 3} y={820} f={f} puffs s={1.1} c="#ff6a5a" />
    <SoundRings x={1600} y={720} f={f} c="#ffffff" n={3} />
  </Bay> },
  // мысли
  { at: "underneath", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, HEAD + 140, 1.6), C(600, HEAD + 140, 1.8))} f={f}>
    <Hero x={600} y={HY} f={f} look={SOCKS} expr="shock" open={0.4} pose={{ ...floatPose(f), armL: [150, 60], armR: [40, 30] }} />
    {[[300, HEAD + 20, 0], [900, HEAD - 10, 14], [880, HEAD + 300, 28]].map(([x, y, d], i) => <g key={i} opacity={0.85}><Thought x={x} y={y} s={0.6} icon={(["bolt", "heart", "clock"] as const)[i]} p={ip(g, [d, d + 8], [0, 1])} /></g>)}
  </Room> },
  { at: "late", s: (g, f, len) => <Town cam={camLerp(g, len, C(900, 600, 1.3), C(1300, 600, 1.3))} f={f}>
    <Bean x={600 + g * 14} y={GY + 30} s={0.75} look={LOOKS[3]} f={f} expr="shock" open={0.5} sweat pose={{ ...walkPose(f, 0.6), lean: -10 }} />
    <Thought x={760 + g * 14} y={360} s={0.9} icon="clock" p={ip(g, [0, 8], [0, 1])} />
  </Town> },
  { at: "Did", s: (g, f, len) => <Town cam={camLerp(g, len, C(1000, 600, 1.4), C(1000, 600, 1.55))} f={f}>
    <Bean x={1000} y={GY + 30} s={0.75} look={LOOKS[4]} f={f} expr="shock" open={0.3} pose={{ armR: [70, 40], tilt: Math.sin(f * 0.1) * 10 }} flip />
    <Thought x={1200} y={340} s={0.9} icon="lock" p={ip(g, [0, 8], [0, 1])} />
  </Town> },
  // рентген
  { at: "look", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, HEAD + 160, 1.8), C(600, HEAD + 200, 1.9))} f={f}>
    <Hero x={600} y={HY} f={f} look={SOCKS} expr="neutral" pose={{ ...floatPose(f), tilt: 18 }} /></Room> },
  { at: "floor", s: (g, f, len) => <Room cam={camLerp(g, len, C(800, 700, 1.0), C(800, 820, 1.05))} f={f} xray={ip(g, [4, 22], [0, 1])}>
    <Hero x={600} y={HY} f={f} look={SOCKS} expr="shock" open={0.6} pose={{ ...floatPose(f), tilt: 18 }} />
    <Glow x={575} y={HEAD + 6} r={70} g="gC" /><Glow x={635} y={HEAD + 6} r={70} g="gC" />
  </Room> },
  { at: "Pipes", s: (g, f, len) => <Frame bg="#06163a"><g transform={`translate(960 540) scale(${ip(g, [0, len], [2.0, 2.2])}) translate(-200 ${-GY - 180})`}><Under f={f} /></g></Frame> },
  { at: "Wires", s: (g, f, len) => <Frame bg="#06163a"><g transform={`translate(960 540) scale(${ip(g, [0, len], [2.2, 2.4])}) translate(${-900 - g * 6} ${-GY - 290})`}><Under f={f} /></g></Frame> },
  { at: "family", s: (g, f, len) => <Frame bg="#06163a"><g transform={`translate(960 540) scale(${ip(g, [0, len], [2.4, 2.7])}) translate(-1620 ${-GY - 500})`}><Under f={f} /></g></Frame> },
  { at: "X-ray", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, HEAD + 40, 2.8), C(600, HEAD + 40, 3.1))} f={f}>
    <Hero x={600} y={HY} f={f} look={SOCKS} expr="grin" pose={{ ...floatPose(f), tilt: 0 }} />
    {[-26, 26].map((k) => <g key={k}><Glow x={600 + k} y={HEAD + 6} r={90} g="gC" /><path d={`M ${600 + k} ${HEAD + 6} L ${600 + k * 4} ${HEAD + 500}`} stroke="#5ae0ff" strokeWidth={10} opacity={0.5} /></g>)}
  </Room> },
  // сердце / скорость
  { at: "heart", s: (g, f, len) => {
    const beat = Math.pow(Math.max(0, Math.sin(f * 1.1)), 6);
    return <Room cam={{ ...camLerp(g, len, C(600, CHEST - 40, 2.2), C(600, CHEST - 40, 2.5)), ...shake(f, beat * 3) }} f={f}>
      <Hero x={600} y={HY} f={f} look={SOCKS} expr="shock" open={0.3} pose={{ ...floatPose(f), armL: [30, 80] }} />
      <g transform={`translate(${625} ${CHEST}) scale(${0.9 + beat * 0.35})`}><Glow x={0} y={0} r={140} g="gR" /><path d="M 0 40 L -44 -4 Q -60 -40 -26 -50 Q 0 -54 0 -24 Q 0 -54 26 -50 Q 60 -40 44 -4 Z" fill="#ff4a6a" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g>
    </Room>;
  } },
  { at: "realize", s: (g, f, len) => <Room cam={camLerp(g, len, C(600, HEAD + 30, 2.8), C(600, HEAD + 30, 3.1))} f={f}>
    <Hero x={600} y={HY} f={f} look={SOCKS} expr={g > 25 ? "grin" : "neutral"} pose={{ ...floatPose(f), tilt: g > 25 ? 10 : 0 }} /></Room> },
  { at: "speed", s: (g, f, len) => {
    const x = 600 + ((g * 120) % 2400) - 600;
    return <Room cam={camLerp(g, len, C(900, 560, 1.0), C(900, 560, 1.05))} f={f}>
      {[0, 1, 2, 3, 4].map((k) => <g key={k} opacity={0.15 + k * 0.17}><Hero x={x - (4 - k) * 70} y={GY - 200} f={f} look={SOCKS} expr="laugh" open={0.6} shadow={false} pose={{ ...floatPose(f), lean: -25, armL: [100, 0], armR: [100, 0] }} /></g>)}
      <g><SpeedLines f={f} o={0.5} /></g>
    </Room>;
  } },
  { at: "drift", s: (g, f, len) => <Room cam={camLerp(g, len, C(1000, 560, 1.15), C(1400, 520, 1.3))} f={f}>
    <Hero x={ip(g, [0, len], [900, 1440])} y={GY - 180} f={f} look={SOCKS} expr="neutral" pose={{ ...floatPose(f), lean: -8 }} /></Room> },
  { at: "sun", n: 1, s: (g, f, len) => <Bay cam={camLerp(g, len, C(1250, 520, 1.4), C(1250, 460, 1.2))} f={f} sun={[1250, 470 - g * 0.6]} promenade={false} /> },
  { at: "little", s: (g, f, len) => <Town cam={camLerp(g, len, C(500, 560, 0.9), C(1500, 540, 0.9))} f={f} sun={[1450, 380]} /> },
  { at: "nobody", n: 2, s: (g, f, len) => <Room cam={camLerp(g, len, C(1540, CEIL + 330, 2.4), C(1100, 560, 1.0), (t) => 1 - Math.pow(1 - t, 3))} f={f}>
    <Hero x={1440} y={GY - 40} f={f} look={SOCKS} expr="smirk" pose={{ ...floatPose(f), armL: [20, 10], armR: [20, 10], legL: 2, legR: 2, bob: 0 }} />
    <Glow x={1540} y={CEIL + 400} r={300} g="gY" o={0.5} /></Room> },
], { id: 1 });
