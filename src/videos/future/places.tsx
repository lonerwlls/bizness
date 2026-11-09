// Места действия эпизода: каждое нарисовано отдельно, в одном языке с персонажами
// (плоская заливка, мягкие градиенты-тени, тёмный контур одинаковой толщины, своя палитра и время суток).
import React from "react";

const INK = "#16131f";
const OL = 6;
const W = 1920, H = 1080;

export const PlaceDefs: React.FC = () => (
  <defs>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5fb2f2" /><stop offset="100%" stopColor="#d6efff" /></linearGradient>
    <linearGradient id="skyGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6f9fdc" /><stop offset="55%" stopColor="#ffc98a" /><stop offset="100%" stopColor="#ff9e6a" /></linearGradient>
    <linearGradient id="brick" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#e07a52" /><stop offset="100%" stopColor="#b85a3c" /></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bfe6ff" /><stop offset="100%" stopColor="#7cb8e0" /></linearGradient>
    <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7d8794" /><stop offset="100%" stopColor="#5d6672" /></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c5260" /><stop offset="100%" stopColor="#3a3f4b" /></linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dfe6ee" /><stop offset="100%" stopColor="#9aa6b4" /></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,240,0.45)" /><stop offset="100%" stopColor="rgba(255,255,240,0)" /></linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,250,220,0.95)" /><stop offset="40%" stopColor="rgba(255,240,190,0.5)" /><stop offset="100%" stopColor="rgba(255,240,190,0)" /></radialGradient>
    <radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,214,140,0.6)" /><stop offset="100%" stopColor="rgba(255,214,140,0)" /></radialGradient>
    <filter id="dof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5" /></filter>
    <pattern id="tiles" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#efe6d2" /><rect x="60" width="60" height="60" fill="#cfdcd8" /><path d="M 0 0 L 120 0 M 0 0 L 0 60 M 60 0 L 60 60" stroke="rgba(22,19,31,0.25)" strokeWidth="2" /></pattern>
    <pattern id="fence" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 0 0 L 40 40 M 40 0 L 0 40" stroke="#c6ced8" strokeWidth="3" /></pattern>
  </defs>
);

const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -110 20 Q -120 -20 -75 -24 Q -66 -66 -18 -58 Q 12 -92 58 -64 Q 104 -70 108 -26 Q 140 -14 126 20 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
);
const Tree: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#5fb04a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-150} width={28} height={150} fill="#8a5a3a" stroke={INK} strokeWidth={OL} />
    <path d="M -110 -150 Q -130 -250 -40 -270 Q 0 -340 70 -280 Q 140 -260 120 -170 Q 100 -110 0 -120 Q -90 -100 -110 -150 Z" fill={c} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
    <path d="M -60 -230 Q -30 -265 10 -255" stroke="rgba(255,255,255,0.35)" strokeWidth={14} fill="none" strokeLinecap="round" />
  </g>
);
const Win: React.FC<{ x: number; y: number; w: number; h: number; frame?: string }> = ({ x, y, w, h, frame = "#f4efe4" }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="url(#glass)" stroke={INK} strokeWidth={OL} />
    <path d={`M ${x + w * 0.15} ${y + h} L ${x + w * 0.55} ${y}`} stroke="rgba(255,255,255,0.5)" strokeWidth={w * 0.12} />
    <rect x={x + w / 2 - 4} y={y} width={8} height={h} fill={frame} stroke={INK} strokeWidth={3} />
    <rect x={x - 8} y={y + h - 4} width={w + 16} height={14} fill={frame} stroke={INK} strokeWidth={4} />
  </g>
);

// ---------- 1. школьный двор, солнечный день ----------
export const YardBG: React.FC<{ ground: number }> = ({ ground }) => (
  <g>
    <rect width={W} height={H} fill="url(#skyDay)" />
    <circle cx={260} cy={150} r={260} fill="url(#sunGlow)" />
    <Cloud x={560} y={160} s={1.1} /><Cloud x={980} y={110} s={0.8} /><Cloud x={1700} y={180} s={1.2} />
    {[80, 320, 520, 760].map((x, i) => <Tree key={x} x={x} y={ground - 190} s={0.9 + (i % 2) * 0.15} c={i % 2 ? "#4f9e40" : "#66b84e"} />)}
    {/* школа */}
    <rect x={1060} y={330} width={900} height={ground - 330} fill="url(#brick)" stroke={INK} strokeWidth={OL} />
    {Array.from({ length: 14 }, (_, r) => <path key={r} d={`M 1060 ${360 + r * 36} L 1960 ${360 + r * 36}`} stroke="rgba(120,40,20,0.25)" strokeWidth={3} />)}
    <rect x={1040} y={300} width={940} height={44} fill="#a8553a" stroke={INK} strokeWidth={OL} />
    {[0, 1, 2, 3].map((i) => [0, 1].map((r) => <Win key={`${i}${r}`} x={1110 + i * 200} y={390 + r * 170} w={130} h={110} />))}
    <rect x={1460} y={ground - 230} width={180} height={230} fill="#3f6fa8" stroke={INK} strokeWidth={OL} />
    <rect x={1546} y={ground - 230} width={8} height={230} fill={INK} />
    <rect x={1420} y={ground - 290} width={260} height={50} rx={8} fill="#f4efe4" stroke={INK} strokeWidth={OL} />
    <text x={1550} y={ground - 254} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={30} fill="#a8553a">LINCOLN SCHOOL</text>
    <rect x={1920 - 60} y={330} width={60} height={ground - 330} fill="rgba(60,20,10,0.25)" />
    {/* флаг */}
    <rect x={1000} y={160} width={10} height={ground - 160} fill="#c8ccd6" stroke={INK} strokeWidth={4} />
    <path d="M 1010 170 Q 1060 160 1110 176 L 1110 236 Q 1060 222 1010 230 Z" fill="#d8443a" stroke={INK} strokeWidth={5} />
    {/* сетка забора */}
    <rect x={0} y={ground - 170} width={1000} height={160} fill="url(#fence)" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200} y={ground - 180} width={10} height={170} fill="#9aa4b2" stroke={INK} strokeWidth={3} />)}
    <rect x={0} y={ground - 182} width={1000} height={10} fill="#9aa4b2" stroke={INK} strokeWidth={3} />
    {/* площадка */}
    <rect x={0} y={ground - 12} width={W} height={H} fill="url(#asphalt)" stroke={INK} strokeWidth={OL} />
    <path d={`M 0 ${ground + 70} L ${W} ${ground + 70}`} stroke="#f4efe4" strokeWidth={8} />
    <path d={`M 700 ${ground + 70} Q 960 ${ground + 160} 1220 ${ground + 70}`} stroke="#ffd23c" strokeWidth={8} fill="none" />
    {/* кольцо */}
    <rect x={140} y={ground - 420} width={14} height={420} fill="#5a6270" stroke={INK} strokeWidth={4} />
    <rect x={90} y={ground - 470} width={140} height={100} fill="#f4efe4" stroke={INK} strokeWidth={OL} />
    <rect x={130} y={ground - 445} width={60} height={44} fill="none" stroke="#d8443a" strokeWidth={5} />
    <ellipse cx={160} cy={ground - 368} rx={34} ry={8} fill="none" stroke="#e0702a" strokeWidth={6} />
    <path d={`M 128 ${ground - 366} L 142 ${ground - 320} L 178 ${ground - 320} L 192 ${ground - 366}`} stroke="#ffffff" strokeWidth={3} fill="none" />
  </g>
);

// ---------- 2. школьная столовая, светлый день ----------
export const CafeBG: React.FC<{ ground: number }> = ({ ground }) => (
  <g>
    <rect width={W} height={H} fill="#f4ead6" />
    <rect x={0} y={ground - 260} width={W} height={260} fill="#6fb3a8" stroke={INK} strokeWidth={OL} />
    <rect x={0} y={ground - 270} width={W} height={14} fill="#f4efe4" stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={120 + i * 430} y={110} width={330} height={420} fill="url(#skyDay)" stroke={INK} strokeWidth={OL} />
        <Tree x={250 + i * 430} y={600} s={0.9} />
        <rect x={120 + i * 430} y={110} width={330} height={420} fill="none" stroke={INK} strokeWidth={OL} />
        <rect x={281 + i * 430} y={110} width={8} height={420} fill="#f4efe4" stroke={INK} strokeWidth={3} />
        <rect x={120 + i * 430} y={316} width={330} height={8} fill="#f4efe4" stroke={INK} strokeWidth={3} />
        <path d={`M ${120 + i * 430} 530 L ${450 + i * 430} 530 L ${560 + i * 430} ${ground + 160} L ${200 + i * 430} ${ground + 160} Z`} fill="url(#beam)" />
      </g>
    ))}
    {/* меню и раздача */}
    <rect x={1420} y={120} width={420} height={250} rx={10} fill="#2e4a3e" stroke={INK} strokeWidth={OL} />
    <text x={1630} y={180} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={44} fill="#f4efe4">TODAY</text>
    {["PIZZA", "SALAD", "SOUP", "MILK"].map((t, i) => <text key={t} x={1460} y={232 + i * 34} fontFamily="FutMont" fontWeight={700} fontSize={26} fill="#cfe8d8">{t} ............ ${i + 2}</text>)}
    {[0, 1, 2].map((i) => <g key={i}><path d={`M ${560 + i * 430} 0 L ${560 + i * 430} 60`} stroke={INK} strokeWidth={4} /><path d={`M ${510 + i * 430} 90 Q ${560 + i * 430} 40 ${610 + i * 430} 90 Z`} fill="#ffd23c" stroke={INK} strokeWidth={5} /><circle cx={560 + i * 430} cy={120} r={90} fill="url(#warm)" /></g>)}
    {/* пол */}
    <rect x={0} y={ground - 10} width={W} height={H} fill="url(#tiles)" stroke={INK} strokeWidth={OL} />
  </g>
);

// ---------- 3. городская улица, золотой час ----------
const Shop: React.FC<{ x: number; w: number; c: string; aw: [string, string]; name: string; top: number; base: number }> = ({ x, w, c, aw, name, top, base }) => (
  <g>
    <rect x={x} y={top} width={w} height={base - top} fill={c} stroke={INK} strokeWidth={OL} />
    <rect x={x - 10} y={top - 26} width={w + 20} height={30} fill="#f4efe4" stroke={INK} strokeWidth={OL} />
    <Win x={x + 40} y={top + 50} w={w * 0.32} h={120} />
    <Win x={x + w * 0.58} y={top + 50} w={w * 0.32} h={120} />
    <rect x={x + 30} y={base - 290} width={w - 60} height={58} rx={8} fill="#f4efe4" stroke={INK} strokeWidth={OL} />
    <text x={x + w / 2} y={base - 248} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={36} fill={aw[0]}>{name}</text>
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${x + (i * w) / 8} ${base - 220} L ${x + ((i + 1) * w) / 8} ${base - 220} L ${x + ((i + 1) * w) / 8 + 10} ${base - 150} L ${x + (i * w) / 8 + 10} ${base - 150} Z`} fill={i % 2 ? aw[1] : aw[0]} stroke={INK} strokeWidth={4} />)}
    <rect x={x + 30} y={base - 140} width={w * 0.5} height={140} fill="#ffd58a" stroke={INK} strokeWidth={OL} />
    <circle cx={x + 30 + w * 0.25} cy={base - 70} r={60} fill="url(#warm)" />
    <rect x={x + w * 0.62} y={base - 160} width={w * 0.28} height={160} fill="#5a3a2a" stroke={INK} strokeWidth={OL} />
  </g>
);
export const StreetBG: React.FC<{ curb: number }> = ({ curb }) => (
  <g>
    <rect width={W} height={H} fill="url(#skyGold)" />
    <circle cx={1500} cy={420} r={300} fill="url(#sunGlow)" />
    <Cloud x={420} y={140} s={0.9} /><Cloud x={1180} y={90} s={0.7} />
    <Shop x={-20} w={430} c="#8fd0b8" aw={["#d8443a", "#f4efe4"]} name="BAKERY" top={260} base={curb} />
    <Shop x={430} w={460} c="#f0b05a" aw={["#3a6ad8", "#f4efe4"]} name="CAFÉ" top={200} base={curb} />
    <Shop x={910} w={420} c="#c8a0d8" aw={["#2e8a5a", "#f4efe4"]} name="BOOKS" top={290} base={curb} />
    <Shop x={1350} w={590} c="#ef8a7a" aw={["#e0a020", "#f4efe4"]} name="FLOWERS" top={230} base={curb} />
    {/* длинные закатные тени */}
    <path d={`M 0 ${curb} L ${W} ${curb} L ${W} ${curb - 40} L 0 ${curb - 140} Z`} fill="rgba(80,40,90,0.18)" />
    {/* тротуар, бордюр, дорога */}
    <rect x={0} y={curb} width={W} height={70} fill="#d8d2c8" stroke={INK} strokeWidth={OL} />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${i * 130} ${curb} L ${i * 130} ${curb + 70}`} stroke="rgba(22,19,31,0.25)" strokeWidth={3} />)}
    <rect x={0} y={curb + 70} width={W} height={H} fill="url(#road)" stroke={INK} strokeWidth={OL} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={760 + i * 60} y={curb + 90} width={36} height={H} fill="#f4efe4" />)}
    {/* светофор и фонарь */}
    <rect x={1620} y={curb - 420} width={16} height={420} fill="#3a3f4b" stroke={INK} strokeWidth={4} />
    <rect x={1590} y={curb - 560} width={76} height={170} rx={14} fill="#2a2e38" stroke={INK} strokeWidth={OL} />
    <circle cx={1628} cy={curb - 520} r={22} fill="#ff4a3a" stroke={INK} strokeWidth={4} /><circle cx={1628} cy={curb - 520} r={46} fill="rgba(255,80,60,0.35)" />
    <circle cx={1628} cy={curb - 472} r={22} fill="#5a4a2a" stroke={INK} strokeWidth={4} />
    <circle cx={1628} cy={curb - 424} r={22} fill="#2a4a3a" stroke={INK} strokeWidth={4} />
    <rect x={250} y={curb - 460} width={14} height={460} fill="#3a3f4b" stroke={INK} strokeWidth={4} />
    <path d={`M 257 ${curb - 460} Q 300 ${curb - 500} 350 ${curb - 470}`} stroke="#3a3f4b" strokeWidth={10} fill="none" />
    <path d={`M 330 ${curb - 474} L 372 ${curb - 474} L 362 ${curb - 444} L 340 ${curb - 444} Z`} fill="#ffe2a0" stroke={INK} strokeWidth={4} />
    <circle cx={352} cy={curb - 430} r={70} fill="url(#warm)" />
    <Tree x={1180} y={curb} s={0.85} c="#5aa646" />
    <rect x={1130} y={curb - 40} width={100} height={46} fill="#b8805a" stroke={INK} strokeWidth={OL} />
  </g>
);

// ---------- 4. фон названия: свой «фирменный» экран ----------
export const TitleBG: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#10283a" />
    <circle cx={W / 2} cy={H * 0.45} r={700} fill="rgba(95,244,255,0.08)" />
    {Array.from({ length: 13 }, (_, i) => <path key={"v" + i} d={`M ${i * 160} 0 L ${i * 160} ${H}`} stroke="rgba(95,244,255,0.08)" strokeWidth={2} />)}
    {Array.from({ length: 8 }, (_, i) => <path key={"h" + i} d={`M 0 ${i * 160} L ${W} ${i * 160}`} stroke="rgba(95,244,255,0.08)" strokeWidth={2} />)}
    <rect x={0} y={H - 110} width={W} height={110} fill="#0b1c29" stroke={INK} strokeWidth={OL} />
  </g>
);
