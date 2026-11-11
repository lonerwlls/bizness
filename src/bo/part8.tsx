// Часть 8/10: дни 19–23 — пожар от молнии, порез, тёмная больница, жар.
import React from "react";
import { Bean, BeanLook, Cam, Frame, Glow, HERO2D, LOOKS, Layer, Voice, atWord, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, Flashlight, GY, HS, Hero, INK, Rooftop, Store, Street, Svg, Torch, YEL, walk, walkDx, ChalkHero, chalkCam } from "./scenes";
import { VOICE } from "./voices/p8";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const sx = (wx: number, cam: Cam) => 960 + (wx - cam.x) * cam.z;
const sy = (wy: number, cam: Cam) => 540 + (wy - cam.y) * cam.z;
const TORCH = { node: <Flashlight />, k: 1.3, rot: 0 };
// огонь на крыше дома
const RoofFire: React.FC<{ x: number; y: number; w: number; f: number; k?: number }> = ({ x, y, w, f, k = 1 }) => k <= 0 ? null : (
  <g>
    <Glow x={x} y={y - 60} r={w * 1.3} g="gO" o={0.9 * k} />
    {Array.from({ length: Math.max(2, Math.round(w / 50)) }, (_, i) => { const dx = x - w / 2 + 25 + i * 50, h = (90 + (i % 3) * 40) * k * (1 + 0.18 * Math.sin(f * 0.5 + i * 1.7));
      return <path key={i} d={`M ${dx - 34} ${y} Q ${dx - 36} ${y - h * 0.5} ${dx + Math.sin(f * 0.3 + i) * 12} ${y - h} Q ${dx + 36} ${y - h * 0.5} ${dx + 34} ${y} Z`} fill={["#ff4a3a", "#ff8a3a", YEL][i % 3]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />; })}
  </g>
);
// ряд домов (свои, чтобы знать, где крыши): fire — сколько домов горит (дробное — разгорается)
const BL = [[-300, 420, 560], [180, 380, 420], [620, 420, 640], [1100, 380, 480], [1540, 420, 600], [2020, 380, 450], [2460, 420, 560]];
const Block: React.FC<{ f: number; fire: number; burnt?: number; strike?: boolean }> = ({ f, fire, burnt = 0, strike }) => (
  <g>
    {BL.map(([x, w, h], i) => { const top = GY - 40 - h, b = burnt > 0 && i >= 2 && i <= 4;
      return <g key={i}>
        {b ? <path d={`M ${x} ${GY - 40} L ${x} ${top + 140} L ${x + w * 0.3} ${top + 60} L ${x + w * 0.5} ${top + 200} L ${x + w * 0.8} ${top + 110} L ${x + w} ${top + 170} L ${x + w} ${GY - 40} Z`} fill="#2a2238" stroke={INK} strokeWidth={6} />
          : <rect x={x} y={top} width={w} height={h} fill={["#4a3a8a", "#5a4aa8", "#3e3478"][i % 3]} stroke={INK} strokeWidth={6} />}
        {!b ? Array.from({ length: Math.floor(h / 90) * 3 }, (_, k) => <rect key={k} x={x + 40 + (k % 3) * (w - 80) / 3} y={top + 30 + Math.floor(k / 3) * 90} width={44} height={56} rx={3} fill={fire > 0 && Math.abs(i - 3) < fire ? "#ff9a3a" : "#231a52"} stroke={INK} strokeWidth={4} />) : null}
        {!b && Math.abs(i - 3) < fire ? <RoofFire x={x + w / 2} y={top} w={w} f={f + i * 5} k={Math.min(1, fire - Math.abs(i - 3))} /> : null}
      </g>; })}
    {strike ? <g><path d={`M ${1290} -600 L ${1240} ${GY - 700} L ${1300} ${GY - 690} L ${1260} ${GY - 460}`} stroke="#fff8d0" strokeWidth={18} fill="none" strokeLinejoin="round" /><Glow x={1260} y={GY - 460} r={300} g="gW" /></g> : null}
  </g>
);
const Rain: React.FC<{ f: number }> = ({ f }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{Array.from({ length: 100 }, (_, i) => { const x = (i * 211 + f * 7) % 2100 - 100, y = (i * 137 + f * 48) % 1200 - 100; return <path key={i} d={`M ${x} ${y} l -12 44`} stroke="#bfd8ff" strokeWidth={4} opacity={0.5} strokeLinecap="round" />; })}</svg>;
const NightView: React.FC<{ cam: Cam; f: number; fire: number; burnt?: number; strike?: boolean; tod?: "night" | "dawn"; smoke?: boolean }> = ({ cam, f, fire, burnt, strike, tod = "night", smoke }) => (
  <Svg>
    <Layer cam={cam} d={0.05}><rect x={-3000} y={-2500} width={9000} height={4000} fill={`url(#bo-${tod})`} /></Layer>
    <Layer cam={cam} d={1}><Block f={f} fire={fire} burnt={burnt} strike={strike} />
      {smoke ? <g style={{ filter: "blur(5px)" }}>{Array.from({ length: 8 }, (_, i) => { const t = ((f * 0.4 + i * 12) % 100) / 100; return <circle key={i} cx={800 + (i % 3) * 300 + t * 100} cy={GY - 300 - t * 600} r={60 + t * 100} fill="#6a6088" opacity={0.6 * (1 - t)} />; })}</g> : null}
      <rect x={-3000} y={GY - 40} width={9000} height={900} fill="#2c2a6a" stroke={INK} strokeWidth={6} />
    </Layer>
  </Svg>
);
// рука «от первого лица»
const PovHand: React.FC<{ x: number; y: number; rot?: number; cut?: number; wrap?: number }> = ({ x, y, rot = 0, cut = 0, wrap = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={0} y={-70} width={800} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} />
    <ellipse cx={-70} cy={0} rx={90} ry={74} fill="#f8f6f0" stroke={INK} strokeWidth={10} />
    {cut > 0 ? <path d="M -120 -10 L -30 20" stroke="#d83a4a" strokeWidth={10} strokeLinecap="round" opacity={cut} /> : null}
    {wrap > 0 ? <g opacity={wrap}><rect x={-150} y={-40} width={150} height={80} rx={20} fill="#f4f2ff" stroke={INK} strokeWidth={6} />{[-110, -70, -30].map((k) => <path key={k} d={`M ${k} -40 L ${k + 20} 40`} stroke="#c8c4e0" strokeWidth={5} />)}</g> : null}
  </g>
);
// больница: коридор с дверями-палатами, койками и табличками
const Hospital: React.FC<{ cam: Cam; children?: React.ReactNode }> = ({ cam, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-800} width={8000} height={GY + 800} fill="#5a7a9a" />
      <rect x={-2000} y={GY - 300} width={8000} height={300} fill="#4a6a8a" stroke={INK} strokeWidth={5} />
      <rect x={-2000} y={GY - 310} width={8000} height={20} fill="#8ae8dc" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => { const x = -800 + i * 900; return <g key={i}>
        <rect x={x - 10} y={GY - 600} width={320} height={600} fill="#e8e4ff" stroke={INK} strokeWidth={7} />
        <rect x={x + 10} y={GY - 580} width={280} height={580} fill="#1a2238" stroke={INK} strokeWidth={5} />
        <g transform={`translate(${x + 150} ${GY})`}><rect x={-120} y={-150} width={240} height={50} rx={10} fill="#f4f2ff" stroke={INK} strokeWidth={5} /><rect x={-120} y={-170} width={60} height={30} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />{[-100, 100].map((k) => <path key={k} d={`M ${k} -100 L ${k} 0`} stroke="#8a86a8" strokeWidth={8} />)}</g>
        <g transform={`translate(${x + 450} ${GY - 420})`}><rect x={-50} y={-70} width={100} height={130} fill="#fff8ec" stroke={INK} strokeWidth={5} /><rect x={-30} y={-84} width={60} height={20} rx={4} fill="#8a86a8" stroke={INK} strokeWidth={4} />{[0, 1, 2, 3].map((r) => <path key={r} d={`M -32 ${-40 + r * 22} L ${28 - (r % 2) * 20} ${-40 + r * 22}`} stroke="#8aa8c8" strokeWidth={5} />)}<path d="M -30 46 L -10 30 L 10 50 L 30 20" stroke="#d83a4a" strokeWidth={4} fill="none" /></g>
        <g transform={`translate(${x + 650} ${GY - 600})`}><rect x={-30} y={0} width={60} height={20} fill="#3a3a5a" /><path d="M -20 -10 L 20 -10" stroke="#8a86a8" strokeWidth={6} /></g>
      </g>; })}
      <rect x={-2000} y={GY} width={8000} height={700} fill="#8aa8b8" stroke={INK} strokeWidth={8} />
      {children}
    </Layer>
  </Svg>
);
const Pharmacy: React.FC<{ cam: Cam; children?: React.ReactNode }> = ({ cam, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-800} width={8000} height={GY + 800} fill="#5a7a9a" />
      {[0, 1, 2].map((s) => <g key={s}><rect x={200 + s * 520} y={GY - 560} width={480} height={560} fill="#e8e4ff" stroke={INK} strokeWidth={7} />
        {[0, 1, 2, 3].map((r) => <g key={r}><rect x={215 + s * 520} y={GY - 130 - r * 120} width={450} height={14} fill="#8a86a8" stroke={INK} strokeWidth={3} />
          {Array.from({ length: 7 }, (_, k) => <rect key={k} x={230 + s * 520 + k * 62} y={GY - 196 - r * 120} width={44} height={62} rx={6} fill={["#ff9ac0", "#9fdcff", "#f4f2ff", "#ffd27a"][(k + r + s) % 4]} stroke={INK} strokeWidth={3} />)}</g>)}</g>)}
      <g transform={`translate(860 ${GY - 640})`}><rect x={-60} y={-60} width={120} height={120} rx={20} fill="#fff" stroke={INK} strokeWidth={6} /><path d="M -14 -40 L 14 -40 L 14 -14 L 40 -14 L 40 14 L 14 14 L 14 40 L -14 40 L -14 14 L -40 14 L -40 -14 L -14 -14 Z" fill="#5ac84a" stroke={INK} strokeWidth={4} /></g>
      <rect x={-2000} y={GY} width={8000} height={700} fill="#8aa8b8" stroke={INK} strokeWidth={8} />
      {children}
    </Layer>
  </Svg>
);
// лица мелом (как в части 7); friends — сколько стали «цветными», похожими на друзей
const FACES = [[-980, GY - 300, 70], [-800, GY - 320, 60], [-620, GY - 300, 70], [-450, GY - 315, 60], [-290, GY - 305, 65]];
const Faces: React.FC<{ friends?: number; f: number }> = ({ friends = 0, f }) => (
  <g>{FACES.map(([x, y, r], i) => { const k = Math.max(0, Math.min(1, friends - i)), L: BeanLook = LOOKS[i];
    return <g key={i}>
      {k > 0 ? <g opacity={k} transform={`translate(${x} ${y + r}) scale(${r / 92}) translate(0 ${-86 + Math.sin(f * 0.1 + i) * 3})`}><ellipse cx={0} cy={0} rx={92} ry={86} fill={L.head} stroke={INK} strokeWidth={7} />{L.hair ? <path d="M -90 -18 Q -96 -96 0 -98 Q 96 -96 90 -18 Q 40 -60 -90 -18 Z" fill={L.hair} stroke={INK} strokeWidth={7} /> : null}<circle cx={-30} cy={-4} r={9} fill={INK} /><circle cx={30} cy={-4} r={9} fill={INK} /><path d="M -30 30 Q 0 54 30 30" stroke={INK} strokeWidth={7} fill="none" /></g> : null}
      <g opacity={1 - k} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round"><circle cx={x} cy={y} r={r} /><circle cx={x - r * 0.35} cy={y - r * 0.2} r={6} fill="#fff" /><circle cx={x + r * 0.35} cy={y - r * 0.2} r={6} fill="#fff" /><path d={`M ${x - r * 0.45} ${y + r * 0.2} Q ${x} ${y + r * 0.65} ${x + r * 0.45} ${y + r * 0.2}`} /></g>
    </g>; })}</g>
);
// лежит больной на матрасе на полу у стены с лицами
const SickBed: React.FC<{ f: number; expr?: any; gaze?: number }> = ({ f, expr = "tired", gaze = -1 }) => (
  <g>
    {/* матрас на полу: верх на GY - 44; тело лежит на нём целиком под одеялом (как в кровати) */}
    <rect x={-620} y={GY - 44} width={580} height={44} rx={16} fill="#5ad8c8" stroke={INK} strokeWidth={6} />
    <rect x={-608} y={GY - 76} width={150} height={44} rx={20} fill="#ffffff" stroke={INK} strokeWidth={6} />
    <Bean x={-242} y={GY - 121} s={HS} look={HERO2D} f={f} expr={expr} gaze={gaze} sweat lying shadow={false} pose={{ bob: Math.sin(f * 0.15) * 2, armL: [2, 0], armR: [2, 0] }} />
    <path d={`M -470 ${GY - 40} Q -474 ${GY - 126 + Math.sin(f * 0.15) * 3} -400 ${GY - 130 + Math.sin(f * 0.15) * 3} L -80 ${GY - 104} Q -24 ${GY - 94} -30 ${GY - 40} Z`} fill="#ff9ac0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M -400 ${GY - 96} Q -260 ${GY - 86} -110 ${GY - 78}`} stroke="#d87aa0" strokeWidth={6} fill="none" />
    <g transform={`translate(30 ${GY})`}><rect x={-22} y={-110} width={44} height={110} rx={12} fill="#9fdcff" fillOpacity={0.7} stroke={INK} strokeWidth={5} /><rect x={-10} y={-130} width={20} height={22} fill="#5a7cf0" stroke={INK} strokeWidth={4} /></g>
  </g>
);
const Heat: React.FC<{ f: number }> = ({ f }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#ff6a5a" opacity={0.08 + 0.05 * Math.sin(f * 0.1)} /></svg>;

export const P8 = makePart(V, [
  // день 19: гроза
  { at: "", s: (g, f, len) => <Apartment cam={chalkCam(18)} f={f} tally={g > 18 ? 19 : 18} tod="night" dark={0.45}>
    <ChalkHero i={18} g={g} f={f} expr="worried" /></Apartment> },
  { at: "storm", s: (g, f, len) => <><NightView cam={C(1100, 400, 0.75)} f={f} fire={0} strike={since("hits", "storm", g) > 0 && since("hits", "storm", g) < 6} /><Rain f={f} />
    {since("hits", "storm", g) > 0 && since("hits", "storm", g) < 4 ? <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#e8f0ff" opacity={0.6} /></svg> : null}</> },
  { at: "With", s: (g, f, len) => <><NightView cam={C(1260, GY - 500, 1.3)} f={f} fire={ip(g, [0, len], [0.3, 0.9])} /><Rain f={f} /></> },
  { at: "nobody", s: (g, f, len) => <Rooftop cam={C(960, GY - 250, 1.6)} f={f} tod="night">
    <Glow x={1500} y={GY - 300} r={600} g="gO" o={0.5} />
    <Hero x={960} y={GY - 50} f={f} expr="scared" gaze={1} pose={{ armL: [40, 70], armR: [40, 70] }} /></Rooftop> },
  { at: "watch", s: (g, f, len) => <NightView cam={camLerp(g, len, C(1300, 300, 0.6), C(1300, 300, 0.55))} f={f} fire={ip(g, [0, len], [1, 2.6])} /> },
  { at: "glowing", s: (g, f, len) => <NightView cam={C(1300, 250, 0.5)} f={f} fire={3} /> },
  { at: "morning", s: (g, f, len) => <NightView cam={C(1300, 300, 0.55)} f={f} fire={0} burnt={1} tod="dawn" smoke /> },
  // день 20: порез
  { at: "twenty", s: (g, f, len) => <><Store cam={C(500, 560, 1.2)} f={f} dark={0.15}>
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${700 + i * 40} ${GY + 30} l 20 -14 l 14 16 Z`} fill="#bff4ff" stroke={INK} strokeWidth={3} />)}
    <Hero x={560} y={GY + 40} f={f} expr={since("cut", "twenty", g) > 4 ? "scared" : "neutral"} pose={{ armR: [70, 30], lean: 10 }} holdL={TORCH} /></Store></> },
  { at: "deep", s: (g, f, len) => <Frame bg="#4a4a8a"><rect width={1920} height={1080} fill="#4a4a8a" /><PovHand x={1000} y={560} rot={-20} cut={1} />
    {[0, 1, 2].map((i) => <circle key={i} cx={940 - i * 10} cy={600 + ((g * 3 + i * 20) % 60)} r={9} fill="#d83a4a" opacity={0.8} />)}</Frame> },
  { at: "doctors", s: (g, f, len) => <Apartment cam={C(1150, GY - 250, 1.8)} f={f} tally={20}>
    <Hero x={1150} y={GY} f={f} expr="worried" sweat pose={{ armR: [60, 70], armL: [40, 40] }} /></Apartment> },
  { at: "wrap", n: 1, s: (g, f, len) => <Frame bg="#4a4a8a"><rect width={1920} height={1080} fill="#4a4a8a" /><PovHand x={1000} y={560} rot={-20} cut={1} />
    <g transform="translate(870 560) rotate(-20)"><rect x={-110} y={-60} width={ip(g, [0, 20], [20, 200])} height={120} rx={20} fill="#f27a2a" stroke={INK} strokeWidth={8} opacity={0.95} /></g></Frame> },
  { at: "hospital", s: (g, f, len) => <Street cam={C(1100, 560, 0.9)} f={f} tod="day" back={<g><rect x={900} y={GY - 760} width={800} height={520} fill="#e8e4ff" stroke={INK} strokeWidth={8} />{Array.from({ length: 8 }, (_, k) => <rect key={k} x={940 + (k % 4) * 190} y={GY - 700 + Math.floor(k / 4) * 170} width={130} height={110} fill="#5a6ab0" stroke={INK} strokeWidth={5} />)}<g transform={`translate(1300 ${GY - 820})`}><rect x={-60} y={-60} width={120} height={120} rx={16} fill="#fff" stroke={INK} strokeWidth={6} /><path d="M -14 -40 L 14 -40 L 14 -14 L 40 -14 L 40 14 L 14 14 L 14 40 L -14 40 L -14 14 L -40 14 L -40 -14 L -14 -14 Z" fill="#ff4a6a" stroke={INK} strokeWidth={4} /></g></g>}>
    <Hero x={500 + walkDx(g)} y={GY + 150} f={f} expr="worried" pose={{ ...walk(g), armR: [60, 70] }} /></Street> },
  { at: "backup", s: (g, f, len) => { const cam = C(400, 560, 1.0); return <><Hospital cam={cam}><Hero x={200 + walkDx(g, 0.16)} y={GY} f={f} expr="scared" pose={{ ...walk(g, 0.16), armR: [80, 10] }} holdR={TORCH} /></Hospital>
    <Torch cx={sx(500 + walkDx(g, 0.16), cam)} cy={sy(GY - 220, cam)} r={300} o={0.8} /></>; } },
  { at: "hallways", s: (g, f, len) => { const cam = C(900 + walkDx(g, 0.16) * 0.9, 560, 1.0); return <><Hospital cam={cam}><Hero x={600 + walkDx(g, 0.16)} y={GY} f={f} expr="scared" pose={{ ...walk(g, 0.16), armR: [80, 10] }} holdR={TORCH} /></Hospital>
    <Torch cx={sx(900 + walkDx(g, 0.16), cam)} cy={sy(GY - 220, cam)} r={300} o={0.8} /></>; } },
  { at: "flashlight", s: (g, f, len) => { const cam = camLerp(g, len, C(1000, GY - 150, 1.5), C(1300, GY - 200, 1.5)); return <><Hospital cam={cam} /><Torch cx={ip(g, [0, len], [700, 1200])} cy={600} r={320} o={0.85} /></>; } },
  { at: "charts", s: (g, f, len) => { const cam = C(550, GY - 380, 2.2); return <><Hospital cam={cam} /><Torch cx={960} cy={560} r={340} o={0.8} /></>; } },
  // аптека
  { at: "pharmacy", s: (g, f, len) => { const cam = C(860, GY - 280, 1.1); return <><Pharmacy cam={cam}><Hero x={500} y={GY} f={f} expr="worried" pose={{ armR: [80, 10] }} holdR={TORCH} /></Pharmacy><Torch cx={sx(900, cam)} cy={sy(GY - 300, cam)} r={420} o={0.7} /></>; } },
  { at: "bandages", s: (g, f, len) => { const cam = C(860, GY - 260, 1.6); return <><Pharmacy cam={cam}><Hero x={800} y={GY} f={f} expr="neutral" pose={{ armR: [130, 30], armL: [80, 10] }} holdL={TORCH} holdR={{ node: <rect x={-30} y={-50} width={60} height={50} rx={6} fill="#f4f2ff" stroke={INK} strokeWidth={4} />, k: 1 }} /></Pharmacy><Torch cx={960} cy={500} r={460} o={0.65} /></>; } },
  { at: "clean", s: (g, f, len) => <Frame bg="#4a4a8a"><rect width={1920} height={1080} fill="#4a4a8a" /><PovHand x={1000} y={560} rot={-20} cut={ip(g, [0, 25], [1, 0.3])} wrap={ip(g, [20, 40], [0, 1])} /></Frame> },
  // день 22: жар
  { at: "twenty-two", s: (g, f, len) => <Apartment cam={chalkCam(21)} f={f} tally={g > 18 ? 22 : 21} dark={0.4}><Faces f={f} />
    <ChalkHero i={21} g={g} f={f} expr="tired" sweat /></Apartment> },
  { at: "fever", s: (g, f, len) => <><Apartment cam={C(-300, GY - 160, 1.8)} f={f} tally={22} dark={0.45}><Faces f={f} /><SickBed f={f} /></Apartment><Heat f={f} /></> },
  { at: "drinking", s: (g, f, len) => <><Apartment cam={C(-250, GY - 120, 2.4)} f={f} tally={22} dark={0.45}><Faces f={f} /><SickBed f={f} expr="sad" /></Apartment><Heat f={f} /></> },
  { at: "talk", s: (g, f, len) => <><Apartment cam={camLerp(g, len, C(-450, GY - 200, 1.4), C(-640, GY - 280, 1.6))} f={f} tally={22} dark={0.45}><Faces f={f} /><SickBed f={f} expr="talk" /></Apartment><Heat f={f} /></> },
  { at: "Some", s: (g, f, len) => <><Apartment cam={camLerp(g, len, C(-640, GY - 300, 1.8), C(-640, GY - 300, 2.0))} f={f} tally={22} dark={0.4}><Faces f={f} friends={ip(g, [4, len], [0, 5])} /></Apartment><Heat f={f} /></> },
], { id: 8, dir: "bo" });
