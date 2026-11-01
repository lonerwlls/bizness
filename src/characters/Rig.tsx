// Плоские персонажи-«куклы» в стиле анимационных историй (без контуров, мягкие цвета).
// Главный герой канала — MASCOT (оранжевая куртка, тёмная шапка). Остальные — просто другие LOOK.
// Персонаж рисуется в SVG: <Person x y s pose look .../>. Позу задают углы (0° = вниз, 90° = вперёд),
// а ступни и кисти можно «прибить» к точкам (feet / hands) — тогда колени и локти считаются сами (IK).
import React from "react";

export type V = [number, number];
export const D = Math.PI / 180;
export const go = (p: V, a: number, l: number): V => [p[0] + l * Math.sin(a * D), p[1] + l * Math.cos(a * D)];
export const ang = (a: V, b: V) => Math.atan2(b[0] - a[0], b[1] - a[1]) / D;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export const BODY = { torso: 112, ua: 54, fa: 52, th: 74, sh: 72, head: 31 };

// двухзвенная IK: от корня к цели, bend=+1 сгиб «вперёд» (колено), -1 «назад/вниз» (локоть)
export const ik = (root: V, target: V, l1: number, l2: number, bend: number): V => {
  let d = Math.hypot(target[0] - root[0], target[1] - root[1]);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.01);
  const b = ang(root, target);
  const c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const al = Math.acos(Math.max(-1, Math.min(1, c))) / D;
  const a1 = b + bend * al;
  const mid = go(root, a1, l1);
  return [a1, ang(mid, target)];
};

export type Pose = { lean: number; head?: number; aL: V; aR: V; lL: V; lR: V };
export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t), head: lerp(a.head ?? 0, b.head ?? 0, t),
  aL: lerpV(a.aL, b.aL, t), aR: lerpV(a.aR, b.aR, t), lL: lerpV(a.lL, b.lL, t), lR: lerpV(a.lR, b.lR, t),
});
// ключевые позы по кадрам, плавно (smoothstep)
export const poseAt = <T,>(f: number, keys: [number, T][], mix: (a: T, b: T, t: number) => T): T => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0] = keys[i], [f1, p1] = keys[i + 1];
    if (f < f1) {
      let t = (f - f0) / (f1 - f0);
      t = t * t * (3 - 2 * t);
      return mix(p0, p1, t);
    }
  }
  return keys[keys.length - 1][1];
};
export const numAt = (f: number, keys: [number, number][]) => poseAt(f, keys, lerp);
export const vAt = (f: number, keys: [number, V][]) => poseAt(f, keys, lerpV);

export const STAND: Pose = { lean: 0, aL: [-8, -4], aR: [8, 4], lL: [-5, -2], lR: [5, 2] };

// шаг: где стоит ступня (в координатах «земли»), если таз в точке xh. S — длина двойного шага.
export const stepFoot = (xh: number, S: number, off: number, ground: (x: number) => number, lift = 26): V => {
  const u = xh / S - off;
  const k = Math.floor(u), fr = u - k;
  const plant = (n: number) => (n + 0.25 + off) * S;
  if (fr < 0.5) {
    const x = plant(k);
    return [x, ground(x)];
  }
  let t = (fr - 0.5) / 0.5;
  t = t * t * (3 - 2 * t);
  const x = lerp(plant(k), plant(k + 1), t);
  return [x, lerp(ground(plant(k)), ground(plant(k + 1)), t) - lift * Math.sin(Math.PI * t)];
};

// ---------- внешность ----------
export type Look = {
  skin: string; top: string; pants: string; shoes: string; hair: string;
  hairStyle: "messy" | "blond" | "short" | "none";
  hat?: "beanie" | "cap" | "police";
  hatColor?: string; hatColor2?: string; neck?: string; slim?: number; belt?: string; badge?: boolean; zip?: string;
};
export const MASCOT: Look = { skin: "#e8c2a0", top: "#e47a3c", pants: "#26304a", shoes: "#eef1f6", hair: "#5a3a28", hairStyle: "messy", hat: "beanie", hatColor: "#2f3d63", hatColor2: "#e8edf5", zip: "#c5612b" };
export const PETIT: Look = { skin: "#ecc9a6", top: "#1d1d26", pants: "#1d1d26", shoes: "#0f0f14", hair: "#e3bf78", hairStyle: "blond", neck: "#1d1d26", slim: 0.86 };
export const FRIEND1: Look = { skin: "#dcb08a", top: "#9a6440", pants: "#2d3346", shoes: "#3a2a20", hair: "#3a2a20", hairStyle: "short", hat: "cap", hatColor: "#b8453a" };
export const FRIEND2: Look = { skin: "#e3bd98", top: "#4f7d63", pants: "#30364a", shoes: "#22252f", hair: "#1e1a1a", hairStyle: "short" };
export const COP: Look = { skin: "#e0b996", top: "#34497f", pants: "#222f55", shoes: "#141826", hair: "#3a2a1e", hairStyle: "short", hat: "police", hatColor: "#1f2a4d", belt: "#141826", badge: true };
export const PASSER: Look[] = [
  { skin: "#e6c09c", top: "#7d5a8c", pants: "#2a2f40", shoes: "#20232c", hair: "#2b2020", hairStyle: "short" },
  { skin: "#d6a882", top: "#5f8fb5", pants: "#283044", shoes: "#20232c", hair: "#4a3020", hairStyle: "short" },
  { skin: "#ecc9a6", top: "#b5814a", pants: "#2c2c38", shoes: "#20232c", hair: "#8a6a3a", hairStyle: "short", hat: "cap", hatColor: "#3d5a7a" },
  { skin: "#c99a76", top: "#a0464a", pants: "#2a2f40", shoes: "#20232c", hair: "#151212", hairStyle: "short" },
];

export type Face = { eyes?: "open" | "wide" | "happy" | "closed"; brows?: number; mouth?: "none" | "smile" | "grin" | "o" | "flat" | "fear" };

export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

const INKF = "#1b2033";

export const Person: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; rot?: number; turn?: number;
  pose: Pose; look: Look; face?: Face; t?: number; seed?: number;
  feet?: { l?: V; r?: V }; hands?: { l?: V; r?: V };
  pole?: { c: V; a: number; len?: number }; cuffs?: boolean; bow?: number | null; children?: React.ReactNode;
}> = ({ x, y, s = 1, dir = 1, rot = 0, turn = 0, pose, look, face = {}, t = 0, seed = 0, feet, hands, pole, cuffs, bow = null, children }) => {
  const B = BODY;
  const slim = look.slim ?? 1;
  const breath = 1 + 0.012 * Math.sin((t + seed * 13) / 18);
  const up: V = [Math.sin(pose.lean * D), -Math.cos(pose.lean * D)];
  const perp: V = [Math.cos(pose.lean * D), Math.sin(pose.lean * D)];
  const sh: V = [up[0] * B.torso * breath, up[1] * B.torso * breath];
  const sw = 22 * (1 - 0.85 * turn) * slim, hw = 14 * (1 - 0.8 * turn);
  const shL: V = [sh[0] - perp[0] * sw, sh[1] - perp[1] * sw], shR: V = [sh[0] + perp[0] * sw, sh[1] + perp[1] * sw];
  const hpL: V = [-perp[0] * hw, -perp[1] * hw], hpR: V = [perp[0] * hw, perp[1] * hw];

  // кисти: явные цели > шест > углы позы
  let tgL = hands?.l, tgR = hands?.r;
  if (pole) {
    const pd: V = [Math.cos(pole.a * D), Math.sin(pole.a * D)];
    tgL = tgL ?? [pole.c[0] - pd[0] * 34, pole.c[1] - pd[1] * 34];
    tgR = tgR ?? [pole.c[0] + pd[0] * 34, pole.c[1] + pd[1] * 34];
  }
  const aL = tgL ? ik(shL, tgL, B.ua, B.fa, -1) : pose.aL;
  const aR = tgR ? ik(shR, tgR, B.ua, B.fa, -1) : pose.aR;
  const lL = feet?.l ? ik(hpL, feet.l, B.th, B.sh, 1) : pose.lL;
  const lR = feet?.r ? ik(hpR, feet.r, B.th, B.sh, 1) : pose.lR;

  const eL = go(shL, aL[0], B.ua), hL = go(eL, aL[1], B.fa);
  const eR = go(shR, aR[0], B.ua), hR = go(eR, aR[1], B.fa);
  const kL = go(hpL, lL[0], B.th), fL = go(kL, lL[1], B.sh);
  const kR = go(hpR, lR[0], B.th), fR = go(kR, lR[1], B.sh);
  const headC = go(sh, 180 - pose.lean - (pose.head ?? 0) * 0.3, 44);

  const P = (a: V[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const limb = (a: V[], col: string, w: number) => <polyline points={P(a)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  const back = 0.78;
  const shoe = (f: V, col: string, k: string) => {
    const len = 10 + 16 * turn;
    return <line key={k} x1={f[0] - 6} y1={f[1] + 2} x2={f[0] + len} y2={f[1] + 2} stroke={col} strokeWidth={15} strokeLinecap="round" />;
  };
  const armW = 19 * slim, legW = 23 * slim;

  // торс (куртка) с низом чуть ниже таза
  const hemL: V = [hpL[0] - perp[0] * 6 - up[0] * 14, hpL[1] - perp[1] * 6 - up[1] * 14];
  const hemR: V = [hpR[0] + perp[0] * 6 - up[0] * 14, hpR[1] + perp[1] * 6 - up[1] * 14];
  const torsoPts = P([hemL, hemR, [shR[0] + perp[0] * 6, shR[1] + perp[1] * 6], [shL[0] - perp[0] * 6, shL[1] - perp[1] * 6]]);

  // лицо
  const blinkPh = (t + seed * 37) % 97;
  const blink = face.eyes === "closed" ? 0.1 : blinkPh < 4 ? 0.15 : 1;
  const fx = turn * 14, gap = 10 * (1 - 0.45 * turn);
  const brows = face.brows ?? 0;
  const eye = (cx: number, k: string) => {
    if (face.eyes === "happy") return <path key={k} d={`M ${cx - 5} 2 Q ${cx} -5 ${cx + 5} 2`} stroke={INKF} strokeWidth={3} fill="none" strokeLinecap="round" />;
    if (face.eyes === "wide")
      return (
        <g key={k}>
          <ellipse cx={cx} cy={0} rx={6.5} ry={7.5 * blink} fill="#ffffff" />
          <circle cx={cx + turn * 2} cy={0} r={3.4 * Math.min(1, blink * 2)} fill={INKF} />
        </g>
      );
    return <ellipse key={k} cx={cx} cy={0} rx={3.6} ry={4.6 * blink} fill={INKF} />;
  };
  const mouthY = 14;
  const mouth = (() => {
    switch (face.mouth ?? "flat") {
      case "smile": return <path d={`M ${fx - 7} ${mouthY - 1} Q ${fx} ${mouthY + 6} ${fx + 7} ${mouthY - 1}`} stroke={INKF} strokeWidth={3} fill="none" strokeLinecap="round" />;
      case "grin": return <path d={`M ${fx - 9} ${mouthY - 2} Q ${fx} ${mouthY + 12} ${fx + 9} ${mouthY - 2} Z`} fill={INKF} />;
      case "o": return <ellipse cx={fx} cy={mouthY + 2} rx={4.5} ry={6} fill={INKF} />;
      case "fear": return <path d={`M ${fx - 8} ${mouthY + 2} q 4 -4 8 0 q 4 4 8 0`} stroke={INKF} strokeWidth={3} fill="none" strokeLinecap="round" />;
      case "none": return null;
      default: return <line x1={fx - 5} y1={mouthY} x2={fx + 5} y2={mouthY} stroke={INKF} strokeWidth={3} strokeLinecap="round" />;
    }
  })();
  const R = B.head;
  const hair = (() => {
    const m = turn * 6;
    switch (look.hairStyle) {
      case "blond":
        return <path d={`M ${-R - 1 + m} 0 C ${-R - 4 + m} -32 ${-8 + m} -44 ${10 + m} -39 C ${28 + m} -35 ${R + 4 + m} -20 ${R + m} -2 C ${20 + m} -18 ${6 + m} -22 ${-6 + m} -16 C ${-16 + m} -12 ${-24 + m} -8 ${-R - 1 + m} 0 Z`} fill={look.hair} />;
      case "short":
        return <path d={`M ${-R} -2 C ${-R - 2} -34 ${R + 2} -34 ${R} -2 C ${R - 8} -16 ${-R + 8} -16 ${-R} -2 Z`} fill={look.hair} />;
      case "messy":
        return <path d={`M ${-R - 1} -4 L ${-R + 4} -14 L ${-R + 10} -6 L ${-R + 14} -16 L ${-R + 20} -8 Z M ${R + 1} -4 L ${R - 6} -15 L ${R - 11} -7 Z`} fill={look.hair} />;
      default:
        return null;
    }
  })();
  const hat = (() => {
    const hc = look.hatColor ?? "#333";
    switch (look.hat) {
      case "beanie":
        return (
          <g>
            <path d={`M ${-R - 2} -8 C ${-R - 2} -48 ${R + 2} -48 ${R + 2} -8 Z`} fill={hc} />
            <rect x={-R - 4} y={-17} width={2 * R + 8} height={13} rx={6} fill={shade(hc, 0.82)} />
            <rect x={-R + 4} y={-29} width={2 * R - 8} height={4} rx={2} fill={look.hatColor2 ?? "#fff"} opacity={0.9} />
            <circle cx={turn * -6} cy={-44} r={8} fill={look.hatColor2 ?? "#fff"} />
          </g>
        );
      case "cap":
        return (
          <g>
            <path d={`M ${-R - 1} -8 C ${-R - 1} -42 ${R + 1} -42 ${R + 1} -8 Z`} fill={hc} />
            <path d={`M ${-6 + turn * 10} -10 L ${R + 4 + turn * 20} -9 Q ${R + 10 + turn * 20} -4 ${R - 4 + turn * 10} -3 L ${-12 + turn * 10} -4 Z`} fill={shade(hc, 0.8)} />
          </g>
        );
      case "police":
        return (
          <g>
            <path d={`M ${-R + 2} -12 L ${-R - 6} -36 L ${R + 6} -36 L ${R - 2} -12 Z`} fill={hc} />
            <rect x={-R + 1} y={-17} width={2 * R - 2} height={8} fill={shade(hc, 0.7)} />
            <path d={`M ${-R + 4 + turn * 8} -9 L ${R + 4 + turn * 18} -9 Q ${R + 8 + turn * 18} -3 ${R - 6 + turn * 12} -2 L ${-R + 8 + turn * 8} -3 Z`} fill={shade(hc, 0.6)} />
            <circle cx={turn * 12} cy={-25} r={5} fill="#e8c35a" />
          </g>
        );
      default:
        return null;
    }
  })();

  const poleEl = pole ? (() => {
    const len = pole.len ?? 300;
    const pd: V = [Math.cos(pole.a * D), Math.sin(pole.a * D)];
    return (
      <g>
        <line x1={pole.c[0] - pd[0] * len} y1={pole.c[1] - pd[1] * len} x2={pole.c[0] + pd[0] * len} y2={pole.c[1] + pd[1] * len} stroke="#d9c49a" strokeWidth={7} strokeLinecap="round" />
        <line x1={pole.c[0] - pd[0] * len} y1={pole.c[1] - pd[1] * len - 2} x2={pole.c[0] + pd[0] * len} y2={pole.c[1] + pd[1] * len - 2} stroke="#f1e2c0" strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  })() : null;

  const bowEl = bow !== null ? (
    <g>
      <path d={`M ${hL[0] - 4} ${hL[1] - 92} Q ${hL[0] + 50} ${hL[1]} ${hL[0] - 4} ${hL[1] + 92}`} fill="none" stroke="#8a5a32" strokeWidth={7} strokeLinecap="round" />
      <polyline points={P([[hL[0] - 4, hL[1] - 92], hR, [hL[0] - 4, hL[1] + 92]])} fill="none" stroke="#e9eef6" strokeWidth={2} />
      {bow > 0 ? <line x1={hR[0]} y1={hR[1]} x2={hL[0] + 60} y2={hL[1]} stroke="#e9eef6" strokeWidth={4} strokeLinecap="round" /> : null}
    </g>
  ) : null;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${dir * s} ${s})`}>
      {limb([shL, eL, hL], shade(look.top, back), armW)}
      <circle cx={hL[0]} cy={hL[1]} r={9} fill={shade(look.skin, 0.9)} />
      {limb([hpL, kL, fL], shade(look.pants, back), legW)}
      {shoe(fL, shade(look.shoes, 0.85), "sL")}
      {/* шея */}
      {limb([sh, go(sh, 180 - pose.lean, 22)], look.neck ?? look.skin, look.neck ? 22 : 14)}
      <polygon points={torsoPts} fill={look.top} stroke={look.top} strokeWidth={16} strokeLinejoin="round" />
      {look.zip && turn < 0.6 ? <line x1={hemL[0] * 0 + up[0] * -10 + perp[0] * turn * 14} y1={up[1] * -10} x2={sh[0] - up[0] * 6 + perp[0] * turn * 14} y2={sh[1] - up[1] * 6} stroke={look.zip} strokeWidth={3} /> : null}
      {look.belt ? <line x1={hemL[0]} y1={hemL[1] - up[1] * -6} x2={hemR[0]} y2={hemR[1] - up[1] * -6} stroke={look.belt} strokeWidth={8} strokeLinecap="round" /> : null}
      {look.badge ? <circle cx={sh[0] - up[0] * 30 + perp[0] * (8 + turn * 4)} cy={sh[1] - up[1] * 30 + perp[1] * 8} r={6} fill="#e8c35a" /> : null}
      {limb([hpR, kR, fR], look.pants, legW)}
      {shoe(fR, look.shoes, "sR")}
      {/* голова */}
      <g transform={`translate(${headC[0]} ${headC[1]}) rotate(${pose.lean * 0.5 + (pose.head ?? 0)})`}>
        {turn > 0.3 ? <circle cx={-turn * 6} cy={4} r={7} fill={shade(look.skin, 0.9)} /> : null}
        <circle r={R} fill={look.skin} />
        {hair}
        {hat}
        <g transform="translate(0 2)">
          {eye(fx - gap, "l")}
          {eye(fx + gap, "r")}
          {brows !== 0 || face.eyes === "wide" ? (
            <g stroke={INKF} strokeWidth={3} strokeLinecap="round">
              <line x1={fx - gap - 6} y1={-10 + brows * 2} x2={fx - gap + 5} y2={-10 - brows * 3} />
              <line x1={fx + gap - 5} y1={-10 - brows * 3} x2={fx + gap + 6} y2={-10 + brows * 2} />
            </g>
          ) : null}
          {mouth}
        </g>
      </g>
      {poleEl}
      {limb([shR, eR, hR], look.top, armW)}
      <circle cx={hR[0]} cy={hR[1]} r={9.5} fill={look.skin} />
      {bowEl}
      {cuffs ? (
        <g>
          <circle cx={hL[0]} cy={hL[1]} r={11} fill="none" stroke="#cfd8e6" strokeWidth={4} />
          <circle cx={hR[0]} cy={hR[1]} r={11} fill="none" stroke="#cfd8e6" strokeWidth={4} />
          <line x1={hL[0]} y1={hL[1]} x2={hR[0]} y2={hR[1]} stroke="#cfd8e6" strokeWidth={3} />
        </g>
      ) : null}
      {children}
    </g>
  );
};

// мягкая тень под персонажем (рисуй в координатах сцены)
export const Shadow: React.FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 70, o = 0.35 }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill="#05080f" opacity={o} />;
