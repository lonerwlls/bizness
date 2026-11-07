// Часть 7/8: бессмертие — все уходят, а ты остаёшься.
import React from "react";
import { Bay, Bean, BeanLook, Cam, DOC, Dog, FlyHero, Frame, GY, Glow, HERO2D, HS, Hourglass, INK, Jet, LOOKS, Lighthouse, MOM, NightOver, Planet, Sky, Sun, Town, Voice, YEL, camLerp, floatPose, ip, makePart, walkPose } from "./kit";
import { VOICE } from "./voices/p7";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const old = (l: BeanLook): BeanLook => ({ ...l, hair: l.hair ? "#e0e0ea" : l.hair, hatC: l.hatC, body: l.body });
const OLDPOSE = { lean: 12, tilt: 8, armR: [30, 20] as [number, number] };
const Stars: React.FC<{ n?: number }> = ({ n = 60 }) => <>{Array.from({ length: n }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}</>;
const Cane: React.FC = () => <path d="M 0 -20 L 0 160 M 0 -20 q 0 -20 -20 -20" stroke="#8a4a2a" strokeWidth={10} fill="none" strokeLinecap="round" />;
const Cake: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-100} width={220} height={100} rx={14} fill="#ff9ac0" stroke={INK} strokeWidth={7} />
    <path d="M -110 -70 q 27 30 55 0 q 27 30 55 0 q 27 30 55 0 q 27 30 55 0" stroke="#fff" strokeWidth={12} fill="none" />
    {[-50, 0, 50].map((k, i) => <g key={k}><rect x={k - 7} y={-150} width={14} height={50} fill="#5ae0ff" stroke={INK} strokeWidth={4} /><path d={`M ${k} -152 q -10 -16 0 -30 q 10 14 0 30`} fill={YEL} stroke={INK} strokeWidth={3} transform={`rotate(${Math.sin(f * 0.4 + i) * 8} ${k} -152)`} /><Glow x={k} y={-165} r={40} g="gY" /></g>)}
  </g>
);
// город растёт: k=0 — домики, k=1 — стеклянные башни
const FutureCity: React.FC<{ k: number; f: number; pods?: boolean }> = ({ k, f, pods }) => (
  <g>
    {Array.from({ length: 12 }, (_, i) => {
      const x = -300 + i * 210, w = 170, h = 200 + k * (300 + ((i * 137) % 400));
      return <g key={i}>
        <rect x={x} y={GY - 40 - h} width={w} height={h} fill={k > 0.5 ? (i % 2 ? "#5ae0ff" : "#7ab8ff") : ["#ff8fb0", "#5ad8c8", "#ffd23c", "#b48aff"][i % 4]} fillOpacity={k > 0.5 ? 0.75 : 1} stroke={INK} strokeWidth={7} />
        {Array.from({ length: Math.floor(h / 70) }, (_, r) => <rect key={r} x={x + 20} y={GY - 40 - h + 20 + r * 70} width={w - 40} height={26} fill={(i + r) % 3 ? "#e8fbff" : YEL} opacity={0.7} />)}
      </g>;
    })}
    {pods ? Array.from({ length: 5 }, (_, i) => { const x = ((f * (4 + i) + i * 500) % 2600) - 400, y = 180 + i * 90; return <g key={i} transform={`translate(${x} ${y})`}><ellipse cx={0} cy={0} rx={70} ry={26} fill="#f4f2ff" stroke={INK} strokeWidth={6} /><path d="M -40 -10 Q 0 -50 40 -10 Z" fill="#9fdcff" stroke={INK} strokeWidth={5} /><Glow x={0} y={20} r={50} g="gC" /></g>; }) : null}
  </g>
);
const GlassTower: React.FC<{ x: number; h: number }> = ({ x, h }) => (
  <g><path d={`M ${x - 70} ${GY - 40} L ${x - 50} ${GY - 40 - h} L ${x + 50} ${GY - 40 - h} L ${x + 70} ${GY - 40} Z`} fill="#5ae0ff" fillOpacity={0.8} stroke={INK} strokeWidth={8} />
    {Array.from({ length: Math.floor(h / 60) }, (_, r) => <path key={r} d={`M ${x - 60} ${GY - 70 - r * 60} L ${x + 60} ${GY - 70 - r * 60}`} stroke="#e8fbff" strokeWidth={6} />)}
    <Glow x={x} y={GY - 40 - h} r={160} g="gC" /></g>
);

export const P7 = makePart(V, [
  { at: "", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Hourglass x={960} y={480} s={1.3} f={f} /><Bean x={1300} y={900} s={0.6} look={HERO2D} f={f} expr="neutral" /></Frame> },
  { at: "At", n: 1, s: (g, f, len) => <Bay cam={camLerp(g, len, C(800, 560, 1.0), C(1000, 560, 1.05))} f={f}><Hero x={ip(g, [0, len], [600, 1000])} y={GY - 40} f={f} expr="grin" pose={walkPose(f, 0.25)} /></Bay> },
  { at: "Then", s: (g, f, len) => <Town cam={C(960, GY - 260, 1.7)} f={f}>
    <Hero x={860} y={GY + 30} f={f} expr="grin" pose={{ armR: [60, 30] }} />
    <rect x={1010} y={GY - 110} width={200} height={140} fill="#c87a4a" stroke={INK} strokeWidth={7} />
    <Cake x={1110} y={GY - 110} f={f} />
    {[[560, 2], [1380, 5]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 30} s={HS} look={LOOKS[l]} f={f} expr="laugh" open={0.4} flip={x > 960} pose={{ armL: [160, 10], armR: [160, 10] }} />)}
  </Town> },
  { at: "fifty", s: (g, f, len) => <Town cam={C(960, GY - 250, 1.6)} f={f}>
    {[[620, 2], [1300, 5]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 30} s={HS * 0.95} look={old(LOOKS[l])} f={f} expr="smirk" flip={x > 960} pose={OLDPOSE} holdR={{ node: <Cane />, k: 1.2 }} />)}
    <Hero x={960} y={GY + 30} f={f} expr="grin" />
  </Town> },
  { at: "and", n: 3, s: (g, f, len) => <Sky cam={C(960, 540, 1.0)} f={f} alt={0.6} sp={10}>
    <Jet x={900 - g * 3} y={480} s={0.8} /><FlyHero cx={ip(g, [0, len], [300, 1700])} cy={700} f={f} s={0.45} expr="laugh" open={0.4} />
  </Sky> },
  { at: "body", s: (g, f, len) => <Town cam={C(960, GY - 260, 2.3)} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="smirk" pose={{ armR: [90, 0] }} />
    {Array.from({ length: 6 }, (_, i) => { const a = f * 0.2 + i; return <path key={i} transform={`translate(${1060 + Math.cos(a) * 60} ${GY - 200 + Math.sin(a) * 40}) scale(0.7)`} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={YEL} stroke={INK} strokeWidth={4} />; })}
    <Glow x={1060} y={GY - 200} r={140} g="gY" />
  </Town> },
  { at: "And", n: 4, s: (g, f, len) => <Bay cam={C(960, 560, 1.0)} f={f}>
    {[[400, 6], [620, 2], [1300, 5], [1520, 0]].map(([x, l], i) => <g key={i} opacity={ip(g, [8 + i * 6, 16 + i * 6], [1, 0.15])}><Bean x={x} y={GY + 40} s={HS} look={old(LOOKS[l])} f={f} expr="smirk" flip={x > 960} pose={OLDPOSE} /></g>)}
    <Hero x={960} y={GY + 30} f={f} expr="neutral" />
  </Bay> },
  { at: "mom", s: (g, f, len) => <Town cam={C(960, GY - 260, 2.0)} f={f}><g opacity={ip(g, [len * 0.55, len], [1, 0])}><Bean x={960} y={GY + 30} s={HS} look={old(MOM)} f={f} expr="grin" pose={OLDPOSE} holdR={{ node: <Cane />, k: 1.2 }} /></g></Town> },
  { at: "best", s: (g, f, len) => <Town cam={C(960, GY - 260, 2.0)} f={f}><g opacity={ip(g, [len * 0.55, len], [1, 0])}><Bean x={960} y={GY + 30} s={HS} look={old(LOOKS[2])} f={f} expr="smirk" pose={OLDPOSE} holdR={{ node: <Cane />, k: 1.2 }} /></g></Town> },
  { at: "neighbor", s: (g, f, len) => <Town cam={C(1000, GY - 220, 1.7)} f={f}><g opacity={ip(g, [len * 0.55, len], [1, 0])}>
    <Bean x={860} y={GY + 30} s={HS} look={old(LOOKS[0])} f={f} expr="smirk" pose={OLDPOSE} holdR={{ node: <Cane />, k: 1.2 }} />
    <Dog x={1150} y={GY + 30} f={f} s={0.6} c="#d8c0a0" /></g></Town> },
  { at: "One", s: (g, f, len) => <Bay cam={C(960, GY - 250, 1.3)} f={f}>
    {[[560, 6], [740, 2], [1180, 0], [1360, 5]].map(([x, l], i) => <g key={i} opacity={ip(g, [i * 12, i * 12 + 10], [1, 0])}><Bean x={x} y={GY - 40} s={HS} look={old(LOOKS[l])} f={f} expr="smirk" flip={x > 960} pose={OLDPOSE} /></g>)}
    <Hero x={960} y={GY - 40} f={f} expr="sad" />
  </Bay> },
  { at: "keep", n: 1, s: (g, f, len) => <><Bay cam={camLerp(g, len, C(960, 560, 1.0), C(960, 560, 0.9))} f={f}><Hero x={ip(g, [0, len], [700, 1000])} y={GY - 40} f={f} expr="sad" pose={walkPose(f, 0.15)} /></Bay><NightOver f={f} o={0.25} /></> },
  // века
  { at: "hundred", n: 1, s: (g, f, len) => {
    const c = (g * 0.5) % 1;
    return <Frame bg="#2a1a60"><rect width={1920} height={1080} fill={c < 0.5 ? "#4a3098" : "#1a0f4a"} />
      <Sun x={960 + Math.cos(g * 0.4) * 700} y={600 - Math.sin(g * 0.4) * 400} r={90} />
      {Array.from({ length: 10 }, (_, i) => { const t = ((g * 3 + i * 20) % 100); return <g key={i} transform={`translate(${150 + i * 180 + t} ${t * 9 - 100}) rotate(${t * 4})`}><rect x={-50} y={-60} width={100} height={120} fill="#fff4f0" stroke={INK} strokeWidth={5} /><rect x={-50} y={-60} width={100} height={26} fill="#ff4a6a" stroke={INK} strokeWidth={5} /></g>; })}
    </Frame>;
  } },
  { at: "harbor", s: (g, f, len) => <Town cam={C(960, 480, 0.9)} f={f} houses={false}><FutureCity k={ip(g, [0, len], [0, 1])} f={f} /></Town> },
  { at: "lighthouse", s: (g, f, len) => <Bay cam={C(1300, 560, 1.0)} f={f} promenade={false}>
    <g opacity={ip(g, [0, 25], [1, 0])}><Lighthouse x={1300} y={GY + 100} f={f} s={1.4} /></g>
    <GlassTower x={1300} h={ip(g, [10, len], [0, 820])} />
  </Bay> },
  { at: "Two", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 500, 0.85), C(960, 480, 0.9))} f={f} houses={false}><FutureCity k={1} f={f} pods /></Town> },
  { at: "Nobody", s: (g, f, len) => <Town cam={C(960, 560, 1.15)} f={f} houses={false}><FutureCity k={1} f={f} pods />
    {[[400, 1], [700, 4], [1300, 3], [1550, 6]].map(([x, l], i) => <Bean key={i} x={x + (i % 2 ? -g * 2 : g * 2)} y={GY + 40} s={HS} look={{ ...LOOKS[l], body: ["#5ae0ff", "#e8fbff", "#b48aff", "#7ab8ff"][i] }} f={f} pose={walkPose(f, 0.25, i)} flip={i % 2 === 1} />)}
    <Hero x={960} y={GY + 40} f={f} expr="sad" />
  </Town> },
  { at: "legend", s: (g, f, len) => <Town cam={C(960, GY - 300, 1.4)} f={f} houses={false}><FutureCity k={1} f={f} />
    <rect x={840} y={GY - 120} width={240} height={160} fill="#b8b4d0" stroke={INK} strokeWidth={8} />
    <Bean x={960} y={GY - 120} s={HS} look={{ head: "#c8c4e0", body: "#a8a4c8", body2: "#8884a8", limb: "#8884a8", shoe: "#c8c4e0", hat: "beanie", hatC: "#a8a4c8", hatC2: "#c8c4e0", pack: "#b8b4d0" }} f={0} noEyes shadow={false} pose={{ armR: [150, 0] }} />
    {[[640, 4], [1280, 6]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 40} s={HS * 0.8} look={LOOKS[l]} f={f} expr="laugh" open={0.5} flip={x > 960} pose={{ armR: [80, 20], armL: [20, 60] }} />)}
  </Town> },
  { at: "keep", n: 2, s: (g, f, len) => <Town cam={C(960, 520, 1.0)} f={f} houses={false}><FutureCity k={1} f={f} />
    <FlyHero cx={ip(g, [0, len], [300, 900])} cy={ip(g, [0, len], [300, 560])} f={f} s={0.5} arms="both" />
    <g transform={`translate(1100 ${ip(g, [0, len], [200, 560])})`}><ellipse cx={0} cy={0} rx={90} ry={32} fill="#f4f2ff" stroke={INK} strokeWidth={7} /><path d="M -50 -12 Q 0 -60 50 -12 Z" fill="#9fdcff" stroke={INK} strokeWidth={6} /></g>
  </Town> },
  { at: "great", n: 1, s: (g, f, len) => <Town cam={C(960, GY - 260, 1.8)} f={f} houses={false}><FutureCity k={1} f={f} />
    <Hero x={860} y={GY + 30} f={f} expr="smirk" pose={{ armR: [60, 40] }} />
    <Bean x={1080} y={GY + 30} s={HS * 0.6} look={{ ...LOOKS[4], body: "#5ae0ff" }} f={f} expr="laugh" open={0.4} flip pose={{ armL: [150, 20], armR: [150, 20] }} />
  </Town> },
  { at: "Here", s: (g, f, len) => <><Bay cam={C(960, GY - 250, 2.0)} f={f}><Hero x={960} y={GY - 46} f={f} expr="neutral" pose={{ legL: 70, legR: 76, armL: [20, 40], armR: [20, 40] }} /></Bay><NightOver f={f} o={0.3} /></> },
  { at: "Without", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><g transform="translate(960 540) rotate(90) translate(-960 -540)"><Hourglass x={960} y={540} s={1.3} f={0} /></g></Frame> },
  { at: "always", s: (g, f, len) => {
    const a = g * 0.25;
    return <><Bay cam={C(960, 520, 1.0)} f={f} sun={[960 + Math.cos(a) * 900, 640 - Math.max(0, Math.sin(a)) * 500]}>
      <Hero x={960} y={GY - 46} f={f} expr="neutral" pose={{ legL: 70, legR: 76, armL: [20, 40], armR: [20, 40] }} /></Bay>
      <NightOver f={f} o={Math.max(0, -Math.sin(a)) * 0.7} /></>;
  } },
  { at: "Scientists", s: (g, f, len) => <Frame bg="#0c0838"><Stars />
    <Sun x={1300} y={420} r={ip(g, [0, len], [180, 220])} />
    <g transform="translate(640 980)"><path d="M -20 0 L 0 -200 L 20 0 M 0 -200 L -60 0 M 0 -200 L 60 0" stroke={INK} strokeWidth={8} /><g transform="translate(0 -220) rotate(-25)"><rect x={-40} y={-30} width={260} height={60} rx={20} fill="#f4f2ff" stroke={INK} strokeWidth={7} /></g></g>
    <Bean x={460} y={1000} s={HS} look={DOC} f={f} expr="shock" open={0.4} pose={{ armR: [110, 30] }} />
  </Frame> },
  { at: "might", s: (g, f, len) => {
    const r = ip(g, [0, len], [200, 420]);
    return <Frame bg="#0c0838"><Stars />
      <circle cx={1200} cy={500} r={r} fill={`rgb(${255},${Math.round(ip(g, [0, len], [200, 70]))},${Math.round(ip(g, [0, len], [120, 50]))})`} stroke={INK} strokeWidth={8} />
      <Glow x={1200} y={500} r={r * 2} g="gR" />
      <Planet x={400} y={760} r={110} f={f} />
      <Bean x={560} y={780} s={0.3} look={HERO2D} f={f} expr="sad" shadow={false} pose={floatPose(f)} />
    </Frame>;
  } },
  { at: "Floating", s: (g, f, len) => <Frame bg="#05030c"><Stars n={20} />
    <g transform={`translate(960 ${560 + Math.sin(f * 0.05) * 20}) scale(${ip(g, [0, len], [1, 0.7])})`}><Bean x={0} y={200} s={0.5} look={HERO2D} f={f} expr="sad" shadow={false} pose={floatPose(f)} /></g>
    <Glow x={960} y={480} r={260} g="gV" o={0.3} />
  </Frame> },
], { id: 7 });
