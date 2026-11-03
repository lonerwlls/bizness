// Проверка своих 3D-моделей (замена Kenney): npx remotion still src/kittest/index.tsx KitTest out/kit.png --gl=swangle
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Composition, registerRoot, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { makeKit } from "../../.claude/skills/cartoon-3d-short/templates/bridge/kitgen";

const NAMES: [string, number][] = [["windmill", 0], ["stall-red", 0], ["stall-green", 0], ["cart", 0], ["lantern", 0], ["stall-bench", 0], ["canoe", 0], ["lily_large", 0], ["flower_redA", 0], ["flower_yellowA", 0], ["flower_purpleA", 0], ["grass_large", 0], ["banner-red", 0]];
const Scene: React.FC = () => {
  const kit = useMemo(() => makeKit(), []);
  const cam = useThree((st) => st.camera); cam.position.set(1, 7, 17); cam.lookAt(0, 3, -6); cam.updateProjectionMatrix();
  const pos: [number, number, number][] = [[-9, 0, -14], [-3.2, 0, -3], [0, 0, -3], [3.2, 0, -2.5], [5.2, 0, -2], [-2.5, 0, 1.5], [0, 0, 2], [2.2, 0, 2.6], [-1.2, 0, 3.6], [-0.7, 0, 3.8], [-0.2, 0, 3.9], [0.6, 0, 3.8], [6.5, 0, -6]];
  return (
    <>
      <color attach="background" args={["#9cc4ee"]} />
      <hemisphereLight args={["#cfe0ff", "#8a7050", 0.9]} />
      <directionalLight position={[-6, 10, 8]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#7ab24e" /></mesh>
      {NAMES.map(([n], i) => <primitive key={n} object={kit[n]} position={pos[i]} rotation={[0, n === "canoe" ? 1.2 : 0, 0]} />)}
    </>
  );
};
const KitTest: React.FC = () => (
  <AbsoluteFill>
    <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: 62 }}>
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);
registerRoot(() => <Composition id="KitTest" component={KitTest} durationInFrames={1} fps={30} width={1080} height={1920} />);
