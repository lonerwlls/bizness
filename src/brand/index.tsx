// Оформление YouTube-канала: аватарка 800×800 и шапка 2560×1440 с нашим героем (плоский стиль, src/toontest/bean.tsx).
// npx remotion still src/brand/index.tsx Brand-avatar videos/brand/avatar.png
// npx remotion still src/brand/index.tsx Brand-banner videos/brand/banner.png
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { Bean, BeanDefs, HERO2D } from "../toontest/bean";

const INK = "#16131f";
const SKY_TOP = "#2f6fd6", SKY_LOW = "#8fc4ff", SUN = "#ffd35a";

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 30 Q -130 -20 -80 -24 Q -70 -70 -20 -62 Q 10 -100 60 -70 Q 110 -80 116 -30 Q 150 -20 136 30 Z" fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

// ---------- аватарка: крупно голова и плечи героя на ярком круге ----------
const Avatar: React.FC = () => (
  <AbsoluteFill>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <BeanDefs />
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="65%"><stop offset="0%" stopColor="#5aa8ff" /><stop offset="100%" stopColor={SKY_TOP} /></radialGradient>
      </defs>
      <rect width={800} height={800} fill="url(#bg)" />
      {/* солнечные лучи за головой — запоминающийся силуэт даже в маленьком кружке */}
      <g transform="translate(400 330)" opacity={0.22}>
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M 0 0 L -60 -520 L 60 -520 Z" fill="#ffffff" transform={`rotate(${i * 30})`} />)}
      </g>
      <circle cx={400} cy={330} r={250} fill={SUN} stroke={INK} strokeWidth={10} />
      <Bean x={400} y={1115} s={1.82} look={HERO2D} expr="smirk" f={10} shadow={false} pose={{ armL: [8, 4], armR: [8, 4], tilt: -5 }} />
    </svg>
  </AbsoluteFill>
);

// ---------- шапка: герой в безопасной зоне 1546×423 по центру, по краям — небо, облака, холмы (видно на ТВ) ----------
const SAFE = { x: 507, y: 508, w: 1546, h: 423 };
const Banner: React.FC<{ guide?: boolean }> = ({ guide }) => (
  <AbsoluteFill>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <BeanDefs />
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SKY_TOP} /><stop offset="100%" stopColor={SKY_LOW} /></linearGradient>
      </defs>
      <rect width={2560} height={1440} fill="url(#sky)" />
      {/* солнце-полукруг за героем */}
      <circle cx={1280} cy={880} r={300} fill={SUN} stroke={INK} strokeWidth={9} />
      <g transform="translate(1280 880)" opacity={0.18}>
        {Array.from({ length: 16 }, (_, i) => <path key={i} d="M 0 0 L -70 -900 L 70 -900 Z" fill="#ffffff" transform={`rotate(${-90 + i * 12})`} />)}
      </g>
      {/* облака: крупные по краям (ТВ/ПК), мелкие ближе к центру (телефон) */}
      <Cloud x={260} y={330} s={1.5} /><Cloud x={2300} y={260} s={1.7} /><Cloud x={640} y={610} s={0.8} /><Cloud x={1930} y={640} s={0.85} />
      <Cloud x={120} y={900} s={1.1} /><Cloud x={2450} y={860} s={1.2} />
      {/* холмы */}
      <path d="M 0 1010 Q 420 880 860 990 Q 1280 1080 1700 990 Q 2140 880 2560 1010 L 2560 1440 L 0 1440 Z" fill="#6cc24a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 0 1120 Q 640 1040 1280 1120 Q 1920 1200 2560 1110 L 2560 1440 L 0 1440 Z" fill="#4fa83a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {/* холмик под героем: ступни стоят на его вершине (y = 895) */}
      <path d="M 700 1220 Q 880 920 1280 895 Q 1680 920 1860 1220 Z" fill="#7ccf54" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 0 1120 Q 640 1040 1280 1120 Q 1920 1200 2560 1110 L 2560 1440 L 0 1440 Z" fill="#4fa83a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {/* герой машет зрителю */}
      <Bean x={1280} y={895} s={0.64} look={HERO2D} expr="grin" f={10} pose={{ armL: [10, 6], armR: [118, 42], lean: -2, tilt: -4 }} />
      {guide ? <rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} fill="none" stroke="#ff2a6a" strokeWidth={6} strokeDasharray="30 20" /> : null}
    </svg>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="Brand-avatar" component={Avatar} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="Brand-banner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
    <Composition id="Brand-banner-guide" component={() => <Banner guide />} durationInFrames={1} fps={30} width={2560} height={1440} />
  </>
);
registerRoot(Root);
