// Аватарка канала: Петя с ящиком еды ночью. npx remotion still src/foodshort/index.tsx Avatar out/avatar.png
// Всё важное — внутри круга (соцсети обрезают аватар кружком).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Crate, setLang } from "./FoodShort";
import { PETYA, Petya, pStand } from "./petya";

const S = 1080, INK = "#0b0f22";
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const Avatar: React.FC = () => {
  setLang("ru");
  const s = 2.6, x = 540, y = 430 + 528 * s;
  const pose = pStand(0, { turn: -0.3, light: -1, handL: [-80, -350], handR: [80, -350], expr: { eyes: "wide", brows: 0.8, mouth: "tight", look: [-1, 0], blink: 0 } });
  return <AbsoluteFill style={{ background: "#0a0f26" }}>
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor="#1d2752" /><stop offset="1" stopColor="#070a1c" /></radialGradient>
        <radialGradient id="red" cx="0%" cy="35%" r="70%"><stop offset="0" stopColor="#ff3b3b" stopOpacity={0.55} /><stop offset="1" stopColor="#ff3b3b" stopOpacity={0} /></radialGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="55%"><stop offset="0.7" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient>
      </defs>
      <rect width={S} height={S} fill="url(#bg)" />
      {/* дом напротив: тёмные окна, несколько горят */}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
        const lit = rnd(r * 9 + c) > 0.72;
        return <rect key={r + "-" + c} x={40 + c * 175} y={60 + r * 190} width={110} height={120} fill={lit ? "#f4b448" : "#121a3e"} opacity={lit ? 0.35 : 0.9} />;
      }))}
      <rect width={S} height={S} fill="#0a0f26" opacity={0.35} />
      <rect width={S} height={S} fill="url(#red)" />
      <Petya x={x} y={y} s={s} pose={pose} />
      <Crate x={x} y={y - 350 * s} s={0.72 * s} />
      {[pose.handL, pose.handR].map((h, i) => <ellipse key={i} cx={x + h[0] * s} cy={y + h[1] * s} rx={13 * s} ry={15 * s} fill={PETYA.skin} stroke={INK} strokeWidth={3 * s} />)}
      {/* красный отсвет на лице со стороны двери */}
      <rect width={S} height={S} fill="url(#red)" opacity={0.35} />
      <rect width={S} height={S} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>;
};
