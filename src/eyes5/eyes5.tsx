// «What if everyone lost their eyes» — часть 5/6: YEARS LATER (годы 2–10). 60 сек, low-poly 3D, рассказ на «ты».
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import {
  CamRig, Car3D, Dog3D, Human, MASCOT3D, MAYA3D, MOODS, Mat, NPCS, Pose3D, SIT, STAND3D, Street, Tree, V3, WALK_Y, World,
  lerp, rnd, walkPose,
} from "../lowpoly/kit3d";

export const EYES5_FRAMES = 1800;
const SC = 180;
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
};
const OLD_DOG = { color: "#c8a07a", muzzle: "#d8d0c4" };

// город для ушей: жёлтые рельефные дорожки, маяки на углах, поручни
const Beacon: React.FC<{ p: V3; f: number; k?: number }> = ({ p, f, k = 0 }) => {
  const t = ((f / 30 + k * 0.37) % 1);
  return (
    <group position={p}>
      <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.06, 0.07, 2.6, 8]} /><Mat c="#f5c84c" /></mesh>
      <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[0.3, 0.36, 0.3]} /><Mat c="#2a3450" /></mesh>
      <mesh position={[0, 2.72, 0]}><sphereGeometry args={[0.05, 10, 8]} /><Mat c="#5af0ff" e="#5af0ff" ei={t < 0.3 ? 2 : 0.3} /></mesh>
      <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + t * 2.2}><torusGeometry args={[1, 0.012, 6, 48]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.6 * (1 - t)} /></mesh>
    </group>
  );
};
const SoundCity: React.FC<{ f: number; cross?: boolean }> = ({ f, cross }) => (
  <>
    <Street />
    {Array.from({ length: 60 }, (_, i) => <mesh key={i} position={[1.65, WALK_Y + 0.012, 30 - i * 1.0]} receiveShadow><boxGeometry args={[0.3, 0.02, 0.9]} /><Mat c="#f2c230" /></mesh>)}
    {Array.from({ length: 60 }, (_, i) => [0, 1].map((k) => <mesh key={`${i}${k}`} position={[1.58 + k * 0.14, WALK_Y + 0.026, 30 - i * 1.0]}><boxGeometry args={[0.03, 0.02, 0.85]} /><Mat c="#d8a820" /></mesh>))}
    {Array.from({ length: 16 }, (_, i) => <mesh key={"r" + i} position={[2.36, 0.95, 26 - i * 4]}><boxGeometry args={[0.04, 0.04, 4]} /><Mat c="#aab0b8" /></mesh>)}
    {Array.from({ length: 30 }, (_, i) => <mesh key={"p" + i} position={[2.36, 0.53, 26 - i * 2]}><cylinderGeometry args={[0.02, 0.02, 0.85, 6]} /><Mat c="#aab0b8" /></mesh>)}
    {[18, 0, -18, -36].map((z, k) => <Beacon key={z} p={[0.45, WALK_Y, z]} f={f} k={k} />)}
    {cross ? (
      <>
        {Array.from({ length: 7 }, (_, i) => <mesh key={"z" + i} rotation={[-Math.PI / 2, 0, 0]} position={[-0.6 - i * 1.05, 0.012, 0]}><planeGeometry args={[0.6, 2.4]} /><meshStandardMaterial color="#f2f2ee" /></mesh>)}
        <Beacon p={[-8.0, 0.06, 1.4]} f={f} k={2} />
      </>
    ) : null}
  </>
);

// ---------- 1. Город заговорил ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.032;
  const z = 6 - dist;
  const hp: Pose3D = { ...walkPose(dist, 0.85, 0.08), headPitch: -4 };
  return (
    <Canvas3D>
      <CamRig pos={[-1.8, 1.6, z - 3.6]} look={[1.5, 0.9, z + 0.4]} fov={46} />
      <World m={MOODS.day} focus={[1.5, 0, z]} />
      <SoundCity f={g} />
      <Human p={[1.65, WALK_Y + 0.02, z]} rotY={Math.PI} pose={hp} eyes={0} f={g} mouth="smile" />
      <Dog3D p={[1.1, WALK_Y, z - 0.6]} rotY={Math.PI} f={g} walk={g * 0.17} wag={0.5} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- 2. Новые правила ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const rules: [string, string][] = [["🔊", "EVERY CORNER HAS A SOUND BEACON"], ["▦", "BUMPY PATHS YOU READ WITH YOUR FEET"], ["🗣", "EVERYTHING TALKS: DOORS, LIFTS, SHOPS"], ["⚠", "NEVER MOVE THINGS WITHOUT TELLING"]];
  return (
    <AbsoluteFill style={{ background: "#0b1020", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: MONT, fontWeight: 900, color: "#9cb0d0", fontSize: 40, letterSpacing: 6, marginBottom: 60, marginTop: -120 }}>THE NEW RULES</div>
      {rules.map(([icon, text], i) => {
        const k = ip(g, [12 + i * 18, 26 + i * 18], [0, 1], Easing.out(Easing.back(2)));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, width: 880, margin: "18px 0", opacity: k, transform: `translateX(${(1 - k) * -60}px)`, background: "rgba(30,40,70,0.8)", border: `3px solid ${i === 3 ? RED : GREEN}`, borderRadius: 20, padding: "22px 28px" }}>
            <div style={{ fontSize: 58, width: 80, textAlign: "center", color: YEL }}>{icon}</div>
            <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 36, color: WH, lineHeight: 1.15 }}>{text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 3. Переход и машины без водителя ----------
const RoboCar: React.FC<{ p: V3; rotY: number; c: string; f: number }> = ({ p, rotY, c, f }) => (
  <group>
    <Car3D p={p} rotY={rotY} c={c} f={f} />
    <mesh position={[p[0], 1.28, p[2]]}><cylinderGeometry args={[0.16, 0.18, 0.14, 12]} /><Mat c="#1b1b22" /></mesh>
    <mesh position={[p[0], 1.37, p[2]]}><sphereGeometry args={[0.08, 10, 8]} /><Mat c="#5af0ff" e="#5af0ff" ei={1.4} /></mesh>
  </group>
);
const S3: React.FC<{ g: number }> = ({ g }) => {
  const carZ = lerp(-26, -3.2, ip(g, [0, 70], [0, 1], Easing.out(Easing.quad)));
  const cross = ip(g, [80, 175], [0, 1]);
  const dist = cross * 6.6;
  const hx = 1.3 - dist;
  const hy = hx > 0.2 ? WALK_Y : 0;
  return (
    <Canvas3D>
      <CamRig pos={[-1.0, 2.2, 6.8]} look={[-2.2, 0.6, -0.2]} fov={50} />
      <World m={MOODS.day} focus={[-3, 0, 0]} />
      <SoundCity f={g} cross />
      <RoboCar p={[-2.4, 0, carZ]} rotY={0} c="#e8e4dc" f={g} />
      <RoboCar p={[-5.6, 0, 3.6]} rotY={Math.PI} c="#5f8fb5" f={g} />
      <Human p={[hx, hy, 0.4]} rotY={-Math.PI / 2} pose={cross > 0 ? walkPose(dist, 0.8, 0.07) : STAND3D} eyes={0} f={g} mouth="smile" />
      <Dog3D p={[hx - 0.3, hy, 0.95]} rotY={-Math.PI / 2} f={g} walk={cross > 0 ? g * 0.15 : 0} sit={cross === 0} {...OLD_DOG} />
      <Human p={[1.3 - dist * 0.9, hy, -0.5]} rotY={-Math.PI / 2} look={NPCS[1]} pose={cross > 0 ? walkPose(dist * 0.9 + 0.3, 0.75, 0.06) : STAND3D} eyes={0} f={g + 7} />
    </Canvas3D>
  );
};

// ---------- 4. Ты на радио ----------
const S4: React.FC<{ g: number }> = ({ g }) => {
  const talk = Math.floor(g / 5) % 3 !== 0;
  const cam = ip(g, [0, 180], [0, 1]);
  return (
    <Canvas3D>
      <CamRig pos={[1.1 - cam * 0.3, 1.45, 1.8 - cam * 0.3]} look={[-0.3, 1.45, -1.8]} fov={50} />
      <hemisphereLight args={["#e8dcd0", "#3a3040", 0.95]} />
      <directionalLight position={[2, 4, 2]} intensity={1.6} color="#ffe0c0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#2a2638"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><Mat c="#3a3448" /></mesh>
      <mesh position={[0, 1.6, -3]}><boxGeometry args={[10, 3.2, 0.1]} /><Mat c="#4a4258" /></mesh>
      {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-3 + (i % 8) * 0.8, 0.8 + Math.floor(i / 8) * 0.8, -2.93]}><boxGeometry args={[0.7, 0.7, 0.06]} /><Mat c={i % 2 ? "#3a3448" : "#443c52"} /></mesh>)}
      <group position={[0.4, 2.3, -2.9]}>
        <mesh><boxGeometry args={[1.0, 0.36, 0.06]} /><Mat c="#3a0a0a" e="#ff2a2a" ei={Math.floor(g / 20) % 2 ? 1.6 : 1.2} /></mesh>
        <pointLight position={[0, 0, 0.4]} intensity={3} distance={4} color="#ff4040" />
      </group>
      <mesh position={[-0.6, 0.75, -1.0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.06, 0.8]} /><Mat c="#6a4a30" /></mesh>
      {[-1.4, 0.2].map((x) => <mesh key={x} position={[x, 0.37, -1.0]}><boxGeometry args={[0.06, 0.74, 0.7]} /><Mat c="#4a3020" /></mesh>)}
      <mesh position={[-0.75, 0.82, -0.85]}><boxGeometry args={[0.6, 0.06, 0.35]} /><Mat c="#1b1b22" /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={"s" + i} position={[-0.95 + i * 0.08, 0.86, -0.85]}><boxGeometry args={[0.03, 0.02, 0.1]} /><Mat c={i % 2 ? "#5af0ff" : "#f5c84c"} e={i % 2 ? "#5af0ff" : "#f5c84c"} ei={0.8} /></mesh>)}
      <mesh position={[-0.6, 1.05, -1.05]}><cylinderGeometry args={[0.015, 0.015, 0.5, 6]} /><Mat c="#2a2a30" /></mesh>
      <mesh position={[-0.6, 1.35, -1.1]} rotation={[0.6, 0, 0]}><capsuleGeometry args={[0.05, 0.1, 6, 10]} /><Mat c="#2a2a30" r={0.4} /></mesh>
      <Human p={[-0.6, 0, -1.75]} pose={{ ...SIT, armL: [55, 85], armR: [40, 80], headPitch: 6, lean: 10 }} eyes={0} f={g} mouth={talk ? "o" : "smile"} />
      <mesh position={[-0.6, 1.54 + 0.47 - 0.3, -1.75 + 0.06]} rotation={[0, 0, 0]}><torusGeometry args={[0.17, 0.02, 6, 20, Math.PI]} /><Mat c="#1b1b22" /></mesh>
      <Dog3D p={[0.5, 0, -1.6]} rotY={-1.9} f={g} sit wag={0.3} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- 5. Концерт ----------
const S5: React.FC<{ g: number }> = ({ g }) => {
  const crowd = Array.from({ length: 16 }, (_, i) => ({ x: 4 + (i % 4) * 1.0 + rnd(i) * 0.3, z: -4 + Math.floor(i / 4) * 1.1 + rnd(i + 3) * 0.3, k: i }));
  const beat = Math.abs(Math.sin((g / 30) * Math.PI * 2.2));
  return (
    <Canvas3D>
      <CamRig pos={[2.0, 2.4, 3.8]} look={[6.5, 1.0, -6.5]} fov={50} />
      <World m={MOODS.night} focus={[6, 0, -6]} stars />
      <Street lit />
      <group position={[6.5, 0, -8.5]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[5, 0.8, 2.4]} /><Mat c="#2a2a34" /></mesh>
        {[-2.4, 2.4].map((x) => <mesh key={x} position={[x, 2.2, -0.9]}><boxGeometry args={[0.15, 3.6, 0.15]} /><Mat c="#1b1b22" /></mesh>)}
        <mesh position={[0, 4.0, -0.9]}><boxGeometry args={[5, 0.15, 0.15]} /><Mat c="#1b1b22" /></mesh>
        {[-1.6, -0.5, 0.6, 1.7].map((x, i) => (
          <group key={i} position={[x, 3.85, -0.8]}>
            <mesh><boxGeometry args={[0.2, 0.2, 0.2]} /><Mat c="#111" e={["#ff4080", "#40c0ff", "#ffd040", "#80ff60"][i]} ei={1 + beat} /></mesh>
            <pointLight position={[0, -0.6, 2.4]} intensity={6 * (0.6 + beat)} distance={12} color={["#ff4080", "#40c0ff", "#ffd040", "#80ff60"][i]} />
          </group>
        ))}
        {[-2.0, 2.0].map((x) => <mesh key={"sp" + x} position={[x, 1.5, 0.6]} castShadow><boxGeometry args={[0.6, 1.2, 0.5]} /><Mat c="#141418" /></mesh>)}
        {[[-0.8, 0], [0.8, 2]].map(([x, k]) => <Human key={k} p={[x, 0.8, 0]} rotY={0} look={NPCS[k]} pose={{ ...STAND3D, armR: [60 + beat * 20, 80], armL: [40, 100] }} eyes={0} f={g + k} mouth="o" />)}
      </group>
      {crowd.map(({ x, z, k }) => {
        const jump = Math.abs(Math.sin((g / 30) * Math.PI * 2.2 + k)) * 0.15;
        return <Human key={k} p={[x, 0.03 + jump, z]} rotY={Math.PI + (rnd(k) - 0.5) * 0.6} look={k === 5 ? MASCOT3D : k === 6 ? MAYA3D : NPCS[k % 5]} glasses={k === 6} pose={{ ...STAND3D, armL: [150 + beat * 20, 175], armR: [150 - beat * 20, 175], spread: [0.25, 0.25] }} eyes={0} f={g + k * 3} mouth="smile" />;
      })}
    </Canvas3D>
  );
};

// ---------- 6. Мозг перестраивается ----------
const S6: React.FC<{ g: number }> = ({ g }) => {
  const k = ip(g, [30, 90], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <text x={540} y={430} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={42} letterSpacing={6} fill="#9cb0d0">THE BRAIN ADAPTS</text>
        <g transform="translate(540 860)">
          <ellipse rx={330} ry={250} fill="#2a2440" stroke="#5a4a8a" strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-300 + i * 70} -150 q 30 60 0 120 q -30 60 0 120`} stroke="#3a3460" strokeWidth={6} fill="none" />)}
          <ellipse cx={230} cy={40} rx={110} ry={120} fill={k > 0 ? "#3ad08a" : "#e0524a"} opacity={0.35 + 0.35 * Math.abs(Math.sin(g / 8))} />
          <ellipse cx={-60} cy={-40} rx={90} ry={70} fill="#5af0ff" opacity={0.3 + 0.2 * k} />
          <ellipse cx={-40} cy={-160} rx={110} ry={50} fill={YEL} opacity={0.2 + 0.3 * k} />
          {k > 0 ? [0, 1].map((i) => <path key={i} d={i ? "M 120 40 Q 40 0 -20 -40" : "M 140 -10 Q 60 -120 20 -150"} stroke={WH} strokeWidth={6} strokeDasharray="14 10" fill="none" opacity={k} />) : null}
        </g>
        <text x={540} y={1240} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill={k > 0.5 ? GREEN : RED}>{k > 0.5 ? "SEEING AREA → NOW HEARS & FEELS" : "SEEING AREA: UNUSED"}</text>
        <text x={540} y={1310} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#9cb0d0" opacity={ip(g, [100, 115], [0, 1])}>REAL SCIENCE: IT HAPPENS IN BLIND PEOPLE TODAY</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 7. Футбол с колокольчиками ----------
const S7: React.FC<{ g: number }> = ({ g }) => {
  const bx = 7.2 + Math.sin(g / 25) * 0.7, bz = -2 + Math.sin(g / 17) * 1.2;
  const kids = [0, 1, 2, 3].map((i) => {
    const tx = bx + Math.cos(i * 1.6) * (0.8 + i * 0.3), tz = bz + Math.sin(i * 1.6) * (0.8 + i * 0.2);
    return { x: tx, z: tz, rot: Math.atan2(bx - tx, bz - tz), k: i };
  });
  return (
    <Canvas3D>
      <CamRig pos={[7.2, 3.2, 5.2]} look={[7.2, 0.3, -2.0]} fov={52} />
      <World m={MOODS.day} focus={[7, 0, -2]} />
      <Street />
      {[[7, -6.2], [7, 2.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[-1.2, 1.2].map((dx) => <mesh key={dx} position={[dx, 0.6, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2, 6]} /><Mat c="#f2f2ee" /></mesh>)}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.4, 6]} /><Mat c="#f2f2ee" /></mesh>
        </group>
      ))}
      <mesh position={[bx, 0.14 + Math.abs(Math.sin(g / 4)) * 0.1, bz]} rotation={[g * 0.2, g * 0.1, 0]} castShadow><icosahedronGeometry args={[0.12, 1]} /><Mat c="#f5c84c" /></mesh>
      {[0, 1].map((k) => { const t = ((g / 12 + k / 2) % 1); return <mesh key={k} position={[bx, 0.2, bz]} rotation={[Math.PI / 2, 0, 0]} scale={0.15 + t * 0.6}><torusGeometry args={[1, 0.03, 6, 24]} /><meshBasicMaterial color="#f5c84c" transparent opacity={0.8 * (1 - t)} /></mesh>; })}
      {kids.map(({ x, z, rot, k }) => <Human key={k} p={[x, 0.03, z]} rotY={rot} scale={0.72} look={NPCS[(k + 1) % 5]} pose={walkPose(g * 0.05 + k, 0.9, 0.1)} eyes={0} f={g + k * 4} mouth="smile" />)}
      <Human p={[5.2, 0.03, 1.4]} rotY={2.4} pose={{ ...STAND3D, armL: [150, 175], armR: [150, 175], spread: [0.3, 0.3] }} eyes={0} f={g} mouth="smile" />
    </Canvas3D>
  );
};

// ---------- 8. Бадди стареет ----------
const S8: React.FC<{ g: number }> = ({ g }) => {
  const pet = Math.sin(g / 9);
  return (
    <Canvas3D>
      <CamRig pos={[5.3, 1.4, 4.0]} look={[7.4, 0.85, 1.6]} fov={42} />
      <World m={MOODS.sunset} focus={[7, 0, 1]} />
      <Street />
      <group position={[7.6, 0, 1.6]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 1.8]} /><Mat c="#8a5a3a" /></mesh>
        {[-0.8, 0.8].map((z) => <mesh key={z} position={[0, 0.2, z]}><boxGeometry args={[0.45, 0.4, 0.06]} /><Mat c="#5a3a24" /></mesh>)}
      </group>
      <Human p={[7.6, 0.03, 2.0]} rotY={-Math.PI / 2} pose={{ ...SIT, armR: [40 + pet * 6, 60], headPitch: 20, headYaw: 15 }} eyes={0} f={g} mouth="smile" />
      <group position={[6.95, 0.03, 1.55]} rotation={[0, -0.4, 0]}>
        <Dog3D p={[0, -0.18, 0]} f={g} sit wag={0.25} headTilt={8} {...OLD_DOG} />
      </group>
    </Canvas3D>
  );
};

// ---------- 9. Свадьба ----------
const S9: React.FC<{ g: number }> = ({ g }) => {
  const cx = 7.2, cz = -1;
  return (
    <Canvas3D>
      <CamRig pos={[cx + 0.2, 1.5, cz + 3.6]} look={[cx, 1.15, cz - 0.3]} fov={48} />
      <World m={MOODS.morning} focus={[cx, 0, cz]} />
      <Street />
      <group position={[cx + 1.6, 0, cz - 1.2]} scale={1.3}>
        <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 2.8, 6]} /><Mat c="#5a3a24" /></mesh>
        {[[0, 3.2, 0, 1.3], [0.8, 2.9, 0.3, 1.0], [-0.7, 3.0, -0.2, 1.0], [0.1, 3.9, 0.2, 0.9]].map(([x, y, z, r], j) => <mesh key={j} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><Mat c={j % 2 ? "#f2a8c0" : "#f8c0d4"} /></mesh>)}
      </group>
      {Array.from({ length: 20 }, (_, i) => { const t = ((g / 120 + i / 20) % 1); return <mesh key={i} position={[cx - 1 + rnd(i) * 3, 3.6 - t * 3.5, cz - 1.5 + rnd(i + 5) * 2.5 + Math.sin(g / 10 + i) * 0.2]} rotation={[g * 0.05 + i, i, 0]}><planeGeometry args={[0.06, 0.06]} /><meshStandardMaterial color="#f8c0d4" side={THREE.DoubleSide} /></mesh>; })}
      <Human p={[cx - 0.42, 0.03, cz]} rotY={Math.PI / 2} pose={{ ...STAND3D, armR: [50, 58], armL: [50, 58], spread: [0.02, 0.02] }} eyes={0} f={g} mouth="smile" />
      <Human p={[cx + 0.42, 0.03, cz]} rotY={-Math.PI / 2} look={{ ...MAYA3D, jacket: "#f4f0ea", jacket2: "#e0dcd0" }} glasses pose={{ ...STAND3D, armR: [50, 58], armL: [50, 58], spread: [0.02, 0.02] }} f={g + 5} mouth="smile" />
      {[[-1.6, -0.3, 0], [1.6, -0.3, 1], [-1.3, -1.4, 3], [1.3, -1.4, 2]].map(([dx, dz, k]) => {
        const clap = g > 90 ? Math.abs(Math.sin(g / 3 + k)) : 0;
        return <Human key={k} p={[cx + dx, 0.03, cz + dz]} rotY={Math.atan2(-dx, -dz)} look={NPCS[k]} pose={{ ...STAND3D, armL: [70, 100 + clap * 20], armR: [70, 100 + clap * 20], spread: [-0.25 + clap * 0.15, -0.25 + clap * 0.15] }} eyes={0} f={g + k * 4} mouth="smile" />;
      })}
      <Dog3D p={[cx - 0.7, 0.03, cz + 0.7]} rotY={0.6} f={g} sit wag={0.8} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- 10. Роддом ----------
const S10: React.FC<{ g: number }> = ({ g }) => {
  const ph = (g % 90) / 90;
  const dir = ph < 0.5 ? 1 : -1;
  const x = ph < 0.5 ? lerp(-1.1, 1.1, ph * 2) : lerp(1.1, -1.1, (ph - 0.5) * 2);
  const stop = g >= 140;
  const dist = Math.abs(x + 1.1);
  return (
    <Canvas3D>
      <CamRig pos={[0, 1.5, 3.6]} look={[0, 1.1, -0.5]} fov={48} />
      <hemisphereLight args={["#eef4f8", "#8a9098", 0.9]} />
      <directionalLight position={[0, 4, 3]} intensity={1.1} color="#f4f8ff" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#d8e0e6"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 10]} /><Mat c="#c8d0d4" /></mesh>
      {Array.from({ length: 10 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-5 + i * 1.1, 0.002, 0]}><planeGeometry args={[0.02, 10]} /><Mat c="#b0b8bc" /></mesh>)}
      <mesh position={[0, 1.6, -1.5]} receiveShadow><boxGeometry args={[12, 3.2, 0.1]} /><Mat c="#e8eef0" /></mesh>
      <mesh position={[0, 0.5, -1.44]}><boxGeometry args={[12, 0.04, 0.02]} /><Mat c="#6aa0c0" /></mesh>
      {[-2.2, 1.6].map((dx, i) => (
        <group key={dx} position={[dx, 0, -1.43]}>
          <mesh position={[0, 1.05, 0]}><boxGeometry args={[1.0, 2.1, 0.04]} /><Mat c={i ? "#a8c8d8" : "#9ab8c8"} /></mesh>
          <mesh position={[0, 2.3, 0.03]}><boxGeometry args={[0.6, 0.18, 0.02]} /><Mat c="#1b2a3a" e={i && stop ? "#3ad08a" : undefined} ei={i && stop ? 1.5 : 0} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.25, -1.2]} castShadow><boxGeometry args={[1.6, 0.06, 0.4]} /><Mat c="#6aa0c0" /></mesh>
      <Human p={[stop ? 0.25 : x, 0.0, -0.2]} rotY={stop ? Math.PI : dir > 0 ? Math.PI / 2 : -Math.PI / 2} pose={stop ? { ...STAND3D, armL: [60, 150], armR: [60, 150], spread: [-0.3, -0.3], headPitch: -10 } : { ...walkPose(dist, 0.8, 0.07), headPitch: 10 }} eyes={0} f={g} mouth={stop ? "o" : "flat"} />
      <Human p={[-2.0, 0, -0.9]} rotY={0.4} look={NPCS[3]} pose={SIT} eyes={0} f={g + 7} />
    </Canvas3D>
  );
};

// ---------- HUD ----------
const TIME: string[] = ["YEAR 2", "YEAR 2", "YEAR 3", "YEAR 4", "YEAR 5", "YEAR 5", "YEAR 6", "YEAR 7", "YEAR 9", "YEAR 10"];
const TAGS: [string, string][] = [["A CITY FOR EARS", GREEN], ["THE NEW RULES", YEL], ["CARS DRIVE THEMSELVES", GREEN], ["YOUR NEW JOB: RADIO", YEL], ["MUSIC IS EVERYTHING", GREEN], ["THE BRAIN ADAPTS", GREEN], ["BALLS WITH BELLS", YEL], ["BUDDY GETS OLD", YEL], ["MAYA SAYS YES", GREEN], ["A BABY IS COMING", RED]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  return (
    <>
      <Counter f={f} text={TIME[i]} alarm={i === 9} />
      <Tag local={i === 0 ? local - 30 : local} text={TAGS[i][0]} col={TAGS[i][1]} />
    </>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;

export const Eyes5: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f} n="5" title="YEARS LATER" dur={34} />
      <Audio src={staticFile("eyes5/sound.wav")} />
    </AbsoluteFill>
  );
};
export const _U = [Tree, WALK_Y];
