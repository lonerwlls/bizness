// История «Ты уже дома», часть 1 (формат образца «Брат вернулся из армии»): рассказ от «ты», признаки со счётчиком,
// правила, общий секрет, выбор зрителю. Без субтитров; голоса по ролям (рассказчик шёпотом, мама, Петя, двойник).
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, W, rnd } from "../foodshort/FoodShort";
import { Petya, PLook, pStand } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX } from "./lift1";
import { Chat, PhoneBody } from "./phone1";
import { Hall } from "./phone2";
import { VOICE as V } from "./home1.voice";

const VOICE = V as Voice;
const ROLEW = (V as { words: { t: number; e: number; r?: string }[] }).words;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_H1 = wd("комнате").e + 0.4;
export const TM_H1 = timing(VOICE, AD1_H1, AD_LEN_VX, false);
const pk = (T: number, w: string, n = 1, d = 0.45) => ip(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1]);
const mix = (a: number, c: number, k: number) => a + (c - a) * k;
// говорит ли сейчас роль (рот открывается по слогам)
const talking = (T: number, role: string) => ROLEW.some((w) => w.r === role && T >= w.t - 0.03 && T <= w.e + 0.03);
const mouth = (T: number, role: string, idle: "flat" | "tight" | "smile" | "o" = "flat") => (talking(T, role) ? (Math.floor(T * 9) % 2 ? "open" : "flat") : idle);
const MOM: PLook = { top: "#7a4a6a", topSh: "#5a3450", hair: "#6a4028", hairSh: "#4a2a18", pants: "#3a3046", pantsSh: "#2a2234", skin: "#e8bfa4", skinSh: "#be9078", shoe: "#5a3a3a" };
// причёска мамы: пучок и пряди поверх головы рига
const MomHair: React.FC<{ x: number; y: number; s: number; turn?: number }> = ({ x, y, s, turn = 0 }) => {
  const hx = x + turn * 4 * s, hy = y - 528 * s;
  return <g transform={`translate(${hx} ${hy}) scale(${s})`}>
    <circle cx={-turn * 26} cy={-58} r={22} fill={MOM.hair} stroke={INK} strokeWidth={3} />
    <path d="M -36 -4 Q -40 -64 0 -66 Q 40 -64 36 -4 Q 30 -40 0 -44 Q -30 -40 -36 -4 Z" fill={MOM.hair} stroke={INK} strokeWidth={3} />
  </g>;
};

// счётчик признаков (как «ОН ИЛИ НЕ ОН 3/6» в образце)
const SIGNS = [at("Признак", 1), at("Признак", 2), at("Признак", 3)];
const signsAt = (T: number) => SIGNS.filter((a) => T >= a + 0.3).length;
const SignPlate: React.FC<{ n: number; text: string; k: number; y?: number }> = ({ n, text, k, y = 1070 }) => k <= 0 ? null : (
  <g transform={`translate(540 ${y}) scale(${0.9 + 0.1 * Math.min(1, k * 3)})`} opacity={Math.min(1, k * 4)}>
    <rect x={-330} y={-70} width={660} height={140} rx={14} fill="#120a0e" stroke={RED} strokeWidth={5} />
    <text x={-300} y={-22} fontFamily="FsMont" fontWeight={800} fontSize={26} fill={RED} letterSpacing={3}>ПРИЗНАК №{n}</text>
    <text x={-300} y={36} fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#fff">{text}</text>
    <circle cx={290} cy={-20} r={26} fill={RED} /><path d="M 278 -32 L 302 -8 M 302 -32 L 278 -8" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
  </g>
);
const RulePlate: React.FC<{ n: number; text: string; k: number; y?: number }> = ({ n, text, k, y = 70 }) => k <= 0 ? null : (
  <g transform={`translate(540 ${y})`} opacity={Math.min(1, k * 4)}>
    <rect x={-150} y={-44} width={300} height={70} rx={10} fill="#0e0e14" stroke="#fff" strokeWidth={3} />
    <text x={0} y={4} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#fff">ПРАВИЛО {n}</text>
    <text x={0} y={84} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={42} fill={RED} stroke="#000" strokeWidth={6} paintOrder="stroke">{text}</text>
  </g>
);

// кухня (мама в дверях кухни, свет тёплый)
const Kitchen: React.FC<{ T: number; children?: React.ReactNode }> = ({ T, children }) => <g>
  <rect width={W} height={PH} fill="#3a3028" />
  <rect x={0} y={0} width={W} height={900} fill="#4a3c30" />
  {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 100} y={0} width={44} height={900} fill="#463828" />)}
  <rect y={900} width={W} height={PH - 900} fill="#2e2620" />
  <rect x={560} y={220} width={380} height={680} fill="#f2c27a" stroke={INK} strokeWidth={8} />
  <rect x={600} y={260} width={300} height={260} fill="#ffe2a8" /><rect x={620} y={600} width={260} height={120} fill="#c88a4a" stroke={INK} strokeWidth={4} />
  <circle cx={750} cy={300} r={40} fill="#fff8d8" opacity={0.8 + 0.1 * Math.sin(T * 3)} />
  <polygon points="560,900 940,900 1080,1180 420,1180" fill="#ffd88a" opacity={0.12} />
  {children}
</g>;
// дверь комнаты Пети крупно: свет из-под двери и ноты
const RoomDoor: React.FC<{ T: number; notes?: number; open?: number; children?: React.ReactNode }> = ({ T, notes = 0, open = 0, children }) => <g>
  <rect width={W} height={PH} fill="#20263a" />
  {Array.from({ length: 11 }, (_, i) => <rect key={i} x={i * 100} y={0} width={46} height={900} fill="#1c2234" />)}
  <rect y={900} width={W} height={PH - 900} fill="#2a2420" />
  <rect x={300} y={160} width={480} height={740} fill="#ffcf8a" stroke={INK} strokeWidth={10} />
  {children}
  <polygon points={`300,160 ${300 + 480 * (1 - open * 0.8)},${160 - 40 * open} ${300 + 480 * (1 - open * 0.8)},${900 + 40 * open} 300,900`} fill="#4a3a30" stroke={INK} strokeWidth={8} />
  <circle cx={300 + 440 * (1 - open * 0.8)} cy={540} r={14} fill="#b89a50" stroke={INK} strokeWidth={4} />
  <rect x={300} y={890} width={480} height={12} fill="#ffd88a" opacity={1 - open} />
  <polygon points="300,902 780,902 900,1000 180,1000" fill="#ffd88a" opacity={0.15} />
  {notes > 0 ? Array.from({ length: 6 }, (_, i) => { const ph = (T * 0.6 + i / 6) % 1; return <text key={i} x={360 + rnd(i) * 360 + Math.sin(T * 2 + i) * 30} y={880 - ph * 500} fontSize={60} fill="#ffd88a" opacity={notes * (1 - ph)}>{i % 2 ? "♪" : "♫"}</text>; }) : null}
</g>;

// ---------- сцены ----------
const Hook: SShot = ({ t, T }) => {
  const k = pk(T, "кроссовки", 1, 0.5), kk = pk(T, "тебе", 1, 0.4);
  return <Cam s={mix(mix(1.1, 2.4, k), 2.0, kk)} cx={mix(mix(540, 360, k), 470, kk)} cy={mix(mix(620, 960, k), 900, kk)}>
    <Hall T={T} gap={0.25} />
    <rect x={0} y={0} width={W} height={PH} fill="#000" opacity={0.2} />
    {/* такие же кроссовки на полу у двери */}
    {[0, 1].map((i) => <g key={i} transform={`translate(${300 + i * 70} 1000)`}><path d="M -40 -4 Q -42 -30 -6 -32 L 20 -24 Q 50 -18 52 -4 Z" fill="#5a5f6a" stroke={INK} strokeWidth={4} /><rect x={-42} y={-6} width={96} height={10} rx={3} fill="#d8d8d4" stroke={INK} strokeWidth={3} /></g>)}
    <Petya x={560} y={1060} s={1.05} pose={pStand(T * 30, { turn: -0.5, tilt: 14, expr: { eyes: T > at("тебе") ? "wide" : "open", brows: T > at("тебе") ? 1.2 : 0.2, mouth: T > at("тебе") ? "o" : "flat", look: [-0.8, 1] } })} />
    {kk > 0 ? <g opacity={kk}><Brackets x={230} y={950} w={240} h={80} c={RED} /><Brackets x={500} y={1010} w={140} h={70} c={YEL} /></g> : null}
    <g transform="translate(720 160) rotate(4)" opacity={ip(t, [0.1, 0.3, 2.4, 2.8], [0, 1, 1, 0])}>
      <rect x={-150} y={-40} width={300} height={80} rx={6} fill="#f1e2b8" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#2a1a10">ТЫ УЖЕ ДОМА</text>
      <text x={0} y={28} textAnchor="middle" fontFamily={MONO} fontSize={16} fill="#6a4a2a" letterSpacing={3}>ЧАСТЬ 1</text>
    </g>
  </Cam>;
};
const Mom: SShot = ({ t, T }) => {
  const k = pk(T, "Поужинал", 1, 0.5);
  return <Cam s={mix(ip(t, [0, 2], [1.2, 1.3]), 2.1, k)} cx={mix(700, 760, k)} cy={mix(640, 470, k)}>
    <Kitchen T={T}>
      <Petya x={760} y={980} s={1.05} look={MOM} pose={pStand(T * 30, { turn: -0.3, handL: [-70, -300], handR: [60, -330], expr: { eyes: "open", brows: 0.4, mouth: mouth(T, "мама", "smile"), look: [-0.6, 0] } })} />
      <MomHair x={760} y={980} s={1.05} turn={-0.3} />
    </Kitchen>
    <g opacity={ip(t, [0.2, 0.5], [0, 1])}><rect x={640} y={240} width={240} height={56} rx={8} fill="#0e0e14" /><text x={760} y={279} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#fff">МАМА</text></g>
  </Cam>;
};
const Sign1: SShot = ({ t, T }) => <>
  <Cam s={mix(ip(t, [0, 2.4], [1.0, 1.08]), 1.4, pk(T, "музыка", 1, 0.5))} cx={540} cy={mix(560, 700, pk(T, "музыка", 1, 0.5))}>
    <RoomDoor T={T} notes={ip(T, [at("играет"), at("играет") + 0.4], [0, 1])} />
  </Cam>
  <SignPlate n={1} text="МУЗЫКА ИЗ ТВОЕЙ КОМНАТЫ" k={T - at("музыка")} />
</>;
const Rule1: SShot = ({ t, T }) => <>
  <Cam s={ip(t, [0, 2.4], [1.6, 1.75])} cx={540} cy={560}>
    <RoomDoor T={T} notes={0.6} />
    <g transform={`translate(${760 + 30 * Math.sin(T * 2)} 600)`}><rect x={-60} y={-40} width={260} height={110} rx={50} fill="#e3b496" stroke={INK} strokeWidth={6} /><rect x={150} y={-60} width={200} height={150} fill="#434a5a" stroke={INK} strokeWidth={6} /></g>
    <rect width={W} height={PH} fill="#000" opacity={0.35} />
  </Cam>
  <RulePlate n={1} text="НЕ ЗАХОДИ ОДИН" k={T - at("Правило", 1)} />
</>;
const Sign2: SShot = ({ t, T }) => {
  const show = T > at("Ваш") - 0.3;
  return <><Cam s={ip(t, [0, 3.4], [1.0, 1.08])} cx={540} cy={560} shake={t < 0.4 ? 0.15 : 0}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody buzz={t < 0.4 ? 1 : 0}><g>
      <rect x={-222} y={-442} width={444} height={884} fill="#101426" />
      <text x={0} y={-300} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill="#fff">21:42</text>
      {show ? <g transform="translate(0 -120)">
        <rect x={-200} y={-80} width={400} height={230} rx={24} fill="#1e2440" stroke="#4a5070" strokeWidth={2} />
        <text x={-170} y={-36} fontFamily="FsMont" fontWeight={900} fontSize={26} fill="#9fb4ff">⚠ ВХОД В АККАУНТ</text>
        <text x={-170} y={14} fontFamily="FsMont" fontWeight={800} fontSize={28} fill="#fff">Новое устройство</text>
        <text x={-170} y={60} fontFamily="FsMont" fontWeight={800} fontSize={28} fill="#fff">«iPhone Пети»</text>
        <text x={-170} y={110} fontFamily="FsMont" fontWeight={900} fontSize={28} fill={RED}>Рядом с вами · 5 м</text>
      </g> : null}
    </g></PhoneBody>
  </Cam>
    <SignPlate n={2} text="ТВОЙ АККАУНТ — В 5 МЕТРАХ" k={T - at("вами")} />
  </>;
};
const Whisper: SShot = ({ t, T }) => <Cam s={mix(ip(t, [0, 2], [1.3, 1.4]), 2.0, pk(T, "Кто", 1, 0.5))} cx={mix(640, 560, pk(T, "Кто", 1, 0.5))} cy={mix(600, 460, pk(T, "Кто", 1, 0.5))}>
  <Kitchen T={T}>
    <Petya x={760} y={980} s={1.05} look={MOM} pose={pStand(T * 30, { turn: -0.4, handL: [-70, -300], expr: { eyes: "wide", brows: 1, mouth: "o", look: [-1, 0] } })} />
    <MomHair x={760} y={980} s={1.05} turn={-0.4} />
    <Petya x={520} y={1010} s={1.08} pose={pStand(T * 30, { turn: 0.6, lean: 6, handR: [60, -420], expr: { eyes: "wide", brows: 1.2, mouth: mouth(T, "петя", "tight"), look: [1, 0] } })} />
  </Kitchen>
</Cam>;
const Rule2: SShot = ({ t, T }) => {
  const chat = T > at("Как") - 0.4;
  return <><Cam s={ip(t, [0, 5], [1.0, 1.08])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    {!chat ? <g transform="translate(540 600) rotate(-4)">
      <rect x={-330} y={-380} width={660} height={700} fill="#efe6cc" />
      <rect x={-290} y={-340} width={580} height={500} fill="#6a8aa8" />
      <Petya x={-60} y={150} s={0.62} pose={pStand(0, { turn: 0.3, handR: [60, -300], expr: { mouth: "smile", eyes: "squint" } })} />
      <Petya x={130} y={150} s={0.82} look={MOM} pose={pStand(0, { turn: -0.3, handL: [-60, -300], expr: { mouth: "smile" } })} />
      <MomHair x={130} y={150} s={0.82} turn={-0.3} />
      <ellipse cx={-25} cy={-90} rx={34} ry={24} fill="#e0b070" stroke={INK} strokeWidth={4} />
      <text x={-260} y={240} fontFamily="Hand, cursive" fontSize={56} fill="#2a2a4a">2012 · Шарик</text>
    </g> : <PhoneBody><Chat title="ПЕТЯ" sub="печатает…" msgs={[{ text: "Как звали нашего первого хомяка?", at: at("Как"), me: true }]} T={T} /></PhoneBody>}
  </Cam>
    <RulePlate n={2} text="СПРОСИ ОБЩИЙ СЕКРЕТ" k={T - at("Правило", 2)} />
  </>;
};
const Answer: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2.2], [1.05, 1.15])} cx={540} cy={560} shake={t < 0.3 ? 0.15 : 0}>
  <rect width={W} height={PH} fill="#0a0d1a" />
  <PhoneBody buzz={t < 0.3 ? 1 : 0}><Chat title="ПЕТЯ" sub="это ты" msgs={[{ text: "Как звали нашего первого хомяка?", at: 0, me: true }, { text: "Шарик. Ты что, забыл?", at: at("Шарик") - 0.1 }]} T={T} /></PhoneBody>
</Cam>;
const Sign3: SShot = ({ t, T }) => <>
  <Cam s={mix(2.0, 2.6, ip(t, [0, 3.4], [0, 1]))} cx={540} cy={470}>
    <Hall T={T} gap={0.25} />
    <Petya x={540} y={1060} s={1.05} pose={pStand(T * 30, { turn: 0.1, tilt: -8, handR: [40, -400], expr: { eyes: "squint", brows: -0.8, mouth: "tight", look: [0.2, -0.6] } })} />
    <g transform="translate(640 330)" opacity={ip(t, [0.2, 0.5], [0, 1])}>
      <path d="M -100 30 Q -120 -40 -40 -50 Q 0 -100 60 -60 Q 130 -60 110 10 Q 130 70 50 70 Q 0 100 -50 70 Q -130 80 -100 30 Z" fill="#e8e8f0" stroke={INK} strokeWidth={5} />
      <text x={5} y={36} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={90} fill={RED}>?</text>
    </g>
  </Cam>
  <SignPlate n={3} text="ОН ПОМНИТ. ТЫ — НЕТ" k={T - at("Признак", 3) - 0.3} />
</>;
const Double: SShot = ({ t, T }) => {
  const open = ip(t, [0, 0.8], [0, 1]);
  return <Cam s={mix(ip(t, [0, 3], [1.1, 1.2]), 1.9, pk(T, "Это", 1, 0.5))} cx={540} cy={mix(600, 430, pk(T, "Это", 1, 0.5))}>
    <RoomDoor T={T} open={open}>
      <Petya x={500} y={900} s={1.1} pose={pStand(T * 30, { turn: 0.15, handL: [-80, -330], expr: { eyes: "open", blink: 0, brows: 0.2, mouth: mouth(T, "двойник", "smile"), look: [0.3, 0] } })} />
    </RoomDoor>
    <rect width={W} height={PH} fill="#000" opacity={0.15} />
  </Cam>;
};
const Choice: SShot = ({ t, T }) => {
  const opt = T > at("сделаешь") - 0.2;
  return <><Cam s={ip(t, [0, 4], [1.0, 1.08])} cx={540} cy={600}>
    <Hall T={T} gap={0.6} />
    <Petya x={260} y={1060} s={1.0} pose={pStand(T * 30, { turn: 0.6, expr: { eyes: "wide", brows: 1.2, mouth: "o", look: [1, 0] } })} />
    <Petya x={820} y={1060} s={1.0} pose={pStand(T * 30 + 9, { turn: -0.6, expr: { eyes: "open", blink: 0, mouth: "smile", look: [-1, 0] } })} />
    <Petya x={540} y={1090} s={1.05} look={MOM} pose={pStand(T * 30, { turn: Math.sin(T * 2.4) * 0.8, expr: { eyes: "wide", brows: 1, mouth: "tight", look: [Math.sin(T * 2.4), 0] } })} />
    <MomHair x={540} y={1090} s={1.05} turn={Math.sin(T * 2.4) * 0.8} />
    {[260, 820].map((x, i) => <g key={i} transform={`translate(${x} 330)`} opacity={ip(t, [0.3, 0.6], [0, 1])}><circle r={36} fill={i ? RED : YEL} /><text y={14} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill={INK}>{i ? "?" : "ТЫ"}</text></g>)}
  </Cam>
    {opt ? <g transform="translate(540 190)">
      <rect x={-380} y={-46} width={310} height={92} rx={14} fill="#0e0e14" stroke={YEL} strokeWidth={4} /><text x={-225} y={12} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={32} fill="#fff">ЗАЙТИ К НЕМУ</text>
      <text x={0} y={14} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={32} fill="#aaa">или</text>
      <rect x={70} y={-46} width={310} height={92} rx={14} fill="#0e0e14" stroke={RED} strokeWidth={4} /><text x={225} y={12} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={32} fill="#fff">УЙТИ ИЗ ДОМА</text>
    </g> : null}
  </>;
};
const EndCard: SShot = ({ t }) => <g>
  <defs><radialGradient id="egh1"><stop offset="0" stopColor="#2a1a30" /><stop offset="1" stopColor="#05040a" /></radialGradient></defs>
  <rect x={-200} y={-200} width={W + 400} height={PH + 400} fill="url(#egh1)" />
  <g opacity={ip(t, [0, 0.4], [0, 1])}>
    <text x={540} y={520} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={78} fill="#fff">ТЫ УЖЕ ДОМА</text>
    <text x={540} y={600} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={40} fill="#ff8a9a" letterSpacing={4}>ЧАСТЬ 2 — СКОРО</text>
  </g>
  <g opacity={ip(t, [0.6, 1.0], [0, 1])}>
    <text x={540} y={720} textAnchor="middle" fontFamily="FsMont" fontWeight={800} fontSize={42} fill="#fff">Что бы ты сделал?</text>
    <rect x={380} y={770} width={320} height={80} rx={40} fill="#e03030" /><text x={540} y={822} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={34} fill="#fff">ПОДПИСАТЬСЯ</text>
  </g>
</g>;

const CUTS: [SShot, number][] = [
  [Hook, 0], [Mom, b("Петя")], [Sign1, b("Признак", 1)], [Rule1, b("Правило", 1)], [Sign2, b("Признак", 2)], [Whisper, b("Мам", 1)],
  [Rule2, b("Правило", 2)], [Answer, b("Шарик")], [Sign3, b("Признак", 3)], [Double, b("Мам", 2)], [Choice, b("Кому")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "21:40"]];
const Hud: React.FC<{ T: number }> = ({ T }) => {
  if (T > VOICE.dur + 0.15) return null;
  const n = signsAt(T);
  return <div style={{ position: "absolute", top: 40, left: 30, right: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: "FsMont", fontWeight: 800, fontSize: 28, padding: "8px 16px", borderRadius: 8 }}>● ДЕНЬ 1 · 21:4{T < at("Правило", 2) ? 0 : 2}</div>
    <div style={{ background: "rgba(20,4,8,0.85)", border: `3px solid ${RED}`, color: "#fff", fontFamily: "FsMont", fontWeight: 900, fontSize: 28, padding: "8px 16px", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
      ОН ИЛИ ТЫ <span style={{ color: RED }}>{n}/3</span>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 26, height: 26, borderRadius: 4, background: i < n ? RED : "#333", color: "#fff", fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i < n ? "✕" : ""}</span>)}
    </div>
  </div>;
};
export const Home1: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_H1} adLen={AD_LEN_VX} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={/^$/} yel={/^$/} dir="stories/home1" glide noCaps hud={(T: number) => <Hud T={T} />} />;
