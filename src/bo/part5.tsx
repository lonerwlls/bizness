// Часть 5/10: дни 8–10 — аккумулятор машины, солнечные фонари, велосипед-генератор и радио.
import React from "react";
import { Bean, Cam, Frame, Glow, HERO2D, SoundRings, Voice, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, BoCar, GY, HS, Hero, INK, Street, Svg, Skyline, StoreFront, walk, walkDx } from "./scenes";
import { VOICE } from "./voices/p5";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const CARX = 900, CARY = GY + 120;
// машина с открытым капотом: капот (перед справа) поднят, внутри виден аккумулятор
const CK = 2.2; // машина в реальном размере рядом с героем (рост героя ≈ 1,8 м)
const BATT: [number, number] = [CARX + 90 * CK, CARY - 140 * CK]; // аккумулятор под капотом (мир)
const OpenCar: React.FC<{ open?: number; batt?: boolean; x?: number }> = ({ open = 1, batt = true, x = CARX }) => (
  <g transform={`translate(${x} ${CARY}) scale(${CK}) translate(${-CARX} ${-CARY})`}>
    <BoCar x={CARX} y={CARY} c="#5ad8c8" />
    <g transform={`translate(${CARX + 30} ${CARY - 98})`}>
      <rect x={10} y={-6} width={110} height={30} fill="#262838" stroke={INK} strokeWidth={4} />
      {batt ? <g transform="translate(60 -8)"><rect x={-28} y={-30} width={56} height={34} rx={4} fill="#3a3a5a" stroke={INK} strokeWidth={4} /><rect x={-20} y={-38} width={10} height={8} fill="#ff4a6a" stroke={INK} strokeWidth={2} /><rect x={10} y={-38} width={10} height={8} fill="#5a7cf0" stroke={INK} strokeWidth={2} /></g> : null}
      <g transform={`rotate(${-open * 55} 10 0)`}><path d="M 10 0 L 130 6 L 128 18 L 10 14 Z" fill="#5ad8c8" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
    </g>
  </g>
);
const INV: [number, number] = [CARX + 470, CARY + 30];
const Cables: React.FC = () => <>
  <path d={`M ${BATT[0] - 15} ${BATT[1]} Q ${BATT[0] + 60} ${CARY - 40} ${INV[0] - 40} ${INV[1] - 40}`} stroke="#ff4a6a" strokeWidth={6} fill="none" />
  <path d={`M ${BATT[0] + 20} ${BATT[1]} Q ${BATT[0] + 90} ${CARY - 30} ${INV[0] - 20} ${INV[1] - 40}`} stroke={INK} strokeWidth={6} fill="none" />
</>;
// инвертор с проводами к аккумулятору и телефоном
const Inverter: React.FC<{ x: number; y: number; on?: boolean }> = ({ x, y, on }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-60} y={-50} width={120} height={50} rx={8} fill="#5a5680" stroke={INK} strokeWidth={5} />
    {[-40, -20, 0, 20].map((k) => <path key={k} d={`M ${k} -46 L ${k} -6`} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    <circle cx={40} cy={-25} r={7} fill={on ? "#5ac84a" : "#3a3a5a"} stroke={INK} strokeWidth={2} />
    {on ? <Glow x={40} y={-25} r={30} g="gC" /> : null}
  </g>
);
// экран телефона крупно: kind = "boot" | "photos" | "msgs" | "nosignal"
const BigPhone: React.FC<{ kind: string; g: number; shake?: number }> = ({ kind, g, shake = 0 }) => (
  <g transform={`translate(${960 + Math.sin(g * 1.7) * shake} ${560 + Math.cos(g * 1.3) * shake})`}>
    <rect x={-210} y={-400} width={420} height={800} rx={50} fill="#262838" stroke={INK} strokeWidth={10} />
    <rect x={-182} y={-360} width={364} height={720} rx={20} fill={kind === "boot" ? "#141228" : "#3a4ab8"} />
    {kind === "boot" ? <circle cx={0} cy={0} r={ip(g, [0, 20], [0, 60])} fill="#fff" opacity={ip(g, [0, 20], [0, 0.8])} /> : null}
    {kind === "photos" ? [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <g key={i} transform={`translate(${-120 + (i % 3) * 120} ${-220 + Math.floor(i / 3) * 150})`}>
      <rect x={-52} y={-60} width={104} height={120} rx={8} fill={["#ff9ac0", "#ffd27a", "#9fdcff", "#c8b8e8", "#5ad8c8"][i % 5]} stroke={INK} strokeWidth={4} />
      <circle cx={-10} cy={-10} r={18} fill="#f8f6f0" stroke={INK} strokeWidth={3} /><path d="M -40 50 Q -10 10 30 50 Z" fill={["#f27a2a", "#5a7cf0", "#ff4a6a"][i % 3]} stroke={INK} strokeWidth={3} /></g>) : null}
    {kind === "msgs" ? [0, 1, 2, 3, 4].map((i) => <rect key={i} x={i % 2 ? -150 : -10} y={-300 + i * 120} width={160} height={80} rx={26} fill={i % 2 ? "#e8e4ff" : "#5ac84a"} stroke={INK} strokeWidth={4} opacity={ip(g, [i * 4, i * 4 + 4], [0, 1])} />) : null}
    {kind === "nosignal" ? <g>{[0, 1, 2, 3].map((i) => <rect key={i} x={-90 + i * 50} y={40 - i * 40} width={34} height={40 + i * 40} rx={6} fill="#5a5680" stroke={INK} strokeWidth={4} />)}
      <path d="M -120 -110 L 120 110 M 120 -110 L -120 110" stroke="#ff3a4a" strokeWidth={24} strokeLinecap="round" opacity={ip(g, [4, 10], [0, 1])} /></g> : null}
  </g>
);
const PovHands: React.FC = () => <>{[-1, 1].map((k) => <g key={k} transform={`translate(${960 + k * 250} 900) rotate(${k * 30}) scale(${k} 1)`}>
  <rect x={0} y={-70} width={700} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} /><ellipse cx={-30} cy={0} rx={80} ry={66} fill="#f8f6f0" stroke={INK} strokeWidth={10} /></g>)}</>;
// вышка связи
const Tower: React.FC<{ x: number; y: number; dead?: number; f: number }> = ({ x, y, dead = 0, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -110 0 L 0 -700 L 110 0 M -80 -180 L 80 -180 M -55 -360 L 55 -360 M -30 -540 L 30 -540 M -80 -180 L 55 -360 M 80 -180 L -55 -360 M -55 -360 L 30 -540 M 55 -360 L -30 -540" stroke={INK} strokeWidth={12} fill="none" />
    {[-1, 1].map((k) => <rect key={k} x={k * 30 - 14} y={-660} width={28} height={90} rx={6} fill="#e8e4ff" stroke={INK} strokeWidth={5} />)}
    <circle cx={0} cy={-710} r={18} fill={dead > 0.5 ? "#3a2a4a" : "#ff3a4a"} stroke={INK} strokeWidth={5} />
    {dead < 0.5 && f % 20 < 10 ? <Glow x={0} y={-710} r={80} g="gR" /> : null}
    <g transform="translate(150 -60)"><rect x={-60} y={-90} width={120} height={90} rx={8} fill="#5a5680" stroke={INK} strokeWidth={6} /><rect x={-40} y={-70} width={80} height={30} rx={4} fill="#1a1a3a" /><rect x={-36} y={-66} width={72 * (1 - dead)} height={22} fill="#5ac84a" /></g>
  </g>
);
// солнечный фонарик (в землю/на подоконник)
const SolarLamp: React.FC<{ x: number; y: number; on?: boolean; s?: number }> = ({ x, y, on, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-6} y={-80} width={12} height={80} fill="#3a3a5a" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-120} width={52} height={44} rx={8} fill={on ? "#fff2c0" : "#c8c4e0"} stroke={INK} strokeWidth={5} />
    <rect x={-30} y={-132} width={60} height={14} rx={4} fill="#262838" stroke={INK} strokeWidth={4} />
    {on ? <Glow x={0} y={-98} r={90} g="gY" /> : null}
  </g>
);
// велосипед на подставке с генератором и радио, под пропорции героя: седло, каретка, руль
const SEAT = (bx: number): [number, number] => [bx - 10, GY - 200];
const CRANK = (bx: number): [number, number] => [bx + 20, GY - 82];
const BAR = (bx: number): [number, number] => [bx + 120, GY - 290];
const PR = 34;
const pedals = (bx: number, ped: number): [number, number][] => { const [cx, cy] = CRANK(bx); return [[cx + Math.cos(ped + Math.PI) * PR, cy + Math.sin(ped + Math.PI) * PR + 8], [cx + Math.cos(ped) * PR, cy + Math.sin(ped) * PR + 8]]; };
const BikeRig: React.FC<{ x: number; ped: number; on?: boolean; f: number; front?: boolean }> = ({ x, ped, on, f, front }) => {
  const R: [number, number] = [x - 150, GY - 72], Fw: [number, number] = [x + 190, GY - 72], [sx, sy] = SEAT(x), [cx, cy] = CRANK(x), [hx, hy] = BAR(x);
  const crank = (k: number) => { const a = ped + k * Math.PI; return <g key={k}><path d={`M ${cx} ${cy} L ${cx + Math.cos(a) * PR} ${cy + Math.sin(a) * PR}`} stroke={INK} strokeWidth={7} /><rect x={cx + Math.cos(a) * PR - 16} y={cy + Math.sin(a) * PR + 4} width={32} height={9} rx={4} fill="#262838" /></g>; };
  return (
    <g>
      {/* стойка под задним колесом */}
      <path d={`M ${R[0] - 70} ${GY} L ${R[0]} ${R[1]} L ${R[0] + 70} ${GY}`} stroke={INK} strokeWidth={10} fill="none" />
      {[R, Fw].map(([wx, wy], i) => <g key={i}><circle cx={wx} cy={wy} r={70} fill="none" stroke="#262838" strokeWidth={13} />
        <g transform={`rotate(${(i ? 0 : ped) * 57} ${wx} ${wy})`}>{[0, 60, 120].map((a) => <path key={a} d={`M ${wx - 66} ${wy} L ${wx + 66} ${wy}`} stroke="#8a86a8" strokeWidth={3} transform={`rotate(${a} ${wx} ${wy})`} />)}</g></g>)}
      <path d={`M ${R[0]} ${R[1]} L ${cx} ${cy} L ${sx + 6} ${sy + 20} Z M ${cx} ${cy} L ${hx - 20} ${hy + 40} L ${sx + 6} ${sy + 20} M ${hx - 20} ${hy + 40} L ${Fw[0]} ${Fw[1]}`} stroke="#ff6a5a" strokeWidth={12} fill="none" strokeLinejoin="round" />
      <path d={`M ${sx - 30} ${sy} L ${sx + 30} ${sy}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
      <path d={`M ${hx - 20} ${hy + 40} L ${hx} ${hy} L ${hx + 26} ${hy}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      {crank(1)}{front ? null : crank(0)}
      <circle cx={cx} cy={cy} r={12} fill={INK} />
      {/* генератор у заднего колеса и провод к радио */}
      <rect x={R[0] - 120} y={R[1] - 40} width={56} height={64} rx={10} fill="#5a5680" stroke={INK} strokeWidth={5} />
      <path d={`M ${R[0] - 120} ${R[1]} Q ${R[0] - 200} ${GY - 20} ${R[0] - 280} ${GY - 50}`} stroke={INK} strokeWidth={6} fill="none" />
      <g transform={`translate(${R[0] - 380} ${GY})`}><rect x={-100} y={-120} width={200} height={120} rx={16} fill="#c87a4a" stroke={INK} strokeWidth={6} /><circle cx={-45} cy={-60} r={34} fill="#5a4a3a" stroke={INK} strokeWidth={4} /><rect x={10} y={-90} width={70} height={30} rx={4} fill={on ? "#ffd27a" : "#3a3a5a"} stroke={INK} strokeWidth={4} /><path d="M 60 -120 L 100 -220" stroke={INK} strokeWidth={6} />
        {on ? <Glow x={45} y={-75} r={60} g="gY" o={0.6 + 0.3 * Math.sin(f)} /> : null}</g>
    </g>
  );
};
// ближний шатун рисуется поверх ног героя
const FrontCrank: React.FC<{ x: number; ped: number }> = ({ x, ped }) => { const [cx, cy] = CRANK(x); return <g><path d={`M ${cx} ${cy} L ${cx + Math.cos(ped) * PR} ${cy + Math.sin(ped) * PR}`} stroke={INK} strokeWidth={7} /><rect x={cx + Math.cos(ped) * PR - 16} y={cy + Math.sin(ped) * PR + 4} width={32} height={9} rx={4} fill="#262838" /><circle cx={cx} cy={cy} r={12} fill={INK} /></g>; };
// шум радио: зигзаги
const Static: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => <g>{[0, 1, 2].map((i) => <path key={i} d={`M ${x + i * 50} ${y - i * 40} ${Array.from({ length: 6 }, (_, k) => `l 14 ${((f + k + i) % 2 ? -1 : 1) * (14 + ((f * 7 + k * 3) % 10))}`).join(" ")}`} stroke="#e8e4ff" strokeWidth={5} fill="none" opacity={0.8} />)}</g>;
// герой сидит на седле, руки на руле, ступни на педалях (крутит)
const RIDER = (bx: number, ped: number, f: number, expr: any, sweat = false) => { const [sx, sy] = SEAT(bx);
  return <><Bean x={sx} y={GY} s={HS} look={HERO2D} f={f} expr={expr} sweat={sweat} sit={(GY - sy + 6) / HS} feet={pedals(bx, ped)} pose={{ armL: [-82, -6], armR: [98, 4], lean: 12, bob: Math.abs(Math.sin(ped)) * 3 }} />
    <FrontCrank x={bx} ped={ped} /></>; };

export const P5 = makePart(V, [
  // день 8: нужно электричество
  { at: "", s: (g, f, len) => <Apartment cam={C(-140, GY - 280, 2.0)} f={f} tally={ip(g, [0, 20], [7, 8]) > 7.5 ? 8 : 7}>
    <Hero x={-80} y={GY} f={f} expr="determined" gaze={-1} pose={{ armL: [150, ip(g, [0, 20], [-10, 10])], armR: [15, 8], tilt: -8 }} holdL={{ node: <rect x={-8} y={-40} width={16} height={40} fill="#fff" stroke={INK} strokeWidth={4} />, k: 1.2 }} /></Apartment> },
  { at: "city", s: (g, f, len) => <Street cam={camLerp(g, len, C(1100, 520, 0.7), C(1300, 520, 0.75))} f={f} tod="day"><OpenCar open={0} batt={false} /><g transform={`translate(2300 ${CARY}) scale(${CK}) translate(-2300 ${-CARY})`}><BoCar x={2300} y={CARY} c="#ff6a5a" /></g></Street> },
  { at: "Every", s: (g, f, len) => <Street cam={C(1500, 480, 0.55)} f={f} tod="day">{[0, 900, 1800, 2700].map((x, i) => <g key={x} transform={`translate(${x} ${CARY}) scale(${CK}) translate(${-x} ${-CARY})`}><BoCar x={x} y={CARY} c={["#5ad8c8", "#ff6a5a", "#ffd23c", "#5a7cf0"][i]} /></g>)}
    {[0, 900, 1800, 2700].map((x, i) => <g key={"b" + x} opacity={ip(g, [i * 5, i * 5 + 6], [0, 1])}><Glow x={x + 200} y={CARY - 170} r={120} g="gY" /></g>)}</Street> },
  // открывает капот
  { at: "pop", s: (g, f, len) => <Street cam={C(1150, GY - 60, 1.0)} f={f} tod="day"><OpenCar open={ip(g, [4, 14], [0, 1])} />
    <Hero x={CARX + 420} y={CARY + 30} f={f} expr="determined" flip pose={{ armR: [130, 20], armL: [15, 8] }} /></Street> },
  { at: "cheap", s: (g, f, len) => <Street cam={C(CARX + 330, CARY - 140, 1.5)} f={f} tod="day"><OpenCar /><Cables />
    <Inverter x={INV[0]} y={INV[1]} on={g > 15} /></Street> },
  { at: "charge", s: (g, f, len) => <Street cam={C(INV[0] + 60, CARY - 60, 2.0)} f={f} tod="day"><OpenCar /><Cables /><Inverter x={INV[0]} y={INV[1]} on />
    <path d={`M ${INV[0] + 60} ${INV[1] - 24} Q ${INV[0] + 110} ${INV[1]} ${INV[0] + 150} ${INV[1] - 40}`} stroke="#f4f2ff" strokeWidth={6} fill="none" />
    <g transform={`translate(${INV[0] + 160} ${INV[1] - 30}) rotate(-80)`}><rect x={-30} y={-55} width={60} height={110} rx={10} fill="#262838" stroke={INK} strokeWidth={5} /><rect x={-22} y={-44} width={44} height={86} rx={4} fill="#141228" /><rect x={-14} y={-20} width={28} height={14} rx={3} fill="none" stroke="#5ac84a" strokeWidth={3} /><rect x={-12} y={-18} width={24 * ip(g, [0, len], [0.1, 1])} height={10} fill="#5ac84a" /></g></Street> },
  // включает телефон — его глазами
  { at: "turn", s: (g, f, len) => <Frame bg="#4a3a8a"><rect width={1920} height={1080} fill="#4a3a8a" /><PovHands /><BigPhone kind="boot" g={g} shake={3} /></Frame> },
  { at: "photos", s: (g, f, len) => <Frame bg="#4a3a8a"><rect width={1920} height={1080} fill="#4a3a8a" /><PovHands /><BigPhone kind="photos" g={g} shake={1.5} /></Frame> },
  { at: "messages", s: (g, f, len) => <Frame bg="#4a3a8a"><rect width={1920} height={1080} fill="#4a3a8a" /><PovHands /><BigPhone kind="msgs" g={g} shake={1.5} /></Frame> },
  { at: "no", s: (g, f, len) => <Frame bg="#4a3a8a"><rect width={1920} height={1080} fill="#4a3a8a" /><PovHands /><BigPhone kind="nosignal" g={g} /></Frame> },
  { at: "cell", s: (g, f, len) => <Svg><Skyline cam={C(960, 520, 0.9)} f={f} tod="day" midBase={GY + 160} /><Tower x={960} y={1080} f={f} dead={ip(g, [10, len], [0, 1])} /></Svg> },
  // день 9: садовый магазин и солнечные фонари
  { at: "nine", s: (g, f, len) => <Street cam={C(1200, 560, 0.95)} f={f} tod="day" back={<StoreFront x={1300} gap={50} />}>
    <Hero x={700 + walkDx(Math.min(g, 30))} y={GY + 140} f={f} expr="determined" pose={g < 30 ? walk(g) : { armL: [15, 8], armR: [15, 8] }} />
    {[1450, 1550, 1650].map((x) => <SolarLamp key={x} x={x} y={GY + 40} />)}</Street> },
  { at: "grab", s: (g, f, len) => <Street cam={C(1300, GY - 50, 1.6)} f={f} tod="day" back={<StoreFront x={1300} gap={50} />}>
    <Hero x={1300} y={GY + 140} f={f} expr="grin" pose={{ armL: [30, 30], armR: [30, 30] }} />
    {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${1250 + i * 34} ${GY + 20}) rotate(${-10 + i * 7})`}><SolarLamp x={0} y={0} s={0.55} /></g>)}</Street> },
  // на подоконнике днём
  { at: "line", s: (g, f, len) => <Apartment cam={C(1500, GY - 330, 1.9)} f={f} tally={9}>
    {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} opacity={g > i * 4 ? 1 : 0}><SolarLamp x={1300 + i * 90} y={GY - 240} s={0.8} /></g>)}
    <Hero x={1230} y={GY} f={f} expr="neutral" gaze={1} pose={{ armR: [100, 20], tilt: 8 }} /></Apartment> },
  // ночью база светится
  { at: "night", s: (g, f, len) => <Apartment cam={C(1100, 540, 1.1)} f={f} tally={9} tod="night" dark={0.55}>
    {[0, 1, 2, 3, 4, 5].map((i) => <SolarLamp key={i} x={1300 + i * 90} y={GY - 240} s={0.8} on />)}
    {[0, 1].map((i) => <SolarLamp key={"f" + i} x={1150 + i * 120} y={GY} s={0.9} on />)}</Apartment> },
  { at: "first", s: (g, f, len) => <Apartment cam={C(700, GY - 250, 1.8)} f={f} tally={9} tod="night" dark={0.45}>
    <SolarLamp x={925} y={GY - 110} s={0.8} on /><SolarLamp x={1150} y={GY} s={0.9} on />
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="grin" sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
  // день 10: велосипед-генератор
  { at: "ten", s: (g, f, len) => <Apartment cam={C(1400, GY - 250, 1.3)} f={f} tally={10}>
    <BikeRig x={1700} ped={0} f={f} />
    <Hero x={2060} y={GY} f={f} expr="determined" flip pose={{ armR: [90, 0], armL: [15, 8] }} /></Apartment> },
  { at: "bicycle", s: (g, f, len) => <Apartment cam={C(1420, GY - 260, 1.6)} f={f} tally={10}><BikeRig x={1700} ped={0} f={f} /></Apartment> },
  { at: "connected", s: (g, f, len) => <Apartment cam={C(1260, GY - 120, 2.6)} f={f} tally={10}><BikeRig x={1700} ped={0} f={f} /></Apartment> },
  { at: "Pedal", s: (g, f, len) => <Apartment cam={C(1500, GY - 260, 1.5)} f={f} tally={10}><BikeRig x={1700} ped={g * 0.25} on={g > 30} f={f} front />{RIDER(1700, g * 0.25, f, "determined")}</Apartment> },
  { at: "legs", s: (g, f, len) => <Apartment cam={C(1720, GY - 270, 2.0)} f={f} tally={10}><BikeRig x={1700} ped={g * 0.32} on f={f} front />{RIDER(1700, g * 0.32, f, "tired", true)}</Apartment> },
  // ищет станцию — его глазами: рука крутит ручку
  { at: "scan", s: (g, f, len) => <Frame bg="#3e4a96"><rect width={1920} height={1080} fill="#3e4a96" />
    <rect x={460} y={300} width={1000} height={560} rx={60} fill="#c87a4a" stroke={INK} strokeWidth={12} />
    <circle cx={720} cy={580} r={170} fill="#5a4a3a" stroke={INK} strokeWidth={10} />
    <rect x={960} y={400} width={420} height={140} rx={14} fill="#ffd27a" stroke={INK} strokeWidth={8} />
    <rect x={980 + ip(g, [0, len], [0, 360], (t) => t)} y={410} width={10} height={120} fill="#ff3a4a" />
    <g transform={`translate(1170 690) rotate(${g * 6})`}><circle r={90} fill="#8a86a8" stroke={INK} strokeWidth={8} /><rect x={-10} y={-90} width={20} height={50} fill={INK} /></g>
    <g transform="translate(1260 760) rotate(-40)"><rect x={0} y={-70} width={800} height={140} rx={50} fill="#f27a2a" stroke={INK} strokeWidth={10} /><ellipse cx={-30} cy={0} rx={80} ry={66} fill="#f8f6f0" stroke={INK} strokeWidth={10} /></g>
    <rect width={1920} height={1080} fill="#0a0628" opacity={0.2} /></Frame> },
  { at: "Static", n: 1, s: (g, f, len) => <Apartment cam={C(1180, GY - 140, 2.6)} f={f} tally={10}><BikeRig x={1700} ped={0} on f={f} /><Static x={1180} y={GY - 260} f={f} /></Apartment> },
  { at: "Nobody", s: (g, f, len) => <Apartment cam={camLerp(g, len, C(1600, GY - 250, 2.0), C(1400, 520, 1.0))} f={f} tally={10} dark={0.4}>
    <BikeRig x={1700} ped={0.6} on f={f} front />{RIDER(1700, 0.6, f, "sad")}<SoundRings x={1140} y={GY - 140} f={f} c="#e8e4ff" n={2} /></Apartment> },
], { id: 5, dir: "bo" });
