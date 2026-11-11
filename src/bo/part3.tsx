// Часть 3/10: дни 4–5 — супермаркет, тележка с едой, своя база.
import React from "react";
import { Bean, Cam, Frame, HERO2D, SoundRings, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, Can, Cart, Flashlight, GY, Grocery, HS, Hero, INK, Mattress, Rooftop, Store, StoreFront, Street, Svg, Skyline, Torch, walk, walkDx, ChalkHero, chalkCam } from "./scenes";
import { VOICE } from "./voices/p3";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const sx = (wx: number, cam: Cam) => 960 + (wx - cam.x) * cam.z;
const sy = (wy: number, cam: Cam) => 540 + (wy - cam.y) * cam.z;
// рука «от первого лица», тянется снизу справа
const PovArm: React.FC<{ x: number; y: number; rot?: number; children?: React.ReactNode }> = ({ x, y, rot = -35, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={0} y={-70} width={800} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} />
    <rect x={-10} y={-80} width={60} height={160} rx={20} fill="#c8561a" stroke={INK} strokeWidth={9} />
    <ellipse cx={-70} cy={0} rx={80} ry={66} fill="#f8f6f0" stroke={INK} strokeWidth={10} />
    <g transform={`rotate(${-rot}) translate(-90 30)`}>{children}</g>
  </g>
);
const TORCH = { node: <Flashlight />, k: 1.3, rot: 0 };
// стопка консерв у стены: n штук
const CanWall: React.FC<{ x: number; n: number }> = ({ x, n }) => <g>{Array.from({ length: n }, (_, i) => <Can key={i} x={x + (i % 10) * 48} y={GY - Math.floor(i / 10) * 58} c={["#ff6a5a", "#5ac84a", "#ffd23c", "#5a7cf0"][i % 4]} s={0.95} />)}</g>;
// база: квартира на низком этаже с матрасами, фонариками и консервами
const Base: React.FC<{ cam: Cam; f: number; cans?: number; mats?: number; lights?: number; tally?: number; children?: React.ReactNode }> = ({ cam, f, cans = 0, mats = 0, lights = 0, tally = 4, children }) => (
  <Apartment cam={cam} f={f} tally={tally}>
    <CanWall x={-560} n={cans} />
    {mats > 0 ? <Mattress x={1300} y={GY} w={460} c="#ff9ac0" /> : null}
    {mats > 1 ? <Mattress x={1300} y={GY - 50} w={430} c="#5ad8c8" /> : null}
    {Array.from({ length: lights }, (_, i) => <g key={i} transform={`translate(${880 + i * 34} ${GY - 110}) rotate(90)`}><Flashlight on={false} /></g>)}
    {children}
  </Apartment>
);

export const P3 = makePart(V, [
  // ещё ночь на крыше
  { at: "", s: (g, f, len) => <Rooftop cam={camLerp(g, len, C(960, GY - 250, 1.7), C(960, GY - 250, 1.9))} f={f} tod="night">
    <rect x={880} y={GY - 120} width={160} height={70} rx={8} fill="#5a4a9a" stroke={INK} strokeWidth={6} />
    <Bean x={960} y={GY - 50} s={HS} look={HERO2D} f={f} expr="sad" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40], tilt: -8 }} /></Rooftop> },
  // день 4: утро, идёт за едой
  { at: "four", s: (g, f, len) => <Street cam={camLerp(g, len, C(900, 600, 1.0), C(1000, 600, 1.05))} f={f}>
    <Hero x={500 + walkDx(g)} y={GY + 140} f={f} expr="determined" pose={walk(g)} /></Street> },
  { at: "supermarket", s: (g, f, len) => <Street cam={C(1200, 560, 0.95)} f={f} back={<StoreFront x={1300} />}>
    <Hero x={700 + walkDx(Math.min(g, 30))} y={GY + 140} f={f} expr="neutral" pose={g < 30 ? walk(g) : { armL: [15, 8], armR: [15, 8] }} /></Street> },
  // двери не открываются
  { at: "doors", s: (g, f, len) => <Street cam={C(1300, GY - 330, 1.7)} f={f} back={<StoreFront x={1300} />}>
    <Hero x={1300} y={GY - 200} f={f} expr={g > 25 ? "worried" : "determined"} pose={{ armL: [150, 20 + Math.sin(f * 0.5) * 6], armR: [150, 20 - Math.sin(f * 0.5) * 6] }} /></Street> },
  // протискивается в щель боком
  { at: "squeeze", s: (g, f, len) => { const gap = ip(g, [0, 20], [0, 50]);
    return <Street cam={C(1300, GY - 330, 1.7)} f={f} back={<StoreFront x={1300} gap={gap} />}>
      <g opacity={ip(g, [24, len], [1, 0.25])}><Hero x={1300} y={GY - 200} f={f} expr="worried" sweat pose={{ armL: [100, 10], armR: [100, 10], lean: 6 }} /></g></Street>; } },
  // внутри темно, фонарик
  { at: "dark", n: 1, s: (g, f, len) => { const cam = C(400, 560, 1.0); return <><Store cam={cam} f={f} dark={0.1}>
    <Hero x={400 + walkDx(g, 0.16)} y={GY + 40} f={f} expr="worried" pose={{ ...walk(g, 0.16), armR: [80, 10] }} holdR={TORCH} /></Store>
    <Torch cx={sx(700 + walkDx(g, 0.16), cam)} cy={sy(GY - 300, cam)} r={300} /></>; } },
  { at: "smells", s: (g, f, len) => { const cam = C(400, GY - 260, 2.2); return <><Store cam={cam} f={f} kind="freezer" dark={0.1}>
    <Hero x={400} y={GY + 40} f={f} expr="scared" pose={{ armR: [80, 10], armL: [150, 80], tilt: -10, lean: -6 }} holdR={TORCH} /></Store>
    <Torch cx={960} cy={480} r={420} o={0.6} /></>; } },
  // морозильный ряд: лужи
  { at: "freezer", s: (g, f, len) => { const cam = camLerp(g, len, C(0, 600, 0.85), C(800, 600, 0.85)); return <><Store cam={cam} f={f} kind="freezer" dark={0.1} />
    <Torch cx={ip(g, [0, len], [700, 1300])} cy={620} r={380} /></>; } },
  // закрывает нос футболкой и идёт дальше
  { at: "cover", s: (g, f, len) => { const cam = C(600 + walkDx(g, 0.16) * 0.8, 560, 1.3); return <><Store cam={cam} f={f} kind="freezer" dark={0.1}>
    <Hero x={500 + walkDx(g, 0.16)} y={GY + 40} f={f} expr="determined" pose={{ ...walk(g, 0.16), armL: [160, 30], armR: [80, 10] }} holdR={TORCH} />
    <rect x={500 + walkDx(g, 0.16) - 44} y={GY - 254} width={88} height={40} rx={18} fill="#f27a2a" stroke={INK} strokeWidth={6} /></Store>
    <Torch cx={sx(790 + walkDx(g, 0.16), cam)} cy={sy(GY - 250, cam)} r={300} /></>; } },
  // полки с едой
  { at: "good", s: (g, f, len) => { const cam = camLerp(g, len, C(500, GY - 280, 1.4), C(800, GY - 280, 1.4)); return <><Store cam={cam} f={f} dark={0.05} />
    <Torch cx={ip(g, [0, len], [700, 1200])} cy={500} r={420} o={0.6} /></>; } },
  // от первого лица: берёт продукты и кладёт в тележку
  { at: "Canned", n: 1, s: (g, f, len) => { const words = ["Canned", "Rice", "Peanut", "Crackers", "Bottled"]; let k = 0; words.forEach((w, i) => { if (since(w, "Canned", g) >= 0) k = i; });
    const t = (g - Math.max(0, atWord(V, words[k]) - atWord(V, "Canned") + 3)) / 18;
    return <><Store cam={C(-100, GY - 320, 2.0)} f={f} dark={0.05}><Cart x={-120} y={GY + 40} items={k * 3} f={0} s={1.3} /></Store>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><PovArm x={ip(t, [0, 1], [1400, 1250])} y={ip(t, [0, 1], [420, 640])}><Grocery k={k} x={0} y={0} s={1.6} /></PovArm></svg>
      <Torch cx={960} cy={540} r={560} o={0.5} /></>; } },
  { at: "years", s: (g, f, len) => <Store cam={C(-100, GY - 320, 2.2)} f={f} dark={0.25}><Cart x={-120} y={GY + 40} items={18} f={0} s={1.3} /></Store> },
  { at: "treasure", s: (g, f, len) => { const cam = C(600, GY - 300, 2.0); return <><Store cam={cam} f={f} dark={0.05}>
    <Hero x={600} y={GY + 40} f={f} expr="grin" pose={{ armR: [80, 10], armL: [40, 40] }} holdR={TORCH} /></Store><Torch cx={960} cy={500} r={520} o={0.55} /></>; } },
  // толкает тележку домой (руки на ручке)
  { at: "fill", s: (g, f, len) => { const cam = C(300 + walkDx(g, 0.16) * 0.9, 560, 1.1); const x = 200 + walkDx(g, 0.16); return <><Store cam={cam} f={f} dark={0.1}>
    <Cart x={x + 330} y={GY + 40} items={18} f={g} flip />
    <Hero x={x} y={GY + 40} f={f} expr="determined" pose={{ ...walk(g, 0.16), armL: [80, 0], armR: [80, 0] }} /></Store>
    <Torch cx={sx(x + 300, cam)} cy={sy(GY - 200, cam)} r={420} o={0.5} /></>; } },
  { at: "push", s: (g, f, len) => { const x = 300 + walkDx(g, 0.16); return <Street cam={C(x + 300, 600, 1.0)} f={f}>
    <Cart x={x + 330} y={GY + 180} items={18} f={g} flip /><Hero x={x} y={GY + 180} f={f} expr="determined" pose={{ ...walk(g, 0.16), armL: [80, 0], armR: [80, 0] }} /></Street>; } },
  { at: "squeaky", s: (g, f, len) => <Frame bg="#7a58c8"><rect width={1920} height={1080} fill="#4a3a8a" /><rect y={760} width={1920} height={320} fill="#7a58c8" stroke={INK} strokeWidth={8} />
    <g transform="translate(960 760) scale(4)"><Cart x={0} y={0} items={0} f={g} /></g>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${1200 + i * 40} ${650 - i * 50} l 60 -30`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={Math.sin(f * 0.8 + i) > 0 ? 1 : 0} />)}
    <SoundRings x={1260} y={640} f={f * 2} c="#ffffff" n={2} /></Frame> },
  { at: "loudest", s: (g, f, len) => <Svg><Skyline cam={C(960, 500, 0.75)} f={f} tod="day" midBase={GY + 60} />
    <g transform="translate(0 0)"><rect x={0} y={900} width={1920} height={180} fill="#2c2a6a" /><Cart x={1003 + g * 0.8} y={1000} items={18} s={0.25} f={g} flip /><Bean x={920 + g * 0.8} y={1000} s={HS * 0.25} look={HERO2D} f={f} pose={{ ...walk(g, 0.16), armL: [80, 0], armR: [80, 0] }} /></g></Svg> },
  // день 5: база
  { at: "five", n: 1, s: (g, f, len) => <Base cam={C(900, 540, 1.0)} f={f} cans={0}>
    <Hero x={300 + walkDx(Math.min(g, 40))} y={GY} f={f} expr="neutral" gaze={1} pose={g < 40 ? walk(g) : { armL: [15, 8], armR: [15, 8] }} /></Base> },
  { at: "pick", s: (g, f, len) => <Base cam={camLerp(g, len, C(1300, 520, 1.3), C(1500, 480, 1.5))} f={f}>
    <Hero x={1350} y={GY} f={f} expr="determined" gaze={1} pose={{ tilt: 8, armL: [15, 8], armR: [40, 30] }} /></Base> },
  // тащит матрас
  { at: "drag", s: (g, f, len) => { const x = 1700 - walkDx(g, 0.14) * 0.8; return <Base cam={C(1200, 560, 1.1)} f={f} mats={g > len - 6 ? 1 : 0}>
    {g <= len - 6 ? <g transform={`rotate(20 ${x + 330} ${GY})`}><Mattress x={x + 100} y={GY} w={460} c="#ff9ac0" /></g> : null}
    <Hero x={x} y={GY} f={f} expr="tired" sweat flip pose={{ ...walk(g, 0.14), armL: [55, 0], armR: [-55, 0], lean: -6 }} /></Base>; } },
  { at: "flashlight", s: (g, f, len) => <Base cam={C(950, GY - 160, 2.4)} f={f} mats={2} lights={Math.min(5, Math.floor(g / 6) + 1)} /> },
  { at: "stack", s: (g, f, len) => <Base cam={C(-340, GY - 200, 1.6)} f={f} mats={2} lights={5} cans={Math.min(40, Math.floor(g * 1.2))}>
    <Hero x={-20} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [100, 20], armR: [15, 8] }} holdL={{ node: <Can x={0} y={30} />, k: 1 }} /></Base> },
  { at: "Batteries", s: (g, f, len) => <Frame bg="#2a2470"><rect width={1920} height={1080} fill="#3e4a96" />
    <svg><PovArm x={1250} y={640} rot={-25}>{[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${-60 + i * 40} ${-40}) rotate(${-10 + i * 7})`}><rect x={-14} y={-60} width={28} height={70} rx={6} fill="#ffd23c" stroke={INK} strokeWidth={4} /><rect x={-14} y={-60} width={28} height={22} rx={6} fill="#262838" stroke={INK} strokeWidth={4} /></g>)}</PovArm></svg>
    <rect width={1920} height={1080} fill="#0a0628" opacity={0.2} /></Frame> },
  // палочки мелом: 4 → 5
  { at: "wall", n: 2, s: (g, f, len) => <Base cam={chalkCam(4)} f={f} mats={2} lights={5} cans={40} tally={since("lines", "wall", g, 1, 2) > 0 ? 5 : 4}>
    <ChalkHero i={4} g={g} f={f} expr="determined" /></Base> },
  { at: "One", s: (g, f, len) => <Base cam={camLerp(g, Math.min(len, 20), C(-120, GY - 300, 2.2), C(300, GY - 230, 1.6))} f={f} mats={2} lights={5} cans={40} tally={5}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="tired" gaze={-1} sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40], tilt: -6 }} /></Base> },
], { id: 3, dir: "bo" });
