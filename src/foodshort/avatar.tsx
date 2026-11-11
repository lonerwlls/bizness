// Аватарка канала (общая для всех историй): Петя ночью, а за его плечом в окне дома напротив — чей-то силуэт.
// npx remotion still src/foodshort/index.tsx Avatar out/avatar.png. Всё важное — внутри круга.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Shadow } from "./FoodShort";
import { Petya, pStand } from "./petya";

const S = 1080;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const Avatar: React.FC = () => {
  const s = 3.3, x = 600, y = 500 + 528 * s;
  const pose = pStand(0, { turn: -0.2, light: 1, handL: [-58, -262], handR: [58, -262], expr: { eyes: "wide", brows: 0.7, mouth: "tight", look: [-1, -0.2], blink: 0 } });
  // окно с силуэтом — слева сверху, за плечом Пети
  const wx = 150, wy = 250, ww = 220, wh = 270;
  return <AbsoluteFill style={{ background: "#0a0f26" }}>
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <defs>
        <radialGradient id="bg" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#1d2752" /><stop offset="1" stopColor="#060918" /></radialGradient>
        <radialGradient id="red" cx="100%" cy="40%" r="65%"><stop offset="0" stopColor="#ff3b3b" stopOpacity={0.5} /><stop offset="1" stopColor="#ff3b3b" stopOpacity={0} /></radialGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#f4b448" stopOpacity={0.45} /><stop offset="1" stopColor="#f4b448" stopOpacity={0} /></radialGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="55%"><stop offset="0.7" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient>
        <clipPath id="win"><rect x={wx} y={wy} width={ww} height={wh} /></clipPath>
      </defs>
      <rect width={S} height={S} fill="url(#bg)" />
      {/* дом напротив: тёмные окна */}
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
        const lit = rnd(r * 9 + c) > 0.85;
        return <rect key={r + "-" + c} x={-60 + c * 210} y={-40 + r * 330} width={150} height={190} fill={lit ? "#f4b448" : "#121a3e"} opacity={lit ? 0.18 : 0.8} />;
      }))}
      {/* единственное горящее окно — и в нём кто-то стоит */}
      <circle cx={wx + ww / 2} cy={wy + wh / 2} r={260} fill="url(#glow)" />
      <rect x={wx} y={wy} width={ww} height={wh} fill="#f4b448" />
      <g clipPath="url(#win)"><Shadow x={wx + ww / 2 + 10} y={wy + wh + 40} s={1.15} eyes={1} look={0.6} /></g>
      <path d={`M ${wx + ww / 2} ${wy} L ${wx + ww / 2} ${wy + wh} M ${wx} ${wy + wh * 0.45} L ${wx + ww} ${wy + wh * 0.45}`} stroke="#0a0e24" strokeWidth={10} />
      <rect x={wx} y={wy} width={ww} height={wh} fill="none" stroke="#0a0e24" strokeWidth={12} />
      <rect width={S} height={S} fill="url(#red)" />
      <Petya x={x} y={y} s={s} pose={pose} />
      <rect width={S} height={S} fill="url(#red)" opacity={0.3} />
      {/* красная точка «запись» — фирменный знак канала */}
      <circle cx={540} cy={110} r={22} fill="#ff3b3b" style={{ filter: "drop-shadow(0 0 14px #ff3b3b)" }} />
      <rect width={S} height={S} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>;
};
