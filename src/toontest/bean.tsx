// Плоский персонаж «как в комиксе»: большая белая голова, толстый тёмный контур, тело-«фасолина»,
// ручки-ножки палочками. Рисуется в SVG поверх 3D-фона. (x, y) — точка между ступнями на земле.
import React from "react";

export type Expr = "neutral" | "smirk" | "laugh" | "shock" | "grin" | "talk" | "sad";
export type BeanLook = { head: string; body: string; body2: string; limb: string; shoe: string; hat?: "beanie" | "bowler" | "none"; hatC?: string; hatC2?: string; pack?: string; hair?: string };
export const HERO2D: BeanLook = { head: "#f8f6f0", body: "#f27a2a", body2: "#c8561a", limb: "#262838", shoe: "#ffffff", hat: "beanie", hatC: "#2c3552", hatC2: "#f0f2f6", pack: "#f4c430" };
export const NEIGHBOR_A: BeanLook = { head: "#f8f6f0", body: "#5fc8b0", body2: "#3a9a86", limb: "#262838", shoe: "#3a2a22", hat: "bowler", hatC: "#3a2a22", hatC2: "#c89a5a" };
export const NEIGHBOR_B: BeanLook = { head: "#f2e2c8", body: "#d84a4a", body2: "#a02e34", limb: "#262838", shoe: "#2a2a30", hair: "#4a2e1e" };

const INK = "#16131f";
const D = Math.PI / 180;
const go = (x: number, y: number, a: number, l: number): [number, number] => [x + Math.sin(a * D) * l, y + Math.cos(a * D) * l];

// лицо: центр головы (0,0), голова rx 92 ry 86
const Face: React.FC<{ expr: Expr; open: number; blink: boolean; sweat?: boolean; noEyes?: boolean; blind?: boolean }> = ({ expr, open, blink, sweat, noEyes, blind }) => {
  const ey = -4, ex = 30;
  const brow = (s: number) => {
    // слепой: брови высоко, «домиком» (внутренние концы выше) — испуг и растерянность
    if (blind) return <path key={"b" + s} d={`M ${s * ex - 16 * s} ${ey - 50} Q ${s * ex} ${ey - 44} ${s * ex + 16 * s} ${ey - 34}`} stroke={INK} strokeWidth={6.5} fill="none" strokeLinecap="round" />;
    const t = expr === "smirk" ? (s < 0 ? -9 : 5) : expr === "shock" ? 7 : expr === "sad" ? -8 : expr === "laugh" || expr === "grin" ? 4 : 0;
    const by = noEyes ? ey - 4 : ey - (expr === "shock" ? 40 : 30); // без глаз брови ниже шапки, под ними гладкое лицо
    return <path key={"b" + s} d={`M ${s * ex - 15} ${by + t * s * -1} Q ${s * ex} ${by - 5} ${s * ex + 15} ${by - t * s * -1}`} stroke={INK} strokeWidth={6.5} fill="none" strokeLinecap="round" />;
  };
  const eye = (s: number) => {
    const x = s * ex;
    // слепой: пустые мутные глаза без зрачков
    if (blind) return <g key={s}><circle cx={x} cy={ey} r={18} fill="#fff" stroke={INK} strokeWidth={5.5} /><circle cx={x} cy={ey + 1} r={9.5} fill="#c4cde0" /><circle cx={x - 5} cy={ey - 5} r={3.5} fill="#fff" /></g>;
    if (expr === "laugh") return <path key={s} d={`M ${x - 13} ${ey + 4} Q ${x} ${ey - 12} ${x + 13} ${ey + 4}`} stroke={INK} strokeWidth={6.5} fill="none" strokeLinecap="round" />;
    if (blink) return <path key={s} d={`M ${x - 12} ${ey} L ${x + 12} ${ey}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />;
    if (expr === "shock") return <g key={s}><circle cx={x} cy={ey} r={17} fill="#fff" stroke={INK} strokeWidth={5.5} /><circle cx={x} cy={ey + 2} r={5.5} fill={INK} /></g>;
    if (expr === "smirk") return <g key={s}><path d={`M ${x - 13} ${ey - 2} L ${x + 13} ${ey - 2}`} stroke={INK} strokeWidth={6} strokeLinecap="round" /><path d={`M ${x - 9} ${ey - 1} Q ${x} ${ey + 13} ${x + 9} ${ey - 1} Z`} fill={INK} /></g>;
    return <ellipse key={s} cx={x} cy={ey} rx={7.5} ry={10} fill={INK} />;
  };
  const my = 34;
  let mouth: React.ReactNode;
  if (expr === "laugh" || expr === "grin") {
    const w = expr === "laugh" ? 30 : 33, h = expr === "laugh" ? 30 + open * 8 : 22;
    mouth = <g><path d={`M ${-w} ${my - 6} Q 0 ${my - 2} ${w} ${my - 6} Q ${w * 0.7} ${my + h} 0 ${my + h} Q ${-w * 0.7} ${my + h} ${-w} ${my - 6} Z`} fill="#5a1620" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      {expr === "laugh" ? <ellipse cx={0} cy={my + h * 0.62} rx={w * 0.42} ry={h * 0.22} fill="#e8667a" /> : <path d={`M ${-w + 6} ${my - 4} L ${w - 6} ${my - 4} L ${w - 9} ${my + 4} L ${-w + 9} ${my + 4} Z`} fill="#fff" />}</g>;
  } else if (expr === "shock") mouth = <ellipse cx={0} cy={my + 4} rx={11} ry={15 + open * 5} fill="#5a1620" stroke={INK} strokeWidth={5.5} />;
  else if (expr === "smirk") mouth = <path d={`M -16 ${my + 2} Q 6 ${my + 10} 22 ${my - 8}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  else if (expr === "sad") mouth = <path d={`M -16 ${my + 8} Q 0 ${my - 4} 16 ${my + 8}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  else if (expr === "talk" && open > 0.1) mouth = <ellipse cx={0} cy={my} rx={15} ry={3 + open * 12} fill="#5a1620" stroke={INK} strokeWidth={5.5} />;
  else mouth = <path d={`M -14 ${my} Q 0 ${my + 6} 14 ${my}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  return (
    <g>
      {noEyes ? null : [-1, 1].map(brow)}{noEyes ? null : [-1, 1].map(eye)}{mouth}
      {sweat ? <path d="M 74 -46 Q 88 -22 74 -14 Q 60 -22 74 -46 Z" fill="#8fd4ff" stroke={INK} strokeWidth={4} /> : null}
    </g>
  );
};

export type BeanPose = { armL?: [number, number]; armR?: [number, number]; legL?: number; legR?: number; lean?: number; bob?: number; tilt?: number };
export const Bean: React.FC<{ x: number; y: number; s?: number; look: BeanLook; expr?: Expr; open?: number; f: number; pose?: BeanPose; sweat?: boolean; flip?: boolean; shadow?: boolean; noEyes?: boolean; blind?: boolean }> = ({ x, y, s = 1, look, expr = "neutral", open = 0, f, pose = {}, sweat, flip, shadow = true, noEyes, blind }) => {
  const { armL = [12, 8], armR = [12, 8], legL = 4, legR = 4, lean = 0, bob = 0, tilt = 0 } = pose;
  const blink = f % 84 < 3;
  const hipY = -168, shY = -318, headY = -432;
  const leg = (side: number, a: number) => {
    const [hx, hy] = [side * 26, hipY];
    const [fx, fy] = go(hx, hy, side * a, 168);
    return <g key={"l" + side}><path d={`M ${hx} ${hy} L ${fx} ${fy}`} stroke={look.limb} strokeWidth={13} strokeLinecap="round" />
      <ellipse cx={fx + side * 9} cy={fy - 2} rx={22} ry={11} fill={look.shoe} stroke={INK} strokeWidth={5} /></g>;
  };
  const arm = (side: number, a: [number, number]) => {
    const [sx, sy] = [side * 58, shY];
    const [ex2, ey2] = go(sx, sy, side * a[0], 78);
    const [hx, hy] = go(ex2, ey2, side * (a[0] + a[1]), 72);
    return <g key={"a" + side}><path d={`M ${sx} ${sy} L ${ex2} ${ey2} L ${hx} ${hy}`} stroke={look.limb} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={hx} cy={hy} r={13} fill={look.limb} /></g>;
  };
  const body = `M -62 ${shY - 20} Q -70 ${shY - 30} -50 ${shY - 34} L 50 ${shY - 34} Q 70 ${shY - 30} 64 ${shY - 18} Q 74 ${hipY - 60} 60 ${hipY + 4} Q 0 ${hipY + 26} -60 ${hipY + 4} Q -74 ${hipY - 60} -62 ${shY - 20} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {shadow ? <ellipse cx={0} cy={4} rx={95} ry={20} fill="rgba(40,30,90,0.35)" filter="url(#beanBlur)" /> : null}
      <g transform={`translate(0 ${-bob}) rotate(${lean} 0 ${hipY})`}>
        {leg(-1, legL)}{leg(1, legR)}
        {look.pack ? <rect x={-82} y={shY - 24} width={164} height={150} rx={34} fill={look.pack} stroke={INK} strokeWidth={7} /> : null}
        <path d={body} fill={look.body} stroke={INK} strokeWidth={7.5} strokeLinejoin="round" />
        <path d={`M 0 ${shY - 30} L 0 ${hipY + 14}`} stroke={look.body2} strokeWidth={6} />
        {look.pack ? [-1, 1].map((k) => <path key={k} d={`M ${k * 38} ${shY - 32} Q ${k * 46} ${shY + 30} ${k * 40} ${shY + 70}`} stroke="#c8961a" strokeWidth={10} fill="none" strokeLinecap="round" />) : null}
        {arm(-1, armL)}{arm(1, armR)}
        <g transform={`translate(0 ${headY}) rotate(${tilt})`}>
          {look.hair ? <path d="M -90 -18 Q -96 -96 0 -98 Q 96 -96 90 -18 Q 40 -60 -90 -18 Z" fill={look.hair} stroke={INK} strokeWidth={7} /> : null}
          <ellipse cx={0} cy={0} rx={92} ry={86} fill={look.head} stroke={INK} strokeWidth={7.5} />
          <Face expr={expr} open={open} blink={blink && !blind} sweat={sweat} noEyes={noEyes} blind={blind} />
          {look.hat === "beanie" ? (
            <g>
              <path d="M -90 -30 Q -92 -112 0 -116 Q 92 -112 90 -30 Z" fill={look.hatC} stroke={INK} strokeWidth={7.5} strokeLinejoin="round" />
              <rect x={-96} y={-50} width={192} height={32} rx={14} fill={look.hatC} stroke={INK} strokeWidth={7} />
              {[-60, -30, 0, 30, 60].map((k) => <path key={k} d={`M ${k} -48 L ${k} -22`} stroke="#1c2238" strokeWidth={4} />)}
              <circle cx={0} cy={-128} r={22} fill={look.hatC2} stroke={INK} strokeWidth={6.5} />
            </g>
          ) : look.hat === "bowler" ? (
            <g>
              <ellipse cx={0} cy={-62} rx={92} ry={14} fill={look.hatC} stroke={INK} strokeWidth={6.5} />
              <path d="M -58 -64 L -54 -122 Q 0 -134 54 -122 L 58 -64 Z" fill={look.hatC} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
              <rect x={-56} y={-86} width={112} height={16} fill={look.hatC2} stroke={INK} strokeWidth={4} />
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};
export const BeanDefs: React.FC = () => <defs><filter id="beanBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter></defs>;
