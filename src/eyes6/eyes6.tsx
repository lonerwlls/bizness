// «What if everyone lost their eyes» — часть 6/6: A NEW GENERATION (годы 10–20). Счастливый финал. 60 сек, low-poly 3D.
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import {
  CamRig, Dog3D, Human, Look3D, MASCOT3D, MAYA3D, MOODS, Mat, NPCS, Room, SIT, STAND3D, Street, V3, WALK_Y, World,
  lerp, rnd, walkPose,
} from "../lowpoly/kit3d";

export const EYES6_FRAMES = 1800;
const SC = 180;
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
};
const OLD_DOG = { color: "#c8a07a", muzzle: "#d8d0c4" };
const HOME_IN = { ...MASCOT3D, pack: null };
// дочка: розовая куртка, хвостики; у неё есть глаза
const DAUGHTER: Look3D = { jacket: "#e86a8a", jacket2: "#c8506e", limb: "#3a2a3a", shoe: "#f5c84c", skin: "#e0b08c", hair: "#5a3020", pack: null };
const SUNSET = { ...MOODS.sunset, sunDir: [-30, 6, -40] as V3 };
const BX = 6.5, BZ = 8.5, SUNP: V3 = [-80, 14, -110];
const FACE = Math.atan2(SUNP[0] - BX, SUNP[2] - BZ); // куда смотрит семья
const GROUP_ROT = FACE - Math.PI;
const F = new THREE.Vector3(Math.sin(FACE), 0, Math.cos(FACE)), RR = new THREE.Vector3(Math.cos(FACE), 0, -Math.sin(FACE));
const Sun: React.FC<{ p: V3; r?: number }> = ({ p, r = 9 }) => <mesh position={p}><sphereGeometry args={[r, 24, 16]} /><meshBasicMaterial color="#ffd27a" fog={false} /></mesh>;

const Baby: React.FC<{ p: V3; rot?: V3; open: number; f: number }> = ({ p, rot = [0, 0, 0], open, f }) => (
  <group position={p} rotation={rot}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.09, 0.16, 6, 12]} /><Mat c="#f8d8e4" flat={false} /></mesh>
    <group position={[0.2, 0.02, 0]}>
      <mesh castShadow><sphereGeometry args={[0.085, 16, 12]} /><Mat c="#f0c8a8" flat={false} r={0.5} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0.074, 0.018, s * 0.03]}>
          <mesh scale={[0.6, Math.max(0.12, open) * (f % 70 < 3 ? 0.2 : 1), 1]}><sphereGeometry args={[0.017, 10, 8]} /><Mat c="#1a1a24" flat={false} r={0.2} /></mesh>
          {open > 0.6 ? <mesh position={[0.011, 0.006, 0.004]}><sphereGeometry args={[0.004, 6, 6]} /><meshBasicMaterial color="#ffffff" /></mesh> : null}
        </group>
      ))}
      <mesh position={[0.08, -0.03, 0]} rotation={[0, Math.PI / 2, Math.PI]}><torusGeometry args={[0.015, 0.004, 6, 10, Math.PI]} /><Mat c="#a04050" /></mesh>
    </group>
  </group>
);

// ---------- 1. Она открывает глаза ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const open = ip(g, [60, 80], [0, 1], Easing.out(Easing.cubic));
  const push = ip(g, [20, 100], [0, 1], Easing.inOut(Easing.cubic));
  const baby: V3 = [0.12, 1.18, -0.1];
  return (
    <Canvas3D>
      <CamRig pos={[lerp(1.8, baby[0] + 0.75, push), lerp(1.6, baby[1] + 0.3, push), lerp(1.4, baby[2] + 0.12, push)]} look={[baby[0] + 0.2 * (0.5 + 0.5 * push), baby[1] + 0.03, baby[2]]} fov={lerp(44, 34, push)} />
      <hemisphereLight args={["#fff4ec", "#a0a8b0", 0.95]} />
      <directionalLight position={[2, 4, 2]} intensity={1.3} color="#fff0e0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#e8eef0"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><Mat c="#c8d0d4" /></mesh>
      <mesh position={[0, 1.6, -1.6]}><boxGeometry args={[10, 3.2, 0.1]} /><Mat c="#eef4f6" /></mesh>
      <mesh position={[0.8, 1.7, -1.54]}><boxGeometry args={[1.4, 1.0, 0.02]} /><meshBasicMaterial color="#cfe4f8" /></mesh>
      <mesh position={[0, 0.5, -0.6]} castShadow receiveShadow><boxGeometry args={[1.0, 0.2, 2.0]} /><Mat c="#f4f6f8" /></mesh>
      <mesh position={[0, 0.25, -0.6]}><boxGeometry args={[0.9, 0.5, 1.9]} /><Mat c="#aab4c0" /></mesh>
      <mesh position={[0, 0.85, -1.5]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.9, 0.6, 0.15]} /><Mat c="#f8f8fa" /></mesh>
      <Human p={[0, 0.15, -1.05]} rotY={0} look={{ ...MAYA3D, jacket: "#bcd4e8", jacket2: "#a0bcd4" }} glasses pose={{ ...SIT, hip: 0.52, legL: [90, 90], legR: [90, 90], armL: [60, 100], armR: [60, 100], spread: [-0.2, -0.2], headPitch: 20, lean: -10 }} f={g} mouth="smile" />
      <Baby p={baby} rot={[0, 0, 0.35]} open={open} f={g} />
      <Human p={[0.95, 0, -0.35]} rotY={-1.3} look={HOME_IN} pose={{ ...STAND3D, lean: 18, armL: [40, 70], headPitch: 22 }} eyes={0} f={g} mouth={open > 0.5 ? "smile" : "o"} />
    </Canvas3D>
  );
};

// ---------- 2. Новое поколение ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const n = Math.floor(140_000_000 * ip(g, [10, 90], [0, 1], Easing.in(Easing.quad)));
  const shown = Math.floor(ip(g, [5, 100], [0, 48]));
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <text x={540} y={430} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} letterSpacing={5} fill="#9cb0d0">EVERY BABY BORN AFTER THAT DAY</text>
        {Array.from({ length: 48 }, (_, i) => {
          const x = 170 + (i % 8) * 106, y = 560 + Math.floor(i / 8) * 106, on = i < shown;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${on ? 1 : 0.6})`} opacity={on ? 1 : 0.2}>
              <circle r={40} fill="#f0c8a8" />
              {on ? <><ellipse cx={-14} cy={-4} rx={6} ry={8 * (Math.floor(g / 3 + i) % 37 === 0 ? 0.2 : 1)} fill="#1a1a24" /><ellipse cx={14} cy={-4} rx={6} ry={8} fill="#1a1a24" /><path d="M -10 14 Q 0 22 10 14" stroke="#a04050" strokeWidth={4} fill="none" /></> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center", color: WH, fontFamily: MONT, fontWeight: 900 }}>
        <div style={{ fontSize: 46, color: GREEN, letterSpacing: 4 }}>…HAS EYES</div>
        <div style={{ fontSize: 84, color: YEL, marginTop: 20 }}>{n.toLocaleString("en-US")}</div>
        <div style={{ fontSize: 30, letterSpacing: 5, color: "#9cb0d0" }}>NEW SEEING BABIES EVERY YEAR</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Кроватка и мобиль ----------
const S3: React.FC<{ g: number }> = ({ g }) => {
  const crib: V3 = [0.2, 0, -1.2];
  return (
    <Canvas3D>
      <CamRig pos={[0.9, 1.75, 0.3]} look={[0.05, 0.65, -1.2]} fov={44} />
      <hemisphereLight args={["#fff0e4", "#6a5040", 0.9]} />
      <directionalLight position={[2, 4, -4]} intensity={1.4} color="#ffe2c0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#d8c4b0"]} />
      <Room lamp={false} />
      <group position={crib}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.06, 0.7]} /><Mat c="#f4ecdf" /></mesh>
        {Array.from({ length: 13 }, (_, i) => [-0.33, 0.33].map((z) => <mesh key={`${i}${z}`} position={[-0.58 + i * 0.097, 0.72, z]}><cylinderGeometry args={[0.012, 0.012, 0.44, 6]} /><Mat c="#e8d8c0" /></mesh>))}
        {[-0.6, 0.6].map((x) => <mesh key={x} position={[x, 0.5, 0]}><boxGeometry args={[0.05, 1.0, 0.7]} /><Mat c="#e0ccb0" /></mesh>)}
        <mesh position={[0, 0.555, 0]}><boxGeometry args={[1.1, 0.05, 0.6]} /><Mat c="#cfe0f0" /></mesh>
        <Baby p={[-0.15, 0.62, 0]} rot={[-Math.PI / 2 + 0.1, 0, 0.3 + Math.sin(g / 8) * 0.1]} open={1} f={g} />
        <mesh position={[0.62, 1.15, 0]}><cylinderGeometry args={[0.012, 0.012, 1.3, 6]} /><Mat c="#e0ccb0" /></mesh>
        <group position={[0.1, 1.55, 0]} rotation={[0, g * 0.03, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.26, 0.25, 0]}><cylinderGeometry args={[0.01, 0.01, 0.5, 6]} /><Mat c="#e0ccb0" /></mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <group key={i} position={[Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28]}>
                <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.002, 0.002, 0.24, 4]} /><Mat c="#ffffff" /></mesh>
                <mesh rotation={[0, g * 0.05 + i, 0]}>{i % 2 ? <octahedronGeometry args={[0.06, 0]} /> : <sphereGeometry args={[0.055, 10, 8]} />}<Mat c={["#e0524a", "#f5c84c", "#3ad08a", "#5f8fb5", "#c86ad0"][i]} /></mesh>
              </group>
            );
          })}
        </group>
      </group>
      <Human p={[-0.65, 0, -1.3]} rotY={Math.PI / 2} look={HOME_IN} pose={{ ...STAND3D, lean: 20, armR: [55, 60], headPitch: 20 }} eyes={0} f={g} mouth="smile" />
      <Human p={[1.15, 0, -1.25]} rotY={-Math.PI / 2} look={MAYA3D} glasses pose={{ ...STAND3D, lean: 16, headPitch: 18, armR: [40, 55] }} f={g + 5} mouth="smile" />
    </Canvas3D>
  );
};

// ---------- 4. Теперь она ведёт тебя ----------
const S4: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.018;
  const z = -2 + dist;
  return (
    <Canvas3D>
      <CamRig pos={[-1.8, 1.25, z + 3.0]} look={[1.4, 0.7, z - 0.2]} fov={44} />
      <World m={MOODS.morning} focus={[1.4, 0, z]} />
      <Street />
      <Human p={[1.75, WALK_Y, z]} pose={{ ...walkPose(dist, 0.65, 0.05), armR: [16, 22], headPitch: 12 }} eyes={0} f={g} mouth="smile" />
      <Human p={[1.25, WALK_Y, z + 0.2]} scale={0.56} look={DAUGHTER} pose={{ ...walkPose(dist / 0.56, 0.75, 0.08), armR: [40, 45], armL: [walkPose(dist / 0.56).armL[0], 30], headYaw: -25, headPitch: -15 }} eyes={1} f={g} mouth="smile" />
      <Dog3D p={[2.15, WALK_Y, z - 0.6]} f={g} walk={g * 0.1} wag={0.4} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- 5. «Это синий, папа!» ----------
const S5: React.FC<{ g: number }> = ({ g }) => {
  const bf: V3 = [6.2 + Math.sin(g / 20) * 0.5, 1.3 + Math.sin(g / 7) * 0.15, -1.5 + Math.cos(g / 25) * 0.4];
  const flap = Math.sin(g * 0.9) * 0.9;
  return (
    <>
      <Canvas3D>
        <CamRig pos={[7.4, 1.35, -3.2]} look={[5.1, 0.95, -0.3]} fov={46} />
        <World m={MOODS.day} focus={[6, 0, -1]} />
        <Street />
        <group position={bf}>
          {[-1, 1].map((s) => <mesh key={s} rotation={[0, 0, s * flap]} position={[s * 0.05, 0, 0]}><planeGeometry args={[0.1, 0.08]} /><meshStandardMaterial color="#3a8ae8" side={THREE.DoubleSide} emissive="#3a8ae8" emissiveIntensity={0.3} /></mesh>)}
        </group>
        <Human p={[5.4, 0.03, -0.6]} rotY={2.6} scale={0.58} look={DAUGHTER} pose={{ ...STAND3D, armR: [140, 150], headPitch: -20, headYaw: 10 }} eyes={1} f={g} mouth={g > 40 ? "o" : "smile"} />
        <Human p={[4.6, 0.03, -0.2]} rotY={2.2} pose={{ ...STAND3D, headPitch: -10, headYaw: 20 }} eyes={0} f={g} mouth="smile" />
        <Dog3D p={[4.9, 0.03, 0.4]} rotY={2.4} f={g} sit wag={0.4} {...OLD_DOG} />
      </Canvas3D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", opacity: ip(g, [45, 55], [0, 1]) }}>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 46, color: "#0b1020", background: "#ffffff", borderRadius: 40, padding: "16px 34px" }}>“IT'S <span style={{ color: "#3a8ae8" }}>BLUE</span>, DAD!”</span>
      </div>
    </>
  );
};

// ---------- 6. Слепые учителя, зрячие дети ----------
const S6: React.FC<{ g: number }> = ({ g }) => (
  <Canvas3D>
    <CamRig pos={[1.0, 1.55, -2.5]} look={[-0.9, 0.6, -0.1]} fov={50} />
    <hemisphereLight args={["#f4ece0", "#6a5a48", 0.95]} />
    <directionalLight position={[3, 4, 2]} intensity={1.3} color="#ffe8c8" castShadow shadow-mapSize={[1024, 1024]} />
    <color attach="background" args={["#d8c8b4"]} />
    <Room lamp={false} />
    <mesh position={[-0.6, 1.6, -2.93]}><boxGeometry args={[2.4, 1.0, 0.04]} /><Mat c="#2a4a3a" /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-1.5 + (i % 6) * 0.35, 1.75 - Math.floor(i / 6) * 0.3, -2.9]}><circleGeometry args={[0.035, 8]} /><meshBasicMaterial color="#f2f2ee" /></mesh>)}
    {[[-1.4, -0.6, 0], [-0.4, -0.6, 1], [-1.4, 0.4, 2], [-0.4, 0.4, 3]].map(([x, z, k]) => (
      <group key={k}>
        <mesh position={[x, 0.42, z - 0.35]} castShadow><boxGeometry args={[0.7, 0.05, 0.4]} /><Mat c="#c8a070" /></mesh>
        <Human p={[x, 0, z]} rotY={Math.PI} scale={0.6} look={k === 1 ? DAUGHTER : NPCS[k]} pose={{ ...SIT, armR: k % 2 && Math.sin(g / 15 + k) > 0 ? [160, 175] : [60, 80] }} eyes={1} f={g + k * 5} mouth="smile" />
      </group>
    ))}
    <Human p={[-0.6, 0, -2.3]} rotY={0} look={MAYA3D} glasses pose={{ ...STAND3D, armR: [70 + Math.sin(g / 10) * 20, 110], armL: [10, 16] }} f={g} mouth={Math.floor(g / 8) % 2 ? "o" : "smile"} />
  </Canvas3D>
);

// ---------- 7. Щенок для старого Бадди ----------
const S7: React.FC<{ g: number }> = ({ g }) => {
  const px = 6.0 + Math.sin(g / 14) * 0.6, pz = 2.0 + Math.cos(g / 14) * 0.4;
  return (
    <Canvas3D>
      <CamRig pos={[3.7, 1.9, 4.6]} look={[6.9, 0.4, 0.8]} fov={40} />
      <World m={MOODS.sunset} focus={[6.5, 0, 1]} />
      <Street />
      <Dog3D p={[6.5, 0.03, 1.2]} rotY={1.2} f={g} sit wag={0.6} headTilt={Math.sin(g / 12) * 15} {...OLD_DOG} />
      <group scale={0.5} position={[px, 0.03 + Math.abs(Math.sin(g / 3)) * 0.06, pz]}><Dog3D p={[0, 0, 0]} rotY={Math.atan2(6.5 - px, 1.2 - pz) + 0.4} f={g} walk={g * 0.3} wag={1} color="#3a3a40" bark={Math.max(0, Math.sin(g / 5)) * 0.6} /></group>
      <Human p={[7.6, 0.03, 0.2]} rotY={-0.9} scale={0.6} look={DAUGHTER} pose={{ ...STAND3D, armL: [150 + Math.sin(g / 3) * 10, 175], armR: [150, 175], spread: [0.3, 0.3] }} eyes={1} f={g} mouth="o" />
    </Canvas3D>
  );
};

// ---------- 8. Мир снова цветной ----------
const S8: React.FC<{ g: number }> = ({ g }) => {
  const cols = ["#e0524a", "#f5c84c", "#3ad08a", "#5f8fb5", "#c86ad0", "#ff8a3a"];
  const wallX = 11 + rnd(4 + 3) * 1.5 - 3.03, wz = -8;
  return (
    <Canvas3D>
      <CamRig pos={[4.2, 1.7, wz + 4.2]} look={[wallX, 1.3, wz]} fov={46} />
      <World m={MOODS.day} focus={[wallX, 0, wz]} />
      <Street />
      {cols.map((c, i) => {
        const h = 2.4 * ip(g, [10 + i * 18, 50 + i * 18], [0, 1]);
        return h > 0 ? <mesh key={i} position={[wallX - 0.01, 0.2 + h / 2, wz - 2.2 + i * 0.75]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.7, h]} /><meshStandardMaterial color={c} /></mesh> : null;
      })}
      {[0, 1, 2].map((k) => {
        const z = wz - 2.0 + k * 1.6, reach = 60 + Math.sin(g / 4 + k) * 40;
        return <Human key={k} p={[wallX - 0.55, 0.03, z]} rotY={Math.PI / 2} scale={0.62 + k * 0.03} look={k === 1 ? DAUGHTER : NPCS[k + 1]} pose={{ ...STAND3D, armR: [reach, reach + 10] }} eyes={1} f={g + k * 6} mouth="smile" />;
      })}
    </Canvas3D>
  );
};

// ---------- 9. Небо оранжевое ----------
const S9: React.FC<{ g: number }> = ({ g }) => {
  const bx = BX, bz = BZ;
  const point = g > 60;
  const cam = new THREE.Vector3(bx, 1.9 - g * 0.002, bz).add(RR.clone().multiplyScalar(0.9)).add(F.clone().multiplyScalar(-4.0 + g * 0.004));
  const look = new THREE.Vector3(bx, 1.1, bz).add(F.clone().multiplyScalar(3));
  return (
    <Canvas3D>
      <CamRig pos={[cam.x, cam.y, cam.z]} look={[look.x, look.y, look.z]} fov={48} />
      <World m={SUNSET} focus={[bx, 0, bz]} />
      <Sun p={SUNP} />
      <Street />
      <group position={[bx, 0, bz]} rotation={[0, GROUP_ROT, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow><boxGeometry args={[1.9, 0.06, 0.5]} /><Mat c="#8a5a3a" /></mesh>
        <mesh position={[0, 0.62, 0.22]} castShadow><boxGeometry args={[1.9, 0.3, 0.06]} /><Mat c="#8a5a3a" /></mesh>
        {[-0.85, 0.85].map((x) => <mesh key={x} position={[x, 0.2, 0]}><boxGeometry args={[0.06, 0.4, 0.45]} /><Mat c="#3a3a40" /></mesh>)}
        <Human p={[-0.55, 0, -0.05]} rotY={Math.PI} look={MASCOT3D} pose={{ ...SIT, armR: [30, 60], headPitch: -12, headYaw: point ? 20 : 0 }} eyes={0} f={g} mouth="smile" />
        <Human p={[0.0, 0, -0.05]} rotY={Math.PI} scale={0.68} look={DAUGHTER} pose={{ ...SIT, armR: point ? [150, 160] : [30, 60], headPitch: -20, headYaw: point ? 0 : -30 }} eyes={1} f={g} mouth={point ? "o" : "smile"} />
        <Human p={[0.55, 0, -0.05]} rotY={Math.PI} look={MAYA3D} glasses pose={{ ...SIT, armL: [30, 60], headPitch: -10, headYaw: -15 }} f={g + 5} mouth="smile" />
      </group>
      <Dog3D p={[bx + F.x * 0.9, 0.03, bz + F.z * 0.9]} rotY={FACE} f={g} sit wag={0.3} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- 10. Улыбка и THE END ----------
const S10: React.FC<{ g: number }> = ({ g }) => {
  const pull = ip(g, [30, 150], [0, 1], Easing.inOut(Easing.cubic));
  const bx = BX, bz = BZ;
  const face = new THREE.Vector3(-0.55, 1.18, -0.05).applyAxisAngle(new THREE.Vector3(0, 1, 0), GROUP_ROT).add(new THREE.Vector3(bx, 0, bz));
  // камера облетает скамейку сбоку: спереди (лицо) -> сзади (закат)
  const th = lerp(0.3, Math.PI - 0.4, pull), r = lerp(1.6, 5.5, pull);
  const center = face.clone().lerp(new THREE.Vector3(bx, 0.9, bz), pull);
  const dir = F.clone().multiplyScalar(Math.cos(th)).add(RR.clone().multiplyScalar(-Math.sin(th)));
  const cv = center.clone().add(dir.multiplyScalar(r));
  const lt = face.clone().lerp(new THREE.Vector3(bx, 1.2, bz).add(F.clone().multiplyScalar(1.5)), pull);
  return (
    <Canvas3D>
      <CamRig pos={[cv.x, lerp(1.25, 2.4, pull), cv.z]} look={[lt.x, lt.y, lt.z]} fov={lerp(30, 48, pull)} />
      <World m={SUNSET} focus={[bx, 0, bz]} />
      <Sun p={SUNP} />
      <Street lit={g > 60} />
      <group position={[bx, 0, bz]} rotation={[0, GROUP_ROT, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow><boxGeometry args={[1.9, 0.06, 0.5]} /><Mat c="#8a5a3a" /></mesh>
        <mesh position={[0, 0.62, 0.22]} castShadow><boxGeometry args={[1.9, 0.3, 0.06]} /><Mat c="#8a5a3a" /></mesh>
        <Human p={[-0.55, 0, -0.05]} rotY={Math.PI} look={MASCOT3D} pose={{ ...SIT, armR: [30, 60], headPitch: -14, headYaw: 15 }} eyes={0} f={g} mouth="smile" />
        <Human p={[0.0, 0, -0.05]} rotY={Math.PI} scale={0.68} look={DAUGHTER} pose={{ ...SIT, armL: [40, 70], headPitch: -10, headYaw: 25 }} eyes={1} f={g} mouth="smile" />
        <Human p={[0.55, 0, -0.05]} rotY={Math.PI} look={MAYA3D} glasses pose={{ ...SIT, headPitch: -10, headYaw: -15 }} f={g + 5} mouth="smile" />
      </group>
      <Dog3D p={[bx + F.x * 0.9, 0.03, bz + F.z * 0.9]} rotY={FACE} f={g} sit wag={0.3} {...OLD_DOG} />
    </Canvas3D>
  );
};

// ---------- HUD ----------
const TIME: string[] = ["YEAR 10", "YEAR 10", "YEAR 10", "YEAR 14", "YEAR 14", "YEAR 16", "YEAR 17", "YEAR 18", "YEAR 20", "YEAR 20"];
const TAGS: [string, string][] = [["SHE HAS EYES", GREEN], ["A NEW GENERATION", GREEN], ["SHE SEES COLORS", YEL], ["NOW SHE GUIDES YOU", GREEN], ["WHAT IS “BLUE”?", YEL], ["BLIND TEACHERS · SEEING KIDS", GREEN], ["A NEW FRIEND FOR BUDDY", YEL], ["THE WORLD GETS COLOR AGAIN", GREEN], ["THE SKY IS ORANGE", YEL], ["THE END", GREEN]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  if (f > 1755) return null;
  return (
    <>
      <Counter f={f} text={TIME[i]} />
      <Tag local={i === 0 ? local - 30 : local} text={TAGS[i][0]} col={TAGS[i][1]} />
    </>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;

export const Eyes6: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
  const white = ip(f, [1745, 1772], [0, 1]);
  const end = ip(f, [1765, 1780], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.5)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f} n="6" title="A NEW GENERATION" dur={34} />
      <AbsoluteFill style={{ background: "#fff8ee", opacity: white }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: end }}>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 110, color: "#1d2b4a", letterSpacing: 8 }}>THE END</div>
      </AbsoluteFill>
      <Audio src={staticFile("eyes6/sound.wav")} />
    </AbsoluteFill>
  );
};
export const _U = [RED];
