// Пробники стилей: один герой (MASCOT) ест бургер, 5 сек. Композиции Style-<имя>.
// Стили пикселей и карандаша делаются из flat-версии через ffmpeg (scripts/styles.sh).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Look, MASCOT, Person, STAND, V, lerp } from "../characters/Rig";
import { Full, ip, rnd, toLocal } from "../characters/kit";

export type StyleName = "flat" | "neon" | "comic" | "paper" | "clay" | "watercolor" | "noir";
export const STYLES: StyleName[] = ["flat", "neon", "comic", "paper", "clay", "watercolor", "noir"];
export const EAT_FRAMES = 150;

type Theme = { wall: string; wall2: string; sky: string; table: string; table2: string; floor: string; plate: string; look: Look; bun: string; patty: string; lettuce: string; drink: string };
const BASE: Theme = { wall: "#2f3d63", wall2: "#36456e", sky: "#9cc0e6", table: "#b07a52", table2: "#8a5a3c", floor: "#1e2a48", plate: "#e8ecf4", look: MASCOT, bun: "#e0a050", patty: "#6a3a22", lettuce: "#7fc06a", drink: "#e0524a" };
const BLACK = "#0b0b10";
const THEMES: Record<StyleName, Theme> = {
  flat: BASE,
  neon: { ...BASE, wall: "#3a3a8a", wall2: "#4a3a9a", sky: "#40f0ff" },
  comic: { ...BASE, wall: "#f2c94c", wall2: "#f5d66a", sky: "#7fd0ff", table: "#e0524a", table2: "#b03a32", floor: "#3a6ab0" },
  paper: { ...BASE, wall: "#c9a676", wall2: "#bf9a68", sky: "#9fd0d8", table: "#3d8a86", table2: "#2f6e6a", floor: "#8a6a4a" },
  clay: { ...BASE, wall: "#e8c8a8", wall2: "#e0bc98", sky: "#a8d0f0", table: "#b07a52", table2: "#946240", floor: "#a88a70" },
  watercolor: { ...BASE, wall: "#f0e4cc", wall2: "#e8dcc0", sky: "#b4d8f0", table: "#d8a070", table2: "#c08a5a", floor: "#c8b8a0", look: { ...MASCOT, top: "#f08a4c", pants: "#5a6a9a", hatColor: "#5a6a9a" } },
  noir: { ...BASE, wall: "#e8743a", wall2: "#ee8446", sky: "#ffd27a", table: BLACK, table2: BLACK, floor: BLACK, plate: BLACK, bun: BLACK, patty: BLACK, lettuce: BLACK, drink: BLACK, look: { ...MASCOT, skin: BLACK, top: BLACK, pants: BLACK, shoes: BLACK, hair: BLACK, hatColor: BLACK, hatColor2: BLACK, zip: BLACK } },
};

// бургер в локальных координатах (центр), с укусами
const Burger: React.FC<{ th: Theme; bites: number; uid: string; k?: number }> = ({ th, bites, uid, k = 1 }) => (
  <g transform={`scale(${k})`}>
    <defs>
      <mask id={uid}>
        <rect x={-60} y={-60} width={120} height={120} fill="#fff" />
        {bites > 0 ? <circle cx={-38} cy={-8} r={18} fill="#000" /> : null}
        {bites > 1 ? <circle cx={-30} cy={14} r={17} fill="#000" /> : null}
      </mask>
    </defs>
    <g mask={`url(#${uid})`}>
      <path d="M -40 2 L 40 2 Q 42 22 30 26 L -30 26 Q -42 22 -40 2 Z" fill={th.bun} />
      <rect x={-44} y={-6} width={88} height={10} rx={5} fill={th.lettuce} />
      <rect x={-40} y={-16} width={80} height={14} rx={7} fill={th.patty} />
      <path d="M -42 -16 Q -40 -50 0 -50 Q 40 -50 42 -16 Z" fill={th.bun} />
      {[-20, 0, 18].map((x, i) => <ellipse key={i} cx={x} cy={-36 + (i % 2) * 6} rx={3} ry={2} fill="#fff4d0" />)}
    </g>
  </g>
);

const Scene: React.FC<{ style: StyleName; f: number }> = ({ style, f: f0 }) => {
  const th = THEMES[style];
  const stop = style === "paper" || style === "clay";
  const f = stop ? Math.floor(f0 / 2.5) * 2.5 : f0; // покадровая «анимация куклами» 12 fps
  const s = 2.6, hip: V = [520, 1370];
  const plate: V = [650, 1288];
  const mouthL: V = [12, -140];
  // цикл: взял (0–20) → ко рту (20–40) → укус 45 → жуёт (45–75) → укус 95 → жуёт → большой палец
  const pick = ip(f, [4, 20], [0, 1]);
  const toMouth = ip(f, [20, 40], [0, 1]);
  const away = (a: number, b: number) => ip(f, [a, b], [0, 1]) - ip(f, [b + 6, b + 18], [0, 1]);
  const bite = Math.max(away(40, 45), away(88, 95));
  const bites = f >= 95 ? 2 : f >= 45 ? 1 : 0;
  const plateL = toLocal([plate[0], plate[1] - 20], hip, s);
  const holdL: V = [mouthL[0] + 46 - bite * 12, mouthL[1] + 18];
  const handR: V = f < 20 ? [lerp(30, plateL[0], pick), lerp(-40, plateL[1], pick)] : [lerp(plateL[0], holdL[0], toMouth), lerp(plateL[1], holdL[1], toMouth) + (f > 120 ? 30 : 0)];
  const chewing = (f > 46 && f < 85) || (f > 96 && f < 125);
  const chew = chewing ? Math.sin(f / 2.2) : 0;
  const thumbs = f >= 125;
  const handL: V = thumbs ? [-50, -230] : [-30, -40];
  const face = bite > 0.3 ? { eyes: "closed" as const, mouth: "o" as const } : chewing ? { eyes: "happy" as const, mouth: chew > 0 ? "smile" as const : "flat" as const } : thumbs ? { eyes: "happy" as const, mouth: "grin" as const } : { eyes: "open" as const, mouth: "smile" as const };
  const crumbs = [45, 95].flatMap((a, k) => Array.from({ length: 6 }, (_, i) => {
    const t = f - a;
    if (t < 0 || t > 30) return null;
    const x = hip[0] + (mouthL[0] - 10) * s + (rnd(i + k * 9) - 0.5) * 60, y = hip[1] + mouthL[1] * s + t * t * 0.45;
    return <circle key={`${k}-${i}`} cx={x} cy={Math.min(y, 1290)} r={5} fill={th.bun} />;
  }));
  const jit = stop ? (rnd(Math.floor(f0 / 2.5)) - 0.5) * 3 : 0;
  const lay = (id: string) => (style === "paper" || style === "clay" || style === "watercolor" ? `url(#${style}-${id})` : undefined);
  const bg = (
    <g filter={lay("bg")}>
      <rect width={1080} height={1920} fill={th.wall} />
      {style !== "noir" ? Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200} y={0} width={100} height={1500} fill={th.wall2} />) : null}
      <rect x={640} y={420} width={340} height={420} rx={style === "noir" ? 170 : 16} fill={th.sky} />
      {style !== "noir" ? (
        <>
          <rect x={804} y={420} width={12} height={420} fill={th.wall} />
          <rect x={640} y={624} width={340} height={12} fill={th.wall} />
          <rect x={100} y={560} width={300} height={18} rx={6} fill={th.table2} />
          <circle cx={170} cy={520} r={38} fill="#7fb08a" />
          <rect x={250} y={480} width={50} height={80} rx={8} fill="#e0524a" />
          <rect x={320} y={500} width={50} height={60} rx={8} fill="#5f8fb5" />
        </>
      ) : null}
      <rect x={0} y={1500} width={1080} height={420} fill={th.floor} />
    </g>
  );
  const fries = (
    <g transform="translate(400 1286)">
      <path d="M -40 -70 L 40 -70 L 32 0 L -32 0 Z" fill={style === "noir" ? BLACK : "#e0524a"} />
      {[-28, -14, 0, 14, 28].map((x, i) => <rect key={i} x={x - 5} y={-110 - (i % 2) * 14} width={10} height={60} rx={3} fill={style === "noir" ? BLACK : "#f5c84c"} transform={`rotate(${(i - 2) * 6} ${x} -70)`} />)}
      {style !== "noir" ? [0, 1, 2].map((i) => <path key={i} d={`M ${-20 + i * 20} -130 q 10 -20 0 -40 q -10 -20 0 -40`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.25 + 0.2 * Math.sin(f / 6 + i)} transform={`translate(0 ${-(f * 0.8 + i * 20) % 30})`} strokeLinecap="round" />) : null}
    </g>
  );
  return (
    <>
      {bg}
      <g filter={lay("ch")} transform={`translate(${jit} ${-jit})`}>
        <Person x={hip[0]} y={hip[1] - chew * 3} s={s} turn={0.8} pose={{ ...STAND, lean: bite * 6, head: chew * 3 }} hands={{ l: handL, r: handR }} look={th.look} t={f} face={face}>
          {f >= 20 || pick > 0.95 ? <g transform={`translate(${handR[0] - 4} ${handR[1] - 12})`}><Burger th={th} bites={bites} uid={`b-${style}`} k={0.62} /></g> : null}
          {thumbs ? <rect x={handL[0] - 5} y={handL[1] - 26} width={10} height={22} rx={5} fill={th.look.skin} /> : null}
        </Person>
      </g>
      <g filter={lay("pr")}>
        <rect x={120} y={1280} width={840} height={30} rx={10} fill={th.table} />
        <rect x={150} y={1310} width={780} height={260} fill={th.table2} />
        <ellipse cx={plate[0]} cy={plate[1]} rx={110} ry={16} fill={th.plate} />
        {f < 20 && pick < 0.95 ? <g transform={`translate(${plate[0]} ${plate[1] - 26})`}><Burger th={th} bites={0} uid={`p-${style}`} k={0.9} /></g> : null}
        {fries}
        <g transform="translate(840 1282)">
          <path d="M -34 -150 L 34 -150 L 26 0 L -26 0 Z" fill={style === "noir" ? BLACK : "#dfe8f4"} opacity={0.9} />
          <path d={`M -31 ${-130 + ip(f, [0, 150], [0, 20])} L 31 ${-130 + ip(f, [0, 150], [0, 20])} L 26 0 L -26 0 Z`} fill={th.drink} />
          <rect x={6} y={-210} width={10} height={90} rx={4} fill={style === "noir" ? BLACK : "#ffffff"} transform="rotate(12 11 -150)" />
        </g>
      </g>
      {crumbs}
    </>
  );
};

const Defs: React.FC<{ seed: number }> = ({ seed }) => (
  <defs>
    {/* бумажная аппликация: неровные края + тень слоя */}
    {["bg", "ch", "pr"].map((id) => (
      <filter key={id} id={`paper-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={id === "bg" ? 1 : seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={id === "bg" ? 6 : 9} xChannelSelector="R" yChannelSelector="G" result="d" />
        {id === "bg" ? <feMerge><feMergeNode in="d" /></feMerge> : <feDropShadow in="d" dx={8} dy={10} stdDeviation={5} floodColor="#3a2a1a" floodOpacity={0.45} />}
      </filter>
    ))}
    {/* пластилин: объём от света */}
    {["bg", "ch", "pr"].map((id) => (
      <filter key={"c" + id} id={`clay-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={id === "bg" ? 2 : 7} result="b" />
        <feDiffuseLighting in="b" surfaceScale={id === "bg" ? 1 : 12} diffuseConstant={1.15} lightingColor="#ffffff" result="diff"><feDistantLight azimuth={235} elevation={50} /></feDiffuseLighting>
        <feSpecularLighting in="b" surfaceScale={id === "bg" ? 1 : 12} specularConstant={0.9} specularExponent={20} lightingColor="#ffffff" result="spec"><feDistantLight azimuth={235} elevation={45} /></feSpecularLighting>
        <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="lit" />
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="sp" />
        <feComposite in="lit" in2="sp" operator="arithmetic" k1={0} k2={1} k3={0.45} k4={0} result="all" />
        <feComposite in="all" in2="SourceAlpha" operator="in" result="out" />
        {id === "bg" ? <feMerge><feMergeNode in="out" /></feMerge> : <feDropShadow in="out" dx={6} dy={10} stdDeviation={8} floodColor="#2a1a10" floodOpacity={0.4} />}
      </filter>
    ))}
    {/* акварель: растёкшиеся края + тёмная кромка */}
    {["bg", "ch", "pr"].map((id) => (
      <filter key={"w" + id} id={`watercolor-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves={3} seed={id === "bg" ? 4 : 7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={id === "bg" ? 10 : 14} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={1.6} result="bl" />
        <feConvolveMatrix in="bl" order={3} kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha result="e0" />
        <feColorMatrix in="e0" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 0" result="e" />
        <feComposite in="bl" in2="e" operator="arithmetic" k1={0} k2={1} k3={-0.6} k4={0} result="edged" />
        <feColorMatrix in="edged" type="saturate" values="0.85" />
      </filter>
    ))}
    {/* неон: светящиеся контуры на тёмном */}
    <filter id="neon" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feConvolveMatrix in="SourceGraphic" order={3} kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha result="e" />
      <feColorMatrix in="e" type="matrix" values="5 0 0 0 0.1  0 5 0 0 0.3  0 0 5 0 0.35  0 0 0 0 1" result="l0" />
      <feMorphology in="l0" operator="dilate" radius={1.5} result="lines" />
      <feGaussianBlur in="lines" stdDeviation={7} result="glow" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0.45 0 0 0 0.02  0 0.38 0 0 0.02  0 0 0.6 0 0.08  0 0 0 1 0" result="dim" />
      <feMerge><feMergeNode in="dim" /><feMergeNode in="glow" /><feMergeNode in="glow" /><feMergeNode in="lines" /></feMerge>
    </filter>
    {/* комикс: постеризация + толстые чёрные контуры */}
    <filter id="comic" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feComponentTransfer in="SourceGraphic" result="post">
        <feFuncR type="discrete" tableValues="0.08 0.45 0.8 1" />
        <feFuncG type="discrete" tableValues="0.08 0.45 0.8 1" />
        <feFuncB type="discrete" tableValues="0.08 0.45 0.8 1" />
      </feComponentTransfer>
      <feConvolveMatrix in="SourceGraphic" order={3} kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha result="e" />
      <feColorMatrix in="e" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 6 6 0 0" result="ink0" />
      <feMorphology in="ink0" operator="dilate" radius={2.5} result="ink" />
      <feMerge><feMergeNode in="post" /><feMergeNode in="ink" /></feMerge>
    </filter>
    <pattern id="dots" width={14} height={14} patternUnits="userSpaceOnUse">
      <circle cx={7} cy={7} r={3.2} fill="#000" />
    </pattern>
    <filter id="grainP"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
  </defs>
);

export const EatStyle: React.FC<{ style: StyleName }> = ({ style }) => {
  const f = useCurrentFrame();
  const whole = style === "neon" ? "url(#neon)" : style === "comic" ? "url(#comic)" : undefined;
  return (
    <AbsoluteFill style={{ background: style === "neon" ? "#05030f" : "#000" }}>
      <Full>
        <Defs seed={Math.floor(f / 2.5) % 5 + 2} />
        <g filter={whole}>
          <Scene style={style} f={f} />
        </g>
        {style === "comic" ? <rect width={1080} height={1920} fill="url(#dots)" opacity={0.08} /> : null}
        {style === "paper" || style === "watercolor" ? <rect width={1080} height={1920} filter="url(#grainP)" opacity={style === "paper" ? 0.12 : 0.18} style={{ mixBlendMode: "multiply" }} /> : null}
        {style === "noir" ? <rect width={1080} height={1920} fill="url(#noirV)" /> : null}
        <defs>
          <radialGradient id="noirV" cx="0.75" cy="0.33" r="1"><stop offset="0" stopColor="#ff9a40" stopOpacity="0.0" /><stop offset="1" stopColor="#3a0a0a" stopOpacity="0.45" /></radialGradient>
        </defs>
      </Full>
      <Audio src={staticFile("styles/eat.wav")} />
    </AbsoluteFill>
  );
};
