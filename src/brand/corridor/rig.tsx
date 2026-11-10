// Персонаж-«кукла» для мультяшной анимации: круглая голова, простое лицо, тонкие руки и ноги с суставами (IK),
// тёмный тёплый контур, мягкая светотень. Все позы задаются точками: ступни, таз, кисти, поворот и наклон головы.
import React from "react";

export type P = [number, number];
export const OL = "#3a2414";
const D = Math.PI / 180;
const shade = (c: string, k: number) => { const n = parseInt(c.slice(1), 16); const ch = (v: number) => Math.round(v * k).toString(16).padStart(2, "0"); return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`; };
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const rot = (p: P, deg: number): P => { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

/** двухзвенная IK: сустав выбирается с той стороны, что лучше подходит под «предпочтение» (prefX, prefY) */
export const ik = (root: P, target: P, l1: number, l2: number, pref: P): { mid: P; end: P } => {
  let dx = target[0] - root[0], dy = target[1] - root[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5, min = Math.abs(l1 - l2) + 1;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) { dx *= min / Math.max(d, 0.001); dy *= min / Math.max(d, 0.001); d = min; }
  const a = Math.atan2(dy, dx), cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), al = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const m1: P = [root[0] + Math.cos(a + al) * l1, root[1] + Math.sin(a + al) * l1];
  const m2: P = [root[0] + Math.cos(a - al) * l1, root[1] + Math.sin(a - al) * l1];
  const score = (m: P) => (m[0] - root[0]) * pref[0] + (m[1] - root[1]) * pref[1];
  return { mid: score(m1) >= score(m2) ? m1 : m2, end: [root[0] + dx, root[1] + dy] };
};

export type Mouth = "smile" | "flat" | "o" | "open" | "wavy" | "grin" | "laugh";
export type Expr = { browH?: number; browA?: number; browSkew?: number; eyes?: "dot" | "wide" | "happy" | "half"; blink?: number; look?: P; mouth?: Mouth; open?: number; sweat?: boolean; blush?: boolean };
export type Look = {
  skin: string; skinDark: string; top: string; topDark: string; pants: string; shoe: string;
  kind: "hero" | "janitor" | "person"; hair?: string; hairStyle?: "short" | "bun" | "long" | "cap" | "bald"; cap?: string; apron?: string;
};
export const HERO: Look = { kind: "hero", skin: "#fbefd6", skinDark: "#e4c79a", top: "#e0793a", topDark: "#b65a26", pants: "#4a3a32", shoe: "#f6efe2" };
export const JANITOR: Look = { kind: "janitor", skin: "#efbd52", skinDark: "#c9952e", top: "#8d7d62", topDark: "#6a5c46", pants: "#4f4436", shoe: "#3a2a1e" };

export type Pose = {
  footL: P; footR: P; hip: P; lean?: number; handL: P; handR: P; turn?: number; tilt?: number; nod?: number; expr: Expr; dir?: number;
};
export type Geo = { shL: P; shR: P; elL: P; elR: P; hL: P; hR: P; hipL: P; hipR: P; knL: P; knR: P; fL: P; fR: P; head: P; neck: P };

export const rigGeo = (p: Pose): Geo => {
  const lean = p.lean ?? 0, dir = p.dir ?? 0;
  const hipL = add(p.hip, [-15, 0]), hipR = add(p.hip, [15, 0]);
  const kpref: P = dir ? [dir, -0.2] : [0, -1];
  const legL = ik(hipL, p.footL, 116, 116, dir ? kpref : [-0.3, -1]), legR = ik(hipR, p.footR, 116, 116, dir ? kpref : [0.3, -1]);
  const shL = add(p.hip, rot([-44, -168], lean)), shR = add(p.hip, rot([44, -168], lean));
  const aL = ik(shL, p.handL, 96, 92, [-1, 0.4]), aR = ik(shR, p.handR, 96, 92, [1, 0.4]);
  const neck = add(p.hip, rot([0, -176], lean));
  const head = add(add(neck, rot([0, -86], lean + (p.tilt ?? 0) * 0.4)), [0, p.nod ?? 0]);
  return { shL, shR, elL: aL.mid, elR: aR.mid, hL: aL.end, hR: aR.end, hipL, hipR, knL: legL.mid, knR: legR.mid, fL: legL.end, fR: legR.end, head, neck };
};

const Limb: React.FC<{ pts: P[]; c: string; w: number }> = ({ pts, c, w }) => {
  const d = `M ${pts[0][0]} ${pts[0][1]} Q ${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}`;
  const d2 = `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d2} stroke={OL} strokeWidth={w + 12} />
      <path d={d2} stroke={c} strokeWidth={w} />
      <path d={d} stroke="rgba(255,255,255,0.12)" strokeWidth={w * 0.3} transform="translate(-3 -2)" />
    </g>
  );
};

const Face: React.FC<{ e: Expr; turn: number; look: Look }> = ({ e, turn, look }) => {
  const fx = turn * 30, sp = 27 * (1 - 0.22 * Math.abs(turn)), ey = -6, blink = e.blink ?? 0;
  const lookP = e.look ?? [turn * 3, 0];
  const browH = e.browH ?? 0, browA = e.browA ?? 0, skew = e.browSkew ?? 0;
  const eyes = blink > 0.5 && e.eyes !== "happy" ? "closed" : e.eyes ?? "dot";
  const eye = (s: number) => {
    const x = fx + s * sp;
    if (eyes === "closed") return <path key={s} d={`M ${x - 10} ${ey} Q ${x} ${ey + 4} ${x + 10} ${ey}`} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (eyes === "happy") return <path key={s} d={`M ${x - 11} ${ey + 3} Q ${x} ${ey - 10} ${x + 11} ${ey + 3}`} stroke={OL} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (eyes === "wide") return <g key={s}><ellipse cx={x} cy={ey} rx={12} ry={14 * (1 - blink * 0.6)} fill="#fffaf0" stroke={OL} strokeWidth={4} /><circle cx={x + lookP[0] * 4} cy={ey + lookP[1] * 4} r={5.5} fill={OL} /></g>;
    const h = eyes === "half" ? 0.55 : 1;
    return <ellipse key={s} cx={x + lookP[0] * 2.5} cy={ey + lookP[1] * 2.5 + (1 - h) * 3} rx={6} ry={9 * h * (1 - blink * 0.7)} fill={OL} />;
  };
  const brow = (s: number) => {
    const x = fx + s * sp, y = ey - 22 - browH * 9 + (s > 0 ? skew : -skew) * 6, a = browA * s;
    return <path key={"b" + s} d={`M ${x - 11} ${y + a * 5} L ${x + 11} ${y - a * 5}`} stroke={OL} strokeWidth={5.5} strokeLinecap="round" />;
  };
  const mx = fx * 1.05, my = 28, op = e.open ?? 0;
  let mouth: React.ReactNode;
  switch (e.mouth ?? "smile") {
    case "flat": mouth = <path d={`M ${mx - 10} ${my} L ${mx + 10} ${my}`} stroke={OL} strokeWidth={5} strokeLinecap="round" />; break;
    case "wavy": mouth = <path d={`M ${mx - 13} ${my} q 4 -4 8 0 t 9 0 t 8 0`} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />; break;
    case "o": mouth = <ellipse cx={mx} cy={my + 2} rx={7 + op * 2} ry={8 + op * 5} fill="#7a2a20" stroke={OL} strokeWidth={4} />; break;
    case "open": mouth = <path d={`M ${mx - 13} ${my - 3} Q ${mx} ${my + 1} ${mx + 13} ${my - 3} Q ${mx + 10} ${my + 4 + op * 16} ${mx} ${my + 5 + op * 16} Q ${mx - 10} ${my + 4 + op * 16} ${mx - 13} ${my - 3} Z`} fill="#7a2a20" stroke={OL} strokeWidth={4} strokeLinejoin="round" />; break;
    case "grin": mouth = <g><path d={`M ${mx - 18} ${my - 4} Q ${mx} ${my} ${mx + 18} ${my - 4} Q ${mx + 14} ${my + 16} ${mx} ${my + 17} Q ${mx - 14} ${my + 16} ${mx - 18} ${my - 4} Z`} fill="#7a2a20" stroke={OL} strokeWidth={4} strokeLinejoin="round" /><path d={`M ${mx - 14} ${my - 2} L ${mx + 14} ${my - 2} L ${mx + 12} ${my + 4} L ${mx - 12} ${my + 4} Z`} fill="#fffaf0" /></g>; break;
    case "laugh": mouth = <g><path d={`M ${mx - 20} ${my - 6} Q ${mx} ${my - 2} ${mx + 20} ${my - 6} Q ${mx + 16} ${my + 18 + op * 8} ${mx} ${my + 20 + op * 8} Q ${mx - 16} ${my + 18 + op * 8} ${mx - 20} ${my - 6} Z`} fill="#7a2a20" stroke={OL} strokeWidth={4} strokeLinejoin="round" /><ellipse cx={mx} cy={my + 12 + op * 5} rx={9} ry={5} fill="#d8706a" /></g>; break;
    default: mouth = <path d={`M ${mx - 12} ${my - 2} Q ${mx} ${my + 9} ${mx + 12} ${my - 2}`} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      {look.kind === "janitor" ? <path d={`M ${mx - 22} ${my - 10} Q ${mx - 10} ${my - 18} ${mx} ${my - 12} Q ${mx + 10} ${my - 18} ${mx + 22} ${my - 10} Q ${mx + 10} ${my - 2} ${mx} ${my - 7} Q ${mx - 10} ${my - 2} ${mx - 22} ${my - 10} Z`} fill="#d8d2c4" stroke={OL} strokeWidth={3.5} /> : null}
      {[-1, 1].map(eye)}{[-1, 1].map(brow)}
      {look.kind === "janitor" ? null : mouth}
      {look.kind === "janitor" ? <g transform={`translate(0 8)`}>{mouth}</g> : null}
      {e.blush ? [-1, 1].map((s) => <ellipse key={"bl" + s} cx={fx + s * (sp + 16)} cy={14} rx={11} ry={6} fill="rgba(230,120,90,0.35)" />) : null}
      {e.sweat ? <path d={`M ${fx + sp + 36} -50 Q ${fx + sp + 48} -30 ${fx + sp + 36} -22 Q ${fx + sp + 24} -30 ${fx + sp + 36} -50 Z`} fill="#bfe4f2" stroke={OL} strokeWidth={3} /> : null}
    </g>
  );
};

const Hair: React.FC<{ look: Look; turn: number }> = ({ look, turn }) => {
  const c = look.hair ?? "#4a2e1e", st = look.hairStyle ?? "short", t = -turn * 6;
  if (st === "bald") return null;
  if (st === "cap") return (
    <g transform={`translate(${t} 0)`}>
      <path d="M -77 -22 Q -80 -98 0 -102 Q 80 -98 77 -22 Q 40 -40 -77 -22 Z" fill={look.cap ?? "#3a6a9a"} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${turn > 0 ? 20 : -110} -30 Q ${turn > 0 ? 70 : -60} -44 ${turn > 0 ? 112 : -20} -26 Q ${turn > 0 ? 70 : -60} -18 ${turn > 0 ? 20 : -110} -30 Z`} fill={look.cap ?? "#3a6a9a"} stroke={OL} strokeWidth={6} />
    </g>
  );
  return (
    <g transform={`translate(${t} 0)`}>
      {st === "long" ? [-1, 1].map((k) => <path key={k} d={`M ${k * 70} -30 Q ${k * 92} 30 ${k * 74} 92 Q ${k * 60} 96 ${k * 56} 70 Q ${k * 66} 20 ${k * 56} -20 Z`} fill={c} stroke={OL} strokeWidth={6} />) : null}
      <path d="M -76 -14 Q -84 -92 0 -96 Q 84 -92 76 -14 Q 50 -52 6 -50 Q -36 -54 -76 -14 Z" fill={c} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      {st === "bun" ? <circle cx={0} cy={-104} r={26} fill={c} stroke={OL} strokeWidth={6} /> : null}
    </g>
  );
};

/** рисует персонажа: (x, y) — точка на полу между ступнями, s — масштаб */
export const Toon: React.FC<{ x: number; y: number; s: number; look: Look; pose: Pose; uid: string; behindArms?: boolean }> = ({ x, y, s, look, pose, uid }) => {
  const g = rigGeo(pose), turn = pose.turn ?? 0, lean = pose.lean ?? 0;
  const sk = `sk${uid}`, tp = `tp${uid}`;
  const torso = (() => {
    const h = pose.hip, tL = g.shL, tR = g.shR;
    const bL = add(h, rot([-56, 26], lean)), bR = add(h, rot([56, 26], lean));
    return `M ${tL[0] - 10} ${tL[1] + 6} Q ${(tL[0] + tR[0]) / 2} ${tL[1] - 14} ${tR[0] + 10} ${tR[1] + 6} Q ${tR[0] + 22} ${(tR[1] + bR[1]) / 2} ${bR[0]} ${bR[1]} Q ${(bL[0] + bR[0]) / 2} ${bR[1] + 10} ${bL[0]} ${bL[1]} Q ${tL[0] - 22} ${(tL[1] + bL[1]) / 2} ${tL[0] - 10} ${tL[1] + 6} Z`;
  })();
  const shoe = (f: P, side: number, far = false) => {
    const d = pose.dir ? pose.dir : side * 0.5;
    return <ellipse cx={f[0] + d * 14} cy={f[1] - 6} rx={26} ry={12} fill={far ? shade(look.shoe, 0.8) : look.shoe} stroke={OL} strokeWidth={6} />;
  };
  const hand = (p: P) => <circle cx={p[0]} cy={p[1]} r={15} fill={look.skin} stroke={OL} strokeWidth={6} />;
  const hc = g.head;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id={sk} cx="38%" cy="32%" r="75%"><stop offset="0%" stopColor={look.skin} /><stop offset="70%" stopColor={look.skin} /><stop offset="100%" stopColor={look.skinDark} /></radialGradient>
        <linearGradient id={tp} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={look.top} /><stop offset="70%" stopColor={look.top} /><stop offset="100%" stopColor={look.topDark} /></linearGradient>
      </defs>
      <ellipse cx={(g.fL[0] + g.fR[0]) / 2} cy={4} rx={95} ry={16} fill="rgba(70,40,15,0.28)" />
      {look.kind === "hero" ? <rect x={pose.hip[0] - 66} y={pose.hip[1] - 168} width={132} height={140} rx={30} fill="#e8b23a" stroke={OL} strokeWidth={7} transform={`rotate(${lean} ${pose.hip[0]} ${pose.hip[1]})`} /> : null}
      {(() => {
        const dir = pose.dir ?? 0, farL = dir > 0, farR = dir < 0;
        const dark = (c: string, far: boolean) => (far ? shade(c, 0.72) : c);
        const legL = <g key="lL"><Limb pts={[g.hipL, g.knL, g.fL]} c={dark(look.pants, farL)} w={22} />{shoe(g.fL, -1, farL)}</g>;
        const legR = <g key="lR"><Limb pts={[g.hipR, g.knR, g.fR]} c={dark(look.pants, farR)} w={22} />{shoe(g.fR, 1, farR)}</g>;
        return farR ? [legR, legL] : [legL, legR];
      })()}
      {pose.dir ? (pose.dir > 0 ? <g><Limb pts={[g.shL, g.elL, g.hL]} c={shade(look.top, 0.75)} w={20} />{hand(g.hL)}</g> : <g><Limb pts={[g.shR, g.elR, g.hR]} c={shade(look.top, 0.75)} w={20} />{hand(g.hR)}</g>) : null}
      <path d={torso} fill={`url(#${tp})`} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      {look.apron ? <path d={`M ${pose.hip[0] - 40} ${pose.hip[1] - 120} L ${pose.hip[0] + 40} ${pose.hip[1] - 120} L ${pose.hip[0] + 50} ${pose.hip[1] + 24} L ${pose.hip[0] - 50} ${pose.hip[1] + 24} Z`} fill={look.apron} stroke={OL} strokeWidth={5} transform={`rotate(${lean} ${pose.hip[0]} ${pose.hip[1]})`} /> : null}
      {look.kind === "hero" ? (
        <g>
          <path d={`M ${g.neck[0]} ${g.neck[1] + 8} L ${pose.hip[0] + lean * 0.4} ${pose.hip[1] + 30}`} stroke={look.topDark} strokeWidth={5} />
          {[-1, 1].map((k) => <path key={k} d={`M ${(k < 0 ? g.shL : g.shR)[0] + k * -8} ${(k < 0 ? g.shL : g.shR)[1] + 4} Q ${(k < 0 ? g.shL : g.shR)[0] + k * -2} ${pose.hip[1] - 80} ${(k < 0 ? g.shL : g.shR)[0] + k * -14} ${pose.hip[1] - 40}`} stroke="#c8941e" strokeWidth={10} fill="none" strokeLinecap="round" />)}
        </g>
      ) : (
        <g>
          <rect x={pose.hip[0] - 46 + lean * 0.5} y={pose.hip[1] - 70} width={92} height={60} rx={8} fill={look.topDark} opacity={0.5} />
          <rect x={pose.hip[0] + 8 + lean * 1.2} y={pose.hip[1] - 140} width={34} height={14} rx={3} fill="#f2ead6" stroke={OL} strokeWidth={3} />
        </g>
      )}
      {pose.dir && pose.dir > 0 ? null : <Limb pts={[g.shL, g.elL, g.hL]} c={look.top} w={20} />}
      {pose.dir && pose.dir < 0 ? null : <Limb pts={[g.shR, g.elR, g.hR]} c={look.top} w={20} />}
      {pose.dir && pose.dir > 0 ? null : hand(g.hL)}{pose.dir && pose.dir < 0 ? null : hand(g.hR)}
      <g transform={`translate(${hc[0]} ${hc[1]}) rotate(${pose.tilt ?? 0})`}>
        {look.kind === "janitor" ? [-1, 1].map((k) => <path key={k} d={`M ${k * 66 - turn * 10} -10 Q ${k * 86 - turn * 10} -24 ${k * 78 - turn * 10} 12 Q ${k * 74} 22 ${k * 64} 16 Z`} fill="#d8d2c4" stroke={OL} strokeWidth={5} />) : null}
        <circle r={76} fill={`url(#${sk})`} stroke={OL} strokeWidth={7.5} />
        <path d={`M ${50} -40 Q 66 -10 56 26`} stroke="rgba(255,255,255,0.35)" strokeWidth={8} fill="none" strokeLinecap="round" transform={`translate(${-turn * 10} 0)`} />
        <Face e={pose.expr} turn={turn} look={look} />
        {look.kind === "hero" ? (
          <g transform={`translate(${-turn * 4} 0)`}>
            <path d="M -76 -26 Q -80 -100 0 -104 Q 80 -100 76 -26 Z" fill="#2f3550" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
            <rect x={-82} y={-44} width={164} height={28} rx={12} fill="#2f3550" stroke={OL} strokeWidth={6.5} />
            {[-50, -25, 0, 25, 50].map((k) => <path key={k} d={`M ${k + turn * 8} -42 L ${k + turn * 8} -18`} stroke="#1c2036" strokeWidth={4} />)}
            <circle cx={-turn * 8} cy={-112} r={19} fill="#f4efe4" stroke={OL} strokeWidth={6} />
          </g>
        ) : look.kind === "person" ? <Hair look={look} turn={turn} /> : (
          <path d={`M ${-turn * 20 - 30} -60 Q ${-turn * 20} -70 ${-turn * 20 + 30} -60`} stroke="rgba(255,255,255,0.4)" strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};

/** ступни и таз при ходьбе: dist — пройденный путь (лок. ед.), dir ±1. Шаг L = 190, опора 60 % цикла. */
export const walk = (dist: number, dir: number) => {
  const L = 250, S = L * 0.6, p = dist / L;
  const foot = (off: number): P => {
    const u = (((p + off) % 1) + 1) % 1;
    if (u < 0.6) return [dir * (S / 2 - (u / 0.6) * S), 0];
    const w = (u - 0.6) / 0.4, e = w * w * (3 - 2 * w);
    return [dir * (-S / 2 + e * S), -Math.sin(Math.PI * w) * 42];
  };
  const fl = foot(0), fr = foot(0.5);
  const bob = 7 * (1 - Math.cos(4 * Math.PI * p)) / 2;
  const sw = Math.sin(2 * Math.PI * p);
  return { footL: [fl[0] - 6, fl[1]] as P, footR: [fr[0] + 6, fr[1]] as P, hip: [0, -226 - bob] as P, swing: sw };
};
