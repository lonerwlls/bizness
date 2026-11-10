// Часть 3 (≈56 с): «Спустя 3 дня». Карточка времени, озвучка с кадра 60.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { Blur, CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, stand, talk, track, trackP, walking } from "./common";
import { Aisle, CafeTable, Kitchen, RiceBag, STREET_Y, Street, aisleFloorY, aisleX, kitFloorY, kitX } from "./places";
import { FadeOut, TimeCard } from "./transitions";

export const PART3_FRAMES = 1700;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string; day?: string }> = ({ children, bg = "#e9d2a6", day = "DAY 4" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette /><Clock label={day} /></svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, anchor: "middle" | "start" = "middle", w = 900) =>
  <text x={x} y={y} textAnchor={anchor} fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;

// 1. газета: SHORTAGE
const Paper: Shot = ({ g }) => {
  const k = ip(g, [0, 20], [0, 1], Easing.out(Easing.back(1.4)));
  return (
    <Svg bg="#3a2a1e"><CamG cam={{ s: lerp(1.0, 1.08, g / 130), cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#4a3424" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M 0 ${i * 100} L ${W} ${i * 100 + 60}`} stroke="rgba(0,0,0,0.12)" strokeWidth={30} />)}
      <g transform={`translate(960 540) rotate(${(1 - k) * 540 - 4}) scale(${k})`}>
        <rect x={-560} y={-380} width={1120} height={760} fill="#f4ecd8" stroke={OL} strokeWidth={8} />
        {txt(0, -290, 46, "#3a2a1e", "THE DAILY HERALD")}
        <path d="M -520 -260 L 520 -260 M -520 -250 L 520 -250" stroke={OL} strokeWidth={4} />
        {txt(0, -110, 170, "#c0302a", "SHORTAGE")}
        {txt(0, -30, 40, "#3a2a1e", "FOOD DELIVERIES STALL WORLDWIDE", "middle", 800)}
        <rect x={-520} y={10} width={500} height={330} fill="#d8c8a6" stroke={OL} strokeWidth={4} />
        {[0, 1, 2].map((r) => <rect key={r} x={-500} y={40 + r * 100} width={460} height={14} fill="#a8987a" />)}
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={20} y={30 + i * 36} width={i % 3 === 2 ? 340 : 500} height={14} fill="#bfb090" />)}
      </g>
    </CamG></Svg>
  );
};
// 2. вирусное видео: счётчик просмотров
const Viral: Shot = ({ g }) => {
  const views = Math.floor(ip(g, [0, 120], [0, 40_000_000], Easing.in(Easing.quad)));
  const man = stand(g, { turn: 0.5, handR: [120, -300], handL: [-40, -260], expr: { mouth: "flat", look: [1, 0.3] }, seed: 1 });
  return (
    <Svg bg="#2a2420"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#e2d0aa" />
      <g transform={`translate(960 ${540 + Math.sin(g / 18) * 4}) rotate(-2)`}>
        <rect x={-300} y={-490} width={600} height={980} rx={60} fill="#1e1e24" stroke={OL} strokeWidth={10} />
        <rect x={-272} y={-460} width={544} height={920} rx={40} fill="#f6efe2" />
        <clipPath id="vid"><rect x={-272} y={-400} width={544} height={420} /></clipPath>
        <g clipPath="url(#vid)">
          <rect x={-272} y={-400} width={544} height={420} fill="#e2d2b0" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-260 + i * 90} y={-390} width={80} height={140} fill={["#d8443a", "#e8b23a", "#5a9a4a"][i % 3]} opacity={0.6} />)}
          <Person x={-60} y={10} s={0.5} look={PEOPLE.man} pose={man} uid="vm" />
          {[0, 1, 2].map((i) => <RiceBag key={i} x={90 + i * 50} y={-120} s={0.7} />)}
          <circle cx={0} cy={-190} r={60} fill="rgba(0,0,0,0.35)" opacity={g < 12 ? 1 : 0} /><path d="M -18 -220 L 26 -190 L -18 -160 Z" fill="#fff" opacity={g < 12 ? 1 : 0} />
        </g>
        {txt(-240, 80, 34, "#2a1e16", "Guy buys ALL the rice 😳", "start", 800)}
        <g transform="translate(-240 150)"><rect width={480} height={84} rx={16} fill="#2a1e16" />{txt(240, 58, 46, "#ffd23c", `${views.toLocaleString("en-US")} views`)}</g>
        {Array.from({ length: 8 }, (_, i) => { const t = (g * 2 + i * 22) % 160; return <path key={i} transform={`translate(${180 - (i % 3) * 40} ${400 - t * 4}) scale(${1 + t / 200})`} d="M 0 8 C -20 -10 -10 -26 0 -14 C 10 -26 20 -10 0 8 Z" fill="#e8504a" opacity={1 - t / 160} />; })}
      </g>
    </CamG></Svg>
  );
};
// 3. люди хватают рис
const Grab: Shot = ({ g }) => {
  const Z = 3.6, s = 0.75;
  const ppl: [number, Look, number][] = [[-1.15, PEOPLE.woman, 0], [1.1, PEOPLE.man, 8]];
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 960, cy: 560 }}>
      <Aisle fill={0.4} />
      {ppl.map(([X, lk, d], i) => {
        const side = X < 0 ? -1 : 1, shelfX = aisleX(side * 1.6, Z), x = aisleX(X, Z), y = aisleFloorY(Z);
        const reachL = ((shelfX - x) / s) * 0.9;
        const ph = ((g + d) % 40) / 40, out = ph < 0.5 ? ph * 2 : 2 - ph * 2;
        const h: [number, number] = [lerp(side * 60, reachL, out), lerp(-200, -300, out)];
        const pose = stand(g + d, { turn: side * 0.7, lean: side * 6 * out, handR: side > 0 ? h : [70, -230], handL: side < 0 ? h : [-70, -230], expr: { mouth: "flat", browA: 0.5, look: [side, 0] }, seed: 2 + i });
        return <g key={i}><Person x={x} y={y} s={s} look={lk} pose={pose} uid={"g" + i} />{out < 0.4 ? <RiceBag x={x + (side > 0 ? 70 : -70) * s} y={y - 200 * s} s={0.5} /> : null}</g>;
      })}
    </CamG></Svg>
  );
};
// 4. герой идёт мимо полупустых полок
const HalfEmpty: Shot = ({ g }) => {
  const Z = 3.5, s = 0.75 * (3.6 / Z), x0 = aisleX(-0.9, Z), x = lerp(x0, aisleX(0.6, Z), ip(g, [0, 110], [0, 1], (t) => t));
  const pose = g < 110 ? walking(g, (x - x0) / s, 1, { handL: [-40, -240], turn: 0.2, expr: { browA: 0.5, mouth: "flat", look: [-0.8, -0.3] }, seed: 6 })
    : stand(g, { turn: 0.6, handL: [-40, -240], expr: { browH: 0.6, mouth: "wavy", look: [1, -0.2] }, seed: 6 });
  return (
    <Svg><CamG cam={{ s: lerp(1.15, 1.25, g / 123), cx: 960, cy: 560 }}>
      <Aisle fill={0.35} />
      <Person x={x} y={aisleFloorY(Z)} s={s} look={HERO} pose={pose} uid="h" />
      <g transform={`translate(${x - 40 * s} ${aisleFloorY(Z) - 240 * s})`}><path d="M -60 0 L 60 0 L 50 70 L -50 70 Z" fill="#d8443a" stroke={OL} strokeWidth={4} /><path d="M -40 0 Q 0 -60 40 0" stroke={OL} strokeWidth={5} fill="none" /></g>
    </CamG></Svg>
  );
};
// 5–6. к 9 — нет хлеба, к 10 — нет яиц
const WallClock: React.FC<{ x: number; y: number; h: number; m?: number }> = ({ x, y, h, m = 0 }) => (
  <g transform={`translate(${x} ${y})`}><circle r={70} fill="#f6efe2" stroke={OL} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-3} y={-60} width={6} height={12} fill={OL} transform={`rotate(${i * 30})`} />)}
    <rect x={-4} y={-40} width={8} height={42} rx={4} fill={OL} transform={`rotate(${h * 30 + m / 2})`} /><rect x={-3} y={-56} width={6} height={58} rx={3} fill="#c0302a" transform={`rotate(${m * 6})`} /></g>
);
const BreadGone: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: 2.2, cx: 1040, cy: 560 }}>
    <Street stock={0.12} />
    <WallClock x={1210} y={380} h={9} m={ip(g, [0, 45], [0, 3])} />
    <g transform="translate(1040 520) rotate(-6)"><rect x={-110} y={-40} width={220} height={80} fill="#fbf6e8" stroke={OL} strokeWidth={5} />{txt(0, 18, 46, "#c0302a", "SOLD OUT")}</g>
  </CamG></Svg>
);
const EggsGone: Shot = ({ g }) => (
  <Svg bg="#d0b88e"><CamG cam={{ s: lerp(1.0, 1.06, g / 48), cx: 960, cy: 540 }}>
    <rect width={W} height={H} fill="#d6e6ee" />
    {[300, 640, 980].map((y, r) => <g key={y}><rect x={0} y={y} width={W} height={34} fill="#b8c8d4" stroke={OL} strokeWidth={5} />
      {r === 0 ? Array.from({ length: 2 }, (_, i) => <g key={i} transform={`translate(${200 + i * 260} ${y - 70})`}><rect x={-100} y={0} width={200} height={70} fill="#c8b48a" stroke={OL} strokeWidth={4} />{Array.from({ length: 5 }, (_, k) => <circle key={k} cx={-80 + k * 40} cy={14} r={16} fill="#fbf2e0" stroke={OL} strokeWidth={3} />)}</g>) : null}</g>)}
    <WallClock x={1500} y={170} h={10} m={ip(g, [0, 48], [0, 2])} />
    <g transform="translate(1100 560) rotate(4)"><rect x={-150} y={-46} width={300} height={92} fill="#fbf6e8" stroke={OL} strokeWidth={5} />{txt(0, 20, 48, "#c0302a", "NO EGGS")}</g>
  </CamG></Svg>
);
// 7. объявление на двери
const LimitSign: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: lerp(2.4, 2.55, g / 96), cx: 1640, cy: 600 }}>
    <Street stock={0.3} />
    <g transform={`translate(1635 640) rotate(${-2 + Math.sin(g / 18)})`}>
      <rect x={-130} y={-110} width={260} height={220} fill="#fbf6e8" stroke={OL} strokeWidth={5} />
      {txt(0, -55, 34, "#c0302a", "LIMIT")}{txt(0, 5, 62, "#c0302a", "2")}{txt(0, 50, 24, "#3a2a1e", "ITEMS PER")}{txt(0, 80, 24, "#3a2a1e", "CUSTOMER")}
    </g>
  </CamG></Svg>
);
// 8. очередь до открытия
const Queue: Shot = ({ g }) => {
  const looks = [PEOPLE.oldman, PEOPLE.woman, PEOPLE.man, PEOPLE.girl, PEOPLE.worker, PEOPLE.woman, PEOPLE.man, PEOPLE.oldman];
  return (
    <Svg><CamG cam={{ s: 1.1, cx: lerp(1400, 1250, g / 93), cy: 560 }}>
      <Street stock={0.3} />
      {looks.map((lk, i) => {
        const x = 1600 - i * 150, act = (g + i * 17) % 90;
        const pose = stand(g, { turn: 0.7, seed: 10 + i, handL: i % 3 === 0 && act < 30 ? [10, -300] : [-60, -172], nod: i % 3 === 0 && act < 30 ? 12 : 0,
          handR: i % 4 === 1 ? [60, -460] : [60, -172], expr: { mouth: i % 2 ? "flat" : "wavy", browA: 0.4, look: [1, 0] } });
        return <Person key={i} x={x} y={STREET_Y + (i % 2) * 14} s={0.72} look={lk} pose={pose} uid={"q" + i} />;
      })}
    </CamG></Svg>
  );
};
// 9. кафе закрывается навсегда
const CafeClose: Shot = ({ g }) => {
  const s = 0.75, later = g >= 72;
  if (!later) {
    const flip = ip(g, [10, 22], [0, 1]);
    const bar = g < 30 ? stand(g, { turn: -0.4, handR: [-30, -400], expr: { mouth: "flat", browA: -0.5, browH: 0.5 }, seed: 20 })
      : walking(g, (g - 30) * 9, 1, { expr: { mouth: "flat", browA: -0.5 }, seed: 20 });
    const bx = g < 30 ? 430 : 430 + (g - 30) * 6.75;
    return (
      <Svg><CamG cam={{ s: 1.5, cx: 420, cy: 600 }}>
        <Street stock={0.12} />
        <CafeTable x={150} /><CafeTable x={640} />
        <g transform={`translate(380 520) scale(${Math.cos((1 - flip) * Math.PI)} 1)`}><rect x={-46} y={-26} width={92} height={52} rx={6} fill="#f6efe2" stroke={OL} strokeWidth={4} />{txt(0, 10, 24, flip > 0.5 ? "#c0302a" : "#3a7a4a", flip > 0.5 ? "CLOSED" : "OPEN")}</g>
        <Person x={bx} y={STREET_Y} s={s} look={PEOPLE.barista} pose={bar} uid="b" />
      </CamG></Svg>
    );
  }
  const gg = g - 72;
  return (
    <Svg day="DAY 5"><CamG cam={{ s: lerp(1.5, 1.6, gg / 132), cx: 400, cy: 600 }}>
      <Street stock={0.05} closedCafe />
      {[150, 640].map((x) => <g key={x}><CafeTable x={x} /><path d={`M ${x - 40} ${STREET_Y - 150} L ${x - 40} ${STREET_Y - 260} L ${x + 30} ${STREET_Y - 260} L ${x + 30} ${STREET_Y - 150}`} stroke="#4a4038" strokeWidth={8} fill="none" /></g>)}
      <g transform="translate(560 540) rotate(3)"><rect x={-110} y={-70} width={220} height={140} fill="#fbf6e8" stroke={OL} strokeWidth={4} />{txt(0, -20, 28, "#3a2a1e", "CLOSED UNTIL")}{txt(0, 22, 28, "#3a2a1e", "FURTHER")}{txt(0, 58, 28, "#3a2a1e", "NOTICE")}</g>
      <rect x={0} y={0} width={760} height={STREET_Y} fill="rgba(40,24,12,0.18)" />
    </CamG></Svg>
  );
};
// 10. карта мира: красный растекается
const LAND: [number, number, number, number][] = [[380, 330, 260, 150], [430, 560, 120, 200], [880, 300, 150, 110], [930, 520, 150, 210], [1250, 320, 330, 170], [1320, 520, 90, 80], [1520, 660, 150, 90], [1100, 420, 80, 60]];
const WorldMap: Shot = ({ g }) => (
  <Svg bg="#2e5470"><CamG cam={{ s: lerp(1.0, 1.08, g / 195), cx: 960, cy: 520 }}>
    <rect width={W} height={H} fill="#3e6a86" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M 0 ${120 + i * 100} L ${W} ${120 + i * 100}`} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />)}
    {LAND.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#e2c896" stroke={OL} strokeWidth={5} transform={`rotate(${(i * 23) % 30 - 15} ${x} ${y})`} />)}
    {Array.from({ length: 34 }, (_, i) => {
      const L = LAND[i % LAND.length], a = i * 2.3, r = 0.55 * ((i * 37) % 100) / 100;
      const x = L[0] + Math.cos(a) * L[2] * r, y = L[1] + Math.sin(a) * L[3] * r, start = 10 + i * 4.5;
      const k = Math.max(0, Math.min(1, (g - start) / 10));
      return k > 0 ? <g key={i}><circle cx={x} cy={y} r={14 * k} fill="#d8443a" stroke={OL} strokeWidth={3} /><circle cx={x} cy={y} r={14 + ((g - start) % 40)} fill="none" stroke="#d8443a" strokeWidth={3} opacity={Math.max(0, 0.6 - ((g - start) % 40) / 70)} /></g> : null;
    })}
    <g transform="translate(1560 120)"><rect width={300} height={120} rx={12} fill="rgba(30,20,12,0.75)" stroke="#e8c88a" strokeWidth={3} />{txt(150, 52, 30, "#f6e6c4", "COUNTRIES HIT")}{txt(150, 100, 44, "#ff7a5a", String(Math.floor(ip(g, [10, 170], [12, 96]))))}</g>
  </CamG></Svg>
);
// 11. пресс-конференция и печать «экспорт приостановлен»
const Press: Shot = ({ g }) => {
  const stampT = g - 110;
  const off = stand(g, { turn: 0, handL: [-110, -300], handR: [110 + Math.sin(g / 6) * 14, -310], expr: { mouth: "open", open: talk(g, 3), browA: 0.6, browH: 0.2 }, seed: 30 });
  if (stampT < 0) return (
    <Svg bg="#3a3a4a"><CamG cam={{ s: lerp(1.3, 1.4, g / 110), cx: 960, cy: 560 }}>
      <rect width={W} height={H} fill="#5a6a8a" />
      <rect x={300} y={120} width={1320} height={560} fill="#46567a" stroke={OL} strokeWidth={6} />
      {[560, 1360].map((x, i) => <g key={x}><rect x={x} y={180} width={10} height={560} fill="#c8b48a" /><path d={`M ${x + 10} 190 Q ${x + 110} ${200 + Math.sin(g / 10 + i) * 14} ${x + 160} 200 L ${x + 160} 320 Q ${x + 100} ${310 + Math.sin(g / 10 + i) * 14} ${x + 10} 300 Z`} fill={i ? "#d8443a" : "#2e6a9a"} stroke={OL} strokeWidth={4} /></g>)}
      <Person x={960} y={1000} s={1.0} look={PEOPLE.oldman} pose={off} uid="of" />
      <path d="M 760 720 L 1160 720 L 1120 1080 L 800 1080 Z" fill="#6a4a30" stroke={OL} strokeWidth={6} />
      <circle cx={960} cy={840} r={50} fill="#e8c060" stroke={OL} strokeWidth={5} />
      {[880, 960, 1040].map((x, i) => <g key={x}><path d={`M ${x} 720 L ${x + (i - 1) * 10} 640`} stroke={OL} strokeWidth={6} /><rect x={x + (i - 1) * 10 - 14} y={610} width={28} height={40} rx={10} fill="#3a3a44" stroke={OL} strokeWidth={4} /></g>)}
      {Array.from({ length: 5 }, (_, i) => (Math.floor(g / 7 + i * 3) % 9 === 0 ? <circle key={i} cx={200 + i * 380} cy={900} r={60} fill="rgba(255,255,255,0.7)" /> : null))}
    </CamG></Svg>
  );
  const k = ip(stampT, [0, 8], [0, 1], Easing.in(Easing.quad));
  return (
    <Svg bg="#3a2a1e"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#7a5a3a" />
      <g transform="translate(960 560) rotate(-3)"><rect x={-420} y={-300} width={840} height={600} fill="#f6efe2" stroke={OL} strokeWidth={6} />
        {txt(0, -220, 40, "#3a2a1e", "GOVERNMENT ORDER")}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-360} y={-160 + i * 50} width={i % 3 === 2 ? 420 : 720} height={16} fill="#d8cdb8" />)}
        {stampT > 8 ? <g transform="rotate(-12)" opacity={0.9}><rect x={-330} y={-70} width={660} height={140} fill="none" stroke="#c0302a" strokeWidth={14} />{txt(0, 28, 76, "#c0302a", "EXPORTS SUSPENDED")}</g> : null}
      </g>
      <g transform={`translate(960 ${lerp(-300, 470, k)})`}>
        <rect x={-50} y={-260} width={100} height={170} rx={30} fill="#7a4a2a" stroke={OL} strokeWidth={6} />
        <rect x={-160} y={-90} width={320} height={90} rx={10} fill="#3a2a22" stroke={OL} strokeWidth={6} />
      </g>
    </CamG></Svg>
  );
};
// 12. вечер дома: шкафчик, начинает считать
const Cupboard: Shot = ({ g }) => {
  const Z = 3.0, X = -0.4, s = 0.75 * (3.6 / Z), x = kitX(X, Z), y = kitFloorY(Z);
  if (g < 70) {
    const pose = g < 40 ? walking(g, g * 9, 1, { handR: [80, -250], seed: 40, expr: { mouth: "flat", browA: 0.5 } }) : stand(g, { turn: -0.3, handR: trackP(g, [[40, [80, -250]], [55, [-150, -300]], [70, [-80, -200]]]), seed: 40, expr: { mouth: "flat", browA: 0.5 } });
    const hx = g < 40 ? x - 300 + g * 7 : x;
    return (
      <Svg><CamG cam={{ s: 1.3, cx: x - 80, cy: y - 260 }}>
        <Kitchen open={0} />
        <Person x={hx} y={y} s={s} look={HERO} pose={pose} uid="hc" />
        {g < 55 ? <g transform={`translate(${hx + 80 * s} ${y - 250 * s})`}><path d="M -50 0 L 50 0 L 44 100 L -44 100 Z" fill="#d8c08a" stroke={OL} strokeWidth={4} /><RiceBag x={-10} y={10} s={0.4} /></g> : <g transform={`translate(${kitX(-1.6, 2.85)} ${kitFloorY(2.85) - 230})`}><path d="M -50 0 L 50 0 L 44 100 L -44 100 Z" fill="#d8c08a" stroke={OL} strokeWidth={4} /><RiceBag x={-10} y={10} s={0.4} /></g>}
        <rect x={0} y={0} width={W * 2} height={H} fill="rgba(30,20,60,0.25)" transform="translate(-500 -200)" />
      </CamG></Svg>
    );
  }
  const gg = g - 70, count = Math.min(3, Math.floor(gg / 22));
  const pose = stand(gg, { turn: 0.4, handR: count < 3 ? [130 + count * 30, -330] : [60, -180], handL: [-60, -180], expr: { mouth: count < 3 ? "open" : "flat", open: count < 3 ? 0.4 + 0.3 * Math.sin(gg / 3) : 0, browA: 0.6, browH: 0.4, look: [1, 0] }, seed: 41 });
  return (
    <Svg><CamG cam={{ s: lerp(1.6, 1.72, gg / 150), cx: 880, cy: 640 }}>
      <rect width={W} height={H} fill="#e3c896" />
      <g transform="translate(760 330)">
        <rect x={0} y={0} width={420} height={480} fill="#9ab8a0" stroke={OL} strokeWidth={6} />
        <rect x={20} y={20} width={380} height={440} fill="#f2e2c0" stroke={OL} strokeWidth={4} />
        {[160, 300].map((yy) => <rect key={yy} x={20} y={yy} width={380} height={16} fill="#c8a878" stroke={OL} strokeWidth={3} />)}
        {[[60, 160], [120, 160], [80, 300]].map(([cx, cy], i) => <g key={i}><rect x={cx - 24} y={cy - 70} width={48} height={70} rx={6} fill={["#d8443a", "#e8b23a", "#5a9a4a"][i]} stroke={OL} strokeWidth={4} /><rect x={cx - 24} y={cy - 46} width={48} height={18} fill="#f6efe2" /></g>)}
        {Array.from({ length: count }, (_, i) => <text key={i} x={[60, 120, 80][i]} y={[70, 70, 210][i]} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={34} fill={OL}>{i + 1}</text>)}
        <path d="M 400 0 L 520 -30 L 520 520 L 400 480 Z" fill="#8aab94" stroke={OL} strokeWidth={6} />
      </g>
      <Person x={560} y={1060} s={1.0} look={HERO} pose={pose} uid="hk" />
      <rect width={W} height={H} fill="rgba(30,20,60,0.22)" />
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Paper, 0, T(4.4)], [Viral, T(4.4), T(9.3)], [Grab, T(9.3), T(12.1)], [HalfEmpty, T(12.1), T(16.2)], [BreadGone, T(16.2), T(17.7)],
  [EggsGone, T(17.7), T(19.3)], [LimitSign, T(19.3), T(22.5)], [Queue, T(22.5), T(25.6)], [CafeClose, T(25.6), T(32.4)], [WorldMap, T(32.4), T(38.9)],
  [Press, T(38.9), T(45.2)], [Cupboard, T(45.2), PART3_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part3: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="3 DAYS LATER" />
    <Sequence from={V}><Audio src={staticFile("food/part3.mp3")} /></Sequence>
    <FadeOut total={PART3_FRAMES} />
  </AbsoluteFill>
);
export const _u3 = [Blur, track, H];
