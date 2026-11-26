// Полный ролик «Мальчик, которого высмеивали» (рус., озвучка пользователя). Только голос, без звуков.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, random, Easing } from "remotion";
import { AnimeChar, INK } from "./anime";
import { LEO, DAD, MOM, KIDS, MAX, OWNER, MATE } from "./looks";
import { VOICE } from "./voice_ru";
import { Vignette, Grain, Dust, Rays, Burst, RedRage, Hallway, LivingRoom, NightRoom, Club, Cam, cam, shake, clamp, ease } from "./sample";

const FPS = 30, LEAD = 0.25, W = 1080, H = 1920;
export const FULL_FRAMES = Math.ceil((VOICE.dur + LEAD + 1.4) * FPS);

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9-]/g, "");
const wf = (w: string, n = 1) => {
  const m = VOICE.words.filter((x) => norm(x.w) === norm(w));
  if (!m[n - 1]) throw new Error("нет слова " + w + " #" + n);
  return Math.round((m[n - 1].t + LEAD) * FPS);
};

type SP = { f: number; d: number; s: number }; // s — глобальный кадр начала сцены
const loc = (p: SP, w: string, n = 1) => wf(w, n) - p.s;
const after = (f: number, k: number, a = 0, b = 6) => interpolate(f - k, [a, b], [0, 1], { ...clamp, easing: ease });
const punchAt = (f: number, k: number, amt = 0.08) => (f >= k ? interpolate(f - k, [0, 4, 30], [0, amt, amt * 0.6], clamp) : 0);

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} style={{ position: "absolute", ...style }}>{children}</svg>
);
const Glow: React.FC<{ bg: string; o?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ bg, o = 1, blend = "screen" }) => (
  <AbsoluteFill style={{ background: bg, mixBlendMode: blend, opacity: o }} />
);

// ---------- новые фоны ----------
const Bedroom: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H}>
    <rect width={W} height={H} fill="#e9d6b8" />
    <rect x={560} y={200} width={460} height={620} fill="#bfe6ff" stroke={INK} strokeWidth={10} />
    <circle cx={880} cy={330} r={60} fill="#fff6c8" />
    <path d="M 560,660 C 700,600 850,640 1020,580 L 1020,820 L 560,820 Z" fill="#8fd18a" />
    <line x1={790} y1={200} x2={790} y2={820} stroke={INK} strokeWidth={10} />
    {/* полка с игрушками и плакат-джойстик (без надписей) */}
    <rect x={60} y={330} width={380} height={20} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
    <rect x={90} y={250} width={60} height={80} fill="#e05050" stroke={INK} strokeWidth={5} />
    <circle cx={220} cy={295} r={34} fill="#50a0e0" stroke={INK} strokeWidth={5} />
    <rect x={290} y={270} width={110} height={60} rx={20} fill="#4a4a5a" stroke={INK} strokeWidth={5} />
    <rect y={1400} width={W} height={H - 1400} fill="#9a6e4c" />
    <rect y={1400} width={W} height={14} fill={INK} />
  </svg>
);
const Gym: React.FC = () => (
  <svg width={W} height={H}>
    <rect width={W} height={H} fill="#e8c890" />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={i * 95} y={0} width={10} height={1300} fill="#c9a46a" />)}
    <rect x={380} y={220} width={320} height={210} fill="#fff" stroke={INK} strokeWidth={8} />
    <rect x={480} y={300} width={120} height={90} fill="none" stroke="#e05050" strokeWidth={6} />
    <ellipse cx={540} cy={470} rx={70} ry={16} fill="none" stroke="#ff7a2a" strokeWidth={8} />
    <rect y={1300} width={W} height={H - 1300} fill="#c98a4a" />
    <ellipse cx={540} cy={1600} rx={600} ry={160} fill="none" stroke="#fff" strokeWidth={8} opacity={0.7} />
    <rect y={1300} width={W} height={12} fill={INK} />
  </svg>
);
const NightStreet: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H}>
    <defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1450" /><stop offset="1" stopColor="#4a2a6a" /></linearGradient></defs>
    <rect width={W} height={H} fill="url(#ns)" />
    <polygon points="0,1300 1080,1300 1080,1920 0,1920" fill="#22203a" />
    <polygon points="470,800 610,800 1300,1920 -220,1920" fill="#34304e" />
    {[0, 1, 2, 3, 4].map((i) => {
      const k = ((f / 40 + i / 5) % 1); // фонари едут на нас
      const sc = 0.2 + k * k * 2.4, side = i % 2 ? 1 : -1;
      const x = 540 + side * (60 + 700 * k * k), y = 820 + 300 * k * k;
      return (
        <g key={i} opacity={Math.min(1, k * 3)}>
          <rect x={x - 6 * sc} y={y - 520 * sc} width={12 * sc} height={520 * sc} fill={INK} />
          <circle cx={x} cy={y - 520 * sc} r={22 * sc} fill="#ffe08a" />
          <circle cx={x} cy={y - 520 * sc} r={90 * sc} fill="#ffe08a" opacity={0.25} />
        </g>
      );
    })}
    {[0, 1, 2].map((i) => <rect key={i} x={i % 2 ? 640 : 140} y={500 + i * 40} width={300} height={500} fill="#141033" />)}
    {Array.from({ length: 24 }).map((_, i) => <rect key={i} x={150 + random("nw" + i) * 780} y={530 + random("nwy" + i) * 420} width={14} height={18} fill="#ffd36a" opacity={random("nwo" + i) > 0.4 ? 0.85 : 0.15} />)}
  </svg>
);
const Counter: React.FC<{ lamp: number; tint?: string }> = ({ lamp }) => (
  <svg width={W} height={H}>
    <rect width={W} height={H} fill="#1d1430" />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={80 + i * 200} y={700} width={150} height={95} rx={6} fill={i % 2 ? "#3fe4ff" : "#8a6bff"} opacity={0.5} stroke={INK} strokeWidth={6} />)}
    <rect x={60} y={420} width={300} height={200} fill="#2a2140" stroke={INK} strokeWidth={6} />
    <line x1={540} y1={0} x2={540} y2={170} stroke={INK} strokeWidth={8} />
    <path d="M 470,170 L 610,170 L 650,250 L 430,250 Z" fill="#3a3346" stroke={INK} strokeWidth={8} />
    <ellipse cx={540} cy={252} rx={100} ry={18} fill={lamp > 0.1 ? "#fff1b0" : "#4a4458"} stroke={INK} strokeWidth={6} />
    <polygon points="440,252 640,252 1000,1700 80,1700" fill="#ffd86a" opacity={0.3 * lamp} style={{ filter: "blur(16px)" }} />
    <circle cx={540} cy={252} r={160} fill="#ffe08a" opacity={0.4 * lamp} style={{ filter: "blur(30px)" }} />
  </svg>
);
const CounterFront: React.FC = () => (
  <Svg>
    <rect x={-20} y={1380} width={1120} height={600} fill="#6b4024" stroke={INK} strokeWidth={8} />
    <rect x={-20} y={1360} width={1120} height={40} fill="#8a5a34" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={i * 200} y1={1400} x2={i * 200} y2={1920} stroke={INK} strokeWidth={4} opacity={0.4} />)}
  </Svg>
);
const Bus: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H}>
    <rect width={W} height={H} fill="#141836" />
    <rect x={40} y={260} width={1000} height={760} rx={40} fill="#0b0d26" stroke={INK} strokeWidth={14} />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = ((i * 160 - f * 14) % 1400 + 1400) % 1400 - 200;
      return <g key={i}><rect x={x} y={420 + (i % 3) * 120} width={140} height={10} rx={5} fill={i % 2 ? "#ffcf6a" : "#ff6ad0"} opacity={0.75} style={{ filter: "blur(3px)" }} />
        <circle cx={x + 70} cy={700 + (i % 4) * 60} r={18} fill={i % 2 ? "#ffcf6a" : "#6ae0ff"} opacity={0.35} style={{ filter: "blur(6px)" }} /></g>;
    })}
    <rect x={40} y={1020} width={1000} height={900} fill="#2a2f5a" />
    <rect x={40} y={1020} width={1000} height={20} fill={INK} />
    <rect x={500} y={260} width={20} height={760} fill={INK} />
  </svg>
);
const Arena: React.FC<{ f: number; dark?: number }> = ({ f, dark = 0 }) => (
  <svg width={W} height={H}>
    <defs><radialGradient id="ar" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor="#3a1f6e" /><stop offset="1" stopColor="#07041a" /></radialGradient></defs>
    <rect width={W} height={H} fill="url(#ar)" />
    {/* огромный экран */}
    <rect x={190} y={160} width={700} height={400} rx={10} fill="#1f3a8a" stroke={INK} strokeWidth={10} />
    <rect x={190} y={160} width={700} height={400} fill="#5fd0ff" opacity={0.35 + 0.15 * Math.sin(f / 6)} />
    {/* прожекторы */}
    {[0, 1, 2, 3].map((i) => {
      const a = Math.sin(f / 30 + i * 1.7) * 0.25;
      const x0 = 120 + i * 280;
      return <polygon key={i} points={`${x0},0 ${x0 + 40},0 ${x0 + 300 + a * 900},${H} ${x0 - 220 + a * 900},${H}`} fill={i % 2 ? "#8fd8ff" : "#ff8ad8"} opacity={0.12 * (1 - dark)} style={{ filter: "blur(12px)" }} />;
    })}
    {/* трибуны с огоньками */}
    {Array.from({ length: 120 }).map((_, i) => {
      const x = random("cx" + i) * W, y = 650 + random("cy" + i) * 700;
      return <g key={i}>
        <circle cx={x} cy={y} r={16} fill="#120a2a" />
        <circle cx={x + 6} cy={y - 26 - 6 * Math.abs(Math.sin(f / 5 + i))} r={4} fill={i % 3 ? "#6ae0ff" : "#ff6ad0"} opacity={(0.8 * (1 - dark)) * (random("co" + i) > 0.5 ? 1 : 0)} />
      </g>;
    })}
    <rect y={1350} width={W} height={H - 1350} fill="#0d0820" />
    <rect y={1350} width={W} height={10} fill="#5fe8ff" opacity={0.8 * (1 - dark)} />
  </svg>
);

// Аура — языки пламени по краю эллипса (как «Kaioken» в образце)
const Aura: React.FC<{ f: number; x: number; y: number; rx: number; ry: number; color: string; k: number }> = ({ f, x, y, rx, ry, color, k }) => {
  if (k <= 0.01) return null;
  const layer = (sc: number, fill: string, o: number, seed: number) => {
    const N = 34, pts: string[] = [];
    for (let i = 0; i < N * 2; i++) {
      const a = (i / (N * 2)) * Math.PI * 2;
      const up = Math.max(0, -Math.sin(a)) * 0.35;
      const j = i % 2 ? 0.93 : 1.05 + 0.18 * Math.abs(Math.sin(f / 2.2 + i * 1.3 + seed)) + up;
      pts.push(`${x + Math.cos(a) * rx * sc * j},${y + Math.sin(a) * ry * sc * j - (i % 2 ? 0 : up * 120)}`);
    }
    return <polygon points={pts.join(" ")} fill={fill} opacity={o * k} />;
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <g style={{ filter: "blur(3px)" }}>
        {layer(1.12, color, 0.55, 0)}
        {layer(0.96, color, 0.8, 2)}
        {layer(0.8, "#ffffff", 0.55, 4)}
      </g>
      {Array.from({ length: 16 }).map((_, i) => {
        const yy = y + ry - ((f * 9 + i * 97) % (ry * 2.4));
        return <circle key={i} cx={x + (random("ap" + i) - 0.5) * rx * 1.8} cy={yy} r={3 + random("ar" + i) * 4} fill="#fff" opacity={0.8 * k} />;
      })}
    </svg>
  );
};

// Шкала (как «muscle can do» в образце, без надписей)
const Meter: React.FC<{ x: number; y: number; w: number; v: number; color: string; mark?: number; broken?: boolean }> = ({ x, y, w, v, color, mark, broken }) => (
  <Svg>
    <rect x={x - 20} y={y - 30} width={w + 40} height={110} rx={18} fill="#0b0a18" opacity={0.85} stroke="#ffffff33" strokeWidth={3} />
    <rect x={x} y={y} width={w} height={50} rx={25} fill="#ffffff22" />
    <rect x={x} y={y} width={w * v} height={50} rx={25} fill={color} />
    <rect x={x} y={y + 4} width={w * v} height={14} rx={7} fill="#fff" opacity={0.35} />
    {mark !== undefined ? <rect x={x + w * mark - 4} y={y - 18} width={8} height={86} fill="#fff" /> : null}
    {broken ? <path d={`M ${x + w * v - 10},${y - 10} l 20,24 l -16,10 l 22,30`} stroke="#fff" strokeWidth={6} fill="none" /> : null}
  </Svg>
);

const Confetti: React.FC<{ f: number }> = ({ f }) => (
  <Svg>
    {Array.from({ length: 90 }).map((_, i) => {
      const x = random("q" + i) * W + Math.sin(f / 8 + i) * 30;
      const y = -100 + ((f * (8 + random("qv" + i) * 8) + random("qy" + i) * 900) % 2100);
      const c = ["#ffd34a", "#ff5fa0", "#5fe8ff", "#fff", "#8aff7a"][i % 5];
      return <rect key={i} x={x} y={y} width={18} height={30} fill={c} transform={`rotate(${f * 8 + i * 40},${x + 9},${y + 15})`} />;
    })}
  </Svg>
);

// ---------- сцены ----------
const Base: React.FC<{ p: SP; punch?: number; sh?: [number, number]; oy?: number; ox?: number; zoomOut?: boolean; children: React.ReactNode }> = ({ p, punch = 0, sh = [0, 0], oy = 42, ox = 50, zoomOut, children }) => {
  const c = cam(p.f, p.d, punch);
  const z = zoomOut ? c.z + 0.08 - interpolate(p.f, [0, p.d], [0, 0.14], clamp) : c.z;
  return <AbsoluteFill><Cam z={z} blur={c.blur} sx={sh[0]} sy={sh[1]} ox={ox} oy={oy}>{children}</Cam></AbsoluteFill>;
};
const BG: React.FC<{ blur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ blur = 6, children, style }) => (
  <AbsoluteFill style={{ filter: `blur(${blur}px)`, ...style }}>{children}</AbsoluteFill>
);

// 1 коридор
const A1: React.FC<SP> = (p) => {
  const k = loc(p, "бездарностью");
  return (
    <Base p={p} punch={punchAt(p.f, k)} sh={shake(p.f, k, 14, 10) as [number, number]}>
      <BG blur={5}><Hallway f={p.f} /></BG>
      <Rays f={p.f} />
      <AbsoluteFill style={{ filter: "blur(3px) brightness(0.8)" }}>
        <Svg>
          <AnimeChar id="k0" look={KIDS[0]} x={150} y={840} s={0.62} t={p.f + 7} expr="laugh" pose="point" />
          <AnimeChar id="k1" look={KIDS[1]} x={330} y={800} s={0.55} t={p.f + 3} expr="laugh" pose="belly" />
          <AnimeChar id="k2" look={KIDS[2]} x={760} y={810} s={0.56} t={p.f + 11} expr="laugh" pose="belly" />
          <AnimeChar id="k3" look={KIDS[3]} x={940} y={850} s={0.62} t={p.f} expr="laugh" pose="point" mirror />
        </Svg>
      </AbsoluteFill>
      <Svg><AnimeChar id="leo" look={LEO} x={540} y={1060} s={1.2} t={p.f} expr={p.f >= k ? "hurt" : "sad"} gaze={[0, 0.8]} headDown={p.f >= k ? 1.2 : 0.6} tilt={p.f >= k ? -4 : 0} /></Svg>
      <Dust f={p.f} />
    </Base>
  );
};
// 2 родители
const A2: React.FC<SP> = (p) => {
  const k = loc(p, "запрещали"), on = p.f >= k;
  const rage = on ? interpolate(p.f - k, [0, 3, 20], [0, 1, 0.85], clamp) : 0;
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k)} sh={shake(p.f, k, 24, 14) as [number, number]}>
        <BG><LivingRoom /></BG>
        <RedRage f={p.f} k={rage} />
        <Svg>
          <AnimeChar id="mom" look={MOM} x={300} y={820} s={0.95} t={p.f + 13} expr={on ? "angry" : "stern"} rim={on ? "#ffd0d0" : "#bfe9ff"} gaze={[0.4, 0.3]} />
          <AnimeChar id="dad" look={DAD} x={730} y={760} s={1.08} t={p.f} expr={on ? "angry" : "stern"} pose="cord" cordLift={after(p.f, k, -4, 2)} rim={on ? "#ffd0d0" : "#bfe9ff"} gaze={[-0.3, 0.3]} />
        </Svg>
        <Glow bg="radial-gradient(ellipse 80% 50% at 50% 100%, rgba(80,200,255,0.55), rgba(80,200,255,0) 70%)" o={on ? interpolate(p.f - k, [0, 2], [1, 0], clamp) : 1} />
        <Dust f={p.f} color={on ? "#ffe0e0" : "#d8f2ff"} n={30} seed="p" />
      </Base>
      <Burst f={p.f - k} x={600} y={720} color="#ffd0d0" size={1.1} />
    </AbsoluteFill>
  );
};
// 3 ночь у окна
const A3: React.FC<SP> = (p) => {
  const lk = interpolate(p.f, [8, 22], [0, 1], { ...clamp, easing: ease });
  return (
    <Base p={p} oy={40}>
      <BG blur={4}><NightRoom f={p.f} /></BG>
      <Svg><AnimeChar id="leo" look={LEO} x={540} y={1080} s={1.15} t={p.f} expr="sneak" hoodUp gaze={[-0.9 * lk, 0.1]} side={-0.7 * lk} tilt={-3 * lk} rim="#a9c8ff" /></Svg>
      <Glow bg="linear-gradient(180deg, rgba(40,60,160,0.25), rgba(10,10,40,0.35))" blend="multiply" />
      <Dust f={p.f} color="#c9d8ff" n={25} seed="n" />
    </Base>
  );
};
// клуб за компьютером (используется много раз)
const ClubDesk: React.FC<SP & { hit?: number; expr?: any; lampOn?: boolean; red?: number; aura?: number; auraColor?: string; tears?: number }> = (p) => {
  const k = p.hit ?? 99999;
  const lamp = p.lampOn ? 1 : p.f >= k ? interpolate(p.f - k, [0, 2, 4, 5, 8], [0, 1, 0.3, 1, 1], clamp) : 0;
  const red = p.red ?? 0;
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.07)} sh={shake(p.f, k, 12, 10) as [number, number]} oy={38}>
        <BG blur={7}><Club f={p.f} lamp={lamp} /></BG>
        {p.aura ? <Aura f={p.f} x={540} y={1000} rx={430} ry={720} color={p.auraColor ?? "#4fb8ff"} k={p.aura} /> : null}
        <Svg>
          <AnimeChar id="leo" look={LEO} x={540} y={900} s={1.15} t={p.f} expr={p.expr ?? "focus"} pose="desk" phones rim={lamp > 0.5 ? "#ffe9a8" : "#8fefff"} eyeGlow={red > 0.5 ? "#ff7a7a" : "#7ff0ff"} gaze={[0, 0.5]} tears={p.tears} />
          <rect x={-20} y={1560} width={1120} height={400} fill="#20183a" stroke={INK} strokeWidth={8} />
          <rect x={300} y={1520} width={480} height={70} rx={10} fill="#2d2a40" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={318 + i * 38} y={1532 + (i % 2) * 22} width={28} height={16} rx={3} fill={i % 4 ? "#6a5cff" : "#3fe4ff"} opacity={0.5 + 0.5 * (random("kb" + i + Math.floor(p.f / 3)) > 0.5 ? 1 : 0)} />)}
        </Svg>
        <Glow bg={`radial-gradient(ellipse 50% 40% at 50% 70%, ${red > 0.5 ? "rgba(255,60,60,0.55)" : "rgba(90,230,255,0.45)"}, rgba(0,0,0,0) 70%)`} o={0.8 + 0.2 * Math.sin(p.f / 4)} />
        <Glow bg="radial-gradient(ellipse 45% 35% at 50% 20%, rgba(255,220,120,0.5), rgba(255,220,120,0) 70%)" o={lamp} />
        <RedRage f={p.f} k={red * 0.5} />
        <Dust f={p.f} color="#ffeab0" n={30} seed="c" />
      </Base>
      <Burst f={p.f - k} x={540} y={560} color={red > 0.5 ? "#ffb0b0" : "#ffe9a8"} size={1.2} />
    </AbsoluteFill>
  );
};
const A4: React.FC<SP> = (p) => <ClubDesk {...p} hit={loc(p, "клубе")} expr={p.f >= loc(p, "клубе") ? "focus" : "neutral"} />;

// 5 «Его звали Лео. Четырнадцать лет»
const A5: React.FC<SP> = (p) => {
  const k = loc(p, "лео", 1);
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.05)} oy={36}>
        <BG blur={6}><Bedroom f={p.f} /></BG>
        <Rays f={p.f} o={0.3} />
        <Svg><AnimeChar id="leo" look={LEO} x={540} y={980} s={1.3} t={p.f} expr="smile" gaze={[0.2, 0]} /></Svg>
        <Dust f={p.f} />
      </Base>
      <Burst f={p.f - k} x={540} y={760} color="#fff2c0" size={0.9} />
    </AbsoluteFill>
  );
};
// 6 «тихий, в команду его всегда брали последним» — спортзал, команды расходятся
const A6: React.FC<SP> = (p) => {
  const k = loc(p, "последним");
  const go = interpolate(p.f, [0, p.d], [0, 1], clamp);
  return (
    <Base p={p} zoomOut>
      <BG blur={6}><Gym /></BG>
      <AbsoluteFill style={{ filter: "blur(2px)" }}>
        <Svg>
          <AnimeChar id="g0" look={KIDS[0]} x={170 - 120 * go} y={880} s={0.6} t={p.f + 3} expr="smile" gaze={[-0.6, 0]} />
          <AnimeChar id="g1" look={KIDS[1]} x={300 - 120 * go} y={900} s={0.6} t={p.f + 9} expr="smile" gaze={[-0.6, 0]} />
          <AnimeChar id="g2" look={KIDS[2]} x={790 + 120 * go} y={900} s={0.6} t={p.f + 5} expr="smile" gaze={[0.6, 0]} />
          <AnimeChar id="g3" look={KIDS[3]} x={920 + 120 * go} y={880} s={0.6} t={p.f} expr="smile" gaze={[0.6, 0]} />
        </Svg>
      </AbsoluteFill>
      <Svg><AnimeChar id="leo" look={LEO} x={540} y={1120} s={1.0} t={p.f} expr={p.f >= k ? "hurt" : "sad"} gaze={[p.f >= k ? 0 : Math.sin(p.f / 12) * 0.7, 0.6]} headDown={0.8} /></Svg>
      <Glow bg="linear-gradient(180deg, rgba(60,60,120,0), rgba(20,20,60,0.35))" blend="multiply" />
    </Base>
  );
};
// 7 «В школе один парень следил, чтобы над ним смеялись все» — смеющиеся крупно
const A7: React.FC<SP> = (p) => {
  const k = loc(p, "смеялись");
  return (
    <Base p={p} punch={punchAt(p.f, k, 0.06)} sh={shake(p.f, k, 10, 10) as [number, number]}>
      <BG blur={7}><Hallway f={p.f} /></BG>
      <Svg style={{ filter: "blur(1.5px)" }}>
        <AnimeChar id="leo" look={LEO} x={540} y={1060} s={0.75} t={p.f} expr="sad" headDown={1} gaze={[0, 0.8]} />
      </Svg>
      <Svg>
        <AnimeChar id="k0" look={KIDS[0]} x={150} y={1050} s={1.05} t={p.f + 7} expr={p.f >= k ? "laugh" : "smirk"} pose="belly" gaze={[0.6, 0.3]} />
        <AnimeChar id="k3" look={KIDS[3]} x={940} y={1080} s={1.05} t={p.f} expr={p.f >= k ? "laugh" : "smirk"} pose="belly" mirror gaze={[0.6, 0.3]} />
      </Svg>
      <Dust f={p.f} />
    </Base>
  );
};
// 8 Макс
const A8: React.FC<SP> = (p) => {
  const k = loc(p, "макс", 1), q = loc(p, "салки");
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.08) + punchAt(p.f, q, 0.04)} sh={shake(p.f, k, 18, 12) as [number, number]}>
        <BG blur={6}><Hallway f={p.f} /></BG>
        <RedRage f={p.f} k={p.f >= k ? 0.55 : 0} />
        <Svg>
          <AnimeChar id="max" look={MAX} x={540} y={980} s={1.28} t={p.f} expr={p.f >= q ? "laugh" : "smirk"} pose={p.f >= q ? "belly" : "point"} rim="#ffd0c0" gaze={[0, 0.2]} mouthAmt={p.f >= loc(p, "лео", 2) && p.f < q ? 0.5 + 0.5 * Math.abs(Math.sin(p.f / 2)) : undefined} />
        </Svg>
        <Dust f={p.f} color="#ffe0d0" />
      </Base>
      <Burst f={p.f - k} x={540} y={700} color="#ffc0a0" size={1.2} />
    </AbsoluteFill>
  );
};
// 9 «Дома правило было простым. Никаких игр.»
const A9: React.FC<SP> = (p) => {
  const k = loc(p, "никаких");
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.1)} sh={shake(p.f, k, 22, 14) as [number, number]} oy={36}>
        <BG><LivingRoom /></BG>
        <RedRage f={p.f} k={p.f >= k ? 0.9 : 0} />
        <Svg><AnimeChar id="dad" look={DAD} x={540} y={980} s={1.35} t={p.f} expr={p.f >= k ? "angry" : "stern"} pose={p.f >= k ? "point" : "down"} rim={p.f >= k ? "#ffd0d0" : "#ffffff"} /></Svg>
      </Base>
      <Burst f={p.f - k} x={540} y={760} color="#ffd0d0" size={1.2} />
    </AbsoluteFill>
  );
};
// 10b бег по ночной улице
const A10: React.FC<SP> = (p) => {
  const bob = Math.abs(Math.sin(p.f / 3.2)) * 18;
  return (
    <Base p={p}>
      <BG blur={4}><NightStreet f={p.f} /></BG>
      <Svg>
        {Array.from({ length: 22 }).map((_, i) => {
          const a = (i / 22) * Math.PI * 2, r0 = 380 + ((p.f * 40 + i * 70) % 500);
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 160)} y2={900 + Math.sin(a) * (r0 + 160)} stroke="#fff" strokeWidth={4} opacity={0.25} />;
        })}
        <AnimeChar id="leo" look={LEO} x={540} y={1000 - bob} s={1.1} t={p.f} expr="determined" hoodUp pose="run" rim="#ffd98a" />
      </Svg>
      <Dust f={p.f} color="#ffe6a0" n={20} />
    </Base>
  );
};
// 11 хозяин клуба
const A11: React.FC<SP> = (p) => {
  const k = loc(p, "свет");
  const lamp = p.f >= k ? interpolate(p.f - k, [0, 2, 4, 5, 8], [0, 1, 0.3, 1, 1], clamp) : 0;
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.06)} oy={30}>
        <BG blur={6}><Counter lamp={lamp} /></BG>
        <Svg><AnimeChar id="own" look={OWNER} x={540} y={940} s={1.15} t={p.f} expr="smile" gaze={[0, 0.1]} rim={lamp > 0.5 ? "#ffe6a0" : "#c0d0ff"} /></Svg>
        <CounterFront />
        <Glow bg="radial-gradient(ellipse 45% 35% at 50% 20%, rgba(255,220,120,0.55), rgba(255,220,120,0) 70%)" o={lamp} />
        <Dust f={p.f} color="#ffeab0" n={lamp > 0.5 ? 45 : 15} seed="o" />
      </Base>
      <Burst f={p.f - k} x={540} y={260} color="#ffe9a8" size={1.0} />
    </AbsoluteFill>
  );
};
// 13 вид с экрана: прицел, мишени, перемотка, часы
const A13: React.FC<SP> = (p) => {
  const k2 = loc(p, "разбор"), k3 = loc(p, "тысячи");
  const ph = p.f >= k3 ? 2 : p.f >= k2 ? 1 : 0;
  const tgt = [[300, 700], [760, 560], [540, 1000], [250, 1180], [820, 1250], [600, 760]];
  const ti = Math.floor(p.f / 7) % tgt.length;
  const [tx, ty] = tgt[ti];
  const cx = interpolate(p.f % 7, [0, 4], [tgt[(ti + tgt.length - 1) % tgt.length][0], tx], { ...clamp, easing: ease });
  const cy = interpolate(p.f % 7, [0, 4], [tgt[(ti + tgt.length - 1) % tgt.length][1], ty], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k2, 0.05) + punchAt(p.f, k3, 0.05)} sh={shake(p.f, k3, 14, 10) as [number, number]}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #14365a, #050a18)" }} />
        <Svg>
          {/* сетка «игры» */}
          {Array.from({ length: 14 }).map((_, i) => <line key={"h" + i} x1={0} y1={300 + i * 110} x2={W} y2={300 + i * 110} stroke="#3fe4ff" strokeWidth={2} opacity={0.15} />)}
          {Array.from({ length: 10 }).map((_, i) => <line key={"v" + i} x1={i * 120} y1={200} x2={i * 120} y2={1800} stroke="#3fe4ff" strokeWidth={2} opacity={0.15} />)}
          {ph === 0 ? (
            <g>
              <circle cx={tx} cy={ty} r={46} fill="#ff4a5a" stroke="#fff" strokeWidth={6} opacity={p.f % 7 < 5 ? 1 : 0} />
              <circle cx={tx} cy={ty} r={20} fill="#fff" opacity={p.f % 7 < 5 ? 1 : 0} />
              <g transform={`translate(${cx},${cy})`}>
                <circle r={70} fill="none" stroke="#7ff0ff" strokeWidth={6} />
                <line x1={-110} x2={-30} stroke="#7ff0ff" strokeWidth={6} /><line x1={30} x2={110} stroke="#7ff0ff" strokeWidth={6} />
                <line y1={-110} y2={-30} stroke="#7ff0ff" strokeWidth={6} /><line y1={30} y2={110} stroke="#7ff0ff" strokeWidth={6} />
              </g>
            </g>
          ) : ph === 1 ? (
            <g>
              {/* перемотка записи: кадры-полоски уезжают назад */}
              {Array.from({ length: 6 }).map((_, i) => {
                const x = ((i * 260 + (p.f - k2) * 30) % 1560) - 260;
                return <rect key={i} x={x} y={760} width={220} height={400} rx={12} fill="#1f4a7a" stroke="#7ff0ff" strokeWidth={5} opacity={0.8} />;
              })}
              <polygon points="470,880 470,1040 400,960" fill="#fff" /><polygon points="560,880 560,1040 490,960" fill="#fff" />
              <rect x={140} y={1300} width={800} height={14} rx={7} fill="#ffffff33" />
              <rect x={140} y={1300} width={800 * (1 - ((p.f - k2) % 30) / 30)} height={14} rx={7} fill="#7ff0ff" />
            </g>
          ) : (
            <g transform="translate(540,960)">
              <circle r={330} fill="#0b1a33" stroke="#7ff0ff" strokeWidth={14} />
              {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-290} x2={0} y2={-250} stroke="#7ff0ff" strokeWidth={10} transform={`rotate(${i * 30})`} />)}
              <line x1={0} y1={0} x2={0} y2={-260} stroke="#fff" strokeWidth={12} strokeLinecap="round" transform={`rotate(${(p.f - k3) * 40})`} />
              <line x1={0} y1={0} x2={0} y2={-170} stroke="#ffd34a" strokeWidth={16} strokeLinecap="round" transform={`rotate(${(p.f - k3) * 4})`} />
              <circle r={22} fill="#fff" />
            </g>
          )}
        </Svg>
        <Glow bg="radial-gradient(ellipse 60% 40% at 50% 50%, rgba(80,220,255,0.25), rgba(0,0,0,0) 70%)" />
      </Base>
      <Burst f={p.f - k2} x={540} y={960} size={0.9} />
      <Burst f={p.f - k3} x={540} y={960} size={1.1} color="#ffe9a8" />
      {ph === 0 ? <Burst f={(p.f % 7) - 4} x={tx} y={ty} size={0.35} color="#ffb0b0" /> : null}
    </AbsoluteFill>
  );
};
// 15 городской кубок: маленькая сцена, проигрыш
const A15: React.FC<SP> = (p) => {
  const k = loc(p, "вылет");
  const lose = p.f >= k;
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.08)} sh={shake(p.f, k, 20, 12) as [number, number]}>
        <BG blur={6}><Arena f={p.f} dark={0.5} /></BG>
        <RedRage f={p.f} k={lose ? 0.6 : 0} />
        <Svg>
          <AnimeChar id="leo" look={LEO} x={540} y={980} s={1.15} t={p.f} expr={lose ? "shocked" : "focus"} phones pose="desk" rim={lose ? "#ffb0b0" : "#9fefff"} gaze={[0, 0.4]} />
          <rect x={-20} y={1560} width={1120} height={400} fill="#20183a" stroke={INK} strokeWidth={8} />
        </Svg>
        <Meter x={190} y={330} w={700} v={lose ? 0.18 : interpolate(p.f, [0, k], [0.6, 0.35], clamp)} color={lose ? "#ff4a5a" : "#7ff0ff"} broken={lose} />
      </Base>
      <Burst f={p.f - k} x={540} y={360} color="#ff9a9a" size={1.0} />
    </AbsoluteFill>
  );
};
// 16 онлайн-отбор: шкала не дотянула до отметки
const A16: React.FC<SP> = (p) => {
  const k = loc(p, "хватило");
  const v = interpolate(p.f, [0, k], [0.2, 0.93], { ...clamp, easing: Easing.out(Easing.cubic) });
  const miss = p.f >= k;
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.07)} sh={shake(p.f, k, 16, 12) as [number, number]}>
        <ClubDeskBG f={p.f} />
        <Svg><AnimeChar id="leo" look={LEO} x={540} y={1180} s={1.0} t={p.f} expr={miss ? "hurt" : "determined"} phones pose="desk" rim="#9fefff" gaze={[0, -0.6]} /></Svg>
        <Meter x={190} y={430} w={700} v={v} mark={0.95} color={miss ? "#ff4a5a" : "#ffe14a"} broken={miss} />
        <RedRage f={p.f} k={miss ? 0.4 : 0} />
      </Base>
      <Burst f={p.f - k} x={190 + 700 * 0.94} y={455} color="#ff9a9a" size={0.6} />
    </AbsoluteFill>
  );
};
const ClubDeskBG: React.FC<{ f: number }> = ({ f }) => <BG blur={7}><Club f={f} lamp={1} /></BG>;
// 17 автобус, слёзы
const A17: React.FC<SP> = (p) => (
  <Base p={p} oy={40}>
    <BG blur={3}><Bus f={p.f} /></BG>
    <Svg><AnimeChar id="leo" look={LEO} x={540} y={1150} s={1.1} t={p.f} expr="cry" tears={interpolate(p.f, [10, 40], [0.2, 1], clamp)} gaze={[-0.8, 0.2]} side={-0.5} headDown={0.5} rim="#ffb0e0" /></Svg>
    <Glow bg="linear-gradient(90deg, rgba(255,120,200,0.18), rgba(80,200,255,0.18))" o={0.6 + 0.4 * Math.sin(p.f / 5)} />
  </Base>
);
// 17b снова в клуб: надевает наушники, решимость
const A17b: React.FC<SP> = (p) => <ClubDesk {...p} lampOn expr="determined" />;
// 18 сообщение на телефоне (вид от первого лица)
const A18: React.FC<SP> = (p) => {
  const k = loc(p, "сообщение");
  const pop = after(p.f, k, 0, 6);
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.06)}>
        <BG blur={10}><Club f={p.f} lamp={1} /></BG>
        <Svg>
          <g transform="translate(540,1050) rotate(-4)">
            <rect x={-250} y={-470} width={500} height={940} rx={60} fill="#111" stroke={INK} strokeWidth={10} />
            <rect x={-225} y={-440} width={450} height={880} rx={40} fill={p.f >= k ? "#1b2a5a" : "#0b0f20"} />
            <g transform={`translate(0,${-200 + (1 - pop) * -120}) scale(${0.8 + 0.2 * pop})`} opacity={pop}>
              <rect x={-200} y={-90} width={400} height={180} rx={30} fill="#f4f6ff" stroke={INK} strokeWidth={6} />
              <circle cx={-130} cy={0} r={46} fill="#3fa0ff" />
              <path d="M -150,-14 L -110,-14 L -110,14 L -130,14 L -140,26 L -140,14 L -150,14 Z" fill="#fff" />
              <rect x={-60} y={-34} width={220} height={22} rx={11} fill="#9aa4c8" />
              <rect x={-60} y={6} width={160} height={22} rx={11} fill="#c8cee6" />
            </g>
          </g>
          {/* руки держат телефон */}
          <ellipse cx={300} cy={1350} rx={80} ry={110} fill={LEO.skin} stroke={INK} strokeWidth={6} />
          <ellipse cx={780} cy={1350} rx={80} ry={110} fill={LEO.skin} stroke={INK} strokeWidth={6} />
          <path d="M 220,1440 L 180,1920 L 420,1920 L 380,1440 Z" fill={LEO.top} stroke={INK} strokeWidth={6} />
          <path d="M 860,1440 L 900,1920 L 660,1920 L 700,1440 Z" fill={LEO.top} stroke={INK} strokeWidth={6} />
        </Svg>
        <Glow bg="radial-gradient(ellipse 40% 30% at 50% 45%, rgba(100,170,255,0.5), rgba(0,0,0,0) 70%)" o={pop} />
      </Base>
      <Burst f={p.f - k} x={540} y={850} size={0.9} />
    </AbsoluteFill>
  );
};
// 18b реакция: финал!
const A18b: React.FC<SP> = (p) => {
  const k = loc(p, "финал");
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.1)} sh={shake(p.f, k, 16, 10) as [number, number]}>
        <BG blur={7}><Club f={p.f} lamp={1} /></BG>
        <Aura f={p.f} x={540} y={1000} rx={440} ry={720} color="#4fb8ff" k={p.f >= k ? after(p.f, k, 0, 8) * 0.8 : 0} />
        <Svg><AnimeChar id="leo" look={LEO} x={540} y={960} s={1.3} t={p.f} expr={p.f >= k ? "joy" : "shocked"} pose="phone" rim="#cfefff" />
          <g transform="translate(540,1700)"><rect x={-60} y={-110} width={120} height={200} rx={18} fill="#111" stroke={INK} strokeWidth={6} /><rect x={-50} y={-98} width={100} height={176} rx={12} fill="#3f7aff" /><circle r={120} fill="#7fb0ff" opacity={0.3} style={{ filter: "blur(20px)" }} /></g></Svg>
        <Dust f={p.f} color="#cfefff" n={40} />
      </Base>
      <Burst f={p.f - k} x={540} y={780} size={1.3} />
    </AbsoluteFill>
  );
};
// 19 арена, застыл
const A19: React.FC<SP> = (p) => {
  const k = loc(p, "застыл");
  return (
    <Base p={p} zoomOut punch={punchAt(p.f, k, 0.06)}>
      <BG blur={4}><Arena f={p.f} /></BG>
      <Svg><AnimeChar id="leo" look={LEO} x={540} y={1250} s={0.85} t={p.f} expr={p.f >= k ? "shocked" : "neutral"} gaze={[0, -0.4]} rim="#cfefff" blink={p.f < k} /></Svg>
      <Dust f={p.f} color="#cfe0ff" n={40} />
    </Base>
  );
};
// 20 напротив — Макс
const A20: React.FC<SP> = (p) => {
  const k = loc(p, "макс", 2);
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.1)} sh={shake(p.f, k, 20, 12) as [number, number]} oy={38}>
        <BG blur={7}><Arena f={p.f} dark={p.f >= k ? 0.6 : 0} /></BG>
        <RedRage f={p.f} k={p.f >= k ? 0.5 : 0} />
        <Svg>
          <AnimeChar id="max" look={MAX} x={540} y={900} s={1.15} t={p.f} expr="smirk" pose="desk" phones rim="#ffb0a0" gaze={[0, 0]} />
          <rect x={-20} y={1560} width={1120} height={400} fill="#2a0e1a" stroke={INK} strokeWidth={8} />
          <rect x={-20} y={1556} width={1120} height={10} fill="#ff4a5a" />
        </Svg>
      </Base>
      <Burst f={p.f - k} x={540} y={560} color="#ffb0a0" size={1.3} />
    </AbsoluteFill>
  );
};
// 21 сплит: Лео сверху, Макс снизу
const A21: React.FC<SP> = (p) => {
  const k = loc(p, "ничья");
  const sl = after(p.f, 0, 0, 10);
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.05)} sh={shake(p.f, k, 12, 10) as [number, number]}>
        <AbsoluteFill style={{ clipPath: "polygon(0 0, 100% 0, 100% 44%, 0 56%)", transform: `translateX(${(1 - sl) * -300}px)` }}>
          <BG blur={8}><Club f={p.f} lamp={1} /></BG>
          <Glow bg="rgba(60,140,255,0.25)" />
          <Svg><AnimeChar id="leo" look={LEO} x={540} y={600} s={1.0} t={p.f} expr="determined" phones rim="#9fdcff" eyeGlow="#7ff0ff" /></Svg>
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: "polygon(0 56%, 100% 44%, 100% 100%, 0 100%)", transform: `translateX(${(1 - sl) * 300}px)` }}>
          <BG blur={8}><Arena f={p.f} dark={0.6} /></BG>
          <Glow bg="rgba(255,60,80,0.3)" />
          <Svg><AnimeChar id="max" look={MAX} x={540} y={1480} s={1.0} t={p.f} expr="determined" phones rim="#ffb0a0" eyeGlow="#ff8a8a" /></Svg>
        </AbsoluteFill>
        <Svg><line x1={0} y1={1075} x2={W} y2={845} stroke="#fff" strokeWidth={12} /><line x1={0} y1={1075} x2={W} y2={845} stroke="#fff" strokeWidth={40} opacity={0.3} style={{ filter: "blur(10px)" }} /></Svg>
      </Base>
      <Burst f={p.f - k} x={540} y={960} size={1.2} />
    </AbsoluteFill>
  );
};
// 22 последний, один против троих: метки врагов
const A22: React.FC<SP> = (p) => {
  const k = loc(p, "троих");
  return (
    <AbsoluteFill>
      <Base p={p} punch={punchAt(p.f, k, 0.06)}>
        <BG blur={7}><Club f={p.f} lamp={1} /></BG>
        <Glow bg="rgba(0,0,30,0.45)" blend="multiply" />
        <Aura f={p.f} x={540} y={1000} rx={430} ry={720} color="#4fb8ff" k={after(p.f, 0, 0, 30) * 0.7} />
        <Svg>
          <AnimeChar id="leo" look={LEO} x={540} y={900} s={1.15} t={p.f} expr="determined" pose="desk" phones rim="#9fdcff" eyeGlow="#7ff0ff" gaze={[0, 0.5]} />
          <rect x={-20} y={1560} width={1120} height={400} fill="#20183a" stroke={INK} strokeWidth={8} />
          {[[170, 360], [540, 250], [910, 360]].map(([x, y], i) => {
            const o = after(p.f, k + i * 4, 0, 5);
            return <g key={i} opacity={o} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * o})`}>
              <polygon points="0,60 -50,-30 50,-30" fill="#ff3a4a" stroke="#fff" strokeWidth={6} />
              <circle r={90} fill="#ff3a4a" opacity={0.2} />
            </g>;
          })}
        </Svg>
      </Base>
    </AbsoluteFill>
  );
};
// 23 зал затих: всё темнеет, тишина
const A23: React.FC<SP> = (p) => (
  <Base p={p} zoomOut>
    <BG blur={5} style={{ filter: "blur(5px) saturate(0.2) brightness(0.5)" }}><Arena f={0} dark={1} /></BG>
    <Svg><AnimeChar id="leo" look={LEO} x={540} y={1100} s={0.9} t={p.f} expr="determined" phones rim="#ffffff" eyeGlow="#7ff0ff" blink={false} /></Svg>
    <Glow bg="radial-gradient(ellipse 30% 25% at 50% 45%, rgba(255,255,255,0.18), rgba(0,0,0,0) 70%)" />
  </Base>
);
// 24 выстрел, второй, третий
const A24: React.FC<SP> = (p) => {
  const hits = [loc(p, "выстрел"), loc(p, "второй"), loc(p, "третий")];
  const n = hits.filter((h) => p.f >= h).length;
  const sh = hits.reduce((a, h) => { const s = shake(p.f, h, 22, 10); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
  const pu = hits.reduce((a, h, i) => a + punchAt(p.f, h, 0.05 + i * 0.02), 0);
  return (
    <AbsoluteFill>
      <Base p={p} punch={pu} sh={sh as [number, number]}>
        <AbsoluteFill style={{ background: "#05030e" }} />
        <Aura f={p.f} x={540} y={1000} rx={450} ry={740} color="#4fb8ff" k={0.5 + 0.17 * n} />
        <Svg>
          <AnimeChar id="leo" look={LEO} x={540} y={900} s={1.2} t={p.f} expr="determined" pose="desk" phones rim="#cfefff" eyeGlow="#ffffff" gaze={[0, 0.5]} />
          {[[170, 360], [540, 250], [910, 360]].map(([x, y], i) => (
            <g key={i} opacity={i < n ? 0 : 1} transform={`translate(${x},${y})`}>
              <polygon points="0,60 -50,-30 50,-30" fill="#ff3a4a" stroke="#fff" strokeWidth={6} />
            </g>
          ))}
        </Svg>
      </Base>
      {hits.map((h, i) => <Burst key={i} f={p.f - h} x={[170, 540, 910][i]} y={[360, 250, 360][i]} size={0.9} color="#bff6ff" />)}
      {hits.map((h, i) => <AbsoluteFill key={"fl" + i} style={{ background: "#fff", opacity: interpolate(p.f - h, [0, 1, 5], [0, 0.7, 0], clamp) }} />)}
    </AbsoluteFill>
  );
};
// 25 победа
const A25: React.FC<SP> = (p) => (
  <AbsoluteFill>
    <Base p={p} punch={punchAt(p.f, 0, 0.1)} sh={shake(p.f, 0, 26, 16) as [number, number]}>
      <BG blur={6}><Arena f={p.f} /></BG>
      <Aura f={p.f} x={540} y={1000} rx={460} ry={760} color="#ffcf4a" k={0.9} />
      <Svg>
        <AnimeChar id="mate" look={MATE} x={190} y={1150} s={0.8} t={p.f + 5} expr="joy" pose="fist" mirror />
        <AnimeChar id="leo" look={LEO} x={540} y={1000} s={1.15} t={p.f} expr="joy" pose="trophy" phones rim="#fff2c0" />
        <AnimeChar id="mate2" look={KIDS[1]} x={890} y={1150} s={0.8} t={p.f + 9} expr="joy" pose="fist" />
        {/* кубок */}
        <g transform={`translate(540,${720 - 12 * Math.abs(Math.sin(p.f / 4))})`}>
          <path d="M -90,-120 L 90,-120 C 90,-20 50,20 0,30 C -50,20 -90,-20 -90,-120 Z" fill="#ffd34a" stroke={INK} strokeWidth={8} />
          <path d="M -90,-100 C -150,-100 -150,-20 -70,-10 M 90,-100 C 150,-100 150,-20 70,-10" fill="none" stroke={INK} strokeWidth={14} />
          <path d="M -90,-100 C -150,-100 -150,-20 -70,-10 M 90,-100 C 150,-100 150,-20 70,-10" fill="none" stroke="#ffd34a" strokeWidth={6} />
          <rect x={-18} y={30} width={36} height={50} fill="#e0a92a" stroke={INK} strokeWidth={6} />
          <rect x={-60} y={78} width={120} height={30} rx={6} fill="#ffd34a" stroke={INK} strokeWidth={6} />
          <path d="M -60,-110 L -40,-40" stroke="#fff" strokeWidth={10} opacity={0.6} />
        </g>
      </Svg>
      <Confetti f={p.f} />
    </Base>
    <Burst f={p.f} x={540} y={700} size={1.5} color="#ffe9a8" />
  </AbsoluteFill>
);
// 26 отец в зале со слезами
const A26: React.FC<SP> = (p) => (
  <Base p={p} oy={38}>
    <BG blur={8}><Arena f={p.f} /></BG>
    <Glow bg="radial-gradient(ellipse 50% 40% at 50% 35%, rgba(255,220,150,0.45), rgba(0,0,0,0) 70%)" />
    <Svg><AnimeChar id="dad" look={DAD} x={540} y={980} s={1.3} t={p.f} expr="cry" tears={interpolate(p.f, [15, 45], [0.3, 1], clamp)} rim="#ffe6b0" gaze={[0, -0.3]} /></Svg>
    <Confetti f={p.f + 200} />
  </Base>
);
// 27/28 воспоминание: отец и хозяин клуба, деньги через стойку
const Flash: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "sepia(0.55) saturate(1.2) brightness(1.05)" }}>{children}</AbsoluteFill>
);
const A27: React.FC<SP> = (p) => {
  const k = loc(p, "другом");
  return (
    <Flash>
      <Base p={p} punch={punchAt(p.f, k, 0.05)} oy={36}>
        <BG blur={6}><Counter lamp={1} /></BG>
        <Svg>
          <AnimeChar id="dad" look={DAD} x={300} y={800} s={1.05} t={p.f} expr="smile" gaze={[0.6, 0]} side={0.4} />
          <AnimeChar id="own" look={OWNER} x={790} y={790} s={1.05} t={p.f + 9} expr="smile" gaze={[-0.6, 0]} side={-0.4} />
        </Svg>
        <CounterFront />
      </Base>
      <Burst f={p.f - k} x={540} y={760} size={1.0} color="#ffe9c0" />
    </Flash>
  );
};
const A28: React.FC<SP> = (p) => {
  const k = loc(p, "платил");
  const give = after(p.f, k - 8, 0, 10);
  return (
    <Flash>
      <Base p={p} punch={punchAt(p.f, k, 0.06)} oy={40}>
        <BG blur={6}><Counter lamp={1} /></BG>
        <Svg>
          <AnimeChar id="dad" look={DAD} x={260} y={820} s={1.0} t={p.f} expr="sad" pose="give" gaze={[0.7, 0.3]} side={0.4} />
          <AnimeChar id="own" look={OWNER} x={830} y={800} s={1.0} t={p.f + 9} expr="smile" gaze={[-0.7, 0.3]} side={-0.4} />
          {/* конверт с деньгами переходит из руки в руку */}
          <g transform={`translate(${interpolate(give, [0, 1], [730, 620])},${1270 - 30 * give}) rotate(-8)`}>
            <rect x={-70} y={-45} width={140} height={90} rx={6} fill="#f2e6c8" stroke={INK} strokeWidth={6} />
            <path d="M -70,-45 L 0,10 L 70,-45" fill="none" stroke={INK} strokeWidth={5} />
            <rect x={-40} y={-70} width={90} height={40} fill="#8ad07a" stroke={INK} strokeWidth={4} />
          </g>
        </Svg>
        <CounterFront />
        <Dust f={p.f} color="#fff0c0" />
      </Base>
    </Flash>
  );
};
// 29 финал: Лео с кубком смотрит в камеру, свет лампы
const A29: React.FC<SP> = (p) => (
  <Base p={p} oy={36}>
    <BG blur={7}><Club f={p.f} lamp={1} /></BG>
    <Glow bg="radial-gradient(ellipse 45% 35% at 50% 20%, rgba(255,220,120,0.55), rgba(255,220,120,0) 70%)" />
    <Svg><AnimeChar id="leo" look={LEO} x={540} y={980} s={1.35} t={p.f} expr={p.f > 30 ? "smile" : "sad"} gaze={[0, 0]} rim="#ffe9a8" /></Svg>
    <Dust f={p.f} color="#ffeab0" n={40} />
  </Base>
);

// ---------- монтаж: [первое слово сцены, № повтора, сцена] ----------
const CUTS: [string, number, React.FC<SP>][] = [
  ["все", 1, A1], ["даже", 1, A2], ["но", 1, A3], ["он", 1, A4],
  ["его", 2, A5], ["тихий", 1, A6], ["в", 3, A7], ["макс", 1, A8], ["дома", 1, A9],
  ["поэтому", 1, A3], ["бежал", 1, A10], ["старый", 1, A11],
  ["лео", 4, (p) => <ClubDesk {...p} lampOn hit={loc(p, "годами")} />], ["прицел", 1, A13],
  ["и", 2, (p) => <ClubDesk {...p} lampOn hit={loc(p, "проигрывал")} red={p.f >= loc(p, "проигрывал") ? 1 : 0} expr={p.f >= loc(p, "проигрывал") ? "hurt" : "focus"} />],
  ["городской", 1, A15], ["онлайн-отбор", 1, A16], ["он", 4, A17], ["а", 1, A17b],
  ["а", 2, A18], ["команде", 1, A18b], ["он", 5, A19], ["напротив", 1, A20], ["финальный", 1, A21],
  ["лео", 5, A22], ["зал", 2, A23], ["выстрел", 1, A24], ["они", 1, A25], ["в", 12, A26],
  ["ведь", 1, A27], ["каждую", 2, A28], ["а", 3, A29],
];

export const EsportFull: React.FC = () => {
  const f = useCurrentFrame();
  const starts = CUTS.map(([w, n], i) => (i === 0 ? 0 : wf(w, n) - 3));
  starts.push(FULL_FRAMES);
  const i = Math.max(0, starts.findIndex((c, j) => f >= c && f < starts[j + 1]));
  const S = CUTS[i][2];
  const flash = Math.max(0, ...starts.slice(1, -1).map((c) => interpolate(f - c, [0, 1, 6], [0, 0.75, 0], clamp)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <S f={f - starts[i]} d={starts[i + 1] - starts[i]} s={starts[i]} />
      <Vignette />
      <Grain f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <AbsoluteFill style={{ opacity: interpolate(f, [FULL_FRAMES - 15, FULL_FRAMES], [0, 1], clamp), background: "#000" }} />
      <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile("esport/voice_ru.mp3")} /></Sequence>
    </AbsoluteFill>
  );
};
