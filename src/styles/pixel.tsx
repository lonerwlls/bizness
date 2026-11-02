// Пробник «пиксельный закат»: герой ест у окна. Рисуется крупно, потом scripts/pixel.sh превращает в пиксель-арт.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { MASCOT, Person, STAND, V, lerp } from "../characters/Rig";
import { Full, ip, rnd, sitPose, toLocal } from "../characters/kit";
import { BASE, Burger } from "./eat";

export const PIXEL_FRAMES = 150;
const OUT = "#1a0f2e";

// закат: фиолетовое небо, розово-оранжевые полосы облаков, город с огнями
const Sunset: React.FC<{ f: number; x: number; y: number; w: number; h: number; par?: number }> = ({ f, x, y, w, h, par = 0 }) => (
  <g>
    <defs>
      <linearGradient id={`ss${x}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a2a7a" />
        <stop offset="0.35" stopColor="#7a3a9a" />
        <stop offset="0.6" stopColor="#e0587a" />
        <stop offset="0.8" stopColor="#ff9a4a" />
        <stop offset="1" stopColor="#ffc86a" />
      </linearGradient>
      <clipPath id={`sc${x}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
    </defs>
    <g clipPath={`url(#sc${x})`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#ss${x})`} />
      {Array.from({ length: 9 }, (_, i) => {
        const cy = y + h * (0.12 + i * 0.07), cx = x + ((rnd(i) * w + f * (0.3 + rnd(i + 3) * 0.4)) % (w + 400)) - 200;
        return <rect key={i} x={cx} y={cy} width={180 + rnd(i + 5) * 260} height={14 + rnd(i + 8) * 14} rx={8} fill={i < 4 ? "#b05a9a" : "#ff8a6a"} opacity={0.75} />;
      })}
      <circle cx={x + w * 0.62} cy={y + h * 0.78} r={w * 0.09} fill="#ffe08a" />
      {Array.from({ length: 16 }, (_, i) => {
        const bw = w / 12, bx = x + i * bw * 0.85 - bw + par, bh = h * (0.18 + rnd(i + 11) * 0.3), by = y + h - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw * 0.9} height={bh} fill={i % 2 ? "#2a1a4e" : "#33205a"} />
            {Array.from({ length: Math.floor(bh / 26) * 3 }, (_, k) => (
              <rect key={k} x={bx + 6 + (k % 3) * (bw * 0.26)} y={by + 10 + Math.floor(k / 3) * 26} width={bw * 0.12} height={10} fill={rnd(i * 40 + k) > 0.55 ? "#ffc86a" : "#3d2a66"} opacity={rnd(i * 40 + k + Math.floor(f / 40)) > 0.97 ? 0.3 : 1} />
            ))}
          </g>
        );
      })}
    </g>
  </g>
);

const Room: React.FC<{ f: number; wide: boolean; children: React.ReactNode }> = ({ f, wide, children }) => (
  <>
    <rect width={1080} height={1920} fill="#2a1a3e" />
    {wide ? (
      <>
        <Sunset f={f} x={80} y={260} w={920} h={900} />
        <rect x={60} y={240} width={960} height={20} fill="#4a2f2a" />
        <rect x={60} y={1160} width={960} height={24} fill="#4a2f2a" />
        <rect x={60} y={240} width={20} height={940} fill="#4a2f2a" />
        <rect x={1000} y={240} width={20} height={940} fill="#4a2f2a" />
        <rect x={530} y={240} width={20} height={940} fill="#4a2f2a" />
        {/* растение */}
        <rect x={110} y={1060} width={90} height={100} rx={10} fill="#a0603e" />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={155 + (i - 2) * 24} cy={990 - (i % 2) * 40} rx={22} ry={70} fill={i % 2 ? "#3d8a5a" : "#4fa36a"} transform={`rotate(${(i - 2) * 16 + Math.sin(f / 15 + i) * 3} ${155 + (i - 2) * 24} 1060)`} />)}
        {/* лампа */}
        <circle cx={930} cy={1040} r={160} fill="#ffb060" opacity={0.12} />
        <rect x={920} y={1040} width={10} height={130} fill="#3a2a2a" />
        <path d="M 880 1040 L 970 1040 L 950 990 L 900 990 Z" fill="#ffb060" />
      </>
    ) : (
      <Sunset f={f} x={0} y={0} w={1080} h={1920} par={-40} />
    )}
    {children}
  </>
);

export const PixelEat: React.FC = () => {
  const f = useCurrentFrame();
  const wide = f >= 70;
  // крупный план: бюст героя; общий план: за столом у окна
  const s = wide ? 2.8 : 6.5;
  const hip: V = wide ? [470, 1500] : [500, 1900];
  const mouthL: V = [12, -140];
  const holdL: V = [mouthL[0] + 46, mouthL[1] + 18];
  const away = (a: number, b: number) => ip(f, [a, b], [0, 1]) - ip(f, [b + 6, b + 18], [0, 1]);
  const bite = Math.max(away(38, 45), away(88, 95));
  const bites = f >= 95 ? 2 : f >= 45 ? 1 : 0;
  const lift = wide ? 1 : ip(f, [4, 28], [0, 1]);
  const restL: V = [40, -40];
  const handR: V = [lerp(restL[0], holdL[0] - bite * 12, lift), lerp(restL[1], holdL[1], lift) + (f > 118 ? 40 : 0)];
  const chewing = (f > 46 && f < 70) || (f > 96 && f < 120);
  const chew = chewing ? Math.sin(f / 2.2) : 0;
  const thumbs = f >= 122;
  const handL: V = thumbs ? [-40, -240] : wide ? toLocal([560, 1490], hip, s) : [-30, -40];
  const face = bite > 0.3 ? { eyes: "closed" as const, mouth: "o" as const } : chewing ? { eyes: "happy" as const, mouth: chew > 0 ? "smile" as const : "flat" as const } : thumbs ? { eyes: "happy" as const, mouth: "grin" as const } : { eyes: "open" as const, brows: 0.4, mouth: "smile" as const };
  const look = { ...MASCOT };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Full>
        <defs>
          {/* тёмный контур, как в пиксель-арте */}
          <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={wide ? 5 : 8} result="d" />
            <feFlood floodColor={OUT} />
            <feComposite in2="d" operator="in" result="o" />
            <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* тёплый контровой свет заката */}
          <linearGradient id="rim" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#ff9a4a" stopOpacity="0.35" /><stop offset="0.5" stopColor="#ff9a4a" stopOpacity="0" /></linearGradient>
        </defs>
        <Room f={f} wide={wide}>
          <g filter="url(#ink)">
            <Person x={hip[0]} y={hip[1] - chew * 4} s={s} turn={0.55} pose={wide ? { ...sitPose(2), aL: [0, 0], aR: [0, 0] } : { ...STAND, lean: bite * 6, head: chew * 3 }} feet={wide ? { l: [70, 100], r: [50, 104] } : undefined} hands={{ l: handL, r: handR }} look={look} t={f} face={face}>
              {lift > 0.2 ? <g transform={`translate(${handR[0] - 4} ${handR[1] - 12})`}><Burger th={BASE} bites={bites} uid="pxb" k={0.62} /></g> : null}
              {thumbs ? <rect x={handL[0] - 5} y={handL[1] - 26} width={10} height={22} rx={5} fill={look.skin} /> : null}
            </Person>
          </g>
          {wide ? (
            <g filter="url(#ink)">
              <rect x={40} y={1500} width={1000} height={40} fill="#8a4a2a" />
              <rect x={70} y={1540} width={940} height={400} fill="#6a3620" />
              {Array.from({ length: 4 }, (_, i) => <rect key={i} x={70} y={1580 + i * 90} width={940} height={6} fill="#5a2c1a" />)}
              <rect x={700} y={1330} width={280} height={160} rx={8} fill="#141024" />
              <rect x={712} y={1342} width={256} height={136} rx={4} fill="#3a7ac0" />
              <rect x={722} y={1352} width={90} height={10} fill="#9cd0ff" />
              <rect x={720} y={1362 + 20} width={160} height={8} fill="#9cd0ff" opacity={0.6} />
              <rect x={820} y={1490} width={40} height={14} fill="#141024" />
              <rect x={520} y={1484} width={200} height={18} rx={4} fill="#22182e" />
              <rect x={190} y={1436} width={56} height={64} rx={8} fill="#e8e0d0" />
              {[0, 1].map((i) => <path key={i} d={`M ${204 + i * 20} 1426 q 8 -16 0 -32`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.4} transform={`translate(0 ${-(f % 20)})`} />)}
            </g>
          ) : null}
          <rect width={1080} height={1920} fill="url(#rim)" />
        </Room>
      </Full>
      <Audio src={staticFile("styles/eat.wav")} />
    </AbsoluteFill>
  );
};
