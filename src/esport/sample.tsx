// Проба 10 сек: хук ролика «киберспорт». Стиль — по образцу пользователя (аниме-плоская заливка, свечение, вспышки).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, random, Easing } from "remotion";
import { AnimeChar, INK } from "./anime";
import { LEO, DAD, MOM, KIDS } from "./looks";
import { VOICE } from "./voice";

export const FPS = 30;
export const LEAD = 0.25;
export const SAMPLE_FRAMES = 300;
const W = 1080, H = 1920;

const at = (w: string, n = 1) => {
  const m = VOICE.words.filter((x) => x.w.toLowerCase().replace(/[^a-z']/g, "") === w.toLowerCase());
  return Math.round((m[n - 1].t + LEAD) * FPS);
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

// ---------- общие эффекты ----------
const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}) 100%)` }} />
);
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ opacity: 0.08, mixBlendMode: "overlay" }}>
    <svg width={W} height={H}>
      <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" seed={f % 7} numOctaves={2} /></filter>
      <rect width={W} height={H} filter="url(#gr)" />
    </svg>
  </AbsoluteFill>
);
const Dust: React.FC<{ f: number; color?: string; n?: number; seed?: string }> = ({ f, color = "#fff6dc", n = 40, seed = "d" }) => (
  <AbsoluteFill>
    <svg width={W} height={H}>
      {Array.from({ length: n }).map((_, i) => {
        const x = (random(seed + i) * W + f * (0.6 + random(seed + "s" + i))) % W;
        const y = (random(seed + "y" + i) * H - f * (0.8 + random(seed + "v" + i) * 1.4) + H * 4) % H;
        const r = 1.5 + random(seed + "r" + i) * 4;
        const o = 0.25 + 0.6 * Math.abs(Math.sin(f / 15 + i));
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o} style={{ filter: r > 4 ? "blur(1.5px)" : undefined }} />;
      })}
    </svg>
  </AbsoluteFill>
);
const Rays: React.FC<{ f: number; color?: string; o?: number }> = ({ f, color = "#fff4d6", o = 0.22 }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", filter: "blur(18px)" }}>
    <svg width={W} height={H}>
      {[0, 1, 2, 3].map((i) => {
        const x = -200 + i * 260 + Math.sin(f / 40 + i) * 20;
        return <polygon key={i} points={`${x},0 ${x + 120 + i * 30},0 ${x + 900},${H} ${x + 620},${H}`} fill={color} opacity={o * (0.6 + 0.4 * Math.sin(f / 25 + i * 2))} />;
      })}
    </svg>
  </AbsoluteFill>
);
// Ударное кольцо + искры (как «POP!» в образце)
const Burst: React.FC<{ f: number; x: number; y: number; color?: string; size?: number }> = ({ f, x, y, color = "#bff6ff", size = 1 }) => {
  if (f < 0 || f > 26) return null;
  const p = interpolate(f, [0, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const r = (60 + 520 * p) * size;
  const o = 1 - p;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <svg width={W} height={H}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={16 * (1 - p) + 2} opacity={o} style={{ filter: "blur(2px)" }} />
        <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke="#ffffff" strokeWidth={4} opacity={o * 0.8} />
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI * 2 + random("b" + i) * 0.3;
          const r1 = r * (0.35 + random("bb" + i) * 0.3), r2 = r1 + 60 * size * (1 - p);
          return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={o} />;
        })}
        <circle cx={x} cy={y} r={120 * size * (1 - p)} fill="#fff" opacity={0.5 * o} style={{ filter: "blur(30px)" }} />
      </svg>
    </AbsoluteFill>
  );
};
// Красная «ярость» из треугольных языков (фон в образце на «усилии»)
const RedRage: React.FC<{ f: number; k: number }> = ({ f, k }) => (
  <AbsoluteFill style={{ opacity: k }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, #ff6a6a 0%, #e02838 45%, #6d0a1a 100%)" }} />
    <svg width={W} height={H}>
      {Array.from({ length: 60 }).map((_, i) => {
        const x = random("rx" + i) * W, y = random("ry" + i) * H;
        const h = 60 + random("rh" + i) * 140;
        const fl = Math.sin(f / 2.5 + i) * 0.5 + 0.5;
        const dist = Math.hypot(x - W / 2, y - H / 2) / 900;
        return <polygon key={i} points={`${x - h * 0.3},${y} ${x + h * 0.3},${y} ${x},${y - h * (0.7 + 0.3 * fl)}`} fill={i % 3 ? "#ffd6d0" : "#ffffff"} opacity={(0.25 + 0.5 * fl) * Math.min(1, dist + 0.2)} />;
      })}
    </svg>
  </AbsoluteFill>
);

// ---------- фоны ----------
const Hallway: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H}>
    <defs>
      <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9d2c0" /><stop offset="1" stopColor="#a89c86" /></linearGradient>
      <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a6a4c" /><stop offset="1" stopColor="#4a3424" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#hw)" />
    {/* окно с солнцем */}
    <rect x={-40} y={180} width={360} height={560} fill="#fff4d8" stroke={INK} strokeWidth={8} />
    <line x1={140} y1={180} x2={140} y2={740} stroke={INK} strokeWidth={8} /><line x1={-40} y1={460} x2={320} y2={460} stroke={INK} strokeWidth={8} />
    {/* шкафчики */}
    {Array.from({ length: 8 }).map((_, i) => {
      const x = 330 + i * 150;
      return (
        <g key={i}>
          <rect x={x} y={420} width={150} height={1040} fill={i % 2 ? "#4c7f93" : "#5589a0"} stroke={INK} strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={x + 35} y1={480 + k * 18} x2={x + 115} y2={480 + k * 18} stroke={INK} strokeWidth={5} opacity={0.6} />)}
          <rect x={x + 112} y={880} width={16} height={60} rx={4} fill="#c8d2d8" stroke={INK} strokeWidth={4} />
          <rect x={x + 100} y={420} width={50} height={1040} fill="#000" opacity={0.12} />
        </g>
      );
    })}
    <rect y={1460} width={W} height={H - 1460} fill="url(#fl)" />
    <rect y={1460} width={W} height={16} fill={INK} />
    {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={-400 + i * 240} y1={1476} x2={-1200 + i * 480} y2={H} stroke="#2e1e14" strokeWidth={4} opacity={0.5} />)}
  </svg>
);

const LivingRoom: React.FC = () => (
  <svg width={W} height={H}>
    <defs>
      <linearGradient id="lr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4c3a5e" /><stop offset="1" stopColor="#2a1f36" /></linearGradient>
      <radialGradient id="lamp" cx="0.85" cy="0.35" r="0.5"><stop offset="0" stopColor="#ffcf7a" stopOpacity="0.85" /><stop offset="1" stopColor="#ffcf7a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#lr)" />
    <rect width={W} height={H} fill="url(#lamp)" />
    <rect x={120} y={300} width={260} height={200} fill="#6a5a7e" stroke={INK} strokeWidth={8} />
    <rect x={145} y={325} width={210} height={150} fill="#8fb0c8" opacity={0.6} />
    <path d="M 860,380 L 980,380 L 1010,520 L 830,520 Z" fill="#ffd98a" stroke={INK} strokeWidth={8} />
    <rect x={912} y={520} width={16} height={700} fill={INK} />
    <rect y={1380} width={W} height={H - 1380} fill="#3a2a2a" />
    <rect y={1380} width={W} height={14} fill={INK} />
    <path d="M -40,1150 L 420,1150 L 440,1420 L -40,1420 Z" fill="#6b3f4f" stroke={INK} strokeWidth={8} />
  </svg>
);

const NightRoom: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H}>
    <defs>
      <linearGradient id="nr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2150" /><stop offset="1" stopColor="#0c0f2a" /></linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24307a" /><stop offset="1" stopColor="#7a4aa0" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#nr)" />
    {/* окно */}
    <rect x={190} y={260} width={700} height={1000} fill="url(#sky)" stroke={INK} strokeWidth={12} />
    <circle cx={700} cy={460} r={90} fill="#fff6d8" />
    <circle cx={700} cy={460} r={170} fill="#fff6d8" opacity={0.18} />
    {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={210 + random("st" + i) * 660} cy={280 + random("sy" + i) * 400} r={2 + random("sr" + i) * 2} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 10 + i))} />)}
    {/* силуэт города с огнями */}
    <path d="M 190,1260 L 190,960 L 270,960 L 270,880 L 360,880 L 360,1000 L 430,1000 L 430,820 L 540,820 L 540,940 L 620,940 L 620,860 L 720,860 L 720,980 L 800,980 L 800,900 L 890,900 L 890,1260 Z" fill="#141433" />
    {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={200 + random("w" + i) * 680} y={890 + random("wy" + i) * 340} width={10} height={14} fill="#ffd36a" opacity={random("wo" + i) > 0.3 ? 0.9 : 0.2} />)}
    <line x1={540} y1={260} x2={540} y2={1260} stroke={INK} strokeWidth={12} />
    <line x1={190} y1={760} x2={890} y2={760} stroke={INK} strokeWidth={12} />
    {/* шторы колышутся */}
    <path d={`M 120,220 L 300,220 C ${280 + Math.sin(f / 9) * 30},700 ${330 + Math.sin(f / 7) * 40},1100 ${250 + Math.sin(f / 8) * 30},1320 L 120,1320 Z`} fill="#3a2a6a" stroke={INK} strokeWidth={8} />
    <path d={`M 960,220 L 780,220 C ${800 - Math.sin(f / 9) * 30},700 ${750 - Math.sin(f / 7) * 40},1100 ${830 - Math.sin(f / 8) * 30},1320 L 960,1320 Z`} fill="#3a2a6a" stroke={INK} strokeWidth={8} />
    <rect y={1320} width={W} height={H - 1320} fill="#0a0c20" />
  </svg>
);

const Club: React.FC<{ f: number; lamp: number }> = ({ f, lamp }) => (
  <svg width={W} height={H}>
    <defs>
      <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0f38" /><stop offset="1" stopColor="#0a0618" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#cb)" />
    {/* неоновые полосы */}
    <rect x={0} y={300} width={W} height={10} fill="#ff3fd0" opacity={0.85} />
    <rect x={0} y={300} width={W} height={40} fill="#ff3fd0" opacity={0.25} style={{ filter: "blur(10px)" }} />
    {/* ряды мониторов сзади */}
    {[0, 1].map((row) =>
      Array.from({ length: 7 }).map((_, i) => {
        const x = -60 + i * 175 + row * 80, y = 760 + row * 170;
        const c = (i + row) % 3 === 0 ? "#3fe4ff" : (i + row) % 3 === 1 ? "#8a6bff" : "#3fffb0";
        const fl = 0.75 + 0.25 * Math.sin(f / (3 + i) + row);
        return (
          <g key={row + "-" + i} opacity={0.9 - row * 0.2}>
            <rect x={x} y={y} width={150} height={95} rx={6} fill={c} opacity={fl * 0.9} stroke={INK} strokeWidth={6} />
            <rect x={x - 20} y={y - 20} width={190} height={135} fill={c} opacity={0.18} style={{ filter: "blur(14px)" }} />
            <rect x={x + 65} y={y + 95} width={20} height={40} fill={INK} />
          </g>
        );
      }),
    )}
    {/* боке */}
    {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={random("bk" + i) * W} cy={200 + random("bky" + i) * 900} r={20 + random("bkr" + i) * 40} fill={i % 2 ? "#ff5fd8" : "#5fe8ff"} opacity={0.18} />)}
    {/* жёлтая лампа сверху */}
    <line x1={540} y1={0} x2={540} y2={150} stroke={INK} strokeWidth={8} />
    <path d="M 470,150 L 610,150 L 650,230 L 430,230 Z" fill="#3a3346" stroke={INK} strokeWidth={8} />
    <ellipse cx={540} cy={232} rx={100} ry={18} fill={lamp > 0.1 ? "#fff1b0" : "#4a4458"} stroke={INK} strokeWidth={6} />
    <polygon points="440,232 640,232 1000,1700 80,1700" fill="#ffd86a" opacity={0.28 * lamp} style={{ filter: "blur(16px)" }} />
    <circle cx={540} cy={232} r={160} fill="#ffe08a" opacity={0.35 * lamp} style={{ filter: "blur(30px)" }} />
  </svg>
);

// ---------- сцены ----------
type SP = { f: number; d: number };
const cam = (f: number, d: number, punch = 0) => {
  const z = 1 + interpolate(f, [0, d], [0, 0.07], clamp) + punch;
  const inz = interpolate(f, [0, 6], [0.1, 0], { ...clamp, easing: ease });
  return { z: z + inz, blur: interpolate(f, [0, 5], [10, 0], clamp) };
};
const shake = (f: number, from: number, amp = 18, len = 12) => {
  const k = f - from;
  if (k < 0 || k > len) return [0, 0];
  const a = amp * (1 - k / len);
  return [(random("sx" + f) - 0.5) * 2 * a, (random("sy" + f) - 0.5) * 2 * a];
};
const Cam: React.FC<{ z: number; blur: number; sx?: number; sy?: number; ox?: number; oy?: number; children: React.ReactNode }> = ({ z, blur, sx = 0, sy = 0, ox = 50, oy = 42, children }) => (
  <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${z})`, transformOrigin: `${ox}% ${oy}%`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
);

// 1. Коридор: все смеются
const S1: React.FC<SP> = ({ f, d }) => {
  const hit = at("talentless") - 0; // локально: сцена начинается с 0
  const k = f - hit;
  const punch = k >= 0 ? interpolate(k, [0, 4, 30], [0, 0.09, 0.06], clamp) : 0;
  const { z, blur } = cam(f, d, punch);
  const [sx, sy] = shake(f, hit, 14, 10);
  const flinch = k >= 0;
  return (
    <AbsoluteFill>
      <Cam z={z} blur={blur} sx={sx} sy={sy}>
        <AbsoluteFill style={{ filter: "blur(5px) saturate(0.9)" }}><Hallway f={f} /></AbsoluteFill>
        <Rays f={f} />
        <AbsoluteFill style={{ filter: "blur(3px) brightness(0.8)" }}>
          <svg width={W} height={H}>
            <AnimeChar id="k0" look={KIDS[0]} x={150} y={840} s={0.62} t={f + 7} expr="laugh" pose="point" />
            <AnimeChar id="k1" look={KIDS[1]} x={330} y={800} s={0.55} t={f + 3} expr="laugh" pose="belly" />
            <AnimeChar id="k2" look={KIDS[2]} x={760} y={810} s={0.56} t={f + 11} expr="laugh" pose="belly" />
            <AnimeChar id="k3" look={KIDS[3]} x={940} y={850} s={0.62} t={f} expr="laugh" pose="point" mirror />
          </svg>
        </AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <AnimeChar id="leo1" look={LEO} x={540} y={1060} s={1.2} t={f} expr={flinch ? "hurt" : "sad"} gaze={[0, 0.8]} headDown={flinch ? 1.2 : 0.6} tilt={flinch ? -4 : 0} blink={!flinch} />
        </svg>
        <Dust f={f} />
      </Cam>
    </AbsoluteFill>
  );
};

// 2. Родители выдёргивают шнур
const S2: React.FC<SP & { hit: number }> = ({ f, d, hit }) => {
  const k = f - hit;
  const rage = k >= 0 ? interpolate(k, [0, 3, 20], [0, 1, 0.85], clamp) : 0;
  const glow = k >= 0 ? interpolate(k, [0, 2], [1, 0], clamp) : 1;
  const lift = k >= -4 ? interpolate(k, [-4, 2], [0, 1], { ...clamp, easing: ease }) : 0;
  const punch = k >= 0 ? interpolate(k, [0, 3, 30], [0, 0.08, 0.05], clamp) : 0;
  const { z, blur } = cam(f, d, punch);
  const [sx, sy] = shake(f, hit, 24, 14);
  return (
    <AbsoluteFill>
      <Cam z={z} blur={blur} sx={sx} sy={sy}>
        <AbsoluteFill style={{ filter: "blur(6px)" }}><LivingRoom /></AbsoluteFill>
        <RedRage f={f} k={rage} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <AnimeChar id="mom" look={MOM} x={300} y={820} s={0.95} t={f + 13} expr={k >= 0 ? "angry" : "stern"} pose="down" rim={k >= 0 ? "#ffd0d0" : "#bfe9ff"} gaze={[0.4, 0.3]} />
          <AnimeChar id="dad" look={DAD} x={730} y={760} s={1.08} t={f} expr={k >= 0 ? "angry" : "stern"} pose="cord" cordLift={lift} rim={k >= 0 ? "#ffd0d0" : "#bfe9ff"} gaze={[-0.3, 0.3]} />
        </svg>
        {/* синий свет от монитора гаснет */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(80,200,255,0.55), rgba(80,200,255,0) 70%)", mixBlendMode: "screen", opacity: glow }} />
        <Dust f={f} color={k >= 0 ? "#ffe0e0" : "#d8f2ff"} n={30} seed="p" />
      </Cam>
      <Burst f={k} x={600} y={720} color="#ffd0d0" size={1.1} />
    </AbsoluteFill>
  );
};

// 3. Ночь, окно открыто — он уходит
const S3: React.FC<SP> = ({ f, d }) => {
  const { z, blur } = cam(f, d);
  const look = interpolate(f, [6, 18], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Cam z={z} blur={blur} oy={40}>
        <AbsoluteFill style={{ filter: "blur(4px)" }}><NightRoom f={f} /></AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <AnimeChar id="leo3" look={LEO} x={540} y={1080} s={1.15} t={f} expr="sneak" hoodUp gaze={[-0.9 * look, 0.1]} side={-0.7 * look} tilt={-3 * look} rim="#a9c8ff" />
        </svg>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,60,160,0.25), rgba(10,10,40,0.35))", mixBlendMode: "multiply" }} />
        <Dust f={f} color="#c9d8ff" n={25} seed="n" />
      </Cam>
    </AbsoluteFill>
  );
};

// 4. Компьютерный клуб
const S4: React.FC<SP & { hit: number }> = ({ f, d, hit }) => {
  const k = f - hit;
  const lamp = k >= 0 ? interpolate(k, [0, 2, 4, 5, 8], [0, 1, 0.3, 1, 1], clamp) : 0;
  const punch = k >= 0 ? interpolate(k, [0, 4, 40], [0, 0.07, 0.04], clamp) : 0;
  const { z, blur } = cam(f, d, punch);
  const [sx, sy] = shake(f, hit, 12, 10);
  const focus = k >= 0;
  return (
    <AbsoluteFill>
      <Cam z={z} blur={blur} sx={sx} sy={sy} oy={38}>
        <AbsoluteFill style={{ filter: "blur(7px)" }}><Club f={f} lamp={lamp} /></AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <AnimeChar id="leo4" look={LEO} x={540} y={900} s={1.15} t={f} expr={focus ? "focus" : "neutral"} pose="desk" phones rim={lamp > 0.5 ? "#ffe9a8" : "#8fefff"} eyeGlow="#7ff0ff" gaze={[0, 0.5]} />
          {/* стол, клавиатура, мышь; спинка монитора на переднем плане */}
          <rect x={-20} y={1560} width={1120} height={400} fill="#20183a" stroke={INK} strokeWidth={8} />
          <rect x={300} y={1520} width={480} height={70} rx={10} fill="#2d2a40" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={318 + i * 38} y={1532 + (i % 2) * 22} width={28} height={16} rx={3} fill={i % 4 ? "#6a5cff" : "#3fe4ff"} opacity={0.8} />)}
          <path d="M -60,1960 L -60,1700 C 200,1660 880,1660 1140,1700 L 1140,1960 Z" fill="#0c0a18" stroke={INK} strokeWidth={8} opacity={0.0} />
        </svg>
        {/* голубой свет экрана снизу на лице */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 40% at 50% 70%, rgba(90,230,255,0.45), rgba(90,230,255,0) 70%)", mixBlendMode: "screen", opacity: 0.8 + 0.2 * Math.sin(f / 4) }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 35% at 50% 20%, rgba(255,220,120,0.5), rgba(255,220,120,0) 70%)", mixBlendMode: "screen", opacity: lamp }} />
        <Dust f={f} color="#ffeab0" n={k >= 0 ? 45 : 15} seed="c" />
      </Cam>
      <Burst f={k} x={540} y={560} color="#ffe9a8" size={1.2} />
    </AbsoluteFill>
  );
};

// ---------- сборка ----------
export const EsportSample: React.FC = () => {
  const f = useCurrentFrame();
  const c1 = at("even") - 2, c2 = at("but") - 2, c3 = at("secretly") - 3;
  const cuts = [0, c1, c2, c3, SAMPLE_FRAMES];
  const i = cuts.findIndex((c, j) => f >= c && f < cuts[j + 1]);
  const lf = f - cuts[i], d = cuts[i + 1] - cuts[i];
  const flash = Math.max(0, ...cuts.slice(1, 4).map((c) => interpolate(f - c, [0, 1, 6], [0, 0.85, 0], clamp)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {i === 0 && <S1 f={lf} d={d} />}
      {i === 1 && <S2 f={lf} d={d} hit={at("banned") - c1} />}
      {i === 2 && <S3 f={lf} d={d} />}
      {i === 3 && <S4 f={lf} d={d} hit={at("club") - c3} />}
      <Vignette />
      <Grain f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <AbsoluteFill style={{ opacity: interpolate(f, [SAMPLE_FRAMES - 12, SAMPLE_FRAMES], [0, 1], clamp), background: "#000" }} />
      <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile("esport/voice.mp3")} volume={1} /></Sequence>
      <Audio src={staticFile("esport/sfx.wav")} volume={1} />
    </AbsoluteFill>
  );
};
