// Часть 3 «Кто за окном»: мальчик на карнизе, а на подоконнике — чужие следы.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, Facade, MONO, NightBg, PH, RED, Shadow, Tag, W, rnd, winXY } from "./FoodShort";
import { Interior, SoupCan } from "./FoodShort2";
import { BOY, PETYA, Petya, pSitFloor, pStand } from "./petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "./shell";
import { VOICE as V3 } from "./voice3";

const VOICE = V3 as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_3 = wd("прятался").e + 0.4;
export const TM3 = timing(VOICE, AD1_3);
const BOY_S = 0.72; // мальчик ниже Пети

// окно комнаты изнутри: открыто на open (0…1), внутри — что угодно (children, в координатах окна)
const RoomWindow: React.FC<{ x: number; y: number; w: number; h: number; open?: number; children?: React.ReactNode; glow?: number }> = ({ x, y, w, h, open = 0, children, glow = 0 }) => (
  <g>
    <clipPath id={`rw${x}${y}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
    <rect x={x} y={y} width={w} height={h} fill="#26326a" />
    <circle cx={x + w * 0.75} cy={y + h * 0.2} r={w * 0.08} fill="#cfd6f2" opacity={0.8} />
    <g clipPath={`url(#rw${x}${y})`}>{children}</g>
    {glow > 0 ? <circle cx={x + w * 0.45} cy={y + h * 0.5} r={w * 0.35} fill="#fff6d0" opacity={0.18 * glow} /> : null}
    {/* створка: при открытии уходит внутрь (сужается) */}
    <g transform={`translate(${x} ${y}) scale(${1 - open * 0.85} 1)`}><rect width={w / 2} height={h} fill="none" stroke="#05060d" strokeWidth={16} /></g>
    <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h * 0.42} L ${x + w} ${y + h * 0.42}`} stroke="#05060d" strokeWidth={16} opacity={1 - open} />
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#05060d" strokeWidth={24} />
    <rect x={x - 30} y={y + h} width={w + 60} height={26} fill="#3a3f55" stroke={INK} strokeWidth={4} />
  </g>
);
const Phone: React.FC<{ x: number; y: number; s?: number; on?: number }> = ({ x, y, s = 1, on = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={12} fill="#15161c" stroke={INK} strokeWidth={4} />
    <circle cx={14} cy={-46} r={6} fill="#fff8d0" opacity={on} />
  </g>
);

// ---------- сцены ----------
const KNOCK3 = [at("Стук"), at("Стук") + 0.3, at("Стук") + 0.6, at("повторяется") + 0.5];
const Knock: SShot = ({ t, T }) => {
  const hit = KNOCK3.some((k) => T > k && T < k + 0.12);
  return <Cam s={ip(t, [0, 2.2], [1, 1.08])} cx={540} cy={600} shake={hit ? 0.3 : 0}>
    <rect width={W} height={PH} fill="#0b0f22" />
    <RoomWindow x={300} y={180} w={560} h={640}>
      <g transform={`translate(640 ${560})`}><path d="M -40 300 L -30 40 Q -40 -40 0 -50 Q 40 -40 30 40 L 40 300 Z" fill="#05060d" />
        {[-24, -8, 8, 24].map((k) => <rect key={k} x={k - 7} y={-90} width={14} height={60} rx={7} fill="#05060d" />)}</g>
    </RoomWindow>
    <Petya x={170} y={1300} s={1.6} pose={pStand(T * 30, { turn: 0.6, light: 1, expr: { eyes: "wide", mouth: "o", brows: 1, look: [1, -0.2] } })} />
    <rect width={W} height={PH} fill="#0b1030" opacity={0.25} />
    <g transform="translate(540 250)" opacity={ip(t, [0, 0.2, 2.0, 2.4], [0, 1, 1, 0])}>
      <rect x={-140} y={-52} width={280} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">ЧАСТЬ 3</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>КТО ЗА ОКНОМ</text>
    </g>
  </Cam>;
};
const Height: SShot = ({ t }) => {
  const [hx, hy] = winXY(5, 2);
  const down = ip(t, [0, 3.6], [0, 1]);
  return <g><NightBg /><Cam s={1.7} cx={hx + 60} cy={hy - 40 + down * 520}>
    <Facade lit={(f, c) => (f === 5 && c === 2 ? 0.5 : 0)} />
    {/* фонари далеко внизу */}
    {[0, 1, 2, 3].map((k) => <circle key={k} cx={180 + k * 240} cy={1150} r={8} fill="#ffe8a0" opacity={0.8} />)}
  </Cam>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><Tag x={540} y={215} title="5 ЭТАЖ" sub="ДО ЗЕМЛИ 15 МЕТРОВ" c={RED} w={320} /></g></g>;
};
const PhoneGlass: SShot = ({ t, T }) => {
  const near = ip(t, [0, 1.2], [0, 1]);
  return <Cam s={ip(t, [0, 2.6], [1.1, 1.25])} cx={560} cy={560}>
    <rect width={W} height={PH} fill="#05060d" />
    <RoomWindow x={180} y={120} w={720} h={860} glow={near} />
    {/* рука Пети с телефоном */}
    <g transform={`translate(${620} ${980 - near * 380})`}>
      <path d="M 40 60 L 260 700" stroke={INK} strokeWidth={86} strokeLinecap="round" /><path d="M 40 60 L 260 700" stroke={PETYA.top} strokeWidth={78} strokeLinecap="round" />
      <ellipse cx={20} cy={30} rx={40} ry={44} fill={PETYA.skin} stroke={INK} strokeWidth={4} />
      <Phone x={0} y={-30} s={1.5} on={1} />
    </g>
    <polygon points={`${640},${560 - near * 0} 300,240 860,240`} fill="#fff6d0" opacity={0.0} />
    <rect width={W} height={PH} fill="#000" opacity={0.15 + 0.1 * Math.sin(T * 9) * 0} />
  </Cam>;
};
/** мальчик за стеклом, освещён телефоном */
const BoyGlass: SShot = ({ t, T }) => {
  const show = ip(T, [at("мальчик") - 0.3, at("мальчик") + 0.2], [0, 1]);
  const fog = ip(T, [at("Пусти") - 0.2, at("Пусти") + 0.6], [0, 1]) * (0.6 + 0.4 * Math.sin(T * 3));
  const zoom = T > at("Пусти") - 0.3 ? 1.9 : 1.15;
  return <Cam s={ip(t, [0, 3], [zoom, zoom + 0.1])} cx={540} cy={T > at("Пусти") - 0.3 ? 430 : 560}>
    <rect width={W} height={PH} fill="#05060d" />
    <RoomWindow x={180} y={120} w={720} h={860} glow={1}>
      <g opacity={show}>
        <Petya x={560} y={1350} s={1.5} look={BOY} pose={pStand(T * 30, { turn: -0.15, light: 1, handL: [-75, -520], handR: [75, -520], expr: { eyes: "wide", brows: 1.2, mouth: T > at("Пусти") - 0.2 && T < at("страшно") + 0.6 ? "open" : "tight", look: [0, 0] } })} />
      </g>
      <ellipse cx={560} cy={560} rx={160} ry={90} fill="#e8eef8" opacity={0.25 * fog} />
    </RoomWindow>
    <circle cx={560} cy={500} r={260} fill="#fff6d0" opacity={0.12} />
    <g opacity={ip(T, [at("Лет") - 0.1, at("Лет") + 0.3], [0, 1]) * (T < at("Пусти") - 0.3 ? 1 : 0)}><Tag x={540} y={215} title="МАЛЬЧИК" sub="ЛЕТ 10" c={YEL} w={260} /></g>
  </Cam>;
};
const Ledge: SShot = ({ t, T }) => {
  const [hx, hy] = winXY(5, 2);
  const shake = Math.sin(T * 40) * 2;
  return <g><NightBg /><Cam s={ip(t, [0, 2.6], [2.2, 2.4])} cx={hx + 60} cy={hy + 20}>
    <Facade lit={(f, c) => (f === 5 && c === 2 ? 0.55 : 0)} />
    <rect x={hx - 80} y={hy + 2} width={280} height={14} fill="#3a4470" stroke={INK} strokeWidth={3} />
    <Petya x={hx + 60 + shake} y={hy + 2} s={0.2} look={BOY} pose={pStand(T * 30, { turn: 0.1, handL: [-110, -470], handR: [110, -470], expr: { eyes: "wide", mouth: "tight" } })} />
  </Cam><g opacity={ip(t, [0.4, 0.8], [0, 1])}><Tag x={540} y={215} title="КАРНИЗ" sub="ШИРИНА 20 СМ" c={RED} w={280} /></g></g>;
};
const PullIn: SShot = ({ t, T }) => {
  const open = ip(T, [at("открывает") - 0.2, at("окно", 2) + 0.2], [0, 1]);
  const pull = ip(T, [at("затаскивает"), at("внутрь") + 0.4], [0, 1]);
  return <Cam s={ip(t, [0, 3.4], [1, 1.08])} cx={540} cy={640}>
    <Interior />
    <RoomWindow x={300} y={200} w={520} h={600} open={open} />
    {/* мальчик перелезает через подоконник */}
    <Petya x={560 + pull * 120} y={800 + pull * 200 + (1 - pull) * 260} s={0.72} look={BOY} pose={pStand(T * 30, { turn: 0.3, lean: 30 * (1 - pull), handL: [60, -420], handR: [120, -400], expr: { eyes: "wide", mouth: "tight" } })} />
    <Petya x={860} y={1060} s={1} pose={pStand(T * 30, { turn: -0.7, lean: -6, handL: [-180 + pull * 60, -380], handR: [-160 + pull * 60, -420], expr: { mouth: "tight", brows: 0.5, look: [-1, 0] } })} />
  </Cam>;
};
const Cold: SShot = (p) => <g><ColdIn {...p} /><g opacity={ip(p.T, [at("ледяной"), at("ледяной") + 0.3], [0, 1]) * (p.T < at("Откуда") - 0.2 ? 1 : 0)}><Tag x={540} y={215} title="ЛЕДЯНОЙ" sub="ДРОЖИТ" c="#5fd8f0" w={260} /></g></g>;
const ColdIn: SShot = ({ t, T }) => {
  const shiver = Math.sin(T * 38) * 3;
  return <Cam s={ip(t, [0, 4], [1.5, 1.6])} cx={560} cy={560}>
    <Interior />
    <Petya x={420 + shiver} y={1060} s={BOY_S * 1.05} look={BOY} pose={pStand(T * 30, { turn: 0.4, handL: [-30, -330], handR: [40, -340], expr: { eyes: "open", mouth: T > at("С") && T < at("прятался") + 0.6 ? "open" : "tight", brows: 0.8, look: [1, -0.6] } })} />
    <ellipse cx={460 + T % 1 * 30} cy={560 - (T % 1) * 40} rx={20 + (T % 1) * 20} ry={12 + (T % 1) * 10} fill="#e8eef8" opacity={0.25 * (1 - T % 1)} />
    <Petya x={760} y={1060} s={1} pose={pStand(T * 30, { turn: -0.5, tilt: 8, handL: [-200, -330], handR: [40, -262], expr: { mouth: T > at("Откуда") && T < at("ты") + 0.4 ? "open" : "tight", look: [-1, 0.3] } })} />
    <rect width={W} height={PH} fill="#3a6aa8" opacity={0.12} />
  </Cam>;
};
const Stash: SShot = ({ t, T }) => {
  const lift = ip(t, [0.2, 0.9], [0, 1]), take = ip(T, [at("достаёт"), at("супа") + 0.3], [0, 1]);
  return <g>
    <rect width={W} height={PH} fill="#3a2a20" />
    {Array.from({ length: 9 }, (_, i) => <g key={i}><rect x={0} y={i * 140} width={W} height={136} fill={i % 2 ? "#4a3626" : "#45321f"} /><path d={`M ${rnd(i) * 900} ${i * 140} l 0 136`} stroke="#2a1c12" strokeWidth={4} /></g>)}
    <rect x={180} y={560} width={720} height={136} fill="#0a0604" />
    {[0, 1, 2, 3].map((k) => <g key={k} transform={`translate(${260 + k * 140} 630) scale(0.9)`} opacity={k === 1 ? 1 - take : 0.7}>{k % 2 ? <SoupCan s={1.4} /> : <path d="M -46 56 Q -56 -28 -34 -62 L 34 -62 Q 56 -28 46 56 Z" fill="#f2ead6" stroke={INK} strokeWidth={5} />}</g>)}
    <g transform={`translate(180 560) scale(1 ${1 - lift * 0.82})`}><rect width={720} height={136} fill="#5a4230" stroke={INK} strokeWidth={4} /></g>
    {/* рука достаёт банку */}
    <g transform={`translate(${400 + take * 200} ${640 + take * 380 - (1 - take) * 0})`} opacity={take > 0 ? 1 : 0.0}>
      <path d="M 0 0 L 200 640" stroke={INK} strokeWidth={78} strokeLinecap="round" /><path d="M 0 0 L 200 640" stroke={PETYA.top} strokeWidth={70} strokeLinecap="round" />
      <g transform="translate(-10 -20)"><SoupCan s={1.4} /></g>
      <ellipse cx={20} cy={10} rx={30} ry={34} fill={PETYA.skin} stroke={INK} strokeWidth={4} />
    </g>
    <rect width={W} height={PH} fill="#000" opacity={0.3} />
  </g>;
};
const Eat: SShot = ({ t, T }) => {
  const bite = Math.max(0, Math.sin(T * 7));
  return <Cam s={ip(t, [0, 3.5], [1.6, 1.75])} cx={540} cy={600}>
    <Interior />
    <Petya x={540} y={1060} s={BOY_S * 1.05} look={BOY} pose={pStand(T * 30, { tilt: 12, handL: [-20, -380 - bite * 40], handR: [40, -360], expr: { eyes: "squint", mouth: bite > 0.5 ? "open" : "tight", look: [0, 1] } })} />
    <g transform={`translate(${540 + 30 * BOY_S * 1.05} ${1060 - 360 * BOY_S * 1.05})`}><SoupCan s={0.75} /></g>
  </Cam>;
};
const Sofa: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-300} y={-200} width={600} height={120} rx={30} fill="#3a2a4a" stroke={INK} strokeWidth={6} />
    <rect x={-330} y={-100} width={660} height={110} rx={24} fill="#4a3658" stroke={INK} strokeWidth={6} />
    <rect x={-350} y={-170} width={70} height={190} rx={24} fill="#3a2a4a" stroke={INK} strokeWidth={6} /><rect x={280} y={-170} width={70} height={190} rx={24} fill="#3a2a4a" stroke={INK} strokeWidth={6} />
  </g>
);
const Sleep: SShot = ({ t, T }) => {
  const br = Math.sin(T * 1.8) * 4;
  return <Cam s={ip(t, [0, 4], [1.2, 1.3])} cx={540} cy={760}>
    <Interior dark={0.15} />
    <Sofa x={540} y={980} />
    {/* мальчик свернулся под одеялом */}
    <path d={`M 300 ${880 - br} Q 380 ${780 - br} 520 ${800 - br} Q 660 ${770 - br} 720 ${860} L 740 900 L 290 900 Z`} fill="#6a5a3a" stroke={INK} strokeWidth={5} />
    <g transform="translate(270 840) rotate(-80)">
      <path d="M -31 -24 Q -33 -52 0 -54 Q 33 -52 31 -24 L 32 10 Q 30 40 0 46 Q -30 40 -32 10 Z" fill={PETYA.skin} stroke={INK} strokeWidth={3} transform="scale(0.8)" />
      <path d="M -33 -10 Q -36 -60 0 -62 Q 36 -60 33 -10 Q 30 -30 14 -36 Q 4 -28 -8 -34 Q -24 -30 -33 -10 Z" fill={BOY.hair} stroke={INK} strokeWidth={3} transform="scale(0.8)" />
      {[-1, 1].map((k) => <path key={k} d={`M ${k * 12 - 5} -2 Q ${k * 12} 1 ${k * 12 + 5} -2`} stroke={INK} strokeWidth={2.5} fill="none" />)}
    </g>
    <text x={330 + (T % 2) * 10} y={700 - (T % 2) * 20} fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#cfd6f2" opacity={0.5 * (1 - (T % 2) / 2)}>z</text>
  </Cam>;
};
const Watch: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 5], [1, 1.12])} cx={540} cy={640}>
    <Interior dark={0.25} />
    <RoomWindow x={560} y={220} w={420} h={500} />
    <polygon points="560,720 980,720 1080,1180 380,1180" fill="#cfd6f2" opacity={0.06} />
    <Petya x={300} y={1060} s={1} pose={pSitFloor(T * 30, { turn: 0.5, light: 1, handL: [95, -150], handR: [125, -140], expr: { eyes: "open", mouth: "tight", brows: 0.5, look: [1, -0.4] } })} />
    <g opacity={ip(T, [at("Что-то"), at("Что-то") + 0.3], [0, 1])}><Brackets x={530} y={700} w={480} h={60} c={RED} /></g>
  </Cam>
);
const Prints: SShot = ({ t, T }) => {
  const small = ip(T, [at("Маленькие") - 0.1, at("Маленькие") + 0.4], [0, 1]), big = ip(T, [at("большие") - 0.1, at("большие") + 0.4], [0, 1]);
  const step = (x: number, y: number, sc: number, rot: number, c: string, o: number) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={o}>
    <ellipse cx={0} cy={-30} rx={26} ry={40} fill={c} /><ellipse cx={0} cy={45} rx={20} ry={26} fill={c} />
    {[-14, 0, 14].map((k) => <rect key={k} x={k - 4} y={-60} width={8} height={70} fill="#2a2018" opacity={0.4} />)}
  </g>;
  return <Cam s={ip(t, [0, 6], [1, 1.1])} cx={540} cy={600}>
    <rect width={W} height={PH} fill="#0c1024" />
    {/* низ окна: стекло с луной и рама над подоконником */}
    <rect x={40} y={0} width={1000} height={300} fill="#26326a" /><circle cx={820} cy={120} r={50} fill="#cfd6f2" opacity={0.8} />
    <path d="M 540 0 L 540 300" stroke="#05060d" strokeWidth={18} /><rect x={40} y={0} width={1000} height={300} fill="none" stroke="#05060d" strokeWidth={24} />
    <rect x={40} y={300} width={1000} height={520} fill="#9a9fb0" stroke={INK} strokeWidth={8} />
    <polygon points="40,300 1040,300 1040,820 40,820" fill="#cfd6f2" opacity={0.08} />
    <rect x={40} y={300} width={1000} height={520} fill="#0b1030" opacity={0.35} />
    {[[200, 470, -10], [330, 640, 8]].map(([x, y, r], i) => <g key={"s" + i}>{step(x, y, 0.85, r, "#4a3a2a", 0.3 + 0.7 * small)}</g>)}
    {[[560, 460, -6], [760, 640, 10], [900, 450, -4]].map(([x, y, r], i) => <g key={"b" + i}>{step(x, y, 1.6, r, "#3a2a1c", 0.12 + 0.88 * big)}</g>)}
    <g opacity={small}><Tag x={260} y={215} title="МАЛЕНЬКИЕ" sub="МАЛЬЧИК" c={YEL} w={260} /></g>
    <g opacity={big}><Tag x={780} y={215} title="БОЛЬШИЕ" sub="МУЖСКИЕ" c={RED} w={260} /><Brackets x={470} y={330} w={540} h={460} c={RED} /></g>
  </Cam>;
};
const Count: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 4.5], [1, 1.14])} cx={540} cy={560}>
    <Interior dark={0.2} />
    <Petya x={560} y={1640} s={2.2} pose={pStand(T * 30, { turn: 0.2, light: 1, expr: { eyes: T > at("Значит") ? "wide" : "open", brows: T > at("Значит") ? 1.2 : 0.4, mouth: T > at("второй") ? "o" : "tight", look: [0.6, 0] } })} />
    <g opacity={ip(T, [at("один"), at("один") + 0.3], [0, 1])}><Tag x={540} y={215} title={T > at("второй") ? "1 + ?" : "ВЛЕЗ: 1"} sub={T > at("второй") ? "СЛЕДОВ: 2" : "МАЛЬЧИК"} c={T > at("второй") ? RED : YEL} w={260} /></g>
  </Cam>
);
const Behind: SShot = ({ t, T }) => {
  const appear = ip(T, [at("скрипит") - 0.1, at("половица") + 0.3], [0, 1]);
  return <Cam s={ip(t, [0, 4.5], [1, 1.12])} cx={560} cy={700}>
    <Interior dark={0.35} />
    {/* доска-тайник на полу в глубине */}
    <path d="M 560 1010 L 900 1010 L 940 1060 L 520 1060 Z" fill="#4a3626" stroke={INK} strokeWidth={4} />
    <g opacity={appear}><Shadow x={760} y={1020} s={2.0} eyes={appear} look={-0.6} /></g>
    <g opacity={ip(T, [at("тайника") - 0.1, at("тайника") + 0.3], [0, 1])}><Brackets x={500} y={990} w={460} h={90} c={RED} /><Tag x={730} y={1110} title="ТАЙНИК" sub="ЕДА" c={RED} w={220} /></g>
    <Petya x={200} y={1200} s={1.5} pose={pSitFloor(T * 30, { turn: 0.5, light: 1, handL: [95, -150], handR: [125, -140], expr: { eyes: "wide", mouth: "tight", look: [1, -0.4] } })} />
  </Cam>;
};
const EndCard3: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="eg3"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#eg3)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={104} fill={RED}>ОН ВСЁ ЕЩЁ</text>
      <text x={540 - gl} y={690} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={104} fill={RED}>ЗДЕСЬ</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 4</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [Knock, 0], [Height, b("Пятый")], [PhoneGlass, b("Петя", 1)], [BoyGlass, b("За")], [Ledge, b("Он", 1)], [BoyGlass, b("Пусти")],
  [PullIn, b("Петя", 2)], [Cold, b("Мальчик", 1)], [Stash, b("Петя", 3)], [Eat, b("Мальчик", 2)], [Sleep, b("А", 1)], [Watch, b("Петя", 4)],
  [Prints, b("На")], [Count, b("Петя", 5)], [Behind, b("В", 1)], [EndCard3, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "ДЕНЬ 4 — 01:04"], [b("Петя", 3), "ДЕНЬ 4 — 01:20"], [b("Петя", 4), "ДЕНЬ 4 — 03:12"]];
const RED_RE = /^(стук|темнота|дрожит|страшно|ледяной|прятался|крыши|не|так|большие|мужские|второй|скрипит|половица|тайника|карнизе)/i;
const YEL_RE = /^(пятый|мальчик|десяти|телефон|банку|супа|доску|диване|окно|следы|маленькие|один|считает)/i;
export const FoodShort3: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_3} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="foodshort3" ask={[wd("ты")]} />;
