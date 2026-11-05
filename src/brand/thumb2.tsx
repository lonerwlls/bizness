// Обложка серии «What if everyone lost their eyes» в духе примеров пользователя: яркая сцена-история
// (3D-улица в 8 утра: машины врезались, дым, мигалки), крупный плоский герой без глаз в панике, пёс Бадди,
// толпа на заднем плане, короткая надпись в две строки (белая + жёлтая, с точкой) слева сверху.
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { CamRig, Car3D, MOODS, Street, V3, World } from "../lowpoly/kit3d";
import { Bean, BeanDefs, BeanLook, HERO2D, NEIGHBOR_A, NEIGHBOR_B } from "../toontest/bean";

const h = delayRender("thumb fonts");
new FontFace("ThumbMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load().then((f) => { document.fonts.add(f); continueRender(h); });
const INK = "#16131f";

const Smoke: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p}>
    {[[0, 0, 0, 1], [0.6, 0.9, 0.2, 0.8], [-0.5, 1.6, -0.1, 0.9], [0.3, 2.5, 0, 1.1], [-0.2, 3.5, 0.2, 1.3]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x * s, y * s, z * s]}><icosahedronGeometry args={[r * s, 1]} /><meshStandardMaterial color={i % 2 ? "#6a6470" : "#8a8490"} transparent opacity={0.85} flatShading /></mesh>
    ))}
  </group>
);
const Background: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 46, near: 0.05, far: 1000 }}>
      <CamRig pos={[-2.6, 1.5, 9]} look={[1.2, 2.2, -12]} fov={50} />
      <World m={{ ...MOODS.sunset, sunDir: [-30, 6, -40] }} focus={[0, 0, -6]} />
      <Street />
      <Car3D p={[-1.4, 0, -3]} rotY={0.9} c="#d8443a" hazard f={4} />
      <Car3D p={[1.6, 0.12, -11]} rotY={-0.5} c="#3a6ad8" hazard f={0} />
      <Car3D p={[-2.6, 0, -18]} rotY={2.6} c="#f2c230" hazard f={4} />
      <Smoke p={[-0.6, 0.6, -2.4]} s={0.7} />
      <Smoke p={[2.2, 0.8, -10.4]} s={0.9} />
    </ThreeCanvas>
  );
};
/** плоский пёс Бадди в том же стиле, что и персонажи */
const Dog: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${-s} ${s})`}>
    <ellipse cx={0} cy={6} rx={110} ry={18} fill="rgba(30,20,60,0.35)" filter="url(#beanBlur)" />
    {[-55, -25, 30, 60].map((lx) => <path key={lx} d={`M ${lx} -40 L ${lx + 4} 0`} stroke="#8a5a30" strokeWidth={16} strokeLinecap="round" />)}
    <path d="M 70 -95 Q 110 -140 118 -170" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M 70 -95 Q 110 -140 118 -170" stroke="#c08a52" strokeWidth={12} strokeLinecap="round" fill="none" />
    <ellipse cx={0} cy={-70} rx={90} ry={48} fill="#c08a52" stroke={INK} strokeWidth={7} />
    <g transform="translate(-80 -130) rotate(-12)">
      <ellipse cx={0} cy={0} rx={52} ry={46} fill="#c08a52" stroke={INK} strokeWidth={7} />
      <ellipse cx={-40} cy={18} rx={30} ry={22} fill="#e8c8a0" stroke={INK} strokeWidth={6} />
      <ellipse cx={-62} cy={8} rx={9} ry={7} fill={INK} />
      <path d="M -12 -36 Q 10 -70 32 -30 Q 22 0 2 4 Z" fill="#7a4a24" stroke={INK} strokeWidth={6} />
      <ellipse cx={-12} cy={-6} rx={7} ry={9} fill={INK} />
      <path d="M -50 38 Q -44 64 -32 40 Z" fill="#e8667a" stroke={INK} strokeWidth={4} />
    </g>
    <rect x={-75} y={-108} width={34} height={12} rx={6} fill="#d8443a" stroke={INK} strokeWidth={4} transform="rotate(-20 -58 -102)" />
  </g>
);
const CROWD: [number, number, number, BeanLook, boolean][] = [[150, 470, 0.36, NEIGHBOR_A, false], [300, 445, 0.3, NEIGHBOR_B, true], [450, 425, 0.24, NEIGHBOR_A, false], [560, 410, 0.2, NEIGHBOR_B, true]];
const Title: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode }> = ({ x, y, size, fill, children }) => (
  <g>
    <text x={x + size * 0.05} y={y + size * 0.08} fontFamily="ThumbMont" fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.2} strokeLinejoin="round" letterSpacing={-size * 0.02}>{children}</text>
    <text x={x} y={y} fontFamily="ThumbMont" fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.13} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.02}>{children}</text>
  </g>
);

export const ThumbEyes2: React.FC = () => (
  <AbsoluteFill style={{ background: "#1b2a6a" }}>
    <AbsoluteFill style={{ filter: "blur(2.5px) saturate(1.6) contrast(1.05) brightness(1.22)" }}><Background /></AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 72% 45%, rgba(255,170,90,0.35), rgba(0,0,0,0) 55%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 200px 40px rgba(20,10,40,0.55)" }} />
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{ position: "absolute" }}>
      <BeanDefs />
      <defs><filter id="far" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter></defs>
      {/* люди на улице тоже без глаз: бредут, вытянув руки */}
      <g filter="url(#far)">
        {CROWD.map(([x, y, s, lk, fl], i) => <Bean key={i} x={x} y={y} s={s} look={lk} expr="shock" open={1} f={i * 7} noEyes flip={fl} pose={{ armL: [95, -10], armR: [95, -10], lean: 4 }} />)}
      </g>
      {/* мигалки разбитых машин */}
      {[[560, 440, 70], [470, 450, 50]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? "rgba(255,90,40,0.55)" : "rgba(255,170,40,0.55)"} filter="url(#beanBlur)" style={{ mixBlendMode: "screen" }} />)}
      {/* Бадди смотрит на героя снизу */}
      <Dog x={600} y={745} s={1.05} />
      {/* герой без глаз в панике: одна рука трогает лицо, другая шарит в воздухе */}
      <Bean x={960} y={880} s={1.32} look={HERO2D} expr="shock" open={1} f={10} noEyes sweat pose={{ armL: [110, -25], armR: [172, 96], lean: -5, tilt: 6 }} />
      <Title x={34} y={120} size={92} fill="#ffffff">EVERYONE.</Title>
      <Title x={34} y={240} size={118} fill="#ffd23c">NO EYES.</Title>
    </svg>
  </AbsoluteFill>
);
