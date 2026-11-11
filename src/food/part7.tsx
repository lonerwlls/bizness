// Часть 7 (≈59 с): «Спустя 9 месяцев». Зима: замёрзшие огороды, счёт картошки, одна печка на шестерых, бабушкины заготовки, радио, первый корабль, план весеннего огорода.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, trackP, walking } from "./common";
import { handW } from "./part5";
import { Courtyard, KID } from "./part6";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART7_FRAMES = 1770;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string; dark?: number }> = ({ children, bg = "#e9d2a6", dark = 0 }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}{dark ? <rect width={W} height={H} fill="#1a1420" opacity={dark} /> : null}<Vignette /><Clock label="DAY 274" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
const COAT: Partial<Look> = {}; // у каждого своя одежда; герой всегда в оранжевой куртке
const W1: Look = { ...PEOPLE.woman, top: "#8a4a5a", topDark: "#6a3646" };

/** падающий снег поверх кадра */
const Snow: React.FC<{ g: number; n?: number; k?: number }> = ({ g, n = 70, k = 1 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = ((i * 271 + Math.sin(g / 20 + i) * 30) % 2100) - 90, y = ((i * 137 + g * (1.6 + (i % 4) * 0.5) * k) % 1180) - 50; return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#fbfbf6" opacity={0.85} />; })}</g>
);
const Stove: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-60} rx={320} ry={200} fill="#ffb060" opacity={0.12 + Math.sin(g / 5) * 0.03} />
    <rect x={-22} y={-700} width={44} height={480} fill="#3a3434" stroke={OL} strokeWidth={5} />
    <rect x={-90} y={-230} width={180} height={190} rx={10} fill="#3a3434" stroke={OL} strokeWidth={6} />
    <rect x={-50} y={-160} width={100} height={70} rx={6} fill={g % 6 < 3 ? "#f0a030" : "#e88a2a"} stroke={OL} strokeWidth={4} />
    {[-70, 70].map((d) => <rect key={d} x={d - 8} y={-40} width={16} height={40} fill="#3a3434" stroke={OL} strokeWidth={3} />)}
    <path d="M -56 -300 L 56 -300 L 48 -232 L -48 -232 Z" fill="#6a6a70" stroke={OL} strokeWidth={5} />
    {[-1, 1].map((k) => <path key={k} d={`M ${k * 20} -310 q ${k * 14 + Math.sin(g / 6) * 8} -40 0 -80`} stroke="#f6efe2" strokeWidth={8} fill="none" opacity={0.4} transform={`translate(0 ${-((g * 2) % 40)})`} />)}
  </g>
);
const Jar: React.FC<{ x: number; y: number; fill: number; c?: string }> = ({ x, y, fill, c = "#c8d88a" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-40} y={-120 * fill} width={80} height={120 * fill} fill={c} />
    {fill > 0.2 ? Array.from({ length: Math.floor(fill * 5) }, (_, i) => <path key={i} d={`M -34 ${-10 - i * 22} q 34 -10 68 0`} stroke="#9ab060" strokeWidth={4} fill="none" />) : null}
    <rect x={-44} y={-130} width={88} height={130} rx={10} fill="#d8eef4" opacity={0.35} stroke={OL} strokeWidth={5} />
    <rect x={-36} y={-146} width={72} height={18} rx={4} fill="#c8a040" stroke={OL} strokeWidth={4} />
  </g>
);

// 1. зима: герой идёт по снегу, за ним следы
const Winter: Shot = ({ g }) => {
  const s = 0.75, y = 860, x = 300 + g * 2.6;
  const pose = walking(g, (g * 2.6) / s, 1, { expr: { mouth: "flat", browA: -0.4 }, seed: 1 });
  const prints = Array.from({ length: Math.floor((x - 300) / 50) }, (_, i) => 300 + i * 50);
  return (
    <Svg bg="#c8ccd2"><CamG cam={{ s: 1.05, cx: lerp(820, 1000, g / 141), cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#cfd4dc" />
      {[-400, 300, 1000, 1700].map((bx, i) => <g key={bx}><rect x={bx} y={140} width={620} height={560} fill={["#b88a6a", "#a8907a", "#b8987a", "#a88a6a"][i]} stroke={OL} strokeWidth={6} /><rect x={bx - 10} y={124} width={640} height={30} rx={14} fill="#f6f6f2" stroke={OL} strokeWidth={4} />
        {Array.from({ length: 2 }, (_, r) => Array.from({ length: 4 }, (_, c) => <rect key={`${r}${c}`} x={bx + 50 + c * 140} y={210 + r * 200} width={90} height={120} fill={(r + c + i) % 3 === 0 ? "#f6d080" : "#3a3a48"} stroke={OL} strokeWidth={4} />))}</g>)}
      <rect x={-W} y={700} width={W * 3} height={H} fill="#f2f2ee" stroke={OL} strokeWidth={5} />
      {prints.map((px, i) => <ellipse key={i} cx={px} cy={y + 4 + (i % 2) * 12} rx={14} ry={5} fill="#c8ccd6" />)}
      <Person x={x} y={y} s={s} look={{ ...HERO }} pose={pose} uid="h" />
      <Snow g={g} />
    </CamG></Svg>
  );
};
// 2. огород на балконе замёрз: вёдра в снегу, сосульки
const Frozen: Shot = ({ g }) => (
  <Svg bg="#c8ccd2"><CamG cam={{ s: lerp(1.25, 1.35, g / 108), cx: 960, cy: 560 }}>
    <rect x={-W} width={W * 3} height={H} fill="#b8a898" />
    <rect x={300} y={160} width={500} height={520} fill="#7a5a44" stroke={OL} strokeWidth={5} /><rect x={340} y={200} width={180} height={480} fill="#a8c0cc" stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((k) => <g key={k} transform={`translate(${620 + k * 190} 700) scale(1.1)`}>
      <path d="M 0 -60 L 0 -150 M 0 -110 L -30 -86 M 0 -90 L 26 -66 M 0 -130 L 20 -140" stroke="#6a5a3a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={-14} cy={-118} rx={12} ry={5} fill="#f6f6f2" /><ellipse cx={0} cy={-152} rx={10} ry={5} fill="#f6f6f2" />
      <path d="M -36 -54 L 36 -54 L 28 0 L -28 0 Z" fill="#c8ccd2" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -40 -56 Q -30 -76 0 -72 Q 30 -78 40 -56 Z" fill="#f6f6f2" stroke={OL} strokeWidth={3} />
    </g>)}
    <rect x={200} y={700} width={1500} height={26} fill="#a8aeb6" stroke={OL} strokeWidth={5} />
    <rect x={200} y={690} width={1500} height={14} rx={7} fill="#f6f6f2" />
    {Array.from({ length: 22 }, (_, k) => <rect key={k} x={210 + k * 68} y={726} width={10} height={300} fill="#5a5a60" />)}
    {Array.from({ length: 12 }, (_, k) => <path key={"i" + k} d={`M ${240 + k * 120} 726 l 10 ${40 + (k % 3) * 30} l 10 ${-40 - (k % 3) * 30} Z`} fill="#e8f4fa" stroke={OL} strokeWidth={3} />)}
    <Snow g={g} n={50} k={0.8} />
  </CamG></Svg>
);
// 3. подвал: картошки считаны, герой мелом зачёркивает ещё одну неделю
const Cellar: Shot = ({ g }) => {
  const s = 0.85, x = 1000, y = 960;
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const markX = 1240, markY = 420;
  const draw = ip(g, [80, 100], [0, 1]);
  const handR: P = g < 70 ? [70, -200] : trackP(g, [[70, [70, -200]], [80, loc([markX - 50, markY - 30])], [100, loc([markX + 50, markY + 30])], [116, [70, -200]]]);
  const hero = stand(g, { turn: 0.5, handR, handL: [-40, -240], expr: { mouth: "flat", browA: -0.5, look: g < 70 ? [0.2, 1] : [1, -0.3] }, seed: 10 });
  const h = handW(x, y, s, hero, "R");
  return (
    <Svg bg="#3a2a22"><CamG cam={{ s: 1.2, cx: 980, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#8a7a6a" />
      {Array.from({ length: 12 }, (_, r) => Array.from({ length: 14 }, (_, c) => <rect key={`${r}${c}`} x={-200 + c * 170 + (r % 2) * 85} y={r * 70} width={160} height={62} fill="none" stroke="#6a5a4a" strokeWidth={3} />))}
      <rect x={-W} y={800} width={W * 3} height={H} fill="#5a4a3a" stroke={OL} strokeWidth={5} />
      <path d="M 960 0 L 960 120" stroke={OL} strokeWidth={3} /><circle cx={960} cy={140} r={24} fill="#ffe08a" stroke={OL} strokeWidth={3} /><ellipse cx={960} cy={400} rx={700} ry={400} fill="#ffe08a" opacity={0.08} />
      <g>{Array.from({ length: 7 }, (_, i) => <g key={i} stroke="#f6efe2" strokeWidth={6}>{[0, 1, 2, 3].map((k) => <path key={k} d={`M ${1100 + i * 0 + k * 22} ${300 + i * 0} l 0 50`} transform={`translate(${(i % 4) * 130} ${Math.floor(i / 4) * 80 - 30})`} />)}<path d="M -6 40 L 80 6" transform={`translate(${1100 + (i % 4) * 130} ${300 + Math.floor(i / 4) * 80 - 30})`} /></g>)}</g>
      <path d={`M ${markX - 50} ${markY - 30} L ${lerp(markX - 50, markX + 50, draw)} ${lerp(markY - 30, markY + 30, draw)}`} stroke="#f6efe2" strokeWidth={7} strokeLinecap="round" />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${380 + i * 200} 800)`}><path d="M -80 0 L -90 -170 Q -60 -200 0 -196 Q 60 -200 90 -170 L 80 0 Z" fill={i === 2 ? "#c8b48a" : "#b8a070"} stroke={OL} strokeWidth={5} transform={i === 2 ? "scale(1 0.4)" : undefined} /></g>)}
      <rect x={300} y={560} width={500} height={20} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={340 + i * 50} cy={548} rx={24} ry={16} fill="#c8a060" stroke={OL} strokeWidth={3} />)}
      <Person x={x} y={y} s={s} look={{ ...HERO, ...COAT }} pose={hero} uid="h" />
      <rect x={h[0] - 6} y={h[1] - 14} width={12} height={22} fill="#f6efe2" stroke={OL} strokeWidth={2} />
    </CamG></Svg>
  );
};
// 4. семьи переезжают в одну квартиру: люди заносят матрас и одеяла
const MoveIn: Shot = ({ g }) => {
  const s = 0.8, y = 940;
  const ax = lerp(1750, 1200, ip(g, [0, 80], [0, 1], (t) => t)), bx = ax + 330;
  const carryA = walking(g, (1750 - ax) / s, -1, { handL: [-60, -300], handR: [40, -300], seed: 20, expr: { mouth: "flat" } });
  const carryB = walking(g + 10, (1750 - ax) / s, -1, { handL: [-40, -300], handR: [60, -300], seed: 21, expr: { mouth: "flat" } });
  const hA = handW(ax, y, s, carryA, "L"), hB = handW(bx, y, s, carryB, "R");
  return (
    <Svg><CamG cam={{ s: 1.1, cx: 980, cy: 580 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8c09a" />
      <rect x={-W} y={780} width={W * 3} height={H} fill="#a87a50" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-400 + i * 100} 780 L ${-500 + i * 110} 1080`} stroke="#8a6040" strokeWidth={3} />)}
      <rect x={1560} y={320} width={260} height={460} fill="#6a4a30" stroke={OL} strokeWidth={6} /><rect x={1580} y={340} width={220} height={440} fill="#2a1e18" />
      {[[300, "#8a6a9a"], [520, "#5a8aa0"]].map(([x, c], i) => <g key={i}><rect x={(x as number) - 140} y={700} width={280} height={90} rx={16} fill={c as string} stroke={OL} strokeWidth={5} /><rect x={(x as number) - 120} y={680} width={90} height={40} rx={12} fill="#f2ead6" stroke={OL} strokeWidth={4} /></g>)}
      <Person x={420} y={760} s={0.45} look={KID} pose={sitting(g, { expr: { mouth: "flat", look: [1, 0] }, seed: 22 })} uid="k" />
      <Person x={800} y={900} s={0.75} look={{ ...PEOPLE.oldman, ...COAT }} pose={stand(g, { turn: 0.5, handL: [-30, -260], handR: [30, -260], expr: { mouth: "flat", look: [1, 0] }, seed: 23 })} uid="o" />
      <Person x={bx} y={y} s={s} look={{ ...PEOPLE.man, ...COAT }} pose={carryB} uid="b" />
      <rect x={hA[0] - 20} y={Math.min(hA[1], hB[1]) - 70} width={hB[0] - hA[0] + 40} height={70} rx={16} fill="#c8b48a" stroke={OL} strokeWidth={5} />
      <Person x={ax} y={y} s={s} look={W1} pose={carryA} uid="a" />
    </CamG></Svg>
  );
};
// 5. шестеро вокруг маленькой печки: греют руки, на печке кастрюля
const AroundStove: Shot = ({ g }) => {
  const sx = 960, sy = 900;
  const ppl: [number, number, number, Look, number][] = [[380, 880, 0.75, PEOPLE.oldman, 1], [600, 980, 0.85, HERO, 1], [1260, 980, 0.85, W1, -1], [1500, 880, 0.75, PEOPLE.man, -1], [830, 860, 0.5, KID, 1], [1100, 850, 0.7, PEOPLE.girl, -1]];
  const order = [0, 3, 4, 5, 1, 2];
  return (
    <Svg bg="#2a1e18"><CamG cam={{ s: lerp(1.05, 1.15, g / 141), cx: 960, cy: 580 }}>
      <rect x={-W} width={W * 3} height={H} fill="#7a5a44" />
      <rect x={-W} y={760} width={W * 3} height={H} fill="#5a4030" stroke={OL} strokeWidth={5} />
      <rect x={180} y={180} width={300} height={360} fill="#3a4a5a" stroke={OL} strokeWidth={6} /><path d="M 330 180 L 330 540 M 180 360 L 480 360" stroke={OL} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={200 + ((i * 53 + g) % 270)} cy={200 + ((i * 97 + g * 1.4) % 330)} r={4} fill="#fbfbf6" />)}
      <Stove x={sx} y={sy} g={g} />
      {order.map((i) => { const [x, y, s, lk, dir] = ppl[i]; const tx = sx - dir * 170; /* ладони в 80 px от печки, не касаются её */ const reach: P = [Math.max(-150, Math.min(150, (tx - x) / s)), -260 + Math.sin(g / 9 + i) * 6]; return <Person key={i} x={x} y={y} s={s} look={lk === HERO ? { ...HERO, ...COAT } : { ...lk, ...COAT }} pose={stand(g + i * 7, { turn: dir * 0.6, handL: [reach[0] - 20 * dir, reach[1] + 10], handR: [reach[0] + 20 * dir, reach[1]], expr: { mouth: i === 5 ? "open" : "flat", open: talk(g, i) * 0.3, look: [dir, 0.4] }, seed: 30 + i })} uid={"p" + i} />; })}
      <rect width={W} height={H} fill="#ff9a40" opacity={0.06 + Math.sin(g / 5) * 0.02} />
    </CamG></Svg>
  );
};
// 6. сушёные яблоки на нитке: герой нанизывает дольки у окна
const Apples: Shot = ({ g }) => {
  const s = 1.0, x = 760, y = 1080;
  const n = Math.min(9, 4 + Math.floor(g / 22));
  const cyc = g % 22, push = ip(cyc, [4, 16], [0, 1]);
  const spot: P = [1000 + (n) * 0, 520];
  const handR: P = [lerp(180, (spot[0] - 30 - x) / s, push), lerp(-330, (spot[1] - y) / s, push)];
  const hero = stand(g, { turn: 0.6, handR, handL: [((spot[0] + 60) - x) / s, ((spot[1] - 20) - y) / s], expr: { mouth: "flat", look: [1, 0] }, seed: 40 });
  const h = handW(x, y, s, hero, "R");
  return (
    <Svg><CamG cam={{ s: 1.4, cx: 1000, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#c8a07a" />
      <rect x={1000} y={160} width={560} height={640} fill="#e8eef2" stroke={OL} strokeWidth={6} /><path d="M 1280 160 L 1280 800 M 1000 480 L 1560 480" stroke={OL} strokeWidth={6} />
      <Snow g={g} n={30} k={0.6} />
      <rect x={980} y={800} width={600} height={30} fill="#f2ead6" stroke={OL} strokeWidth={5} />
      <path d="M 1000 300 Q 1280 380 1560 300" stroke="#8a6a4a" strokeWidth={4} fill="none" />
      {Array.from({ length: n }, (_, i) => { const t = (i + 1) / 10, px = 1000 + t * 560, py = 300 + Math.sin(t * Math.PI) * 80; return <g key={i}><circle cx={px} cy={py + 18} r={22} fill="#f0d8a0" stroke={OL} strokeWidth={4} /><circle cx={px} cy={py + 18} r={7} fill="#c8a070" /></g>; })}
      <Person x={x} y={y} s={s} look={{ ...HERO, ...COAT }} pose={hero} uid="h" />
      {push < 1 ? <g><circle cx={h[0] + 12} cy={h[1] - 6} r={22} fill="#f0d8a0" stroke={OL} strokeWidth={4} /><circle cx={h[0] + 12} cy={h[1] - 6} r={7} fill="#c8a070" /></g> : null}
    </CamG></Svg>
  );
};
// 7. женщина солит капусту в банке
const Cabbage: Shot = ({ g }) => {
  const s = 1.0, x = 760, y = 1080, jx = 1040, jy = 820;
  const press = Math.abs(Math.sin(g * 0.2));
  const hero = stand(g, { turn: 0.6, lean: 6, handR: [(jx - 10 - x) / s, (jy - 150 + press * 40 - y) / s], handL: [(jx + 40 - x) / s, (jy - 60 - y) / s], expr: { mouth: "flat", look: [1, 1] }, seed: 50 });
  return (
    <Svg><CamG cam={{ s: 1.35, cx: 980, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#c8a07a" />
      <rect x={300} y={300} width={500} height={16} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <Jar key={i} x={360 + i * 120} y={300} fill={1} c={i % 2 ? "#c8d88a" : "#d8a8a0"} />)}
      <Person x={x} y={y} s={s} look={{ ...W1, ...COAT }} pose={hero} uid="w" />
      <rect x={600} y={jy} width={900} height={30} fill="#b08050" stroke={OL} strokeWidth={5} /><rect x={600} y={jy + 30} width={900} height={300} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      <Jar x={jx} y={jy} fill={lerp(0.5, 0.9, ip(g, [0, 51], [0, 1]))} />
      <g transform={`translate(1260 ${jy})`}><circle cx={0} cy={-70} r={70} fill="#c8d88a" stroke={OL} strokeWidth={5} /><path d="M -50 -70 Q 0 -110 50 -70 M -40 -40 Q 0 -70 40 -40" stroke="#9ab060" strokeWidth={4} fill="none" /></g>
      <g transform={`translate(1400 ${jy})`}><rect x={-30} y={-70} width={60} height={70} rx={6} fill="#f2f2ee" stroke={OL} strokeWidth={4} />{txt(0, -26, 20, "#3a3a40", "SALT")}</g>
    </CamG></Svg>
  );
};
// 8. семена в бумажном конверте, как золото — в жестяную коробку (крупно руки)
const Seeds: Shot = ({ g }) => {
  const pour = ip(g, [6, 40], [0, 1]), fold = ip(g, [44, 56], [0, 1]), move = ip(g, [62, 86], [0, 1]);
  const env: P = [lerp(800, 1300, move), lerp(600, 640, move)];
  const arm = (from: P, to: P) => <g><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={OL} strokeWidth={84} strokeLinecap="round" /><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke="#5a6a7a" strokeWidth={70} strokeLinecap="round" /><circle cx={to[0]} cy={to[1]} r={36} fill="#fbefd6" stroke={OL} strokeWidth={5} /></g>;
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#9a7048" />
      <g transform="translate(1300 700)"><rect x={-170} y={-120} width={340} height={140} rx={12} fill="#a8aeb6" stroke={OL} strokeWidth={6} /><rect x={-150} y={-100} width={300} height={100} fill="#6a6a70" />{move < 1 ? <rect x={-180} y={-170} width={360} height={40} rx={10} fill="#b8bec6" stroke={OL} strokeWidth={5} transform="rotate(-25 -180 -150)" /> : null}</g>
      <g transform={`translate(${env[0]} ${env[1]})`}>
        <rect x={-110} y={-70} width={220} height={140} fill="#f2e6c4" stroke={OL} strokeWidth={5} />
        <path d={`M -110 -70 L 0 ${lerp(-150, 10, fold)} L 110 -70`} fill="#e8d8b0" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        {txt(0, 50, 22, "#6a4a2a", "TOMATO", 800)}
      </g>
      {pour < 1 ? Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={800 + Math.sin(i * 3) * 14} cy={420 + ((g * 6 + i * 16) % 160)} rx={6} ry={4} fill="#e8d8a0" stroke={OL} strokeWidth={2} />) : null}
      {pour < 1 ? <g transform="translate(800 400) rotate(150)"><rect x={-50} y={-30} width={100} height={60} rx={8} fill="#c8603a" stroke={OL} strokeWidth={4} /></g> : null}
      {pour < 1 ? arm([400, 1200], [760, 380]) : arm([500, 1200], [env[0] - 90, env[1] + 20])}
      {move > 0 ? arm([1700, 1200], [env[0] + 90, env[1] + 20]) : null}
    </CamG></Svg>
  );
};
// 9. радио: все слушают, герой крутит ручку
const Radio: Shot = ({ g }) => {
  const s = 0.85, rx = 960, ry = 760;
  const lean = ip(g, [30, 60], [0, 1]);
  const ppl: [number, number, Look, number][] = [[620, 1000, HERO, 1], [1300, 1000, W1, -1], [430, 960, PEOPLE.oldman, 1], [1500, 960, PEOPLE.man, -1]];
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.3, g / 147), cx: 960, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8b890" />
      <rect x={700} y={120} width={520} height={360} fill="#f8f0d8" stroke={OL} strokeWidth={6} /><path d="M 960 120 L 960 480 M 700 300 L 1220 300" stroke={OL} strokeWidth={6} />
      <rect width={W} height={H} fill="#fff4c8" opacity={0.08} />
      {ppl.map(([x, y, lk, dir], i) => <Person key={i} x={x} y={y} s={i < 2 ? s : 0.75} look={{ ...lk, ...COAT }} pose={stand(g + i * 9, { turn: dir * 0.6, lean: dir * lean * 8, handR: i === 0 ? [((rx + 90) - x) / s, ((ry - 80) - y) / s] : undefined, expr: { mouth: g > 70 ? "o" : "flat", open: 0.4, eyes: g > 70 ? "wide" : "dot", browH: 0.5, look: [dir, 0.4] }, seed: 60 + i })} uid={"r" + i} />)}
      <rect x={560} y={ry} width={800} height={30} fill="#b08050" stroke={OL} strokeWidth={5} /><rect x={580} y={ry + 30} width={760} height={300} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${rx} ${ry})`}>
        <rect x={-160} y={-200} width={320} height={200} rx={24} fill="#a8603a" stroke={OL} strokeWidth={6} />
        <rect x={-130} y={-170} width={150} height={140} rx={10} fill="#e8d8b0" stroke={OL} strokeWidth={4} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -120 ${-155 + i * 22} L 10 ${-155 + i * 22}`} stroke="#b8a070" strokeWidth={4} />)}
        <circle cx={90} cy={-130} r={30} fill="#3a2a22" stroke={OL} strokeWidth={4} /><path d={`M 90 -130 L ${90 + Math.cos(g / 10) * 22} ${-130 + Math.sin(g / 10) * 22}`} stroke="#f2ead6" strokeWidth={4} />
        <circle cx={90} cy={-60} r={20} fill="#3a2a22" stroke={OL} strokeWidth={4} />
        {g > 40 ? [1, 2, 3].map((k) => <path key={k} d={`M ${-170 - k * 26} -150 q -20 50 0 100`} stroke="#f6efe2" strokeWidth={5} fill="none" opacity={0.6 * Math.max(0, Math.sin(g / 6 - k))} />) : null}
      </g>
    </CamG></Svg>
  );
};
// 10. первый корабль с зерном: один, полупустой, с катером сопровождения
const Ship: Shot = ({ g }) => (
  <Svg bg="#b8c4cc"><CamG cam={{ s: lerp(1.0, 1.08, g / 126), cx: 960, cy: 540 }}>
    <defs><linearGradient id="sea7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8aa0aa" /><stop offset="100%" stopColor="#4a6470" /></linearGradient></defs>
    <rect x={-W} width={W * 3} height={H} fill="#d8dcd8" />
    <rect x={-W} y={560} width={W * 3} height={H} fill="url(#sea7)" />
    {Array.from({ length: 36 }, (_, i) => <path key={i} d={`M ${((i * 211) % 2600) - 300 + Math.sin(g / 20 + i) * 8} ${590 + (i % 9) * 52} q 30 -8 60 0`} stroke="rgba(255,255,255,0.3)" strokeWidth={4} fill="none" />)}
    <g transform={`translate(${700 + g * 1.2} ${640 + Math.sin(g / 14) * 4}) scale(0.62)`}>
      <path d="M -700 -40 L 760 -40 L 680 120 L -640 120 Z" fill="#9a3a2e" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-700} y={-60} width={1460} height={30} fill="#3a3a44" stroke={OL} strokeWidth={6} />
      {Array.from({ length: 22 }, (_, i) => (i % 3 === 0 || i > 15 ? null : <rect key={i} x={-560 + i * 54} y={-120} width={52} height={54} fill={["#d8a040", "#c8603a", "#5a8a9a"][i % 3]} stroke={OL} strokeWidth={4} />))}
      <rect x={-660} y={-300} width={120} height={240} fill="#f2ead6" stroke={OL} strokeWidth={6} />
      {[0, 1, 2].map((r) => <rect key={r} x={-645} y={-280 + r * 60} width={90} height={26} fill="#a8c8d8" stroke={OL} strokeWidth={3} />)}
      {txt(100, 80, 70, "#f2ead6", "GRAIN")}
    </g>
    <g transform={`translate(${1400 + g * 1.3} ${700 + Math.sin(g / 10) * 5}) scale(0.5)`}>
      <path d="M -220 0 L 240 0 L 200 70 L -200 70 Z" fill="#7a8088" stroke={OL} strokeWidth={8} /><rect x={-100} y={-90} width={160} height={90} fill="#9aa0a8" stroke={OL} strokeWidth={6} /><rect x={-20} y={-160} width={14} height={70} fill="#5a5a60" />
    </g>
    {Array.from({ length: 4 }, (_, i) => <path key={"w" + i} d={`M ${1500 + g * 1.3 - 160 - i * 50} ${740 + i * 6} q -30 6 -60 0`} stroke="#f2f2ee" strokeWidth={5} fill="none" opacity={0.6} />)}
  </CamG></Svg>
);
// 11. во дворе на стену прикалывают нарисованный план весеннего огорода
const Plan: Shot = ({ g }) => {
  const s = 0.85, y = 960, x = 760;
  const pin: P = [1060, 480];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const up = ip(g, [10, 40], [0, 1]);
  const handR: P = trackP(g, [[0, [70, -220]], [40, loc([pin[0] - 140, pin[1] + 40])], [60, loc([pin[0] - 140, pin[1] + 40])], [76, [70, -220]]]);
  const handL: P = trackP(g, [[0, [-50, -230]], [44, loc([pin[0] - 150, pin[1] - 60])], [60, loc([pin[0] - 150, pin[1] - 60])], [76, [-50, -230]]]);
  const man = stand(g, { turn: 0.6, handR, handL, expr: { mouth: "smile", look: [1, -0.4] }, seed: 70 });
  const hr = handW(x, y, s, man, "R");
  const onWall = g >= 58;
  const paper: P = onWall ? [pin[0], pin[1]] : [hr[0] + 140, hr[1] - 50];
  const gather = ip(g, [90, 170], [0, 1]);
  const names = ["ANNA", "DAVID", "YOU", "OLD TOM", "MIA", "SAM"];
  return (
    <Svg bg="#c8ccd2"><CamG cam={{ s: lerp(1.15, 1.05, ip(g, [80, 200], [0, 1])), cx: 1000, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#dde0e4" />
      <rect x={-W} y={60} width={W * 3} height={720} fill="#b89a7a" stroke={OL} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, r) => Array.from({ length: 16 }, (_, c) => <rect key={`${r}${c}`} x={-300 + c * 170 + (r % 2) * 85} y={60 + r * 72} width={160} height={66} fill="none" stroke="#a08262" strokeWidth={3} />))}
      <rect x={-W} y={780} width={W * 3} height={H} fill="#f2f2ee" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${paper[0]} ${paper[1]}) rotate(${onWall ? -2 : -8 + up * 6})`}>
        <rect x={-210} y={-150} width={420} height={300} fill="#f6efe2" stroke={OL} strokeWidth={5} />
        {txt(0, -112, 30, "#3a2a1e", "SPRING GARDEN")}
        {names.map((n, i) => <g key={n}><rect x={-190 + (i % 3) * 130} y={-90 + Math.floor(i / 3) * 110} width={120} height={96} fill={["#a8c88a", "#c8d898", "#b8d0a0"][i % 3]} stroke={OL} strokeWidth={3} />{txt(-130 + (i % 3) * 130, -36 + Math.floor(i / 3) * 110, 20, "#3a2a1e", n, 800)}</g>)}
        {onWall ? <circle cx={0} cy={-150} r={10} fill="#c8302a" stroke={OL} strokeWidth={3} /> : null}
      </g>
      <Person x={x} y={y} s={s} look={{ ...PEOPLE.man, ...COAT }} pose={man} uid="m" />
      {[[1360, 0.8, W1, -1], [1560, 0.5, KID, -1], [1720, 0.75, PEOPLE.oldman, -1]].map(([px, ps, lk, d], i) => { const xx = (px as number) + (1 - gather) * 300; return <Person key={i} x={xx} y={y} s={ps as number} look={{ ...(lk as Look), ...COAT }} pose={gather < 1 && g > 90 ? walking(g, (300 * gather) / (ps as number), -1, { seed: 71 + i, expr: { mouth: "smile" } }) : stand(g, { turn: -0.6, expr: { mouth: "smile", look: [-1, -0.5] }, seed: 71 + i })} uid={"g" + i} />; })}
      <Snow g={g} n={25} k={0.5} />
    </CamG></Svg>
  );
};
// 12. люди говорят о будущем: за столом, утро, солнце в окне
const Future: Shot = ({ g }) => {
  const seats: [number, Look][] = [[560, PEOPLE.oldman], [800, W1], [1040, HERO], [1280, PEOPLE.man], [1500, KID]];
  const top = 800;
  return (
    <Svg><CamG cam={{ s: lerp(1.2, 1.0, ip(g, [0, 170], [0, 1])), cx: 1000, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8b890" />
      <rect x={760} y={100} width={560} height={440} fill="#f8e0a8" stroke={OL} strokeWidth={6} />
      <circle cx={1040} cy={480} r={lerp(60, 90, g / 200)} fill="#fff0b0" opacity={0.9} />
      <rect x={760} y={440} width={560} height={100} fill="#f2f2ee" />
      <path d="M 1040 100 L 1040 540 M 760 320 L 1320 320" stroke={OL} strokeWidth={6} />
      {[0, 1, 2].map((k) => <circle key={k} cx={800 + k * 200} cy={548 + ((g * 2 + k * 30) % 60)} r={5} fill="#a8d0e8" />)}
      <rect width={W} height={H} fill="#ffe0a0" opacity={0.08} />
      {seats.map(([x, lk], i) => { const ks = lk === KID ? 0.55 : 0.8; const y = top + 150 * ks - 10; return <Person key={i} x={x} y={y} s={ks} look={{ ...lk, ...COAT }} pose={sitting(g + i * 11, { turn: (2 - i) * 0.18, handL: [-40, -230], handR: i % 2 ? [90, -300 + Math.sin(g / 6) * 20] : [40, -230], expr: { mouth: i % 2 ? "open" : "smile", open: talk(g, i) * 0.5, look: [(2 - i) * 0.3, 0] }, seed: 80 + i })} uid={"f" + i} />; })}
      <rect x={380} y={top} width={1300} height={24} fill="#b08050" stroke={OL} strokeWidth={5} /><rect x={400} y={top + 24} width={1260} height={260} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      {[560, 800, 1040, 1280, 1500].map((x) => <g key={x} transform={`translate(${x + 20} ${top})`}><rect x={-22} y={-50} width={44} height={50} rx={6} fill="#f2e6cc" stroke={OL} strokeWidth={4} />{[0, 1].map((k) => <path key={k} d={`M ${-6 + k * 12} -56 q 8 -20 0 -40`} stroke="#f6efe2" strokeWidth={4} fill="none" opacity={0.5} />)}</g>)}
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Winter, 0, T(4.7)], [Frozen, T(4.7), T(8.3)], [Cellar, T(8.3), T(13.5)], [MoveIn, T(13.5), T(18.4)], [AroundStove, T(18.4), T(23.1)],
  [Apples, T(23.1), T(27.2)], [Cabbage, T(27.2), T(28.9)], [Seeds, T(28.9), T(32.5)], [Radio, T(32.5), T(37.4)], [Ship, T(37.4), T(41.6)],
  [Plan, T(41.6), T(49.8)], [Future, T(49.8), PART7_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part7: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="9 MONTHS LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part7.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx7.wav")} volume={0.3} />
    <FadeOut total={PART7_FRAMES} />
  </AbsoluteFill>
);
export const _u7 = [H, Courtyard];
export const CUTS7 = CUTS.map(([, a, b]) => [a, b]);
