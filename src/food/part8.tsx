// Часть 8 (≈55 с): «Спустя год». Весна: огород во дворе, корабли и грузовики возвращаются, магазин открывается, хлеб дорогой, кафе снова полное, первый помидор.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, trackP } from "./common";
import { Aisle, CafeTable, Checkout, CheckoutCounter, Cup, Highway, STREET_Y, ShipShape, Street, Truck, aisleFloorY, aisleX } from "./places";
import { Car, Shovel, handW } from "./part5";
import { Courtyard, KID } from "./part6";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART8_FRAMES = 1620;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label="DAY 365" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
const W1: Look = { ...PEOPLE.woman, top: "#8a4a5a", topDark: "#6a3646" };
const CASHIER: Look = PEOPLE.girl;

// ---------- грядки ----------
const Bed: React.FC<{ x: number; y: number; w: number; kind: "lettuce" | "beans" | "potato"; name: string; grow?: number }> = ({ x, y, w, kind, name, grow = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-30} width={w} height={40} rx={8} fill="#6a4a2e" stroke={OL} strokeWidth={4} />
    {Array.from({ length: Math.floor(w / 60) }, (_, i) => { const cx = 30 + i * 60; return <g key={i} transform={`translate(${cx} -26) scale(${grow})`}>
      {kind === "lettuce" ? <g><ellipse cx={0} cy={-12} rx={26} ry={16} fill="#8ac05a" stroke={OL} strokeWidth={3} /><ellipse cx={0} cy={-18} rx={14} ry={10} fill="#a8d870" /></g> : null}
      {kind === "beans" ? <g><path d="M 0 0 L 0 -120" stroke="#8a6a4a" strokeWidth={5} /><path d="M 0 -10 Q 14 -40 0 -70 Q -14 -96 0 -116" stroke="#5a9a3a" strokeWidth={5} fill="none" />{[-30, -60, -90].map((yy) => <ellipse key={yy} cx={8} cy={yy} rx={10} ry={6} fill="#6aaa4a" stroke={OL} strokeWidth={2} />)}</g> : null}
      {kind === "potato" ? <g>{[-1, 0, 1].map((k) => <ellipse key={k} cx={k * 14} cy={-20 - Math.abs(k) * -6} rx={12} ry={18} fill="#5a8a3e" stroke={OL} strokeWidth={2} />)}</g> : null}
    </g>; })}
    <g transform="translate(-10 0)"><rect x={-4} y={-70} width={8} height={70} fill="#8a6a4a" /><rect x={-50} y={-100} width={100} height={36} rx={4} fill="#f6efe2" stroke={OL} strokeWidth={3} />{txt(0, -75, 18, "#3a2a1e", name, 800)}</g>
  </g>
);
const Tomato: React.FC<{ x: number; y: number; bite?: number; r?: number }> = ({ x, y, bite = 0, r = 26 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-r} 0 Q ${-r} ${-r * 1.05} 0 ${-r} Q ${r * 0.9} ${-r * 1.1} ${r} ${-r * 0.1} Q ${r} ${r * 0.95} 0 ${r} Q ${-r * 1.05} ${r * 0.9} ${-r} 0 Z`} fill="#d8443a" stroke={OL} strokeWidth={4} />
    <path d={`M -8 ${-r} L 0 ${-r - 8} L 8 ${-r} M 0 ${-r} L 0 ${-r - 12}`} stroke="#4a8a3a" strokeWidth={5} fill="none" />
    {bite > 0 ? <g><circle cx={r * 0.8} cy={-r * 0.3} r={r * 0.5} fill="#f6d9a4" /><circle cx={r * 0.62} cy={-r * 0.25} r={r * 0.3} fill="#f08a6a" stroke={OL} strokeWidth={3} />{[0, 1, 2].map((k) => <circle key={k} cx={r * 0.5 + k * 6} cy={-r * 0.2 + (k % 2) * 6} r={2.5} fill="#f6e0a0" />)}</g> : null}
  </g>
);
const Loaf: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -70 0 Q -80 -50 -30 -56 Q 0 -66 30 -56 Q 80 -50 70 0 Z" fill="#d8954a" stroke={OL} strokeWidth={5} />{[-30, 0, 30].map((d) => <path key={d} d={`M ${d - 10} -46 q 10 -10 20 0`} stroke="#b8763a" strokeWidth={5} fill="none" />)}</g>
);

// 1. весна во дворе
const Spring: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: lerp(1.0, 1.05, g / 81), cx: 960, cy: 540 }}>
    <Courtyard />
    <circle cx={1700} cy={120} r={70} fill="#fff0b0" opacity={0.9} />
    {[[200, 160], [260, 140], [1300, 120]].map(([bx, by], i) => <path key={i} d={`M ${bx + g * 2} ${by + Math.sin(g / 4 + i) * 6} q 12 -12 24 0 q 12 -12 24 0`} stroke={OL} strokeWidth={4} fill="none" />)}
    <Bed x={160} y={820} w={480} kind="lettuce" name="ANNA" />
    <Bed x={760} y={820} w={480} kind="beans" name="DAVID" />
    <Bed x={1360} y={820} w={480} kind="potato" name="YOU" />
    <Bed x={160} y={960} w={480} kind="potato" name="OLD TOM" />
    <Bed x={760} y={960} w={480} kind="lettuce" name="MIA" />
    <Bed x={1360} y={960} w={480} kind="beans" name="SAM" />
  </CamG></Svg>
);
// 2. огород вблизи: соседка поливает из лейки, старик рыхлит тяпкой; план на стене
const Garden: Shot = ({ g }) => {
  const s = 0.85, wy = 900, wx = 620;
  const can = stand(g, { turn: 0.6, handR: [170, -250], handL: [60, -230], expr: { mouth: "smile", look: [1, 1] }, seed: 1 });
  const ch = handW(wx, wy, s, can, "R");
  const pour = Math.sin(g / 30) > -0.3;
  const ox = 1360, c = (g % 40) / 40, k = c < 0.5 ? c * 2 : 2 - c * 2;
  const hoe = stand(g, { turn: -0.6, lean: -8, handL: [lerp(-20, -40, k), lerp(-260, -180, k)], handR: [lerp(-70, -110, k), lerp(-180, -100, k)], expr: { mouth: "flat", look: [-1, 1] }, seed: 2 });
  const a = handW(ox, wy, s, hoe, "L"), b = handW(ox, wy, s, hoe, "R");
  return (
    <Svg><CamG cam={{ s: lerp(1.2, 1.3, g / 240), cx: 980, cy: 600 }}>
      <Courtyard />
      <g transform="translate(980 380) rotate(-2)"><rect x={-150} y={-100} width={300} height={200} fill="#f2e8d0" stroke={OL} strokeWidth={4} />{txt(0, -64, 22, "#3a2a1e", "SPRING GARDEN")}{Array.from({ length: 6 }, (_, i) => <rect key={i} x={-130 + (i % 3) * 88} y={-44 + Math.floor(i / 3) * 70} width={80} height={60} fill="#b8d0a0" stroke={OL} strokeWidth={2} />)}<circle cx={0} cy={-100} r={8} fill="#c8302a" stroke={OL} strokeWidth={2} /></g>
      <Bed x={300} y={860} w={540} kind="lettuce" name="ANNA" />
      <Bed x={1000} y={860} w={540} kind="potato" name="YOU" />
      <Person x={wx} y={wy} s={s} look={W1} pose={can} uid="w" />
      <g transform={`translate(${ch[0]} ${ch[1]}) rotate(${pour ? 30 : 8})`}><rect x={-30} y={-6} width={60} height={46} rx={6} fill="#3a8a6a" stroke={OL} strokeWidth={4} /><path d="M 30 8 L 74 -16" stroke={OL} strokeWidth={8} /></g>
      {pour ? [0, 1, 2, 3, 4].map((i) => { const sx = ch[0] + 70, sy = ch[1] + 30; const yy = sy + ((g * 7 + i * 18) % Math.max(10, 820 - sy)); return <circle key={i} cx={sx + i * 3} cy={yy} r={4} fill="#6ab0e0" />; }) : null}
      <Person x={ox} y={wy} s={s} look={PEOPLE.oldman} pose={hoe} uid="o" />
      <Shovel a={a} b={b} />
    </CamG></Svg>
  );
};
// 3. порт: кран переносит контейнер с корабля на причал
const PortBack: Shot = ({ g }) => {
  const u = ip(g, [0, 50, 70, 108], [0, 1, 1, 1]), drop = ip(g, [50, 70], [0, 1]), lift0 = ip(g, [0, 14], [0, 1]);
  const tx = lerp(560, 1240, ip(g, [14, 50], [0, 1])), cy = g < 14 ? lerp(520, 300, lift0) : lerp(300, 520, drop);
  return (
    <Svg bg="#f2d8a8"><CamG cam={{ s: 1.0, cx: 960, cy: 540 }}>
      <rect x={-W} width={W * 3} height={H} fill="#f2d8a8" />
      <rect x={-W} y={560} width={W * 3} height={180} fill="#5e8088" />
      <g transform="translate(560 600) scale(0.5)"><ShipShape /></g>
      <rect x={-W} y={700} width={W * 3} height={H} fill="#a8a094" stroke={OL} strokeWidth={6} />
      <g stroke={OL} strokeWidth={6} fill="#e0703a"><rect x={760} y={120} width={24} height={590} /><rect x={1100} y={120} width={24} height={590} /><rect x={400} y={100} width={1000} height={36} /></g>
      <rect x={tx - 40} y={136} width={80} height={40} fill="#f2ead6" stroke={OL} strokeWidth={5} />
      <path d={`M ${tx} 176 L ${tx} ${cy - 70}`} stroke={OL} strokeWidth={4} />
      <rect x={tx - 90} y={cy - 70} width={180} height={80} fill="#3a7a9a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 3 }, (_, c) => Array.from({ length: 2 }, (_, r) => <rect key={`${c}${r}`} x={1340 + c * 190} y={620 - r * 82} width={180} height={80} fill={["#c8603a", "#d8a040", "#5a8a4a"][(c + r) % 3]} stroke={OL} strokeWidth={5} />))}
      <text x={-100} y={-100} fontSize={1}>{u}</text>
    </CamG></Svg>
  );
};
// 4. грузовики снова едут
const Trucks: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: 1.0, cx: 960, cy: 540 }}>
    <Highway />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${-500 + i * 900 + g * 2.2} 0)`}><Truck x={0} y={1010} boxes={6} /></g>)}
  </CamG></Svg>
);
// 5. очередь на заправку
const Gas: Shot = ({ g }) => {
  const cars = ["#c8603a", "#3a7a9a", "#e0b040", "#7a9a4a", "#9a5a8a", "#d8d0c0", "#4a6a8a"];
  const creep = ip(g, [60, 90], [0, 1]) * 30;
  return (
    <Svg><CamG cam={{ s: 1.0, cx: 960, cy: 540 }}>
      <rect x={-W} width={W * 3} height={H} fill="#f0d8a8" />
      <rect x={-W} y={640} width={W * 3} height={H} fill="#8a847a" stroke={OL} strokeWidth={5} />
      <rect x={1180} y={240} width={700} height={50} fill="#c8402e" stroke={OL} strokeWidth={6} />{txt(1530, 280, 40, "#f6efe2", "GAS")}
      {[1300, 1760].map((x) => <rect key={x} x={x - 14} y={290} width={28} height={420} fill="#d8d0c0" stroke={OL} strokeWidth={4} />)}
      {[1420, 1640].map((x) => <g key={x}><rect x={x - 40} y={520} width={80} height={190} rx={8} fill="#e8e0d0" stroke={OL} strokeWidth={5} /><rect x={x - 26} y={540} width={52} height={36} fill="#7ae0c8" stroke={OL} strokeWidth={3} /></g>)}
      {cars.map((c, i) => <Car key={i} x={1530 - i * 360 + (i > 0 ? creep : 0)} y={860} c={c} s={1.0} roof={i % 3 === 2 ? 1 : 0} />)}
      <g transform="translate(300 640)"><rect x={-6} y={-200} width={12} height={200} fill="#5a5a60" /><rect x={-150} y={-260} width={300} height={70} rx={6} fill="#f6efe2" stroke={OL} strokeWidth={4} />{txt(0, -214, 30, "#c8302a", "LIMIT 20 L")}</g>
    </CamG></Svg>
  );
};
// 6. магазин открывается: продавец поворачивает ключ, рольставня поднимается, загорается OPEN
const Opens: Shot = ({ g }) => {
  const s = 0.75, x = 1390, y = STREET_Y + 10;
  const box: P = [1528, STREET_Y - 290]; // замок у двери на высоте груди: рука дотягивается
  const turn = ip(g, [14, 24], [0, 1]);
  const handR: P = g < 14 ? trackP(g, [[0, [60, -200]], [12, [(box[0] - x) / s, (box[1] + 10 - y) / s]]]) : g < 34 ? [(box[0] - x) / s, (box[1] + 10 - y) / s] : trackP(g, [[34, [(box[0] - x) / s, (box[1] + 10 - y) / s]], [46, [60, -200]]]);
  const man = stand(g, { turn: 0.5, handR, expr: { mouth: "flat", look: [1, -0.3] }, seed: 10 });
  const up = ip(g, [26, 76], [0, 1], (t) => t);
  const shTop = 540, shBot = lerp(STREET_Y, shTop + 20, up);
  return (
    <Svg><CamG cam={{ s: 1.5, cx: 1500, cy: 600 }}>
      <Street stock={0.3} />
      <rect x={1550} y={shTop} width={170} height={shBot - shTop} fill="#9aa0a8" stroke={OL} strokeWidth={4} />
      {Array.from({ length: Math.max(0, Math.floor((shBot - shTop) / 20)) }, (_, i) => <path key={i} d={`M 1550 ${shTop + 10 + i * 20} L 1720 ${shTop + 10 + i * 20}`} stroke="#7a8088" strokeWidth={3} />)}
      <rect x={1545} y={shTop - 24} width={180} height={28} rx={6} fill="#7a8088" stroke={OL} strokeWidth={4} />
      <g transform={`translate(${box[0]} ${box[1]})`}><rect x={-20} y={-26} width={40} height={52} rx={4} fill="#c8c8c0" stroke={OL} strokeWidth={3} /><circle cx={0} cy={0} r={6} fill="#3a3a40" /><path d={`M 0 0 L ${Math.cos(-1.57 + turn * 1.57) * 12} ${Math.sin(-1.57 + turn * 1.57) * 12}`} stroke="#c8a040" strokeWidth={4} /></g>
      <g transform="translate(1820 520)"><rect x={-60} y={-26} width={120} height={52} rx={10} fill={g > 80 ? "#c8302a" : "#5a3a3a"} stroke={OL} strokeWidth={4} />{txt(0, 12, 30, g > 80 ? "#fff4c8" : "#8a6a6a", "OPEN")}</g>
      <Person x={x} y={y} s={s} look={PEOPLE.worker} pose={man} uid="m" />
    </CamG></Svg>
  );
};
// 7. полки наполовину пусты
const Half: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: lerp(1.1, 1.2, g / 33), cx: 960, cy: 520 }}><Aisle fill={0.4} /></CamG></Svg>
);
// 8. хлеб в пять раз дороже — но он есть: рука берёт буханку
const Bread: Shot = ({ g }) => {
  const reach = ip(g, [92, 104], [0, 1]), back = ip(g, [108, 126], [0, 1]);
  const hand: P = [lerp(1500, 1140, reach) + back * 300, lerp(1200, 560, reach) + back * 600];
  const taken = g >= 104;
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#d0b88e" />
      <rect y={620} width={W} height={40} fill="#b8a07a" stroke={OL} strokeWidth={5} /><rect y={660} width={W} height={H} fill="#a8906a" />
      <rect y={260} width={W} height={30} fill="#b8a07a" stroke={OL} strokeWidth={5} />
      {[440, 640, 840].map((x) => <Loaf key={x} x={x} y={620} />)}
      {!taken ? <Loaf x={1140} y={620} /> : null}
      <g transform="translate(960 680)"><rect x={-150} y={0} width={300} height={110} fill="#fffbe8" stroke={OL} strokeWidth={4} />{txt(-70, 70, 44, "#8a7a6a", "$3")}<path d="M -110 40 L -30 60" stroke="#c8302a" strokeWidth={6} />{txt(60, 76, 60, "#c8302a", "$15")}</g>
      {g >= 90 && back < 1 ? <g><path d={`M 1600 1200 L ${hand[0]} ${hand[1]}`} stroke={OL} strokeWidth={84} strokeLinecap="round" /><path d={`M 1600 1200 L ${hand[0]} ${hand[1]}`} stroke="#b8564a" strokeWidth={70} strokeLinecap="round" />{taken ? <Loaf x={hand[0]} y={hand[1] + 30} /> : null}<circle cx={hand[0]} cy={hand[1]} r={36} fill="#f3cf96" stroke={OL} strokeWidth={5} /></g> : null}
    </CamG></Svg>
  );
};
// 9. никто не бежит: покупательница спокойно берёт одну вещь с полки и кладёт в корзину
const Calm: Shot = ({ g }) => {
  const Z = 3.4, s = 0.75 * (3.6 / Z), X = -1.1;
  const x = aisleX(X, Z), y = aisleFloorY(Z);
  const shelf: P = [aisleX(-1.6, Z) + 10, aisleFloorY(Z) - 1.05 * 900 / Z - 30];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const handL: P = trackP(g, [[0, [-60, -200]], [30, loc(shelf)], [40, loc(shelf)], [62, [40, -300]], [70, [40, -280]], [84, [-60, -200]]]);
  const basket: P = [70, -215];
  const pose = stand(g, { turn: g < 44 ? -0.6 : 0.3, handL, handR: basket, expr: { mouth: "smile", look: g < 44 ? [-1, -0.3] : [0.5, 0.6] }, seed: 20 });
  const hl = handW(x, y, s, pose, "L"), hb = handW(x, y, s, pose, "R");
  const holding = g >= 36 && g < 68, inB = g >= 68;
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 900, cy: 560 }}>
      <Aisle fill={0.45} />
      <Person x={aisleX(1.0, 6)} y={aisleFloorY(6)} s={0.75 * 3.6 / 6} look={PEOPLE.oldman} pose={stand(g, { turn: 0.7, expr: { mouth: "flat", look: [1, 0] }, seed: 21 })} uid="o" />
      <Person x={x} y={y} s={s} look={W1} pose={pose} uid="w" />
      <g transform={`translate(${hb[0]} ${hb[1]})`}>{inB ? <rect x={-22} y={-10} width={40} height={30} rx={4} fill="#e8b23a" stroke={OL} strokeWidth={3} /> : null}<path d="M -46 0 L 46 0 L 38 52 L -38 52 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -32 0 Q 0 -44 32 0" stroke={OL} strokeWidth={4} fill="none" /></g>
      {holding ? <rect x={hl[0] - 20} y={hl[1] - 4} width={40} height={30} rx={4} fill="#e8b23a" stroke={OL} strokeWidth={3} /> : null}
    </CamG></Svg>
  );
};
// 10. касса: кассир протягивает хлеб, покупатель благодарит
const Thanks: Shot = ({ g }) => {
  const cx = 900, cy = 980, cs = 0.95, bx = 1500, by = 1140, bs = 1.2;
  const meet: P = [1200, 640];
  const give = ip(g, [6, 24], [0, 1]), back = ip(g, [40, 56], [0, 1]);
  const cHand: P = [lerp(60, (meet[0] - cx) / cs, give * (1 - ip(g, [30, 42], [0, 1]))), lerp(-200, (meet[1] - cy) / cs, give * (1 - ip(g, [30, 42], [0, 1])))];
  const bHand: P = [lerp(-60, (meet[0] - bx) / bs, ip(g, [12, 26], [0, 1]) * (1 - back)), lerp(-200, (meet[1] - by) / bs, ip(g, [12, 26], [0, 1]) * (1 - back))];
  const cashier = stand(g, { turn: 0.5, handR: cHand, expr: { mouth: "smile", look: [1, 0] }, seed: 30 });
  const buyer = stand(g, { turn: -0.6, nod: g > 34 && g < 50 ? 8 : 0, handL: bHand, expr: { mouth: g > 30 ? "open" : "smile", open: g > 30 && g < 50 ? talk(g, 2) * 0.3 : 0, look: [-1, 0] }, seed: 31 });
  const ch = handW(cx, cy, cs, cashier, "R"), bh = handW(bx, by, bs, buyer, "L");
  const swapped = g >= 28;
  return (
    <Svg><CamG cam={{ s: 1.3, cx: 1100, cy: 600 }}>
      <Checkout t={g} />
      <Person x={cx} y={cy} s={cs} look={CASHIER} pose={cashier} uid="c" />
      <CheckoutCounter t={g} belt={false} />
      <Person x={bx} y={by} s={bs} look={PEOPLE.man} pose={buyer} uid="b" />
      <Loaf x={swapped ? bh[0] : ch[0]} y={(swapped ? bh[1] : ch[1]) + 30} s={0.8} />
    </CamG></Svg>
  );
};
// 11. кафе снова открыто: три блюда в меню, все столики заняты
const CafeOpen: Shot = ({ g }) => {
  const sY = STREET_Y, s = 0.75;
  const ppl: [number, Look, number][] = [[150, PEOPLE.woman, 0.5], [390, PEOPLE.man, -0.5], [640, PEOPLE.oldman, 0.2]];
  const speaker = Math.floor(g / 50) % 3;
  return (
    <Svg><CamG cam={{ s: lerp(1.45, 1.55, g / 138), cx: 500, cy: 620 }}>
      <Street stock={0.4} />
      {ppl.map(([x, lk, tn], i) => <g key={i}><Person x={x} y={sY} s={s} look={lk} pose={sitting(g + i * 13, { turn: tn, handL: [-50, -205], handR: [50, -205], expr: { mouth: i === speaker ? "open" : "smile", open: i === speaker ? talk(g, i) * 0.35 : 0, look: [tn > 0 ? 1 : -1, 0] }, seed: 40 + i })} uid={"c" + i} /><CafeTable x={x} /><Cup x={x + 30} y={sY - 140} steam={g + i * 10} /></g>)}
      <g transform={`translate(880 ${sY})`}><path d="M -70 0 L -40 -260 M 70 0 L 40 -260" stroke="#6a4a2e" strokeWidth={10} /><rect x={-80} y={-280} width={160} height={210} rx={6} fill="#2e3a34" stroke="#8a6a4a" strokeWidth={10} />
        {txt(0, -240, 24, "#f6efe2", "MENU")}{["SOUP", "BREAD", "TEA"].map((m, i) => <text key={m} x={0} y={-196 + i * 40} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={26} fill="#f6efe2">{m}</text>)}</g>
    </CamG></Svg>
  );
};
// 12. первый помидор: герой срывает его рукой, рассматривает и откусывает
const Pick: Shot = ({ g }) => {
  const s = 1.0, x = 820, y = 1080;
  const tom: P = [1050, 660];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const look: P = [930, 600];
  const mouth: P = [x + 66 * s, y - 470 * s];
  const handR: P = trackP(g, [[0, [60, -200]], [16, loc([tom[0] - 6, tom[1] + 4])], [26, loc([tom[0] - 6, tom[1] + 4])], [34, loc([tom[0] - 20, tom[1] + 20])], [52, loc(look)], [96, loc(look)], [108, loc([mouth[0] + 20, mouth[1] + 14])], [118, loc([mouth[0] + 20, mouth[1] + 14])], [134, loc(look)]]);
  const bit = g >= 114;
  const hero = stand(g, { turn: 0.5, handR, expr: g >= 114 && g < 140 ? { mouth: "smile", eyes: "happy" } : { mouth: g > 50 ? "smile" : "flat", look: g < 34 ? [1, 0] : [0.6, 0.3] }, seed: 50 });
  const h = handW(x, y, s, hero, "R");
  const picked = g >= 26;
  const tomPos: P = picked ? [h[0] + 4, h[1] - 8] : tom;
  return (
    <Svg><CamG cam={{ s: 1.4, cx: 960, cy: 600 }}>
      <Courtyard />
      <rect x={-W} y={820} width={W * 3} height={300} fill="#6a4a2e" />
      <g transform="translate(1100 840)"><path d="M 0 0 L 0 -340" stroke="#8a6a4a" strokeWidth={8} /><path d="M -10 0 Q 30 -100 -10 -180 Q -40 -260 10 -320" stroke="#4a8a3a" strokeWidth={7} fill="none" />
        {[[-40, -120], [30, -160], [-30, -230], [36, -270], [-20, -300]].map(([lx, ly], i) => <ellipse key={i} cx={lx} cy={ly} rx={30} ry={14} fill="#5a9a3a" stroke={OL} strokeWidth={3} transform={`rotate(${i % 2 ? 20 : -20} ${lx} ${ly})`} />)}
        <path d={`M -50 -180 Q -54 -186 ${tom[0] - 1100 + 4} ${tom[1] - 840 - 20}`} stroke="#4a8a3a" strokeWidth={4} fill="none" opacity={picked ? 0 : 1} />
        <Tomato x={10} y={-110} r={20} /></g>
      <Person x={x} y={y} s={s} look={HERO} pose={hero} uid="h" />
      <Tomato x={tomPos[0]} y={tomPos[1]} bite={bit ? 1 : 0} />
    </CamG></Svg>
  );
};
// 13. финал: герой смотрит на полку — по-другому, чем год назад
const Shelf: Shot = ({ g }) => {
  const Z = 3.6, s = 0.75;
  const hero = stand(g, { turn: -0.6, expr: { mouth: "flat", browA: -0.3, eyes: "dot", look: [-1, -0.2] }, seed: 60 });
  return (
    <Svg><CamG cam={{ s: lerp(1.2, 1.4, ip(g, [0, 140], [0, 1])), cx: 880, cy: 540 }}>
      <Aisle fill={0.75} />
      <Person x={aisleX(-0.6, Z)} y={aisleFloorY(Z)} s={s} look={HERO} pose={hero} uid="h" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Spring, 0, T(2.7)], [Garden, T(2.7), T(10.7)], [PortBack, T(10.7), T(14.3)], [Trucks, T(14.3), T(17.0)], [Gas, T(17.0), T(20.6)],
  [Opens, T(20.6), T(24.2)], [Half, T(24.2), T(25.3)], [Bread, T(25.3), T(29.7)], [Calm, T(29.7), T(33.4)], [Thanks, T(33.4), T(35.6)],
  [CafeOpen, T(35.6), T(40.2)], [Pick, T(40.2), T(45.6)], [Shelf, T(45.6), PART8_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part8: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="1 YEAR LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part8.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx8.wav")} volume={0.3} />
    <FadeOut total={PART8_FRAMES} />
  </AbsoluteFill>
);
export const _u8 = [H, KID];
export const CUTS8 = CUTS.map(([, a, b]) => [a, b]);
