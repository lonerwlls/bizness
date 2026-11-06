// Часть 3/8: учимся летать над морем — ветер, холод, звуковой удар, правила.
import React from "react";
import { Bay, Bean, Cam, Dog, Egg, FlyHero, Frost, GY, Glow, HERO2D, HS, INK, Jet, LOOKS, Lighthouse, Phone, Puff, Shards, Shield, Sky, SoundRings, SpeedLines, Thermo, Thought, Town, Voice, YEL, atWord, camLerp, floatPose, ip, makePart, shake } from "./kit";
import { VOICE } from "./voices/p3";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const Over: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{children}</svg>;
// крупный план лица героя в полёте (голова справа)
const Face: React.FC<{ g: number; f: number; expr?: any; open?: number; sweat?: boolean; z?: number; alt?: number; sp?: number; children?: React.ReactNode }> = ({ g, f, expr = "shock", open = 0.5, sweat, z = 2.6, alt = 0.1, sp = 10, children }) => (
  <Sky cam={C(1040, 600, z + g * 0.003)} f={f} alt={alt} sp={sp}><FlyHero cx={900} cy={600} f={f} expr={expr} open={open} sweat={sweat} />{children}</Sky>
);

export const P3 = makePart(V, [
  { at: "", s: (g, f, len) => <Bay cam={camLerp(g, len, C(1000, 520, 1.0), C(1100, 520, 1.1))} f={f} promenade={false}>
    <Lighthouse x={1450} y={1100} f={f} s={1.6} />
    <FlyHero cx={ip(g, [0, len], [200, 1900])} cy={420} f={f} s={0.5} />
  </Bay> },
  { at: "over", s: (g, f, len) => <Sky cam={camLerp(g, len, C(960, 540, 1.0), C(1000, 540, 1.05))} f={f} alt={0.05} sp={8}>
    <FlyHero cx={ip(g, [0, len], [700, 1100])} cy={560} f={f} s={0.4} />
  </Sky> },
  { at: "flying", n: 1, s: (g, f, len) => <Face g={g} f={f} expr="grin" open={0} z={2.0} sp={8} /> },
  { at: "At", n: 1, s: (g, f, len) => <Sky cam={camLerp(g, len, C(1000, 540, 1.4), C(1000, 540, 1.5))} f={f} alt={0.08} sp={22}>
    <FlyHero cx={1000} cy={560} f={f} s={0.55} expr="laugh" open={0.5} /><Over><SpeedLines f={f} o={0.6} /></Over>
  </Sky> },
  { at: "wind", s: (g, f, len) => <Face g={g} f={f} expr="shock" open={0.9} sweat z={2.4} sp={26}>
    {Array.from({ length: 7 }, (_, i) => { const x = 1800 - ((g * 40 + i * 140) % 900); return <path key={i} d={`M ${x} ${420 + i * 40} q -60 -30 -120 0 q -60 30 -120 0`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />; })}
  </Face> },
  { at: "eyes", n: 1, s: (g, f, len) => <Face g={g} f={f} expr="sad" open={0.3} z={3.2} sp={26}>
    {Array.from({ length: 6 }, (_, i) => { const t = ((g * 3 + i * 9) % 50) / 50; return <ellipse key={i} cx={1080 - t * 300} cy={612 + Math.sin(i) * 10 + t * 40} rx={10} ry={6} fill="#9fdcff" stroke={INK} strokeWidth={3} />; })}
  </Face> },
  { at: "cheeks", s: (g, f, len) => <Sky cam={C(1040, 600, 3.2)} f={f} alt={0.1} sp={26}>
    <g transform={`translate(1040 637) scale(${1 + Math.sin(f * 1.6) * 0.05} ${1 - Math.sin(f * 1.6) * 0.05}) translate(-1040 -637)`}><FlyHero cx={900} cy={600} f={f} expr="talk" open={0.4 + 0.4 * Math.sin(f * 1.6)} /></g>
  </Sky> },
  { at: "bugs", s: (g, f, len) => <Face g={g} f={f} expr="shock" open={0.6} z={3.0} sp={26}>
    {[[1090, 620, 6], [1060, 670, 14], [1110, 650, 24], [1080, 590, 34]].map(([x, y, d], i) => g > d ? <g key={i}><circle cx={x} cy={y} r={9} fill="#5ac84a" stroke={INK} strokeWidth={3} />{[0, 1, 2, 3].map((k) => <path key={k} d={`M ${x} ${y} l ${Math.cos(k * 1.6) * 16} ${Math.sin(k * 1.6) * 16}`} stroke="#5ac84a" strokeWidth={4} />)}</g> : <circle key={i} cx={x + (d - g) * 30} cy={y} r={7} fill={INK} />)}
  </Face> },
  // выше и холоднее
  { at: "higher", s: (g, f, len) => <Sky cam={camLerp(g, len, C(960, 640, 1.0), C(960, 440, 1.0))} f={f} alt={ip(g, [0, len], [0.1, 0.45])} sp={6}>
    <FlyHero cx={960} cy={ip(g, [0, len], [700, 400])} f={f} s={0.5} arms="both" />
  </Sky> },
  { at: "thousand", s: (g, f, len) => <Sky cam={C(960, 540, 1.0)} f={f} alt={ip(g, [0, len], [0.45, 0.75])} sp={4}>
    <FlyHero cx={760} cy={560} f={f} s={0.5} arms="both" expr="shock" open={0.3} />
    <Thermo x={1400} y={760} v={ip(g, [0, len], [0.9, 0.25])} s={1.2} />
    <Over><Frost o={ip(g, [10, len], [0, 0.5])} /></Over>
  </Sky> },
  { at: "At", n: 2, s: (g, f, len) => <Sky cam={camLerp(g, len, C(900, 540, 0.9), C(1000, 540, 1.0))} f={f} alt={0.85} sp={8} sea={false}>
    <Jet x={1200 - g * 2} y={420} s={1.1} />
    <FlyHero cx={700} cy={760} f={f} s={0.5} expr="shock" open={0.4} sweat />
    <Over><Frost o={0.6} /></Over>
  </Sky> },
  { at: "barely", s: (g, f, len) => <Face g={g} f={f} expr="sad" open={0.8} sweat z={3.0} alt={0.85} sp={8}>
    <Over><Frost o={0.8} /><rect width={1920} height={1080} fill="#07030f" opacity={ip(g, [0, len], [0, 0.4])} /></Over>
  </Face> },
  { at: "normal", s: (g, f, len) => <Sky cam={C(960, 540, 1.2)} f={f} alt={0.85} sp={4} sea={false}>
    <g transform={`translate(960 ${400 + g * g * 0.4}) rotate(${g * 4})`}><Bean x={0} y={300} s={0.55} look={LOOKS[2]} f={f} expr="sad" open={0.2} shadow={false} pose={{ armL: [150, 20], armR: [150, 20], legL: 20, legR: -20 }} /></g>
    {[0, 1, 2].map((i) => <path key={i} transform={`translate(${960 + Math.cos(f * 0.3 + i * 2) * 80} ${300 + g * g * 0.4 + Math.sin(f * 0.3 + i * 2) * 30})`} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill={YEL} stroke={INK} strokeWidth={4} />)}
    <Over><Frost o={0.5} /></Over>
  </Sky> },
  { at: "don", s: (g, f, len) => <Face g={g} f={f} expr="smirk" open={0} z={2.8} alt={0.85} sp={6}><Over><Frost o={0.4} /></Over></Face> },
  { at: "Because", s: (g, f, len) => <Sky cam={camLerp(g, len, C(960, 540, 1.3), C(960, 540, 1.5))} f={f} alt={0.85} sp={6} sea={false}>
    <Shield x={960} y={560} r={ip(g, [0, 12], [0, 260])} f={f} />
    <FlyHero cx={960} cy={560} f={f} s={0.5} expr="grin" />
    {Array.from({ length: 10 }, (_, i) => { const a = i * 0.63, t = ((g * 2 + i * 13) % 60) / 60; return <rect key={i} x={960 + Math.cos(a) * (600 - t * 300)} y={560 + Math.sin(a) * (450 - t * 225)} width={22} height={22} fill="#bff4ff" stroke={INK} strokeWidth={3} transform={`rotate(45 ${960 + Math.cos(a) * (600 - t * 300)} ${560 + Math.sin(a) * (450 - t * 225)})`} opacity={t < 0.9 ? 1 : 0} />; })}
  </Sky> },
  // звуковой удар
  { at: "Now", s: (g, f, len) => <Sky cam={camLerp(g, len, C(960, 540, 1.3), C(960, 540, 1.4))} f={f} alt={0.1} sp={6}>
    <FlyHero cx={900} cy={560} f={f} s={0.5} expr="smirk" arms="both" />
  </Sky> },
  { at: "faster", s: (g, f, len) => {
    const b = since("boom", "faster", g);
    return <Sky cam={{ ...C(960, 540, 1.1), ...shake(f, b > 0 && b < 12 ? 12 : 0) }} f={f} alt={0.1} sp={40}>
      {b > -8 ? <path d={`M 1150 560 L 700 380 L 700 740 Z`} fill="#ffffff" opacity={0.35} /> : null}
      <FlyHero cx={960} cy={560} f={f} s={0.5} expr="laugh" open={0.4} />
      {b > 0 ? <><circle cx={1050} cy={560} r={b * 70} fill="none" stroke="#ffffff" strokeWidth={30 - Math.min(26, b)} opacity={Math.max(0, 1 - b / 20)} /><Glow x={1050} y={560} r={500} g="gW" o={Math.max(0, 1 - b / 14)} /></> : null}
      <Over><SpeedLines f={f} o={0.7} /></Over>
    </Sky>;
  } },
  { at: "crack", s: (g, f, len) => <Town cam={{ ...camLerp(g, len, C(1300, 500, 1.6), C(1300, 520, 1.7)), ...shake(f, g < 10 ? 6 : 0) }} f={f}>
    <Shards x={1300} y={480} p={g * 0.8} />
    <SoundRings x={1300} y={480} f={f * 2} c="#ffffff" n={3} />
  </Town> },
  // правила
  { at: "So", n: 2, s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 300, 2.0), C(960, GY - 300, 2.2))} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armR: [160, 10], armL: [15, 8] }} />
    <Thought x={1200} y={GY - 520} s={0.7} icon="bolt" p={ip(g, [0, 8], [0, 1])} />
  </Bay> },
  { at: "Stay", s: (g, f, len) => <Sky cam={C(960, 600, 0.9)} f={f} alt={0.02} sp={6}>
    <FlyHero cx={ip(g, [0, len], [600, 1300])} cy={640} f={f} s={0.35} />
  </Sky> },
  { at: "Slow", s: (g, f, len) => <Bay cam={camLerp(g, len, C(900, 560, 1.0), C(1000, 560, 1.05))} f={f}>
    {[[300, 0], [1500, 5], [1750, 6]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 60} s={HS * 0.95} look={LOOKS[l]} f={f + i * 7} expr="grin" pose={{ armR: [150 + Math.sin(f * 0.4 + i) * 20, 20] }} />)}
    <FlyHero cx={ip(g, [0, len], [600, 1100])} cy={480} f={f} s={0.45} expr="grin" arms="back" />
  </Bay> },
  { at: "Never", s: (g, f, len) => <Town cam={camLerp(g, len, C(1000, GY - 220, 1.7), C(1000, GY - 220, 1.9))} f={f}>
    <Dog x={1180} y={GY + 30} f={f} s={0.7} flip />
    <Hero x={880} y={GY + 30} f={f} expr="grin" pose={{ armR: [70, 30], armL: [15, 8], lean: 8 }} />
    {g > 10 ? <path d={`M 1080 ${GY - 230} q -10 -20 0 -30 q 10 -10 20 0 q 10 -10 20 0 q 10 10 0 30 l -20 20 Z`} fill="#ff4a6a" stroke={INK} strokeWidth={4} transform={`translate(0 ${-g})`} /> : null}
  </Town> },
  { at: "sunset", s: (g, f, len) => <Bay cam={camLerp(g, len, C(1250, 500, 1.2), C(1200, 520, 1.0))} f={f} sun={[1250, 520]} promenade={false}>
    <Hero x={960} y={560} f={f} expr="grin" shadow={false} pose={floatPose(f)} />
  </Bay> },
  { at: "land", n: 1, s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 250, 1.8), C(960, GY - 250, 1.9))} f={f}>
    <Hero x={960} y={GY - 40 - ip(g, [0, 14], [200, 0])} f={f} expr="smirk" pose={g < 14 ? floatPose(f) : { armL: [40, 20], armR: [40, 20] }} />
    <Puff x={960} y={GY - 50} p={(g - 14) / 14} s={0.4} />
  </Bay> },
  { at: "pick", s: (g, f, len) => <Bay cam={camLerp(g, len, C(1080, GY - 300, 3.0), C(1080, GY - 300, 3.3))} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="grin" pose={{ armR: [120, 30], armL: [15, 8] }} holdR={{ node: <Egg />, rot: -120, k: 1.4 }} />
    {g > 15 ? <path transform={`translate(1150 ${GY - 400})`} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={YEL} stroke={INK} strokeWidth={4} /> : null}
  </Bay> },
  { at: "fly", n: 2, s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, 520, 1.0), C(1100, 520, 1.05))} f={f} sun={[1250, 560]} promenade={false}>
    <FlyHero cx={ip(g, [0, len], [1700, 500])} cy={440} f={f} s={0.45} left expr="laugh" open={0.4} arms="both" />
  </Bay> },
  { at: "Then", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 560, 1.1), C(960, 600, 1.25))} f={f}>
    <Hero x={960} y={GY + 30 - ip(g, [0, 16], [300, 0])} f={f} expr="grin" pose={g < 16 ? floatPose(f) : { armL: [15, 8], armR: [15, 8] }} />
  </Town> },
  { at: "see", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, GY - 250, 2.6), C(960, GY - 250, 2.9))} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="shock" open={0.9} sweat pose={{ armL: [30, 30], armR: [30, 30] }} />
  </Town> },
  { at: "Someone", s: (g, f, len) => <Town cam={camLerp(g, len, C(1400, GY - 300, 2.2), C(1460, GY - 330, 2.9))} f={f}>
    <Bean x={1400} y={GY + 30} s={HS} look={LOOKS[4]} f={f} expr="grin" pose={{ armR: [110, 40], armL: [15, 8] }} flip holdR={{ node: <g><Phone /><circle cx={0} cy={-80} r={0} /></g>, k: 1.3, rot: 0 }} />
  </Town> },
], { id: 3 });
