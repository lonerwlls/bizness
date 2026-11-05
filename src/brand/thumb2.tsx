// Обложка серии «What if everyone lost their eyes» в духе примеров пользователя: яркая сцена-история
// (3D-улица в 8 утра: машины врезались, дым, мигалки), крупный плоский герой без глаз в панике, пёс Бадди,
// толпа на заднем плане, короткая надпись в две строки (белая + жёлтая, с точкой) слева сверху.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Bean, BeanDefs, HERO2D } from "../toontest/bean";

const h = delayRender("thumb fonts");
new FontFace("ThumbMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load().then((f) => { document.fonts.add(f); continueRender(h); });
const INK = "#16131f";

const Title: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode }> = ({ x, y, size, fill, children }) => (
  <g>
    <text x={x + size * 0.05} y={y + size * 0.08} fontFamily="ThumbMont" fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.2} strokeLinejoin="round" letterSpacing={-size * 0.02}>{children}</text>
    <text x={x} y={y} fontFamily="ThumbMont" fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.13} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.02}>{children}</text>
  </g>
);

export const ThumbEyes2: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0f30" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 75% 50%, #3d63d8 0%, #1d2f86 45%, #0a0f30 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 72% 45%, rgba(255,170,90,0.35), rgba(0,0,0,0) 55%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 200px 40px rgba(20,10,40,0.55)" }} />
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
      <BeanDefs />
      <defs><filter id="far" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter></defs>
      {/* герой без глаз в панике: одна рука трогает лицо, другая шарит в воздухе */}
      <Bean x={1010} y={930} s={1.42} look={HERO2D} expr="shock" open={1} f={10} noEyes sweat pose={{ armL: [110, -25], armR: [172, 96], lean: -5, tilt: 6 }} />
      <Title x={40} y={150} size={104} fill="#ffffff">WHERE ARE</Title>
      <Title x={40} y={300} size={140} fill="#ffd23c">MY EYES?</Title>
    </svg>
  </AbsoluteFill>
);
