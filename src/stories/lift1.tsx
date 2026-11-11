// История «Лифт», часть 1: лифт застревает ночью, в зеркале за Петей кто-то стоит, а потом лифт едет в несуществующий подвал.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, NightBg, PH, RED, Shadow, Tag, W, rnd } from "../foodshort/FoodShort";
import { PETYA, Petya, pStand, pWalk } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { VOICE as V } from "./lift1.voice";

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22", METAL = "#4a5068", METAL_D = "#353a50";
export const AD_LEN_VX = 5.2; // ролик VisionEx
export const AD1_L1 = wd("Тишина").e + 0.4;
export const TM_L1 = timing(VOICE, AD1_L1, AD_LEN_VX);

// ---------- детали лифта ----------
/** кабина спереди: стены, потолочная лампа (light 0…1), зеркало на задней стене */
const Cabin: React.FC<{ light: number; children?: React.ReactNode; mirror?: React.ReactNode }> = ({ light, children, mirror }) => (
  <g>
    <rect width={W} height={PH} fill="#05060d" />
    <polygon points="140,120 940,120 820,260 260,260" fill={METAL_D} />
    <polygon points="140,120 260,260 260,1000 140,1150" fill={METAL} />
    <polygon points="940,120 820,260 820,1000 940,1150" fill={METAL} />
    <rect x={260} y={260} width={560} height={740} fill="#3e4458" />
    {[0, 1, 2].map((k) => <path key={k} d={`M ${260 + k * 186} 260 L ${260 + k * 186} 1000`} stroke={METAL_D} strokeWidth={4} />)}
    {/* зеркало на задней стене */}
    <rect x={330} y={330} width={420} height={520} rx={10} fill="#1c2236" stroke="#8a90a4" strokeWidth={8} />
    <clipPath id="mir"><rect x={334} y={334} width={412} height={512} rx={8} /></clipPath>
    <g clipPath="url(#mir)">{mirror}<polygon points="334,334 520,334 380,846 334,846" fill="#fff" opacity={0.06} /></g>
    <polygon points="140,1150 940,1150 820,1000 260,1000" fill="#2a2a32" />
    {/* лампа */}
    <rect x={420} y={150} width={240} height={40} rx={8} fill={light > 0.5 ? "#fff6d8" : "#3a3a40"} />
    <polygon points="420,190 660,190 900,1150 180,1150" fill="#fff6d8" opacity={0.08 * light} />
    {children}
    <rect width={W} height={PH} fill="#000" opacity={0.75 * (1 - light)} />
  </g>
);
const Display: React.FC<{ x: number; y: number; s?: number; text: string; c?: string; arrow?: number }> = ({ x, y, s = 1, text, c = "#ff6a3a", arrow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-90} width={300} height={180} rx={14} fill="#0a0a0e" stroke="#5a6078" strokeWidth={8} />
    <text x={arrow ? 30 : 0} y={50} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={130} fill={c} style={{ filter: `drop-shadow(0 0 12px ${c})` }}>{text}</text>
    {arrow ? <path d={arrow > 0 ? "M -110 30 L -80 -30 L -50 30 Z" : "M -110 -30 L -80 30 L -50 -30 Z"} fill={c} /> : null}
  </g>
);
const PanelBtns: React.FC<{ pressed?: number; bell?: number }> = ({ pressed = 0, bell = 0 }) => (
  <g>
    <rect x={330} y={80} width={420} height={1040} rx={20} fill="#8a90a4" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => {
      const n = 9 - i, col = i % 2, row = Math.floor(i / 2), x = 460 + col * 160, y = 200 + row * 150, lit = pressed === n;
      return <g key={n}><circle cx={x} cy={y} r={56} fill={lit ? "#ffd88a" : "#c8ccd8"} stroke={INK} strokeWidth={5} style={lit ? { filter: "drop-shadow(0 0 18px #ffb84a)" } : undefined} />
        <text x={x} y={y + 22} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={60} fill={INK}>{n}</text></g>;
    })}
    <g transform="translate(620 950)"><circle r={56} fill={bell ? "#ffd88a" : "#e0b040"} stroke={INK} strokeWidth={5} style={bell ? { filter: "drop-shadow(0 0 22px #ffb84a)" } : undefined} />
      <path d="M -22 14 Q -22 -26 0 -28 Q 22 -26 22 14 L 28 20 L -28 20 Z M -6 24 Q 0 32 6 24" fill={INK} /></g>
    {/* решётка динамика */}
    {Array.from({ length: 5 }, (_, k) => <rect key={k} x={400} y={1030 + k * 16} width={280} height={7} rx={3} fill={INK} />)}
  </g>
);
const Finger: React.FC<{ x: number; y: number; push: number }> = ({ x, y, push }) => (
  <g transform={`translate(${x + 40 - push * 40} ${y + 60 - push * 50})`}>
    <path d="M 0 0 L 420 520" stroke={INK} strokeWidth={96} strokeLinecap="round" /><path d="M 0 0 L 420 520" stroke={PETYA.top} strokeWidth={88} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={40} ry={46} fill={PETYA.skin} stroke={INK} strokeWidth={5} />
  </g>
);

// ---------- сцены ----------
const Yard: SShot = ({ t, T }) => {
  const x = ip(t, [0, 3.6], [160, 640]);
  return <Cam s={ip(t, [0, 3.6], [1, 1.08])} cx={540} cy={640}>
    <NightBg />
    <rect x={60} y={120} width={960} height={900} fill="#1d2752" />
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => <rect key={r + "-" + c} x={110 + c * 185} y={160 + r * 170} width={110} height={110} fill="#0e1430" />))}
    <rect x={700} y={760} width={170} height={260} fill="#05060d" stroke="#0a0e24" strokeWidth={8} />
    <rect y={1020} width={W} height={PH - 1020} fill="#10152e" />
    <circle cx={300} cy={700} r={10} fill="#ffe8a0" /><polygon points="300,700 140,1020 460,1020" fill="#ffe8a0" opacity={0.06} />
    <Petya x={x} y={1040} s={0.62} pose={pWalk(T * 30, (x - 160) / 0.62, 1, { expr: { eyes: "squint", mouth: "flat" } })} />
    <g transform="translate(540 250)" opacity={ip(t, [0, 0.2, 2.0, 2.4], [0, 1, 1, 0])}>
      <rect x={-150} y={-52} width={300} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">ЛИФТ</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>ЧАСТЬ 1</text>
    </g>
  </Cam>;
};
const Hall: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.8], [1, 1.1])} cx={540} cy={640}>
    <rect width={W} height={PH} fill="#07080f" />
    <rect x={330} y={300} width={420} height={720} fill="#2a2f42" stroke="#4a5068" strokeWidth={12} />
    <path d="M 540 300 L 540 1020" stroke="#05060d" strokeWidth={8} />
    <circle cx={800} cy={640} r={22} fill="#ffb84a" style={{ filter: "drop-shadow(0 0 20px #ffb84a)" }} />
    <polygon points="800,640 600,1180 1080,1180" fill="#ffb84a" opacity={0.05} />
    <rect y={1020} width={W} height={PH - 1020} fill="#0a0b14" />
    <Petya x={860} y={1100} s={0.75} pose={pStand(T * 30, { turn: -0.6, light: 1, expr: { mouth: "flat", look: [-1, 0] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.35} />
    <g opacity={ip(T, [at("лифт", 1), at("лифт", 1) + 0.3], [0, 1])}><Tag x={540} y={215} title="СВЕТА НЕТ" sub="ТОЛЬКО ЛИФТ" c={YEL} w={260} /></g>
  </Cam>
);
const Press: SShot = ({ T }) => {
  const push = ip(T, [at("девятый") - 0.2, at("девятый")], [0, 1]) * (1 - ip(T, [at("этаж") + 0.2, at("этаж") + 0.5], [0, 0.6]));
  return <Cam s={1.05} cx={540} cy={560}><rect width={W} height={PH} fill="#2a2f42" /><PanelBtns pressed={T > at("девятый") ? 9 : 0} /><Finger x={620} y={240} push={push} /></Cam>;
};
const DoorsClose: SShot = ({ t, T }) => {
  const close = ip(T, [at("Двери"), at("закрываются") + 0.6], [0, 1]);
  return <Cam s={ip(t, [0, 3], [1, 1.12])} cx={540} cy={640}>
    <Cabin light={1}><Petya x={540} y={1060} s={0.95} pose={pStand(T * 30, { light: 1, expr: { mouth: "flat", look: [0, 0] } })} /></Cabin>
    {/* двери со стороны подъезда */}
    <rect x={0} y={0} width={140 + close * 400} height={PH} fill="#2a2f42" stroke="#4a5068" strokeWidth={8} />
    <rect x={940 - close * 400} y={0} width={140 + close * 400} height={PH} fill="#2a2f42" stroke="#4a5068" strokeWidth={8} />
    <rect width={W} height={PH} fill="#000" opacity={0.25} />
  </Cam>;
};
const Floors: SShot = ({ T }) => {
  const n = T < at("Третий") - 0.6 ? "1" : T < at("Третий") ? "2" : T < at("Четвёртый") ? "3" : T < at("Пятый") ? "4" : "5";
  return <Cam s={1} cx={540} cy={590}><rect width={W} height={PH} fill="#2a2f42" /><Display x={540} y={560} s={2} text={n} arrow={1} /></Cam>;
};
const Shaft: React.FC<{ y: number; down?: number; red?: boolean }> = ({ y, down = 0, red }) => (
  <g>
    <rect width={W} height={PH} fill="#07080f" />
    <rect x={340} y={0} width={400} height={PH} fill="#11131c" stroke="#2a2f42" strokeWidth={10} />
    {[-1, 0, 1, 2, 3, 4].map((k) => {
      const fy = 600 + k * 340 - (y % 340);
      const num = 5 - k + Math.floor(y / 340);
      return <g key={k}><rect x={340} y={fy} width={60} height={14} fill="#2a2f42" /><rect x={680} y={fy} width={60} height={14} fill="#2a2f42" />
        <text x={300} y={fy + 10} textAnchor="end" fontFamily={MONO} fontSize={36} fill={num < 1 ? RED : "#5a6078"}>{num < 1 ? `${num - 1}` : `${num}`}</text></g>;
    })}
    <path d="M 540 0 L 540 470" stroke="#5a6078" strokeWidth={6} />
    <rect x={400} y={470} width={280} height={300} fill="#3e4458" stroke={INK} strokeWidth={8} />
    <rect x={440} y={520} width={200} height={180} fill={red ? "#2a0a0e" : "#fff6d8"} opacity={0.6} />
    {down ? <path d="M 820 560 L 880 680 L 940 560 Z" fill={RED} opacity={0.5 + 0.5 * Math.sin(down * 12)} /> : null}
  </g>
);
const Stuck: SShot = ({ T }) => {
  const stop = T > at("остановка") - 0.1;
  const y = ip(T, [b("И", 1), at("остановка")], [0, 170]);
  return <Cam s={1} cx={540} cy={600} shake={stop && T < at("остановка") + 0.3 ? 0.6 : 0}>
    <Shaft y={y} />
    <g opacity={ip(T, [at("Между"), at("Между") + 0.3], [0, 1])}><Tag x={540} y={215} title="МЕЖДУ 5 И 6" sub="ЛИФТ СТОИТ" c={RED} w={300} /></g>
  </Cam>;
};
const Flicker: SShot = ({ T }) => {
  const fl = T < at("мигает") ? 1 : T < at("гаснет") ? (rnd(Math.floor(T * 14)) > 0.5 ? 1 : 0.15) : 0;
  return <Cam s={1.25} cx={540} cy={560}><Cabin light={fl}><Petya x={540} y={1060} s={0.95} pose={pStand(T * 30, { light: 1, expr: { eyes: "wide", mouth: "tight", look: [0, -1] } })} /></Cabin></Cam>;
};
const Call: SShot = ({ t, T }) => {
  const push = ip(T, [at("кнопку") - 0.2, at("кнопку")], [0, 1]);
  return <Cam s={ip(t, [0, 3], [1.4, 1.5])} cx={560} cy={860}>
    <rect width={W} height={PH} fill="#2a2f42" /><PanelBtns bell={T > at("кнопку") ? 1 : 0} />
    <Finger x={690} y={1000} push={push} />
    <rect width={W} height={PH} fill="#000" opacity={0.45} />
  </Cam>;
};
const Silence: SShot = ({ T }) => (
  <Cam s={2} cx={540} cy={480}><Cabin light={0.25}><Petya x={540} y={1060} s={0.95} pose={pStand(T * 30, { light: 1, expr: { eyes: "open", mouth: "tight", look: [0.8, 0], brows: 0.6 } })} /></Cabin></Cam>
);
const Speaker: SShot = ({ t, T }) => {
  const talk = T > at("раздаётся") - 0.1;
  return <Cam s={ip(t, [0, 4], [2.2, 2.4])} cx={540} cy={1060}>
    <rect width={W} height={PH * 2} fill="#2a2f42" /><PanelBtns />
    {talk ? [1, 2, 3].map((k) => <path key={k} d={`M ${540 - 40 * k - 140} ${1060 - 30 * k} Q 540 ${1060 - 60 - 40 * k} ${540 + 40 * k + 140} ${1060 - 30 * k}`} stroke={RED} strokeWidth={6} fill="none" opacity={0.3 + 0.5 * Math.abs(Math.sin(T * 9 + k))} />) : null}
    <rect width={W} height={PH * 2} fill="#000" opacity={0.4} />
  </Cam>;
};
const Warn: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3], [1.9, 2.05])} cx={540} cy={470}>
    <Cabin light={0.3}><Petya x={540} y={1060} s={0.95} pose={pStand(T * 30, { light: 1, expr: { eyes: "wide", mouth: "o", brows: 1.2, look: [0, 0] } })} /></Cabin>
    <rect width={W} height={PH} fill="#ff2a2a" opacity={0.08} />
  </Cam>
);
const PhoneLight: SShot = ({ t, T }) => {
  const tx = ip(t, [0, 1.4, 2.6, 3.4], [300, 780, 420, 540]), ty = ip(t, [0, 1.4, 2.6, 3.4], [700, 600, 520, 560]);
  const toMirror = T > b("Только");
  return <g>
    <defs><mask id="ph1"><rect width={W} height={PH} fill="#fff" /><circle cx={toMirror ? 540 : tx} cy={toMirror ? 590 : ty} r={toMirror ? 300 : 210} fill="#000" /></mask></defs>
    <Cam s={1.05} cx={540} cy={600}><Cabin light={1} mirror={<Petya x={540} y={1260} s={0.95} pose={pStand(T * 30, { light: -1, expr: { mouth: "tight", look: [0, 0] } })} />} /></Cam>
    <rect width={W} height={PH} fill="#02030a" opacity={0.94} mask="url(#ph1)" />
    <g opacity={ip(T, [at("пусто"), at("пусто") + 0.3], [0, 1]) * (toMirror ? 0 : 1)}><Tag x={540} y={215} title="КАБИНА" sub="ПУСТО" c={YEL} w={240} /></g>
    <g opacity={ip(T, [at("зеркало", 1), at("зеркало", 1) + 0.3], [0, 1])}><Brackets x={320} y={320} w={440} h={540} c={YEL} /></g>
  </g>;
};
/** отражение в зеркале: Петя и кто-то за ним; smile — отражение улыбается */
const Mirror: React.FC<{ T: number; who: number; smile?: number; real?: boolean }> = ({ T, who, smile = 0, real }) => (
  <g>
    <rect width={W} height={PH} fill="#05060d" />
    <rect x={90} y={90} width={900} height={1000} rx={14} fill="#1c2236" stroke="#8a90a4" strokeWidth={14} />
    <clipPath id="mir2"><rect x={100} y={100} width={880} height={980} rx={10} /></clipPath>
    <g clipPath="url(#mir2)">
      <rect x={100} y={100} width={880} height={980} fill="#262c42" />
      <g opacity={who}><Shadow x={720} y={1200} s={2.6} eyes={who} look={-0.3} /></g>
      <Petya x={500} y={2200} s={2.6} pose={pStand(T * 30, { turn: 0.1, light: -1, expr: smile > 0 ? { eyes: "squint", mouth: "smile", brows: -1, look: [0, 0] } : { eyes: "wide", mouth: "tight", brows: 1, look: [0, 0] } })} />
      {smile > 0 ? <path d="M 448 896 Q 506 968 564 896" stroke={INK} strokeWidth={9} fill="#5a2a24" opacity={smile} /> : null}
      <polygon points="100,100 420,100 200,1080 100,1080" fill="#fff" opacity={0.05} />
      <rect x={100} y={100} width={880} height={980} fill="#5a7aa8" opacity={0.12} />
    </g>
    {real ? <g><Petya x={130} y={2250} s={2.8} pose={pStand(T * 30, { turn: 0.5, light: 1, expr: { eyes: "wide", mouth: "tight", look: [1, 0] } })} /></g> : null}
  </g>
);
const InMirror: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 4], [1, 1.1])} cx={540} cy={560}>
    <Mirror T={T} who={ip(T, [at("кто-то") - 0.2, at("спиной")], [0, 1])} />
    <g opacity={ip(T, [at("спиной"), at("спиной") + 0.3], [0, 1])}><Brackets x={560} y={300} w={360} h={700} c={RED} /></g>
  </Cam>
);
const TurnAround: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3], [1.15, 1.25])} cx={540} cy={560}>
    <Cabin light={0.6}><Petya x={540} y={1060} s={0.95} pose={pStand(T * 30, { turn: 0.9, light: 1, expr: { eyes: "wide", mouth: "o", brows: 1, look: [1, 0] } })} /></Cabin>
    <g opacity={ip(T, [at("Никого"), at("Никого") + 0.3], [0, 1])}><Tag x={540} y={215} title="НИКОГО" sub="ЗА СПИНОЙ ПУСТО" c={YEL} w={300} /></g>
  </Cam>
);
const Smile: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 5], [1, 1.18])} cx={520} cy={600}>
    <Mirror T={T} who={0} smile={ip(T, [at("улыбается") - 0.2, at("улыбается") + 0.5], [0, 1])} real />
    <rect width={W} height={PH} fill="#ff2a2a" opacity={ip(T, [at("нет", 1), at("нет", 1) + 0.4], [0, 0.12])} />
  </Cam>
);
const Down: SShot = ({ T }) => {
  const y = ip(T, [at("дёргается"), at("Минус") - 0.1], [170, -1500]);
  return <Cam s={1} cx={540} cy={600} shake={T < at("дёргается") + 0.3 && T > at("дёргается") ? 0.6 : 0}>
    <Shaft y={y} down={T} red={T > at("Вниз")} />
    <g opacity={ip(T, [at("Вниз"), at("Вниз") + 0.3], [0, 1])}><Tag x={540} y={215} title="▼ ВНИЗ" sub="САМ" c={RED} w={220} /></g>
  </Cam>;
};
const Minus: SShot = ({ t, T }) => {
  const open = ip(T, [at("доме") , at("подвала") + 0.8], [0, 1]);
  return <Cam s={ip(t, [0, 3.5], [1, 1.12])} cx={540} cy={560}>
    <rect width={W} height={PH} fill="#2a0a0e" />
    <Display x={540} y={300} s={1.6} text="-1" c={RED} arrow={-1} />
    {/* двери медленно открываются в темноту */}
    <rect x={240} y={560} width={600} height={620} fill="#000" />
    {open > 0.3 ? <g opacity={(open - 0.3) / 0.7}>{[-1, 1].map((k) => <circle key={k} cx={540 + k * 22} cy={820} r={7} fill="#f2f2f2" />)}</g> : null}
    <rect x={240} y={560} width={300 - open * 220} height={620} fill="#3e4458" stroke={INK} strokeWidth={6} />
    <rect x={540 + open * 220} y={560} width={300 - open * 220} height={620} fill="#3e4458" stroke={INK} strokeWidth={6} />
    <g opacity={ip(T, [at("подвала"), at("подвала") + 0.3], [0, 1])}><Tag x={540} y={500} title="ПОДВАЛА НЕТ" sub="ПО ПЛАНУ ДОМА" c={RED} w={320} /></g>
  </Cam>;
};
const EndCard: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="egl"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#egl)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill={RED}>ЭТАЖ</text>
      <text x={540 - gl} y={690} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill={RED}>МИНУС ОДИН</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 2</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [Yard, 0], [Hall, b("В", 1)], [Press, b("Петя", 2)], [DoorsClose, b("Двери")], [Floors, b("Лифт", 1)], [Stuck, b("И", 1)], [Flicker, b("Свет", 1)],
  [Call, b("Петя", 3)], [Silence, b("Тишина")], [Speaker, b("А", 1)], [Warn, b("Не", 1)], [PhoneLight, b("Петя", 4)], [InMirror, b("В", 3)],
  [TurnAround, b("Петя", 6)], [Smile, b("Снова")], [Down, b("Лифт", 2)], [Minus, b("Минус")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "02:30"], [b("Свет", 1), "02:33"], [b("Лифт", 2), "02:41"]];
const RED_RE = /^(остановка|гаснет|тишина|голос|двигайтесь|один|спиной|никого|улыбается|нет|вниз|минус|подвала|кто-то|дёргается)/i;
const YEL_RE = /^(лифт|девятый|третий|четвёртый|пятый|этажами|диспетчера|телефоном|зеркало|зеркале|отражение|петя|пусто)/i;
export const Lift1: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_L1} adLen={AD_LEN_VX} capTop={1480} dimAd cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/lift1" />;
