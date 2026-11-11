// Часть 1 (≈56 с): «Первый час». Кадры привязаны к словам озвучки (public/food/part1_words.json, сдвиг +6 кадров).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, P, Pose, Toon } from "../brand/corridor/rig";
import { FadeOut } from "./transitions";
import { Blur, CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, track, trackP, walking } from "./common";
import { Aisle, CafeTable, Cart, ControlRoom, Cup, Kitchen, Ocean, PhoneScreen, Port, Product, STREET_Y, ShipShape, Street, Truck, aisleFloorY, aisleX, kitFloorY, kitPhonePos, kitX } from "./places";

export const PART1_FRAMES = 1700;
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const toLocal = (x: number, y: number, s: number, w: P): P => [(w[0] - x) / s, (w[1] - y) / s];
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;

// ---------- кухня: герой у холодильника ----------
export const HZ = 3.4, HX = 1.3;
export const heroK = { x: kitX(HX, HZ), y: kitFloorY(HZ), s: 0.75 * (3.6 / HZ) };
export const PIZZA_W: P = [1489, 613];
export const Slice: React.FC<{ at: P; bite: number; s?: number }> = ({ at, bite, s = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${s}) rotate(-20)`}>
    <path d={bite > 0 ? "M 0 0 L 44 -14 Q 40 -24 30 -24 Q 26 -14 16 -18 Q 10 -30 0 -28 Z" : "M 0 0 L 48 -12 Q 50 -30 40 -38 L 0 -30 Z"} fill="#f2c25a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={14} cy={-14} r={5} fill="#c8402a" /><circle cx={30} cy={-20} r={4} fill="#c8402a" />
    <path d="M 0 -30 L 0 0" stroke="#c8883a" strokeWidth={8} strokeLinecap="round" />
  </g>
);
const KitchenA: Shot = ({ g }) => {
  const pose = stand(g, {
    turn: 0.55, tilt: 4, handL: trackP(g, [[0, [-60, -172]], [40, [-60, -172]], [58, [-70, -520]], [110, [-74, -515]]]),
    handR: trackP(g, [[0, [60, -172]], [14, [120, -330]], [40, [80, -300]], [60, [62, -190]]]),
    expr: { mouth: "wavy", browSkew: 1, look: [1, 0.2] }, lean: 3,
  });
  const k = g / 123;
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.08, k), cx: 1150, cy: 560 }}>
      <Kitchen open={ip(g, [4, 24], [0, 1])} />
      <Person {...heroK} look={HERO} pose={pose} uid="hA" />
    </CamG><Clock label="DAY 1" time="08:12" /></Svg>
  );
};
const KitchenB: Shot = ({ g }) => {
  const look: P = g < 40 ? [1, 0.5] : g < 70 ? [1, -0.4] : [0.9, 0];
  const pose = stand(g, { turn: 0.6, tilt: g > 70 ? 6 : 2, expr: { mouth: g > 70 ? "grin" : "flat", browH: g > 40 && g < 70 ? 0.6 : 0.2, browSkew: g < 40 ? 0.8 : 0, look } });
  const head: P = [heroK.x + 0 * heroK.s, heroK.y - 490 * heroK.s];
  return (
    <Svg><CamG cam={{ s: lerp(3.0, 3.15, g / 90), cx: head[0] + 30, cy: head[1] + 40 }}>
      <Blur r={2.5} id="bB"><Kitchen open={1} /></Blur>
      <Person {...heroK} look={HERO} pose={pose} uid="hB" />
      <ellipse cx={head[0] + 140} cy={head[1]} rx={160} ry={220} fill="rgba(210,235,255,0.25)" />
    </CamG><Clock label="DAY 1" time="08:12" /></Svg>
  );
};

// ---------- улица: кафе ----------
const Cafe: Shot = ({ g }) => {
  const sY = STREET_Y, s = 0.75;
  const bw = ip(g, [10, 70], [0, 1]);
  const baristaX = lerp(250, 520, bw);
  const woman = sitting(g, { turn: 0.5, handR: [70, -230 + Math.sin(g / 6) * 10], handL: [-40, -200], expr: { mouth: "open", open: talk(g, 1) * (g % 60 < 40 ? 1 : 0), look: [1, 0] }, seed: 1 });
  const man = sitting(g, { turn: -0.5, handR: [40, -205], handL: [-70, -270], expr: { mouth: g % 60 >= 40 ? "laugh" : "smile", eyes: g % 60 >= 40 ? "happy" : "dot", open: 0.6, look: [-1, 0] }, seed: 2 });
  const old = sitting(g, { turn: 0.1, nod: 10, handL: [-70, -290], handR: [70, -290], expr: { eyes: "half", mouth: "flat", look: [0, 1] }, seed: 3 });
  const bar = bw < 1 ? walking(g, (baristaX - 250) / s, 1, { handL: [-30, -300], handR: [30, -300], seed: 4 }) : stand(g, { turn: 0.4, handL: [-30, -300], handR: [lerp(30, 110, ip(g, [72, 84], [0, 1])), -300], seed: 4 });
  const trayAt: P = [baristaX, sY - 300 * s - 12];
  return (
    <Svg><CamG cam={{ s: lerp(1.55, 1.62, g / 93), cx: 420, cy: 620 }}>
      <Street />
      <Person x={150} y={sY} s={s} look={PEOPLE.woman} pose={woman} uid="cw" />
      <CafeTable x={150} />
      <Person x={390} y={sY} s={s} look={PEOPLE.man} pose={man} uid="cm" />
      <CafeTable x={390} />
      <Cup x={190} y={sY - 140} steam={g} /><Cup x={360} y={sY - 140} steam={g + 20} />
      <Person x={640} y={sY} s={s} look={PEOPLE.oldman} pose={old} uid="co" />
      <CafeTable x={640} />
      <rect x={590} y={sY - 260} width={100} height={70} fill="#f2ead6" stroke={OL} strokeWidth={4} transform={`rotate(-6 640 ${sY - 225})`} />
      <Person x={baristaX} y={sY} s={s} look={PEOPLE.barista} pose={bar} uid="cb" />
      <g transform={`translate(${trayAt[0]} ${trayAt[1]})`}><ellipse rx={60} ry={10} fill="#c8a070" stroke={OL} strokeWidth={4} /><Cup x={-10} y={-6} steam={g} /></g>
    </CamG><Clock label="DAY 1" time="08:13" /></Svg>
  );
};
// ---------- улица: пекарня и разгрузка ----------
const Delivery: Shot = ({ g }) => {
  const s = 0.75, cycle = 72, ph = g % cycle, goingIn = ph < cycle / 2;
  const x0 = 1760, x1 = 1560;
  const u = goingIn ? ph / (cycle / 2) : 1 - (ph - cycle / 2) / (cycle / 2);
  const wx = lerp(x0, x1, u);
  const pose = walking(g, Math.abs(wx - x0) / s + Math.floor(g / cycle) * 320, goingIn ? -1 : 1, goingIn ? { handL: [-40, -290], handR: [40, -290], seed: 5 } : { seed: 5 });
  const steam = (i: number) => `M ${900 + i * 120} 470 q ${-10 + Math.sin(g / 8 + i) * 8} -30 0 -60 q 10 -26 0 -54`;
  const cx = lerp(1150, 1560, ip(g, [0, 190], [0, 1]));
  return (
    <Svg><CamG cam={{ s: 1.35, cx, cy: 600 }}>
      <Street />
      {[0, 1, 2].map((i) => <path key={i} d={steam(i)} stroke="rgba(255,255,255,0.75)" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <Truck x={2080} boxes={5} />
      <Person x={1380 - g * 6.75} y={STREET_Y} s={s} look={PEOPLE.girl} pose={walking(g, g * 9, -1, { seed: 6 })} uid="dg" />
      <Person x={wx} y={STREET_Y} s={s} look={PEOPLE.worker} pose={pose} uid="dw" />
      {goingIn ? <rect x={wx - 34} y={STREET_Y - 330 * s - 30} width={68} height={58} fill="#c89a5a" stroke={OL} strokeWidth={4} /> : null}
    </CamG><Clock label="DAY 1" time="08:14" /></Svg>
  );
};
// Девушка идёт по тротуару: поправим x внутри Delivery через смещение
// ---------- супермаркет: покупательница берёт товар ----------
const AisleShop: Shot = ({ g }) => {
  const Z = 3.4, X = 1.0, s = 0.75 * (3.6 / Z), x = aisleX(X, Z), y = aisleFloorY(Z);
  const shelf: P = [aisleX(1.6, Z) - 6, 470 + (1.6 - 1.3) * (900 / Z)];
  const reach = trackP(g, [[0, [60, -172]], [20, toLocal(x, y, s, shelf)], [36, toLocal(x, y, s, shelf)], [60, [30, -230]]]);
  const pose = stand(g, { turn: 0.5, handR: reach, handL: [-50, -230], tilt: g < 36 ? 4 : 0, expr: { mouth: "smile", look: [1, -0.2] }, seed: 7 });
  const z2 = 8, s2 = 0.75 * (3.6 / z2), mx = lerp(aisleX(-1.2, z2), aisleX(1.2, z2), g / 120);
  const handW: P = [x + reach[0] * s, y + reach[1] * s];
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.06, g / 120), cx: 1000, cy: 560 }}>
      <Aisle fill={1} />
      <Person x={mx} y={aisleFloorY(z2)} s={s2} look={PEOPLE.man} pose={walking(g, (mx - aisleX(-1.2, z2)) / s2, 1, { seed: 8 })} uid="am" />
      <Person x={x} y={y} s={s} look={PEOPLE.woman} pose={pose} uid="aw" />
      <g transform={`translate(${x - 50 * s} ${y - 210 * s})`}><path d="M -60 0 L 60 0 L 50 70 L -50 70 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -40 0 Q 0 -60 40 0" stroke={OL} strokeWidth={5} fill="none" /></g>
      {g >= 20 ? <Product x={g < 36 ? shelf[0] : lerp(shelf[0], handW[0], ip(g, [36, 40], [0, 1]))} y={g < 36 ? shelf[1] : handW[1]} c="#3a7ad8" /> : null}
    </CamG><Clock label="DAY 1" time="08:15" /></Svg>
  );
};
// ---------- океан: судно стоит ----------
const Ship: Shot = ({ g }) => {
  const pull = ip(g, [150, 198], [0, 1]);
  const cam = { s: lerp(1.05, 0.5, pull), cx: lerp(960, 960, pull), cy: lerp(560, 520, pull) };
  const bob = Math.sin(g / 30) * 3;
  const sailor = stand(g, { turn: 0.3, handL: [-20, -380], handR: [60, -180], nod: 8, expr: { mouth: "flat", browH: 0.3, look: [-0.5, 0.6] }, seed: 9 });
  return (
    <Svg bg="#e8b884"><CamG cam={cam}>
      <Ocean t={g} ships={pull > 0 ? 8 : 1} />
      <g transform={`translate(960 ${640 + bob}) scale(0.9)`}>
        <ShipShape />
        <Person x={560} y={-60} s={0.28} look={PEOPLE.sailor} pose={sailor} uid="sl" />
      </g>
      {/* ни кильватерной струи, ни дыма: стоит на месте */}
    </CamG><Clock label="DAY 1" time="08:31" /></Svg>
  );
};
// ---------- кухня: телефон вибрирует, рука берёт ----------
const PhoneBuzz: Shot = ({ g }) => {
  const p = kitPhonePos(), buzz = g < 50 && Math.floor(g / 3) % 2 ? 3 : 0;
  const take = ip(g, [52, 70], [0, 1]);
  const hand: P = [lerp(p[0] + 420, p[0], ip(g, [40, 54], [0, 1])), lerp(p[1] + 160, p[1] - 10, ip(g, [40, 54], [0, 1])) - take * 120];
  return (
    <Svg><CamG cam={{ s: 2.6, cx: p[0] + 60, cy: p[1] - 40 }}>
      <Blur r={1.5} id="pb"><Kitchen open={0} /></Blur>
      <g transform={`translate(${take > 0 ? hand[0] : p[0] + buzz} ${take > 0 ? hand[1] + 6 : p[1]})`}>
        <rect x={-34} y={-12} width={68} height={22} rx={6} fill="#1e1e24" stroke={OL} strokeWidth={3} transform="skewX(-30)" />
        <rect x={-28} y={-9} width={56} height={14} rx={4} fill="#f6efe2" transform="skewX(-30)" />
        <rect x={-24} y={-8} width={48} height={4} fill="#c0302a" transform="skewX(-30)" />
      </g>
      {g < 50 ? [0, 1].map((i) => <path key={i} d={`M ${p[0] + (i ? 50 : -50)} ${p[1] - 20} l ${i ? 14 : -14} -12 M ${p[0] + (i ? 56 : -56)} ${p[1] - 4} l ${i ? 16 : -16} -4`} stroke={OL} strokeWidth={3} strokeLinecap="round" opacity={buzz ? 1 : 0.3} />) : null}
      {g > 38 ? <g><path d={`M ${hand[0] + 600} ${hand[1] + 200} L ${hand[0] + 40} ${hand[1] + 14}`} stroke={OL} strokeWidth={34} strokeLinecap="round" /><path d={`M ${hand[0] + 600} ${hand[1] + 200} L ${hand[0] + 40} ${hand[1] + 14}`} stroke="#e0793a" strokeWidth={24} strokeLinecap="round" />
        <circle cx={hand[0] + 8} cy={hand[1] + 4} r={16} fill="#fbefd6" stroke={OL} strokeWidth={5} /></g> : null}
    </CamG><Clock label="DAY 1" time="08:47" /></Svg>
  );
};
const News: Shot = ({ g }) => (
  <Svg><Blur r={6} id="nb"><CamG cam={{ s: 1.4, cx: 900, cy: 520 }}><Kitchen open={0} /></CamG></Blur>
    <g transform={`translate(960 ${560 + Math.sin(g / 20) * 4}) scale(${lerp(0.82, 0.88, g / 160)}) rotate(${-3 + Math.sin(g / 30)})`}>
      <PhoneScreen t={g} />
      <circle cx={262} cy={180} r={44} fill="#fbefd6" stroke={OL} strokeWidth={8} /><circle cx={-262} cy={260} r={44} fill="#fbefd6" stroke={OL} strokeWidth={8} />
    </g>
    <Clock label="DAY 1" time="08:47" />
  </Svg>
);
// ---------- порт: краны стоят, грузовики у шлагбаума ----------
const PortShot: Shot = ({ g }) => {
  const s = 0.62, y = 900;
  const d1 = stand(g, { turn: 0.5, handL: [-110, -250], handR: [110 + Math.sin(g / 5) * 12, -250], expr: { mouth: "open", open: talk(g, 3), browH: 0.6, browA: -0.6, look: [1, 0] }, seed: 10 });
  const d2 = stand(g, { turn: -0.5, handL: [-40, -470], handR: [60, -190], nod: 6, expr: { mouth: "flat", browA: 0.7, look: [-1, 0] }, seed: 11 });
  return (
    <Svg bg="#f2d8a8"><CamG cam={{ s: lerp(1.0, 1.06, g / 100), cx: 980, cy: 560 }}>
      <Port t={g} />
      <g transform="scale(0.55)"><Truck x={1010 / 0.55} y={870 / 0.55} boxes={0} /></g>
      <g transform="scale(0.55)"><Truck x={620 / 0.55} y={870 / 0.55} boxes={0} /></g>
      <Person x={840} y={y + 40} s={s} look={PEOPLE.worker} pose={d1} uid="p1" />
      <Person x={970} y={y + 40} s={s} look={PEOPLE.man} pose={d2} uid="p2" />
    </CamG><Clock label="DAY 1" time="08:49" /></Svg>
  );
};
// ---------- диспетчерская: экраны гаснут ----------
const Control: Shot = ({ g }) => {
  const red = ip(g, [10, 70], [0, 1]);
  const op = sitting(g, {
    turn: track(g, [[0, 0.1], [30, 0.1], [40, -0.8], [80, -0.8], [92, 0]]), tilt: g > 40 && g < 80 ? -8 : 0,
    handL: trackP(g, [[0, [-60, -60]], [88, [-60, -60]], [100, [-82, -510]]]), handR: trackP(g, [[0, [60, -60]], [88, [60, -60]], [100, [82, -510]]]),
    expr: g < 30 ? { mouth: "smile", look: [0, 0.5] } : g < 92 ? { eyes: "wide", mouth: "o", open: 0.5, browH: 1.2, look: [-1, -0.3] } : { eyes: "wide", mouth: "wavy", browH: 1, browA: -1, sweat: true },
    seed: 12,
  });
  const boss = stand(g, { turn: -0.3, handR: [70, -470], handL: [-60, -200], expr: { mouth: "open", open: talk(g, 5), browA: 0.8 }, seed: 13 });
  return (
    <Svg bg="#d8c09a"><CamG cam={{ s: lerp(1.05, 1.15, g / 138), cx: 960, cy: 520 }}>
      <ControlRoom red={red} t={g} />
      <Person x={1520} y={980} s={0.85} look={PEOPLE.operator} pose={boss} uid="cb2" />
      <Person x={960} y={1010} s={1.05} look={PEOPLE.girl} pose={op} uid="co2" />
      <rect x={560} y={850} width={800} height={240} fill="#6a5240" stroke={OL} strokeWidth={6} />
      <rect x={560} y={850} width={800} height={26} fill="#8a6a50" stroke={OL} strokeWidth={5} />
    </CamG><Clock label="DAY 1" time="08:52" /></Svg>
  );
};
// ---------- кухня: пожал плечами, взял пиццу ----------
const Shrug: Shot = ({ g }) => {
  const shrug = ip(g, [10, 22], [0, 1]) * (1 - ip(g, [30, 40], [0, 1]));
  const sliceIn = g >= 52;
  const pizzaL = toLocal(heroK.x, heroK.y, heroK.s, PIZZA_W);
  const handR = trackP(g, [[0, [60, -180]], [10, [60, -180]], [20, [120, -250]], [32, [120, -250]], [44, pizzaL], [52, pizzaL], [70, [40, -470]], [90, [42, -470]], [110, [70, -300]], [183, [70, -300]]]);
  const handL = trackP(g, [[0, [-60, -180]], [10, [-60, -180]], [20, [-120, -250]], [32, [-120, -250]], [44, [-60, -180]]]);
  const chew = g > 80 && g < 120;
  const pose: Pose = {
    ...stand(g, { turn: g < 44 ? 0.1 : 0.55, lean: g > 36 && g < 56 ? 10 : 0, handL, handR, tilt: shrug * 8,
      expr: g < 40 ? { browH: 1.2, mouth: "flat", eyes: "dot" } : chew ? { eyes: "happy", mouth: "wavy" } : g > 120 ? { mouth: "open", open: talk(g, 2) * 0.8, browH: 0.3 } : { mouth: g > 66 && g < 80 ? "o" : "smile", open: 0.8 }, seed: 14 }),
  };
  pose.hip = [pose.hip[0], pose.hip[1] - shrug * 8];
  const k = heroK, hw: P = [k.x + handR[0] * k.s, k.y + handR[1] * k.s];
  return (
    <Svg><CamG cam={{ s: lerp(1.75, 1.85, g / 183), cx: k.x + 60, cy: k.y - 300 }}>
      <Kitchen open={1} />
      <Person {...k} look={HERO} pose={pose} uid="hK" />
      {sliceIn ? <Slice at={[hw[0] - 6, hw[1] + 4]} bite={g > 80 ? 1 : 0} s={1} /> : null}
    </CamG><Clock label="DAY 1" time="08:53" /></Svg>
  );
};
// ---------- супермаркет: полки полны (пока) ----------
const AisleEnd: Shot = ({ g }) => {
  const z2 = 7, s2 = 0.75 * (3.6 / z2), cx0 = aisleX(-0.9, z2), mx = lerp(cx0, aisleX(0.7, z2), ip(g, [0, 150], [0, 1], (t) => t));
  const zc = 4.2, sc = 0.75 * (3.6 / zc), cartX = lerp(aisleX(-0.2, zc), aisleX(-0.6, zc), g / 190);
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.35, ip(g, [0, 190], [0, 1])), cx: 960, cy: 520 }}>
      <Aisle fill={1} />
      <Person x={mx} y={aisleFloorY(z2)} s={s2} look={PEOPLE.girl} pose={g < 150 ? walking(g, (mx - cx0) / s2, 1, { seed: 15 }) : stand(g, { turn: 0.7, seed: 15, expr: { look: [1, -0.3] } })} uid="e1" />
      <Person x={cartX - 120 * sc} y={aisleFloorY(zc)} s={sc} look={PEOPLE.oldman} pose={stand(g, { turn: 0.4, handR: [150, -250], handL: [110, -260], seed: 16, expr: { look: [1, 0], mouth: "smile" } })} uid="e2" />
      <Cart x={cartX + 30 * sc} y={aisleFloorY(zc)} s={sc} items={4} />
    </CamG><Clock label="DAY 1" time="08:54" /></Svg>
  );
};

// ---------- монтаж (в кадрах, озвучка начинается с кадра 6) ----------
const CUTS: [Shot, number, number][] = [
  [KitchenA, 0, 123], [KitchenB, 123, 213], [Cafe, 213, 306], [Delivery, 306, 498], [AisleShop, 498, 618],
  [Ship, 618, 816], [PhoneBuzz, 816, 906], [News, 906, 1068], [PortShot, 1068, 1170], [Control, 1170, 1308],
  [Shrug, 1308, 1491], [AisleEnd, 1491, PART1_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part1: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <Sequence from={6}><Audio src={staticFile("food/part1.mp3")} /></Sequence>
    <FadeOut total={PART1_FRAMES} />
  </AbsoluteFill>
);
