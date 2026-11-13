// История «Метро», часть 1 — КОРОТКАЯ версия на минуту (по просьбе пользователя).
// История «Метро», часть 1 (по формату образца пользователя «Автобус»): совет-хук → место и цифры → «Не надо» →
// три пункта (связь, свет, воздух) с записками и штампами → перекличка → тринадцатый пассажир и следы из темноты.
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, PLook, PPose, pStand } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX } from "./lift1";
import { PhoneBody } from "./phone1";
import { VOICE as V } from "./metro1s.voice";

// рукописный шрифт для записок
const fh = delayRender("hand-font");
Promise.all([["Caveat-latin", "U+0000-00FF,U+2000-206F,U+2190-21FF"], ["Caveat-cyrillic", "U+0400-04FF"]].map(([f, r]) =>
  new FontFace("Hand", `url(${staticFile(`towers/fonts/${f}.woff2`)}) format("woff2")`, { unicodeRange: r }).load().then((x) => document.fonts.add(x))))
  .then(() => continueRender(fh), () => continueRender(fh));

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_M1S = wd("очереди").e + 0.4;
export const TM_M1S = timing(VOICE, AD1_M1S, AD_LEN_VX, false);
const pk = (T: number, w: string, n = 1, d = 0.45) => ip(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1]);
const mix = (a: number, c: number, k: number) => a + (c - a) * k;
const GRN = "#3ac06a", HAND = "Hand", PAPER = "#efe6cc";

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
const Car: React.FC<{ T: number; light: number; who?: number[]; stranger?: number; dark?: number; tunnelMove?: number; children?: React.ReactNode; petya?: Partial<PPose> }> = ({ T, light, who = Array.from({ length: 12 }, (_, i) => i), stranger = 0, tunnelMove = 0, children, petya }) => {
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
    {who.map((i) => <Petya key={i} x={seatX(i)} y={BENCH} s={0.92} look={look(i)} pose={pSit(T * 30, i, i === PETYA_I ? petya : undefined)} />)}
    {stranger > 0 ? <g opacity={stranger}><Petya x={seatX(12)} y={BENCH} s={0.98} look={STRANGER} pose={pSit(0, 12, { turn: -0.05, tilt: 0, expr: { eyes: "open", blink: 0, mouth: "flat", look: [0, 0] } })} />
      {/* плащ: полы до колен, лацканы, пояс; немного пыли */}
      <path d={`M ${seatX(12) - 50} ${BENCH - 206} L ${seatX(12) - 74} ${BENCH - 96} L ${seatX(12) + 74} ${BENCH - 96} L ${seatX(12) + 50} ${BENCH - 206} Z`} fill="#b8a684" stroke={INK} strokeWidth={3} />
      <path d={`M ${seatX(12)} ${BENCH - 206} L ${seatX(12)} ${BENCH - 98}`} stroke={INK} strokeWidth={2.5} />
      <path d={`M ${seatX(12) - 40} ${BENCH - 382} L ${seatX(12) - 6} ${BENCH - 290} M ${seatX(12) + 40} ${BENCH - 382} L ${seatX(12) + 6} ${BENCH - 290}`} stroke="#7e6e50" strokeWidth={5} strokeLinecap="round" />
      <rect x={seatX(12) - 52} y={BENCH - 226} width={104} height={14} fill="#8e7e60" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={seatX(12) - 60 + rnd(k) * 120} cy={BENCH - 360 + rnd(k + 20) * 250} r={2.5} fill="#6e624e" opacity={0.6} />)}</g> : null}
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
// пол тоннеля крупно: рельсы и контактный рельс
const Rails: React.FC<{ T: number; spark?: number }> = ({ T, spark = 0 }) => (
  <g>
    <rect width={W} height={PH} fill="#121318" />
    <polygon points="0,1180 1080,1180 700,380 380,380" fill="#24262e" />
    {Array.from({ length: 12 }, (_, k) => { const y = 400 + Math.pow(k / 11, 1.6) * 780, w = 300 + (y - 380) * 1.1; return <rect key={k} x={540 - w / 2} y={y} width={w} height={8 + (y - 380) / 30} fill="#3a2e24" />; })}
    {[-1, 1].map((k) => <polygon key={k} points={`${540 + k * 120},380 ${540 + k * 140},380 ${540 + k * 460},1180 ${540 + k * 380},1180`} fill="#8a8e9a" stroke={INK} strokeWidth={3} />)}
    {/* контактный рельс с жёлтым коробом */}
    <polygon points="720,380 760,380 1080,1000 1080,1100" fill="#d8b030" stroke={INK} strokeWidth={4} />
    <g transform="translate(900 700) rotate(-28)"><rect x={-100} y={-34} width={200} height={60} rx={8} fill="#111" stroke="#d8b030" strokeWidth={4} /><text x={0} y={10} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#ffd040">825 В</text></g>
    {spark > 0 ? <g opacity={spark}>{Array.from({ length: 14 }, (_, k) => { const a = rnd(k + Math.floor(T * 20)) * Math.PI * 2, r = 40 + rnd(k * 3 + Math.floor(T * 20)) * 140; return <path key={k} d={`M 860 760 L ${860 + Math.cos(a) * r} ${760 + Math.sin(a) * r}`} stroke="#bfe6ff" strokeWidth={5} />; })}<circle cx={860} cy={760} r={60} fill="#e8f6ff" opacity={0.8} /></g> : null}
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
const Hook: SShot = ({ t, T }) => <Cam s={ip(t, [0, 5], [1.25, 1.05])} cx={560} cy={700}>
  <Tunnel T={T} lit={T < at("погас") ? 1 : ip(T, [at("погас"), at("погас") + 0.3], [1, 0.1])} />
  <g opacity={ip(T, [at("выходите"), at("выходите") + 0.2], [0, 1])}><Stamp x={540} y={320} t="НЕ ВЫХОДИТЕ" c={RED} k={T - at("выходите")} s={0.8} /></g>
</Cam>;
const Mistake: SShot = ({ t, T }) => <Cam s={ip(t, [0, 3.4], [1.3, 1.45])} cx={1060} cy={560}>
  <Car T={T} light={0.12} />
  <Stamp x={1060} y={380} t="1 ОШИБКА" c={RED} k={T - at("ошибку") + 0.1} s={0.8} rot={-6} />
</Cam>;
const MapShot: SShot = ({ t, T }) => {
  const d = ip(T, [at("Последний") + 0.3, at("Час") + 0.3], [0, 1]);
  return <Cam s={ip(t, [0, 4.4], [1.0, 1.1])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0e1018" />
    <g transform="translate(540 580) rotate(-2)">
      <rect x={-420} y={-440} width={840} height={880} rx={10} fill={PAPER} />
      <text x={-370} y={-360} fontFamily={HAND} fontSize={64} fill="#2a2a4a">Схема линии</text>
      <path d="M -300 300 Q -200 0 0 -40 Q 200 -80 300 -320" stroke="#c84040" strokeWidth={16} fill="none" />
      {[[-300, 300, "Северная"], [300, -320, "Заречная"]].map(([x, y, n]) => <g key={String(n)}><circle cx={x as number} cy={y as number} r={24} fill="#fff" stroke="#c84040" strokeWidth={8} /><text x={(x as number) + (x as number > 0 ? -40 : 40)} y={(y as number) + 70} textAnchor={x as number > 0 ? "end" : "start"} fontFamily={HAND} fontSize={56} fill="#22305a">ст. {n}</text></g>)}
      <circle cx={-40} cy={-30} r={18 + 4 * Math.sin(T * 8)} fill={RED} opacity={d} />
      <g opacity={d}><text x={10} y={40} fontFamily={HAND} fontSize={50} fill={RED}>поезд встал здесь</text></g>
      <g opacity={ip(T, [at("Час"), at("Час") + 0.3], [0, 1])}><text x={-60} y={230} fontFamily={HAND} fontSize={56} fill="#22305a">последний поезд · 01:00</text></g>
    </g>
  </Cam>;
};
const People: SShot = ({ t, T }) => {
  const k = pk(T, "Петя", 1, 0.6), px = seatX(PETYA_I);
  return <><Cam s={mix(ip(t, [0, 3], [0.62, 0.66]), 1.9, k)} cx={mix(ip(t, [0, 3], [900, 1100]), px, k)} cy={mix(620, 470, k)}>
    <Car T={T} light={1} tunnelMove={1} />
    {k > 0.5 ? <Brackets x={px - 70} y={300} w={140} h={200} c={YEL} /> : null}
  </Cam><g opacity={ip(T, [at("двенадцать"), at("двенадцать") + 0.3], [0, 1]) * (1 - k)}><Tag x={540} y={215} title="12 ЧЕЛОВЕК" sub="ПОСЛЕДНИЙ ВАГОН" c={YEL} w={300} /></g></>;
};
const Stop: SShot = ({ t, T }) => {
  const jerk = T > at("встаёт") - 0.2 && T < at("встаёт") + 0.3, off = ip(T, [at("гаснет") - 0.05, at("гаснет") + 0.15], [1, 0.16]);
  const fl = T > at("гаснет") - 0.3 && T < at("гаснет") ? (Math.floor(T * 20) % 2) * 0.6 : 0;
  return <Cam s={ip(t, [0, 3], [0.9, 1.0])} cx={seatX(PETYA_I)} cy={600} shake={jerk ? 0.6 : 0}>
    <Car T={T} light={Math.max(0.16, off - fl)} tunnelMove={T < at("встаёт") ? 1 : 0} petya={{ lean: jerk ? 10 : 0, expr: { eyes: T > at("гаснет") ? "wide" : "open", mouth: T > at("гаснет") ? "o" : "flat", look: [0, 0] } }} />
  </Cam>;
};
const NoSignal: SShot = ({ t, T }) => {
  const mm = Math.min(15, Math.floor(ip(t, [0.3, 1.4], [0, 15]))), tm = `${String(mm).padStart(2, "0")}:00`;
  return <Cam s={ip(t, [0, 3], [1.05, 1.12])} cx={540} cy={580}><rect width={W} height={PH} fill="#05060d" />
    <PhoneBody><g><rect x={-222} y={-442} width={444} height={884} fill="#101426" />
      <text x={0} y={-300} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={44} fill={RED}>НЕТ СЕТИ</text>
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-60 + k * 34} y={-220 - k * 22} width={22} height={30 + k * 22} rx={4} fill="#3a3f55" />)}<path d="M -80 -270 L 80 -150" stroke={RED} strokeWidth={8} />
      <text x={0} y={60} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#8a90a8">стоим уже</text>
      <text x={0} y={170} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill="#fff">{tm}</text></g></PhoneBody>
  </Cam>;
};
const Urge: SShot = ({ t, T }) => {
  const pry = Math.sin(T * 9) * 6;
  return <Cam s={mix(1.0, 1.5, pk(T, "пешком"))} cx={mix(560, 520, pk(T, "пешком"))} cy={mix(600, 560, pk(T, "пешком"))}>
    <rect width={W} height={PH} fill="#2a2c34" /><rect y={BENCH} width={W} height={PH - BENCH} fill="#1c1d24" />
    <rect x={340} y={140} width={360} height={700} fill="#7a7e8a" stroke={INK} strokeWidth={8} /><path d="M 520 140 L 520 840" stroke={INK} strokeWidth={8} />
    <rect x={370} y={220} width={120} height={300} rx={10} fill="#05060a" /><rect x={550} y={220} width={120} height={300} rx={10} fill="#05060a" />
    <Petya x={360} y={BENCH + 40} s={1.05} look={look(2)} pose={pStand(T * 30, { turn: 0.5, lean: 8, handL: [130 + pry, -360], handR: [170 + pry, -330], expr: { eyes: "squint", brows: -0.8, mouth: "tight" } })} />
    <Petya x={700} y={BENCH + 40} s={1.05} look={look(8)} pose={pStand(T * 30 + 9, { turn: -0.5, lean: -8, handL: [-150 - pry, -360], handR: [-120 - pry, -320], expr: { eyes: "squint", brows: -0.8, mouth: "open" } })} />
    <Petya x={930} y={BENCH + 120} s={1.2} pose={pStand(T * 30, { turn: -0.6, expr: { eyes: "wide", brows: 1, mouth: "tight", look: [-1, 0] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.45} />
    <g opacity={ip(T, [at("хотят"), at("хотят") + 0.3], [0, 1])}><Tag x={540} y={130} title="ПЕРВЫЙ ПОРЫВ" sub="ИДТИ ПЕШКОМ" c={YEL} w={300} /></g>
  </Cam>;
};
const NoNeed: SShot = ({ t, T }) => <Cam s={ip(t, [0, 1.6], [1.5, 1.6])} cx={520} cy={540}>
  <rect width={W} height={PH} fill="#2a2c34" />
  <rect x={340} y={140} width={360} height={700} fill="#7a7e8a" stroke={INK} strokeWidth={8} /><path d="M 520 140 L 520 840" stroke={INK} strokeWidth={8} />
  <rect width={W} height={PH} fill="#000" opacity={0.5} />
  <Stamp x={520} y={500} t="НЕ НАДО" c={RED} k={t + 0.05} s={0.9} />
</Cam>;
const Rail: SShot = ({ t, T }) => <Cam s={mix(ip(t, [0, 3], [1, 1.08]), 1.6, pk(T, "восемьсот", 1, 0.35))} cx={mix(540, 860, pk(T, "восемьсот", 1, 0.35))} cy={mix(640, 720, pk(T, "восемьсот", 1, 0.35))} shake={T > at("вольт") && T < at("вольт") + 0.4 ? 0.4 : 0}>
  <Rails T={T} spark={ip(T, [at("вольт") - 0.05, at("вольт") + 0.1, at("вольт") + 0.8], [0, 1, 0])} />
</Cam>;
const Sec1: SShot = ({ t, T }) => <g><Car T={T} light={0.16} /><Section n="1" title="СВЯЗЬ" t={t} /></g>;
const Intercom: SShot = ({ t, T }) => {
  const push = ip(T, [at("машинистом") - 0.1, at("машинистом") + 0.2, at("Ждите")], [0, 1, 0.6]);
  const waves = T > at("Ждите") - 0.1;
  return <><Cam s={mix(ip(t, [0, 3], [1.0, 1.08]), 1.5, pk(T, "Ждите"))} cx={540} cy={mix(560, 470, pk(T, "Ждите"))}>
    <rect width={W} height={PH} fill="#4a4e5a" />
    <rect x={240} y={180} width={600} height={760} rx={30} fill="#c8ccd4" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 35 }, (_, k) => <circle key={k} cx={360 + (k % 7) * 60} cy={290 + Math.floor(k / 7) * 50} r={12} fill="#3a3c44" />)}
    <circle cx={540} cy={690} r={110} fill="#e04040" stroke={INK} strokeWidth={8} /><circle cx={540} cy={690} r={70 - 10 * push} fill="#f05a5a" />
    <text x={540} y={555} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#22242c">СВЯЗЬ С МАШИНИСТОМ</text>
    {waves ? [1, 2, 3].map((r) => <path key={r} d={`M ${300 - r * 50} ${300 - r * 20} Q ${250 - r * 60} 400 ${300 - r * 50} ${500 + r * 20}`} stroke={YEL} strokeWidth={7} fill="none" opacity={0.3 + 0.6 * Math.abs(Math.sin(T * 9 + r))} />) : null}
    {waves ? [1, 2, 3].map((r) => <path key={"r" + r} d={`M ${780 + r * 50} ${300 - r * 20} Q ${830 + r * 60} 400 ${780 + r * 50} ${500 + r * 20}`} stroke={YEL} strokeWidth={7} fill="none" opacity={0.3 + 0.6 * Math.abs(Math.sin(T * 9 + r))} />) : null}
    <g transform={`translate(${560} ${830 - 120 * push})`}><rect x={-50} y={0} width={100} height={420} rx={40} fill="#e3b496" stroke={INK} strokeWidth={6} /><rect x={-60} y={200} width={120} height={300} fill="#434a5a" stroke={INK} strokeWidth={6} /></g>
  </Cam><g opacity={ip(T, [at("Ждите"), at("Ждите") + 0.2], [0, 1])}><Tag x={540} y={215} title="«ЖДИТЕ. ИЗ ВАГОНА НИ ШАГУ»" sub="МАШИНИСТ" c={GRN} w={360} /></g></>;
};
const Sec2: SShot = ({ t, T }) => <g><Car T={T} light={0.16} /><Section n="2" title="СВЕТ" t={t} /></g>;
const Torch: SShot = ({ t, T }) => {
  const on = T > at("фонарик") - 0.1, px = seatX(PETYA_I);
  return <Cam s={mix(ip(t, [0, 4], [0.85, 0.95]), 1.2, pk(T, "очереди"))} cx={px} cy={560}>
    <Car T={T} light={0.1} petya={{ handR: [60, -330], turn: 0.1, expr: { eyes: "open", brows: 0.4, mouth: "flat", look: [0.3, 0] } }}>
      {on ? <g><polygon points={`${px + 55},${BENCH - 330} ${px + 500},${BENCH - 700} ${px + 500},${BENCH + 100}`} fill="#fff8d8" opacity={0.18} /><circle cx={px + 55} cy={BENCH - 330 * 0.92} r={10} fill="#fffbe8" /></g> : null}
    </Car>
    <Note T={T} title="2. Свет" x={px - 20} y={500} s={0.55} rot={3} lines={[{ text: "телефоны садятся", at: at("фонарик") - 0.3, stamp: { t: "МАЛО", c: RED, at: at("фонарик") } }, { text: "1 фонарик, по очереди", at: at("включает"), stamp: { t: "НОРМА", c: GRN, at: at("очереди") } }]} />
  </Cam>;
};
const Sec3: SShot = ({ t, T }) => <g><Car T={T} light={0.12} /><Section n="3" title="ПЕРЕКЛИЧКА" t={t} /></g>;
const Rules: SShot = ({ t, T }) => <Cam s={ip(t, [0, 6], [1.0, 1.06])} cx={540} cy={560}>
  <Car T={T} light={0.12} />
  <Note T={T} title="Главное:" rot={1.5} lines={[{ text: "каждые 10 минут —", at: at("каждые") }, { text: "ПЕРЕКЛИЧКА", at: at("перекличка", 1), c: RED }, { text: "кто молчит — будить!", at: at("перекличка", 1) + 0.6 }]} />
</Cam>;
const Clock130: SShot = ({ t, T }) => <g>
  <Car T={T} light={0.1} />
  <rect width={W} height={PH} fill="#000" opacity={0.6} />
  <text x={540} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={200} fill="#fff" opacity={ip(t, [0, 0.2], [0, 1])}>01:30</text>
  <text x={540} y={640} textAnchor="middle" fontFamily={HAND} fontSize={70} fill={YEL} opacity={ip(t, [0.4, 0.7], [0, 1])}>перекличка</text>
</g>;
const COUNT = [["Десять", 9], ["Одиннадцать", 10], ["Двенадцать", 11]] as const;
const Count: SShot = ({ t, T }) => {
  const step = COUNT.reduce((a, [w], i) => (T >= at(w as string) - 0.1 ? i : a), -1);
  const target = step < 0 ? seatX(PETYA_I) : seatX(COUNT[step][1]);
  const cxv = ip(T, [at("Петя", 2), at("Десять") - 0.3, at("Десять"), at("Одиннадцать"), at("Двенадцать")], [seatX(PETYA_I), seatX(8), seatX(9), seatX(10), seatX(11)]);
  void target;
  return <Cam s={1.25} cx={cxv} cy={520}>
    <Car T={T} light={0.12} petya={{ turn: 0.6, expr: { eyes: "open", mouth: T > at("Петя", 2) ? (Math.floor(T * 7) % 2 ? "open" : "flat") : "flat", look: [1, 0] } }}>
      <polygon points={`${seatX(PETYA_I) + 55},${BENCH - 300} ${cxv + 260},${BENCH - 620} ${cxv + 260},${BENCH + 80} `} fill="#fff8d8" opacity={0.12} />
      {COUNT.map(([w, i], k) => k <= step ? <g key={k} transform={`translate(${seatX(i)} ${BENCH - 560})`}><circle r={44} fill={YEL} stroke={INK} strokeWidth={5} /><text y={20} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={52} fill={INK}>{i + 1}</text></g> : null)}
    </Car>
  </Cam>;
};
const Thirteen: SShot = ({ t, T }) => <Cam s={ip(t, [0, 1.6], [1.05, 1.15])} cx={540} cy={560} shake={t < 0.3 ? 0.3 : 0}>
  <Car T={T} light={0.08} />
  <Note T={T} title="Перекличка 01:30" lines={[{ text: "10  11  12", at: -1 }, { text: "всего: 12", at: -1, strike: at("Тринадцать") }, { text: "13 ???", at: at("Тринадцать"), c: RED }]} />
</Cam>;
const LastSeat: SShot = ({ t, T }) => {
  const pan = ip(T, [at("На"), at("сиденье") + 0.3], [seatX(11), seatX(12)]);
  return <Cam s={mix(1.25, 1.7, pk(T, "плаще"))} cx={pan} cy={mix(520, 470, pk(T, "плаще"))}>
    <Car T={T} light={0.08} stranger={1}>
      <polygon points={`${seatX(PETYA_I) + 55},${BENCH - 300} ${seatX(12) + 260},${BENCH - 620} ${seatX(12) + 260},${BENCH + 80}`} fill="#fff8d8" opacity={0.12} />
    </Car>
    <g opacity={ip(T, [at("сиденье"), at("сиденье") + 0.3], [0, 1])}><Brackets x={seatX(12) - 90} y={BENCH - 560} w={180} h={480} c={RED} /></g>
  </Cam>;
};
const Coat: SShot = ({ t, T }) => <><Cam s={mix(2.2, 2.6, ip(t, [0, 3.6], [0, 1]))} cx={seatX(12)} cy={mix(500, 600, ip(t, [0, 1.4], [0, 1]))}>
  <Car T={T} light={0.1} stranger={1} />
</Cam>
  <Tag x={540} y={215} title="ЛЕТНИЙ ПЛАЩ" sub="ВЕСЬ В ПЫЛИ" c={RED} w={300} />
</>;
const Steps: SShot = ({ t, T }) => {
  const back = ip(T, [at("Обратных") - 0.1, at("нет", 2) + 0.4], [0, 1]);
  return <Cam s={mix(ip(t, [0, 4], [1.0, 1.1]), 1.5, back)} cx={540} cy={mix(600, 760, back)}>
    <rect width={W} height={PH} fill="#05060a" />
    <defs><radialGradient id="beam"><stop offset="0" stopColor="#fff8d8" stopOpacity={0.55} /><stop offset="1" stopColor="#fff8d8" stopOpacity={0} /></radialGradient></defs>
    <polygon points="0,1180 1080,1180 820,520 260,520" fill="#2a2a2e" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={260 + rnd(i) * 560 + (rnd(i + 3) - 0.5) * (1180 - 520 - rnd(i + 9) * 600)} cy={520 + rnd(i + 9) * 660} r={2 + rnd(i + 4) * 3} fill="#5a5a5e" />)}
    {Array.from({ length: 9 }, (_, k) => { const y = 560 + k * 70, sc = 0.4 + k * 0.09, x = 380 + k * 34 + (k % 2 ? 26 : -26) * sc; const vis = ip(T, [at("следы") - 0.4 + k * 0.05, at("следы") + k * 0.05], [0, 1]);
      return <ellipse key={k} cx={x} cy={y} rx={22 * sc} ry={44 * sc} fill="#121214" opacity={vis} transform={`rotate(-14 ${x} ${y})`} />; })}
    <ellipse cx={540} cy={820} rx={420} ry={360} fill="url(#beam)" />
    <rect x={0} y={0} width={W} height={120} fill="#3a5a8a" /><rect x={0} y={1120} width={W} height={60} fill="#3a5a8a" opacity={0.6} />
    <g opacity={ip(T, [at("следы"), at("следы") + 0.3], [0, 1])}><Tag x={540} y={215} title="СЛЕДЫ К ВАГОНУ" sub={back > 0.3 ? "ОБРАТНЫХ НЕТ" : "ИЗ ТЕМНОТЫ"} c={RED} w={320} /></g>
  </Cam>;
};
const Question: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2.6], [2.0, 2.3])} cx={seatX(12)} cy={470}>
  <Car T={T} light={0.06} stranger={1} />
  <rect width={W * 3} height={PH} x={-W} fill="#000" opacity={0.35} />
</Cam>;
const EndCard: SShot = ({ t }) => <g>
  <defs><radialGradient id="egm1s"><stop offset="0" stopColor="#1a2240" /><stop offset="1" stopColor="#04050a" /></radialGradient></defs>
  <rect width={W} height={PH} fill="url(#egm1s)" />
  <g opacity={ip(t, [0, 0.4], [0, 1])}>
    <text x={540} y={520} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={150} fill="#fff">МЕТРО</text>
    <text x={540} y={600} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={40} fill="#8fb4ff" letterSpacing={4}>ЧАСТЬ 2 — СКОРО</text>
  </g>
  <g opacity={ip(t, [0.6, 1.0], [0, 1])}>
    <text x={540} y={720} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={42} fill="#fff">А вы бы заговорили с ним?</text>
    <rect x={380} y={770} width={320} height={80} rx={40} fill="#e03030" /><text x={540} y={822} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#fff">ПОДПИСАТЬСЯ</text>
  </g>
</g>;

const CUTS: [SShot, number][] = [
  [Hook, 0], [Mistake, b("Но", 1)], [MapShot, b("Последний")], [People, b("В", 1)], [Stop, b("Поезд", 1)], [NoSignal, b("Связи")],
  [Urge, b("Двое")], [NoNeed, b("Не", 1)], [Rail, b("В", 2)], [Sec1, b("Первое")], [Intercom, b("кнопка")],
  [Sec2, b("Второе")], [Torch, b("фонарик")], [Sec3, b("Третье")], [Rules, b("каждые")],
  [Clock130, b("Половина")], [Count, b("Петя", 2)], [Thirteen, b("Тринадцать")], [LastSeat, b("На")],
  [Coat, b("Весь")], [Steps, b("А", 1)], [Question, b("Что")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "01:00"], [b("Поезд", 1), "01:03"], [b("Двое"), "01:18"], [b("Второе"), "01:22"], [b("Третье"), "01:25"], [b("Половина"), "01:30"]];
const SECS: [number, string][] = [[0, ""], [b("Первое"), "1. СВЯЗЬ"], [b("Второе"), "2. СВЕТ"], [b("Третье"), "3. ПЕРЕКЛИЧКА"], [b("Половина"), ""]];
// верхняя плашка как в образце: время · место · сколько стоим, и номер пункта
const Hud: React.FC<{ T: number }> = ({ T }) => {
  if (T > VOICE.dur + 0.15) return null;
  const clock = [...CLOCK].reverse().find(([a]) => T >= a)![1], sec = [...SECS].reverse().find(([a]) => T >= a)![1];
  const box = (txt: string, c: string, bg: string) => <div style={{ background: bg, color: c, fontFamily: "FsMont", fontWeight: 800, fontSize: 26, padding: "6px 14px", borderRadius: 6, letterSpacing: 1 }}>{txt}</div>;
  return <div style={{ position: "absolute", top: 26, left: 24, right: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {box(clock, "#fff", "rgba(0,0,0,0.55)")}{box("ПЕРЕГОН · НОЧЬ", "#fff", "#2a5ab8")}{box(T > at("Связи") ? "НЕТ СЕТИ" : "СЕТЬ ✓", T > at("Связи") ? "#ff6a6a" : "#9fe8a8", "rgba(0,0,0,0.55)")}
    </div>
    {sec ? <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>{box(sec, INK, "#f1e2b8")}</div> : null}
  </div>;
};
const RED_RE = /^(погас|не|ошибку|гаснет|нет|надо|вольт|всё|поезд|батарей|вечные|садятся|кричит|перекличка|молчит|но|тринадцать|тринадцатый|никого|пыли|молчит|следы|обратных)/i;
const YEL_RE = /^(метро|тоннеле|надёжном|двенадцать|петя|связь|кнопка|машинистом|ждите|знают|свет|фонарик|очереди|воздух|двадцати|двести|сорок|форточки|десять|помощи|девять|одиннадцать|плаще|станции)/i;
export const Metro1S: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_M1S} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/metro1s" glide hud={(T: number) => <Hud T={T} />} />;
