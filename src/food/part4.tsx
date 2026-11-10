// Часть 4 (≈55 с): «Спустя неделю». Карточка времени, озвучка с кадра 60, звуки — scripts/food_sfx4.py.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, trackP, walking } from "./common";
import { Aisle, Box, CafeTable, Kitchen, Pallet, RiceBag, STREET_Y, Street, Tent, Truck, Warehouse, aisleFloorY, aisleX, kitFloorY, kitX } from "./places";
import { FadeOut, TimeCard } from "./transitions";

export const PART4_FRAMES = 1650;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label="DAY 8" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
const SOLDIER: Look = { kind: "person", skin: "#e8b46a", skinDark: "#c08a40", top: "#5a6a3a", topDark: "#44522a", pants: "#4a5432", shoe: "#2a2a20", hairStyle: "cap", cap: "#4a5a2e" };
const VOLUNTEER: Look = { ...PEOPLE.woman, top: "#c8d84a", topDark: "#9aaa30" };
const Shutter: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g><rect x={x} y={y} width={w} height={h} fill="#9aa0a8" stroke={OL} strokeWidth={5} />{Array.from({ length: Math.floor(h / 22) }, (_, i) => <path key={i} d={`M ${x} ${y + 11 + i * 22} L ${x + w} ${y + 11 + i * 22}`} stroke="#7a8088" strokeWidth={4} />)}</g>
);

// 1. газета: CRISIS
const Crisis: Shot = ({ g }) => {
  const k = ip(g, [56, 74], [0, 1], Easing.out(Easing.back(1.4)));
  return (
    <Svg bg="#3a2a1e"><CamG cam={{ s: lerp(1.0, 1.08, g / 190), cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#4a3424" />
      <g transform={`translate(960 540) rotate(${(1 - k) * -400 + 3}) scale(${k})`}>
        <rect x={-560} y={-380} width={1120} height={760} fill="#f4ecd8" stroke={OL} strokeWidth={8} />
        {txt(0, -290, 46, "#3a2a1e", "THE DAILY HERALD")}
        <path d="M -520 -260 L 520 -260 M -520 -250 L 520 -250" stroke={OL} strokeWidth={4} />
        {txt(0, -100, 200, "#c0302a", "CRISIS")}
        {txt(0, -20, 40, "#3a2a1e", "GOVERNMENTS TAKE CONTROL OF FOOD", 800)}
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-520} y={30 + i * 36} width={i % 3 === 2 ? 600 : 1040} height={14} fill="#bfb090" />)}
      </g>
    </CamG></Svg>
  );
};
// 2. пустой магазин, мигает свет
const EmptyStore: Shot = ({ g }) => {
  const Z = 3.4, s = 0.75 * (3.6 / Z), x = aisleX(0.2, Z), y = aisleFloorY(Z);
  const flick = (g % 47 < 3 || (g % 47 > 6 && g % 47 < 8)) ? 1 : 0;
  const pose = stand(g, { turn: Math.sin(g / 25) * 0.7, handL: [-40, -240], expr: { mouth: "flat", browH: 0.6, browA: -0.3, look: [Math.sin(g / 25), -0.3] }, seed: 1 });
  return (
    <Svg><CamG cam={{ s: lerp(1.1, 1.2, g / 117), cx: 960, cy: 560 }}>
      <Aisle fill={0.03} lightsDim={flick} />
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
      <g transform={`translate(${x - 40 * s} ${y - 240 * s})`}><path d="M -60 0 L 60 0 L 50 70 L -50 70 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -40 0 Q 0 -60 40 0" stroke={OL} strokeWidth={5} fill="none" /></g>
      {flick ? <rect x={-500} y={-300} width={W * 2} height={H * 2} fill="rgba(20,10,30,0.35)" /> : null}
    </CamG></Svg>
  );
};
// 3. закрытые ставни и охранник
const Guarded: Shot = ({ g }) => {
  const guard = stand(g, { turn: -0.2, handL: [30, -300], handR: [-30, -300], expr: { mouth: "flat", browA: 0.7, look: [Math.sin(g / 30), 0] }, seed: 2 });
  return (
    <Svg><CamG cam={{ s: lerp(1.2, 1.28, g / 108), cx: 1450, cy: 580 }}>
      <Street stock={0} closedCafe />
      <Shutter x={840} y={470} w={400} h={360} />
      {[0, 1, 2, 3].map((i) => <Shutter key={i} x={1360 + i * 230} y={430} w={200} h={400} />)}
      <Person x={1630} y={STREET_Y + 10} s={0.8} look={SOLDIER} pose={guard} uid="g" />
    </CamG></Svg>
  );
};
// 4. склад: собирают, считают, раздают
const Depot: Shot = ({ g }) => {
  const s = 0.8, y = 900, cyc = 60;
  const workers = [0, 1].map((i) => {
    const t = (g + i * 30) % cyc, n = Math.floor((g + i * 30) / cyc);
    const go = t < 30, u = go ? t / 30 : 1 - (t - 30) / 30;
    const x = lerp(300, 820, u) + i * 40;
    const pose = walking(g, Math.abs(x - 300) / s + n * 900, go ? 1 : -1, go ? { handL: [-40, -300], handR: [40, -300], seed: 3 + i } : { seed: 3 + i });
    return { x, pose, carry: go, i };
  });
  const placed = Math.min(9, 3 + Math.floor(g / 30));
  const counter = stand(g, { turn: -0.5, handL: [-40, -320], handR: [10 + Math.sin(g * 0.8) * 8, -330], nod: 10, expr: { mouth: "open", open: talk(g, 4) * 0.5, look: [0, 1] }, seed: 6 });
  return (
    <Svg bg="#cdb48a"><CamG cam={{ s: lerp(1.0, 1.06, g / 195), cx: 900, cy: 560 }}>
      <Warehouse />
      <Pallet x={1000} y={y} boxes={placed} />
      {workers.map((w) => <g key={w.i}><Person x={w.x} y={y} s={s} look={PEOPLE.worker} pose={w.pose} uid={"w" + w.i} />{w.carry ? <Box x={w.x} y={y - 300 * s} s={0.85} /> : null}</g>)}
      <Person x={1320} y={y} s={s} look={SOLDIER} pose={counter} uid="c" />
      <rect x={1320 - 70 * s} y={y - 340 * s} width={60} height={80} fill="#f2ead6" stroke={OL} strokeWidth={4} />
    </CamG></Svg>
  );
};
// 5. продовольственная карточка + печать
const Card: Shot = ({ g }) => {
  const slide = ip(g, [0, 20], [0, 1], Easing.out(Easing.cubic));
  const stampK = ip(g, [42, 50], [0, 1], Easing.in(Easing.quad));
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#8a6440" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M 0 ${i * 120} L ${W} ${i * 120 + 30}`} stroke="rgba(0,0,0,0.08)" strokeWidth={20} />)}
      <g transform={`translate(${lerp(1500, 960, slide)} 540) rotate(${lerp(10, -3, slide)})`}>
        <rect x={-430} y={-260} width={860} height={520} rx={20} fill="#f2ead6" stroke={OL} strokeWidth={7} />
        <rect x={-430} y={-260} width={860} height={110} rx={20} fill="#2e6a9a" />
        {txt(0, -190, 54, "#f6efe2", "RATION CARD")}
        {txt(-200, -70, 30, "#3a2a1e", "FAMILY  •  No. 0417", 800)}
        {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={-380 + i * 96} y={-20} width={80} height={80} fill="none" stroke={OL} strokeWidth={3} />{txt(-340 + i * 96, 34, 26, "#9a8a6a", `W${i + 1}`, 700)}</g>)}
        {stampK >= 1 ? <g transform="translate(-340 20) rotate(-14)"><circle r={36} fill="none" stroke="#c0302a" strokeWidth={6} />{txt(0, 10, 24, "#c0302a", "OK")}</g> : null}
        {Array.from({ length: 3 }, (_, i) => <rect key={i} x={-380} y={110 + i * 34} width={i === 2 ? 300 : 700} height={14} fill="#d8cdb8" />)}
      </g>
      <g transform={`translate(${960 - 340} ${lerp(-200, 540 + 20, stampK)})`}><rect x={-34} y={-200} width={68} height={130} rx={20} fill="#7a4a2a" stroke={OL} strokeWidth={6} /><rect x={-80} y={-70} width={160} height={70} rx={10} fill="#3a2a22" stroke={OL} strokeWidth={6} /></g>
    </CamG></Svg>
  );
};
// 6. очередь через весь квартал
const LongLine: Shot = ({ g }) => {
  const looks = [PEOPLE.oldman, PEOPLE.woman, PEOPLE.man, PEOPLE.girl, PEOPLE.worker, PEOPLE.barista, PEOPLE.man, PEOPLE.woman, PEOPLE.oldman, PEOPLE.girl, PEOPLE.man, PEOPLE.worker];
  return (
    <Svg><CamG cam={{ s: lerp(0.62, 0.66, g / 96), cx: lerp(900, 1100, g / 96), cy: 560 }}>
      <Tent />
      {looks.map((lk, i) => <Person key={i} x={420 + i * 120 + (i % 2) * 20} y={830 + (i % 3) * 10} s={0.6} look={lk} pose={stand(g, { turn: -0.7, seed: 10 + i, handL: i % 4 === 0 ? [10, -300] : [-60, -172], nod: i % 4 === 0 ? 12 : 0, expr: { mouth: "flat", look: [-1, 0] } })} uid={"l" + i} />)}
      {Array.from({ length: 10 }, (_, i) => <Person key={"f" + i} x={-600 + i * 100} y={850} s={0.5} look={[PEOPLE.man, PEOPLE.woman, PEOPLE.oldman][i % 3]} pose={stand(g, { turn: 0.7, seed: 30 + i, expr: { mouth: "flat" } })} uid={"f" + i} />)}
    </CamG></Svg>
  );
};
// 7. коробка пайка: достаёт по одному
const RationBox: Shot = ({ g }) => {
  const s = 1.0, x = 860, y = 1080;
  const items: [string, number][] = [["RICE", 24], ["BEANS", 42], ["FLOUR", 52], ["CANS", 70]];
  const out = items.filter(([, t]) => g >= t + 8).length;
  const reachIn: [number, number] = [210, -360], drop = (i: number): [number, number] => [-30 + i * 120, -330];
  const keys: [number, [number, number]][] = [[0, [60, -180]], [14, reachIn]];
  items.forEach(([, t], i) => { keys.push([t, reachIn]); keys.push([t + 8, [drop(i)[0] + 200, drop(i)[1]]]); keys.push([t + 12, reachIn]); });
  keys.push([90, [60, -180]]);
  const hand = g < 90 ? trackP(g, keys) : trackP(g, [[90, [60, -180]], [110, [20, -250]]]);
  const pose = stand(g, { turn: 0.5, handR: hand, handL: g > 110 ? [10, -250] : [-60, -180], tilt: g > 120 ? 6 : 0, expr: g > 110 ? { mouth: "wavy", browA: -0.6, browH: 0.5, look: [0.5, 0.8] } : { mouth: "flat", look: [1, 0.8] }, seed: 40 });
  return (
    <Svg><CamG cam={{ s: 1.0, cx: 960, cy: 600 }}>
      <rect width={W} height={H} fill="#e3c896" />
      <rect x={0} y={760} width={W} height={60} fill="#b9844e" stroke={OL} strokeWidth={6} />
      <rect x={0} y={820} width={W} height={300} fill="#8a5a30" stroke={OL} strokeWidth={5} />
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="hr" />
      <g transform="translate(1150 760)">
        <rect x={-110} y={-130} width={220} height={130} fill="#c89a5a" stroke={OL} strokeWidth={5} />
        <path d={`M -110 -130 L ${-110 - 70 * ip(g, [0, 14], [0, 1])} ${-130 - 50 * ip(g, [0, 14], [0, 1])}`} stroke={OL} strokeWidth={14} />
        <path d={`M 110 -130 L ${110 + 70 * ip(g, [0, 14], [0, 1])} ${-130 - 50 * ip(g, [0, 14], [0, 1])}`} stroke={OL} strokeWidth={14} />
        {txt(0, -50, 28, "#5a3a20", "RATION")}
      </g>
      {items.slice(0, out).map(([lb], i) => <g key={lb} transform={`translate(${760 + i * 120} 760)`}>
        {lb === "CANS" ? [0, 1, 2].map((k) => <g key={k}><rect x={-30 + k * 22} y={-60} width={34} height={56} rx={4} fill="#9aa0a8" stroke={OL} strokeWidth={3} /></g>) : <RiceBag x={0} y={0} s={0.8} />}
        {lb !== "CANS" && lb !== "RICE" ? <rect x={-30} y={-48} width={60} height={22} fill={lb === "BEANS" ? "#8a3a2a" : "#f6efe2"} /> : null}
      </g>)}
      {g >= 10 && g < 90 ? (() => { const hw: [number, number] = [x + hand[0] * s, y + hand[1] * s]; const cur = items.findIndex(([, t]) => g >= t && g < t + 8); return cur >= 0 ? <RiceBag x={hw[0]} y={hw[1] + 40} s={0.6} /> : null; })() : null}
    </CamG></Svg>
  );
};
// 8. закрытые рестораны и стоящие фургоны
const Closed: Shot = ({ g }) => {
  if (g < 70) return (
    <Svg><CamG cam={{ s: 1.05, cx: lerp(700, 1000, g / 70), cy: 560 }}>
      <Street stock={0} closedCafe />
      {[150, 640].map((x) => <g key={x}><CafeTable x={x} /><path d={`M ${x - 40} ${STREET_Y - 150} L ${x - 40} ${STREET_Y - 260} L ${x + 30} ${STREET_Y - 260} L ${x + 30} ${STREET_Y - 150}`} stroke="#4a4038" strokeWidth={8} fill="none" /></g>)}
      <Shutter x={840} y={470} w={400} h={360} />
      {[0, 1, 2, 3].map((i) => <Shutter key={i} x={1360 + i * 230} y={430} w={200} h={400} />)}
      <rect x={0} y={0} width={W * 2} height={STREET_Y} fill="rgba(40,24,12,0.15)" />
    </CamG></Svg>
  );
  return (
    <Svg bg="#cdb48a"><CamG cam={{ s: 0.75, cx: lerp(900, 1100, (g - 70) / 62), cy: 560 }}>
      <Warehouse />
      {Array.from({ length: 5 }, (_, i) => <g key={i} transform="scale(0.6)"><Truck x={(200 + i * 460) / 0.6} y={980 / 0.6} boxes={0} /></g>)}
    </CamG></Svg>
  );
};
// 9. люди без работы
const NoWork: Shot = ({ g }) => {
  const bar = sitting(g, { turn: 0.3, nod: 14, handL: [-30, -260], handR: [30, -260], expr: { mouth: "flat", eyes: "half", browA: -0.6, look: [0, 1] }, seed: 50 });
  bar.hip = [0, -110];
  const wx = 1500 - g * 6.2;
  return (
    <Svg><CamG cam={{ s: 1.35, cx: 760, cy: 620 }}>
      <Street stock={0} closedCafe />
      <Shutter x={840} y={470} w={400} h={360} />
      <Person x={520} y={STREET_Y + 30} s={0.75} look={PEOPLE.barista} pose={bar} uid="sb" />
      <Box x={520} y={STREET_Y - 6} s={1.5} label="CAFÉ" />
      <Person x={wx} y={STREET_Y + 20} s={0.78} look={PEOPLE.man} pose={walking(g, g * 8, -1, { handL: [-40, -300], handR: [40, -300], seed: 51, expr: { mouth: "flat", browA: -0.5 } })} uid="wm" />
      <Box x={wx} y={STREET_Y + 20 - 300 * 0.78} s={0.85} label="DESK" />
    </CamG></Svg>
  );
};
// 10. пункт раздачи: солдат и волонтёр выдают коробки
const Aid: Shot = ({ g }) => {
  const cyc = 52, t = g % cyc, n = Math.floor(g / cyc);
  const giveH = trackP(t, [[0, [-60, -200]], [10, [-40, -300]], [24, [-170, -300]], [30, [-170, -300]], [40, [-60, -200]], [52, [-60, -200]]]);
  const soldier = stand(g, { turn: -0.5, handL: giveH, handR: [10, -300], expr: { mouth: "smile", look: [-1, 0] }, seed: 60 });
  const vol = stand(g + 20, { turn: -0.4, handL: trackP((g + 26) % cyc, [[0, [-60, -200]], [10, [-40, -300]], [24, [-170, -300]], [30, [-170, -300]], [40, [-60, -200]], [52, [-60, -200]]]), handR: [20, -300], expr: { mouth: "open", open: talk(g, 6) * 0.6, look: [-1, 0] }, seed: 61 });
  const taker = (k: number) => {
    const tt = (g + k * 17) % (cyc * 2), x = lerp(700, 200, tt / (cyc * 2));
    return walking(g, (700 - x) / 0.7 + k * 300, -1, { handL: [-40, -300], handR: [40, -300], seed: 62 + k, expr: { mouth: "smile" } });
  };
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.06, g / 156), cx: 900, cy: 580 }}>
      <Tent />
      <rect x={760} y={640} width={700} height={40} fill="#b08050" stroke={OL} strokeWidth={5} />
      <Pallet x={1250} y={640} boxes={6} />
      <Person x={900} y={900} s={0.8} look={SOLDIER} pose={soldier} uid="so" />
      <Person x={1150} y={900} s={0.8} look={VOLUNTEER} pose={vol} uid="vo" />
      <rect x={760} y={680} width={700} height={220} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      {t >= 10 && t < 30 ? <Box x={900 + giveH[0] * 0.8} y={900 + giveH[1] * 0.8 + 20} s={0.7} /> : null}
      {[0, 1].map((k) => { const tt = (g + k * 17) % (cyc * 2), x = lerp(700, 200, tt / (cyc * 2)); return <g key={k}><Person x={x} y={930} s={0.7} look={[PEOPLE.woman, PEOPLE.oldman][k]} pose={taker(k)} uid={"t" + k} /><Box x={x} y={930 - 300 * 0.7} s={0.7} /></g>; })}
      <text x={-100} y={-100} fontSize={1}>{n}</text>
    </CamG></Svg>
  );
};
// 11. шёпот в очереди
const Whisper: Shot = ({ g }) => {
  const s = 0.95, y = 1000;
  const a = stand(g, { turn: 0.7, lean: 8, handR: [70, -470], expr: { mouth: "open", open: talk(g, 1) * 0.35, browA: -0.6, browH: 0.4, look: [1, 0] }, seed: 70 });
  const b = stand(g, { turn: -0.4, tilt: -8, expr: { mouth: "wavy", eyes: g > 60 ? "wide" : "dot", browH: 0.6, look: [-1, 0] }, seed: 71 });
  const h = stand(g, { turn: g < 60 ? 0.6 : 0.1, expr: { mouth: "flat", browA: -0.8, browH: 0.6, eyes: g > 80 ? "wide" : "dot", look: [g < 60 ? 1 : 0, 0] }, seed: 72 });
  return (
    <Svg><CamG cam={{ s: lerp(1.5, 1.7, ip(g, [0, 180], [0, 1])), cx: 880, cy: 620 }}>
      <Tent />
      <Person x={1080} y={y} s={s} look={PEOPLE.oldman} pose={b} uid="wb" />
      <Person x={900} y={y} s={s} look={PEOPLE.woman} pose={a} uid="wa" />
      <Person x={640} y={y} s={s} look={HERO} pose={h} uid="wh" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Crisis, 0, T(4.3)], [EmptyStore, T(4.3), T(8.2)], [Guarded, T(8.2), T(11.8)], [Depot, T(11.8), T(18.3)], [Card, T(18.3), T(21.4)],
  [LongLine, T(21.4), T(24.6)], [RationBox, T(24.6), T(30.9)], [Closed, T(30.9), T(35.3)], [NoWork, T(35.3), T(40.3)], [Aid, T(40.3), T(45.5)],
  [Whisper, T(45.5), PART4_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part4: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="1 WEEK LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part4.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx4.wav")} />
    <FadeOut total={PART4_FRAMES} />
  </AbsoluteFill>
);
export const _u4 = [H, Kitchen, kitFloorY, kitX];
export const CUTS4 = CUTS.map(([, a, b]) => [a, b]);
