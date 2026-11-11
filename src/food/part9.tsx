// Часть 9 (≈54 с): «Спустя полтора года». Полки снова полные, но мир изменился: запасы зерна, бумажные системы в портах, теплицы на крышах, школа, огород, запас на 2 недели, воскресный стол, пицца, холодильник.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon, rigGeo } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, trackP, walking } from "./common";
import { Aisle, Kitchen, RiceBag, Truck, aisleFloorY, aisleX } from "./places";
import { handW } from "./part5";
import { Courtyard, KID } from "./part6";
import { Bed } from "./part8";
import { PIZZA_W, Slice, heroK } from "./part1";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART9_FRAMES = 1650;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#e9d2a6" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label="DAY 548" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
const W1: Look = { ...PEOPLE.woman, top: "#8a4a5a", topDark: "#6a3646" };
const TEACHER: Look = { ...PEOPLE.woman, top: "#3a7a6a", topDark: "#2a5a4e", hair: "#2a1a10" };
const KID2: Look = { ...KID, top: "#5a8ac8", topDark: "#3a6aa8", hair: "#c8903a", hairStyle: "bun" };
/** точка рта в мире (для откусывания) */
const mouthW = (x: number, y: number, s: number, turn: number, seed: number, g: number, sit = false): P => { const hd = rigGeo((sit ? sitting : stand)(g, { turn, seed })).head; return [x + (hd[0] + turn * 30 * 1.05) * s, y + (hd[1] + 28) * s]; };

// 1. полки снова полные: герой берёт коробку с полки в корзину
const Full: Shot = ({ g }) => {
  const Z = 3.4, s = 0.75 * (3.6 / Z), X = -1.1;
  const x = aisleX(X, Z), y = aisleFloorY(Z);
  const shelf: P = [aisleX(-1.6, Z) + 10, aisleFloorY(Z) - 1.05 * 900 / Z - 30];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const handL: P = trackP(g, [[0, [-60, -200]], [30, loc(shelf)], [40, loc(shelf)], [62, [40, -300]], [70, [40, -280]], [84, [-60, -200]]]);
  const pose = stand(g, { turn: g < 44 ? -0.6 : 0.3, handL, handR: [70, -215], expr: { mouth: "smile", look: g < 44 ? [-1, -0.3] : [0.5, 0.6] }, seed: 1 });
  const hl = handW(x, y, s, pose, "L"), hb = handW(x, y, s, pose, "R");
  return (
    <Svg><CamG cam={{ s: lerp(1.2, 1.3, g / 135), cx: 900, cy: 560 }}>
      <Aisle fill={1} />
      <Person x={aisleX(1.0, 6)} y={aisleFloorY(6)} s={0.75 * 3.6 / 6} look={PEOPLE.man} pose={stand(g, { turn: 0.7, expr: { mouth: "smile", look: [1, 0] }, seed: 2 })} uid="m" />
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
      <g transform={`translate(${hb[0]} ${hb[1]})`}>{g >= 68 ? <rect x={-22} y={-10} width={40} height={30} rx={4} fill="#3a7ad8" stroke={OL} strokeWidth={3} /> : null}<rect x={6} y={-6} width={30} height={24} rx={4} fill="#e8b23a" stroke={OL} strokeWidth={3} /><path d="M -46 0 L 46 0 L 38 52 L -38 52 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -32 0 Q 0 -44 32 0" stroke={OL} strokeWidth={4} fill="none" /></g>
      {g >= 36 && g < 68 ? <rect x={hl[0] - 20} y={hl[1] - 4} width={40} height={30} rx={4} fill="#3a7ad8" stroke={OL} strokeWidth={3} /> : null}
    </CamG></Svg>
  );
};
// 2. силосы с зерном за городом: зерно по трубе идёт из грузовика в силос, камера отъезжает
const Silos: Shot = ({ g }) => {
  const s = 0.3, wx = 560, wy = 880; // рабочий в реальном масштабе рядом с грузовиком и силосами
  const worker = stand(g, { turn: 0.5, handL: [-20, -270], handR: [40 + Math.sin(g / 7) * 6, -280], expr: { mouth: "flat", look: [1, -0.3] }, seed: 3 });
  return (
    <Svg><CamG cam={{ s: lerp(1.35, 0.9, ip(g, [60, 285], [0, 1])), cx: lerp(900, 960, ip(g, [60, 285], [0, 1])), cy: lerp(620, 540, ip(g, [60, 285], [0, 1])) }}>
      <rect x={-W * 2} y={-H} width={W * 5} height={H * 3} fill="#f0d8a8" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-900 + i * 130} y={520 - (i % 4) * 70} width={110} height={300 + (i % 4) * 70} fill="#c8b490" stroke={OL} strokeWidth={4} />)}
      <rect x={-W * 2} y={820} width={W * 5} height={H} fill="#c8b06a" stroke={OL} strokeWidth={5} />
      {[1000, 1250, 1500].map((x) => <g key={x}><rect x={x - 110} y={260} width={220} height={560} fill="#d8dcdc" stroke={OL} strokeWidth={6} />{Array.from({ length: 7 }, (_, k) => <path key={k} d={`M ${x - 110} ${320 + k * 70} L ${x + 110} ${320 + k * 70}`} stroke="#a8acae" strokeWidth={4} />)}<path d={`M ${x - 120} 262 L ${x} 170 L ${x + 120} 262 Z`} fill="#b8bcbe" stroke={OL} strokeWidth={6} strokeLinejoin="round" /></g>)}
      <path d="M 760 760 L 900 760 L 900 300 L 990 220" stroke="#8a8e90" strokeWidth={30} fill="none" strokeLinejoin="round" /><path d="M 760 760 L 900 760 L 900 300 L 990 220" stroke={OL} strokeWidth={36} fill="none" opacity={0.25} strokeLinejoin="round" />
      {Array.from({ length: 10 }, (_, i) => { const t = ((g * 0.02 + i / 10) % 1); const p: P = t < 0.15 ? [lerp(760, 900, t / 0.15), 760] : t < 0.85 ? [900, lerp(760, 300, (t - 0.15) / 0.7)] : [lerp(900, 990, (t - 0.85) / 0.15), lerp(300, 220, (t - 0.85) / 0.15)]; return <circle key={i} cx={p[0]} cy={p[1]} r={7} fill="#e0b860" stroke={OL} strokeWidth={2} />; })}
      <g transform="translate(600 900) scale(0.8)"><Truck x={0} y={0} boxes={0} /></g>
      <path d="M 520 650 L 760 760" stroke="#8a8e90" strokeWidth={22} />
      <Person x={wx + 760} y={wy} s={s} look={PEOPLE.worker} pose={worker} uid="w" />
      <rect x={wx + 760 + 30 * s} y={wy - 300 * s} width={18} height={23} fill="#f6efe2" stroke={OL} strokeWidth={3} />
      <g transform="translate(1250 420)"><rect x={-120} y={-36} width={240} height={60} rx={6} fill="#2e6a9a" stroke={OL} strokeWidth={4} />{txt(0, 6, 28, "#f6efe2", "GRAIN RESERVE")}</g>
    </CamG></Svg>
  );
};
// 3. порт: диспетчер ведёт учёт в бумажном журнале, за окном работают краны
const Ledger: Shot = ({ g }) => {
  const s = 0.95, x = 820, top = 760, y = top + 150 * s - 10;
  const line = Math.floor(g / 50), lp = (g % 50) / 50;
  const pen: P = [lerp(820, 1160, Math.min(1, lp * 1.15)), top - 16 + line * 0];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const pose = sitting(g, { turn: 0.5, lean: 6, handR: loc(pen), handL: loc([760, top - 10]), expr: { mouth: "flat", look: [1, 1] }, seed: 4 });
  const h = handW(x, y, s, pose, "R");
  const cx = lerp(900, 1500, (Math.sin(g / 40) + 1) / 2);
  return (
    <Svg><CamG cam={{ s: 1.35, cx: 980, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8c8a6" />
      <rect x={700} y={140} width={900} height={440} fill="#f2d8a8" stroke={OL} strokeWidth={8} />
      <rect x={700} y={430} width={900} height={150} fill="#5e8088" />
      <g stroke={OL} strokeWidth={5} fill="#e0703a"><rect x={1000} y={170} width={18} height={330} /><rect x={1360} y={170} width={18} height={330} /><rect x={760} y={170} width={820} height={26} /></g>
      <path d={`M ${cx} 196 L ${cx} 330`} stroke={OL} strokeWidth={3} /><rect x={cx - 60} y={330} width={120} height={56} fill="#3a7a9a" stroke={OL} strokeWidth={4} />
      <path d="M 700 360 L 1600 360 M 1150 140 L 1150 580" stroke={OL} strokeWidth={8} />
      <Person x={x} y={y} s={s} look={PEOPLE.operator} pose={pose} uid="o" />
      <rect x={560} y={top} width={900} height={26} fill="#8a6a4a" stroke={OL} strokeWidth={5} /><rect x={580} y={top + 26} width={860} height={300} fill="#6a4e36" stroke={OL} strokeWidth={5} />
      <g><rect x={780} y={top - 12} width={420} height={14} fill="#f6efe2" stroke={OL} strokeWidth={3} />
        <path d={`M ${800} ${top - 30} L ${1200} ${top - 30} L ${1200} ${top - 12} L ${800} ${top - 12} Z`} fill="#f2ead6" stroke={OL} strokeWidth={3} />
        <path d={`M 820 ${top - 20} L ${h[0]} ${top - 20}`} stroke="#3a3a6a" strokeWidth={3} strokeDasharray="10 4" /></g>
      <path d={`M ${h[0]} ${h[1]} L ${h[0] + 10} ${h[1] - 40}`} stroke="#2a2a30" strokeWidth={6} strokeLinecap="round" />
      <g transform={`translate(1320 ${top})`}><rect x={-60} y={-40} width={120} height={40} rx={6} fill="#c8402e" stroke={OL} strokeWidth={4} />{txt(0, -12, 20, "#f6efe2", "BACKUP")}</g>
    </CamG></Svg>
  );
};
// 4. теплица на крыше: женщина срывает салат и кладёт в ящик
const Roof: Shot = ({ g }) => {
  const s = 0.8, x = 860, y = 900;
  const plant: P = [1020, 800], crate: P = [700, 820];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const c = g % 66;
  const handR: P = trackP(c, [[0, [60, -200]], [16, loc([plant[0], plant[1] - 20])], [22, loc([plant[0], plant[1] - 20])], [30, [60, -280]], [44, loc([crate[0] + 40, crate[1] - 70])], [50, loc([crate[0] + 40, crate[1] - 70])], [66, [60, -200]]]);
  const pose = stand(g, { turn: c < 26 ? 0.5 : -0.3, lean: c > 10 && c < 26 ? 10 : c > 36 && c < 52 ? -10 : 0, handR, expr: { mouth: "smile", look: [c < 26 ? 1 : -1, 1] }, seed: 5 });
  const h = handW(x, y, s, pose, "R");
  const held = c >= 20 && c < 48, n = Math.floor(g / 66) + (c >= 48 ? 1 : 0);
  const Lettuce: React.FC<{ p: P; k?: number }> = ({ p, k = 1 }) => <g transform={`translate(${p[0]} ${p[1]}) scale(${k})`}><ellipse cx={0} cy={-14} rx={28} ry={18} fill="#8ac05a" stroke={OL} strokeWidth={3} /><ellipse cx={0} cy={-20} rx={15} ry={10} fill="#a8d870" /></g>;
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 900, cy: 580 }}>
      <rect x={-W} width={W * 3} height={H} fill="#f0d8a8" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-300 + i * 220} y={620 - (i % 3) * 90} width={180} height={300} fill="#c8b490" stroke={OL} strokeWidth={4} />)}
      <rect x={-W} y={900} width={W * 3} height={H} fill="#8a847a" stroke={OL} strokeWidth={5} />
      <path d="M 300 900 L 300 420 L 960 260 L 1620 420 L 1620 900" fill="#e8f2ee" opacity={0.5} stroke={OL} strokeWidth={6} />
      {[520, 740, 960, 1180, 1400].map((xx) => <path key={xx} d={`M ${xx} 900 L ${xx} ${xx < 960 ? 420 - (xx - 300) * 0.24 : 260 + (xx - 960) * 0.24}`} stroke="#a8b8b4" strokeWidth={6} />)}
      <rect x={940} y={800} width={560} height={40} rx={6} fill="#6a4a2e" stroke={OL} strokeWidth={4} />
      {[1080, 1160, 1240, 1320, 1400].map((xx) => <Lettuce key={xx} p={[xx, 800]} />)}
      {g < 22 || (g >= 66 && (g % 66) < 22) ? <Lettuce p={plant} /> : null}
      <Person x={x} y={y} s={s} look={W1} pose={pose} uid="w" />
      <rect x={crate[0] - 90} y={crate[1] - 60} width={180} height={80} fill="#c89a5a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: Math.min(3, n + 1) }, (_, i) => <Lettuce key={i} p={[crate[0] - 50 + i * 50, crate[1] - 54]} k={0.8} />)}
      {held ? <Lettuce p={[h[0], h[1] + 24]} /> : null}
      <rect x={300} y={420} width={1320} height={480} fill="#ffffff" opacity={0.08} />
    </CamG></Svg>
  );
};
// 5. школа: дети сажают семена в стаканчики, учительница у плаката
const School: Shot = ({ g }) => {
  const kids: [number, Look, number][] = [[820, KID, 0], [1120, KID2, 20]];
  const top = 780;
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 960, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#e8d8b0" />
      <rect x={-W} y={880} width={W * 3} height={H} fill="#b8946a" stroke={OL} strokeWidth={5} />
      <g transform="translate(960 300)"><rect x={-420} y={-120} width={840} height={200} rx={10} fill="#f6efe2" stroke={OL} strokeWidth={5} />
        <g transform="translate(-280 0)"><ellipse cx={0} cy={0} rx={22} ry={14} fill="#e8d8a0" stroke={OL} strokeWidth={3} />{txt(0, 60, 26, "#3a2a1e", "SEED")}</g>{txt(-140, 10, 50, "#8a6a4a", "→")}
        <g><path d="M 0 20 L 0 -40" stroke="#4a8a3a" strokeWidth={6} /><ellipse cx={-16} cy={-30} rx={16} ry={8} fill="#6aaa4a" /><ellipse cx={16} cy={-40} rx={16} ry={8} fill="#6aaa4a" />{txt(0, 60, 26, "#3a2a1e", "PLANT")}</g>{txt(140, 10, 50, "#8a6a4a", "→")}
        <g transform="translate(280 0)"><circle cx={0} cy={-10} r={28} fill="#d8443a" stroke={OL} strokeWidth={4} />{txt(0, 60, 26, "#3a2a1e", "FOOD")}</g></g>
      <Person x={480} y={900} s={0.85} look={TEACHER} pose={stand(g, { turn: 0.5, handR: [120, -330], expr: { mouth: "open", open: talk(g, 3) * 0.3, look: [1, 0] }, seed: 6 })} uid="t" />
      {kids.map(([x, lk, d], i) => {
        const ks = 0.55, y = top + 150 * ks - 10, pot: P = [x + 70, top];
        const c = (g + d) % 60;
        const handR: P = trackP(c, [[0, [70, -200]], [14, [((pot[0]) - x) / ks, ((pot[1] - 90) - y) / ks]], [24, [((pot[0]) - x) / ks, ((pot[1] - 60) - y) / ks]], [34, [70, -220]], [60, [70, -200]]]);
        const p = sitting(g + d, { turn: 0.4, handR, handL: [-40, -220], expr: { mouth: "smile", look: [1, 1] }, seed: 7 + i });
        return <g key={i}><Person x={x} y={y} s={ks} look={lk} pose={p} uid={"k" + i} /></g>;
      })}
      <rect x={640} y={top} width={720} height={22} fill="#c8a070" stroke={OL} strokeWidth={5} /><rect x={660} y={top + 22} width={680} height={140} fill="#a87a50" stroke={OL} strokeWidth={5} />
      {kids.map(([x]) => <g key={x} transform={`translate(${x + 70} ${top})`}><path d="M -26 -60 L 26 -60 L 20 0 L -20 0 Z" fill="#f2f2ee" stroke={OL} strokeWidth={4} /><ellipse cx={0} cy={-58} rx={24} ry={5} fill="#5a3e2a" /></g>)}
    </CamG></Svg>
  );
};
// 6. огород во дворе остался: ребёнок поливает, герой несёт корзину с овощами
const Yard: Shot = ({ g }) => {
  const s = 0.85, hy = 960, hx = 300 + g * 2.4;
  const hero = walking(g, (g * 2.4) / s, 1, { handL: [-50, -230], seed: 8, expr: { mouth: "smile" } });
  const bh = handW(hx, hy, s, hero, "L");
  const kid = stand(g, { turn: -0.6, handL: [-110, -260], expr: { mouth: "smile", look: [-1, 1] }, seed: 9 });
  const kh = handW(1500, 880, 0.55, kid, "L");
  return (
    <Svg><CamG cam={{ s: 1.15, cx: 980, cy: 600 }}>
      <Courtyard />
      <Bed x={200} y={820} w={540} kind="beans" name="DAVID" />
      <Bed x={900} y={820} w={540} kind="lettuce" name="YOU" />
      <Person x={1500} y={880} s={0.55} look={KID} pose={kid} uid="k" />
      <g transform={`translate(${kh[0]} ${kh[1]}) rotate(-30)`}><rect x={-26} y={-6} width={52} height={40} rx={6} fill="#3a8a6a" stroke={OL} strokeWidth={4} /><path d="M -26 6 L -64 -12" stroke={OL} strokeWidth={7} /></g>
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={kh[0] - 64 - i * 4} cy={kh[1] + 20 + ((g * 6 + i * 16) % 60)} r={4} fill="#6ab0e0" />)}
      <Person x={hx} y={hy} s={s} look={HERO} pose={hero} uid="h" />
      <g transform={`translate(${bh[0]} ${bh[1]})`}><path d="M -50 10 L 50 10 L 40 70 L -40 70 Z" fill="#c89a5a" stroke={OL} strokeWidth={4} /><path d="M -36 10 Q 0 -40 36 10" stroke={OL} strokeWidth={4} fill="none" /><circle cx={-20} cy={6} r={14} fill="#d8443a" stroke={OL} strokeWidth={3} /><ellipse cx={14} cy={4} rx={20} ry={12} fill="#8ac05a" stroke={OL} strokeWidth={3} /></g>
    </CamG></Svg>
  );
};
// 7. запас на две недели: герой ставит мешок риса на полку
const Pantry: Shot = ({ g }) => {
  const s = 1.0, x = 760, y = 1080, shelfY = 640, slot: P = [1060, shelfY];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const handR: P = trackP(g, [[0, [80, -260]], [30, loc([slot[0], slot[1] - 60])], [40, loc([slot[0], slot[1] - 60])], [56, [60, -200]], [100, [60, -200]], [118, loc([1110, 712])], [132, loc([1110, 712])], [148, [60, -200]]]); // потом поправляет табличку
  const pose = stand(g, { turn: 0.6, handR, expr: { mouth: g > 70 ? "smile" : "flat", look: [1, -0.2] }, seed: 10 });
  const h = handW(x, y, s, pose, "R");
  const placed = g >= 40;
  return (
    <Svg><CamG cam={{ s: lerp(1.35, 1.25, g / 204), cx: 1000, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#e8cfa0" />
      {[400, 640].map((yy) => <rect key={yy} x={840} y={yy} width={700} height={20} fill="#8a6a4a" stroke={OL} strokeWidth={4} />)}
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${900 + i * 60} 400)`}><rect x={-22} y={-90} width={44} height={90} rx={8} fill="#cfe8f4" stroke={OL} strokeWidth={4} opacity={0.9} /><rect x={-10} y={-104} width={20} height={16} fill="#3a7ad8" stroke={OL} strokeWidth={3} /></g>)}
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${1180 + i * 90} 400)`}><rect x={-36} y={-100} width={72} height={100} rx={8} fill="#c8603a" opacity={0.85} stroke={OL} strokeWidth={4} /><rect x={-30} y={-112} width={60} height={14} rx={3} fill="#c8a040" stroke={OL} strokeWidth={3} /></g>)}
      <RiceBag x={1200} y={640} s={0.9} /><RiceBag x={1300} y={640} s={0.9} />
      {[0, 1].map((i) => <g key={i} transform={`translate(${1420 + i * 70} 640)`}><rect x={-28} y={-70} width={56} height={70} rx={6} fill="#a8aeb6" stroke={OL} strokeWidth={4} /><rect x={-28} y={-48} width={56} height={22} fill="#8a3a2a" /></g>)}
      <g transform="translate(1190 690)"><rect x={-90} y={0} width={180} height={50} rx={6} fill="#f6efe2" stroke={OL} strokeWidth={3} />{txt(0, 36, 30, "#3a2a1e", "2 WEEKS")}</g>
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
      <RiceBag x={placed ? slot[0] : h[0]} y={placed ? slot[1] : h[1] + 60} s={0.9} />
    </CamG></Svg>
  );
};
// 8. по воскресеньям соседи едят вместе (спокойно: говорит один, кто-то пьёт чай)
const Sunday: Shot = ({ g }) => {
  const seats: [number, Look][] = [[340, PEOPLE.oldman], [560, W1], [780, KID], [1000, HERO], [1220, PEOPLE.man], [1440, PEOPLE.girl], [1660, PEOPLE.barista]];
  const top = 780, speaker = [4, 1, 5][Math.min(2, Math.floor(g / 64))];
  return (
    <Svg><CamG cam={{ s: lerp(1.05, 1.15, g / 186), cx: 1000, cy: 620 }}>
      <Courtyard warm={1} />
      {seats.map(([x, lk], i) => {
        const ks = lk === KID ? 0.55 : 0.8, y = top + 150 * ks - 10 + (lk === KID ? 30 : 0);
        const cupRest: P = [(x + 30 - x) / ks, (top - 26 - y) / ks];
        const drinker = i === 3 ? ip(g, [90, 104, 124, 138], [0, 1, 1, 0]) : 0;
        const turn = i === speaker ? 0 : Math.max(-0.6, Math.min(0.6, (seats[speaker][0] - x) / 500));
        const m = mouthW(x, y, ks, turn, 80 + i, g + i * 11, true);
        const cupLift: P = [(m[0] + 20 - x) / ks, (m[1] + 10 - y) / ks];
        const handR: P = [lerp(cupRest[0], cupLift[0], drinker), lerp(cupRest[1], cupLift[1], drinker)];
        const p = sitting(g + i * 11, { turn, handR, handL: [cupRest[0] - 50, cupRest[1] + 6], expr: { mouth: i === speaker ? "open" : drinker > 0.8 ? "flat" : "smile", open: i === speaker ? talk(g, i) * 0.35 : 0, eyes: drinker > 0.8 ? "half" : "dot", look: [turn > 0 ? 1 : turn < 0 ? -1 : 0, 0] }, seed: 80 + i });
        const h = handW(x, y, ks, p, "R");
        return <g key={i}><Person x={x} y={y} s={ks} look={lk} pose={p} uid={"t" + i} /><rect x={h[0] - 18} y={h[1] - 34} width={36} height={40} rx={5} fill="#f2e6cc" stroke={OL} strokeWidth={3} /></g>;
      })}
      <rect x={180} y={top} width={1640} height={24} fill="#b08050" stroke={OL} strokeWidth={5} />
      <rect x={200} y={top + 24} width={1600} height={200} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      {[400, 840, 1280, 1700].map((x) => <g key={x} transform={`translate(${x} ${top})`}><path d="M -50 -26 Q 0 20 50 -26 Z" fill="#f2e6cc" stroke={OL} strokeWidth={4} /><ellipse cx={0} cy={-26} rx={46} ry={8} fill="#c8903a" /></g>)}
    </CamG></Svg>
  );
};
// 9. ты всё ещё иногда заказываешь пиццу: берёт кусок и откусывает
const Pizza: Shot = ({ g }) => {
  const s = 0.9, x = 900, top = 760, y = top + 150 * s - 10;
  const turn = 0.3, m = mouthW(x, y, s, turn, 11, g, true);
  const box: P = [1160, top];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const atMouth: P = [m[0] + 24, m[1] + 8];
  const handR: P = trackP(g, [[0, [60, -200]], [14, loc([box[0] - 40, box[1] - 20])], [22, loc([box[0] - 40, box[1] - 20])], [38, loc(atMouth)], [46, loc(atMouth)], [60, loc([1040, 640])]]);
  const bite = g >= 44, chew = g >= 46 && g < 80;
  const pose = sitting(g, { turn, handR, handL: [-60, -230], expr: g >= 34 && g < 44 ? { mouth: "open", open: 0.6 } : chew ? { mouth: Math.floor((g - 46) / 5) % 2 ? "flat" : "wavy", eyes: "happy" } : { mouth: "smile", eyes: "dot", look: [1, 0.6] }, seed: 11 });
  const h = handW(x, y, s, pose, "R");
  const held = g >= 20;
  return (
    <Svg><CamG cam={{ s: 1.6, cx: 1000, cy: 560 }}>
      <Kitchen open={0} />
      <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
      <rect x={600} y={top} width={800} height={22} fill="#b08050" stroke={OL} strokeWidth={5} /><rect x={620} y={top + 22} width={760} height={300} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${box[0]} ${box[1]})`}><rect x={-110} y={-14} width={220} height={14} fill="#e8d0a0" stroke={OL} strokeWidth={4} /><path d="M -110 -14 L -110 -170 L 110 -170 L 110 -14" fill="#f2e2b8" stroke={OL} strokeWidth={4} /><ellipse cx={0} cy={-14} rx={96} ry={10} fill="#f2c25a" stroke={OL} strokeWidth={3} />{txt(0, -90, 26, "#c8402e", "PIZZA")}</g>
      {held ? <Slice at={[h[0] - 6, h[1] + 4]} bite={bite ? 1 : 0} s={1.1} /> : null}
    </CamG></Svg>
  );
};
// 10. открываешь полный холодильник — и на секунду вспоминаешь
const Fridge: Shot = ({ g }) => {
  const pose = stand(g, { turn: 0.55, tilt: 3, expr: g > 70 ? { mouth: "smile", look: [1, 0.2] } : { mouth: "flat", look: [1, 0.2] }, seed: 12 });
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.15, ip(g, [0, 150], [0, 1])), cx: 1150, cy: 560 }}>
      <Kitchen open={1} />
      <Person {...heroK} look={HERO} pose={pose} uid="h" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Full, 0, T(4.5)], [Silos, T(4.5), T(14.0)], [Ledger, T(14.0), T(19.3)], [Roof, T(19.3), T(23.7)], [School, T(23.7), T(26.4)],
  [Yard, T(26.4), T(30.2)], [Pantry, T(30.2), T(37.0)], [Sunday, T(37.0), T(43.2)], [Pizza, T(43.2), T(46.6)], [Fridge, T(46.6), PART9_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part9: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="18 MONTHS LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part9.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx9.wav")} volume={0.3} />
    <FadeOut total={PART9_FRAMES} />
  </AbsoluteFill>
);
export const _u9 = [H, PIZZA_W];
export const CUTS9 = CUTS.map(([, a, b]) => [a, b]);
