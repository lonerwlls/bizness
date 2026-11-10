// Часть 5 (≈60 с): «Спустя месяц». Бартер, рынок на парковке, огороды, исход из города, ферма без топлива, «всё связано».
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon, rigGeo } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, stand, talk, trackP, walking } from "./common";
import { Box, Highway, RiceBag } from "./places";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART5_FRAMES = 1800;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label="DAY 31" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
/** реальная точка кисти в мире (с учётом длины руки) */
export const handW = (x: number, y: number, s: number, pose: Pose, side: "L" | "R"): P => { const h = rigGeo(pose)[side === "L" ? "hL" : "hR"]; return [x + h[0] * s, y + h[1] * s]; };
const FARMER: Look = { kind: "person", skin: "#e2a868", skinDark: "#b98040", top: "#6a8a4a", topDark: "#506a36", pants: "#3a4a6a", shoe: "#3a2a1e", hairStyle: "cap", cap: "#c8a050" };

// ---------- предметы ----------
export const Boots: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-22, 18].map((dx) => <path key={dx} d={`M ${dx - 16} 0 L ${dx - 16} -56 L ${dx + 8} -56 L ${dx + 8} -18 L ${dx + 30} -14 Q ${dx + 34} 0 ${dx + 26} 0 Z`} fill="#6a4a2e" stroke={OL} strokeWidth={4} strokeLinejoin="round" />)}
  </g>
);
const Phone: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-18} y={-34} width={36} height={64} rx={6} fill="#2a2a30" stroke={OL} strokeWidth={4} /><rect x={-13} y={-27} width={26} height={48} rx={2} fill="#7ab0d0" /></g>
);
export const Can: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-18} y={-24} width={36} height={48} rx={4} fill="#a8aeb6" stroke={OL} strokeWidth={4} /><rect x={-18} y={-10} width={36} height={18} fill="#d8443a" /></g>
);
const Batteries: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-26} y={-22} width={52} height={44} rx={4} fill="#f2e6c4" stroke={OL} strokeWidth={4} />{[-14, 0, 14].map((d) => <rect key={d} x={d - 5} y={-16} width={10} height={30} fill="#3a3a40" />)}</g>
);
export const Bucket: React.FC<{ x: number; y: number; grow: number; s?: number; tomato?: boolean }> = ({ x, y, grow, s = 1, tomato = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`translate(0 -50) scale(${0.2 + 0.8 * grow})`}>
      <path d="M 0 0 L 0 -90" stroke="#4a7a3a" strokeWidth={7} />
      {[-1, 1].map((k) => <ellipse key={k} cx={k * 22} cy={-40} rx={22} ry={11} fill="#6a9a4a" stroke={OL} strokeWidth={3} transform={`rotate(${k * -25} ${k * 22} -40)`} />)}
      <ellipse cx={0} cy={-90} rx={20} ry={12} fill="#6a9a4a" stroke={OL} strokeWidth={3} />
      {tomato && grow > 0.7 ? [[-16, -60], [14, -70]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={11} fill="#d8443a" stroke={OL} strokeWidth={3} />) : null}
    </g>
    <path d="M -36 -54 L 36 -54 L 28 0 L -28 0 Z" fill="#c8ccd2" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-38} y={-60} width={76} height={10} rx={4} fill="#a8aeb6" stroke={OL} strokeWidth={3} />
  </g>
);
const Tire: React.FC<{ x: number; y: number; grow: number }> = ({ x, y, grow }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`translate(0 -40) scale(${0.3 + 0.7 * grow})`}>{[-30, 0, 30].map((d) => <ellipse key={d} cx={d} cy={-24 - Math.abs(d) * -0.2} rx={20} ry={26} fill="#5a8a3e" stroke={OL} strokeWidth={3} />)}</g>
    <ellipse cx={0} cy={-20} rx={80} ry={30} fill="#2e2a2a" stroke={OL} strokeWidth={5} />
    <ellipse cx={0} cy={-26} rx={52} ry={14} fill="#5a3e2a" />
  </g>
);
export const Shovel: React.FC<{ a: P; b: P }> = ({ a, b }) => {
  // древко проходит через обе кисти и уходит вниз к лопате
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const top: P = [a[0] - ux * 30, a[1] - uy * 30], end: P = [b[0] + ux * 140, b[1] + uy * 140];
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI - 90;
  return (
    <g>
      <path d={`M ${top[0]} ${top[1]} L ${end[0]} ${end[1]}`} stroke="#8a5a30" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${top[0]} ${top[1]} L ${end[0]} ${end[1]}`} stroke={OL} strokeWidth={14} strokeLinecap="round" opacity={0.25} />
      <g transform={`translate(${end[0]} ${end[1]}) rotate(${ang})`}><path d="M -26 0 L 26 0 L 22 50 Q 0 70 -22 50 Z" fill="#9aa0a8" stroke={OL} strokeWidth={4} /></g>
    </g>
  );
};
export const Car: React.FC<{ x: number; y: number; c: string; s?: number; roof?: number; flip?: boolean }> = ({ x, y, c, s = 1, roof = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {roof === 1 ? <rect x={-80} y={-170} width={140} height={34} rx={8} fill="#e8d8b0" stroke={OL} strokeWidth={4} /> : null}
    {roof === 2 ? <g><rect x={-90} y={-176} width={70} height={40} fill="#3a6a9a" stroke={OL} strokeWidth={4} /><rect x={-14} y={-170} width={60} height={34} fill="#c8603a" stroke={OL} strokeWidth={4} /></g> : null}
    <path d="M -150 -40 L -150 -80 Q -146 -96 -120 -98 L -80 -140 L 60 -140 L 110 -96 L 150 -90 Q 166 -86 166 -60 L 166 -40 Z" fill={c} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -70 -128 L -10 -128 L -10 -98 L -100 -98 Z M 2 -128 L 54 -128 L 92 -98 L 2 -98 Z" fill="#bfe0f0" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {[-90, 100].map((wx) => <g key={wx}><circle cx={wx} cy={-38} r={30} fill="#2e2a2a" stroke={OL} strokeWidth={5} /><circle cx={wx} cy={-38} r={11} fill="#a8a29a" /></g>)}
  </g>
);
const Tractor: React.FC<{ x: number; y: number; hood?: number }> = ({ x, y, hood = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-60} y={-330} width={170} height={170} rx={8} fill="none" stroke={OL} strokeWidth={10} />
    <rect x={-60} y={-330} width={170} height={170} rx={8} fill="#bfe0f0" opacity={0.5} />
    <rect x={-70} y={-340} width={190} height={20} rx={6} fill="#c8402e" stroke={OL} strokeWidth={5} />
    <path d="M -80 -170 L 130 -170 L 130 -90 L -80 -90 Z" fill="#c8402e" stroke={OL} strokeWidth={6} />
    <path d={`M 130 -170 L 330 -170 L 330 -90 L 130 -90 Z`} fill="#d8503a" stroke={OL} strokeWidth={6} />
    <g transform={`rotate(${-hood * 35} 130 -170)`}><rect x={130} y={-182} width={200} height={16} rx={4} fill="#c8402e" stroke={OL} strokeWidth={5} /></g>
    <rect x={290} y={-250} width={16} height={80} fill="#4a4038" stroke={OL} strokeWidth={4} />
    <circle cx={-10} cy={-80} r={92} fill="#2e2a2a" stroke={OL} strokeWidth={6} /><circle cx={-10} cy={-80} r={40} fill="#e0b040" stroke={OL} strokeWidth={4} />
    <circle cx={270} cy={-48} r={48} fill="#2e2a2a" stroke={OL} strokeWidth={6} /><circle cx={270} cy={-48} r={20} fill="#e0b040" stroke={OL} strokeWidth={4} />
  </g>
);
const Jerrycan: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-34} y={0} width={68} height={86} rx={6} fill="#c8402e" stroke={OL} strokeWidth={4} />
    <path d="M -34 0 L -14 -14 L 24 -14 L 34 0" fill="#c8402e" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -24 20 L 24 66 M 24 20 L -24 66" stroke="#9a2e20" strokeWidth={5} />
  </g>
);
const Bills: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>{[-8, 0, 8].map((r, i) => <g key={i} transform={`rotate(${r - 10})`}><rect x={-40} y={-20} width={80} height={40} rx={3} fill="#9ac08a" stroke={OL} strokeWidth={3} /><circle r={10} fill="none" stroke="#5a8a4a" strokeWidth={3} /></g>)}</g>
);
export const Ground: React.FC<{ y: number; c?: string; sky?: string }> = ({ y, c = "#d4c09a", sky = "#efd9ae" }) => (
  <g><rect x={-W} width={W * 3} height={H} fill={sky} /><rect x={-W} y={y} width={W * 3} height={H} fill={c} stroke={OL} strokeWidth={5} /></g>
);
const Stall: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 360 }) => (
  <g>
    <rect x={x - w / 2} y={y - 120} width={w} height={22} fill="#b08050" stroke={OL} strokeWidth={5} />
    <rect x={x - w / 2} y={y - 100} width={w} height={100} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
  </g>
);

// 1. деньги больше ничего не значат: продавец отказывается от купюр
const Money: Shot = ({ g }) => {
  const offer = ip(g, [6, 22], [0, 1]), back = ip(g, [62, 80], [0, 1]);
  const hero = stand(g, { turn: 0.6, handR: [lerp(60, 170, offer * (1 - back)), lerp(-172, -300, offer * (1 - back))], expr: { mouth: g > 50 ? "wavy" : "flat", browA: g > 50 ? -0.6 : 0, look: [1, 0] }, seed: 1 });
  const no = g > 30 ? Math.sin((g - 30) * 0.45) * 0.45 * ip(g, [30, 40, 70, 80], [0, 1, 1, 0]) : 0;
  const seller = stand(g, { turn: -0.4 + no, handL: [-30, -270], handR: [30, -270], expr: { mouth: "flat", browA: -0.5, look: [-1, 0] }, seed: 2 });
  const hx = 640, hy = 980, s = 0.95, hand = handW(hx, hy, s, hero, "R");
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.25, g / 92), cx: 900, cy: 580 }}>
      <Ground y={760} sky="#e8cfa0" />
      <rect x={1000} y={300} width={600} height={460} fill="#d8b888" stroke={OL} strokeWidth={5} />
      <path d="M 980 300 L 1620 300 L 1580 240 L 1020 240 Z" fill="#c84a3a" stroke={OL} strokeWidth={5} />
      <Person x={1230} y={900} s={0.9} look={PEOPLE.oldman} pose={seller} uid="se" />
      <Stall x={1230} y={960} w={460} />
      <RiceBag x={1080} y={840} s={0.8} /><RiceBag x={1170} y={840} s={0.8} />
      <g transform="translate(1390 760)"><rect x={-80} y={-34} width={160} height={50} fill="#f6efe2" stroke={OL} strokeWidth={4} />{txt(0, 4, 28, "#c0302a", "NO CASH")}</g>
      <Person x={hx} y={hy} s={s} look={HERO} pose={hero} uid="h" />
      <Bills x={hand[0] + 10} y={hand[1] - 6} />
    </CamG></Svg>
  );
};
// 2. бартер: ботинки за рис
const Barter: Shot = ({ g }) => {
  const TOP = 720, s = 0.9, mx = 1160, my = 980, wx = 740, wy = 980;
  // мужчина достаёт ботинки снизу и ставит на стол; женщина пододвигает рис, мужчина забирает его
  const put = ip(g, [10, 34], [0, 1]);
  const bootsSpot: P = [1030, TOP];
  const manLocal = (p: P): P => [(p[0] - mx) / s, (p[1] - my) / s];
  const riceA: P = [850, TOP], riceB: P = [945, TOP];
  const riceX = lerp(riceA[0], riceB[0], ip(g, [62, 84], [0, 1]));
  const manHand: P = g < 40 ? trackP(g, [[0, [-50, -180]], [10, [-60, -200]], [34, manLocal([bootsSpot[0], bootsSpot[1] - 30])], [40, [-50, -200]]])
    : g < 86 ? [-50, -190] : g < 104 ? trackP(g, [[86, [-50, -190]], [104, manLocal([riceB[0], riceB[1] - 40])]]) : trackP(g, [[104, manLocal([riceB[0], riceB[1] - 40])], [120, [-40, -300]]]);
  const man = stand(g, { turn: -0.6, handL: manHand, expr: { mouth: g > 100 ? "smile" : "flat", look: [-1, 0.3] }, seed: 3 });
  const nod = g > 50 && g < 66 ? Math.sin((g - 50) * 0.8) * 10 : 0;
  const womanHand: P = g < 56 ? [60, -180] : trackP(g, [[56, [60, -180]], [62, [((riceA[0] - 30) - wx) / s, (TOP - 40 - wy) / s]], [84, [((riceB[0] - 30) - wx) / s, (TOP - 40 - wy) / s]], [96, [60, -180]]]);
  const woman = stand(g, { turn: 0.6, nod, handR: womanHand, expr: { mouth: g > 50 ? "smile" : "flat", look: [1, 0.5] }, seed: 4 });
  const mh = handW(mx, my, s, man, "L");
  const bootsPos: P = put < 1 ? [mh[0], mh[1] + 30] : bootsSpot;
  const ricePos: P = g < 104 ? [riceX, TOP] : [mh[0], mh[1] + 40];
  return (
    <Svg><CamG cam={{ s: 1.2, cx: 950, cy: 600 }}>
      <Ground y={780} c="#c8b48e" sky="#e3c896" />
      <Person x={wx} y={wy} s={s} look={PEOPLE.woman} pose={woman} uid="wo" />
      <Person x={mx} y={my} s={s} look={PEOPLE.man} pose={man} uid="ma" />
      <rect x={790} y={TOP} width={320} height={24} fill="#b08050" stroke={OL} strokeWidth={5} />
      <rect x={806} y={TOP + 24} width={20} height={240} fill="#8a6a4a" stroke={OL} strokeWidth={4} /><rect x={1074} y={TOP + 24} width={20} height={240} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      {g >= 8 ? <Boots x={bootsPos[0]} y={bootsPos[1]} s={1.1} /> : null}
      <RiceBag x={ricePos[0]} y={ricePos[1]} s={0.9} />
    </CamG></Svg>
  );
};
// 2b. крупно: руки меняют телефон на рис, потом — записка «1 WEEK OF WORK»
const Hands: Shot = ({ g }) => {
  const arm = (from: P, to: P, sleeve: string, k: number, item?: React.ReactNode) => {
    const p: P = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
    return <g><path d={`M ${from[0]} ${from[1]} L ${p[0]} ${p[1]}`} stroke={OL} strokeWidth={72} strokeLinecap="round" /><path d={`M ${from[0]} ${from[1]} L ${p[0]} ${p[1]}`} stroke={sleeve} strokeWidth={60} strokeLinecap="round" />{item}<circle cx={p[0]} cy={p[1]} r={30} fill="#f0c690" stroke={OL} strokeWidth={5} /></g>;
  };
  const a1 = ip(g, [0, 14, 26, 36], [0, 1, 1, 0]), a2 = ip(g, [12, 24, 34, 44], [0, 1, 1, 0]);
  const phoneOn = g >= 14, riceGone = g >= 24;
  const a3 = ip(g, [42, 54, 64, 74], [0, 1, 1, 0]);
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#9a7048" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M 0 ${i * 150 + 40} L ${W} ${i * 150 + 70}`} stroke="rgba(0,0,0,0.08)" strokeWidth={24} />)}
      {phoneOn && g >= 26 ? <Phone x={760} y={560} s={2.2} /> : null}
      {!riceGone ? <RiceBag x={1160} y={640} s={1.6} /> : null}
      {g >= 64 ? <g transform="translate(960 560) rotate(-4)"><rect x={-230} y={-80} width={460} height={160} fill="#f6efe2" stroke={OL} strokeWidth={5} />{txt(0, -10, 44, "#3a2a1e", "1 WEEK OF WORK")}{txt(0, 50, 30, "#8a6a4a", "= 1 BAG OF RICE", 700)}</g> : null}
      {arm([-80, 620], [760, 560], "#4f6f8f", a1, g < 26 ? <Phone x={lerp(-80, 760, a1)} y={lerp(620, 560, a1) - 10} s={2.2} /> : null)}
      {arm([W + 80, 700], [1160, 600], "#b8564a", a2, g >= 24 ? <RiceBag x={lerp(W + 80, 1160, a2)} y={lerp(700, 600, a2) + 50} s={1.6} /> : null)}
      {g >= 42 ? arm([-80, 800], [960, 580], "#4f6f8f", a3, g < 64 ? <g transform={`translate(${lerp(-80, 960, a3)} ${lerp(800, 580, a3)}) rotate(-4)`}><rect x={-230} y={-80} width={460} height={160} fill="#f6efe2" stroke={OL} strokeWidth={5} />{txt(0, -10, 44, "#3a2a1e", "1 WEEK OF WORK")}</g> : null) : null}
    </CamG></Svg>
  );
};
// 3. рынок на парковке за закрытым магазином
const Lot: Shot = ({ g }) => {
  const sellers: [number, number, Look, number][] = [[360, 760, PEOPLE.oldman, 0], [900, 760, PEOPLE.girl, 1], [1440, 760, PEOPLE.worker, 2]];
  const walkers: [number, number, number, Look, number][] = [[200, 1000, 1, PEOPLE.woman, 2.6], [1700, 940, -1, PEOPLE.man, 2.2]];
  return (
    <Svg><CamG cam={{ s: 1.05, cx: lerp(860, 1060, g / 126), cy: 560 }}>
      <Ground y={640} c="#8a847a" sky="#e8cfa0" />
      <rect x={-200} y={200} width={2400} height={440} fill="#d8c8a6" stroke={OL} strokeWidth={5} />
      <rect x={600} y={240} width={800} height={70} rx={8} fill="#2e6a9a" stroke={OL} strokeWidth={5} />{txt(1000, 292, 46, "#f6efe2", "SUPERMARKET")}
      {[0, 1, 2].map((i) => <g key={i}><rect x={180 + i * 620} y={360} width={480} height={280} fill="#9aa0a8" stroke={OL} strokeWidth={5} />{Array.from({ length: 12 }, (_, k) => <path key={k} d={`M ${180 + i * 620} ${380 + k * 22} L ${660 + i * 620} ${380 + k * 22}`} stroke="#7a8088" strokeWidth={4} />)}</g>)}
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${-100 + i * 260} 660 L ${-200 + i * 300} 1080`} stroke="#f2e6c4" strokeWidth={8} opacity={0.7} />)}
      {sellers.map(([x, y, lk, i]) => <g key={i}>
        <Person x={x} y={y} s={0.7} look={lk} pose={stand(g + i * 20, { turn: 0.2 * (i - 1), handL: [-40, -250], handR: [40, -250], expr: { mouth: i === 1 ? "open" : "flat", open: talk(g, i) * 0.4 }, seed: 10 + i })} uid={"s" + i} />
        <rect x={x - 170} y={y + 10} width={340} height={70} fill={["#c8603a", "#3a7a9a", "#7a9a4a"][i]} stroke={OL} strokeWidth={4} />
        {i === 0 ? <><Boots x={x - 90} y={y + 50} /><Can x={x} y={y + 40} /><Can x={x + 40} y={y + 40} /><Batteries x={x + 110} y={y + 44} /></> : null}
        {i === 1 ? <><RiceBag x={x - 90} y={y + 60} s={0.6} /><Phone x={x} y={y + 44} /><Box x={x + 100} y={y + 40} s={0.6} /></> : null}
        {i === 2 ? <><Jerrycan x={x - 110} y={y - 20} /><Can x={x} y={y + 40} /><RiceBag x={x + 100} y={y + 60} s={0.6} /></> : null}
      </g>)}
      {walkers.map(([x0, y, dir, lk, sp], i) => { const x = x0 + dir * g * sp; return <Person key={i} x={x} y={y} s={0.85} look={lk} pose={walking(g, (g * sp) / 0.85, dir, { seed: 20 + i, handL: i === 0 ? [-40, -260] : undefined, expr: { mouth: "flat" } })} uid={"w" + i} />; })}
      <RiceBag x={200 + g * 2.6 - 40 + 6} y={1000 - 255 * 0.85} s={0.5} />
    </CamG></Svg>
  );
};
// 3b. двое меняются: консервы ↔ батарейки (вещи всё время в руках, в момент обмена руки встречаются)
const Swap: Shot = ({ g }) => {
  const s = 1.0, ax = 680, bx = 1240, y = 1040;
  const meet = ip(g, [20, 50], [0, 1]), apart = ip(g, [80, 110], [0, 1]);
  const k = meet * (1 - apart);
  const A = stand(g, { turn: 0.6, handR: [lerp(60, 230, k), lerp(-180, -300, k)], expr: { mouth: g > 70 ? "smile" : "flat", look: [1, 0] }, seed: 30 });
  const B = stand(g, { turn: -0.6, handL: [lerp(-60, -230, k), lerp(-180, -300, k)], expr: { mouth: g > 70 ? "smile" : "flat", look: [-1, 0] }, seed: 31 });
  const ha = handW(ax, y, s, A, "R"), hb = handW(bx, y, s, B, "L");
  const swapped = g >= 62;
  return (
    <Svg><CamG cam={{ s: 1.3, cx: 960, cy: 560 }}>
      <Ground y={700} c="#8a847a" sky="#d8c8a6" />
      <rect x={-200} y={160} width={2400} height={540} fill="#d8c8a6" />
      <rect x={300} y={260} width={1320} height={440} fill="#9aa0a8" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M 300 ${280 + i * 24} L 1620 ${280 + i * 24}`} stroke="#7a8088" strokeWidth={4} />)}
      <Person x={ax} y={y} s={s} look={PEOPLE.girl} pose={A} uid="a" />
      <Person x={bx} y={y} s={s} look={PEOPLE.oldman} pose={B} uid="b" />
      {swapped ? <Batteries x={ha[0] + 10} y={ha[1]} s={1.2} /> : <Can x={ha[0] + 10} y={ha[1]} s={1.2} />}
      {swapped ? <Can x={hb[0] - 10} y={hb[1]} s={1.2} /> : <Batteries x={hb[0] - 10} y={hb[1]} s={1.2} />}
    </CamG></Svg>
  );
};
// 4. дом с огородами на балконах, камера поднимается к крыше
const Balconies: Shot = ({ g }) => {
  const grow = (i: number) => ip(g, [i * 6, i * 6 + 60], [0, 1]);
  const water = g % 40;
  const wp = stand(g, { turn: 0.5, handR: [150, -330 + (water < 20 ? 0 : 20)], handL: [100, -260], expr: { mouth: "flat", look: [1, 1] }, seed: 40 });
  const wx = 900, wy = 530, ws = 0.6, wh = handW(wx, wy, ws, wp, "R");
  return (
    <Svg><CamG cam={{ s: 1.0, cx: 960, cy: lerp(620, 320, ip(g, [70, 130], [0, 1])) }}>
      <rect x={-W} y={-800} width={W * 3} height={2400} fill="#efd9ae" />
      <rect x={360} y={-160} width={1200} height={1400} fill="#c89a72" stroke={OL} strokeWidth={6} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => { const bx = 420 + c * 380, by = 230 + r * 300, i = r * 3 + c; return <g key={`${r}${c}`}>
        <rect x={bx + 40} y={by - 200} width={200} height={190} fill="#7a5a44" stroke={OL} strokeWidth={5} />
        <rect x={bx + 60} y={by - 180} width={70} height={170} fill="#bfe0f0" stroke={OL} strokeWidth={4} />
        {i === 4 ? <Person x={wx} y={wy} s={ws} look={PEOPLE.woman} pose={wp} uid="wb" /> : null}
        {[0, 1, 2].map((k) => <Bucket key={k} x={bx + 50 + k * 90} y={by} grow={grow(i + k)} s={0.6} tomato={(i + k) % 2 === 0} />)}
        <rect x={bx} y={by} width={300} height={20} fill="#a8aeb6" stroke={OL} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, k) => <rect key={k} x={bx + 10 + k * 34} y={by - 60} width={6} height={60} fill="#5a5a60" />)}
        <rect x={bx} y={by - 66} width={300} height={10} fill="#5a5a60" stroke={OL} strokeWidth={3} />
      </g>; }))}
      {i5(g, wh)}
      {[0, 1, 2, 3, 4, 5].map((k) => <Bucket key={"r" + k} x={480 + k * 190} y={-160} grow={ip(g, [70 + k * 5, 120 + k * 5], [0.3, 1])} s={0.9} tomato={k % 2 === 1} />)}
      <rect x={340} y={-170} width={1240} height={22} fill="#9a7a5a" stroke={OL} strokeWidth={5} />
    </CamG></Svg>
  );
};
const i5 = (g: number, h: P) => {
  // лейка в руке женщины, вода льётся в ведро
  const pour = g % 40 < 20;
  return (
    <g>
      <g transform={`translate(${h[0]} ${h[1]}) rotate(${pour ? 28 : 6})`}><rect x={-22} y={-10} width={44} height={36} rx={5} fill="#3a8a6a" stroke={OL} strokeWidth={3} /><path d="M 22 0 L 52 -16" stroke={OL} strokeWidth={6} /></g>
      {pour ? [0, 1, 2].map((k) => <circle key={k} cx={h[0] + 46 + k * 3} cy={h[1] + 4 + ((g * 6 + k * 14) % 44)} r={3} fill="#6ab0e0" />) : null}
    </g>
  );
};
// 5. парк: беговую дорожку перекопали под грядки
const Park: Shot = ({ g }) => {
  const dig = (f: number, seed: number): [Pose, number] => {
    const c = (f + seed * 15) % 36, k = c < 18 ? c / 18 : 1 - (c - 18) / 18; // 0 — лопата в земле, 1 — поднята
    return [stand(f, { turn: 0.6, lean: 10 - k * 10, handL: [20 + k * 10, lerp(-170, -300, k)], handR: [90 + k * 10, lerp(-110, -230, k)], hipY: -228 + (1 - k) * 18, expr: { mouth: "flat", look: [1, 1] }, seed }), k];
  };
  const people: [number, number, number, Look][] = [[620, 820, 0.7, PEOPLE.man], [1180, 900, 0.8, PEOPLE.barista]];
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.08, g / 60), cx: 960, cy: 560 }}>
      <Ground y={560} c="#9aa86a" sky="#efd9ae" />
      {[150, 480, 1500, 1800].map((x, i) => <g key={x}><rect x={x - 14} y={380 - i * 10} width={28} height={180} fill="#7a5a3a" stroke={OL} strokeWidth={4} /><circle cx={x} cy={340 - i * 10} r={110} fill="#6a8a4a" stroke={OL} strokeWidth={5} /></g>)}
      <g transform="translate(1560 700)"><rect x={-6} y={-150} width={12} height={150} fill="#5a5a60" /><rect x={-110} y={-210} width={220} height={70} rx={6} fill="#3a7a5a" stroke={OL} strokeWidth={4} />{txt(0, -164, 26, "#f6efe2", "JOGGING PATH")}</g>
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-200} ${640 + i * 80} Q 960 ${600 + i * 84} 2100 ${640 + i * 80}`} stroke="#6a4a2e" strokeWidth={26} fill="none" opacity={0.85} />)}
      {Array.from({ length: 30 }, (_, i) => <ellipse key={"s" + i} cx={(i * 211) % 1900 + 20} cy={660 + ((i * 7) % 5) * 80} rx={14} ry={8} fill="#5a9a3a" stroke={OL} strokeWidth={2} />)}
      {people.map(([x, y, s, lk], i) => { const [p] = dig(g, i + 3); const a = handW(x, y, s, p, "L"), b = handW(x, y, s, p, "R"); return <g key={i}><Person x={x} y={y} s={s} look={lk} pose={p} uid={"d" + i} /><Shovel a={a} b={b} /></g>; })}
    </CamG></Svg>
  );
};
// 5b. помидоры в вёдрах, картошка в старых шинах (панорама)
const Pots: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: 1.15, cx: lerp(700, 1250, g / 117), cy: 600 }}>
    <Ground y={760} c="#a89070" sky="#e8cfa0" />
    <rect x={-W} y={300} width={W * 3} height={460} fill="#c89a72" stroke={OL} strokeWidth={5} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-300 + i * 220} y={330 + (i % 2) * 20} width={180} height={4} fill="#a87a52" />)}
    {[0, 1, 2, 3].map((i) => <Bucket key={i} x={200 + i * 190} y={820} grow={ip(g, [i * 8, 50 + i * 8], [0.4, 1])} s={1.3} />)}
    {[0, 1, 2].map((i) => <Tire key={i} x={1100 + i * 260} y={860} grow={ip(g, [40 + i * 8, 90 + i * 8], [0.3, 1])} />)}
  </CamG></Svg>
);
// 6. герой сажает семечко в горшок и поливает
const Plant: Shot = ({ g }) => {
  const s = 1.0, x = 820, y = 1060, potX = 1040, potY = 760;
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const seedK = ip(g, [10, 30], [0, 1]);
  const handR: P = g < 40 ? trackP(g, [[0, [60, -180]], [10, loc([potX - 20, potY - 140])], [30, loc([potX, potY - 70])], [40, [60, -190]]]) : g < 56 ? [60, -190] : trackP(g, [[56, [60, -190]], [66, loc([potX - 60, potY - 150])], [84, loc([potX - 60, potY - 150])], [90, [60, -190]]]);
  const hero = stand(g, { turn: 0.6, lean: 4, handR, expr: { mouth: "flat", look: [1, 1] }, seed: 50 });
  const h = handW(x, y, s, hero, "R"), pour = g >= 66 && g < 84;
  return (
    <Svg><CamG cam={{ s: 1.35, cx: 960, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#efd9ae" />
      <rect x={200} y={120} width={1500} height={700} fill="#c89a72" stroke={OL} strokeWidth={5} />
      <rect x={300} y={220} width={330} height={600} fill="#7a5a44" stroke={OL} strokeWidth={5} />
      <Person x={x} y={y} s={s} look={HERO} pose={hero} uid="h" />
      <rect x={600} y={potY} width={800} height={30} fill="#a8aeb6" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 14 }, (_, k) => <rect key={k} x={610 + k * 56} y={potY + 30} width={8} height={240} fill="#5a5a60" />)}
      <path d={`M ${potX - 60} ${potY - 110} L ${potX + 60} ${potY - 110} L ${potX + 44} ${potY} L ${potX - 44} ${potY} Z`} fill="#c8603a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <rect x={potX - 66} y={potY - 122} width={132} height={18} rx={4} fill="#d8703a" stroke={OL} strokeWidth={4} />
      <ellipse cx={potX} cy={potY - 112} rx={56} ry={8} fill="#5a3e2a" />
      {g < 30 ? <ellipse cx={h[0] + 6} cy={h[1] + 18} rx={7} ry={5} fill="#e8d8a0" stroke={OL} strokeWidth={2} /> : null}
      {seedK >= 1 && g < 48 ? <ellipse cx={potX} cy={potY - 114} rx={6} ry={4} fill="#e8d8a0" /> : null}
      {g >= 56 && g < 92 ? <g transform={`translate(${h[0]} ${h[1]}) rotate(${pour ? 34 : 4})`}><rect x={-30} y={-10} width={60} height={46} rx={6} fill="#3a8a6a" stroke={OL} strokeWidth={4} /><path d="M 30 4 L 70 -18" stroke={OL} strokeWidth={8} /></g> : null}
      {pour ? [0, 1, 2, 3].map((k) => <circle key={k} cx={h[0] + 66 + k * 2} cy={h[1] + 10 + ((g * 7 + k * 12) % 60)} r={4} fill="#6ab0e0" />) : null}
    </CamG></Svg>
  );
};
// 6b. крупно горшок: росток — крошечный; герой голоден
const Sprout: Shot = ({ g }) => {
  const hero = stand(g, { turn: 0.3, tilt: 6, handL: [-10, -230], handR: [20, -220], expr: { mouth: "wavy", browA: -0.7, browH: 0.5, eyes: g > 40 ? "half" : "dot", look: [0.6, 1] }, seed: 51 });
  const k = ip(g, [10, 60], [0, 1]);
  return (
    <Svg><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#c89a72" />
      <g opacity={0.9}><Person x={1300} y={1380} s={1.6} look={HERO} pose={hero} uid="h2" /></g>
      <rect x={0} y={820} width={W} height={60} fill="#a8aeb6" stroke={OL} strokeWidth={6} />
      <g transform="translate(700 820) scale(2.2)">
        <path d="M -60 -110 L 60 -110 L 44 0 L -44 0 Z" fill="#c8603a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-66} y={-122} width={132} height={18} rx={4} fill="#d8703a" stroke={OL} strokeWidth={3} />
        <ellipse cx={0} cy={-112} rx={56} ry={8} fill="#5a3e2a" />
        <g transform={`translate(0 -112) scale(${k})`}><path d="M 0 0 L 0 -18" stroke="#4a7a3a" strokeWidth={3} /><ellipse cx={-6} cy={-18} rx={6} ry={3} fill="#6a9a4a" /><ellipse cx={6} cy={-18} rx={6} ry={3} fill="#6a9a4a" /></g>
      </g>
    </CamG></Svg>
  );
};
// 7. машины уезжают из города (медленная пробка)
const Exodus: Shot = ({ g }) => {
  const cars: [string, number][] = [["#c8603a", 1], ["#3a7a9a", 2], ["#e0b040", 0], ["#7a9a4a", 1], ["#9a5a8a", 2], ["#d8d0c0", 1], ["#c84a3a", 0], ["#4a6a8a", 2]];
  return (
    <Svg><CamG cam={{ s: 1.0, cx: lerp(900, 1100, g / 144), cy: 540 }}>
      <Highway />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-500 + i * 110} y={360 - (i % 3) * 60} width={90} height={330 + (i % 3) * 60} fill="#b8a888" stroke={OL} strokeWidth={4} />)}
      {cars.map(([c, r], i) => { const x = -400 + i * 380 + g * 1.6 + Math.sin(g / 10 + i) * 4; return <Car key={i} x={x} y={900} c={c} roof={r} />; })}
    </CamG></Svg>
  );
};
// 7b. герой идёт по обочине, мимо медленно едут машины, указатель FARMS / VILLAGES
const Roadside: Shot = ({ g }) => {
  const sp = 3.0, hs = 0.27, hx = 700 + g * sp; // герой на дальней обочине: в реальном масштабе рядом с машинами
  return (
    <Svg><CamG cam={{ s: 1.6, cx: hx + 260, cy: 700 }}>
      <Highway />
      {[0, 1, 2, 3, 4].map((i) => <Car key={i} x={-100 + i * 420 + g * 3.4} y={900} c={["#7a9a4a", "#c8603a", "#3a7a9a", "#e0b040", "#9a5a8a"][i]} roof={i % 3} />)}
      <g transform="translate(1160 720) scale(0.62)"><rect x={-8} y={-300} width={16} height={300} fill="#5a5a60" stroke={OL} strokeWidth={3} />
        <path d="M -150 -290 L 130 -290 L 170 -255 L 130 -220 L -150 -220 Z" fill="#3a7a4a" stroke={OL} strokeWidth={4} />{txt(-10, -242, 32, "#f6efe2", "FARMS")}
        <path d="M -150 -200 L 130 -200 L 170 -165 L 130 -130 L -150 -130 Z" fill="#3a7a4a" stroke={OL} strokeWidth={4} />{txt(-10, -152, 32, "#f6efe2", "VILLAGES")}</g>
      <Person x={hx} y={722} s={hs} look={HERO} pose={walking(g, (g * sp) / hs, 1, { expr: { mouth: "flat" }, seed: 60 })} uid="h" />
    </CamG></Svg>
  );
};
// 8. ферма: еда есть, топлива нет — фермер трясёт пустую канистру
const Farm: Shot = ({ g }) => {
  const s = 0.85, fx = 1180, fy = 920;
  const shake = g >= 50 && g < 100 ? Math.sin(g * 1.4) * 12 : 0;
  const lift = ip(g, [40, 54], [0, 1]), down = ip(g, [104, 118], [0, 1]);
  const crate: P = [1340, 800];
  const handR: P = trackP(g, [[0, [60, -180]], [40, [((crate[0] - fx) / s), ((crate[1] - 20 - fy) / s)]], [54, [150, -310]], [104, [150 + shake * 0 , -310]], [118, [((crate[0] - fx) / s), ((crate[1] - 20 - fy) / s)]], [130, [60, -180]]]);
  const farmer = stand(g, { turn: 0.4, handR: [handR[0] + shake * (g < 100 ? 1 : 0), handR[1]], handL: g > 140 ? [-120, -300] : undefined, expr: { mouth: g > 60 ? "wavy" : "flat", browA: -0.6, browH: 0.4, look: g > 140 ? [-1, 0] : [1, 0] }, seed: 70 });
  const h = handW(fx, fy, s, farmer, "R");
  const held = lift > 0 && down < 1 && g >= 40;
  return (
    <Svg><CamG cam={{ s: lerp(1.05, 1.15, g / 207), cx: 1000, cy: 580 }}>
      <Ground y={560} c="#c8b06a" sky="#efd9ae" />
      <path d={`M -400 560 Q 400 500 1000 540 Q 1600 580 2400 520 L 2400 560 L -400 560 Z`} fill="#9aa06a" />
      <g transform="translate(260 560)"><rect x={-180} y={-260} width={360} height={260} fill="#a8443a" stroke={OL} strokeWidth={6} /><path d="M -210 -250 L 0 -400 L 210 -250 Z" fill="#7a3a30" stroke={OL} strokeWidth={6} strokeLinejoin="round" /><rect x={-60} y={-150} width={120} height={150} fill="#5a2a22" stroke={OL} strokeWidth={4} /></g>
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -300 ${620 + i * 70} L 2300 ${600 + i * 76}`} stroke="#9a8a4a" strokeWidth={14} opacity={0.7} />)}
      {Array.from({ length: 16 }, (_, i) => <path key={"w" + i} d={`M ${520 + i * 46} 640 l -10 -60 M ${520 + i * 46} 640 l 10 -54`} stroke="#d8a840" strokeWidth={6} />)}
      <g transform="translate(560 860) scale(1.55)"><Tractor x={0} y={0} /></g>
      <rect x={crate[0] - 70} y={crate[1]} width={140} height={120} fill="#b08050" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${crate[0] + 120} ${fy})`}><path d="M -60 0 L -70 -70 Q -40 -84 0 -80 Q 40 -84 60 -70 L 60 0 Z" fill="#e8dcc0" stroke={OL} strokeWidth={4} />{txt(0, -30, 20, "#8a3a2a", "EMPTY", 900)}</g>
      <Person x={fx} y={fy} s={s} look={FARMER} pose={farmer} uid="f" />
      {held ? <Jerrycan x={h[0]} y={h[1] - 6} rot={shake * 0.6} /> : <Jerrycan x={crate[0]} y={crate[1] - 86 - 14} />}
    </CamG></Svg>
  );
};
// 9. доска со связями: грузовики, корабли, топливо, удобрения, заводы, компьютеры — всё связано
const Web: Shot = ({ g }) => {
  const nodes: [number, number, string, string][] = [[520, 300, "TRUCKS", "#c8603a"], [960, 230, "SHIPS", "#3a7a9a"], [1400, 300, "FUEL", "#c8402e"], [1480, 600, "FERTILIZER", "#7a9a4a"], [1180, 820, "FACTORIES", "#8a6a4a"], [740, 820, "COMPUTERS", "#5a5a6a"], [440, 600, "FARMS", "#d8a840"], [960, 540, "YOUR FOOD", "#e0793a"]];
  const edges: [number, number][] = [[0, 7], [1, 7], [2, 7], [3, 6], [6, 7], [4, 7], [5, 7], [2, 6], [2, 0], [1, 0], [5, 0], [4, 3], [5, 1]];
  const hero = stand(g, { turn: -0.5, handL: [-40, -200], expr: { mouth: "o", open: 0.4, eyes: g > 110 ? "wide" : "dot", browH: 0.5, look: [-1, -0.6] }, seed: 80 });
  return (
    <Svg bg="#5a3e2a"><CamG cam={{ s: lerp(1.0, 1.12, ip(g, [0, 170], [0, 1])), cx: 960, cy: 560 }}>
      <rect width={W} height={H} fill="#c89a72" />
      <rect x={300} y={140} width={1320} height={820} rx={10} fill="#b88a58" stroke={OL} strokeWidth={8} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={320 + ((i * 337) % 1280)} cy={160 + ((i * 211) % 780)} r={4} fill="#a07a48" />)}
      {edges.map(([a, b], i) => { const on = ip(g, [i * 10, i * 10 + 12], [0, 1]), all = ip(g, [130, 140], [0, 1]); const A = nodes[a], B = nodes[b];
        return <path key={i} d={`M ${A[0]} ${A[1]} Q ${(A[0] + B[0]) / 2} ${(A[1] + B[1]) / 2 + 40} ${lerp(A[0], B[0], on)} ${lerp(A[1], B[1], on)}`} stroke={all > 0 ? "#e8402e" : "#c8302a"} strokeWidth={6 + all * 3} fill="none" />; })}
      {nodes.map(([x, y, t, c], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 3 - 1) * 3})`}>
        <rect x={-120} y={-56} width={240} height={112} fill="#f6efe2" stroke={OL} strokeWidth={4} /><rect x={-110} y={-46} width={220} height={60} fill={c} />
        {txt(0, 44, i === 7 ? 30 : 26, "#3a2a1e", t)}<circle cx={0} cy={-62} r={12} fill="#c8302a" stroke={OL} strokeWidth={3} /></g>)}
      <Person x={1690} y={1420} s={1.4} look={HERO} pose={hero} uid="h" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Money, 0, T(3.1)], [Barter, T(3.1), T(7.4)], [Hands, T(7.4), T(9.9)], [Lot, T(9.9), T(14.1)], [Swap, T(14.1), T(19.5)],
  [Balconies, T(19.5), T(24.4)], [Park, T(24.4), T(26.4)], [Pots, T(26.4), T(30.3)], [Plant, T(30.3), T(33.4)], [Sprout, T(33.4), T(35.7)],
  [Exodus, T(35.7), T(40.5)], [Roadside, T(40.5), T(43.9)], [Farm, T(43.9), T(50.8)], [Web, T(50.8), PART5_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part5: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="1 MONTH LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part5.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx5.wav")} volume={0.3} />
    <FadeOut total={PART5_FRAMES} />
  </AbsoluteFill>
);
export const _u5 = [H, Easing];
export const CUTS5 = CUTS.map(([, a, b]) => [a, b]);
