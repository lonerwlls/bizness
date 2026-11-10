// Тестовая сцена «Коридор» (15 с): два персонажа встречаются, разговаривают жестами, передают карту, реагируют.
// Рендер: npx remotion render src/brand/corridor/index.tsx Corridor videos/corridor_test.mp4
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, interpolate, registerRoot, staticFile, useCurrentFrame } from "remotion";
import { Expr, HERO, JANITOR, OL, P, Pose, Toon, rigGeo, walk } from "./rig";

const W = 1920, H = 1080, LEN = 450, FLOOR = 870, S = 0.75;
const ease = Easing.inOut(Easing.cubic);
const ip = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** дорожка ключей для точки: [кадр, [x, y]] с плавностью между ключами */
const trackP = (f: number, keys: [number, P][]): P => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f < keys[i][0]) {
    const [f0, a] = keys[i - 1], [f1, b] = keys[i], t = ease((f - f0) / (f1 - f0));
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  return keys[keys.length - 1][1];
};
const track = (f: number, keys: [number, number][]) => trackP(f, keys.map(([k, v]) => [k, [v, 0]] as [number, P]))[0];
const talk = (f: number, seed = 0) => Math.max(0, Math.sin(f * 0.95 + seed) * 0.55 + Math.sin(f * 2.2 + seed * 3) * 0.45);
/** моргание: каждые ~2–3 с, 4 кадра */
const blinkAt = (f: number, seed: number, extra: number[] = []) => {
  for (const b of extra) { const k = f - b; if (k >= 0 && k < 4) return [0.6, 1, 1, 0.6][k]; }
  const per = 74 + seed * 13, k = (f + seed * 31) % per;
  return k < 4 ? [0.6, 1, 1, 0.6][k] : 0;
};
const toWorld = (x: number, p: P): P => [x + p[0] * S, FLOOR + p[1] * S];
const toLocal = (x: number, w: P): P => [(w[0] - x) / S, (w[1] - FLOOR) / S];

// ---------------- коридор в перспективе ----------------
const VP: P = [1020, 470], FOC = 900, CAMH = 1.6;
const pr = (X: number, Y: number, Z: number): P => [VP[0] + (X * FOC) / Z, VP[1] + ((CAMH - Y) * FOC) / Z];
const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");
const WX = 3.6, HT = 3.0, ZN = 1.0, ZF = 26;
const Corridor: React.FC = () => {
  const doors = [5.5, 9.5, 14, 19];
  return (
    <g>
      <defs>
        <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#d9b98a" /><stop offset="100%" stopColor="#ecd6ad" /></linearGradient>
        <linearGradient id="wallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="#d2b080" /><stop offset="100%" stopColor="#ead2a6" /></linearGradient>
        <linearGradient id="floorG" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#b98b55" /><stop offset="100%" stopColor="#d9b582" /></linearGradient>
        <radialGradient id="glowC" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,244,205,0.95)" /><stop offset="100%" stopColor="rgba(255,244,205,0)" /></radialGradient>
        <radialGradient id="pool" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,240,200,0.45)" /><stop offset="100%" stopColor="rgba(255,240,200,0)" /></radialGradient>
        <linearGradient id="farFog" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(255,236,190,0)" /><stop offset="50%" stopColor="rgba(255,236,190,0.55)" /><stop offset="100%" stopColor="rgba(255,236,190,0)" /></linearGradient>
      </defs>
      {/* потолок, стены, пол */}
      <polygon points={poly([pr(-WX, HT, ZN), pr(WX, HT, ZN), pr(WX, HT, ZF), pr(-WX, HT, ZF)])} fill="#f1e1bd" />
      <polygon points={poly([pr(-WX, HT, ZN), pr(-WX, HT, ZF), pr(-WX, 0, ZF), pr(-WX, 0, ZN)])} fill="url(#wallL)" />
      <polygon points={poly([pr(WX, HT, ZN), pr(WX, HT, ZF), pr(WX, 0, ZF), pr(WX, 0, ZN)])} fill="url(#wallR)" />
      <polygon points={poly([pr(-WX, 0, ZN), pr(WX, 0, ZN), pr(WX, 0, ZF), pr(-WX, 0, ZF)])} fill="url(#floorG)" />
      {/* дальняя стена с окном-светом */}
      <polygon points={poly([pr(-WX, HT, ZF), pr(WX, HT, ZF), pr(WX, 0, ZF), pr(-WX, 0, ZF)])} fill="#e4c896" />
      <polygon points={poly([pr(-1.2, 2.5, ZF), pr(1.2, 2.5, ZF), pr(1.2, 0.6, ZF), pr(-1.2, 0.6, ZF)])} fill="#fff4d2" stroke={OL} strokeWidth={2} />
      <circle cx={pr(0, 1.5, ZF)[0]} cy={pr(0, 1.5, ZF)[1]} r={140} fill="url(#glowC)" />
      {/* нижние панели стен и поручни */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <polygon points={poly([pr(s * WX, 1.0, ZN), pr(s * WX, 1.0, ZF), pr(s * WX, 0, ZF), pr(s * WX, 0, ZN)])} fill="#a77d4c" opacity={0.75} />
          <polyline points={poly([pr(s * WX, 1.0, ZN), pr(s * WX, 1.0, ZF)])} stroke="#6e4c2a" strokeWidth={10} fill="none" />
          <polyline points={poly([pr(s * WX, 0.08, ZN), pr(s * WX, 0.08, ZF)])} stroke="#5a3c22" strokeWidth={8} fill="none" />
        </g>
      ))}
      {/* плитка пола */}
      {Array.from({ length: 9 }, (_, i) => -WX + i * 0.9).map((X) => <polyline key={"x" + X} points={poly([pr(X, 0, ZN), pr(X, 0, ZF)])} stroke="rgba(110,70,30,0.22)" strokeWidth={2} fill="none" />)}
      {[1.3, 1.7, 2.2, 2.9, 3.8, 5, 6.6, 8.6, 11.3, 15, 20].map((Z) => <polyline key={"z" + Z} points={poly([pr(-WX, 0, Z), pr(WX, 0, Z)])} stroke="rgba(110,70,30,0.22)" strokeWidth={2} fill="none" />)}
      {/* двери с окошками и табличками */}
      {doors.map((Z, i) => [-1, 1].map((s) => {
        const z0 = Z, z1 = Z + 1.1, X = s * WX;
        const q = (y: number, z: number) => pr(X, y, z);
        return (
          <g key={`${i}${s}`}>
            <polygon points={poly([q(2.25, z0 - 0.08), q(2.25, z1 + 0.08), q(0, z1 + 0.08), q(0, z0 - 0.08)])} fill="#6e4c2a" />
            <polygon points={poly([q(2.15, z0), q(2.15, z1), q(0, z1), q(0, z0)])} fill={i % 2 ? "#8a5a34" : "#7a5030"} stroke={OL} strokeWidth={2} />
            <polygon points={poly([q(1.85, z0 + 0.3), q(1.85, z0 + 0.8), q(1.25, z0 + 0.8), q(1.25, z0 + 0.3)])} fill="#f6e2b0" opacity={0.85} />
            <circle cx={q(1.05, z0 + (s < 0 ? 0.95 : 0.15))[0]} cy={q(1.05, z0 + 0.95)[1]} r={Math.max(2, 70 / Z)} fill="#e8c060" />
            <polygon points={poly([q(2.55, z0 + 0.3), q(2.55, z0 + 0.8), q(2.35, z0 + 0.8), q(2.35, z0 + 0.3)])} fill="#f4ead2" stroke={OL} strokeWidth={1.5} />
          </g>
        );
      }))}
      {/* доска объявлений и часы на левой стене */}
      <polygon points={poly([pr(-WX, 2.2, 2.4), pr(-WX, 2.2, 3.6), pr(-WX, 1.4, 3.6), pr(-WX, 1.4, 2.4)])} fill="#b07a46" stroke={OL} strokeWidth={4} />
      {[[2.55, 2.0, "#f6efe0"], [2.95, 1.9, "#f2c46a"], [3.3, 2.05, "#e8e0d0"]].map(([z, y, c], i) => <polygon key={i} points={poly([pr(-WX, y as number, z as number), pr(-WX, y as number, (z as number) + 0.25), pr(-WX, (y as number) - 0.35, (z as number) + 0.25), pr(-WX, (y as number) - 0.35, z as number)])} fill={c as string} />)}
      <g transform={`translate(${pr(WX, 2.4, 7.5)[0]} ${pr(WX, 2.4, 7.5)[1]})`}><ellipse rx={34} ry={46} fill="#f6efe0" stroke={OL} strokeWidth={5} /><path d="M 0 0 L 0 -26 M 0 0 L 16 8" stroke={OL} strokeWidth={4} strokeLinecap="round" /></g>
      {/* скамья и кадка с растением справа */}
      <g>
        <polygon points={poly([pr(WX - 0.5, 0.45, 3.0), pr(WX - 0.5, 0.45, 4.6), pr(WX, 0.45, 4.6), pr(WX, 0.45, 3.0)])} fill="#9a6a3c" stroke={OL} strokeWidth={4} />
        {[3.1, 4.5].map((z) => <polyline key={z} points={poly([pr(WX - 0.45, 0.45, z), pr(WX - 0.45, 0, z)])} stroke={OL} strokeWidth={6} />)}
      </g>
      {/* лампы на потолке, свет на полу */}
      {[3, 6, 10, 15, 21].map((Z) => (
        <g key={Z}>
          <polygon points={poly([pr(-0.7, HT, Z), pr(0.7, HT, Z), pr(0.7, HT, Z + 0.7), pr(-0.7, HT, Z + 0.7)])} fill="#fff8e0" stroke="#c8a870" strokeWidth={2} />
          <ellipse cx={pr(0, HT, Z + 0.35)[0]} cy={pr(0, HT, Z + 0.35)[1] + 10} rx={1100 / Z} ry={280 / Z} fill="url(#glowC)" />
          <ellipse cx={pr(0, 0, Z + 0.35)[0]} cy={pr(0, 0, Z + 0.35)[1]} rx={1500 / Z} ry={420 / Z} fill="url(#pool)" />
        </g>
      ))}
      <rect x={VP[0] - 420} y={VP[1] - 120} width={840} height={240} fill="url(#farFog)" />
    </g>
  );
};

// тележка уборщика
const CART_X = 1420;
const Cart: React.FC = () => (
  <g transform={`translate(${CART_X} ${FLOOR}) scale(${S})`}>
    <ellipse cx={20} cy={4} rx={130} ry={14} fill="rgba(70,40,15,0.28)" />
    <rect x={-60} y={-300} width={14} height={300} fill="#5a6270" stroke={OL} strokeWidth={5} />
    <rect x={-60} y={-130} width={200} height={100} rx={10} fill="#e8b23a" stroke={OL} strokeWidth={6} />
    <path d="M -40 -130 L 120 -130 L 110 -190 L -30 -190 Z" fill="#6fa3c8" stroke={OL} strokeWidth={6} />
    <ellipse cx={40} cy={-190} rx={72} ry={14} fill="#8cc0e0" stroke={OL} strokeWidth={5} />
    {[-40, 120].map((x) => <circle key={x} cx={x} cy={-14} r={16} fill="#3a3a40" stroke={OL} strokeWidth={5} />)}
    <rect x={60} y={-250} width={26} height={60} rx={6} fill="#d8443a" stroke={OL} strokeWidth={5} />
  </g>
);
const MopShape: React.FC<{ top: P; bot: P }> = ({ top, bot }) => (
  <g>
    <path d={`M ${top[0]} ${top[1]} L ${bot[0]} ${bot[1] - 18}`} stroke={OL} strokeWidth={13} strokeLinecap="round" />
    <path d={`M ${top[0]} ${top[1]} L ${bot[0]} ${bot[1] - 18}`} stroke="#c89a62" strokeWidth={7} strokeLinecap="round" />
    <path d={`M ${bot[0] - 44} ${bot[1]} Q ${bot[0]} ${bot[1] - 30} ${bot[0] + 44} ${bot[1]} Q ${bot[0]} ${bot[1] + 10} ${bot[0] - 44} ${bot[1]} Z`} fill="#e9e2d2" stroke={OL} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${bot[0] - 36 + i * 14} ${bot[1] - 6} l ${-3 + i} 10`} stroke="#b8b0a0" strokeWidth={3} />)}
  </g>
);
const MapShape: React.FC<{ c: P; rot: number; s?: number }> = ({ c, rot, s = 1 }) => (
  <g transform={`translate(${c[0]} ${c[1]}) rotate(${rot}) scale(${s})`}>
    <path d="M -46 -32 L -16 -36 L 16 -30 L 46 -34 L 46 30 L 16 34 L -16 28 L -46 32 Z" fill="#f6ecd2" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -16 -36 L -16 28 M 16 -30 L 16 34" stroke="#d4c4a0" strokeWidth={3} />
    <path d="M -36 18 Q -20 -2 0 6 Q 18 14 30 -16" stroke="#d8443a" strokeWidth={4} fill="none" strokeDasharray="6 5" />
    <path d="M 24 -24 l 12 12 M 36 -24 l -12 12" stroke="#d8443a" strokeWidth={4} />
  </g>
);
const Bubble: React.FC<{ at: P; text: string; t: number; side?: number }> = ({ at, text, t, side = 1 }) => {
  if (t <= 0) return null;
  const k = Math.min(1, t * 4), sc = k < 1 ? 0.6 + 0.4 * Easing.out(Easing.back(2.5))(k) : 1, w = 30 + text.length * 22;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${sc})`}>
      <path d={`M ${-w / 2} -40 Q ${-w / 2} -70 ${-w / 2 + 24} -70 L ${w / 2 - 24} -70 Q ${w / 2} -70 ${w / 2} -40 Q ${w / 2} -12 ${w / 2 - 24} -12 L ${side * 10} -12 L ${side * -6} 8 L ${side * -12} -12 L ${-w / 2 + 24} -12 Q ${-w / 2} -12 ${-w / 2} -40 Z`} fill="#fffaf0" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <text x={0} y={-30} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={30} fill={OL}>{text}</text>
    </g>
  );
};

// ---------------- хронометраж ----------------
const HERO_X0 = 330, HERO_STOP = 1040, WALK_END = 108;
/** уборщик делает шаг к герою перед похлопыванием и возвращается */
const janX = (f: number) => 1290 - 48 * ip(f, [350, 366], [0, 1]) + 48 * ip(f, [398, 414], [0, 1]);
const heroX = (f: number) => {
  if (f < WALK_END) return lerp(HERO_X0, HERO_STOP, ip(f, [0, WALK_END], [0, 1], Easing.out(Easing.sin)));
  if (f < 396) return HERO_STOP;
  return HERO_STOP - (f - 396) * 9.4;
};
const heroPose = (f: number, mapHeldByHero: () => P): Pose => {
  const x = heroX(f);
  const walking = f < WALK_END || f >= 396;
  const dir = f >= 396 ? -1 : 1;
  const dist = f < WALK_END ? (x - HERO_X0) / S : (HERO_STOP - x) / S + 7;
  const w = walk(dist, dir), settle = ip(f, [WALK_END - 6, WALK_END + 4], [1, 0]);
  const stand = { footL: [-26, 0] as P, footR: [26, 0] as P, hip: [0, -228 + Math.sin(f / 16) * 1.5] as P };
  const base = walking && f < WALK_END ? {
    footL: [lerp(stand.footL[0], w.footL[0], settle), lerp(0, w.footL[1], settle)] as P,
    footR: [lerp(stand.footR[0], w.footR[0], settle), lerp(0, w.footR[1], settle)] as P,
    hip: [0, lerp(stand.hip[1], w.hip[1], settle)] as P,
  } : f >= 396 ? { footL: w.footL, footR: w.footR, hip: w.hip } : stand;
  // кисти
  const holdMap: [number, P][] = [[0, [-30, -300]], [WALK_END, [-30, -300]]];
  const hL = f >= 396 ? [-60 - w.swing * 26, -170] as P : trackP(f, [...holdMap, [118, [-26, -330]], [150, [-26, -330]], [162, [-62, -168]], [500, [-62, -168]]]);
  const hR = f >= 396 ? [40 + w.swing * 26, -180] as P : trackP(f, [[0, [34, -300]], [WALK_END, [34, -300]], [118, [30, -330]], [150, [30, -330]], [163, [128, -340]], [166, [128, -340]], [180, [62, -175]],
    [244, [62, -175]], [258, [24, -470]], [282, [24, -470]], [300, [90, -330]], [326, [96, -330]], [338, [110, -380]], [346, [62, -175]],
    [352, [62, -175]], [364, [124, -330]], [372, [110, -300]], [388, [60, -200]], [396, [40, -180]]]);
  // голова: поворот, наклон, кивок
  const lookDownAtMap = f < 112 ? 1 : 0;
  const turn = f >= 392 ? track(f, [[392, 0.6], [402, -0.7]]) : f >= 236 && f < 252 ? track(f, [[236, 0.6], [243, -0.65], [252, -0.65]]) : f >= 252 && f < 262 ? track(f, [[252, -0.65], [262, 0.55]]) : 0.55;
  const nod = lookDownAtMap ? 14 : f >= 300 && f < 326 ? Math.abs(Math.sin(f * 0.6)) * -8 : 0;
  // выражение лица
  let expr: Expr;
  if (f < 112) expr = { browSkew: 1, browH: 0.3, mouth: "wavy", look: [0.4, 0.9] };
  else if (f < 140) expr = { browH: 1, mouth: "o", open: 0.2, eyes: "dot" };
  else if (f < 200) expr = { browH: 0.6, mouth: "smile", eyes: "dot" };
  else if (f < 236) expr = { browH: 1.4, eyes: "wide", mouth: "o", open: 0.6 };
  else if (f < 300) expr = { browH: 0.8, browA: -1, mouth: "wavy", sweat: true, blush: true, eyes: f > 258 && f < 284 ? "half" : "dot" };
  else if (f < 328) expr = { eyes: "happy", mouth: "laugh", open: Math.abs(Math.sin(f * 0.6)), blush: true };
  else if (f < 346) expr = { browH: 0.6, mouth: "open", open: talk(f, 1), eyes: "dot" };
  else expr = { browH: 0.4, mouth: "grin", eyes: f > 396 ? "happy" : "dot" };
  expr.blink = expr.eyes === "happy" ? 0 : blinkAt(f, 1, [110, 200, 300, 392]);
  void mapHeldByHero;
  return { ...base, lean: f < WALK_END ? 4 * settle : f >= 396 ? -4 : f >= 300 && f < 328 ? -4 + Math.sin(f * 0.6) * 2 : 0, handL: hL, handR: hR, turn, tilt: f < 112 ? 6 : f >= 200 && f < 236 ? -5 : 0, nod, expr, dir: walking ? dir : 0 };
};
const janPose = (f: number, heroShoulderW: P, mapHandW: P): Pose => {
  const JAN_X = janX(f);
  const stepping = (f >= 350 && f < 366) || (f >= 398 && f < 414);
  const stepK = stepping ? Math.sin(((f - (f < 380 ? 350 : 398)) / 16) * Math.PI) : 0;
  const mopping = f < 138;
  const sway = mopping ? Math.sin(f / 9) : 0;
  const laugh = f >= 200 && f < 228;
  const hip: P = [sway * 8, -228 + (laugh ? Math.abs(Math.sin(f * 0.9)) * -6 : Math.sin(f / 18) * 1.5)];
  // ручка швабры при мытье пола: верх T, низ B (локально)
  const T: P = [-40 + sway * 26, -430], B: P = [-170 + Math.sin(f / 9) * 80, 0];
  const onHandle = (t: number): P => [lerp(T[0], B[0], t), lerp(T[1], B[1], t)];
  let hL: P, hR: P;
  if (mopping) { hR = onHandle(0.1); hL = onHandle(0.42); }
  else {
    hR = trackP(f, [[138, onHandle(0.1)], [156, [88, -350]], [164, [70, -190]], [228, [70, -190]], [240, [-150, -430]], [262, [-150, -430]], [276, [70, -190]],
      [400, [70, -190]], [410, [120, -470]], [418, [140, -500]], [426, [110, -490]], [434, [140, -500]], [442, [110, -490]], [450, [140, -500]]]);
    const toHeroMap = toLocal(JAN_X, mapHandW);
    const pat = toLocal(JAN_X, heroShoulderW);
    hL = trackP(f, [[138, onHandle(0.42)], [146, [-60, -190]], [150, [-60, -190]], [163, toHeroMap], [166, toHeroMap], [184, [-40, -360]], [228, [-40, -360]],
      [238, [-60, -400]], [262, [-60, -400]], [276, [-40, -360]], [346, [-40, -360]], [360, [-118, -330]], [366, [-118, -330]], [372, [pat[0] + 6, pat[1] - 4]],
      [378, [pat[0], pat[1] + 6]], [383, [pat[0] + 6, pat[1] - 4]], [388, [pat[0], pat[1] + 6]], [398, [-60, -180]]]);
    if (f >= 166 && f < 228) hL = [hL[0] + (laugh ? Math.sin(f * 1.3) * 4 : 0), hL[1]];
  }
  const turn = f < 92 ? 0.15 : track(f, [[92, 0.15], [104, -0.6], [236, -0.6], [244, -0.75], [262, -0.75], [270, -0.6], [400, -0.6], [412, -0.3]]);
  const reading = f >= 176 && f < 200;
  let expr: Expr;
  if (f < 96) expr = { eyes: "half", mouth: "smile", browH: -0.2 };
  else if (f < 176) expr = { browH: 0.8, mouth: f < 150 ? "flat" : "smile", eyes: "dot", look: [-0.8, 0] };
  else if (reading) expr = { browH: -0.3, browA: 0.6, mouth: "flat", eyes: "dot", look: [0, 0.9] };
  else if (laugh) expr = { eyes: "happy", mouth: "laugh", open: Math.abs(Math.sin(f * 0.9)) };
  else if (f < 270) expr = { browH: 0.6, mouth: "open", open: talk(f, 2), eyes: "dot", look: [-0.9, 0] };
  else if (f < 400) expr = { browH: 0.4, mouth: f > 360 && f < 392 ? "open" : "smile", open: talk(f, 5) * 0.7, eyes: "dot", look: [-0.8, 0] };
  else expr = { eyes: "happy", mouth: "grin" };
  expr.blink = expr.eyes === "happy" ? 0 : blinkAt(f, 3, [176, 270]);
  return { footL: [-28, f < 380 ? -stepK * 26 : 0], footR: [28, f >= 380 ? -stepK * 26 : 0], hip: [hip[0], hip[1] - stepK * 6] as P, lean: mopping ? sway * -3 : laugh ? -6 + Math.sin(f * 0.9) * 3 : reading ? 4 : 0,
    handL: hL, handR: hR, turn, tilt: laugh ? 8 : reading ? -4 : 0, nod: reading ? 12 : 0, expr };
};

// ---------------- камера ----------------
type Cam = { s: number; cx: number; cy: number };
const camAt = (f: number): Cam => {
  if (f < 135) return { s: lerp(1.05, 1.12, f / 135), cx: lerp(820, 1010, ip(f, [0, 120], [0, 1])), cy: lerp(560, 600, f / 135) };
  if (f < 270) return { s: lerp(1.9, 2.0, (f - 135) / 135), cx: 1140, cy: 625 };
  if (f < 345) return { s: lerp(3.3, 3.45, (f - 270) / 75), cx: 1080, cy: 535 };
  const k = ip(f, [345, 362], [0, 1]);
  const follow = f > 396 ? (f - 396) * 6 : 0;
  return { s: lerp(3.45, 1.7, k), cx: lerp(1080, 1120, k) - follow, cy: lerp(535, 640, k) };
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  // предварительный проход: где руки героя (нужно уборщику для передачи карты и похлопывания)
  const hx = heroX(f);
  const hp0 = heroPose(f, () => [0, 0]);
  const hg = rigGeo(hp0);
  const heroHR = toWorld(hx, hg.hR), heroHL = toWorld(hx, hg.hL), heroShR = toWorld(hx, hg.shR);
  const JAN_X = janX(f);
  const jp = janPose(f, heroShR, heroHR);
  const jg = rigGeo(jp);
  const janHL = toWorld(JAN_X, jg.hL), janHR = toWorld(JAN_X, jg.hR);
  // карта: у героя в двух руках → в правой → у уборщика → снова у героя
  let mapC: P, mapRot = 0, mapS = 1;
  if (f < 150) { mapC = [(heroHL[0] + heroHR[0]) / 2, (heroHL[1] + heroHR[1]) / 2 - 6]; mapRot = 180; }
  else if (f < 165) { mapC = [heroHR[0] + 10, heroHR[1] - 8]; mapRot = 180 - (f - 150) * 2; }
  else if (f < 365) { mapC = [janHL[0] - 6, janHL[1] - 10]; mapRot = 150 + ip(f, [212, 228], [0, 210]) + (f >= 228 ? 0 : 0); mapS = f >= 176 && f < 200 ? 1.1 : 1; }
  else { mapC = [heroHR[0] + 4, heroHR[1] - 6]; mapRot = 0; mapS = 0.85; }
  // швабра
  const mopping = f < 138;
  const sway = mopping ? Math.sin(f / 9) : 0;
  let mopTop: P, mopBot: P;
  if (mopping) { mopTop = toWorld(JAN_X, [-40 + sway * 26, -430]); mopBot = toWorld(JAN_X, [-170 + Math.sin(f / 9) * 80, 0]); }
  else if (f < 158) { const k = ip(f, [138, 158], [0, 1]); mopTop = [janHR[0] - 6, janHR[1] - 40]; mopBot = [lerp(toWorld(JAN_X, [-170 + Math.sin(138 / 9) * 80, 0])[0], CART_X - 20, k), FLOOR]; }
  else { mopTop = [CART_X + 16, FLOOR - 0.75 * 330]; mopBot = [CART_X - 20, FLOOR]; }
  const cam = camAt(f), blur = Math.max(0, (cam.s - 1.3) * 1.6);
  const heroHead = toWorld(hx, hg.head), janHead = toWorld(JAN_X, jg.head);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs><filter id="dof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={blur} /></filter></defs>
      <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
        <g filter={blur > 0.05 ? "url(#dof)" : undefined}><Corridor /><Cart /></g>
        <MopShape top={mopTop} bot={mopBot} />
        <Toon x={JAN_X} y={FLOOR} s={S} look={JANITOR} pose={jp} uid="j" />
        <Toon x={hx} y={FLOOR} s={S} look={HERO} pose={hp0} uid="h" />
        <MapShape c={mapC} rot={mapRot} s={mapS} />
        {/* реплики-«пузыри» */}
        <Bubble at={[heroHead[0] + 60, heroHead[1] - 70]} text="?" t={ip(f, [114, 120], [0, 1]) * (f < 140 ? 1 : 0)} side={-1} />
        <Bubble at={[janHead[0] + 40, janHead[1] - 80]} text="HA!" t={f >= 202 && f < 228 ? 1 : 0} side={-1} />
        <Bubble at={[janHead[0] - 20, janHead[1] - 84]} text="THAT WAY!" t={f >= 240 && f < 266 ? 1 : 0} side={1} />
        <Bubble at={[heroHead[0] + 50, heroHead[1] - 75]} text="THANKS!" t={f >= 330 && f < 352 ? 1 : 0} side={-1} />
        {/* линии «похлопывания» */}
        {f >= 372 && f < 392 && Math.floor(f / 4) % 2 === 0 ? [0, 1, 2].map((i) => <path key={i} d={`M ${heroShR[0] + 10 + i * 10} ${heroShR[1] - 30 - i * 8} l ${8} ${-14}`} stroke={OL} strokeWidth={4} strokeLinecap="round" />) : null}
      </g>
      <rect width={W} height={H} fill="url(#vig)" />
      <defs><radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stopColor="rgba(60,30,10,0)" /><stop offset="100%" stopColor="rgba(60,30,10,0.45)" /></radialGradient></defs>
    </svg>
  );
};
export const CorridorScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#2a1a0e" }}>
    <AbsoluteFill style={{ filter: "sepia(0.18) saturate(1.05)" }}><Scene /></AbsoluteFill>
    <Audio src={staticFile("corridor/sound.wav")} />
  </AbsoluteFill>
);
const Root: React.FC = () => <Composition id="Corridor" component={CorridorScene} durationInFrames={LEN} fps={30} width={W} height={H} />;
registerRoot(Root);
