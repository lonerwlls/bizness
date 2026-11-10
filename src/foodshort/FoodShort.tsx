// Шортс «The last crate» (≈66 с, 1080×1920): ночная история от «you» про то, как пропала еда.
// Подача: картинка сверху, крупные субтитры с подсветкой слов, красная метка времени, «Part 1» и обрыв в конце.
import React from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { HERO, OL, P, Pose, Toon } from "../brand/corridor/rig";
import { ip, stand, walking } from "../food/common";
import { VOICE } from "./voice";
import { VOICE as VOICE_RU } from "./voice_ru";

const fh = delayRender("font");
new FontFace("FsMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" })
  .load().then((f) => { document.fonts.add(f);
    return new FontFace("FsMont", `url(${staticFile("towers/fonts/Montserrat-cyrillic.woff2")}) format("woff2")`, { weight: "100 900", unicodeRange: "U+0400-04FF" }).load(); })
  .then((f) => { document.fonts.add(f); continueRender(fh); });
// язык ролика: ставится в корневом компоненте до отрисовки сцен (в одном рендере только одна композиция)
let LANG: "en" | "ru" = "en";
const tr = (en: string, ru: string) => (LANG === "ru" ? ru : en);

export const FPS = 30;
export const FS_FRAMES = Math.ceil((VOICE.dur + 1.6) * FPS);
export const FS_FRAMES_RU = Math.ceil((VOICE_RU.dur + 3.8) * FPS);
const W = 1080, PH = 1180; // ширина и высота области картинки
const RED = "#ff3b3b", YEL = "#ffc53a", CYAN = "#5fd8f0", LIT = "#f4b448", WALL = "#1d2752";
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', ui-monospace, monospace";
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const S = (sec: number) => Math.round(sec * FPS);
type Shot = React.FC<{ g: number; t: number }>; // g — кадр сцены, t — секунды сцены

// ---------- общие детали ----------
const Tag: React.FC<{ x: number; y: number; title: string; sub?: string; c?: string; o?: number; w?: number }> = ({ x, y, title, sub, c = CYAN, o = 1, w: w0 = 300 }) => { const w = Math.max(w0, title.length * 20 + 80, (sub ?? "").length * 11.5 + 80); return (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-w / 2} y={-34} width={w} height={sub ? 76 : 60} rx={8} fill="rgba(8,12,30,0.85)" stroke={c} strokeWidth={3} />
    <rect x={-w / 2 + 14} y={-20} width={18} height={18} rx={3} fill="none" stroke={c} strokeWidth={3} />
    <text x={-w / 2 + 44} y={-3} fontFamily="FsMont" fontWeight={900} fontSize={28} fill="#fff">{title}</text>
    {sub ? <text x={-w / 2 + 44} y={28} fontFamily={MONO} fontSize={18} fill={c} letterSpacing={1}>{sub}</text> : null}
  </g>
); };
const Brackets: React.FC<{ x: number; y: number; w: number; h: number; c?: string }> = ({ x, y, w, h, c = YEL }) => {
  const k = 22;
  return <g stroke={c} strokeWidth={5} fill="none" strokeLinecap="round">
    {[[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].map(([a, b, sx, sy], i) => <path key={i} d={`M ${a} ${b + sy * k} L ${a} ${b} L ${a + sx * k} ${b}`} />)}
  </g>;
};
const Shadow: React.FC<{ x: number; y: number; s?: number; eyes?: number; look?: number }> = ({ x, y, s = 1, eyes = 1, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 Q -74 -120 -40 -140 L 40 -140 Q 74 -120 70 0 Z" fill="#05060d" />
    <circle cx={0} cy={-190} r={56} fill="#05060d" />
    {eyes > 0 ? [-1, 1].map((k) => <circle key={k} cx={k * 18 + look * 14} cy={-194} r={6} fill="#f2f2f2" opacity={eyes} />) : null}
  </g>
);
const Crate: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-95} y={-70} width={190} height={140} rx={6} fill="#b57a3e" stroke={OL} strokeWidth={7} />
    {[-36, 0, 36].map((k) => <path key={k} d={`M -95 ${k} L 95 ${k}`} stroke="#8a5628" strokeWidth={5} />)}
    <path d="M -95 -70 L 95 70 M 95 -70 L -95 70" stroke="#8a5628" strokeWidth={6} opacity={0.6} />
    <rect x={-50} y={-20} width={100} height={40} rx={4} fill="#efe2c4" stroke={OL} strokeWidth={4} />
    <text x={0} y={10} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={22} fill="#7a3a1a">{tr("FOOD", "ЕДА")}</text>
  </g>
);
const Hand: React.FC<{ p: P; x: number; y: number; s: number }> = ({ p, x, y, s }) => <circle cx={x + p[0] * s} cy={y + p[1] * s} r={15 * s} fill={HERO.skin} stroke={OL} strokeWidth={6 * s} />;
/** герой несёт ящик: рисуем героя, поверх ящик и кисти */
const Carrier: React.FC<{ x: number; y: number; s: number; pose: Pose; uid: string }> = ({ x, y, s, pose, uid }) => {
  const hy = pose.hip[1] - 70;
  const hl: P = [-92, hy], hr: P = [92, hy];
  const p2 = { ...pose, handL: hl, handR: hr };
  return <g><Toon x={x} y={y} s={s} look={HERO} pose={p2} uid={uid} /><Crate x={x + (pose.dir ?? 0) * 20 * s} y={y + hy * s} s={s * 0.95} /><Hand p={hl} x={x} y={y} s={s} /><Hand p={hr} x={x} y={y} s={s} /></g>;
};
const NightBg: React.FC<{ top?: string; bot?: string }> = ({ top = "#0a0f26", bot = "#1a2350" }) => (
  <g><defs><linearGradient id="nbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs><rect width={W} height={PH} fill="url(#nbg)" /></g>
);
const Cam: React.FC<{ s: number; cx: number; cy: number; children: React.ReactNode; shake?: number }> = ({ s, cx, cy, children, shake = 0 }) => (
  <g transform={`translate(${W / 2 + shake * (rnd(cx + shake * 7) - 0.5) * 30} ${PH / 2 + shake * (rnd(cy + shake * 3) - 0.5) * 30}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);

// ---------- фасад дома ----------
const FLOORS = 6, COLS = 4;
const FX = 150, FW = 780, FB = 1120, FH = 150; // левый край, ширина, низ, высота этажа
const winXY = (floor: number, col: number): [number, number] => [FX + 60 + col * 180, FB - floor * FH - 20];
const Facade: React.FC<{ lit: (f: number, c: number) => number; watchers?: number }> = ({ lit, watchers = 0 }) => (
  <g>
    <rect x={FX} y={FB - (FLOORS + 0.4) * FH} width={FW} height={(FLOORS + 0.4) * FH + 60} fill={WALL} stroke="#0c1130" strokeWidth={6} />
    {Array.from({ length: FLOORS }, (_, fi) => Array.from({ length: COLS }, (_, c) => {
      const f = fi + 1, [x, y] = winXY(f, c), l = lit(f, c);
      return <g key={f + "-" + c}>
        <rect x={x} y={y - 104} width={120} height={104} fill="#0e1430" stroke="#0a0e24" strokeWidth={5} />
        {l > 0 ? <rect x={x} y={y - 104} width={120} height={104} fill={LIT} opacity={l} /> : null}
        {l > 0 && watchers > 0 && !(f === 5 && c === 2) ? <g opacity={Math.min(1, l * watchers)}><Shadow x={x + 60} y={y} s={0.42} eyes={1} look={(2 - c) * 0.3} /></g> : null}
        <path d={`M ${x + 60} ${y - 104} L ${x + 60} ${y}`} stroke="#0a0e24" strokeWidth={4} />
      </g>;
    }))}
  </g>
);
const Building: Shot = ({ g, t }) => {
  const k = ip(g, [0, 160], [1, 1.14]);
  const [hx, hy] = winXY(5, 2);
  const wake = (f: number, c: number) => (f === 5 && c === 2 ? 1 : ip(t, [3.9 + rnd(f * 7 + c) * 1.2, 4.2 + rnd(f * 7 + c) * 1.2], [0, 0.85]));
  return <g>
    <NightBg />
    <circle cx={860} cy={150} r={46} fill="#cfd6f2" opacity={0.85} />
    <Cam s={k} cx={540 + (hx + 60 - 540) * (k - 1) * 3} cy={600}>
      <Facade lit={wake} watchers={ip(t, [4.3, 5], [0, 1])} />
      <g opacity={ip(t, [2, 2.4], [0, 1])}>
        <Brackets x={hx - 12} y={hy - 116} w={144} h={128} />
        <Tag x={hx + 60} y={hy + 70} title={tr("5TH FLOOR", "5 ЭТАЖ")} sub={tr("APT 12 · YOU", "КВ. 12 · ВЫ")} c={YEL} w={260} />
        <Crate x={hx + 60} y={hy - 30} s={0.3} />
      </g>
    </Cam>
    <g transform="translate(540 190)" opacity={ip(t, [0, 0.2, 2.2, 2.6], [0, 1, 1, 0])}>
      <rect x={-140} y={-52} width={280} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">{tr("PART 1", "ЧАСТЬ 1")}</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>{tr("THE LAST CRATE", "ПОСЛЕДНИЙ ЯЩИК")}</text>
    </g>
  </g>;
};

// ---------- комната с телевизором ----------
const Room: React.FC<{ tv: number; children?: React.ReactNode; tvText?: React.ReactNode }> = ({ tv, children, tvText }) => (
  <g>
    <rect width={W} height={PH} fill="#151b3c" />
    <rect x={60} y={170} width={330} height={400} fill="#0b1030" stroke="#0a0d22" strokeWidth={10} />
    {Array.from({ length: 26 }, (_, i) => <rect key={i} x={80 + rnd(i) * 290} y={330 + rnd(i + 40) * 220} width={10} height={14} fill={LIT} opacity={i % 3 ? 0.15 : 0.6} />)}
    <circle cx={300} cy={250} r={30} fill="#cfd6f2" opacity={0.7} />
    <rect y={900} width={W} height={PH - 900} fill="#10152e" />
    <g transform="translate(560 330)">
      <rect width={440} height={270} rx={10} fill="#05070f" stroke="#2a2f48" strokeWidth={8} />
      <rect x={16} y={16} width={408} height={238} fill={tv ? "#cfe6ff" : "#0a0d18"} opacity={tv} />
      {tvText}
      <rect x={200} y={270} width={40} height={50} fill="#2a2f48" /><rect x={130} y={316} width={180} height={14} rx={6} fill="#2a2f48" />
    </g>
    <path d={`M 560 600 L 1000 600 L ${W} 900 L 400 900 Z`} fill="#cfe6ff" opacity={0.06 * tv} />
    {children}
  </g>
);
const News: Shot = ({ g, t }) => {
  const line = t < 1.55 ? [tr("FOOD DELIVERIES", "ПОСТАВКИ ЕДЫ"), tr("SUSPENDED · DAY 3", "ОСТАНОВЛЕНЫ · ДЕНЬ 3")] : t < 2.5 ? [tr("DO NOT", "НЕ ДЕЛАЙТЕ"), tr("HOARD FOOD", "ЗАПАСОВ")] : [tr("KEEP YOUR", "НИКОМУ НЕ"), tr("SUPPLIES PRIVATE", "РАССКАЗЫВАЙТЕ")];
  const flick = 0.85 + 0.15 * Math.sin(g * 1.7) * Math.sin(g * 0.6);
  const pose = stand(g, { turn: 0.55, expr: { mouth: "flat", eyes: "dot", look: [1, 0], browA: -0.3 }, handL: [-50, -150], handR: [60, -150], hipY: -150 });
  return <Cam s={ip(g, [0, 140], [1, 1.08])} cx={600} cy={560}>
    <Room tv={flick} tvText={<g>
      <rect x={16} y={16} width={408} height={50} fill={RED} />
      <text x={36} y={52} fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#fff">{tr("BREAKING", "СРОЧНО")}</text>
      {line.map((l, i) => <text key={l} x={220} y={140 + i * 50} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={Math.min(38, 540 / Math.max(1, l.length))} fill="#0b1030">{l}</text>)}
      <clipPath id="tvclip"><rect x={16} y={16} width={408} height={238} /></clipPath><rect x={16} y={228} width={408} height={26} fill="#0b1030" />
      <text clipPath="url(#tvclip)" x={30 - (g * 4) % 400} y={248} fontFamily={MONO} fontSize={18} fill="#fff">{tr("STAY HOME · STAY CALM · STAY HOME · STAY CALM · STAY HOME", "СОХРАНЯЙТЕ СПОКОЙСТВИЕ · ОСТАВАЙТЕСЬ ДОМА · СОХРАНЯЙТЕ СПОКОЙСТВИЕ")}</text>
    </g>}>
      <path d="M 120 760 Q 120 700 180 700 L 520 700 Q 580 700 580 760 L 580 960 L 120 960 Z" fill="#3a2a4a" stroke="#0a0d22" strokeWidth={8} />
      <Toon x={330} y={1010} s={0.85} look={HERO} pose={pose} uid="news" />
      <path d="M 100 860 L 600 860 L 600 980 L 100 980 Z" fill="#4a3658" stroke="#0a0d22" strokeWidth={8} />
    </Room>
  </Cam>;
};

// ---------- супермаркет внизу ----------
const Market: Shot = ({ g, t }) => {
  const z = ip(t, [0, 3.3, 3.6, 6.2], [1, 1.06, 1.5, 1.6]);
  const cy = ip(t, [3.3, 3.6], [640, 700]);
  const flick = rnd(Math.floor(g / 3)) > 0.3 ? 1 : 0.2;
  return <g>
    <NightBg />
    <Cam s={z} cx={540} cy={cy}>
      <rect x={0} y={200} width={W} height={560} fill={WALL} />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={40 + i * 150} y={230} width={90} height={80} fill={i === 4 ? LIT : "#0e1430"} opacity={i === 4 ? 0.7 : 1} />)}
      <rect x={60} y={380} width={960} height={90} fill="#0a0e24" />
      <text x={540} y={445} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={64} letterSpacing={10} fill="#3a8a5a" opacity={0.35}>{tr("FRESH", "ПРОДУ")}<tspan opacity={flick > 0.5 ? 2.5 : 0.4} fill="#6fe39a">{tr(" M", "К")}</tspan>{tr("ARKET", "ТЫ")}</text>
      <rect x={60} y={490} width={600} height={340} fill="#0c1228" stroke="#05081a" strokeWidth={10} />
      {[560, 640, 720, 800].map((y) => <g key={y}><rect x={90} y={y} width={540} height={8} fill="#3a4470" />
        {y === 720 ? <rect x={480} y={y - 30} width={34} height={30} fill="#c84a3a" /> : null}</g>)}
      <rect x={700} y={490} width={260} height={340} fill="#06091a" stroke="#05081a" strokeWidth={10} />
      <path d="M 780 560 L 830 620 L 800 680 M 830 620 L 900 600 M 830 620 L 870 720" stroke="#9fb0e8" strokeWidth={4} fill="none" opacity={0.8} />
      <rect x={0} y={830} width={W} height={400} fill="#0c1024" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${720 + rnd(i) * 220} 840 l 12 -8 l 10 10 z`} fill="#9fb0e8" opacity={0.6} />)}
      <Tag x={360} y={300} title={tr("GROUND FLOOR", "1 ЭТАЖ · МАГАЗИН")} sub={tr("EMPTY SINCE MONDAY", "ПУСТО С ПОНЕДЕЛЬНИКА")} c={RED} w={330} o={ip(t, [0.4, 0.8], [0, 1])} />
    </Cam>
  </g>;
};

// ---------- подсобка с фонариком ----------
const BackRoom: Shot = ({ g, t }) => {
  const tx = ip(t, [0, 1.2, 2.6, 3.8, 5.0], [300, 520, 380, 700, 820]);
  const ty = ip(t, [0, 1.2, 2.6, 3.8, 5.0], [700, 560, 820, 640, 860]);
  const on = t > 2.25 ? 1 : 0;
  const hand: P = [290, 680];
  const pose = stand(g, { turn: 0.6, handR: [110, -240], handL: [-60, -170], expr: { eyes: "wide", mouth: "flat", look: [1, 0.2] } });
  return <g>
    <defs>
      <radialGradient id="beam"><stop offset="0" stopColor="#000" /><stop offset="0.7" stopColor="#000" stopOpacity={0.9} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
      <mask id="lightM"><rect width={W} height={PH} fill="#fff" />
        {on ? <g><polygon points={`${hand[0]},${hand[1]} ${tx},${ty - 150} ${tx},${ty + 150}`} fill="#000" opacity={0.5} /><circle cx={tx} cy={ty} r={180} fill="url(#beam)" style={{ mixBlendMode: "normal" }} /></g> : null}
        <circle cx={tx} cy={ty} r={on ? 120 : 0} fill="#000" />
      </mask>
    </defs>
    <rect width={W} height={PH} fill="#2a2a3a" />
    {[460, 660].map((y) => <rect key={y} x={250} y={y} width={800} height={14} fill="#4a4a5a" />)}
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={270 + i * 85} y={(i % 2 ? 460 : 660) - 70 - (i % 3) * 10} width={70} height={70 + (i % 3) * 10} fill="#8a6a44" stroke={OL} strokeWidth={4} />)}
    <rect y={960} width={W} height={300} fill="#232332" />
    <Crate x={830} y={900} s={0.65} />
    <rect width={W} height={PH} fill="#03040a" opacity={0.93} mask="url(#lightM)" />
    {on ? <g><polygon points={`${hand[0]},${hand[1]} ${tx},${ty - 150} ${tx},${ty + 150}`} fill="#fff6d0" opacity={0.08} /><circle cx={tx} cy={ty} r={150} fill="#ffd98a" opacity={0.18} /></g> : null}
    <g filter="brightness(0.6)" opacity={0.95}><Toon x={200} y={1000} s={0.75} look={HERO} pose={pose} uid="back" /></g>
    <rect x={270} y={665} width={40} height={20} rx={4} fill="#333" />
    <g opacity={ip(t, [5.0, 5.3], [0, 1])}><Brackets x={720} y={790} w={220} h={170} /></g>
  </g>;
};

// ---------- ящик крупно ----------
const CrateClose: Shot = ({ t }) => {
  const pop = (a: number) => ip(t, [a, a + 0.25], [0, 1]);
  const items: [string, string, string, number, number][] = [[tr("RICE", "РИС"), "#f2ead6", "#3a2a1a", 22.755, -230], [tr("BEANS", "ФАСОЛЬ"), "#c8402a", "#fff", 23.127, 0], [tr("SOUP", "СУП"), "#e8b23a", "#3a1a0a", 23.789, 230]];
  return <g>
    <rect width={W} height={PH} fill="#05060c" />
    <circle cx={540} cy={640} r={520} fill="#2a2418" />
    <circle cx={540} cy={640} r={380} fill="#3a3220" />
    <Crate x={540} y={820} s={2.2} />
    {items.map(([n, c, fg, at, dx], i) => {
      const p = pop(at - 21.978);
      return <g key={n} transform={`translate(${540 + dx} ${600 - p * 160}) scale(${0.4 + p * 0.6})`} opacity={p}>
        {i === 0 ? <path d="M -80 120 Q -95 -40 -60 -100 L 60 -100 Q 95 -40 80 120 Z" fill={c} stroke={OL} strokeWidth={8} />
          : <g><rect x={-75} y={-110} width={150} height={230} rx={14} fill="#b8bcc8" stroke={OL} strokeWidth={8} /><rect x={-75} y={-60} width={150} height={120} fill={c} stroke={OL} strokeWidth={6} /></g>}
        <text x={0} y={18} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill={fg}>{n}</text>
      </g>;
    })}
    <g opacity={ip(t, [2.45, 2.75], [0, 1])}><Tag x={540} y={215} title={tr("30 DAYS OF FOOD", "ЕДА НА 30 ДНЕЙ")} sub={tr("RICE · BEANS · SOUP", "РИС · ФАСОЛЬ · СУП")} c={YEL} w={400} /></g>
  </g>;
};

// ---------- окна лестницы: герой поднимается ----------
const Stairs: Shot = ({ g, t }) => {
  const floor = Math.min(3, 1 + Math.floor(t / 0.62));
  const camY = ip(t, [0, 1.9], [0, 300]);
  return <g>
    <NightBg />
    <g transform={`translate(0 ${camY})`}>
      <rect x={340} y={-400} width={400} height={1700} fill={WALL} />
      {[1, 2, 3, 4].map((f) => {
        const y = 1040 - (f - 1) * 300, on = f === floor;
        return <g key={f}>
          <rect x={430} y={y - 220} width={220} height={210} fill={on ? "#cfe0d8" : "#2a3460"} stroke="#0a0e24" strokeWidth={8} />
          <path d={`M 430 ${y - 20} L 650 ${y - 150}`} stroke="#0a0e24" strokeWidth={6} opacity={0.5} />
          {on ? <g clipPath={`inset(0)`}><Carrier x={540} y={y - 75} s={0.24} pose={walking(g, g * 12, 1)} uid={"st" + f} /></g> : null}
          <rect x={530} y={y - 230} width={20} height={10} fill="#0a0e24" />
        </g>;
      })}
    </g>
    <Tag x={300} y={215} title={tr(`▲ ${floor} FLOOR`, `▲ ${floor} ЭТАЖ`)} sub={tr("STAIRWELL", "ЛЕСТНИЦА")} c={RED} w={260} />
  </g>;
};

// ---------- третий этаж: дверь приоткрывается ----------
const Landing: Shot = ({ g, t }) => {
  const open = ip(t, [1.6, 2.2, 4.4, 4.9], [0, 1, 1, 0]);
  const hx = ip(t, [0, 3.0], [120, 760]), stopped = t > 3.0;
  const pose = stopped ? stand(g, { turn: -0.7, expr: { eyes: "wide", mouth: "o", sweat: true, look: [-1, 0] } }) : walking(g, (hx - 120) / 0.55, 1, { expr: { mouth: "flat" } });
  const eyes = ip(t, [2.0, 2.3], [0, 1]) * (t > 3.0 ? 1 : 0.7);
  return <Cam s={ip(t, [0, 6.8], [1, 1.12])} cx={540} cy={620} shake={t > 4.6 && t < 4.9 ? 0.6 : 0}>
    <rect width={W} height={PH} fill="#20294f" />
    <rect y={0} width={W} height={120} fill="#141b3a" />
    <rect x={120} y={360} width={240} height={480} fill="#05060d" />
    <g transform={`translate(120 360) scale(${1 - open * 0.12} 1)`}><rect width={240} height={480} fill="#5a3a2a" stroke={OL} strokeWidth={8} /><circle cx={210} cy={250} r={12} fill="#d8b04a" /></g>
    {open > 0.1 ? <g opacity={eyes}>{[-1, 1].map((k) => <ellipse key={k} cx={346 + k * 0} cy={500 + k * 22} rx={6} ry={7} fill="#f2f2f2" />)}</g> : null}
    <rect x={190} y={300} width={100} height={46} rx={6} fill="#c8b48a" stroke={OL} strokeWidth={4} /><text x={240} y={334} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#2a1a10">7</text>
    <rect y={840} width={W} height={PH - 840} fill="#151b38" />
    <path d="M 0 840 L 1080 840" stroke="#0a0e24" strokeWidth={8} />
    <circle cx={700} cy={140} r={20} fill="#ffe8a0" /><path d="M 700 120 L 700 0" stroke="#0a0e24" strokeWidth={4} />
    <polygon points="700,150 420,840 980,840" fill="#ffe8a0" opacity={0.07} />
    <Carrier x={hx} y={850} s={0.7} pose={pose} uid="land" />
    <Tag x={300} y={260} title={tr("3RD FLOOR", "3 ЭТАЖ")} sub={tr("APT 7 · AWAKE", "КВ. 7 · НЕ СПЯТ")} c={RED} w={280} o={ip(t, [2.0, 2.4], [0, 1])} />
  </Cam>;
};

// ---------- дверь квартиры 12 и замок ----------
const MyDoor: Shot = ({ t }) => {
  const shut = ip(t, [1.9, 2.4], [0, 1]), bolt = ip(t, [2.2, 2.6], [0, 1]);
  return <g>
    <rect width={W} height={PH} fill="#2a1f2a" />
    <rect x={240} y={140} width={600} height={1000} fill="#4a3426" stroke={OL} strokeWidth={10} />
    <rect x={290} y={190} width={500} height={400} rx={8} fill="none" stroke="#3a2618" strokeWidth={10} />
    <rect x={290} y={650} width={500} height={420} rx={8} fill="none" stroke="#3a2618" strokeWidth={10} />
    <text x={540} y={430} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={170} fill="#d8b04a">12</text>
    <rect x={700} y={560} width={80} height={170} rx={12} fill="#2a2a32" stroke={OL} strokeWidth={6} />
    <rect x={720 + bolt * 80} y={600} width={60} height={22} rx={6} fill="#c8c8d4" stroke={OL} strokeWidth={5} />
    <circle cx={740} cy={680} r={20} fill="#d8b04a" stroke={OL} strokeWidth={5} />
    <path d={`M 690 760 Q ${640 + shut * 40} ${840 - shut * 30} 600 760`} stroke="#b8b8c4" strokeWidth={8} fill="none" />
    <circle cx={540} cy={560} r={22} fill="#05060d" stroke="#c8c8d4" strokeWidth={6} />
    <g opacity={bolt}><Tag x={540} y={1000} title={tr("LOCKED", "ЗАПЕРТО")} sub={tr("5TH FLOOR · APT 12", "5 ЭТАЖ · КВ. 12")} c="#6fe39a" w={300} /></g>
  </g>;
};

// ---------- кухня: одна кастрюля ----------
const Steam: React.FC<{ x: number; y: number; g: number; k?: number; o?: number }> = ({ x, y, g, k = 1, o = 0.5 }) => (
  <g opacity={o}>{[0, 1, 2].map((i) => {
    const ph = (g * 0.02 + i / 3) % 1;
    return <path key={i} d={`M ${x - 30 + i * 30} ${y - ph * 220 * k} q ${18 * Math.sin(g / 9 + i)} -40 0 -80 t 0 -80`} stroke="#e8eef8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={1 - ph} />;
  })}</g>
);
const Stove: React.FC<{ g: number; flame: number; steam: number }> = ({ g, flame, steam }) => (
  <g>
    <rect width={W} height={PH} fill="#1c2346" />
    <rect x={0} y={300} width={W} height={10} fill="#141a38" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={40 + i * 180} y={140} width={150} height={150} fill="#232c58" />)}
    <rect x={480} y={760} width={560} height={420} fill="#d8dce6" stroke={OL} strokeWidth={8} />
    <rect x={480} y={740} width={560} height={40} fill="#b8bcc8" stroke={OL} strokeWidth={8} />
    {[600, 900].map((x, i) => <circle key={x} cx={x} cy={830} r={22} fill="#2a2a32" stroke={OL} strokeWidth={5} />)}
    <g opacity={flame}>{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${700 + i * 15} 740 q 6 ${-20 - 10 * Math.sin(g * 0.8 + i)} 12 0`} fill="#5ab4ff" />)}</g>
    <path d="M 650 740 L 670 640 L 870 640 L 890 740 Z" fill="#8a929e" stroke={OL} strokeWidth={8} />
    <rect x={640} y={624} width={260} height={24} rx={8} fill="#6a727e" stroke={OL} strokeWidth={6} />
    <Steam x={770} y={610} g={g} o={steam} />
    <rect y={1150} width={W} height={60} fill="#10152e" />
  </g>
);
const Kitchen: Shot = ({ g }) => {
  const pose = stand(g, { turn: 0.7, handR: [150, -240 + Math.sin(g / 6) * 18], handL: [-40, -170], expr: { eyes: "happy", mouth: "smile", blush: true } });
  return <Cam s={ip(g, [0, 70], [1.05, 1.15])} cx={600} cy={700}><Stove g={g} flame={1} steam={0.6} /><Toon x={330} y={1160} s={0.95} look={HERO} pose={pose} uid="kit" /></Cam>;
};
const StoveOff: Shot = ({ g, t }) => {
  const pose = stand(g, { turn: 0.7, handR: [190, -100], handL: [-40, -170], expr: { eyes: "wide", mouth: "o", sweat: true, browH: 0.8, look: [-1, 0] } });
  const flame = ip(t, [0.4, 0.7], [1, 0]);
  return <Cam s={1.15} cx={600} cy={760} shake={t > 1.5 ? 0.15 : 0}>
    <Stove g={g} flame={flame} steam={0.7} />
    <Toon x={330} y={1160} s={0.95} look={HERO} pose={pose} uid="off" />
    <g opacity={ip(t, [1.5, 1.7], [0, 1])}><rect width={W * 2} height={PH * 2} fill={RED} opacity={0.12 + 0.08 * Math.sin(g)} /></g>
  </Cam>;
};

// ---------- разрез дома: запах ползёт ----------
const Section: Shot = ({ g, t }) => {
  const rooms: [number, number][] = [];
  for (let f = 1; f <= 5; f++) for (let c = 0; c < 2; c++) rooms.push([f, c]);
  const rx = (c: number) => 120 + c * 430, ry = (f: number) => 1130 - f * 200;
  const spread = ip(t, [0.6, 4.6], [0, 1]);
  return <g>
    <NightBg />
    <rect x={100} y={ry(5) - 20} width={880} height={1030} fill="#0c1130" />
    {rooms.map(([f, c]) => {
      const me = f === 5 && c === 1, x = rx(c), y = ry(f);
      const reached = spread > (5 - f) * 0.2 + c * 0.05;
      return <g key={f + "" + c}>
        <rect x={x} y={y} width={410} height={180} fill={me ? "#3a3220" : "#141a3a"} />
        {me ? <g><rect x={x + 250} y={y + 110} width={110} height={70} fill="#b8bcc8" /><Steam x={x + 305} y={y + 100} g={g} k={0.4} o={0.7} /><circle cx={x + 120} cy={y + 90} r={30} fill={HERO.skin} stroke={OL} strokeWidth={4} /><path d={`M ${x + 90} ${y + 80} Q ${x + 120} ${y + 40} ${x + 150} ${y + 80} Z`} fill="#2f3550" /></g>
          : <g opacity={0.95}><Shadow x={x + 120 + (c ? 100 : 0)} y={y + 180} s={0.62} eyes={reached ? 1 : 0} look={reached ? (c ? 0.5 : 1) : 0} /></g>}
        <text x={x + 14} y={y + 30} fontFamily={MONO} fontSize={20} fill={me ? YEL : "#5a6aa0"}>{f}F</text>
      </g>;
    })}
    {Array.from({ length: 10 }, (_, i) => {
      const p = Math.min(1, Math.max(0, spread * 1.3 - i * 0.05));
      const x0 = rx(1) + 305, y0 = ry(5) + 100, x1 = rx(i % 2) + 200 + rnd(i) * 120, y1 = ry(1 + (i % 5)) + 60;
      return <path key={i} d={`M ${x0} ${y0} Q ${(x0 + x1) / 2 + (rnd(i + 9) - 0.5) * 300} ${(y0 + y1) / 2} ${x1} ${y1}`} stroke="#d8e8c0" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="20 26" strokeDashoffset={-g * 3} opacity={0.35 * p} pathLength={1000} style={{ strokeDasharray: `${p * 1000} 1000` }} />;
    })}
    <Tag x={540} y={215} title={tr("NOBODY HAS EATEN", "НИКТО НЕ ЕЛ")} sub={tr("FOR 48 HOURS", "УЖЕ 48 ЧАСОВ")} c={RED} w={400} o={ip(t, [1.2, 1.6], [0, 1])} />
  </g>;
};

// ---------- телефон: чат дома ----------
const Chat: Shot = ({ g, t }) => {
  const msgs: [number, string, string][] = [[0.6, tr("Apt 3", "Кв. 3"), tr("does anyone smell that??", "чем это пахнет??")], [1.3, tr("Apt 7", "Кв. 7"), tr("soup. someone has SOUP", "суп. у кого-то есть СУП")], [2.5, tr("Apt 9", "Кв. 9"), tr("WHO'S COOKING ON 5?", "КТО ВАРИТ НА 5-М?")]];
  const typing = t > 4.3;
  return <g>
    <rect width={W} height={PH} fill="#0a0d1c" />
    <g transform={`translate(540 640) rotate(${-3 + Math.sin(g / 20)}) scale(${ip(t, [0, 0.4], [0.9, 1])})`}>
      <rect x={-300} y={-560} width={600} height={1120} rx={60} fill="#111" stroke="#333" strokeWidth={10} />
      <rect x={-275} y={-530} width={550} height={1060} rx={40} fill="#13182c" />
      <rect x={-275} y={-530} width={550} height={120} rx={40} fill="#1e2648" />
      <text x={0} y={-468} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#fff">{tr("BUILDING 14 · CHAT", "ДОМ 14 · ЧАТ")}</text>
      <text x={0} y={-432} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#8a9ad0">{tr("38 residents", "38 жильцов")}</text>
      {msgs.map(([at, who, m], i) => {
        const o = ip(t, [at, at + 0.2], [0, 1]), hot = i === 2;
        return <g key={i} opacity={o} transform={`translate(0 ${-330 + i * 170 + (1 - o) * 30})`}>
          <rect x={-250} y={-50} width={hot ? 500 : 440} height={120} rx={26} fill={hot ? "#5a1a22" : "#26304f"} stroke={hot ? RED : "none"} strokeWidth={4} />
          <text x={-224} y={-12} fontFamily={MONO} fontSize={20} fill={hot ? RED : CYAN}>{who}</text>
          <text x={-224} y={34} fontFamily="FsMont" fontWeight={hot ? 900 : 600} fontSize={hot ? 34 : 30} fill="#fff">{m}</text>
        </g>;
      })}
      <g opacity={typing ? 1 : 0}>
        <rect x={-250} y={300} width={500} height={90} rx={26} fill="#26304f" />
        {[0, 1, 2].map((k) => <circle key={k} cx={-200 + k * 34} cy={345} r={10} fill="#fff" opacity={0.3 + 0.7 * Math.max(0, Math.sin(g / 4 - k))} />)}
        <text x={-90} y={356} fontFamily="FsMont" fontWeight={800} fontSize={30} fill={YEL}>{tr("12 people typing…", "12 человек печатают…")}</text>
      </g>
    </g>
    {t < 1.2 ? <g opacity={Math.max(0, Math.sin(g * 1.5))}><path d="M 180 300 l -40 -20 M 180 640 l -50 0 M 180 980 l -40 20 M 900 300 l 40 -20 M 900 640 l 50 0 M 900 980 l 40 20" stroke={YEL} strokeWidth={8} strokeLinecap="round" /></g> : null}
  </g>;
};

// ---------- лестница сверху: идут многие ----------
const Stairwell: Shot = ({ g, t }) => {
  const many = ip(t, [3.0, 3.4], [0, 1]);
  const people = Array.from({ length: 12 }, (_, i) => i);
  return <g>
    <rect width={W} height={PH} fill="#05060c" />
    {Array.from({ length: 6 }, (_, k) => {
      const s = Math.pow(0.72, k), w = 900 * s, h = 1000 * s;
      return <rect key={k} x={540 - w / 2} y={600 - h / 2} width={w} height={h} fill="none" stroke="#2a3460" strokeWidth={60 * s} />;
    })}
    {people.map((i) => {
      if (i >= 3 && many < 1 && i > 2 + many * 9) return null;
      const lane = i % 4, depth = ((t * 0.32 + rnd(i) * 1.0) % 1.2), s = Math.pow(0.72, 4 - depth * 3.5);
      const ang = lane * Math.PI / 2 + depth * 1.2;
      const x = 540 + Math.cos(ang) * 380 * s, y = 600 + Math.sin(ang) * 420 * s;
      return <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={60} fill="#0a0b14" stroke="#6a78b0" strokeWidth={5} />{[-1, 1].map((k) => <circle key={k} cx={k * 18} cy={-6} r={7} fill="#f2f2f2" />)}
        {i % 3 === 0 ? <polygon points={`0,0 ${Math.cos(ang + 3.4) * 400},${Math.sin(ang + 3.4) * 400 - 60} ${Math.cos(ang + 3.4) * 400},${Math.sin(ang + 3.4) * 400 + 60}`} fill="#fff6d0" opacity={0.2} /> : null}
      </g>;
    })}
    <Tag x={540} y={215} title={`▲ ${t < 1.4 ? 3 : t < 2.8 ? 4 : 5} ${tr("FLOOR", "ЭТАЖ")}`} sub={tr("FOOTSTEPS", "ШАГИ")} c={RED} w={260} />
  </g>;
};

// ---------- глазок: они у двери ----------
const Peephole: Shot = ({ g, t }) => {
  const knock = [0.233, 0.583, 0.933].some((k) => t > k && t < k + 0.12);
  return <g>
    <rect width={W} height={PH} fill="#000" />
    <defs><clipPath id="ph"><circle cx={540} cy={620} r={440} /></clipPath>
      <radialGradient id="phv"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.95} /></radialGradient></defs>
    <g clipPath="url(#ph)" transform={knock ? "translate(8 -6)" : ""}>
      <rect width={W} height={PH} fill="#2a2f4a" />
      <ellipse cx={540} cy={620} rx={500} ry={480} fill="#343a5a" />
      <path d="M 100 1060 Q 540 960 980 1060 L 980 1200 L 100 1200 Z" fill="#1a1e30" />
      {[-330, -190, 190, 330, -60, 70].map((dx, i) => <g key={i}><Shadow x={540 + dx * 1.1} y={1100 - Math.abs(dx) * 0.4} s={1.1 - Math.abs(dx) * 0.0012 + (i > 3 ? 0.4 : 0)} eyes={1} look={-dx / 400} /></g>)}
      <g transform={`translate(560 ${knock ? 420 : 470})`}><circle r={60} fill="#05060d" /></g>
      <circle cx={540} cy={620} r={440} fill="url(#phv)" />
    </g>
    <circle cx={540} cy={620} r={440} fill="none" stroke="#111" strokeWidth={30} />
    {knock ? <rect width={W} height={PH} fill="#fff" opacity={0.08} /> : null}
    <g opacity={ip(t, [1.1, 1.3], [0, 1])}><Tag x={540} y={215} title={tr("APT 12", "КВ. 12")} sub={tr("SOMEONE AT THE DOOR", "КТО-ТО ЗА ДВЕРЬЮ")} c={RED} w={340} /></g>
  </g>;
};

// ---------- финал: часть 2 ----------
const EndCard: Shot = ({ g, t }) => {
  const gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="eg"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#eg)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={540} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={104} fill={RED}>{tr("THEY'RE AT", "ОНИ УЖЕ")}</text>
      <text x={540 - gl} y={660} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={104} fill={RED}>{tr("THE DOOR", "ЗА ДВЕРЬЮ")}</text>
      {gl ? <rect x={0} y={560 + gl * 3} width={W} height={10} fill={CYAN} opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}>
      <path d="M 340 740 L 440 740 M 640 740 L 740 740" stroke="#888" strokeWidth={3} />
      <text x={540} y={750} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>{tr("PART 2", "ЧАСТЬ 2")}</text>
    </g>
  </g>;
};

// ---------- монтаж ----------
const CUTS: [Shot, number][] = [
  [Building, 0], [News, 5.45], [Market, 10.15], [BackRoom, 16.35], [CrateClose, 21.95], [Stairs, 25.7], [Landing, 27.6],
  [MyDoor, 34.45], [Kitchen, 37.7], [Section, 40.0], [Chat, 45.5], [StoveOff, 51.5], [Stairwell, 53.88], [Peephole, 57.82], [EndCard, 61.4],
];
const CLOCK: [number, string][] = [[0, "3 — 23:41"], [16.35, "4 — 00:04"], [27.6, "4 — 00:19"], [37.7, "4 — 00:37"], [53.88, "4 — 00:41"]];

// ---------- субтитры ----------
type Wd = { t: number; e: number; w: string; end: boolean; pause: boolean };
const mkWords = (src: Wd[]): Wd[] => {
  const out: Wd[] = [];
  for (const w of src) {
    const prev = out[out.length - 1];
    if (prev && /^(t|s|re|ll|d)$/i.test(w.w)) { prev.w += "'" + w.w; prev.e = w.e; prev.end = w.end; prev.pause = w.pause; continue; }
    out.push({ ...w });
  }
  return out.map((w) => ({ ...w, w: w.w + (w.end ? (/^(five|пятом)$/i.test(w.w) ? "?" : ".") : w.pause ? "," : "") }));
};
const mkGroups = (words: Wd[]): Wd[][] => {
  const gs: Wd[][] = []; let cur: Wd[] = [];
  words.forEach((w) => { cur.push(w); if (w.end || (w.pause && cur.length >= 3) || cur.length >= 8) { gs.push(cur); cur = []; } });
  if (cur.length) gs.push(cur);
  // короткие хвосты (1 слово после точки) склеиваем с предыдущей группой, если там ≤ 3 слов
  const m: Wd[][] = [];
  gs.forEach((g) => { const p = m[m.length - 1]; if (p && g.length === 1 && p.length <= 3 && g[0].t - p[p.length - 1].e < 0.9) p.push(...g); else m.push(g); });
  return m;
};
const GROUPS = { en: mkGroups(mkWords(VOICE.words as Wd[])), ru: mkGroups(mkWords(VOICE_RU.words as Wd[])) };
const KEY_RED = /^(knows|mistake|late|many|knock|food|door|sees|crack|hoard|anyone|open|broken|stairs|nobody|typing|smell|travels|empty|знает|ошибка|поздно|много|стук|еда|еду|дверь|видит|приоткрывается|разбитая|запасов|никому|никто|запах|расходится|печатают|пустой|откройте|шаги|лестнице)/i;
const KEY_YEL = /^(crate|rice|beans|soup|month|twelve|fifth|five|third|flashlight|midnight|cook|pot|chat|phone|follow|two|tomorrow|ящик|рис|фасоль|суп|месяц|двенадцать|пятый|пятом|третьем|фонариком|полночь|варите|кастрюлю|чат|телефон|подпишитесь|вторая|завтра|нашли|два)/i;
const Captions: React.FC<{ sec: number }> = ({ sec }) => {
  const G = GROUPS[LANG], dur = (LANG === "ru" ? VOICE_RU : VOICE).dur;
  const gi = G.findIndex((g, i) => sec >= g[0].t - 0.08 && (i === G.length - 1 || sec < G[i + 1][0].t - 0.08));
  if (gi < 0 || sec > dur + 0.4) return null;
  const grp = G[gi], appear = Math.min(1, (sec - grp[0].t + 0.08) / 0.12);
  return <div style={{ position: "absolute", top: 1230, left: 50, right: 50, textAlign: "center", fontFamily: "FsMont", fontWeight: 900, fontSize: LANG === "ru" ? 78 : 84, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: -1, opacity: appear, transform: `scale(${0.94 + 0.06 * appear})` }}>
    {grp.map((w, i) => {
      const said = sec >= w.t, now = said && (i === grp.length - 1 || sec < grp[i + 1].t);
      const c = KEY_RED.test(w.w) ? RED : KEY_YEL.test(w.w) ? YEL : "#fff";
      const k = Math.min(1, (sec - w.t) / 0.1);
      return <span key={i} style={{ color: said ? c : c === "#fff" ? "#6a6a72" : c, opacity: said ? 1 : 0.35, filter: said ? (now && c !== "#fff" ? `drop-shadow(0 0 18px ${c})` : "none") : "blur(2px)", display: "inline-block", marginRight: 26, transform: `translateY(${said ? 0 : 6}px) scale(${now ? 1 + 0.06 * (1 - k) : 1})` }}>{w.w}</span>;
    })}
  </div>;
};

const Clock: React.FC<{ sec: number }> = ({ sec }) => {
  const label = [...CLOCK].reverse().find(([a]) => sec >= a)![1];
  if (sec > 61.4) return null;
  return <div style={{ position: "absolute", top: 28, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "rgba(40,6,10,0.85)", border: `2px solid ${RED}`, borderRadius: 8, padding: "8px 18px", fontFamily: MONO, fontSize: 30, color: RED, letterSpacing: 3, fontWeight: 700 }}>
      <span style={{ opacity: Math.floor(sec * 1.5) % 2 ? 1 : 0.25 }}>●</span> {tr("DAY", "ДЕНЬ")} {label}
    </div>
  </div>;
};

// Русская озвучка идёт в другом темпе: время картинки берём из английского монтажа через пары «англ. слово ↔ рус. слово».
// [время в английском ролике, время в русском]
export const WARP_RU: [number, number][] = [
  [0, 0], [3.889, 4.857], [5.45, 6.862], [7.012, 8.628], [7.964, 10.217], [10.15, 13.165], [13.514, 16.03], [14.826, 17.77], [16.35, 19.79], [18.634, 21.234], [21.42, 24.326], [21.95, 25.639], [22.755, 27.036], [23.127, 27.889], [23.789, 29.02], [24.45, 30.216], [25.7, 32.138], [27.6, 34.261], [29.408, 35.263], [31.033, 37.429], [32.531, 39.274], [33.355, 40.6], [34.45, 41.818], [36.826, 44.504], [37.7, 45.863], [40, 49.622], [44.222, 53.023], [45.5, 55.159], [48.042, 59.042], [49.818, 60.635], [51.5, 63.186], [51.943, 63.603], [53.023, 64.962], [53.88, 66.428], [56.982, 70.125], [57.82, 71.362], [58.05, 71.592], [58.909, 72.895], [61.4, 75.574], [66.3, 79.451],
];
const warp = (x: number, pairs: [number, number][], from: 0 | 1) => {
  const to = 1 - from;
  for (let i = 1; i < pairs.length; i++) if (x <= pairs[i][from]) {
    const a = pairs[i - 1], b = pairs[i], k = (x - a[from]) / (b[from] - a[from]);
    return a[to] + (b[to] - a[to]) * Math.max(0, k);
  }
  const l = pairs[pairs.length - 1]; return l[to] + (x - l[from]);
};

// Камера никогда не стоит: медленный наезд за сцену + лёгкое «дыхание» (по реальному времени), чтобы не было застывших кадров.
const live = (sec: number, prog: number) => {
  const k = 1.03 + 0.06 * prog + 0.01 * Math.sin(sec * 0.9);
  const dx = 7 * Math.sin(sec * 0.71) + 4 * Math.sin(sec * 1.9), dy = 6 * Math.cos(sec * 0.53) + 3 * Math.sin(sec * 1.4);
  return `translate(${W / 2 + dx} ${PH / 2 + dy}) rotate(${0.35 * Math.sin(sec * 0.6)}) scale(${k}) translate(${-W / 2} ${-PH / 2})`;
};
/** пылинки в луче света и мерцание — фон всегда живой */
const Dust: React.FC<{ sec: number }> = ({ sec }) => (
  <g>
    {Array.from({ length: 34 }, (_, i) => {
      const sp = 8 + rnd(i + 3) * 22, x = (rnd(i) * W + sec * sp * (rnd(i + 9) > 0.5 ? 1 : -1) + 2000) % W;
      const y = (rnd(i + 21) * PH - sec * (6 + rnd(i + 5) * 14) + 3000) % PH;
      return <circle key={i} cx={x + 10 * Math.sin(sec * 0.8 + i)} cy={y} r={1.5 + rnd(i + 7) * 2.5} fill="#fff" opacity={0.08 + 0.12 * (0.5 + 0.5 * Math.sin(sec * 1.3 + i * 1.7))} />;
    })}
    <rect width={W} height={PH} fill="#000" opacity={0.035 + 0.035 * Math.abs(Math.sin(sec * 7.3) * Math.sin(sec * 3.1))} />
  </g>
);
export const FoodShort: React.FC<{ lang?: "en" | "ru" }> = ({ lang = "en" }) => {
  LANG = lang;
  const f = useCurrentFrame(), sec = f / FPS;
  const vsec = lang === "ru" ? warp(sec, WARP_RU, 1) : sec, vf = Math.round(vsec * FPS);
  const ci = CUTS.reduce((acc, [, a], i) => (vf >= S(a) ? i : acc), 0);
  const [C, a] = CUTS[ci], g = vf - S(a);
  const nextF = ci + 1 < CUTS.length ? S(CUTS[ci + 1][1]) : S(66.3);
  return <AbsoluteFill style={{ background: "#000" }}>
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: "absolute", top: 0 }}>
      <defs><linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" /></linearGradient>
        <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
      <svg width={W} height={PH} viewBox={`0 0 ${W} ${PH}`} overflow="hidden">
        <g transform={live(sec, g / Math.max(1, nextF - S(a)))}><C key={ci} g={g} t={g / FPS} /></g>
        <Dust sec={sec} />
        <rect width={W} height={PH} fill="url(#vig)" />
      </svg>
      <rect y={PH - 260} width={W} height={262} fill="url(#fadeB)" />
      {/* мигание на склейках */}
      {g >= 0 && g < 4 ? <rect width={W} height={PH} fill="#000" opacity={1 - g / 4} /> : null}
    </svg>
    <Clock sec={vsec} />
    <Captions sec={sec} />
    <Audio src={staticFile(lang === "ru" ? "foodshort_ru_george/voice.mp3" : "foodshort/voice.mp3")} />
    <Audio src={staticFile(lang === "ru" ? "foodshort_ru/bed.wav" : "foodshort/sfx.wav")} volume={lang === "ru" ? 0.85 : 0.55} />
  </AbsoluteFill>;
};
