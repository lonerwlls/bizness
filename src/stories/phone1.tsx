// История «Чужой телефон», часть 1: телефон с рук, сообщения с незнакомого номера, автобус 47 и водитель с закрытыми глазами.
import React from "react";
import { ip } from "../food/common";
import { Brackets, Cam, MONO, PH, RED, Tag, W, rnd } from "../foodshort/FoodShort";
import { Petya, PLook, pStand, pWalk } from "../foodshort/petya";
import { SShot, StoryShell, Voice, YEL, timing, words } from "../foodshort/shell";
import { AD_LEN_VX } from "./lift1";
import { VOICE as V } from "./phone1.voice";

const VOICE = V as Voice;
const { wd, at, b } = words(VOICE);
const INK = "#0b0f22";
// быстрый плавный наезд камеры на слове w: 0 → 1 за d секунд
const pk = (T: number, w: string, n = 1, d = 0.45) => ip(T, [at(w, n) - 0.12, at(w, n) - 0.12 + d], [0, 1]);
const mix = (a: number, b2: number, k: number) => a + (b2 - a) * k;
export const AD1_P1 = wd("шаг").e + 0.4;
export const TM_P1 = timing(VOICE, AD1_P1, AD_LEN_VX, false);
const DRIVER: PLook = { hair: "#1e1a18", hairSh: "#0e0c0a", top: "#2d4a7a", topSh: "#203658", skin: "#d8a88a", skinSh: "#a87a64" };
const SELLER: PLook = { top: "#26262c", topSh: "#18181c", pants: "#1e1e24", pantsSh: "#141418", skin: "#6a5048", skinSh: "#3a2a26" };

// ---------- телефон ----------
type Msg = { text: string; at: number };
const wrap = (s: string, n = 18) => { const out: string[] = []; let cur = ""; for (const w of s.split(" ")) { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); } if (cur) out.push(cur); return out; };
const PhoneBody: React.FC<{ x?: number; y?: number; s?: number; children: React.ReactNode; buzz?: number }> = ({ x = 540, y = 600, s = 1, children, buzz = 0 }) => (
  <g transform={`translate(${x + buzz * Math.sin(buzz * 90) * 8} ${y}) scale(${s}) rotate(${buzz * 2})`}>
    <rect x={-250} y={-470} width={500} height={940} rx={56} fill="#15161a" stroke={INK} strokeWidth={10} />
    <rect x={-250} y={-470} width={500} height={940} rx={56} fill="none" stroke="#3a3c44" strokeWidth={4} />
    <clipPath id="scr"><rect x={-222} y={-442} width={444} height={884} rx={38} /></clipPath>
    <g clipPath="url(#scr)">{children}</g>
    <rect x={-50} y={-430} width={100} height={22} rx={11} fill="#05060a" />
    {[0, 1].map((k) => <path key={k} d={`M ${-280 - k * 24} -120 Q ${-300 - k * 24} 0 ${-280 - k * 24} 120`} stroke={YEL} strokeWidth={6} fill="none" opacity={buzz > 0 ? 0.7 : 0} />)}
    {[0, 1].map((k) => <path key={"r" + k} d={`M ${280 + k * 24} -120 Q ${300 + k * 24} 0 ${280 + k * 24} 120`} stroke={YEL} strokeWidth={6} fill="none" opacity={buzz > 0 ? 0.7 : 0} />)}
  </g>
);
const Chat: React.FC<{ msgs: Msg[]; T: number; typing?: number }> = ({ msgs, T, typing = 0 }) => {
  const shown = msgs.filter((m) => T >= m.at);
  let y = -250;
  return <g>
    <rect x={-222} y={-442} width={444} height={884} fill="#0f1220" />
    <rect x={-222} y={-442} width={444} height={150} fill="#181c2e" />
    <circle cx={-150} cy={-350} r={34} fill="#3a3f55" /><text x={-150} y={-336} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={40} fill="#8a90a8">?</text>
    <text x={-100} y={-356} fontFamily="FsMont" fontWeight={900} fontSize={32} fill="#fff">НОМЕР СКРЫТ</text>
    <text x={-100} y={-320} fontFamily={MONO} fontSize={20} fill="#6a7090">в сети</text>
    {shown.slice(-4).map((m, i) => {
      const L = wrap(m.text), h = L.length * 46 + 34, k = Math.min(1, (T - m.at) / 0.18);
      const g = <g key={i} transform={`translate(-196 ${y}) scale(${0.9 + 0.1 * k})`} opacity={k}>
        <rect x={0} y={0} width={380} height={h} rx={26} fill="#2a2f48" stroke="#4a5070" strokeWidth={2} />
        {L.map((l, j) => <text key={j} x={24} y={52 + j * 46} fontFamily="FsMont" fontWeight={800} fontSize={36} fill="#fff">{l}</text>)}
      </g>;
      y += h + 22; return g;
    })}
    {typing > 0 ? <g transform={`translate(-196 ${y})`}><rect width={120} height={60} rx={30} fill="#2a2f48" />{[0, 1, 2].map((k) => <circle key={k} cx={30 + k * 30} cy={30} r={8} fill="#8a90a8" opacity={0.4 + 0.6 * Math.abs(Math.sin(T * 6 + k))} />)}</g> : null}
  </g>;
};
// фото на заставке: Петя спит, снято сверху из угла комнаты
const SleepPhoto: React.FC<{ T: number; hand?: number }> = ({ T, hand = 0 }) => (
  <g>
    <rect width={W} height={PH} fill="#141a30" />
    <polygon points="0,0 1080,0 1080,180 0,320" fill="#1a2140" />
    <rect x={140} y={120} width={220} height={260} fill="#2a3a60" stroke={INK} strokeWidth={8} /><path d="M 250 120 L 250 380 M 140 250 L 360 250" stroke={INK} strokeWidth={8} />
    <polygon points="140,380 360,380 520,760 200,760" fill="#9fb4d8" opacity={0.08} />
    {/* приоткрытая дверь комнаты */}
    <rect x={470} y={190} width={160} height={380} fill="#3a3456" stroke={INK} strokeWidth={8} /><polygon points="540,570 630,570 720,700 560,700" fill="#5a5078" opacity={0.35} />
    <polygon points="470,190 540,215 540,560 470,570" fill="#2a2440" stroke={INK} strokeWidth={6} />
    {hand > 0 ? <g opacity={hand}><path d="M 560 570 L 560 330 Q 562 280 590 276 Q 618 280 620 330 L 620 570 Z" fill="#0f1018" /><circle cx={590} cy={262} r={26} fill="#0f1018" />
      {[-1, 1].map((k) => <circle key={k} cx={590 + k * 9} cy={260} r={3.5} fill="#ff4a4a" />)}</g> : null}
    {/* кровать */}
    <rect x={120} y={560} width={760} height={380} rx={20} fill="#3a3248" stroke={INK} strokeWidth={8} />
    <rect x={150} y={590} width={190} height={130} rx={30} fill="#d8d4e0" stroke={INK} strokeWidth={6} />
    <g transform="rotate(-90 300 660)"><Petya x={300} y={660 + 450} s={1} pose={pStand(0, { expr: { eyes: "closed", mouth: "flat" } })} /></g>
    <path d="M 296 600 Q 320 540 420 545 L 870 540 L 870 920 L 300 920 Q 280 760 296 600 Z" fill="#5a4a78" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${400 + k * 110} 620 Q ${420 + k * 110} 760 ${400 + k * 110} 900`} stroke="#4a3c66" strokeWidth={6} fill="none" />)}
    {Array.from({ length: 60 }, (_, i) => <rect key={i} x={rnd(i + Math.floor(T * 12)) * W} y={rnd(i * 3 + Math.floor(T * 12)) * PH} width={3} height={3} fill="#fff" opacity={0.08} />)}
  </g>
);
const Lock: React.FC<{ T: number; zoom?: number; hand?: number; stamp?: number }> = ({ T, zoom = 0, hand = 0, stamp = 0 }) => (
  <g>
    <g transform={`translate(${-0.75 * (1 + zoom) * 470} ${-0.75 * (1 + zoom) * 420}) scale(${0.75 * (1 + zoom)})`}><SleepPhoto T={T} hand={hand} /></g>
    <rect x={-222} y={-442} width={444} height={884} fill="#000" opacity={0.15} />
    <text x={0} y={-330} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={90} fill="#fff" opacity={0.92}>07:41</text>
    <text x={0} y={-296} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="#fff" opacity={0.8}>четверг, 13 ноября</text>
    {stamp > 0 ? <g opacity={stamp}><rect x={-160} y={330} width={320} height={60} rx={12} fill="rgba(0,0,0,0.65)" stroke={RED} strokeWidth={3} /><text x={0} y={370} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={RED}>СНЯТО 03:12</text></g> : null}
  </g>
);

// ---------- улица и автобус ----------
const Street: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f86b0" /><stop offset="1" stopColor="#e8c4a8" /></linearGradient></defs>
    <rect width={W} height={PH} fill="url(#msky)" />
    {[[0, 380, 220], [200, 300, 180], [360, 420, 240], [580, 260, 200], [760, 360, 180], [920, 300, 200]].map(([x, h, w], i) =>
      <g key={i}><rect x={x} y={760 - h} width={w} height={h} fill={i % 2 ? "#5a6488" : "#4e587c"} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x + 24 + (k % 3) * 56} y={790 - h + Math.floor(k / 3) * 70} width={30} height={40} fill={rnd(i * 9 + k) > 0.6 ? "#ffd88a" : "#3a4266"} />)}</g>)}
    <rect y={760} width={W} height={120} fill="#8a8a90" stroke={INK} strokeWidth={5} />
    <rect y={880} width={W} height={PH - 880} fill="#3a3c44" />
    {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={((k * 220 - T * 0) % 1300) - 60} y={1010} width={120} height={14} fill="#d8d8d0" />)}
    {/* остановка */}
    <g transform="translate(560 0)">
      <rect x={0} y={480} width={360} height={24} fill="#3a4a6a" stroke={INK} strokeWidth={5} />
      <rect x={10} y={504} width={12} height={276} fill="#3a4a6a" stroke={INK} strokeWidth={4} /><rect x={338} y={504} width={12} height={276} fill="#3a4a6a" stroke={INK} strokeWidth={4} />
      <rect x={40} y={520} width={280} height={160} fill="#bcd4e8" opacity={0.35} stroke={INK} strokeWidth={4} />
      <rect x={60} y={720} width={240} height={20} fill="#6a5040" stroke={INK} strokeWidth={4} />
      <rect x={-90} y={420} width={10} height={360} fill="#5a5a60" stroke={INK} strokeWidth={3} />
      <circle cx={-85} cy={420} r={50} fill="#f2f2f2" stroke={INK} strokeWidth={6} /><text x={-85} y={438} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={50} fill="#2d4a7a">47</text>
    </g>
  </g>
);
const Bus: React.FC<{ x: number; y?: number; door: number; T: number; driverSmile?: number }> = ({ x, y = 860, door, T }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-420} width={1200} height={380} rx={40} fill="#e8b830" stroke={INK} strokeWidth={9} />
    <rect x={0} y={-150} width={1200} height={40} fill="#c8962a" />
    <rect x={30} y={-400} width={300} height={50} rx={8} fill="#1a1a1a" /><text x={180} y={-362} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill="#ffa030">47 ▸ ЦЕНТР</text>
    {/* лобовое окно и водитель */}
    <rect x={20} y={-340} width={140} height={190} rx={18} fill="#2a3448" stroke={INK} strokeWidth={6} />
    <g clipPath="url(#busw)"><clipPath id="busw"><rect x={20} y={-340} width={140} height={190} rx={18} /></clipPath>
      <Petya x={110} y={-340 + 600 * 0.5} s={0.5} look={DRIVER} pose={pStand(T * 30, { turn: -0.6, expr: { eyes: "closed", mouth: "smile" } })} /></g>
    {[0, 1, 2, 3].map((k) => <rect key={k} x={480 + k * 175} y={-340} width={150} height={150} rx={12} fill="#3a4a66" stroke={INK} strokeWidth={6} />)}
    {/* двери */}
    <rect x={250} y={-340} width={180} height={300} fill="#1a1d28" stroke={INK} strokeWidth={6} />
    <rect x={250} y={-340} width={90 * (1 - door) + 2} height={300} fill="#6a7a96" stroke={INK} strokeWidth={5} />
    <rect x={430 - 90 * (1 - door) - 2} y={-340} width={90 * (1 - door) + 2} height={300} fill="#6a7a96" stroke={INK} strokeWidth={5} />
    {[150, 1000].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={62} fill="#22232a" stroke={INK} strokeWidth={8} /><circle cx={wx} cy={-30} r={24} fill="#8a8a90" /></g>)}
    <rect x={-6} y={-120} width={30} height={40} rx={6} fill="#fff6d0" stroke={INK} strokeWidth={4} />
  </g>
);

// ---------- сцены ----------
const Hook: SShot = ({ t, T }) => (<>
  <Cam s={ip(t, [0, 2.2], [1.12, 1.04])} cx={540} cy={600} shake={t < 0.5 ? 0.2 : 0}>
    <rect width={W} height={PH} fill="#05060d" />
    <ellipse cx={540} cy={560} rx={520} ry={600} fill="#1a2350" opacity={0.5} />
    <PhoneBody buzz={t < 0.5 ? 1 : 0}><Chat msgs={[{ text: "Не садись в 47-й", at: 0.05 }]} T={T} /></PhoneBody>
  </Cam>
  <g transform="translate(800 1080) rotate(-4)" opacity={ip(t, [0.2, 0.4], [0, 1])}>
    <rect x={-150} y={-40} width={300} height={80} rx={6} fill="#f1e2b8" />
    <text x={0} y={2} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={30} fill="#2a1a10">ЧУЖОЙ ТЕЛЕФОН</text>
    <text x={0} y={28} textAnchor="middle" fontFamily={MONO} fontSize={16} fill="#6a4a2a" letterSpacing={3}>ЧАСТЬ 1</text>
  </g>
</>);
const Evening: SShot = ({ t, T }) => (
  <><Cam s={mix(ip(t, [0, 4.4], [1.15, 1.3]), 2.3, pk(T, "час"))} cx={mix(540, 585, pk(T, "час"))} cy={mix(640, 520, pk(T, "час"))}>
    <rect width={W} height={PH} fill="#141a34" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 190} y={200 + (i % 3) * 60} width={170} height={900} fill="#1c2346" stroke={INK} strokeWidth={4} />)}
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={30 + (i % 6) * 190 + (Math.floor(i / 6) % 2) * 80} y={280 + Math.floor(i / 6) * 140} width={40} height={56} fill={rnd(i) > 0.5 ? "#ffd88a" : "#2a3260"} />)}
    <rect y={1000} width={W} height={180} fill="#22243a" />
    <ellipse cx={560} cy={700} rx={260} ry={360} fill="#9fb4ff" opacity={0.12} />
    <Petya x={540} y={1060} s={1.3} pose={pStand(T * 30, { turn: 0.2, handR: [40, -400], handL: [-10, -390], tilt: 8, expr: { eyes: "open", brows: 0.6, mouth: "flat", look: [0.3, 0.6] } })} />
    <rect x={540 + 40 * 1.3 - 25} y={1060 - 400 * 1.3 - 66} width={50} height={86} rx={8} fill="#15161a" stroke="#9fb4ff" strokeWidth={3} />
  </Cam><g opacity={ip(T, [at("час"), at("час") + 0.3], [0, 1])}><Tag x={540} y={215} title="КУПЛЕН ЧАС НАЗАД" sub="ТЕЛЕФОН С РУК" c={YEL} w={320} /></g></>
);
const Seller: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 2.6], [1.1, 1.22])} cx={540} cy={640}>
    <rect width={W} height={PH} fill="#10131f" />
    <rect x={0} y={0} width={W} height={120} fill="#2a1a1a" /><path d="M 0 120 L 80 170 L 160 120 L 240 170 L 320 120 L 400 170 L 480 120 L 560 170 L 640 120 L 720 170 L 800 120 L 880 170 L 960 120 L 1040 170 L 1080 140" fill="#7a2a2a" stroke={INK} strokeWidth={5} />
    <Petya x={700} y={1000} s={1.3} look={SELLER} pose={pStand(T * 30, { hood: true, turn: -0.3, handL: [-120, -330], expr: { eyes: "squint", mouth: "flat" } })} />
    <ellipse cx={700 - 6} cy={1000 - 528 * 1.3 + 10} rx={34} ry={40} fill="#05060a" opacity={0.7} />
    <rect x={120} y={760} width={840} height={60} fill="#5a4030" stroke={INK} strokeWidth={6} /><rect x={140} y={820} width={800} height={360} fill="#3a2a20" stroke={INK} strokeWidth={6} />
    {[[220, 0], [360, 1], [480, 2]].map(([x, i]) => <rect key={i} x={x} y={710} width={70} height={52} rx={6} fill="#22232a" stroke={INK} strokeWidth={4} transform={`rotate(${-8 + i * 7} ${x + 35} 736)`} />)}
    <g transform="translate(520 640)"><rect x={-40} y={-70} width={80} height={140} rx={12} fill="#15161a" stroke={INK} strokeWidth={5} /><rect x={-32} y={-60} width={64} height={120} rx={8} fill="#2a3a66" /></g>
    <g opacity={ip(T, [at("пятьсот"), at("пятьсот") + 0.25], [0, 1])} transform="translate(380 560) rotate(-6)">
      <rect x={-90} y={-40} width={180} height={80} rx={8} fill="#f8f0d0" stroke={INK} strokeWidth={5} /><text x={0} y={18} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={48} fill={RED}>500 ₽</text>
    </g>
    <rect width={W} height={PH} fill="#000" opacity={0.2} />
  </Cam>
);
const Hidden: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 1.4], [1.7, 1.85])} cx={540} cy={330}>
    <rect width={W} height={PH} fill="#05060d" />
    <PhoneBody><Chat msgs={[{ text: "Не садись в 47-й", at: 0 }]} T={T} /></PhoneBody>
    <Brackets x={300} y={130} w={480} h={110} c={RED} />
  </Cam>
);
const Laugh: SShot = ({ t, T }) => {
  const pk = ip(T, [at("убирает"), at("карман") + 0.2], [0, 1]);
  return <><Cam s={ip(t, [0, 3], [1.5, 1.6])} cx={540} cy={520}>
    <rect width={W} height={PH} fill="#141a34" />
    <Petya x={540} y={1450} s={2} pose={pStand(T * 30, { turn: 0.15, tilt: Math.sin(T * 12) * 3, handR: [70 - 10 * pk, -380 + 150 * pk], expr: { eyes: "squint", brows: -0.4, mouth: "smile", look: [0.2, 0.5] } })} />
    <rect x={540 + (70 - 10 * pk) * 2 - 22} y={1450 + (-380 + 150 * pk) * 2 - 70} width={44} height={74} rx={8} fill="#15161a" stroke="#9fb4ff" strokeWidth={3} opacity={1 - pk} />
  </Cam><g opacity={ip(T, [at("смеётся"), at("смеётся") + 0.3], [0, 1])}><Tag x={540} y={215} title="ШУТКА?" sub="ПЕТЯ НЕ ВЕРИТ" c={YEL} w={260} /></g></>;
};
const Stop: SShot = ({ t, T }) => (
  <><Cam s={mix(ip(t, [0, 5], [1.05, 1.18]), 2.4, pk(T, "Ждёт"))} cx={mix(620, 740, pk(T, "Ждёт"))} cy={mix(620, 470, pk(T, "Ждёт"))}>
    <Street T={T} />
    <Petya x={740} y={800} s={0.75} pose={pStand(T * 30, { turn: -0.6, handL: [-40, -300], expr: { eyes: "open", mouth: "flat", look: [-1, 0] } })} />
  </Cam><g opacity={ip(T, [at("остановке"), at("остановке") + 0.3], [0, 1])}><Tag x={540} y={215} title="УТРО, 07:40" sub="ОСТАНОВКА · АВТОБУС 47" c={YEL} w={320} /></g></>
);
const Buzz: SShot = ({ t, T }) => {
  const bz = T > at("Телефон", 1) && T < at("Я") ? (Math.floor(T * 8) % 3 === 0 ? 0 : 1) : 0;
  return <Cam s={ip(t, [0, 3.4], [1.05, 1.12])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody buzz={bz}><Chat msgs={[{ text: "Не садись в 47-й", at: 0 }, { text: "Я серьёзно. Не садись.", at: at("Я") }]} T={T} typing={T > at("вибрирует", 1) && T < at("Я") ? 1 : 0} /></PhoneBody>
  </Cam>;
};
const Arrive: SShot = ({ t, T }) => {
  const bx = ip(T, [at("Автобус", 1) - 0.1, at("подъезжает") + 0.9], [1200, 120]);
  const door = ip(T, [at("открываются") - 0.1, at("открываются") + 0.5], [0, 1]);
  return <Cam s={mix(ip(t, [0, 3], [1.05, 1.12]), 1.75, pk(T, "открываются"))} cx={mix(600, 470, pk(T, "открываются"))} cy={mix(620, 760, pk(T, "открываются"))}>
    <Street T={T} />
    <Petya x={740} y={800} s={0.75} pose={pStand(T * 30, { turn: -0.6, expr: { eyes: "open", mouth: "flat", look: [-1, 0.2] } })} />
    <Bus x={bx} y={1060} door={door} T={T} />
  </Cam>;
};
const Step: SShot = ({ t, T }) => {
  const st = ip(T, [at("делает"), at("шаг") + 0.4], [0, 1]);
  return <Cam s={ip(t, [0, 2], [1.7, 1.85])} cx={520} cy={760}>
    <Street T={T} />
    <Bus x={120} y={1060} door={1} T={T} />
    <Petya x={640 - 80 * st} y={1000 - 10 * st} s={0.9} pose={pWalk(T * 30, st * 70, -1, { expr: { eyes: "open", mouth: "tight", look: [-1, 0] } })} />
    <rect width={W} height={PH} fill="#000" opacity={0.1} />
  </Cam>;
};
const Look: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 4], [1.05, 1.12])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody><Chat msgs={[{ text: "Я серьёзно. Не садись.", at: 0 }, { text: "Посмотри на водителя", at: at("Посмотри") }]} T={T} typing={T < at("Посмотри") ? 1 : 0} /></PhoneBody>
  </Cam>
);
const Peek: SShot = ({ t, T }) => (
  <Cam s={mix(1.3, 2.7, pk(T, "смотрит", 1, 0.6))} cx={mix(420, 590, pk(T, "смотрит", 1, 0.6))} cy={mix(720, 560, pk(T, "смотрит", 1, 0.6))}>
    <Street T={T} />
    <Bus x={120} y={1060} door={1} T={T} />
    <Petya x={600} y={1000} s={0.9} pose={pStand(T * 30, { turn: -0.8, lean: -6, expr: { eyes: "wide", brows: 0.8, mouth: "tight", look: [-1, -0.2] } })} />
  </Cam>
);
const Driver: SShot = ({ t, T }) => {
  const sm = T > at("улыбается") - 0.05;
  const s = 2.6, hx = 520, hy = 1850;
  return <><Cam s={mix(ip(t, [0, 4.6], [1, 1.12]), 1.75, pk(T, "улыбается", 1, 0.35))} cx={520} cy={mix(560, 480, pk(T, "улыбается", 1, 0.35))} shake={sm && T < at("улыбается") + 0.3 ? 0.12 : 0}>
    <rect width={W} height={PH} fill="#1a2030" />
    <rect x={0} y={760} width={W} height={420} fill="#2a2f3a" />
    <circle cx={720} cy={900} r={240} fill="#15161a" stroke={INK} strokeWidth={14} /><circle cx={720} cy={900} r={60} fill="#3a3c44" />
    <Petya x={hx} y={hy} s={s} look={DRIVER} pose={pStand(T * 30, { turn: -0.15, handL: [-20, -330], handR: [90, -310], expr: { eyes: "closed", blink: 0, brows: sm ? 0.6 : 0, mouth: sm ? "smile" : "flat" } })} />
    {/* фуражка */}
    <g transform={`translate(${hx - 6} ${hy - 528 * s - 40 * s}) scale(${s})`}>
      <path d="M -40 6 Q -38 -26 0 -28 Q 38 -26 40 6 Z" fill="#203658" stroke={INK} strokeWidth={3} />
      <path d="M -44 6 L 44 6 L 34 18 L -34 18 Z" fill="#111" stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-6} r={6} fill="#e8b830" stroke={INK} strokeWidth={2} />
    </g>
    <rect width={W} height={PH} fill="#000" opacity={0.2} />
  </Cam><g opacity={ip(T, [at("закрытыми"), at("закрытыми") + 0.3], [0, 1])}><Tag x={540} y={215} title="ГЛАЗА ЗАКРЫТЫ" sub={sm ? "И ОН УЛЫБАЕТСЯ" : "ВОДИТЕЛЬ"} c={RED} w={320} /></g></>;
};
const Leave: SShot = ({ t, T }) => {
  const door = ip(T, [at("закрываются") - 0.2, at("закрываются") + 0.3], [1, 0]);
  const bx = ip(T, [at("Автобус", 2), at("Пети") + 0.8], [120, -1400]);
  return <><Cam s={mix(ip(t, [0, 3.8], [1.05, 1.15]), 2.6, pk(T, "без"))} cx={mix(600, 740, pk(T, "без"))} cy={mix(620, 545, pk(T, "без"))}>
    <Street T={T} />
    <Bus x={bx} y={1060} door={door} T={T} />
    <Petya x={740} y={1000} s={0.9} pose={pStand(T * 30, { turn: -0.4, expr: { eyes: "wide", mouth: "o", look: [-1, 0] } })} />
  </Cam><g opacity={ip(T, [at("без"), at("без") + 0.3], [0, 1])}><Tag x={540} y={215} title="УЕХАЛ" sub="БЕЗ ПЕТИ" c={YEL} w={260} /></g></>;
};
const Good: SShot = ({ t, T }) => {
  const bz = T < at("Молодец") ? (Math.floor(T * 8) % 3 === 0 ? 0 : 1) : 0;
  return <Cam s={ip(t, [0, 4], [1.05, 1.12])} cx={540} cy={580}>
    <rect width={W} height={PH} fill="#0a0d1a" />
    <PhoneBody buzz={bz}><Chat msgs={[{ text: "Посмотри на водителя", at: 0 }, { text: "Молодец. Теперь проверь заставку", at: at("Молодец") }]} T={T} typing={T < at("Молодец") ? 1 : 0} /></PhoneBody>
  </Cam>;
};
const Opens: SShot = ({ t, T }) => (
  <Cam s={mix(ip(t, [0, 2.2], [1.6, 1.75]), 2.8, pk(T, "экран"))} cx={mix(540, 615, pk(T, "экран"))} cy={mix(560, 560, pk(T, "экран"))}>
    <Street T={T} /><rect width={W} height={PH} fill="#000" opacity={0.35} />
    <ellipse cx={560} cy={460} rx={220} ry={260} fill="#9fb4ff" opacity={0.15} />
    <Petya x={540} y={1450} s={2} pose={pStand(T * 30, { turn: 0.1, tilt: 6, handR: [40, -400], handL: [-20, -392], expr: { eyes: "open", brows: 0.5, mouth: "tight", look: [0.2, 0.7] } })} />
    <rect x={540 + 40 * 2 - 45} y={1450 - 400 * 2 - 120} width={90} height={150} rx={12} fill="#15161a" stroke="#9fb4ff" strokeWidth={4} />
  </Cam>
);
const LockShot: SShot = ({ t, T }) => {
  const z = ip(T, [at("Петя", 6), at("кровати") + 0.4], [0, 0.2]);
  return <><Cam s={ip(t, [0, 3.6], [1.05, 1.2])} cx={540} cy={600}>
    <rect width={W} height={PH} fill="#05060d" />
    <PhoneBody><Lock T={T} zoom={z} /></PhoneBody>
  </Cam><g opacity={ip(T, [at("спит"), at("спит") + 0.3], [0, 1])}><Tag x={540} y={1090} title="ЭТО ПЕТЯ" sub="СПИТ. ЭТОЙ НОЧЬЮ" c={RED} w={300} /></g></>;
};
const Stamp: SShot = ({ t, T }) => (
  <Cam s={ip(t, [0, 3.4], [1.3, 1.55])} cx={620} cy={ip(t, [0, 3.4], [600, 560])} shake={T > at("комнаты") && T < at("комнаты") + 0.3 ? 0.15 : 0}>
    <rect width={W} height={PH} fill="#05060d" />
    <PhoneBody><Lock T={T} zoom={0.6} stamp={ip(T, [at("Снято"), at("Снято") + 0.2], [0, 1])} hand={ip(T, [at("Из") - 0.1, at("комнаты") + 0.4], [0, 1])} /></PhoneBody>
    <g opacity={ip(T, [at("Из"), at("Из") + 0.3], [0, 1])}><Brackets x={530} y={320} w={210} h={480} c={RED} /></g>
  </Cam>
);
const EndCard: SShot = ({ t, T }) => {
  const g = Math.round(T * 30), gl = g % 23 < 3 ? (rnd(g) - 0.5) * 30 : 0;
  return <g>
    <defs><radialGradient id="egp1"><stop offset="0" stopColor="#3a0a10" /><stop offset="1" stopColor="#000" /></radialGradient></defs>
    <rect width={W} height={PH} fill="url(#egp1)" />
    <g opacity={ip(t, [0, 0.4], [0, 1])} style={{ filter: "drop-shadow(0 0 30px #ff2a2a)" }}>
      <text x={540 + gl} y={560} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>КТО СНИМАЛ</text>
      <text x={540 - gl} y={680} textAnchor="middle" fontFamily="FsMont" fontWeight={900} fontSize={96} fill={RED}>ПЕТЮ?</text>
      {gl ? <rect x={0} y={580 + gl * 3} width={W} height={10} fill="#5fd8f0" opacity={0.6} /> : null}
    </g>
    <g opacity={ip(t, [0.6, 1.0], [0, 1])}><path d="M 340 760 L 440 760 M 640 760 L 740 760" stroke="#888" strokeWidth={3} />
      <text x={540} y={770} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#bbb" letterSpacing={6}>ЧАСТЬ 2</text></g>
  </g>;
};

const CUTS: [SShot, number][] = [
  [Hook, 0], [Evening, b("Это")], [Seller, b("С")], [Hidden, b("Номер")], [Laugh, b("Петя", 2)], [Stop, b("Утром")], [Buzz, b("Телефон", 1)],
  [Arrive, b("Автобус", 1)], [Step, b("Петя", 3)], [Look, b("Новое")], [Peek, b("Петя", 4)], [Driver, b("Водитель")], [Leave, b("Двери", 2)],
  [Good, b("Телефон", 2)], [Opens, b("Петя", 5)], [LockShot, b("На")], [Stamp, b("Снято")], [EndCard, VOICE.dur + 0.15],
];
const CLOCK: [number, string][] = [[0, "22:14"], [b("Утром"), "07:38"], [b("Петя", 5), "07:41"]];
const RED_RE = /^(садись|седьмой|скрыт|серьёзно|водителя|закрытыми|глазами|улыбается|заставку|спит|ночью|комнаты)/i;
const YEL_RE = /^(сорок|телефон|пятьсот|рублей|остановке|автобус|двери|шаг|сообщение|петя|пети|молодец|фото|кровати)/i;
export const Phone1: React.FC = () => <StoryShell voice={VOICE} ad1={AD1_P1} adLen={AD_LEN_VX} capTop={1480} dimAd endAd={false} cuts={CUTS} clock={CLOCK} red={RED_RE} yel={YEL_RE} dir="stories/phone1" glide />;
