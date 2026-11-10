// Часть 6 (≈56 с): «Спустя полгода». Мир «меньше»: пустые окна, общий котёл во дворе, пайки меньше, врачи, фермы под охраной, соседи.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, sitting, stand, talk, trackP, walking } from "./common";
import { STREET_Y, Street } from "./places";
import { Car, Ground, handW } from "./part5";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART6_FRAMES = 1680;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string; night?: number }> = ({ children, bg = "#e9d2a6", night = 0 }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}{night ? <rect width={W} height={H} fill="#1a2440" opacity={night} /> : null}<Vignette /><Clock label="DAY 183" /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
const DOCTOR: Look = { kind: "person", skin: "#f0c690", skinDark: "#c89a60", top: "#f2f2ee", topDark: "#cfd2d0", pants: "#4a5a7a", shoe: "#2a2a30", hair: "#5a3a22", hairStyle: "short" };
const KID: Look = { kind: "person", skin: "#f3cf96", skinDark: "#cfa565", top: "#e0b040", topDark: "#b48a20", pants: "#3a4a6a", shoe: "#c84a3a", hair: "#4a2a16", hairStyle: "short" };
const GUARD: Look = { kind: "person", skin: "#e2a868", skinDark: "#b98040", top: "#4a4a40", topDark: "#36362e", pants: "#3a3a34", shoe: "#2a2a20", hairStyle: "cap", cap: "#3a3a30" };

// ---------- места и предметы ----------
const Courtyard: React.FC<{ warm?: number }> = ({ warm = 0 }) => (
  <g>
    <rect x={-W} width={W * 3} height={H} fill={warm ? "#e8b880" : "#e8cfa0"} />
    {[-300, 500, 1300].map((x, i) => <g key={x}>
      <rect x={x} y={-100} width={760} height={760} fill={["#c89a72", "#b88a64", "#c8a07a"][i]} stroke={OL} strokeWidth={6} />
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => <rect key={`${r}${c}`} x={x + 60 + c * 170} y={20 + r * 200} width={100} height={130} fill={(r + c + i) % 3 === 0 ? "#3a3040" : warm ? "#f6d080" : "#bfe0f0"} stroke={OL} strokeWidth={4} />))}
    </g>)}
    <rect x={-W} y={660} width={W * 3} height={H} fill="#bfa888" stroke={OL} strokeWidth={5} />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-400 + i * 120} 660 L ${-600 + i * 140} 1080`} stroke="#a89070" strokeWidth={3} />)}
    {warm ? <path d="M -100 120 Q 500 260 960 160 Q 1400 80 2100 200" stroke={OL} strokeWidth={3} fill="none" /> : null}
    {warm ? Array.from({ length: 18 }, (_, i) => { const x = -100 + i * 125, y = i < 9 ? 120 + Math.sin((i / 9) * Math.PI) * 110 : 160 - Math.sin(((i - 9) / 9) * Math.PI) * 60; return <circle key={"l" + i} cx={x} cy={y + 14} r={10} fill="#ffe08a" stroke={OL} strokeWidth={2} />; }) : null}
  </g>
);
/** большой котёл на кирпичах с огнём. back — задняя часть (рисовать до предметов, падающих внутрь), front — передняя */
const PotBack: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 34 - 20} -84 Q ${k * 34 + Math.sin(g / 6 + k) * 10} ${-150 - k * 10} ${k * 34 + 10} -220`} stroke="#f6efe2" strokeWidth={10} fill="none" opacity={0.35} transform={`translate(0 ${-((g * 2 + k * 30) % 60)})`} />)}
    <ellipse cx={0} cy={-240} rx={110} ry={22} fill="#3a3030" stroke={OL} strokeWidth={5} />
    <ellipse cx={0} cy={-236} rx={96} ry={16} fill="#c8903a" />
  </g>
);
const PotFront: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-60} width={240} height={60} fill="#a8443a" stroke={OL} strokeWidth={5} />
    {[0, 1, 2].map((k) => <path key={k} d={`M ${-60 + k * 60} -60 Q ${-50 + k * 60 + Math.sin(g / 3 + k) * 8} -110 ${-60 + k * 60 + 10} ${-95 - Math.abs(Math.sin(g / 4 + k)) * 26}`} fill="#f0a030" stroke="#d8602a" strokeWidth={4} />)}
    <path d="M -110 -240 Q -118 -110 -80 -84 L 80 -84 Q 118 -110 110 -240 Z" fill="#4a4040" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -110 -240 Q 0 -216 110 -240" stroke={OL} strokeWidth={5} fill="none" />
  </g>
);
const Suitcase: React.FC<{ x: number; y: number; c?: string; s?: number }> = ({ x, y, c = "#3a6a9a", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-60} y={0} width={120} height={90} rx={10} fill={c} stroke={OL} strokeWidth={5} /><path d="M -20 0 L -20 -14 L 20 -14 L 20 0" stroke={OL} strokeWidth={6} fill="none" /></g>
);
const Bowl: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}><path d="M -40 -24 Q 0 26 40 -24 Z" fill="#f2e6cc" stroke={OL} strokeWidth={4} /><ellipse cx={0} cy={-24} rx={36} ry={6} fill="#c8903a" /></g>
);

// 1. мир не разрушен — просто стал «меньше»: тихая улица
const Quiet: Shot = ({ g }) => {
  const x = 1500 - g * 2.0;
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 1.05, g / 153), cx: 960, cy: 560 }}>
      <Street stock={0} closedCafe />
      {Array.from({ length: 6 }, (_, i) => { const lx = ((i * 330 + g * (2 + i % 3)) % 2200) - 100, ly = STREET_Y + 30 + (i % 3) * 30 + Math.sin(g / 8 + i) * 8; return <ellipse key={i} cx={lx} cy={ly} rx={12} ry={6} fill={["#c8803a", "#d8a040", "#a8602a"][i % 3]} transform={`rotate(${g * 4 + i * 50} ${lx} ${ly})`} />; })}
      <Person x={x} y={STREET_Y + 10} s={0.7} look={PEOPLE.oldman} pose={walking(g, (g * 2.0) / 0.7, -1, { expr: { mouth: "flat" }, seed: 1 })} uid="o" />
    </CamG></Svg>
  );
};
// 2. дом вечером: окна гаснут одно за другим
const Windows: Shot = ({ g }) => {
  const order = [3, 17, 8, 22, 12, 0, 27, 5, 19, 14, 25, 9, 30, 2, 33, 21];
  return (
    <Svg bg="#3a2a3a"><CamG cam={{ s: lerp(1.0, 1.06, g / 69), cx: 960, cy: 540 }}>
      <defs><linearGradient id="dusk6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a3a5a" /><stop offset="100%" stopColor="#c87a5a" /></linearGradient></defs>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#dusk6)" />
      <rect x={460} y={80} width={1000} height={1100} fill="#6a4a44" stroke={OL} strokeWidth={6} />
      {Array.from({ length: 36 }, (_, i) => { const r = Math.floor(i / 6), c = i % 6, k = order.indexOf(i); const dark = k >= 0 && g > 6 + k * 4; return <rect key={i} x={510 + c * 160} y={130 + r * 160} width={100} height={110} fill={dark ? "#2a2230" : "#f6d080"} stroke={OL} strokeWidth={4} />; })}
      <rect x={0} y={1000} width={W} height={200} fill="#3a2a2a" />
    </CamG></Svg>
  );
};
// 3. семья уезжает: мужчина ставит чемоданы в багажник, машина уезжает
const Leaving: Shot = ({ g }) => {
  const cs = 2.7, carX = lerp(1150, 2900, ip(g, [112, 153], [0, 1], (t) => t * t)), carY = 960;
  const roofY = carY - 140 * cs; // крыша машины: чемоданы кладут на багажник на крыше
  const s = 0.8, my = 960;
  const walkIn = ip(g, [0, 34], [0, 1], (t) => t), x = lerp(300, 880, walkIn);
  const spot: P = [1010, roofY - 40];
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - my) / s];
  const handR: P = g < 34 ? [60, -200] : trackP(g, [[34, [60, -200]], [52, loc([spot[0] - 10, spot[1] - 60])], [60, loc(spot)], [66, loc(spot)], [80, [60, -190]]]);
  const man = g < 34 ? walking(g, (x - 300) / s, 1, { handR: [60, -200], seed: 10, expr: { mouth: "flat" } }) : stand(g, { turn: 0.6, handR, expr: { mouth: "flat", look: [1, -0.5] }, seed: 10 });
  const h = handW(x, my, s, man, "R");
  const placed = g >= 63, dx = carX - 1150;
  return (
    <Svg><CamG cam={{ s: 1.05, cx: 980, cy: 560 }}>
      <Courtyard />
      <Person x={1700} y={900} s={0.72} look={PEOPLE.woman} pose={stand(g, { turn: -0.3, handR: g > 90 ? [100 + Math.sin(g * 0.5) * 30, -430] : [80, -260], expr: { mouth: g > 90 ? "smile" : "flat", look: [-1, 0] }, seed: 11 })} uid="wo" />
      <Person x={1800} y={900} s={0.45} look={KID} pose={stand(g, { turn: -0.3, handL: [-70, -280], expr: { mouth: "flat" }, seed: 12 })} uid="k" />
      <rect x={carX - 90 * cs} y={roofY - 14} width={160 * cs} height={14} fill="#4a4038" stroke={OL} strokeWidth={4} />
      <Suitcase x={1240 + dx} y={roofY - 14 - 90} c="#5a8a4a" />
      {placed ? <Suitcase x={spot[0] + dx} y={roofY - 14 - 90} c="#c8603a" /> : null}
      <Car x={carX} y={carY} c="#3a7a9a" s={cs} roof={0} />
      {/* в машине уже сидят водитель и ребёнок — семья уезжает, соседи машут */}
      <circle cx={carX + 30 * cs} cy={carY - 108 * cs} r={11 * cs} fill="#e6b26a" stroke={OL} strokeWidth={4} /><path d={`M ${carX + 19 * cs} ${carY - 112 * cs} Q ${carX + 30 * cs} ${carY - 126 * cs} ${carX + 41 * cs} ${carY - 112 * cs}`} fill="#2a1a10" />
      <circle cx={carX - 40 * cs} cy={carY - 104 * cs} r={8 * cs} fill="#f3cf96" stroke={OL} strokeWidth={4} />
      <path d={`M ${carX - 70 * cs} ${carY - 128 * cs} L ${carX - 10 * cs} ${carY - 128 * cs} L ${carX - 10 * cs} ${carY - 98 * cs} L ${carX - 100 * cs} ${carY - 98 * cs} Z M ${carX + 2 * cs} ${carY - 128 * cs} L ${carX + 54 * cs} ${carY - 128 * cs} L ${carX + 92 * cs} ${carY - 98 * cs} L ${carX + 2 * cs} ${carY - 98 * cs} Z`} fill="#bfe0f0" opacity={0.45} stroke={OL} strokeWidth={4} />
      <Person x={x} y={my} s={s} look={PEOPLE.man} pose={man} uid="m" />
      {!placed ? <Suitcase x={h[0]} y={h[1] + 4} c="#c8603a" /> : null}
    </CamG></Svg>
  );
};
// 4. общий котёл во дворе: герой мешает, соседка приносит морковь и опускает в котёл
const Cauldron: Shot = ({ g }) => {
  const px = 960, py = 900, s = 0.85, hx = 760;
  const ang = g * 0.18, ladle: P = [px - 30 + Math.cos(ang) * 50, py - 250 + Math.sin(ang) * 10];
  const hero = stand(g, { turn: 0.5, handR: [((ladle[0] - 20) - hx) / s, ((ladle[1] - 120) - py) / s], handL: [((ladle[0] - 60) - hx) / s, ((ladle[1] - 150) - py) / s], expr: { mouth: "smile", look: [1, 1] }, seed: 20 });
  const hh = handW(hx, py, s, hero, "R");
  const wx = lerp(1700, 1170, ip(g, [60, 120], [0, 1], (t) => t)), arrived = g >= 120;
  const drop: P = [px + 40, py - 300];
  const wloc = (p: P): P => [(p[0] - wx) / s, (p[1] - py) / s];
  const wpose = !arrived ? walking(g, (1700 - wx) / s, -1, { handL: [-50, -230], seed: 21, expr: { mouth: "smile" } })
    : stand(g, { turn: -0.5, handL: trackP(g, [[120, [-50, -230]], [134, wloc(drop)], [146, wloc(drop)], [158, [-50, -200]]]), expr: { mouth: "smile", look: [-1, 1] }, seed: 21 });
  const wh = handW(wx, py, s, wpose, "L");
  const fall = ip(g, [140, 150], [0, 1], (t) => t * t), carrotY = g < 140 ? wh[1] + 10 : lerp(wh[1] + 10, py - 200, fall);
  const carrotX = g < 140 ? wh[0] : drop[0];
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.25, g / 168), cx: 1000, cy: 600 }}>
      <Courtyard />
      <Person x={480} y={860} s={0.75} look={PEOPLE.oldman} pose={stand(g, { turn: 0.4, handL: [-40, -250], handR: [40, -250], expr: { mouth: "open", open: talk(g, 3) * 0.4 }, seed: 22 })} uid="o" />
      <Person x={300} y={850} s={0.72} look={PEOPLE.girl} pose={stand(g, { turn: 0.3, expr: { mouth: "smile", look: [1, 0] }, seed: 23 })} uid="gi" />
      <PotBack x={px} y={py} g={g} />
      {g < 150 ? <g transform={`translate(${carrotX} ${carrotY}) rotate(${g < 140 ? 70 : 90})`}><path d="M 0 -8 L 46 0 L 0 8 Z" fill="#e8803a" stroke={OL} strokeWidth={3} /><path d="M 0 0 L -14 -8 M 0 0 L -14 8" stroke="#5a9a3a" strokeWidth={4} /></g> : null}
      <g><path d={`M ${hh[0]} ${hh[1]} L ${ladle[0]} ${ladle[1]}`} stroke="#8a5a30" strokeWidth={9} strokeLinecap="round" /></g>
      <PotFront x={px} y={py} g={g} />
      <Person x={hx} y={py} s={s} look={HERO} pose={hero} uid="h" />
      <Person x={wx} y={py} s={s} look={PEOPLE.woman} pose={wpose} uid="w" />
    </CamG></Svg>
  );
};
// 5. ничего не выбрасывают: кожура и кость — в котёл (крупно руки)
const Peel: Shot = ({ g }) => {
  const knife = Math.sin(g * 0.5) * 30;
  const sweep = ip(g, [44, 64], [0, 1]), bone = ip(g, [74, 96], [0, 1]);
  const peels = Math.min(1, g / 40);
  const arm = (from: P, to: P, sleeve: string, item?: React.ReactNode) => (
    <g><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={OL} strokeWidth={84} strokeLinecap="round" /><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={sleeve} strokeWidth={70} strokeLinecap="round" />{item}<circle cx={to[0]} cy={to[1]} r={36} fill="#fbefd6" stroke={OL} strokeWidth={5} /></g>
  );
  const leftH: P = g < 44 ? [760, 560] : g < 70 ? [lerp(820, 1360, sweep), 690 - Math.sin(sweep * Math.PI) * 60] : [lerp(1000, 1380, bone), lerp(760, 560, bone)];
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#9a7048" />
      <rect x={300} y={600} width={760} height={260} rx={20} fill="#d8b07a" stroke={OL} strokeWidth={6} />
      <ellipse cx={1500} cy={600} rx={260} ry={60} fill="#3a3030" stroke={OL} strokeWidth={6} /><ellipse cx={1500} cy={606} rx={236} ry={46} fill="#c8903a" />
      <path d="M 1240 600 Q 1230 900 1300 1000 L 1700 1000 Q 1770 900 1760 600" fill="#4a4040" stroke={OL} strokeWidth={6} />
      {g < 64 ? Array.from({ length: Math.floor(peels * 7) }, (_, i) => <path key={i} d={`M ${560 + i * 30 + (g >= 44 ? (leftH[0] - 820) : 0)} ${720 + (i % 2) * 14} q 20 -14 40 0`} stroke="#b88a4a" strokeWidth={10} fill="none" strokeLinecap="round" />) : null}
      {g >= 64 && g < 70 ? <ellipse cx={1500} cy={604} rx={40} ry={8} fill="#b88a4a" /> : null}
      {g < 44 ? arm([300, 1200], [720, 620], "#e0793a") : null}
      {g < 44 ? <g><ellipse cx={790} cy={560} rx={90} ry={66} fill="#c8a060" stroke={OL} strokeWidth={5} /><path d={`M ${720} 540 Q 790 ${500 + (g % 20)} 860 540`} fill="#f2e2a8" stroke={OL} strokeWidth={3} /></g> : null}
      {g < 44 ? arm([1300, 1200], [840 + knife * 0.3, 540], "#e0793a", <path d={`M ${840 + knife * 0.3} 540 L ${780 + knife * 0.3} 520`} stroke="#c8ccd2" strokeWidth={14} strokeLinecap="round" />) : null}
      {g >= 44 && g < 70 ? arm([300, 1200], leftH, "#e0793a") : null}
      {g >= 70 ? arm([600, 1300], leftH, "#e0793a", g < 92 ? <g transform={`translate(${leftH[0] + 10} ${leftH[1] + 30}) rotate(30)`}><rect x={-50} y={-10} width={100} height={20} rx={10} fill="#f2ead6" stroke={OL} strokeWidth={4} /><circle cx={-50} cy={0} r={16} fill="#f2ead6" stroke={OL} strokeWidth={4} /><circle cx={50} cy={0} r={16} fill="#f2ead6" stroke={OL} strokeWidth={4} /></g> : null) : null}
    </CamG></Svg>
  );
};
// 6. паёк меньше — дважды
const Shrink: Shot = ({ g }) => {
  const boxes: [number, number, string, number][] = [[480, 1.0, "MONTH 1", 0], [960, 0.72, "MONTH 4", 24], [1400, 0.5, "MONTH 6", 52]];
  return (
    <Svg bg="#6a4a30"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#e3c896" />
      <rect x={0} y={760} width={W} height={60} fill="#b9844e" stroke={OL} strokeWidth={6} /><rect x={0} y={820} width={W} height={300} fill="#8a5a30" stroke={OL} strokeWidth={5} />
      {boxes.map(([x, k, label, at]) => { const o = ip(g, [at, at + 10], [0, 1]), dy = (1 - o) * -60; return o <= 0 ? null : <g key={label} transform={`translate(${x} ${760 + dy}) scale(${k})`} opacity={o}>
        <rect x={-180} y={-220} width={360} height={220} fill="#c89a5a" stroke={OL} strokeWidth={6} />
        {Array.from({ length: Math.round(6 * k * k) }, (_, i) => <rect key={i} x={-150 + (i % 3) * 100} y={-270 - Math.floor(i / 3) * 40} width={80} height={60} rx={6} fill={["#f2e8d4", "#a8aeb6", "#e8d098"][i % 3]} stroke={OL} strokeWidth={4} />)}
        <rect x={-180} y={-220} width={360} height={60} fill="#b88a4a" stroke={OL} strokeWidth={6} />
        {txt(0, -80, 40, "#5a3a20", label)}</g>; })}
    </CamG></Svg>
  );
};
// 7. новая дырка в ремне (крупно)
const Belt: Shot = ({ g }) => {
  const press = ip(g, [20, 34, 44, 54], [0, 1, 1, 0]), newHole = g >= 44, buckle = ip(g, [60, 80], [0, 1]);
  const prongX = lerp(1000, 1100, buckle);
  return (
    <Svg bg="#3a2a22"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#e0793a" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${i * 240} 0 L ${i * 240 + 40} 520`} stroke="#b65a26" strokeWidth={6} />)}
      <rect y={620} width={W} height={H} fill="#4a3a32" />
      <rect x={-20} y={500} width={W + 40} height={130} fill="#5a3a22" stroke={OL} strokeWidth={6} />
      {[1180, 1280, 1380, 1480].map((x, i) => <g key={x}><ellipse cx={x} cy={565} rx={16} ry={12} fill="#2a1a10" />{i === 0 ? <path d={`M ${x - 40} 565 l -30 0`} stroke="#7a5a3a" strokeWidth={10} opacity={0.6} /> : null}</g>)}
      {newHole ? <ellipse cx={1100} cy={565} rx={16} ry={12} fill="#2a1a10" /> : null}
      <g transform={`translate(${prongX - 120} 0)`}><rect x={-60} y={470} width={200} height={190} rx={18} fill="none" stroke="#c8a040" strokeWidth={22} /><rect x={-60} y={470} width={200} height={190} rx={18} fill="none" stroke={OL} strokeWidth={4} /><rect x={110} y={556} width={20} height={18} fill="#c8a040" stroke={OL} strokeWidth={3} /></g>
      <g transform={`translate(1100 ${lerp(300, 540, press)})`}><rect x={-6} y={-200} width={12} height={200} fill="#a8aeb6" stroke={OL} strokeWidth={3} /><path d="M -6 0 L 0 24 L 6 0 Z" fill="#a8aeb6" stroke={OL} strokeWidth={3} /><circle cx={0} cy={-180} r={44} fill="#fbefd6" stroke={OL} strokeWidth={5} /></g>
    </CamG></Svg>
  );
};
// 8. врач смотрит дёсны ребёнка фонариком
const Clinic: Shot = ({ g }) => {
  const s = 0.85, dx = 1180, y = 940, tableTop = 700, ks = 0.5, kx = 860;
  const kidY = tableTop + 150 * ks; // сидит на кушетке
  const target: P = [kx + 40, kidY - 410 * ks];
  const doc = stand(g, { turn: -0.6, lean: -6, handL: [((target[0] + 90) - dx) / s, ((target[1] - 10) - y) / s], handR: [-30, -260], expr: { mouth: "flat", browA: -0.5, look: [-1, 0.3] }, seed: 30 });
  const lh = handW(dx, y, s, doc, "L");
  const kid = sitting(g, { turn: 0.5, expr: { mouth: g > 14 ? "open" : "flat", open: 0.8, eyes: "dot", look: [1, -0.3] }, seed: 31 });
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 1000, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#dfe4dc" />
      <rect x={-W} y={760} width={W * 3} height={H} fill="#c8ccc0" stroke={OL} strokeWidth={5} />
      <rect x={300} y={200} width={260} height={180} fill="#f6efe2" stroke={OL} strokeWidth={5} /><path d="M 430 230 L 430 350 M 370 290 L 490 290" stroke="#c8402e" strokeWidth={22} />
      <Person x={600} y={900} s={s} look={PEOPLE.woman} pose={stand(g, { turn: 0.4, handR: [60, -260], expr: { mouth: "flat", browA: -0.7, browH: 0.5, look: [1, 0] }, seed: 32 })} uid="mo" />
      <rect x={700} y={tableTop} width={360} height={30} rx={8} fill="#a8c0c8" stroke={OL} strokeWidth={5} />
      <rect x={720} y={tableTop + 30} width={20} height={210} fill="#8a9aa0" stroke={OL} strokeWidth={4} /><rect x={1020} y={tableTop + 30} width={20} height={210} fill="#8a9aa0" stroke={OL} strokeWidth={4} />
      <Person x={kx} y={kidY} s={ks} look={KID} pose={kid} uid="k" />
      <Person x={dx} y={y} s={s} look={DOCTOR} pose={doc} uid="d" />
      <g><rect x={lh[0] - 34} y={lh[1] - 8} width={44} height={16} rx={4} fill="#3a3a40" stroke={OL} strokeWidth={3} />
        <path d={`M ${lh[0] - 34} ${lh[1]} L ${target[0]} ${target[1] - 20} L ${target[0]} ${target[1] + 20} Z`} fill="#fff4b0" opacity={0.45} /></g>
    </CamG></Svg>
  );
};
// 9. старик слишком слаб, чтобы стоять в очереди: сидит на скамейке, соседка придерживает его за плечо
const Weak: Shot = ({ g }) => {
  const s = 0.8, ox = 860, y = 900, seat = y - 150 * s;
  const old = { ...sitting(g, { tilt: 8, nod: 10, expr: { mouth: "flat", eyes: "half", browA: -0.6, look: [0, 1] }, seed: 40 }), footL: [-60, 0] as P, footR: [20, 0] as P };
  const shoulder: P = [ox + 40 * s, y - 380 * s];
  const wx = 1080, help = stand(g, { turn: -0.6, lean: -8, handL: [((shoulder[0] + 10) - wx) / s, ((shoulder[1] - 10) - y) / s], expr: { mouth: "flat", browA: -0.6, browH: 0.4, look: [-1, 0.6] }, seed: 41 });
  return (
    <Svg><CamG cam={{ s: 1.2, cx: 980, cy: 600 }}>
      <Ground y={760} c="#c8bca0" sky="#e8d8b8" />
      <rect x={200} y={180} width={1600} height={580} fill="#dfe4dc" stroke={OL} strokeWidth={5} /><rect x={1200} y={260} width={220} height={60} rx={8} fill="#c8402e" stroke={OL} strokeWidth={4} />{txt(1310, 302, 36, "#f6efe2", "CLINIC")}
      {[1400, 1520, 1640, 1760].map((x, i) => <Person key={x} x={x} y={820} s={0.62} look={[PEOPLE.man, PEOPLE.girl, PEOPLE.woman, PEOPLE.worker][i]} pose={stand(g + i * 9, { turn: -0.6, expr: { mouth: "flat", look: [-1, 0] }, seed: 42 + i })} uid={"q" + i} />)}
      <rect x={700} y={seat - 110} width={340} height={20} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      <Person x={ox} y={y} s={s} look={PEOPLE.oldman} pose={old} uid="o" />
      <rect x={680} y={seat} width={380} height={22} fill="#a07a50" stroke={OL} strokeWidth={5} />
      <rect x={700} y={seat + 22} width={18} height={y - seat - 22} fill="#6a4a30" /><rect x={1020} y={seat + 22} width={18} height={y - seat - 22} fill="#6a4a30" />
      <Person x={wx} y={y} s={s} look={PEOPLE.girl} pose={help} uid="w" />
    </CamG></Svg>
  );
};
// 10. ферма ночью: забор, охранник с фонарём
const Night: Shot = ({ g }) => {
  const s = 0.6, gx = 300 + g * 3.2, gy = 760;
  const pose = walking(g, (g * 3.2) / s, 1, { handR: [120, -250], seed: 50, expr: { mouth: "flat", look: [1, 0] } });
  const h = handW(gx, gy, s, pose, "R");
  return (
    <Svg bg="#101830" night={0.45}><CamG cam={{ s: 1.1, cx: lerp(900, 1100, g / 84), cy: 560 }}>
      <Ground y={620} c="#6a5a3a" sky="#2a3450" />
      <circle cx={1500} cy={180} r={60} fill="#f6efd8" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -300 ${680 + i * 70} L 2300 ${670 + i * 72}`} stroke="#4a6a3a" strokeWidth={22} strokeDasharray="30 22" />)}
      <path d={`M ${h[0] + 20} ${h[1]} L ${h[0] + 560} ${h[1] + 120} L ${h[0] + 520} ${h[1] + 260} Z`} fill="#fff4b0" opacity={0.35} />
      <Person x={gx} y={gy} s={s} look={GUARD} pose={pose} uid="gd" />
      <rect x={h[0] - 10} y={h[1] - 8} width={34} height={16} rx={4} fill="#3a3a40" stroke={OL} strokeWidth={3} />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-300 + i * 120} y={760} width={16} height={240} fill="#7a6a54" stroke={OL} strokeWidth={4} />)}
      {[800, 860, 920].map((y) => <path key={y} d={`M -300 ${y} L 2400 ${y}`} stroke="#9a9aa0" strokeWidth={4} />)}
    </CamG></Svg>
  );
};
// 11. банк закрыт, а у огорода — люди
const Bank: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: 1.1, cx: lerp(600, 1300, ip(g, [10, 75], [0, 1])), cy: 520 }}>
    <Ground y={760} c="#c8bca0" sky="#e8d8b8" />
    <g transform="translate(560 760)">
      <rect x={-380} y={-520} width={760} height={520} fill="#e8dcc0" stroke={OL} strokeWidth={6} /><path d="M -420 -520 L 0 -680 L 420 -520 Z" fill="#d8ccb0" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      {[-300, -150, 150, 300].map((x) => <rect key={x} x={x - 26} y={-480} width={52} height={480} fill="#f2ead6" stroke={OL} strokeWidth={4} />)}
      {txt(0, -560, 64, "#5a4a3a", "BANK")}
      <rect x={-80} y={-260} width={160} height={260} fill="#5a4a3a" stroke={OL} strokeWidth={5} />
      <path d="M -80 -150 L 80 -110 M -80 -110 L 80 -150" stroke="#9aa0a8" strokeWidth={10} /><rect x={-20} y={-150} width={40} height={36} rx={6} fill="#c8a040" stroke={OL} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${-370 + i * 66} 0 l -8 -40 M ${-370 + i * 66} 0 l 10 -34`} stroke="#6a8a4a" strokeWidth={6} />)}
    </g>
    <rect x={1100} y={700} width={900} height={120} fill="#6a4a2e" stroke={OL} strokeWidth={5} />
    {Array.from({ length: 9 }, (_, i) => <g key={i}>{[-1, 0, 1].map((k) => <ellipse key={k} cx={1150 + i * 96 + k * 18} cy={690 - Math.abs(k) * -6} rx={16} ry={22} fill="#5a8a3e" stroke={OL} strokeWidth={3} />)}</g>)}
    <Person x={1520} y={900} s={0.8} look={PEOPLE.oldman} pose={stand(g, { turn: -0.4, handL: [-60, -330], handR: [40, -260], expr: { mouth: "smile", look: [-1, -0.5] }, seed: 60 })} uid="f" />
    <g transform={`translate(${1520 - 60 * 0.8 - 6} ${900 - 330 * 0.8 + 4})`}>{[[-10, 0], [12, 6], [0, 18]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b + 20} rx={16} ry={12} fill="#c8a060" stroke={OL} strokeWidth={3} />)}<path d="M 0 0 L 0 -40" stroke="#5a8a3e" strokeWidth={5} /></g>
  </CamG></Svg>
);
// 12. соседи, которые раньше не здоровались: знакомятся, жмут руки
const Hello: Shot = ({ g }) => {
  const s = 0.85, y = 920;
  const meet = ip(g, [0, 46], [0, 1], (t) => t);
  const ax = lerp(560, 820, meet), bx = lerp(1360, 1100, meet);
  const shake = g > 50 && g < 90 ? Math.sin((g - 50) * 0.7) * 10 : 0;
  const mid: P = [960, y - 270 * s + shake];
  const A = g < 46 ? walking(g, (ax - 560) / s, 1, { seed: 70, expr: { mouth: "smile" } }) : stand(g, { turn: 0.6, handR: [(mid[0] - ax) / s, (mid[1] - y) / s], expr: { mouth: g > 60 ? "grin" : "smile", look: [1, 0] }, seed: 70 });
  const B = g < 46 ? walking(g, (1360 - bx) / s, -1, { seed: 71, expr: { mouth: "smile" } }) : stand(g, { turn: -0.6, handR: [(mid[0] - bx) / s, (mid[1] - y) / s], expr: { mouth: "open", open: talk(g, 2) * 0.5, look: [-1, 0] }, seed: 71 });
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 960, cy: 600 }}>
      <Courtyard />
      <Person x={ax} y={y} s={s} look={HERO} pose={A} uid="a" />
      <Person x={bx} y={y} s={s} look={PEOPLE.man} pose={B} uid="b" />
      {g > 70 ? <g transform="translate(1240 560)" opacity={ip(g, [70, 80], [0, 1])}><rect x={-120} y={-44} width={240} height={70} rx={14} fill="#f6efe2" stroke={OL} strokeWidth={4} />{txt(0, 6, 34, "#3a2a1e", "I'M DAVID.")}</g> : null}
    </CamG></Svg>
  );
};
// 13. длинный стол во дворе: едят вместе
const Table: Shot = ({ g }) => {
  const seats: [number, Look][] = [[340, PEOPLE.oldman], [560, PEOPLE.woman], [780, KID], [1000, HERO], [1220, PEOPLE.man], [1440, PEOPLE.girl], [1660, PEOPLE.barista]];
  const top = 780;
  return (
    <Svg><CamG cam={{ s: lerp(1.35, 1.0, ip(g, [0, 120], [0, 1])), cx: 1000, cy: 620 }}>
      <Courtyard warm={1} />
      {seats.map(([x, lk], i) => {
        const ks = lk === KID ? 0.55 : 0.8, y = top + 150 * ks - 10 + (lk === KID ? 30 : 0);
        const c = (g + i * 23) % 70, eat = c > 20 && c < 50 ? Math.sin(((c - 20) / 30) * Math.PI) : 0;
        const spoon: P = [lerp(30, 20, eat), lerp(-200, -420, eat)];
        const p = sitting(g, { turn: (i - 3) * 0.1, handR: spoon, expr: { mouth: eat > 0.6 ? "o" : (i % 2 ? "smile" : "open"), open: talk(g, i) * 0.3, look: [0, 0.6] }, seed: 80 + i });
        const h = handW(x, y, ks, p, "R");
        return <g key={i}><Person x={x} y={y} s={ks} look={lk} pose={p} uid={"t" + i} /><path d={`M ${h[0]} ${h[1]} L ${h[0] + 10} ${h[1] - 36}`} stroke="#c8ccd2" strokeWidth={7} strokeLinecap="round" /></g>;
      })}
      <rect x={180} y={top} width={1640} height={24} fill="#b08050" stroke={OL} strokeWidth={5} />
      <rect x={200} y={top + 24} width={1600} height={200} fill="#8a6a4a" stroke={OL} strokeWidth={5} />
      {seats.map(([x], i) => <Bowl key={i} x={x + 10} y={top} />)}
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Quiet, 0, T(5.1)], [Windows, T(5.1), T(7.4)], [Leaving, T(7.4), T(12.5)], [Cauldron, T(12.5), T(18.1)], [Peel, T(18.1), T(21.6)],
  [Shrink, T(21.6), T(24.4)], [Belt, T(24.4), T(27.4)], [Clinic, T(27.4), T(32.8)], [Weak, T(32.8), T(35.1)], [Night, T(35.1), T(37.9)],
  [Bank, T(37.9), T(40.5)], [Hello, T(40.5), T(47.4)], [Table, T(47.4), PART6_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part6: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="6 MONTHS LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part6.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx6.wav")} volume={0.3} />
    <FadeOut total={PART6_FRAMES} />
  </AbsoluteFill>
);
export const _u6 = [H];
export const CUTS6 = CUTS.map(([, a, b]) => [a, b]);
