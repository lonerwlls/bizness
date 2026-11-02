// «What if everyone lost their eyes» — часть 3/6: THE FIRST WEEK (дни 2–7). 60 сек, low-poly 3D, рассказ на «ты».
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import {
  Cane, CamRig, Dog3D, Human, Leash, MASCOT3D, MAYA3D, MOODS, Mat, NPCS, Pose3D, Radio3D, Room, SIT, STAND3D, Street, V3, WALK_Y, World,
  collarWorld, handWorld, lerp, rnd, walkPose,
} from "../lowpoly/kit3d";

export const EYES3_FRAMES = 1800;
const SC = 180;
const HOME_IN = { ...MASCOT3D, pack: null };
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
};
const v = (p: V3) => new THREE.Vector3(...p);
const CANE_ARM: [number, number] = [32, 44];
const caneTip = (p: V3, rotY: number, g: number, k = 1): THREE.Vector3 => {
  const fwd = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY)), side = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY));
  return v(p).add(fwd.multiplyScalar(0.75)).add(side.multiplyScalar(Math.sin(g / 7) * 0.32 * k)).setY(p[1] + 0.01);
};
const IndoorLight: React.FC<{ dim?: number }> = ({ dim = 1 }) => (
  <>
    <hemisphereLight args={["#e8dcd0", "#5a4838", 0.75 * dim]} />
    <directionalLight position={[2, 4, -4]} intensity={1.3 * dim} color="#dfe6f0" castShadow shadow-mapSize={[1024, 1024]} />
    <color attach="background" args={["#b8aca0"]} />
  </>
);
// кухонная стойка с раковиной и краном (у задней стены)
const Kitchen: React.FC = () => (
  <group position={[1.6, 0, -2.55]}>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[2.0, 0.9, 0.7]} /><Mat c="#e8e2d6" /></mesh>
    <mesh position={[0, 0.91, 0]}><boxGeometry args={[2.04, 0.04, 0.74]} /><Mat c="#7a6a5a" /></mesh>
    <mesh position={[0.1, 0.9, 0.05]}><boxGeometry args={[0.6, 0.03, 0.4]} /><Mat c="#aab0b8" r={0.3} /></mesh>
    <mesh position={[0.1, 1.08, -0.22]}><cylinderGeometry args={[0.02, 0.02, 0.32, 8]} /><Mat c="#c8ccd2" r={0.2} /></mesh>
    <mesh position={[0.1, 1.24, -0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.22, 8]} /><Mat c="#c8ccd2" r={0.2} /></mesh>
  </group>
);
const TAP: V3 = [1.7, 1.225, -2.56]; // конец носика крана

// ---------- 1. Тёплый холодильник ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const open = ip(g, [20, 45], [0, 1], Easing.out(Easing.cubic));
  const sniff = g > 60;
  const hp: Pose3D = { ...STAND3D, armR: g < 45 ? [lerp(10, 60, ip(g, [5, 20], [0, 1])), lerp(14, 70, ip(g, [5, 20], [0, 1]))] : [10, 16], headPitch: sniff ? 10 : 0, lean: sniff ? 14 : 4 };
  return (
    <Canvas3D>
      <CamRig pos={[4.0, 1.45, -0.35]} look={[2.6, 1.1, -2.0]} fov={46} />
      <IndoorLight dim={0.75} />
      <Room lamp={false} />
      <group position={[2.6, 0, -2.4]}>
        <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.8, 1.8, 0.7]} /><Mat c="#e8ecf2" /></mesh>
        <mesh position={[0, 0.9, 0.2]}><boxGeometry args={[0.7, 1.7, 0.4]} /><Mat c="#3a3e48" /></mesh>
        {[0.5, 0.95, 1.4].map((y, i) => <mesh key={i} position={[0, y, 0.25]}><boxGeometry args={[0.66, 0.02, 0.3]} /><Mat c="#9aa0aa" /></mesh>)}
        <mesh position={[-0.15, 1.06, 0.25]}><boxGeometry args={[0.1, 0.2, 0.08]} /><Mat c="#eef2f8" /></mesh>
        <mesh position={[0.15, 0.6, 0.25]}><boxGeometry args={[0.2, 0.08, 0.14]} /><Mat c="#c86a5a" /></mesh>
        <group position={[-0.4, 0.9, 0.36]} rotation={[0, -open * 1.6, 0]}>
          <mesh position={[0.4, 0, 0]} castShadow><boxGeometry args={[0.8, 1.8, 0.06]} /><Mat c="#dfe4ec" /></mesh>
        </group>
        {sniff ? [0, 1, 2].map((k) => <mesh key={k} position={[0.1 * k - 0.1, 1.2 + ((g * 0.01 + k * 0.3) % 0.6), 0.5]} rotation={[0, 0, Math.sin(g / 6 + k)]}><torusGeometry args={[0.05, 0.008, 4, 12, Math.PI]} /><meshBasicMaterial color="#8ab05a" /></mesh>) : null}
      </group>
      <Human p={[2.95, 0, -1.4]} rotY={-2.85} look={HOME_IN} pose={hp} eyes={0} f={g} mouth={sniff ? "o" : "flat"} />
      <Dog3D p={[3.4, 0, -0.9]} rotY={-2.6} f={g} sit wag={0.2} headTilt={sniff ? 20 : 0} />
    </Canvas3D>
  );
};

// ---------- 2. Последняя капля ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const flow = g < 50 ? 1 : g < 100 ? (rnd(Math.floor(g / 3)) > 0.5 ? 1 : 0) : 0;
  const drip = g >= 100 && g < 125 ? ((g - 100) % 22) / 22 : -1;
  const knock = g >= 128 && g < 165 ? Math.abs(Math.sin((g - 128) / 2.6)) : 0;
  const base: Pose3D = { ...STAND3D, armR: [62, 78], armL: [8, 14], lean: 10, headPitch: 10, spread: [0.12, -0.05] };
  const glassAt = new THREE.Vector3(TAP[0], TAP[1] - 0.26, TAP[2]);
  // ставим тело так, чтобы кисть со стаканом была ровно под краном
  const off = handWorld([0, 0, 0], Math.PI, base, 1);
  const hPos: V3 = [glassAt.x - off.x, 0, glassAt.z - off.z];
  const hp: Pose3D = { ...base, armR: [62 + knock * 9, 78 + knock * 9] };
  const glass = handWorld(hPos, Math.PI, hp, 1);
  const fill = ip(g, [0, 50], [0.15, 0.6]);
  const top = glass.y + 0.14;
  return (
    <Canvas3D>
      <CamRig pos={[3.3, 1.55, -1.2]} look={[1.72, 1.05, -2.5]} fov={42} />
      <IndoorLight dim={0.8} />
      <Room lamp={false} />
      <Kitchen />
      <Human p={hPos} rotY={Math.PI} look={HOME_IN} pose={hp} eyes={0} f={g} mouth={g > 100 ? "o" : "flat"} />
      <mesh position={[glass.x, glass.y + 0.07, glass.z]}><cylinderGeometry args={[0.045, 0.04, 0.14, 14]} /><meshStandardMaterial color="#cfe8f8" transparent opacity={0.45} /></mesh>
      <mesh position={[glass.x, glass.y + 0.005 + 0.065 * fill, glass.z]}><cylinderGeometry args={[0.038, 0.036, 0.13 * fill, 14]} /><meshStandardMaterial color="#7ab8e0" transparent opacity={0.8} /></mesh>
      {flow ? <mesh position={[TAP[0], (TAP[1] + top) / 2, TAP[2]]}><cylinderGeometry args={[0.008, 0.008, Math.max(0.01, TAP[1] - top), 6]} /><meshStandardMaterial color="#9cd0f0" transparent opacity={0.85} /></mesh> : null}
      {drip >= 0 ? <mesh position={[TAP[0], TAP[1] - drip * (TAP[1] - top), TAP[2]]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#9cd0f0" /></mesh> : null}
    </Canvas3D>
  );
};

// ---------- 3. Инфографика: что пропадает ----------
const S3: React.FC<{ g: number }> = ({ g }) => {
  const rows: [string, string, number, string][] = [["ELECTRICITY", "DAY 1", 0.05, RED], ["TAP WATER", "DAY 2", 0.1, RED], ["PHONES", "DAYS 2–3", 0.15, "#e0a050"], ["FRESH FOOD", "DAYS 3–5", 0.22, "#e0a050"], ["CANNED FOOD", "YEARS", 0.95, GREEN]];
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <text x={540} y={430} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={42} letterSpacing={6} fill="#9cb0d0">WITHOUT ANYONE TO RUN IT</text>
        {rows.map(([n, l, val, c], i) => {
          const k = ip(g, [10 + i * 12, 40 + i * 12], [0, 1], Easing.out(Easing.cubic));
          const y = 580 + i * 190;
          return (
            <g key={i}>
              <text x={110} y={y} fontFamily={MONT} fontWeight={900} fontSize={40} fill={WH}>{n}</text>
              <rect x={110} y={y + 28} width={860} height={56} rx={28} fill="#1a2238" />
              <rect x={110} y={y + 28} width={Math.max(56, 860 * val * k)} height={56} rx={28} fill={c} />
              <text x={970} y={y} textAnchor="end" fontFamily={MONT} fontWeight={900} fontSize={34} fill={c} opacity={k}>{l}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 4. Верёвка от дома к дому ----------
const Rope: React.FC<{ pts: THREE.Vector3[] }> = ({ pts }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.012, 5, false), [pts.map((p) => p.toArray().join()).join("|")]);
  return <mesh geometry={geo} castShadow><Mat c="#d8c08a" flat={false} /></mesh>;
};
const S4: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.02;
  const lead = -2 + dist;
  const people = [MAYA3D, MASCOT3D, NPCS[0], NPCS[1], NPCS[3], NPCS[2], NPCS[4]];
  const hands: THREE.Vector3[] = [];
  const bodies = people.map((look, i) => {
    const z = lead - i * 0.95, p: V3 = [1.25, WALK_Y, z];
    const pose: Pose3D = { ...walkPose(dist + i * 0.31, 0.62, 0.05), armL: [28, 40], armR: i <= 1 ? CANE_ARM : [10, 18], headPitch: 5 };
    hands.push(handWorld(p, 0, pose, -1));
    return (
      <React.Fragment key={i}>
        <Human p={p} look={look} pose={pose} glasses={i === 0} eyes={0} f={g + i * 9} mouth={i <= 1 ? "smile" : "flat"} />
        {i <= 1 ? <Cane hand={handWorld(p, 0, pose, 1)} tip={caneTip(p, 0, g + i * 5, 0.7)} /> : null}
      </React.Fragment>
    );
  });
  const ropePts = hands.flatMap((h, i) => (i === 0 ? [h.clone().add(new THREE.Vector3(0, 0, 0.3)), h] : [h.clone().lerp(hands[i - 1], 0.5).add(new THREE.Vector3(0, -0.12, 0)), h]));
  const dog: V3 = [0.75, WALK_Y, lead + 1.1];
  return (
    <Canvas3D>
      <CamRig pos={[-3.4, 2.2, lead + 3.0]} look={[1.25, 0.8, lead - 2.0]} fov={50} />
      <World m={MOODS.gray} focus={[1.2, 0, lead - 2]} />
      <Street />
      {bodies}
      <Rope pts={ropePts} />
      <Dog3D p={dog} f={g} walk={g * 0.13} wag={0.6} />
      <Leash a={hands[0]} b={collarWorld(dog, 0)} sag={0.15} />
    </Canvas3D>
  );
};

// ---------- 5–6. Магазин на ощупь ----------
const Store: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 20]} /><Mat c="#c8c4bc" /></mesh>
    <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[14, 20]} /><Mat c="#6a6670" /></mesh>
    {[-1.4, 1.4].map((x, r) => (
      <group key={r} position={[x, 0, -3]}>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 1.8, 10]} /><Mat c="#8a96a8" /></mesh>
        {[0.45, 0.95, 1.45].map((y, k) => Array.from({ length: 22 }, (_, i) => (
          <mesh key={`${k}${i}`} position={[x < 0 ? 0.32 : -0.32, y, -4.6 + i * 0.44]} castShadow>
            {(i + k) % 3 === 0 ? <cylinderGeometry args={[0.07, 0.07, 0.18, 10]} /> : <boxGeometry args={[0.14, 0.22, 0.18]} />}
            <Mat c={["#e0524a", "#5f8fb5", "#f5c84c", "#7fb08a", "#e8e4d8", "#c87a3a"][(i * 3 + k + r) % 6]} />
          </mesh>
        )))}
      </group>
    ))}
    <mesh position={[0, 1.6, 6]}><planeGeometry args={[6, 2.4]} /><meshBasicMaterial color="#f2f0e8" /></mesh>
    <pointLight position={[0, 2.4, 5]} intensity={8} distance={14} color="#fff4e0" />
    {children}
  </group>
);
const S5: React.FC<{ g: number }> = ({ g }) => {
  const hp: Pose3D = { ...STAND3D, armL: [70 + Math.sin(g / 6) * 6, 80], armR: [20, 30], headYaw: -40, lean: 6, spread: [0.25, 0.12] };
  const mPos: V3 = [0.35, 0, -0.6];
  const mp: Pose3D = { ...walkPose(g * 0.012, 0.6, 0.04), armR: CANE_ARM, armL: [60, 70] };
  return (
    <Canvas3D>
      <CamRig pos={[0.2, 1.55, 2.6]} look={[0, 1.0, -2.5]} fov={48} />
      <hemisphereLight args={["#dcd8d0", "#5a5048", 0.8]} />
      <directionalLight position={[0, 4, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#4a4650"]} />
      <Store>
        <Human p={[-0.55, 0, -1.2]} rotY={-Math.PI / 2 + 0.4} look={MASCOT3D} pose={hp} eyes={0} f={g} />
        <Human p={[mPos[0], 0, mPos[2] - g * 0.012]} rotY={Math.PI} look={MAYA3D} pose={mp} glasses f={g + 4} mouth="smile" />
        <Cane hand={handWorld([mPos[0], 0, mPos[2] - g * 0.012], Math.PI, mp, 1)} tip={caneTip([mPos[0], 0, mPos[2] - g * 0.012], Math.PI, g, 0.7)} />
        <Human p={[0.6, 0, -3.4]} rotY={Math.PI / 2 - 0.3} look={NPCS[1]} pose={{ ...STAND3D, armR: [75 + Math.sin(g / 5) * 8, 85], lean: 8 }} eyes={0} f={g + 7} />
        <Human p={[-0.5, 0, -4.6]} rotY={-Math.PI / 2} look={NPCS[2]} pose={{ ...STAND3D, armL: [70, 80], armR: [60, 90] }} eyes={0} f={g + 11} />
        <Dog3D p={[0.1, 0, 0.3]} rotY={Math.PI} f={g} sit wag={0.5} />
      </Store>
    </Canvas3D>
  );
};
const S6: React.FC<{ g: number }> = ({ g }) => {
  const shake = g > 30 && g < 140 ? Math.sin(g * 1.6) * 8 : 0;
  const hp: Pose3D = { ...STAND3D, armR: [70 + shake, 150 + shake], spread: [0.12, 0.45], headYaw: 18, headPitch: 6, armL: [20, 30] };
  const hPos: V3 = [-0.55, 0, -1.2];
  const can = handWorld(hPos, 0, hp, 1);
  return (
    <Canvas3D>
      <CamRig pos={[-0.55, 1.5, 0.35]} look={[-0.5, 1.42, -1.2]} fov={40} />
      <hemisphereLight args={["#dcd8d0", "#5a5048", 0.8]} />
      <directionalLight position={[0, 4, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#4a4650"]} />
      <Store>
        <Human p={hPos} rotY={0} look={MASCOT3D} pose={hp} eyes={0} f={g} mouth={g > 140 ? "smile" : "o"} />
        <mesh position={[can.x, can.y + 0.06, can.z]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.12, 12]} /><Mat c="#e0a050" flat={false} r={0.3} /></mesh>
      </Store>
    </Canvas3D>
  );
};

// ---------- 7. Готовим по звуку ----------
const Fire: React.FC<{ p: V3; f: number; s?: number }> = ({ p, f, s = 1 }) => (
  <group position={p} scale={s}>
    {[0, 1, 2, 3].map((i) => <mesh key={"l" + i} position={[0, 0.06, 0]} rotation={[0, i * 0.8, Math.PI / 2]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.6, 6]} /><Mat c="#5a3a24" /></mesh>)}
    {[0, 1, 2].map((i) => {
      const h = 0.35 + Math.abs(Math.sin(f / 4 + i * 2)) * 0.2;
      return <mesh key={i} position={[(i - 1) * 0.08, 0.1 + h / 2, (i % 2) * 0.05]} rotation={[0, i, Math.sin(f / 5 + i) * 0.15]}><coneGeometry args={[0.1 - i * 0.015, h, 6]} /><meshStandardMaterial color={i === 1 ? "#ffd27a" : "#ff8a3a"} emissive={i === 1 ? "#ffb040" : "#ff6a20"} emissiveIntensity={1.6} flatShading /></mesh>;
    })}
    <pointLight position={[0, 0.5, 0]} intensity={6 + Math.sin(f / 3) * 1.2} distance={7} color="#ff9a50" castShadow={false} />
  </group>
);
const S7: React.FC<{ g: number }> = ({ g }) => {
  const fx = 4.6, fz = -2;
  const listen = Math.sin(g / 20) > 0;
  return (
    <Canvas3D>
      <CamRig pos={[fx - 1.5, 1.45, fz + 1.7]} look={[fx, 0.6, fz]} fov={42} />
      <World m={MOODS.sunset} focus={[fx, 0, fz]} />
      <Street />
      <Fire p={[fx, 0.03, fz]} f={g} />
      <mesh position={[fx, 0.5, fz]}><boxGeometry args={[0.7, 0.03, 0.5]} /><Mat c="#3a3a40" /></mesh>
      <mesh position={[fx, 0.53, fz]}><cylinderGeometry args={[0.24, 0.2, 0.05, 20]} /><Mat c="#2a2a2e" /></mesh>
      <mesh position={[fx + 0.32, 0.54, fz]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.3, 6]} /><Mat c="#1a1a1e" /></mesh>
      {[[-0.1, -0.06], [0.0, 0.04], [0.1, -0.03], [-0.04, 0.11], [0.08, 0.1]].map(([dx, dz], i) => (
        <mesh key={i} position={[fx + dx, 0.575, fz + dz]} rotation={[Math.PI / 2, 0, i * 0.7 + Math.sin(g / 9 + i) * 0.05]} castShadow><capsuleGeometry args={[0.025, 0.12, 4, 8]} /><Mat c={i % 2 ? "#b8603a" : "#a04a2a"} flat={false} r={0.5} /></mesh>
      ))}
      {[[-0.12, 0.1], [0.13, -0.1]].map(([dx, dz], i) => <mesh key={"m" + i} position={[fx + dx, 0.57, fz + dz]} scale={[1, 0.35, 1]}><sphereGeometry args={[0.06, 10, 8]} /><Mat c="#8a4a2a" /></mesh>)}
      {Array.from({ length: 6 }, (_, i) => { const t = ((g / 50 + i / 6) % 1); return <mesh key={i} position={[fx + Math.sin(i * 2 + g / 20) * 0.08, 0.6 + t * 0.9, fz]} scale={0.05 + t * 0.12}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#d8d4d0" transparent opacity={0.5 * (1 - t)} flatShading /></mesh>; })}
      <Human p={[fx - 0.7, 0.03, fz + 0.1]} rotY={Math.PI / 2} look={MASCOT3D} pose={{ ...STAND3D, armR: [60, 70], headYaw: listen ? 30 : 0, headPitch: 15, lean: 10 }} eyes={0} f={g} mouth={listen ? "flat" : "smile"} />
      <Human p={[fx + 0.4, 0.03, fz + 0.75]} rotY={-2.5} look={MAYA3D} pose={{ ...STAND3D, armR: CANE_ARM, headPitch: 10 }} glasses f={g + 9} mouth="smile" />
      <Dog3D p={[fx - 0.3, 0.03, fz - 1.3]} rotY={0.3} f={g} sit wag={0.8} headTilt={15} />
    </Canvas3D>
  );
};

// ---------- 8. Радио с ручкой ----------
const crankPose = (a: number): Pose3D => ({ ...SIT, armR: [55 + Math.sin(a) * 14, 85 + Math.cos(a) * 14], armL: [40, 80], headPitch: 12, headYaw: 10 });
const S8: React.FC<{ g: number }> = ({ g }) => {
  const a = g * 0.35;
  const hPos: V3 = [-1.2, 0, -1.78];
  const hp = crankPose(a);
  const hand = handWorld(hPos, 0, hp, 1);
  // центр круга, который описывает кисть = ось ручки
  const ring = Array.from({ length: 16 }, (_, i) => handWorld(hPos, 0, crankPose((i / 16) * Math.PI * 2), 1));
  const c = ring.reduce((m, p) => m.add(p), new THREE.Vector3()).multiplyScalar(1 / ring.length);
  const radio: V3 = [c.x + 0.33, c.y, c.z];
  const arm = hand.clone().sub(c);
  return (
    <Canvas3D>
      <CamRig pos={[-0.75, 1.15, -0.15]} look={[-0.85, 0.78, -1.7]} fov={44} />
      <IndoorLight dim={0.65} />
      <Room />
      <Human p={hPos} look={HOME_IN} pose={hp} eyes={0} f={g} mouth="smile" />
      <mesh position={[radio[0], (radio[1] - 0.12) / 2, radio[2]]} castShadow><boxGeometry args={[0.36, radio[1] - 0.12, 0.36]} /><Mat c="#6a4a30" /></mesh>
      <Radio3D p={radio} f={g} on={g > 40} />
      <mesh position={[c.x + 0.06, c.y, c.z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.18, 6]} /><Mat c="#3a3a40" /></mesh>
      <mesh position={[c.x - 0.02 + 0, c.y + arm.y / 2, c.z + arm.z / 2]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, arm.y, arm.z).normalize())}><boxGeometry args={[0.02, Math.hypot(arm.y, arm.z), 0.02]} /><Mat c="#3a3a40" /></mesh>
      <mesh position={[hand.x, hand.y, hand.z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.014, 0.014, 0.08, 6]} /><Mat c="#8a3a2a" /></mesh>
      <Dog3D p={[0.4, 0, -1.3]} rotY={-1.9} f={g} sit wag={0.4} headTilt={g > 40 ? 18 : 0} />
    </Canvas3D>
  );
};

// ---------- 9. Костёр всей улицей ----------
const S9: React.FC<{ g: number }> = ({ g }) => {
  const fx = 5.2, fz = 6;
  const ring = [MASCOT3D, MAYA3D, NPCS[0], NPCS[1], NPCS[3], NPCS[2]];
  const cam = ip(g, [0, 180], [0, 1]);
  return (
    <Canvas3D>
      <CamRig pos={[fx - 3.6 + cam * 0.8, 2.0 - cam * 0.4, fz + 3.2 - cam * 0.6]} look={[fx, 0.6, fz]} fov={44} />
      <World m={MOODS.night} focus={[fx, 0, fz]} stars />
      <Street />
      <Fire p={[fx, 0.03, fz]} f={g} s={1.3} />
      {ring.map((look, i) => {
        const a = (i / ring.length) * Math.PI * 2 + 0.4, r = 1.25;
        const px = fx + Math.sin(a) * r, pz = fz + Math.cos(a) * r;
        const sway = Math.sin(g / 12 + i) * 5;
        return (
          <React.Fragment key={i}>
            <mesh position={[px, 0.22, pz]} castShadow><boxGeometry args={[0.45, 0.42, 0.45]} /><Mat c="#7a5a3a" /></mesh>
            <Human p={[px, 0.03, pz]} rotY={a + Math.PI} look={look} pose={{ ...SIT, hip: 0.5, lean: sway, armL: [30, 70], armR: [30, 70] }} glasses={i === 1} eyes={0} f={g + i * 7} mouth="smile" />
          </React.Fragment>
        );
      })}
      <Dog3D p={[fx + 0.2, 0.03, fz + 2.0]} rotY={Math.PI} f={g} sit wag={0.3} />
    </Canvas3D>
  );
};

// ---------- 10. Майя щёлкает языком и «слышит» стену ----------
const S10: React.FC<{ g: number }> = ({ g }) => {
  const mPos: V3 = [1.5, WALK_Y, -8];
  const clicks = [30, 95];
  const wave = clicks.map((c) => (g >= c ? (g - c) * 0.12 : -1));
  const hit = Math.max(...wave.map((w) => (w > 6.2 && w < 7.6 ? 1 - Math.abs(w - 6.9) / 0.7 : 0)));
  return (
    <Canvas3D>
      <CamRig pos={[-2.6, 1.8, -3.0]} look={[4.5, 1.2, -8.6]} fov={54} />
      <World m={MOODS.night} focus={[3, 0, -8]} stars />
      <Street />
      <Human p={mPos} rotY={Math.PI / 2} look={MAYA3D} pose={{ ...STAND3D, armR: CANE_ARM, headPitch: -5 }} glasses f={g} mouth={clicks.some((c) => g >= c && g < c + 6) ? "o" : "smile"} />
      <Human p={[0.9, WALK_Y, -9.1]} rotY={1.9} look={MASCOT3D} pose={{ ...STAND3D, headYaw: 15 }} eyes={0} f={g} mouth={g > 140 ? "o" : "flat"} />
      <Dog3D p={[0.45, WALK_Y, -9.7]} rotY={1.8} f={g} sit wag={0.3} headTilt={g > 35 ? 20 : 0} />
      {wave.map((w, i) => (w > 0 && w < 12 ? (
        <group key={i}>
          <mesh position={[mPos[0], 1.55, mPos[2]]} scale={w}><sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.12 * (1 - w / 12)} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          <mesh position={[mPos[0], 0.2, mPos[2]]} rotation={[Math.PI / 2, 0, 0]} scale={w}><torusGeometry args={[1, 0.012, 6, 64]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.9 * (1 - w / 12)} /></mesh>
        </group>
      ) : null))}
      {hit > 0 ? <mesh position={[7.9, 2.0, -8.9]}><boxGeometry args={[0.06, 3.6, 6.2]} /><meshBasicMaterial color="#5af0ff" transparent opacity={0.55 * hit} depthWrite={false} /></mesh> : null}
    </Canvas3D>
  );
};

// ---------- HUD ----------
const CLOCK: [number, number, number][] = [[2, 7, 10], [2, 7, 40], [2, 9, 0], [3, 10, 15], [3, 10, 50], [3, 11, 20], [4, 19, 5], [5, 13, 30], [5, 21, 40], [7, 22, 10]];
const TAGS: [string, string][] = [["NO POWER", RED], ["NO WATER", RED], ["WHAT STOPS FIRST", RED], ["THE ROPE LINE", GREEN], ["SHOPPING BY TOUCH", YEL], ["SHAKE · LISTEN · GUESS", YEL], ["COOKING BY SOUND", YEL], ["PHONES DEAD · CRANK RADIO", YEL], ["NO ONE ALONE", GREEN], ["A NEW SENSE", GREEN]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  const [d, h, m] = CLOCK[i];
  const sec = Math.floor(local / 30);
  return (
    <>
      <Counter f={f} text={`DAY ${d} · ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`} alarm={i < 3} />
      <Tag local={i === 0 ? local - 30 : local} text={TAGS[i][0]} col={TAGS[i][1]} />
    </>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;

export const Eyes3: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f} n="3" title="THE FIRST WEEK" dur={34} />
      <Audio src={staticFile("eyes3/sound.wav")} />
    </AbsoluteFill>
  );
};
