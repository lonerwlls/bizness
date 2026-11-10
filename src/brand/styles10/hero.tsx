// Наш герой, которого можно «перерисовать» в любой технике: те же приметы (белая голова, тёмная шапка с помпоном,
// оранжевая куртка, жёлтый рюкзак, белые кроссовки), но свои линии, заливки и детали под каждый стиль.
import React from "react";

export type HeroPal = { head: string; beanie: string; pom: string; jacket: string; pack: string; limb: string; shoe: string; ink: string; mouth?: string };
export const PAL: HeroPal = { head: "#f8f6f0", beanie: "#2c3552", pom: "#f4f2ec", jacket: "#f27a2a", pack: "#f4c430", limb: "#262838", shoe: "#ffffff", ink: "#16131f", mouth: "#5a1620" };
const D = Math.PI / 180;
const go = (x: number, y: number, a: number, l: number): [number, number] => [x + Math.sin(a * D) * l, y + Math.cos(a * D) * l];

export type HeroProps = {
  x: number; y: number; s?: number; pal?: Partial<HeroPal>; sw?: number; fillOpacity?: number;
  armL?: [number, number]; armR?: [number, number]; legL?: number; legR?: number; lean?: number;
  eyes?: "dot" | "pie" | "none" | "line" | "glow"; mouth?: "smile" | "grin" | "o" | "none"; gloves?: boolean;
  noFill?: boolean; filter?: string; strokeDash?: string; bigShoes?: boolean; sitting?: boolean; pins?: boolean;
};
/** (x, y) — точка между ступнями. Размер головы ~180 при s = 1, рост ~560. */
export const Hero: React.FC<HeroProps> = (p) => {
  const { x, y, s = 1, sw = 7, armL = [14, 8], armR = [14, 8], legL = 4, legR = 4, lean = 0, eyes = "dot", mouth = "smile", gloves, noFill, filter, strokeDash, bigShoes, sitting, pins } = p;
  const C = { ...PAL, ...p.pal };
  const F = (c: string) => (noFill ? "none" : c);
  const st = { stroke: C.ink, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, strokeDasharray: strokeDash };
  const hipY = sitting ? -60 : -168, shY = sitting ? -210 : -318, headY = sitting ? -324 : -432;
  const leg = (side: number, a: number) => {
    const hx = side * 26;
    if (sitting) {
      const [kx, ky] = [hx + side * 10, hipY + 6], [fx, fy] = [kx + side * 4 + 90, ky + 60];
      return <g key={"l" + side}><path d={`M ${hx} ${hipY} L ${kx + 100} ${ky} L ${fx + 10} ${fy}`} fill="none" {...st} stroke={noFill ? C.ink : C.limb} strokeWidth={noFill ? sw : 13} />
        <ellipse cx={fx + 28} cy={fy} rx={bigShoes ? 40 : 24} ry={bigShoes ? 20 : 12} fill={F(C.shoe)} {...st} /></g>;
    }
    const [fx, fy] = go(hx, hipY, side * a, 168);
    return <g key={"l" + side}><path d={`M ${hx} ${hipY} L ${fx} ${fy}`} fill="none" {...st} stroke={noFill ? C.ink : C.limb} strokeWidth={noFill ? sw : 13} />
      <ellipse cx={fx + side * (bigShoes ? 18 : 9)} cy={fy - 2} rx={bigShoes ? 42 : 22} ry={bigShoes ? 22 : 11} fill={F(C.shoe)} {...st} /></g>;
  };
  const arm = (side: number, a: [number, number]) => {
    const [sx, sy] = [side * 58, shY];
    const [ex, ey] = go(sx, sy, side * a[0], 78), [hx, hy] = go(ex, ey, side * (a[0] + a[1]), 72);
    return <g key={"a" + side}><path d={`M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}`} fill="none" {...st} stroke={noFill ? C.ink : C.limb} strokeWidth={noFill ? sw : 12} />
      {gloves ? <path d={`M ${hx - 22} ${hy + 4} Q ${hx - 26} ${hy - 26} ${hx} ${hy - 24} Q ${hx + 28} ${hy - 22} ${hx + 22} ${hy + 6} Q ${hx} ${hy + 22} ${hx - 22} ${hy + 4} Z`} fill={F("#ffffff")} {...st} />
        : <circle cx={hx} cy={hy} r={13} fill={F(C.limb)} {...st} strokeWidth={noFill ? sw : 0} />}</g>;
  };
  const body = `M -62 ${shY - 20} Q -70 ${shY - 30} -50 ${shY - 34} L 50 ${shY - 34} Q 70 ${shY - 30} 64 ${shY - 18} Q 74 ${hipY - 60} 60 ${hipY + 4} Q 0 ${hipY + 26} -60 ${hipY + 4} Q -74 ${hipY - 60} -62 ${shY - 20} Z`;
  const ey = -4, ex = 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter={filter}>
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {leg(-1, legL)}{leg(1, legR)}
        <rect x={-82} y={shY - 24} width={164} height={150} rx={34} fill={F(C.pack)} {...st} />
        <path d={body} fill={F(C.jacket)} {...st} />
        <path d={`M 0 ${shY - 30} L 0 ${hipY + 14}`} {...st} strokeWidth={sw * 0.7} />
        {pins ? [[-48, shY - 8], [48, shY - 8], [-26, hipY], [26, hipY]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={7} fill="#d9b25a" stroke={C.ink} strokeWidth={2} />) : null}
        {arm(-1, armL)}{arm(1, armR)}
        <g transform={`translate(0 ${headY})`}>
          <ellipse cx={0} cy={0} rx={92} ry={86} fill={F(C.head)} {...st} />
          {eyes === "dot" ? [-1, 1].map((k) => <ellipse key={k} cx={k * ex} cy={ey} rx={8} ry={11} fill={C.ink} />) : null}
          {eyes === "line" ? [-1, 1].map((k) => <path key={k} d={`M ${k * ex - 10} ${ey} L ${k * ex + 10} ${ey}`} {...st} />) : null}
          {eyes === "glow" ? [-1, 1].map((k) => <circle key={k} cx={k * ex} cy={ey} r={9} fill="none" {...st} />) : null}
          {eyes === "pie" ? [-1, 1].map((k) => <g key={k}><ellipse cx={k * ex} cy={ey - 4} rx={15} ry={24} fill={C.ink} /><path d={`M ${k * ex} ${ey - 8} L ${k * ex + 15} ${ey - 20} L ${k * ex + 15} ${ey - 2} Z`} fill={C.head} /></g>) : null}
          {mouth === "smile" ? <path d="M -18 32 Q 0 44 18 32" fill="none" {...st} /> : null}
          {mouth === "grin" ? <path d="M -32 26 Q 0 30 32 26 Q 24 62 0 62 Q -24 62 -32 26 Z" fill={F(C.mouth ?? C.ink)} {...st} /> : null}
          {mouth === "o" ? <ellipse cx={0} cy={36} rx={12} ry={16} fill={F(C.mouth ?? C.ink)} {...st} /> : null}
          <path d="M -90 -30 Q -92 -112 0 -116 Q 92 -112 90 -30 Z" fill={F(C.beanie)} {...st} />
          <rect x={-96} y={-50} width={192} height={32} rx={14} fill={F(C.beanie)} {...st} />
          <circle cx={0} cy={-128} r={22} fill={F(C.pom)} {...st} />
        </g>
      </g>
    </g>
  );
};
