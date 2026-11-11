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

// ---------------------------------------------------------------- камера: ракурсы вокруг героя
// Ракурс задаётся точкой героя P (на уровне груди) и видом. Между ракурсами камера быстро (0.4 с) и плавно
// перелетает, а внутри ракурса медленно дрейфует к герою. На стыке локаций — быстрый «пролёт» (whip).
type V3 = [number, number, number];
type CamKey = [number, V3, V3, number?];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const VIEW: Record<string, [V3, V3, number]> = {
  wide: [[0.35, 0.3, 2.4], [0, -0.05, -0.3], 74],
  left: [[-1.15, 0.25, 1.45], [0.1, -0.08, 0], 66],
  right: [[1.2, 0.25, 1.4], [-0.1, -0.08, 0], 66],
  low: [[0.25, -0.45, 1.45], [0, 0.0, 0], 72],
  high: [[-0.2, 1.25, 1.6], [0, -0.3, 0], 70],
  front: [[0.05, 0.15, 1.3], [0, -0.06, 0], 62],
  lowleft: [[-0.75, -0.4, 1.35], [0.05, 0.0, 0], 70],
  highright: [[0.9, 1.1, 1.45], [-0.05, -0.3, 0], 70],
};
type Ang = [number, V3, string, V3?];   // [секунда, точка героя, вид, сдвиг взгляда]
const shot = (t0: number, t1: number, angs: Ang[], whipIn = true, whipOut = true): CamKey[] => {
  const pose = (a: Ang): [V3, V3, number] => { const [o, l, f] = VIEW[a[2]]; return [add(a[1], o), add(add(a[1], l), a[3] ?? [0, 0, 0]), f]; };
  const drift = ([p, l, f]: [V3, V3, number]): [V3, V3, number] => [[p[0] + (l[0] - p[0]) * 0.08, p[1] + (l[1] - p[1]) * 0.05, p[2] + (l[2] - p[2]) * 0.08], l, f];
  const keys: CamKey[] = [];
  angs.forEach((a, i) => {
    const s0 = pose(a), e0 = drift(s0);
    const start = i === 0 ? (whipIn ? t0 + 0.22 : t0) : a[0] + 0.4;
    const end = i + 1 < angs.length ? angs[i + 1][0] : whipOut ? t1 - 0.2 : t1;
    if (i === 0 && whipIn) keys.push([t0, s0[0], add(s0[1], [-1.6, 0.1, 0]), s0[2]]);
    keys.push([start, ...s0], [end, ...e0]);
    if (i + 1 === angs.length && whipOut) keys.push([t1, e0[0], add(e0[1], [1.6, -0.1, 0]), e0[2]]);
  });
  return keys;
};
// размытие «пролёта» на стыках локаций
const Whip: React.FC<{ t0: number; t1: number; win: boolean; wout: boolean; children: React.ReactNode }> = ({ t0, t1, win, wout, children }) => {
  const t = t0 + useCurrentFrame() / FPS;
  const k = Math.max(0, win ? 1 - (t - t0) / 0.22 : 0, wout ? 1 - (t1 - t) / 0.2 : 0);
  return <AbsoluteFill style={{ filter: k > 0 ? `blur(${(k * k * 18).toFixed(1)}px)` : undefined }}>{children}</AbsoluteFill>;
};
const focusAt = (t: number, list: [number, V3][]) => { let f = list[0][1]; for (const [tt, v] of list) if (t >= tt) f = v; return f; };

// ---------------------------------------------------------------- А. Казино: часов нет (0–3.7)
const SegA = () => {
  const P: V3 = [0, 1.0, -0.4];
  return (
    <Scene3D t0={0} light="night" bg="#1a0b10" focus={[0, 1.1, -0.4]}
      cam={shot(0, 3.7, [[0, P, "wide", [-0.2, 0.2, 0]], [1.3, P, "left"], [2.6, P, "low"]], false)}>
      <Casino /><ClockGhost />
      <Doodle a={tim({ pos: [0, 0, -0.4], expr: [[0, "suspicious"], [2.1, "skeptic"], [2.9, "smart"]],
        handB: up(0.3, 1.9, "b"), handF: up(2.9, 3.6, "f", 0.14, HEAD_Z - 0.27),
        lean: [[0, 0, 0], [0.5, -0.1, 0], [1.2, 0.08, 0], [1.9, 0, 0]] })} />
    </Scene3D>);
};

// ---------------------------------------------------------------- Б. Остановка вечером (3.7–10.2)
const Bill: React.FC = () => { const s = useSec(); return s > 6.6 && s < 7.95 ? <Box p={[0.23, 0.95, -0.5]} s={[0.2, 0.1, 0.01]} c="#7fc47a" /> : null; };
const SegB = () => {
  const P: V3 = [-0.15, 1.0, -0.6];
  return (
    <Scene3D t0={3.7} light="day" bg="#ff9a6b" focus={[-0.15, 1.1, -0.6]}
      cam={shot(3.7, 10.2, [[3.7, P, "wide", [-0.4, 0.15, 0]], [5.0, P, "right"], [6.5, P, "front"], [8.3, P, "wide", [-0.8, 0.3, 0]], [9.3, P, "lowleft"]])}>
      <Street mode="evening" busBonk={9.3} /><Bill />
      <Doodle a={tim({ pos: [-0.15, 0, -0.6], talk: [[5.0, 6.2]],
        expr: [[3.7, "dreamy"], [5.0, "grin"], [6.5, "wink"], [8.4, "nervous"], [9.4, "smug"]],
        handF: [[3.7, ...REST_F], [4.8, ...REST_F], [5.0, -0.32, HEAD_Z + 0.02], [6.2, -0.32, HEAD_Z + 0.02], [6.45, ...REST_F], ...pointKeys(8.8, -0.9, 1.0, 1.0, "f")],
        handB: [[3.7, ...REST_B], [6.4, ...REST_B], [6.6, 0.38, HIP + 0.5], [7.9, 0.38, HIP + 0.5], [8.15, ...REST_B]] })} />
    </Scene3D>);
};

// ---------------------------------------------------------------- В. Казино изнутри: свет, музыка, сок, игра, телефон (10.2–26.4)
const Juice: React.FC = () => { const s = useSec(); if (s < 16.9 || s > 19.0) return null;
  return <Glass p={s < 17.6 ? [0.52, 0.92, -0.08] : [0.38, 0.92, -0.15]} />; };
const chipsAt = (s: number) => s < 20.3 ? 1 : s < 21.4 ? 0.3 : s < 43.5 ? 1.4 : interpolate(s, [44.6, 47.2], [1.4, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const TableCasino: React.FC = () => { const s = useSec(); return <Casino chips={chipsAt(s)} />; };
const PhoneC: React.FC = () => { const s = useSec(); return s > 22.9 ? <Phone p={[0.17, 0.97, -0.77]} /> : null; };
const SegC = () => {
  const s = useSec();
  const A: V3 = [0, 1.0, -0.3], W: V3 = [0.45, 1.0, -0.2], T: V3 = [0.42, 1.0, -0.85];
  return (
    <Scene3D t0={10.2} light="night" bg="#1a0b10" focus={focusAt(s, [[10.2, [0, 1.1, -0.3]], [16.0, [0.45, 1.1, -0.2]], [19.1, [0.42, 1.1, -0.85]]])}
      cam={shot(10.2, 26.4, [[10.2, A, "high"], [11.5, A, "right"], [12.3, A, "left", [-0.4, 0.15, 0]], [13.7, A, "low"], [14.4, A, "wide"],
        [16.3, W, "wide"], [17.5, W, "left"], [18.0, W, "low"], [19.1, T, "wide", [0.3, 0, 0]], [20.3, T, "right"], [21.4, T, "lowleft"],
        [22.8, T, "front"], [24.7, T, "highright"]])}>
      <TableCasino /><Juice /><PhoneC />
      <Doodle a={tim({ pos: [0, 0, -0.3], walk: [[10.2, 0, -0.3], [16.0, 0, -0.3], [16.2, 0, -0.15], [19.0, 0, -0.15], [19.5, 0.42, -0.85]],
        talk: [[18.0, 18.8]],
        expr: [[10.2, "awe"], [12.3, "blank"], [13.3, "holdlaugh"], [14.4, "laugh"], [16.4, "realize"], [17.6, "proud"],
          [19.3, "money"], [20.3, "grimace"], [21.4, "ecstatic"], [22.8, "neutral"], [23.6, "blank"], [24.7, "panic"]],
        handF: [...up(10.5, 11.8, "f", 0.45, HIP + 0.35), ...up(14.4, 14.9, "f", 0.38, HEAD_Z + 0.2).slice(1), ...up(15.3, 15.8, "f", 0.38, HEAD_Z + 0.2).slice(1),
          ...up(19.4, 19.9, "f", 0.38, HEAD_Z + 0.2).slice(1), ...up(20.4, 21.1, "f").slice(1), ...up(21.5, 22.4, "f", 0.4, HEAD_Z + 0.2).slice(1), [22.8, -0.25, HEAD_Z], [26.4, -0.25, HEAD_Z]],
        handB: [...up(10.5, 11.8, "b", 0.45, HIP + 0.35), ...up(14.65, 15.1, "b", 0.38, HEAD_Z + 0.2).slice(1), [17.3, ...REST_B], [17.6, 0.38, HIP + 0.45], [18.9, 0.38, HIP + 0.45], [19.1, ...REST_B],
          ...up(19.4, 19.9, "b", 0.38, HEAD_Z + 0.2).slice(1), ...up(20.4, 21.1, "b").slice(1), ...up(21.5, 22.4, "b", 0.4, HEAD_Z + 0.2).slice(1), [24.7, ...REST_B], [24.9, 0.36, HEAD_Z + 0.12], [26.4, 0.36, HEAD_Z + 0.12]] })} />
      <Doodle a={{ pos: [0.9, 0, -0.1], seed: 7, look: WAITER, walk: [[15.6, 2.4, 0.3], [16.4, 0.9, -0.1], [18.9, 0.9, -0.1], [19.8, 2.6, 0.4]], hidden: [[10, 15.6], [19.8, 27]],
        expr: [[15.6, "grin"], [17.0, "smug"], [18.2, "proud"], [19.0, "wink"]],
        handF: [[16.3, ...REST_F], [16.6, ...REST_F], [16.9, -0.38, HIP + 0.45], [17.6, -0.38, HIP + 0.45], [17.9, ...REST_F]] }} />
    </Scene3D>);
};

// ---------------------------------------------------------------- Г. Рассвет (26.4–30.5)
const SegD = () => {
  const P: V3 = [0.2, 1.0, -0.5];
  return (
    <Scene3D t0={26.4} light="day" bg="#ffc38a" focus={[0.2, 1.1, -0.5]}
      cam={shot(26.4, 30.5, [[26.4, P, "wide", [-0.5, 0, 0]], [27.9, P, "left"], [28.7, P, "low"]])}>
      <Street mode="dawn" />
      <Doodle a={tim({ pos: [0.2, 0, -0.5], walk: [[26.4, -1.3, -0.3], [27.3, 0.2, -0.5]],
        expr: [[26.4, "squint"], [27.9, "shock"], [28.7, "dizzy"]],
        handB: up(27.0, 28.4, "b", 0.36, HEAD_Z + 0.12), handF: up(28.8, 30.3, "f") })} />
    </Scene3D>);
};

// ---------------------------------------------------------------- Д. Спальня, ночь (30.5–38.8)
const SegE = () => {
  const P: V3 = [-0.55, 1.0, -0.6];
  return (
    <Scene3D t0={30.5} light="night" bg="#141c3f" focus={[-0.55, 1.1, -0.6]}
      cam={shot(30.5, 38.8, [[30.5, P, "wide"], [31.7, P, "right"], [33.3, P, "left"], [34.5, P, "wide", [0, 0.6, 0]], [35.4, P, "low"], [36.5, P, "high"], [37.7, P, "front"]])}>
      <Bedroom clockAt={35.1} /><Phone p={[-0.8, 0.97, -0.52]} on />
      <Doodle a={tim({ pos: [-0.55, 0, -0.6], expr: [[30.5, "thinking"], [31.7, "holdlaugh"], [33.3, "sleepy"], [34.5, "blank"], [35.1, "shock"], [36.5, "realize"]],
        handF: [[30.5, -0.25, HEAD_Z]], handB: up(30.6, 31.5, "b", 0.16, HEAD_Z - 0.26) })} />
    </Scene3D>);
};

// ---------------------------------------------------------------- Е. Казино: в чём хитрость + книга (38.8–56.3)
const SegF = () => {
  const s = useSec();
  const G: V3 = [0, 1.0, -0.4], T: V3 = [0.42, 1.0, -0.85], B: V3 = [-0.4, 1.0, -1.05];
  return (
    <Scene3D t0={38.8} light="night" bg="#1a0b10" focus={focusAt(s, [[38.8, [0, 1.1, -0.4]], [43.6, [0.42, 1.1, -0.85]], [47.9, [-0.4, 1.1, -1.05]]])}
      cam={shot(38.8, 56.3, [[38.8, G, "low"], [39.6, G, "right"], [40.6, G, "wide", [-0.1, 0.5, 0]], [42.5, G, "high"],
        [43.6, T, "left"], [44.6, T, "wide", [0.4, 0, 0]], [46.0, T, "lowleft"],
        [47.8, B, "wide", [0.5, 0.2, 0]], [49.4, B, "right", [0.3, 0, 0]], [50.6, B, "left", [0.5, 0.2, 0]], [51.9, B, "low"], [53.5, B, "highright"], [54.8, B, "front"]])}>
      <TableCasino /><ClockGhost />
      <Doodle a={tim({ pos: [0, 0, -0.4], walk: [[38.8, 0, -0.4], [43.4, 0, -0.4], [44.1, 0.42, -0.85], [47.8, 0.42, -0.85], [48.6, -0.4, -1.05]],
        expr: [[38.8, "angry"], [40.6, "aha"], [42.5, "dizzy"], [43.6, "nervous"], [46.0, "sad"], [47.8, "smart"], [50.4, "proud"], [51.4, "smug"], [53.5, "skeptic"], [54.8, "grin"]],
        handF: [[38.8, -0.25, HIP + 0.18], [40.3, -0.25, HIP + 0.18], ...pointKeys(40.9, -0.15, 1.4, 1.2, "f"), ...up(42.6, 43.4, "f").slice(1), ...up(46.1, 47.4, "f", 0.4, HIP + 0.3).slice(1)],
        handB: [[38.8, 0.25, HIP + 0.18], [40.3, 0.25, HIP + 0.18], [40.6, ...REST_B], ...up(42.6, 43.4, "b").slice(1), ...up(46.1, 47.4, "b", 0.4, HIP + 0.3).slice(1),
          ...pointKeys(50.4, 0.9, 1.0, 1.6, "b"), ...up(53.6, 54.6, "b", 0.16, HEAD_Z - 0.26).slice(1)] })} />
    </Scene3D>);
};

// ---------------------------------------------------------------- Ж. Остановка утром: автобус ушёл (56.3–60.5)
const SegG = () => {
  const P: V3 = [0, 1.0, -0.6];
  return (
    <Scene3D t0={56.3} light="day" bg="#9fd0ff" focus={[0, 1.1, -0.6]}
      cam={shot(56.3, 60.5, [[56.3, P, "right"], [57.6, P, "wide", [-0.8, 0.3, 0]], [58.4, P, "front"], [59.0, P, "high"]], true, false)}>
      <Street mode="morning" busBonk={58.6} />
      <Doodle a={tim({ pos: [0, 0, -0.6], expr: [[56.3, "smug"], [57.6, "realize"], [58.4, "deadpan"], [59.0, "crying"]],
        handF: [...pointKeys(57.7, -0.9, 1.0, 0.6, "f"), ...up(59.1, 60.5, "f", 0.4, HEAD_Z + 0.05).slice(1)], handB: up(59.1, 60.5, "b", 0.4, HEAD_Z + 0.05) })} />
    </Scene3D>);
};

const SHOTS: { t0: number; t1: number; el: React.ReactNode }[] = [
  { t0: 0, t1: 3.7, el: <SegA /> }, { t0: 3.7, t1: 10.2, el: <SegB /> }, { t0: 10.2, t1: 26.4, el: <SegC /> }, { t0: 26.4, t1: 30.5, el: <SegD /> },
  { t0: 30.5, t1: 38.8, el: <SegE /> }, { t0: 38.8, t1: 56.3, el: <SegF /> }, { t0: 56.3, t1: 60.5, el: <SegG /> },
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
        <Sequence key={i} from={Math.round(s.t0 * FPS)} durationInFrames={Math.round((s.t1 - s.t0) * FPS)}><Whip t0={s.t0} t1={s.t1} win={i > 0} wout={i + 1 < SHOTS.length}>{s.el}</Whip></Sequence>
      ))}
      <Audio src={staticFile(plan.voice)} />
      <Audio src={staticFile("music.wav")} loop
        volume={(f) => interpolate(f, [0, 20, durationInFrames - 45, durationInFrames], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Caption />
    </AbsoluteFill>
  );
};
