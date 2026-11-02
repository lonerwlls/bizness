// «What if everyone lost their eyes» — часть 4/6: THE FIRST MONTHS (месяцы 1–6). 60 сек, low-poly 3D, рассказ на «ты».
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import {
  Cane, CamRig, Car3D, Dog3D, Human, Leash, MAYA3D, MOODS, Mat, NPCS, Pose3D, STAND3D, Stick, Street, V3, WALK_Y, World,
  crouch, handWorld, lerp, walkPose,
} from "../lowpoly/kit3d";

export const EYES4_FRAMES = 1800;
const SC = 180;
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
};
const v = (p: V3) => new THREE.Vector3(...p);
const CANE_ARM: [number, number] = [32, 44];
const clickMouth = (g: number, clicks: number[]) => (clicks.some((c) => g >= c && g < c + 6) ? "o" : "flat");
// волна эха от головы + подсветка предмета, когда волна до него дошла
const EchoWave: React.FC<{ from: V3; g: number; clicks: number[]; speed?: number }> = ({ from, g, clicks, speed = 0.12 }) => (
  <>
    {clicks.map((c, i) => {
      const w = g >= c ? (g - c) * speed : -1;
      if (w <= 0 || w > 10) return null;
      return (
        <group key={i}>
          <mesh position={[from[0], from[1] + 1.55, from[2]]} scale={w}><sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.12 * (1 - w / 10)} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          <mesh position={[from[0], from[1] + 0.05, from[2]]} rotation={[Math.PI / 2, 0, 0]} scale={w}><torusGeometry args={[1, 0.012, 6, 64]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.9 * (1 - w / 10)} /></mesh>
        </group>
      );
    })}
  </>
);
const hitGlow = (from: V3, to: V3, g: number, clicks: number[], speed = 0.12) => {
  const d = Math.hypot(to[0] - from[0], to[2] - from[2]);
  return Math.max(0, ...clicks.map((c) => { const w = (g - c) * speed; return w > d - 0.4 && w < d + 1.2 ? 1 - Math.abs(w - d) / 1.2 : 0; }));
};
const Glow: React.FC<{ p: V3; s: V3; k: number }> = ({ p, s, k }) => (k > 0 ? <mesh position={p}><boxGeometry args={s} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.45 * k} depthWrite={false} /></mesh> : null);

// ---------- 1. Щелчок → машина ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const hPos: V3 = [1.3, WALK_Y, 0];
  const clicks = [25, 85, 140];
  const car: V3 = [-2.4, 0, -3.5];
  return (
    <Canvas3D>
      <CamRig pos={[2.9, 1.7, 2.6]} look={[-0.6, 0.8, -2.0]} fov={46} />
      <World m={MOODS.gray} focus={[0, 0, -1]} />
      <Street />
      <Car3D p={car} c="#7a8aa8" />
      <Glow p={[car[0], 0.7, car[2]]} s={[1.9, 1.3, 4.1]} k={hitGlow(hPos, car, g, clicks)} />
      <Human p={hPos} rotY={-2.4} pose={{ ...STAND3D, armR: CANE_ARM, headPitch: -4 }} eyes={0} f={g} mouth={clickMouth(g, clicks)} />
      <EchoWave from={hPos} g={g} clicks={clicks} />
      <Dog3D p={[1.9, WALK_Y, 0.5]} rotY={-2.4} f={g} sit wag={0.4} headTilt={g > 30 ? 15 : 0} />
    </Canvas3D>
  );
};

// ---------- 2. Схема эхолокации ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const t = (g % 90) / 90;
  const out = t < 0.5, x = out ? lerp(260, 820, t * 2) : lerp(820, 260, (t - 0.5) * 2);
  const ms = Math.round(ip(g, [0, 170], [6, 6]));
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <text x={540} y={420} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={42} letterSpacing={6} fill="#9cb0d0">HOW ECHOLOCATION WORKS</text>
        <g transform="translate(180 900)">
          <circle cx={0} cy={-120} r={56} fill="#f0c49c" />
          <rect x={-46} y={-60} width={92} height={200} rx={40} fill="#ee7a36" />
          <circle cx={30} cy={-112} r={8} fill="#5a1a1a" />
        </g>
        <rect x={840} y={640} width={70} height={420} fill="#3a4c74" />
        <text x={875} y={1110} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={28} fill="#9cb0d0">WALL</text>
        {[0, 1, 2].map((k) => <path key={k} d={`M ${x + (out ? -k * 26 : k * 26)} 720 Q ${x + (out ? 30 : -30) - (out ? k * 26 : -k * 26)} 800 ${x + (out ? -k * 26 : k * 26)} 880`} stroke={out ? YEL : "#5af0ff"} strokeWidth={8} fill="none" opacity={1 - k * 0.3} strokeLinecap="round" />)}
        <text x={540} y={1240} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={38} fill={YEL}>CLICK →</text>
        <text x={540} y={1300} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={38} fill="#5af0ff">← ECHO</text>
        <text x={540} y={1420} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill={WH}>{`ECHO IN ${ms} MS = 1 METER`}</text>
        <text x={540} y={1480} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill="#9cb0d0" opacity={ip(g, [90, 100], [0, 1])}>LATER ECHO = FARTHER AWAY</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 3. Идёшь сам и обходишь столб ----------
const S3: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.03;
  const lampZ = 5;
  const z = -1 + dist;
  const dodge = ip(z, [3.2, 4.3], [0, 1]) - ip(z, [5.6, 6.6], [0, 1]);
  const x = 1.3 + dodge * 0.55;
  const clicks = [15, 50, 85, 120];
  const hp: Pose3D = { ...walkPose(dist, 0.75, 0.07), armR: [10, 18] };
  return (
    <Canvas3D>
      <CamRig pos={[-1.6, 1.4, z + 3.2]} look={[1.3, 0.9, z - 0.3]} fov={46} />
      <World m={MOODS.day} focus={[1.3, 0, z]} />
      <Street />
      <Glow p={[0.75, 2.6, lampZ]} s={[0.25, 5.2, 0.25]} k={hitGlow([x, 0, z], [0.75, 0, lampZ], g, clicks)} />
      <Human p={[x, WALK_Y, z]} rotY={dodge * 0.3} pose={hp} eyes={0} f={g} mouth={clickMouth(g, clicks)} />
      <EchoWave from={[x, WALK_Y, z]} g={g} clicks={clicks} />
    </Canvas3D>
  );
};

// ---------- 4. Собака-поводырь через дорогу ----------
const Harness: React.FC<{ hand: THREE.Vector3; dog: V3; rotY: number }> = ({ hand, dog, rotY }) => {
  const back = new THREE.Vector3(0, 0.56, 0.05).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(v(dog));
  return (
    <>
      <mesh position={[dog[0], dog[1] + 0.42, dog[2]]} rotation={[0, rotY, 0]}><torusGeometry args={[0.15, 0.02, 6, 16]} /><Mat c="#f2f2ee" /></mesh>
      <Stick a={hand} b={back} r={0.012} c="#f2f2ee" />
    </>
  );
};
const S4: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.024;
  const hx = 1.3 - dist, hz = 2;
  const rot = -Math.PI / 2;
  const hp: Pose3D = { ...walkPose(dist, 0.7, 0.06), armL: [32, 40] };
  const dog: V3 = [hx - 0.25, hx > 0.2 ? WALK_Y : 0, hz - 0.45];
  const hy = hx > 0.2 ? WALK_Y : 0;
  return (
    <Canvas3D>
      <CamRig pos={[-1.8, 1.6, hz + 4.0]} look={[hx - 0.6, 0.6, hz]} fov={46} />
      <World m={MOODS.day} focus={[hx, 0, hz]} />
      <Street />
      <Human p={[hx, hy, hz]} rotY={rot} pose={hp} eyes={0} f={g} mouth="smile" />
      <Dog3D p={dog} rotY={rot} f={g} walk={g * 0.14} wag={0.5} />
      <Harness hand={handWorld([hx, hy, hz], rot, hp, -1)} dog={dog} rotY={rot} />
      <Human p={[-6.5 + g * 0.012, 0.06, -3]} rotY={Math.PI / 2} look={NPCS[1]} pose={walkPose(g * 0.012, 0.7, 0.05)} eyes={0} f={g + 9} />
      <Dog3D p={[-6.2 + g * 0.012, 0.06, -2.6]} rotY={Math.PI / 2} f={g} walk={g * 0.07} color="#3a3a3e" />
    </Canvas3D>
  );
};

// ---------- 5. Телефон с ИИ на груди ----------
const S5: React.FC<{ g: number }> = ({ g }) => {
  const dist = Math.min(g, 120) * 0.022;
  const z = -2 + dist;
  const sitT = ip(g, [125, 150], [0, 1]);
  const benchZ = 1.2, benchX = 2.2;
  const hp: Pose3D = g < 120 ? walkPose(dist, 0.7, 0.06) : sitT < 1 ? crouch(lerp(0.82, 0.5, sitT)) : { legL: [86, 6], legR: [84, 2], armL: [20, 70], armR: [20, 70], hip: 0.5, lean: -4 };
  const hx = lerp(1.3, benchX, ip(g, [100, 125], [0, 1]));
  const hz = g < 120 ? z : benchZ;
  const rot = g < 100 ? 0 : lerp(0, -Math.PI / 2, ip(g, [100, 125], [0, 1]));
  const msgs: [number, number, string][] = [[10, 55, "BENCH · 3 METERS AHEAD"], [60, 100, "TURN RIGHT"], [105, 150, "SIT DOWN · BENCH BEHIND YOU"], [152, 180, "SUNNY · 22°C"]];
  const msg = msgs.find(([a, b]) => g >= a && g < b);
  return (
    <>
      <Canvas3D>
        <CamRig pos={[-0.9, 1.5, 3.6]} look={[1.7, 0.8, 0.2]} fov={44} />
        <World m={MOODS.day} focus={[1.5, 0, 0]} />
        <Street />
        <group position={[benchX + 0.25, 0, benchZ]}>
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 1.8]} /><Mat c="#8a5a3a" /></mesh>
          <mesh position={[0.22, 0.75, 0]} castShadow><boxGeometry args={[0.06, 0.5, 1.8]} /><Mat c="#8a5a3a" /></mesh>
          {[-0.8, 0.8].map((zz) => <mesh key={zz} position={[0, 0.2, zz]}><boxGeometry args={[0.45, 0.4, 0.06]} /><Mat c="#3a3a40" /></mesh>)}
        </group>
        <Human p={[hx, g < 120 ? WALK_Y : 0.03, hz]} rotY={rot} pose={hp} eyes={0} f={g} mouth={g > 150 ? "smile" : "flat"} />
        <group position={[hx, (g < 120 ? WALK_Y : 0.03) + (hp.hip ?? 0.82) + 0.26, hz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0, 0.14]}><boxGeometry args={[0.07, 0.13, 0.012]} /><meshStandardMaterial color="#141418" /></mesh>
          <mesh position={[0, 0.02, 0.147]}><circleGeometry args={[0.015, 10]} /><meshStandardMaterial color="#5af0ff" emissive="#5af0ff" emissiveIntensity={1.5} /></mesh>
        </group>
        <Dog3D p={[hx - 0.5, g < 120 ? WALK_Y : 0.03, hz + 0.4]} rotY={rot} f={g} walk={g < 120 ? g * 0.12 : 0} sit={g >= 120} wag={0.5} />
      </Canvas3D>
      {msg ? (
        <div style={{ position: "absolute", left: 120, right: 120, top: 1380, textAlign: "center" }}>
          <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 38, color: "#0b1020", background: "#5af0ff", borderRadius: 40, padding: "14px 30px", boxShadow: "0 0 30px rgba(90,240,255,.6)" }}>🔊 {msg[2]}</span>
        </div>
      ) : null}
    </>
  );
};

// ---------- 6. Свет возвращается ----------
const S6: React.FC<{ g: number }> = ({ g }) => {
  const on = g >= 70;
  return (
    <Canvas3D>
      <CamRig pos={[-2.2, 1.7, 6.6]} look={[1.4, 1.3, 1.6]} fov={50} />
      <World m={MOODS.night} focus={[0, 0, 0]} stars />
      <Street lit={on} lamps={on} />
      <Human p={[1.3, WALK_Y, 3]} rotY={-2.4} pose={on ? { ...STAND3D, armL: [150, 175], armR: [150, 175], spread: [0.3, 0.3] } : STAND3D} eyes={0} f={g} mouth={on ? "smile" : "flat"} />
      <Dog3D p={[1.8, WALK_Y, 3.4]} rotY={-2.4} f={g} sit={!on} bark={on && g < 110 ? Math.max(0, Math.sin(g / 3)) : 0} wag={on ? 1 : 0.2} />
    </Canvas3D>
  );
};

// ---------- 7. Огород вдоль верёвок ----------
const S7: React.FC<{ g: number }> = ({ g }) => {
  const rows = [6, 7.3, 8.6];
  return (
    <Canvas3D>
      <CamRig pos={[3.2, 2.6, 6.5]} look={[7.5, 0.4, 0.5]} fov={46} />
      <World m={MOODS.morning} focus={[7, 0, 1]} />
      <Street />
      {rows.map((x, r) => (
        <group key={r}>
          <mesh position={[x, 0.05, 1]} receiveShadow><boxGeometry args={[0.7, 0.08, 7]} /><Mat c="#6a4a30" /></mesh>
          {[-2.4, 4.4].map((zz) => <mesh key={zz} position={[x + 0.3, 0.3, zz - 1.0 + 1]}><cylinderGeometry args={[0.03, 0.03, 0.6, 6]} /><Mat c="#8a6a4a" /></mesh>)}
          <Stick a={new THREE.Vector3(x + 0.3, 0.55, -2.4)} b={new THREE.Vector3(x + 0.3, 0.55, 4.4)} r={0.008} c="#d8c08a" />
          {Array.from({ length: 10 }, (_, i) => {
            const grow = ip(g, [10 + i * 8 + r * 10, 60 + i * 8 + r * 10], [0, 1]);
            return grow > 0 ? <mesh key={i} position={[x, 0.1 + 0.12 * grow, -2 + i * 0.65]} scale={grow}><icosahedronGeometry args={[0.13, 0]} /><Mat c="#4f9a5a" /></mesh> : null;
          })}
        </group>
      ))}
      <Human p={[6.0, 0.03, 0.4 + g * 0.004]} rotY={-Math.PI / 2} pose={{ ...crouch(0.5), armL: [70, 40], armR: [55 + Math.sin(g / 4) * 10, 30] }} eyes={0} f={g} mouth="smile" />
      <Human p={[7.3, 0.03, 2.4]} rotY={-Math.PI / 2} look={NPCS[3]} pose={{ ...crouch(0.5), armL: [70, 40], armR: [60, 30] }} eyes={0} f={g + 7} />
      <Human p={[8.6, 0.03, -0.6]} rotY={-Math.PI / 2} look={MAYA3D} glasses pose={{ ...crouch(0.5), armL: [70, 40], armR: [58 + Math.sin(g / 5) * 8, 30] }} f={g + 3} mouth="smile" />
      <Dog3D p={[5.3, 0.03, 3]} rotY={2} f={g} sit wag={0.6} />
    </Canvas3D>
  );
};

// ---------- 8. Рынок колокольчиков ----------
const Stall: React.FC<{ p: V3; c: string; f: number; k: number }> = ({ p, c, f, k }) => (
  <group position={p} rotation={[0, -Math.PI / 2, 0]}>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[1.6, 0.9, 0.7]} /><Mat c="#8a6a4a" /></mesh>
    {[-0.6, -0.2, 0.2, 0.6].map((x, i) => <mesh key={i} position={[x, 0.98, 0]} castShadow><sphereGeometry args={[0.12, 8, 6]} /><Mat c={["#e0524a", "#f5c84c", "#7fb08a", "#e8a050"][(i + k) % 4]} /></mesh>)}
    {[-0.75, 0.75].map((x) => <mesh key={x} position={[x, 1.25, -0.3]}><cylinderGeometry args={[0.03, 0.03, 1.6, 6]} /><Mat c="#5a3a24" /></mesh>)}
    <mesh position={[0, 2.05, 0]} rotation={[0.3, 0, 0]} castShadow><boxGeometry args={[1.8, 0.05, 1.1]} /><Mat c={c} /></mesh>
    <group position={[0.7, 1.8, 0.45]} rotation={[0, 0, Math.sin(f / 3 + k * 2) * 0.5]}>
      <mesh position={[0, -0.12, 0]}><coneGeometry args={[0.07, 0.14, 10, 1, true]} /><meshStandardMaterial color="#e8c35a" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.005, 0.005, 0.1, 4]} /><Mat c="#3a3a3a" /></mesh>
    </group>
  </group>
);
const S8: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.02;
  return (
    <Canvas3D>
      <CamRig pos={[-1.3, 1.7, 6.5 - dist]} look={[2.6, 0.9, 1.0 - dist]} fov={48} />
      <World m={MOODS.day} focus={[3, 0, 0]} />
      <Street />
      {[["#e0524a", 5], ["#5f8fb5", 2], ["#7fb08a", -1], ["#f5c84c", -4]].map(([c, z], i) => <Stall key={i} p={[3.6, 0.03, z as number]} c={c as string} f={g} k={i} />)}
      <Human p={[1.3, WALK_Y, 4 - dist]} rotY={Math.PI} pose={{ ...walkPose(dist, 0.7, 0.06), headYaw: Math.sin(g / 15) * 25 }} eyes={0} f={g} mouth="smile" />
      <Dog3D p={[0.85, WALK_Y, 3.4 - dist]} rotY={Math.PI} f={g} walk={g * 0.12} wag={0.6} />
      {[[4.4, 4.6, 0], [4.4, 1.6, 2], [4.4, -1.5, 3]].map(([x, z, k]) => <Human key={k} p={[x, 0.03, z]} rotY={-Math.PI / 2} look={NPCS[k]} pose={{ ...STAND3D, armR: [50, 70] }} eyes={0} f={g + k * 5} mouth="smile" />)}
      <Human p={[2.8, 0.03, -0.2]} rotY={Math.PI / 2} look={NPCS[4]} pose={{ ...STAND3D, armR: [60, 80] }} eyes={0} f={g + 3} />
    </Canvas3D>
  );
};

// ---------- 9. Теперь учишь ты ----------
const S9: React.FC<{ g: number }> = ({ g }) => {
  const clicks = [30, 100];
  const me: V3 = [1.0, WALK_Y, 0], kid: V3 = [1.7, WALK_Y, -0.6];
  return (
    <Canvas3D>
      <CamRig pos={[2.9, 1.5, 1.7]} look={[1.3, 1.0, -0.4]} fov={46} />
      <World m={MOODS.sunset} focus={[1.3, 0, 0]} />
      <Street />
      <Human p={me} rotY={2.3} pose={{ ...STAND3D, armR: [70 + Math.sin(g / 6) * 15, 140], armL: [10, 20] }} eyes={0} f={g} mouth={clickMouth(g, clicks) === "o" ? "o" : "smile"} />
      <Human p={kid} rotY={-0.8} look={NPCS[2]} pose={{ ...STAND3D, armR: CANE_ARM, headPitch: -5 }} eyes={0} f={g + 7} mouth={g > 110 ? "smile" : "flat"} />
      <Cane hand={handWorld(kid, -0.8, { ...STAND3D, armR: CANE_ARM }, 1)} tip={new THREE.Vector3(kid[0] - 0.5, WALK_Y + 0.01, kid[2] + 0.5)} />
      <EchoWave from={me} g={g} clicks={clicks} />
      <Human p={[0.25, WALK_Y, -1.7]} rotY={0.7} look={MAYA3D} glasses pose={{ ...STAND3D, armR: CANE_ARM }} f={g + 3} mouth="smile" />
      <Dog3D p={[0.35, WALK_Y, -0.8]} rotY={1.0} f={g} sit wag={0.6} />
    </Canvas3D>
  );
};

// ---------- 10. Звуковой маяк ----------
const S10: React.FC<{ g: number }> = ({ g }) => {
  const up = ip(g, [10, 60], [0, 1], Easing.out(Easing.cubic));
  const on = g >= 80;
  const bx = 0.4, bz = -1;
  return (
    <Canvas3D>
      <CamRig pos={[-2.4, 1.6, bz + 4.4]} look={[bx + 0.5, 1.6, bz]} fov={46} />
      <World m={MOODS.morning} focus={[bx, 0, bz]} />
      <Street />
      <group position={[bx, WALK_Y, bz]}>
        <mesh position={[0, 1.3 * up, 0]} castShadow><cylinderGeometry args={[0.06, 0.07, 2.6 * up, 8]} /><Mat c="#f5c84c" /></mesh>
        {up > 0.95 ? (
          <group position={[0, 2.5, 0]}>
            <mesh castShadow><boxGeometry args={[0.3, 0.36, 0.3]} /><Mat c="#2a3450" /></mesh>
            {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => <mesh key={a} position={[Math.sin(a) * 0.152, 0, Math.cos(a) * 0.152]} rotation={[0, a, 0]}><circleGeometry args={[0.1, 16]} /><Mat c="#141824" /></mesh>)}
            <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.05, 10, 8]} /><Mat c={on && Math.floor(g / 8) % 2 ? "#5af0ff" : "#2a3a4a"} e={on ? "#5af0ff" : undefined} ei={on ? 2 : 0} /></mesh>
            {on ? [0, 1, 2].map((k) => { const t = ((g - 80) / 30 + k / 3) % 1; return <mesh key={k} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + t * 2.5}><torusGeometry args={[1, 0.015, 6, 48]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.8 * (1 - t)} /></mesh>; }) : null}
          </group>
        ) : null}
      </group>
      {[[bx + 0.7, bz + 0.3, 0], [bx - 0.5, bz - 0.5, 3]].map(([x, z, k]) => <Human key={k} p={[x, WALK_Y, z]} rotY={k ? 0.8 : -1.8} look={{ ...NPCS[k], hat: { c: "#f5c84c", c2: "#f5c84c" } }} pose={{ ...STAND3D, armR: [80 + Math.sin(g / 4 + k) * 10, 100], armL: [40, 60] }} eyes={0} f={g + k} />)}
      <Human p={[1.6, WALK_Y, bz + 2.4]} rotY={-2.8} pose={{ ...STAND3D, headYaw: on ? -25 : 0, headPitch: -15 }} eyes={0} f={g} mouth={on ? "o" : "flat"} />
      <Dog3D p={[2.1, WALK_Y, bz + 2.7]} rotY={-2.6} f={g} sit wag={0.4} headTilt={on ? 25 : 0} />
    </Canvas3D>
  );
};

// ---------- HUD ----------
const TIME: string[] = ["MONTH 1 · DAY 31", "MONTH 1 · DAY 33", "MONTH 1 · DAY 45", "MONTH 2 · DAY 52", "MONTH 2 · DAY 70", "MONTH 3 · DAY 88", "MONTH 4 · DAY 104", "MONTH 5 · DAY 140", "MONTH 6 · DAY 171", "MONTH 6 · DAY 180"];
const TAGS: [string, string][] = [["ECHOLOCATION · LESSON 1", GREEN], ["HOW IT WORKS", YEL], ["NO MORE BUMPS", GREEN], ["GUIDE DOGS = GOLD", YEL], ["AI EYES", GREEN], ["POWER IS BACK", GREEN], ["GARDENS ON ROPES", GREEN], ["THE SOUND MARKET", YEL], ["NOW YOU TEACH", GREEN], ["THE CITY CHANGES", YEL]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  return (
    <>
      <Counter f={f} text={TIME[i]} />
      <Tag local={i === 0 ? local - 30 : local} text={TAGS[i][0]} col={TAGS[i][1]} />
    </>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;

export const Eyes4: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f} n="4" title="THE FIRST MONTHS" dur={34} />
      <Audio src={staticFile("eyes4/sound.wav")} />
    </AbsoluteFill>
  );
};
export const _U = [Leash, RED];
