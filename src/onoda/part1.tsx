// «Онода» — часть 1 (0–38 с). Камера всё время в движении, переходы между планами — через быстрый пролёт камеры.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, random, Easing } from "remotion";
import { AnimeChar, INK } from "../esport/anime";
import { Vignette, Grain, Dust, Rays, Burst, RedRage, clamp } from "../esport/sample";
import { ONODA, ONODA_OLD, CMDR, SOLDIERS } from "./looks";
import { VOICE } from "./voice_ru";

export const FPS = 30, LEAD = 0.25, W = 1080, H = 1920;
export const F = (i: number) => Math.round((VOICE.words[i].t + LEAD) * FPS); // кадр слова по номеру
export const P1_END = F(80) - 2; // «Проходят»
export const P1_FRAMES = P1_END;

// ---------- камера ----------
export type Key = [number, number, number, number, number?]; // кадр, x, y, zoom, поворот
export const EZ = Easing.bezier(0.45, 0, 0.2, 1);
export const camAt = (f: number, keys: Key[]) => {
  if (f <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], z: keys[0][3], r: keys[0][4] ?? 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b[0]) {
      const k = EZ((f - a[0]) / Math.max(1, b[0] - a[0]));
      return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k, z: a[3] * Math.pow(b[3] / a[3], k), r: (a[4] ?? 0) + ((b[4] ?? 0) - (a[4] ?? 0)) * k };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l[1], y: l[2], z: l[3], r: l[4] ?? 0 };
};
export type C = ReturnType<typeof camAt>;
export const speed = (f: number, keys: Key[]) => {
  const a = camAt(f - 1, keys), b = camAt(f, keys);
  return Math.hypot(b.x - a.x, b.y - a.y) * b.z + Math.abs(Math.log(b.z / a.z)) * 900;
};
// слой с параллаксом: k=1 — мир героев, k<1 — дальний фон, k>1 — передний план
export const Layer: React.FC<{ c: C; k?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ c, k = 1, blur = 0, children, style }) => (
  <svg width={W} height={H} style={{ position: "absolute", filter: blur ? `blur(${blur}px)` : undefined, ...style }}>
    <g transform={`translate(540,960) rotate(${c.r * k}) scale(${Math.pow(c.z, k)}) translate(${-c.x * k},${-c.y * k})`}>{children}</g>
  </svg>
);
export const Shot: React.FC<{ f: number; keys: Key[]; shake?: number[]; children: (c: C) => React.ReactNode }> = ({ f, keys, shake = [], children }) => {
  const c = { ...camAt(f, keys) };
  for (const s of shake) {
    const k = f - s;
    if (k >= 0 && k < 12) { const a = 16 * (1 - k / 12); c.x += (random("sx" + f) - 0.5) * a * 2; c.y += (random("sy" + f) - 0.5) * a * 2; }
  }
  const v = Math.min(14, speed(f, keys) / 9);
  return <AbsoluteFill style={{ filter: v > 0.6 ? `blur(${v}px)` : undefined }}>{children(c)}</AbsoluteFill>;
};

// ---------- природа ----------
const leafPath = (L: number) => `M 0,0 C ${L * 0.25},${-L * 0.32} ${L * 0.75},${-L * 0.3} ${L},0 C ${L * 0.75},${L * 0.3} ${L * 0.25},${L * 0.32} 0,0 Z`;
export const Leaf: React.FC<{ x: number; y: number; L: number; a: number; c: string; c2?: string }> = ({ x, y, L, a, c, c2 }) => (
  <g transform={`translate(${x},${y}) rotate(${a})`}>
    <path d={leafPath(L)} fill={c} stroke={INK} strokeWidth={Math.max(3, L / 80)} />
    <path d={`M ${L * 0.05},0 L ${L * 0.95},0`} stroke={c2 ?? "#0f3a20"} strokeWidth={Math.max(2, L / 90)} />
    {[0.25, 0.45, 0.65].map((q) => <path key={q} d={`M ${L * q},0 L ${L * (q + 0.12)},${-L * 0.14} M ${L * q},0 L ${L * (q + 0.12)},${L * 0.14}`} stroke={c2 ?? "#0f3a20"} strokeWidth={Math.max(1.5, L / 140)} />)}
  </g>
);
export const Palm: React.FC<{ x: number; y: number; h: number; lean?: number; f: number; dark?: boolean }> = ({ x, y, h, lean = 0.15, f, dark }) => {
  const tx = x + h * lean, ty = y - h;
  const sway = Math.sin(f / 25 + x) * 4;
  return (
    <g>
      <path d={`M ${x - 18},${y} C ${x},${y - h * 0.5} ${tx - 10},${ty + h * 0.3} ${tx - 8},${ty} L ${tx + 8},${ty} C ${tx + 10},${ty + h * 0.3} ${x + 20},${y - h * 0.5} ${x + 18},${y} Z`} fill={dark ? "#2a1e18" : "#7a5a3a"} stroke={INK} strokeWidth={5} />
      {[-160, -120, -70, -20, 20, 60, 200].map((a, i) => <Leaf key={i} x={tx} y={ty} L={h * 0.55} a={a + sway} c={dark ? "#14301e" : i % 2 ? "#2f8a4a" : "#3fa058"} />)}
    </g>
  );
};
export const JungleWall: React.FC<{ seed: string; w: number; y: number; dark?: number; f: number }> = ({ seed, w, y, dark = 0, f }) => (
  <g>
    {Array.from({ length: 40 }).map((_, i) => {
      const x = -w / 2 + random(seed + i) * w, yy = y + random(seed + "y" + i) * 500;
      const L = 160 + random(seed + "l" + i) * 260;
      const g = ["#1f6a3a", "#2f8a4a", "#175a30", "#3fa058"][i % 4];
      return <Leaf key={i} x={x} y={yy} L={L} a={-180 * random(seed + "a" + i) + Math.sin(f / 30 + i) * 3} c={dark ? "#123020" : g} />;
    })}
  </g>
);
export const Leaflet: React.FC<{ x: number; y: number; s: number; a: number; crumple?: number }> = ({ x, y, s, a, crumple = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s * (1 - crumple * 0.75)},${s * (1 - crumple * 0.6)})`}>
    <path d={crumple > 0.3 ? "M -60,-80 L 50,-90 L 70,-20 L 40,60 L 60,90 L -50,85 L -70,10 L -40,-30 Z" : "M -60,-85 L 60,-85 L 60,85 L -60,85 Z"} fill="#f4ecd6" stroke={INK} strokeWidth={4} />
    {crumple < 0.3 ? (
      <g>
        <rect x={-40} y={-65} width={80} height={44} fill="#c94a3a" opacity={0.85} />
        <circle cx={0} cy={-43} r={14} fill="#f4ecd6" />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-42} y1={-5 + i * 16} x2={i % 2 ? 30 : 42} y2={-5 + i * 16} stroke="#4a4030" strokeWidth={5} strokeLinecap="round" />)}
      </g>
    ) : <path d="M -40,-40 L 20,0 L -20,40 M 30,-50 L 0,20" stroke="#bfb39a" strokeWidth={4} fill="none" />}
  </g>
);

// ---------- 1. ХУК: камера пролетает сквозь листву к Оноде ----------
const S1: React.FC<{ f: number }> = ({ f }) => {
  const turn = F(5), push = F(7), end = F(10);
  const keys: Key[] = [[0, 0, -300, 0.55], [40, 0, -120, 0.9], [turn, 0, -160, 1.0], [push, 0, -250, 1.15], [push + 10, 0, -560, 2.1], [end - 8, 0, -560, 2.3], [end, 0, -2400, 2.0]];
  const look = interpolate(f, [turn - 4, turn + 4], [1, 0], { ...clamp, easing: EZ });
  const pass = interpolate(f, [0, 42], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <Shot f={f} keys={keys} shake={[turn]}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#f2a25a 0%,#c85a3a 35%,#3a1a2a 100%)" }} />
          <Layer c={c} k={0.3} blur={8}>
            <circle cx={200} cy={-900} r={200} fill="#ffe0a0" opacity={0.8} />
            <JungleWall seed="far" w={3000} y={-900} dark={1} f={f} />
          </Layer>
          <Rays f={f} color="#ffd9a0" o={0.3} />
          <Layer c={c} k={0.7} blur={4}>
            <Palm x={-520} y={600} h={1300} lean={0.2} f={f} dark />
            <Palm x={560} y={700} h={1400} lean={-0.25} f={f} dark />
            <JungleWall seed="mid" w={2200} y={300} dark={1} f={f} />
          </Layer>
          <Layer c={c}>
            <AnimeChar id="old" look={ONODA_OLD} x={0} y={-560} s={1.0} t={f} cap rifle pose="rifle" expr={f >= turn ? "determined" : "stern"} side={0.8 * look} gaze={[0.9 * look, 0]} rim="#ffb070" />
            <JungleWall seed="near" w={1800} y={500} f={f} />
          </Layer>
          {/* листья, сквозь которые пролетает камера */}
          <AbsoluteFill style={{ transform: `scale(${1 + pass * 5})`, opacity: 1 - pass, filter: "blur(2px)" }}>
            <svg width={W} height={H}>
              {Array.from({ length: 14 }).map((_, i) => <Leaf key={i} x={-200 + (i % 4) * 380} y={100 + Math.floor(i / 4) * 520} L={700} a={i * 47} c={i % 2 ? "#1f6a3a" : "#2f8a4a"} />)}
            </svg>
          </AbsoluteFill>
          <Dust f={f} color="#ffe0b0" n={30} />
        </>
      )}
    </Shot>
  );
};

// ---------- 2a. Море, лодка, молодой лейтенант ----------
const Sea: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-4000} y={-3000} width={8000} height={3000} fill="url(#sky1)" />
    <circle cx={-600} cy={-420} r={160} fill="#fff2c0" />
    <circle cx={-600} cy={-420} r={320} fill="#fff2c0" opacity={0.2} />
    <rect x={-4000} y={0} width={8000} height={3000} fill="#2a6a9a" />
    {Array.from({ length: 50 }).map((_, i) => {
      const x = -3000 + random("w" + i) * 6000 + ((f * 3) % 200), y = 20 + random("wy" + i) * 1800;
      return <path key={i} d={`M ${x},${y} q 30,-12 60,0 q 30,12 60,0`} stroke="#bfe6ff" strokeWidth={4 + y / 400} fill="none" opacity={0.7} />;
    })}
  </g>
);
const Island: React.FC<{ x: number; f: number }> = ({ x, f }) => (
  <g>
    <path d={`M ${x - 900},10 C ${x - 600},-160 ${x - 200},-380 ${x + 200},-360 C ${x + 600},-300 ${x + 900},-120 ${x + 1200},10 Z`} fill="#2f7a4a" stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 900},10 L ${x + 1200},10 L ${x + 1100},40 L ${x - 820},40 Z`} fill="#e8d29a" />
    {[0, 1, 2, 3, 4].map((i) => <Palm key={i} x={x - 500 + i * 260} y={-120 - (i % 2) * 120} h={260} lean={0.1 * (i % 2 ? 1 : -1)} f={f} />)}
  </g>
);
const Boat: React.FC<{ x: number; y: number; f: number; jump: number }> = ({ x, y, f, jump }) => {
  const bob = Math.sin(f / 8) * 6;
  return (
    <g transform={`translate(${x},${y + bob})`}>
      {[0, 1].map((i) => <AnimeChar key={i} id={"bs" + i} look={SOLDIERS[i]} x={-150 + i * 140} y={-290} s={0.3} t={f + i * 7} cap expr="stern" />)}
      <g transform={`translate(${120},${-300 - jump * 120}) `}>
        <AnimeChar id="young" look={ONODA} x={0} y={0} s={0.34} t={f} cap pose={jump > 0 ? "run" : "down"} expr="determined" gaze={[0.6, 0]} side={0.3} />
      </g>
      <path d="M -380,-60 L 300,-60 L 240,40 L -330,40 Z" fill="#6a4a30" stroke={INK} strokeWidth={6} />
      <path d="M -380,-60 L 300,-60 L 296,-40 L -376,-40 Z" fill="#8a6a48" />
      <path d={`M -360,40 q 120,${20 + bob} 240,0 q 120,-20 240,0`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} />
    </g>
  );
};
const S2: React.FC<{ f: number }> = ({ f }) => {
  const zoom = F(14) - F(10), jump = F(19) - F(10), end = F(19) - F(10) + 6;
  const bx = -700 + f * 4.2;
  const keys: Key[] = [[0, 0, 1800, 0.5], [8, 0, -150, 0.45], [zoom - 6, bx - 60 * 4.2 + 300, -200, 0.5], [zoom + 6, bx + 30 * 4.2, -380, 1.25], [jump, -700 + jump * 4.2 + 120, -420, 1.4], [end, -700 + end * 4.2 + 400, 100, 3.2]];
  const j = interpolate(f, [jump - 6, jump + 2, jump + 8], [0, 1, 0.2], clamp);
  return (
    <Shot f={f} keys={keys}>
      {(c) => (
        <>
          <svg width={0} height={0}><defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stopColor="#5a7ad0" /><stop offset="0.85" stopColor="#f2b27a" /><stop offset="1" stopColor="#ffd9a0" /></linearGradient></defs></svg>
          <Layer c={c} k={0.6} blur={3}><Sea f={f} /><Island x={900} f={f} /></Layer>
          <Layer c={c}><Boat x={bx} y={160} f={f} jump={j} /></Layer>
          <Rays f={f} color="#ffe6b0" o={0.25} />
          <Burst f={f - jump - 2} x={540} y={1100} size={0.8} color="#d8f4ff" />
        </>
      )}
    </Shot>
  );
};
// 2b. Выход на берег (идёт на камеру), отъезд на остров
const S2b: React.FC<{ f: number }> = ({ f }) => {
  const ost = F(23) - F(19) - 6, end = F(24) - F(19) - 6;
  const keys: Key[] = [[0, 0, 300, 3.0], [8, 0, -300, 0.62], [ost, 0, -380, 0.7], [ost + 14, 0, -900, 0.32], [end, 1600, -900, 0.32]];
  const walkY = interpolate(f, [0, end], [-200, 200], clamp);
  const sc = interpolate(f, [0, end], [0.75, 0.95], clamp);
  return (
    <Shot f={f} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#5a7ad0 0%,#f2b27a 60%,#ffd9a0 100%)" }} />
          <Layer c={c} k={0.5} blur={5}>
            <path d="M -3000,-500 C -1500,-1600 -400,-2100 600,-1900 C 1800,-1700 2600,-900 3200,-500 Z" fill="#2f7a4a" stroke={INK} strokeWidth={8} />
            {Array.from({ length: 9 }).map((_, i) => <Palm key={i} x={-2000 + i * 500} y={-600 - (i % 3) * 250} h={700} lean={(i % 2 ? 1 : -1) * 0.12} f={f} />)}
          </Layer>
          <Layer c={c}>
            <rect x={-3000} y={-600} width={6000} height={2400} fill="#e8d29a" />
            <path d={`M -3000,${400 + Math.sin(f / 10) * 30} C -1000,${300 + Math.sin(f / 9) * 40} 1000,${500} 3000,${380} L 3000,1800 L -3000,1800 Z`} fill="#3a8ac0" opacity={0.85} />
            <path d={`M -3000,${400 + Math.sin(f / 10) * 30} C -1000,${300 + Math.sin(f / 9) * 40} 1000,${500} 3000,${380}`} stroke="#fff" strokeWidth={14} fill="none" />
            <AnimeChar id="young" look={ONODA} x={0} y={walkY - 900} s={sc} t={f} cap legs={{ ph: f, mode: "walk" }} expr="determined" gaze={[0, 0]} />
            {[0, 1].map((i) => <circle key={i} cx={(i ? 1 : -1) * 110 * sc} cy={walkY - 900 + 1720 * sc} r={(40 + (f * 5) % 60) * sc} fill="none" stroke="#fff" strokeWidth={6} opacity={0.6 - ((f * 5) % 60) / 100} />)}
          </Layer>
          <Dust f={f} color="#fff0d0" n={20} />
        </>
      )}
    </Shot>
  );
};

// ---------- 3. Приказ командира ----------
const S3: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(24) - 6;
  const ne = F(26) - s0, zhd = F(29) - s0, mozh = F(30) - s0, ver = F(41) - s0, end = F(42) - s0 - 4;
  const CX = -330, OX = 330, HY = -420;
  const keys: Key[] = [[0, -1800, HY, 1.3], [8, CX, HY + 120, 1.35], [ne - 6, CX + 40, HY + 120, 1.4], [ne + 4, OX, HY + 120, 1.4], [mozh - 6, OX - 30, HY + 140, 1.3], [mozh + 4, CX, HY + 120, 1.45], [ver - 12, CX + 60, HY + 140, 1.4], [ver, 0, HY + 260, 0.85], [end - 10, OX - 20, HY + 40, 2.2], [end, OX + 1200, HY, 2.2]];
  const salute = f >= zhd && f < mozh + 10;
  const reach = interpolate(f, [ver - 8, ver + 2], [0, 1], clamp);
  return (
    <Shot f={f} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#7ab0e8 0%,#f6d6a0 70%)" }} />
          <Layer c={c} k={0.5} blur={7}>
            <rect x={-4000} y={-300} width={8000} height={600} fill="#3a8ac0" />
            {[0, 1, 2, 3, 4, 5].map((i) => <Palm key={i} x={-1800 + i * 700} y={-200} h={900} lean={(i % 2 ? 1 : -1) * 0.15} f={f} />)}
            <g transform={`translate(${-900 - f * 2},-260)`}><path d="M -200,-40 L 160,-40 L 120,30 L -170,30 Z" fill="#6a4a30" stroke={INK} strokeWidth={6} /></g>
          </Layer>
          <Rays f={f} color="#fff4d0" o={0.22} />
          <Layer c={c}>
            <rect x={-3000} y={600} width={6000} height={2000} fill="#e8d29a" />
            <AnimeChar id="cmdr" look={CMDR} x={CX} y={HY} s={0.72} t={f + 11} cap legs={{ ph: 0, mode: "stand" }} expr="stern" side={0.6} gaze={[0.8, 0]} talk={(f > 8 && f < ne + 18) || (f > mozh && f < ver + 10)} pose={reach > 0 ? "reach" : "down"} rim="#fff2d0" />
            <AnimeChar id="young" look={ONODA} x={OX} y={HY} s={0.72} t={f} cap legs={{ ph: 0, mode: "stand" }} expr="determined" side={-0.6} gaze={[-0.8, 0]} pose={salute ? "salute" : "down"} rim="#fff2d0" />
          </Layer>
          <Dust f={f} />
        </>
      )}
    </Shot>
  );
};

// ---------- 4. Высадка американцев ----------
const Ship: React.FC<{ x: number; y: number; s: number; fire: number }> = ({ x, y, s, fire }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -300,0 L 300,0 L 250,60 L -260,60 Z" fill="#4a5260" stroke={INK} strokeWidth={6} />
    <rect x={-120} y={-80} width={160} height={80} fill="#5a6270" stroke={INK} strokeWidth={6} />
    <rect x={-40} y={-160} width={30} height={80} fill="#5a6270" stroke={INK} strokeWidth={5} />
    <rect x={60} y={-30} width={180} height={16} fill="#3a4250" stroke={INK} strokeWidth={4} transform="rotate(-12 60 -22)" />
    {fire > 0 ? <circle cx={250} cy={-70} r={60 * fire} fill="#ffd27a" opacity={fire} /> : null}
  </g>
);
const Boom: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k < 0 || k > 40) return null;
  const p = k / 40;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + (i - 2) * 50 * p} cy={y - 140 * p - i * 30 * p} r={(60 + i * 20) * (0.4 + p)} fill={i < 2 && p < 0.3 ? "#ffb347" : "#6a6058"} opacity={0.8 * (1 - p)} stroke={INK} strokeWidth={3} />)}
      {p < 0.25 ? <circle cx={x} cy={y - 40} r={140 * (1 - p * 2)} fill="#fff2a0" opacity={0.9} /> : null}
    </g>
  );
};
const S4: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(42) - 4;
  const am = F(46) - s0, poch = F(47) - s0, sd = F(54) - s0, end = F(55) - s0;
  const keys: Key[] = [[0, -1500, -200, 0.5], [8, -500, -150, 0.5], [am, 0, -200, 0.55], [poch - 4, 300, -100, 0.6], [poch + 8, 600, 150, 1.0], [sd, 900, 150, 1.05], [end - 6, 1000, 120, 1.0], [end, 1100, -1600, 1.2]];
  const booms = [am + 6, am + 16, poch, poch + 12, poch + 30, sd - 10];
  return (
    <Shot f={f} keys={keys} shake={booms}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#7a6a8a 0%,#d08a5a 55%,#5a3a3a 100%)" }} />
          <Layer c={c} k={0.6} blur={2}>
            <rect x={-4000} y={-300} width={8000} height={2000} fill="#2a5a80" />
            {[0, 1, 2, 3].map((i) => <Ship key={i} x={-1400 + i * 800} y={-300} s={0.9 - i * 0.1} fire={interpolate(f - am - i * 5, [0, 3, 10], [0, 1, 0], clamp)} />)}
            {[0, 1, 2, 3, 4].map((i) => <g key={"lc" + i} transform={`translate(${-1200 + i * 550},${100 + (f * 2.2) % 300})`}><path d="M -80,0 L 80,0 L 70,40 L -70,40 Z" fill="#5a6450" stroke={INK} strokeWidth={4} /></g>)}
          </Layer>
          <Layer c={c}>
            <rect x={-3000} y={380} width={6000} height={2000} fill="#d8c08a" />
            {[0, 1, 2].map((i) => <AnimeChar key={i} id={"sur" + i} look={SOLDIERS[i]} x={600 + i * 230} y={-60 + (i % 2) * 30} s={0.32} t={f + i * 9} cap legs={{ ph: 0, mode: "stand" }} pose="trophy" expr="sad" gaze={[0, 0.4]} />)}
            <path d={`M 1000,-140 L 1000,180`} stroke="#5a4a3a" strokeWidth={8} />
            <path d={`M 1000,-140 L ${1120 + Math.sin(f / 4) * 10},-110 L 1000,-80 Z`} fill="#fff" stroke={INK} strokeWidth={4} />
            {booms.map((b, i) => <Boom key={i} x={-400 + i * 330} y={400 + (i % 2) * 60} k={f - b} />)}
          </Layer>
          <Dust f={f} color="#ffd0a0" n={30} />
        </>
      )}
    </Shot>
  );
};

// ---------- 5. Побег в джунгли ----------
const S5: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(55);
  const troe = F(57) - s0, dzh = F(61) - s0, end = F(62) - s0;
  const keys: Key[] = [[0, 0, 1800, 1.2], [8, 0, -500, 0.75], [troe - 4, 0, -500, 0.78], [troe + 6, 0, -760, 0.95], [dzh - 2, 0, -760, 1.0], [end, 0, -3200, 0.6]];
  const bob = Math.abs(Math.sin(f / 3.2)) * 20;
  const runners = [
    { l: ONODA, x: 0, y: -520, s: 0.62, d: 0 },
    { l: SOLDIERS[0], x: -330, y: -760, s: 0.42, d: 5 },
    { l: SOLDIERS[1], x: 280, y: -800, s: 0.4, d: 9 },
    { l: SOLDIERS[2], x: -60, y: -900, s: 0.34, d: 13 },
  ];
  return (
    <Shot f={f} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#2a5a3a 0%,#123020 100%)" }} />
          <Layer c={c} k={0.4} blur={8}><JungleWall seed="r1" w={3000} y={-1600} dark={1} f={f} /></Layer>
          <Rays f={f} color="#d8ffb0" o={0.2} />
          {/* листья проносятся мимо — бег на камеру */}
          <svg width={W} height={H} style={{ position: "absolute" }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const k = ((f / 30 + i / 10) % 1), sd = i % 2 ? 1 : -1;
              const sc = 0.3 + k * k * 3;
              return <g key={i} opacity={Math.min(1, k * 4)} style={{ filter: `blur(${k * 6}px)` }}><Leaf x={540 + sd * (100 + 900 * k * k)} y={700 + 600 * k * k} L={300 * sc} a={sd > 0 ? -30 : 210} c={i % 3 ? "#2f8a4a" : "#1f6a3a"} /></g>;
            })}
          </svg>
          <Layer c={c}>
            <rect x={-3000} y={200} width={6000} height={2000} fill="#3a2a1a" />
            {runners.slice().reverse().map((r) => (
              <AnimeChar key={r.d} id={"run" + r.d} look={r.l} x={r.x} y={r.y - Math.abs(Math.sin((f + r.d) / 3.2)) * 20 + (r.d ? 0 : -bob * 0)} s={r.s} t={f + r.d} cap rifle={r.d === 0} pose={r.d === 0 ? "rifle" : "run"} phase={f + r.d} legs={{ ph: f + r.d, mode: "run" }} expr="determined" />
            ))}
          </Layer>
        </>
      )}
    </Shot>
  );
};

// ---------- 6. Листовки ----------
const S6: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(62);
  const pad = F(67) - s0, lis = F(68) - s0, chit = F(71) - s0, usm = F(74) - s0, lov = F(75 - 0) - s0;
  const LV = F(VOICE.words.findIndex((w) => w.w.toLowerCase().startsWith("ловушк"))) - s0;
  const RS = F(VOICE.words.findIndex((w) => w.w.toLowerCase().startsWith("решает"))) - s0;
  const end = P1_END - s0;
  void lov;
  // 6a небо и самолёт (0..chit), 6b руки с листовкой, 6c лицо
  if (f < chit - 6) {
    const keys: Key[] = [[0, 0, 1500, 0.6], [10, 0, 0, 0.6], [pad, 200, -100, 0.7], [lis + 10, 300, 200, 0.9], [chit - 6, 300, 2600, 1.6]];
    const px = -1400 + f * 32;
    return (
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#6aa0e0 0%,#cfe6ff 100%)" }} />
            <Layer c={c} k={0.4}>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={-1200 + i * 800 + f} cy={-500 + (i % 2) * 200} rx={300} ry={80} fill="#fff" opacity={0.8} />)}</Layer>
            <Layer c={c}>
              <g transform={`translate(${px},-300)`}>
                <path d="M -200,0 C -120,-40 160,-40 220,0 C 160,30 -120,30 -200,0 Z" fill="#7a8a70" stroke={INK} strokeWidth={6} />
                <path d="M -20,-10 L 60,-160 L 110,-150 L 60,-10 Z" fill="#6a7a60" stroke={INK} strokeWidth={5} />
                <path d="M -40,10 L 40,150 L 90,140 L 50,10 Z" fill="#6a7a60" stroke={INK} strokeWidth={5} />
                <path d="M -190,0 L -230,-60 L -200,-60 L -160,-10 Z" fill="#6a7a60" stroke={INK} strokeWidth={5} />
                <circle cx={228} cy={0} r={14} fill="#333" />
              </g>
              {Array.from({ length: 40 }).map((_, i) => {
                const st = pad - 10 + i * 0.6;
                const k = f - st;
                if (k < 0) return null;
                const x0 = -1400 + st * 32;
                return <Leaflet key={i} x={x0 + Math.sin(k / 6 + i) * 90 + (random("lx" + i) - 0.5) * k * 30} y={-280 + k * (6 + random("lv" + i) * 10)} s={0.7 + random("ls" + i) * 0.5} a={k * 9 + i * 40} />;
              })}
              <JungleWall seed="top" w={4000} y={1800} f={f} />
              {f > lis ? <Leaflet x={c.x + Math.sin(f / 7) * 60} y={c.y + 120} s={1.6} a={Math.sin(f / 9) * 25} /> : null}
            </Layer>
          </>
        )}
      </Shot>
    );
  }
  if (f < usm - 3) {
    // руки держат листовку — вид его глазами
    const g = f - (chit - 6);
    const keys: Key[] = [[0, 0, -600, 2.2], [8, 0, 0, 1.0], [usm - 3 - (chit - 6), 0, -60, 1.12]];
    return (
      <Shot f={g} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#2a6a3a,#0f2a18)" }} />
            <Layer c={c} k={0.4} blur={9}><JungleWall seed="pv" w={2400} y={-1100} f={g} /></Layer>
            <Rays f={g} color="#e6ffc0" o={0.25} />
            <Layer c={c}>
              <g transform="rotate(-3)"><Leaflet x={0} y={-80} s={3.6} a={0} /></g>
              <ellipse cx={-320} cy={160} rx={80} ry={110} fill={ONODA.skin} stroke={INK} strokeWidth={6} />
              <ellipse cx={320} cy={160} rx={80} ry={110} fill={ONODA.skin} stroke={INK} strokeWidth={6} />
              <path d="M -400,240 L -460,1200 L -200,1200 L -240,240 Z" fill={ONODA.top} stroke={INK} strokeWidth={6} />
              <path d="M 400,240 L 460,1200 L 200,1200 L 240,240 Z" fill={ONODA.top} stroke={INK} strokeWidth={6} />
            </Layer>
          </>
        )}
      </Shot>
    );
  }
  // лицо: усмешка → сминает листовку (ловушка!) → уходит
  const h = f - (usm - 3);
  const lv = LV - (usm - 3), rs = RS - (usm - 3), e2 = end - (usm - 3);
  const keys: Key[] = [[0, 0, -800, 2.0], [6, 0, -760, 1.5], [lv - 4, 0, -740, 1.6], [lv + 4, 60, -600, 1.25], [rs, 60, -560, 1.2], [e2 - 6, 0, -400, 0.7], [e2, -1400, -400, 0.7]];
  const crum = interpolate(h, [lv - 2, lv + 6], [0, 1], clamp);
  const away = interpolate(h, [rs, e2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot f={h} keys={keys} shake={[lv]}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#2a6a3a,#0f2a18)" }} />
            <Layer c={c} k={0.4} blur={8}><JungleWall seed="fc" w={2400} y={-1300} f={h} /></Layer>
            <RedRage f={h} k={crum * 0.75} />
            <Layer c={c}>
              <AnimeChar id="young" look={ONODA} x={0} y={-760 + away * 60} s={1.0 - away * 0.25} t={h} cap legs={{ ph: h * away, mode: away > 0.05 ? "walk" : "stand" }} expr={h >= lv ? "angry" : "smirk"} pose={crum > 0.2 ? "crumple" : "paper"} rim={crum > 0.2 ? "#ffd0c0" : "#e6ffd0"} side={-0.5 * away} gaze={[-0.8 * away, 0]} />
              <Leaflet x={crum > 0.2 ? 120 : 0} y={crum > 0.2 ? -400 : -310} s={0.9} a={crum * 40} crumple={crum} />
            </Layer>
            <Dust f={h} color="#e6ffd0" n={25} />
          </>
        )}
      </Shot>
      <Burst f={h - lv} x={600} y={720} color="#ffc0b0" size={1.2} />
    </AbsoluteFill>
  );
};

// ---------- сборка части 1 ----------
export const PLAN1: [number, React.FC<{ f: number }>][] = [
  [0, S1], [F(10), S2], [F(19), S2b], [F(24) - 6, S3], [F(42) - 4, S4], [F(55), S5], [F(62), S6],
];
export const OnodaPart1: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0;
  for (let j = 0; j < PLAN1.length; j++) if (f >= PLAN1[j][0]) i = j;
  const S = PLAN1[i][1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <S f={f - PLAN1[i][0]} />
      <Vignette k={0.7} />
      <Grain f={f} />
      <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile("onoda/voice_ru.mp3")} /></Sequence>
    </AbsoluteFill>
  );
};
