// История «Лифт», часть 2: подвал, которого нет, коридор с дверями и квартира Пети — а за ней его собственный голос.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, pStand, pWalk } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX, Display, Finger, PanelBtns } from "./lift1";
import { VOICE as V } from "./lift2.voice";

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
export const AD1_L2 = wd("Пети").e + 0.4;
export const TM_L2 = timing(VOICE, AD1_L2, AD_LEN_VX, false);
const CONC = "#2a2c34", CONC_D = "#1c1d24";

// коридор подвала в перспективе: двери слева и справа, номера квартир
const Corridor: React.FC<{ nums?: boolean }> = ({ nums = true }) => {
  const vp: [number, number] = [540, 560];
  return <g>
    <rect width={W} height={PH} fill={CONC_D} />
    <polygon points={`0,0 ${W},0 ${vp[0] + 120},${vp[1] - 90} ${vp[0] - 120},${vp[1] - 90}`} fill="#15161c" />
    <polygon points={`0,${PH} ${W},${PH} ${vp[0] + 120},${vp[1] + 90} ${vp[0] - 120},${vp[1] + 90}`} fill="#202128" />
    <polygon points={`0,0 ${vp[0] - 120},${vp[1] - 90} ${vp[0] - 120},${vp[1] + 90} 0,${PH}`} fill={CONC} />
    <polygon points={`${W},0 ${vp[0] + 120},${vp[1] - 90} ${vp[0] + 120},${vp[1] + 90} ${W},${PH}`} fill={CONC} />
    {[0, 1, 2, 3].map((k) => {
      const z = 1 / (1 + k * 0.9), x0 = vp[0] - (vp[0] - 0) * z * 0.86, h = 760 * z, top = vp[1] - h * 0.55, w = 120 * z;
      return [-1, 1].map((sd) => {
        const x = sd < 0 ? x0 : W - x0 - w;
        const num = 33 + k * 2 + (sd > 0 ? 1 : 0);
        return <g key={k + "" + sd}>
          <rect x={x} y={top} width={w} height={h} fill="#3a2a22" stroke={INK} strokeWidth={4 * z} />
          {nums ? <text x={x + w / 2} y={top + 60 * z} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={42 * z} fill="#c8b48a">{num}</text> : null}
        </g>;
      });
    })}
  </g>;
};
const Flash: React.FC<{ x: number; y: number; r?: number; children: React.ReactNode; id: string; dark?: number }> = ({ x, y, r = 260, children, id, dark = 0.93 }) => (
  <g>
    <defs><radialGradient id={`fg${id}`}><stop offset="0" stopColor="#000" /><stop offset="0.6" stopColor="#000" stopOpacity={0.9} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
      <mask id={`fm${id}`}><rect width={W} height={PH} fill="#fff" /><circle cx={x} cy={y} r={r} fill={`url(#fg${id})`} /></mask></defs>
    {children}
    <rect width={W} height={PH} fill="#020308" opacity={dark} mask={`url(#fm${id})`} />
  </g>
);
const BigDoor: React.FC<{ num: string; glow?: number; feet?: number; T: number }> = ({ num, glow = 0, feet = 0, T }) => (
  <g>
    <rect width={W} height={PH} fill={CONC} />
    <rect x={240} y={120} width={600} height={1000} fill="#3a2a22" stroke={INK} strokeWidth={10} />
    <rect x={290} y={170} width={500} height={380} rx={8} fill="none" stroke="#2a1c16" strokeWidth={10} />
    <rect x={290} y={610} width={500} height={460} rx={8} fill="none" stroke="#2a1c16" strokeWidth={10} />
    <text x={540} y={420} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={170} fill="#c8b48a">{num}</text>
    <circle cx={760} cy={660} r={20} fill="#c8a040" stroke={INK} strokeWidth={4} />
    <rect x={240} y={1110} width={600} height={12} fill="#ffd88a" opacity={glow} />
    <polygon points="240,1122 840,1122 980,1180 100,1180" fill="#ffd88a" opacity={0.15 * glow} />
    {feet > 0 ? [470, 590].map((x, i) => <rect key={i} x={x + Math.sin(T * 2 + i) * 4} y={1110} width={46} height={12} fill="#05060d" opacity={feet} />) : null}
  </g>
);
const PhoneScreen: React.FC<{ pct: number; T: number }> = ({ pct, T }) => (
  <g transform="translate(540 600)">
    <rect x={-240} y={-460} width={480} height={920} rx={50} fill="#111" stroke="#333" strokeWidth={10} />
    <rect x={-215} y={-430} width={430} height={860} rx={34} fill="#141a2e" />
    <text x={-180} y={-380} fontFamily={MONO} fontSize={30} fill="#888">02:44</text>
    <g transform="translate(110 -392)"><rect width={70} height={30} rx={5} fill="none" stroke={RED} strokeWidth={4} /><rect x={4} y={4} width={62 * pct / 100} height={22} fill={RED} /></g>
    <text x={0} y={-60} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={60} fill="#fff">НЕТ СЕТИ</text>
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-60 + k * 34} y={40 - k * 22} width={22} height={30 + k * 22} rx={4} fill="#3a3f55" />)}
    <path d="M -80 -20 L 80 110" stroke={RED} strokeWidth={10} />
    <text x={0} y={260} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill={RED} opacity={0.6 + 0.4 * Math.abs(Math.sin(T * 3))}>{pct}%</text>
  </g>
);

// ---------- сцены ----------
const DoorsOpen: SShot = ({ t, T }) => {
  const open = ip(t, [0.3, 1.6], [0, 1]);
  return <Cam s={ip(t, [0, 2.2], [1, 1.08])} cx={540} cy={600}>
    <rect width={W} height={PH} fill="#2a0a0e" />
    <Display x={540} y={250} s={1.3} text="-1" c={RED} arrow={-1} />
    <rect x={240} y={480} width={600} height={700} fill="#000" />
    <rect x={240} y={480} width={300 - open * 260} height={700} fill="#3e4458" stroke={INK} strokeWidth={6} />
    <rect x={540 + open * 260} y={480} width={300 - open * 260} height={700} fill="#3e4458" stroke={INK} strokeWidth={6} />
    <g transform="translate(540 440)" opacity={ip(t, [0, 0.2, 1.8, 2.2], [0, 1, 1, 0])}>
      <rect x={-150} y={-52} width={300} height={104} rx={8} fill="#f1e2b8" transform="rotate(-3)" />
      <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={46} fill="#2a1a10" transform="rotate(-3)">ЛИФТ</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={MONO} fontSize={18} fill="#6a4a2a" transform="rotate(-3)" letterSpacing={3}>ЧАСТЬ 2</text>
    </g>
  </Cam>;
};
const Damp: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2.6], [1.2, 1.3])} cx={540} cy={560}>
    <Flash x={540 + Math.sin(T) * 80} y={600} r={330} id="damp"><Corridor nums={false} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={300 + i * 100} cy={(T * 400 + i * 190) % 1100} r={5} fill="#8aa0c8" opacity={0.5} />)}</Flash>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><Tag x={540} y={215} title="ПОДВАЛ?" sub="ЕГО НЕ ДОЛЖНО БЫТЬ" c={RED} w={320} /></g>
  </Cam>
);
const Dead: SShot = ({ T }) => {
  const push = ip(T, [at("девятый") - 0.2, at("девятый")], [0, 1]);
  return <Cam s={1.05} cx={540} cy={560}><rect width={W} height={PH} fill="#2a2f42" /><PanelBtns /><Finger x={620} y={240} push={push} />
    <rect width={W} height={PH} fill="#000" opacity={0.45} />
    <g opacity={ip(T, [at("горит"), at("горит") + 0.3], [0, 1])}><Tag x={540} y={215} title="НЕ ГОРИТ" sub="КНОПКА 9" c={RED} w={260} /></g></Cam>;
};
const DisplayOff: SShot = ({ T }) => {
  const on = T < at("гаснет") ? 1 : rnd(Math.floor(T * 12)) > 0.75 && T < at("гаснет") + 0.6 ? 0.4 : 0;
  return <Cam s={1} cx={540} cy={590}><rect width={W} height={PH} fill="#1a1d28" />
    <g opacity={on}><Display x={540} y={560} s={2} text="-1" c={RED} arrow={-1} /></g>
    {on === 0 ? <Display x={540} y={560} s={2} text="" c={RED} /> : null}
    <g opacity={ip(T, [at("мёртв"), at("мёртв") + 0.3], [0, 1])}><Tag x={540} y={215} title="ЛИФТ МЁРТВ" sub="НЕТ ПИТАНИЯ" c={RED} w={300} /></g></Cam>;
};
const Phone: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2.6], [1, 1.06])} cx={540} cy={600}><rect width={W} height={PH} fill="#05060d" /><PhoneScreen pct={7} T={T} /></Cam>;
const StepOut: SShot = ({ t, T }) => {
  const x = ip(t, [0, 3.2], [280, 640]);
  return <Cam s={ip(t, [0, 3.2], [1, 1.06])} cx={540} cy={640}>
    <rect width={W} height={PH} fill={CONC_D} />
    <rect x={60} y={300} width={300} height={720} fill="#3e4458" stroke={INK} strokeWidth={8} /><rect x={90} y={330} width={240} height={690} fill="#2a2f42" />
    <rect y={1020} width={W} height={PH - 1020} fill="#202128" />
    <Flash x={x + 200} y={760} r={300} id="step" dark={0.88}>
      <rect x={360} y={300} width={W} height={720} fill={CONC} />
      <rect x={720} y={420} width={130} height={600} fill="#3a2a22" stroke={INK} strokeWidth={5} />
    </Flash>
    <Petya x={x} y={1040} s={0.8} pose={pWalk(T * 30, (x - 280) / 0.8, 1, { handR: [130, -400], expr: { eyes: "wide", mouth: "tight" } })} />
    <rect x={x + 120 * 0.8 - 12} y={1040 - 430 * 0.8} width={24} height={40} rx={4} fill="#15161c" />
  </Cam>;
};
const Hall: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 4], [1, 1.14])} cx={540} cy={580}>
    <Flash x={540 + Math.sin(T * 0.9) * 200} y={560} r={360} id="hall"><Corridor /></Flash>
    <g opacity={ip(T, [at("Слева"), at("Слева") + 0.3], [0, 1])}><Tag x={540} y={215} title="КОРИДОР" sub="ДВЕРИ С НОМЕРАМИ" c={YEL} w={300} /></g>
  </Cam>
);
const Numbers: SShot = ({ T }) => {
  const n = T < at("Тридцать", 2) ? "34" : T < at("Тридцать", 3) ? "35" : "36";
  const k = T < at("Тридцать", 2) ? 0 : T < at("Тридцать", 3) ? 1 : 2;
  return <Cam s={1.08} cx={540 + Math.sin(T * 2) * 10} cy={560}>
    <Flash x={540} y={420} r={360} id={"num" + k} dark={0.9}><BigDoor num={n} T={T} /></Flash>
    {n === "36" ? <rect width={W} height={PH} fill="#ff2a2a" opacity={0.06} /> : null}
  </Cam>;
};
const Mine: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2], [1.6, 1.7])} cx={540} cy={560}>
    <rect width={W} height={PH} fill={CONC} />
    <Petya x={540} y={1650} s={2.2} pose={pStand(T * 30, { turn: 0.15, light: 1, expr: { eyes: "wide", brows: 1.2, mouth: "o", look: [0.3, -0.3] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.25} />
    <g opacity={ip(T, [at("Пети"), at("Пети") + 0.3], [0, 1])}><Tag x={540} y={215} title="КВ. 36" sub="ЭТО ЕГО КВАРТИРА" c={RED} w={320} /></g>
  </Cam>
);
const LightUnder: SShot = ({ t, T }) => <Cam s={ip(t, [0, 2], [1, 1.06])} cx={540} cy={640}><BigDoor num="36" glow={ip(t, [0, 0.6], [0, 1])} T={T} /><rect width={W} height={PH} fill="#000" opacity={0.45} /></Cam>;
const Listen: SShot = ({ t, T }) => {
  const waves = T > at("голос", 1) - 0.1;
  return <Cam s={ip(t, [0, 5], [1, 1.1])} cx={540} cy={640}>
    <rect width={W} height={PH} fill={CONC} />
    <rect x={80} y={160} width={420} height={900} fill="#3a2a22" stroke={INK} strokeWidth={8} /><text x={290} y={360} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={110} fill="#c8b48a">36</text>
    <rect x={80} y={1050} width={420} height={10} fill="#ffd88a" />
    {waves ? [1, 2, 3].map((k) => <path key={k} d={`M ${500 + k * 30} ${500 - k * 40} Q ${540 + k * 40} 560 ${500 + k * 30} ${620 + k * 40}`} stroke={YEL} strokeWidth={6} fill="none" opacity={0.3 + 0.5 * Math.abs(Math.sin(T * 8 + k))} />) : null}
    <Petya x={720} y={1080} s={1} pose={pStand(T * 30, { turn: -0.8, lean: -10, light: -1, handL: [-150, -420], expr: { eyes: T > at("Свой") ? "wide" : "open", brows: 0.8, mouth: "tight", look: [-1, 0] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.35} />
  </Cam>;
};
const VoiceDoor: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3], [1.4, 1.55])} cx={540} cy={760}>
    <BigDoor num="36" glow={1} T={T} />
    {[1, 2, 3, 4].map((k) => <path key={k} d={`M ${540 - 70 * k} ${700 - 20 * k} Q 540 ${640 - 40 * k} ${540 + 70 * k} ${700 - 20 * k}`} stroke={RED} strokeWidth={6} fill="none" opacity={0.25 + 0.5 * Math.abs(Math.sin(T * 9 + k))} />)}
    <rect width={W} height={PH} fill="#000" opacity={0.4} />
  </Cam>
);
const LiftLeaves: SShot = ({ t, T }) => {
  const close = ip(T, [at("хлопают") - 0.1, at("хлопают") + 0.3], [0, 1]);
  return <Cam s={ip(t, [0, 4], [1, 1.1])} cx={540} cy={600} shake={T > at("хлопают") && T < at("хлопают") + 0.25 ? 0.5 : 0}>
    <Flash x={540} y={560} r={300} id="leave" dark={0.85}><Corridor /></Flash>
    {/* в конце коридора — лифт */}
    <rect x={450} y={440} width={180} height={240} fill="#fff6d8" opacity={0.8 * (1 - close)} />
    <rect x={450} y={440} width={90 * close} height={240} fill="#3e4458" /><rect x={630 - 90 * close} y={440} width={90 * close} height={240} fill="#3e4458" />
    <rect x={430} y={420} width={220} height={280} fill="none" stroke="#5a6078" strokeWidth={8} />
    <g opacity={ip(T, [at("уезжает"), at("уезжает") + 0.3], [0, 1])}><Display x={540} y={360} s={0.45} text="▲" c={YEL} /></g>
    <Petya x={200} y={1300} s={1.6} pose={pStand(T * 30, { turn: 0.7, light: 1, expr: { eyes: "wide", mouth: "o", look: [1, -0.2] } })} />
    <g opacity={ip(T, [at("Без"), at("Без") + 0.3], [0, 1])}><Tag x={540} y={215} title="ЛИФТ УШЁЛ" sub="БЕЗ ПЕТИ" c={RED} w={280} /></g>
  </Cam>;
};
const Ask: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.4], [1.2, 1.4])} cx={540} cy={900}>
    <BigDoor num="36" glow={1} feet={ip(T, [at("тихо"), at("спрашивают") + 0.4], [0, 1])} T={T} />
    <rect width={W} height={PH} fill="#000" opacity={0.4} />
    <g opacity={ip(T, [at("Петя", 4), at("Петя", 4) + 0.3], [0, 1])}><Brackets x={440} y={1080} w={200} h={70} c={RED} /></g>
  </Cam>
);
const EndCard: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="egl2"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#egl2)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>КТО ИЗ НИХ</text>
      <text x={540 - gl} y={680} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>НАСТОЯЩИЙ?</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 3</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [DoorsOpen, 0], [Damp, b("Пахнет")], [Dead, b("Петя", 1)], [DisplayOff, b("Табло")], [Phone, b("Телефон")], [StepOut, b("Петя", 2)],
  [Hall, b("Длинный")], [Numbers, b("Тридцать", 1)], [Mine, b("Это", 1)], [LightUnder, b("Под")], [Listen, b("Петя", 3)], [VoiceDoor, b("Не", 1)],
  [LiftLeaves, b("Сзади")], [Ask, b("А", 1)], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "02:43"], [b("Петя", 2), "02:45"], [b("Сзади"), "02:51"]];
const RED_RE = /^(темноту|мёртв|нет|гаснет|шесть|пети|голос|открывай|я|хлопают|вверх|него|ты)/i;
const YEL_RE = /^(девятый|телефон|семь|процентов|коридор|двери|квартиры|тридцать|свет|собственный|петя|сыростью|бетоном)/i;
export const Lift2: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_L2} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/lift2" ask={[wd("ты")]} />;
