// Варианты стиля канала: одна и та же сцена (наш герой на улице у кафе) в пяти разных стилях.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Bean, BeanDefs, HERO2D, NEIGHBOR_B } from "../toontest/bean";
import { PlaceDefs, StreetBG } from "../videos/future/places";
import { Hero3D } from "./hero3d";

const fh = delayRender("style font");
Promise.all([
  new FontFace("FutMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load(),
  new FontFace("FutMont", `url(${staticFile("towers/fonts/Montserrat-cyrillic.woff2")}) format("woff2")`, { weight: "100 900", unicodeRange: "U+0400-04FF" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); });
const W = 1920, H = 1080;
export type StyleId = "comic" | "sketch" | "film" | "neon" | "glossy";

const Scene: React.FC<{ hero?: boolean }> = ({ hero = true }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <BeanDefs /><PlaceDefs />
    <g transform="translate(960 560) scale(1.35) translate(-960 -640)">
      <StreetBG curb={790} />
      <Bean x={1180} y={800} s={0.62} look={NEIGHBOR_B} expr="shock" open={1} f={10} flip pose={{ armL: [40, 15], armR: [40, 15] }} />
      {hero ? <Bean x={760} y={810} s={0.68} look={HERO2D} expr="grin" f={10} pose={{ armR: [130, 40], armL: [12, 8] }} /> : null}
    </g>
  </svg>
);
const Grain: React.FC<{ o: number }> = ({ o }) => (
  <svg width={W} height={H} style={{ position: "absolute", mixBlendMode: "multiply", opacity: o }}>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter="url(#gr)" />
  </svg>
);
const Label: React.FC<{ t: string; sub: string }> = ({ t, sub }) => (
  <div style={{ position: "absolute", left: 50, top: 40, fontFamily: "FutMont", fontWeight: 900, color: "#fff", textShadow: "0 4px 0 #16131f, 0 0 14px rgba(0,0,0,0.6)" }}>
    <div style={{ fontSize: 64 }}>{t}</div>
    <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.95 }}>{sub}</div>
  </div>
);

export const StyleCard: React.FC<{ id: StyleId }> = ({ id }) => {
  if (id === "comic") return (
    <AbsoluteFill><Scene /><AbsoluteFill style={{ boxShadow: "inset 0 0 220px 30px rgba(20,15,40,0.3)" }} /><Label t="1. КОМИКС" sub="яркий плоский рисунок с контуром" /></AbsoluteFill>
  );
  if (id === "sketch") return (
    <AbsoluteFill style={{ background: "#f1e6cf" }}>
      <svg width={0} height={0}><filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="7" /></filter></svg>
      <AbsoluteFill style={{ filter: "url(#wob) saturate(0.42) contrast(1.08) brightness(1.06)" }}><Scene /></AbsoluteFill>
      <AbsoluteFill style={{ background: "#f3e7cc", mixBlendMode: "multiply", opacity: 0.55 }} />
      <Grain o={0.35} />
      <Label t="2. СКЕТЧБУК" sub="карандаш на бумаге, приглушённые цвета" />
    </AbsoluteFill>
  );
  if (id === "film") return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "sepia(0.8) saturate(1.35) contrast(1.06) brightness(0.95)" }}><Scene /></AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 35%, rgba(255,210,140,0.35), rgba(60,30,10,0.55) 85%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 300px 80px rgba(40,20,5,0.6)" }} />
      <Grain o={0.3} />
      <Label t="3. ТЁПЛОЕ КИНО" sub="золото и сепия, зерно, как старая плёнка" />
    </AbsoluteFill>
  );
  if (id === "neon") return (
    <AbsoluteFill style={{ background: "#0b0c22" }}>
      <AbsoluteFill style={{ filter: "brightness(0.55) saturate(1.3) hue-rotate(-10deg)" }}><Scene /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(30,40,140,0.55), rgba(70,20,110,0.35))", mixBlendMode: "multiply" }} />
      <svg width={W} height={H} style={{ position: "absolute", mixBlendMode: "screen" }}>
        <defs><radialGradient id="ng" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,190,110,0.9)" /><stop offset="100%" stopColor="rgba(255,190,110,0)" /></radialGradient>
          <radialGradient id="nc" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(80,230,255,0.8)" /><stop offset="100%" stopColor="rgba(80,230,255,0)" /></radialGradient></defs>
        {[[440, 690, 190], [1061, 690, 170], [1726, 690, 190], [139, 182, 150]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="url(#ng)" />)}
        <circle cx={1862} cy={60} r={110} fill="rgba(255,70,60,0.5)" />
        <circle cx={1061} cy={250} r={160} fill="url(#nc)" />
      </svg>
      <Label t="4. НОЧНОЙ НЕОН" sub="тёмная ночь, светящиеся окна и вывески" />
    </AbsoluteFill>
  );
  // glossy: объёмный рисованный герой (как для обложек) + свет и тени поверх сцены
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "saturate(1.25) contrast(1.05)" }}><Scene hero={false} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(110deg, rgba(255,230,180,0.35) 0%, rgba(255,230,180,0) 45%, rgba(40,20,80,0.25) 100%)", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", left: 360, top: 170, width: 960, height: 960 }}>
        <div style={{ transform: "scale(0.64)", transformOrigin: "0 0", width: 1500, height: 1500, position: "relative" }}><Hero3D /></div>
      </div>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 240px 40px rgba(20,15,40,0.35)" }} />
      <Label t="5. ОБЪЁМНЫЙ МУЛЬТ" sub="свет, тени и блики, как на обложках" />
    </AbsoluteFill>
  );
};
