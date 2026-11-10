// Часть 2 (≈56 с): «Спустя 24 часа». Карточка времени 54 кадра, озвучка с кадра 60.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { Blur, CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, track, trackP, walking } from "./common";
import { Aisle, CafeTable, Checkout, CheckoutCounter, Cup, Highway, Ocean, RiceBag, STREET_Y, ShipShape, Street, TVFrame, Truck, aisleFloorY, aisleX } from "./places";
import { CARD, FadeOut, TimeCard } from "./transitions";

export const PART2_FRAMES = 1700;
const V = 60; // начало озвучки
const T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label="DAY 2" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const MANAGER: Look = { ...PEOPLE.operator, top: "#f2ede2", topDark: "#cfc6b4", apron: "#3a7a5a", hair: "#5a3a22" };

// 1. утро: кафе открывается, пекарня работает
const Morning: Shot = ({ g }) => {
  const s = 0.75;
  const flip = ip(g, [70, 82], [0, 1]);
  const bar = stand(g, { turn: flip < 1 ? -0.4 : 0.4, handR: trackP(g, [[0, [60, -172]], [60, [60, -172]], [72, [-30, -400]], [84, [-30, -400]], [96, [60, -172]]]), seed: 1, expr: { mouth: "smile" } });
  const passer = walking(g, g * 9, 1, { seed: 2 });
  const cx = lerp(380, 1050, ip(g, [120, 250], [0, 1]));
  return (
    <Svg><CamG cam={{ s: 1.4, cx, cy: 600 }}>
      <Street />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${900 + i * 120} 470 q ${-10 + Math.sin(g / 8 + i) * 8} -30 0 -60 q 10 -26 0 -54`} stroke="rgba(255,255,255,0.75)" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <CafeTable x={150} /><CafeTable x={640} />
      <g transform={`translate(380 520) scale(${Math.cos(flip * Math.PI)} 1)`}><rect x={-46} y={-26} width={92} height={52} rx={6} fill="#f6efe2" stroke={OL} strokeWidth={4} /><text x={0} y={10} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={24} fill={flip > 0.5 ? "#3a7a4a" : "#c0302a"} transform={flip > 0.5 ? "scale(-1 1)" : undefined}>{flip > 0.5 ? "OPEN" : "CLOSED"}</text></g>
      <Person x={430} y={STREET_Y} s={s} look={PEOPLE.barista} pose={bar} uid="b" />
      <Person x={200 + g * 7.2} y={STREET_Y + 40} s={0.8} look={PEOPLE.man} pose={passer} uid="p" />
    </CamG></Svg>
  );
};
// 2. грузовик не приехал: управляющий у пустого места разгрузки
const NoTruck: Shot = ({ g }) => {
  const s = 0.8;
  const watch = g < 50;
  const pose = stand(g, {
    turn: watch ? 0.1 : track(g, [[50, 0.1], [60, 0.85], [90, 0.85], [100, -0.6], [114, -0.6]]),
    handL: watch ? [10, -300] : [-60, -172], handR: watch ? [-10, -320] : g > 90 ? [80, -440] : [60, -172],
    nod: watch ? 14 : 0, tilt: g > 90 ? -6 : 0,
    expr: watch ? { look: [0, 1], mouth: "flat", browA: 0.4 } : { browH: 0.6, browA: -0.6, mouth: "wavy", look: [1, 0] }, seed: 3,
  });
  return (
    <Svg><CamG cam={{ s: lerp(1.45, 1.55, g / 114), cx: 1640, cy: 600 }}>
      <Street />
      <rect x={1740} y={STREET_Y + 80} width={360} height={110} fill="none" stroke="#f2e6c4" strokeWidth={6} strokeDasharray="20 14" />
      <text x={1920} y={STREET_Y + 150} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={34} fill="#f2e6c4">LOADING</text>
      {[0, 1, 2].map((i) => <rect key={i} x={1500 + i * 70} y={STREET_Y - 58 - (i === 1 ? 54 : 0)} width={60} height={52} fill="#c89a5a" stroke={OL} strokeWidth={4} opacity={0.5} />)}
      <Person x={1700} y={STREET_Y} s={s} look={MANAGER} pose={pose} uid="m" />
      {watch ? <circle cx={1700 + 2 * s} cy={STREET_Y - 312 * s} r={10} fill="#f6efe2" stroke={OL} strokeWidth={3} /> : null}
    </CamG></Svg>
  );
};
// 3. сотни судов на якоре
const Anchored: Shot = ({ g }) => (
  <Svg bg="#e8b884"><CamG cam={{ s: lerp(0.62, 0.7, g / 225), cx: lerp(700, 1300, g / 225), cy: 520 }}>
    <Ocean t={g} ships={16} />
    {[[-400, 600, 0.35], [380, 640, 0.42], [1250, 610, 0.38], [2050, 650, 0.45], [2800, 620, 0.36]].map(([x, y, k], i) => <g key={i} transform={`translate(${x} ${y + Math.sin(g / 30 + i) * 2}) scale(${k})`}><ShipShape /></g>)}
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-400 + i * 800} ${560} l 0 60`} stroke={OL} strokeWidth={3} opacity={0.6} />)}
  </CamG></Svg>
);
// 4. шоссе: ряды стоящих грузовиков, водитель в кабине
const Trucks: Shot = ({ g }) => {
  const close = g >= 92;
  if (!close) return (
    <Svg bg="#f0c894"><CamG cam={{ s: 0.8, cx: lerp(700, 1100, g / 92), cy: 560 }}>
      <Highway />
      {Array.from({ length: 7 }, (_, i) => <g key={i} transform={`scale(0.5)`}><Truck x={(-500 + i * 420) / 0.5} y={900 / 0.5} boxes={0} /></g>)}
    </CamG></Svg>
  );
  const gg = g - 92, k = 1.7, tx = 520, ty = 1080;
  const win = `M 190 -210 L 280 -210 Q 315 -205 322 -160 L 190 -160 Z`;
  const yawn = gg > 30 && gg < 60;
  const driver = sitting(gg, { turn: 0.5, nod: yawn ? -6 : 10, handR: [40, -330], handL: [-40, -320], expr: yawn ? { mouth: "o", open: 1, eyes: "closed" as never, blink: 1 } : { eyes: "half", mouth: "flat", look: [0.4, 1] }, seed: 4 });
  return (
    <Svg bg="#f0c894"><CamG cam={{ s: 1.0, cx: 960, cy: 540 }}>
      <Blur r={2} id="hb"><Highway /></Blur>
      <g transform={`translate(${tx} ${ty}) scale(${k})`}>
        <clipPath id="cab"><path d={win} /></clipPath>
        <Truck x={0} y={0} boxes={0} />
        <g clipPath="url(#cab)"><rect x={180} y={-220} width={150} height={70} fill="#bfe0f0" /><Person x={262} y={-90} s={0.22} look={PEOPLE.worker} pose={driver} uid="dr" /></g>
        <path d={win} fill="none" stroke={OL} strokeWidth={4} />
      </g>
    </CamG></Svg>
  );
};
// 5. супермаркет: первые пустые места
const Gaps: Shot = ({ g }) => {
  const Z = 3.3, X = -0.6, s = 0.75 * (3.6 / Z), x = aisleX(X, Z), y = aisleFloorY(Z);
  const pose = stand(g, {
    turn: track(g, [[0, 0.6], [60, 0.6], [72, -0.6], [156, -0.6]]), tilt: g > 72 ? -4 : 4,
    handL: [-40, -240], handR: g < 60 ? trackP(g, [[0, [60, -172]], [20, [150, -300]], [50, [150, -300]], [60, [60, -172]]]) : [60, -172],
    expr: g < 60 ? { browH: 0.6, mouth: "o", open: 0.3, look: [1, -0.2] } : { browH: 0.8, browA: -0.4, mouth: "flat", look: [-1, -0.2] }, seed: 5,
  });
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.25, g / 156), cx: 920, cy: 560 }}>
      <Aisle fill={0.78} />
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
      <g transform={`translate(${x - 50 * s} ${y - 230 * s})`}><path d="M -60 0 L 60 0 L 50 70 L -50 70 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -40 0 Q 0 -60 40 0" stroke={OL} strokeWidth={5} fill="none" /></g>
    </CamG></Svg>
  );
};
// 6. табличка на полке
const SignClose: Shot = ({ g }) => (
  <Svg bg="#e2d2b0"><CamG cam={{ s: lerp(1.0, 1.08, g / 141), cx: 960, cy: 540 }}>
    <rect width={W} height={H} fill="#d0b88e" />
    {[220, 560, 900].map((y, r) => <g key={y}><rect x={0} y={y} width={W} height={40} fill="#b8a07a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => (i % 3 === 1 || (r === 1 && i > 3 && i < 9)) ? null : <rect key={i} x={40 + i * 160} y={y - 190} width={120} height={186} rx={8} fill={["#d8443a", "#e8b23a", "#5a9a4a", "#3a7ad8"][(i + r) % 4]} stroke={OL} strokeWidth={4} />)}</g>)}
    <g transform={`translate(960 640) rotate(${-3 + Math.sin(g / 20) * 1.5})`}>
      <rect x={-300} y={-150} width={600} height={300} fill="#fbf6e8" stroke={OL} strokeWidth={6} />
      <rect x={-30} y={-170} width={60} height={34} fill="rgba(240,230,190,0.85)" />
      <text x={0} y={-50} textAnchor="middle" fontFamily="'Comic Sans MS', sans-serif" fontWeight={700} fontSize={58} fill="#c0302a">DELIVERY</text>
      <text x={0} y={20} textAnchor="middle" fontFamily="'Comic Sans MS', sans-serif" fontWeight={700} fontSize={58} fill="#c0302a">DELAYED</text>
      <text x={0} y={95} textAnchor="middle" fontFamily="'Comic Sans MS', sans-serif" fontWeight={700} fontSize={34} fill="#3a2a1e">sorry for the inconvenience</text>
    </g>
  </CamG></Svg>
);
// 7. кассир пожимает плечами
const Cashier: Shot = ({ g }) => {
  const shrug = ip(g, [10, 22], [0, 1]) * (1 - ip(g, [50, 64], [0, 1]));
  const pose = stand(g, { turn: -0.2, handL: [-100 * shrug - 60 * (1 - shrug), -172 - 80 * shrug], handR: [100 * shrug + 60 * (1 - shrug), -172 - 80 * shrug], tilt: shrug * 8,
    expr: g > 40 ? { mouth: "open", open: talk(g, 2), browH: 0.6 } : { browH: 0.8 * shrug + 0.2, mouth: "flat" }, seed: 6 });
  pose.hip = [pose.hip[0], pose.hip[1] - shrug * 8];
  return (
    <Svg><CamG cam={{ s: lerp(1.5, 1.6, g / 84), cx: 1000, cy: 560 }}>
      <Checkout t={g} />
      <Person x={1000} y={980} s={0.95} look={PEOPLE.girl} pose={pose} uid="c" />
      <CheckoutCounter t={g} belt={false} />
    </CamG></Svg>
  );
};
// 8. новости: эксперт уверяет, люди верят
const NewsTV: Shot = ({ g }) => {
  if (g < 150) {
    const expert = stand(g, { turn: 0.1, handR: [100 + Math.sin(g / 6) * 20, -300 + Math.cos(g / 5) * 20], handL: [-60, -200], expr: { mouth: "open", open: talk(g, 4), browH: 0.4, eyes: "dot" }, seed: 7 });
    return (
      <Svg bg="#2a2420"><CamG cam={{ s: lerp(1.0, 1.06, g / 150), cx: 960, cy: 540 }}>
        <rect width={W} height={H} fill="#d8c09a" />
        <TVFrame headline="EXPERTS: FIXED IN 1–2 DAYS" t={g}>
          <Person x={800} y={1180} s={1.2} look={PEOPLE.oldman} pose={expert} uid="ex" />
          <rect x={220} y={700} width={1480} height={100} fill="#4a3a32" />
        </TVFrame>
      </CamG></Svg>
    );
  }
  const gg = g - 150;
  const watcher = (seed: number, turn: number) => stand(gg, { turn, nod: Math.abs(Math.sin(gg / 6)) * -6, handL: [-40, -240], expr: { mouth: "smile", browH: 0.3, look: [0, -0.8] }, seed });
  return (
    <Svg><CamG cam={{ s: 1.3, cx: 960, cy: 520 }}>
      <Aisle fill={0.75} />
      <Person x={820} y={aisleFloorY(3.4)} s={0.79} look={PEOPLE.woman} pose={watcher(8, 0.3)} uid="w1" />
      <Person x={1080} y={aisleFloorY(3.6)} s={0.75} look={PEOPLE.oldman} pose={watcher(9, -0.3)} uid="w2" />
    </CamG></Svg>
  );
};
// 9. покупательница кладёт мешки риса: два, потом три; 10. герой замечает
const Rice: Shot = ({ g }) => {
  const s = 0.95, wx = 560, wy = 1000;
  const putTimes = [30, 62, 120];
  const hand = trackP(g, [[0, [60, -172]], [20, [190, -300]], [30, [240, -330]], [42, [130, -260]], [52, [190, -300]], [62, [240, -330]], [74, [130, -260]],
    [108, [130, -260]], [120, [240, -330]], [134, [60, -172]]]);
  const pose = stand(g, { turn: 0.6, handR: hand, handL: [-40, -260], seed: 10, expr: { mouth: "flat", look: [1, 0.4], browA: 0.3 } });
  const beltX = (put: number) => 860 + Math.max(0, g - put) * 3;
  const placed = putTimes.filter((p) => g >= p);
  const closeHero = g >= 174;
  if (closeHero) {
    const gg = g - 174;
    const hp = stand(gg, { turn: 0.5, expr: { eyes: "half", browA: 0.6, mouth: "flat", look: [1, 0.2] }, seed: 11, handL: [-50, -200] });
    return (
      <Svg><CamG cam={{ s: lerp(3.0, 3.25, gg / 110), cx: 300 + 60, cy: wy - 490 * s }}>
        <Blur r={2.5} id="rb"><Checkout t={g} /></Blur>
        <Person x={300} y={wy} s={s} look={HERO} pose={hp} uid="hh" />
      </CamG></Svg>
    );
  }
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.22, g / 174), cx: 860, cy: 600 }}>
      <Checkout t={g} />
      <Person x={1300} y={980} s={0.95} look={PEOPLE.girl} pose={stand(g, { turn: -0.4, seed: 12, expr: { browH: g > 120 ? 0.8 : 0.2, mouth: g > 120 ? "o" : "smile", open: 0.3 } })} uid="cs" />
      <CheckoutCounter t={g} />
      {placed.map((p, i) => <RiceBag key={i} x={Math.min(beltX(p), 1250 - i * 90)} y={712} s={0.9} />)}
      <Person x={wx} y={wy} s={s} look={PEOPLE.man} pose={pose} uid="mr" />
      {/* корзина в левой руке с оставшимися мешками */}
      <g transform={`translate(${wx - 40 * s} ${wy - 260 * s})`}>
        {[0, 1, 2, 3].filter((i) => i >= placed.length).map((i) => <RiceBag key={"c" + i} x={-30 + i * 22} y={10} s={0.5} />)}
        <path d="M -70 0 L 70 0 L 58 70 L -58 70 Z" fill="#d8443a" stroke={OL} strokeWidth={5} /><path d="M -50 0 Q 0 -80 50 0" stroke={OL} strokeWidth={6} fill="none" />
      </g>
      <Person x={300} y={wy} s={s} look={HERO} pose={stand(g, { turn: 0.5, handL: [-50, -200], seed: 13, expr: { look: [1, 0.3], mouth: "smile" } })} uid="h2" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Morning, 0, T(8.3)], [NoTruck, T(8.3), T(12.1)], [Anchored, T(12.1), T(19.6)], [Trucks, T(19.6), T(25.7)], [Gaps, T(25.7), T(30.9)],
  [SignClose, T(30.9), T(35.6)], [Cashier, T(35.6), T(38.4)], [NewsTV, T(38.4), T(45.2)], [Rice, T(45.2), PART2_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part2: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="24 HOURS LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part2.mp3")} /></Sequence>
    <FadeOut total={PART2_FRAMES} />
  </AbsoluteFill>
);
export const _unused = [CARD, Cup, H];
