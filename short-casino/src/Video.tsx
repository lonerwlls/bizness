// РОЛИК «Why casinos have no clocks»: шоты по таймингам голоса + голос + музыка + субтитры. Время — в секундах ГОЛОСА.
import React from "react";
import { continueRender, delayRender, AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import plan from "./plan.json";
import { FPS, Scene3D, Box, Doodle, Actor, useSec, HIP, HEAD_Z, REST_F, REST_B } from "./kit";
import { HERO, Look } from "./doodle";
import { Casino, Street, Bedroom, Glass, Phone } from "./props";

// шрифт локально: браузер рендера в облаке не скачивает Google Fonts
const fontFamily = "CasMont";
const fh = delayRender("font");
new FontFace(fontFamily, `url(${staticFile("fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load()
  .then((f) => { document.fonts.add(f); continueRender(fh); }).catch(() => continueRender(fh));
const WAITER: Look = { body: "#24242b", hair: "slick", tie: "#c0292f" };
type K = [number, number, number];
// «указать»: рука идёт от бедра прямо к цели, не через лицо
const pointKeys = (t: number, dx: number, dz: number, hold = 1.0, side: "f" | "b" = "f"): K[] => {
  const r = side === "f" ? REST_F : REST_B, sh = side === "f" ? -0.12 : 0.12, tgt: [number, number] = [sh + dx * 0.6, HIP + 0.25 + dz * 0.6];
  return [[t - 0.3, ...r], [t, ...tgt], [t + hold, ...tgt], [t + hold + 0.25, ...r]];
};
const up = (t0: number, t1: number, side: "f" | "b", x = 0.36, z = HEAD_Z + 0.12): K[] => {
  const r = side === "f" ? REST_F : REST_B, sx = side === "f" ? -x : x;
  return [[t0 - 0.2, ...r], [t0, sx, z], [t1, sx, z], [t1 + 0.25, ...r]];
};
const tim = (a: Partial<Actor> & { pos: Actor["pos"]; expr: Actor["expr"] }): Actor => ({ seed: 4, look: HERO, ...a });

// Пятно от снятых часов на стене казино.
const ClockGhost: React.FC = () => (<>
  <mesh position={[-0.1, 2.25, -1.985]}><circleGeometry args={[0.2, 40]} /><meshStandardMaterial color="#9a3442" /></mesh>
  <Box p={[-0.1, 2.47, -1.97]} s={[0.03, 0.03, 0.04]} c="#c9ccd1" metal={0.7} line={false} />
</>);

// ---------------------------------------------------------------- шоты
const S1 = () => (
  <Scene3D t0={0} light="night" bg="#1a0b10" cam={[[0, [0.5, 1.32, 1.9], [0, 1.25, -1], 74], [3.7, [0.15, 1.28, 1.6], [0, 1.25, -1], 74]]} focus={[0, 1.1, -0.4]}>
    <Casino /><ClockGhost />
    <Doodle a={tim({ pos: [0, 0, -0.4], expr: [[0, "realize"], [0.9, "nervous"], [2.1, "stern"], [2.9, "smug"]],
      handF: pointKeys(1.2, -0.5, 1.3, 0.9, "f"), lean: [[0, 0, 0], [0.9, -0.08, 0], [1.9, 0.06, 0], [2.6, 0, 0]] })} />
  </Scene3D>);

const Bill: React.FC = () => { const s = useSec(); return s > 6.6 && s < 7.95 ? <Box p={[0.23, 0.95, -0.5]} s={[0.2, 0.1, 0.01]} c="#7fc47a" /> : null; };
const S2 = () => (
  <Scene3D t0={3.7} light="day" bg="#ff9a6b" cam={[[3.7, [0.5, 1.3, 2.0], [-0.65, 1.35, -1.2], 76], [10.2, [0.2, 1.25, 1.7], [-0.65, 1.35, -1.2], 76]]} focus={[-0.15, 1.1, -0.6]}>
    <Street mode="evening" busBonk={9.3} /><Bill />
    <Doodle a={tim({ pos: [-0.15, 0, -0.6], talk: [[5.0, 6.2]],
      expr: [[3.7, "grin"], [5.0, "smug"], [6.5, "proud"], [8.3, "realize"], [9.3, "grin"]],
      handF: [[3.7, ...REST_F], [4.8, ...REST_F], [5.0, -0.32, HEAD_Z + 0.02], [6.2, -0.32, HEAD_Z + 0.02], [6.45, ...REST_F], ...pointKeys(8.8, -0.9, 1.0, 1.0, "f")],
      handB: [[3.7, ...REST_B], [6.4, ...REST_B], [6.6, 0.38, HIP + 0.5], [7.9, 0.38, HIP + 0.5], [8.15, ...REST_B]] })} />
  </Scene3D>);

const S3a = () => (
  <Scene3D t0={10.2} light="night" bg="#1a0b10" cam={[[10.2, [-1.4, 1.35, 1.8], [0.3, 1.3, -1.2], 76], [16.3, [-1.0, 1.3, 1.5], [0.3, 1.3, -1.2], 76]]} focus={[0, 1.1, -0.3]}>
    <Casino />
    <Doodle a={tim({ pos: [0, 0, -0.3], expr: [[10.2, "realize"], [11.0, "grin"], [12.3, "blank"], [13.3, "grin"], [14.4, "laugh"], [15.4, "proud"]],
      handF: up(14.4, 15.8, "f", 0.38, HEAD_Z + 0.2), handB: up(14.5, 15.8, "b", 0.38, HEAD_Z + 0.2) })} />
  </Scene3D>);

const Juice: React.FC = () => { const s = useSec(); if (s < 16.9) return null;
  return <Glass p={s < 17.6 ? [0.62, 0.92, -0.52] : [0.38, 0.92, -0.42]} />; };
const S3b = () => (
  <Scene3D t0={16.3} light="night" bg="#1a0b10" cam={[[16.3, [0.65, 1.3, 1.7], [0.45, 0.95, -0.6], 72], [19.1, [0.4, 1.3, 1.5], [0.45, 0.95, -0.6], 72]]} focus={[0.45, 1.1, -0.5]}>
    <Casino table={false} /><Juice />
    <Doodle a={tim({ pos: [0, 0, -0.5], talk: [[18.0, 18.8]], expr: [[16.3, "neutral"], [16.8, "realize"], [17.6, "grin"], [18.0, "proud"]],
      handB: [[16.3, ...REST_B], [17.3, ...REST_B], [17.6, 0.38, HIP + 0.45], [19.1, 0.38, HIP + 0.45]] })} />
    <Doodle a={{ pos: [1.0, 0, -0.6], seed: 7, look: WAITER, expr: [[16.3, "grin"], [17.5, "smug"], [18.4, "proud"]],
      handF: [[16.3, ...REST_F], [16.6, ...REST_F], [16.9, -0.38, HIP + 0.45], [17.6, -0.38, HIP + 0.45], [17.9, ...REST_F]] }} />
  </Scene3D>);

const chipsAt = (s: number) => s < 20.1 ? 1 : s < 21.2 ? 0.3 : s < 43.5 ? 1.4 : interpolate(s, [44.5, 47.2], [1.4, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const TableCasino: React.FC = () => { const s = useSec(); return <Casino chips={chipsAt(s)} />; };
const Phone4: React.FC = () => { const s = useSec(); return s > 23.0 ? <Phone p={[0.17, 0.97, -0.75]} /> : null; };
const S4 = () => (
  <Scene3D t0={19.1} light="night" bg="#1a0b10" cam={[[19.1, [0.7, 1.35, 1.6], [0.9, 0.9, -0.9], 72], [26.4, [1.0, 1.32, 1.4], [0.9, 0.9, -0.9], 72]]} focus={[0.45, 1.0, -0.85]}>
    <TableCasino /><Phone4 />
    <Doodle a={tim({ pos: [0.42, 0, -0.85], expr: [[19.1, "grin"], [19.4, "proud"], [20.2, "shock"], [21.2, "laugh"], [22.8, "neutral"], [23.5, "blank"], [24.6, "nervous"], [25.1, "shock"]],
      handF: [...up(19.4, 19.9, "f", 0.38, HEAD_Z + 0.2), ...up(21.3, 22.4, "f", 0.38, HEAD_Z + 0.2).slice(1), [22.8, -0.25, HEAD_Z], [26.4, -0.25, HEAD_Z]],
      handB: [...up(19.4, 19.9, "b", 0.38, HEAD_Z + 0.2), ...up(21.3, 22.4, "b", 0.38, HEAD_Z + 0.2).slice(1)] })} />
  </Scene3D>);

const S5 = () => (
  <Scene3D t0={26.4} light="day" bg="#ffc38a" cam={[[26.4, [0.4, 1.25, 1.8], [0, 1.25, -1], 74], [30.5, [0.15, 1.3, 1.5], [0, 1.25, -1], 74]]} focus={[0.2, 1.1, -0.5]}>
    <Street mode="dawn" />
    <Doodle a={tim({ pos: [0.2, 0, -0.5], walk: [[26.4, -1.3, -0.3], [27.3, 0.2, -0.5]],
      expr: [[26.4, "grin"], [27.4, "stern"], [27.9, "shock"], [28.7, "realize"], [29.3, "nervous"]],
      handB: up(27.4, 28.6, "b", 0.36, HEAD_Z + 0.12) })} />
  </Scene3D>);

const S6 = () => (
  <Scene3D t0={30.5} light="night" bg="#141c3f" cam={[[30.5, [0.3, 1.3, 1.7], [-0.4, 1.35, -1.2], 74], [38.8, [0.0, 1.3, 1.4], [-0.4, 1.35, -1.2], 74]]} focus={[-0.55, 1.1, -0.6]}>
    <Bedroom clockAt={35.1} /><Phone p={[-0.8, 0.97, -0.52]} on />
    <Doodle a={tim({ pos: [-0.55, 0, -0.6], expr: [[30.5, "grin"], [31.6, "laugh"], [33.3, "holdlaugh"], [34.5, "blank"], [35.1, "shock"], [36.5, "nervous"], [37.7, "blank"]],
      handF: [[30.5, -0.25, HEAD_Z]] })} />
  </Scene3D>);

const S7a = () => (
  <Scene3D t0={38.8} light="night" bg="#1a0b10" cam={[[38.8, [0.85, 1.3, 1.7], [-0.3, 1.45, -1.2], 74], [43.5, [0.55, 1.3, 1.5], [-0.3, 1.45, -1.2], 74]]} focus={[0.3, 1.1, -0.5]}>
    <Casino /><ClockGhost />
    <Doodle a={tim({ pos: [0.3, 0, -0.5], expr: [[38.8, "smug"], [39.8, "stern"], [40.6, "realize"], [41.4, "smug"], [42.3, "grin"]],
      handF: pointKeys(41.0, -0.5, 1.3, 1.4, "f") })} />
  </Scene3D>);

const S7b = () => (
  <Scene3D t0={43.5} light="night" bg="#1a0b10" cam={[[43.5, [1.6, 1.4, 1.3], [1.0, 0.85, -0.9], 70], [47.8, [1.35, 1.35, 1.1], [1.0, 0.85, -0.9], 70]]} focus={[0.45, 1.0, -0.85]}>
    <TableCasino />
    <Doodle a={tim({ pos: [0.42, 0, -0.85], expr: [[43.5, "nervous"], [44.6, "blank"], [45.9, "nervous"], [46.8, "shock"]] })} />
  </Scene3D>);

const S8 = () => (
  <Scene3D t0={47.8} light="night" bg="#1a0b10" cam={[[47.8, [0.2, 1.32, 1.5], [1.0, 1.35, -1.5], 74], [56.3, [0.5, 1.3, 1.2], [1.0, 1.35, -1.5], 74]]} focus={[0.9, 1.3, -1.4]}>
    <Casino poster table={false} />
    <Doodle a={tim({ pos: [0.5, 0, -1.0], talk: [], expr: [[47.8, "neutral"], [48.4, "smug"], [49.4, "grin"], [50.6, "proud"], [52.1, "smug"], [53.5, "stern"], [54.8, "smug"]],
      handB: pointKeys(50.4, 0.9, 1.0, 1.6, "b") })} />
  </Scene3D>);

const S9 = () => (
  <Scene3D t0={56.3} light="day" bg="#9fd0ff" cam={[[56.3, [0.3, 1.28, 1.9], [-0.6, 1.35, -1.2], 76], [60.5, [0.1, 1.28, 1.65], [-0.6, 1.35, -1.2], 76]]} focus={[0.0, 1.1, -0.6]}>
    <Street mode="morning" busBonk={58.6} />
    <Doodle a={tim({ pos: [0.0, 0, -0.6], expr: [[56.3, "grin"], [57.6, "realize"], [58.6, "nervous"], [59.0, "shock"]],
      handF: pointKeys(57.7, -0.9, 1.0, 1.2, "f") })} />
  </Scene3D>);

const SHOTS: { t0: number; t1: number; el: React.ReactNode }[] = [
  { t0: 0, t1: 3.7, el: <S1 /> }, { t0: 3.7, t1: 10.2, el: <S2 /> }, { t0: 10.2, t1: 16.3, el: <S3a /> }, { t0: 16.3, t1: 19.1, el: <S3b /> },
  { t0: 19.1, t1: 26.4, el: <S4 /> }, { t0: 26.4, t1: 30.5, el: <S5 /> }, { t0: 30.5, t1: 38.8, el: <S6 /> }, { t0: 38.8, t1: 43.5, el: <S7a /> },
  { t0: 43.5, t1: 47.8, el: <S7b /> }, { t0: 47.8, t1: 56.3, el: <S8 /> }, { t0: 56.3, t1: 60.5, el: <S9 /> },
];

// ===================================================================== субтитры
const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = plan.groups.find((x) => f >= x.start && f < Math.max(x.end, x.start + 6));
  if (!g) return null;
  const s = spring({ frame: f - g.start, fps, config: { damping: 11, stiffness: 240, mass: 0.55 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: "white", textAlign: "center", maxWidth: 920,
        transform: `scale(${interpolate(s, [0, 1], [0.72, 1])})`, WebkitTextStroke: "16px black", paintOrder: "stroke fill",
        textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>{g.text}</div>
    </AbsoluteFill>
  );
};

export const TOTAL = Math.round(SHOTS[SHOTS.length - 1].t1 * FPS);
export const Video: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t0 * FPS)} durationInFrames={Math.round((s.t1 - s.t0) * FPS)}>{s.el}</Sequence>
      ))}
      <Audio src={staticFile(plan.voice)} />
      <Audio src={staticFile("music.wav")} loop
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 45, durationInFrames], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Caption />
    </AbsoluteFill>
  );
};
