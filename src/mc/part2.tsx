// Часть 2/7: новая физика — висящие блоки, падающий песок, бесконечная вода, вечные факелы, лава.
import React from "react";
import { B, Bean, Blk, Cam, Drop, Fire, G, GY, Glow, HERO2D, HS, INK, Item, LOOKS, Torch, Tree, Voice, BANKER, camLerp, gx, gy, ip, makePart, walkPose, Cloud } from "./kit";
import { Land, Street } from "./scenes";
import { VOICE } from "./voices/p2";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;
const punchPose = (f: number) => ({ armR: [80 + Math.max(0, Math.sin(f * 0.5)) * 15, -60 + Math.max(0, Math.sin(f * 0.5)) * 60] as [number, number], armL: [30, 40] as [number, number], lean: 4 });
const Flat: React.FC<{ c0: number; c1: number; top?: any }> = ({ c0, c1, top = "grass" }) => <g>{Array.from({ length: c1 - c0 }, (_, i) => [0, 1, 2].map((j) => <G key={i + "_" + j} c={c0 + i} r={-1 - j} t={j === 0 ? top : j === 1 ? (top === "sand" ? "sand" : "dirt") : "stone"} />))}</g>;

// холм-ступеньки: высоты столбцов
const HILL = [5, 5, 4, 4, 3, 2, 2, 1, 0, 0, 0, 0];
const Hill: React.FC<{ c0: number }> = ({ c0 }) => <g>{HILL.map((h, i) => Array.from({ length: h + 3 }, (_, j) => <G key={i + "_" + j} c={c0 + i} r={j - 3} t={j === h + 2 ? "grass" : j > h - 1 ? "dirt" : "stone"} />))}</g>;
// вода стекает с вершины: каждый столбец заливается по очереди
const HillWater: React.FC<{ c0: number; p: number; f: number }> = ({ c0, p, f }) => <g>{HILL.map((h, i) => (p * (HILL.length + 2) > i ? <G key={i} c={c0 + i} r={h} t="water" f={f} o={Math.min(1, p * (HILL.length + 2) - i)} /> : null))}</g>;

export const P2 = makePart(V, [
  { at: "", s: (g, f, len) => {
    const cut = g > 40;
    return <Land cam={camLerp(g, len, M(3, 1.3, -420), M(3, 1.0, -520))} f={f}>
      <Flat c0={-6} c1={14} /><Tree c={4} h={4} cut={cut ? 1 : 0} />
      {cut ? <Drop t="log" x={gx(4) + B / 2} y={GY - 10} f={f} /> : null}
      <Hero x={gx(3) - 20} f={f} expr={cut ? "shock" : "talk"} open={0.4} pose={cut ? { armL: [150, 30], armR: [150, 30] } : punchPose(f)} />
    </Land>;
  } },
  { at: "bridge", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.7, -350), M(4, 0.8, -330))} f={f}>
    <Flat c0={-6} c1={1} /><Flat c0={9} c1={16} />
    {Array.from({ length: 8 }, (_, i) => [0, 1].map((j) => <G key={i + "_" + j} c={1 + i} r={-1 - j} t="water" f={f} />))}
    {Array.from({ length: 8 }, (_, i) => (i === 3 || i === 4 ? null : <G key={i} c={1 + i} r={1} t="planks" />))}
    {[1, 8].map((c) => <G key={c} c={c} r={0} t="log" />)}
    <Bean x={gx(2)} y={gy(1) + B} s={HS} look={LOOKS[1]} f={f} expr="shock" open={0.5} pose={{ armL: [60, 20], armR: [60, 20] }} />
  </Land> },
  { at: "Only", s: (g, f, len) => <Land cam={camLerp(g, len, M(3, 1.0, -400), M(3, 1.1, -380))} f={f}>
    <Flat c0={-6} c1={14} />
    {[0, 1, 2, 3, 4, 5].map((i) => { const t0 = i * 8, y = ip(g - t0, [0, 14], [-1400, 0], (t) => t * t); return g > t0 ? <Blk key={i} x={gx(2 + (i % 3))} y={gy(Math.floor(i / 3)) + y} t={i % 2 ? "sand" : "gravel"} /> : null; })}
    <G c={6} r={2} t="stone" /><G c={7} r={2} t="dirt" />
  </Land> },
  { at: "first", s: (g, f, len) => {
    const fall = ip(g, [18, 30], [-900, 0], (t) => t * t);
    return <Land cam={camLerp(g, len, M(4, 1.5, -280), M(4, 1.7, -260))} f={f} sun={[2000, -200]}>
      <Flat c0={-6} c1={16} top="sand" />
      {Array.from({ length: 4 }, (_, i) => <G key={i} c={6 + i} r={0} t="sand" />)}{Array.from({ length: 3 }, (_, i) => <G key={"u" + i} c={6 + i} r={1} t="sand" />)}
      <Bean x={gx(4) + B / 2} y={GY} s={HS} look={LOOKS[4]} f={f} expr={g > 26 ? "shock" : "talk"} open={0.6} holdR={{ node: <Item t="pick" />, rot: -20, k: 0.8 }} pose={g < 18 ? punchPose(f) : { armL: [160, 10], armR: [160, 10] }} />
      {[0, 1, 2].map((i) => <Blk key={i} x={gx(3 + i)} y={gy(0) + fall - (i === 1 ? B : 0)} t="sand" />)}
      {g > 30 ? <Blk x={gx(4)} y={gy(1) + fall} t="sand" /> : null}
    </Land>;
  } },
  { at: "Water", n: 1, s: (g, f, len) => <Land cam={camLerp(g, len, M(1, 2.0, -1100 + 200), M(1, 2.3, -1000 + 200))} f={f}>
    <Hill c0={-1} /><Hero x={gx(0) + B / 2} y={gy(5) + B} f={f} expr="smirk" holdR={{ node: <Item t="wbucket" />, rot: 0, k: 0.9 }} pose={{ armR: [110, 10] }} />
  </Land> },
  { at: "Pour", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.8, -600), M(5, 0.65, -500))} f={f}>
    <Hill c0={-1} /><HillWater c0={-1} p={ip(g, [8, len - 6], [0, 1], (t) => t)} f={f} />
    <Hero x={gx(0) + B / 2} y={gy(5) + B} f={f} expr="shock" open={0.4} holdR={{ node: <Item t="wbucket" rot={110} />, rot: 0, k: 0.9 }} pose={{ armR: [110, 10] }} />
  </Land> },
  { at: "Within", s: (g, f, len) => {
    const p = ip(g, [10, len], [0, 1], (t) => t);
    return <Land cam={camLerp(g, len, M(4, 0.9, -300), M(4, 0.8, -320))} f={f}>
      <Flat c0={-6} c1={16} />
      {Array.from({ length: 10 }, (_, i) => (Math.abs(i - 4.5) < 0.6 + p * 5 ? <G key={i} c={i} r={-1} t="water" f={f} /> : null))}
      <Bean x={gx(-1) + 60} y={GY} s={HS} look={LOOKS[2]} f={f} expr="grin" holdR={{ node: <Item t="wbucket" rot={70} />, k: 0.8 }} pose={{ armR: [100, -10] }} />
      <Bean x={gx(10) + 140} y={GY} s={HS} look={LOOKS[6]} f={f} expr="grin" flip holdR={{ node: <Item t="wbucket" rot={70} />, k: 0.8 }} pose={{ armR: [100, -10] }} />
    </Land>;
  } },
  { at: "Builders", s: (g, f, len) => <Land cam={camLerp(g, len, M(3, 1.2, -300), { x: gx(3) + 100, y: GY - 2600, z: 0.8 })} f={f} tod="day">
    <Flat c0={-6} c1={14} />
    {Array.from({ length: 16 }, (_, i) => <G key={i} c={3} r={i} t="stone" />)}
    <Bean x={gx(3) + B / 2} y={gy(15)} s={HS} look={LOOKS[5]} f={f} expr="grin" pose={{ armL: [150, 20], armR: [150, 20] }} />
    {[[-1, 6], [6, 9], [-3, 12]].map(([c, r], i) => <Cloud key={i} x={gx(c)} y={gy(r)} w={4} f={f} />)}
  </Land> },
  { at: "Kids", s: (g, f, len) => {
    const k = Math.min(9, Math.floor(g / 5));
    return <Land cam={camLerp(g, len, M(4, 0.9, -700), M(6, 0.75, -1100))} f={f}>
      <Flat c0={-6} c1={18} />
      {Array.from({ length: 12 }, (_, i) => <G key={i} c={i} r={i} t="planks" />)}
      {[[7, 9], [3, 11], [10, 12]].map(([c, r], i) => <Cloud key={i} x={gx(c)} y={gy(r)} w={4} f={f} />)}
      <Bean x={gx(k) + B / 2} y={gy(k)} s={HS * 0.8} look={LOOKS[4]} f={f} expr="laugh" open={0.5} pose={walkPose(f, 0.5)} />
    </Land>;
  } },
  { at: "Fire", s: (g, f, len) => {
    const out = g > len * 0.55;
    return <Street cam={camLerp(g, len, M(5, 1.2, -350), M(5, 1.3, -330))} f={f} cars={false} trees={false}>
      {Array.from({ length: 12 }, (_, i) => <G key={i} c={5 + (i % 4)} r={Math.floor(i / 4)} t="planks" />)}
      {Array.from({ length: 4 }, (_, i) => <G key={"r" + i} c={5 + i} r={3} t="brick" />)}
      {out ? Array.from({ length: 3 }, (_, i) => <G key={"w" + i} c={6 + i} r={0} t="water" f={f} />) : <Fire x={gx(7)} y={gy(1)} f={f} s={1.6} />}
      <Bean x={gx(3) + 60} y={GY} s={HS} look={{ ...LOOKS[0], body: "#e04a3a", body2: "#a02e24", hat: "beanie", hatC: "#ffd23c", hatC2: "#e04a3a" }} f={f} expr={out ? "grin" : "shock"} open={0.5} holdR={{ node: <Item t={out ? "bucket" : "wbucket"} rot={out ? 0 : 60} />, k: 0.9 }} pose={{ armR: [100, -10] }} />
    </Street>;
  } },
  { at: "flood", s: (g, f, len) => {
    const lvl = ip(g, [0, len], [0.2, 2.2], (t) => t);
    return <Street cam={camLerp(g, len, { x: 1600, y: 420, z: 0.62 }, { x: 1600, y: 450, z: 0.68 })} f={f}>
      {[0, 3, 8, 12].map((c, i) => <Bean key={i} x={gx(c)} y={GY - Math.max(0, lvl - 0.5) * B + Math.sin(f * 0.2 + i) * 8} s={HS} look={LOOKS[i + 1]} f={f} expr="shock" open={0.6} pose={{ armL: [150, 20], armR: [150, 20] }} />)}
      <rect x={-4000} y={GY - lvl * B} width={9000} height={lvl * B + 20} fill="#3a8af0" opacity={0.82} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-3000 + i * 300 + Math.sin(f * 0.1 + i) * 30} ${GY - lvl * B + 20} q 40 -20 80 0`} stroke="#9fd8ff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
    </Street>;
  } },
  { at: "notices", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.7, -250), M(4, 2.0, -260))} f={f} tod="night" dark={0.6}>
    <Hero x={gx(4) + B / 2} f={f} expr="shock" open={0.3} holdR={{ node: <Item t="torch" f={f} />, rot: 0, k: 1 }} pose={{ armR: [150, 20] }} />
  </Street> },
  { at: "torch", n: 1, s: (g, f, len) => {
    const m = ip(g, [10, 30], [0, 1]);
    return <Land cam={{ x: 960, y: 540, z: 1 }} f={f} tod="night" dark={0.4}>
      <rect x={-2000} y={-2000} width={6000} height={6000} fill="#1a1040" opacity={0.6} />
      {m < 1 ? <><Item t="stick" x={760 + m * 200} y={560} s={2.2} rot={(1 - m) * -30} /><Item t="coal" x={1160 - m * 200} y={560} s={1.6} /></> : <Item t="torch" x={960} y={620} s={2.6} f={f} />}
      {m >= 1 ? <Glow x={960} y={420} r={600} g="gY" o={0.6} /> : null}
    </Land>;
  } },
  { at: "electricity", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1500, y: 420, z: 0.75 }, { x: 1800, y: 420, z: 0.8 })} f={f} tod="night" torches dark={0.3}>
    <Bean x={gx(6)} y={GY} s={HS} look={LOOKS[3]} f={f} expr="grin" pose={walkPose(f)} />
  </Street> },
  { at: "Lava", n: 1, s: (g, f, len) => {
    const p = ip(g, [0, len], [0, 1], (t) => t);
    return <Land cam={camLerp(g, len, M(4, 1.0, -300), M(4.5, 1.15, -280))} f={f} tod="dusk">
      {Array.from({ length: 22 }, (_, i) => [0, 1, 2].map((j) => <G key={i + "_" + j} c={-6 + i} r={-1 - j} t={j === 0 && i >= 9 && i <= 11 ? "lava" : j === 0 ? "grass" : "stone"} f={f} />))}
      {Array.from({ length: 8 }, (_, i) => (Math.abs(i - 3.5) < 1 + p * 3.5 ? <G key={"l" + i} c={6 + i} r={-1} t="lava" f={f} /> : null))}
      <Glow x={gx(10)} y={GY} r={800} g="gO" o={0.7} />
      <G c={13} r={0} t="planks" />{p > 0.6 ? <Fire x={gx(13) + B / 2} y={GY - B * 0.3} f={f} /> : null}
      <Hero x={gx(4)} f={f} expr="shock" open={0.6} sweat pose={{ armL: [40, 40], armR: [40, 40], lean: -8 }} />
    </Land>;
  } },
  { at: "lunchtime", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.8, -260), M(4, 2.1, -270))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr="smirk" pose={{ armR: [150, 70], armL: [30, 50], tilt: 8 }} />
  </Street> },
  { at: "Blocks", n: 2, s: (g, f, len) => <Land cam={{ x: gx(3), y: GY - 500, z: 1.1 + g * 0.003 }} f={f}>
    <G c={0} r={-1} t="grass" /><G c={1} r={-1} t="grass" />{[[2, 2], [3, 3], [4, 2], [3, 1]].map(([c, r], i) => <G key={i} c={c} r={r + Math.sin(f * 0.05 + i) * 0.03} t={["stone", "planks", "gold", "brick"][i] as any} />)}
  </Land> },
  { at: "water", n: 3, s: (g, f, len) => <Land cam={{ x: gx(3), y: GY - 600, z: 1.0 + g * 0.003 }} f={f}>
    {Array.from({ length: 8 }, (_, j) => <G key={j} c={3} r={j - 1} t="water" f={f + j * 5} />)}{Array.from({ length: 8 }, (_, j) => <G key={"s" + j} c={2} r={j - 1} t="stone" />)}{Array.from({ length: 8 }, (_, j) => <G key={"t" + j} c={4} r={j - 1} t="stone" />)}
  </Land> },
  { at: "light", n: 2, s: (g, f, len) => <Street cam={{ x: gx(4) + 100, y: GY - 200, z: 1.9 + g * 0.004 }} f={f} tod="night" dark={0.4}>
    <Torch x={gx(4) + 100} y={GY} f={f} s={1.4} />
  </Street> },
  { at: "problem", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.9, -250), M(4, 2.3, -260))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr={g > 25 ? "shock" : "neutral"} open={0.6} holdR={{ node: <Item t="bill" />, rot: 10 }} pose={{ armR: [120, 10] }} />
    {g > 25 ? [0, 1, 2].map((i) => <rect key={i} x={gx(4) + 220 + i * 40} y={GY - 300 + (g - 25) * (6 + i * 3)} width={60} height={60} fill="#7ac87a" stroke={INK} strokeWidth={5} transform={`rotate(${(g - 25) * (4 + i)} ${gx(4) + 250 + i * 40} ${GY - 270 + (g - 25) * (6 + i * 3)})`} />) : null}
  </Street> },
], { id: 2 });
export { BANKER };
