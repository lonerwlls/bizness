// История «Лифт», часть 3: голос за дверью, Петя не помнит завтрак, квартира в пыли через десять лет — и старый Петя на диване.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, pStand } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX, Display } from "./lift1";
import { BigDoor, CONC, CONC_D, Corridor, Flash, PhoneScreen } from "./lift2";
import { VOICE as V } from "./lift3.voice";

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_L3 = wd("дверь").e + 0.4;
export const TM_L3 = timing(VOICE, AD1_L3, AD_LEN_VX, false);
const OLD = { hair: "#c9c6c0", hairSh: "#8e8b86", skin: "#d9b8a4", skinSh: "#a88a7a" };
const DUST = "#8d8a80";

// квартира Пети, покрытая пылью: стена, окно, календарь, диван, столик с кружкой
const Room: React.FC<{ T: number; who?: number; dustT?: number }> = ({ T, who = 0 }) => (
  <g>
    <rect width={W} height={PH} fill="#3b3d38" />
    {/* обои в полоску */}
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 95} y={0} width={40} height={860} fill="#34362f" />)}
    <rect y={860} width={W} height={PH - 860} fill="#2e2a25" />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M 0 ${880 + i * 45} L ${W} ${880 + i * 45}`} stroke="#25221e" strokeWidth={4} />)}
    {/* окно с лунным светом */}
    <rect x={90} y={170} width={260} height={360} fill="#1c2638" stroke={INK} strokeWidth={8} />
    <path d="M 220 170 L 220 530 M 90 350 L 350 350" stroke={INK} strokeWidth={8} />
    <polygon points="90,530 350,530 470,860 200,860" fill="#9fb4d8" opacity={0.07} />
    {/* календарь на стене */}
    <g transform="translate(860 330)">
      <rect x={-80} y={-110} width={160} height={210} fill="#d8d2c0" stroke={INK} strokeWidth={5} />
      <rect x={-80} y={-110} width={160} height={70} fill="#9a4a3a" />
      <text x={0} y={36} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#3a2a22">2036</text>
      <circle cx={0} cy={-122} r={6} fill={INK} />
    </g>
    {/* диван */}
    <rect x={300} y={600} width={520} height={190} rx={30} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
    {who ? <g opacity={who}>{/* седой затылок над спинкой */}
      <rect x={520} y={548} width={90} height={70} rx={30} fill="#434a5a" stroke={INK} strokeWidth={5} />
      {[-1, 1].map((k) => <ellipse key={k} cx={565 + k * 40} cy={526} rx={8} ry={13} fill={OLD.skinSh} stroke={INK} strokeWidth={4} />)}
      <ellipse cx={565} cy={520} rx={40} ry={46} fill={OLD.hair} stroke={INK} strokeWidth={5} />
      {[-24, -10, 4, 18].map((d, i) => <path key={i} d={`M ${565 + d} 482 Q ${565 + d * 1.3 + 4} 515 ${565 + d * 1.1} 556`} stroke={OLD.hairSh} strokeWidth={3} fill="none" strokeLinecap="round" />)}
    </g> : null}
    <rect x={280} y={740} width={560} height={150} rx={26} fill="#6a584a" stroke={INK} strokeWidth={7} />
    <rect x={250} y={700} width={70} height={200} rx={24} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
    <rect x={800} y={700} width={70} height={200} rx={24} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
    <rect x={300} y={600} width={520} height={14} rx={7} fill={DUST} opacity={0.6} />
    {/* столик и кружка */}
    <rect x={380} y={960} width={340} height={30} rx={6} fill="#4a3a2e" stroke={INK} strokeWidth={6} />
    <rect x={400} y={990} width={22} height={150} fill="#3a2c22" stroke={INK} strokeWidth={5} /><rect x={678} y={990} width={22} height={150} fill="#3a2c22" stroke={INK} strokeWidth={5} />
    <rect x={380} y={956} width={340} height={8} fill={DUST} opacity={0.7} />
    <Mug x={600} y={958} s={1} />
    {/* пылинки в воздухе */}
    {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(rnd(i) * W + Math.sin(T * 0.4 + i) * 30) % W} cy={(rnd(i + 50) * 900 + T * (6 + rnd(i + 9) * 10)) % 1000} r={2 + rnd(i + 3) * 3} fill="#e8e0c8" opacity={0.35} />)}
  </g>
);
const Mug: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 28 -62 Q 58 -60 56 -36 Q 54 -16 28 -18" stroke={INK} strokeWidth={10} fill="none" />
    <path d="M 28 -62 Q 58 -60 56 -36 Q 54 -16 28 -18" stroke="#c84a3a" strokeWidth={5} fill="none" />
    <rect x={-34} y={-76} width={66} height={76} rx={8} fill="#c84a3a" stroke={INK} strokeWidth={5} />
    <ellipse cx={-1} cy={-76} rx={33} ry={7} fill={DUST} stroke={INK} strokeWidth={4} />
    <path d="M -24 -50 L -24 -14" stroke="#e86a5a" strokeWidth={6} strokeLinecap="round" />
  </g>
);
// мысль-облако
const Thought: React.FC<{ x: number; y: number; o: number; empty: number; T: number }> = ({ x, y, o, empty, T }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle cx={-150} cy={250} r={14} fill="#e8e8f0" stroke={INK} strokeWidth={4} />
    <circle cx={-110} cy={190} r={22} fill="#e8e8f0" stroke={INK} strokeWidth={4} />
    <path d="M -170 40 Q -200 -60 -100 -80 Q -60 -150 30 -120 Q 120 -160 160 -80 Q 240 -40 190 40 Q 220 120 120 130 Q 40 180 -40 140 Q -160 160 -170 40 Z" fill="#e8e8f0" stroke={INK} strokeWidth={6} />
    <g opacity={1 - empty} style={{ filter: `blur(${empty * 14}px)` }}>
      <ellipse cx={0} cy={20} rx={110} ry={40} fill="#fff" stroke={INK} strokeWidth={5} />
      <ellipse cx={-20} cy={10} rx={30} ry={14} fill="#f2c84a" stroke={INK} strokeWidth={3} />
      <rect x={20} y={0} width={50} height={20} rx={6} fill="#c88a4a" stroke={INK} strokeWidth={3} />
    </g>
    <text x={10} y={-10 + empty * 40} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={120 + empty * 40} fill={RED} opacity={0.4 + 0.6 * empty + 0.1 * Math.sin(T * 6)}>?</text>
  </g>
);
// ладони в свете телефона
const Hands: React.FC<{ pale: number; T: number }> = ({ pale, T }) => {
  const mix = (a: number[], c: number[]) => `rgb(${a.map((v, i) => Math.round(v + (c[i] - v) * pale)).join(",")})`;
  const skin = mix([227, 180, 150], [226, 230, 234]), sh = mix([185, 134, 112], [170, 182, 196]);
  const hand = (sd: number) => (
    <g transform={`translate(${540 + sd * 190} ${880 + Math.sin(T * 3 + sd) * 4}) scale(${sd} 1) rotate(${-12})`}>
      <rect x={-70} y={40} width={110} height={260} fill="#434a5a" stroke={INK} strokeWidth={6} />
      <path d="M -80 -90 Q -90 60 -20 70 Q 60 70 60 -40 L 60 -110 Q 40 -130 20 -110 L 20 -200 Q 0 -225 -18 -200 L -18 -230 Q -38 -255 -56 -230 L -56 -205 Q -78 -225 -94 -200 L -96 -120 Q -112 -140 -126 -120 Z"
        fill={skin} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 60 -40 Q 110 -120 130 -90 Q 120 -40 60 20" fill={skin} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -60 -20 Q -20 0 30 -30" stroke={sh} strokeWidth={5} fill="none" strokeLinecap="round" />
      {pale > 0.5 ? [0, 1, 2].map((k) => <path key={k} d={`M ${-60 + k * 30} -60 q 10 30 -4 60`} stroke="#8aa0c8" strokeWidth={3} fill="none" opacity={(pale - 0.5) * 1.4} />) : null}
    </g>
  );
  return <g>{hand(-1)}{hand(1)}</g>;
};

// ---------- сцены ----------
const Freeze: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2], [1.6, 1.7])} cx={540} cy={560}>
    <rect width={W} height={PH} fill={CONC} />
    <rect x={0} y={0} width={230} height={PH} fill="#3a2a22" stroke={INK} strokeWidth={8} />
    <rect x={0} y={1090} width={230} height={10} fill="#ffd88a" />
    <Petya x={600} y={1650} s={2.2} pose={pStand(T * 30, { turn: -0.35, light: -1, expr: { eyes: "wide", brows: 1.2, mouth: "tight", look: [-0.6, 0], blink: 0 } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.3} />
    <g transform="translate(540 300)" opacity={ip(t, [0, 0.2, 1.4, 1.8], [0, 1, 1, 0])}>
      <rect x={-150} y={-52} width={300} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">ЛИФТ</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>ЧАСТЬ 3</text>
    </g>
  </Cam>
);
const Waves: React.FC<{ T: number; c: string; y: number }> = ({ T, c, y }) => <g>
  {[1, 2, 3, 4].map((k) => <path key={k} d={`M ${540 - 70 * k} ${y - 20 * k} Q 540 ${y - 60 - 40 * k} ${540 + 70 * k} ${y - 20 * k}`} stroke={c} strokeWidth={6} fill="none" opacity={0.25 + 0.5 * Math.abs(Math.sin(T * 9 + k))} />)}
</g>;
const HisVoice: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.2], [1.2, 1.35])} cx={540} cy={700}>
    <BigDoor num="36" glow={1} T={T} /><Waves T={T} c={YEL} y={720} />
    <rect width={W} height={PH} fill="#000" opacity={0.35} />
    <g opacity={ip(T, [at("его"), at("его") + 0.3], [0, 1])}><Tag x={540} y={480} title="ЕГО ГОЛОС" sub="КАЖДОЕ СЛОВО" c={YEL} w={300} /></g>
  </Cam>
);
const Question: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.4], [1.5, 1.7])} cx={540} cy={830}>
    <BigDoor num="36" glow={1} feet={1} T={T} /><Waves T={T} c={RED} y={1040} />
    <rect width={W} height={PH} fill="#000" opacity={0.35} />
    <g opacity={ip(T, [at("завтрак"), at("завтрак") + 0.3], [0, 1])}><Tag x={540} y={700} title="ЧТО НА ЗАВТРАК?" sub="ПРОВЕРКА" c={RED} w={300} /></g>
  </Cam>
);
const Forget: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.2], [1.5, 1.62])} cx={540} cy={640}>
    <rect width={W} height={PH} fill={CONC_D} />
    <Petya x={420} y={1700} s={2.3} pose={pStand(T * 30, { turn: 0.25, tilt: -6, light: 1, expr: { eyes: T > at("правда") ? "wide" : "squint", brows: T > at("правда") ? 1.4 : -0.6, mouth: T > at("правда") ? "o" : "tight", look: [0.6, -0.8] } })} />
    <Thought x={740} y={470} o={ip(t, [0, 0.3], [0, 1])} empty={ip(T, [at("помнит", 1) - 0.2, at("помнит", 1) + 0.5], [0, 1])} T={T} />
    <rect width={W} height={PH} fill="#000" opacity={0.25} />
    <g opacity={ip(T, [at("правда"), at("правда") + 0.3], [0, 1])}><Tag x={540} y={215} title="ПУСТО" sub="ОН НЕ ПОМНИТ" c={RED} w={280} /></g>
  </Cam>
);
const PaleHands: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 6], [1, 1.12])} cx={540} cy={680}>
    <rect width={W} height={PH} fill="#05060d" />
    <Flash x={540} y={660} r={420} id="hands" dark={0.9}><rect width={W} height={PH} fill="#1a1d28" /><Hands pale={ip(T, [at("бледные", 1) - 0.3, at("Слишком") + 0.3], [0, 1])} T={T} /></Flash>
    <polygon points="500,1180 580,1180 900,300 180,300" fill="#dfe8ff" opacity={0.05} />
  </Cam>
  <g opacity={ip(T, [at("Слишком"), at("Слишком") + 0.3], [0, 1])}><Tag x={540} y={215} title="СЛИШКОМ БЛЕДНЫЕ" sub="КАК У ПРИЗРАКА" c={RED} w={320} /></g></>
);
const Phone3: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2], [1, 1.06])} cx={540} cy={600}><rect width={W} height={PH} fill="#05060d" /><PhoneScreen pct={3} T={T} /></Cam>;
const Push: SShot = ({ t, T }) => {
  const sw = ip(T, [at("толкает") - 0.1, at("дверь") + 0.5], [0, 0.72]), cw = Math.cos(sw * Math.PI / 2);
  return <Cam s={ip(t, [0, 2.4], [1, 1.08])} cx={540} cy={620}>
    <rect width={W} height={PH} fill={CONC} />
    {/* проём: за дверью — серый пыльный свет */}
    <rect x={240} y={120} width={600} height={1000} fill="#4a4c44" />
    <polygon points="240,1120 840,1120 980,1180 100,1180" fill="#c8c0a0" opacity={0.15 * sw} />
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={260 + rnd(i) * 560} cy={160 + ((rnd(i + 9) * 900 + T * 20) % 900)} r={3} fill="#e8e0c8" opacity={0.5 * sw} />)}
    <polygon points={`240,120 ${240 + 600 * cw},${120 - 60 * sw} ${240 + 600 * cw},${1120 + 60 * sw} 240,1120`} fill="#3a2a22" stroke={INK} strokeWidth={10} />
    <text x={240 + 300 * cw} y={420} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={170} fill="#c8b48a" transform={`translate(${240 + 300 * cw} 0) scale(${Math.max(0.05, cw)} 1) translate(${-240 - 300 * cw} 0)`}>36</text>
    <rect x={240} y={120} width={600} height={1000} fill="none" stroke={INK} strokeWidth={12} />
    <Petya x={980} y={1500} s={2} pose={pStand(T * 30, { turn: -0.8, lean: -8, light: -1, handL: [-150 - 60 * sw, -440], expr: { eyes: "wide", brows: 1, mouth: "tight", look: [-1, 0] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.3} />
  </Cam>;
};
const Inside: SShot = ({ t, T }) => {
  const lx = T < at("Его", 1) ? 540 : T < at("Его", 2) ? 560 : 600, ly = T < at("Его", 1) ? 520 : T < at("Его", 2) ? 720 : 920;
  return <><Cam s={ip(t, [0, 4.6], [1, 1.12])} cx={540} cy={640}>
    <Flash x={lx + Math.sin(T * 1.3) * 30} y={ly} r={380} id="in" dark={0.82}><Room T={T} /></Flash>
    {T > at("Его", 1) && T < at("Его", 2) ? <Brackets x={240} y={580} w={640} h={330} c={YEL} /> : null}
    {T > at("Его", 2) ? <Brackets x={540} y={860} w={140} h={120} c={YEL} /> : null}
  </Cam><g opacity={ip(T, [at("квартира"), at("квартира") + 0.3], [0, 1])}><Tag x={540} y={215} title="КВ. 36" sub="ЕГО КВАРТИРА" c={YEL} w={300} /></g></>;
};
const Dust: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 5], [3, 3.3])} cx={600} cy={920}>
    <Flash x={600} y={910} r={260} id="dust" dark={0.75}><Room T={T} />
      {/* паутина на кружке */}
      <path d="M 560 882 L 640 960 M 600 882 L 600 960 M 640 882 L 560 960 M 570 900 Q 600 912 630 900 M 566 930 Q 600 944 634 930" stroke="#ddd" strokeWidth={1.5} opacity={0.6} fill="none" />
      <rect x={566} y={876} width={66} height={10} rx={4} fill={DUST} />
    </Flash>
    <g transform="translate(600 920) scale(0.3333) translate(-600 -920)" opacity={ip(T, [at("лет", 1) - 0.4, at("лет", 1)], [0, 1])}><Tag x={540} y={360} title="ПЫЛЬ" sub="ЗДЕСЬ ДАВНО НЕ ЖИЛИ" c={RED} w={320} /></g>
  </Cam>
);
const Calendar: SShot = ({ t, T }) => {
  const z = ip(T, [at("Год") - 0.2, at("Год") + 0.6], [0, 1]);
  return <><Cam s={1.25 + z * 1.5} cx={540 + z * 320} cy={560 - z * 220}>
    <Flash x={860} y={340} r={300} id="cal" dark={0.85}><Room T={T} /></Flash>
  </Cam>{z > 0.8 ? <g><rect width={W} height={PH} fill="#ff2a2a" opacity={0.05 + 0.04 * Math.sin(T * 8)} /><Tag x={540} y={215} title="+10 ЛЕТ" sub="ПРОШЛО ДЕСЯТЬ ЛЕТ" c={RED} w={300} /></g> : null}</>;
};
const Back: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.4], [1.5, 1.7])} cx={565} cy={600}>
    <Flash x={565} y={560} r={330} id="back" dark={0.85}><Room T={T} who={ip(t, [0, 0.4], [0, 1])} /></Flash>
    {T > at("Седые") ? <Brackets x={510} y={460} w={110} h={110} c={RED} /> : null}
    {T > at("Тёмно-серая") ? <Brackets x={505} y={540} w={120} h={80} c={YEL} /> : null}
  </Cam>
);
// старый Петя за спинкой дивана поворачивается
const OldOnSofa: React.FC<{ T: number; turn: number; s?: number; x?: number; mouth?: "flat" | "open" | "smile"; eyes?: "open" | "wide" | "squint" }> = ({ T, turn, s = 1, x = 565, mouth = "flat", eyes = "open" }) => (
  <g clipPath="url(#sofaClip)">
    <defs><clipPath id="sofaClip"><rect x={0} y={0} width={W} height={640} /></clipPath></defs>
    <Petya x={x} y={600 + 420 * s} s={s} look={OLD} old pose={pStand(T * 30, { turn, expr: { eyes, mouth, brows: -0.3, look: [turn * -0.4, 0] } })} />
  </g>
);
const Turn: SShot = ({ t, T }) => {
  const tr = ip(T, [at("медленно"), at("поворачивается") + 1.1], [-1, -0.05]);
  return <Cam s={ip(t, [0, 2.6], [1.5, 1.8])} cx={565} cy={540}>
    <Flash x={565} y={500} r={320} id="turn" dark={0.86}><g>
      <Room T={T} />
      <rect x={300} y={300} width={520} height={300} fill="#3b3d38" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={285 + i * 95} y={300} width={40} height={300} fill="#34362f" />)}
      <OldOnSofa T={T} turn={tr} />
      <rect x={300} y={600} width={520} height={190} rx={30} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
      <rect x={300} y={600} width={520} height={14} rx={7} fill={DUST} opacity={0.6} />
    </g></Flash>
  </Cam>;
};
const OldFace: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 3.4], [3.6, 3.9])} cx={565} cy={480} shake={T > at("старое") && T < at("старое") + 0.3 ? 0.15 : 0}>
    <rect x={300} y={200} width={520} height={400} fill="#3b3d38" />{Array.from({ length: 6 }, (_, i) => <rect key={i} x={285 + i * 95} y={200} width={40} height={400} fill="#34362f" />)}
    <OldOnSofa T={T} turn={-0.05} eyes="open" />
    <rect x={300} y={600} width={520} height={190} rx={30} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
    <rect x={0} y={0} width={W} height={PH} fill="#000" opacity={0.2} />
  </Cam>
  <g opacity={ip(T, [at("Пети"), at("Пети") + 0.3], [0, 1])}><Tag x={540} y={215} title="ЛИЦО ПЕТИ" sub="ТОЛЬКО СТАРОЕ" c={RED} w={300} /></g></>
);
const Talk: SShot = ({ t, T }) => {
  const sp = T < at("говорит") ? (Math.floor(T * 7) % 2 ? "open" : "flat") : "smile";
  return <Cam s={ip(t, [0, 3.2], [1.2, 1.32])} cx={520} cy={620}>
    <Flash x={430} y={600} r={460} id="talk" dark={0.8}><g>
      <Room T={T} />
      <rect x={300} y={300} width={520} height={300} fill="#3b3d38" />
      <OldOnSofa T={T} turn={-0.45} x={640} mouth={sp as "open"} />
      <rect x={300} y={600} width={520} height={190} rx={30} fill="#5a4a3e" stroke={INK} strokeWidth={7} />
      <rect x={280} y={740} width={560} height={150} rx={26} fill="#6a584a" stroke={INK} strokeWidth={7} />
      <Petya x={180} y={1150} s={1.15} pose={pStand(T * 30, { turn: 0.6, light: 1, expr: { eyes: "wide", brows: 1.3, mouth: "o", look: [1, -0.2] } })} />
    </g></Flash>
    <g opacity={ip(T, [at("лет", 3), at("лет", 3) + 0.3], [0, 1])}><Tag x={540} y={130} title="10 ЛЕТ" sub="ОН ЖДАЛ" c={RED} w={260} /></g>
  </Cam>;
};
const Returns: SShot = ({ t, T }) => {
  const open = ip(T, [at("возвращается") - 0.2, at("возвращается") + 0.6], [0, 1]);
  return <Cam s={ip(t, [0, 4], [1, 1.2])} cx={540} cy={560}>
    <Flash x={540} y={560} r={300} id="ret" dark={0.86}><Corridor /></Flash>
    <rect x={450} y={440} width={180} height={240} fill="#fff6d8" opacity={0.9 * open} />
    <rect x={450} y={440} width={90 * (1 - open)} height={240} fill="#3e4458" /><rect x={540 + 90 * open} y={440} width={90 * (1 - open)} height={240} fill="#3e4458" />
    <rect x={430} y={420} width={220} height={280} fill="none" stroke="#5a6078" strokeWidth={8} />
    <polygon points={`450,680 630,680 ${760 + 200 * open},1180 ${320 - 200 * open},1180`} fill="#fff6d8" opacity={0.18 * open} />
    <Display x={540} y={360} s={0.45} text="▼" c={RED} />
    <g opacity={ip(T, [at("всегда"), at("всегда") + 0.3], [0, 1])}><Tag x={540} y={215} title="ЛИФТ ВЕРНУЛСЯ" sub="ДВЕРИ ОТКРЫТЫ" c={RED} w={300} /></g>
  </Cam>;
};
const EndCard: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="egl3"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#egl3)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>А ТЫ БЫ</text>
      <text x={540 - gl} y={680} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>ВОШЁЛ?</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 4</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [Freeze, 0], [HisVoice, b("Голос")], [Question, b("Если")], [Forget, b("Петя", 2)], [PaleHands, b("Он", 2)], [Phone3, b("Заряд")],
  [Push, b("Петя", 3)], [Inside, b("Внутри")], [Dust, b("Только", 1)], [Calendar, b("На", 1)], [Back, b("На", 2)], [Turn, b("Человек")],
  [OldFace, b("У")], [Talk, b("Я")], [Returns, b("Лифт")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "02:52"], [b("Петя", 3), "02:53"], [b("Год"), "02:53 · 2036"]];
const RED_RE = /^(замирает|его|завтрак|помнит|бледные|три|пылью|лет|вперёд|спиной|седые|старое|ждал|возвращается|пети)/i;
const YEL_RE = /^(голос|слово|руки|телефона|заряд|дверь|квартира|диван|кружка|календарь|год|десять|толстовка|лицо|лифт|петя)/i;
export const Lift3: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_L3} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/lift3" />;
