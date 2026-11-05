// «What if Minecraft became real?» — общий набор: мир из кубиков в нашем 2D-стиле (толстый контур, розово-фиолетовый свет),
// камера с параллаксом, предметы, монстры (свои), животные, переход «кубики засыпают экран» и движок части по словам озвучки.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bean, BeanDefs, BeanLook, BeanPose, HERO2D, NEIGHBOR_A, NEIGHBOR_B } from "../toontest/bean";

export const B = 200; // 1 блок = 1 метр
export const GY = 900; // уровень земли (по нему стоят ступни)
export const HS = 0.62; // масштаб человечка: рост ≈ 1,8 блока
export const INK = "#16131f";
export const YEL = "#ffd23c";
export const FPS = 30;
export const LEAD = 9;

const fontH = delayRender("mc fonts");
new FontFace("McMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load().then((f) => { document.fonts.add(f); continueRender(fontH); });

export const ip = (f: number, a: number[], b: number[], e: (t: number) => number = Easing.inOut(Easing.cubic)) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const hash = (a: number, b: number) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };

export { Bean, HERO2D };
export type { BeanPose };
export const LOOKS: BeanLook[] = [
  NEIGHBOR_A, NEIGHBOR_B,
  { head: "#f8f6f0", body: "#5a7cf0", body2: "#3a56c0", limb: "#262838", shoe: "#ffffff", hair: "#2a1a14" },
  { head: "#f2e2c8", body: "#b45ad8", body2: "#8a3ab0", limb: "#262838", shoe: "#2a2a30", hat: "bowler", hatC: "#2a2a40", hatC2: "#ff6fb5" },
  { head: "#f8f6f0", body: "#3cc6d8", body2: "#2496a8", limb: "#262838", shoe: "#f4c430", hair: "#6a3a22" },
  { head: "#f2e2c8", body: "#f4c430", body2: "#c8961a", limb: "#262838", shoe: "#2a2a30", hat: "beanie", hatC: "#d8406a", hatC2: "#ffffff" },
  { head: "#f8f6f0", body: "#ff6f8f", body2: "#d04868", limb: "#262838", shoe: "#ffffff", hair: "#1e1a1a" },
];
export const PAJAMA: BeanLook = { head: "#f8f6f0", body: "#8ab8ff", body2: "#5a88d8", limb: "#262838", shoe: "#ffffff", hair: "#4a2e1e" };
export const BANKER: BeanLook = { head: "#f2e2c8", body: "#2a3048", body2: "#ffffff", limb: "#262838", shoe: "#1a1a22", hat: "bowler", hatC: "#1a1a22", hatC2: "#c8961a" };
export const DOCTOR: BeanLook = { head: "#f8f6f0", body: "#f2f4f8", body2: "#5ac8b0", limb: "#262838", shoe: "#ffffff", hair: "#3a2418" };

export const walkPose = (f: number, sp = 0.28, a = 0, arms = true): BeanPose => {
  const p = Math.sin(f * sp + a);
  return { legL: 4 + p * 16, legR: 4 - p * 16, bob: Math.abs(p) * 7, lean: -2, armL: arms ? [12 + p * 18, 8] : undefined, armR: arms ? [12 - p * 18, 8] : undefined };
};

// ---------- камера с параллаксом ----------
export type Cam = { x: number; y: number; z: number; sx?: number; sy?: number; r?: number };
const REF = { x: 1600, y: 500 };
export const Layer: React.FC<{ cam: Cam; d: number; blur?: number; children: React.ReactNode }> = ({ cam, d, blur, children }) => {
  const z = 1 + (cam.z - 1) * d;
  const x = REF.x + (cam.x - REF.x) * d + (cam.sx ?? 0) * d, y = REF.y + (cam.y - REF.y) * d + (cam.sy ?? 0) * d;
  return <g transform={`translate(960 540) rotate(${cam.r ?? 0}) scale(${z}) translate(${-x} ${-y})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};
export const camLerp = (g: number, len: number, a: Cam, b: Cam, e: (t: number) => number = Easing.inOut(Easing.sin)): Cam => {
  const t = e(Math.min(1, Math.max(0, g / Math.max(1, len))));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * t };
};

// ---------- свет, небо ----------
export type Tod = "dawn" | "day" | "dusk" | "night";
const SKY: Record<Tod, string[]> = {
  dawn: ["#2a1a6a", "#7a3aa8", "#ff7aa8", "#ffc070"],
  day: ["#3a6ae0", "#6aa8ff", "#b8a8ff", "#ffb0c8"],
  dusk: ["#2a165a", "#6a2a9a", "#e0508a", "#ff9a5a"],
  night: ["#0a0628", "#1a0f4a", "#3a1a6a", "#5a2a7a"],
};
export const Defs: React.FC = () => (
  <defs>
    <BeanDefs />
    {(Object.keys(SKY) as Tod[]).map((k) => (
      <linearGradient key={k} id={`sky-${k}`} x1="0" y1="0" x2="0" y2="1">{SKY[k].map((c, i) => <stop key={i} offset={`${[0, 40, 75, 100][i]}%`} stopColor={c} />)}</linearGradient>
    ))}
    {([["gY", "#ffd860"], ["gP", "#ff5fb0"], ["gR", "#ff3a4a"], ["gC", "#5ae0ff"], ["gW", "#fff2c0"], ["gO", "#ff8a2a"], ["gM", "#d04aff"]] as const).map(([id, c]) => (
      <radialGradient key={id} id={id}><stop offset="0%" stopColor={c} stopOpacity={0.9} /><stop offset="40%" stopColor={c} stopOpacity={0.35} /><stop offset="100%" stopColor={c} stopOpacity={0} /></radialGradient>
    ))}
    {[2, 4, 7].map((b) => <filter key={b} id={`blur${b}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={b} /></filter>)}
  </defs>
);
export const Glow: React.FC<{ x: number; y: number; r: number; g: string; o?: number }> = ({ x, y, r, g, o = 1 }) => <circle cx={x} cy={y} r={r} fill={`url(#${g})`} opacity={o} style={{ mixBlendMode: "screen" }} />;

// ---------- блоки ----------
export type BT = "grass" | "dirt" | "stone" | "log" | "planks" | "leaves" | "sand" | "gravel" | "water" | "lava" | "glass" | "gold" | "coal" | "iron" | "diamond" | "brick" | "wool" | "table" | "conc" | "farm" | "bedrock" | "snow";
const COL: Record<BT, string> = {
  grass: "#6a4a3a", dirt: "#7a5238", stone: "#8a86a8", log: "#7a4a2a", planks: "#c88a4a", leaves: "#3aa85a", sand: "#f0d88a", gravel: "#9a90a0",
  water: "#3a8af0", lava: "#ff7a1a", glass: "#bfefff", gold: "#ffd23c", coal: "#8a86a8", iron: "#8a86a8", diamond: "#8a86a8", brick: "#c8503a",
  wool: "#e04a5a", table: "#c88a4a", conc: "#7a5ac8", farm: "#5a3a26", bedrock: "#3a3448", snow: "#f4f6ff",
};
const ORE: Partial<Record<BT, string>> = { coal: "#1e1a24", iron: "#e8b89a", diamond: "#5ae8ff", gold: "#ffe27a" };
export const Blk: React.FC<{ x: number; y: number; t: BT; s?: number; c?: string; f?: number; win?: number; o?: number }> = ({ x, y, t, s = B, c, f = 0, win, o = 1 }) => {
  const base = c ?? COL[t];
  const k = s / B, sw = 5;
  const h1 = hash(x, y), h2 = hash(y, x), h3 = hash(x + 3, y + 7);
  const speck = (col: string, n: number, sz = 16) => Array.from({ length: n }, (_, i) => {
    const a = hash(x + i * 11, y - i * 7), b = hash(y + i * 5, x + i * 13);
    return <rect key={i} x={x + 18 * k + a * (s - 50 * k)} y={y + 18 * k + b * (s - 50 * k)} width={sz * k} height={sz * k} fill={col} />;
  });
  let inner: React.ReactNode = null;
  if (t === "grass") inner = <><path d={`M ${x} ${y} H ${x + s} V ${y + s * 0.3} ${Array.from({ length: 6 }, (_, i) => `L ${x + s - (i + 0.5) * s / 6} ${y + s * (i % 2 ? 0.3 : 0.4)}`).join(" ")} L ${x} ${y + s * 0.32} Z`} fill="#5ac84a" />{speck("#5a3a26", 3)}</>;
  else if (t === "dirt" || t === "farm") inner = <>{speck("#5a3a26", 4)}{t === "farm" ? [0.3, 0.6].map((q) => <rect key={q} x={x} y={y + s * q} width={s} height={8 * k} fill="#3a2418" />) : null}</>;
  else if (t === "sand" || t === "gravel" || t === "snow") inner = speck(t === "sand" ? "#d8b860" : t === "snow" ? "#d8e0ff" : "#6a6478", 5, 12);
  else if (t === "stone" || t === "bedrock") inner = <>{speck(t === "stone" ? "#6a6688" : "#1a1624", 3)}<path d={`M ${x + s * (0.2 + h1 * 0.3)} ${y + s * 0.2} l ${s * 0.12} ${s * 0.18} l ${-s * 0.06} ${s * 0.16}`} stroke="#5a5678" strokeWidth={5 * k} fill="none" strokeLinecap="round" /></>;
  else if (ORE[t]) inner = <>{[0, 1, 2, 3].map((i) => <rect key={i} x={x + s * (0.15 + ((i * 0.37 + h1) % 0.6))} y={y + s * (0.15 + ((i * 0.53 + h2) % 0.6))} width={s * 0.17} height={s * 0.17} fill={ORE[t]} stroke={INK} strokeWidth={3.5 * k} />)}
    {t === "diamond" ? <path d={`M ${x + s * 0.7} ${y + s * 0.18} l 6 14 l 14 6 l -14 6 l -6 14 l -6 -14 l -14 -6 l 14 -6 Z`} fill="#fff" opacity={0.6 + 0.4 * Math.sin(f * 0.3 + h3 * 6)} /> : null}</>;
  else if (t === "gold") inner = <><rect x={x + s * 0.12} y={y + s * 0.12} width={s * 0.76} height={s * 0.76} fill="none" stroke="#e0a81a" strokeWidth={6 * k} /><path d={`M ${x + s * 0.2} ${y + s * 0.5} L ${x + s * 0.5} ${y + s * 0.2}`} stroke="#fff6c0" strokeWidth={8 * k} strokeLinecap="round" /></>;
  else if (t === "log") inner = [0.25, 0.5, 0.75].map((q) => <path key={q} d={`M ${x + s * q} ${y + 8} L ${x + s * q + (h1 - 0.5) * 10} ${y + s - 8}`} stroke="#4a2a16" strokeWidth={6 * k} />);
  else if (t === "planks" || t === "table") inner = <>{[0.25, 0.5, 0.75].map((q) => <rect key={q} x={x} y={y + s * q - 2} width={s} height={5 * k} fill="#8a5428" />)}{[0, 1, 2, 3].map((r) => <rect key={"v" + r} x={x + s * ((r * 0.37 + h1) % 1)} y={y + s * r * 0.25} width={5 * k} height={s * 0.25} fill="#8a5428" />)}
    {t === "table" ? <><rect x={x} y={y} width={s} height={s * 0.28} fill="#a86a3a" stroke={INK} strokeWidth={4} />{[1, 2].map((i) => <path key={i} d={`M ${x + s * i / 3} ${y} V ${y + s * 0.28}`} stroke={INK} strokeWidth={4} />)}</> : null}</>;
  else if (t === "leaves") inner = <>{speck("#2a7a3a", 5, 22)}{speck("#6ad86a", 3, 14)}</>;
  else if (t === "brick") inner = [0.25, 0.5, 0.75].map((q, i) => <g key={q}><rect x={x} y={y + s * q - 3} width={s} height={6 * k} fill="#f0d8c8" /><rect x={x + s * (i % 2 ? 0.3 : 0.65)} y={y + s * (q - 0.25)} width={6 * k} height={s * 0.25} fill="#f0d8c8" /></g>);
  else if (t === "water") inner = [0.3, 0.65].map((q, i) => <path key={q} d={`M ${x + 10} ${y + s * q} q ${s * 0.12} ${-12 * k} ${s * 0.25} 0 t ${s * 0.25} 0 t ${s * 0.25} 0`} transform={`translate(${Math.sin(f * 0.15 + i + h1 * 6) * 14 * k} 0)`} stroke="#9fd8ff" strokeWidth={6 * k} fill="none" strokeLinecap="round" />);
  else if (t === "lava") inner = <>{[0, 1, 2].map((i) => <rect key={i} x={x + s * ((i * 0.33 + h1 + f * 0.004) % 0.75)} y={y + s * ((i * 0.41 + h2) % 0.75)} width={s * 0.22} height={s * 0.14} rx={8} fill="#ffe25a" />)}</>;
  else if (t === "glass") inner = <><path d={`M ${x + s * 0.2} ${y + s * 0.45} L ${x + s * 0.45} ${y + s * 0.2} M ${x + s * 0.3} ${y + s * 0.7} L ${x + s * 0.7} ${y + s * 0.3}`} stroke="#fff" strokeWidth={8 * k} strokeLinecap="round" opacity={0.8} /></>;
  else if (t === "conc" && win !== undefined) inner = <rect x={x + s * 0.22} y={y + s * 0.2} width={s * 0.56} height={s * 0.6} rx={6} fill={win > 0.5 ? YEL : "#241a5a"} stroke={INK} strokeWidth={4 * k} />;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={s} height={s} fill={base} opacity={t === "glass" ? 0.55 : t === "water" ? 0.9 : 1} />
      {inner}
      {t !== "glass" && t !== "water" ? <><rect x={x + 4} y={y + 4} width={s - 8} height={s * 0.1} fill="#ffffff" opacity={0.16} /><rect x={x + 4} y={y + s * 0.88} width={s - 8} height={s * 0.1} fill="#000020" opacity={0.18} /></> : null}
      <rect x={x} y={y} width={s} height={s} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
// клетка сетки: столбец c, ряд r (0 — первый блок над землёй, −1 — верхний блок земли)
export const gx = (c: number) => c * B;
export const gy = (r: number) => GY - (r + 1) * B;
export const G: React.FC<{ c: number; r: number; t: BT; col?: string; f?: number; win?: number; o?: number }> = ({ c, r, t, col, f, win, o }) => <Blk x={gx(c)} y={gy(r)} t={t} c={col} f={f} win={win} o={o} />;

// полоса земли: трава сверху, дальше земля и камень
export const Ground: React.FC<{ c0: number; c1: number; top?: BT; depth?: number; f?: number }> = ({ c0, c1, top = "grass", depth = 3, f }) => (
  <g>{Array.from({ length: c1 - c0 }, (_, i) => Array.from({ length: depth }, (_, j) => <G key={i + "_" + j} c={c0 + i} r={-1 - j} t={j === 0 ? top : j < 2 ? (top === "grass" ? "dirt" : top) : "stone"} f={f} />))}</g>
);

export const Tree: React.FC<{ c: number; r?: number; h?: number; cut?: number; f?: number; leaves?: string }> = ({ c, r = 0, h = 3, cut = 0, leaves }) => (
  <g>
    {Array.from({ length: h }, (_, i) => (i < cut ? null : <G key={i} c={c} r={r + i} t="log" />))}
    {[[-1, h], [0, h], [1, h], [-1, h + 1], [0, h + 1], [1, h + 1], [0, h + 2], [-2, h], [2, h]].map(([dc, dr], i) => <G key={"l" + i} c={c + dc} r={r + dr} t="leaves" col={leaves} />)}
  </g>
);

export const Tower: React.FC<{ c: number; w: number; h: number; col: string; seed: number; lit?: number }> = ({ c, w, h, col, seed, lit = 0.5 }) => {
  const r = rand(seed * 97 + 13);
  return <g>{Array.from({ length: w * h }, (_, i) => { const cc = i % w, rr = Math.floor(i / w); return <G key={i} c={c + cc} r={rr} t="conc" col={col} win={rr === 0 && cc === Math.floor(w / 2) ? undefined : r() < lit ? 1 : 0} />; })}</g>;
};

export const SqSun: React.FC<{ x: number; y: number; s?: number; moon?: boolean }> = ({ x, y, s = 260, moon }) => (
  <g>
    <Glow x={x} y={y} r={s * 1.9} g={moon ? "gC" : "gY"} o={0.8} />
    <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={moon ? "#eef0ff" : "#fff2a0"} stroke={INK} strokeWidth={6} />
    <rect x={x - s / 2 + 22} y={y - s / 2 + 22} width={s - 44} height={s - 44} fill={moon ? "#d8dcf8" : "#ffd23c"} />
    {moon ? [[0.2, 0.3], [0.55, 0.6], [0.6, 0.2]].map(([a, b], i) => <rect key={i} x={x - s / 2 + s * a} y={y - s / 2 + s * b} width={s * 0.18} height={s * 0.18} fill="#b8bce0" />) : null}
  </g>
);
export const Cloud: React.FC<{ x: number; y: number; w?: number; f?: number }> = ({ x, y, w = 5, f = 0 }) => (
  <g transform={`translate(${x + f * 0.4} ${y})`}>
    {Array.from({ length: w }, (_, i) => <rect key={i} x={i * 110} y={0} width={112} height={70} fill="#ffffff" stroke={INK} strokeWidth={5} />)}
    {Array.from({ length: w - 2 }, (_, i) => <rect key={"t" + i} x={(i + 1) * 110} y={-60} width={112} height={62} fill="#ffffff" stroke={INK} strokeWidth={5} />)}
    <rect x={4} y={44} width={w * 110 - 4} height={22} fill="#e0d0ff" />
  </g>
);

// небо и дальний город — общий задник для улиц
export const Backdrop: React.FC<{ cam: Cam; tod: Tod; f: number; sun?: [number, number]; city?: boolean }> = ({ cam, tod, f, sun, city = true }) => {
  const night = tod === "night";
  const lit = night ? 0.6 : tod === "day" ? 0.15 : 0.4;
  return (
    <>
      <Layer cam={cam} d={0.06}>
        <rect x={-4000} y={-3000} width={11000} height={4800} fill={`url(#sky-${tod})`} />
        {night ? Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + hash(i, 1) * 6000} y={-600 + hash(i, 2) * 1100} width={10} height={10} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.1 + i)} />) : null}
        {sun ? <SqSun x={sun[0]} y={sun[1]} moon={night} /> : null}
      </Layer>
      <Layer cam={cam} d={0.2}>
        {night ? null : [[-900, -150, 6], [700, -260, 4], [2300, -120, 7], [3900, -300, 5]].map(([x, y, w], i) => <Cloud key={i} x={x} y={y} w={w} f={f} />)}
      </Layer>
      {city ? <Layer cam={cam} d={0.4} blur={4}>
        {Array.from({ length: 16 }, (_, i) => {
          const w = 2 + Math.floor(hash(i, 9) * 3), h = 5 + Math.floor(hash(i, 4) * 8);
          return <g key={i} transform={`translate(${-2600 + i * 520} ${-30}) scale(0.8)`}><Tower c={0} w={w} h={h} col={["#3a2a86", "#46309a", "#5a3aa8"][i % 3]} seed={i} lit={lit} /></g>;
        })}
      </Layer> : null}
    </>
  );
};

// ---------- машины из кубиков ----------
export const BlockCar: React.FC<{ x: number; col: string; flip?: boolean; r?: number }> = ({ x, col, flip, r = 0 }) => (
  <g transform={`translate(${x} ${GY}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-200} y={-170} width={400} height={110} fill={col} stroke={INK} strokeWidth={5} />
    <rect x={-120} y={-270} width={220} height={102} fill={col} stroke={INK} strokeWidth={5} />
    <rect x={-100} y={-252} width={86} height={70} fill="#bfefff" stroke={INK} strokeWidth={4} /><rect x={0} y={-252} width={86} height={70} fill="#bfefff" stroke={INK} strokeWidth={4} />
    <rect x={170} y={-150} width={30} height={30} fill="#fff2c0" stroke={INK} strokeWidth={4} /><rect x={-200} y={-150} width={26} height={30} fill="#ff3a4a" stroke={INK} strokeWidth={4} />
    {[-130, 130].map((k) => <rect key={k} x={k - 50} y={-100} width={100} height={100} fill="#1c1a2a" stroke={INK} strokeWidth={5} />)}
    {[-130, 130].map((k) => <rect key={"h" + k} x={k - 18} y={-68} width={36} height={36} fill="#8a86a8" />)}
    {r ? null : null}
  </g>
);

// ---------- предметы (в единицах ~100 = маленький предмет) ----------
export type It = "log" | "pick" | "dpick" | "ingot" | "goldingot" | "diamond" | "bread" | "steak" | "cake" | "stew" | "torch" | "bucket" | "wbucket" | "seed" | "wheat" | "stick" | "plank" | "bill" | "milk" | "sword" | "cobble" | "coal" | "rail" | "bow" | "egg";
export const Item: React.FC<{ t: It; x?: number; y?: number; s?: number; f?: number; rot?: number }> = ({ t, x = 0, y = 0, s = 1, f = 0, rot = 0 }) => {
  const o = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const };
  let n: React.ReactNode;
  const stick = <rect x={-9} y={-40} width={18} height={110} fill="#a86a3a" {...o} />;
  if (t === "pick" || t === "dpick") n = <g>{stick}<path d="M -70 -46 Q 0 -86 70 -46 L 60 -30 Q 0 -58 -60 -30 Z" fill={t === "dpick" ? "#5ae8ff" : "#b8b4d0"} {...o} /></g>;
  else if (t === "sword") n = <g><rect x={-12} y={-100} width={24} height={110} fill="#5ae8ff" {...o} /><rect x={-34} y={8} width={68} height={16} fill="#7a4a2a" {...o} /><rect x={-8} y={22} width={16} height={36} fill="#7a4a2a" {...o} /></g>;
  else if (t === "stick") n = stick;
  else if (t === "torch") n = <g><rect x={-9} y={-30} width={18} height={90} fill="#a86a3a" {...o} /><rect x={-16} y={-62} width={32} height={34} fill="#1e1a24" {...o} />
    <path d={`M 0 ${-118 - Math.sin(f * 0.8) * 6} Q 26 -84 14 -64 Q 0 -54 -14 -64 Q -26 -84 0 ${-118 - Math.sin(f * 0.8) * 6} Z`} fill="#ffb02a" {...o} /><path d="M 0 -96 Q 12 -76 6 -68 Q 0 -64 -6 -68 Q -12 -76 0 -96 Z" fill="#fff2a0" />
    <Glow x={0} y={-80} r={260} g="gY" o={0.85 + 0.15 * Math.sin(f * 0.6)} /></g>;
  else if (t === "log" || t === "plank" || t === "cobble" || t === "coal") n = <Blk x={-45} y={-45} s={90} t={t === "log" ? "log" : t === "plank" ? "planks" : t === "coal" ? "coal" : "stone"} />;
  else if (t === "ingot" || t === "goldingot") n = <path d="M -50 10 L -32 -24 L 50 -24 L 32 10 Z M -50 10 L 32 10 L 32 30 L -50 30 Z" fill={t === "ingot" ? "#e8e8f4" : "#ffd23c"} {...o} />;
  else if (t === "diamond") n = <g><path d="M -40 -20 L -20 -44 L 20 -44 L 40 -20 L 0 40 Z" fill="#5ae8ff" {...o} /><path d="M -20 -44 L 0 -20 L 20 -44 M -40 -20 L 40 -20" stroke={INK} strokeWidth={4} fill="none" /><rect x={-12} y={-36} width={10} height={10} fill="#fff" /></g>;
  else if (t === "bread") n = <g><path d="M -56 18 Q -60 -30 0 -30 Q 60 -30 56 18 Z" fill="#d89a4a" {...o} />{[-24, 0, 24].map((k) => <path key={k} d={`M ${k - 8} -16 L ${k + 8} 4`} stroke="#8a5428" strokeWidth={6} strokeLinecap="round" />)}</g>;
  else if (t === "steak") n = <g><path d="M -50 -10 Q -40 -42 10 -38 Q 54 -34 48 4 Q 40 36 -6 32 Q -54 28 -50 -10 Z" fill="#a8483a" {...o} /><path d="M 20 -10 Q 34 -4 26 10" stroke="#f0d8c8" strokeWidth={8} fill="none" strokeLinecap="round" /></g>;
  else if (t === "cake") n = <g><rect x={-56} y={-30} width={112} height={60} fill="#f0d8c8" {...o} /><path d="M -56 -30 H 56 V -8 Q 40 4 28 -8 Q 14 6 0 -8 Q -14 6 -28 -8 Q -40 4 -56 -8 Z" fill="#ffffff" {...o} />{[-30, 0, 30].map((k) => <rect key={k} x={k - 7} y={-46} width={14} height={14} fill="#e04a5a" {...o} strokeWidth={4} />)}</g>;
  else if (t === "stew" || t === "milk" || t === "bucket" || t === "wbucket") {
    const bowl = t === "stew";
    n = bowl ? <g><path d="M -54 -10 Q -50 40 0 40 Q 50 40 54 -10 Z" fill="#a86a3a" {...o} /><ellipse cx={0} cy={-10} rx={54} ry={14} fill="#c88a5a" {...o} /><circle cx={-14} cy={-12} r={8} fill="#e04a5a" /><circle cx={14} cy={-10} r={7} fill="#f0d8c8" /></g>
      : <g><path d="M -44 -30 L -34 40 L 34 40 L 44 -30 Z" fill="#c8c8dc" {...o} /><ellipse cx={0} cy={-30} rx={44} ry={12} fill={t === "milk" ? "#ffffff" : t === "wbucket" ? "#3a8af0" : "#5a5678"} {...o} /><path d="M -44 -30 Q 0 -100 44 -30" stroke={INK} strokeWidth={6} fill="none" /></g>;
  } else if (t === "seed") n = <g>{[[-14, 0], [10, -10], [6, 14]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={10} ry={14} fill="#6ad86a" {...o} strokeWidth={4} />)}</g>;
  else if (t === "wheat") n = <g><path d="M 0 60 L 0 -50" stroke="#c8961a" strokeWidth={8} />{[-40, -20, 0].map((k) => <g key={k}><ellipse cx={-12} cy={k} rx={10} ry={16} fill="#ffd23c" {...o} strokeWidth={4} /><ellipse cx={12} cy={k} rx={10} ry={16} fill="#ffd23c" {...o} strokeWidth={4} /></g>)}</g>;
  else if (t === "bill") n = <g><rect x={-60} y={-30} width={120} height={60} fill="#7ac87a" {...o} /><circle cx={0} cy={0} r={16} fill="#5aa85a" stroke={INK} strokeWidth={4} /></g>;
  else if (t === "rail") n = <g><rect x={-60} y={-60} width={20} height={120} fill="#b8b4d0" {...o} /><rect x={40} y={-60} width={20} height={120} fill="#b8b4d0" {...o} />{[-40, 0, 40].map((k) => <rect key={k} x={-56} y={k - 8} width={112} height={16} fill="#a86a3a" {...o} strokeWidth={4} />)}</g>;
  else if (t === "bow") n = <g><path d="M -10 -80 Q 50 0 -10 80" stroke="#a86a3a" strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M -10 -80 L -10 80" stroke="#eee" strokeWidth={4} /></g>;
  else if (t === "egg") n = <ellipse cx={0} cy={0} rx={24} ry={32} fill="#f4e8d8" {...o} />;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{n}</g>;
};
// предмет, который «выпадает» и подпрыгивает-крутится в воздухе, как добыча
export const Drop: React.FC<{ t: It; x: number; y: number; f: number; s?: number }> = ({ t, x, y, f, s = 0.7 }) => (
  <g transform={`translate(${x} ${y - 30 - Math.sin(f * 0.12) * 14}) scale(${Math.cos(f * 0.06) * s} ${s})`}><Item t={t} f={f} /></g>
);
export const Torch: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => <Item t="torch" x={x} y={y - 60 * s} s={s} f={f + x} />;

// ---------- монстры (свои) ----------
export const Shade: React.FC<{ x: number; f: number; s?: number; burn?: number; y?: number }> = ({ x, f, s = 1, burn = 0, y = GY }) => {
  const sw = Math.sin(f * 0.08 + x) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
      <ellipse cx={0} cy={4} rx={90} ry={16} fill="rgba(20,10,50,0.4)" />
      {[-1, 1].map((k) => <rect key={k} x={k * 30 - 14} y={-200} width={28} height={200} fill="#1e1238" stroke={INK} strokeWidth={5} />)}
      <rect x={-56} y={-430} width={112} height={240} fill="#2a1a4a" stroke={INK} strokeWidth={5} />
      {[-1, 1].map((k) => <rect key={"a" + k} x={k * 70 - 13} y={-420} width={26} height={250} fill="#1e1238" stroke={INK} strokeWidth={5} transform={`rotate(${k * (8 + Math.sin(f * 0.1) * 5)} ${k * 70} -420)`} />)}
      <rect x={-62} y={-560} width={124} height={124} fill="#2a1a4a" stroke={INK} strokeWidth={5} />
      {[-1, 1].map((k) => <g key={"e" + k}><Glow x={k * 28} y={-505} r={60} g="gM" /><rect x={k * 28 - 18} y={-512} width={36} height={14} fill="#ff6aff" stroke={INK} strokeWidth={3} /></g>)}
      {burn > 0 ? <Fire x={0} y={-300} f={f} s={burn} /> : null}
    </g>
  );
};
export const Groaner: React.FC<{ x: number; f: number; s?: number; burn?: number; flip?: boolean; y?: number }> = ({ x, f, s = 1, burn = 0, flip, y = GY }) => {
  const p = Math.sin(f * 0.12 + x);
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={80} ry={14} fill="rgba(20,10,50,0.4)" />
      {[-1, 1].map((k) => <rect key={k} x={k * 22 - 18} y={-150} width={36} height={150} fill="#3a3a6a" stroke={INK} strokeWidth={5} transform={`rotate(${k * p * 10} ${k * 22} -150)`} />)}
      <rect x={-52} y={-300} width={104} height={160} fill="#6a4a8a" stroke={INK} strokeWidth={5} />
      <path d="M -52 -170 l 20 -20 l 14 20 l 18 -16 l 16 16 l 16 -18 l 20 18 V -140 H -52 Z" fill="#4a3468" />
      {[-1, 1].map((k) => <rect key={"a" + k} x={k * 52 - 14} y={-296} width={28} height={130} fill="#7aa88a" stroke={INK} strokeWidth={5} transform={`rotate(${k * (-118 + Math.sin(f * 0.1 + k) * 8)} ${k * 52} -290)`} />)}
      <rect x={-56} y={-414} width={112} height={112} fill="#7aa88a" stroke={INK} strokeWidth={5} />
      <rect x={-34} y={-378} width={22} height={18} fill="#1a1028" /><rect x={12} y={-378} width={22} height={18} fill="#1a1028" />
      <rect x={-22} y={-340} width={44} height={12} fill="#2a1a2a" />
      {burn > 0 ? <Fire x={0} y={-280} f={f} s={burn} /> : null}
    </g>
  );
};
export const Bony: React.FC<{ x: number; f: number; s?: number; burn?: number; flip?: boolean; y?: number }> = ({ x, f, s = 1, burn = 0, flip, y = GY }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={12} fill="rgba(20,10,50,0.4)" />
    {[-1, 1].map((k) => <rect key={k} x={k * 18 - 9} y={-160} width={18} height={160} fill="#e8e8f0" stroke={INK} strokeWidth={4.5} />)}
    <rect x={-40} y={-300} width={80} height={140} fill="none" stroke="#e8e8f0" strokeWidth={14} />
    {[-260, -225, -190].map((k) => <rect key={k} x={-40} y={k} width={80} height={10} fill="#e8e8f0" stroke={INK} strokeWidth={3} />)}
    <rect x={-8} y={-300} width={16} height={140} fill="#e8e8f0" stroke={INK} strokeWidth={4} />
    <rect x={36} y={-296} width={16} height={130} fill="#e8e8f0" stroke={INK} strokeWidth={4.5} transform="rotate(-70 44 -290)" />
    <Item t="bow" x={160} y={-300} s={0.9} />
    <rect x={-52} y={-400} width={104} height={100} fill="#f4f4fa" stroke={INK} strokeWidth={5} />
    <rect x={-32} y={-370} width={22} height={22} fill="#1a1028" /><rect x={10} y={-370} width={22} height={22} fill="#1a1028" />
    <rect x={-24} y={-330} width={48} height={10} fill="#1a1028" />
    {burn > 0 ? <Fire x={0} y={-260} f={f} s={burn} /> : null}
  </g>
);
export const Fire: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={-40} r={220} g="gO" />
    {[-50, 0, 50].map((k, i) => <path key={k} d={`M ${k} ${-180 - Math.sin(f * 0.7 + i) * 24} Q ${k + 46} -80 ${k + 34} -10 Q ${k} 14 ${k - 34} -10 Q ${k - 46} -80 ${k} ${-180 - Math.sin(f * 0.7 + i) * 24} Z`} fill="#ff8a2a" stroke={INK} strokeWidth={5} />)}
    {[-50, 0, 50].map((k) => <path key={"i" + k} d={`M ${k} -110 Q ${k + 20} -50 ${k + 12} -16 Q ${k} -8 ${k - 12} -16 Q ${k - 20} -50 ${k} -110 Z`} fill="#ffe25a" />)}
  </g>
);

// ---------- животные ----------
export const Cow: React.FC<{ x: number; f: number; flip?: boolean; s?: number }> = ({ x, f, flip, s = 1 }) => {
  const p = Math.sin(f * 0.15 + x);
  return (
    <g transform={`translate(${x} ${GY}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={150} ry={18} fill="rgba(20,10,50,0.35)" />
      {[-90, -50, 50, 90].map((k, i) => <rect key={k} x={k - 18} y={-110} width={36} height={110} fill="#f4f4fa" stroke={INK} strokeWidth={5} transform={`rotate(${(i % 2 ? 1 : -1) * p * 6} ${k} -110)`} />)}
      <rect x={-120} y={-240} width={240} height={140} fill="#f4f4fa" stroke={INK} strokeWidth={5} />
      <rect x={-90} y={-236} width={70} height={60} fill="#2a2430" /><rect x={30} y={-160} width={80} height={56} fill="#2a2430" />
      <rect x={-120} y={-240} width={240} height={140} fill="none" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${Math.sin(f * 0.05 + x) * 4} 150 -220)`}>
        <rect x={100} y={-310} width={120} height={120} fill="#f4f4fa" stroke={INK} strokeWidth={5} />
        <rect x={150} y={-250} width={74} height={50} fill="#ffb0c0" stroke={INK} strokeWidth={4} />
        <rect x={120} y={-284} width={20} height={20} fill={INK} /><rect x={180} y={-284} width={20} height={20} fill={INK} />
        <rect x={92} y={-334} width={20} height={30} fill="#e8d8b8" stroke={INK} strokeWidth={4} /><rect x={208} y={-334} width={20} height={30} fill="#e8d8b8" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};
export const Chicken: React.FC<{ x: number; f: number; flip?: boolean }> = ({ x, f, flip }) => {
  const peck = Math.max(0, Math.sin(f * 0.2 + x)) * 20;
  return (
    <g transform={`translate(${x} ${GY}) scale(${flip ? -1 : 1} 1)`}>
      {[-16, 16].map((k) => <rect key={k} x={k - 5} y={-46} width={10} height={46} fill="#ffb02a" stroke={INK} strokeWidth={3.5} />)}
      <rect x={-50} y={-120} width={100} height={76} fill="#ffffff" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${peck} 40 -110)`}>
        <rect x={20} y={-190} width={60} height={76} fill="#ffffff" stroke={INK} strokeWidth={5} />
        <rect x={78} y={-162} width={26} height={18} fill="#ffb02a" stroke={INK} strokeWidth={4} /><rect x={74} y={-144} width={14} height={16} fill="#e04a5a" />
        <rect x={56} y={-176} width={12} height={12} fill={INK} />
      </g>
    </g>
  );
};
export const Bee: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x + Math.sin(f * 0.1) * 60} ${y + Math.sin(f * 0.23) * 30})`}>
    <rect x={-26} y={-20} width={52} height={40} fill="#ffd23c" stroke={INK} strokeWidth={4} /><rect x={-6} y={-20} width={12} height={40} fill={INK} />
    <rect x={-20} y={-44 + Math.sin(f * 2) * 6} width={18} height={22} fill="#dff4ff" stroke={INK} strokeWidth={3} opacity={0.9} />
  </g>
);
export const Wheat: React.FC<{ c: number; g: number; f: number }> = ({ c, g, f }) => (
  <g>{[0.2, 0.5, 0.8].map((q, i) => {
    const h = 30 + g * 150, x = gx(c) + B * q;
    const col = g > 0.85 ? "#ffd23c" : "#6ad86a";
    return <g key={i} transform={`rotate(${Math.sin(f * 0.08 + c + i) * 4} ${x} ${GY})`}>
      <path d={`M ${x} ${GY} L ${x} ${GY - h}`} stroke={g > 0.85 ? "#c8961a" : "#3aa85a"} strokeWidth={7} />
      {g > 0.4 ? [0, 1, 2].map((k) => <g key={k}><ellipse cx={x - 10} cy={GY - h + k * 22} rx={9} ry={14} fill={col} stroke={INK} strokeWidth={3.5} /><ellipse cx={x + 10} cy={GY - h + k * 22} rx={9} ry={14} fill={col} stroke={INK} strokeWidth={3.5} /></g>) : null}
    </g>;
  })}</g>
);

export const Bed: React.FC<{ c: number; col?: string }> = ({ c, col = "#e04a5a" }) => (
  <g>
    <rect x={gx(c)} y={GY - 110} width={B * 2} height={110} fill="#c88a4a" stroke={INK} strokeWidth={5} />
    <rect x={gx(c)} y={GY - 170} width={B * 2} height={70} fill={col} stroke={INK} strokeWidth={5} />
    <rect x={gx(c) + 14} y={GY - 210} width={120} height={50} fill="#ffffff" stroke={INK} strokeWidth={5} />
    {[0, 1].map((k) => <rect key={k} x={gx(c) + k * (B * 2 - 30)} y={GY - 40} width={30} height={40} fill="#8a5428" stroke={INK} strokeWidth={4} />)}
  </g>
);

// ---------- цветокоррекция и виньетка ----------
export const Grade: React.FC<{ tod?: Tod; dark?: number }> = ({ tod = "dawn", dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 15% 0%, ${tod === "night" ? "rgba(140,80,255,0.25)" : "rgba(255,80,170,0.22)"}, rgba(0,0,0,0) 55%)`, mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(30,20,110,0.3) 100%)" }} />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 ${240 + dark * 200}px ${50 + dark * 120}px rgba(14,6,40,${0.55 + dark * 0.35})` }} />
  </>
);

// ---------- переход: кубики засыпают экран / разлетаются ----------
const WCOLS = ["#5ac84a", "#7a5238", "#8a86a8", "#c88a4a", "#3aa85a", "#7a5ac8", "#ffd23c", "#3a8af0"];
export const BlockWipe: React.FC<{ p: number; out?: boolean }> = ({ p, out }) => {
  if (p <= 0) return null;
  const S = 120, cols = 16, rows = 9;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const order = (c + (rows - 1 - r)) / (cols + rows - 2) * 0.6 + hash(c, r) * 0.25;
        const q = Math.min(1, Math.max(0, (p * 1.12 - order) / 0.25));
        if (q <= 0) return null;
        const e = 1 - Math.pow(1 - q, 3);
        const dy = out ? 0 : (1 - e) * -160;
        const sz = S * (out ? e : 0.6 + 0.4 * e);
        const t = hash(r * 3, c * 5);
        return <g key={i} transform={`translate(${c * S + S / 2} ${r * S + S / 2 + dy}) rotate(${(1 - e) * (t > 0.5 ? 40 : -40)})`} opacity={Math.min(1, q * 3)}>
          <rect x={-sz / 2 - 1} y={-sz / 2 - 1} width={sz + 2} height={sz + 2} fill={WCOLS[Math.floor(t * WCOLS.length)]} stroke={INK} strokeWidth={6} />
          <rect x={-sz / 2 + 6} y={-sz / 2 + 6} width={sz - 12} height={sz * 0.12} fill="#fff" opacity={0.2} />
        </g>;
      })}
    </svg>
  );
};

// ---------- движок части: склейки по словам озвучки ----------
export type Voice = { dur: number; words: { t: number; e: number; w: string; end: boolean; pause: boolean }[] };
export type Shot = { at: string; n?: number; s: (g: number, f: number, len: number) => React.ReactNode };
export const atWord = (V: Voice, w: string, n = 1) => {
  const x = V.words.filter((v) => v.w.toLowerCase() === w.toLowerCase())[n - 1];
  if (!x) throw new Error(`нет слова «${w}» №${n}`);
  return Math.round(x.t * FPS) + LEAD;
};
const WIPE = 18;
export const partFrames = (V: Voice) => Math.round((V.dur + 0.3) * FPS) + LEAD + WIPE;
export const makePart = (V: Voice, shots: Shot[], o: { id: number; last?: boolean }) => {
  const FR = partFrames(V);
  const starts = shots.map((s, i) => (i === 0 ? 0 : atWord(V, s.at, s.n) - 3));
  const Comp: React.FC = () => {
    const f = useCurrentFrame();
    let i = 0; while (i + 1 < starts.length && f >= starts[i + 1]) i++;
    const end = i + 1 < starts.length ? starts[i + 1] : FR;
    const g = f - starts[i];
    const inP = o.id === 1 ? 0 : 1 - ip(f, [0, 16], [0, 1], Easing.linear);
    const outP = o.last ? 0 : ip(f, [FR - WIPE, FR - 1], [0, 1], Easing.linear);
    const fade = o.id === 1 ? ip(f, [0, 12], [1, 0]) : 0;
    const fadeOut = o.last ? ip(f, [FR - 20, FR - 1], [0, 1]) : 0;
    return (
      <AbsoluteFill style={{ background: "#120a30" }}>
        {shots[i].s(g, f, end - starts[i])}
        <BlockWipe p={inP} out />
        <BlockWipe p={outP} />
        <AbsoluteFill style={{ background: "#07030f", opacity: Math.max(fade, fadeOut) }} />
        <Sequence from={LEAD}><Audio src={staticFile(`mc/p${o.id}/voice.mp3`)} /></Sequence>
        <Audio src={staticFile(`mc/p${o.id}/sfx.wav`)} volume={0.5} />
      </AbsoluteFill>
    );
  };
  return { FR, Comp, starts };
};

// полный кадр-сцена: svg с общими defs
export const Frame: React.FC<{ children: React.ReactNode; tod?: Tod; dark?: number }> = ({ children, tod, dark }) => (
  <>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><Defs />{children}</svg>
    <Grade tod={tod} dark={dark} />
  </>
);

// ---------- Земля из кубиков (вид из космоса); night — ночная сторона с огоньками ----------
export const Earth: React.FC<{ x: number; y: number; r: number; f: number; night?: number; lights?: number }> = ({ x, y, r, f, night = 0, lights = 0 }) => {
  const n = 22, S = (r * 2) / n, off = (f * 0.6) % S;
  const id = `earth${Math.round(r)}`;
  return (
    <g>
      <Glow x={x} y={y} r={r * 1.5} g="gC" o={0.7} />
      <clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath>
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: (n + 2) * n }, (_, i) => {
          const c = i % (n + 2), rr = Math.floor(i / (n + 2));
          const col = c + Math.floor(f * 0.6 / S);
          const v = hash(Math.floor(col / 2), Math.floor(rr / 2)) * 0.6 + hash(col, rr) * 0.4;
          const fill = v > 0.62 ? "#5ac84a" : v > 0.55 ? "#f0d88a" : rr < 2 || rr > n - 3 ? "#f4f6ff" : "#3a8af0";
          const px = x - r + (c - 1) * S - off, py = y - r + rr * S;
          const lit = lights > 0 && fill === "#5ac84a" && hash(col * 7, rr * 3) < lights;
          return <g key={i}><rect x={px} y={py} width={S + 0.5} height={S + 0.5} fill={fill} stroke={INK} strokeWidth={2.5} />
            {lit ? <rect x={px + S * 0.3} y={py + S * 0.3} width={S * 0.4} height={S * 0.4} fill={YEL} /> : null}</g>;
        })}
        {night > 0 ? <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill="#0a0628" opacity={night * 0.6} /> : null}
        {night > 0 && lights > 0 ? Array.from({ length: 60 }, (_, i) => { const a = hash(i, 5), b = hash(i, 8); return hash(i, 2) < lights ? <Glow key={i} x={x - r + a * r * 2} y={y - r + b * r * 2} r={S * 1.2} g="gY" o={0.9} /> : null; }) : null}
      </g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={7} />
      <path d={`M ${x - r * 0.7} ${y - r * 0.5} A ${r} ${r} 0 0 1 ${x + r * 0.2} ${y - r * 0.95}`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.35} strokeLinecap="round" />
    </g>
  );
};
export const Stars: React.FC<{ f: number; n?: number }> = ({ f, n = 80 }) => <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={hash(i, 3) * 1920} y={hash(i, 7) * 1080} width={8} height={8} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))} />)}</g>;

// появление монстра: фиолетовые квадратики слетаются в точку
export const Spawn: React.FC<{ x: number; y: number; p: number; f: number }> = ({ x, y, p, f }) => (
  <g>{Array.from({ length: 18 }, (_, i) => {
    const a = i * 0.9 + f * 0.05, d = (1 - p) * 260 + 30;
    return <rect key={i} x={x + Math.cos(a) * d - 14} y={y - 250 + Math.sin(a) * d * 1.3 - 14} width={28} height={28} fill={i % 2 ? "#b04aff" : "#5a2a9a"} stroke={INK} strokeWidth={4} opacity={1 - p * 0.6} />;
  })}<Glow x={x} y={y - 250} r={200 * (0.5 + p)} g="gM" o={0.6} /></g>
);

// полоска «сытости» (хлебушки) и сердечки над головой
export const FoodBar: React.FC<{ x: number; y: number; v: number; s?: number }> = ({ x, y, v, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({ length: 10 }, (_, i) => {
    const q = Math.max(0, Math.min(1, v * 10 - i));
    return <g key={i} transform={`translate(${(i - 4.5) * 70} 0) scale(0.5)`} opacity={0.25 + q * 0.75}><Item t="bread" /></g>;
  })}</g>
);
export const Hearts: React.FC<{ x: number; y: number; v: number; s?: number }> = ({ x, y, v, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({ length: 10 }, (_, i) => {
    const q = Math.max(0, Math.min(1, v * 10 - i));
    return <path key={i} transform={`translate(${(i - 4.5) * 62} 0)`} d="M 0 18 L -24 -4 L -24 -16 L -14 -24 L 0 -14 L 14 -24 L 24 -16 L 24 -4 Z" fill={q > 0.5 ? "#ff3a5a" : "#4a3458"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
  })}</g>
);
export const Dog: React.FC<{ x: number; f: number; bark?: boolean; flip?: boolean }> = ({ x, f, bark, flip }) => {
  const j = bark ? Math.abs(Math.sin(f * 0.5)) * 14 : 0;
  return (
    <g transform={`translate(${x} ${GY - j}) scale(${flip ? -1 : 1} 1)`}>
      {[-50, -24, 30, 54].map((k) => <rect key={k} x={k - 8} y={-70} width={16} height={70} rx={8} fill="#c8803a" stroke={INK} strokeWidth={4.5} />)}
      <path d={`M -70 -110 Q -110 ${-150 - Math.sin(f * 0.6) * 20} -96 -170`} stroke="#c8803a" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M -70 -110 Q -110 ${-150 - Math.sin(f * 0.6) * 20} -96 -170`} stroke={INK} strokeWidth={4} fill="none" opacity={0} />
      <ellipse cx={0} cy={-100} rx={86} ry={46} fill="#e0a050" stroke={INK} strokeWidth={5} />
      <ellipse cx={88} cy={-150} rx={50} ry={44} fill="#e0a050" stroke={INK} strokeWidth={5} />
      <ellipse cx={70} cy={-176} rx={16} ry={30} fill="#8a5428" stroke={INK} strokeWidth={4} transform="rotate(-20 70 -176)" />
      <circle cx={100} cy={-160} r={7} fill={INK} /><ellipse cx={136} cy={-144} rx={11} ry={9} fill={INK} />
      {bark ? <path d="M 110 -126 Q 124 -110 140 -124" stroke={INK} strokeWidth={5} fill="#5a1620" /> : null}
    </g>
  );
};
export const Phone: React.FC<{ on?: boolean }> = ({ on = true }) => (
  <g><rect x={-28} y={-54} width={56} height={100} rx={10} fill="#2a2440" stroke={INK} strokeWidth={6} /><rect x={-20} y={-44} width={40} height={74} rx={4} fill={on ? "#8ae0ff" : "#1a1428"} />{on ? <Glow x={0} y={-8} r={90} g="gC" o={0.7} /> : null}</g>
);
