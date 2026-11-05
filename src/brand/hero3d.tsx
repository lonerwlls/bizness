// Наш герой «как на обложках из примеров»: объёмная рисованная заливка (градиенты, блики, тени, контровой свет),
// выразительные глаза и брови, живая поза. Белый фон или прозрачный.
import React from "react";
import { AbsoluteFill } from "remotion";

const INK = "#1b1424";
const W = 10;

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="h_head" cx="38%" cy="32%" r="75%"><stop offset="0%" stopColor="#ffffff" /><stop offset="60%" stopColor="#f1f0ee" /><stop offset="100%" stopColor="#c9ccd8" /></radialGradient>
    <radialGradient id="h_beanie" cx="35%" cy="25%" r="85%"><stop offset="0%" stopColor="#4a5784" /><stop offset="55%" stopColor="#2c3557" /><stop offset="100%" stopColor="#181d33" /></radialGradient>
    <linearGradient id="h_cuff" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a4570" /><stop offset="100%" stopColor="#1e2440" /></linearGradient>
    <radialGradient id="h_pom" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#c8ccd8" /></radialGradient>
    <radialGradient id="h_jacket" cx="32%" cy="22%" r="95%"><stop offset="0%" stopColor="#ffab5a" /><stop offset="45%" stopColor="#f27a2a" /><stop offset="100%" stopColor="#b8481a" /></radialGradient>
    <linearGradient id="h_pack" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe070" /><stop offset="100%" stopColor="#d89a14" /></linearGradient>
    <linearGradient id="h_limb" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3a3f5c" /><stop offset="100%" stopColor="#1a1d2e" /></linearGradient>
    <radialGradient id="h_mitt" cx="35%" cy="30%" r="80%"><stop offset="0%" stopColor="#4a5070" /><stop offset="100%" stopColor="#181a28" /></radialGradient>
    <linearGradient id="h_shoe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#c5cad8" /></linearGradient>
    <radialGradient id="h_shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(40,30,70,0.35)" /><stop offset="100%" stopColor="rgba(40,30,70,0)" /></radialGradient>
    <linearGradient id="h_rim" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="rgba(140,200,255,0.9)" /><stop offset="35%" stopColor="rgba(140,200,255,0)" /></linearGradient>
  </defs>
);

// палочка-рука/нога с контуром и объёмом
const Limb: React.FC<{ d: string; w?: number }> = ({ d, w = 26 }) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 2 * W} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke="url(#h_limb)" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke="rgba(255,255,255,0.18)" strokeWidth={w * 0.25} strokeLinecap="round" fill="none" transform="translate(-5 -3)" />
  </g>
);
const Mitt: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 40 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="url(#h_mitt)" stroke={INK} strokeWidth={W} />
    <ellipse cx={x - r * 0.3} cy={y - r * 0.35} rx={r * 0.28} ry={r * 0.18} fill="rgba(255,255,255,0.35)" />
  </g>
);
const Shoe: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <path d="M -58 0 Q -62 -46 -10 -50 Q 50 -52 70 -14 Q 76 4 60 8 L -50 8 Q -60 8 -58 0 Z" fill="url(#h_shoe)" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
    <path d="M -56 -4 L 66 -4" stroke="#9aa2b8" strokeWidth={8} strokeLinecap="round" />
    <path d="M -14 -44 Q 0 -30 20 -42" stroke="#9aa2b8" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={-18} cy={-34} rx={16} ry={7} fill="rgba(255,255,255,0.9)" />
  </g>
);

const Hero: React.FC = () => (
  <g>
    {/* тень на полу */}
    <ellipse cx={760} cy={1400} rx={300} ry={46} fill="url(#h_shadow)" />
    {/* ноги */}
    <Limb d="M 700 1060 Q 690 1220 678 1360" w={28} />
    <Limb d="M 805 1060 Q 830 1210 858 1350" w={28} />
    <Shoe x={672} y={1386} flip />
    <Shoe x={868} y={1376} />
    {/* рюкзак */}
    <rect x={548} y={700} width={414} height={330} rx={90} fill="url(#h_pack)" stroke={INK} strokeWidth={W} />
    <path d="M 572 760 Q 566 900 590 980" stroke="rgba(255,255,255,0.45)" strokeWidth={12} fill="none" strokeLinecap="round" />
    {/* рука на поясе (слева) */}
    <Limb d="M 612 770 L 488 900 L 590 1000" />
    {/* туловище-куртка */}
    <path d="M 590 712 Q 580 690 620 680 L 890 680 Q 930 690 920 716 Q 950 900 918 1060 Q 760 1100 600 1060 Q 562 900 590 712 Z" fill="url(#h_jacket)" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
    {/* складки, молния, карманы, воротник */}
    <path d="M 755 690 L 752 1080" stroke="#a8461a" strokeWidth={10} />
    <rect x={744} y={760} width={22} height={34} rx={6} fill="#e8e2d0" stroke={INK} strokeWidth={5} />
    <path d="M 630 960 Q 680 975 715 955" stroke="#b9531f" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M 795 955 Q 835 978 885 958" stroke="#b9531f" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M 640 800 Q 660 860 650 920" stroke="rgba(255,220,180,0.55)" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M 900 760 Q 918 880 902 1020" stroke="url(#h_rim)" strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M 620 690 Q 690 730 755 712 Q 820 730 890 690" stroke={INK} strokeWidth={W} fill="#d9622a" strokeLinejoin="round" />
    <Mitt x={598} y={1000} r={42} />
    {/* лямки рюкзака */}
    {[[650, 690, 640, 900], [860, 690, 872, 900]].map(([x0, y0, x1, y1], i) => <path key={i} d={`M ${x0} ${y0} Q ${(x0 + x1) / 2 + (i ? 10 : -10)} ${(y0 + y1) / 2} ${x1} ${y1}`} stroke="#c8901a" strokeWidth={22} fill="none" strokeLinecap="round" />)}
    {/* машущая рука (справа) */}
    <Limb d="M 900 770 L 1040 650 L 1090 480" />
    <Mitt x={1092} y={468} r={44} />
    {[[1150, 420, 1190, 390], [1165, 470, 1215, 466], [1150, 520, 1192, 545]].map(([a, b, c, d], i) => <path key={i} d={`M ${a} ${b} L ${c} ${d}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />)}
    {/* голова */}
    <g transform="rotate(-4 755 470)">
      <ellipse cx={755} cy={478} rx={236} ry={220} fill="url(#h_head)" stroke={INK} strokeWidth={W + 1} />
      <path d="M 965 420 Q 990 520 940 610" stroke="url(#h_rim)" strokeWidth={18} fill="none" strokeLinecap="round" />
      {/* лицо: брови, глаза с бликами, улыбка */}
      <path d="M 640 440 Q 680 410 720 426" stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 790 422 Q 832 402 872 430" stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
      <ellipse cx={682} cy={506} rx={38} ry={46} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <ellipse cx={830} cy={502} rx={38} ry={46} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <circle cx={690} cy={514} r={20} fill={INK} /><circle cx={838} cy={510} r={20} fill={INK} />
      <circle cx={697} cy={504} r={7} fill="#ffffff" /><circle cx={845} cy={500} r={7} fill="#ffffff" />
      <path d="M 676 582 Q 760 602 846 574 Q 832 660 760 666 Q 694 664 676 582 Z" fill="#5a1620" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 690 588 Q 760 604 834 582 L 830 606 Q 760 622 694 610 Z" fill="#ffffff" />
      <ellipse cx={762} cy={644} rx={38} ry={16} fill="#e8667a" />
      {/* шапка */}
      <g transform="translate(0 -52)">
      <path d="M 528 420 Q 520 230 755 218 Q 990 230 982 420 Z" fill="url(#h_beanie)" stroke={INK} strokeWidth={W + 1} strokeLinejoin="round" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${600 + i * 52} 250 Q ${592 + i * 52} 330 ${598 + i * 52} 400`} stroke="rgba(10,14,30,0.35)" strokeWidth={6} fill="none" />)}
      <path d="M 600 270 Q 660 236 720 232" stroke="rgba(160,180,255,0.4)" strokeWidth={14} fill="none" strokeLinecap="round" />
      <rect x={512} y={384} width={486} height={84} rx={38} fill="url(#h_cuff)" stroke={INK} strokeWidth={W} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${560 + i * 49} 392 L ${560 + i * 49} 460`} stroke="rgba(8,10,24,0.6)" strokeWidth={7} />)}
      <circle cx={755} cy={190} r={62} fill="url(#h_pom)" stroke={INK} strokeWidth={W} />
      <path d="M 718 162 Q 734 146 754 146" stroke="rgba(255,255,255,0.95)" strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
    </g>
  </g>
);

export const Hero3D: React.FC<{ bg?: string }> = ({ bg }) => (
  <AbsoluteFill style={{ background: bg ?? "transparent" }}>
    <svg width={1500} height={1500} viewBox="0 0 1500 1500"><Defs /><Hero /></svg>
  </AbsoluteFill>
);
