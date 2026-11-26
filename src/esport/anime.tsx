// Аниме-персонаж по образцу ролика пользователя (26.11.2026): плоская заливка + тень (cel-shading),
// тёмный контур, белая светящаяся обводка (rim). Вид спереди, по пояс. Координаты: центр лица = (0,0).
import React from "react";

export type Expr = "neutral" | "sad" | "hurt" | "angry" | "stern" | "laugh" | "shocked" | "focus" | "sneak";
export type Hair = "spiky" | "short" | "long" | "messy";
export type Pose = "down" | "desk" | "cord" | "crossed" | "point" | "belly";

export type Look = {
  skin: string; skinSh: string;
  hair: string; hairSh: string; hairStyle: Hair;
  top: string; topSh: string; hood?: boolean;
  iris: string; adult?: boolean; stubble?: boolean;
};

export const INK = "#1b1222";

type P = {
  look: Look; x: number; y: number; s?: number; t: number;
  expr?: Expr; pose?: Pose; gaze?: [number, number]; tilt?: number; headDown?: number;
  blink?: boolean; rim?: string; rimW?: number; mirror?: boolean; id: string;
  hoodUp?: boolean; phones?: boolean; eyeGlow?: string; cordLift?: number; mouthAmt?: number; side?: number;
};

const sw = 5;

// --- волосы ---
const SPIKY = [
  [-118, 20], [-150, -40], [-128, -72], [-205, -118], [-132, -136], [-172, -212], [-92, -186], [-84, -272], [-30, -204], [8, -292],
  [42, -206], [112, -266], [104, -182], [188, -200], [136, -126], [208, -98], [140, -62], [152, -8], [118, 20],
  [102, -40], [82, -14], [62, -62], [36, -22], [14, -70], [-10, -26], [-32, -72], [-56, -24], [-76, -66], [-96, -16], [-106, -56],
];
const BANGS = [[-96, -128], [96, -128], [102, -40], [82, -14], [62, -62], [36, -22], [14, -70], [-10, -26], [-32, -72], [-56, -24], [-76, -66], [-96, -16], [-106, -56]];
const pts = (a: number[][], k = 1, dy = 0) => a.map(([x, y]) => `${x * k},${(y + dy) * k - dy}`).join(" ");

const HairBack: React.FC<{ look: Look }> = ({ look }) => {
  if (look.hairStyle === "long")
    return (
      <g>
        <path d="M -138,-90 C -150,-210 150,-210 138,-90 C 150,40 160,170 150,250 L 120,230 L 100,262 L 70,236 L -70,236 L -100,262 L -120,230 L -150,250 C -160,170 -150,40 -138,-90 Z" fill={look.hair} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M 60,-120 C 130,-40 140,120 130,240 L 112,236 C 120,120 110,-20 60,-120 Z" fill={look.hairSh} opacity={0.7} />
      </g>
    );
  if (look.hairStyle === "spiky" || look.hairStyle === "messy")
    return <polygon points={pts(SPIKY, 1.07, 100)} fill={look.hairSh} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
  return null;
};

const HairFront: React.FC<{ look: Look; bangsOnly?: boolean }> = ({ look, bangsOnly }) => {
  const st = { stroke: INK, strokeWidth: sw, strokeLinejoin: "round" as const };
  if (bangsOnly) return <polygon points={pts(BANGS)} fill={look.hair} {...st} />;
  if (look.hairStyle === "spiky" || look.hairStyle === "messy")
    return (
      <g>
        <polygon points={pts(SPIKY)} fill={look.hair} {...st} />
        <path d="M 30,-200 L 104,-182 L 136,-126 L 140,-62 L 152,-8 L 118,20 L 102,-40 L 110,-120 Z" fill={look.hairSh} opacity={0.6} />
        <path d="M -70,-160 C -30,-185 30,-185 70,-165 L 62,-150 C 30,-168 -24,-168 -62,-148 Z" fill="#ffffff" opacity={0.22} />
        <path d="M -150,-118 L -100,-110 M -120,-190 L -70,-160 M 0,-250 L 10,-200 M 90,-230 L 70,-180" stroke={look.hairSh} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      </g>
    );
  if (look.hairStyle === "short")
    return (
      <g>
        <path d="M -118,-20 C -130,-150 -60,-190 0,-188 C 70,-190 132,-150 118,-20 L 108,-70 C 80,-100 40,-112 -20,-108 C -60,-104 -95,-90 -108,-60 Z" fill={look.hair} {...st} />
        <path d="M 20,-180 C 60,-178 100,-150 112,-90 L 100,-80 C 90,-130 60,-160 20,-168 Z" fill={look.hairSh} opacity={0.6} />
      </g>
    );
  // long: пробор сбоку, чёлка на одну сторону, лоб открыт
  return (
    <g>
      <path d="M -124,10 C -140,-150 -60,-196 10,-192 C 90,-188 146,-130 124,10 L 112,-60 C 100,-100 70,-118 30,-122 C 0,-90 -50,-70 -104,-66 Z" fill={look.hair} {...st} />
      <path d="M -60,-168 C -20,-184 40,-182 80,-160 L 72,-148 C 30,-168 -20,-170 -52,-156 Z" fill="#fff" opacity={0.22} />
      <path d="M 30,-180 C 20,-140 0,-110 -30,-90 M 70,-170 C 70,-140 60,-120 40,-110" stroke={look.hairSh} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

// --- глаза ---
const Eye: React.FC<{ look: Look; expr: Expr; gaze: [number, number]; open: number; glow?: string; flip?: boolean; cid: string }> = ({ look, expr, gaze, open, glow, flip, cid }) => {
  const white = "M -36,-4 Q -4,-30 36,-12 Q 30,22 0,24 Q -30,20 -36,-4 Z";
  const ir = look.adult ? 16 : 21;
  let o = open;
  if (expr === "laugh") o = Math.min(o, 0.14);
  if (expr === "focus" || expr === "sneak") o *= 0.72;
  if (expr === "stern" || expr === "angry") o *= 0.8;
  if (expr === "shocked") o *= 1.1;
  const [gx, gy] = gaze;
  return (
    <g transform={flip ? "scale(-1,1)" : undefined}>
      <defs><clipPath id={cid}><path d={white} /></clipPath></defs>
      {o > 0.2 ? (
        <g transform={`scale(1,${o})`}>
          <path d={white} fill="#fbf7f2" />
          <g clipPath={`url(#${cid})`}>
            <ellipse cx={(flip ? -gx : gx) * 12 + 2} cy={4 + gy * 8} rx={ir} ry={ir * 1.25} fill={look.iris} stroke={INK} strokeWidth={3} />
            <ellipse cx={(flip ? -gx : gx) * 12 + 2} cy={-6 + gy * 8} rx={ir} ry={ir * 0.55} fill={INK} opacity={0.35} />
            <ellipse cx={(flip ? -gx : gx) * 12 + 2} cy={6 + gy * 8} rx={ir * 0.45} ry={ir * 0.6} fill={INK} />
            {glow ? <ellipse cx={(flip ? -gx : gx) * 12 + 2} cy={14 + gy * 8} rx={ir * 0.8} ry={ir * 0.5} fill={glow} opacity={0.75} /> : null}
            <circle cx={(flip ? -gx : gx) * 12 + 10} cy={-4 + gy * 8} r={ir * 0.32} fill="#fff" />
            <circle cx={(flip ? -gx : gx) * 12 - 6} cy={16 + gy * 8} r={ir * 0.14} fill="#fff" />
            <path d="M -40,-30 Q 0,-30 40,-30 L 40,-2 Q 0,-24 -40,0 Z" fill={INK} opacity={0.18} />
          </g>
          <path d="M -40,-2 Q -4,-34 38,-14 L 46,-20" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -26,20 Q 0,26 26,16" fill="none" stroke={INK} strokeWidth={2.5} opacity={0.7} />
        </g>
      ) : (
        <path d={expr === "laugh" ? "M -34,6 Q 0,-20 34,4" : "M -36,2 Q 0,14 36,0"} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      )}
    </g>
  );
};

const Brow: React.FC<{ expr: Expr; flip?: boolean; look: Look }> = ({ expr, flip, look }) => {
  // внутренний край = x>0 для левого глаза (смотрим на лицо): угол
  const m: Record<Expr, [number, number]> = {
    neutral: [-46, -46], sad: [-40, -60], hurt: [-38, -62], angry: [-56, -32], stern: [-52, -38], laugh: [-56, -52],
    shocked: [-60, -64], focus: [-48, -40], sneak: [-48, -44],
  };
  const [outer, inner] = m[expr];
  const d = `M -38,${outer} Q 0,${(outer + inner) / 2 - 8} 34,${inner}`;
  return <path d={d} transform={flip ? "scale(-1,1)" : undefined} fill="none" stroke={look.hairSh} strokeWidth={9} strokeLinecap="round" />;
};

const Mouth: React.FC<{ expr: Expr; amt: number }> = ({ expr, amt }) => {
  const st = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (expr) {
    case "laugh":
      return (
        <g>
          <path d={`M -34,86 Q 0,${92 + 46 * amt} 34,86 Z`} fill="#6b1d2a" {...st} />
          <path d={`M -16,${100 + 28 * amt} Q 0,${108 + 20 * amt} 16,${100 + 28 * amt} Q 0,${92 + 30 * amt} -16,${100 + 28 * amt}`} fill="#e0707c" />
          <path d="M -28,88 L 28,88 L 24,95 L -24,95 Z" fill="#fff" />
        </g>
      );
    case "shocked":
      return <ellipse cx={0} cy={98} rx={12} ry={10 + 10 * amt} fill="#5a1a26" {...st} />;
    case "angry":
      return (
        <g>
          <path d={`M -30,90 L 30,90 L 26,${102 + 10 * amt} L -26,${102 + 10 * amt} Z`} fill="#fff" {...st} />
          <line x1={-28} y1={96 + 5 * amt} x2={28} y2={96 + 5 * amt} stroke={INK} strokeWidth={2} />
        </g>
      );
    case "sad":
    case "hurt":
      return <path d="M -20,102 Q 0,90 20,102" fill="none" {...st} />;
    case "stern":
      return <path d="M -24,96 L 24,98" fill="none" {...st} />;
    case "focus":
    case "sneak":
      return <path d="M -16,98 Q 0,100 18,96" fill="none" {...st} />;
    default:
      return <path d="M -16,96 Q 0,104 16,96" fill="none" {...st} />;
  }
};

// --- руки ---
const Arm: React.FC<{ pts: number[][]; look: Look; hand?: boolean; fist?: boolean }> = ({ pts, look, hand = true }) => {
  const d = "M " + pts.map((p) => p.join(",")).join(" L ");
  const end = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={98} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={look.top} strokeWidth={88} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={look.topSh} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" transform="translate(18,6)" opacity={0.7} />
      {hand ? (
        <g transform={`translate(${end[0]},${end[1]})`}>
          <ellipse cx={0} cy={22} rx={32} ry={36} fill={look.skin} stroke={INK} strokeWidth={sw} />
          <path d="M -14,30 L -14,48 M 0,32 L 0,52 M 14,30 L 14,48" stroke={look.skinSh} strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

export const AnimeChar: React.FC<P> = (p) => {
  const { look, t } = p;
  const s = p.s ?? 1;
  const expr = p.expr ?? "neutral";
  const pose = p.pose ?? "down";
  const gaze = p.gaze ?? [0, 0];
  const side = p.side ?? 0;
  // моргание
  const bl = (t + (p.id.length * 37) % 90) % 110;
  const open = p.blink === false ? 1 : bl < 3 ? [0.05, 0.1, 0.5][bl] : 1;
  const breath = Math.sin(t / 22) * 0.008;
  const amt = p.mouthAmt ?? (expr === "laugh" ? 0.6 + 0.4 * Math.abs(Math.sin(t / 3)) : 0.6);
  const headY = (p.headDown ?? 0) * 26 + Math.sin(t / 22) * 2;
  const tilt = (p.tilt ?? 0) + (expr === "laugh" ? Math.sin(t / 3) * 2.5 : 0);
  const rim = p.rim ?? "#ffffff";
  const fid = `rim-${p.id}`;
  const cord = p.cordLift ?? 0;

  const shoulderL = [-232, 290], shoulderR = [232, 290];
  let armL: number[][] = [shoulderL, [-262, 560], [-268, 760]];
  let armR: number[][] = [shoulderR, [262, 560], [268, 760]];
  if (pose === "desk") { armL = [shoulderL, [-270, 560], [-150, 690]]; armR = [shoulderR, [270, 560], [150, 690]]; }
  if (pose === "crossed") { armL = [shoulderL, [-250, 540], [90, 520]]; armR = [shoulderR, [250, 500], [-90, 480]]; }
  if (pose === "belly") { armL = [shoulderL, [-262, 520], [-90, 600]]; armR = [shoulderR, [262, 520], [90, 600]]; }
  if (pose === "point") armR = [shoulderR, [330, 470], [430 + 10 * Math.sin(t / 4), 380]];
  if (pose === "cord") armR = [shoulderR, [270, 520 - cord * 60], [150, 420 - cord * 120]];
  const handR = armR[armR.length - 1];

  return (
    <g transform={`translate(${p.x},${p.y}) scale(${(p.mirror ? -1 : 1) * s},${s})`}>
      <defs>
        <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={p.rimW ?? 6} result="d" />
          <feGaussianBlur in="d" stdDeviation={7} result="b" />
          <feFlood floodColor={rim} floodOpacity={0.95} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id={`face-${p.id}`}>
          <path d="M -110,-30 C -112,-120 -60,-165 0,-165 C 60,-165 112,-120 110,-30 L 104,40 C 96,95 50,140 0,152 C -50,140 -96,95 -104,40 Z" />
        </clipPath>
        <clipPath id={`body-${p.id}`}>
          <path d="M -50,170 C -150,185 -232,215 -248,310 L -262,1100 L 262,1100 L 248,310 C 232,215 150,185 50,170 Z" />
        </clipPath>
      </defs>
      <g filter={`url(#${fid})`}>
        {/* тело */}
        <g transform={`translate(0,180) scale(1,${1 + breath}) translate(0,-180)`}>
          {p.hoodUp ? null : <path d="M -120,190 C -150,120 150,120 120,190 L 90,230 L -90,230 Z" fill={look.topSh} stroke={INK} strokeWidth={sw} />}
          <path d="M -50,170 C -150,185 -232,215 -248,310 L -262,1100 L 262,1100 L 248,310 C 232,215 150,185 50,170 Z" fill={look.top} stroke={INK} strokeWidth={sw} />
          <g clipPath={`url(#body-${p.id})`}>
            <path d="M 90,170 C 200,200 250,260 262,400 L 262,1100 L 150,1100 C 170,700 160,400 90,170 Z" fill={look.topSh} opacity={0.85} />
            <path d="M -40,180 L -20,1100" stroke={INK} strokeWidth={3} opacity={0.5} />
            <path d="M -230,320 C -150,300 -100,240 -60,190" stroke="#fff" strokeWidth={6} opacity={0.15} fill="none" />
          </g>
          {look.hood ? (
            <g>
              <path d="M -70,200 L -55,330" stroke="#e9e3da" strokeWidth={6} strokeLinecap="round" />
              <path d="M 50,200 L 40,330" stroke="#e9e3da" strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null}
          <Arm pts={armL} look={look} />
          {pose !== "cord" ? <Arm pts={armR} look={look} /> : null}
        </g>
        {/* шея */}
        <path d="M -40,100 L -42,200 C -20,215 20,215 42,200 L 40,100 Z" fill={look.skin} stroke={INK} strokeWidth={sw} />
        <path d="M -40,120 C -10,165 20,165 40,130 L 40,100 L -40,100 Z" fill={look.skinSh} />
        {/* голова */}
        <g transform={`translate(${side * 14},${headY}) rotate(${tilt})`}>
          {p.hoodUp ? <path d="M -175,40 C -200,-250 200,-250 175,40 L 150,200 L -150,200 Z" fill={look.topSh} stroke={INK} strokeWidth={sw} /> : <HairBack look={look} />}
          <ellipse cx={-108} cy={12} rx={17} ry={28} fill={look.skin} stroke={INK} strokeWidth={sw} />
          <ellipse cx={108} cy={12} rx={17} ry={28} fill={look.skinSh} stroke={INK} strokeWidth={sw} />
          <path d="M -110,-30 C -112,-120 -60,-165 0,-165 C 60,-165 112,-120 110,-30 L 104,40 C 96,95 50,140 0,152 C -50,140 -96,95 -104,40 Z" fill={look.skin} stroke={INK} strokeWidth={sw} />
          <g clipPath={`url(#face-${p.id})`}>
            <path d={`M ${40 + side * 30},-170 C ${120},-60 ${110},60 ${30 + side * 20},170 L 140,170 L 140,-170 Z`} fill={look.skinSh} opacity={0.9} />
            <path d="M -120,-90 L 120,-90 L 120,-40 C 40,-60 -40,-60 -120,-40 Z" fill={look.skinSh} opacity={0.75} />
            {look.stubble ? <path d="M -100,60 C -70,150 70,150 100,60 L 100,170 L -100,170 Z" fill="#5b4a46" opacity={0.25} /> : null}
          </g>
          {/* лицо */}
          <g transform={`translate(${side * 22},0)`}>
            <g transform="translate(-48,6)">
              <Eye look={look} expr={expr} gaze={gaze} open={open} glow={p.eyeGlow} cid={`el-${p.id}`} />
              <Brow expr={expr} look={look} />
            </g>
            <g transform="translate(48,6)">
              <Eye look={look} expr={expr} gaze={gaze} open={open} glow={p.eyeGlow} flip cid={`er-${p.id}`} />
              <Brow expr={expr} look={look} flip />
            </g>
            <path d="M 4,40 L -4,62 L 6,64" fill="none" stroke={look.skinSh} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            {expr === "hurt" || expr === "shocked" ? <path d="M -78,48 L -62,58 M -70,44 L -54,54" stroke="#e07a7a" strokeWidth={3} opacity={0.7} /> : null}
            <Mouth expr={expr} amt={amt} />
          </g>
          {p.hoodUp ? <HairFront look={look} bangsOnly /> : null}
          {p.hoodUp ? <path d="M -140,-40 C -150,-200 150,-200 140,-40 C 120,-120 60,-140 0,-142 C -60,-140 -120,-120 -140,-40 Z" fill={look.top} stroke={INK} strokeWidth={sw} /> : <HairFront look={look} />}
          {p.phones ? (
            <g>
              <path d="M -150,10 C -175,-250 175,-250 150,10" fill="none" stroke={INK} strokeWidth={26} />
              <path d="M -150,10 C -175,-250 175,-250 150,10" fill="none" stroke="#3a3f4f" strokeWidth={16} />
              <rect x={-170} y={-40} width={50} height={100} rx={22} fill="#2a2e3a" stroke={INK} strokeWidth={sw} />
              <rect x={120} y={-40} width={50} height={100} rx={22} fill="#2a2e3a" stroke={INK} strokeWidth={sw} />
              <rect x={-166} y={-20} width={10} height={60} rx={5} fill="#5ee6ff" opacity={0.9} />
              <rect x={156} y={-20} width={10} height={60} rx={5} fill="#5ee6ff" opacity={0.9} />
            </g>
          ) : null}
        </g>
        {pose === "cord" ? (
          <g>
            <Arm pts={armR} look={look} />
            {/* вилка в руке и шнур вниз */}
            <g transform={`translate(${handR[0] - 10},${handR[1] + 6})`}>
              <rect x={-22} y={-40} width={44} height={50} rx={8} fill="#2a2a32" stroke={INK} strokeWidth={4} />
              <rect x={-14} y={-62} width={8} height={24} fill="#c9c9cf" stroke={INK} strokeWidth={3} />
              <rect x={6} y={-62} width={8} height={24} fill="#c9c9cf" stroke={INK} strokeWidth={3} />
            </g>
            <path d={`M ${handR[0] - 10},${handR[1] + 16} C ${handR[0] + 40},${handR[1] + 260} ${handR[0] - 160},${handR[1] + 420} ${handR[0] - 260},${handR[1] + 800}`} fill="none" stroke="#1d1d24" strokeWidth={12} />
          </g>
        ) : null}
      </g>
    </g>
  );
};
