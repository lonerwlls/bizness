// Часть 10 (≈56 с): «Может ли это случиться на самом деле?» Реальные случаи (Суэц 2021, паника 2020, запреты экспорта 2022), хрупкость системы, что можно сделать, возвращение к холодильнику, призыв подписаться.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Look, Pose, Toon } from "../brand/corridor/rig";
import { CamG, Clock, H, HERO, OL, PEOPLE, Vignette, W, ip, lerp, stand, trackP } from "./common";
import { Aisle, Kitchen, RiceBag, ShipShape } from "./places";
import { handW } from "./part5";
import { heroK } from "./part1";
import { FadeOut, TimeCard } from "./transitions";

type P = [number, number];
export const PART10_FRAMES = 1680;
const V = 60, T = (sec: number) => Math.round(V + sec * 30);
const Person: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string }> = (p) => <Toon {...p} />;
const Svg: React.FC<{ children: React.ReactNode; bg?: string; clock?: boolean }> = ({ children, bg = "#e9d2a6", clock = true }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}<Vignette />{clock ? <Clock label="TODAY" /> : null}</svg></AbsoluteFill>
);
type Shot = React.FC<{ g: number }>;
const txt = (x: number, y: number, size: number, fill: string, t: string, w = 900) => <text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={w} fontSize={size} fill={fill}>{t}</text>;
/** год-плашка в углу кадра реального случая */
const Year: React.FC<{ y: string; g: number }> = ({ y, g }) => (
  <g transform="translate(1700 120)" opacity={ip(g, [4, 14], [0, 1])}><rect x={-130} y={-50} width={260} height={100} rx={14} fill="#f6efe2" stroke={OL} strokeWidth={5} />{txt(0, 22, 64, "#c0302a", y)}</g>
);
const arm = (from: P, to: P, sleeve: string, skin = "#fbefd6") => (
  <g><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={OL} strokeWidth={84} strokeLinecap="round" /><path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={sleeve} strokeWidth={70} strokeLinecap="round" /><circle cx={to[0]} cy={to[1]} r={36} fill={skin} stroke={OL} strokeWidth={5} /></g>
);

// 1. «Так может ли это случиться?» — герой ночью у окна
const Question: Shot = ({ g }) => {
  const s = 1.0, x = 760, y = 1180;
  const hero = stand(g, { turn: 0.6, tilt: 4, handL: [-20, -250], handR: [30, -260], expr: { mouth: "flat", browA: -0.3, browH: 0.3, look: [1, -0.3] }, seed: 1 });
  return (
    <Svg bg="#1a1a2a"><CamG cam={{ s: lerp(1.1, 1.2, g / 189), cx: 960, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#3a3040" />
      <rect x={860} y={140} width={760} height={600} fill="#1e2440" stroke={OL} strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={880 + i * 82} y={420 - (i % 3) * 80} width={70} height={320 + (i % 3) * 80} fill="#2a3050" />)}
      {Array.from({ length: 40 }, (_, i) => <rect key={"w" + i} x={890 + (i * 37) % 700} y={440 - ((i * 53) % 3) * 80 + ((i * 29) % 6) * 40} width={14} height={18} fill="#f6d080" opacity={(i + Math.floor(g / 40)) % 5 === 0 ? 0.2 : 0.9} />)}
      <path d="M 1240 140 L 1240 740 M 860 440 L 1620 440" stroke={OL} strokeWidth={8} />
      <rect x={840} y={740} width={800} height={30} fill="#6a5a4a" stroke={OL} strokeWidth={5} />
      <Person x={x} y={y} s={s} look={HERO} pose={hero} uid="h" />
      <rect width={W} height={H} fill="#5a6aa0" opacity={0.1} />
    </CamG></Svg>
  );
};
// 2. 2021: корабль застрял в Суэцком канале, за ним очередь судов
const Suez: Shot = ({ g }) => (
  <Svg bg="#e8d0a0"><CamG cam={{ s: lerp(1.0, 1.1, g / 198), cx: 960, cy: 560 }}>
    <rect x={-W} width={W * 3} height={H} fill="#e8d0a0" />
    <rect x={-W} y={380} width={W * 3} height={330} fill="#5e8aa0" />
    <path d={`M ${-W} 380 L ${W * 2} 380`} stroke={OL} strokeWidth={6} /><path d={`M ${-W} 710 L ${W * 2} 710`} stroke={OL} strokeWidth={6} />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-200 + i * 90 + Math.sin(g / 20 + i) * 6} ${420 + (i % 6) * 48} q 24 -6 48 0`} stroke="rgba(255,255,255,0.3)" strokeWidth={4} fill="none" />)}
    <g transform="translate(960 545) rotate(-22) scale(0.62)"><ShipShape /></g>
    {[[560, 450], [1360, 650]].map(([tx, ty], i) => /* буксиры — в воде рядом с кораблём, не поверх него */ <g key={i} transform={`translate(${tx + Math.sin(g / 8 + i) * 6} ${ty})`}><path d="M -50 0 L 50 0 L 40 26 L -40 26 Z" fill="#c8402e" stroke={OL} strokeWidth={4} /><rect x={-20} y={-24} width={36} height={24} fill="#f2ead6" stroke={OL} strokeWidth={3} /></g>)}
    {[[230, 500], [60, 640]].map(([sx, sy], i) => <g key={"q" + i} transform={`translate(${sx} ${sy}) scale(0.2)`}><ShipShape /></g>)}
    {[[1700, 640], [1880, 500]].map(([sx, sy], i) => <g key={"r" + i} transform={`translate(${sx} ${sy}) scale(-0.2 0.2)`}><ShipShape /></g>)}
  </CamG><Year y="2021" g={g} /></Svg>
);
// 3. 2020: паника, полки пусты, табличка ограничения
const Panic: Shot = ({ g }) => (
  <Svg><CamG cam={{ s: lerp(1.15, 1.25, g / 186), cx: 960, cy: 520 }}>
    <Aisle fill={0.06} lightsDim={0.2} />
    <g transform="translate(960 300)"><rect x={-220} y={-50} width={440} height={100} rx={8} fill="#fffbe8" stroke={OL} strokeWidth={5} />{txt(0, -6, 34, "#c0302a", "LIMIT 2 PER")}{txt(0, 34, 30, "#3a2a1e", "CUSTOMER")}</g>
  </CamG><Year y="2020" g={g} /></Svg>
);
// 4. 2022: страны останавливают экспорт — рука ставит печать на документ
const Ban: Shot = ({ g }) => {
  const k = ip(g, [40, 50], [0, 1], Easing.in(Easing.quad)), up = ip(g, [60, 76], [0, 1]);
  const stampY = lerp(-120, 520, k) - up * 500;
  return (
    <Svg bg="#3a2a1e"><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#7a5a3a" />
      <g transform="translate(960 560) rotate(-3)"><rect x={-420} y={-300} width={840} height={600} fill="#f6efe2" stroke={OL} strokeWidth={6} />
        {txt(0, -220, 40, "#3a2a1e", "FOOD EXPORTS")}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-360} y={-160 + i * 50} width={i % 3 === 2 ? 420 : 720} height={16} fill="#d8cdb8" />)}
        {g >= 50 ? <g transform="rotate(-12)" opacity={0.9}><rect x={-260} y={-70} width={520} height={140} fill="none" stroke="#c0302a" strokeWidth={14} />{txt(0, 28, 76, "#c0302a", "STOPPED")}</g> : null}
      </g>
      <g transform={`translate(960 ${stampY})`}><rect x={-34} y={-200} width={68} height={130} rx={20} fill="#7a4a2a" stroke={OL} strokeWidth={6} /><rect x={-80} y={-70} width={160} height={70} rx={10} fill="#3a2a22" stroke={OL} strokeWidth={6} /></g>
      {arm([1150, -300], [985, stampY - 160], "#4f6f8f", "#e6b26a")}
    </CamG><Year y="2022" g={g} /></Svg>
  );
};
// 5. в магазине — запас всего на несколько дней: склад за торговым залом почти пуст, отмечены дни до следующей поставки
const FewDays: Shot = ({ g }) => {
  const s = 0.95, x = 990, y = 980; // календарь ниже головы и в пределах вытянутой руки
  const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
  const box = (i: number): P => [1105 + i * 56, 650];
  const mark = (i: number) => ip(g, [20 + i * 18, 30 + i * 18], [0, 1]);
  const cur = Math.max(0, Math.min(2, Math.floor((g - 20) / 18)));
  const tip = (i: number, k: number): P => [box(i)[0] - 18 + 36 * k, box(i)[1] - 18 + 36 * k];
  const handR: P = g < 14 ? trackP(g, [[0, [60, -200]], [14, loc(tip(0, 0))]]) : g < 74 ? loc(tip(cur, mark(cur))) : trackP(g, [[74, loc(tip(2, 1))], [92, [60, -200]]]);
  const pose = stand(g, { turn: 0.5, handR, expr: { mouth: "flat", look: [1, -0.4] }, seed: 2 });
  const h = handW(x, y, s, pose, "R");
  return (
    <Svg><CamG cam={{ s: 1.15, cx: 1000, cy: 560 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8c8a6" />
      <rect x={-W} y={780} width={W * 3} height={H} fill="#b8a888" stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((r) => <rect key={r} x={200} y={360 + r * 140} width={500} height={16} fill="#8a6a4a" stroke={OL} strokeWidth={4} />)}
      {[[260, 360], [330, 500], [560, 640]].map(([bx, by], i) => <rect key={i} x={bx} y={by - 70} width={80} height={70} fill="#c89a5a" stroke={OL} strokeWidth={4} />)}
      <g><rect x={1060} y={570} width={210} height={120} rx={10} fill="#f6efe2" stroke={OL} strokeWidth={5} />{txt(1165, 604, 20, "#3a2a1e", "NEXT DELIVERY")}
        {[0, 1, 2].map((i) => { const c = box(i); const m = mark(i); return <g key={i}><rect x={c[0] - 22} y={c[1] - 22} width={44} height={44} fill="none" stroke={OL} strokeWidth={4} />{txt(c[0], c[1] + 9, 24, "#8a7a6a", `${i + 1}`)}{m > 0 ? <path d={`M ${c[0] - 18} ${c[1] - 18} L ${c[0] - 18 + 36 * m} ${c[1] - 18 + 36 * m}`} stroke="#c0302a" strokeWidth={7} strokeLinecap="round" /> : null}</g>; })}
      </g>
      <Person x={x} y={y} s={s} look={PEOPLE.worker} pose={pose} uid="w" />
      <path d={`M ${h[0]} ${h[1]} L ${h[0] - 4} ${h[1] + 30}`} stroke="#c0302a" strokeWidth={6} strokeLinecap="round" />
    </CamG></Svg>
  );
};
// 6. система работает отлично — пока одно звено не упадёт: домино падает цепочкой
const Domino: Shot = ({ g }) => {
  const labels = ["SHIP", "PORT", "TRUCK", "STORE", "FRIDGE"];
  const push = 80; // перед словом «doesn't», чтобы последняя костяшка успела упасть
  const ang = (i: number) => ip(g, [push + i * 5, push + i * 5 + 8], [0, 62], Easing.in(Easing.quad));
  const finger: P = [lerp(260, 330, ip(g, [push - 12, push], [0, 1])), 520];
  return (
    <Svg bg="#5a3e2a"><CamG cam={{ s: lerp(1.0, 1.1, g / 114), cx: 960, cy: 560 }}>
      <rect width={W} height={H} fill="#8a6440" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M 0 ${i * 150 + 40} L ${W} ${i * 150 + 70}`} stroke="rgba(0,0,0,0.08)" strokeWidth={24} />)}
      {labels.map((l, i) => { const bx = 420 + i * 270; return <g key={l} transform={`translate(${bx} 760) rotate(${ang(i)})`}><rect x={0} y={-340} width={70} height={340} rx={10} fill="#f6efe2" stroke={OL} strokeWidth={6} /><text x={35} y={-170} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={30} fill="#3a2a1e" transform="rotate(-90 35 -170)">{l}</text></g>; })}
      {g < push + 20 ? arm([-200, 700], finger, "#e0793a") : null}
    </CamG></Svg>
  );
};
// 7. что делать: запас дома, вырастить что-то одно, знать соседей
const Do: Shot = ({ g }) => {
  // 7а. ставит бутылки воды на полку
  if (g < 87) {
    const s = 1.0, x = 760, y = 1080, slot: P = [1100, 640];
    const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
    const handR: P = trackP(g, [[0, [80, -260]], [26, loc([slot[0], slot[1] - 50])], [36, loc([slot[0], slot[1] - 50])], [52, [60, -200]]]);
    const pose = stand(g, { turn: 0.6, handR, expr: { mouth: "smile", look: [1, -0.2] }, seed: 3 });
    const h = handW(x, y, s, pose, "R"), placed = g >= 36;
    const Bottle: React.FC<{ p: P }> = ({ p }) => <g transform={`translate(${p[0]} ${p[1]})`}><rect x={-22} y={-90} width={44} height={90} rx={8} fill="#cfe8f4" stroke={OL} strokeWidth={4} /><rect x={-10} y={-104} width={20} height={16} fill="#3a7ad8" stroke={OL} strokeWidth={3} /></g>;
    return (
      <Svg><CamG cam={{ s: 1.3, cx: 1000, cy: 560 }}>
        <rect x={-W} width={W * 3} height={H} fill="#e8cfa0" />
        <rect x={900} y={640} width={600} height={20} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
        {[1170, 1230].map((bx) => <Bottle key={bx} p={[bx, 640]} />)}<RiceBag x={1330} y={640} s={0.9} /><RiceBag x={1420} y={640} s={0.9} />
        <Person x={x} y={y} s={s} look={HERO} pose={pose} uid="h" />
        <Bottle p={placed ? slot : [h[0], h[1] + 50]} />
      </CamG></Svg>
    );
  }
  // 7б. сажает семечко в горшок
  if (g < 132) {
    const f = g - 87, s = 1.0, x = 820, y = 1060, potX = 1040, potY = 760;
    const loc = (p: P): P => [(p[0] - x) / s, (p[1] - y) / s];
    const handR: P = trackP(f, [[0, [60, -180]], [12, loc([potX - 10, potY - 140])], [26, loc([potX, potY - 80])], [36, [60, -190]]]);
    const hero = stand(f, { turn: 0.6, lean: 4, handR, expr: { mouth: "smile", look: [1, 1] }, seed: 4 });
    const h = handW(x, y, s, hero, "R");
    return (
      <Svg><CamG cam={{ s: 1.35, cx: 960, cy: 600 }}>
        <rect x={-W} width={W * 3} height={H} fill="#e8cfa0" />
        <Person x={x} y={y} s={s} look={HERO} pose={hero} uid="h2" />
        <rect x={600} y={potY} width={800} height={30} fill="#a8aeb6" stroke={OL} strokeWidth={5} />
        <path d={`M ${potX - 60} ${potY - 110} L ${potX + 60} ${potY - 110} L ${potX + 44} ${potY} L ${potX - 44} ${potY} Z`} fill="#c8603a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={potX} cy={potY - 112} rx={56} ry={8} fill="#5a3e2a" />
        {f < 26 ? <ellipse cx={h[0] + 6} cy={h[1] + 18} rx={7} ry={5} fill="#e8d8a0" stroke={OL} strokeWidth={2} /> : null}
      </CamG></Svg>
    );
  }
  // 7в. здороваются с соседкой на лестничной площадке
  const f = g - 132, s = 0.85, y = 960;
  const wave = (k: number) => [80 + Math.sin(k * 0.5) * 22, -440] as P;
  const A = stand(f, { turn: 0.6, handR: f > 4 && f < 40 ? wave(f) : [60, -190], expr: { mouth: "smile", look: [1, 0] }, seed: 5 });
  const B = stand(f, { turn: -0.6, handL: f > 10 && f < 44 ? [-80 - Math.sin(f * 0.5) * 22, -440] : [-60, -190], expr: { mouth: "smile", look: [-1, 0] }, seed: 6 });
  return (
    <Svg><CamG cam={{ s: 1.25, cx: 960, cy: 600 }}>
      <rect x={-W} width={W * 3} height={H} fill="#d8c8a6" />
      <rect x={-W} y={800} width={W * 3} height={H} fill="#a8906a" stroke={OL} strokeWidth={5} />
      {[[480, "12"], [1440, "14"]].map(([dx, n]) => <g key={n as string}><rect x={(dx as number) - 130} y={300} width={260} height={500} fill="#7a5a3a" stroke={OL} strokeWidth={6} />{txt(dx as number, 360, 40, "#f2d8a0", n as string)}<circle cx={(dx as number) + 90} cy={560} r={10} fill="#c8a040" stroke={OL} strokeWidth={3} /></g>)}
      <Person x={720} y={y} s={s} look={HERO} pose={A} uid="a" />
      <Person x={1200} y={y} s={s} look={PEOPLE.oldman} pose={B} uid="b" />
    </CamG></Svg>
  );
};
// 8. снова обычный вторник у открытого холодильника — и ты знаешь, как тебе повезло
const Tuesday: Shot = ({ g }) => {
  const close = ip(g, [150, 230], [0, 1]);
  const pose = stand(g, { turn: 0.55, tilt: 2, expr: g > 180 ? { mouth: "smile", eyes: g > 200 && g < 230 ? "happy" : "dot", look: [1, 0.2] } : { mouth: "flat", browSkew: 0.6, look: [1, 0.2] }, seed: 7 });
  const head: P = [heroK.x, heroK.y - 490 * heroK.s];
  return (
    <Svg><CamG cam={{ s: lerp(1.0, 2.4, close), cx: lerp(1150, head[0] + 30, close), cy: lerp(560, head[1] + 40, close) }}>
      <Kitchen open={1} />
      <Person {...heroK} look={HERO} pose={pose} uid="h" />
    </CamG></Svg>
  );
};
// 9. концовка: подпишись и напиши в комментариях
const EndCard: Shot = ({ g }) => {
  const s = 1.0, x = 600, y = 1060;
  const pointK = ip(g, [24, 40], [0, 1]);
  const hero = stand(g, { turn: 0.4, handR: [lerp(60, 190, pointK), lerp(-190, -380, pointK)], expr: { mouth: "smile", look: [1, -0.2] }, seed: 8 });
  const press = g > 46 && g < 56;
  return (
    <Svg bg="#e9d2a6" clock={false}><CamG cam={{ s: 1, cx: 960, cy: 540 }}>
      <rect width={W} height={H} fill="#f0dcb4" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 337) % W} cy={(i * 211) % H} r={60 + (i % 4) * 30} fill="#e8cfa0" opacity={0.6} />)}
      <Person x={x} y={y} s={s} look={HERO} pose={hero} uid="h" />
      <g transform={`translate(1200 420) scale(${press ? 0.95 : 1})`} opacity={ip(g, [4, 16], [0, 1])}>
        <rect x={-260} y={-70} width={520} height={140} rx={30} fill={g > 52 ? "#8a8a8a" : "#d8302a"} stroke={OL} strokeWidth={7} />{txt(0, 22, 62, "#fff", g > 52 ? "SUBSCRIBED" : "SUBSCRIBE")}
      </g>
      <g transform="translate(1200 660)" opacity={ip(g, [60, 74], [0, 1])}>
        <rect x={-330} y={-60} width={660} height={120} rx={24} fill="#fffbe8" stroke={OL} strokeWidth={5} /><path d="M -240 60 L -270 110 L -190 60 Z" fill="#fffbe8" stroke={OL} strokeWidth={5} strokeLinejoin="round" /><rect x={-238} y={52} width={46} height={12} fill="#fffbe8" />
        {txt(0, 16, 40, "#3a2a1e", "What would you do first?", 800)}
      </g>
    </CamG></Svg>
  );
};

const CUTS: [Shot, number, number][] = [
  [Question, 0, T(6.3)], [Suez, T(6.3), T(12.9)], [Panic, T(12.9), T(19.1)], [Ban, T(19.1), T(23.9)], [FewDays, T(23.9), T(27.6)],
  [Domino, T(27.6), T(31.4)], [Do, T(31.4), T(37.4)], [Tuesday, T(37.4), T(46.4)], [EndCard, T(46.4), PART10_FRAMES],
];
const ShotView: React.FC<{ S: Shot }> = ({ S }) => <S g={useCurrentFrame()} />;
export const Part10: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CUTS.map(([S, a, b], i) => <Sequence key={i} from={a} durationInFrames={b - a}><ShotView S={S} /></Sequence>)}
    <TimeCard text="BACK TO TODAY" />
    <Sequence from={V}><Audio src={staticFile("food/part10.mp3")} /></Sequence>
    <Audio src={staticFile("food/sfx10.wav")} volume={0.3} />
    <FadeOut total={PART10_FRAMES} len={30} />
  </AbsoluteFill>
);
export const _u10 = [H];
export const CUTS10 = CUTS.map(([, a, b]) => [a, b]);
