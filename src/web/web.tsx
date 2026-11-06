// «Тебе заблокировали сайт. Но исчез ли он из интернета?» — шортс 9:16 (1080×1920) в стиле ролика Minecraft
// (скилл flat-cartoon-video): мир из кубиков, плоская яркая 2D-мультяшка с толстым контуром, свечение, параллакс.
// Озвучка Fish (русский, паузы между предложениями) за кадром, склейки по словам, субтитры внизу.
import React from "react";
import { AbsoluteFill, Audio, Easing, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Bean, BANKER, Defs, Earth, Glow, Grade, HERO2D, INK, LOOKS, YEL, ip, walkPose } from "../mc/kit";
import type { Tod } from "../mc/kit";
import { VOICE } from "./voices/p1";

export const W = 1080, H = 1920, FPS = 30, LEAD = 6;
type Word = { t: number; e: number; w: string; end: boolean; pause: boolean };
const V = VOICE as { dur: number; words: Word[] };
export const FRAMES = Math.round((V.dur + 1.2) * FPS) + LEAD;

const fontH = delayRender("web fonts");
Promise.all(["latin", "cyrillic"].map((k) => new FontFace("WebMont", `url(${staticFile(`towers/fonts/Montserrat-${k}.woff2`)}) format("woff2")`, { weight: "100 900" }).load()))
  .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontH); }).catch(() => continueRender(fontH));

const hash = (a: number, b: number) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const at = (w: string, n = 1) => {
  const x = V.words.filter((v) => v.w.toLowerCase() === w.toLowerCase())[n - 1];
  if (!x) throw new Error(`нет слова «${w}» №${n}`);
  return Math.round(x.t * FPS) + LEAD;
};

// ---------- кадр 9:16 и камера с параллаксом ----------
type Cam = { x: number; y: number; z: number; r?: number };
const lerpCam = (g: number, len: number, a: Cam, b: Cam): Cam => {
  const t = Easing.inOut(Easing.sin)(clamp01(g / Math.max(1, len)));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * t };
};
const L: React.FC<{ cam: Cam; d?: number; blur?: number; children: React.ReactNode }> = ({ cam, d = 1, blur, children }) => {
  const z = 1 + (cam.z - 1) * d;
  return <g transform={`translate(${W / 2} ${H / 2}) rotate(${(cam.r ?? 0) * d}) scale(${z}) translate(${-cam.x * d} ${-cam.y * d})`} filter={blur ? `url(#blur${blur})` : undefined}>{children}</g>;
};
const Frame: React.FC<{ tod?: Tod; dark?: number; children: React.ReactNode }> = ({ tod = "night", dark = 0, children }) => (
  <>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <defs>
        <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7af0ff" stopOpacity={0.55} /><stop offset="50%" stopColor="#3ab0ff" stopOpacity={0.25} /><stop offset="100%" stopColor="#7af0ff" stopOpacity={0.55} /></linearGradient>
      </defs>
      {children}
    </svg>
    <Grade tod={tod} dark={dark} />
  </>
);

// ---------- общие кубики ----------
const Cube: React.FC<{ x: number; y: number; s: number; c: string; top?: string; sw?: number; o?: number }> = ({ x, y, s, c, top, sw = 6, o = 1 }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={s} height={s} fill={c} stroke={INK} strokeWidth={sw} />
    <rect x={x + sw} y={y + sw} width={s - 2 * sw} height={s * 0.16} fill={top ?? "#ffffff"} opacity={0.22} />
    <rect x={x + sw} y={y + s * 0.78} width={s - 2 * sw} height={s * 0.16} fill="#000" opacity={0.12} />
  </g>
);
const Stars: React.FC<{ f: number; n?: number; w?: number; h?: number; x0?: number; y0?: number }> = ({ f, n = 90, w = 3000, h = 3000, x0 = -1500, y0 = -1500 }) => (
  <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + hash(i, 3) * w} y={y0 + hash(i, 7) * h} width={9} height={9} fill="#fff" opacity={0.35 + 0.65 * Math.abs(Math.sin(f * 0.05 + i))} />)}</g>
);
const Lock: React.FC<{ x: number; y: number; s?: number; c?: string; open?: number }> = ({ x, y, s = 1, c = "#ff3a4a", open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={110} g={c === "#ff3a4a" ? "gR" : "gC"} o={0.6} />
    <path d={`M -30 -10 L -30 -44 Q -30 -78 0 -78 Q 30 -78 30 -44 L 30 ${-10 - open * 30}`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="square" />
    <path d={`M -30 -10 L -30 -44 Q -30 -78 0 -78 Q 30 -78 30 -44 L 30 ${-10 - open * 30}`} fill="none" stroke="#c8ccd8" strokeWidth={13} strokeLinecap="square" />
    <rect x={-52} y={-16} width={104} height={84} fill={c} stroke={INK} strokeWidth={8} />
    <rect x={-44} y={-8} width={88} height={14} fill="#fff" opacity={0.25} />
    <rect x={-9} y={14} width={18} height={30} fill={INK} />
  </g>
);
const Check: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={0} r={110} g="gC" o={0.5} />
    <rect x={-50} y={-50} width={100} height={100} fill="#5ac84a" stroke={INK} strokeWidth={8} />
    <path d="M -26 0 L -6 22 L 28 -22" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="square" />
  </g>
);
// пакет данных: светящийся жёлтый кубик-конверт
const Packet: React.FC<{ x: number; y: number; s?: number; f: number; c?: string }> = ({ x, y, s = 1, f, c = YEL }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.3) * 6})`}>
    <Glow x={0} y={0} r={120} g="gY" o={0.8} />
    <rect x={-46} y={-34} width={92} height={68} fill={c} stroke={INK} strokeWidth={7} />
    <path d="M -46 -34 L 0 4 L 46 -34" fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

// ---------- комната героя ночью: стена из досок, окно с ночным городом, стол, монитор ----------
const Monitor: React.FC<{ x: number; y: number; s?: number; mode: "denied" | "url" | "ok"; f: number; typed?: number }> = ({ x, y, s = 1, mode, f, typed = 1 }) => {
  const red = mode === "denied";
  const url = "мой-любимый-сайт.com".slice(0, Math.round(20 * typed));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={-160} r={520} g={red ? "gR" : "gC"} o={red ? 0.55 + 0.15 * Math.sin(f * 0.4) : 0.5} />
      <rect x={-40} y={-30} width={80} height={60} fill="#3a3450" stroke={INK} strokeWidth={6} />
      <rect x={-120} y={20} width={240} height={30} fill="#3a3450" stroke={INK} strokeWidth={6} />
      <rect x={-330} y={-400} width={660} height={390} fill="#2a2440" stroke={INK} strokeWidth={10} />
      <rect x={-300} y={-372} width={600} height={334} fill={red ? "#2a0a1a" : "#e8f4ff"} />
      {red ? <>
        <rect x={-300} y={-372} width={600} height={334} fill="#ff3a4a" opacity={0.12 + 0.08 * Math.sin(f * 0.4)} />
        <Lock x={0} y={-235} s={0.95} />
        <text x={0} y={-80} textAnchor="middle" fontFamily="WebMont" fontWeight={900} fontSize={62} fill="#ff4a5a" stroke={INK} strokeWidth={10} paintOrder="stroke">ACCESS DENIED</text>
      </> : <>
        <rect x={-300} y={-372} width={600} height={58} fill="#c8d4ea" />
        {[0, 1, 2].map((i) => <rect key={i} x={-286 + i * 30} y={-352} width={18} height={18} fill={["#ff5a6a", "#ffd23c", "#5ac84a"][i]} stroke={INK} strokeWidth={3} />)}
        <rect x={-180} y={-358} width={460} height={32} fill="#fff" stroke={INK} strokeWidth={4} />
        <text x={-166} y={-334} fontFamily="WebMont" fontWeight={700} fontSize={22} fill={INK}>{url}{mode === "url" && f % 20 < 10 ? "|" : ""}</text>
        {mode === "ok" ? <>
          <rect x={-260} y={-290} width={520} height={90} fill="#7a5ac8" stroke={INK} strokeWidth={5} />
          {[0, 1, 2].map((i) => <rect key={i} x={-260 + i * 180} y={-180} width={160} height={120} fill={["#ff8ab0", "#5ae0ff", "#ffd23c"][i]} stroke={INK} strokeWidth={5} />)}
        </> : null}
      </>}
    </g>
  );
};
const Room: React.FC<{ cam: Cam; f: number; mode: "denied" | "url" | "ok"; typed?: number; hero?: React.ReactNode; dark?: number; children?: React.ReactNode }> = ({ cam, f, mode, typed, hero, dark = 0.2, children }) => (
  <Frame tod="night" dark={dark}>
    <L cam={cam} d={0.85} blur={2}>
      <rect x={-1500} y={-1800} width={3000} height={2800} fill="#3a2858" />
      {Array.from({ length: 14 * 12 }, (_, i) => { const c = i % 14, r = Math.floor(i / 14); const x = -1400 + c * 200, y = -1700 + r * 200; return (x > 120 && x < 620 && y > -900 && y < -380) ? null : <g key={i}><rect x={x} y={y} width={200} height={200} fill={(c + r) % 2 ? "#5a3a6a" : "#523462"} stroke={INK} strokeWidth={5} /><rect x={x + 6} y={y + 60} width={188} height={5} fill={INK} opacity={0.35} /><rect x={x + 6} y={y + 130} width={188} height={5} fill={INK} opacity={0.35} /></g>; })}
      {/* окно: ночной кубический город */}
      <rect x={130} y={-900} width={500} height={520} fill="url(#sky-night)" stroke={INK} strokeWidth={10} />
      <Stars f={f} n={14} w={480} h={220} x0={140} y0={-890} />
      {[[150, 4, "#3a2a86"], [240, 6, "#46309a"], [330, 3, "#5a3aa8"], [420, 5, "#3a2a86"], [520, 4, "#46309a"]].map(([x, h, c], i) => <g key={i}>{Array.from({ length: h as number }, (_, j) => <g key={j}><rect x={x as number} y={-380 - (j + 1) * 50} width={90} height={50} fill={c as string} stroke={INK} strokeWidth={4} />{hash(i, j) > 0.5 ? <rect x={(x as number) + 30} y={-380 - (j + 1) * 50 + 16} width={28} height={18} fill={YEL} /> : null}</g>)}</g>)}
      <path d="M 380 -900 L 380 -380 M 130 -640 L 630 -640" stroke={INK} strokeWidth={10} />
    </L>
    <L cam={cam}>
      {/* стол */}
      <rect x={-760} y={130} width={1500} height={60} fill="#a86a3a" stroke={INK} strokeWidth={8} />
      <rect x={-740} y={190} width={60} height={600} fill="#7a4a2a" stroke={INK} strokeWidth={8} />
      <rect x={640} y={190} width={60} height={600} fill="#7a4a2a" stroke={INK} strokeWidth={8} />
      <rect x={-1500} y={790} width={3000} height={1200} fill="#4a2a4a" stroke={INK} strokeWidth={8} />
      <Monitor x={0} y={130} mode={mode} f={f} typed={typed} />
      {/* клавиатура и кружка */}
      <rect x={-220} y={106} width={300} height={28} fill="#c8ccd8" stroke={INK} strokeWidth={5} />
      <rect x={420} y={40} width={70} height={90} fill="#ff8ab0" stroke={INK} strokeWidth={6} />
      {hero}
      {children}
    </L>
  </Frame>
);

// ---------- дата-центр: ряды серверных стоек ----------
const Rack: React.FC<{ x: number; y: number; f: number; hot?: boolean; s?: number }> = ({ x, y, f, hot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {hot ? <Glow x={0} y={-420} r={520} g="gC" o={0.7 + 0.2 * Math.sin(f * 0.2)} /> : null}
    <rect x={-150} y={-860} width={300} height={860} fill="#2a2f48" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 9 }, (_, i) => <g key={i}>
      <rect x={-128} y={-836 + i * 92} width={256} height={74} fill="#3a4060" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-108 + k * 30} y={-812 + i * 92} width={16} height={16} fill={hash(i * 4 + k, Math.floor(f / 6) + x) > 0.4 ? ["#5ae0ff", "#5ac84a", YEL, "#ff8ab0"][k] : "#1a1d2e"} stroke={INK} strokeWidth={3} />)}
      <rect x={30} y={-808} width={80} height={10} fill={INK} opacity={0.5} />
    </g>)}
  </g>
);
const DataCenter: React.FC<{ cam: Cam; f: number; hot?: boolean; children?: React.ReactNode; dark?: number }> = ({ cam, f, hot = true, children, dark = 0.15 }) => (
  <Frame tod="night" dark={dark}>
    <L cam={cam} d={0.5} blur={4}>
      <rect x={-3000} y={-3000} width={6000} height={6000} fill="#120a30" />
      {Array.from({ length: 9 }, (_, i) => <Rack key={i} x={-1600 + i * 400} y={400} f={f + i * 7} s={0.8} />)}
    </L>
    <L cam={cam} d={0.75} blur={2}>
      {Array.from({ length: 7 }, (_, i) => i === 3 ? null : <Rack key={i} x={-1350 + i * 450} y={560} f={f + i * 11} s={0.95} />)}
    </L>
    <L cam={cam}>
      {Array.from({ length: 16 * 5 }, (_, i) => <rect key={i} x={-1600 + (i % 16) * 200} y={720 + Math.floor(i / 16) * 200} width={200} height={200} fill={i % 2 ? "#3a3a6a" : "#34345e"} stroke={INK} strokeWidth={6} />)}
      <Rack x={0} y={720} f={f} hot={hot} />
      {children}
    </L>
  </Frame>
);

// ---------- космос и Земля с сетью узлов ----------
const NODES: [number, number][] = [[-330, -120], [-160, -330], [120, -300], [330, -90], [260, 220], [-60, 330], [-300, 200], [20, -20]];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [7, 0], [7, 2], [7, 4], [7, 5], [1, 7], [3, 7]];
const Space: React.FC<{ cam: Cam; f: number; children?: React.ReactNode; earthR?: number; net?: number; dark?: number; lights?: number }> = ({ cam, f, children, earthR = 400, net = 1, dark = 0, lights = 0.5 }) => (
  <Frame tod="night" dark={dark}>
    <L cam={cam} d={0.1}><rect x={-3000} y={-3000} width={6000} height={6000} fill="#0a0628" /><Stars f={f} n={160} w={4000} h={5000} x0={-2000} y0={-2500} /></L>
    <L cam={cam}>
      <Earth x={0} y={0} r={earthR} f={f} lights={lights} night={0.15} />
      {net > 0 ? <g opacity={net}>
        {LINKS.map(([a, b], i) => <line key={i} x1={NODES[a][0] * earthR / 400} y1={NODES[a][1] * earthR / 400} x2={NODES[b][0] * earthR / 400} y2={NODES[b][1] * earthR / 400} stroke="#7af0ff" strokeWidth={7} strokeDasharray="22 14" strokeDashoffset={-f * 3} opacity={0.9} />)}
        {NODES.map(([x, y], i) => <g key={i}><Glow x={x * earthR / 400} y={y * earthR / 400} r={60} g="gC" o={0.9} /><rect x={x * earthR / 400 - 18} y={y * earthR / 400 - 18} width={36} height={36} fill="#7af0ff" stroke={INK} strokeWidth={6} /></g>)}
      </g> : null}
      {children}
    </L>
  </Frame>
);
const pathPt = (ids: number[], u: number, k = 1): [number, number] => {
  const seg = ids.length - 1, s = Math.min(seg - 1e-6, clamp01(u) * seg), i = Math.floor(s), t = s - i;
  const a = NODES[ids[i]], b = NODES[ids[i + 1]];
  return [(a[0] + (b[0] - a[0]) * t) * k, (a[1] + (b[1] - a[1]) * t) * k];
};

// ---------- дорога со шлагбаумом (провайдер) ----------
const Road: React.FC<{ cam: Cam; f: number; arm: number; children?: React.ReactNode }> = ({ cam, f, arm, children }) => (
  <Frame tod="dusk" dark={0.1}>
    <L cam={cam} d={0.08}><rect x={-3000} y={-3000} width={6000} height={3600} fill="url(#sky-dusk)" /><rect x={-170} y={-560} width={240} height={240} fill="#fff2a0" stroke={INK} strokeWidth={8} /><Glow x={-50} y={-440} r={500} g="gY" o={0.6} /></L>
    <L cam={cam} d={0.4} blur={4}>
      {Array.from({ length: 14 }, (_, i) => { const h = 3 + Math.floor(hash(i, 2) * 6); return <g key={i}>{Array.from({ length: h }, (_, j) => <rect key={j} x={-1600 + i * 240} y={200 - (j + 1) * 110} width={200} height={110} fill={["#3a2a86", "#46309a", "#5a3aa8"][i % 3]} stroke={INK} strokeWidth={5} />)}</g>; })}
    </L>
    <L cam={cam}>
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-3000 + i * 200} y={300} width={200} height={200} fill={(i % 2) ? "#5ac84a" : "#52bc44"} stroke={INK} strokeWidth={6} />)}
      <rect x={-3000} y={500} width={6000} height={300} fill="#4a4472" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 30 }, (_, i) => <rect key={"d" + i} x={-3000 + i * 200 + 50} y={640} width={100} height={20} fill={YEL} stroke={INK} strokeWidth={4} />)}
      {Array.from({ length: 30 }, (_, i) => <rect key={"s" + i} x={-3000 + i * 200} y={800} width={200} height={200} fill="#8a86a8" stroke={INK} strokeWidth={6} />)}
      {/* будка провайдера и шлагбаум */}
      <rect x={160} y={140} width={240} height={360} fill="#e04a5a" stroke={INK} strokeWidth={8} />
      <rect x={190} y={190} width={180} height={120} fill="#8ae0ff" stroke={INK} strokeWidth={6} />
      <rect x={140} y={110} width={280} height={50} fill="#2a2440" stroke={INK} strokeWidth={7} />
      <rect x={110} y={360} width={70} height={140} fill="#c8ccd8" stroke={INK} strokeWidth={7} />
      <g transform={`translate(145 380) rotate(${arm})`}>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-i * 90 - 90} y={-22} width={90} height={44} fill={i % 2 ? "#ffffff" : "#ff3a4a"} stroke={INK} strokeWidth={7} />)}
      </g>
      {children}
    </L>
  </Frame>
);

// ---------- карта мира из кубиков ----------
const MC = 40, MR = 20, CELL = 25;
const CONT: [number, number, number, number][] = [[8, 5, 5.5, 3.2], [10.5, 9, 2.2, 2], [15, 2.4, 2.2, 1.2], [13.5, 14.2, 2.4, 4], [21, 5, 3, 2], [22.5, 12, 3.4, 4.4], [30, 5.5, 8, 3.2], [28.5, 9, 3, 2], [27, 10.5, 1.4, 2], [32.5, 11, 1.6, 1.3], [31, 8, 3, 2], [36.6, 7, 0.7, 1.4], [34.5, 15.5, 3, 1.9]];
type Country = { id: string; x: number; y: number; c: string };
const COUNTRIES: Country[] = [
  { id: "na1", x: 7, y: 4, c: "#e07ab8" }, { id: "na2", x: 10, y: 8, c: "#7a8af0" }, { id: "gl", x: 15, y: 2.4, c: "#f4f6ff" },
  { id: "sa1", x: 13, y: 13, c: "#5ac8a0" }, { id: "sa2", x: 14, y: 16.5, c: "#ffb05a" },
  { id: "eu1", x: 20, y: 4.5, c: "#7a5ac8" }, { id: "eu2", x: 22.5, y: 5.5, c: "#ffd23c" },
  { id: "af1", x: 21.5, y: 9.5, c: "#ff8a6a" }, { id: "af2", x: 23, y: 13.5, c: "#c8e05a" },
  { id: "ru", x: 31, y: 3.5, c: "#5a9ae0" }, { id: "me", x: 26, y: 8, c: "#e0a05a" }, { id: "in", x: 27, y: 10.5, c: "#ff7aa0" },
  { id: "cn", x: 31.5, y: 7.6, c: "#ff3a4a" }, { id: "sea", x: 32.5, y: 11, c: "#5ac84a" }, { id: "jp", x: 36.6, y: 7, c: "#5ae0ff" }, { id: "au", x: 34.5, y: 15.5, c: "#f0c060" },
];
const MAP: (number | null)[][] = (() => {
  const g: (number | null)[][] = [];
  for (let r = 0; r < MR; r++) { g.push([]); for (let c = 0; c < MC; c++) {
    const x = c + 0.5, y = r + 0.5;
    const land = CONT.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 - 0.18 * hash(c, r));
    if (!land) { g[r].push(null); continue; }
    let bi = 0, bd = 1e9;
    COUNTRIES.forEach((k, i) => { const d = (x - k.x) ** 2 + (y - k.y) ** 2; if (d < bd) { bd = d; bi = i; } });
    if (c >= 36 && c <= 37 && r >= 5 && r <= 8) bi = COUNTRIES.findIndex((k) => k.id === "jp");
    g[r].push(bi);
  } }
  return g;
})();
export const cellXY = (id: string): [number, number] => { const k = COUNTRIES.find((q) => q.id === id)!; return [(k.x - MC / 2) * CELL, (k.y - MR / 2) * CELL]; };
const WorldMap: React.FC<{ cam: Cam; f: number; hi?: Record<string, number>; dimOthers?: number; children?: React.ReactNode }> = ({ cam, f, hi = {}, dimOthers = 0, children }) => (
  <Frame tod="night" dark={0.1}>
    <L cam={cam} d={0.1}><rect x={-3000} y={-3000} width={6000} height={6000} fill="#0e1a4a" /><Stars f={f} n={70} w={4000} h={5000} x0={-2000} y0={-2500} /></L>
    <L cam={cam}>
      <rect x={-MC * CELL / 2 - 30} y={-MR * CELL / 2 - 30} width={MC * CELL + 60} height={MR * CELL + 60} fill="#2a6ad8" stroke={INK} strokeWidth={10} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-MC * CELL / 2 + hash(i, 9) * MC * CELL} y={-MR * CELL / 2 + hash(i, 4) * MR * CELL} width={40} height={8} fill="#5a9aff" opacity={0.6} transform={`translate(${Math.sin(f * 0.04 + i) * 14} 0)`} />)}
      {MAP.map((row, r) => row.map((k, c) => {
        if (k === null) return null;
        const C = COUNTRIES[k], x = (c - MC / 2) * CELL, y = (r - MR / 2) * CELL, h = hi[C.id] ?? 0;
        const dim = dimOthers * (1 - (h > 0 ? 1 : 0));
        return <g key={r * MC + c}>
          <rect x={x} y={y} width={CELL} height={CELL} fill={C.c} stroke={INK} strokeWidth={2} opacity={1 - dim * 0.6} />
          <rect x={x + 2} y={y + 2} width={CELL - 4} height={5} fill="#fff" opacity={0.18} />
          {/* граница страны */}
          {r > 0 && MAP[r - 1][c] !== null && MAP[r - 1][c] !== k ? <rect x={x} y={y - 2} width={CELL} height={4} fill={INK} /> : null}
          {c > 0 && row[c - 1] !== null && row[c - 1] !== k ? <rect x={x - 2} y={y} width={4} height={CELL} fill={INK} /> : null}
          {h > 0 ? <rect x={x} y={y} width={CELL} height={CELL} fill="#fff" opacity={0.25 * h * (0.6 + 0.4 * Math.sin(f * 0.3))} /> : null}
        </g>;
      }))}
      {children}
    </L>
  </Frame>
);

// ---------- туннель VPN между двумя точками ----------
const Tunnel: React.FC<{ a: [number, number]; b: [number, number]; p: number; f: number; w?: number; lift?: number; pkt?: number }> = ({ a, b, p, f, w = 70, lift = 260, pkt }) => {
  const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - lift;
  const pt = (u: number): [number, number] => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
  const N = 40, n = Math.max(1, Math.round(N * clamp01(p)));
  const pts = Array.from({ length: n + 1 }, (_, i) => pt((i / N)));
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const pp = pkt !== undefined ? pt(clamp01(pkt) * clamp01(p)) : null;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 18} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#1a5aa8" strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#7af0ff" strokeWidth={w * 0.55} strokeLinecap="round" opacity={0.55} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={8} strokeDasharray="10 40" strokeDashoffset={-f * 6} opacity={0.9} />
      {Array.from({ length: Math.floor(n / 5) }, (_, i) => { const [x, y] = pts[(i + 1) * 5]; return <g key={i}><Glow x={x} y={y} r={w * 1.6} g="gC" o={0.5} /></g>; })}
      {pp ? <Packet x={pp[0]} y={pp[1]} s={0.55} f={f} /> : null}
    </g>
  );
};

// лупа в руке провайдера
const Magnifier = <g><circle cx={0} cy={-70} r={46} fill="#bfe8ff" fillOpacity={0.5} stroke={INK} strokeWidth={10} /><rect x={-8} y={-26} width={16} height={60} fill="#7a4a2a" stroke={INK} strokeWidth={6} /></g>;

// ---------- субтитры: по 2–4 слова, внизу ----------
type Chunk = { t: number; e: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ t: cur[0].t, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  for (const w of V.words) {
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (w.end || w.pause || cur.length >= 3 || len > 14) flush();
  }
  flush();
  return out;
})();
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const i = CHUNKS.findIndex((c, k) => t >= c.t - 0.05 && t < (CHUNKS[k + 1] ? Math.min(CHUNKS[k + 1].t - 0.05, c.e + 0.35) : c.e + 0.6));
  if (i < 0) return null;
  const c = CHUNKS[i], pop = clamp01((t - c.t + 0.05) / 0.12);
  const text = c.words.map((w) => w.w.toUpperCase());
  const est = text.join(" ").length * 0.76 * 74, fit = Math.min(1, 960 / est);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${W / 2} 1580) scale(${(0.85 + 0.15 * pop) * fit})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily="WebMont" fontWeight={900} fontSize={74} letterSpacing={-1} stroke={INK} strokeWidth={22} strokeLinejoin="round" paintOrder="stroke" fill="#fff">
          {text.map((w, k) => <tspan key={k} fill={t >= c.words[k].t - 0.03 && t < c.words[k].e + 0.1 ? YEL : "#ffffff"}>{(k ? " " : "") + w}</tspan>)}
        </text>
      </g>
    </svg>
  );
};

// ---------- склейки по словам ----------
type Shot = { at: string; n?: number; s: (g: number, f: number, len: number) => React.ReactNode };
const HS = 1.45;
const Hero = (p: any) => <Bean s={HS} look={HERO2D} {...p} />;
const SHOTS: Shot[] = [
  // 0–5 с: ночь, герой у экрана с надписью ACCESS DENIED
  { at: "", s: (g, f, len) => <Room cam={lerpCam(g, len, { x: 0, y: 240, z: 0.9 }, { x: 0, y: 250, z: 1.0 })} f={f} mode="denied"
    hero={<Hero x={-390} y={790} f={f} expr="shock" open={0.6} pose={{ armL: [40, 30], armR: [30, 20], tilt: Math.sin(f * 0.2) * 3 }} flip />} /> },
  { at: "Но", s: (g, f, len) => <Room cam={lerpCam(g, len, { x: 0, y: -120, z: 1.45 }, { x: 0, y: -110, z: 1.65 })} f={f} mode="denied" dark={0.35} /> },
  { at: "Нет", s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 200, z: 0.85 }, { x: 0, y: 260, z: 1.0 })} f={f}>
    <g transform="translate(0 -170)"><Check x={0} y={0} s={0.9 + 0.1 * Math.sin(g * 0.3)} /></g></DataCenter> },
  // 5–15 с: сайт, сервер и глобальная сеть
  { at: "Сайт", n: 2, s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 260, z: 1.1 }, { x: 0, y: 300, z: 1.25 })} f={f}>
    {Array.from({ length: 6 }, (_, i) => { const u = clamp01((g - i * 7) / 26); const x = -300 + (i % 3) * 300, y = -420 + Math.floor(i / 3) * 300; return u < 1 ? <g key={i} transform={`translate(${x + (0 - x) * u} ${y + (-300 - y) * u}) scale(${2.2 - 1.6 * u})`}><rect x={-46} y={-60} width={92} height={120} fill="#fff" stroke={INK} strokeWidth={7} /><rect x={-30} y={-36} width={60} height={10} fill="#7a5ac8" /><rect x={-30} y={-14} width={60} height={10} fill="#5ae0ff" /><rect x={-30} y={8} width={40} height={10} fill="#ff8ab0" /></g> : null; })}
  </DataCenter> },
  { at: "Когда", s: (g, f, len) => <Room cam={lerpCam(g, len, { x: -120, y: 260, z: 1.0 }, { x: -120, y: 270, z: 1.08 })} f={f} mode="url" typed={clamp01(g / 30)}
    hero={<Hero x={-400} y={790} f={f} expr="neutral" pose={{ armR: [70 + Math.sin(f * 1.2) * 8, 40], armL: [60 + Math.sin(f * 1.3 + 1) * 8, 40] }} flip />} /> },
  { at: "запрос", s: (g, f, len) => { const [x, y] = pathPt([6, 0, 1, 7, 2, 3], clamp01(g / len * 1.05)); return <Space cam={lerpCam(g, len, { x: 0, y: 130, z: 1.15 }, { x: 0, y: 130, z: 1.3 })} f={f}><Packet x={x} y={y} s={0.75} f={f} /></Space>; } },
  { at: "прямо", s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 250, z: 0.95 }, { x: 0, y: 280, z: 1.1 })} f={f}>
    <Packet x={ip(g, [0, 18], [-700, 0])} y={ip(g, [0, 18], [-700, -420])} s={0.9 * (1 - clamp01((g - 18) / 8))} f={f} />
    {g > 18 ? <Glow x={0} y={-420} r={400 * clamp01((g - 18) / 10)} g="gY" o={1 - clamp01((g - 28) / 20)} /> : null}
  </DataCenter> },
  // блокировка: шлагбаум провайдера, а сервер на месте
  { at: "Блокировка", s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 300, z: 1.25 }, { x: 0, y: 320, z: 1.35 })} f={f}><Check x={0} y={-940} s={0.8} /></DataCenter> },
  { at: "Провайдер", s: (g, f, len) => { const x = ip(g, [0, 34], [-1300, -150]), bump = g > 34 && g < 44 ? Math.sin((g - 34) * 1.2) * 18 * (1 - (g - 34) / 10) : 0;
    return <Road cam={lerpCam(g, len, { x: -150, y: 380, z: 0.95 }, { x: -60, y: 390, z: 1.05 })} f={f} arm={0}>
      <Packet x={x - bump} y={560} s={0.9} f={f} />{g > 36 ? <g transform="translate(-150 410)"><path d="M -50 -50 L 50 50 M 50 -50 L -50 50" stroke={INK} strokeWidth={34} strokeLinecap="square" /><path d="M -50 -50 L 50 50 M 50 -50 L -50 50" stroke="#ff3a4a" strokeWidth={18} strokeLinecap="square" /></g> : null}
      <Bean x={280} y={500} s={0.8} look={BANKER} f={f} expr="smirk" pose={{ armR: [60, 30] }} flip />
    </Road>; } },
  { at: "А", n: 1, s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 330, z: 0.8 }, { x: 0, y: 330, z: 0.9 })} f={f}>
    <Hero x={330} y={720} f={f} expr="grin" pose={{ armL: [100, 40], armR: [100, 40], tilt: Math.sin(f * 0.1) * 5 }} /></DataCenter> },
  // 15–30 с: карта мира
  { at: "Поэтому", s: (g, f, len) => <WorldMap cam={lerpCam(g, len, { x: 0, y: -40, z: 1.0 }, { x: 0, y: -40, z: 1.06 })} f={f} hi={{ eu1: 1, eu2: 1 }}>
    <Hero x={-300} y={-280} s={0.75} f={f} expr="neutral" pose={{ armR: [70, 20] }} />
    <Lock x={cellXY("eu1")[0]} y={cellXY("eu1")[1] - 70} s={0.55} /><Check x={cellXY("eu2")[0] + 40} y={cellXY("eu2")[1] - 60} s={0.55} /></WorldMap> },
  { at: "Китае", s: (g, f, len) => <WorldMap cam={lerpCam(g, len, { x: 120, y: -90, z: 1.4 }, { x: 230, y: -70, z: 2.1 })} f={f} hi={{ cn: 1, jp: 1 }} dimOthers={0.6}>
    {g > 6 ? <Lock x={cellXY("cn")[0]} y={cellXY("cn")[1] - 20} s={0.5} /> : null}{g > 30 ? <Check x={cellXY("jp")[0] + 6} y={cellXY("jp")[1] - 60} s={0.42} /> : null}</WorldMap> },
  { at: "Интернет", n: 1, s: (g, f, len) => <WorldMap cam={lerpCam(g, len, { x: 0, y: -40, z: 1.15 }, { x: 0, y: -40, z: 0.98 })} f={f}>
    <Hero x={380} y={-280} s={0.75} f={f} expr="grin" pose={{ armL: [120, 30], armR: [120, 30] }} />
    {(["na1", "eu1", "cn", "ru", "me", "au", "sa1", "af1"] as const).map((id, i) => { const [x, y] = cellXY(id); const o = clamp01((g - i * 4) / 8); return <g key={id} opacity={o}>{i % 2 ? <Check x={x} y={y - 50} s={0.36} /> : <Lock x={x} y={y - 40} s={0.36} />}</g>; })}
  </WorldMap> },
  // 30–45 с: VPN
  { at: "И", n: 3, s: (g, f, len) => <Room cam={lerpCam(g, len, { x: -100, y: 250, z: 0.95 }, { x: -100, y: 260, z: 1.02 })} f={f} mode="denied"
    hero={<Hero x={-400} y={790} f={f} expr="smirk" pose={{ armR: [70, 40], armL: [150, 30] }} flip />}>
    {g > 10 ? <g transform={`translate(0 ${-280 + (1 - clamp01((g - 10) / 10)) * 60}) scale(${clamp01((g - 10) / 10)})`}><Glow x={0} y={0} r={360} g="gC" o={0.9} /><path d="M 0 -150 L 130 -100 L 120 40 Q 90 120 0 160 Q -90 120 -120 40 L -130 -100 Z" fill="#3ab0ff" stroke={INK} strokeWidth={12} /><Lock x={0} y={20} s={0.75} c="#5ae0ff" /></g> : null}
  </Room> },
  { at: "Он", n: 3, s: (g, f, len) => { const a = cellXY("eu1"), b = cellXY("jp"); return <WorldMap cam={lerpCam(g, len, { x: 0, y: -100, z: 1.0 }, { x: 0, y: -110, z: 1.06 })} f={f} hi={{ eu1: 1, jp: 1 }}>
    <Tunnel a={a} b={b} p={clamp01(g / 40)} f={f} pkt={clamp01((g - 40) / 30)} lift={380} /><Lock x={a[0]} y={a[1] - 10} s={0.35} c="#5ae0ff" /></WorldMap>; } },
  { at: "Провайдер", n: 2, s: (g, f, len) => <Road cam={lerpCam(g, len, { x: 0, y: 380, z: 0.95 }, { x: 40, y: 390, z: 1.02 })} f={f} arm={70}>
    <Tunnel a={[-1500, 470]} b={[1500, 470]} p={1} f={f} w={150} lift={0} pkt={(g % 60) / 60} />
    <Bean x={250} y={500} s={0.8} look={BANKER} f={f} expr={g > 40 ? "sad" : "neutral"} holdR={{ node: Magnifier, rot: -20 }} pose={{ armR: [110, 30], tilt: g > 40 ? Math.sin(f * 0.3) * 6 : 0 }} flip />
  </Road> },
  { at: "Правда", s: (g, f, len) => <WorldMap cam={lerpCam(g, len, { x: 0, y: -40, z: 1.05 }, { x: 0, y: -40, z: 1.12 })} f={f} hi={{ cn: 1, ru: 1, me: 1 }} dimOthers={0.5}>
    <Hero x={-380} y={-280} s={0.75} f={f} expr="sad" pose={{ armR: [40, 20] }} />
    {(["cn", "ru", "me"] as const).map((id, i) => { const [x, y] = cellXY(id); return <g key={id} opacity={clamp01((g - i * 8) / 8)}><Lock x={x} y={y - 30} s={0.4} /></g>; })}</WorldMap> },
  // 45–55 с: Земля и надпись «Интернет без границ?»
  { at: "Так", n: 1, s: (g, f, len) => <DataCenter cam={lerpCam(g, len, { x: 0, y: 300, z: 0.9 }, { x: 0, y: 300, z: 0.82 })} f={f}>
    {[-1, 1].map((k) => <Tunnel key={k} a={[k * 1300, -100]} b={[0, -420]} p={clamp01(g / 30)} f={f} w={60} lift={100} />)}
    <Packet x={0} y={-1000 + 40 * Math.sin(f * 0.1)} s={0.8} f={f} /></DataCenter> },
  { at: "Так", n: 2, s: (g, f, len) => <Space cam={lerpCam(g, len, { x: 0, y: 150, z: 0.82 }, { x: 0, y: 140, z: 0.88 })} f={f} earthR={380} net={0.8} lights={0.6}>
    <g transform={`translate(0 ${490}) scale(${0.85 + 0.15 * clamp01(g / 12)})`} opacity={clamp01(g / 8)}>
      <text x={0} y={0} textAnchor="middle" fontFamily="WebMont" fontWeight={900} fontSize={112} stroke={INK} strokeWidth={26} strokeLinejoin="round" paintOrder="stroke" fill="#ffffff">ИНТЕРНЕТ</text>
      <text x={0} y={125} textAnchor="middle" fontFamily="WebMont" fontWeight={900} fontSize={112} stroke={INK} strokeWidth={26} strokeLinejoin="round" paintOrder="stroke" fill={YEL}>БЕЗ ГРАНИЦ?</text>
    </g>
    <Hero x={0} y={-372} s={0.55} f={f} expr="grin" pose={{ armR: [150 + Math.sin(f * 0.25) * 18, 30], armL: [20, 10] }} />
  </Space> },
];
const STARTS = SHOTS.map((s, i) => (i === 0 ? 0 : at(s.at, s.n) - 3));

export const WebShort: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0; while (i + 1 < STARTS.length && f >= STARTS[i + 1]) i++;
  const end = i + 1 < STARTS.length ? STARTS[i + 1] : FRAMES;
  const g = f - STARTS[i];
  const punch = 1 + 0.04 * Math.max(0, 1 - g / 6);
  const fadeIn = 1 - clamp01(f / 10), fadeOut = clamp01((f - (FRAMES - 24)) / 22);
  return (
    <AbsoluteFill style={{ background: "#120a30" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>{SHOTS[i].s(g, f, end - STARTS[i])}</AbsoluteFill>
      <Subs t={(f - LEAD) / FPS} />
      <AbsoluteFill style={{ background: "#07030f", opacity: Math.max(fadeIn, fadeOut) }} />
      <Audio src={staticFile("web/mix.wav")} />
    </AbsoluteFill>
  );
};
void LOOKS; void walkPose;
void Cube;
