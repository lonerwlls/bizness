// Пробник «дудл»: толстые дрожащие контуры, приглушённые цвета, бумага. Вид от первого лица + крупный план.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { MASCOT, Person, STAND, V, lerp } from "../characters/Rig";
import { Full, ip, rnd } from "../characters/kit";

export const DOODLE_FRAMES = 150;
const L = { ...MASCOT, top: "#d9733a", hatColor: "#3a4a72", pants: "#33405e" };
const LB = { ...L, slim: 1.5 };
const WOOD = "#9a7350", WOOD2 = "#8a6444", WALL = "#4f4a72";

// бургер сверху (вид от первого лица), с укусом
const TopBurger: React.FC<{ x: number; y: number; k: number; bite: boolean }> = ({ x, y, k, bite }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <defs>
      <mask id="tb"><rect x={-200} y={-200} width={400} height={400} fill="#fff" />{bite ? <><circle cx={0} cy={150} r={60} fill="#000" /><circle cx={70} cy={130} r={50} fill="#000" /></> : null}</mask>
    </defs>
    <g mask="url(#tb)">
      <circle r={150} fill="#6a3a22" />
      <circle r={140} fill="#7fb05a" />
      <circle r={128} fill="#e2a052" />
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={Math.cos(i * 2.4) * (30 + (i % 4) * 22)} cy={Math.sin(i * 2.4) * (30 + (i % 4) * 22)} rx={8} ry={5} fill="#fff1cc" transform={`rotate(${i * 40} ${Math.cos(i * 2.4) * (30 + (i % 4) * 22)} ${Math.sin(i * 2.4) * (30 + (i % 4) * 22)})`} />)}
    </g>
  </g>
);
const Hand: React.FC<{ x: number; y: number; a: number; flip?: boolean }> = ({ x, y, a, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-70} y={40} width={140} height={700} rx={50} fill={L.top} />
    <rect x={-74} y={40} width={148} height={40} rx={14} fill="#c25f2c" />
    <ellipse cx={0} cy={0} rx={62} ry={74} fill={L.skin} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-52 + i * 28} y={-92} width={24} height={60} rx={12} fill={L.skin} />)}
    <rect x={44} y={-30} width={26} height={56} rx={13} fill={L.skin} transform="rotate(-30 57 0)" />
  </g>
);

const Pov: React.FC<{ f: number }> = ({ f }) => {
  const reach = ip(f, [0, 20], [0, 1]);
  const lift = ip(f, [26, 44], [0, 1]);
  const k = lerp(0.9, 2.6, lift);
  const by = lerp(980, 1180, lift);
  const handY = lerp(1900, 1120, reach) + lift * 160;
  return (
    <>
      <rect x={-120} y={-120} width={1320} height={2160} fill={WOOD} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M 0 ${i * 170 + 40} Q 540 ${i * 170 + 70} 1080 ${i * 170 + 30}`} stroke={WOOD2} strokeWidth={6} fill="none" />)}
      <circle cx={220} cy={520} r={130} fill="#eeeae0" />
      <circle cx={220} cy={520} r={100} fill="#5a3422" />
      <path d="M 340 520 q 70 0 70 50 q 0 50 -70 50" stroke="#eeeae0" strokeWidth={26} fill="none" />
      <rect x={720} y={300} width={260} height={360} rx={30} fill="#2a2a3a" transform="rotate(12 850 480)" />
      <rect x={740} y={330} width={220} height={300} rx={18} fill="#6a6aa0" transform="rotate(12 850 480)" />
      <ellipse cx={540} cy={1000} rx={250} ry={240} fill="#eeeae0" />
      <ellipse cx={540} cy={1000} rx={190} ry={180} fill="#e0dcd0" />
      <TopBurger x={540} y={by} k={k} bite={f >= 45} />
      <Hand x={330 + lift * -60} y={handY} a={18} />
      <Hand x={750 + lift * 60} y={handY} a={-18} flip />
    </>
  );
};

const Bust: React.FC<{ f: number }> = ({ f }) => {
  const s = 6.2, hip: V = [520, 1960];
  const away = (a: number, b: number) => ip(f, [a, b], [0, 1]) - ip(f, [b + 6, b + 18], [0, 1]);
  const bite = away(88, 95);
  const chewing = f > 96 && f < 122;
  const chew = chewing ? Math.sin(f / 2.2) : 0;
  const thumbs = f >= 122;
  const handR: V = thumbs ? [70, -40] : [56 - bite * 10, -122 + (f < 80 ? 40 * ip(f, [60, 80], [1, 0]) : 0)];
  const handL: V = thumbs ? [-60, -200] : [-40, -30];
  const face = bite > 0.3 ? { eyes: "closed" as const, brows: -0.4, mouth: "o" as const } : chewing ? { eyes: "happy" as const, brows: 0.6, mouth: chew > 0 ? "smile" as const : "flat" as const } : thumbs ? { eyes: "happy" as const, brows: 0.8, mouth: "grin" as const } : { eyes: "open" as const, brows: 0.5, mouth: "smile" as const };
  return (
    <>
      <rect x={-120} y={-120} width={1320} height={2160} fill={WALL} />
      <rect x={700} y={220} width={300} height={380} rx={8} fill="#2e2c4e" />
      <rect x={846} y={220} width={8} height={380} fill={WALL} />
      <rect x={700} y={406} width={300} height={8} fill={WALL} />
      <circle cx={930} cy={300} r={18} fill="#eeeae0" />
      <circle cx={200} cy={330} r={80} fill="#eeeae0" />
      <line x1={200} y1={330} x2={200} y2={275} stroke="#2a2a3a" strokeWidth={8} />
      <line x1={200} y1={330} x2={236} y2={350} stroke="#2a2a3a" strokeWidth={8} />
      <rect x={-120} y={1500} width={1320} height={540} fill="#3a3a5e" />
      <Person x={hip[0]} y={hip[1] - chew * 6} s={s} turn={0.15} key="bust" pose={{ ...STAND, lean: bite * 5, head: chew * 2 }} hands={{ l: handL, r: handR }} look={LB} t={f} face={face}>
        {!thumbs ? (
          <g transform={`translate(${handR[0] - 10} ${handR[1] - 14}) scale(0.5)`}>
            <path d="M -40 2 L 40 2 Q 42 22 30 26 L -30 26 Q -42 22 -40 2 Z" fill="#e2a052" />
            <rect x={-44} y={-6} width={88} height={10} rx={5} fill="#7fb05a" />
            <rect x={-40} y={-16} width={80} height={14} rx={7} fill="#6a3a22" />
            <path d="M -42 -16 Q -40 -50 0 -50 Q 40 -50 42 -16 Z" fill="#e2a052" />
          </g>
        ) : <rect x={handL[0] - 5} y={handL[1] - 26} width={10} height={22} rx={5} fill={L.skin} />}
        {thumbs ? [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 18 + 4} cy={-152} rx={9} ry={5} fill="#f08a8a" />) : null}
      </Person>
    </>
  );
};

export const DoodleEat: React.FC = () => {
  const f = useCurrentFrame();
  const boil = Math.floor(f / 4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Full>
        <defs>
          <filter id="doodle" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1280" height="2120" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={boil % 6} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" result="w" />
            <feConvolveMatrix in="w" order={3} kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha result="e" />
            <feColorMatrix in="e" type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0 0.11  7 7 7 0 0" result="ink0" />
            <feMorphology in="ink0" operator="dilate" radius={2.6} result="ink" />
            <feMerge><feMergeNode in="w" /><feMergeNode in="ink" /></feMerge>
          </filter>
          <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={boil % 3} /><feColorMatrix type="saturate" values="0" /></filter>
          <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
        </defs>
        <g filter="url(#doodle)">{f < 60 ? <Pov f={f} /> : <Bust f={f} />}</g>
        <rect width={1080} height={1920} filter="url(#paper)" opacity={0.16} style={{ mixBlendMode: "multiply" }} />
        <rect width={1080} height={1920} fill="url(#vig)" />
        {rnd(boil) > 2 ? null : null}
      </Full>
      <Audio src={staticFile("styles/eat.wav")} />
    </AbsoluteFill>
  );
};
