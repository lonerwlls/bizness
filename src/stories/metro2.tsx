// История «Метро», часть 2 (формат на минуту): незнакомец, три правила, голос машиниста — вагон отцеплен и едет сам.
// История «Метро», часть 1 (по формату образца пользователя «Автобус»): совет-хук → место и цифры → «Не надо» →
// три пункта (связь, свет, воздух) с записками и штампами → перекличка → тринадцатый пассажир и следы из темноты.
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { ip } from "../food/common";
import { Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, PLook, PPose, pStand } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX } from "./lift1";
import { VOICE as V } from "./metro2.voice";

// рукописный шрифт для записок
const fh = delayRender("hand-font");
Promise.all([["Caveat-latin", "U+0000-00FF,U+2000-206F,U+2190-21FF"], ["Caveat-cyrillic", "U+0400-04FF"]].map(([f, r]) =>
  new FontFace("Hand", `url(${staticFile(`towers/fonts/${f}.woff2`)}) format("woff2")`, { unicodeRange: r }).load().then((x) => document.fonts.add(x))))
  .then(() => continueRender(fh), () => continueRender(fh));

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_M2 = wd("машиниста").e + 0.4;
export const TM_M2 = timing(VOICE, AD1_M2, AD_LEN_VX, false);
const pk = (T: number, w: string, n = 1, d = 0.45) => ip(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1]);
const mix = (a: number, c: number, k: number) => a + (c - a) * k;
const HAND = "Hand", PAPER = "#efe6cc";

// ---------- пассажиры ----------
const TOPS = ["#6a3a3a", "#3a5a6a", "#5a5a3a", "#2a2a34", "#7a5a2a", "#434a5a", "#4a3a5a", "#2e4a3a", "#6a6a70", "#3a3a5a", "#5a2a3a", "#2a4a5a"];
const HAIRS = ["#2a1a10", "#5a3a20", "#1a1a1a", "#8a6a40", "#3a2a1a", "#3b2a20", "#c8c4bc", "#1a1a1a", "#6a4a2a", "#2a1a10", "#4a3020", "#1a1410"];
const SKINS = ["#e3b496", "#d8a888", "#c89070", "#e8c0a0", "#d0a080", "#e3b496", "#e0b8a0", "#b88060", "#e3b496", "#d8a888", "#e8c0a0", "#c89070"];
const PETYA_I = 5;
const look = (i: number): PLook | undefined => i === PETYA_I ? undefined : { top: TOPS[i], topSh: TOPS[i], hair: HAIRS[i], hairSh: HAIRS[i], skin: SKINS[i], skinSh: SKINS[i], pants: "#2a2c38", pantsSh: "#20222c" };
const STRANGER: PLook = { top: "#b8a684", topSh: "#8e7e60", hair: "#1a1a1a", hairSh: "#0a0a0a", skin: "#c8c4bc", skinSh: "#9a968e", pants: "#3a3a3a", pantsSh: "#2a2a2a", shoe: "#2a2a2a" };
const pSit = (f: number, i: number, o: Partial<PPose> = {}): PPose => pStand(f + i * 13, {
  hip: [0, -200 + Math.sin((f + i * 20) / 22) * 1.2], footL: [-34, 0], footR: [30, 0], knee: "up", handL: [-46, -196], handR: [44, -196],
  turn: (rnd(i * 3) - 0.5) * 0.5, tilt: (rnd(i * 5) - 0.5) * 10, ...o,
  expr: { eyes: rnd(i * 7) > 0.6 ? "squint" : "open", mouth: "flat", look: [(rnd(i) - 0.5), 0.3], ...o.expr },
});
const SEAT0 = 120, SEATW = 172, BENCH = 840; // сиденья вдоль вагона, у = 840 — пол
const seatX = (i: number) => SEAT0 + i * SEATW;

// ---------- вагон изнутри: стена с окнами, скамья, поручни, люди ----------
const Car: React.FC<{ T: number; light: number; who?: number[]; stranger?: number; dark?: number; tunnelMove?: number; children?: React.ReactNode; petya?: Partial<PPose>; all?: Partial<PPose>; xs?: (i: number) => number; sTurn?: number; sStand?: number; sMouth?: "flat" | "open" | "smile" }> = ({ T, light, who = Array.from({ length: 12 }, (_, i) => i), stranger = 0, tunnelMove = 0, children, petya, all, xs = seatX, sTurn = -0.05, sStand = 0, sMouth = "flat" }) => {
  const L = 2400;
  return <g>
    <rect x={-200} y={0} width={L + 400} height={PH} fill={`rgb(${Math.round(40 + 120 * light)},${Math.round(44 + 118 * light)},${Math.round(52 + 110 * light)})`} />
    {/* окна (снаружи — чёрный тоннель с кабелями) */}
    {Array.from({ length: 8 }, (_, k) => {
      const x = 40 + k * 300;
      return <g key={k}>
        <rect x={x} y={240} width={240} height={300} rx={18} fill="#05060a" stroke="#6a6e7a" strokeWidth={10} />
        {[0, 1, 2].map((c) => <path key={c} d={`M ${x + 6} ${300 + c * 40} L ${x + 234} ${304 + c * 40}`} stroke="#1a1c22" strokeWidth={6} strokeDasharray={tunnelMove ? "40 30" : undefined} strokeDashoffset={-T * 900 * tunnelMove} />)}
        <rect x={x + 10} y={248} width={220} height={64} rx={8} fill="#2a2e38" stroke="#6a6e7a" strokeWidth={5} />
        <polygon points={`${x + 20},258 ${x + 80},258 ${x + 40},530 ${x + 20},530`} fill="#fff" opacity={0.04 + 0.04 * light} />
      </g>;
    })}
    {/* плафоны */}
    {Array.from({ length: 6 }, (_, k) => <rect key={k} x={100 + k * 420} y={70} width={260} height={30} rx={14} fill={light > 0.5 ? "#fff8e0" : light > 0.15 ? "#c8a050" : "#3a3a40"} stroke={INK} strokeWidth={4} />)}
    {/* скамья */}
    <rect x={20} y={680} width={L - 40} height={60} rx={14} fill="#8a3a3a" stroke={INK} strokeWidth={6} />
    <rect x={20} y={560} width={L - 40} height={130} rx={18} fill="#9a4444" stroke={INK} strokeWidth={6} />
    <rect y={BENCH} width={L} height={PH - BENCH} fill={`rgb(${Math.round(36 + 60 * light)},${Math.round(36 + 56 * light)},${Math.round(40 + 52 * light)})`} />
    <rect y={BENCH - 8} width={L} height={14} fill="#5a5e6a" />
    {/* люди */}
    {who.map((i) => <Petya key={i} x={xs(i)} y={BENCH} s={0.92} look={look(i)} pose={pSit(T * 30, i, i === PETYA_I ? { ...all, ...petya, expr: { ...all?.expr, ...petya?.expr } } : all)} />)}
    {stranger > 0 ? (() => { const X = seatX(12), up = 70 * sStand; return <g opacity={stranger}>
      <Petya x={X} y={BENCH} s={0.98} look={STRANGER} pose={pSit(0, 12, { turn: sTurn, tilt: 0, hip: [0, -200 - up], knee: sStand > 0.6 ? undefined : "up", footL: [-34 + 10 * sStand, 0], footR: [30 - 6 * sStand, 0], handL: [-46 - 12 * sStand, -196 - up * 0.6], handR: [44 + 12 * sStand, -196 - up * 0.6], expr: { eyes: "open", blink: 0, mouth: sMouth, look: [sTurn, 0] } })} />
      {/* плащ: полы до колен, лацканы, пояс; немного пыли */}
      <path d={`M ${X - 50} ${BENCH - 206 - up} L ${X - 74} ${BENCH - 96 - up * 0.3} L ${X + 74} ${BENCH - 96 - up * 0.3} L ${X + 50} ${BENCH - 206 - up} Z`} fill="#b8a684" stroke={INK} strokeWidth={3} />
      <path d={`M ${X} ${BENCH - 206 - up} L ${X} ${BENCH - 98 - up * 0.3}`} stroke={INK} strokeWidth={2.5} />
      <path d={`M ${X - 40} ${BENCH - 382 - up} L ${X - 6} ${BENCH - 290 - up} M ${X + 40} ${BENCH - 382 - up} L ${X + 6} ${BENCH - 290 - up}`} stroke="#7e6e50" strokeWidth={5} strokeLinecap="round" />
      <rect x={X - 52} y={BENCH - 226 - up} width={104} height={14} fill="#8e7e60" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={X - 60 + rnd(k) * 120} cy={BENCH - 360 - up + rnd(k + 20) * 250} r={2.5} fill="#6e624e" opacity={0.6} />)}</g>; })() : null}
    {/* поручни */}
    {Array.from({ length: 6 }, (_, k) => <rect key={k} x={200 + k * 420} y={0} width={18} height={BENCH} fill="#c8ccd4" stroke={INK} strokeWidth={4} />)}
    <rect x={-200} y={130} width={L + 400} height={16} fill="#c8ccd4" stroke={INK} strokeWidth={4} />
    {children}
    <rect x={-200} y={0} width={L + 400} height={PH} fill="#000" opacity={0.6 * (1 - light)} />
  </g>;
};

// ---------- тоннель снаружи ----------
const Tunnel: React.FC<{ T: number; lit?: number; carX?: number; other?: number; circle?: number }> = ({ T, lit = 1, carX = 140, other = -1, circle = 0 }) => (
  <g>
    <rect width={W} height={PH} fill="#0a0b10" />
    <path d={`M -40 1180 L -40 420 Q 540 40 1120 420 L 1120 1180 Z`} fill="#181a22" stroke="#2a2c36" strokeWidth={10} />
    {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M -40 ${520 + k * 30} L 1120 ${520 + k * 30}`} stroke="#22242c" strokeWidth={3} />)}
    {[0, 1, 2].map((k) => <path key={"c" + k} d={`M -40 ${380 + k * 18} L 1120 ${380 + k * 18}`} stroke="#0e0f14" strokeWidth={8} />)}
    <rect y={930} width={W} height={250} fill="#1e2028" />
    {[960, 1030].map((y) => <rect key={y} y={y} width={W} height={10} fill="#5a5e6a" />)}
    <rect y={900} width={W} height={20} fill="#c8a030" opacity={0.7} />
    {/* вагон */}
    <g transform={`translate(${carX} 0)`}>
      <rect x={0} y={500} width={900} height={400} rx={30} fill="#3a5a8a" stroke={INK} strokeWidth={9} />
      <rect x={0} y={790} width={900} height={40} fill="#c8c8c8" opacity={0.7} />
      {Array.from({ length: 5 }, (_, k) => <rect key={k} x={40 + k * 172} y={560} width={130} height={150} rx={10} fill={lit > 0.5 ? "#fff1c0" : lit > 0.15 ? "#8a7040" : "#101218"} stroke={INK} strokeWidth={6} opacity={0.4 + 0.6 * lit} />)}
      {[0, 1].map((k) => <circle key={k} cx={150 + k * 600} cy={910} r={40} fill="#22232a" stroke={INK} strokeWidth={6} />)}
      {circle > 0 ? <ellipse cx={450} cy={700} rx={560} ry={330} fill="none" stroke="#fff" strokeWidth={4} opacity={circle} strokeDasharray="14 10" /> : null}
    </g>
    {other >= 0 ? <g>
      <ellipse cx={1080 - other * 1600} cy={760} rx={180 + 300 * other} ry={100 + 160 * other} fill="#fff6d0" opacity={0.25 + 0.4 * other} />
      {[-1, 1].map((k) => <circle key={k} cx={1080 - other * 1600 + k * 40} cy={790} r={14 + 20 * other} fill="#fffbe8" />)}
    </g> : null}
  </g>
);
// бумажная записка с рукописными строками
type Line = { text: string; at: number; c?: string; stamp?: { t: string; c: string; at: number }; strike?: number };
const Note: React.FC<{ T: number; title: string; lines: Line[]; x?: number; y?: number; s?: number; rot?: number; size?: number }> = ({ T, title, lines, x = 540, y = 560, s = 1, rot = -2, size = 56 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-380} y={-430} width={760} height={860} rx={8} fill="#000" opacity={0.35} transform="translate(14 18)" />
    <rect x={-380} y={-430} width={760} height={860} rx={8} fill={PAPER} stroke="#b8ac8a" strokeWidth={3} />
    {Array.from({ length: 13 }, (_, k) => <path key={k} d={`M -360 ${-330 + k * 62} L 360 ${-330 + k * 62}`} stroke="#c8d4e8" strokeWidth={2} />)}
    <path d="M -300 -430 L -300 430" stroke="#e8a0a0" strokeWidth={2} />
    <rect x={-80} y={-450} width={160} height={40} fill="#d8d0b0" opacity={0.8} transform="rotate(3)" />
    <text x={-280} y={-360} fontFamily={HAND} fontSize={size + 6} fill="#2a2a4a">{title}</text>
    {lines.map((l, i) => {
      const k = Math.min(1, Math.max(0, (T - l.at) / 0.5)); if (k <= 0) return null;
      const yy = -270 + i * 112;
      return <g key={i}>
        <clipPath id={`nl${i}${title.length}`}><rect x={-300} y={yy - 70} width={680 * k} height={110} /></clipPath>
        <text x={-280} y={yy} fontFamily={HAND} fontSize={size} fill={l.c ?? "#22305a"} clipPath={`url(#nl${i}${title.length})`}>{l.text}</text>
        {l.strike !== undefined && T > l.strike ? <path d={`M -290 ${yy - 18} L ${-280 + Math.min(1, (T - l.strike) / 0.3) * 520} ${yy - 22}`} stroke={RED} strokeWidth={5} /> : null}
        {l.stamp && T > l.stamp.at ? <g transform={`translate(250 ${yy - 16}) rotate(-8) scale(${1 + 0.6 * Math.max(0, 1 - (T - l.stamp.at) / 0.15)})`}>
          <rect x={-90} y={-30} width={180} height={56} rx={6} fill="none" stroke={l.stamp.c} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill={l.stamp.c}>{l.stamp.t}</text></g> : null}
      </g>;
    })}
  </g>
);
const Section: React.FC<{ n: string; title: string; t: number }> = ({ n, title, t }) => (
  <g>
    <rect width={W} height={PH} fill="#07080e" opacity={0.75} />
    <g transform={`translate(540 ${560 - 20 * (1 - Math.min(1, t / 0.3))})`} opacity={Math.min(1, t / 0.2)}>
      <text x={0} y={-30} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={240} fill={YEL}>{n}</text>
      <text x={0} y={90} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill="#fff">{title}</text>
    </g>
  </g>
);
const Stamp: React.FC<{ x: number; y: number; t: string; c: string; k: number; rot?: number; s?: number }> = ({ x, y, t, c, k, rot = -8, s = 1 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + 0.8 * Math.max(0, 1 - k * 4))})`} opacity={Math.min(1, k * 4)}>
    <rect x={-t.length * 26 - 30} y={-56} width={t.length * 52 + 60} height={100} rx={8} fill="#fff" opacity={0.92} stroke={c} strokeWidth={8} />
    <text x={0} y={22} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={70} fill={c}>{t}</text>
  </g>
);

// ---------- сцены ----------
const SX = seatX(12);
const Hook: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 4], [2.3, 2.0])} cx={SX - 40} cy={470} shake={t < 0.3 ? 0.2 : 0}>
    <Car T={T} light={0.08} stranger={1} />
  </Cam>
  <Stamp x={540} y={330} t="НЕ СПРАШИВАЙТЕ" c={RED} k={T - at("вопросов") + 0.1} s={0.7} />
  <g transform="translate(820 1080) rotate(-4)" opacity={ip(t, [0.2, 0.4], [0, 1])}>
    <rect x={-130} y={-40} width={260} height={80} rx={6} fill="#f1e2b8" />
    <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#2a1a10">МЕТРО</text>
    <text x={0} y={28} textAnchor="middle" fontFamily={MONO} fontSize={16} fill="#6a4a2a" letterSpacing={3}>ЧАСТЬ 2</text>
  </g>
</>);
const Asked: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 1.6], [2.4, 2.6])} cx={seatX(PETYA_I)} cy={450}>
    <Car T={T} light={0.08} stranger={1} petya={{ turn: 0.7, lean: 6, expr: { eyes: "wide", brows: 1.2, mouth: "o", look: [1, 0] } }}>
      <polygon points={`${seatX(PETYA_I) + 55},${BENCH - 300} ${SX + 260},${BENCH - 620} ${SX + 260},${BENCH + 80}`} fill="#fff8d8" opacity={0.1} />
    </Car>
  </Cam>
  <g opacity={ip(t, [0.2, 0.4], [0, 1])}><Tag x={540} y={215} title="ПЕТЯ УЖЕ СПРОСИЛ" sub="«ВЫ С КАКОЙ СТАНЦИИ?»" c={YEL} w={330} /></g>
</>);
const Turns: SShot = ({ t, T }) => {
  const tr = ip(T, [at("медленно"), at("голову") + 0.5], [-0.05, -0.85]);
  return <Cam s={mix(1.6, 3.2, pk(T, "Молча", 1, 0.5))} cx={SX} cy={mix(500, 400, pk(T, "Молча", 1, 0.5))}>
    <Car T={T} light={0.08} stranger={1} sTurn={tr} />
  </Cam>;
};
const Push: SShot = ({ t, T }) => {
  const k = ip(T, [at("Двое"), at("вагона") + 0.4], [0, 1]);
  return <Cam s={ip(t, [0, 2.6], [1.15, 1.3])} cx={SX - 240} cy={520}>
    <Car T={T} light={0.08} stranger={1} sTurn={-0.85} />
    <Petya x={mix(SX - 520, SX - 230, k)} y={BENCH + 60} s={1.0} look={look(2)} pose={pStand(T * 30, { turn: 0.6, lean: 8, handR: [120, -380], expr: { eyes: "squint", brows: -0.8, mouth: "tight" } })} />
    <Petya x={mix(SX - 640, SX - 360, k)} y={BENCH + 80} s={1.05} look={look(8)} pose={pStand(T * 30 + 7, { turn: 0.6, lean: 6, handR: [150, -360], expr: { eyes: "squint", brows: -0.8, mouth: "open" } })} />
    <g opacity={ip(T, [at("вытолкать"), at("вытолкать") + 0.3], [0, 1])}><Tag x={SX - 240} y={200} title="ВЫТОЛКАТЬ?" c={YEL} w={260} /></g>
  </Cam>;
};
const NoNeed: SShot = ({ t, T }) => <Cam s={ip(t, [0, 1.2], [1.3, 1.4])} cx={SX - 240} cy={520}>
  <Car T={T} light={0.08} stranger={1} sTurn={-0.85} />
  <rect x={-400} width={W * 4} height={PH} fill="#000" opacity={0.45} />
  <Stamp x={SX - 240} y={480} t="НЕ НАДО" c={RED} k={t + 0.05} s={0.75} />
</Cam>;
// заставка пункта, затем сцена: k — переход от заставки к сцене
const SecThen: React.FC<{ t: number; n: string; title: string; children: React.ReactNode }> = ({ t, n, title, children }) => {
  const k = ip(t, [0.75, 1.0], [0, 1]);
  return <g>{children}<g opacity={1 - k}><Section n={n} title={title} t={t} /></g></g>;
};
const Rule1: SShot = ({ t, T }) => <SecThen t={t} n="1" title="НЕ СМОТРЕТЬ">
  <Cam s={ip(t, [0.8, 2.4], [0.8, 0.95])} cx={seatX(6)} cy={560}>
    <Car T={T} light={0.08} stranger={1} sTurn={-0.85} all={{ tilt: 14, expr: { eyes: "squint", look: [0, 1], mouth: "tight" } }} />
  </Cam>
  <g opacity={ip(t, [1.0, 1.3], [0, 1])}><Tag x={540} y={215} title="НЕ СМОТРЕТЬ В ГЛАЗА" sub="ГЛАЗА В ПОЛ" c={YEL} w={320} /></g>
</SecThen>;
const Rule2: SShot = ({ t, T }) => {
  const k = ip(T, [at("пересесть"), at("машинисту") + 0.5], [0, 1]);
  const xs = (i: number) => mix(seatX(i), 110 + i * 120, k);
  return <SecThen t={t} n="2" title="ВПЕРЁД">
    <Cam s={0.56} cx={1150} cy={600}>
      <Car T={T} light={0.08} stranger={1} sTurn={-0.85} xs={xs} all={{ expr: { eyes: "wide", look: [-1, 0] } }}>
        <rect x={-200} y={0} width={210} height={BENCH} fill="#3a3c44" stroke={INK} strokeWidth={8} />
        <text x={-95} y={300} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#c8ccd4" transform="rotate(-90 -95 300)">КАБИНА</text>
      </Car>
    </Cam>
    <g opacity={ip(t, [1.0, 1.3], [0, 1])}><Tag x={540} y={215} title="ВСЕ ВПЕРЁД" sub="БЛИЖЕ К МАШИНИСТУ" c={YEL} w={320} /></g>
  </SecThen>;
};
const Speaker: React.FC<{ T: number; push: number; waves: boolean }> = ({ T, push, waves }) => <g>
  <rect width={W} height={PH} fill="#4a4e5a" />
  <rect x={240} y={180} width={600} height={760} rx={30} fill="#c8ccd4" stroke={INK} strokeWidth={8} />
  {Array.from({ length: 35 }, (_, k) => <circle key={k} cx={360 + (k % 7) * 60} cy={290 + Math.floor(k / 7) * 50} r={12} fill="#3a3c44" />)}
  <text x={540} y={555} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#22242c">СВЯЗЬ С МАШИНИСТОМ</text>
  <circle cx={540} cy={690} r={110} fill="#e04040" stroke={INK} strokeWidth={8} /><circle cx={540} cy={690} r={70 - 10 * push} fill="#f05a5a" />
  {waves ? [1, 2, 3].map((r) => <g key={r} opacity={0.3 + 0.6 * Math.abs(Math.sin(T * 9 + r))}>
    <path d={`M ${300 - r * 50} ${300 - r * 20} Q ${250 - r * 60} 400 ${300 - r * 50} ${500 + r * 20}`} stroke={YEL} strokeWidth={7} fill="none" />
    <path d={`M ${780 + r * 50} ${300 - r * 20} Q ${830 + r * 60} 400 ${780 + r * 50} ${500 + r * 20}`} stroke={YEL} strokeWidth={7} fill="none" /></g>) : null}
  <g transform={`translate(560 ${830 - 120 * push})`}><rect x={-50} y={0} width={100} height={420} rx={40} fill="#e3b496" stroke={INK} strokeWidth={6} /><rect x={-60} y={200} width={120} height={300} fill="#434a5a" stroke={INK} strokeWidth={6} /></g>
</g>;
const Rule3: SShot = ({ t, T }) => <SecThen t={t} n="3" title="СВЯЗЬ">
  <Cam s={ip(t, [0.8, 2.4], [1.0, 1.06])} cx={540} cy={560}><Speaker T={T} push={0} waves={false} /></Cam>
</SecThen>;
const Press: SShot = ({ t, T }) => {
  const push = ip(T, [at("жмёт") - 0.1, at("жмёт") + 0.2, at("Треск")], [0, 1, 0.6]);
  return <Cam s={mix(1.0, 1.4, pk(T, "Голос"))} cx={540} cy={mix(560, 420, pk(T, "Голос"))} shake={T > at("Треск") && T < at("Треск") + 0.3 ? 0.2 : 0}>
    <Speaker T={T} push={push} waves={T > at("Треск") - 0.05} />
  </Cam>;
};
const Reply: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 4.6], [1.3, 1.5])} cx={540} cy={420}><Speaker T={T} push={0.6} waves /></Cam>
  <rect width={W} height={PH} fill="#000" opacity={0.35} />
  <Note T={T} title="Машинист:" s={0.82} y={620} rot={1.5} lines={[
    { text: "«Последний вагон", at: at("Последний") }, { text: "отцепили на станции»", at: at("отцепили") },
    { text: "«Он пустой»", at: at("пустой") - 0.1, c: RED },
    { text: "«Кто вам отвечал?»", at: at("Кто") - 0.1, c: RED, stamp: { t: "???", c: RED, at: at("отвечал") + 0.2 } }]} />
</>);
const Window: SShot = ({ t, T }) => {
  const k = pk(T, "окно", 1, 0.6);
  return <Cam s={mix(1.9, 3.2, k)} cx={mix(seatX(PETYA_I), 520, k)} cy={mix(470, 400, k)}>
    <Car T={T} light={0.08} stranger={1} sTurn={-0.85} petya={{ turn: 0.2, tilt: -10, expr: { eyes: "wide", brows: 1, mouth: "o", look: [0.3, -1] } }} />
  </Cam>;
};
const Alone: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 3], [0.95, 0.85])} cx={700} cy={700}>
    <Tunnel T={T} lit={0.12} carX={500} />
    {/* сцепка висит в пустоту: впереди нет поезда */}
    <path d="M 500 830 L 450 850 L 430 880" stroke="#5a5e6a" strokeWidth={14} fill="none" strokeLinecap="round" />
    <rect x={-300} y={420} width={790} height={520} fill="#000" opacity={0.75} />
  </Cam>
  <g opacity={ip(T, [at("Поезда"), at("Поезда") + 0.3], [0, 1])}><Tag x={540} y={215} title="ПОЕЗДА НЕТ" sub="ТОЛЬКО ИХ ВАГОН" c={RED} w={300} /></g>
</>);
const Stands: SShot = ({ t, T }) => {
  const st = ip(T, [at("встаёт") - 0.2, at("встаёт") + 0.7], [0, 1]);
  return <Cam s={ip(t, [0, 1.6], [1.5, 1.7])} cx={SX - 100} cy={mix(500, 440, st)}>
    <Car T={T} light={0.08} stranger={1} sTurn={-0.85} sStand={st} all={{ expr: { eyes: "wide", look: [1, -0.2], mouth: "o" } }} />
  </Cam>;
};
const Speaks: SShot = ({ t, T }) => {
  const talk = T > at("Тринадцать") && T < at("ехать") + 0.3 ? (Math.floor(T * 7) % 2 ? "open" : "flat") : "smile";
  return <><Cam s={mix(2.6, 3.4, ip(t, [0, 2], [0, 1]))} cx={SX} cy={mix(400, 380, ip(t, [0, 2], [0, 1]))}>
    <Car T={T} light={0.08} stranger={1} sTurn={-0.2} sStand={1} sMouth={talk as "open"} />
  </Cam>
    <g opacity={ip(T, [at("ехать"), at("ехать") + 0.3], [0, 1])}><Tag x={540} y={215} title="«ТЕПЕРЬ МОЖНО ЕХАТЬ»" sub="ТРИНАДЦАТЬ" c={RED} w={340} /></g></>;
};
const Flash: SShot = ({ t, T }) => {
  const on = T > at("вспыхивает") - 0.1, go = T > at("трогается") - 0.1;
  return <Cam s={ip(t, [0, 2.4], [0.75, 0.85])} cx={seatX(6)} cy={560} shake={go ? 0.35 : on ? 0.15 : 0}>
    <Car T={T} light={on ? 1 : 0.08} stranger={1} sTurn={-0.2} sStand={1} sMouth="smile" tunnelMove={go ? ip(T, [at("трогается"), at("трогается") + 1], [0.2, 1]) : 0} all={{ expr: { eyes: "wide", brows: 1.3, mouth: "o", look: [0, -0.3] } }} />
    {on && T < at("вспыхивает") + 0.2 ? <rect x={-400} width={W * 4} height={PH} fill="#fff" opacity={0.6} /> : null}
  </Cam>;
};
const Self: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 2], [0.9, 1.0])} cx={540} cy={700}>
    <Tunnel T={T} lit={1} carX={ip(t, [0, 2.4], [140, -900])} />
    <path d="M 1080 830 L 1080 830" />
  </Cam>
  <g opacity={ip(T, [at("Сам"), at("Сам") + 0.2], [0, 1])}><Tag x={540} y={215} title="САМ" sub="БЕЗ ПОЕЗДА" c={RED} w={260} /></g>
</>);
const Question: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2.6], [2.4, 2.7])} cx={SX} cy={400}>
  <Car T={T} light={1} stranger={1} sTurn={0} sStand={1} sMouth="smile" tunnelMove={1} />
  <rect x={-W} width={W * 4} height={PH} fill="#000" opacity={0.3} />
</Cam>;
const EndCard: SShot = ({ t }) => <g>
  <defs><radialGradient id="egm2"><stop offset="0" stopColor="#1a2240" /><stop offset="1" stopColor="#04050a" /></radialGradient></defs>
  <rect width={W} height={PH} fill="url(#egm2)" />
  <g opacity={ip(t, [0, 0.4], [0, 1])}>
    <text x={540} y={520} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={150} fill="#fff">МЕТРО</text>
    <text x={540} y={600} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={40} fill="#8fb4ff" letterSpacing={4}>ЧАСТЬ 3 — СКОРО</text>
  </g>
  <g opacity={ip(t, [0.6, 1.0], [0, 1])}>
    <text x={540} y={720} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={42} fill="#fff">А вы бы остались в вагоне?</text>
    <rect x={380} y={770} width={320} height={80} rx={40} fill="#e03030" /><text x={540} y={822} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#fff">ПОДПИСАТЬСЯ</text>
  </g>
</g>;

const CUTS: [SShot, number][] = [
  [Hook, 0], [Asked, b("Петя", 1)], [Turns, b("Человек", 1)], [Push, b("Двое")], [NoNeed, b("Не", 1)],
  [Rule1, b("Первое")], [Rule2, b("Второе")], [Rule3, b("Третье")], [Press, b("Петя", 2)], [Reply, b("Какой")],
  [Window, b("Петя", 3)], [Alone, b("Впереди")], [Stands, b("Человек", 2)], [Speaks, b("Тринадцать")], [Flash, b("Свет")],
  [Self, b("Сам")], [Question, b("Что")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "01:31"], [b("Первое"), "01:32"], [b("Петя", 2), "01:34"], [b("Свет"), "01:35"]];
const SECS: [number, string][] = [[0, ""], [b("Первое"), "1. НЕ СМОТРЕТЬ"], [b("Второе"), "2. ВПЕРЁД"], [b("Третье"), "3. СВЯЗЬ"], [b("Петя", 3), ""]];
const Hud: React.FC<{ T: number }> = ({ T }) => {
  if (T > VOICE.dur + 0.15) return null;
  const clock = [...CLOCK].reverse().find(([a]) => T >= a)![1], sec = [...SECS].reverse().find(([a]) => T >= a)![1];
  const box = (txt: string, c: string, bg: string) => <div style={{ background: bg, color: c, fontFamily: "FsMont", fontWeight: 800, fontSize: 26, padding: "6px 14px", borderRadius: 6, letterSpacing: 1 }}>{txt}</div>;
  return <div style={{ position: "absolute", top: 26, left: 24, right: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {box(clock, "#fff", "rgba(0,0,0,0.55)")}{box("ПЕРЕГОН · НОЧЬ", "#fff", "#2a5ab8")}{box(T > at("Сам") - 0.2 ? "ЕДЕМ?!" : "НЕТ СЕТИ", "#ff6a6a", "rgba(0,0,0,0.55)")}
    </div>
    {sec ? <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>{box(sec, INK, "#f1e2b8")}</div> : null}
  </div>;
};
const RED_RE = /^(не|вопросов|молча|надо|глаза|треск|отцепили|пустой|кто|отвечал|темнота|поезда|нет|тринадцать|ехать|сам)/i;
const YEL_RE = /^(тёмном|петя|плаще|голову|вытолкать|вперёд|машинисту|кнопку|связи|машиниста|вагон|окно|встаёт|вспыхивает|трогается)/i;
export const Metro2: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_M2} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/metro2" glide hud={(T: number) => <Hud T={T} />} />;
