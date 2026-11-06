// Часть 4/7: крафт вместо заводов, карманы на две тысячи блоков, стройка за вечер, короткие дни.
import React from "react";
import { B, Bean, Blk, BlockCar, Cam, Frame, G, GY, Glow, HERO2D, HS, INK, Item, LOOKS, Layer, Tower, Tree, Voice, camLerp, gx, gy, ip, makePart, walkPose, Cloud, Backdrop, Tod, YEL, Shade } from "./kit";
import { Land, Street } from "./scenes";
import { VOICE } from "./voices/p4";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;

// верстак сверху: сетка 3×3, предметы появляются по одному, справа — результат
const RECIPE: (null | "plank" | "stick")[] = ["plank", "plank", "plank", null, "stick", null, null, "stick", null];
const CraftGrid: React.FC<{ g: number; f: number; glow?: boolean; result?: any }> = ({ g, f, glow, result = "pick" }) => {
  const order = [0, 1, 2, 4, 7];
  const shown = (i: number) => g > order.indexOf(i) * 5 + 2;
  const done = g > 30;
  return (
    <Frame tod="dawn">
      <rect width={1920} height={1080} fill="#b8804a" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={0} y={i * 90} width={1920} height={6} fill="#8a5428" />)}
      <rect x={440} y={170} width={740} height={740} rx={20} fill="#6a3a1a" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => <g key={i}>
        <rect x={470 + (i % 3) * 230} y={200 + Math.floor(i / 3) * 230} width={210} height={210} rx={10} fill="#8a6a5a" stroke={INK} strokeWidth={6} />
        {RECIPE[i] && shown(i) ? <Item t={RECIPE[i]!} x={575 + (i % 3) * 230} y={305 + Math.floor(i / 3) * 230} s={1.5} /> : null}
      </g>)}
      {glow ? <Glow x={810} y={540} r={600} g="gY" o={0.5 + 0.2 * Math.sin(f * 0.2)} /> : null}
      <path d="M 1230 540 h 130 m -40 -40 l 40 40 l -40 40" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={1400} y={420} width={240} height={240} rx={14} fill="#8a6a5a" stroke={INK} strokeWidth={8} />
      {done ? <><Glow x={1520} y={540} r={300} g="gY" /><Item t={result} x={1520} y={560} s={1.7 * Math.min(1, (g - 30) / 6)} f={f} /></> : null}
    </Frame>
  );
};
const Factory: React.FC<{ cam: Cam; f: number; on?: boolean; children?: React.ReactNode }> = ({ cam, f, on, children }) => (
  <Street cam={cam} f={f} tod="day" cars={false} trees={false}>
    {Array.from({ length: 18 }, (_, i) => <G key={i} c={2 + (i % 6)} r={Math.floor(i / 6)} t="brick" />)}
    {[3, 6].map((c) => [3, 4, 5].map((r) => <G key={c + "_" + r} c={c} r={r} t="brick" col="#a8403a" />))}
    {on ? [3, 6].map((c) => [0, 1, 2].map((k) => <circle key={c + "_" + k} cx={gx(c) + B / 2 + Math.sin(f * 0.1 + k) * 30} cy={gy(6) - 40 - ((f * 3 + k * 80) % 240)} r={50 + ((f * 3 + k * 80) % 240) / 5} fill="#b8b4d0" stroke={INK} strokeWidth={5} />)) : null}
    <rect x={gx(4)} y={gy(1)} width={B * 2} height={B * 2} fill={on ? "#ffd23c" : "#1a1428"} stroke={INK} strokeWidth={5} />
    {!on ? [0, 1].map((k) => <rect key={k} x={gx(4) - 20} y={gy(1) + 100 + k * 160} width={B * 2 + 40} height={36} fill="#a86a3a" stroke={INK} strokeWidth={5} transform={`rotate(${k ? -8 : 8} ${gx(5)} ${gy(1) + 118 + k * 160})`} />) : null}
    {children}
  </Street>
);
const Cart: React.FC<{ x: number; f: number }> = ({ x, f }) => (
  <g transform={`translate(${x} ${GY})`}>
    <Bean x={0} y={-90} s={HS} look={HERO2D} f={f} expr="laugh" open={0.5} pose={{ armL: [150, 20], armR: [150, 20] }} />
    <rect x={-150} y={-230} width={300} height={170} fill="#8a86a8" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-230} width={300} height={30} fill="#6a6688" stroke={INK} strokeWidth={6} />
    {[-90, 90].map((k) => <rect key={k} x={k - 34} y={-70} width={68} height={68} fill="#2a2440" stroke={INK} strokeWidth={6} />)}
  </g>
);
const Rails: React.FC<{ n: number; c0: number }> = ({ n, c0 }) => <g>{Array.from({ length: n }, (_, i) => <g key={i}><rect x={gx(c0 + i)} y={GY - 16} width={B} height={14} fill="#b8b4d0" stroke={INK} strokeWidth={4} />{[0.2, 0.6].map((q) => <rect key={q} x={gx(c0 + i) + B * q} y={GY - 24} width={40} height={24} fill="#a86a3a" stroke={INK} strokeWidth={4} />)}</g>)}</g>;
// большой рюкзак: в него влетают блоки
const Pack: React.FC<{ x: number; y: number; n: number; g: number; types?: any[] }> = ({ x, y, n, g, types = ["stone", "planks", "brick", "dirt", "glass", "gold"] }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const t = ((g * 2 + i * 7) % 30) / 30;
    const sx = x + 700 - i * 90, sy = y - 500 + (i % 3) * 120;
    return <Blk key={i} x={sx + (x - sx) * t - 40 * (1 - t)} y={sy + (y - sy) * t - 40 * (1 - t)} s={80 * (1 - t * 0.7)} t={types[i % types.length]} />;
  })}</g>
);
const Castle: React.FC<{ p: number; c0: number }> = ({ p, c0 }) => {
  const cells: [number, number, any][] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) {
    const tower = c < 2 || c > 6;
    if (r < 4 || tower) cells.push([c, r, r === 1 && (c === 4) ? "planks" : "stone"]);
    if (r === 4 && !tower && c % 2 === 0) cells.push([c, r, "stone"]);
  }
  [0, 2, 7, 8].forEach((c) => [6].forEach((r) => (c % 2 === 0 ? cells.push([c, r, "stone"]) : null)));
  return <g>{cells.map(([c, r, t], i) => (i < p * cells.length ? <G key={i} c={c0 + c} r={r} t={t} /> : null))}</g>;
};
const Ship: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${GY}) rotate(-6)`}>
    <path d="M -420 -200 H 420 L 320 0 H -320 Z" fill="#a86a3a" stroke={INK} strokeWidth={6} />
    {[-120, -40].map((y) => <path key={y} d={`M -400 ${y} H 380`} stroke="#8a5428" strokeWidth={6} />)}
    <rect x={-12} y={-700} width={24} height={500} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
    <path d="M 12 -660 L 280 -420 L 12 -420 Z" fill="#f4f6ff" stroke={INK} strokeWidth={6} />
  </g>
);

// небо с быстро бегущим солнцем: t 0..1 — от рассвета до ночи
const FastSky: React.FC<{ t: number; f: number; cam: Cam; children?: React.ReactNode }> = ({ t, f, cam, children }) => {
  const tod: Tod = t < 0.25 ? "dawn" : t < 0.6 ? "day" : t < 0.85 ? "dusk" : "night";
  const a = Math.PI * (1 - t);
  return (
    <Frame tod={tod}>
      <Backdrop cam={cam} tod={tod} f={f * 6} sun={[1600 + Math.cos(a) * 1000, 850 - Math.sin(a) * 800]} city={false} />
      <Layer cam={cam} d={1}>{children}</Layer>
    </Frame>
  );
};

export const P4 = makePart(V, [
  { at: "", s: (g, f) => <CraftGrid g={g} f={f} /> },
  { at: "factory", s: (g, f, len) => <Factory cam={camLerp(g, len, M(5, 0.75, -550), M(5, 0.85, -520))} f={f} on={g < 10} /> },
  { at: "workers", s: (g, f, len) => <Factory cam={camLerp(g, len, M(4, 1.2, -300), M(3, 1.2, -300))} f={f}>
    {[0, 1, 2].map((i) => <Bean key={i} x={gx(4) - g * 9 - i * 220} y={GY} s={HS} look={{ ...LOOKS[i], hat: "beanie", hatC: "#ffd23c", hatC2: "#ffd23c" }} f={f + i * 6} flip expr="sad" pose={walkPose(f + i * 6)} />)}
  </Factory> },
  { at: "machines", s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f} tod="dawn">
    {[[760, 520, 180, 1], [1080, 440, 130, -1], [1060, 720, 110, 1]].map(([x, y, r, d], i) => <g key={i} transform={`rotate(${d * Math.max(0, 20 - g) * f * 0.3} ${x} ${y})`}>
      {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x - r * 0.2} y={y - r - 30} width={r * 0.4} height={r * 0.5} fill="#8a86a8" stroke={INK} strokeWidth={6} transform={`rotate(${k * 45} ${x} ${y})`} />)}
      <circle cx={x} cy={y} r={r} fill="#8a86a8" stroke={INK} strokeWidth={7} /><circle cx={x} cy={y} r={r * 0.3} fill="#4a4468" stroke={INK} strokeWidth={6} /></g>)}
  </Land> },
  { at: "Just", s: (g, f) => <CraftGrid g={60} f={f} glow /> },
  { at: "Furniture", s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f} tod="dawn">
    <Glow x={960} y={540} r={700} g="gY" o={0.4} />
    {(["plank", "pick", "sword", "cake"] as const).map((t, i) => {
      const k = ip(g, [i * 9, i * 9 + 6], [0, 1], (x) => 1 - Math.pow(1 - x, 3));
      return <g key={t} transform={`translate(${420 + i * 360} 560) scale(${k * 2})`}>{t === "plank" ? <g><rect x={-60} y={-40} width={120} height={20} fill="#c88a4a" stroke={INK} strokeWidth={6} /><rect x={-60} y={-110} width={20} height={150} fill="#c88a4a" stroke={INK} strokeWidth={6} /><rect x={-50} y={-20} width={16} height={60} fill="#8a5428" /><rect x={34} y={-20} width={16} height={60} fill="#8a5428" stroke={INK} strokeWidth={4} /></g> : <Item t={t} />}</g>;
    })}
  </Land> },
  { at: "know", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -260), M(4, 2.3, -280))} f={f}>
    <G c={5} r={0} t="table" />
    <Hero x={gx(4) + 60} f={f} expr="smirk" holdR={{ node: <Item t="pick" />, rot: -30 }} pose={{ armR: [130, -10], tilt: 6 }} />
  </Street> },
  { at: "Car", n: 1, s: (g, f, len) => <Factory cam={camLerp(g, len, M(4, 0.8, -500), M(5, 0.9, -480))} f={f}><BlockCar x={gx(9)} col="#8a86a8" /></Factory> },
  { at: "Why", s: (g, f, len) => {
    const n = Math.min(14, 2 + Math.floor(g / 3));
    return <Land cam={{ x: gx(-2) + Math.min(g, 60) * 18 + 300, y: GY - 300, z: 1.0 }} f={f}>
      {Array.from({ length: 30 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
      <Rails n={n} c0={-4} /><Cart x={gx(-3) + Math.min(g, 60) * 18 + 200} f={f} />
    </Land>;
  } },
  { at: "pocket", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.3, -230), M(4, 2.6, -220))} f={f}>
    <Hero x={gx(4) + B / 2} f={f} expr="smirk" pose={{ armR: [20, 20], armL: [20, 20], tilt: Math.sin(f * 0.2) * 5 }} />
  </Street> },
  { at: "carry", n: 1, s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.3, -350), M(4, 1.2, -380))} f={f}>
    <Pack x={gx(4) + B / 2} y={GY - 250} n={10} g={g} /><Hero x={gx(4) + B / 2} f={f} expr="grin" pose={{ armL: [30, 30], armR: [30, 30] }} />
  </Street> },
  { at: "house", n: 1, s: (g, f, len) => {
    const left = Math.max(0, 12 - Math.floor(g / 3));
    return <Street cam={camLerp(g, len, M(5, 0.9, -450), M(5, 0.95, -440))} f={f} cars={false} trees={false}>
      {Array.from({ length: 12 }, (_, i) => (i < left ? <G key={i} c={6 + (i % 4)} r={Math.floor(i / 4)} t={i >= 8 ? "brick" : "planks"} /> : null))}
      <Pack x={gx(3) + B / 2} y={GY - 250} n={left > 0 ? 4 : 0} g={g} types={["planks", "brick"]} />
      <Hero x={gx(3) + B / 2} f={f} expr="laugh" open={0.4} pose={{ armR: [80, 0] }} />
    </Street>;
  } },
  { at: "Trucks", s: (g, f, len) => <Street cam={camLerp(g, len, M(9, 1.1, -350), M(9.5, 1.2, -340))} f={f} cars={false} tod="day">
    <g transform={`translate(${gx(10)} 0)`}><rect x={-220} y={GY - 420} width={360} height={320} fill="#f4f6ff" stroke={INK} strokeWidth={6} /><BlockCar x={0} col="#3a56c0" /></g>
    {[0, 1, 2].map((i) => <circle key={i} cx={gx(9) + i * 70} cy={GY - 500 - Math.abs(Math.sin(f * 0.1 + i)) * 40} r={0} />)}
  </Street> },
  { at: "Ships", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.8, -400), M(4, 0.9, -380))} f={f} tod="dawn">
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="sand" />)}<Ship x={gx(4) + 100} />
  </Land> },
  { at: "Delivery", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -250), M(4, 2.2, -260))} f={f}>
    <Bean x={gx(4) + B / 2} y={GY} s={HS} look={{ ...LOOKS[1], body: "#a86a3a", body2: "#7a4a2a", hat: "beanie", hatC: "#7a4a2a", hatC2: "#ffd23c" }} f={f} expr="sad" holdR={{ node: <rect x={-60} y={-130} width={120} height={110} fill="#c88a4a" stroke={INK} strokeWidth={6} />, rot: 0 }} pose={{ armR: [100, 0], tilt: -8 }} />
  </Street> },
  { at: "moving", s: (g, f, len) => {
    const n = Math.min(12, Math.floor(g / 2));
    return <Street cam={camLerp(g, len, M(6, 0.95, -440), M(6, 1.0, -430))} f={f} cars={false} trees={false}>
      {Array.from({ length: n }, (_, i) => <G key={i} c={6 + (i % 4)} r={Math.floor(i / 4)} t={i >= 8 ? "brick" : "planks"} />)}
      <Hero x={gx(4) + 60} f={f} expr="grin" pose={{ armR: [110, -10] }} />
    </Street>;
  } },
  { at: "forest", s: (g, f, len) => <Land cam={{ x: gx(0) + g * 6, y: GY - 450, z: 1.1 }} f={f}>
    {Array.from({ length: 30 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
    <g transform={`translate(${gx(0) + g * 6} ${GY - 330}) scale(0.3) translate(${-gx(1)} ${-GY})`}>{[-1, 1, 3].map((c, i) => <Tree key={i} c={c} h={3} />)}</g>
    <Hero x={gx(0) + g * 6} f={f} expr="grin" pose={walkPose(f)} />
  </Land> },
  { at: "Builders", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.1, -350), M(4, 1.3, -330))} f={f} tod="dusk">
    <path d={`M ${gx(4) + 100} ${GY - 1400} L ${gx(3)} ${GY} L ${gx(6)} ${GY} Z`} fill="#fff2c0" opacity={0.25} />
    {[0, 1, 2, 3].map((c) => <G key={c} c={3 + c} r={0} t="gold" />)}
    <Bean x={gx(4) + B} y={gy(0)} s={HS} look={LOOKS[5]} f={f} expr="laugh" open={0.5} holdR={{ node: <Item t="pick" />, rot: -30 }} pose={{ armR: [160, -10], armL: [150, 20] }} />
    {[0, 1, 2, 3, 4, 5].map((i) => <Bean key={i} x={gx(-1 + i * 1.3) + (i > 2 ? 900 : 0)} y={GY + 30} s={HS} look={LOOKS[i % 7]} f={f + i * 5} expr="laugh" open={0.4} pose={{ armL: [150 + Math.sin(f * 0.4 + i) * 15, 20], armR: [150 + Math.sin(f * 0.4 + i + 1) * 15, 20] }} />)}
  </Street> },
  { at: "team", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.65, -550), M(4, 0.7, -540))} f={f} tod="dusk">
    {Array.from({ length: 30 }, (_, i) => <G key={i} c={-8 + i} r={-1} t="grass" />)}
    <Castle p={ip(g, [0, len - 10], [0.05, 1], (t) => t)} c0={0} />
    {[-2, 10, 11].map((c, i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={LOOKS[i + 2]} f={f} expr="grin" holdR={{ node: <Item t="pick" />, rot: -40 }} pose={{ armR: [120 - Math.max(0, Math.sin(f * 0.5 + i)) * 70, -20] }} />)}
  </Land> },
  { at: "Kids", s: (g, f, len) => {
    const a = Math.min(12, Math.floor(g / 3)), b = Math.min(12, Math.floor(g / 3.2) + 1);
    return <Land cam={camLerp(g, len, M(4, 0.7, -700), M(4, 0.55, -1100))} f={f}>
      {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
      {Array.from({ length: a }, (_, i) => <G key={"a" + i} c={2} r={i} t="planks" />)}{Array.from({ length: b }, (_, i) => <G key={"b" + i} c={6} r={i} t="brick" />)}
      <Bean x={gx(2) + B / 2} y={gy(a - 1)} s={HS * 0.8} look={LOOKS[4]} f={f} expr="laugh" open={0.4} pose={{ armL: [150, 20] }} />
      <Bean x={gx(6) + B / 2} y={gy(b - 1)} s={HS * 0.8} look={LOOKS[6]} f={f} expr="grin" pose={{ armR: [150, 20] }} />
    </Land>;
  } },
  { at: "Cities", s: (g, f, len) => {
    const h = ip(g, [0, len], [2, 9]);
    return <Street cam={camLerp(g, len, { x: 1600, y: 300, z: 0.55 }, { x: 1600, y: -200, z: 0.5 })} f={f} cars={false} tod="day">
      {[[-6, 3, "glass"], [-1, 2, "gold"], [4, 3, "glass"], [10, 2, "stone"], [15, 3, "glass"], [20, 2, "gold"]].map(([c, w, t], i) => Array.from({ length: (w as number) * Math.floor(h + (i % 3)) }, (_, k) => <G key={i + "_" + k} c={(c as number) + (k % (w as number))} r={Math.floor(k / (w as number))} t={t as any} />))}
    </Street>;
  } },
  { at: "sun", n: 1, s: (g, f, len) => <FastSky t={ip(g, [0, len], [0.2, 0.5], (x) => x)} f={f} cam={{ x: 1300, y: 450, z: 0.8 }}>
    {Array.from({ length: 30 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<Hero x={gx(5)} f={f} expr="shock" open={0.4} pose={{ tilt: -15 }} />
  </FastSky> },
  { at: "full", s: (g, f, len) => <FastSky t={ip(g, [0, len], [0.5, 1], (x) => x)} f={f} cam={{ x: 1300, y: 450, z: 0.8 }}>
    {Array.from({ length: 30 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<Hero x={gx(5)} f={f} expr="shock" open={0.6} pose={{ tilt: 15 }} />
  </FastSky> },
  { at: "goes", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.0, -350), M(6, 1.4, -330))} f={f} tod="night" dark={0.5}>
    {[[7, 0.5], [12, 0.7]].map(([c, o], i) => <g key={i} opacity={ip(g, [10 + i * 10, 25 + i * 10], [0, o])}><Shade x={gx(c)} f={f} s={0.9} /></g>)}
    <Hero x={gx(4)} f={f} expr="shock" open={0.6} sweat pose={{ armL: [30, 40], armR: [30, 40], lean: -6 }} />
  </Street> },
], { id: 4 });
export { Tower, Cloud, YEL };
