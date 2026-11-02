// «What if everyone lost their eyes» — часть 1/6: THE MOMENT. 60 сек, low-poly 3D, рассказ на «ты».
// Надписи: счётчик сверху + плашки (без субтитров). Озвучку пользователь пишет сам: текст в public/eyes1/voiceover.txt
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import { CamRig, Car3D, Dog3D, Human, KNEEL, Limb, MASCOT3D, MOODS, NPCS, Pose3D, Room, SIT, STAND3D, Street, V3, WALK_Y, World, crouch, lerp, rnd, walkPose } from "../lowpoly/kit3d";

export const EYES1_FRAMES = 1800;
const SC = 180;
const M = MOODS.morning;

const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
};
const STOP_Z = -6 + 45 * 0.042; // где герой замер
const HERO_X = 1.3;
const grope = (g: number): Pose3D => ({ ...STAND3D, armL: [70 + Math.sin(g / 7) * 8, 85], armR: [75 + Math.sin(g / 7 + 1) * 8, 90], lean: -4, headYaw: Math.sin(g / 18) * 35, spread: [0.05, 0.05] });

// ---------- 1. 08:00 ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const stop = 45;
  const dist = Math.min(g, stop) * 0.042;
  const hz = -6 + dist;
  const pose: Pose3D = g < stop ? walkPose(dist) : g < 55 ? { ...STAND3D, lean: -6, armL: [20, 30], armR: [20, 30] } : grope(g);
  const push = ip(g, [stop, 180], [0, 1], Easing.inOut(Easing.cubic));
  const hoseDrop = g >= 62;
  const water = g < stop + 3;
  return (
    <Canvas3D>
      <CamRig pos={[HERO_X - 3.4 + push * 1.6, 1.9 - push * 0.35, hz + 6.2 - push * 3.4]} look={[HERO_X + 0.4 * (1 - push), 0.9 + push * 0.4, hz - 2.5 * (1 - push)]} fov={42 - push * 6} />
      <World m={M} focus={[HERO_X, 0, hz]} />
      <Street />
      <Human p={[HERO_X, WALK_Y, hz]} pose={pose} eyes={g < stop ? 1 : 0} f={g} />
      {/* сосед поливает газон */}
      <Human p={[5.2, 0.03, hz - 3]} rotY={-Math.PI / 2 - 0.3} look={NPCS[0]} eyes={g < stop ? 1 : 0} f={g + 30} pose={hoseDrop ? { ...grope(g + 40), headYaw: 0 } : { ...STAND3D, armR: [60, 70], armL: [55, 75] }} />
      {!hoseDrop ? <mesh position={[4.75, 0.9, hz - 2.85]} rotation={[0.4, 0, 1.3]}><cylinderGeometry args={[0.02, 0.02, 0.4, 6]} /><meshStandardMaterial color="#3a8a4a" /></mesh> : <mesh position={[4.9, 0.05, hz - 2.6]} rotation={[0, 0.6, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.5, 6]} /><meshStandardMaterial color="#3a8a4a" /></mesh>}
      {Array.from({ length: 14 }, (_, i) => {
        const t = ((g * 0.06 + i / 14) % 1);
        if (!water && !hoseDrop) return null;
        const x0 = hoseDrop ? 4.9 : 4.6, y0 = hoseDrop ? 0.06 : 0.95;
        return <mesh key={i} position={[x0 - (hoseDrop ? 0.3 : 1.2) * t, Math.max(0.03, y0 + (hoseDrop ? 0 : 0.6 * t - 1.5 * t * t)), hz - 2.85 + (hoseDrop ? t * 0.2 : 0)]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial color="#9cd0f0" /></mesh>;
      })}
    </Canvas3D>
  );
};

// ---------- 2. Все одновременно ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const carT = ip(g, [0, 110], [0, 1], Easing.out(Easing.quad));
  const carZ = lerp(-16, 2.9, carT), carX = lerp(-2.6, -0.35, ip(g, [40, 110], [0, 1]));
  const hit = g >= 110;
  const shake = hit && g < 118 ? (rnd(g) - 0.5) * 0.08 : 0;
  const jz = lerp(9, 7.4, ip(g, [0, 18], [0, 1]));
  const jogSit = ip(g, [80, 110], [0, 1]);
  const jog: Pose3D = g < 18 ? walkPose(g * 0.11, 1.4, 0.16, 0.8, 90) : jogSit > 0 ? (jogSit < 1 ? crouch(lerp(0.8, 0.4, jogSit)) : { ...crouch(0.4), armL: [40, 120], armR: [40, 120], headPitch: 30 }) : grope(g + 20);
  return (
    <Canvas3D>
      <CamRig pos={[-6.5, 3.6, 13]} look={[0.5, 0.6, 0]} fov={40} />
      <World m={M} focus={[0, 0, 2]} />
      <Street />
      <Car3D p={[carX + shake, 0, carZ]} rotY={ip(g, [40, 110], [0, 0.25])} c="#5a8ad0" hazard={hit} f={g} wheel={-carZ * 3} />
      <Human p={[HERO_X, WALK_Y, STOP_Z]} pose={grope(g + 180)} eyes={0} f={g + 180} />
      <Human p={[1.6, WALK_Y, jz]} rotY={Math.PI} look={NPCS[3]} eyes={0} f={g} pose={jog} />
      <Human p={[5.2, 0.03, STOP_Z - 3]} rotY={-Math.PI / 2} look={NPCS[0]} eyes={0} f={g + 30} pose={grope(g + 99)} />
      <Human p={[6.2, 0.03, 10]} rotY={-2.2} look={NPCS[1]} eyes={0} f={g + 7} pose={{ ...grope(g + 50), lean: -10 }} />
    </Canvas3D>
  );
};

// ---------- 3. Нет глаз ----------
const S3: React.FC<{ g: number }> = ({ g }) => {
  const touch = ip(g, [10, 35], [0, 1]);
  const kneel = ip(g, [95, 140], [0, 1], Easing.inOut(Easing.quad));
  const hands: Limb = [lerp(20, 85, touch), lerp(30, 165, touch)];
  const base: Pose3D = kneel > 0 ? { ...KNEEL, hip: lerp(0.82, KNEEL.hip!, kneel), legL: [lerp(0, 80, kneel), lerp(0, 0, kneel)], legR: [lerp(0, 15, kneel), lerp(0, -90, kneel)] } : STAND3D;
  const pose: Pose3D = { ...base, armL: hands, armR: hands, spread: [-0.3 * touch, -0.3 * touch], headPitch: 4 + kneel * 10, headYaw: Math.sin(g / 5) * 6 * touch, lean: 4 + kneel * 8 };
  const hy = lerp(1.45, 1.05, kneel);
  return (
    <Canvas3D>
      <CamRig pos={[HERO_X - 0.35, hy - 0.05, STOP_Z + 2.0]} look={[HERO_X, hy, STOP_Z]} fov={34} shake={0.01} f={g} />
      <World m={M} focus={[HERO_X, 0, STOP_Z]} />
      <Street />
      <Human p={[HERO_X, WALK_Y, STOP_Z]} pose={pose} eyes={0} f={g} mouth="o" />
    </Canvas3D>
  );
};

// ---------- 4. Только звук (взгляд героя: темнота) ----------
const S4: React.FC<{ g: number }> = ({ g }) => {
  const src: [number, number, number, string, number][] = [
    [180, 700, 0, "#ffb030", 18], [880, 900, 10, RED, 26], [300, 1300, 25, WH, 34], [760, 520, 40, WH, 30],
  ];
  const dog: [number, number] = [lerp(980, 640, ip(g, [60, 170], [0, 1])), lerp(1150, 1020, ip(g, [60, 170], [0, 1]))];
  return (
    <AbsoluteFill style={{ background: "#030306" }}>
      <svg width={1080} height={1920}>
        {src.map(([x, y, d, c, per], i) => [0, 1, 2].map((k) => {
          const t = ((g - d + k * per / 3) % per) / per;
          if (g < d) return null;
          return <circle key={`${i}${k}`} cx={x} cy={y} r={20 + t * 200} fill="none" stroke={c} strokeWidth={4} opacity={(1 - t) * 0.6} />;
        }))}
        {g >= 60 ? [0, 1, 2, 3].map((k) => {
          const t = ((g + k * 6) % 24) / 24;
          return <circle key={"d" + k} cx={dog[0]} cy={dog[1]} r={30 + t * 280} fill="none" stroke={YEL} strokeWidth={7} opacity={(1 - t) * 0.9} />;
        }) : null}
        {g >= 60 ? <circle cx={dog[0]} cy={dog[1]} r={14} fill={YEL} /> : null}
      </svg>
      <div style={{ position: "absolute", top: 1550, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: "#6a6a7a", opacity: ip(g, [10, 30], [0, 1]) }}>WHAT YOU “SEE” NOW</div>
    </AbsoluteFill>
  );
};

// ---------- 5. Пёс ----------
const S5: React.FC<{ g: number }> = ({ g }) => {
  const run = ip(g, [0, 60], [0, 1], Easing.out(Easing.quad));
  const dz = lerp(STOP_Z - 6, STOP_Z + 0.55, run), dx = lerp(5.5, HERO_X + 0.45, run);
  const sit = g >= 62;
  const stand = ip(g, [120, 160], [0, 1], Easing.inOut(Easing.quad));
  const pet = g >= 70 && g < 120;
  const base: Pose3D = stand > 0 ? { ...KNEEL, hip: lerp(KNEEL.hip!, 0.82, stand), legL: [lerp(80, 0, stand), 0], legR: [lerp(15, 0, stand), lerp(-90, 0, stand)], lean: lerp(14, 4, stand) } : { ...KNEEL, lean: 14 };
  const pose: Pose3D = { ...base, armR: pet ? [55 + Math.sin(g / 3) * 6, 70] : stand > 0.5 ? [28, 32] : [20, 40], armL: [15, 25], headYaw: 30, headPitch: 15 };
  return (
    <Canvas3D>
      <CamRig pos={[HERO_X - 2.6, 1.3, STOP_Z + 3.4]} look={[HERO_X + 0.3, 0.6, STOP_Z]} fov={40} />
      <World m={M} focus={[HERO_X, 0, STOP_Z]} />
      <Street />
      <Human p={[HERO_X, WALK_Y, STOP_Z]} rotY={0.5} pose={pose} eyes={0} f={g} />
      <Dog3D p={[dx, sit ? WALK_Y : (dx > 2.4 ? 0.03 : WALK_Y), dz]} rotY={sit ? -2.2 : Math.atan2(HERO_X - 5.5, 6.55)} f={g} walk={sit ? 0 : g * 0.25} sit={sit} wag={1} bark={g < 60 ? Math.max(0, Math.sin(g / 4)) : 0} headTilt={sit ? 15 : 0} />
    </Canvas3D>
  );
};

// ---------- 6. Инфографика: 8 миллиардов ----------
const S6: React.FC<{ g: number }> = ({ g }) => {
  const n = Math.floor(8_000_000_000 * ip(g, [5, 70], [0, 1], Easing.out(Easing.cubic)));
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <g transform="translate(540 820)">
          <circle r={330} fill="#16223e" stroke="#2a3a6a" strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => <ellipse key={i} rx={330 * Math.cos((i - 3) * 0.42)} ry={330} fill="none" stroke="#22305a" strokeWidth={2} />)}
          {Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1={-330} y1={(i - 3) * 94} x2={330} y2={(i - 3) * 94} stroke="#22305a" strokeWidth={2} />)}
          {Array.from({ length: 140 }, (_, i) => {
            const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 9)) * 300;
            const on = g > 8 + rnd(i + 3) * 60;
            return on ? <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={5} fill={RED} opacity={0.5 + 0.5 * Math.abs(Math.sin(g / 6 + i))} /> : null;
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", top: 1220, left: 0, right: 0, textAlign: "center", color: WH, fontFamily: MONT, fontWeight: 900 }}>
        <div style={{ fontSize: 96, color: RED, letterSpacing: 2 }}>{n.toLocaleString("en-US")}</div>
        <div style={{ fontSize: 36, letterSpacing: 6, marginTop: 6 }}>PEOPLE · ZERO EYES</div>
        <div style={{ marginTop: 40, opacity: ip(g, [90, 100], [0, 1]) }}>
          <span style={{ fontSize: 34, color: GREEN, border: `3px solid ${GREEN}`, borderRadius: 12, padding: "8px 22px", background: "rgba(10,40,30,0.8)" }}>✓ ANIMALS CAN STILL SEE</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Город замер ----------
const S7: React.FC<{ g: number }> = ({ g }) => {
  const cam = ip(g, [0, 180], [0, 1]);
  return (
    <Canvas3D>
      <CamRig pos={[-10 + cam * 2, 7.5 - cam * 1.5, 16 - cam * 6]} look={[0.5, 0.4, -6]} fov={44} />
      <World m={M} focus={[0, 0, -2]} />
      <Street />
      <Car3D p={[-0.35, 0, 2.9]} rotY={0.25} c="#5a8ad0" hazard f={g} />
      <Car3D p={[-4.2, 0, -6]} rotY={-0.5} c="#e0524a" hazard f={g + 5} />
      <Car3D p={[-3.0, 0, -10.6]} rotY={0.35} c="#e8e0d0" hazard f={g + 9} />
      <Car3D p={[-5.5, 0, -22]} rotY={0.9} c="#4f9a6a" hazard f={g + 2} />
      {Array.from({ length: 10 }, (_, i) => {
        const t = ((g / 60 + i / 10) % 1);
        return <mesh key={i} position={[-18 + t * 3, 4 + t * 26, -60 - t * 4]} scale={1 + t * 4}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#5a5560" transparent opacity={0.7 * (1 - t)} flatShading /></mesh>;
      })}
      <Human p={[0.6, WALK_Y, 5.5]} rotY={-1.2} look={NPCS[3]} eyes={0} f={g} pose={{ ...crouch(0.4), armL: [40, 120], armR: [40, 120], headPitch: 30 }} />
      <Human p={[HERO_X, WALK_Y, STOP_Z]} rotY={0.5} pose={{ ...STAND3D, armR: [28, 32] }} eyes={0} f={g} />
      <Dog3D p={[HERO_X + 0.45, WALK_Y, STOP_Z + 0.55]} rotY={-2.2} f={g} sit wag={0.6} />
      <Human p={[2.2, 0.03, -12]} rotY={0.4} look={NPCS[2]} eyes={0} f={g + 3} pose={walkPose(g * 0.012, 0.7, 0.05)} />
      <Human p={[5.6, 0.03, -2.5]} rotY={-1.6} look={NPCS[0]} eyes={0} f={g + 30} pose={grope(g + 99)} />
      <Human p={[1.8, WALK_Y, 9]} rotY={2.6} look={NPCS[4]} eyes={0} f={g + 13} pose={{ ...STAND3D, armL: [150, 170], armR: [150, 170], spread: [-0.2, -0.2], headPitch: -10 }} />
    </Canvas3D>
  );
};

// ---------- 8. Пёс ведёт домой ----------
const S8: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.026;
  const hz = STOP_Z + dist;
  const p = walkPose(dist, 0.7, 0.05);
  const pose: Pose3D = { ...p, armR: [32, 40], armL: [-10 + p.armL[0] * 0.3, 10], lean: 2, headPitch: 6 };
  return (
    <Canvas3D>
      <CamRig pos={[HERO_X - 3.6, 1.2, hz + 1.2]} look={[HERO_X, 0.75, hz + 0.6]} fov={40} />
      <World m={M} focus={[HERO_X, 0, hz]} />
      <Street />
      <Human p={[HERO_X, WALK_Y, hz]} pose={pose} eyes={0} f={g} />
      <Dog3D p={[HERO_X - 0.05, WALK_Y, hz + 0.55]} f={g} walk={g * 0.18} wag={0.7} />
    </Canvas3D>
  );
};

// ---------- 9–10. Дома: голос и звонок ----------
const Phone3D: React.FC<{ p: V3; glow: number; buzz: number; rot?: V3 }> = ({ p, glow, buzz, rot = [-Math.PI / 2, 0, 0.3] }) => (
  <group position={[p[0] + buzz * 0.01, p[1], p[2]]} rotation={rot}>
    <mesh castShadow><boxGeometry args={[0.08, 0.16, 0.012]} /><meshStandardMaterial color="#141418" /></mesh>
    <mesh position={[0, 0, 0.007]}><planeGeometry args={[0.07, 0.145]} /><meshStandardMaterial color="#9cc8ff" emissive="#7ab0ff" emissiveIntensity={glow * 2} /></mesh>
    {glow > 0.05 ? <pointLight intensity={glow * 1.5} distance={1.6} color="#9cc8ff" /> : null}
  </group>
);
const Home: React.FC<{ g: number; ring?: boolean }> = ({ g, ring }) => {
  const answer = ring && g >= 100;
  const glow = ring ? (answer ? 0.6 : 0.5 + 0.5 * Math.abs(Math.sin(g / 4))) : g > 40 ? 0.4 + 0.3 * Math.abs(Math.sin(g / 5)) : 0.1;
  const buzz = ring && !answer ? Math.sin(g * 3) : 0;
  const pose: Pose3D = { ...SIT, armR: answer ? [150, 230] : ring && g > 70 ? [60, 75] : [20, 70], armL: [20, 70], spread: answer ? [0.12, -0.25] : [0.12, 0.12], headYaw: ring ? (answer ? 10 : 25) : Math.sin(g / 20) * 10, headPitch: 8 };
  const cam = ip(g, [0, 180], [0, 1]);
  return (
    <Canvas3D>
      <CamRig pos={[0.9 - cam * 0.3, 1.25, 1.6 - cam * 0.4]} look={[-1.1, 0.75, -1.6]} fov={44} />
      <hemisphereLight args={["#f0e4d8", "#6a5040", 0.9]} />
      <directionalLight position={[2, 4, -4]} intensity={1.6} color="#ffe2c0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#d8c4b0"]} />
      <Room />
      <Human p={[-1.2, 0, -1.75]} look={{ ...MASCOT3D, pack: null }} pose={pose} eyes={0} f={g} handR={answer ? <Phone3D p={[0, -0.02, 0.03]} glow={0.6} buzz={0} rot={[0, 0, 0]} /> : null} />
      {!answer ? <Phone3D p={[-0.9, 0.44, -0.55]} glow={glow} buzz={buzz} /> : null}
      <Dog3D p={[0.35, 0, -1.55]} rotY={-1.75} f={g} sit wag={ring ? 0.8 : 0.3} headTilt={ring ? 20 : 0} />
    </Canvas3D>
  );
};

// ---------- HUD ----------
const CLOCK: [number, number, number][] = [[7, 59, 58], [8, 0, 6], [8, 1, 30], [8, 3, 10], [8, 7, 40], [8, 15, 0], [8, 42, 0], [9, 30, 0], [11, 5, 0], [12, 0, 0]];
const TAGS: [string, string][] = [["08:00 · IT HAPPENED", RED], ["EVERYONE ON EARTH", RED], ["NO EYES", RED], ["ONLY SOUND", YEL], ["DOGS CAN STILL SEE", GREEN], ["8 BILLION", RED], ["CITIES FROZE", RED], ["STEP BY STEP", GREEN], ["VOICE STILL WORKS", GREEN], ["INCOMING CALL", YEL]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  const [h, m, s0] = CLOCK[i];
  const sec = s0 + Math.floor(local / 30) + (i === 0 && local >= 45 ? 1 : 0);
  const hh = i === 0 && local >= 45 ? 8 : h, mm = i === 0 && local >= 45 ? 0 : m + Math.floor(sec / 60);
  const ss = i === 0 && local >= 45 ? Math.floor((local - 45) / 30) : sec % 60;
  const text = `DAY 1 · ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  const showTag = !(i === 0 && local < 46);
  return (
    <>
      <Counter f={f} text={text} alarm={f >= 45} />
      {showTag ? <Tag local={i === 0 ? local - 42 : local} text={TAGS[i][0]} col={TAGS[i][1]} /> : null}
    </>
  );
};
const CallCard: React.FC<{ g: number }> = ({ g }) => {
  const o = ip(g, [20, 30], [0, 1]);
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top: 1380, opacity: o, background: "rgba(14,18,30,0.9)", borderRadius: 28, padding: "26px 30px", border: "2px solid #3a4a6a", display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ width: 90, height: 90, borderRadius: 45, background: "#e8c44a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONT, fontWeight: 900, fontSize: 48, color: "#3a2a10" }}>M</div>
      <div style={{ fontFamily: MONT, color: WH }}>
        <div style={{ fontSize: 44, fontWeight: 900 }}>Maya</div>
        <div style={{ fontSize: 26, color: "#9cb0d0", fontWeight: 900 }}>{g < 100 ? "neighbor · calling…" : "connected 00:0" + Math.floor((g - 100) / 30)}</div>
      </div>
    </div>
  );
};

const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;
const HomeA: React.FC<{ g: number }> = ({ g }) => <Home g={g} />;
const HomeB: React.FC<{ g: number }> = ({ g }) => <><Home g={g} ring /><CallCard g={g} /></>;

export const Eyes1: React.FC = () => {
  const f = useCurrentFrame();
  const blink = ip(f, [44, 45, 49, 52], [0, 1, 1, 0]);
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, HomeA, HomeB];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
      <AbsoluteFill style={{ background: "#000", opacity: blink }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f - 180} n="1" title="THE MOMENT" dur={34} />
      <Audio src={staticFile("eyes1/sound.wav")} />
    </AbsoluteFill>
  );
};
export const _X = [HERO_X, SIT];
