// Часть 2 (герой — Петя). Картинка идёт по «времени истории» T (как озвучка); в двух местах ролик замирает
// (стоп-кадр) под рекламную вставку: после 15-й секунды и в конце. Баннер накладывает scripts/make_foodshort2.sh.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { P } from "../brand/corridor/rig";
import { ip } from "../food/common";
import { Brackets, Cam, Crate, Dust, Facade, MONO, NightBg, PH, RED, S, Shadow, Tag, W, live, rnd, setLang, winXY } from "./FoodShort";
import { PETYA, PPose, Petya, pSitFloor, pStand } from "./petya";
import { VOICE } from "./voice2";

const FPS = 30, YEL = "#ffc53a";
type Wd = { t: number; e: number; w: string; end: boolean; pause: boolean };
const WORDS = VOICE.words as Wd[];
const wd = (w: string, n = 1) => { let c = 0; for (const x of WORDS) if (x.w === w && ++c === n) return x; throw new Error("нет слова " + w); };
const at = (w: string, n = 1) => wd(w, n).t;

// ---------- монтаж (время истории, с) ----------
export const STORY_END = VOICE.dur + 2.8;
export const AD1_T = wd("выломают").e + 0.35;  // после 15-й секунды, на паузе
export const AD_HOLD = 0.6 + 5.3 + 0.25;        // стоп-кадр: 0,6 с тишины, затем баннер 5,3 с
export const AD_DELAY = 0.6;                    // баннер появляется через 0,6 с после стоп-кадра
export const FS2_FRAMES = Math.ceil((STORY_END + 2 * AD_HOLD) * FPS);
/** время ролика -> время истории (во время стоп-кадров время стоит) */
const storyT = (v: number) => (v < AD1_T ? v : v < AD1_T + AD_HOLD ? AD1_T : Math.min(STORY_END, v - AD_HOLD));
export const AD_TIMES = [AD1_T + AD_DELAY, STORY_END + AD_HOLD + AD_DELAY]; // когда в ролике начинается баннер (для ffmpeg)

// ---------- общие детали интерьера ----------
const INK = "#0b0f22", WALLC = "#1b2246", FLOOR = "#11162c", DOOR = "#4a3426";
const Holding: React.FC<{ x: number; y: number; s: number; pose: PPose; item: React.ReactNode; at: P }> = ({ x, y, s, pose, item, at: a }) => (
  <g><Petya x={x} y={y} s={s} pose={pose} />
    <g transform={`translate(${x + a[0] * s} ${y + a[1] * s}) scale(${s})`}>{item}</g>
    {[pose.handL, pose.handR].map((h, i) => <ellipse key={i} cx={x + h[0] * s} cy={y + h[1] * s} rx={13 * s} ry={15 * s} fill={PETYA.skin} stroke={INK} strokeWidth={3 * s} />)}
  </g>
);
const SoupCan: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-26} y={-36} width={52} height={72} rx={6} fill="#b8bcc8" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-18} width={52} height={36} fill="#e8b23a" stroke={INK} strokeWidth={3} />
    <text x={0} y={7} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={15} fill="#3a1a0a">СУП</text>
  </g>
);
/** дверь квартиры изнутри: open 0…1 — насколько приоткрыта (внутрь), chain — цепочка */
const DoorIn: React.FC<{ x: number; y: number; w?: number; h?: number; open?: number; chain?: boolean; gapGlow?: number; t: number; feet?: number; knob?: number }> = ({ x, y, w = 330, h = 700, open = 0, chain = true, gapGlow = 1, t, feet = 0, knob = 0 }) => {
  const gap = open * w * 0.22;
  return <g>
    <rect x={x - 18} y={y - 18} width={w + 36} height={h + 18} fill="#2a2030" stroke={INK} strokeWidth={4} />
    <rect x={x} y={y} width={w} height={h} fill="#05060d" />
    {gap > 1 ? <g>{[0, 1, 2].map((k) => <Shadow key={k} x={x + w - gap * 0.5 + (k - 1) * 30} y={y + h} s={0.9 - k * 0.1} eyes={0.6} look={-0.5} />)}</g> : null}
    <g transform={`translate(${x} ${y}) scale(${1 - open * 0.22} 1)`}>
      <rect width={w} height={h} fill={DOOR} stroke={INK} strokeWidth={5} />
      <rect x={30} y={40} width={w - 60} height={h * 0.38} rx={6} fill="none" stroke="#3a2618" strokeWidth={8} />
      <rect x={30} y={h * 0.5} width={w - 60} height={h * 0.42} rx={6} fill="none" stroke="#3a2618" strokeWidth={8} />
      <rect x={w - 70} y={h * 0.44} width={46} height={110} rx={8} fill="#2a2a32" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${w - 47} ${h * 0.44 + 32}) rotate(${knob * 90})`}><rect x={-18} y={-6} width={36} height={12} rx={5} fill="#c8c8d4" stroke={INK} strokeWidth={3} /></g>
      <circle cx={w - 47} cy={h * 0.44 + 80} r={11} fill="#d8b04a" stroke={INK} strokeWidth={3} />
      <circle cx={w / 2} cy={h * 0.3} r={9} fill="#05060d" stroke="#888" strokeWidth={3} />
    </g>
    {chain ? (gap > 1
      ? <path d={`M ${x + w * (1 - open * 0.22) - 30} ${y + h * 0.36} L ${x + w + 8} ${y + h * 0.36}`} stroke="#c8c8d4" strokeWidth={6} strokeDasharray="10 4" />
      : <path d={`M ${x + w - 60} ${y + h * 0.36} Q ${x + w - 20} ${y + h * 0.36 + 40} ${x + w + 8} ${y + h * 0.36}`} stroke="#c8c8d4" strokeWidth={6} strokeDasharray="10 4" fill="none" />) : null}
    {/* свет из подъезда под дверью и тени ног */}
    <rect x={x} y={y + h - 8} width={w} height={8} fill="#f4d488" opacity={0.9 * gapGlow} />
    <polygon points={`${x},${y + h} ${x + w},${y + h} ${x + w + 160},${y + h + 140} ${x - 160},${y + h + 140}`} fill="#f4d488" opacity={0.08 * gapGlow} />
    {feet > 0 ? Array.from({ length: 4 }, (_, i) => {
      const fx = x + 40 + ((i * 83 + t * (30 + i * 12) * (i % 2 ? 1 : -1)) % (w - 80) + (w - 80)) % (w - 80);
      return <rect key={i} x={fx} y={y + h - 8} width={34} height={8} fill="#05060d" opacity={feet} />;
    }) : null}
  </g>;
};
const Interior: React.FC<{ children?: React.ReactNode; dark?: number }> = ({ children, dark = 0 }) => (
  <g>
    <rect width={W} height={PH} fill={WALLC} />
    <rect y={1000} width={W} height={PH - 1000} fill={FLOOR} />
    <rect y={990} width={W} height={14} fill="#141a36" />
    {children}
    <rect width={W} height={PH} fill="#000" opacity={dark} />
  </g>
);

// ---------- сцены ----------
type Shot = React.FC<{ t: number; T: number }>; // t — секунды сцены, T — время истории
const Inside: Shot = ({ t, T }) => {
  const pose = pStand(T * 30, { turn: -0.45, light: -1, handL: [-80, -330], handR: [80, -330], expr: { eyes: "wide", mouth: "tight", look: [-1, 0] } });
  return <Cam s={ip(t, [0, 6], [1, 1.08])} cx={520} cy={650}>
    <Interior><DoorIn x={160} y={300} t={T} feet={1} /></Interior>
    <Holding x={760} y={1060} s={1.0} pose={pose} at={[0, -335]} item={<Crate x={0} y={0} s={0.85} />} />
    <g transform="translate(540 250)" opacity={ip(t, [0, 0.2, 2.2, 2.6], [0, 1, 1, 0])}>
      <rect x={-140} y={-52} width={280} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">ЧАСТЬ 2</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>ЗА ДВЕРЬЮ</text>
    </g>
  </Cam>;
};
const KNOCKS = [at("стук"), at("стук") + 0.32, at("стук") + 0.64];
const Knock: Shot = ({ t, T }) => {
  const hit = KNOCKS.some((k) => T > k && T < k + 0.12);
  return <Cam s={1.55} cx={330} cy={620} shake={hit ? 0.5 : 0}>
    <Interior><DoorIn x={160} y={300} t={T} feet={1} /></Interior>
    {hit ? <rect width={W * 2} height={PH * 2} x={-W / 2} fill="#fff" opacity={0.05} /> : null}
  </Cam>;
};
const Face: Shot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2.2], [1, 1.12])} cx={540} cy={560}>
    <Interior />
    <rect width={W} height={PH} fill="#f4d488" opacity={0.04} />
    <Petya x={560} y={1640} s={2.2} pose={pStand(T * 30, { turn: -0.25, light: -1, expr: { eyes: "wide", brows: 1, mouth: "o", look: [-1, 0] } })} />
  </Cam>
);
const Choice: Shot = ({ t, T }) => {
  const pose = pStand(T * 30, { tilt: 12, turn: 0.1, expr: { look: [0, 1], mouth: "tight", brows: -0.5 } });
  const a = ip(T, [at("Открыть") - 0.05, at("Открыть") + 0.25], [0, 1]), b = ip(T, [at("Не", 1) - 0.05, at("Не", 1) + 0.25], [0, 1]);
  return <Cam s={ip(t, [0, 6], [1.04, 1.1])} cx={540} cy={640}>
    <Interior><DoorIn x={-120} y={300} w={250} t={T} feet={1} /></Interior>
    <Petya x={610} y={930} s={0.95} pose={pose} />
    <Crate x={560} y={960} s={1.1} />
    <g opacity={a}><Tag x={300} y={250} title="ОТКРЫТЬ" sub="ЗАБЕРУТ ВСЁ" c={RED} w={300} />
      <path d="M 300 300 L 480 900" stroke={RED} strokeWidth={3} strokeDasharray="10 8" /></g>
    <g opacity={b}><Tag x={790} y={380} title="НЕ ОТКРЫТЬ" sub="ВЫЛОМАЮТ ДВЕРЬ" c={RED} w={320} />
      <path d="M 790 430 L 130 600" stroke={RED} strokeWidth={3} strokeDasharray="10 8" /></g>
  </Cam>;
};
const Floor: Shot = ({ t }) => {
  const lift = ip(t, [0.2, 1.0], [0, 1]);
  const items: [number, string][] = [[1.3, "can"], [1.9, "bag"], [2.5, "can"], [3.1, "can"], [3.6, "bag"]];
  return <g>
    <rect width={W} height={PH} fill="#3a2a20" />
    {Array.from({ length: 9 }, (_, i) => <g key={i}><rect x={0} y={i * 140} width={W} height={136} fill={i % 2 ? "#4a3626" : "#45321f"} /><path d={`M ${rnd(i) * 900} ${i * 140} l 0 136`} stroke="#2a1c12" strokeWidth={4} /></g>)}
    {/* тайник под доской */}
    <rect x={180} y={560} width={720} height={136} fill="#0a0604" />
    {items.map(([a, k], i) => {
      const p = ip(t, [a, a + 0.5], [0, 1]);
      if (p <= 0) return null;
      const x = 240 + i * 120, y = 1000 - p * 380, s = 1.1 - p * 0.45;
      return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={p < 1 ? 1 : 0.55}>
        {k === "can" ? <SoupCan s={1.6} /> : <path d="M -50 60 Q -60 -30 -36 -66 L 36 -66 Q 60 -30 50 60 Z" fill="#f2ead6" stroke={INK} strokeWidth={5} />}
      </g>;
    })}
    {/* доска откинута вверх на левом краю (вид сверху: видна её торцевая сторона) */}
    <g transform={`translate(180 560) scale(1 ${1 - lift * 0.82})`}><rect width={720} height={136} fill="#5a4230" stroke={INK} strokeWidth={4} />
      {[60, 660].map((x) => <circle key={x} cx={x} cy={68} r={7} fill="#2a1c12" />)}</g>
    {/* рука Пети держит край доски */}
    <g transform={`translate(${880} ${570 + (1 - lift) * 60})`}>
      <path d="M 0 0 L 260 640" stroke={INK} strokeWidth={78} strokeLinecap="round" />
      <path d="M 0 0 L 260 640" stroke={PETYA.top} strokeWidth={70} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={30} ry={34} fill={PETYA.skin} stroke={INK} strokeWidth={4} />
    </g>
    <rect width={W} height={PH} fill="#000" opacity={0.25} />
  </g>;
};
const CanShot: Shot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2.8], [1.4, 1.55])} cx={560} cy={560}>
    <Interior />
    <Holding x={560} y={1060} s={1.0} pose={pStand(T * 30, { turn: 0.3, tilt: 10, handR: [40, -420], handL: [-58, -262], expr: { look: [0.3, 0.8], mouth: "tight" } })} at={[40, -470]} item={<SoupCan s={1} />} />
  </Cam>
);
const Lock: Shot = ({ T }) => {
  const k = ip(T, [at("поворачивается"), at("поворачивается") + 1.0], [0, 1]);
  return <Cam s={2.6} cx={440} cy={600} shake={k > 0 && k < 1 ? 0.12 : 0}>
    <Interior><DoorIn x={160} y={300} t={T} feet={1} knob={k} /></Interior>
    <g opacity={ip(T, [at("ключ"), at("ключ") + 0.3], [0, 1])}><Tag x={380} y={470} title="ОТКРЫВАЮТ" sub="СНАРУЖИ" c={RED} w={150} /></g>
  </Cam>;
};
const NeighborKey: Shot = ({ t, T }) => {
  const sway = Math.sin(T * 3) * 6;
  return <Cam s={ip(t, [0, 5], [1, 1.12])} cx={540} cy={640}>
    <rect width={W} height={PH} fill="#20294f" />
    <rect x={120} y={360} width={240} height={480} fill="#5a3a2a" stroke={INK} strokeWidth={8} />
    <rect x={190} y={300} width={100} height={46} rx={6} fill="#c8b48a" stroke={INK} strokeWidth={4} /><text x={240} y={334} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#2a1a10">7</text>
    <rect y={840} width={W} height={PH - 840} fill="#151b38" />
    <Shadow x={640} y={860} s={2.1} eyes={0.9} look={0.4} />
    {/* бледная рука с ключом */}
    <g transform={`translate(${760} ${560 + sway})`}>
      <path d="M -80 120 Q -30 60 0 0" stroke="#05060d" strokeWidth={40} strokeLinecap="round" fill="none" />
      <ellipse cx={0} cy={0} rx={24} ry={20} fill="#c9c4bd" stroke={INK} strokeWidth={4} />
      <circle cx={10} cy={30} r={18} fill="none" stroke="#d8d8e0" strokeWidth={5} />
      <path d="M 18 46 l 30 46 l 10 -6 m -14 -6 l 10 -6" stroke="#e8d070" strokeWidth={8} strokeLinecap="round" fill="none" />
      <rect x={-6} y={44} width={28} height={20} rx={4} fill="#c84a3a" stroke={INK} strokeWidth={3} /><text x={8} y={59} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={13} fill="#fff">12</text>
    </g>
    <g opacity={ip(T, [at("соседки"), at("соседки") + 0.3], [0, 1])}><Tag x={300} y={210} title="3 ЭТАЖ · КВ. 7" sub="ЗАПАСНОЙ КЛЮЧ" c={RED} w={330} /></g>
  </Cam>;
};
const DoorChain: Shot = ({ t, T }) => {
  const open = ip(T, [at("открывается"), at("открывается") + 0.6, at("упирается"), at("упирается") + 0.15], [0, 0.6, 0.6, 0.66]);
  const jolt = T > at("упирается") && T < at("упирается") + 0.25;
  return <Cam s={ip(t, [0, 3.4], [1.05, 1.15])} cx={500} cy={640} shake={jolt ? 0.5 : 0}>
    <Interior><DoorIn x={160} y={300} t={T} open={open} feet={0} /></Interior>
    <Petya x={860} y={1060} s={0.9} pose={pStand(T * 30, { turn: -0.6, light: -1, lean: -4, handL: [-60, -380], handR: [40, -330], expr: { eyes: "wide", mouth: "o", look: [-1, 0] } })} />
  </Cam>;
};
const GapEye: React.FC<{ T: number; eye: number; hand?: number; can?: number }> = ({ T, eye, hand = 0, can = 0 }) => {
  const blink = (T * 30) % 70 < 4 ? 0.1 : 1;
  const sq = T > at("Петя", 3) ? 0.7 : 1;
  return <g>
    <rect width={W} height={PH} fill={DOOR} />
    <rect x={420} y={0} width={240} height={PH} fill="#05060d" />
    <rect x={660} y={0} width={40} height={PH} fill="#2a2030" />
    {[300, 420].map((y) => <path key={y} d={`M 380 ${y} L 700 ${y + 10}`} stroke="#c8c8d4" strokeWidth={10} strokeDasharray="22 8" />)}
    <g opacity={eye} transform={`translate(540 600)`}>
      <path d="M -90 0 Q 0 -60 90 0 Q 0 60 -90 0 Z" fill="#e8e2d6" transform={`scale(1 ${blink * sq})`} />
      <circle r={30 * blink * sq} fill="#3a2a1a" /><circle r={13 * blink * sq} fill="#05060d" /><circle cx={9} cy={-9} r={5 * blink} fill="#fff" />
      <path d="M -95 -6 Q 0 -78 95 -6" stroke="#05060d" strokeWidth={10} fill="none" />
    </g>
    {hand > 0 ? <g transform={`translate(${1080 - hand * 520} 860)`}>
      <rect x={0} y={-40} width={600} height={80} fill={PETYA.top} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={44} ry={40} fill={PETYA.skin} stroke={INK} strokeWidth={4} />
      {can > 0 ? <g transform="translate(-50 -10)"><SoupCan s={1.4} /></g> : null}
    </g> : null}
    {can < 0 ? <g transform={`translate(${540 + can * 80} 850)`}><SoupCan s={1.4} /><ellipse cx={-30} cy={10} rx={34} ry={28} fill="#c9c4bd" stroke={INK} strokeWidth={4} /></g> : null}
  </g>;
};
const Eye: Shot = ({ T }) => <Cam s={ip(T, [at("В", 1), at("Петя", 4)], [1, 1.1])} cx={540} cy={600}><GapEye T={T} eye={ip(T, [at("её") - 0.2, at("её") + 0.3], [0, 1])} /></Cam>;
const PassCan: Shot = ({ T }) => {
  const h = ip(T, [at("просовывает"), at("щель")], [0, 1]);
  const grab = ip(T, [at("банку", 2) + 0.2, at("супа", 2) + 0.4], [0, 1]);
  return <Cam s={1.05} cx={540} cy={600}><GapEye T={T} eye={1} hand={grab > 0.3 ? 1 - grab * 0.8 : h} can={grab > 0.3 ? -grab : 1} /></Cam>;
};
const GapEmpty: Shot = ({ t, T }) => (
  <Cam s={ip(t, [0, 1.8], [1.05, 1.1])} cx={540} cy={600}><GapEye T={T} eye={ip(T, [at("исчезает") - 0.1, at("исчезает") + 0.4], [1, 0])} /></Cam>
);
const StairsDown: Shot = ({ t }) => {
  const fl = t < 0.9 ? 4 : t < 1.8 ? 3 : 2;
  return <g>
    <rect width={W} height={PH} fill="#05060c" />
    {Array.from({ length: 6 }, (_, k) => { const s = Math.pow(0.72, k), w = 900 * s, h = 1000 * s; return <rect key={k} x={540 - w / 2} y={600 - h / 2} width={w} height={h} fill="none" stroke="#2a3460" strokeWidth={60 * s} />; })}
    {Array.from({ length: 10 }, (_, i) => {
      const depth = (t * 0.35 + rnd(i) * 0.6) % 1.2, s = Math.pow(0.72, 1 + depth * 3.5), ang = (i % 4) * Math.PI / 2 + depth * 1.2;
      return <g key={i} transform={`translate(${540 + Math.cos(ang) * 380 * s} ${600 + Math.sin(ang) * 420 * s}) scale(${s})`} opacity={1 - depth / 1.4}>
        <circle r={60} fill="#0a0b14" stroke="#6a78b0" strokeWidth={5} />
      </g>;
    })}
    <Tag x={540} y={215} title={`▼ ${fl} ЭТАЖ`} sub="УХОДЯТ" c={YEL} w={260} />
  </g>;
};
const Sit: Shot = ({ t, T }) => {
  const ex = ip(T, [at("выдыхает"), at("выдыхает") + 1.2], [0, 1]);
  return <Cam s={ip(t, [0, 3], [1.1, 1.2])} cx={520} cy={720}>
    <Interior><DoorIn x={60} y={300} t={T} gapGlow={0.6} /></Interior>
    <Petya x={460} y={1040} s={1.0} pose={pSitFloor(T * 30, { turn: 0.3, light: -1, handL: [95, -150], handR: [125, -140], expr: { eyes: ex > 0 ? "closed" : "open", mouth: ex > 0 ? "o" : "tight" } })} />
    {ex > 0 && ex < 1 ? <g opacity={Math.sin(ex * Math.PI) * 0.5}><ellipse cx={500 + ex * 60} cy={470 - ex * 40} rx={30 + ex * 40} ry={18 + ex * 20} fill="#cfd8f0" /></g> : null}
  </Cam>;
};
const Blackout: Shot = ({ t, T }) => {
  const off = (f: number, c: number) => {
    const k = at("гаснет") + (6 - f) * 0.12 + rnd(f * 5 + c) * 0.15;
    return T < k ? (rnd(f * 7 + c) > 0.45 || (f === 5 && c === 2) ? 0.85 : 0) : 0;
  };
  return <g><NightBg /><Cam s={ip(t, [0, 3.4], [1, 1.06])} cx={540} cy={600}><Facade lit={off} /></Cam>
    <g opacity={ip(T, [at("свет"), at("свет") + 0.4], [0, 1])}><Tag x={540} y={215} title="СВЕТА НЕТ" sub="ВЕСЬ ДОМ" c={RED} w={300} /></g></g>;
};
const Fridge: Shot = ({ t, T }) => {
  const on = T < at("замолкает") + 0.2 ? 1 : 0;
  return <Cam s={ip(t, [0, 2.2], [1.1, 1.2])} cx={540} cy={640}>
    <rect width={W} height={PH} fill="#0c1024" />
    <rect x={360} y={160} width={360} height={900} rx={20} fill="#9aa2b4" stroke={INK} strokeWidth={6} />
    <path d="M 360 470 L 720 470" stroke={INK} strokeWidth={5} />
    <rect x={660} y={220} width={18} height={200} rx={8} fill="#6a7284" /><rect x={660} y={520} width={18} height={260} rx={8} fill="#6a7284" />
    <rect x={420} y={240} width={140} height={60} rx={8} fill="#05070f" />
    {on ? <text x={490} y={282} textAnchor="middle" fontFamily={MONO} fontSize={34} fill="#5fd8f0">+3°</text> : null}
    <rect x={420} y={240} width={140} height={60} rx={8} fill="#5fd8f0" opacity={on * 0.15} />
    <rect width={W} height={PH} fill="#000" opacity={on ? 0.15 : 0.5} />
  </Cam>;
};
const WIN_KNOCK = [at("стучит"), at("стучит") + 0.3, at("стучит") + 0.6];
const WindowKnock: Shot = ({ t, T }) => {
  const hit = WIN_KNOCK.some((k) => T > k && T < k + 0.12);
  const hand = ip(T, [at("кто-то") - 0.3, at("стучит") - 0.1], [0, 1]);
  return <Cam s={ip(t, [0, 2.6], [1, 1.1])} cx={540} cy={600} shake={hit ? 0.3 : 0}>
    <rect width={W} height={PH} fill="#0b0f22" />
    <rect x={300} y={180} width={560} height={640} fill="#33427e" stroke="#05060d" strokeWidth={22} />
    <circle cx={720} cy={300} r={44} fill="#cfd6f2" opacity={0.8} />
    <path d="M 580 180 L 580 820 M 300 500 L 860 500" stroke="#05060d" strokeWidth={16} />
    <clipPath id="winclip"><rect x={311} y={191} width={538} height={618} /></clipPath>
    {hand > 0 ? <g clipPath="url(#winclip)"><g transform={`translate(${640} ${560 + (1 - hand) * 300}) ${hit ? "scale(1.04)" : ""}`} opacity={hand}>
      <path d="M -40 300 L -30 40 Q -40 -40 0 -50 Q 40 -40 30 40 L 40 300 Z" fill="#05060d" />
      {[-24, -8, 8, 24].map((k) => <rect key={k} x={k - 7} y={-90} width={14} height={60} rx={7} fill="#05060d" />)}
    </g></g> : null}
    {hit ? <circle cx={640} cy={500} r={90} fill="none" stroke="#cfd6f2" strokeWidth={3} opacity={0.4} /> : null}
    <polygon points="300,820 860,820 1040,1180 120,1180" fill="#cfd6f2" opacity={0.05} />
    <Petya x={170} y={1300} s={1.6} pose={pStand(T * 30, { turn: 0.6, light: 1, expr: { eyes: "wide", mouth: "o", brows: 1, look: [1, -0.2] } })} />
    <rect width={W} height={PH} fill="#0b1030" opacity={0.25} />
  </Cam>;
};
const Facade5: Shot = ({ t }) => {
  const [hx, hy] = winXY(5, 2);
  return <g><NightBg /><Cam s={ip(t, [0, 2.8], [1.1, 1.45])} cx={hx + 60} cy={hy - 40}>
    <Facade lit={(f, c) => (f === 5 && c === 2 ? 0.25 : 0)} />
    {/* кто-то висит на стене у окна */}
    <g transform={`translate(${hx + 170} ${hy - 50}) scale(1.6)`}>
      <path d="M 0 -40 L -40 -110 M 0 -40 L 40 -120 M 0 30 L -36 100 M 0 30 L 46 90" stroke="#05060d" strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={0} cy={-5} rx={20} ry={44} fill="#05060d" /><circle cx={-6} cy={-62} r={20} fill="#05060d" />
      <circle cx={-12} cy={-64} r={3} fill="#f2f2f2" /><circle cx={0} cy={-64} r={3} fill="#f2f2f2" />
    </g>
    <Brackets x={hx - 12} y={hy - 116} w={144} h={128} c={RED} />
  </Cam><Tag x={540} y={215} title="5 ЭТАЖ · КВ. 12" sub="ПЕТЯ" c={YEL} w={320} /></g>;
};
const EndCard: Shot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="eg2"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#eg2)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill={RED}>КТО ЗА</text>
      <text x={540 - gl} y={690} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill={RED}>ОКНОМ?</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 3</text></g>
  </g>;
};

const b = (w: string, n = 1) => at(w, n) - 0.1;
const CUTS: [Shot, number][] = [
  [Inside, 0], [Knock, b("Снова")], [Face, b("Они")], [Choice, b("Петя", 2)], [Floor, b("Он")], [CanShot, b("Себе")], [Lock, b("И", 1)],
  [NeighborKey, b("Запасной")], [DoorChain, b("Дверь")], [Eye, b("В", 1)], [PassCan, b("Петя", 4)], [GapEmpty, b("Глаз")], [StairsDown, b("Шаги")],
  [Sit, b("Тишина")], [Blackout, b("И", 2)], [Fridge, b("Холодильник")], [WindowKnock, b("А", 2)], [Facade5, b("Петя", 6)], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "ДЕНЬ 4 — 00:42"], [b("И", 1), "ДЕНЬ 4 — 00:47"], [b("Тишина"), "ДЕНЬ 4 — 00:55"], [b("И", 2), "ДЕНЬ 4 — 01:03"]];

// ---------- субтитры ----------
const GROUPS: Wd[][] = (() => {
  const words = WORDS.map((w) => ({ ...w, w: w.w + (w.end ? "." : w.pause ? "," : "") }));
  const gs: Wd[][] = []; let cur: Wd[] = [];
  words.forEach((w) => { cur.push(w); if (w.end || (w.pause && cur.length >= 3) || cur.length >= 8) { gs.push(cur); cur = []; } });
  if (cur.length) gs.push(cur);
  return gs;
})();
const KEY_RED = /^(стук|знаем|имя|заберут|выломают|ключ|поворачивается|глаз|щели|цепочку|бесплатно|исчезает|гаснет|свет|замолкает|стучит|окно|голодных|соседки)/i;
const KEY_YEL = /^(двенадцать|ящик|месяц|доску|полу|банку|супа|третьего|пятом|этаже|тишина|выдыхает|Петя|Пети)/i;
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const gi = GROUPS.findIndex((g, i) => T >= g[0].t - 0.08 && (i === GROUPS.length - 1 || T < GROUPS[i + 1][0].t - 0.08));
  if (gi < 0 || T > VOICE.dur + 0.1) return null;
  const grp = GROUPS[gi], appear = Math.min(1, (T - grp[0].t + 0.08) / 0.12);
  return <div style={{ position: "absolute", top: 1230, left: 50, right: 50, textAlign: "center", fontFamily: "FsMont", fontWeight: 900, fontSize: 78, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: -1, opacity: appear, transform: `scale(${0.94 + 0.06 * appear})` }}>
    {grp.map((w, i) => {
      const said = T >= w.t, now = said && (i === grp.length - 1 || T < grp[i + 1].t);
      const c = KEY_RED.test(w.w) ? RED : KEY_YEL.test(w.w) ? YEL : "#fff";
      const k = Math.min(1, (T - w.t) / 0.1);
      return <span key={i} style={{ color: said ? c : c === "#fff" ? "#6a6a72" : c, opacity: said ? 1 : 0.35, filter: said ? (now && c !== "#fff" ? `drop-shadow(0 0 18px ${c})` : "none") : "blur(2px)", display: "inline-block", marginRight: 26, transform: `translateY(${said ? 0 : 6}px) scale(${now ? 1 + 0.06 * (1 - k) : 1})` }}>{w.w}</span>;
    })}
  </div>;
};
const Clock: React.FC<{ T: number }> = ({ T }) => {
  if (T > VOICE.dur + 0.15) return null;
  const label = [...CLOCK].reverse().find(([a]) => T >= a)![1];
  return <div style={{ position: "absolute", top: 28, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "rgba(40,6,10,0.85)", border: `2px solid ${RED}`, borderRadius: 8, padding: "8px 18px", fontFamily: MONO, fontSize: 30, color: RED, letterSpacing: 3, fontWeight: 700 }}>
      <span style={{ opacity: Math.floor(T * 1.5) % 2 ? 1 : 0.25 }}>●</span> {label}
    </div>
  </div>;
};

export const FoodShort2: React.FC = () => {
  setLang("ru");
  const f = useCurrentFrame(), v = f / FPS, T = storyT(v);
  const ci = CUTS.reduce((acc, [, a], i) => (T >= a ? i : acc), 0);
  const [C, a] = CUTS[ci], next = ci + 1 < CUTS.length ? CUTS[ci + 1][1] : STORY_END, t = T - a;
  const ad1F = S(AD1_T), holdF = S(AD_HOLD);
  return <AbsoluteFill style={{ background: "#000" }}>
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: "absolute", top: 0 }}>
      <defs><linearGradient id="fadeB2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" /></linearGradient>
        <radialGradient id="vig2" cx="50%" cy="45%" r="70%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
      <svg width={W} height={PH} viewBox={`0 0 ${W} ${PH}`} overflow="hidden">
        <g transform={live(T, t / Math.max(0.1, next - a))}><C key={ci} t={t} T={T} /></g>
        <Dust sec={T} />
        <rect width={W} height={PH} fill="url(#vig2)" />
      </svg>
      <rect y={PH - 260} width={W} height={262} fill="url(#fadeB2)" />
      {t >= 0 && t < 4 / FPS ? <rect width={W} height={PH} fill="#000" opacity={1 - t * FPS / 4} /> : null}
    </svg>
    <Clock T={T} />
    <Captions T={T} />
    {/* звук идёт по времени истории: на стоп-кадрах молчит, там играет реклама */}
    <Sequence from={0} durationInFrames={ad1F}><Audio src={staticFile("foodshort2/voice.mp3")} /><Audio src={staticFile("foodshort2/bed.wav")} volume={0.85} /></Sequence>
    <Sequence from={ad1F + holdF} durationInFrames={S(STORY_END) - ad1F}><Audio src={staticFile("foodshort2/voice.mp3")} startFrom={ad1F} /><Audio src={staticFile("foodshort2/bed.wav")} volume={0.85} startFrom={ad1F} /></Sequence>
  </AbsoluteFill>;
};
