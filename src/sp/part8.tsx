// Часть 8/8: другой путь — учить мир, а не спасать в одиночку. Финал.
import React from "react";
import { Bay, Bean, BeanLook, CEIL, Cam, Flames, FlyHero, Frame, GY, Glow, HERO2D, HS, INK, LOOKS, Planet, Room, Sky, Thought, Town, Voice, YEL, camLerp, floatPose, ip, makePart, walkPose } from "./kit";
import { VOICE } from "./voices/p8";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const HY = CEIL + 392;
const FIRE: BeanLook = { head: "#f2e2c8", body: "#e04a3a", body2: YEL, limb: "#262838", shoe: "#1a1a22", hat: "bowler", hatC: "#ff3a3a", hatC2: YEL };
const BUILD: BeanLook = { head: "#f8f6f0", body: "#ff9a3a", body2: YEL, limb: "#262838", shoe: "#3a2a22", hat: "bowler", hatC: YEL, hatC2: "#ff9a3a" };
const Stars: React.FC = () => <>{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}</>;
const Cross: React.FC<{ s?: number }> = ({ s = 1 }) => <path transform={`scale(${s})`} d="M -14 -40 L 14 -40 L 14 -14 L 40 -14 L 40 14 L 14 14 L 14 40 L -14 40 L -14 14 L -40 14 L -40 -14 L -14 -14 Z" fill="#ff3a4a" stroke={INK} strokeWidth={5} />;
const Cup: React.FC<{ f: number }> = ({ f }) => (
  <g><path d="M -30 -60 L 30 -60 L 24 0 L -24 0 Z" fill="#fff4f0" stroke={INK} strokeWidth={6} strokeLinejoin="round" /><path d="M 28 -46 q 26 4 20 22 q -6 14 -24 10" stroke={INK} strokeWidth={6} fill="none" /><rect x={-30} y={-46} width={60} height={14} fill="#ff6fb5" />
    {[0, 1].map((i) => <path key={i} d={`M ${-10 + i * 20} -70 q ${8 * Math.sin(f * 0.2 + i)} -15 0 -30 q ${-8 * Math.sin(f * 0.2 + i)} -15 0 -30`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />)}</g>
);
const Beam: React.FC<{ w?: number }> = ({ w = 520 }) => <g><rect x={-w / 2} y={-30} width={w} height={60} fill="#8a86a8" stroke={INK} strokeWidth={7} />{Array.from({ length: Math.floor(w / 80) }, (_, i) => <circle key={i} cx={-w / 2 + 40 + i * 80} cy={0} r={12} fill="#5a5680" stroke={INK} strokeWidth={4} />)}</g>;
const Hospital: React.FC<{ h: number }> = ({ h }) => (
  <g><rect x={700} y={GY - 40 - h} width={520} height={h} fill="#f4f2ff" stroke={INK} strokeWidth={8} />
    {Array.from({ length: Math.floor(h / 110) }, (_, r) => [0, 1, 2, 3].map((c) => <rect key={r + "-" + c} x={740 + c * 120} y={GY - 40 - h + 30 + r * 110} width={70} height={60} fill="#9fdcff" stroke={INK} strokeWidth={5} />))}
    {h > 500 ? <g transform={`translate(960 ${GY - 40 - h - 60})`}><rect x={-70} y={-70} width={140} height={140} rx={20} fill="#fff" stroke={INK} strokeWidth={6} /><Cross s={1.2} /></g> : null}</g>
);
const Mountains: React.FC = () => <g>{[[300, 500, "#6a3aa8"], [900, 380, "#7a4ab8"], [1500, 460, "#6a3aa8"]].map(([x, h, c], i) => <g key={i}><path d={`M ${(x as number) - 500} 1100 L ${x} ${1100 - (h as number) * 1.4} L ${(x as number) + 500} 1100 Z`} fill={c as string} stroke={INK} strokeWidth={8} /><path d={`M ${(x as number) - 110} ${1100 - (h as number) * 1.4 + 150} L ${x} ${1100 - (h as number) * 1.4} L ${(x as number) + 110} ${1100 - (h as number) * 1.4 + 150} L ${(x as number) + 40} ${1100 - (h as number) * 1.4 + 110} L 0 0 Z`.replace(" L 0 0 Z", " Z")} fill="#fff4f0" stroke={INK} strokeWidth={6} /></g>)}</g>;
const Icon: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  const c = ["#5ae0ff", YEL, "#ff6fb5", "#b48aff", "#ff9a3a", "#5ac84a"][k];
  return <g><circle r={70} fill={c} stroke={INK} strokeWidth={7} /><Glow x={0} y={0} r={120} g="gW" o={0.3} />
    {k === 0 ? <path d="M -40 10 Q -10 -40 40 -30 Q 10 -10 30 20 Q 0 10 -40 10 Z" fill="#fff" stroke={INK} strokeWidth={5} /> : k === 1 ? <path d="M 10 -44 L -22 4 L 0 4 L -10 44 L 24 -8 L 2 -8 Z" fill="#fff" stroke={INK} strokeWidth={5} /> : k === 2 ? <g><ellipse rx={44} ry={26} fill="#fff" stroke={INK} strokeWidth={5} /><circle r={14} fill={INK} /></g> : k === 3 ? <path d="M -40 10 Q -50 -30 -10 -34 Q 20 -50 40 -20 Q 56 10 20 20 Q -10 34 -40 10 Z" fill="#fff" stroke={INK} strokeWidth={5} /> : k === 4 ? <g><rect x={-46} y={-10} width={92} height={20} fill="#fff" stroke={INK} strokeWidth={5} /><rect x={-56} y={-28} width={20} height={56} fill="#fff" stroke={INK} strokeWidth={5} /><rect x={36} y={-28} width={20} height={56} fill="#fff" stroke={INK} strokeWidth={5} /></g> : <path d="M 0 -44 L 36 -28 L 30 18 L 0 44 L -30 18 L -36 -28 Z" fill="#fff" stroke={INK} strokeWidth={5} />}</g>;
};

export const P8 = makePart(V, [
  { at: "", s: (g, f, len) => <Frame bg="#05030c"><Stars /><Glow x={960} y={300} r={ip(g, [0, len], [50, 600])} g="gY" /><g transform="translate(960 760)"><Bean x={0} y={0} s={0.55} look={HERO2D} f={f} expr={g > 30 ? "neutral" : "sad"} shadow={false} pose={{ ...floatPose(f), tilt: -10 }} /></g></Frame> },
  { at: "Go", s: (g, f, len) => <Frame bg="#2a1a60"><rect width={1920} height={1080} fill="#4a3098" />
    <g transform="translate(960 540) scale(2)"><circle r={200} fill="#fff6e0" stroke={INK} strokeWidth={8} /><path d={`M 0 0 L ${Math.sin(-g * 0.5) * 140} ${-Math.cos(-g * 0.5) * 140}`} stroke="#ff4a6a" strokeWidth={10} strokeLinecap="round" /><path d={`M 0 0 L ${Math.sin(-g * 0.05) * 90} ${-Math.cos(-g * 0.05) * 90}`} stroke={INK} strokeWidth={14} strokeLinecap="round" /></g>
    {Array.from({ length: 14 }, (_, i) => { const t = ((g * 4 + i * 30) % 160); return <path key={i} d={`M ${1920 - t * 14} ${80 + i * 70} l -220 0`} stroke="#fff" strokeWidth={8} opacity={0.5} />; })}
  </Frame> },
  { at: "floating", s: (g, f, len) => <Room cam={camLerp(g, len, C(800, 560, 1.0), C(700, 470, 1.15))} f={f}><Hero x={600} y={HY} f={f} expr="shock" open={0.5} pose={floatPose(f)} /></Room> },
  { at: "broken", s: (g, f, len) => <Room cam={C(900, GY - 200, 2.4)} f={f}>{[[-150, 0, 20], [-90, 1, -30], [-20, 2, 10], [60, 3, 45], [130, 0, -15], [200, 2, 25]].map(([dx, c, r], i) => <rect key={i} x={900 + dx - 14} y={GY - 14} width={28 + (i % 3) * 8} height={14} fill={["#ff4a6a", "#fff6e0", YEL, "#c8b8e8"][c]} stroke={INK} strokeWidth={4} transform={`rotate(${r} ${900 + dx} ${GY - 7})`} />)}
    <g transform={`translate(1000 ${GY - 12})`}><circle r={14} fill="none" stroke={INK} strokeWidth={5} /><path d="M -14 0 L 14 0 M 0 -14 L 0 14" stroke={INK} strokeWidth={4} /></g><g transform={`translate(830 ${GY - 196})`}><circle r={12} fill="none" stroke={INK} strokeWidth={5} /></g></Room> },
  { at: "racing", s: (g, f, len) => { const beat = Math.pow(Math.max(0, Math.sin(f * 1.1)), 6);
    return <Room cam={C(600, HY - 200, 2.4)} f={f}><Hero x={600} y={HY} f={f} expr="shock" open={0.3} pose={floatPose(f)} />
      <g transform={`translate(625 ${HY - 160}) scale(${0.9 + beat * 0.35})`}><Glow x={0} y={0} r={140} g="gR" /><path d="M 0 40 L -44 -4 Q -60 -40 -26 -50 Q 0 -54 0 -24 Q 0 -54 26 -50 Q 60 -40 44 -4 Z" fill="#ff4a6a" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g></Room>; } },
  { at: "What", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={960} y={395} r={250} f={f} /><g transform="translate(960 1000)"><Bean x={0} y={0} s={0.75} look={HERO2D} f={f} expr="sad" sweat shadow={false} pose={{ armL: [170, 0], armR: [170, 0], tilt: Math.sin(f * 0.3) * 4 }} /></g></Frame> },
  { at: "teach", s: (g, f, len) => <Room cam={C(960, GY - 300, 1.3)} f={f} win={false} kind="plain">
    <rect x={560} y={CEIL + 160} width={800} height={380} fill="#2a5a4a" stroke={INK} strokeWidth={10} />
    <g transform={`translate(760 ${CEIL + 380}) scale(0.4)`}><Bean x={0} y={0} look={{ head: "#2a5a4a", body: "#2a5a4a", body2: "#fff", limb: "#fff", shoe: "#fff" }} f={0} expr="neutral" shadow={false} pose={{ armR: [120, 0] }} /></g>
    <path d={`M 880 ${CEIL + 300} L 1000 ${CEIL + 300} M 980 ${CEIL + 280} L 1000 ${CEIL + 300} L 980 ${CEIL + 320}`} stroke="#fff" strokeWidth={8} fill="none" />
    <g transform={`translate(1160 ${CEIL + 330})`}><circle r={60} fill="none" stroke="#fff" strokeWidth={8} /><path d="M -60 0 L 60 0" stroke="#fff" strokeWidth={6} /></g>
    <Hero x={480} y={GY} f={f} expr="talk" open={0.3 + 0.3 * Math.abs(Math.sin(f * 0.4))} pose={{ armR: [130, 0] }} />
    {[[800, 2], [1050, 4], [1300, 6], [1550, 3]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 60} s={HS * 0.9} look={LOOKS[l]} f={f} expr="grin" flip pose={{ armR: [i === 1 ? 160 : 20, 10] }} />)}
  </Room> },
  { at: "but", s: (g, f, len) => <Town cam={C(1000, 560, 1.05)} f={f} houses={false}>
    <rect x={1100} y={300} width={560} height={560} fill="#ff8fb0" stroke={INK} strokeWidth={9} opacity={0.35} />
    <rect x={1100} y={300} width={560} height={560} fill="none" stroke="#5ae0ff" strokeWidth={8} />
    <Flames x={1380} y={860} f={f} s={1.1} />
    <Hero x={400} y={GY + 30} f={f} expr="neutral" pose={{ armR: [100, 0] }} />
    {[-26, 26].map((k) => <Glow key={k} x={400 + k} y={GY - 236} r={60} g="gC" />)}
    {[[650, 0], [830, 1]].map(([x, k]) => <Bean key={x} x={x} y={GY + 40} s={HS} look={FIRE} f={f} expr="grin" pose={{ armR: [80, 10] }} />)}
    <path d={`M 900 ${GY - 160} Q 1100 ${GY - 400} 1300 ${GY - 120}`} stroke="#9fdcff" strokeWidth={22} fill="none" strokeDasharray="40 20" strokeDashoffset={-f * 6} opacity={ip(g, [10, 20], [0, 1])} />
  </Town> },
  { at: "lift", s: (g, f, len) => <Town cam={C(960, GY - 320, 1.4)} f={f}><Hero x={960} y={GY + 30} f={f} expr="grin" pose={{ armL: [175, 0], armR: [175, 0] }} /><g transform={`translate(960 ${GY - 300})`}><Beam /></g></Town> },
  { at: "so", n: 1, s: (g, f, len) => <Town cam={C(960, 520, 0.95)} f={f} houses={false}>
    <Hospital h={ip(g, [0, len], [120, 640], (t) => t)} />
    {[[450, 0], [1450, 1], [1650, 2]].map(([x, k], i) => <Bean key={x} x={x} y={GY + 40} s={HS} look={BUILD} f={f + i * 9} expr="grin" pose={{ armR: [90 + Math.sin(f * 0.5 + i) * 30, 30] }} />)}
    <Hero x={250} y={GY + 30} f={f} expr="grin" pose={{ armR: [150, 20] }} />
  </Town> },
  { at: "carry", s: (g, f, len) => <Sky cam={C(960, 540, 1.0)} f={f} alt={0.3} sp={8} sea={false}><Mountains />
    <FlyHero cx={ip(g, [0, len], [300, 1600])} cy={420} f={f} s={0.5} arms="both" />
    <g transform={`translate(${ip(g, [0, len], [300, 1600]) + 20} 500)`}><rect x={-60} y={-40} width={120} height={80} fill="#fff4f0" stroke={INK} strokeWidth={6} /><Cross s={0.6} /></g>
  </Sky> },
  { at: "switch", s: (g, f, len) => <Town cam={C(960, GY - 260, 1.6)} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="smirk" pose={{ armR: [150, 60] }} />
    {[-26, 26].map((k) => <Glow key={k} x={960 + k} y={GY - 236} r={70} g="gV" o={ip(g, [4, 14], [1, 0])} />)}
    {[[620, "heart"], [1300, "clock"]].map(([x, ic], i) => <g key={i} opacity={ip(g, [4, 14], [1, 0])}><Thought x={x as number} y={GY - 520} s={0.6} icon={ic as any} /></g>)}
  </Town> },
  { at: "people", n: 1, s: (g, f, len) => <Town cam={C(960, 560, 1.1)} f={f}>
    {[[450, 0], [800, 3], [1150, 5], [1500, 6]].map(([x, l], i) => <g key={i}><Bean x={x} y={GY + 40} s={HS} look={LOOKS[l]} f={f} expr="grin" pose={walkPose(f, 0.2, i)} /><Thought x={x + 90} y={GY - 430} s={0.5} icon="lock" p={ip(g, [i * 4, i * 4 + 8], [0, 1])} /></g>)}
  </Town> },
  { at: "And", n: 2, s: (g, f, len) => <Bay cam={C(960, GY - 300, 2.0)} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armR: [165, 0] }} />
    <path transform={`translate(1090 ${GY - 520}) scale(${1 + 0.1 * Math.sin(f * 0.3)})`} d="M 0 -50 L 14 -16 L 50 -14 L 22 8 L 32 44 L 0 24 L -32 44 L -22 8 L -50 -14 L -14 -16 Z" fill={YEL} stroke={INK} strokeWidth={5} />
    <Glow x={1090} y={GY - 520} r={160} g="gY" />
  </Bay> },
  { at: "Never", s: (g, f, len) => <Town cam={C(960, GY - 250, 1.7)} f={f}>
    <Hero x={800} y={GY + 30} f={f} expr="grin" pose={{ armR: [80, 10] }} />
    <Bean x={1100} y={GY + 30} s={HS * 0.8} look={LOOKS[4]} f={f} expr="grin" flip pose={{ armR: [80, 10] }} />
    <g transform={`translate(${ip(g, [0, 20], [920, 1000])} ${GY - 170})`}><rect x={-50} y={-40} width={100} height={70} rx={8} fill="#ff4a6a" stroke={INK} strokeWidth={6} /><path d="M -24 -40 Q 0 -70 24 -40" stroke={INK} strokeWidth={6} fill="none" /></g>
  </Town> },
  { at: "Because", n: 2, s: (g, f, len) => <Bay cam={C(960, GY - 300, 1.4)} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="sad" sweat pose={{ armL: [170, 0], armR: [170, 0], tilt: Math.sin(f * 0.3) * 6 }} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${880 + i * 40} ${GY - 330 - (i % 2) * 30}) rotate(${-80 + i * 10})`}><Bean x={0} y={0} s={0.3} look={LOOKS[i]} f={f} expr="grin" shadow={false} /></g>)}
  </Bay> },
  { at: "It", n: 2, s: (g, f, len) => <Town cam={C(960, GY - 280, 1.3)} f={f}>
    {[[650, 0], [800, 3], [950, 5], [1100, 6], [1250, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 30} s={HS} look={LOOKS[l]} f={f} expr="grin" pose={{ armL: [175, 0], armR: [175, 0] }} />)}
    <g transform={`translate(950 ${GY - 340 - ip(g, [0, 20], [0, 20])})`}><Beam w={800} /></g>
    <Hero x={1550} y={GY + 30} f={f} expr="grin" flip pose={{ armR: [150, 20] }} />
  </Town> },
  // финал: дома
  { at: "land", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, 520, 1.0), C(960, GY - 300, 1.5))} f={f} sun={[1250, 560]}>
    <Hero x={960} y={GY - 40 - ip(g, [0, 24], [500, 0])} f={f} expr="grin" pose={g < 24 ? floatPose(f) : { armL: [40, 20], armR: [40, 20] }} /></Bay> },
  { at: "town", s: (g, f, len) => <Bay cam={C(960, 560, 1.0)} f={f} sun={[1250, 560]}>
    {[[300, 0], [500, 3], [1400, 5], [1600, 6], [1780, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 60} s={HS} look={LOOKS[l]} f={f} expr="grin" flip={x > 960} pose={{ armR: [150 + Math.sin(f * 0.4 + i) * 20, 20] }} />)}
    <Hero x={960} y={GY - 40} f={f} expr="grin" /></Bay> },
  { at: "nobody", s: (g, f, len) => <Bay cam={C(960, GY - 250, 1.8)} f={f} sun={[1250, 560]}>
    <Bean x={760} y={GY - 40} s={HS * 0.7} look={LOOKS[4]} f={f} expr="laugh" open={0.4} pose={{ armR: [100, -40], armL: [60, 20] }} />
    <Hero x={960} y={GY - 40} f={f} expr="laugh" open={0.3} pose={{ armL: [90, -40], armR: [90, -40] }} />
    <Bean x={1160} y={GY - 40} s={HS * 0.65} look={LOOKS[6]} f={f} expr="laugh" open={0.4} flip pose={{ armR: [100, -40], armL: [60, 20] }} />
  </Bay> },
  { at: "Someone", s: (g, f, len) => <Bay cam={C(960, GY - 260, 1.8)} f={f} sun={[1250, 560]}>
    <Hero x={800} y={GY - 40} f={f} expr="grin" pose={{ armR: [80, 20] }} />
    <Bean x={1120} y={GY - 40} s={HS} look={LOOKS[0]} f={f} expr="grin" flip pose={{ armR: [ip(g, [0, 12], [40, 82]), 10] }} holdR={{ node: <Cup f={f} />, k: 1.4 }} />
  </Bay> },
  { at: "and", n: 4, s: (g, f, len) => <Bay cam={C(1040, GY - 330, 3.0)} f={f} sun={[1250, 560]}>
    <Hero x={900} y={GY - 40} f={f} expr="grin" pose={{ armR: [100, 30] }} holdR={{ node: <Cup f={f} />, k: 1.4 }} />
    {g > 10 ? <path transform={`translate(1130 ${GY - 420})`} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={YEL} stroke={INK} strokeWidth={4} /> : null}
  </Bay> },
  { at: "Now", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 280, 2.2), C(960, GY - 280, 2.6))} f={f} sun={[1250, 560]}>
    <Hero x={960} y={GY - 40} f={f} expr="grin" pose={{ armR: [70, 20], armL: [15, 8] }} /></Bay> },
  { at: "If", s: (g, f, len) => <Bay cam={C(960, 560, 1.0)} f={f} sun={[1250, 560]}>
    <Hero x={960} y={GY - 40} f={f} expr="grin" pose={{ armL: [150, 20], armR: [150, 20] }} />
    {[0, 1, 2, 3, 4, 5].map((k) => { const a = k / 6 * Math.PI * 2 - Math.PI / 2 + g * 0.01; return <g key={k} transform={`translate(${960 + Math.cos(a) * 420} ${GY - 250 + Math.sin(a) * 300}) scale(${ip(g, [k * 4, k * 4 + 8], [0, 1])})`}><Icon k={k} f={f} /></g>; })}
  </Bay> },
  { at: "Tell", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 300, 1.8), C(960, 540, 1.0))} f={f} sun={[1250, 600]}>
    <Hero x={960} y={GY - 40} f={f} expr="grin" pose={{ armR: [160 + Math.sin(f * 0.4) * 15, 10], armL: [15, 8] }} /></Bay> },
], { id: 8, last: true });
