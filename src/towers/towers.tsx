// «The Man Who Walked Between the Towers» — 60 сек, без озвучки, только звуки (public/towers/sound.wav).
// Всё нарисовано векторно (SVG). Герой с картинки пользователя — public/towers/hero.png (сцены 1, 2, 7).
// Стиль: тёмный индиго, янтарный контровой свет, циановые акценты, зерно плёнки; сцены 3–6 — ретро 70-х.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";

// Шрифты лежат локально (public/towers/fonts), чтобы рендер не зависел от интернета.
const FONTS: [string, string][] = [["TwRighteous", "Righteous"], ["TwElite", "SpecialElite"], ["TwAnton", "Anton"], ["TwPlayfair", "PlayfairDisplay"]];
if (typeof document !== "undefined") {
  const h = delayRender("towers fonts");
  Promise.all(
    FONTS.map(([fam, file]) => {
      const ff = new FontFace(fam, `url(${staticFile(`towers/fonts/${file}.woff2`)}) format("woff2")`);
      return ff.load().then((x) => document.fonts.add(x));
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}
const RIGHTEOUS = "TwRighteous";
const ELITE = "TwElite";
const ANTON = "TwAnton";
const PLAYFAIR = "TwPlayfair";

export const TOWERS_FRAMES = 1800;

// ---------- палитра ----------
const INK = "#0a0718";
const IND0 = "#0b0820";
const IND1 = "#1b1550";
const IND2 = "#2e2477";
const IND3 = "#463aa8";
const AMB = "#ffb347";
const AMB2 = "#ff7a3d";
const CYAN = "#3ff0ff";
const SKIN = "#f2c39a";
const TAXI = "#ffd23a";

// ---------- утилиты ----------
const ip = (f: number, i: number[], o: number[], e?: (t: number) => number) =>
  interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const D = Math.PI / 180;
type V = [number, number];
const go = (p: V, a: number, l: number): V => [p[0] + l * Math.sin(a * D), p[1] + l * Math.cos(a * D)];
const pts = (a: V[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const Full: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, ...style }}>
    {children}
  </svg>
);

// пульс сердцебиения (те же моменты, что в звуке)
const BEATS: number[] = (() => {
  const b: number[] = [];
  for (let t = 0.2; t < 5; t += 0.85) b.push(t);
  let t = 5.0, iv = 0.7;
  while (t < 7.6) { b.push(t); t += iv; iv = Math.max(0.38, iv * 0.88); }
  b.push(55.2, 56.2);
  return b;
})();
const pulse = (absF: number) => {
  const s = absF / 30;
  let v = 0;
  for (const b of BEATS) if (s >= b && s < b + 0.5) v = Math.max(v, Math.exp(-(s - b) * 9));
  return v;
};

// ---------- человечек-риг (Петит, друзья, полиция) ----------
type Pose = { lean: number; aL: V; aR: V; lL: V; lR: V };
const mixP = (a: Pose, b: Pose, t: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * t;
  const mv = (x: V, y: V): V => [m(x[0], y[0]), m(x[1], y[1])];
  return { lean: m(a.lean, b.lean), aL: mv(a.aL, b.aL), aR: mv(a.aR, b.aR), lL: mv(a.lL, b.lL), lR: mv(a.lR, b.lR) };
};
const poseAt = (f: number, keys: [number, Pose][]): Pose => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0] = keys[i], [f1, p1] = keys[i + 1];
    if (f < f1) {
      let t = (f - f0) / (f1 - f0);
      t = t * t * (3 - 2 * t);
      return mixP(p0, p1, t);
    }
  }
  return keys[keys.length - 1][1];
};
const T_LEN = 120, UA = 62, FA = 58, TH = 82, SH = 82;
const footDrop = (p: Pose) => Math.max(go(go([0, 0], p.lL[0], TH), p.lL[1], SH)[1], go(go([0, 0], p.lR[0], TH), p.lR[1], SH)[1]) + 8;
const walk = (ph: number, amp = 24): { lL: V; lR: V } => {
  const leg = (q: number): V => {
    const th = amp * Math.sin(q);
    return [th, th - 28 * Math.max(0, Math.sin(q + 1.6))];
  };
  return { lL: leg(ph), lR: leg(ph + Math.PI) };
};

type Look = { cloth: string; pants: string; hair: string; cap?: string; w: number; rim?: string };
const PETIT: Look = { cloth: "#16121f", pants: "#16121f", hair: "#d8a25a", w: 28 };
const FR1: Look = { cloth: "#6a4026", pants: "#2a2238", hair: "#2b1d14", cap: "#8a3220", w: 34 };
const FR2: Look = { cloth: "#25504a", pants: "#22263a", hair: "#121018", w: 36 };
const COP: Look = { cloth: "#26357a", pants: "#1a2350", hair: "#3a2a1e", cap: "#141c48", w: 38 };

const Man: React.FC<{
  x: number; y: number; s?: number; rot?: number; pose: Pose; look: Look; face?: number;
  smile?: number; pole?: number | null; bow?: number | null; cuffs?: boolean; oMouth?: boolean; flip?: boolean;
}> = ({ x, y, s = 1, rot = 0, pose, look, face = 0, smile = 1, pole = null, bow = null, cuffs, oMouth, flip }) => {
  const hip: V = [0, 0];
  const sh = go(hip, 180 - pose.lean, T_LEN);
  const head = go(sh, 180 - pose.lean, 44);
  const eL = go(sh, pose.aL[0], UA), hL = go(eL, pose.aL[1], FA);
  const eR = go(sh, pose.aR[0], UA), hR = go(eR, pose.aR[1], FA);
  const kL = go(hip, pose.lL[0], TH), fL = go(kL, pose.lL[1], SH);
  const kR = go(hip, pose.lR[0], TH), fR = go(kR, pose.lR[1], SH);
  const rim = look.rim ?? AMB;
  const w = look.w;
  const limb = (a: V[], col: string, wd: number, key: string) => (
    <g key={key}>
      <polyline points={pts(a)} fill="none" stroke={rim} strokeWidth={wd + 7} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts(a)} fill="none" stroke={col} strokeWidth={wd} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  const fd = face === 0 ? 1 : face;
  const shoe = (p: V, k: string) => (
    <g key={k}>
      <line x1={p[0] - 6 * fd} y1={p[1] + 2} x2={p[0] + 16 * fd} y2={p[1] + 2} stroke={rim} strokeWidth={19} strokeLinecap="round" />
      <line x1={p[0] - 6 * fd} y1={p[1] + 2} x2={p[0] + 16 * fd} y2={p[1] + 2} stroke={INK} strokeWidth={13} strokeLinecap="round" />
    </g>
  );
  const hand = (p: V, k: string) => <circle key={k} cx={p[0]} cy={p[1]} r={9} fill={SKIN} stroke={INK} strokeWidth={3} />;
  const ex = face * 9;
  const poleEl = pole !== null ? (() => {
    const c: V = [(hL[0] + hR[0]) / 2, (hL[1] + hR[1]) / 2];
    const a = go(c, 90 + pole, 300), b = go(c, -90 + pole, 300);
    return (
      <g>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={rim} strokeWidth={13} strokeLinecap="round" />
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#e8d3a8" strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  })() : null;
  const bowEl = bow !== null ? (
    <g>
      <path d={`M ${hL[0] - 4} ${hL[1] - 95} Q ${hL[0] + 55} ${hL[1]} ${hL[0] - 4} ${hL[1] + 95}`} fill="none" stroke={rim} strokeWidth={12} />
      <path d={`M ${hL[0] - 4} ${hL[1] - 95} Q ${hL[0] + 55} ${hL[1]} ${hL[0] - 4} ${hL[1] + 95}`} fill="none" stroke="#7a4a22" strokeWidth={7} />
      <polyline points={pts([[hL[0] - 4, hL[1] - 95], [hR[0], hR[1]], [hL[0] - 4, hL[1] + 95]])} fill="none" stroke="#e9f6ff" strokeWidth={2} />
      {bow > 0 ? <line x1={hR[0]} y1={hR[1]} x2={hL[0] + 70} y2={hL[1]} stroke={CYAN} strokeWidth={4} /> : null}
    </g>
  ) : null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      {limb([sh, eL, hL], look.cloth, w * 0.62, "aL")}
      {limb([hip, kL, fL], look.pants, w * 0.72, "lL")}
      {shoe(fL, "sL")}
      {limb([hip, sh], look.cloth, w + 8, "t")}
      {limb([hip, kR, fR], look.pants, w * 0.72, "lR")}
      {shoe(fR, "sR")}
      {/* голова */}
      <g transform={`translate(${head[0]} ${head[1]}) rotate(${pose.lean * 0.6})`}>
        <circle r={29} fill={rim} />
        <circle r={25} fill={SKIN} stroke={INK} strokeWidth={4} />
        <path d="M -27 -2 Q -30 -34 0 -33 Q 30 -34 27 -4 Q 12 -20 -6 -14 Q -18 -10 -27 -2 Z" fill={look.hair} stroke={INK} strokeWidth={3} />
        {look.cap ? (
          <g>
            <path d="M -27 -10 Q -26 -38 0 -38 Q 26 -38 27 -10 Z" fill={look.cap} stroke={INK} strokeWidth={3} />
            <path d={`M ${-6 + fd * 10} -12 L ${30 * fd} -10`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
        ) : null}
        <circle cx={ex - 8} cy={1} r={3.4} fill={INK} />
        <circle cx={ex + 8} cy={1} r={3.4} fill={INK} />
        {oMouth ? (
          <ellipse cx={ex} cy={13} rx={5} ry={6} fill={INK} />
        ) : (
          <path d={`M ${ex - 9} 10 Q ${ex} ${12 + smile * 6} ${ex + 9} 10`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        )}
      </g>
      {poleEl}
      {limb([sh, eR, hR], look.cloth, w * 0.62, "aR")}
      {hand(hL, "hL")}
      {hand(hR, "hR")}
      {bowEl}
      {cuffs ? (
        <g>
          <circle cx={hL[0]} cy={hL[1]} r={11} fill="none" stroke="#cfe8ff" strokeWidth={4} />
          <circle cx={hR[0]} cy={hR[1]} r={11} fill="none" stroke="#cfe8ff" strokeWidth={4} />
          <line x1={hL[0]} y1={hL[1]} x2={hR[0]} y2={hR[1]} stroke="#cfe8ff" strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

const STAND: Pose = { lean: 0, aL: [-10, -4], aR: [10, 4], lL: [-6, -3], lR: [6, 3] };

// ---------- герой пользователя (картинка 439×1300) ----------
const HW = 439, HH = 1300;
const Hero: React.FC<{ x: number; y: number; s: number; crop?: [number, number, number, number]; style?: React.CSSProperties; glow?: number }> = ({ x, y, s, crop = [0, 0, HW, HH], style, glow = 1 }) => {
  const [cx, cy, cw, ch] = crop;
  const fadeTop = cy > 0 ? "linear-gradient(to bottom, transparent 0%, #000 22%)" : undefined;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: cw * s, height: ch * s, ...style,
      filter: `drop-shadow(${7 * glow}px 0 0 rgba(255,179,71,0.95)) drop-shadow(${-5 * glow}px 0 0 rgba(63,240,255,0.7)) drop-shadow(0 0 ${28 * glow}px rgba(255,140,60,0.45))` }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitMaskImage: fadeTop, maskImage: fadeTop }}>
        <Img src={staticFile("towers/hero.png")} style={{ position: "absolute", left: -cx * s, top: -cy * s, width: HW * s, height: HH * s }} />
      </div>
    </div>
  );
};

// ---------- общие элементы ----------
const Stars: React.FC<{ n?: number; h?: number; f: number }> = ({ n = 70, h = 1100, f }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * h} r={1 + rnd(i + 7) * 2.2} fill={i % 5 ? "#cfd6ff" : CYAN} opacity={0.35 + 0.5 * Math.abs(Math.sin(f / 13 + i))} />
    ))}
  </g>
);

const Tower: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; rimSide?: "l" | "r"; warm?: number; antenna?: boolean }> = ({ x, y, w, h, seed = 0, rimSide = "r", warm = 0, antenna }) => {
  const cols = Math.floor(w / 11);
  return (
    <g>
      {antenna ? <rect x={x + w / 2 - 5} y={y - h * 0.18} width={10} height={h * 0.18} fill={IND2} stroke={INK} strokeWidth={3} /> : null}
      <rect x={x} y={y} width={w} height={h} fill={warm ? "#3a2a6a" : IND1} stroke={INK} strokeWidth={5} />
      {Array.from({ length: cols }, (_, i) => (
        <line key={i} x1={x + 6 + i * 11} y1={y + 4} x2={x + 6 + i * 11} y2={y + h} stroke={warm ? "#5a3f86" : IND2} strokeWidth={4} />
      ))}
      {Array.from({ length: Math.floor((w * h) / 9000) }, (_, i) => (
        <rect key={"w" + i} x={x + 4 + Math.floor(rnd(i + seed) * cols) * 11} y={y + 10 + rnd(i * 3 + seed) * (h - 20)} width={5} height={9} fill={rnd(i + seed * 2) > 0.7 ? AMB : CYAN} opacity={0.75} />
      ))}
      <rect x={rimSide === "r" ? x + w - 9 : x} y={y} width={9} height={h} fill={warm ? AMB2 : AMB} opacity={0.85} />
      <rect x={x} y={y} width={w} height={7} fill={AMB} opacity={0.6} />
    </g>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number; col?: string }> = ({ x, y, s, o = 0.8, col = "#4a3f9a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={160} ry={50} fill={col} />
    <ellipse cx={-80} cy={-25} rx={80} ry={50} fill={col} />
    <ellipse cx={50} cy={-40} rx={95} ry={60} fill={col} />
    <ellipse cx={20} cy={-55} rx={60} ry={40} fill={AMB} opacity={0.18} />
  </g>
);

const Caption: React.FC<{ f: number; from: number; to: number; text: string; y?: number; retro?: boolean }> = ({ f, from, to, text, y = 250, retro }) => {
  const o = ip(f, [from, from + 8, to - 8, to], [0, 1, 1, 0]);
  const vis = Math.floor(ip(f, [from, from + 20], [0, text.length]));
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", opacity: o }}>
      <span style={{
        fontFamily: retro ? ELITE : RIGHTEOUS, fontSize: 46, letterSpacing: 4, color: retro ? "#ffe2b0" : "#e9fbff",
        background: "rgba(10,7,24,0.72)", padding: "14px 26px", borderRadius: 8, border: `3px solid ${retro ? AMB : CYAN}`,
        boxShadow: `0 0 24px ${retro ? "rgba(255,179,71,.45)" : "rgba(63,240,255,.45)"}`,
      }}>
        {text.slice(0, vis)}
      </span>
    </div>
  );
};

// =============== СЦЕНА 1 (0–5 c): ноги на тросе, камера вниз ===============
const CityTop: React.FC<{ f: number }> = ({ f }) => {
  const step = 150, b = 116;
  const blocks: React.ReactNode[] = [];
  for (let gx = -6; gx <= 6; gx++)
    for (let gy = -8; gy <= 8; gy++) {
      const x = 540 + gx * step - b / 2, y = 960 + gy * step - b / 2, k = gx * 31 + gy * 7;
      blocks.push(
        <g key={k}>
          <rect x={x} y={y} width={b} height={b} fill={rnd(k) > 0.8 ? IND2 : IND1} stroke={INK} strokeWidth={3} />
          <rect x={x + 10} y={y + 10} width={b - 20} height={b - 20} fill="none" stroke={IND3} strokeWidth={2} opacity={0.6} />
          {rnd(k + 3) > 0.5 ? <rect x={x + 30} y={y + 30} width={b - 60} height={b - 60} fill={IND0} stroke={AMB} strokeWidth={2} opacity={0.7} /> : null}
        </g>,
      );
    }
  const taxis: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const vert = i % 2 === 0;
    const lane = Math.floor(rnd(i) * 13) - 6;
    const dir = rnd(i + 5) > 0.5 ? 1 : -1;
    const span = 2600;
    const pos = (((rnd(i + 9) * span + dir * f * (2 + rnd(i) * 2.5)) % span) + span) % span - span / 2;
    const c = lane * step + step / 2 + (dir > 0 ? 6 : -6);
    const x = vert ? 540 + c : 540 + pos, y = vert ? 960 + pos : 960 + c;
    taxis.push(<rect key={i} x={x - (vert ? 6 : 13)} y={y - (vert ? 13 : 6)} width={vert ? 12 : 26} height={vert ? 26 : 12} rx={3} fill={i % 7 === 0 ? "#e9f6ff" : TAXI} stroke={INK} strokeWidth={1.5} />);
  }
  return (
    <g>
      <rect x={-800} y={-800} width={2680} height={3520} fill="#120e30" />
      {Array.from({ length: 13 }, (_, i) => (
        <g key={"s" + i}>
          <line x1={-800} y1={960 + (i - 6) * step + step / 2} x2={1880} y2={960 + (i - 6) * step + step / 2} stroke={AMB} strokeWidth={3} opacity={0.35} />
          <line x1={540 + (i - 6) * step + step / 2} y1={-800} x2={540 + (i - 6) * step + step / 2} y2={2720} stroke={CYAN} strokeWidth={2} opacity={0.25} />
        </g>
      ))}
      {blocks}
      <g filter="url(#taxiGlow)">{taxis}</g>
    </g>
  );
};

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 13) * 2.4 + Math.sin(f / 4.7) * 0.7;
  const drop = ip(f, [52, 70], [0, 1], Easing.in(Easing.cubic));
  const blur = Math.sin(drop * Math.PI) * 18;
  const p = pulse(f);
  const zoom = ip(f, [70, 150], [1, 1.35]);
  const wireY = 1500;
  return (
    <AbsoluteFill style={{ background: IND0, overflow: "hidden" }}>
      {/* А: крупный план ботинок на тросе */}
      <AbsoluteFill style={{ transform: `translateY(${-2100 * drop}px) rotate(${sway}deg) scale(${1 + p * 0.015})`, filter: `blur(${blur}px)` }}>
        <Full>
          <defs>
            <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#120c38" />
              <stop offset="0.6" stopColor="#2a1f6e" />
              <stop offset="1" stopColor="#5a2f6a" />
            </linearGradient>
            <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={AMB} />
              <stop offset="0.35" stopColor="#d9e4ff" />
              <stop offset="1" stopColor="#3a3a66" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#s1sky)" />
          <Stars f={f} h={900} />
          {[0, 1, 2, 3].map((i) => (
            <Cloud key={i} x={((i * 380 + f * (1.2 + i * 0.4)) % 1600) - 260} y={1600 + i * 70} s={1.4 + i * 0.3} o={0.55} />
          ))}
          <path d={`M -20 ${wireY + 10} Q 540 ${wireY + 26} 1100 ${wireY + 10}`} stroke={INK} strokeWidth={34} fill="none" />
          <path d={`M -20 ${wireY} Q 540 ${wireY + 16} 1100 ${wireY}`} stroke="url(#steel)" strokeWidth={24} fill="none" />
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={i * 38} y1={wireY - 9 + Math.sin(((i * 38) / 1080) * Math.PI) * 16} x2={i * 38 + 22} y2={wireY + 9 + Math.sin(((i * 38) / 1080) * Math.PI) * 16} stroke="#2a2a50" strokeWidth={3} />
          ))}
        </Full>
        <Hero x={540 - (HW * 2.35) / 2} y={wireY + 12 - 340 * 2.35} s={2.35} crop={[0, 960, HW, 340]} glow={1.4} />
      </AbsoluteFill>
      {/* Б: взгляд вниз — облака и крошечные такси */}
      <AbsoluteFill style={{ transform: `translateY(${1920 * (1 - drop)}px)`, filter: `blur(${blur}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${sway * 1.5 + f * 0.05}deg)` }}>
          <Full>
            <defs>
              <filter id="taxiGlow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="cblur"><feGaussianBlur stdDeviation="14" /></filter>
            </defs>
            <CityTop f={f} />
          </Full>
        </AbsoluteFill>
        <Full>
          <g filter="url(#cblur)">
            {[0, 1, 2, 3, 4].map((i) => (
              <Cloud key={i} x={((i * 300 + f * (6 + i * 2)) % 1700) - 300} y={300 + i * 330} s={2 + (i % 2)} o={0.6} col="#8f86d8" />
            ))}
          </g>
          {/* трос сверху вниз и носки ботинок */}
          <line x1={540 + sway * 8} y1={-20} x2={540 - sway * 4} y2={1940} stroke={INK} strokeWidth={22} />
          <line x1={540 + sway * 8} y1={-20} x2={540 - sway * 4} y2={1940} stroke="#d9e4ff" strokeWidth={12} />
          <line x1={545 + sway * 8} y1={-20} x2={545 - sway * 4} y2={1940} stroke={AMB} strokeWidth={3} />
        </Full>
        <Hero x={540 + sway * 7 - (HW * 1.3) / 2} y={-40} s={1.3} crop={[0, 1180, HW, 120]} glow={1.2} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 45%, rgba(255,60,60,${0.25 * p}) 100%)` }} />
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 2 (5–12 c): паника, стоп-кадр, трещина, переход в 70-е ===============
const FREEZE = 80;
const S2Frame: React.FC<{ f: number; abs: number }> = ({ f, abs }) => {
  const shake = ip(f, [0, 75], [1, 9]);
  const jx = (rnd(f * 3) - 0.5) * shake, jy = (rnd(f * 3 + 1) - 0.5) * shake * 0.6;
  const push = ip(f, [10, 78], [1, 1.9], Easing.inOut(Easing.cubic));
  const sway = Math.sin(f / 10) * 1.6;
  const p = pulse(abs);
  const wireY = 1690;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: IND0 }}>
      <AbsoluteFill style={{ transform: `scale(${push}) translate(${jx}px, ${jy}px)`, transformOrigin: "540px 640px" }}>
        <Full>
          <defs>
            <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d0930" />
              <stop offset="0.55" stopColor="#2a1f6e" />
              <stop offset="0.75" stopColor="#7a3a6a" />
              <stop offset="1" stopColor="#1a1240" />
            </linearGradient>
            <linearGradient id="steel2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={AMB} />
              <stop offset="0.4" stopColor="#d9e4ff" />
              <stop offset="1" stopColor="#3a3a66" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#s2sky)" />
          <Stars f={f} h={1000} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Cloud key={i} x={((i * 290 + f * 1.5) % 1500) - 200} y={1420 + (i % 3) * 120} s={1.3 + (i % 2) * 0.5} o={0.7} />
          ))}
          <Tower x={-60} y={wireY + 6} w={200} h={500} seed={3} rimSide="r" />
          <Tower x={940} y={wireY + 6} w={200} h={500} seed={8} rimSide="l" />
          <path d={`M 100 ${wireY} Q 540 ${wireY + 18} 980 ${wireY}`} stroke={INK} strokeWidth={20} fill="none" />
          <path d={`M 100 ${wireY} Q 540 ${wireY + 18} 980 ${wireY}`} stroke="url(#steel2)" strokeWidth={12} fill="none" />
        </Full>
        <AbsoluteFill style={{ transform: `rotate(${sway}deg)`, transformOrigin: `540px ${wireY}px` }}>
          <Hero x={540 - HW / 2} y={wireY + 14 - 1290} s={1} />
          <Full>
            {/* капли пота и линии испуга */}
            {Array.from({ length: 8 }, (_, i) => {
              const t0 = 8 + i * 9, tt = f - t0;
              if (tt < 0 || tt > 26) return null;
              const side = i % 2 ? 1 : -1;
              return <path key={i} d="M 0 -14 Q 9 0 0 8 Q -9 0 0 -14 Z" fill={CYAN} stroke={INK} strokeWidth={2} transform={`translate(${540 + side * (150 + tt * 5)} ${560 - tt * 4 + tt * tt * 0.35})`} />;
            })}
            {f > 20 ? Array.from({ length: 6 }, (_, i) => {
              const a = (-150 + i * 24) * D, o = (Math.floor(f / 3) % 2) * 8;
              return <line key={"e" + i} x1={540 + Math.cos(a) * (230 + o)} y1={500 + Math.sin(a) * (230 + o)} x2={540 + Math.cos(a) * (280 + o)} y2={500 + Math.sin(a) * (280 + o)} stroke={CYAN} strokeWidth={7} strokeLinecap="round" />;
            }) : null}
          </Full>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, transparent 40%, rgba(255,50,60,${0.35 * p}) 100%)` }} />
    </AbsoluteFill>
  );
};

// лучи трещины из точки удара
const IMPACT: V = [560, 700];
const RAYS: V[][] = Array.from({ length: 9 }, (_, i) => {
  const a0 = (i / 9) * 360 + rnd(i) * 20;
  const out: V[] = [IMPACT];
  let p = IMPACT, a = a0;
  for (let k = 0; k < 7; k++) {
    a += (rnd(i * 10 + k) - 0.5) * 30;
    p = [p[0] + Math.cos(a * D) * (90 + k * 70), p[1] + Math.sin(a * D) * (90 + k * 70)];
    out.push(p);
  }
  out.push([p[0] + Math.cos(a * D) * 1500, p[1] + Math.sin(a * D) * 1500]);
  return out;
}).sort((A, B) => Math.atan2(A[2][1] - IMPACT[1], A[2][0] - IMPACT[0]) - Math.atan2(B[2][1] - IMPACT[1], B[2][0] - IMPACT[0]));

const RetroTitle: React.FC<{ f: number }> = ({ f }) => {
  const rot = f * 0.4;
  const o = ip(f, [0, 10], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "#2a1440", opacity: o }}>
      <Full>
        <g transform={`translate(540 980) rotate(${rot})`}>
          {Array.from({ length: 24 }, (_, i) => (
            <path key={i} d={`M 0 0 L ${Math.cos((i * 15) * D) * 1600} ${Math.sin((i * 15) * D) * 1600} L ${Math.cos((i * 15 + 7.5) * D) * 1600} ${Math.sin((i * 15 + 7.5) * D) * 1600} Z`} fill={i % 2 ? "#3b1d5a" : "#5a2a4a"} />
          ))}
        </g>
        {[AMB2, AMB, "#ffd98a"].map((c, i) => (
          <rect key={i} x={0} y={1300 + i * 46} width={1080} height={30} fill={c} />
        ))}
        <circle cx={540} cy={980} r={250} fill={AMB2} opacity={0.9} />
        <circle cx={540} cy={980} r={250} fill="none" stroke={INK} strokeWidth={8} />
      </Full>
      <div style={{ position: "absolute", top: 520, left: 60, right: 60, textAlign: "center", fontFamily: RIGHTEOUS, color: "#ffe9c4", fontSize: 92, lineHeight: 1.02, textShadow: `6px 6px 0 ${AMB2}, 12px 12px 0 ${INK}`, transform: `scale(${ip(f, [0, 14], [1.3, 1], Easing.out(Easing.back(2)))})` }}>
        THE MAN WHO WALKED BETWEEN THE TOWERS
      </div>
      <div style={{ position: "absolute", top: 1490, left: 0, right: 0, textAlign: "center", fontFamily: ELITE, color: "#ffe9c4", fontSize: 58, letterSpacing: 10, opacity: ip(f, [14, 24], [0, 1]) }}>
        PARIS · 1968
      </div>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const frozen = f >= FREEZE;
  const flash = ip(f, [FREEZE, FREEZE + 2, FREEZE + 7], [0, 1, 0]);
  const crack1 = ip(f, [99, 105], [0, 1]);
  const crack2 = ip(f, [112, 118], [0, 1]);
  const fall = f - 138;
  const grade = frozen ? "grayscale(0.55) contrast(1.25) brightness(0.9)" : "none";
  const scene = <S2Frame f={Math.min(f, FREEZE)} abs={150 + Math.min(f, FREEZE)} />;
  const crackLines = (
    <Full>
      {RAYS.map((r, i) => {
        const pr = i < 5 ? crack1 : crack2;
        return (
          <g key={i}>
            <polyline points={pts(r)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pr} fill="none" stroke={CYAN} strokeWidth={10} opacity={0.5} />
            <polyline points={pts(r)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pr} fill="none" stroke="#ffffff" strokeWidth={4} />
          </g>
        );
      })}
      {crack2 > 0 ? [1, 2, 3].map((k) => (
        <polygon key={k} points={pts(RAYS.map((r) => r[k]))} fill="none" stroke="#ffffff" strokeWidth={3} opacity={crack2 * 0.9} />
      )) : null}
      <circle cx={IMPACT[0]} cy={IMPACT[1]} r={18} fill="#fff" opacity={crack1} />
    </Full>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {fall >= 0 ? <RetroTitle f={fall} /> : null}
      {fall < 0 ? (
        <AbsoluteFill style={{ filter: grade }}>
          {scene}
          {crackLines}
        </AbsoluteFill>
      ) : (
        RAYS.map((r, i) => {
          const r2 = RAYS[(i + 1) % RAYS.length];
          const poly = [...r, ...[...r2].reverse()].map((p) => `${p[0]}px ${p[1]}px`).join(",");
          const delay = rnd(i + 40) * 10;
          const t = Math.max(0, fall - delay);
          const dir = Math.atan2(r[3][1] - IMPACT[1], r[3][0] - IMPACT[0]);
          return (
            <AbsoluteFill key={i} style={{ clipPath: `polygon(${poly})`, transform: `translate(${Math.cos(dir) * t * 6}px, ${t * t * 1.6 + Math.sin(dir) * t * 4}px) rotate(${(rnd(i) - 0.5) * t * 2}deg)`, transformOrigin: `${IMPACT[0]}px ${IMPACT[1]}px`, filter: `${grade} drop-shadow(0 0 6px ${CYAN})` }}>
              {scene}
              {crackLines}
            </AbsoluteFill>
          );
        })
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 3 (12–22 c): Париж, жонглёр, журнал ===============
const Eiffel: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w / 2} 0 Q ${-w * 0.18} ${-h * 0.35} ${-w * 0.06} ${-h * 0.85} L 0 ${-h} L ${w * 0.06} ${-h * 0.85} Q ${w * 0.18} ${-h * 0.35} ${w / 2} 0 L ${w * 0.3} 0 Q 0 ${-h * 0.22} ${-w * 0.3} 0 Z`} fill={IND0} stroke={AMB} strokeWidth={4} />
      <rect x={-w * 0.27} y={-h * 0.3} width={w * 0.54} height={10} fill={IND0} stroke={AMB} strokeWidth={3} />
      <rect x={-w * 0.13} y={-h * 0.6} width={w * 0.26} height={8} fill={IND0} stroke={AMB} strokeWidth={3} />
      <circle cx={0} cy={-h} r={6} fill={CYAN} />
    </g>
  );
};

const Paris: React.FC<{ f: number }> = ({ f }) => {
  const P = 26;
  const S = 1.9;
  const dip = Math.sin((f / P) * Math.PI * 2) * 10;
  const pose: Pose = { lean: 0, aL: [-14, -98 + dip], aR: [14, 98 - dip], lL: [-7, -4], lR: [7, 4] };
  const hipY = 1640 - footDrop(pose) * S;
  const shY = hipY - T_LEN * S;
  const handY = shY + (UA * Math.cos(14 * D) + FA * Math.cos(98 * D)) * S;
  const handDX = (UA * Math.sin(14 * D) + FA * Math.sin(98 * D)) * S;
  const balls = [0, 1, 2].map((i) => {
    const s = ((f / P + i / 3) % 1 + 1) % 1;
    const fromL = Math.floor(f / P + i / 3) % 2 === 0;
    const xL = 540 - handDX, xR = 540 + handDX;
    const x0 = fromL ? xL : xR, x1 = fromL ? xR : xL;
    return [x0 + (x1 - x0) * s, handY - 14 - 340 * 4 * s * (1 - s)] as V;
  });
  const passer = (k: number) => {
    const x = ((k * 500 + f * (k ? -2.2 : 2.6)) % 1400 + 1400) % 1400 - 160;
    const w = walk(f / 5 + k, 22);
    return <Man key={k} x={x} y={1290} s={0.55} pose={{ ...STAND, lean: 3, ...w, aL: [-15 + w.lL[0], -10], aR: [15 - w.lL[0], 10] }} look={k ? FR2 : FR1} face={k ? -1 : 1} flip={k === 1} />;
  };
  return (
    <AbsoluteFill>
      <Full>
        <defs>
          <linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1550" />
            <stop offset="0.45" stopColor="#5a2d6e" />
            <stop offset="0.62" stopColor={AMB2} />
            <stop offset="0.7" stopColor={AMB} />
          </linearGradient>
          <radialGradient id="lamp"><stop offset="0" stopColor={AMB} stopOpacity="0.9" /><stop offset="1" stopColor={AMB} stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1080} height={1400} fill="url(#psky)" />
        <circle cx={300} cy={1150} r={130} fill="#ffd27a" opacity={0.9} />
        <Eiffel x={790} y={1180} h={720} />
        {Array.from({ length: 9 }, (_, i) => {
          const x = i * 130 - 40, h = 260 + rnd(i) * 160;
          return (
            <g key={i}>
              <rect x={x} y={1260 - h} width={124} height={h} fill={i % 2 ? "#221a58" : "#2b1f66"} stroke={INK} strokeWidth={4} />
              <path d={`M ${x - 4} ${1260 - h} L ${x + 62} ${1260 - h - 50} L ${x + 128} ${1260 - h} Z`} fill="#17123f" stroke={AMB} strokeWidth={3} />
              {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
                <rect key={`${r}${c}`} x={x + 16 + c * 36} y={1260 - h + 30 + r * 70} width={20} height={36} fill={rnd(i * 9 + r * 3 + c) > 0.45 ? AMB : IND1} opacity={0.85} />
              )))}
            </g>
          );
        })}
        <rect x={0} y={1260} width={1080} height={660} fill="#17113a" />
        {Array.from({ length: 12 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
          <ellipse key={`${r}-${c}`} cx={c * 84 + (r % 2) * 42} cy={1290 + r * 54} rx={36 + r * 1.5} ry={14 + r} fill="#241a52" stroke={rnd(r * 14 + c) > 0.8 ? AMB : INK} strokeWidth={2} />
        )))}
        {/* фонарь */}
        <circle cx={150} cy={1000} r={150} fill="url(#lamp)" />
        <rect x={142} y={1000} width={16} height={610} fill={INK} stroke={AMB} strokeWidth={3} />
        <path d="M 120 1000 L 180 1000 L 170 960 L 130 960 Z" fill={AMB} stroke={INK} strokeWidth={4} />
        {[0, 1].map(passer)}
        {/* шляпа с монетами */}
        <ellipse cx={800} cy={1650} rx={70} ry={20} fill={INK} stroke={AMB} strokeWidth={3} />
        {[0, 1, 2].map((i) => <circle key={i} cx={775 + i * 22} cy={1642} r={7} fill={AMB} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 7 + i))} />)}
        <Man x={540} y={hipY} s={S} pose={pose} look={PETIT} smile={1.4} />
        {balls.map((b, i) => (
          <g key={i}>
            <circle cx={b[0]} cy={b[1]} r={24} fill={CYAN} opacity={0.3} />
            <circle cx={b[0]} cy={b[1]} r={15} fill={[CYAN, AMB, "#ff5d8f"][i]} stroke={INK} strokeWidth={4} />
          </g>
        ))}
      </Full>
      <Caption f={f} from={6} to={100} text="PARIS · 1968" retro />
    </AbsoluteFill>
  );
};

const Magazine: React.FC<{ f: number }> = ({ f }) => {
  // f = 0 в момент, когда журнал появляется (кадр 100 сцены 3)
  const flip = ip(f, [6, 24], [0, 1], Easing.inOut(Easing.cubic));
  const draw = ip(f, [56, 104], [0, 1], Easing.inOut(Easing.quad));
  const fig = ip(f, [110, 128], [0, 1]);
  const glow = ip(f, [134, 140], [0, 1]);
  const push = ip(f, [134, 200], [1, 1.35], Easing.inOut(Easing.cubic));
  const A: V = [626, 812], B: V = [878, 832];
  const tip: V = f < 108 ? [A[0] + (B[0] - A[0]) * draw, A[1] + (B[1] - A[1]) * draw] : [752 + Math.cos(fig * 6) * 10, 800 + fig * 30];
  const handIn = ip(f, [30, 54], [600, 0], Easing.out(Easing.cubic)) + ip(f, [150, 180], [0, 700], Easing.in(Easing.cubic));
  const tower = (x: number, unfinished: number) => (
    <g>
      <rect x={x} y={800} width={74} height={430} fill="none" stroke={CYAN} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x + 9 * (i + 1)} y1={800} x2={x + 9 * (i + 1)} y2={1230} stroke={CYAN} strokeWidth={1.5} opacity={0.5} />)}
      {Array.from({ length: 10 }, (_, i) => <line key={"h" + i} x1={x} y1={830 + i * 40} x2={x + 74} y2={830 + i * 40} stroke={CYAN} strokeWidth={1.5} opacity={0.5} />)}
      <rect x={x} y={800 - unfinished} width={74} height={unfinished} fill="none" stroke={CYAN} strokeWidth={3} strokeDasharray="8 8" />
      <path d={`M ${x + 20} ${800 - unfinished} L ${x + 20} ${700 - unfinished} L ${x + 90} ${700 - unfinished} M ${x + 20} ${720 - unfinished} L ${x + 60} ${700 - unfinished}`} stroke={AMB} strokeWidth={4} fill="none" />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "#2a1a24" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "752px 820px" }}>
        <Full>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={0} y={i * 200} width={1080} height={196} fill={i % 2 ? "#3a2230" : "#33202c"} />)}
          <g transform="rotate(-4 540 960)">
            <rect x={70} y={520} width={950} height={900} fill="#000" opacity={0.35} transform="translate(16 20)" />
            {/* левая страница */}
            <rect x={70} y={520} width={470} height={900} fill="#f1dfbd" stroke={INK} strokeWidth={5} />
            <text x={100} y={600} fontFamily={PLAYFAIR} fontSize={52} fill={INK}>L&apos;ILLUSTRÉ</text>
            <text x={100} y={640} fontFamily={ELITE} fontSize={22} fill="#6a4a3a">N° 68 · 1968</text>
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x={100} y={690 + i * 42} width={i % 5 === 4 ? 240 : 400} height={12} fill="#b8a07e" />)}
            {/* правая страница с чертежом */}
            <g transform={`translate(540 0) scale(${Math.max(0.02, flip)} 1) translate(-540 0)`}>
              <rect x={540} y={520} width={480} height={900} fill="#f6e6c6" stroke={INK} strokeWidth={5} />
              <text x={570} y={590} fontFamily={ANTON} fontSize={44} fill={INK}>NEW YORK</text>
              <text x={570} y={630} fontFamily={ELITE} fontSize={22} fill="#6a4a3a">les tours jumelles — projet</text>
              <rect x={570} y={660} width={420} height={600} fill="#1b2a6b" stroke={INK} strokeWidth={4} />
              {tower(604, 70)}
              {tower(860, 50)}
              <text x={580} y={1250} fontFamily={ELITE} fontSize={18} fill={CYAN}>WTC · 110 FL. · 1350 FT</text>
              {Array.from({ length: 3 }, (_, i) => <rect key={i} x={570} y={1290 + i * 34} width={i === 2 ? 220 : 420} height={12} fill="#b8a07e" />)}
            </g>
            <rect x={536} y={520} width={8} height={900} fill="#c9b38c" />
            {/* линия карандашом */}
            {draw > 0 ? <line x1={A[0]} y1={A[1]} x2={A[0] + (B[0] - A[0]) * draw} y2={A[1] + (B[1] - A[1]) * draw} stroke={glow ? CYAN : "#2a2a2a"} strokeWidth={glow ? 6 : 4} strokeLinecap="round" /> : null}
            {glow ? <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={CYAN} strokeWidth={22} opacity={0.3 * glow} strokeLinecap="round" /> : null}
            {fig > 0 ? (
              <g stroke={glow ? CYAN : "#2a2a2a"} strokeWidth={3} fill="none" opacity={fig}>
                <circle cx={752} cy={792} r={7} />
                <line x1={752} y1={799} x2={752} y2={815} />
                <line x1={730} y1={803} x2={774} y2={803} />
                <line x1={752} y1={815} x2={746} y2={822} />
                <line x1={752} y1={815} x2={758} y2={822} />
              </g>
            ) : null}
            {glow ? [0, 1, 2, 3, 4, 5].map((i) => {
              const a = i * 60 * D, r = 30 + (f - 134) * 3;
              return <circle key={i} cx={752 + Math.cos(a) * r} cy={822 + Math.sin(a) * r} r={4} fill={AMB} opacity={ip(f, [134, 160], [1, 0])} />;
            }) : null}
            {/* рука с карандашом */}
            <g transform={`translate(${tip[0] + handIn * 0.6} ${tip[1] + handIn}) rotate(-35)`}>
              <rect x={-7} y={0} width={14} height={200} fill={TAXI} stroke={INK} strokeWidth={4} />
              <path d="M -7 0 L 0 -26 L 7 0 Z" fill="#f2c39a" stroke={INK} strokeWidth={3} />
              <path d="M -2.5 -16 L 0 -26 L 2.5 -16 Z" fill={INK} />
              <rect x={-7} y={196} width={14} height={20} fill="#ff8aa8" stroke={INK} strokeWidth={3} />
              <ellipse cx={14} cy={120} rx={44} ry={60} fill={SKIN} stroke={INK} strokeWidth={5} />
              <rect x={-40} y={165} width={110} height={220} rx={30} fill="#16121f" stroke={AMB} strokeWidth={5} />
            </g>
          </g>
        </Full>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  return f < 100 ? <Paris f={f} /> : <Magazine f={f - 100} />;
};

// =============== СЦЕНА 4 (22–34 c): ночь, лестница, лук ===============
const Stairs: React.FC<{ f: number }> = ({ f }) => {
  const RISE = 40, RUN = 60, slope = RISE / RUN;
  const lead = 420 + f * 4.8;
  const yAt = (x: number) => 2400 - (x - 0) * slope;
  const camX = lead - 640, camY = yAt(lead) - 1000;
  const ph = (f / 25) * Math.PI * 2;
  const people: [number, Look, number][] = [[lead, PETIT, 0], [lead - 190, FR1, 1.3], [lead - 380, FR2, 2.6]];
  const shoulders: V[] = [];
  const figs = people.map(([x, look, o]) => {
    const w = walk(ph + o, 26);
    const pose: Pose = { lean: 16, aL: [135, -45], aR: [145, -35], lL: [w.lL[0] + 22, w.lL[1] + 8], lR: [w.lR[0] + 22, w.lR[1] + 8] };
    const s = 1.25;
    const bob = Math.abs(Math.sin(ph + o)) * 8;
    const y = yAt(x) - footDrop(pose) * s + 20 - bob;
    shoulders.push(go([x, y], 180 - pose.lean, T_LEN * s));
    return <Man key={look.hair} x={x} y={y} s={s} pose={pose} look={look} face={1} smile={-0.6} />;
  });
  const steps: V[] = [];
  for (let i = 0; i < 70; i++) {
    const x = i * RUN - 200;
    steps.push([x, yAt(x)], [x, yAt(x) - RISE]);
  }
  const cable = shoulders.reduce((d, p, i) => (i === 0 ? `M ${p[0] + 10} ${p[1] - 6}` : d + ` Q ${(p[0] + shoulders[i - 1][0]) / 2} ${(p[1] + shoulders[i - 1][1]) / 2 + 50} ${p[0]} ${p[1] - 6}`), "");
  const last = shoulders[2];
  return (
    <AbsoluteFill style={{ background: "#0c0926" }}>
      <Full>
        <g transform={`translate(${-camX} ${-camY})`}>
          <rect x={-400} y={-400} width={5000} height={3600} fill="#130f36" />
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i}>
              <rect x={i * 260 - 200} y={yAt(i * 260) - 620} width={8} height={700} fill={IND2} />
              <circle cx={i * 260 - 80} cy={yAt(i * 260) - 520} r={60} fill={CYAN} opacity={0.12} />
              <rect x={i * 260 - 100} y={yAt(i * 260) - 530} width={40} height={18} rx={4} fill={CYAN} opacity={0.9} />
              {i % 3 === 0 ? <text x={i * 260 - 40} y={yAt(i * 260) - 380} fontFamily={ANTON} fontSize={70} fill={IND3} opacity={0.6}>{104 + i / 3}</text> : null}
            </g>
          ))}
          <polygon points={pts([...steps, [steps[steps.length - 1][0], 3400], [-200, 3400]])} fill="#2a2266" stroke={AMB} strokeWidth={4} />
          <polyline points={pts(steps.filter((_, i) => i % 2 === 1).map((p) => [p[0], p[1] + 30] as V))} stroke={IND3} strokeWidth={3} fill="none" />
          {/* перила */}
          <line x1={-200} y1={yAt(-200) - 180} x2={4000} y2={yAt(4000) - 180} stroke={AMB} strokeWidth={6} opacity={0.8} />
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={i * 120 - 200} y1={yAt(i * 120 - 200)} x2={i * 120 - 200} y2={yAt(i * 120 - 200) - 180} stroke={IND3} strokeWidth={4} />)}
          {/* моток троса сзади */}
          <path d={`${cable}`} stroke={INK} strokeWidth={22} fill="none" />
          <path d={`${cable}`} stroke="#9aa4c8" strokeWidth={12} fill="none" />
          <path d={`M ${last[0]} ${last[1] - 6} Q ${last[0] - 120} ${last[1] + 40} ${last[0] - 160} ${last[1] + 260}`} stroke="#9aa4c8" strokeWidth={12} fill="none" />
          {figs}
        </g>
      </Full>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 45%, transparent 30%, rgba(5,3,15,0.85) 85%)" }} />
      <Caption f={f} from={6} to={110} text="NEW YORK · AUG 6, 1974 · NIGHT" retro y={230} />
    </AbsoluteFill>
  );
};

const Roof: React.FC<{ f: number }> = ({ f }) => {
  // f = 0 на 28 c; натяжение 18..48, выстрел 48, попадание 82
  const drawT = ip(f, [18, 46], [0, 1], Easing.inOut(Easing.quad));
  const released = f >= 48;
  const archer: Pose = {
    lean: -4, aL: [92, 90],
    aR: released ? [95, 60] : [92 - drawT * 8, 90 - drawT * 175], lL: [-14, -8], lR: [16, 8],
  };
  const ax = 330, ay = 1150 - footDrop(archer) * 1.15;
  const hand = go(go(go([0, 0], 180 - archer.lean, T_LEN), archer.aL[0], UA), archer.aL[1], FA);
  const start: V = [ax + hand[0] * 1.15 + 70, ay + hand[1] * 1.15];
  const end: V = [860, 1088];
  const traj = (t: number): V => [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t - 260 * 4 * t * (1 - t)];
  const tA = ip(f, [48, 82], [0, 1]);
  const trail = Array.from({ length: 31 }, (_, i) => traj((i / 30) * tA));
  const head = traj(tA), prev = traj(Math.max(0, tA - 0.02));
  const ang = Math.atan2(head[1] - prev[1], head[0] - prev[0]) / D;
  const sag = ip(f, [90, 140], [0, 1]);
  const thick = ip(f, [130, 170], [0, 1]);
  const linePath = sag > 0
    ? `M ${start[0]} ${start[1]} Q ${(start[0] + end[0]) / 2} ${(start[1] + end[1]) / 2 + 60 * sag - 520 * (1 - sag)} ${end[0]} ${end[1]}`
    : `M ${pts(trail).replace(/ /g, " L ")}`;
  const petitPose: Pose = { lean: 25, aL: [70, 120], aR: [60, 110], lL: [80, 0], lR: [100, -10] };
  return (
    <AbsoluteFill style={{ background: IND0 }}>
      <Full>
        <defs>
          <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#07051a" />
            <stop offset="1" stopColor="#241c63" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#nsky)" />
        <Stars f={f} h={1000} n={90} />
        <circle cx={860} cy={360} r={70} fill="#fff2d0" />
        <circle cx={890} cy={340} r={62} fill="#0d0a2a" opacity={0.9} />
        {/* город далеко внизу */}
        {Array.from({ length: 160 }, (_, i) => (
          <circle key={i} cx={rnd(i + 300) * 1080} cy={1500 + rnd(i + 600) * 420} r={1.5 + rnd(i) * 2.5} fill={rnd(i + 2) > 0.6 ? AMB : CYAN} opacity={0.7} />
        ))}
        {/* дальняя башня */}
        <polygon points="760,1080 1080,1060 1080,1920 760,1920" fill={IND1} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={770 + i * 11} y1={1080 - i * 0.7} x2={770 + i * 11} y2={1920} stroke={IND2} strokeWidth={4} />)}
        <rect x={760} y={1060} width={320} height={26} fill={IND2} stroke={AMB} strokeWidth={4} />
        {/* ближняя крыша */}
        <polygon points="0,1150 540,1150 540,1920 0,1920" fill="#241c5a" stroke={INK} strokeWidth={6} />
        <rect x={0} y={1140} width={545} height={22} fill={IND2} stroke={AMB} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 70} y1={1170} x2={i * 70 + 30} y2={1920} stroke={IND1} strokeWidth={4} />)}
        <ellipse cx={130} cy={1170} rx={80} ry={30} fill="#5a5a80" stroke={INK} strokeWidth={4} />
        <ellipse cx={130} cy={1160} rx={50} ry={16} fill="none" stroke="#9aa4c8" strokeWidth={8} />
        <Man x={170} y={1150 - footDrop(petitPose) * 1.05} s={1.05} pose={petitPose} look={PETIT} face={1} smile={0.5} />
        <Man x={ax} y={ay} s={1.15} pose={archer} look={FR1} face={1} smile={0} bow={released ? 0 : drawT} />
        {/* леска / трос */}
        {f >= 48 ? (
          <g>
            <path d={linePath} stroke={CYAN} strokeWidth={10 + thick * 14} opacity={0.3} fill="none" />
            <path d={linePath} stroke={thick > 0.5 ? "#d9e4ff" : CYAN} strokeWidth={2.5 + thick * 7} fill="none" />
          </g>
        ) : null}
        {f >= 48 && f < 140 ? (
          <g transform={`translate(${head[0]} ${head[1]}) rotate(${ang})`}>
            <line x1={-70} y1={0} x2={0} y2={0} stroke="#e9d3a0" strokeWidth={6} />
            <path d="M 0 -9 L 20 0 L 0 9 Z" fill={CYAN} stroke={INK} strokeWidth={2} />
            <path d="M -70 0 L -84 -10 M -70 0 L -84 10" stroke={AMB} strokeWidth={5} />
          </g>
        ) : null}
        {f >= 82 && f < 100 ? <circle cx={end[0]} cy={end[1]} r={(f - 82) * 4} fill="none" stroke={AMB} strokeWidth={5} opacity={ip(f, [82, 100], [1, 0])} /> : null}
      </Full>
      <Caption f={f} from={120} to={180} text="ARROW → LINE → 200 KG CABLE" retro y={230} />
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  return f < 180 ? <Stairs f={f} /> : <Roof f={f - 180} />;
};

// =============== СЦЕНА 5 (34–48 c): рассвет, проход по тросу ===============
const DawnSky: React.FC<{ id: string }> = ({ id }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b1550" />
        <stop offset="0.45" stopColor="#6a2d6e" />
        <stop offset="0.7" stopColor={AMB2} />
        <stop offset="0.85" stopColor={AMB} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} />
  </>
);

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  // ---- кадр А: две башни, крошечный Петит выходит на трос ----
  if (f < 90) {
    const zoom = ip(f, [0, 90], [1, 1.12]);
    const px = ip(f, [20, 90], [432, 470]);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 560px" }}>
          <Full>
            <DawnSky id="d1" />
            <circle cx={540} cy={1500} r={220} fill="#ffd27a" opacity={0.9} />
            <Tower x={150} y={540} w={280} h={1500} seed={2} rimSide="r" warm={1} antenna />
            <Tower x={650} y={560} w={280} h={1500} seed={6} rimSide="l" warm={1} />
            <line x1={430} y1={548} x2={650} y2={566} stroke={INK} strokeWidth={5} />
            <line x1={430} y1={546} x2={650} y2={564} stroke="#fff3d6" strokeWidth={2.5} />
            {[0, 1, 2].map((i) => <Cloud key={i} x={((i * 420 + f * 1.4) % 1500) - 200} y={1150 + i * 90} s={1.6} o={0.75} col="#9a5a8a" />)}
            <Man x={px} y={548 + (px - 430) * 0.08 - footDrop(STAND) * 0.16} s={0.16} pose={STAND} look={PETIT} pole={0} />
            {[0, 1, 2, 3].map((i) => {
              const x = ((i * 290 + f * 3) % 1300) - 100, y = 760 + i * 60 + Math.sin(f / 5 + i) * 8;
              return <path key={i} d={`M ${x - 14} ${y} Q ${x - 7} ${y - 8 - Math.sin(f / 3 + i) * 6} ${x} ${y} Q ${x + 7} ${y - 8 - Math.sin(f / 3 + i) * 6} ${x + 14} ${y}`} stroke={INK} strokeWidth={4} fill="none" />;
            })}
          </Full>
        </AbsoluteFill>
        <Caption f={f} from={8} to={88} text="AUG 7, 1974 · 7:15 AM" retro y={230} />
      </AbsoluteFill>
    );
  }
  // ---- кадр Б: проход, сидит, лежит ----
  if (f < 290) {
    const g = f - 90;
    const walking = g < 90;
    const ph = (g / 22.5) * Math.PI;
    const w = walk(ph, 20);
    const walkPose: Pose = { lean: 4, aL: [40, 100], aR: [48, 108], lL: walking ? w.lL : [0, 0], lR: walking ? w.lR : [0, 0] };
    const sit: Pose = { lean: -4, aL: [30, 90], aR: [38, 96], lL: [86, 6], lR: [94, 14] };
    const lie: Pose = { lean: 0, aL: [92, 92], aR: [100, 96], lL: [-2, -2], lR: [4, 2] };
    const pose = poseAt(g, [[85, walkPose], [105, sit], [150, sit], [168, lie]]);
    const rot = ip(g, [150, 168], [0, -90], Easing.inOut(Easing.quad));
    const wireY = 1150;
    const xMove = ip(g, [0, 90], [300, 560]);
    const camX = ip(g, [0, 90], [-80, 120]);
    const s = 1.35;
    const lift = rot !== 0 ? ip(g, [150, 168], [0, 22]) : 0;
    const sitDrop = ip(g, [85, 105], [footDrop(walkPose), 4]);
    const hipY = wireY - sitDrop * s - lift;
    const wob = Math.sin(g / 6) * ip(g, [0, 20], [2, 6]);
    return (
      <AbsoluteFill>
        <Full>
          <DawnSky id="d2" />
          <g transform={`translate(${-camX * 0.15} 0)`}>
            <circle cx={620} cy={1450} r={300} fill="#ffd27a" opacity={0.95} />
            {[0, 1, 2, 3, 4, 5].map((i) => <Cloud key={i} x={((i * 260 + g * 0.8) % 1600) - 250} y={1500 + (i % 3) * 110} s={1.8} o={0.85} col={i % 2 ? "#a0558a" : "#7a3f86"} />)}
          </g>
          <g transform={`translate(${-camX} 0)`}>
            <Tower x={-260} y={wireY + 10} w={300} h={900} seed={11} rimSide="r" warm={1} />
            <path d={`M 40 ${wireY} Q ${xMove} ${wireY + 26 + wob} 1500 ${wireY}`} stroke={INK} strokeWidth={14} fill="none" />
            <path d={`M 40 ${wireY - 2} Q ${xMove} ${wireY + 24 + wob} 1500 ${wireY - 2}`} stroke="#fff3d6" strokeWidth={6} fill="none" />
            <Man x={xMove} y={hipY + 12 + wob * 0.5} s={s} rot={rot} pose={pose} look={PETIT} face={1} smile={g > 100 ? 1.6 : 0.8} pole={rot !== 0 ? 90 + rot * 0 + Math.sin(g / 9) * 3 : Math.sin(g / 9) * 6} />
          </g>
        </Full>
        <Caption f={g} from={28} to={92} text="45 MINUTES · 8 CROSSINGS" retro y={230} />
      </AbsoluteFill>
    );
  }
  // ---- кадр В: толпа внизу ----
  if (f < 330) {
    const g = f - 290;
    return (
      <AbsoluteFill>
        <Full>
          <DawnSky id="d3" />
          <polygon points="80,1920 440,1920 520,200 470,200" fill="#3a2a6a" stroke={INK} strokeWidth={5} />
          <polygon points="1000,1920 640,1920 560,200 610,200" fill="#3a2a6a" stroke={INK} strokeWidth={5} />
          <polygon points="440,1920 470,1920 520,200 515,200" fill={AMB} opacity={0.8} />
          <polygon points="640,1920 610,1920 560,200 565,200" fill={AMB} opacity={0.8} />
          <line x1={520} y1={206} x2={560} y2={206} stroke="#fff3d6" strokeWidth={2} />
          <circle cx={536} cy={202} r={3} fill={INK} />
          {Array.from({ length: 34 }, (_, i) => {
            const row = Math.floor(i / 12), x = (i % 12) * 98 + (row % 2) * 49 - 20, y = 1560 + row * 130;
            const pointing = rnd(i) > 0.65;
            return (
              <g key={i} transform={`translate(${x} ${y + Math.sin(g / 4 + i) * 3})`}>
                <path d="M -55 140 Q -50 40 0 40 Q 50 40 55 140 Z" fill={INK} stroke={AMB} strokeWidth={4} />
                <circle cx={0} cy={0} r={38} fill={INK} stroke={AMB} strokeWidth={4} />
                {pointing ? <line x1={30} y1={60} x2={50 + rnd(i + 1) * 30} y2={-90} stroke={INK} strokeWidth={18} strokeLinecap="round" /> : null}
                {pointing ? <line x1={30} y1={60} x2={50 + rnd(i + 1) * 30} y2={-90} stroke={AMB} strokeWidth={4} strokeLinecap="round" opacity={0.7} /> : null}
              </g>
            );
          })}
        </Full>
      </AbsoluteFill>
    );
  }
  // ---- кадр Г: машет полиции ----
  const g = f - 330;
  const wireY = 1150;
  const wave = Math.sin(g / 3.5) * 22;
  const pose: Pose = { lean: -3, aL: [30, 80], aR: [150, 175 + wave], lL: [-4, -2], lR: [6, 2] };
  const copIn = ip(g, [0, 24], [200, 0], Easing.out(Easing.cubic));
  const copPose: Pose = { lean: 4, aL: [60, 120 + Math.sin(g / 4) * 25], aR: [-10, -4], lL: [-6, -3], lR: [6, 3] };
  return (
    <AbsoluteFill>
      <Full>
        <DawnSky id="d4" />
        <circle cx={300} cy={1450} r={260} fill="#ffd27a" opacity={0.95} />
        {[0, 1, 2, 3].map((i) => <Cloud key={i} x={((i * 330 + g) % 1500) - 250} y={1500 + (i % 2) * 140} s={1.8} o={0.85} col="#7a3f86" />)}
        <Tower x={780} y={wireY + 12} w={400} h={900} seed={14} rimSide="l" warm={1} />
        <path d={`M -20 ${wireY} Q 380 ${wireY + 22} 790 ${wireY}`} stroke={INK} strokeWidth={14} fill="none" />
        <path d={`M -20 ${wireY - 2} Q 380 ${wireY + 20} 790 ${wireY - 2}`} stroke="#fff3d6" strokeWidth={6} fill="none" />
        <Man x={860 + copIn} y={wireY + 12 - footDrop(copPose) * 1.2} s={1.2} pose={copPose} look={COP} face={-1} smile={-0.8} flip />
        <Man x={990 + copIn} y={wireY + 12 - footDrop(STAND) * 1.2} s={1.2} pose={{ ...STAND, aR: [40, 140] }} look={COP} face={-1} smile={-0.5} oMouth={g > 6 && g < 30} flip />
        <Man x={420} y={wireY + 18 - footDrop(pose) * 1.35} s={1.35} pose={pose} look={PETIT} face={1} smile={2} />
        {/* шест в одной руке */}
        {(() => {
          const hL = go(go(go([0, 0], 183, T_LEN), pose.aL[0], UA), pose.aL[1], FA);
          const c: V = [420 + hL[0] * 1.35, wireY + 18 - footDrop(pose) * 1.35 + hL[1] * 1.35];
          return (
            <g>
              <line x1={c[0] - 300} y1={c[1] + 20} x2={c[0] + 300} y2={c[1] - 20} stroke={AMB} strokeWidth={14} strokeLinecap="round" />
              <line x1={c[0] - 300} y1={c[1] + 20} x2={c[0] + 300} y2={c[1] - 20} stroke="#e8d3a8" strokeWidth={8} strokeLinecap="round" />
            </g>
          );
        })()}
      </Full>
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 6 (48–55 c): наручники и газеты ===============
const PAPERS = [
  { at: 54, x: 540, y: 690, r: -8, name: "THE DAILY SKY", head: "MAN WALKS ON AIR!", sub: "Frenchman crosses between the Twin Towers" },
  { at: 87, x: 520, y: 1150, r: 7, name: "LE CIEL DE PARIS", head: "FUNAMBULE ENTRE LES TOURS", sub: "45 minutes au-dessus de New York" },
  { at: 120, x: 560, y: 900, r: -3, name: "EVENING STAR", head: "ARRESTED… AND ADORED", sub: "Police: “He was dancing on the wire”" },
  { at: 150, x: 545, y: 1320, r: 10, name: "NEW YORK DAILY", head: "1,350 FT. HIGH WIRE WALK", sub: "The city stops to look up" },
];
const FLASHES = [36, 69, 93, 132, 159, 183];

const Paper: React.FC<{ f: number; p: (typeof PAPERS)[number] }> = ({ f, p }) => {
  const t = f - p.at + 8;
  if (t < 0) return null;
  const k = ip(t, [0, 9], [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{
      position: "absolute", left: p.x - 380, top: p.y - 270, width: 760, height: 540, background: "#f1e3c4", border: `5px solid ${INK}`,
      boxShadow: `0 20px 50px rgba(0,0,0,.55), 0 0 0 4px ${AMB}`, transform: `rotate(${p.r + (1 - k) * 540}deg) scale(${3 - 2 * k})`, opacity: k,
      padding: "22px 30px", boxSizing: "border-box", fontFamily: ANTON, color: INK,
    }}>
      <div style={{ fontFamily: PLAYFAIR, fontSize: 52, textAlign: "center", borderBottom: `4px double ${INK}`, paddingBottom: 6 }}>{p.name}</div>
      <div style={{ fontFamily: ELITE, fontSize: 18, display: "flex", justifyContent: "space-between", borderBottom: `2px solid ${INK}`, padding: "4px 0" }}>
        <span>AUGUST 8, 1974</span><span>FINAL EDITION</span>
      </div>
      <div style={{ fontSize: 66, lineHeight: 1.05, textAlign: "center", marginTop: 12 }}>{p.head}</div>
      <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
        <svg width={230} height={200} viewBox="0 0 230 200" style={{ background: "#2b2a3a", border: `3px solid ${INK}` }}>
          <rect x={30} y={40} width={50} height={170} fill="#9a98b0" />
          <rect x={150} y={46} width={50} height={170} fill="#9a98b0" />
          <line x1={80} y1={44} x2={150} y2={50} stroke="#fff" strokeWidth={2} />
          <circle cx={114} cy={40} r={4} fill="#fff" />
          <line x1={98} y1={38} x2={130} y2={40} stroke="#fff" strokeWidth={2} />
        </svg>
        <div style={{ flex: 1, fontFamily: ELITE, fontSize: 24, lineHeight: 1.25 }}>
          {p.sub}
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 10, background: "#b8a07e", marginTop: 12, width: i === 3 ? "60%" : "100%" }} />)}
        </div>
      </div>
    </div>
  );
};

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const ph = (f / 18) * Math.PI;
  const w = walk(ph, 16);
  const scroll = f * 3;
  const petit: Pose = { lean: 0, aL: [-22, 15], aR: [22, -15], ...w };
  const cop: Pose = { lean: 0, aL: [-10, -5], aR: [55, 75], ...walk(ph + 0.3, 16) };
  const cop2: Pose = { ...cop, aL: [-55, -75], aR: [10, 5] };
  const y0 = 1500;
  const glint = ip(f, [16, 20, 30], [0, 1, 0]);
  const flash = FLASHES.reduce((m, a) => Math.max(m, ip(f, [a, a + 1, a + 6], [0, 0.85, 0])), 0);
  return (
    <AbsoluteFill style={{ background: "#1a1240" }}>
      <Full>
        <defs>
          <linearGradient id="st6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1f6e" />
            <stop offset="1" stopColor={AMB2} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1300} fill="url(#st6)" />
        <g transform={`translate(${-scroll % 260} 0)`}>
          {Array.from({ length: 7 }, (_, i) => <Tower key={i} x={i * 260 - 40} y={300 + rnd(i) * 200} w={220} h={1100} seed={i * 5} rimSide="r" warm={1} />)}
        </g>
        <rect x={0} y={1300} width={1080} height={620} fill="#1d1648" />
        {/* толпа за ограждением */}
        <g transform={`translate(${-(scroll * 1.6) % 98} 0)`}>
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i} transform={`translate(${i * 98} ${1260 + Math.sin(f / 4 + i) * 6})`}>
              <path d="M -50 120 Q -45 30 0 30 Q 45 30 50 120 Z" fill={INK} stroke={AMB} strokeWidth={3} />
              <circle r={34} fill={INK} stroke={AMB} strokeWidth={3} />
              {i % 3 === 0 ? <rect x={-22} y={-10} width={44} height={30} fill="#222" stroke={CYAN} strokeWidth={3} /> : null}
            </g>
          ))}
        </g>
        <rect x={0} y={1370} width={1080} height={18} fill="#d0c060" stroke={INK} strokeWidth={3} />
        <Man x={320} y={y0 - footDrop(cop) * 1.6} s={1.6} pose={cop} look={COP} face={1} smile={-0.4} />
        <Man x={540} y={y0 + 20 - footDrop(petit) * 1.7} s={1.7} pose={petit} look={PETIT} face={0} smile={2.4} cuffs />
        <Man x={760} y={y0 - footDrop(cop2) * 1.6} s={1.6} pose={cop2} look={COP} face={-1} smile={-0.4} />
        {glint > 0 ? <path d="M 0 -40 L 8 -8 L 40 0 L 8 8 L 0 40 L -8 8 L -40 0 L -8 -8 Z" fill="#fff" transform={`translate(560 ${y0 - 330}) scale(${glint * 1.5})`} /> : null}
      </Full>
      {PAPERS.map((p) => <Paper key={p.name} f={f} p={p} />)}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 7 (55–60 c): снова наш герой, первый шаг, белый ===============
const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const wireY = 1690;
  const breathIn = ip(f, [0, 45], [0, 1]) - ip(f, [48, 80], [0, 1]);
  const step = ip(f, [93, 116], [0, 1], Easing.inOut(Easing.cubic));
  const bob = Math.sin(step * Math.PI) * -26;
  const white = ip(f, [100, 132], [0, 1], Easing.in(Easing.quad));
  const title = ip(f, [124, 140], [0, 1]);
  const puff = ip(f, [50, 64, 86], [0, 1, 0]);
  const sway = Math.sin(f / 16) * 0.8;
  return (
    <AbsoluteFill style={{ background: IND0, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + step * 0.22})`, transformOrigin: "540px 1100px" }}>
        <Full>
          <DawnSky id="d7" />
          <Stars f={f} h={600} n={40} />
          <circle cx={540} cy={1560} r={330} fill="#ffd27a" opacity={0.85} />
          {[0, 1, 2, 3, 4].map((i) => <Cloud key={i} x={((i * 290 + f * 1.2) % 1500) - 200} y={1500 + (i % 3) * 120} s={1.5} o={0.85} col="#7a3f86" />)}
          <Tower x={-60} y={wireY + 6} w={200} h={500} seed={3} rimSide="r" warm={1} />
          <Tower x={940} y={wireY + 6} w={200} h={500} seed={8} rimSide="l" warm={1} />
          <path d={`M 100 ${wireY} Q 540 ${wireY + 18} 980 ${wireY}`} stroke={INK} strokeWidth={20} fill="none" />
          <path d={`M 100 ${wireY} Q 540 ${wireY + 18} 980 ${wireY}`} stroke="#fff3d6" strokeWidth={12} fill="none" />
        </Full>
        <AbsoluteFill style={{ transform: `rotate(${sway}deg) translateY(${bob}px)`, transformOrigin: `540px ${wireY}px` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scaleY(${1 + breathIn * 0.012})`, transformOrigin: `540px ${wireY}px` }}>
            <Hero x={540 - HW / 2} y={wireY + 14 - 1290} s={1} />
          </div>
          <Full>
            <g opacity={puff}>
              {[0, 1, 2].map((i) => <circle key={i} cx={560 + i * 26 + (f - 50) * 1.5} cy={420 + i * 6} r={16 + i * 8 + (f - 50) * 0.4} fill="#cfefff" opacity={0.55 - i * 0.12} />)}
            </g>
          </Full>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: title }}>
        <div style={{ fontFamily: RIGHTEOUS, fontSize: 64, color: IND1, textAlign: "center", padding: "0 80px", lineHeight: 1.15 }}>
          Every wire starts
          <br />
          with one step.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== сборка ===============
const Grain: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <Img src={staticFile("towers/grain.png")} style={{ position: "absolute", width: 1600, height: 2800, left: -(rnd(f) * 500), top: -(rnd(f + 1) * 860), imageRendering: "pixelated" }} />
  </AbsoluteFill>
);

const RetroFX: React.FC<{ f: number }> = ({ f }) => {
  const scratches = [0, 1].map((k) => (rnd(Math.floor(f / 3) + k * 50) > 0.6 ? rnd(f + k) * 1080 : -10));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(255,150,60,0.10)", mixBlendMode: "overlay" }} />
      {scratches.map((x, i) => <div key={i} style={{ position: "absolute", left: x, top: 0, width: 2, height: 1920, background: "rgba(255,240,210,0.35)" }} />)}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px 60px rgba(10,5,20,0.85)", borderRadius: 40 }} />
      <AbsoluteFill style={{ background: "#000", opacity: rnd(f * 7) * 0.06 }} />
    </AbsoluteFill>
  );
};

export const TowersFilm: React.FC = () => {
  const f = useCurrentFrame();
  const retro = f >= 330 && f < 1650;
  const weave = retro ? `translate(${(rnd(f) - 0.5) * 3}px, ${(rnd(f + 3) - 0.5) * 4}px)` : "none";
  const cut = (a: number) => ip(f, [a - 1, a, a + 5], [0, 0.9, 0]);
  const whip = Math.max(cut(150), cut(360), cut(660), cut(840), cut(1020), cut(1440), cut(1650));
  return (
    <AbsoluteFill style={{ background: IND0 }}>
      <AbsoluteFill style={{ transform: weave, filter: retro ? "sepia(0.22) saturate(1.15) contrast(1.06)" : "none" }}>
        <Sequence from={0} durationInFrames={150}><Scene1 /></Sequence>
        <Sequence from={150} durationInFrames={210}><Scene2 /></Sequence>
        <Sequence from={360} durationInFrames={300}><Scene3 /></Sequence>
        <Sequence from={660} durationInFrames={360}><Scene4 /></Sequence>
        <Sequence from={1020} durationInFrames={420}><Scene5 /></Sequence>
        <Sequence from={1440} durationInFrames={210}><Scene6 /></Sequence>
        <Sequence from={1650} durationInFrames={150}><Scene7 /></Sequence>
      </AbsoluteFill>
      {retro ? <RetroFX f={f} /> : <AbsoluteFill style={{ boxShadow: "inset 0 0 200px 40px rgba(5,3,15,0.8)", pointerEvents: "none", opacity: ip(f, [1745, 1775], [1, 0]) }} />}
      <Grain f={f} o={retro ? 0.35 : 0.18} />
      <AbsoluteFill style={{ background: "#fff", opacity: whip * 0.35 }} />
      <Audio src={staticFile("towers/sound.wav")} />
    </AbsoluteFill>
  );
};
