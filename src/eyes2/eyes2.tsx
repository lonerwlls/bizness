// «What if everyone lost their eyes» — часть 2/6: THE FIRST HOURS. 60 сек, low-poly 3D, рассказ на «ты».
// Майя (слепая с рождения) учит героя: трость, шаги, солнце, радио. В конце отключается электричество.
import { Canvas3D, Stage } from "../lowpoly/wide";
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Grain, MONT, RED, WH, YEL, ip } from "../characters/kit";
import { ChapterCard, Counter, GREEN, Tag } from "../characters/hud";
import {
  Cane, CamRig, Dog3D, Fridge, Human, Leash, MASCOT3D, MAYA3D, MOODS, NPCS, Pose3D, Radio3D, Room, SIT, STAND3D, Street, V3, WALK_Y, World,
  collarWorld, handWorld, lerp, rnd, walkPose,
} from "../lowpoly/kit3d";

export const EYES2_FRAMES = 1800;
const SC = 180;
const HOME = MASCOT3D, HOME_IN = { ...MASCOT3D, pack: null };
// дом героя на улице (№4)
const HI = 4, HZ = 44 - HI * 13, HX = 11 + rnd(HI + 3) * 1.5, HW = 5.5 + rnd(HI) * 1.5;
const DOOR: V3 = [HX - 3.05, 0.03, HZ - HW * 0.18];
const v = (p: V3) => new THREE.Vector3(...p);
const caneTip = (p: V3, rotY: number, g: number, k = 1): THREE.Vector3 => {
  const fwd = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY)), side = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY));
  return v(p).add(fwd.multiplyScalar(0.75)).add(side.multiplyScalar(Math.sin(g / 7) * 0.32 * k)).setY(p[1] + 0.01);
};
const CANE_ARM: [number, number] = [32, 44];

// ---------- 1. Майя у двери ----------
const S1: React.FC<{ g: number }> = ({ g }) => {
  const walkT = ip(g, [0, 100], [0, 1]);
  const mx = lerp(1.6, DOOR[0] - 0.9, walkT), mz = DOOR[2];
  const rot = Math.PI / 2;
  const walking = g < 100;
  const knock = g >= 105 && g < 145;
  const mp: Pose3D = walking ? { ...walkPose(walkT * (DOOR[0] - 2.5), 0.8, 0.06), armR: CANE_ARM } : { ...STAND3D, armR: CANE_ARM, armL: knock ? [100 + Math.abs(Math.sin(g / 2.5)) * 12, 120] : [6, 12] };
  const mPos: V3 = [mx, 0.03, mz];
  const open = ip(g, [150, 165], [0, 1]);
  return (
    <Canvas3D>
      <CamRig pos={[mx - 2.6, 1.5, mz + 3.4]} look={[mx + 0.6, 1.0, mz]} fov={44} />
      <World m={MOODS.day} focus={[mx, 0, mz]} />
      <Street />
      {/* дверь открывается */}
      <group position={[DOOR[0] - 0.02, 1.13, DOOR[2] + 0.45]} rotation={[0, -open * 1.4, 0]}>
        <mesh position={[0, 0, -0.45]}><boxGeometry args={[0.07, 1.8, 0.9]} /><meshStandardMaterial color="#4a3a2a" flatShading /></mesh>
      </group>
      {open > 0.5 ? <Human p={[DOOR[0] + 0.4, 0.17, DOOR[2]]} rotY={-Math.PI / 2} look={HOME_IN} pose={STAND3D} eyes={0} f={g} /> : null}
      <Human p={mPos} rotY={rot} look={MAYA3D} pose={mp} glasses f={g} mouth="smile" />
      <Cane hand={handWorld(mPos, rot, mp, 1)} tip={caneTip(mPos, rot, g, walking ? 1 : 0)} />
    </Canvas3D>
  );
};

// ---------- 2. Трость в руку ----------
const S2: React.FC<{ g: number }> = ({ g }) => {
  const give = ip(g, [50, 90], [0, 1]);
  const mPos: V3 = [0.6, 0, -0.6], hPos: V3 = [-0.4, 0, -0.9];
  const mRot = -2.2, hRot = 1.0;
  const mp: Pose3D = { ...STAND3D, armR: give < 1 ? [lerp(32, 70, give), lerp(44, 80, give)] : [6, 12], armL: [6, 12] };
  const hp: Pose3D = { ...STAND3D, armR: give > 0.6 ? [lerp(70, 34, ip(g, [95, 130], [0, 1])), lerp(80, 46, ip(g, [95, 130], [0, 1]))] : [6, 12], headYaw: -10 };
  const holder = g < 92 ? 0 : 1;
  const hand = holder === 0 ? handWorld(mPos, mRot, mp, 1) : handWorld(hPos, hRot, hp, 1);
  const tip = holder === 0 ? hand.clone().add(new THREE.Vector3(-0.05, -0.9, 0.25)) : caneTip(hPos, hRot, g, ip(g, [130, 160], [0, 0.6])).setY(0.01);
  return (
    <Canvas3D>
      <CamRig pos={[2.0, 1.55, 2.1]} look={[-0.1, 0.95, -0.8]} fov={44} />
      <hemisphereLight args={["#f0e4d8", "#6a5040", 0.9]} />
      <directionalLight position={[2, 4, -4]} intensity={1.6} color="#ffe2c0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#d8c4b0"]} />
      <Room />
      <Human p={mPos} rotY={mRot} look={MAYA3D} pose={mp} glasses f={g} mouth="smile" />
      <Human p={hPos} rotY={hRot} look={HOME_IN} pose={hp} eyes={0} f={g} mouth={give > 0.5 ? "o" : "flat"} />
      <Cane hand={hand} tip={tip} />
      <Dog3D p={[-0.9, 0, 0.3]} rotY={2.4} f={g} sit wag={0.8} headTilt={15} />
    </Canvas3D>
  );
};

// ---------- 3. Урок на улице: трость ----------
const S3: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.022;
  const hz = -2 + dist;
  const hPos: V3 = [1.0, WALK_Y, hz], mPos: V3 = [1.85, WALK_Y, hz - 0.3];
  const hp: Pose3D = { ...walkPose(dist, 0.6, 0.05), armR: CANE_ARM, armL: [26, 34], headPitch: 8 };
  const mp: Pose3D = { ...walkPose(dist + 0.2, 0.7, 0.05), armR: CANE_ARM };
  const dPos: V3 = [0.75, WALK_Y, hz + 1.0];
  return (
    <Canvas3D>
      <CamRig pos={[-2.6, 1.35, hz + 3.0]} look={[1.2, 0.7, hz]} fov={42} />
      <World m={MOODS.day} focus={[1.2, 0, hz]} />
      <Street />
      <Human p={hPos} pose={hp} eyes={0} f={g} />
      <Cane hand={handWorld(hPos, 0, hp, 1)} tip={caneTip(hPos, 0, g)} />
      <Human p={mPos} look={MAYA3D} pose={mp} glasses f={g + 20} mouth="smile" />
      <Cane hand={handWorld(mPos, 0, mp, 1)} tip={caneTip(mPos, 0, g + 11, 0.7)} />
      <Dog3D p={dPos} f={g} walk={g * 0.15} wag={0.7} />
      <Leash a={handWorld(hPos, 0, hp, -1)} b={collarWorld(dPos, 0)} sag={0.1} />
    </Canvas3D>
  );
};

// ---------- 4. Инфографика: 43 миллиона ----------
const S4: React.FC<{ g: number }> = ({ g }) => {
  const n = Math.floor(43_000_000 * ip(g, [5, 60], [0, 1], Easing.out(Easing.cubic)));
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <svg width={1080} height={1920}>
        <g transform="translate(540 820)">
          <circle r={330} fill="#16223e" stroke="#2a3a6a" strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => <ellipse key={i} rx={330 * Math.cos((i - 3) * 0.42)} ry={330} fill="none" stroke="#22305a" strokeWidth={2} />)}
          {Array.from({ length: 140 }, (_, i) => {
            const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 9)) * 300;
            const teacher = i % 9 === 0;
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={teacher ? 9 : 4} fill={teacher && g > 70 ? GREEN : RED} opacity={teacher && g > 70 ? 1 : 0.5} />;
          })}
          {g > 75 ? Array.from({ length: 16 }, (_, i) => {
            const a = rnd(i * 9) * Math.PI * 2, r = Math.sqrt(rnd(i * 9 + 9)) * 300;
            const t = ((g - 75) / 30 + i / 16) % 1;
            return <circle key={"r" + i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={9 + t * 50} fill="none" stroke={GREEN} strokeWidth={3} opacity={1 - t} />;
          }) : null}
        </g>
      </svg>
      <div style={{ position: "absolute", top: 1220, left: 0, right: 0, textAlign: "center", color: WH, fontFamily: MONT, fontWeight: 900 }}>
        <div style={{ fontSize: 96, color: GREEN }}>{n.toLocaleString("en-US")}</div>
        <div style={{ fontSize: 34, letterSpacing: 5, marginTop: 6 }}>WERE ALREADY BLIND</div>
        <div style={{ marginTop: 40, opacity: ip(g, [80, 90], [0, 1]) }}>
          <span style={{ fontSize: 36, color: YEL, border: `3px solid ${YEL}`, borderRadius: 12, padding: "8px 22px", background: "rgba(60,45,10,0.8)" }}>NOW THEY ARE THE TEACHERS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Считаем шаги ----------
const S5: React.FC<{ g: number }> = ({ g }) => {
  const stopG = 140;
  const dist = Math.min(g, stopG) * 0.03;
  const hz = 20 - dist;
  const rot = Math.PI;
  const hPos: V3 = [1.0, WALK_Y, hz];
  const hp: Pose3D = g < stopG ? { ...walkPose(dist, 0.62, 0.05), armR: CANE_ARM } : { ...STAND3D, armR: CANE_ARM };
  const step = 30 + Math.floor((Math.min(g, stopG) * 0.03) / 0.31);
  const pop = ((Math.min(g, stopG) * 0.03) % 0.31) / 0.31;
  return (
    <>
      <Canvas3D>
        <CamRig pos={[-1.6, 1.05, hz - 2.2]} look={[1.0, 0.6, hz + 0.8]} fov={44} />
        <World m={MOODS.day} focus={[1, 0, hz]} />
        <Street />
        <Human p={hPos} rotY={rot} pose={hp} eyes={0} f={g} mouth={g >= stopG ? "smile" : "flat"} />
        <Cane hand={handWorld(hPos, rot, hp, 1)} tip={caneTip(hPos, rot, g, g < stopG ? 1 : 0)} />
      </Canvas3D>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontFamily: MONT, fontWeight: 900, color: g >= stopG ? GREEN : WH, fontSize: 150, transform: `scale(${1 + (1 - pop) * 0.25 * (g < stopG ? 1 : 0)})`, textShadow: "0 8px 0 rgba(0,0,0,.35)" }}>
        {Math.min(step, 42)}
        <div style={{ fontSize: 34, letterSpacing: 6, color: "#e8e4dc" }}>{g >= stopG ? "THE CORNER. EVERY TIME." : "STEPS"}</div>
      </div>
    </>
  );
};

// ---------- 6. Солнце на лице ----------
const S6: React.FC<{ g: number }> = ({ g }) => {
  const turn = ip(g, [30, 90], [0, 1], Easing.inOut(Easing.quad));
  const hPos: V3 = [1.0, WALK_Y, 0];
  const hp: Pose3D = { ...STAND3D, armR: CANE_ARM, headYaw: lerp(-35, 25, turn), headPitch: lerp(5, -12, turn) };
  return (
    <>
      <Canvas3D>
        <CamRig pos={[1.0 - 0.25, 1.58, 1.5]} look={[1.0, 1.45, 0]} fov={36} />
        <World m={{ ...MOODS.sunset, sunDir: [9, 5, 22], sunI: 3.6 }} focus={[1, 0, 0]} />
        <Street />
        <Human p={hPos} pose={hp} eyes={0} f={g} mouth={turn > 0.7 ? "smile" : "flat"} />
        <Cane hand={handWorld(hPos, 0, hp, 1)} tip={caneTip(hPos, 0, g, 0)} />
      </Canvas3D>
      <div style={{ position: "absolute", top: 300, right: 60, display: "flex", justifyContent: "center", opacity: ip(g, [90, 105], [0, 1]) }}>
        <svg width={260} height={260} viewBox="-130 -130 260 260">
          <circle r={110} fill="rgba(10,10,20,.7)" stroke={YEL} strokeWidth={4} />
          {["N", "E", "S", "W"].map((t, i) => <text key={t} x={Math.sin(i * Math.PI / 2) * 82} y={-Math.cos(i * Math.PI / 2) * 82 + 12} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill={t === "W" ? YEL : WH}>{t}</text>)}
          <g transform={`rotate(${-90 + Math.sin(g / 12) * 4})`}><path d="M 0 -60 L 14 0 L 0 10 L -14 0 Z" fill={YEL} /></g>
        </svg>
      </div>
    </>
  );
};

// ---------- 7. Радио ----------
const S7: React.FC<{ g: number }> = ({ g }) => {
  const cam = ip(g, [0, 180], [0, 1]);
  const hp: Pose3D = { ...SIT, headYaw: 25, headPitch: 6, armL: [20, 70], armR: [20, 70] };
  const mp: Pose3D = { ...SIT, headYaw: -20, armR: [28, 46] };
  return (
    <Canvas3D>
      <CamRig pos={[1.3 - cam * 0.4, 1.2, 1.3 - cam * 0.3]} look={[-0.6, 0.7, -1.4]} fov={44} />
      <hemisphereLight args={["#f0e4d8", "#6a5040", 0.85]} />
      <directionalLight position={[2, 4, -4]} intensity={1.4} color="#ffd8b0" castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#d8c4b0"]} />
      <Room />
      <Radio3D p={[-0.2, 0.55, -0.35]} f={g} />
      <Human p={[-1.7, 0, -1.78]} look={HOME_IN} pose={hp} eyes={0} f={g} mouth="o" />
      <Human p={[-0.7, 0, -1.78]} look={MAYA3D} pose={mp} glasses f={g + 9} mouth="smile" />
      <Dog3D p={[0.6, 0, -1.2]} rotY={-1.9} f={g} sit wag={0.4} headTilt={g % 60 < 30 ? 18 : -10} />
    </Canvas3D>
  );
};

// ---------- 8. Вся улица идёт вместе ----------
const S8: React.FC<{ g: number }> = ({ g }) => {
  const dist = g * 0.02;
  const lead = -6 + dist;
  const people = [MAYA3D, HOME, NPCS[0], NPCS[1], NPCS[3], NPCS[2], NPCS[4]];
  return (
    <Canvas3D>
      <CamRig pos={[-3.2, 1.9, lead + 2.8]} look={[1.25, 0.8, lead - 1.1]} fov={50} />
      <World m={MOODS.sunset} focus={[1.2, 0, lead - 2]} />
      <Street />
      {people.map((look, i) => {
        const z = lead - i * 0.5, p: V3 = [1.25, WALK_Y, z];
        // рука на плече впереди идущего: люди идут в ногу, на расстоянии вытянутой руки
        const pose: Pose3D = { ...walkPose(dist, 0.62, 0.05), armL: i > 0 ? [80, 70] : [6, 12], armR: i <= 1 ? CANE_ARM : [6, 14], headPitch: 5, spread: [0.02, 0.12] };
        return (
          <React.Fragment key={i}>
            <Human p={p} look={look} pose={pose} glasses={i === 0} eyes={0} f={g + i * 9} mouth={i === 0 || i === 1 ? "smile" : "flat"} />
            {i <= 1 ? <Cane hand={handWorld(p, 0, pose, 1)} tip={caneTip(p, 0, g + i * 5, 0.7)} /> : null}
          </React.Fragment>
        );
      })}
      <Dog3D p={[0.65, WALK_Y, lead - 0.4]} f={g} walk={g * 0.13} wag={0.6} />
    </Canvas3D>
  );
};

// ---------- 9. Ночь, которую никто не замечает ----------
const S9: React.FC<{ g: number }> = ({ g }) => {
  const bx = DOOR[0] - 2.0, bz = DOOR[2] + 1.6;
  return (
    <Canvas3D>
      <CamRig pos={[bx - 3.2, 1.4, bz + 2.6]} look={[bx + 0.4, 0.8, bz - 0.4]} fov={44} />
      <World m={MOODS.night} focus={[bx, 0, bz]} stars />
      <Street lit lamps />
      <group position={[bx, 0, bz]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 1.8]} /><meshStandardMaterial color="#8a5a3a" flatShading /></mesh>
        {[-0.8, 0.8].map((z) => <mesh key={z} position={[0, 0.2, z]}><boxGeometry args={[0.45, 0.4, 0.06]} /><meshStandardMaterial color="#5a3a24" flatShading /></mesh>)}
      </group>
      <Human p={[bx, 0.03 - 0.02, bz - 0.4]} rotY={-Math.PI / 2} look={HOME} pose={{ ...SIT, headPitch: -15, armR: [20, 60] }} eyes={0} f={g} mouth="smile" />
      <Human p={[bx, 0.03 - 0.02, bz + 0.45]} rotY={-Math.PI / 2} look={MAYA3D} pose={{ ...SIT, headPitch: -20, headYaw: -15, armR: [20, 60] }} glasses f={g + 9} mouth="smile" />
      <Dog3D p={[bx - 0.8, 0.03, bz]} rotY={-1.6} f={g} sit wag={0.2} />
    </Canvas3D>
  );
};

// ---------- 10. Свет гаснет ----------
const S10: React.FC<{ g: number }> = ({ g }) => {
  const on = g < 75;
  const flick = g >= 66 && g < 75 && Math.floor(g / 2) % 2 === 0;
  const lit = on && !flick;
  return (
    <Canvas3D>
      <CamRig pos={[1.2, 1.25, 1.2]} look={[-0.8, 0.75, -1.6]} fov={46} />
      <hemisphereLight args={[lit ? "#806a5a" : "#4a5a9a", "#1a1420", lit ? 0.5 : 0.6]} />
      <directionalLight position={[2, 3, -4]} intensity={lit ? 0.3 : 1.3} color={lit ? "#ffd8b0" : "#8aa0e0"} castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#141420"]} />
      <Room night={lit} dark={lit ? 0 : 1} />
      <Fridge p={[2.6, 0, -2.4]} on={lit} />
      <Human p={[-1.2, 0, -1.78]} look={HOME_IN} pose={{ ...SIT, headYaw: g > 80 ? 35 : 0, headPitch: g > 80 ? -10 : 5 }} eyes={0} f={g} mouth={g > 85 ? "o" : "flat"} />
      <Dog3D p={[0.3, 0, -1.4]} rotY={-1.9} f={g} sit={g < 80} wag={g > 80 ? 0.1 : 0.3} headTilt={g > 80 ? 25 : 0} />
    </Canvas3D>
  );
};

// ---------- HUD ----------
const CLOCK: [number, number][] = [[12, 20], [12, 35], [13, 10], [13, 40], [14, 30], [16, 5], [17, 0], [19, 40], [21, 15], [23, 58]];
const TAGS: [string, string][] = [["MAYA · BLIND SINCE BIRTH", YEL], ["LESSON 1: THE CANE", GREEN], ["SWEEP · TAP · STEP", GREEN], ["THE EXPERTS", GREEN], ["COUNT YOUR STEPS", YEL], ["THE SUN IS YOUR COMPASS", YEL], ["RADIO IS KING", YEL], ["THE STREET WALKS TOGETHER", GREEN], ["NIGHT · NOBODY NOTICES", YEL], ["POWER FAILING", RED]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  const [h, m] = CLOCK[i];
  const sec = Math.floor(local / 30);
  const text = `DAY 1 · ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return (
    <>
      <Counter f={f} text={text} alarm={i === 9 && local > 66} />
      <Tag local={i === 0 ? local - 30 : local} text={TAGS[i][0]} col={TAGS[i][1]} />
    </>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => <S g={useCurrentFrame()} />;

export const Eyes2: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Stage>{scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}</Stage>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(20,10,20,0.55)", pointerEvents: "none" }} />
      <Grain f={f} o={0.08} />
      <Hud f={f} />
      <ChapterCard local={f} n="2" title="THE FIRST HOURS" dur={34} />
      <Audio src={staticFile("eyes2/sound.wav")} />
    </AbsoluteFill>
  );
};
