// «Imagine you became invisible» — 60 сек, только сцены и звуки (public/invisible/sound.wav), без надписей поверх кадра.
// Главный герой — MASCOT во всех сценах. Невидимым он показан зрителю светлым полупрозрачным силуэтом (GHOST).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  BAKER, D, FRIEND1, FRIEND2, FRIEND3, GHOST, GIRL, KID, MASCOT, MOM, PASSER, Person, Pose, STAND, Shadow, V, lerp, stepFoot,
} from "../characters/Rig";

// шрифт для вывесок (локально)
if (typeof document !== "undefined") {
  const h = delayRender("invisible fonts");
  Promise.all(
    [["Montserrat-latin", "U+0000-00FF, U+2000-206F"]].map(([file, range]) =>
      new FontFace("IvMont", `url(${staticFile(`towers/fonts/${file}.woff2`)}) format("woff2")`, { unicodeRange: range }).load().then((x) => document.fonts.add(x)),
    ),
  ).then(() => continueRender(h), () => continueRender(h));
}
const MONT = "IvMont";

export const INVISIBLE_FRAMES = 1800;

const N0 = "#0e1628", N2 = "#2a3a5e", N3 = "#3a4c74", N4 = "#4d6190";
const YEL = "#f5c84c", RED = "#e0524a", WH = "#eef2f8", INK = "#141b2e";

const ip = (f: number, i: number[], o: number[], e?: (t: number) => number) =>
  interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Full: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Sky: React.FC<{ id: string; stops: [number, string][]; h?: number }> = ({ id, stops, h = 1920 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
      </linearGradient>
    </defs>
    <rect width={1080} height={h} fill={`url(#${id})`} />
  </>
);
const Stars: React.FC<{ f: number; n?: number; h?: number }> = ({ f, n = 50, h = 900 }) => (
  <g>{Array.from({ length: n }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * h} r={1 + rnd(i + 7) * 1.8} fill={WH} opacity={0.25 + 0.4 * Math.abs(Math.sin(f / 15 + i))} />)}</g>
);
const Cam: React.FC<{ k: number; ox?: number; oy?: number; tx?: number; ty?: number; children: React.ReactNode }> = ({ k, ox = 540, oy = 960, tx = 0, ty = 0, children }) => (
  <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${k})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>
);
const walkRig = (xw: number, ground: (x: number) => number, s: number, S: number, hipH = 134, lift = 22) => {
  const fl = stepFoot(xw, S, 0, ground, lift), fr = stepFoot(xw, S, 0.5, ground, lift);
  const g = (ground(xw - S * 0.2) + ground(xw + S * 0.2)) / 2;
  const hy = g - hipH * s + Math.cos((xw / S) * Math.PI * 4) * 3 * s;
  const swL = (fr[0] - xw) / S, swR = (fl[0] - xw) / S;
  const pose: Pose = { lean: 4, aL: [swL * 80, swL * 80 + 22], aR: [swR * 80, swR * 80 + 22], lL: [0, 0], lR: [0, 0] };
  return { hip: [xw, hy] as V, pose, feet: { l: [(fl[0] - xw) / s, (fl[1] - hy) / s] as V, r: [(fr[0] - xw) / s, (fr[1] - hy) / s] as V } };
};
const toLocal = (w: V, hip: V, s: number, dir = 1): V => [((w[0] - hip[0]) / s) * dir, (w[1] - hip[1]) / s];
const toWorld = (l: V, hip: V, s: number, dir = 1): V => [hip[0] + l[0] * s * dir, hip[1] + l[1] * s];

// ---------- герой: видимый / невидимый / проявление по линии ----------
type PP = React.ComponentProps<typeof Person>;
const Me: React.FC<Omit<PP, "look"> & { vis?: number; glow?: number; cut?: number; cutUp?: boolean; uid: string }> = ({ vis = 1, glow = 0.3, cut, cutUp, uid, ...p }) => {
  const ghost = cut !== undefined ? glow : glow * (1 - vis);
  return (
    <g>
      {ghost > 0.01 ? <g opacity={ghost}><Person {...p} look={GHOST} /></g> : null}
      {cut !== undefined ? (
        <>
          <defs>
            <clipPath id={uid}>{cutUp ? <rect x={-3000} y={-3000} width={8000} height={3000 + cut} /> : <rect x={-3000} y={cut} width={8000} height={6000} />}</clipPath>
          </defs>
          <g clipPath={`url(#${uid})`}><Person {...p} look={MASCOT} /></g>
        </>
      ) : vis > 0.01 ? <g opacity={vis}><Person {...p} look={MASCOT} /></g> : null}
    </g>
  );
};
// искры вдоль линии исчезновения/проявления
const SparkLine: React.FC<{ y: number; x: number; w: number; f: number }> = ({ y, x, w, f }) => (
  <g>
    <rect x={x - w / 2} y={y - 2} width={w} height={4} rx={2} fill="#cfe6ff" opacity={0.8} />
    {Array.from({ length: 12 }, (_, i) => {
      const px = x - w / 2 + rnd(i + Math.floor(f / 2) * 7) * w, py = y - rnd(i * 3 + f) * 40;
      return <path key={i} d="M 0 -9 L 2.5 -2.5 L 9 0 L 2.5 2.5 L 0 9 L -2.5 2.5 L -9 0 L -2.5 -2.5 Z" fill="#ffffff" transform={`translate(${px} ${py}) scale(${0.5 + rnd(i + f) * 0.8})`} opacity={0.9} />;
    })}
  </g>
);

// ---------- собака ----------
const Dog: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; f: number; bark?: number; wag?: number; sit?: boolean }> = ({ x, y, s = 1, dir = 1, f, bark = 0, wag = 0.3, sit }) => {
  const C = "#c08a52", C2 = "#8a5a32";
  const tail = -40 + Math.sin(f / (wag > 0.5 ? 1.6 : 4)) * 30 * wag;
  const jaw = bark * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <line x1={-50} y1={sit ? -40 : -62} x2={-50 + Math.cos((tail - 90) * D) * 45} y2={(sit ? -40 : -62) + Math.sin((tail - 90) * D) * 45} stroke={C} strokeWidth={9} strokeLinecap="round" />
      {sit ? <ellipse cx={-30} cy={-22} rx={34} ry={22} fill={C2} /> : (
        <>
          <line x1={-34} y1={-50} x2={-38 + Math.sin(f / 4) * 3} y2={0} stroke={C2} strokeWidth={12} strokeLinecap="round" />
          <line x1={-22} y1={-50} x2={-20} y2={0} stroke={C} strokeWidth={12} strokeLinecap="round" />
        </>
      )}
      <line x1={30} y1={-50} x2={32} y2={0} stroke={C2} strokeWidth={12} strokeLinecap="round" />
      <line x1={42} y1={-50} x2={44} y2={0} stroke={C} strokeWidth={12} strokeLinecap="round" />
      <g transform={sit ? "rotate(-28 -30 -30)" : ""}>
        <ellipse cx={0} cy={-58} rx={58} ry={25} fill={C} />
      </g>
      <g transform={`translate(${sit ? 46 : 58} ${sit ? -98 : -84})`}>
        <circle cx={0} cy={0} r={25} fill={C} />
        <ellipse cx={22} cy={8} rx={18} ry={11} fill={C} />
        <path d={`M 10 14 L 40 ${14 + jaw * 0.2} L 36 ${18 + jaw} L 8 ${20 + jaw * 0.4} Z`} fill={bark > 0.1 ? "#7a2a2a" : C} />
        <circle cx={38} cy={4} r={6} fill={INK} />
        <circle cx={8} cy={-6} r={4} fill={INK} />
        <path d="M -16 -16 Q -30 6 -14 18 Q -6 0 -6 -14 Z" fill={C2} />
        {bark > 0.2 ? [0, 1, 2].map((i) => <line key={i} x1={52} y1={-14 + i * 14} x2={72} y2={-22 + i * 22} stroke={WH} strokeWidth={4} strokeLinecap="round" opacity={bark} />) : null}
      </g>
    </g>
  );
};

// ---------- ванная (сцены 1 и 9) ----------
const MIR = { x: 470, y: 470, w: 430, h: 540 };
const Bathroom: React.FC<{ morning?: boolean; mirror: React.ReactNode; children: React.ReactNode }> = ({ morning, mirror, children }) => (
  <>
    <rect width={1080} height={1920} fill={morning ? "#3d5a7c" : "#2a3d5e"} />
    {Array.from({ length: 16 }, (_, i) => <line key={"h" + i} x1={0} y1={i * 100} x2={1080} y2={i * 100} stroke={morning ? "#46668a" : "#33496c"} strokeWidth={4} />)}
    {Array.from({ length: 12 }, (_, i) => <line key={"v" + i} x1={i * 100} y1={0} x2={i * 100} y2={1500} stroke={morning ? "#46668a" : "#33496c"} strokeWidth={4} />)}
    {morning ? <path d="M 1080 200 L 600 1500 L 1080 1500 Z" fill="#ffe2a0" opacity={0.1} /> : null}
    <rect x={0} y={1500} width={1080} height={420} fill={morning ? "#2c4060" : "#1e2c48"} />
    <rect x={MIR.x - 16} y={MIR.y - 16} width={MIR.w + 32} height={MIR.h + 32} rx={14} fill="#c9d3e6" />
    <defs><clipPath id="mirclip"><rect x={MIR.x} y={MIR.y} width={MIR.w} height={MIR.h} rx={6} /></clipPath></defs>
    <g clipPath="url(#mirclip)">
      <rect x={MIR.x} y={MIR.y} width={MIR.w} height={MIR.h} fill={morning ? "#5a7aa0" : "#3d5478"} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={MIR.x} y1={MIR.y + i * 100} x2={MIR.x + MIR.w} y2={MIR.y + i * 100} stroke="#4d6890" strokeWidth={3} />)}
      {mirror}
      <path d={`M ${MIR.x + 40} ${MIR.y} L ${MIR.x + 120} ${MIR.y} L ${MIR.x} ${MIR.y + 160} L ${MIR.x} ${MIR.y + 60} Z`} fill="#ffffff" opacity={0.12} />
      <path d={`M ${MIR.x + 200} ${MIR.y} L ${MIR.x + 240} ${MIR.y} L ${MIR.x} ${MIR.y + 330} L ${MIR.x} ${MIR.y + 280} Z`} fill="#ffffff" opacity={0.08} />
    </g>
    {/* раковина */}
    <rect x={400} y={1110} width={620} height={60} rx={14} fill="#dfe6f2" />
    <rect x={430} y={1170} width={560} height={330} rx={10} fill="#4a5f86" />
    <rect x={700} y={1250} width={6} height={160} fill="#2f3f60" />
    <rect x={640} y={1060} width={14} height={56} rx={6} fill="#aab6cc" />
    <rect x={640} y={1060} width={70} height={14} rx={6} fill="#aab6cc" />
    <rect x={880} y={1060} width={40} height={52} rx={8} fill="#7fc4a8" />
    {children}
  </>
);
const Brush: React.FC<{ x: number; y: number; a?: number; foam?: boolean; k?: number }> = ({ x, y, a = 0, foam, k = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`}>
    <rect x={-70} y={-6} width={76} height={12} rx={6} fill="#5ab0e0" />
    <rect x={-72} y={-16} width={20} height={12} rx={3} fill="#ffffff" />
    {foam ? [0, 1, 2].map((i) => <circle key={i} cx={-80 + i * 10} cy={-14 + (i % 2) * 6} r={7} fill="#ffffff" />) : null}
  </g>
);

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const s = 2.1, hip: V = [250, 1500 - 140 * 2.1];
  const brushing = f < 30;
  const bOff = brushing ? Math.sin(f * 1.3) * 7 : 0;
  const turn = ip(f, [44, 60], [0.75, 0.1]);
  const notice = f >= 28;
  const handR: V = f < 48 ? [36 + bOff, -136] : f < 150 ? [lerp(36, 40, ip(f, [48, 60], [0, 1])), lerp(-136, -100, ip(f, [48, 60], [0, 1]))] : [40 + Math.sin(f / 3) * 14, -110 + Math.sin(f / 4) * 40];
  const handL: V = f < 48 ? [-14, -12] : [-34, -96];
  const cut = ip(f, [72, 150], [740, 1540], Easing.inOut(Easing.quad));
  const face = !notice ? { mouth: "flat" as const } : f < 150 ? { eyes: "wide" as const, brows: 1, mouth: "o" as const } : f < 175 ? { eyes: "wide" as const, brows: 1, mouth: "fear" as const } : { eyes: "happy" as const, mouth: "grin" as const };
  // щётка: в руке → падает в раковину
  const hw = toWorld(handR, hip, s);
  const drop = ip(f, [186, 196], [0, 1], Easing.in(Easing.quad));
  const brushPos: V = [lerp(hw[0], 520, drop), lerp(hw[1], 1104, drop)];
  const brushA = lerp(f < 150 ? 0 : Math.sin(f / 4) * 25, 80, drop);
  const zoom = 1.25 + ip(f, [4, 22], [0, 0.35], Easing.out(Easing.cubic)) - ip(f, [40, 62], [0, 0.35], Easing.inOut(Easing.quad));
  // «отражение» щётки в зеркале
  const refl: V = [MIR.x + 190 - bOff * 1.5, hw[1] - 40];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={zoom} ox={330} oy={900}>
        <Full>
          <Bathroom mirror={f < 186 ? <Brush x={refl[0]} y={refl[1]} a={180 - brushA} foam={brushing} k={1.5} /> : null}>
            <Shadow x={hip[0]} y={1500} w={90} />
            <Me uid="m1" x={hip[0]} y={hip[1]} s={s} turn={turn} pose={STAND} hands={{ l: handL, r: handR }} t={f} face={face} cut={f >= 72 ? cut : undefined} glow={f >= 72 ? 0.32 : 0} />
            {f >= 72 && f < 150 ? <SparkLine y={cut} x={hip[0]} w={260} f={f} /> : null}
            <Brush x={brushPos[0] + (f < 150 ? -6 : 0)} y={brushPos[1]} a={brushA} foam={brushing} />
          </Bathroom>
        </Full>
      </Cam>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 2 (7–14): улица ===============
const Scene2: React.FC = () => {
  const g = useCurrentFrame();
  const GY = 1600, s = 1.7, S = 180;
  const mx = g < 70 ? 360 + g * 2.571 : g < 120 ? 540 : g < 155 ? 540 + (g - 120) * 2.571 : 630;
  const mw = walkRig(mx, () => GY, s, S);
  const camX = mx - 470;
  const px = 540 + (115 - g) * 3;
  const pw = walkRig(-px, () => GY, s, 160);
  const startle = g >= 155 && g < 175 ? Math.sin(((g - 155) / 20) * Math.PI) * 40 : 0;
  const petting = g >= 178;
  const dogX = 790;
  const barkAt = [150, 162, 175];
  const bark = barkAt.reduce((m, a) => Math.max(m, ip(g, [a, a + 2, a + 8], [0, 1, 0])), 0);
  let hands: { l?: V; r?: V } | undefined;
  let pose = mw.pose;
  let face: React.ComponentProps<typeof Person>["face"] = { mouth: "smile" };
  if (g >= 70 && g < 120) {
    hands = { r: [72 + Math.sin(g / 2.2) * 26, -205] };
    face = { eyes: "happy", mouth: "grin" };
  }
  if (g >= 155 && g < 178) {
    pose = { ...mw.pose, aL: [-150, -170], aR: [150, 170] };
    face = { eyes: "wide", brows: 1, mouth: "o" };
  }
  if (petting) {
    pose = { ...mw.pose, lean: 26 };
    hands = { r: toLocal([dogX + 50, GY - 110 + Math.sin(g / 3) * 6], [mx, mw.hip[1]], s) };
    face = { eyes: "happy", mouth: "grin" };
  }
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="st" stops={[[0, "#3d5a8a"], [1, "#9ab8d8"]]} h={1400} />
        <g transform={`translate(${-camX * 0.4} 0)`}>
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <rect x={i * 230 - 160} y={420 + rnd(i) * 260} width={210} height={1000} fill={i % 2 ? N3 : "#44588a"} />
              {Array.from({ length: 15 }, (_, k) => <rect key={k} x={i * 230 - 140 + (k % 3) * 64} y={470 + rnd(i) * 260 + Math.floor(k / 3) * 110} width={40} height={60} rx={4} fill={rnd(i * 15 + k) > 0.7 ? "#c8dcf2" : "#2f4068"} />)}
            </g>
          ))}
        </g>
        <rect x={0} y={1380} width={1080} height={540} fill="#4a5878" />
        <rect x={0} y={1380} width={1080} height={16} fill="#5d6d90" />
        <g transform={`translate(${-camX} 0)`}>
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 220 - 300} y={1440} width={200} height={6} fill="#56668a" />)}
          <rect x={1000} y={1000} width={16} height={600} fill="#2a3450" />
          <rect x={976} y={980} width={64} height={30} rx={8} fill="#2a3450" />
          <Shadow x={dogX} y={GY} w={70} />
          <Dog x={dogX} y={GY} s={1.2} dir={-1} f={g} bark={bark} wag={petting ? 1 : 0.3} sit={g < 145 || petting} />
          <Shadow x={px} y={GY} w={60} />
          <Person x={px} y={pw.hip[1]} s={s} dir={-1} turn={0.9} pose={{ ...pw.pose, lean: 2, head: 14 }} feet={pw.feet} hands={{ r: [30, -118] }} look={PASSER[0]} t={g} seed={4} face={{ mouth: "flat" }}>
            <rect x={22} y={-150} width={20} height={34} rx={4} fill={INK} />
            <rect x={25} y={-146} width={14} height={24} rx={2} fill="#7fb0e0" />
          </Person>
          <Me uid="m2" x={mx} y={mw.hip[1] - startle} s={s} turn={0.85} pose={pose} feet={mw.feet} hands={hands} t={g} face={face} vis={0} glow={0.32} />
          {g >= 105 && g < 125 ? <SparkLine y={GY - 250} x={mx} w={200} f={g} /> : null}
        </g>
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 3 (14–21): пекарня ===============
const Donut: React.FC<{ x: number; y: number; bites: number; col?: string }> = ({ x, y, bites, col = "#e88aa8" }) => (
  <g transform={`translate(${x} ${y}) scale(1.6)`}>
    <defs>
      <mask id={`bite${bites}${col.slice(1)}`}>
        <rect x={-40} y={-40} width={80} height={80} fill="#fff" />
        {bites > 0 ? <circle cx={24} cy={-14} r={15} fill="#000" /> : null}
        {bites > 1 ? <circle cx={28} cy={6} r={14} fill="#000" /> : null}
      </mask>
    </defs>
    <g mask={`url(#bite${bites}${col.slice(1)})`}>
      <circle r={28} fill="#d9a066" />
      <circle r={24} fill={col} />
      <circle r={9} fill="#3a3a66" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={Math.cos(i * 1.3) * 15 - 2} y={Math.sin(i * 1.3) * 15 - 5} width={4} height={10} rx={2} fill={["#fff", YEL, "#7fc4ff"][i % 3]} transform={`rotate(${i * 50} ${Math.cos(i * 1.3) * 15} ${Math.sin(i * 1.3) * 15})`} />)}
    </g>
  </g>
);

const Scene3: React.FC = () => {
  const g = useCurrentFrame();
  const s = 2.1, hip: V = [250, 1700 - 140 * 2.1];
  const plate: V = [470, 1158];
  const reach = ip(g, [20, 48], [0, 1], Easing.inOut(Easing.quad));
  const toMouth = ip(g, [55, 92], [0, 1], Easing.inOut(Easing.quad));
  const rest: V = [30, -40];
  const plateL = toLocal(plate, hip, s);
  const mouthL: V = [44, -142];
  const chew = g > 100 && g < 165 ? Math.sin(g / 2) : 0;
  const wiggle = g > 165 ? Math.sin(g / 3) * 14 : 0;
  const handR: V = g < 50 ? [lerp(rest[0], plateL[0], reach), lerp(rest[1], plateL[1], reach)] : [lerp(plateL[0], mouthL[0] + 10 + wiggle, toMouth), lerp(plateL[1], mouthL[1] + 6 - (g > 165 ? 30 : 0), toMouth)];
  const donutW: V = g < 50 ? plate : toWorld([handR[0] + 6, handR[1] - 8], hip, s);
  const bites = g >= 130 ? 2 : g >= 100 ? 1 : 0;
  const shock = g >= 66;
  const bk: V = [850, 1250];
  const wipe = Math.sin(g / 5) * 50;
  const trem = shock ? Math.sin(g * 2.3) * 2 : 0;
  const bakerHands = !shock ? { r: toLocal([820 + wipe, 1175], bk, 2) as V, l: [-30, -40] as V } : g < 120 || g > 150 ? { l: [-60, -250] as V, r: [60, -250] as V } : { l: [-10, -150] as V, r: [14, -150] as V };
  const meFace = g < 50 ? { mouth: "smile" as const } : g < 100 ? { eyes: "happy" as const, mouth: "grin" as const } : chew > 0 ? { eyes: "happy" as const, mouth: "o" as const } : { eyes: "happy" as const, mouth: "smile" as const };
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <rect width={1080} height={1920} fill="#3a3a66" />
        <rect x={0} y={1700} width={1080} height={220} fill="#2a2a4c" />
        {Array.from({ length: 11 }, (_, i) => <rect key={i} x={i * 100} y={0} width={50} height={1700} fill="#40406e" />)}
        <rect x={250} y={260} width={580} height={150} rx={16} fill={RED} />
        <text x={540} y={362} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={84} fill={WH}>BAKERY</text>
        {[560, 760].map((y, r) => (
          <g key={r}>
            <rect x={560} y={y + 60} width={460} height={16} rx={6} fill="#7a5a44" />
            {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={610 + i * 110} cy={y + 34} rx={46} ry={28} fill={["#d9a066", "#c48a4e", "#e0b07a"][(i + r) % 3]} />)}
          </g>
        ))}
        <circle cx={160} cy={640} r={70} fill="#e8ecf4" />
        <line x1={160} y1={640} x2={160 + Math.sin(g * 4 * D) * 50} y2={640 - Math.cos(g * 4 * D) * 50} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {/* пекарь за прилавком */}
        <g transform={`translate(${trem} 0)`}>
          <Person x={bk[0]} y={bk[1]} s={2} turn={0.2} dir={-1} pose={STAND} hands={bakerHands} look={BAKER} t={g} seed={7} face={shock ? { eyes: "wide", brows: 1, mouth: "o" } : { mouth: "smile" }} />
        </g>
        {!shock ? <rect x={toWorld(bakerHands.r!, bk, 2, -1)[0] - 30} y={1160} width={60} height={20} rx={6} fill={WH} /> : <rect x={760} y={1680} width={60} height={18} rx={6} fill={WH} transform="rotate(12 790 1690)" />}
        {/* прилавок */}
        <rect x={400} y={1170} width={680} height={24} rx={8} fill="#b07a52" />
        <rect x={420} y={1194} width={660} height={506} fill="#8a5a3c" />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={450 + i * 130} y={1240} width={100} height={420} rx={10} fill="#7a4e34" />)}
        <ellipse cx={plate[0]} cy={plate[1] + 14} rx={70} ry={12} fill="#e8ecf4" />
        <Donut x={plate[0] + 40} y={plate[1] - 6} bites={0} col="#8a5a3c" />
        <Shadow x={hip[0]} y={1700} w={90} />
        <Me uid="m3" x={hip[0]} y={hip[1]} s={s} turn={0.8} pose={{ ...STAND, lean: lerp(0, 10, reach) - lerp(0, 10, toMouth) }} hands={{ r: handR }} t={g} face={meFace} vis={0} glow={0.32} />
        <Donut x={donutW[0]} y={donutW[1]} bites={bites} />
        {g >= 50 && g < 100 ? <SparkLine y={donutW[1] + 40} x={donutW[0]} w={90} f={g} /> : null}
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 4 (21–28): качели ===============
const Scene4: React.FC = () => {
  const g = useCurrentFrame();
  const P: V = [600, 560], Lc = 640, w = (2 * Math.PI) / 48;
  const A = 10 + 5 * Math.max(0, Math.min(4, (g - 30) / 48));
  const th = A * Math.sin(w * g);
  const seat: V = [P[0] + Lc * Math.sin(th * D), P[1] + Lc * Math.cos(th * D)];
  const ks = 1.4;
  const kidHip: V = [seat[0] - Math.sin(th * D) * 6, seat[1] - 8];
  const rot = -th;
  const unrot = (wv: V): V => {
    const d: V = [(wv[0] - kidHip[0]) / ks, (wv[1] - kidHip[1]) / ks];
    const c = Math.cos(th * D), s = Math.sin(th * D);
    return [d[0] * c - d[1] * s, d[0] * s + d[1] * c];
  };
  const chainPt = (side: number, along: number): V => {
    const off: V = [Math.cos(th * D) * side * 34, -Math.sin(th * D) * side * 34];
    return [P[0] + off[0] + Math.sin(th * D) * along, P[1] + off[1] + Math.cos(th * D) * along];
  };
  const kick = Math.max(0, Math.sin(w * g)) * 50;
  const kidPose: Pose = { lean: -6 - kick * 0.1, aL: [0, 0], aR: [0, 0], lL: [88, 10 + kick], lR: [80, 4 + kick] };
  const push = th < -A * 0.55;
  const ms = 2.0, mHip: V = [215, 1560 - 140 * ms];
  const back: V = [seat[0] - 40, seat[1] - 120];
  const meHands = push ? { l: toLocal([back[0], back[1] + 10], mHip, ms), r: toLocal([back[0] + 6, back[1] - 16], mHip, ms) } : { l: [36, -96] as V, r: [44, -100] as V };
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="pk" stops={[[0, "#3d5a8a"], [0.7, "#c8a88a"], [1, "#e0bc8a"]]} h={1400} />
        {[100, 330, 900, 1040].map((x, i) => (
          <g key={i}>
            <rect x={x - 14} y={900} width={28} height={500} fill="#4a3a3a" />
            <circle cx={x} cy={860} r={120 + (i % 2) * 30} fill={i % 2 ? "#3d6a58" : "#4a7a64"} />
          </g>
        ))}
        <rect x={0} y={1380} width={1080} height={540} fill="#3d6a58" />
        <rect x={0} y={1380} width={1080} height={14} fill="#4a7a64" />
        {/* качели */}
        <line x1={360} y1={1560} x2={420} y2={540} stroke="#8a96b0" strokeWidth={18} strokeLinecap="round" />
        <line x1={840} y1={1560} x2={780} y2={540} stroke="#8a96b0" strokeWidth={18} strokeLinecap="round" />
        <rect x={380} y={530} width={440} height={22} rx={10} fill="#aab6cc" />
        <line x1={chainPt(-1, 0)[0]} y1={chainPt(-1, 0)[1]} x2={chainPt(-1, Lc)[0]} y2={chainPt(-1, Lc)[1]} stroke="#cfd8e6" strokeWidth={5} />
        <Person x={kidHip[0]} y={kidHip[1]} s={ks} rot={rot} turn={0.9} pose={kidPose} hands={{ l: unrot(chainPt(-1, Lc - 160)), r: unrot(chainPt(1, Lc - 170)) }} look={KID} t={g} seed={3} face={{ eyes: "happy", mouth: Math.sin(w * g) > 0.5 ? "grin" : "smile" }} />
        <line x1={chainPt(1, 0)[0]} y1={chainPt(1, 0)[1]} x2={chainPt(1, Lc)[0]} y2={chainPt(1, Lc)[1]} stroke="#cfd8e6" strokeWidth={5} />
        <g transform={`translate(${seat[0]} ${seat[1]}) rotate(${-th})`}><rect x={-50} y={-6} width={100} height={14} rx={6} fill="#b07a52" /></g>
        {/* родитель на скамейке читает газету */}
        <rect x={830} y={1470} width={240} height={20} rx={6} fill="#7a5a44" />
        <Person x={950} y={1470} s={1.5} turn={0.4} dir={-1} pose={{ lean: -4, aL: [0, 0], aR: [0, 0], lL: [88, 2], lR: [84, -4] }} feet={{ l: [62, 86], r: [44, 86] }} hands={{ l: [30, -100], r: [74, -104] }} look={PASSER[1]} t={g} seed={8} face={{ mouth: "flat" }}>
          <rect x={20} y={-150} width={70} height={84} rx={3} fill="#efe6d2" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={28} y={-140 + i * 18} width={54} height={6} rx={3} fill="#b8a888" />)}
        </Person>
        <Shadow x={mHip[0]} y={1560} w={80} />
        <Me uid="m4" x={mHip[0]} y={mHip[1]} s={ms} turn={0.8} pose={{ ...STAND, lean: push ? 16 : 4 }} hands={meHands} t={g} face={{ eyes: "happy", mouth: "grin" }} vis={0} glow={0.32} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 5 (28–35): вечеринка и фото без него ===============
const Balloon: React.FC<{ x: number; y: number; c: string; f: number }> = ({ x, y, c, f }) => {
  const b = Math.sin(f / 12 + x) * 10;
  return (
    <g>
      <path d={`M ${x} ${y + 60 + b} Q ${x + 14} ${y + 160} ${x - 4} ${y + 260}`} stroke="#cfd8e6" strokeWidth={2} fill="none" />
      <ellipse cx={x} cy={y + b} rx={44} ry={56} fill={c} />
      <ellipse cx={x - 14} cy={y - 18 + b} rx={9} ry={14} fill="#ffffff" opacity={0.35} />
    </g>
  );
};
const Party: React.FC<{ g: number; photo?: boolean }> = ({ g, photo }) => {
  const GY = 1600, s = 1.7;
  const bob = (i: number) => (photo ? 0 : Math.abs(Math.sin(g / 6 + i)) * 8);
  const friends: [number, (typeof FRIEND1), number][] = [[230, FRIEND2, 0], [390, FRIEND3, 1], [720, PASSER[3], 2]];
  const enter = ip(g, [0, 50], [-120, 555]);
  const mw = walkRig(enter, () => GY, s, 170);
  const posing = g >= 55;
  const flash = !photo && g >= 110;
  return (
    <>
      <rect width={1080} height={1920} fill="#3b3462" />
      <rect x={0} y={1500} width={1080} height={420} fill="#2a2448" />
      <rect x={640} y={420} width={360} height={460} rx={10} fill="#1a2140" />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={660 + rnd(i) * 320} y={560 + rnd(i + 5) * 300} width={10} height={14} fill={YEL} opacity={0.6} />)}
      <rect x={640} y={640} width={360} height={10} fill="#3b3462" />
      <rect x={814} y={420} width={10} height={460} fill="#3b3462" />
      <path d="M 0 300 Q 270 420 540 300 Q 810 420 1080 300" stroke="#cfd8e6" strokeWidth={3} fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 40 + i * 90, y = 300 + Math.sin((x / 540) * Math.PI) * 60 * (x < 540 ? 1 : 1);
        return <path key={i} d={`M ${x - 22} ${y} L ${x + 22} ${y} L ${x} ${y + 44} Z`} fill={[RED, YEL, "#7fc4ff", "#7fd0a0"][i % 4]} />;
      })}
      <Balloon x={120} y={620} c={RED} f={g} />
      <Balloon x={960} y={1000} c={YEL} f={g + 20} />
      <Balloon x={560} y={560} c="#7fc4ff" f={g + 40} />
      {friends.map(([x, look, i]) => (
        <g key={i}>
          <Shadow x={x} y={GY} w={70} />
          <Person x={x} y={GY - 140 * s + bob(i)} s={s} turn={0.15} dir={i === 2 ? -1 : 1} pose={{ ...STAND, lean: i === 1 ? 4 : -3 }} hands={posing && i === 1 ? { r: [60, -260] } : posing && i === 0 ? { r: [60, -150] } : undefined} look={look} t={g + i * 9} seed={i + 2} face={{ eyes: "happy", mouth: posing ? "grin" : "smile" }} />
        </g>
      ))}
      {!photo ? (
        <>
          <Shadow x={940} y={GY} w={70} />
          <Person x={940} y={GY - 140 * s} s={s} turn={0.6} dir={-1} pose={STAND} hands={g > 55 ? { l: [10, -160], r: [36, -160] } : { r: [40, -90] }} look={FRIEND1} t={g} seed={9} face={{ eyes: g > 60 ? "closed" : "happy", mouth: "smile" }}>
            <rect x={g > 55 ? 4 : 30} y={g > 55 ? -186 : -110} width={50} height={36} rx={6} fill={INK} />
            <circle cx={g > 55 ? 0 : 26} cy={g > 55 ? -168 : -92} r={10} fill="#5a6a94" />
          </Person>
          <Me uid="m5" x={enter} y={posing ? GY - 140 * s : mw.hip[1]} s={s} turn={posing ? 0.1 : 0.8} pose={posing ? { ...STAND } : mw.pose} feet={posing ? undefined : mw.feet} hands={posing ? { l: [-70, -270 + Math.sin(g / 3) * 10], r: [70, -270 - Math.sin(g / 3) * 10] } : undefined} t={g} face={g > 120 ? { eyes: "open", brows: 1, mouth: "flat" } : { eyes: "happy", mouth: "grin" }} vis={0} glow={0.32} />
          {flash ? <rect width={1080} height={1920} fill="#ffffff" opacity={ip(g, [110, 112, 120], [0, 1, 0])} /> : null}
        </>
      ) : null}
    </>
  );
};
const Polaroid: React.FC<{ g: number }> = ({ g }) => {
  const dev = ip(g, [0, 30], [0, 1]);
  const ghostHand = ip(g, [32, 50], [500, 0], Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: "#241f40" }}>
      <Full>
        <g transform={`translate(540 960) rotate(${-3 + Math.sin(g / 20)})`}>
          <rect x={-300} y={-360} width={600} height={720} rx={10} fill="#f2f2ee" />
          <svg x={-260} y={-320} width={520} height={520} viewBox="0 0 1080 1080">
            <g transform="translate(0 -680)"><Party g={60} photo /></g>
            <rect width={1080} height={1080} fill="#3a2a20" opacity={1 - dev} />
          </svg>
        </g>
        <ellipse cx={360} cy={1340} rx={70} ry={50} fill={FRIEND1.skin} />
        <rect x={250} y={1350} width={160} height={400} rx={40} fill={FRIEND1.top} />
        <g transform={`translate(${ghostHand} 0)`} opacity={0.45}>
          <rect x={620} y={880} width={600} height={46} rx={23} fill="#cfe6ff" />
          <circle cx={600} cy={903} r={30} fill="#cfe6ff" />
        </g>
      </Full>
    </AbsoluteFill>
  );
};
const Scene5: React.FC = () => {
  const g = useCurrentFrame();
  return g < 150 ? <AbsoluteFill style={{ background: N0 }}><Full><Party g={g} /></Full></AbsoluteFill> : <Polaroid g={g - 150} />;
};

// =============== дождь ===============
const Rain: React.FC<{ f: number; a: number }> = ({ f, a }) => (
  <g opacity={a}>
    {Array.from({ length: 110 }, (_, i) => {
      const x = ((rnd(i) * 1300 + f * 6) % 1300) - 110, y = ((rnd(i + 50) * 2100 + f * (38 + rnd(i) * 10)) % 2100) - 100;
      return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 46} stroke="#b4c8e6" strokeWidth={3} strokeLinecap="round" opacity={0.55} />;
    })}
  </g>
);
const Splashes: React.FC<{ f: number; pts: V[]; a: number }> = ({ f, pts, a }) => (
  <g opacity={a}>
    {pts.map((p, i) => {
      const ph = (f + i * 7) % 12;
      return ph < 6 ? <path key={i} d={`M ${p[0] - 10 - ph * 2} ${p[1] - ph} Q ${p[0]} ${p[1] - 10 - ph * 2} ${p[0] + 10 + ph * 2} ${p[1] - ph}`} stroke="#eaf4ff" strokeWidth={3} fill="none" opacity={1 - ph / 6} /> : null;
    })}
  </g>
);

// =============== СЦЕНА 6 (35–42): один под дождём ===============
const BENCH = { x: 540, y: 1400, s: 2.1 };
const Park: React.FC<{ f: number; flash?: number; far?: boolean; children: React.ReactNode }> = ({ f, flash = 0, far, children }) => (
  <>
    <Sky id={far ? "pk2" : "pk1"} stops={[[0, "#141f3a"], [1, "#2a3a62"]]} />
    <rect width={1080} height={1920} fill="#cfe0ff" opacity={flash * 0.5} />
    <Stars f={f} n={20} h={600} />
    {far ? (
      <>
        <rect x={0} y={980} width={1080} height={140} fill="#2a3450" />
        <rect x={0} y={1120} width={1080} height={220} fill="#1a2238" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 160 + 20} y={1222} width={90} height={10} rx={5} fill="#cfd8e6" opacity={0.5} />)}
        {Array.from({ length: 6 }, (_, i) => <rect key={"b" + i} x={i * 190 - 30} y={500 + rnd(i) * 160} width={170} height={500} fill={i % 2 ? "#22305a" : "#283868"} />)}
      </>
    ) : null}
    <rect x={0} y={far ? 1340 : 1600} width={1080} height={far ? 580 : 320} fill="#22304e" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={200 + i * 340} cy={(far ? 1500 : 1700) + (i % 2) * 60} rx={120} ry={18} fill="#3a4c74" opacity={0.6} />)}
    <path d={`M ${far ? 980 : 880} ${far ? 640 : 560} L ${far ? 840 : 680} ${far ? 1500 : 1700} L ${far ? 1080 : 1080} ${far ? 1500 : 1700} Z`} fill={YEL} opacity={0.1} />
    <rect x={(far ? 980 : 880) - 7} y={far ? 640 : 560} width={14} height={far ? 860 : 1100} fill="#151d33" />
    <rect x={(far ? 980 : 880) - 24} y={(far ? 640 : 560) - 30} width={48} height={32} rx={6} fill={YEL} />
    {children}
  </>
);
const Bench: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-210} y={-150} width={420} height={18} rx={6} fill="#6a4a36" />
    <rect x={-210} y={-110} width={420} height={18} rx={6} fill="#6a4a36" />
    <rect x={-220} y={-6} width={440} height={22} rx={8} fill="#8a5a3c" />
    <rect x={-190} y={16} width={16} height={190} fill="#4a3a30" />
    <rect x={174} y={16} width={16} height={190} fill="#4a3a30" />
  </g>
);
const sitPose = (lean: number, head = 0): Pose => ({ lean, head, aL: [0, 0], aR: [0, 0], lL: [88, 4], lR: [84, -2] });
const SIT_FEET = { l: [64, 96] as V, r: [46, 98] as V };

const Scene6: React.FC = () => {
  const g = useCurrentFrame();
  const { x, y, s } = BENCH;
  const rainA = ip(g, [8, 40], [0, 1]);
  const look = ip(g, [150, 200], [0, 1], Easing.inOut(Easing.quad));
  const pose = sitPose(lerp(20, -3, look), lerp(14, -6, look));
  const glow = lerp(0.3, 0.55, ip(g, [30, 120], [0, 1]));
  const flash = ip(g, [118, 120, 128], [0, 1, 0]);
  const sh = toWorld([0, -112], [x, y], s);
  const splash: V[] = [[sh[0] - 20, sh[1] - 140], [sh[0] + 30, sh[1] - 120], [sh[0] - 50, sh[1] + 4], [sh[0] + 50, sh[1] + 10], [x + 120, y - 30], [x + 90, y + 4]];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={1.0}>
        <Full>
          <Park f={g} flash={flash}>
            <Bench x={x} y={y + 6} />
            <Me uid="m6" x={x} y={y} s={s} turn={0.3} pose={pose} feet={SIT_FEET} hands={{ l: [52, -12], r: [66, -6] }} t={g} face={{ eyes: look > 0.5 ? "open" : "closed", brows: 1, mouth: "flat" }} vis={0} glow={glow} />
            <Splashes f={g} pts={splash} a={rainA} />
            <Rain f={g} a={rainA} />
          </Park>
        </Full>
      </Cam>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 7 (42–49): девочка его видит ===============
const Scene7: React.FC = () => {
  const g = useCurrentFrame();
  const momX = g < 60 ? 960 - g * 2 : 840;
  const momS = 1.0, girlS = 0.72, FY = 1110;
  const mw = walkRig(-momX, () => FY, momS, 120);
  const girlX = momX - 90;
  const gw = walkRig(-girlX, () => FY, girlS, 90);
  const girlStop = g >= 40;
  const girlWave = g >= 70 && g < 160;
  const jump = g >= 160 ? Math.abs(Math.sin((g - 160) / 4)) * 26 : 0;
  const meWave = g >= 100 && g < 175;
  const surprised = g >= 75;
  const bx = 250, by = 1590, bs = 1.5;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Park f={g + 210} far>
          {/* мама с зонтом и девочка на той стороне улицы */}
          <Person x={momX} y={g < 60 ? mw.hip[1] : FY - 140 * momS} s={momS} dir={-1} turn={g < 60 ? 0.9 : 0.5} pose={g < 60 ? mw.pose : STAND} feet={g < 60 ? mw.feet : undefined} hands={{ l: [24, -150], r: [-30, -60] }} look={MOM} t={g} seed={5} face={{ mouth: "flat" }}>
            <line x1={24} y1={-150} x2={24} y2={-300} stroke="#2a2a3a" strokeWidth={5} />
            <path d="M -96 -290 Q 24 -400 144 -290 Z" fill={RED} />
          </Person>
          <Person x={girlX} y={(girlStop ? FY - 140 * girlS : gw.hip[1]) - jump} s={girlS} dir={girlStop ? 1 : -1} turn={girlStop ? 0.25 : 0.9} pose={girlStop ? STAND : gw.pose} feet={girlStop ? undefined : gw.feet} hands={girlWave ? { r: [-30 + Math.sin(g / 2.5) * 26, -250] } : jump > 0 ? { l: [-60, -250], r: [60, -250] } : undefined} look={GIRL} t={g} seed={6} face={{ eyes: girlStop ? "happy" : "open", mouth: girlStop ? "grin" : "smile" }} />
          <Bench x={bx} y={by + 6} k={0.72} />
          <Me uid="m7" x={bx} y={by} s={bs} turn={0.45} pose={sitPose(surprised ? -4 : 16, surprised ? -4 : 12)} feet={SIT_FEET} hands={meWave ? { l: [52, -12], r: [60 + Math.sin(g / 3) * 24, -250] } : { l: [52, -12], r: [66, -6] }} t={g} face={surprised ? (g > 100 ? { eyes: "happy", mouth: "smile" } : { eyes: "wide", brows: 1, mouth: "o" }) : { eyes: "closed", brows: 1, mouth: "flat" }} vis={0} glow={0.55} />
          <Rain f={g + 210} a={1} />
        </Park>
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 8 (49–55): он снова видим ===============
const Scene8: React.FC = () => {
  const g = useCurrentFrame();
  const { x, y, s } = BENCH;
  const cut = ip(g, [20, 110], [1640, 700], Easing.inOut(Easing.quad));
  const rainA = ip(g, [0, 110], [1, 0]);
  const stand = ip(g, [110, 135], [0, 1], Easing.inOut(Easing.quad));
  const hipY = lerp(y, 1600 - 140 * s, stand);
  const feet = { l: [lerp(SIT_FEET.l[0], -10, stand), lerp(SIT_FEET.l[1], (1600 - hipY) / s, stand)] as V, r: [lerp(SIT_FEET.r[0], 14, stand), lerp(SIT_FEET.r[1], (1600 - hipY) / s, stand)] as V };
  const lookHands = g >= 135 && g < 160;
  const wave = g >= 160;
  const pose = stand > 0 ? { ...STAND, lean: lerp(-3, 0, stand) } : sitPose(-3, -6);
  const hands = lookHands ? { l: [-30, -96] as V, r: [36, -100] as V } : wave ? { l: [-20, -30] as V, r: [70 + Math.sin(g / 3) * 24, -260] as V } : { l: [52, -12] as V, r: [66, -6] as V };
  const face = g < 110 ? { eyes: "wide" as const, brows: 1, mouth: "o" as const } : { eyes: "happy" as const, mouth: "grin" as const };
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Park f={g + 420} flash={0}>
          <circle cx={820} cy={300} r={60} fill="#f2ead2" opacity={ip(g, [60, 140], [0, 1])} />
          <Bench x={x} y={y + 6} />
          <Me uid="m8" x={x} y={hipY} s={s} turn={stand > 0 ? 0.35 : 0.3} pose={pose} feet={feet} hands={hands} t={g} face={face} cut={cut} glow={0.5 * (1 - ip(g, [100, 120], [0, 1]))} />
          {g >= 20 && g < 112 ? <SparkLine y={cut} x={x + 40} w={300} f={g} /> : null}
          {g >= 110 ? Array.from({ length: 10 }, (_, i) => {
            const a = i * 36 * D, r = 160 + (g - 110) * 6;
            return <circle key={i} cx={x + Math.cos(a) * r} cy={hipY - 150 + Math.sin(a) * r} r={6} fill={YEL} opacity={ip(g, [110, 150], [1, 0])} />;
          }) : null}
          <Rain f={g + 420} a={rainA} />
        </Park>
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 9 (55–60): утро, отражение вернулось… почти ===============
const Scene9: React.FC = () => {
  const g = useCurrentFrame();
  const s = 2.1, hip: V = [250, 1500 - 140 * 2.1];
  const flick = (g >= 112 && g < 115) || (g >= 118 && g < 121) || g >= 124;
  const bOff = g < 100 ? Math.sin(g * 1.3) * 7 : 0;
  const turn = ip(g, [122, 132], [0.75, 0.1]);
  const handR: V = g < 122 ? [36 + bOff, -136] : [36, -100];
  const hw = toWorld(handR, hip, s);
  const wink = g >= 100 && g < 110;
  const face = g >= 122 ? { eyes: "wide" as const, brows: 1, mouth: "o" as const } : wink ? { eyes: "happy" as const, mouth: "grin" as const } : { eyes: "open" as const, mouth: "smile" as const };
  const zoom = ip(g, [124, 150], [1, 1.7], Easing.in(Easing.cubic));
  const reflX = MIR.x + MIR.w - 150;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={zoom} ox={hip[0] + 20} oy={hip[1] - 330}>
        <Full>
          <Bathroom morning mirror={
            <g>
              <Me uid="r9" x={reflX} y={hip[1] - 40} s={1.75} dir={-1} turn={0.75} pose={STAND} hands={{ r: handR, l: [-14, -12] }} t={g} face={face} vis={flick ? 0 : 1} glow={0.3} />
              <Brush x={reflX - (36 + bOff) * 1.75 + 6} y={hip[1] - 40 - 136 * 1.75} a={180} foam={g < 100} />
            </g>
          }>
            <Shadow x={hip[0]} y={1500} w={90} />
            <Me uid="m9" x={hip[0]} y={hip[1]} s={s} turn={turn} pose={STAND} hands={{ l: [-14, -12], r: handR }} t={g} face={face} vis={flick ? 0 : 1} glow={0.32} />
            <Brush x={hw[0] - 6} y={hw[1]} foam={g < 100} />
          </Bathroom>
        </Full>
      </Cam>
      {flick && g < 124 ? <AbsoluteFill style={{ background: "#cfe6ff", opacity: 0.15 }} /> : null}
    </AbsoluteFill>
  );
};

// =============== сборка ===============
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity: 0.1, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <Img src={staticFile("towers/grain.png")} style={{ position: "absolute", width: 1600, height: 2800, left: -(rnd(f) * 500), top: -(rnd(f + 1) * 860) }} />
  </AbsoluteFill>
);

export const InvisibleFilm: React.FC = () => {
  const f = useCurrentFrame();
  const cut = (a: number) => ip(f, [a - 1, a, a + 5], [0, 1, 0]);
  const whip = Math.max(...[210, 420, 630, 840, 990, 1050, 1260, 1470, 1650].map(cut));
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Sequence from={0} durationInFrames={210}><Scene1 /></Sequence>
      <Sequence from={210} durationInFrames={210}><Scene2 /></Sequence>
      <Sequence from={420} durationInFrames={210}><Scene3 /></Sequence>
      <Sequence from={630} durationInFrames={210}><Scene4 /></Sequence>
      <Sequence from={840} durationInFrames={210}><Scene5 /></Sequence>
      <Sequence from={1050} durationInFrames={210}><Scene6 /></Sequence>
      <Sequence from={1260} durationInFrames={210}><Scene7 /></Sequence>
      <Sequence from={1470} durationInFrames={180}><Scene8 /></Sequence>
      <Sequence from={1650} durationInFrames={150}><Scene9 /></Sequence>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px 50px rgba(5,8,18,0.6)", pointerEvents: "none" }} />
      <Grain f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: whip * 0.15 }} />
      <Audio src={staticFile("invisible/sound.wav")} />
    </AbsoluteFill>
  );
};
// неиспользуемые цвета палитры оставлены для будущих сцен
export const _PAL = [N2, N4];
