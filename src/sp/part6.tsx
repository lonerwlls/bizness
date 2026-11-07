// Часть 6/8: соблазн власти — и сделка, от которой надо отказаться.
import React from "react";
import { Bay, Bean, Cam, Contract, Crown, DOC, Defs, FlyHero, Frame, GY, Glow, GoldBars, HERO2D, HS, Hourglass, INK, LOOKS, Layer, MoneyBag, NightOver, Planet, Room, SUIT, Thought, Town, Truck, Vault, Voice, YEL, atWord, camLerp, floatPose, ip, makePart, walkPose } from "./kit";
import { VOICE } from "./voices/p6";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const Dusk: React.FC<{ f: number; o?: number }> = ({ f, o = 0.35 }) => <NightOver f={f} o={o} />;
const Stars: React.FC = () => <>{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}</>;
// «замёрзший» мир: сцена обесцвечена, а герой поверх — в цвете
const Frozen: React.FC<{ scene: React.ReactNode; cam: Cam; children: React.ReactNode }> = ({ scene, cam, children }) => (
  <>
    <div style={{ position: "absolute", inset: 0, filter: "saturate(0.15) brightness(0.95) hue-rotate(180deg)" }}>{scene}</div>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><Defs /><Layer cam={cam} d={1}>{children}</Layer></svg>
  </>
);
const Puppet: React.FC<{ x: number; y: number; s?: number; f: number; p?: number }> = ({ x, y, s = 1, f, p = 1 }) => p <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, p)})`}>
    <path d="M -150 60 Q -190 -40 -110 -70 Q -100 -140 -20 -130 Q 50 -170 110 -110 Q 190 -100 170 -10 Q 200 70 110 90 Q 30 120 -50 100 Q -160 120 -150 60 Z" fill="#fff6f0" stroke={INK} strokeWidth={7} />
    <circle cx={-110} cy={170} r={16} fill="#fff6f0" stroke={INK} strokeWidth={5} /><circle cx={-80} cy={130} r={24} fill="#fff6f0" stroke={INK} strokeWidth={5} />
    <rect x={-80} y={-110} width={160} height={14} fill="#2a3048" />
    {[-50, 0, 50].map((k, i) => <path key={k} d={`M ${k} -96 L ${k + (i - 1) * 10} ${-30 + Math.sin(f * 0.2 + i) * 6}`} stroke={INK} strokeWidth={3} />)}
    <g transform={`translate(0 80) rotate(${Math.sin(f * 0.2) * 8})`}><Bean x={0} y={0} s={0.25} look={HERO2D} f={f} expr="sad" shadow={false} pose={{ armL: [120, 20], armR: [120, 20] }} /></g>
  </g>
);

export const P6 = makePart(V, [
  { at: "", s: (g, f, len) => <><Town cam={camLerp(g, len, C(960, GY - 260, 2.4), C(960, GY - 260, 2.9))} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="smirk" />
    <Glow x={960} y={GY - 250} r={260} g="gR" o={0.4} /></Town><Dusk f={f} o={0.3} /></> },
  { at: "start", n: 1, s: (g, f, len) => <><Town cam={camLerp(g, len, C(960, 540, 1.1), C(960, 520, 1.2))} f={f}>
    <Hero x={960} y={GY - 300} f={f} expr="smirk" shadow={false} pose={{ ...floatPose(f), armL: [40, 100], armR: [40, 100] }} />
    {[[400, 0], [650, 3], [1300, 5], [1550, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 40} s={HS * 0.8} look={LOOKS[l]} f={f} expr="shock" open={0.3} pose={{ armR: [150, 20] }} />)}
  </Town><Dusk f={f} o={0.3} /></> },
  { at: "When", s: (g, f, len) => <><Town cam={C(960, 520, 1.0)} f={f}>
    {[[350, 0, "heart"], [750, 3, "clock"], [1170, 5, "lock"], [1570, 6, "bolt"]].map(([x, l, ic], i) => <g key={i}><Bean x={x as number} y={GY + 40} s={HS * 0.85} look={LOOKS[l as number]} f={f} pose={walkPose(f, 0.2, i)} /><Thought x={(x as number) + 90} y={GY - 430} s={0.55} icon={ic as any} p={ip(g, [i * 4, i * 4 + 8], [0, 1])} /></g>)}
  </Town><Dusk f={f} o={0.3} /></> },
  { at: "know", n: 1, s: (g, f, len) => <><Town cam={C(960, GY - 260, 2.0)} f={f}>
    <Bean x={900} y={GY + 30} s={HS} look={LOOKS[3]} f={f} expr="grin" pose={{ armR: [60, 40] }} />
    <Thought x={1150} y={GY - 520} s={0.7} icon="bolt" p={ip(g, [0, 6], [0, 1])} />
  </Town><Dusk f={f} o={0.3} /></> },
  { at: "jealous", s: (g, f, len) => <><Town cam={C(960, GY - 260, 2.0)} f={f}>
    <Bean x={900} y={GY + 30} s={HS} look={{ ...LOOKS[2], head: "#c8f0b0" }} f={f} expr="sad" pose={{ armL: [30, 90], armR: [30, 90] }} />
    <Thought x={1150} y={GY - 520} s={0.7} icon="heart" p={ip(g, [0, 6], [0, 1])} />
  </Town><Dusk f={f} o={0.3} /></> },
  { at: "afraid", n: 1, s: (g, f, len) => <><Town cam={C(960, GY - 260, 2.0)} f={f}>
    <Bean x={960 + Math.sin(f * 2) * 4} y={GY + 30} s={HS} look={LOOKS[4]} f={f} expr="shock" open={0.7} sweat pose={{ armL: [40, 70], armR: [40, 70] }} />
  </Town><Dusk f={f} o={0.3} /></> },
  { at: "very", s: (g, f, len) => <><Town cam={camLerp(g, len, C(960, GY - 260, 1.6), C(960, GY - 260, 1.8))} f={f}>
    <Bean x={760} y={GY + 30} s={HS} look={LOOKS[6]} f={f} expr="talk" open={0.3 + 0.3 * Math.abs(Math.sin(f * 0.4))} pose={{ armR: [80, 40] }} />
    <Thought x={600} y={GY - 520} s={0.6} icon="bolt" p={ip(g, [6, 12], [0, 1])} /><Thought x={880} y={GY - 600} s={0.5} icon="lock" p={ip(g, [18, 24], [0, 1])} />
    <Hero x={1160} y={GY + 30} f={f} expr="smirk" flip pose={{ armL: [30, 100], armR: [30, 100], tilt: -12 }} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "power", n: 1, s: (g, f, len) => <><Room cam={camLerp(g, len, C(900, 560, 1.0), C(900, 520, 1.1))} f={f} win={false} kind="plain">
    <g opacity={0.6}><Bean x={900} y={GY} s={HS * ip(g, [0, len], [1.2, 2.1])} look={{ head: "#1a0f3a", body: "#1a0f3a", body2: "#1a0f3a", limb: "#1a0f3a", shoe: "#1a0f3a", hat: "beanie", hatC: "#1a0f3a", hatC2: "#1a0f3a", pack: "#1a0f3a" }} f={f} noEyes shadow={false} pose={{ armL: [60, 30], armR: [60, 30] }} /></g>
    <Hero x={900} y={GY} f={f} expr="smirk" pose={{ armL: [60, 30], armR: [60, 30] }} />
    <Glow x={900} y={GY - 200} r={300} g="gR" o={0.4} />
  </Room><Dusk f={f} o={0.4} /></> },
  // эксперименты психологов
  { at: "Psychologists", s: (g, f, len) => <Room cam={C(960, GY - 300, 1.3)} f={f} win={false} kind="plain">
    <Bean x={600} y={GY} s={HS} look={DOC} f={f} expr="neutral" pose={{ armR: [70, 60] }} holdR={{ node: <Contract s={0.6} />, k: 1.3 }} />
    <Bean x={1150} y={GY} s={HS} look={LOOKS[2]} f={f} expr="neutral" flip /><Bean x={1400} y={GY} s={HS} look={LOOKS[5]} f={f} expr="neutral" flip />
  </Room> },
  { at: "experiments", s: (g, f, len) => <Room cam={C(1100, GY - 320, 1.5)} f={f} win={false} kind="plain">
    <rect x={850} y={GY - 160} width={260} height={160} fill="#ff6fb5" stroke={INK} strokeWidth={8} />
    <Bean x={980} y={GY - 160} s={HS} look={LOOKS[2]} f={f} expr="grin" pose={{ armR: [80, 30] }} />
    <g transform={`translate(980 ${GY - 160 - 312})`}><Crown s={0.8} /></g>
    <Bean x={1350} y={GY} s={HS} look={LOOKS[5]} f={f} expr="sad" flip />
  </Room> },
  { at: "start", n: 2, s: (g, f, len) => <Room cam={C(1100, GY - 320, 1.6)} f={f} win={false} kind="plain">
    <rect x={850} y={GY - 160} width={260} height={160} fill="#ff6fb5" stroke={INK} strokeWidth={8} />
    <Bean x={980} y={GY - 160} s={HS} look={LOOKS[2]} f={f} expr="smirk" flip pose={{ armL: [30, 100], armR: [30, 100], tilt: -10 }} />
    <g transform={`translate(980 ${GY - 160 - 312})`}><Crown s={0.8} /></g>
    <Bean x={1350} y={GY} s={HS} look={LOOKS[5]} f={f} expr="talk" open={0.5} flip pose={{ armR: [150, 20] }} />
  </Room> },
  { at: "break", s: (g, f, len) => <Room cam={C(960, GY - 300, 1.4)} f={f} win={false} kind="plain">
    {[700, 1000, 1300].map((x, i) => <g key={x} transform={`translate(${x} ${GY}) rotate(${i === 1 ? ip(g, [6, 12], [0, -80]) : 0})`}><path d="M -40 0 L -10 -110 L 10 -110 L 40 0 Z" fill="#ff8a3a" stroke={INK} strokeWidth={6} /><rect x={-24} y={-70} width={48} height={18} fill="#fff" /></g>)}
    <path d={`M 700 ${GY - 90} L 1300 ${GY - 90}`} stroke={YEL} strokeWidth={12} strokeDasharray="30 20" />
    <Bean x={ip(g, [0, len], [800, 1100])} y={GY} s={HS} look={LOOKS[2]} f={f} expr="smirk" pose={walkPose(f, 0.3)} />
    <g transform={`translate(${ip(g, [0, len], [800, 1100]) - 8} ${GY - 312 - Math.abs(Math.sin(f * 0.3)) * 4})`}><Crown s={0.8} /></g>
  </Room> },
  // всемогущество
  { at: "Now", s: (g, f, len) => <><Town cam={camLerp(g, len, C(960, GY - 430, 1.6), C(960, GY - 430, 1.85))} f={f}>
    <Hero x={960} y={GY - 260} f={f} expr="smirk" shadow={false} pose={{ ...floatPose(f), armL: [150, 20], armR: [150, 20] }} />
    <Glow x={960} y={GY - 450} r={400} g="gV" o={0.6} />
  </Town><Dusk f={f} o={0.4} /></> },
  { at: "could", s: (g, f, len) => <Room cam={C(960, GY - 300, 1.3)} f={f} win={false} kind="plain">
    <Vault x={1300} y={GY} open={ip(g, [0, 14], [0, 1])} />
    <GoldBars x={1160} y={GY - 50} />
    <Hero x={800} y={GY} f={f} expr="grin" pose={{ armR: [100, 20] }} holdR={{ node: <MoneyBag s={0.9} />, k: 1.3 }} />
  </Room> },
  { at: "Win", s: (g, f, len) => <><Town cam={C(960, 560, 1.15)} f={f}>
    <rect x={820} y={GY - 200} width={280} height={240} fill="#5a7cf0" stroke={INK} strokeWidth={8} />
    <path transform={`translate(960 ${GY - 90})`} d="M 0 -50 L 14 -16 L 50 -14 L 22 8 L 32 44 L 0 24 L -32 44 L -22 8 L -50 -14 L -14 -16 Z" fill={YEL} stroke={INK} strokeWidth={5} />
    <Hero x={960} y={GY - 200} f={f} expr="laugh" open={0.5} pose={{ armL: [165, 10], armR: [165, 10] }} />
    {[[350, 0], [550, 3], [1370, 5], [1570, 6]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 40} s={HS} look={LOOKS[l]} f={f} expr="grin" pose={{ armL: [160, 10], armR: [160, 10] }} />)}
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(i * 173) % 1920} y={((f * 6 + i * 97) % 900) - 100} width={18} height={10} fill={["#ff4a6a", YEL, "#5ae0ff", "#ff6fb5"][i % 4]} />)}
  </Town><Dusk f={f} o={0.25} /></> },
  { at: "Freeze", s: (g, f, len) => {
    const cam = C(960, 560, 1.05), F = atWord(V, "Freeze") - 3;
    return <Frozen cam={cam} scene={<Town cam={cam} f={F}>
      {[[350, 0], [700, 3], [1250, 5], [1600, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 40} s={HS} look={LOOKS[l]} f={F} pose={walkPose(F, 0.25, i)} />)}
      <path d="M 1300 300 q 30 -20 60 0 q 30 -20 60 0" stroke={INK} strokeWidth={8} fill="none" />
    </Town>}>
      <Hero x={ip(g, [0, len], [500, 1100])} y={GY + 40} f={f} expr="smirk" pose={walkPose(f, 0.22)} />
      <circle cx={960} cy={540} r={ip(g, [0, 12], [0, 1400])} fill="none" stroke="#bff4ff" strokeWidth={30} opacity={ip(g, [0, 12], [1, 0])} />
    </Frozen>;
  } },
  { at: "nobody", n: 1, s: (g, f, len) => {
    const cam = C(960, GY - 260, 1.9), F = atWord(V, "Freeze") - 3;
    return <Frozen cam={cam} scene={<Town cam={cam} f={F} />}>
      <Hero x={960} y={GY + 40} f={f} expr="smirk" pose={{ armR: [120, 30], armL: [60, 60] }} holdR={{ node: <Crown s={1.2} />, k: 1 }} />
    </Frozen>;
  } },
  // сделка
  { at: "One", s: (g, f, len) => <><Town cam={camLerp(g, len, C(960, GY - 250, 1.4), C(960, GY - 250, 1.6))} f={f}>
    <Hero x={700} y={GY + 30} f={f} expr="neutral" />
    <Bean x={ip(g, [0, len], [1500, 1200])} y={GY + 30} s={HS} look={SUIT} f={f} expr="grin" flip pose={{ ...walkPose(f, 0.2), armR: [100, 20] }} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "Work", s: (g, f, len) => <><Town cam={C(960, GY - 260, 1.8)} f={f}>
    <Hero x={760} y={GY + 30} f={f} expr="neutral" />
    <Bean x={1160} y={GY + 30} s={HS} look={SUIT} f={f} expr="grin" flip pose={{ armR: [100, 20], armL: [80, 20] }} holdR={{ node: <Contract s={0.7} />, k: 1.3 }} holdL={{ node: <MoneyBag s={0.6} />, k: 1.3 }} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "read", n: 2, s: (g, f, len) => <><Town cam={camLerp(g, len, C(900, GY - 260, 2.2), C(1100, GY - 280, 2.6))} f={f}>
    <Hero x={760} y={GY + 30} f={f} expr="neutral" />
    {[-26, 26].map((k) => <Glow key={k} x={760 + k} y={GY - 236} r={70} g="gV" />)}
    <Bean x={1160} y={GY + 30} s={HS} look={SUIT} f={f} expr="grin" flip pose={{ armR: [100, 20] }} holdR={{ node: <Contract s={0.7} />, k: 1.3 }} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "He", n: 1, s: (g, f, len) => <><Town cam={C(1200, GY - 380, 1.7)} f={f}>
    <Bean x={1160} y={GY + 30} s={HS} look={SUIT} f={f} expr="smirk" flip pose={{ armR: [100, 20] }} holdR={{ node: <Contract s={0.7} />, k: 1.3 }} />
    <Puppet x={1380} y={GY - 600} s={0.9} f={f} p={ip(g, [0, 8], [0, 1])} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "So", s: (g, f, len) => <><Bay cam={camLerp(g, len, C(960, GY - 300, 1.8), C(960, GY - 300, 2.1))} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ tilt: Math.sin(f * 0.05) * 4 }} />
  </Bay><Dusk f={f} o={0.4} /></> },
  { at: "strong", s: (g, f, len) => <><Bay cam={C(960, GY - 380, 1.2)} f={f}>
    <g opacity={ip(g, [0, len], [1, 0.3])}><Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armL: [175, 0], armR: [175, 0] }} /><Truck x={960} y={GY - 370} s={0.9} /></g>
  </Bay><Dusk f={f} o={0.4} /></> },
  { at: "refuse", s: (g, f, len) => <><Town cam={C(960, GY - 260, 1.8)} f={f}>
    <Hero x={760} y={GY + 30} f={f} expr="neutral" pose={{ armR: [92, -10] }} />
    <Bean x={1160 + ip(g, [4, 12], [0, 40])} y={GY + 30} s={HS} look={SUIT} f={f} expr={g > 6 ? "shock" : "grin"} open={0.4} flip pose={{ armR: [100, 20] }} holdR={{ node: <MoneyBag s={0.6} />, k: 1.3 }} />
  </Town><Dusk f={f} o={0.35} /></> },
  { at: "even", n: 2, s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Planet x={960} y={1250} r={760} f={f} /><Bean x={960} y={500} s={0.5} look={HERO2D} f={f} expr="neutral" /><Glow x={960} y={400} r={300} g="gV" o={0.4} /></Frame> },
  { at: "fly", s: (g, f, len) => <><Town cam={C(960, 520, 1.0)} f={f}>
    <Bean x={1350} y={GY + 30} s={HS} look={SUIT} f={f} expr="sad" pose={{ armR: [150, 20] }} holdR={{ node: <Contract s={0.7} />, k: 1.3 }} />
    <FlyHero cx={ip(g, [0, len], [800, -200])} cy={ip(g, [0, len], [700, 200])} f={f} s={0.5} left expr="neutral" />
  </Town><Dusk f={f} o={0.4} /></> },
  { at: "But", s: (g, f, len) => <Frame bg="#0c0838"><Stars /><Hourglass x={960} y={480} s={ip(g, [0, len], [1.0, 1.2])} f={f} /><g transform="translate(0 0)"><FlyHero cx={ip(g, [0, len], [200, 700])} cy={900} f={f} s={0.3} expr="neutral" /></g></Frame> },
], { id: 6 });
