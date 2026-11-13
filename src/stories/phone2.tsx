// История «Чужой телефон», часть 2: тёмная квартира, сообщения от продавца, шаги в комнате, глазок и видеозвонок.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, pStand, pWalk } from "../foodshort/petya";
import { SShot, StoryShell, Voice, timing, words } from "../foodshort/shell";
import { AD_LEN_VX } from "./lift1";
import { Flash } from "./lift2";
import { Chat, PhoneBody, SELLER } from "./phone1";
import { VOICE as V } from "./phone2.voice";

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_P2 = wd("шуми").e + 0.4;
export const TM_P2 = timing(VOICE, AD1_P2, AD_LEN_VX, false);
const pk = (T: number, w: string, n = 1, d = 0.45) => ip(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1]);
const mix = (a: number, c: number, k: number) => a + (c - a) * k;
const GLOW = "#9fb4ff";

// прихожая: слева входная дверь с глазком, выключатель, справа приоткрытая дверь в комнату
export const Hall: React.FC<{ T: number; gap?: number; shadow?: number; eyes?: number; feet?: number }> = ({ T, gap = 0.25, shadow = 0, eyes = 0, feet = 0 }) => (
  <g>
    <rect width={W} height={PH} fill="#20263a" />
    {Array.from({ length: 11 }, (_, i) => <rect key={i} x={i * 100} y={0} width={46} height={900} fill="#1c2234" />)}
    <rect y={900} width={W} height={PH - 900} fill="#2a2420" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M 0 ${920 + i * 45} L ${W} ${920 + i * 45}`} stroke="#211c18" strokeWidth={4} />)}
    <rect y={880} width={W} height={22} fill="#3a3028" stroke={INK} strokeWidth={4} />
    {/* входная дверь */}
    <rect x={50} y={280} width={260} height={620} fill="#4a3a30" stroke={INK} strokeWidth={8} />
    <rect x={80} y={310} width={200} height={260} rx={6} fill="none" stroke="#3a2c24" strokeWidth={8} />
    <circle cx={180} cy={460} r={10} fill="#c8c0a0" stroke={INK} strokeWidth={4} />
    <rect x={270} y={600} width={26} height={60} rx={6} fill="#b89a50" stroke={INK} strokeWidth={4} />
    <rect x={50} y={895} width={260} height={6} fill="#ffd88a" opacity={0.5} />
    {/* выключатель и вешалка */}
    <rect x={350} y={520} width={50} height={80} rx={8} fill="#d8d4c8" stroke={INK} strokeWidth={4} /><rect x={366} y={534} width={18} height={30} rx={4} fill="#bab4a8" stroke={INK} strokeWidth={3} />
    <rect x={440} y={300} width={180} height={14} fill="#3a3028" stroke={INK} strokeWidth={4} />
    <path d="M 470 314 Q 450 460 480 560 L 540 560 Q 560 440 520 314 Z" fill="#2e3a4e" stroke={INK} strokeWidth={5} />
    {/* дверь в комнату */}
    <rect x={700} y={260} width={280} height={640} fill="#05060a" stroke={INK} strokeWidth={8} />
    <polygon points={`${700 + 280 * gap},262 980,262 980,898 ${700 + 280 * gap},898`} fill="#4a3a30" stroke={INK} strokeWidth={6} />
    <circle cx={720 + 280 * gap} cy={600} r={12} fill="#b89a50" stroke={INK} strokeWidth={3} />
    {shadow > 0 ? <g opacity={shadow}>
      <path d={`M ${720} 900 L 720 520 Q 722 470 ${700 + 140 * gap} 466 L ${700 + 280 * gap - 4} 470 L ${700 + 280 * gap - 4} 900 Z`} fill="#000" />
      <circle cx={740 + 50 * gap} cy={430} r={34} fill="#000" />
    </g> : null}
    {eyes > 0 ? [-1, 1].map((k) => <circle key={k} cx={740 + 50 * gap + k * 11} cy={428} r={4.5} fill="#ff4a4a" opacity={eyes} />) : null}
    {feet > 0 ? [0, 1].map((k) => <rect key={k} x={760 + k * 60 + Math.sin(T * 3 + k) * 6} y={950} width={50} height={14} rx={6} fill="#000" opacity={feet * 0.7} />) : null}
  </g>
);
const phoneAt = (x: number, y: number, s: number, glow = 1) => <g>
  <rect x={x - 22 * s} y={y - 38 * s} width={44 * s} height={76 * s} rx={8 * s} fill="#15161a" stroke={GLOW} strokeWidth={3 * s} />
  <rect x={x - 17 * s} y={y - 32 * s} width={34 * s} height={64 * s} rx={5 * s} fill={GLOW} opacity={0.5 * glow} />
</g>;

// ---------- сцены ----------
const Hook: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 1.8], [1.12, 1.04])} cx={540} cy={600} shake={t < 0.45 ? 0.2 : 0}>
    <rect width={W} height={PH} fill="#05060d" />
    <ellipse cx={540} cy={560} rx={520} ry={600} fill="#1a2350" opacity={0.5} />
    <PhoneBody buzz={t < 0.45 ? 1 : 0}><Chat msgs={[{ text: "Не включай свет.", at: 0.05 }]} T={T} /></PhoneBody>
  </Cam>
  <g transform="translate(800 1080) rotate(-4)" opacity={ip(t, [0.2, 0.4], [0, 1])}>
    <rect x={-150} y={-40} width={300} height={80} rx={6} fill="#f1e2b8" />
    <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#2a1a10">ЧУЖОЙ ТЕЛЕФОН</text>
    <text x={0} y={28} textAnchor="middle" fontFamily={MONO} fontSize={16} fill="#6a4a2a" letterSpacing={3}>ЧАСТЬ 2</text>
  </g>
</>);
const Enter: SShot = ({ t, T }) => {
  const op = ip(T, [at("открывает") - 0.1, at("квартиры") + 0.3], [0, 1]);
  return <Cam s={mix(ip(t, [0, 4], [1.05, 1.12]), 1.9, pk(T, "квартиры"))} cx={mix(540, 520, pk(T, "квартиры"))} cy={mix(600, 520, pk(T, "квартиры"))}>
    <rect width={W} height={PH} fill="#2a2c34" />
    <rect x={0} y={900} width={W} height={PH - 900} fill="#23242c" />
    <rect x={300} y={240} width={460} height={680} fill="#05060a" stroke={INK} strokeWidth={10} />
    <polygon points={`300,240 ${300 + 460 * (1 - op * 0.75)},${240 - 40 * op} ${300 + 460 * (1 - op * 0.75)},${920 + 40 * op} 300,920`} fill="#4a3a30" stroke={INK} strokeWidth={8} />
    <text x={300 + 230 * (1 - op * 0.75)} y={420} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={90} fill="#c8b48a" opacity={1 - op * 0.6}>12</text>
    <polygon points="0,0 1080,0 1080,1180 0,1180" fill="#ffd88a" opacity={0.04} />
    <Petya x={600} y={1080} s={1.1} pose={pStand(T * 30, { turn: -0.5, handL: [-170, -330], handR: [40, -400], expr: { eyes: "open", brows: 0.4, mouth: "flat", look: [-0.8, 0.3] } })} />
    {phoneAt(600 + 40 * 1.1, 1080 - 400 * 1.1, 1.1)}
  </Cam>;
};
const Dark: SShot = ({ t, T }) => {
  const k = pk(T, "Рука", 1, 0.5);
  return <Cam s={mix(ip(t, [0, 2], [1.05, 1.1]), 2.6, k)} cx={mix(560, 375, k)} cy={mix(600, 560, k)}>
    <Flash x={mix(470, 380, k)} y={mix(500, 560, k)} r={mix(330, 200, k)} id="dark" dark={0.9}><Hall T={T} />
      <Petya x={470} y={1050} s={1.05} pose={pStand(T * 30, { turn: -0.6, handL: [-110, -470], handR: [40, -410], light: 1, expr: { eyes: "wide", brows: 0.8, mouth: "tight", look: [-0.6, 0.3] } })} />
      {phoneAt(470 + 40 * 1.05, 1050 - 410 * 1.05, 1.05)}
    </Flash>
  </Cam>;
};
const Write: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2.4], [1.05, 1.1])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody><Chat msgs={[{ text: "Не включай свет.", at: 0 }, { text: "Кто ты?", at: at("Кто"), me: true }, { text: "Тот, кто продал тебе телефон", at: at("Тот") }]} T={T} typing={T > at("Ответ") - 0.2 && T < at("Тот") ? 1 : 0} /></PhoneBody>
  </Cam>
);
const Memory: SShot = ({ t, T }) => {
  const k = pk(T, "Лица", 1, 0.6);
  return <><Cam s={mix(ip(t, [0, 4], [1.1, 1.2]), 3.2, k)} cx={mix(560, 694, k)} cy={mix(640, 330, k)}>
    <rect width={W} height={PH} fill="#10131f" />
    <rect x={0} y={0} width={W} height={120} fill="#2a1a1a" /><path d="M 0 120 L 80 170 L 160 120 L 240 170 L 320 120 L 400 170 L 480 120 L 560 170 L 640 120 L 720 170 L 800 120 L 880 170 L 960 120 L 1040 170 L 1080 140" fill="#7a2a2a" stroke={INK} strokeWidth={5} />
    <Petya x={700} y={1000} s={1.3} look={SELLER} pose={pStand(T * 30, { hood: true, turn: -0.3, handL: [-120, -330], expr: { eyes: "squint", mouth: "flat" } })} />
    <ellipse cx={700 - 6} cy={1000 - 528 * 1.3 + 10} rx={34} ry={40} fill="#05060a" opacity={0.92} />
    <rect x={120} y={760} width={840} height={60} fill="#5a4030" stroke={INK} strokeWidth={6} /><rect x={140} y={820} width={800} height={360} fill="#3a2a20" stroke={INK} strokeWidth={6} />
  </Cam>
    {/* «воспоминание»: сепия, зерно, рамка */}
    <rect width={W} height={PH} fill="#8a6a3a" opacity={0.28} style={{ mixBlendMode: "multiply" }} />
    {Array.from({ length: 80 }, (_, i) => <rect key={i} x={rnd(i + Math.floor(T * 15)) * W} y={rnd(i * 7 + Math.floor(T * 15)) * PH} width={3} height={3} fill="#fff" opacity={0.12} />)}
    <g opacity={ip(T, [at("увидел"), at("увидел") + 0.3], [0, 1])}><Tag x={540} y={215} title="ЛИЦА НЕ ВИДНО" sub="ПРОДАВЕЦ ТЕЛЕФОНА" c={RED} w={320} /></g>
  </>;
};
const Someone: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.4], [1.05, 1.12])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody buzz={T < at("В") ? 1 : 0}><Chat msgs={[{ text: "Кто ты?", at: 0, me: true }, { text: "Тот, кто продал тебе телефон", at: 0 }, { text: "В твоей комнате кто-то есть. Не шуми.", at: at("В") }]} T={T} typing={T < at("В") ? 1 : 0} /></PhoneBody>
  </Cam>
);
const Creak: SShot = ({ t, T }) => {
  const k = pk(T, "скрип", 1, 0.5), g = ip(T, [at("скрип") - 0.2, at("скрип") + 0.4], [0.25, 0.33]);
  return <Cam s={mix(1.15, 2.2, k)} cx={mix(600, 790, k)} cy={mix(600, 560, k)}>
    <Flash x={680} y={560} r={420} id="creak" dark={0.88}><Hall T={T} gap={g} feet={ip(T, [at("Медленные"), at("шаги") + 0.4], [0, 1])} /></Flash>
  </Cam>;
};
const Back: SShot = ({ t, T }) => {
  const x = ip(T, [at("пятится") - 0.1, at("двери", 1) + 0.6], [560, 380]);
  return <Cam s={ip(t, [0, 2], [1.15, 1.25])} cx={480} cy={600}>
    <Flash x={x} y={560} r={330} id="back" dark={0.9}><Hall T={T} gap={0.33} />
      <Petya x={x} y={1050} s={1.05} pose={pWalk(T * 30, 560 - x, -1, { turn: 0.6, dir: -1, handR: [60, -410], expr: { eyes: "wide", brows: 1.2, mouth: "o", look: [1, 0] } })} />
    </Flash>
  </Cam>;
};
const NoStairs: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2], [1.05, 1.1])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody buzz={t < 0.4 ? 1 : 0}><Chat msgs={[{ text: "В твоей комнате кто-то есть. Не шуми.", at: 0 }, { text: "Нет. Не на лестницу.", at: at("Нет") }, { text: "Там он тебя и ждёт", at: at("Там") }]} T={T} /></PhoneBody>
  </Cam>
);
const Peephole: SShot = ({ t, T }) => {
  const fig = ip(T, [at("ждёт") - 0.2, at("ждёт") + 0.3], [0, 1]);
  return <Cam s={ip(t, [0, 2], [1.0, 1.15])} cx={540} cy={560}>
    <rect width={W} height={PH} fill="#000" />
    <defs><clipPath id="peep"><circle cx={540} cy={560} r={420} /></clipPath>
      <radialGradient id="peepV"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.95} /></radialGradient></defs>
    <g clipPath="url(#peep)">
      <rect width={W} height={PH} fill="#4a4a3e" />
      <polygon points="140,1180 940,1180 700,700 380,700" fill="#3a3a30" />
      <rect x={380} y={300} width={320} height={400} fill="#5a5a4c" />
      <path d="M 380 700 L 140 1180 M 700 700 L 940 1180" stroke={INK} strokeWidth={6} />
      <circle cx={540} cy={250} r={26} fill="#fff6c8" /><polygon points="540,276 360,700 720,700" fill="#fff6c8" opacity={0.12} />
      <g opacity={fig}>
        <path d="M 470 900 L 470 640 Q 470 560 540 556 Q 610 560 610 640 L 610 900 Z" fill="#1a1a1e" stroke={INK} strokeWidth={6} />
        <path d="M 498 560 Q 540 470 582 560 Q 560 600 540 600 Q 520 600 498 560 Z" fill="#1a1a1e" stroke={INK} strokeWidth={6} />
        <ellipse cx={540} cy={562} rx={26} ry={30} fill="#000" />
      </g>
      <rect width={W} height={PH} fill="url(#peepV)" />
    </g>
    <circle cx={540} cy={560} r={420} fill="none" stroke="#111" strokeWidth={30} />
    <g opacity={fig}><Brackets x={440} y={480} w={200} h={440} c={RED} /></g>
  </Cam>;
};
const Near: SShot = ({ t, T }) => {
  const k = pk(T, "рядом", 1, 0.4);
  return <Cam s={mix(ip(t, [0, 2.4], [1.2, 1.3]), 2.7, k)} cx={mix(560, 400, k)} cy={mix(600, 520, k)}>
    <Flash x={mix(560, 400, k)} y={540} r={360} id="near" dark={0.9}><Hall T={T} gap={0.33} shadow={ip(T, [at("останавливаются"), at("останавливаются") + 0.6], [0, 1])} />
      <Petya x={380} y={1050} s={1.05} pose={pStand(T * 30, { turn: 0.5, lean: -6, handL: [-60, -300], handR: [50, -330], expr: { eyes: "wide", brows: 1.4, mouth: "tight", look: [1, 0] } })} />
    </Flash>
  </Cam>;
};
const Call: SShot = ({ t, T }) => {
  const bz = Math.floor(T * 8) % 3 === 0 ? 0 : 1;
  return <Cam s={ip(t, [0, 3.4], [1.05, 1.14])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <ellipse cx={540} cy={600} rx={560} ry={640} fill={GLOW} opacity={0.18 + 0.08 * Math.sin(T * 10)} />
    <PhoneBody buzz={bz}><g>
      <rect x={-222} y={-442} width={444} height={884} fill="#14203a" />
      <circle cx={0} cy={-200} r={90} fill="#3a3f55" stroke="#6a7090" strokeWidth={4} /><text x={0} y={-170} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={90} fill="#8a90a8">?</text>
      <text x={0} y={-50} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={38} fill="#fff">НОМЕР СКРЫТ</text>
      <text x={0} y={0} textAnchor="middle" fontFamily={MONO} fontSize={24} fill="#9fb4ff">входящий видеозвонок</text>
      {[[-110, "#e04040", "✕"], [110, "#30c060", "▶"]].map(([x, c, s]) => <g key={String(x)} transform={`translate(${x} 300)`}><circle r={60 + 6 * Math.abs(Math.sin(T * 6))} fill={c as string} /><text y={18} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={50} fill="#fff">{s}</text></g>)}
    </g></PhoneBody>
  </Cam>;
};
const Ring: SShot = ({ t, T }) => {
  const k = pk(T, "квартиру", 1, 0.5);
  return <Cam s={mix(1.05, 1.2, k)} cx={mix(560, 600, k)} cy={600} shake={0.04}>
    <Flash x={380} y={560} r={300} id="ring" dark={0.88}><Hall T={T} gap={0.33} shadow={1} />
      <Petya x={380} y={1050} s={1.05} pose={pStand(T * 30, { turn: 0.5, handR: [60, -400], expr: { eyes: "wide", brows: 1.4, mouth: "o", look: [0.4, 0.6] } })} />
      {phoneAt(380 + 60 * 1.05, 1050 - 400 * 1.05, 1.05, 1)}
    </Flash>
    {[1, 2, 3].map((r) => <circle key={r} cx={443} cy={630} r={((T * 260 + r * 120) % 420) + 20} fill="none" stroke={GLOW} strokeWidth={5} opacity={0.5 * (1 - (((T * 260 + r * 120) % 420) / 420))} />)}
  </Cam>;
};
const Found: SShot = ({ t, T }) => {
  const k = pk(T, "Нашёл", 1, 0.3);
  return <Cam s={mix(ip(t, [0, 2], [1.6, 1.9]), 3.4, k)} cx={mix(800, 760, k)} cy={mix(560, 430, k)} shake={T > at("Нашёл") && T < at("Нашёл") + 0.35 ? 0.15 : 0}>
    <Flash x={780} y={500} r={340} id="found" dark={0.84}><Hall T={T} gap={0.36} shadow={1} eyes={ip(T, [at("шепчет"), at("Нашёл")], [0, 1])} /></Flash>
    <path d="M 755 600 Q 770 590 790 600 L 795 640 L 750 640 Z" fill="#000" opacity={ip(T, [at("Нашёл") - 0.1, at("Нашёл") + 0.2], [0, 1])} />
  </Cam>;
};
const EndCard: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="egp2"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#egp2)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>А ТЫ БЫ</text>
      <text x={540 - gl} y={680} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>ОТВЕТИЛ?</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 3</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [Hook, 0], [Enter, b("Это")], [Dark, b("Он", 1)], [Write, b("Петя", 2)], [Memory, b("Петя", 3)], [Someone, b("Новое")],
  [Creak, b("Из")], [Back, b("Петя", 4)], [NoStairs, b("Нет")], [Peephole, b("Там")], [Near, b("Шаги")], [Call, b("Телефон")],
  [Ring, b("Звонок")], [Found, b("А")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "23:47"], [b("Нет"), "23:48"], [b("Телефон"), "23:49"]];
const RED_RE = /^(свет|темноте|продал|капюшоне|лица|увидел|кто-то|шуми|скрип|шаги|ждёт|рядом|скрыт|шепчет|нашёл)/i;
const YEL_RE = /^(включай|сообщение|дверь|квартиры|выключателе|телефон|рынке|комнате|двери|лестницу|видеозвонок|звонок|петя)/i;
export const Phone2: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_P2} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/phone2" glide />;
