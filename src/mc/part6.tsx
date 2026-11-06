// Часть 6/7: еда растёт за минуты, голод — полоска, раны заживают сами, больницы пустеют.
import React from "react";
import { B, Bean, Bee, Cam, Chicken, Cow, DOCTOR, Earth, FoodBar, Frame, G, GY, Glow, HERO2D, HS, Hearts, INK, Item, LOOKS, Stars, Voice, Wheat, atWord, camLerp, gx, gy, ip, makePart, walkPose } from "./kit";
import { Land, Street } from "./scenes";
import { VOICE } from "./voices/p6";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;
const Farm: React.FC<{ cam: Cam; f: number; grow?: number; children?: React.ReactNode; tod?: any }> = ({ cam, f, grow = 1, children, tod = "day" }) => (
  <Land cam={cam} f={f} tod={tod}>
    {Array.from({ length: 26 }, (_, i) => <G key={i} c={-8 + i} r={-1} t={i >= 9 && i <= 14 ? "farm" : "grass"} />)}
    {grow > 0 ? [9, 10, 11, 12, 13, 14].map((c) => <Wheat key={c} c={c - 8} g={grow} f={f} />) : null}
    {children}
  </Land>
);
const Flower: React.FC<{ c: number; col: string }> = ({ c, col }) => <g><rect x={gx(c) + 92} y={GY - 120} width={16} height={120} fill="#3aa85a" stroke={INK} strokeWidth={4} /><rect x={gx(c) + 64} y={GY - 176} width={72} height={72} fill={col} stroke={INK} strokeWidth={5} /><rect x={gx(c) + 88} y={GY - 152} width={24} height={24} fill="#ffd23c" /></g>;
const Hospital: React.FC = () => <g>
  {Array.from({ length: 24 }, (_, i) => <G key={i} c={2 + (i % 6)} r={Math.floor(i / 6)} t="conc" col="#f4f6ff" win={i % 6 === 2 && i < 6 ? undefined : 0} />)}
  <rect x={gx(4) + 40} y={gy(3) + 30} width={320} height={140} fill="#f4f6ff" stroke={INK} strokeWidth={5} />
  <path d={`M ${gx(5) - 20} ${gy(3) + 50} h 40 v 30 h 30 v 40 h -30 v 30 h -40 v -30 h -30 v -40 h 30 Z`} fill="#3ac87a" stroke={INK} strokeWidth={5} />
</g>;

export const P6 = makePart(V, [
  { at: "", s: (g, f, len) => <Farm cam={camLerp(g, len, { x: gx(3), y: GY - 450, z: 0.75 }, { x: gx(4), y: GY - 400, z: 0.85 })} f={f} tod="dawn">
    <Hero x={gx(-1)} f={f} expr="grin" pose={{ armL: [150, 30], armR: [150, 30] }} /><Cow x={gx(9)} f={f} /><Chicken x={gx(11)} f={f} flip />
  </Farm> },
  { at: "Plant", s: (g, f, len) => <Farm cam={camLerp(g, len, M(2, 1.6, -220), M(2.5, 1.7, -240))} f={f} grow={ip(g, [25, len], [0.05, 1], (t) => t)}>
    <Hero x={gx(0) + 60} f={f} expr="smirk" holdR={{ node: <Item t={g < 20 ? "seed" : "wbucket"} rot={g > 20 ? 50 : 0} />, rot: 0 }} pose={{ armR: [70, 20] }} />
  </Farm> },
  { at: "Three", s: (g, f, len) => {
    const m = ip(g, [8, 26], [0, 1]);
    return <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
      <Glow x={960} y={540} r={600} g="gY" o={0.4} />
      {m < 1 ? [0, 1, 2].map((i) => <Item key={i} t="wheat" x={960 + (i - 1) * 360 * (1 - m)} y={560} s={2} />) : <Item t="bread" x={960} y={560} s={3} />}
    </Land>;
  } },
  { at: "Cows", s: (g, f, len) => <Farm cam={camLerp(g, len, { x: gx(2), y: GY - 350, z: 0.8 }, { x: gx(4), y: GY - 350, z: 0.85 })} f={f} grow={1}>
    <Cow x={gx(-2) + g * 2} f={f} /><Cow x={gx(9)} f={f} flip /><Chicken x={gx(-5) + g * 3} f={f} /><Chicken x={gx(7)} f={f} flip />
  </Farm> },
  { at: "steak", n: 1, s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.2, -260), M(4, 2.5, -280))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr={g % 12 < 6 ? "talk" : "grin"} open={0.8} holdR={{ node: <Item t="steak" />, rot: 0 }} pose={{ armR: [150, 50] }} />
    <FoodBar x={gx(4) + B / 2} y={GY - 520} v={ip(g, [0, 30], [0.3, 1])} s={0.7} />
  </Street> },
  { at: "Bees", s: (g, f, len) => <Farm cam={camLerp(g, len, M(3, 1.5, -250), M(3.5, 1.6, -250))} f={f} grow={0}>
    {[1, 2, 4, 5, 6].map((c, i) => <Flower key={c} c={c} col={["#ff6f8f", "#b45ad8", "#ffffff", "#ff6f8f", "#5ae0ff"][i]} />)}
    <Bee x={gx(3)} y={GY - 300} f={f} /><Bee x={gx(5)} y={GY - 380} f={f + 40} />
  </Farm> },
  { at: "fishing", s: (g, f, len) => <Land cam={camLerp(g, len, M(3, 1.3, -300), M(3, 1.4, -300))} f={f}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t={i > 9 ? "water" : "grass"} f={f} />)}
    <Hero x={gx(3)} f={f} expr={g > 30 ? "laugh" : "smirk"} open={0.4} holdR={{ node: <g><rect x={-6} y={-260} width={12} height={270} fill="#a86a3a" stroke={INK} strokeWidth={4} transform="rotate(40)" /></g>, rot: 0 }} pose={{ armR: [100, -10] }} />
    <path d={`M ${gx(3) + 210} ${GY - 330} L ${gx(5) + 50} ${g > 30 ? GY - 500 : GY - 10}`} stroke="#eee" strokeWidth={3} />
    {g > 30 ? <g transform={`translate(${gx(5) + 50} ${GY - 520}) rotate(${Math.sin(f * 0.6) * 20})`}><rect x={-60} y={-24} width={100} height={48} fill="#5ab0e0" stroke={INK} strokeWidth={5} /><path d="M 40 0 l 40 -30 v 60 Z" fill="#5ab0e0" stroke={INK} strokeWidth={5} /><rect x={-44} y={-10} width={12} height={12} fill={INK} /></g> : null}
  </Land> },
  { at: "Hunger", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.7, -330), M(4, 1.9, -340))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr="sad" pose={{ armL: [20, 60], armR: [20, 60] }} /><FoodBar x={gx(4) + B / 2} y={GY - 520} v={ip(g, [0, len], [0.9, 0.5], (t) => t)} s={0.7} />
  </Street> },
  { at: "Run", s: (g, f, len) => <Land cam={{ x: gx(1) + g * 16, y: GY - 330, z: 1.4 }} f={f}>
    {Array.from({ length: 40 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
    <Hero x={gx(1) + g * 16} y={GY - Math.abs(Math.sin(g * 0.15)) * 120} f={f} expr="shock" open={0.5} pose={{ ...walkPose(f, 0.7), lean: -10 }} />
    <FoodBar x={gx(1) + g * 16} y={GY - 560} v={ip(g, [0, len], [0.5, 0.15], (t) => t)} s={0.7} />
  </Land> },
  { at: "keep", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.7, -330), M(4, 1.9, -340))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr={g % 12 < 6 ? "talk" : "grin"} open={0.8} holdR={{ node: <Item t="bread" />, rot: 0 }} pose={{ armR: [150, 50] }} />
    <FoodBar x={gx(4) + B / 2} y={GY - 520} v={ip(g, [0, 30], [0.2, 1])} s={0.7} />{g > 30 ? <Glow x={gx(4) + B / 2} y={GY - 300} r={400} g="gY" o={0.6} /> : null}
  </Street> },
  { at: "wounds", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.7, -330), M(4, 1.9, -340))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr="grin" />
    {g < len - 15 ? <rect x={gx(4) + 40} y={GY - 300} width={120} height={36} fill="#f4f6ff" stroke={INK} strokeWidth={5} transform={`rotate(-20 ${gx(4) + 100} ${GY - 282})`} /> : null}
    <Hearts x={gx(4) + B / 2} y={GY - 520} v={ip(g, [0, len], [0.3, 1], (t) => t)} s={0.7} />
  </Street> },
  { at: "broken", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -280), M(4, 2.2, -290))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr={g > len * 0.5 ? "laugh" : "sad"} open={0.4} holdR={g < len * 0.5 ? { node: <rect x={-30} y={-110} width={60} height={110} fill="#f4f6ff" stroke={INK} strokeWidth={6} />, rot: 0 } : undefined} pose={{ armR: g > len * 0.5 ? [160, 20 + Math.sin(f * 0.5) * 20] : [60, 60] }} />
    {g > len * 0.5 ? <Glow x={gx(4) + 200} y={GY - 400} r={300} g="gY" o={0.5} /> : null}
  </Street> },
  { at: "Hospitals", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 0.8, -500), M(5, 0.85, -480))} f={f} tod="day" cars={false} trees={false}><Hospital /></Street> },
  { at: "Doctors", s: (g, f, len) => <Farm cam={camLerp(g, len, M(1.5, 1.5, -280), M(2, 1.6, -280))} f={f} grow={1}>
    <Bean x={gx(1) + 40} y={GY} s={HS} look={DOCTOR} f={f} expr="grin" holdR={{ node: <Item t="wheat" />, rot: 0 }} pose={{ armR: [140, 10] }} />
  </Farm> },
  { at: "Pharmacies", s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
    <rect x={260} y={180} width={1400} height={760} fill="#c88a4a" stroke={INK} strokeWidth={8} />
    {[0, 1, 2].map((r) => <g key={r}><rect x={260} y={400 + r * 240} width={1400} height={30} fill="#8a5428" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => <Item key={i} t="milk" x={380 + i * 190} y={350 + r * 240} s={1.1} />)}</g>)}
  </Land> },
  { at: "Supermarkets", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 0.9, -300), { x: gx(5) + 100, y: GY - 2000, z: 0.75 })} f={f} tod="day" cars={false} trees={false}>
    {Array.from({ length: 10 }, (_, fl) => <g key={fl}>
      {Array.from({ length: 6 }, (_, i) => <G key={i} c={2 + i} r={fl * 2} t={i === 0 || i === 5 ? "glass" : "farm"} />)}
      <g transform={`translate(0 ${-fl * 2 * B - B})`}>{[3, 4, 5, 6].map((c) => <Wheat key={c} c={c} g={0.6 + ((fl + c) % 3) * 0.2} f={f} />)}</g>
      {Array.from({ length: 6 }, (_, i) => <G key={"g" + i} c={2 + i} r={fl * 2 + 1} t="glass" />)}
    </g>)}
  </Street> },
  { at: "World", s: (g, f, len) => <Frame tod="day"><rect width={1920} height={1080} fill="#1a0f4a" /><Stars f={f} /><Earth x={960} y={560} r={ip(g, [0, len], [360, 420])} f={f} />
    {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + f * 0.01; return <Item key={i} t={i % 2 ? "bread" : "wheat"} x={960 + Math.cos(a) * 520} y={560 + Math.sin(a) * 440} s={0.9} />; })}</Frame> },
  { at: "Restaurants", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.2, -350), M(5, 1.3, -340))} f={f} tod="dusk" cars={false} trees={false}>
    {Array.from({ length: 15 }, (_, i) => <G key={i} c={3 + (i % 5)} r={Math.floor(i / 5)} t="brick" />)}
    <rect x={gx(4)} y={gy(1)} width={B * 3} height={B * 2} fill="#ffd23c" stroke={INK} strokeWidth={5} />
    <rect x={gx(4) + 60} y={gy(0) + 60} width={B * 3 - 120} height={30} fill="#a86a3a" stroke={INK} strokeWidth={5} />
    <Bean x={gx(5) + 100} y={gy(0) + 60} s={HS} look={{ ...LOOKS[0], body: "#ffffff", body2: "#e04a5a" }} f={f} expr="grin" />
    <Glow x={gx(5) + 100} y={gy(1)} r={500} g="gY" o={0.4} />
  </Street> },
  { at: "Bread", n: 2, s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f} tod="dusk">
    <rect x={160} y={680} width={1600} height={60} fill="#a86a3a" stroke={INK} strokeWidth={8} />
    {([["bread", "Bread", 2], ["steak", "steak", 2], ["cake", "cake", 1], ["stew", "mushroom", 1]] as const).map(([t, w, n], i) => {
      const k = ip(f - atWord(V, w, n) + 3, [0, 7], [0, 1], (x) => 1 - Math.pow(1 - x, 3));
      return <g key={t} transform={`translate(${380 + i * 390} 600) scale(${k * 2.1})`}><Item t={t} /></g>;
    })}
  </Land> },
  { at: "Nobody", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.2, -320), M(5, 1.3, -320))} f={f} tod="dusk">
    {[3, 5, 7].map((c, i) => <Bean key={i} x={gx(c) + 60} y={GY} s={HS} look={i === 1 ? HERO2D : LOOKS[i + 3]} f={f + i * 5} expr={(f + i * 6) % 20 < 10 ? "talk" : "laugh"} open={0.6} holdR={{ node: <Item t={(["cake", "steak", "bread"] as const)[i]} />, rot: 0 }} pose={{ armR: [130, 40] }} />)}
  </Street> },
  { at: "terrifying", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -260), M(4, 2.8, -270))} f={f} tod="dusk" dark={ip(g, [0, len], [0, 0.8])}>
    <Hero x={gx(4) + B / 2} f={f} expr="shock" open={0.3} sweat pose={{ armL: [20, 30], armR: [20, 30] }} />
  </Street> },
  { at: "die", s: (g, f, len) => <Street cam={camLerp(g, len, { x: gx(5), y: GY - 900, z: 0.9 }, { x: gx(5), y: GY - 800, z: 1.1 })} f={f} tod="dusk" dark={0.5}>
    {Array.from({ length: 3 }, (_, i) => <G key={i} c={4 + i} r={5} t="planks" />)}
    <Bean x={gx(6) + 100} y={gy(5)} s={HS} look={HERO2D} f={f} expr="shock" open={0.4} pose={{ tilt: 20, lean: 8, armL: [100, 0], armR: [100, 0] }} />
  </Street> },
], { id: 6 });
