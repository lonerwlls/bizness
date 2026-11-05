// Обложки серии «What if everyone lost their eyes»: 1280×720 (YouTube) и 1080×1920 (Shorts).
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Bean, BeanDefs, HERO2D } from "../toontest/bean";

const h = delayRender("anton");
new FontFace("Anton", `url(${staticFile("towers/fonts/Anton.woff2")}) format("woff2")`).load().then((f) => { document.fonts.add(f); continueRender(h); });
const INK = "#16131f";

/** большие часы «8:00» — момент, когда всё случилось */
const Clock: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.25} fill="rgba(255,60,60,0.25)" filter="url(#glow)" />
    <circle r={r} fill="#f6f1e6" stroke={INK} strokeWidth={r * 0.08} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-r * 0.03} y={-r * 0.9} width={r * 0.06} height={r * 0.16} fill={INK} transform={`rotate(${i * 30})`} />)}
    <rect x={-r * 0.045} y={-r * 0.48} width={r * 0.09} height={r * 0.5} rx={r * 0.04} fill={INK} transform="rotate(240)" />
    <rect x={-r * 0.035} y={-r * 0.75} width={r * 0.07} height={r * 0.77} rx={r * 0.03} fill="#d8343a" />
    <circle r={r * 0.07} fill={INK} />
  </g>
);
const Defs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
    <radialGradient id="bgr" cx="35%" cy="45%" r="75%"><stop offset="0%" stopColor="#3a5fc8" /><stop offset="55%" stopColor="#1b2a6a" /><stop offset="100%" stopColor="#07091a" /></radialGradient>
  </defs>
);
const Text: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode; anchor?: "start" | "middle" | "end"; rot?: number }> = ({ x, y, size, fill, children, anchor = "start", rot = 0 }) => (
  <text x={x} y={y} fontFamily="Anton" fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round" textAnchor={anchor} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} letterSpacing={size * 0.01}>{children}</text>
);
const HANDS = { armL: [150, 75] as [number, number], armR: [150, 75] as [number, number], lean: -4, tilt: 3 };

export const ThumbEyes: React.FC = () => (
  <AbsoluteFill>
    <svg width={1280} height={720} viewBox="0 0 1280 720">
      <BeanDefs /><Defs />
      <rect width={1280} height={720} fill="url(#bgr)" />
      <Clock x={1080} y={150} r={95} />
      {/* герой без глаз в ужасе, руки у лица */}
      <circle cx={400} cy={300} r={260} fill="rgba(255,90,60,0.28)" filter="url(#glow)" />
      <Bean x={400} y={1060} s={1.5} look={HERO2D} expr="shock" open={1} f={10} noEyes shadow={false} pose={HANDS} />
      <Text x={1240} y={340} size={74} fill="#ffffff" anchor="end">8 BILLION PEOPLE</Text>
      <Text x={1240} y={500} size={170} fill="#ffd23c" anchor="end">ZERO EYES</Text>
      <Text x={1240} y={590} size={58} fill="#ff5a5a" anchor="end">AT 8:00 AM</Text>
    </svg>
  </AbsoluteFill>
);
export const ThumbEyesVertical: React.FC = () => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <BeanDefs /><Defs />
      <rect width={1080} height={1920} fill="url(#bgr)" />
      <Clock x={860} y={250} r={120} />
      <Text x={540} y={600} size={110} fill="#ffffff" anchor="middle">8 BILLION PEOPLE</Text>
      <Text x={540} y={800} size={230} fill="#ffd23c" anchor="middle">ZERO EYES</Text>
      <circle cx={540} cy={1180} r={330} fill="rgba(255,90,60,0.28)" filter="url(#glow)" />
      <Bean x={540} y={1990} s={1.85} look={HERO2D} expr="shock" open={1} f={10} noEyes shadow={false} pose={HANDS} />
    </svg>
  </AbsoluteFill>
);
