// «What if you could see 10 seconds into the future?» — 20-секундная проба стиля A («ночной плоский»):
// плоский 2D, ночная фиолетово-синяя палитра, наш герой (плоский, bean.tsx), бирюзовый «призрак будущего»
// (тот же объект на несколько кадров вперёд, полупрозрачный бирюзовый), счётчик «+10s», ключевые слова, название.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Bean, BeanDefs, BeanLook, BeanPose, HERO2D, NEIGHBOR_A, NEIGHBOR_B, Expr } from "../../toontest/bean";

export const FUTURE_FRAMES = 600;
const W = 1920, H = 1080, INK = "#16131f", CYAN = "#5ff4ff", YEL = "#ffd23c";
const GH = 18; // насколько «призрак» опережает реальность (кадров)

const fh = delayRender("future font");
new FontFace("FutMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load().then((f) => { document.fonts.add(f); continueRender(fh); });

const ip = (f: number, a: number[], b: number[], ease = Easing.inOut(Easing.cubic)) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const D = Math.PI / 180;
/** положение кисти персонажа Bean (для мяча и подноса) */
const handPos = (x: number, y: number, s: number, side: 1 | -1, a: [number, number], flip = false): [number, number] => {
  const lx = side * 58 + side * Math.sin(a[0] * D) * 78 + side * Math.sin((a[0] + a[1]) * D) * 72;
  const ly = -318 + Math.cos(a[0] * D) * 78 + Math.cos((a[0] + a[1]) * D) * 72;
  return [x + (flip ? -lx : lx) * s, y + ly * s];
};

// ---------- общие слои ----------
const Defs: React.FC = () => (
  <defs>
    <filter id="ghost" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="matrix" values="0.09 0.18 0.03 0 0.08  0.18 0.35 0.07 0 0.55  0.18 0.35 0.07 0 0.62  0 0 0 0.5 0" result="g" />
      <feGaussianBlur in="g" stdDeviation="7" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="g" /></feMerge>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1d1a44" /><stop offset="60%" stopColor="#4a3a7a" /><stop offset="100%" stopColor="#c87a8a" /></linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0e0c26" /><stop offset="100%" stopColor="#2c2558" /></linearGradient>
    <radialGradient id="lamp" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,200,110,0.55)" /><stop offset="100%" stopColor="rgba(255,200,110,0)" /></radialGradient>
  </defs>
);
const Ghost: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#ghost)" style={{ mixBlendMode: "screen" }}>{children}</g>;
const Skyline: React.FC<{ y: number; c?: string; seed?: number; lit?: number }> = ({ y, c = "#1a1636", seed = 1, lit = 0.35 }) => {
  const b: React.ReactNode[] = [];
  let x = -40, k = seed;
  while (x < W + 40) {
    k = (k * 9301 + 49297) % 233280; const r = k / 233280;
    const w = 90 + r * 140, h = 160 + ((k * 7) % 233280) / 233280 * 300;
    b.push(<rect key={x} x={x} y={y - h} width={w} height={h + 400} fill={c} />);
    for (let wy = y - h + 24; wy < y - 20; wy += 34) for (let wx = x + 14; wx < x + w - 20; wx += 30) {
      k = (k * 9301 + 49297) % 233280;
      if (k / 233280 < lit) b.push(<rect key={`${wx}-${wy}`} x={wx} y={wy} width={14} height={18} fill="#ffc86a" opacity={0.85} />);
    }
    x += w + 6;
  }
  return <g>{b}</g>;
};
const Push: React.FC<{ g: number; dur: number; k?: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ g, dur, k = 0.06, cx = W / 2, cy = H / 2, children }) => {
  const s = 1 + k * (g / dur);
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};
const Word: React.FC<{ text: string; g: number; y?: number; col?: string }> = ({ text, g, y = 170, col = "#ffffff" }) => {
  const o = ip(g, [0, 6], [0, 1]), dy = ip(g, [0, 8], [24, 0], Easing.out(Easing.back(2)));
  return <text x={W / 2} y={y + dy} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={84} fill={col} stroke={INK} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round" opacity={o} letterSpacing={2}>{text}</text>;
};
const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 30, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#f6f2ea" stroke={INK} strokeWidth={7} />
    <path d={`M ${-r * 0.7} ${-r * 0.4} Q 0 ${-r * 0.1} ${r * 0.7} ${-r * 0.4}`} stroke="#d8443a" strokeWidth={5} fill="none" />
    <path d={`M ${-r * 0.7} ${r * 0.4} Q 0 ${r * 0.1} ${r * 0.7} ${r * 0.4}`} stroke="#d8443a" strokeWidth={5} fill="none" />
  </g>
);
const Tray: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-95} y={-12} width={190} height={24} rx={8} fill="#7aa0c8" stroke={INK} strokeWidth={7} />
    <ellipse cx={-38} cy={-30} rx={36} ry={20} fill="#f6f2ea" stroke={INK} strokeWidth={6} />
    <circle cx={-38} cy={-34} r={14} fill="#e0702a" stroke={INK} strokeWidth={4} />
    <rect x={28} y={-70} width={34} height={58} rx={4} fill="#f6f2ea" stroke={INK} strokeWidth={6} />
    <rect x={28} y={-70} width={34} height={16} fill="#3a7ad8" stroke={INK} strokeWidth={4} />
  </g>
);
const Car: React.FC<{ x: number; y: number; c?: string; lights?: boolean }> = ({ x, y, c = "#d8443a", lights = true }) => (
  <g transform={`translate(${x} ${y})`}>
    {lights ? <path d="M 300 -60 L 760 -150 L 760 40 Z" fill="rgba(255,230,150,0.25)" /> : null}
    <path d="M -300 -40 L -280 -110 Q -200 -120 -150 -190 L 120 -190 Q 180 -140 250 -110 L 300 -100 L 305 -40 Z" fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -130 -175 L -60 -175 L -60 -120 L -190 -118 Z" fill="#8fd0ff" stroke={INK} strokeWidth={6} />
    <path d="M -40 -175 L 100 -175 L 160 -118 L -40 -120 Z" fill="#8fd0ff" stroke={INK} strokeWidth={6} />
    <circle cx={290} cy={-80} r={14} fill="#fff4b0" stroke={INK} strokeWidth={5} />
    {[-180, 170].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={50} fill="#25222f" stroke={INK} strokeWidth={8} /><circle cx={wx} cy={-30} r={18} fill="#9aa0b0" /></g>)}
  </g>
);
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 0.7 + 0.3 * Math.abs(Math.sin(f / 10));
  return (
    <g transform="translate(60 60)">
      <rect width={230} height={84} rx={18} fill="rgba(10,10,30,0.7)" stroke={CYAN} strokeWidth={4} />
      <circle cx={44} cy={42} r={22} fill="none" stroke={CYAN} strokeWidth={5} />
      <path d={`M 44 42 L 44 26 M 44 42 L ${44 + 13 * Math.cos(f / 6)} ${42 + 13 * Math.sin(f / 6)}`} stroke={CYAN} strokeWidth={5} strokeLinecap="round" />
      <text x={86} y={58} fontFamily="FutMont" fontWeight={900} fontSize={44} fill={CYAN} opacity={pulse}>+10s</text>
    </g>
  );
};

// ---------- сцены ----------
type SC = React.FC<{ g: number }>;
const GROUND = 900;
// 1. двор школы: друг замахивается, «призрак» мяча уже летит, герой поднимает руку заранее
const throwArm = (g: number): [number, number] => g < 45 ? [lerp(20, 150, ip(g, [5, 40], [0, 1])), 40] : [lerp(150, 70, ip(g, [45, 52], [0, 1])), lerp(40, 10, ip(g, [45, 52], [0, 1]))];
const heroCatchArm = (g: number): [number, number] => [lerp(12, 95, ip(g, [22, 40], [0, 1])), lerp(8, -40, ip(g, [22, 40], [0, 1]))];
const ballAt = (g: number): [number, number] | null => {
  const from = handPos(1350, GROUND, 1.05, 1, [70, 10], true), to = handPos(560, GROUND, 1.05, 1, [95, -40]);
  if (g < 45) return null;
  const u = ip(g, [45, 66], [0, 1], Easing.linear);
  if (u >= 1) return to;
  return [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 140];
};
const Yard: SC = ({ g }) => {
  const b = ballAt(g), bg = ballAt(g + GH);
  return (
    <Push g={g} dur={75}>
      <rect width={W} height={H} fill="url(#dusk)" />
      <Skyline y={720} c="#2a2350" seed={3} lit={0.15} />
      {/* школа */}
      <rect x={1180} y={420} width={760} height={420} fill="#3a2f5e" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1220 + (i % 6) * 120} y={470 + Math.floor(i / 6) * 150} width={80} height={90} fill={i % 3 ? "#ffc86a" : "#5a4a86"} stroke={INK} strokeWidth={5} />)}
      <rect x={0} y={GROUND - 10} width={W} height={H} fill="#2b2448" />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 100} y={GROUND - 120} width={10} height={110} fill="#1d1838" />)}
      <rect x={0} y={GROUND - 110} width={W} height={8} fill="#1d1838" />
      <Bean x={1350} y={GROUND} s={1.05} look={NEIGHBOR_A} expr={g < 45 ? "grin" : g < 60 ? "neutral" : "shock"} open={1} f={g} flip pose={{ armR: throwArm(g), armL: [15, 10], lean: g < 45 ? -6 : 6 }} />
      <Bean x={560} y={GROUND} s={1.05} look={HERO2D} expr="smirk" f={g + 9} pose={{ armR: heroCatchArm(g), armL: [10, 6] }} />
      {/* реальный мяч в руке друга до броска */}
      {g < 45 ? <Ball x={handPos(1350, GROUND, 1.05, 1, throwArm(g), true)[0]} y={handPos(1350, GROUND, 1.05, 1, throwArm(g), true)[1]} /> : null}
      {b ? <Ball x={b[0]} y={b[1]} rot={g * 14} /> : null}
      {bg && g + GH < 66 ? <Ghost><Ball x={bg[0]} y={bg[1]} rot={(g + GH) * 14} /></Ghost> : null}
      {g > 8 && g < 60 ? (() => {
        const pts = Array.from({ length: 22 }, (_, i) => ballAt(45 + (i / 21) * 21)!).filter(Boolean);
        const shown = Math.floor(ip(g, [8, 30], [0, pts.length]));
        return <g opacity={1 - ip(g, [48, 60], [0, 1])}>{pts.slice(0, shown).map(([px, py], i) => <circle key={i} cx={px} cy={py} r={7} fill={CYAN} filter="url(#ghost)" />)}</g>;
      })() : null}
    </Push>
  );
};
const YardClose: SC = ({ g }) => (
  <Push g={g} dur={60} k={0.08} cx={760} cy={520}>
    <rect width={W} height={H} fill="url(#dusk)" />
    <Skyline y={760} c="#2a2350" seed={5} lit={0.2} />
    <rect x={0} y={GROUND + 120} width={W} height={H} fill="#2b2448" />
    <Bean x={1420} y={GROUND + 420} s={1.6} look={NEIGHBOR_A} expr="shock" open={1} f={g} flip pose={{ armR: [70, 10], armL: [15, 10] }} />
    <Bean x={640} y={GROUND + 480} s={1.75} look={HERO2D} expr="smirk" f={g + 20} pose={{ armR: [95, -40], armL: [10, 6], tilt: -4 }} />
    <Ball x={handPos(640, GROUND + 480, 1.75, 1, [95, -40])[0]} y={handPos(640, GROUND + 480, 1.75, 1, [95, -40])[1]} r={46} rot={20} />
  </Push>
);
// 2. столовая: поднос падает, «призрак» падает раньше, герой уже бежит
const Cafeteria: SC = ({ g }) => {
  const girlArm: [number, number] = [ip(g, [0, 25], [70, 70]), 15];
  const start = handPos(1180, GROUND, 1.0, 1, girlArm, true);
  const HOLD: [number, number] = [40, -100];
  const end = handPos(980, GROUND, 1.0, 1, HOLD);
  const trayAt = (t: number): [number, number, number] => {
    const u = ip(t, [24, 46], [0, 1], Easing.in(Easing.quad));
    return [lerp(start[0] - 40, (handPos(980, GROUND, 1.0, 1, HOLD)[0] + handPos(980, GROUND, 1.0, -1, HOLD)[0]) / 2, u), lerp(start[1] - 10, end[1] - 6, u) + Math.sin(u * Math.PI) * 30, lerp(0, 28, u) * (1 - ip(t, [44, 52], [0, 1]))];
  };
  const run = ip(g, [4, 30], [0, 1], Easing.out(Easing.cubic)), hx = lerp(420, 980, run), legPh = Math.sin(g * 0.9) * (1 - ip(g, [26, 34], [0, 1]));
  const [tx, ty, tr] = trayAt(g), [gx, gy, gr] = trayAt(g + GH);
  return (
    <Push g={g} dur={75}>
      <rect width={W} height={H} fill="#2a2350" />
      {[0, 1, 2].map((i) => <g key={i}><rect x={160 + i * 600} y={150} width={420} height={330} fill="url(#night)" stroke={INK} strokeWidth={10} /><g clipPath={`inset(0)`} /><rect x={160 + i * 600} y={300} width={420} height={180} fill="#1a1636" /><rect x={365 + i * 600} y={150} width={10} height={330} fill={INK} /></g>)}
      {[0, 1, 2].map((i) => <circle key={"l" + i} cx={370 + i * 600} cy={60} r={180} fill="url(#lamp)" />)}
      <rect x={0} y={GROUND - 10} width={W} height={H} fill="#3d3368" />
      <rect x={1380} y={GROUND - 190} width={460} height={30} rx={10} fill="#8a6a4a" stroke={INK} strokeWidth={8} />
      {[1420, 1800].map((x) => <rect key={x} x={x} y={GROUND - 165} width={20} height={165} fill="#5a4a3a" stroke={INK} strokeWidth={6} />)}
      <Bean x={1180} y={GROUND} s={1.0} look={NEIGHBOR_B} expr={g < 26 ? "neutral" : "shock"} open={1} f={g} flip pose={{ armR: girlArm, armL: [g < 24 ? 70 : 40, 15] }} />
      <Bean x={hx} y={GROUND} s={1.0} look={HERO2D} expr={g < 40 ? "neutral" : "grin"} f={g} pose={{ armR: [lerp(10, 40, run), lerp(6, -100, run)], armL: [lerp(10, 40, run), lerp(6, -100, run)], legL: 4 + legPh * 22, legR: 4 - legPh * 22, lean: lerp(0, 10, run) * (1 - ip(g, [30, 40], [0, 1])) }} />
      <Tray x={tx} y={ty} rot={tr} />
      {g + GH < 52 ? <Ghost><Tray x={gx} y={gy} rot={gr} /></Ghost> : null}
      {g < 30 ? <Ghost><Bean x={lerp(420, 980, ip(g + GH, [4, 30], [0, 1], Easing.out(Easing.cubic)))} y={GROUND} s={1.0} look={HERO2D} f={g} shadow={false} pose={{ armR: [40, -100], armL: [40, -100] }} /></Ghost> : null}
    </Push>
  );
};
const CafeClose: SC = ({ g }) => (
  <Push g={g} dur={60} k={0.07} cx={900} cy={560}>
    <rect width={W} height={H} fill="#2a2350" />
    {[0, 1].map((i) => <circle key={i} cx={500 + i * 900} cy={120} r={260} fill="url(#lamp)" />)}
    <rect x={0} y={GROUND + 140} width={W} height={H} fill="#3d3368" />
    <Bean x={1320} y={GROUND + 460} s={1.55} look={NEIGHBOR_B} expr="shock" open={1} f={g} flip pose={{ armR: [40, 15], armL: [40, 15] }} />
    <Bean x={720} y={GROUND + 480} s={1.7} look={HERO2D} expr="grin" f={g + 11} pose={{ armR: [40, -100], armL: [40, -100] }} />
    <Tray x={720} y={handPos(720, GROUND + 480, 1.7, 1, [40, -100])[1] - 14} />
  </Push>
);
// 3. улица ночью: «призрак» машины проносится, герой замирает у бордюра, затем проезжает настоящая
const Street: SC = ({ g }) => {
  const carX = (t: number) => ip(t, [34, 58], [-700, W + 700], Easing.linear);
  const step = ip(g, [6, 18], [0, 1]), stop = g > 18;
  return (
    <Push g={g} dur={110} k={0.05}>
      <rect width={W} height={H} fill="url(#night)" />
      <Skyline y={760} c="#18142f" seed={9} lit={0.4} />
      {[300, 1100, 1700].map((x) => <g key={x}><rect x={x} y={420} width={12} height={360} fill="#121024" /><rect x={x - 40} y={410} width={80} height={16} rx={8} fill="#121024" /><circle cx={x} cy={440} r={220} fill="url(#lamp)" /></g>)}
      <rect x={0} y={760} width={W} height={70} fill="#4a4270" stroke={INK} strokeWidth={6} />
      <rect x={0} y={830} width={W} height={260} fill="#221d3c" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={760 + i * 60} y={850} width={36} height={220} fill="#e8e4f0" opacity={0.85} />)}
      <Ghost><Car x={carX(g + GH)} y={1010} /></Ghost>
      <Car x={carX(g)} y={1010} />
      <Bean x={lerp(560, 650, step)} y={790} s={0.62} look={HERO2D} expr={g < 34 ? "neutral" : "smirk"} f={g} pose={{ legL: stop ? 4 : 4 + Math.sin(g * 0.8) * 20, legR: stop ? 4 : 4 - Math.sin(g * 0.8) * 20, armL: [10, 6], armR: [10, 6], lean: g > 18 && g < 34 ? -6 : 0 }} />
      {g > 40 && g < 70 ? [0, 1, 2].map((i) => <path key={i} d={`M ${900 - i * 40} ${700 + i * 26} L ${700 - i * 40} ${700 + i * 26}`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />) : null}
    </Push>
  );
};
// 4. крупно: в глазах героя бирюзовые блики, счётчик
const Face: SC = ({ g }) => {
  const s = 3.4, x = W / 2, y = 2150;
  const ex = (side: number): [number, number] => [x + side * 30 * s, y + (-432 - 4) * s];
  return (
    <Push g={g} dur={70} k={0.1} cx={W / 2} cy={560}>
      <rect width={W} height={H} fill="url(#night)" />
      <Skyline y={900} c="#18142f" seed={2} lit={0.45} />
      <Bean x={x} y={y} s={s} look={HERO2D} expr="neutral" f={20} shadow={false} pose={{}} />
      {[-1, 1].map((sd) => <circle key={sd} cx={ex(sd)[0]} cy={ex(sd)[1]} r={50 + 10 * Math.sin(g / 5)} fill={CYAN} opacity={0.35} filter="url(#glow)" />)}
      {[-1, 1].map((sd) => <circle key={"d" + sd} cx={ex(sd)[0] + 8} cy={ex(sd)[1] - 10} r={9} fill={CYAN} />)}
    </Push>
  );
};
// 5. название: сначала «призрак» текста, потом сам текст влетает на его место
const Title: SC = ({ g }) => {
  const line = (t: string, y: number, size: number, col: string, d: number) => {
    const real = ip(g, [d + 14, d + 24], [0, 1], Easing.out(Easing.back(1.6))), ghost = ip(g, [d, d + 6], [0, 1]) * (1 - ip(g, [d + 22, d + 30], [0, 1]));
    return (
      <g key={t}>
        <text x={W / 2} y={y} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={size} fill={CYAN} opacity={ghost * 0.8} filter="url(#ghost)">{t}</text>
        <text x={W / 2} y={y + (1 - real) * 40} textAnchor="middle" fontFamily="FutMont" fontWeight={900} fontSize={size} fill={col} stroke={INK} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round" opacity={real}>{t}</text>
      </g>
    );
  };
  return (
    <Push g={g} dur={150} k={0.04}>
      <rect width={W} height={H} fill="url(#night)" />
      <Skyline y={1000} c="#16122c" seed={4} lit={0.5} />
      <Bean x={W / 2} y={1080} s={0.55} look={HERO2D} expr="smirk" f={g} pose={{}} />
      <Ghost><Bean x={W / 2 + 60} y={1080} s={0.55} look={HERO2D} expr="smirk" f={g} shadow={false} pose={{ armR: [150, 20] }} /></Ghost>
      {line("WHAT IF YOU COULD SEE", 380, 96, "#ffffff", 4)}
      {line("10 SECONDS", 540, 170, YEL, 20)}
      {line("INTO THE FUTURE?", 680, 112, "#ffffff", 36)}
    </Push>
  );
};

const SHOTS: [SC, number, number][] = [[Yard, 0, 75], [YardClose, 75, 60], [Cafeteria, 135, 75], [CafeClose, 210, 60], [Street, 270, 110], [Face, 380, 70], [Title, 450, 150]];
const WORDS: [string, number, number][] = [["BEFORE IT'S THROWN.", 80, 135], ["BEFORE IT FALLS.", 215, 270], ["BEFORE IT HAPPENS.", 330, 380]];

export const FutureTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e0c26" }}>
      {SHOTS.map(([S, from, len], i) => (
        <Sequence key={i} from={from} durationInFrames={len}>
          <AbsoluteFill><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><BeanDefs /><Defs /><Scene S={S} /></svg></AbsoluteFill>
        </Sequence>
      ))}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs />
          {WORDS.map(([t, a, b]) => (f >= a && f < b ? <Word key={t} text={t} g={f - a} /> : null))}
          {f < 450 ? <Hud f={f} /> : null}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 60px rgba(5,4,20,0.6)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#ffffff", opacity: ip(f, [448, 451, 456], [0, 0.6, 0]) }} />
      <Audio src={staticFile("future/sound.wav")} />
    </AbsoluteFill>
  );
};
const Scene: React.FC<{ S: SC }> = ({ S }) => <S g={useCurrentFrame()} />;
export type { BeanLook, BeanPose, Expr };
