// Пробник стиля «low-poly 3D» (как референс пользователя): пригородная улица на закате, длинные тени,
// герой MASCOT из простых 3D-форм с настоящей походкой (колени/ступни считаются IK). Three.js внутри Remotion.
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { BODY, D, ik, stepFoot } from "../characters/Rig";
import { Grain, ip, rnd } from "../characters/kit";

export const LOWPOLY_FRAMES = 150;
const COL = { jacket: "#ee7a36", jacket2: "#c8602a", limb: "#1d1d26", shoe: "#f2f2ee", skin: "#f0c49c", hat: "#2f3d63", hat2: "#eef1f6", pack: "#f2c84c" };
const Mat: React.FC<{ c: string; flat?: boolean; r?: number }> = ({ c, flat = true, r = 0.85 }) => <meshStandardMaterial color={c} roughness={r} metalness={0} flatShading={flat} />;

// ---------- окружение ----------
const SKY_TOP = new THREE.Color("#5e6494"), SKY_MID = new THREE.Color("#b49ab8"), SKY_LOW = new THREE.Color("#f2c8a0");
const Sky: React.FC = () => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: SKY_TOP }, mid: { value: SKY_MID }, low: { value: SKY_LOW } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float h = clamp(vP.y*2.2, 0.0, 1.0); vec3 c = mix(low, mid, smoothstep(0.0,0.35,h)); c = mix(c, top, smoothstep(0.35,1.0,h)); gl_FragColor = vec4(c,1.0); }",
  }), []);
  return <mesh material={mat}><sphereGeometry args={[480, 32, 16]} /></mesh>;
};
const Cloud: React.FC<{ p: [number, number, number]; s: number }> = ({ p, s }) => (
  <group position={p} scale={[s * 1.6, s * 0.55, s]}>
    {[[0, 0, 0, 1], [1.1, -0.15, 0.2, 0.8], [-1.1, -0.2, -0.1, 0.75], [0.4, 0.45, 0, 0.7], [-0.5, 0.35, 0.2, 0.6]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color="#e8c8b0" emissive="#6a4a5a" emissiveIntensity={0.25} flatShading roughness={1} fog={false} /></mesh>
    ))}
  </group>
);
const HOUSE_COLS = ["#ece4b8", "#9eaec8", "#c8b4d4", "#b8cca8", "#e8c4a8", "#a8c4c8"];
const ROOF_COLS = ["#2e3a2a", "#3a3a4e", "#5a4a3a", "#2a3a4a"];
const House: React.FC<{ z: number; i: number }> = ({ z, i }) => {
  const w = 5.5 + rnd(i) * 1.5, h = 3 + (i % 3 === 0 ? 2.6 : 0), d = 6;
  const c = HOUSE_COLS[i % HOUSE_COLS.length], roof = ROOF_COLS[i % ROOF_COLS.length];
  return (
    <group position={[11 + rnd(i + 3) * 1.5, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[d, h, w]} /><Mat c={c} /></mesh>
      <mesh position={[0, h + 1.05, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]} castShadow>
        <cylinderGeometry args={[1.25, 1.25, w + 0.6, 3]} />
        <Mat c={roof} />
      </mesh>
      {/* окна и дверь со стороны улицы (x = -d/2) */}
      <mesh position={[-d / 2 - 0.02, 1.1, -w * 0.18]}><boxGeometry args={[0.06, 1.8, 0.9]} /><Mat c={["#3a2a5a", "#4a3a2a", "#2a3a5a"][i % 3]} /></mesh>
      {[-0.32, 0.25].map((k, j) => (
        <group key={j} position={[-d / 2 - 0.03, h > 4 ? 3.6 : 1.7, w * k]}>
          <mesh><boxGeometry args={[0.06, 1.0, 1.0]} /><Mat c="#f4eedc" /></mesh>
          <mesh position={[-0.02, 0, 0]}><boxGeometry args={[0.06, 0.8, 0.8]} /><Mat c="#4a4a58" /></mesh>
        </group>
      ))}
      {h > 4 ? [-0.32, 0.25].map((k, j) => <group key={"b" + j} position={[-d / 2 - 0.03, 1.6, w * k + 0.2]}><mesh><boxGeometry args={[0.06, 0.9, 0.6]} /><Mat c="#f4eedc" /></mesh></group>) : null}
      <mesh position={[-d / 2 - 0.8, 0.08, -w * 0.18]} receiveShadow castShadow><boxGeometry args={[1.4, 0.16, 1.6]} /><Mat c="#e2d6b8" /></mesh>
      {/* дорожка к тротуару */}
      <mesh position={[-d / 2 - 3.2, 0.02, -w * 0.18]} receiveShadow><boxGeometry args={[5, 0.04, 1.1]} /><Mat c="#d8ccb0" /></mesh>
    </group>
  );
};
const Tree: React.FC<{ p: [number, number, number]; i: number }> = ({ p, i }) => {
  const s = 0.9 + rnd(i + 7) * 0.35;
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.13, 0.18, 2.8, 6]} /><Mat c="#5a3a24" /></mesh>
      {[[0, 3.2, 0, 1.25], [0.7, 2.9, 0.3, 0.9], [-0.6, 2.95, -0.2, 0.95], [0.1, 3.8, 0.2, 0.85], [-0.2, 3.0, 0.75, 0.8]].map(([x, y, z, r], k) => (
        <mesh key={k} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><Mat c={k % 2 ? "#3f7a3a" : "#4f8f44"} /></mesh>
      ))}
    </group>
  );
};
const Lamp: React.FC<{ z: number }> = ({ z }) => (
  <group position={[0.75, 0, z]}>
    <mesh position={[0, 2.6, 0]} castShadow><cylinderGeometry args={[0.05, 0.06, 5.2, 6]} /><Mat c="#2a2a30" /></mesh>
    <mesh position={[-0.35, 5.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.8, 6]} /><Mat c="#2a2a30" /></mesh>
  </group>
);
const Street: React.FC = () => {
  const len = 420;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0, -len / 2 + 30]} receiveShadow><planeGeometry args={[8, len]} /><Mat c="#4a464e" /></mesh>
      {Array.from({ length: 70 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-7.6, 0.01, 30 - i * 6]}><planeGeometry args={[0.12, 3]} /><meshStandardMaterial color="#e8c24a" /></mesh>)}
      <mesh position={[0.1, 0.07, -len / 2 + 30]} receiveShadow castShadow><boxGeometry args={[0.2, 0.14, len]} /><Mat c="#c8baa0" /></mesh>
      <mesh position={[1.3, 0.06, -len / 2 + 30]} receiveShadow><boxGeometry args={[2.2, 0.12, len]} /><Mat c="#cfc2a6" /></mesh>
      {Array.from({ length: 140 }, (_, i) => <mesh key={"j" + i} position={[1.3, 0.121, 30 - i * 3]}><boxGeometry args={[2.2, 0.005, 0.03]} /><Mat c="#b8ab90" /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.03, -len / 2 + 30]} receiveShadow><planeGeometry args={[30, len]} /><Mat c="#6f9a4a" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-30, -0.01, -len / 2 + 30]} receiveShadow><planeGeometry args={[44, len]} /><Mat c="#5f8a44" /></mesh>
      {Array.from({ length: 30 }, (_, i) => <House key={i} z={18 - i * 13} i={i} />)}
      {Array.from({ length: 34 }, (_, i) => <Tree key={i} p={[3.6 + rnd(i) * 0.6, 0, 12 - i * 11.5]} i={i} />)}
      {Array.from({ length: 18 }, (_, i) => <Lamp key={i} z={4 - i * 23} />)}
      {/* ящик-клумба у дороги как в референсе */}
      <mesh position={[3.2, 0.35, -9]} castShadow receiveShadow><boxGeometry args={[1.2, 0.7, 2.6]} /><Mat c="#e8dcb0" /></mesh>
      {/* дома через дорогу вдали */}
      {Array.from({ length: 16 }, (_, i) => (
        <group key={"l" + i} position={[-19, 0, -40 - i * 16]}>
          <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[6, 4, 7]} /><Mat c={HOUSE_COLS[(i + 2) % 6]} /></mesh>
          <mesh position={[0, 5.0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[1.4, 1.4, 7.4, 3]} /><Mat c={ROOF_COLS[i % 4]} /></mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- герой ----------
const L1 = 0.4, L2 = 0.4, A1 = 0.26, A2 = 0.26, HIP = 0.76;
type Limb = [number, number]; // абсолютные углы (0 = вниз, + = вперёд), градусы
const Leg: React.FC<{ x: number; a: Limb }> = ({ x, a }) => (
  <group position={[x, 0, 0]} rotation={[-a[0] * D, 0, 0]}>
    <mesh position={[0, -L1 / 2, 0]} castShadow><capsuleGeometry args={[0.032, L1, 4, 8]} /><Mat c={COL.limb} flat={false} r={0.6} /></mesh>
    <group position={[0, -L1, 0]} rotation={[-(a[1] - a[0]) * D, 0, 0]}>
      <mesh position={[0, -L2 / 2, 0]} castShadow><capsuleGeometry args={[0.03, L2, 4, 8]} /><Mat c={COL.limb} flat={false} r={0.6} /></mesh>
      <mesh position={[0, -L2 - 0.02, 0.05]} rotation={[a[1] * D, 0, 0]} castShadow><boxGeometry args={[0.1, 0.07, 0.2]} /><Mat c={COL.shoe} /></mesh>
    </group>
  </group>
);
const Arm: React.FC<{ x: number; a: Limb; side: number }> = ({ x, a, side }) => (
  <group position={[x, 0, 0]} rotation={[-a[0] * D, 0, side * 0.12]}>
    <mesh position={[0, -A1 / 2, 0]} castShadow><capsuleGeometry args={[0.03, A1, 4, 8]} /><Mat c={COL.jacket} flat={false} /></mesh>
    <group position={[0, -A1, 0]} rotation={[-(a[1] - a[0]) * D, 0, 0]}>
      <mesh position={[0, -A2 / 2, 0]} castShadow><capsuleGeometry args={[0.026, A2, 4, 8]} /><Mat c={COL.limb} flat={false} r={0.6} /></mesh>
      <mesh position={[0, -A2 - 0.03, 0]} castShadow><sphereGeometry args={[0.045, 10, 8]} /><Mat c={COL.limb} flat={false} /></mesh>
    </group>
  </group>
);
const Hero: React.FC<{ pos: THREE.Vector3; legL: Limb; legR: Limb; armL: Limb; armR: Limb; bob: number; lean: number; f: number }> = ({ pos, legL, legR, armL, armR, bob, lean, f }) => {
  const blink = f % 80 < 3 ? 0.15 : 1;
  return (
    <group position={[pos.x, pos.y + bob, pos.z]}>
      {/* таз на высоте ног */}
      <group position={[0, HIP, 0]}>
        <Leg x={-0.07} a={legL} />
        <Leg x={0.07} a={legR} />
        <group rotation={[lean * D, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow><capsuleGeometry args={[0.13, 0.22, 6, 12]} /><Mat c={COL.jacket} flat={false} r={0.7} /></mesh>
          <mesh position={[0, 0.2, 0.118]}><boxGeometry args={[0.015, 0.3, 0.02]} /><Mat c={COL.jacket2} /></mesh>
          <mesh position={[0, 0.22, -0.16]} castShadow><boxGeometry args={[0.22, 0.27, 0.1]} /><Mat c={COL.pack} r={0.7} /></mesh>
          <group position={[0, 0.4, 0]}>
            <Arm x={-0.15} a={armL} side={-1} />
            <Arm x={0.15} a={armR} side={1} />
          </group>
          {/* голова */}
          <group position={[0, 0.62, 0]}>
            <mesh castShadow><sphereGeometry args={[0.15, 24, 18]} /><Mat c={COL.skin} flat={false} r={0.6} /></mesh>
            <mesh position={[0, 0.03, 0]} castShadow><sphereGeometry args={[0.158, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat c={COL.hat} flat={false} r={0.95} /></mesh>
            <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.155, 0.025, 8, 24]} /><Mat c="#26324f" flat={false} r={0.95} /></mesh>
            <mesh position={[0, 0.19, 0]} castShadow><sphereGeometry args={[0.042, 12, 10]} /><Mat c={COL.hat2} flat={false} r={1} /></mesh>
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.05, -0.005, 0.138]} scale={[1, 1.3 * blink, 0.5]}><sphereGeometry args={[0.018, 10, 8]} /><Mat c="#14141c" flat={false} r={0.3} /></mesh>)}
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------- камера и свет следуют за героем ----------
const Rig3: React.FC<{ hero: THREE.Vector3; f: number }> = ({ hero, f }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const swing = ip(f, [0, 150], [0, 1]);
  cam.position.set(hero.x - 3.4 - swing * 0.4, 1.9, hero.z + 6.2 - swing * 0.4);
  cam.lookAt(hero.x + 0.9, 0.9, hero.z - 2.5);
  cam.fov = 42;
  cam.updateProjectionMatrix();
  return null;
};
const Sun: React.FC<{ hero: THREE.Vector3 }> = ({ hero }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(hero.x + 2, 0, hero.z + 2);
  return (
    <>
      <primitive object={target} />
      <directionalLight position={[hero.x - 24, 8, hero.z - 26]} target={target} intensity={3.2} color="#ffd6a0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0006} shadow-normalBias={0.02} />
    </>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  // герой идёт по тротуару «вглубь» (к -z); x = 1.3 (центр тротуара)
  const speed = 0.042, S = 0.95;
  const dist = f * speed;
  const kickF = 70;
  const ground = () => 0;
  const fl = stepFoot(dist, S, 0, ground, 0.09), fr = stepFoot(dist, S, 0.5, ground, 0.09);
  const bob = Math.abs(Math.cos((dist / S) * Math.PI * 2)) * 0.02;
  const legFrom = (foot: [number, number]): Limb => {
    const lift = -foot[1];
    const r = ik([0, 0], [(foot[0] - dist) * 100, (HIP + bob - 0.055 - lift) * 100], L1 * 100, L2 * 100, 1);
    return [r[0], r[1]];
  };
  let legL = legFrom(fl), legR = legFrom(fr);
  const kick = ip(f, [kickF - 6, kickF, kickF + 10], [0, 1, 0]);
  if (kick > 0) legR = [lerp(legR[0], 55, kick), lerp(legR[1], 40, kick)];
  const swL = (fr[0] - dist) / S, swR = (fl[0] - dist) / S;
  const armL: Limb = [swL * 70, swL * 70 + 35], armR: Limb = [swR * 70, swR * 70 + 35];
  const hero = new THREE.Vector3(1.3, 0, -12 + dist);
  // мяч: лежит впереди, после удара катится и прыгает
  const ball0 = -12 + kickF * speed + 0.36;
  const t = Math.max(0, f - kickF) / 30;
  const bz = f < kickF ? ball0 : ball0 + Math.max(0, 6.5 * t - 1.1 * t * t);
  const by = 0.11 + (f >= kickF ? Math.abs(Math.sin(t * 5)) * 0.35 * Math.exp(-t * 1.6) : 0);
  const roll = -(bz - ball0) / 0.11;
  return (
    <>
      <Rig3 hero={hero} f={f} />
      <fog attach="fog" args={["#d8b8b0", 25, 170]} />
      <Sky />
      {[[-60, 70, -220, 18], [30, 85, -260, 22], [110, 60, -200, 14], [-140, 90, -300, 26], [60, 110, -150, 12]].map(([x, y, z, s], i) => <Cloud key={i} p={[x, y, z]} s={s} />)}
      <hemisphereLight args={["#b8b0e0", "#6a7a4a", 0.6]} />
      <ambientLight intensity={0.15} color="#ffe0d0" />
      <Sun hero={hero} />
      <Street />
      <Hero pos={hero} legL={legL} legR={legR} armL={armL} armR={armR} bob={bob} lean={6} f={f} />
      <group position={[1.37, by, bz]} rotation={[-roll, 0, 0]}>
        <mesh castShadow><icosahedronGeometry args={[0.11, 1]} /><Mat c="#f4f4f0" /></mesh>
        {[[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]].map((n, i) => (
          <mesh key={i} position={[n[0] * 0.104, n[1] * 0.104, n[2] * 0.104]} rotation={[n[1] ? Math.PI / 2 : 0, n[0] ? Math.PI / 2 : 0, 0]}><circleGeometry args={[0.035, 5]} /><meshStandardMaterial color="#141418" side={THREE.DoubleSide} /></mesh>
        ))}
      </group>
    </>
  );
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const LowPoly: React.FC = () => {
  const { width, height } = useVideoConfig();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2a2030" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.1, far: 1000 }}>
        <Scene />
      </ThreeCanvas>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Audio src={staticFile("lowpoly/sound.wav")} />
    </AbsoluteFill>
  );
};
export const _B = BODY;
