// Пробник 3D: «игрушечный» герой (MASCOT) ест бургер у окна на закате. Three.js внутри Remotion.
// Рендер: npx remotion render src/styles/index.ts Style-3d out/x.mp4 --gl=swangle
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const TOY_FRAMES = 150;
const C = { skin: "#f0c49c", jacket: "#ee7a36", hat: "#2f3d63", hat2: "#eef1f6", pants: "#26304a", eye: "#1b2033", wood: "#a8683e", wood2: "#7a4a2a", wall: "#d8a888", floor: "#8a5a3c" };
const ip = (f: number, a: number[], b: number[]) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerp3 = (a: THREE.Vector3, b: THREE.Vector3, t: number) => a.clone().lerp(b, t);

const Std: React.FC<{ c: string; r?: number; e?: string; ei?: number }> = ({ c, r = 0.55, e, ei = 0 }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={0} emissive={e ?? "#000000"} emissiveIntensity={ei} />
);

// рука: капсула от плеча к цели (плечо → кисть), длина фиксированная
const ARM = 0.5;
const armDir = (sh: THREE.Vector3, target: THREE.Vector3) => target.clone().sub(sh).normalize();
const Arm: React.FC<{ sh: THREE.Vector3; target: THREE.Vector3; thumb?: boolean }> = ({ sh, target, thumb }) => {
  const dir = armDir(sh, target);
  const q = new THREE.Quaternion().setFromUnitVectors(v3(0, -1, 0), dir);
  return (
    <group position={sh} quaternion={q}>
      <mesh position={[0, -ARM / 2, 0]} castShadow>
        <capsuleGeometry args={[0.085, ARM - 0.1, 8, 16]} />
        <Std c={C.jacket} />
      </mesh>
      <mesh position={[0, -ARM, 0]} castShadow>
        <sphereGeometry args={[0.095, 24, 24]} />
        <Std c={C.skin} r={0.5} />
      </mesh>
      {thumb ? (
        <mesh position={[0.0, -ARM - 0.12, 0]} castShadow>
          <capsuleGeometry args={[0.03, 0.08, 6, 12]} />
          <Std c={C.skin} />
        </mesh>
      ) : null}
    </group>
  );
};
const handPos = (sh: THREE.Vector3, target: THREE.Vector3) => sh.clone().add(armDir(sh, target).multiplyScalar(ARM));

const Burger: React.FC<{ p: THREE.Vector3; k: number; rot?: number }> = ({ p, k, rot = 0 }) => (
  <group position={p} scale={k} rotation={[0.25, rot, 0.15]}>
    <mesh position={[0, -0.05, 0]} castShadow><cylinderGeometry args={[0.15, 0.13, 0.06, 32]} /><Std c="#e0a050" r={0.6} /></mesh>
    <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.03, 32]} /><Std c="#7fc06a" r={0.7} /></mesh>
    <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 32]} /><Std c="#6a3a22" r={0.8} /></mesh>
    <mesh position={[0, 0.06, 0]} castShadow><sphereGeometry args={[0.155, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Std c="#e8a850" r={0.5} /></mesh>
    {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * 1.3) * 0.08, 0.06 + 0.13 - Math.abs(Math.cos(i * 1.3)) * 0.04, Math.sin(i * 1.3) * 0.08]}><sphereGeometry args={[0.012, 8, 8]} /><Std c="#fff4d0" /></mesh>)}
  </group>
);

const Head: React.FC<{ f: number; mouth: "smile" | "o" | "grin"; eyes: "open" | "happy" | "closed"; chew: number; tilt: number }> = ({ f, mouth, eyes, chew, tilt }) => {
  const blink = (f % 85) < 4 ? 0.15 : 1;
  const ey = eyes === "open" ? blink : 0.25;
  return (
    <group position={[0, 1.62, 0]} rotation={[tilt, 0.25, 0]}>
      <mesh castShadow><sphereGeometry args={[0.32, 48, 48]} /><Std c={C.skin} r={0.5} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.31, -0.02, 0]}><sphereGeometry args={[0.07, 16, 16]} /><Std c={C.skin} /></mesh>)}
      {/* шапка */}
      <mesh position={[0, 0.05, 0]} castShadow><sphereGeometry args={[0.335, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><Std c={C.hat} r={0.9} /></mesh>
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.325, 0.055, 16, 48]} /><Std c="#26324f" r={0.9} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.29, 0.018, 12, 48]} /><Std c={C.hat2} r={0.9} /></mesh>
      <mesh position={[0, 0.4, 0]} castShadow><sphereGeometry args={[0.085, 24, 24]} /><Std c={C.hat2} r={0.95} /></mesh>
      {/* глаза */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.11, 0.0, 0.29]} scale={[1, ey, 1]}>
          <mesh scale={[1, 1.25, 0.5]}><sphereGeometry args={[0.045, 20, 20]} /><Std c={C.eye} r={0.3} /></mesh>
          {eyes === "open" ? <mesh position={[0.015, 0.02, 0.022]}><sphereGeometry args={[0.013, 10, 10]} /><Std c="#ffffff" e="#ffffff" ei={0.6} /></mesh> : null}
        </group>
      ))}
      {[-1, 1].map((s) => <mesh key={"c" + s} position={[s * 0.19, -0.09, 0.25]} scale={[1, 0.6, 0.4]}><sphereGeometry args={[0.05, 16, 16]} /><Std c="#f08a8a" r={0.8} /></mesh>)}
      {/* рот */}
      {mouth === "o" ? (
        <mesh position={[0, -0.13 - chew * 0.01, 0.29]} scale={[1, 1.2 + chew * 0.4, 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><Std c="#5a1a1a" /></mesh>
      ) : (
        <mesh position={[0, -0.1, 0.295]} rotation={[0, 0, Math.PI]} scale={[1, mouth === "grin" ? 1.3 : 1 + chew * 0.3, 1]}>
          <torusGeometry args={[0.07, 0.016, 10, 24, Math.PI]} /><Std c="#5a1a1a" />
        </mesh>
      )}
    </group>
  );
};

const skyTexture = () => {
  const c = document.createElement("canvas");
  c.width = 16; c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  [["0", "#3a2a7a"], ["0.4", "#8a3a9a"], ["0.65", "#ff6a7a"], ["0.85", "#ff9a4a"], ["1", "#ffd27a"]].forEach(([o, col]) => gr.addColorStop(Number(o), col));
  g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const close = f < 70;
  const pos = close ? lerp3(v3(0.75, 1.6, 2.7), v3(0.6, 1.58, 2.35), f / 70) : lerp3(v3(1.8, 1.75, 3.6), v3(1.2, 1.65, 3.2), (f - 70) / 80);
  const look = close ? v3(0.05, 1.42, 0) : v3(0, 1.15, 0);
  cam.position.copy(pos);
  cam.lookAt(look);
  cam.fov = close ? 34 : 38;
  cam.updateProjectionMatrix();
  return null;
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const sky = useMemo(skyTexture, []);
  const away = (a: number, b: number) => ip(f, [a, b], [0, 1]) - ip(f, [b + 6, b + 18], [0, 1]);
  const bite = Math.max(away(38, 45), away(88, 95));
  const chewing = (f > 46 && f < 76) || (f > 96 && f < 122);
  const chew = chewing ? Math.abs(Math.sin(f / 2.2)) : 0;
  const thumbs = f >= 122;
  const shR = v3(0.36, 1.27, 0.02), shL = v3(-0.36, 1.27, 0.02);
  const plate = v3(0.35, 0.86, 0.45);
  const lift = ip(f, [4, 28], [0, 1]);
  const mouthT = v3(0.26, 1.4, 0.46);
  const tR = lerp3(lerp3(v3(0.42, 0.82, 0.42), mouthT, lift), v3(0.2, 1.43, 0.4), bite).add(v3(0, f > 118 ? -0.15 * ip(f, [118, 130], [0, 1]) : 0, 0));
  const tL = thumbs ? lerp3(v3(-0.42, 0.82, 0.42), v3(-0.6, 1.85, 0.25), ip(f, [122, 132], [0, 1])) : v3(-0.42, 0.82, 0.42);
  const hR = handPos(shR, tR);
  const bites = f >= 95 ? 2 : f >= 45 ? 1 : 0;
  const burgerP = lift > 0.05 ? hR.clone().add(v3(-0.02, 0.09, 0.07)) : plate.clone().add(v3(0, 0.09, 0));
  const body = Math.sin(f / 9) * 0.01 + chew * 0.01;
  const mouth = bite > 0.3 ? "o" : thumbs ? "grin" : chewing ? (chew > 0.5 ? "o" : "smile") : "smile";
  const eyes = bite > 0.3 ? "closed" : chewing || thumbs ? "happy" : "open";
  return (
    <>
      <CameraRig f={f} />
      <color attach="background" args={["#2a1a3e"]} />
      <hemisphereLight args={["#b8a0ff", "#7a4a2a", 0.55]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} color="#fff0e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-bias={-0.0004} />
      <directionalLight position={[-1, 2, -4]} intensity={1.4} color="#ff8a4a" />
      <pointLight position={[-1.4, 1.6, 0.6]} intensity={2.2} distance={4} color="#ffb060" />
      {/* комната */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><Std c={C.floor} r={0.8} /></mesh>
      {/* стена с окном (проём 2.4×1.6, низ на 1.0) */}
      <mesh position={[0, 0.5, -1.2]} receiveShadow><boxGeometry args={[8, 1, 0.1]} /><Std c={C.wall} r={0.9} /></mesh>
      <mesh position={[0, 3.6, -1.2]} receiveShadow><boxGeometry args={[8, 2, 0.1]} /><Std c={C.wall} r={0.9} /></mesh>
      <mesh position={[-2.6, 1.8, -1.2]} receiveShadow><boxGeometry args={[2.8, 1.6, 0.1]} /><Std c={C.wall} r={0.9} /></mesh>
      <mesh position={[2.6, 1.8, -1.2]} receiveShadow><boxGeometry args={[2.8, 1.6, 0.1]} /><Std c={C.wall} r={0.9} /></mesh>
      {[[0, 1.0, 2.5, 0.08], [0, 2.6, 2.5, 0.08], [-1.22, 1.8, 0.08, 1.7], [1.22, 1.8, 0.08, 1.7], [0, 1.8, 0.06, 1.6], [0, 1.8, 2.4, 0.05]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -1.15]} castShadow><boxGeometry args={[w, h, 0.08]} /><Std c="#5a3424" r={0.7} /></mesh>
      ))}
      {/* небо и город за окном */}
      <mesh position={[0, 2.2, -6]}><planeGeometry args={[14, 7]} /><meshBasicMaterial map={sky} toneMapped={false} /></mesh>
      <mesh position={[0.9, 1.25, -5.9]}><circleGeometry args={[0.45, 32]} /><meshBasicMaterial color="#ffe08a" toneMapped={false} /></mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const h = 0.8 + ((i * 37) % 10) * 0.12, x = -3.2 + i * 0.5;
        return (
          <group key={i} position={[x, h / 2 + 0.3, -5 + (i % 3) * 0.3]}>
            <mesh><boxGeometry args={[0.42, h, 0.3]} /><meshBasicMaterial color={i % 2 ? "#2a1a4e" : "#33205a"} /></mesh>
            {Array.from({ length: Math.floor(h * 6) }, (_, k) => ((i * 13 + k * 7) % 5 > 1 ? <mesh key={k} position={[-0.1 + (k % 3) * 0.1, -h / 2 + 0.12 + Math.floor(k / 3) * 0.16, 0.16]}><planeGeometry args={[0.05, 0.07]} /><meshBasicMaterial color="#ffc86a" toneMapped={false} /></mesh> : null))}
          </group>
        );
      })}
      {/* стул */}
      <mesh position={[0, 0.95, -0.38]} castShadow><boxGeometry args={[0.8, 1.0, 0.08]} /><Std c={C.wood2} /></mesh>
      <mesh position={[0, 0.5, -0.1]} castShadow><boxGeometry args={[0.8, 0.08, 0.6]} /><Std c={C.wood2} /></mesh>
      {/* герой */}
      <group position={[0, body, 0]}>
        <mesh position={[0, 1.02, 0]} castShadow><capsuleGeometry args={[0.31, 0.38, 10, 24]} /><Std c={C.jacket} r={0.6} /></mesh>
        <mesh position={[0, 1.02, 0.305]}><boxGeometry args={[0.02, 0.5, 0.02]} /><Std c="#c5612b" /></mesh>
        {[-0.14, 0.14].map((x) => <mesh key={x} position={[x, 0.62, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.1, 0.4, 8, 16]} /><Std c={C.pants} /></mesh>)}
        <Head f={f} mouth={mouth} eyes={eyes} chew={chew} tilt={-0.05 + bite * 0.12 + chew * 0.03} />
        <Arm sh={shR} target={tR} />
        <Arm sh={shL} target={tL} thumb={thumbs} />
      </group>
      <Burger p={burgerP} k={bites === 2 ? 0.75 : bites === 1 ? 0.88 : 1} rot={f * 0.002} />
      {[45, 95].flatMap((a, k) => Array.from({ length: 6 }, (_, i) => {
        const t = (f - a) / 30;
        if (t < 0 || t > 1) return null;
        return <mesh key={`${k}${i}`} position={[0.1 + (i - 3) * 0.03, Math.max(0.81, 1.45 - t * t * 1.2), 0.42 + (i % 2) * 0.05]}><sphereGeometry args={[0.012, 8, 8]} /><Std c="#e0a050" /></mesh>;
      }))}
      {/* стол */}
      <mesh position={[0, 0.78, 0.45]} castShadow receiveShadow><boxGeometry args={[1.8, 0.06, 0.8]} /><Std c={C.wood} r={0.6} /></mesh>
      {[[-0.8, 0.12], [0.8, 0.12], [-0.8, 0.78], [0.8, 0.78]].map(([x, z], i) => <mesh key={i} position={[x, 0.38, z]} castShadow><boxGeometry args={[0.07, 0.76, 0.07]} /><Std c={C.wood2} /></mesh>)}
      <mesh position={[plate.x, 0.82, plate.z]} receiveShadow><cylinderGeometry args={[0.22, 0.2, 0.02, 32]} /><Std c="#eef1f6" r={0.3} /></mesh>
      {/* картошка, напиток */}
      <group position={[-0.4, 0.81, 0.5]}>
        <mesh position={[0, 0.09, 0]} castShadow><cylinderGeometry args={[0.09, 0.07, 0.18, 4]} /><Std c="#e0524a" /></mesh>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-0.05 + (i % 4) * 0.033, 0.22 + (i % 2) * 0.02, -0.02 + (i % 3) * 0.02]} rotation={[0, 0, (i - 3) * 0.08]} castShadow><boxGeometry args={[0.022, 0.14, 0.022]} /><Std c="#f5c84c" /></mesh>)}
      </group>
      <group position={[0.75, 0.81, 0.4]}>
        <mesh position={[0, 0.14, 0]} castShadow><cylinderGeometry args={[0.075, 0.06, 0.28, 24]} /><Std c="#ee5a5a" r={0.4} /></mesh>
        <mesh position={[0.02, 0.33, 0]} rotation={[0, 0, 0.15]}><cylinderGeometry args={[0.01, 0.01, 0.2, 8]} /><Std c="#ffffff" /></mesh>
      </group>
      {/* растение и лампа */}
      <group position={[-1.5, 0, -0.6]}>
        <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.18, 0.14, 0.4, 24]} /><Std c="#c0603e" /></mesh>
        {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[Math.cos(i) * 0.08, 0.6, Math.sin(i) * 0.08]} rotation={[Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4 + Math.sin(f / 20 + i) * 0.03]} castShadow><coneGeometry args={[0.07, 0.6, 8]} /><Std c={i % 2 ? "#3d8a5a" : "#4fa36a"} /></mesh>)}
      </group>
      <group position={[1.45, 0, -0.5]}>
        <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.02, 0.02, 1.4, 8]} /><Std c="#3a2a2a" /></mesh>
        <mesh position={[0, 1.45, 0]}><coneGeometry args={[0.2, 0.25, 24, 1, true]} /><Std c="#ffb060" e="#ffb060" ei={0.8} /></mesh>
      </group>
    </>
  );
};

export const Toy3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#2a1a3e" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 34, position: [0.5, 1.6, 1.7] }}>
        <Scene />
      </ThreeCanvas>
      <Audio src={staticFile("styles/eat.wav")} />
    </AbsoluteFill>
  );
};
