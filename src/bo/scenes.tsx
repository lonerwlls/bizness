// «Alone in a city after a total blackout» — свои фоны под каждое место: квартира, подъезд, улица, угол, крыша.
// Стиль — как в 10-секундном примере src/blind: плоско, толстый контур, фиолетово-синий свет, жёлтые/розовые акценты.
import React from "react";
import { Bean, Cam, Defs, GY, Glow, HERO2D, HS, INK, Layer, YEL, rand } from "../sp/kit";

export { GY, HS, INK, YEL };
export const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;

// ---------- небо: рассвет без огней / ночь ----------
export type Tod = "dawn" | "day" | "dusk" | "night";
const SKY: Record<Tod, string[]> = {
  dawn: ["#3a2a7a", "#8a5ab8", "#e08ab0", "#ffc8a0"],
  day: ["#5a6ad8", "#8a9ae8", "#c8b8f0", "#f0d0e0"],
  dusk: ["#2a1a60", "#6a3aa0", "#d0508a", "#ff9a6a"],
  night: ["#05030f", "#0c0838", "#1a1050", "#2a1a60"],
};
export const SkyDefs: React.FC = () => (
  <defs>{(Object.keys(SKY) as Tod[]).map((k) => (
    <linearGradient key={k} id={`bo-${k}`} x1="0" y1="0" x2="0" y2="1">{SKY[k].map((c, i) => <stop key={i} offset={`${(i / 3) * 100}%`} stopColor={c} />)}</linearGradient>
  ))}</defs>
);
export const Stars: React.FC<{ n?: number; o?: number }> = ({ n = 120, o = 1 }) => (
  <g opacity={o}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={(i * 397) % 2600 - 300} cy={(i * 211) % 700 - 100} r={(i % 5) === 0 ? 4 : 2.5} fill="#fff" opacity={0.5 + (i % 3) * 0.2} />)}</g>
);

// ---------- небоскрёбы без света ----------
type Bld = { x: number; w: number; h: number; c: string; roof: number; lit: number };
const makeBlds = (seed: number, x0: number, x1: number, hMin: number, hMax: number, cols: string[]): Bld[] => {
  const r = rand(seed); const out: Bld[] = [];
  for (let x = x0; x < x1;) { const w = 180 + r() * 220; out.push({ x, w, h: hMin + r() * (hMax - hMin), c: cols[Math.floor(r() * cols.length)], roof: Math.floor(r() * 3), lit: r() }); x += w + 10 + r() * 40; }
  return out;
};
const FAR = makeBlds(31, -1800, 5600, 450, 900, ["#4a3a8a", "#56449a", "#3e3478"]);
const MID = makeBlds(47, -1400, 5200, 300, 640, ["#6a4ab0", "#5a5ac0", "#7a4aa0", "#4a5aa8"]);
// lights: 0 — все окна тёмные, 1 — горят (для сцены «город гаснет»)
export const Building: React.FC<{ b: Bld; base: number; win: number; lights?: number; far?: boolean }> = ({ b, base, win, lights = 0, far }) => {
  const top = base - b.h, cols = Math.max(2, Math.floor((b.w - 30) / (win * 1.9))), rows = Math.floor((b.h - 50) / (win * 2.0));
  const gx = (b.w - cols * win) / (cols + 1);
  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h + 60} fill={b.c} stroke={INK} strokeWidth={far ? 5 : 6} />
      <rect x={b.x + b.w - 16} y={top + 3} width={13} height={b.h + 50} fill="#ff8ac0" opacity={far ? 0.25 : 0.4} />
      {b.roof === 1 ? <rect x={b.x + b.w * 0.3} y={top - 50} width={b.w * 0.3} height={50} fill={b.c} stroke={INK} strokeWidth={5} /> : b.roof === 2 ? <path d={`M ${b.x + b.w / 2} ${top - 120} L ${b.x + b.w / 2} ${top}`} stroke={INK} strokeWidth={6} /> : null}
      {Array.from({ length: rows * cols }, (_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols);
        const on = lights > ((i * 37 + Math.round(b.x)) % 100) / 100;
        return <rect key={i} x={b.x + gx + cx * (win + gx)} y={top + 34 + cy * win * 2.0} width={win} height={win * 1.3} rx={3} fill={on ? YEL : "#231a52"} stroke={INK} strokeWidth={far ? 3 : 4} />;
      })}
    </g>
  );
};
// фон-город: небо, дальние и средние дома (base — линия земли слоя)
export const Skyline: React.FC<{ cam: Cam; f: number; tod?: Tod; lights?: number; midBase?: number; k?: number }> = ({ cam, tod = "dawn", lights = 0, midBase = GY - 40, k = 1 }) => (
  <>
    <Layer cam={cam} d={0.05}>
      <rect x={-3000} y={-2500} width={9000} height={3400} fill={`url(#bo-${tod})`} />
      <rect x={-3000} y={900} width={9000} height={2000} fill={SKY[tod][3]} />
      {tod === "night" ? <Stars /> : tod === "dawn" ? <><circle cx={1500} cy={560} r={110} fill="#ffe0b0" stroke={INK} strokeWidth={6} /><Glow x={1500} y={560} r={420} g="gO" o={0.6} /></> : null}
    </Layer>
    <Layer cam={cam} d={0.35} blur={4}><g transform={`translate(0 ${midBase - 60}) scale(1 ${k}) translate(0 ${60 - midBase})`}>{FAR.map((b, i) => <Building key={i} b={b} base={midBase - 60} win={22} lights={lights} far />)}</g></Layer>
    <Layer cam={cam} d={0.65} blur={2}><g transform={`translate(0 ${midBase}) scale(1 ${k}) translate(0 ${-midBase})`}>{MID.map((b, i) => <Building key={i} b={b} base={midBase} win={30} lights={lights} />)}</g></Layer>
  </>
);
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><Defs /><SkyDefs />{children}</svg>
);

// ---------- улица ----------
export const BoCar: React.FC<{ x: number; y: number; c: string; rot?: number; flip?: boolean; door?: boolean; s?: number }> = ({ x, y, c, rot = 0, flip, door, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={2} rx={170} ry={14} fill="rgba(10,6,30,0.45)" />
    <path d="M -155 -30 L -155 -72 Q -150 -88 -122 -90 L -72 -92 Q -40 -142 10 -142 L 60 -142 Q 92 -140 112 -98 L 140 -92 Q 158 -88 158 -70 L 158 -30 Z" fill={c} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d="M -58 -94 Q -32 -130 6 -130 L 6 -94 Z" fill="#3a3a7a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 20 -130 L 56 -130 Q 80 -128 96 -94 L 20 -94 Z" fill="#3a3a7a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {door ? <path d="M 10 -96 L 60 -150 L 70 -40 L 14 -34 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
    <rect x={142} y={-80} width={18} height={14} rx={5} fill="#b8b4d0" stroke={INK} strokeWidth={4} />
    {[-95, 95].map((k) => <g key={k}><circle cx={k} cy={-28} r={30} fill="#1c1a2a" stroke={INK} strokeWidth={6} /><circle cx={k} cy={-28} r={12} fill="#b8b4d0" /></g>)}
  </g>
);
export const Bus: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={380} ry={18} fill="rgba(10,6,30,0.45)" />
    <rect x={-380} y={-300} width={760} height={270} rx={30} fill="#ffc83c" stroke={INK} strokeWidth={8} />
    <rect x={-380} y={-120} width={760} height={30} fill="#ff6a5a" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-350 + i * 110} y={-270} width={90} height={110} rx={10} fill="#3a3a7a" stroke={INK} strokeWidth={5} />)}
    <rect x={300} y={-270} width={60} height={230} fill="#3a3a7a" stroke={INK} strokeWidth={5} />
    {[-250, 250].map((k) => <g key={k}><circle cx={k} cy={-30} r={44} fill="#1c1a2a" stroke={INK} strokeWidth={7} /><circle cx={k} cy={-30} r={16} fill="#b8b4d0" /></g>)}
  </g>
);
export const LampPost: React.FC<{ x: number; y: number; notice?: number; f?: number }> = ({ x, y, notice, f = 0 }) => (
  <g>
    <rect x={x - 9} y={y - 420} width={18} height={420} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <path d={`M ${x} ${y - 420} Q ${x} ${y - 470} ${x + 60} ${y - 466}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d={`M ${x} ${y - 420} Q ${x} ${y - 470} ${x + 60} ${y - 466}`} stroke="#2a2450" strokeWidth={7} fill="none" strokeLinecap="round" />
    <ellipse cx={x + 68} cy={y - 456} rx={32} ry={14} fill="#5a5680" stroke={INK} strokeWidth={5} />
    {notice !== undefined ? <g transform={`translate(${x + 10} ${y - 260}) skewY(${Math.sin(f * 0.4) * 6 * notice})`}><Notice /></g> : null}
  </g>
);
// бумажное объявление без текста: значки «автобус → стрелка», «молния перечёркнута»
export const Notice: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={0} y={0} width={150} height={190} fill="#fff8ec" stroke={INK} strokeWidth={5} />
    <rect x={0} y={0} width={150} height={34} fill="#ff4a6a" stroke={INK} strokeWidth={5} />
    <path d="M 75 50 L 60 90 L 76 90 L 66 124 L 94 80 L 78 80 L 88 50 Z" fill={YEL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 40 60 L 110 120" stroke="#ff3a4a" strokeWidth={8} strokeLinecap="round" />
    <rect x={22} y={140} width={60} height={30} rx={6} fill="#ffc83c" stroke={INK} strokeWidth={4} />
    <path d="M 92 155 L 130 155 M 118 143 L 130 155 L 118 167" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
// улица: город, тротуар, дорога, ближний тротуар
export const Street: React.FC<{ cam: Cam; f: number; tod?: Tod; lights?: number; children?: React.ReactNode; back?: React.ReactNode }> = ({ cam, f, tod = "dawn", lights, children, back }) => (
  <Svg>
    <Skyline cam={cam} f={f} tod={tod} lights={lights} midBase={GY - 250} k={0.6} />
    <Layer cam={cam} d={1}>
      <rect x={-3000} y={GY - 260} width={9000} height={60} fill="#5a4a9a" stroke={INK} strokeWidth={6} />
      <rect x={-3000} y={GY - 200} width={9000} height={240} fill="#2c2a6a" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 50 }, (_, i) => <rect key={i} x={-2600 + i * 180} y={GY - 86} width={90} height={12} rx={6} fill={YEL} opacity={0.8} />)}
      {back}
      <rect x={-3000} y={GY + 40} width={9000} height={700} fill="#7a58c8" stroke={INK} strokeWidth={6} />
      <rect x={-3000} y={GY + 40} width={9000} height={20} fill="#9a7ae0" />
      {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${-2600 + i * 240} ${GY + 60} L ${-2680 + i * 240} ${GY + 740}`} stroke={INK} strokeWidth={4} opacity={0.3} />)}
      {children}
    </Layer>
  </Svg>
);

// ---------- квартира ----------
// окно с видом на тёмный город (в координатах комнаты)
export const CityWindow: React.FC<{ x: number; y: number; w: number; h: number; tod?: Tod; lights?: number; id: string }> = ({ x, y, w, h, tod = "dawn", lights = 0, id }) => (
  <g>
    <clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
    <g clipPath={`url(#${id})`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#bo-${tod})`} />
      {tod === "night" ? <g transform={`translate(${x} ${y}) scale(0.4)`}><Stars n={60} /></g> : null}
      <g transform={`translate(${x - 200} ${y + h + 30}) scale(0.45) translate(0 ${-GY})`}>{MID.slice(0, 12).map((b, i) => <Building key={i} b={{ ...b, x: b.x + 1400 }} base={GY} win={30} lights={lights} />)}</g>
    </g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={10} />
    <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`} stroke="#e8e4ff" strokeWidth={12} />
    <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`} stroke={INK} strokeWidth={3} />
    <rect x={x - 20} y={y + h} width={w + 40} height={24} fill="#e8e4ff" stroke={INK} strokeWidth={6} />
  </g>
);
export const CEIL = GY - 820;
export const Apartment: React.FC<{ cam: Cam; f: number; tod?: Tod; dark?: number; children?: React.ReactNode; tally?: number; sleeping?: boolean }> = ({ cam, f, tod = "dawn", dark = 0.25, children, tally = 0, sleeping }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-1500} y={CEIL - 600} width={5000} height={GY - CEIL + 600} fill="#3e4a96" />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + i * 120} y={CEIL} width={46} height={GY - CEIL} fill="#36418a" />)}
      <rect x={-1500} y={CEIL - 600} width={5000} height={600} fill="#1e1a50" stroke={INK} strokeWidth={8} />
      <rect x={-1500} y={CEIL - 10} width={5000} height={24} fill="#5ad8c8" stroke={INK} strokeWidth={6} />
      <CityWindow x={1250} y={CEIL + 150} w={560} h={430} tod={tod} id="aptwin" />
      <path d={`M 1250 ${CEIL + 600} L 1050 ${GY} L 1950 ${GY} L 1810 ${CEIL + 600} Z`} fill="#ffd8c0" opacity={0.12} style={{ mixBlendMode: "screen" }} />
      {/* лампа под потолком (не горит) */}
      <path d={`M 700 ${CEIL + 14} L 700 ${CEIL + 90}`} stroke={INK} strokeWidth={6} />
      <path d={`M 640 ${CEIL + 150} L 660 ${CEIL + 90} L 740 ${CEIL + 90} L 760 ${CEIL + 150} Z`} fill="#8a86a8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* выключатель */}
      <rect x={960} y={GY - 430} width={50} height={80} rx={8} fill="#e8e4ff" stroke={INK} strokeWidth={5} />
      {/* отметки дней мелом */}
      <Tally n={tally} x={-200} y={GY - 330} />
      {/* пол */}
      <rect x={-1500} y={GY} width={5000} height={700} fill="#6a4a8a" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-1500 + i * 170} ${GY} L ${-1500 + i * 170} ${GY + 700}`} stroke={INK} strokeWidth={4} opacity={0.3} />)}
      {/* кровать: матрас на высоте ~0,5 м */}
      <g><rect x={210} y={GY - 260} width={36} height={260} rx={10} fill="#c87a4a" stroke={INK} strokeWidth={7} />
        <rect x={250} y={GY - 70} width={580} height={44} rx={14} fill="#e8e4ff" stroke={INK} strokeWidth={7} />
        <rect x={250} y={GY - 34} width={580} height={24} fill="#c87a4a" stroke={INK} strokeWidth={7} />
        {[262, 806].map((k) => <rect key={k} x={k} y={GY - 12} width={16} height={12} fill="#8a4a2a" stroke={INK} strokeWidth={4} />)}
        <rect x={262} y={GY - 102} width={150} height={48} rx={22} fill="#ffffff" stroke={INK} strokeWidth={7} />
        {sleeping ? null : <path d={`M 600 ${GY - 70} Q 600 ${GY - 98} 640 ${GY - 98} L 820 ${GY - 98} Q 840 ${GY - 98} 836 ${GY - 66} L 836 ${GY - 30} L 600 ${GY - 30} Z`} fill="#5ad8c8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />}</g>
      <rect x={850} y={GY - 110} width={150} height={110} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={7} />
      <rect x={866} y={GY - 86} width={118} height={36} rx={6} fill="#a85a3a" stroke={INK} strokeWidth={5} />
      {/* розетка */}
      <g transform={`translate(1060 ${GY - 70})`}><rect x={-26} y={-30} width={52} height={60} rx={8} fill="#e8e4ff" stroke={INK} strokeWidth={5} /><rect x={-12} y={-12} width={6} height={14} fill={INK} /><rect x={6} y={-12} width={6} height={14} fill={INK} /></g>
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={dark} />
  </Svg>
);
export const Kitchen: React.FC<{ cam: Cam; f: number; dark?: number; children?: React.ReactNode; open?: boolean; food?: boolean }> = ({ cam, f, dark = 0.3, children, open, food = true }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-1500} y={CEIL - 600} width={5000} height={GY - CEIL + 600} fill="#4a5aa0" />
      {Array.from({ length: 80 }, (_, i) => <rect key={i} x={-600 + (i % 20) * 130} y={GY - 505 + Math.floor(i / 20) * 70} width={130} height={70} fill={(i + Math.floor(i / 20)) % 2 ? "#5a6ab0" : "#6a7ac0"} stroke={INK} strokeWidth={3} />)}
      <rect x={-700} y={GY - 200} width={1100} height={200} fill="#ff8fb0" stroke={INK} strokeWidth={7} />
      <rect x={-720} y={GY - 225} width={1140} height={30} fill="#e8e4ff" stroke={INK} strokeWidth={7} />
      {[0, 1, 2].map((i) => <rect key={i} x={-680 + i * 360} y={GY - 180} width={330} height={160} rx={8} fill="#ff9ac0" stroke={INK} strokeWidth={5} />)}
      {/* мойка с краном */}
      <rect x={-140} y={GY - 228} width={220} height={20} rx={8} fill="#8a86a8" stroke={INK} strokeWidth={5} />
      <path d={`M 40 ${GY - 225} L 40 ${GY - 300} Q 40 ${GY - 330} 0 ${GY - 330} L -30 ${GY - 330} L -30 ${GY - 310}`} stroke="#b8b4d0" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d={`M 40 ${GY - 225} L 40 ${GY - 300} Q 40 ${GY - 330} 0 ${GY - 330} L -30 ${GY - 330} L -30 ${GY - 310}`} stroke={INK} strokeWidth={3} fill="none" />
      {/* холодильник */}
      <rect x={480} y={GY - 640} width={260} height={640} rx={20} fill="#9fdcff" stroke={INK} strokeWidth={7} />
      <path d={`M 480 ${GY - 420} L 740 ${GY - 420}`} stroke={INK} strokeWidth={6} />
      {open ? <g><rect x={496} y={GY - 404} width={228} height={390} fill="#2a2a5a" stroke={INK} strokeWidth={5} />{[0, 1, 2].map((r) => <path key={r} d={`M 496 ${GY - 300 + r * 100} L 724 ${GY - 300 + r * 100}`} stroke="#8a86a8" strokeWidth={6} />)}
        {food ? <><rect x={516} y={GY - 360} width={60} height={56} rx={6} fill="#ff6a5a" stroke={INK} strokeWidth={4} /><rect x={600} y={GY - 380} width={50} height={76} fill="#fff" stroke={INK} strokeWidth={4} /><ellipse cx={560} cy={GY - 222} rx={46} ry={20} fill="#ffd23c" stroke={INK} strokeWidth={4} /><rect x={630} y={GY - 250} width={70} height={46} rx={8} fill="#5ac84a" stroke={INK} strokeWidth={4} /></> : null}
        <path d={`M 740 ${GY - 420} L 900 ${GY - 380} L 900 ${GY} L 740 ${GY}`} fill="#9fdcff" stroke={INK} strokeWidth={7} /></g>
        : <rect x={700} y={GY - 380} width={16} height={120} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />}
      <rect x={-1500} y={GY} width={5000} height={700} fill="#6a4a8a" stroke={INK} strokeWidth={8} />
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={dark} />
  </Svg>
);
// подъезд: коридор с дверями
export const Hallway: React.FC<{ cam: Cam; f: number; dark?: number; children?: React.ReactNode }> = ({ cam, dark = 0.35, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={CEIL - 600} width={7000} height={GY - CEIL + 600} fill="#6a5aa8" />
      <rect x={-2000} y={GY - 300} width={7000} height={300} fill="#5a4a98" stroke={INK} strokeWidth={6} />
      <rect x={-2000} y={CEIL - 600} width={7000} height={600} fill="#2a1a60" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 8 }, (_, i) => { const x = -900 + i * 600; return <g key={i}>
        <rect x={x - 16} y={GY - 600} width={292} height={600} fill="#e8e4ff" stroke={INK} strokeWidth={7} />
        <rect x={x} y={GY - 584} width={260} height={584} fill={["#c87a4a", "#5ad8c8", "#ff8fb0", "#b48aff"][i % 4]} stroke={INK} strokeWidth={7} />
        <rect x={x + 30} y={GY - 550} width={200} height={240} rx={10} fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
        <circle cx={x + 30} cy={GY - 280} r={14} fill={YEL} stroke={INK} strokeWidth={5} />
        <rect x={x + 100} y={GY - 500} width={60} height={14} rx={7} fill={INK} opacity={0.6} />
      </g>; })}
      <rect x={4600} y={CEIL + 120} width={300} height={400} fill="#ffd8c0" stroke={INK} strokeWidth={8} />
      <rect x={-2000} y={GY} width={7000} height={700} fill="#4a3a7a" stroke={INK} strokeWidth={8} />
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={dark} />
  </Svg>
);
// крыша над тёмным городом
export const Rooftop: React.FC<{ cam: Cam; f: number; tod?: Tod; children?: React.ReactNode }> = ({ cam, f, tod = "dusk", children }) => (
  <Svg>
    <Skyline cam={cam} f={f} tod={tod} midBase={GY + 120} k={0.75} />
    <Layer cam={cam} d={1}>
      <rect x={-3000} y={GY - 40} width={9000} height={900} fill="#4a4080" stroke={INK} strokeWidth={7} />
      <rect x={-3000} y={GY - 70} width={9000} height={34} fill="#6a5ab0" stroke={INK} strokeWidth={6} />
      {children}
    </Layer>
  </Svg>
);
// значок в кружке, перечёркнутый
export const NoIcon: React.FC<{ x: number; y: number; k: "bulb" | "phone" | "wifi"; p?: number }> = ({ x, y, k, p = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.min(1, p)})`}>
    <circle r={160} fill="#2a2470" stroke={INK} strokeWidth={10} />
    {k === "bulb" ? <g><circle cx={0} cy={-30} r={70} fill="#8a86a8" stroke={INK} strokeWidth={8} /><rect x={-34} y={30} width={68} height={60} rx={8} fill="#b8b4d0" stroke={INK} strokeWidth={7} /></g>
      : k === "phone" ? <g><rect x={-55} y={-100} width={110} height={200} rx={18} fill="#262838" stroke={INK} strokeWidth={8} /><rect x={-42} y={-82} width={84} height={160} rx={6} fill="#141228" /></g>
      : <g fill="none" stroke="#b8b4d0" strokeWidth={18} strokeLinecap="round">{[110, 74, 38].map((r) => <path key={r} d={`M ${-r} ${40 - r * 0.4} A ${r} ${r} 0 0 1 ${r} ${40 - r * 0.4}`} />)}<circle cx={0} cy={50} r={10} fill="#b8b4d0" /></g>}
    <path d="M -110 -110 L 110 110" stroke="#ff3a4a" strokeWidth={26} strokeLinecap="round" opacity={p >= 1 ? 1 : 0} />
  </g>
);

// отметки дней мелом: палочки по 5, пятая — поперёк
export const Tally: React.FC<{ n: number; x: number; y: number }> = ({ n, x, y }) => (
  <g>{Array.from({ length: n }, (_, i) => { const gx = x + Math.floor(i / 5) * 110; return i % 5 === 4
    ? <path key={i} d={`M ${gx - 12} ${y + 70} L ${gx + 84} ${y + 14}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
    : <path key={i} d={`M ${gx + (i % 5) * 18} ${y} L ${gx + (i % 5) * 18 + 2} ${y + 90}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />; })}</g>
);
// герой спит под одеялом (голова на подушке)
export const InBed: React.FC<{ f: number; expr?: any; open?: number; gaze?: number; raise?: number }> = ({ f, expr = "sleep", open = 0, gaze = 0, raise = 0 }) => (
  <g>
    <g transform={`rotate(${raise * 30} 840 ${GY - 90})`}><Bean x={628} y={GY - 147} s={HS} look={HERO2D} expr={expr} open={open} f={f} gaze={gaze} lying shadow={false} pose={{ bob: Math.sin(f * 0.08) * 2 }} /></g>
    <path d={`M 400 ${GY - 66} Q 396 ${GY - 152 + Math.sin(f * 0.08) * 3} 470 ${GY - 156 + Math.sin(f * 0.08) * 3} L 790 ${GY - 130} Q 846 ${GY - 120} 840 ${GY - 66} Z`} fill="#5ad8c8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M 470 ${GY - 120} Q 600 ${GY - 110} 760 ${GY - 102}`} stroke="#3aa898" strokeWidth={6} fill="none" />
  </g>
);
// скамейка на остановке (сиденье на высоте 70)
export const Bench: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 150} y={y - 330} width={14} height={330} fill="#2a2450" stroke={INK} strokeWidth={5} />
    <rect x={x - 180} y={y - 360} width={380} height={40} rx={8} fill="#5a5ab0" stroke={INK} strokeWidth={6} />
    <rect x={x - 130} y={y - 170} width={260} height={70} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={6} />
    <rect x={x - 130} y={y - 78} width={260} height={18} rx={6} fill="#c87a4a" stroke={INK} strokeWidth={6} />
    {[-110, 110].map((k) => <rect key={k} x={x + k - 6} y={y - 62} width={12} height={62} fill="#2a2450" stroke={INK} strokeWidth={4} />)}
  </g>
);
// шаг без «скольжения»: ноги ходят «ножницами» (одна вперёд, другая назад), тело движется ровно настолько,
// чтобы опорная ступня стояла на месте. g — кадр от начала плана; dx — смещение тела вправо (для шага влево: x - dx и flip).
export const WALK_A = 20;
export const walk = (g: number, sp = 0.2): import("../sp/kit").BeanPose => {
  const p = Math.sin(g * sp);
  return { legL: p * WALK_A, legR: p * WALK_A, bob: (1 - Math.abs(p)) * 5, lean: 3, armL: [14 - p * 18, 10], armR: [14 - p * 18, 10], tilt: 0 };
};
export const walkDx = (g: number, sp = 0.2, s = HS) => {
  const A = (WALK_A * Math.PI) / 180, L = 168 * s, U = L * Math.sin(A);
  const t = g * sp - Math.PI / 2, k = Math.floor(t / Math.PI), ph = t - k * Math.PI;
  return k * 2 * U + U - L * Math.sin(A * Math.cos(ph)) + U;
};
export const walkSpeed = (sp = 0.2, s = HS) => (2 * 168 * s * Math.sin((WALK_A * Math.PI) / 180) * sp) / Math.PI;

// ---------- магазин ----------
export const Can: React.FC<{ x: number; y: number; c?: string; s?: number }> = ({ x, y, c = "#ff6a5a", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-22} y={-56} width={44} height={56} rx={5} fill="#b8b4d0" stroke={INK} strokeWidth={4} /><rect x={-22} y={-44} width={44} height={30} fill={c} stroke={INK} strokeWidth={3} /></g>
);
export const Grocery: React.FC<{ k: number; x: number; y: number; s?: number }> = ({ k, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {k === 0 ? <Can x={0} y={0} c="#ff6a5a" /> : k === 1 ? <path d="M -34 0 L -40 -70 Q -40 -84 -24 -84 L 24 -84 Q 40 -84 40 -70 L 34 0 Z" fill="#fff4e0" stroke={INK} strokeWidth={4} />
      : k === 2 ? <g><rect x={-26} y={-60} width={52} height={60} rx={8} fill="#c87a4a" stroke={INK} strokeWidth={4} /><rect x={-28} y={-74} width={56} height={16} rx={4} fill="#ff4a6a" stroke={INK} strokeWidth={4} /></g>
      : k === 3 ? <rect x={-40} y={-90} width={80} height={90} rx={4} fill="#ffd23c" stroke={INK} strokeWidth={4} />
      : <g>{[-28, 0, 28].map((d) => <g key={d}><rect x={d - 12} y={-80} width={24} height={80} rx={8} fill="#9fdcff" fillOpacity={0.8} stroke={INK} strokeWidth={4} /><rect x={d - 6} y={-92} width={12} height={14} fill="#5a7cf0" stroke={INK} strokeWidth={3} /></g>)}</g>}
  </g>
);
export const Cart: React.FC<{ x: number; y: number; items?: number; f?: number; s?: number; flip?: boolean }> = ({ x, y, items = 0, f = 0, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <g clipPath="url(#cartclip)">{Array.from({ length: items }, (_, i) => <Grocery key={i} k={i % 5} x={-110 + (i % 6) * 44} y={-70 - Math.floor(i / 6) * 40} s={0.8} />)}</g>
    <clipPath id="cartclip"><rect x={-150} y={-260} width={300} height={196} /></clipPath>
    <path d="M -140 -170 L 140 -170 L 120 -60 L -120 -60 Z" fill="#b8b4d0" fillOpacity={0.35} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-90, -40, 10, 60, 110].map((k) => <path key={k} d={`M ${k} -170 L ${k * 0.86} -60`} stroke={INK} strokeWidth={3} opacity={0.6} />)}
    <path d="M -130 -115 L 130 -115" stroke={INK} strokeWidth={3} opacity={0.6} />
    <path d="M 140 -170 L 175 -200 L 210 -200" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -120 -60 L -110 -30 L 110 -30 L 120 -60" stroke={INK} strokeWidth={6} fill="none" />
    {[-95, 95].map((k) => <g key={k} transform={`translate(${k} -16) rotate(${f * 8})`}><circle r={16} fill="#262838" stroke={INK} strokeWidth={4} /><path d="M -10 0 L 10 0" stroke="#b8b4d0" strokeWidth={3} /></g>)}
  </g>
);
export const Shelf: React.FC<{ x: number; w?: number; seed?: number; empty?: number }> = ({ x, w = 520, seed = 1, empty = 0.3 }) => {
  const r = rand(seed);
  return (
    <g>
      <rect x={x} y={GY - 520} width={w} height={520} fill="#5a4a8a" stroke={INK} strokeWidth={7} />
      {[0, 1, 2, 3].map((row) => <g key={row}>
        <rect x={x + 10} y={GY - 140 - row * 120} width={w - 20} height={16} fill="#8a86a8" stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor((w - 40) / 54) }, (_, i) => r() < empty ? null : <Grocery key={i} k={Math.floor(r() * 5)} x={x + 40 + i * 54} y={GY - 140 - row * 120} s={0.7} />)}
      </g>)}
    </g>
  );
};
export const Freezer: React.FC<{ x: number; w?: number }> = ({ x, w = 600 }) => (
  <g>
    <rect x={x} y={GY - 470} width={w} height={470} fill="#3a4a8a" stroke={INK} strokeWidth={7} />
    {Array.from({ length: Math.floor(w / 150) }, (_, i) => <g key={i}><rect x={x + 14 + i * 150} y={GY - 450} width={136} height={380} rx={6} fill="#9fdcff" fillOpacity={0.25} stroke={INK} strokeWidth={5} />
      <rect x={x + 30 + i * 150} y={GY - 320} width={50} height={40} rx={6} fill={["#ff9ac0", "#ffd27a", "#c8b8e8"][i % 3]} stroke={INK} strokeWidth={3} opacity={0.7} /><rect x={x + 136 + i * 150} y={GY - 300} width={8} height={70} rx={4} fill="#e8e4ff" /></g>)}
  </g>
);
// магазин изнутри; kind: "aisle" | "freezer"
export const Store: React.FC<{ cam: Cam; f: number; kind?: "aisle" | "freezer"; dark?: number; children?: React.ReactNode }> = ({ cam, kind = "aisle", dark = 0.35, children }) => (
  <Svg>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-800} width={7000} height={GY + 800} fill="#4a4a8a" />
      <rect x={-2000} y={GY - 760} width={7000} height={30} fill="#3a3a7a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-1600 + i * 600} y={GY - 730} width={300} height={22} rx={8} fill="#8a86a8" stroke={INK} strokeWidth={4} />)}
      {kind === "aisle" ? [-1300, -700, -100, 500, 1100, 1700, 2300].map((x, i) => <Shelf key={x} x={x} seed={i + 3} />)
        : <>{[-1300, -650, 0, 650, 1300, 1950].map((x) => <Freezer key={x} x={x} />)}
          {[[-500, 300], [300, 420], [1200, 360], [2000, 280]].map(([x, w], i) => <ellipse key={i} cx={x} cy={GY + 30} rx={w} ry={26} fill={["#ffb0d0", "#c8b8e8", "#ffd27a", "#ffb0d0"][i]} opacity={0.55} stroke={INK} strokeWidth={4} />)}</>}
      <rect x={-2000} y={GY} width={7000} height={700} fill="#8a86b8" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 50 }, (_, i) => <path key={i} d={`M ${-2000 + i * 160} ${GY} L ${-2000 + i * 160} ${GY + 700}`} stroke={INK} strokeWidth={3} opacity={0.25} />)}
      {children}
    </Layer>
    <rect width={1920} height={1080} fill="#0a0628" opacity={dark} />
  </Svg>
);
// фасад магазина на улице (рисуется в back у Street): стеклянные двери, gap — щель между створками
export const StoreFront: React.FC<{ x: number; gap?: number }> = ({ x, gap = 0 }) => (
  <g>
    <rect x={x - 500} y={GY - 700} width={1000} height={460} fill="#5ad8c8" stroke={INK} strokeWidth={8} />
    <rect x={x - 520} y={GY - 740} width={1040} height={70} fill="#ff6a5a" stroke={INK} strokeWidth={7} />
    {[-380, 300].map((d) => <rect key={d} x={x + d} y={GY - 640} width={80} height={60} rx={8} fill="#fff4f0" stroke={INK} strokeWidth={5} />)}
    <rect x={x - 220} y={GY - 600} width={440} height={340} fill="#1c1a40" stroke={INK} strokeWidth={7} />
    <rect x={x - 220 - gap} y={GY - 600} width={220} height={340} fill="#9fdcff" fillOpacity={0.4} stroke={INK} strokeWidth={6} />
    <rect x={x + gap} y={GY - 600} width={220} height={340} fill="#9fdcff" fillOpacity={0.4} stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 180 - gap} ${GY - 560} L ${x - 120 - gap} ${GY - 500}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
  </g>
);
export const Flashlight: React.FC<{ on?: boolean }> = ({ on = true }) => (
  <g><rect x={-10} y={-60} width={20} height={60} rx={6} fill="#262838" stroke={INK} strokeWidth={4} /><rect x={-15} y={-74} width={30} height={18} rx={4} fill="#ffd23c" stroke={INK} strokeWidth={4} />{on ? <Glow x={0} y={-70} r={40} g="gY" /> : null}</g>
);
export const Mattress: React.FC<{ x: number; y: number; w?: number; c?: string }> = ({ x, y, w = 420, c = "#e8e4ff" }) => (
  <g><rect x={x - w / 2} y={y - 50} width={w} height={50} rx={16} fill={c} stroke={INK} strokeWidth={6} />{[0.25, 0.5, 0.75].map((k) => <circle key={k} cx={x - w / 2 + w * k} cy={y - 25} r={5} fill={INK} opacity={0.4} />)}</g>
);
// темнота с кругом света фонарика (экранные координаты)
export const Torch: React.FC<{ cx: number; cy: number; r?: number; o?: number }> = ({ cx, cy, r = 320, o = 0.75 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <defs><radialGradient id="torchg"><stop offset="0%" stopColor="#000" stopOpacity={0} /><stop offset="70%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#05030f" stopOpacity={o} /></radialGradient>
      <mask id="torchm"><rect width={1920} height={1080} fill="#fff" /><circle cx={cx} cy={cy} r={r} fill="#000" /></mask></defs>
    <rect width={1920} height={1080} fill="#05030f" opacity={o} mask="url(#torchm)" />
    <circle cx={cx} cy={cy} r={r} fill="url(#torchg)" />
    <circle cx={cx} cy={cy} r={r} fill="#fff2c0" opacity={0.08} />
  </svg>
);
