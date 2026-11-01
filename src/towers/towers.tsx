// «The Man Who Walked Between the Towers» — 60 сек, без озвучки: звуки (public/towers/sound.wav) + надписи.
// Стиль «анимационной истории»: плоские фигуры без контуров, тёмно-синяя гамма, рубрика сверху, крупные титры.
// Персонажи — куклы из src/characters/Rig.tsx (MASCOT — герой канала, PETIT, друзья, полиция).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Sequence } from "remotion";
import { BODY, COP, D, FRIEND1, FRIEND2, Look, MASCOT, PASSER, PETIT, Person, Pose, STAND, Shadow, V, go, lerp, stepFoot } from "../characters/Rig";

// ---------- шрифты (локально, без интернета) ----------
const FONTS: [string, string, string?][] = [
  ["TwMont", "Montserrat-latin", "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"],
  ["TwMont", "Montserrat-cyrillic", "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116"],
  ["TwElite", "SpecialElite"], ["TwAnton", "Anton"], ["TwPlayfair", "PlayfairDisplay"],
];
if (typeof document !== "undefined") {
  const h = delayRender("towers fonts");
  Promise.all(
    FONTS.map(([fam, file, range]) => {
      const ff = new FontFace(fam, `url(${staticFile(`towers/fonts/${file}.woff2`)}) format("woff2")`, range ? { unicodeRange: range } : {});
      return ff.load().then((x) => document.fonts.add(x));
    }),
  ).then(() => continueRender(h), () => continueRender(h));
}
const MONT = "TwMont", ELITE = "TwElite", ANTON = "TwAnton", PLAYFAIR = "TwPlayfair";

export const TOWERS_FRAMES = 1800;

// ---------- палитра ----------
const N0 = "#0e1628", N2 = "#2a3a5e", N3 = "#3a4c74", N4 = "#4d6190";
const YEL = "#f5c84c", RED = "#e0524a", WH = "#eef2f8", TAXI = "#f2c230", INK = "#141b2e";

// ---------- утилиты ----------
const ip = (f: number, i: number[], o: number[], e?: (t: number) => number) =>
  interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pts = (a: V[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const Full: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);
const Sky: React.FC<{ id: string; stops: [number, string][]; h?: number }> = ({ id, stops, h = 1920 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
      </linearGradient>
    </defs>
    <rect width={1080} height={h} fill={`url(#${id})`} />
  </>
);
const DAWN: [number, string][] = [[0, "#1d2b4a"], [0.35, "#454876"], [0.58, "#9a6a80"], [0.75, "#df9e7c"], [1, "#f0c08a"]];
const NIGHTSKY: [number, string][] = [[0, "#22325a"], [0.6, "#1d2b4a"], [1, "#2c3c66"]];

const Stars: React.FC<{ f: number; n?: number; h?: number }> = ({ f, n = 60, h = 1100 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * h} r={1 + rnd(i + 7) * 1.8} fill={WH} opacity={0.25 + 0.45 * Math.abs(Math.sin(f / 15 + i))} />
    ))}
  </g>
);
// медленная «пыль», как в примере
const Dust: React.FC<{ f: number; n?: number }> = ({ f, n = 45 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const y = ((rnd(i + 3) * 2000 + f * (0.6 + rnd(i) * 0.8)) % 2000) - 40;
      const x = rnd(i + 11) * 1080 + Math.sin(f / 30 + i) * 14;
      return <circle key={i} cx={x} cy={y} r={1.2 + rnd(i + 5) * 2} fill={WH} opacity={0.15 + rnd(i + 2) * 0.2} />;
    })}
  </g>
);

// плоская башня ВТЦ
const Tower: React.FC<{ x: number; y: number; w: number; h: number; warm?: boolean; antenna?: boolean; seed?: number }> = ({ x, y, w, h, warm, antenna, seed = 0 }) => {
  const lit = warm ? "#6c6a8e" : N3, dark = warm ? "#4a4a70" : N2, line = warm ? "#7d7ba0" : N4;
  const front = w * 0.68;
  return (
    <g>
      {antenna ? <rect x={x + w * 0.42} y={y - h * 0.12} width={Math.max(4, w * 0.06)} height={h * 0.12} fill={dark} /> : null}
      <rect x={x} y={y} width={front} height={h} fill={lit} />
      <rect x={x + front} y={y} width={w - front} height={h} fill={dark} />
      {Array.from({ length: Math.floor(front / 12) }, (_, i) => <rect key={i} x={x + 6 + i * 12} y={y + 8} width={3} height={h} fill={line} opacity={0.6} />)}
      {Array.from({ length: Math.floor((w * h) / 14000) }, (_, i) => (
        <rect key={"w" + i} x={x + 6 + Math.floor(rnd(i + seed) * (front / 12)) * 12} y={y + 20 + rnd(i * 3 + seed) * (h - 40)} width={4} height={9} fill={YEL} opacity={0.45} />
      ))}
      <rect x={x} y={y} width={w} height={Math.max(3, w * 0.03)} fill={line} />
    </g>
  );
};
const Cloud: React.FC<{ x: number; y: number; s: number; o?: number; col?: string }> = ({ x, y, s, o = 0.5, col = "#5a6a94" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-150} y={-20} width={300} height={44} rx={22} fill={col} />
    <circle cx={-55} cy={-22} r={42} fill={col} />
    <circle cx={30} cy={-36} r={56} fill={col} />
    <circle cx={95} cy={-12} r={34} fill={col} />
  </g>
);
const Wire: React.FC<{ x1: number; x2: number; y: number; sag?: number; mid?: number; w?: number }> = ({ x1, x2, y, sag = 14, mid, w = 7 }) => {
  const m = mid ?? (x1 + x2) / 2;
  return (
    <g>
      <path d={`M ${x1} ${y + w * 0.4} Q ${m} ${y + sag * 2 + w * 0.4} ${x2} ${y + w * 0.4}`} stroke="#0b1020" strokeWidth={w} fill="none" opacity={0.35} />
      <path d={`M ${x1} ${y} Q ${m} ${y + sag * 2} ${x2} ${y}`} stroke="#c9d3e6" strokeWidth={w} fill="none" />
    </g>
  );
};
const wireY = (x: number, x1: number, x2: number, y: number, sag: number, mid?: number) => {
  const m = mid ?? (x1 + x2) / 2;
  const t = x <= m ? 0.5 * ((x - x1) / (m - x1)) : 0.5 + 0.5 * ((x - m) / (x2 - m));
  const tt = Math.max(0, Math.min(1, t));
  return y + 2 * tt * (1 - tt) * sag * 2;
};

// шаг по поверхности ground (мир) → таз, поза рук и ступни в локальных координатах куклы
const walkRig = (xw: number, ground: (x: number) => number, s: number, S: number, hipH = 134, lift = 22) => {
  const fl = stepFoot(xw, S, 0, ground, lift), fr = stepFoot(xw, S, 0.5, ground, lift);
  const g = (ground(xw - S * 0.2) + ground(xw + S * 0.2)) / 2;
  const hy = g - hipH * s + Math.cos((xw / S) * Math.PI * 4) * 3 * s;
  const swL = (fr[0] - xw) / S, swR = (fl[0] - xw) / S;
  const pose: Pose = { lean: 4, aL: [swL * 80, swL * 80 + 22], aR: [swR * 80, swR * 80 + 22], lL: [0, 0], lR: [0, 0] };
  return {
    hip: [xw, hy] as V, pose,
    feet: { l: [(fl[0] - xw) / s, (fl[1] - hy) / s] as V, r: [(fr[0] - xw) / s, (fr[1] - hy) / s] as V },
  };
};
const toLocal = (world: V, hip: V, s: number): V => [(world[0] - hip[0]) / s, (world[1] - hip[1]) / s];

// ---------- титры и рубрики ----------
const CAPS: [number, number, string][] = [
  [0.2, 1.9, "ВЫСОТА — *400 МЕТРОВ*"], [1.9, 3.4, "ПОД НОГАМИ — *ТОЛЬКО ТРОС*"], [3.4, 5.0, "И *НИКАКОЙ* СТРАХОВКИ"],
  [5.0, 6.4, "ОДИН НЕВЕРНЫЙ ШАГ —"], [6.4, 7.7, "И *ВСЁ*."], [7.9, 9.3, "*СТОП.*"], [9.3, 10.6, "ОДИН ЧЕЛОВЕК"], [10.6, 12.0, "УЖЕ *ПРОШЁЛ* ЗДЕСЬ"],
  [12.2, 14.0, "ФИЛИПП ПЕТИ́, *18 ЛЕТ*"], [14.0, 15.4, "УЛИЧНЫЙ *ЖОНГЛЁР*"], [15.4, 17.1, "В ПРИЁМНОЙ *У ДАНТИСТА*"],
  [17.1, 18.9, "ОН ВИДИТ *БАШНИ-БЛИЗНЕЦЫ*"], [18.9, 20.4, "ИХ ЕЩЁ *НЕ ДОСТРОИЛИ*"], [20.4, 22.0, "А ОН УЖЕ *РИСУЕТ ТРОС*"],
  [22.2, 24.0, "*ШЕСТЬ ЛЕТ* СПУСТЯ"], [24.0, 26.0, "НОЧЬЮ, *ТАЙНО*,"], [26.0, 28.0, "ОНИ НЕСУТ НАВЕРХ *200 КГ* СТАЛИ"],
  [28.0, 29.6, "МЕЖДУ КРЫШАМИ — *43 МЕТРА*"], [29.6, 31.6, "ДРУГ СТРЕЛЯЕТ *ИЗ ЛУКА*"], [31.6, 34.0, "ЛЕСКА → ВЕРЁВКА → *ТРОС*"],
  [34.2, 35.6, "РАССВЕТ."], [35.6, 37.5, "ОН *ДЕЛАЕТ ШАГ*"], [37.5, 39.5, "*400 МЕТРОВ* НАД УЛИЦЕЙ"], [39.5, 41.5, "ОН *САДИТСЯ* НА ТРОС"],
  [41.5, 43.7, "И *ЛОЖИТСЯ*"], [43.7, 45.4, "ВНИЗУ — *ТЫСЯЧИ* ЛЮДЕЙ"], [45.4, 48.0, "А ОН *МАШЕТ* ПОЛИЦИИ"],
  [48.2, 50.0, "ЕГО *АРЕСТОВЫВАЮТ*"], [50.0, 51.8, "А ОН *УЛЫБАЕТСЯ*"], [51.8, 53.4, "*8 ПРОХОДОВ* ЗА 45 МИНУТ"], [53.4, 55.0, "О НЁМ ПИШЕТ *ВЕСЬ МИР*"],
  [55.2, 57.0, "СТРАХ *НЕ ИСЧЕЗНЕТ*"], [57.0, 58.6, "НО ПЕРВЫЙ ШАГ — *ТВОЙ*"],
];
const RUBRICS: [number, number, string][] = [
  [0, 236, "ВЫСОТА · 400 М"], [360, 460, "ПАРИЖ · 1968"], [460, 510, "ПРИЁМНАЯ ДАНТИСТА"], [510, 660, "ЖУРНАЛ · 1968"],
  [660, 840, "НЬЮ-ЙОРК · 6 АВГУСТА 1974"], [840, 1020, "КРЫША · НОЧЬ"], [1020, 1310, "7 АВГУСТА · 7:15 УТРА"],
  [1310, 1350, "УЛИЦА · ВНИЗУ"], [1350, 1440, "КРЫША · ПОЛИЦИЯ"], [1440, 1650, "АРЕСТ"], [1650, 1745, "СЕЙЧАС"],
];
const Subs: React.FC<{ f: number }> = ({ f }) => {
  const s = f / 30;
  const c = CAPS.find((c) => s >= c[0] && s < c[1]);
  if (!c) return null;
  const local = f - c[0] * 30;
  const pop = ip(local, [0, 6], [0.82, 1], Easing.out(Easing.back(3)));
  const parts = c[2].split("*");
  return (
    <div style={{ position: "absolute", top: 1170, left: 60, right: 60, textAlign: "center", transform: `scale(${pop})`, opacity: ip(local, [0, 3], [0, 1]) }}>
      <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 66, lineHeight: 1.14, color: WH, WebkitTextStroke: "12px rgba(14,22,40,0.85)", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,.3)" }}>
        {parts.map((p, i) => <span key={i} style={{ color: i % 2 ? YEL : WH }}>{p}</span>)}
      </span>
    </div>
  );
};
const Rubric: React.FC<{ f: number }> = ({ f }) => {
  const r = RUBRICS.find((r) => f >= r[0] && f < r[1]);
  if (!r) return null;
  const o = ip(f, [r[0], r[0] + 6, r[1] - 6, r[1]], [0, 1, 1, 0]);
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", opacity: o }}>
      <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: WH, background: "rgba(8,12,24,0.6)", padding: "10px 22px", borderRadius: 10 }}>{r[2]}</span>
    </div>
  );
};

// пульс сердца (как в звуке)
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

// =============== СЦЕНА 1 (0–5 c): ноги героя на тросе → взгляд вниз ===============
const CityTop: React.FC<{ f: number }> = ({ f }) => {
  const step = 150, b = 112;
  const blocks: React.ReactNode[] = [];
  for (let gx = -6; gx <= 6; gx++)
    for (let gy = -8; gy <= 8; gy++) {
      const x = 540 + gx * step - b / 2, y = 960 + gy * step - b / 2, k = gx * 31 + gy * 7;
      const park = rnd(k + 9) > 0.93;
      blocks.push(
        <g key={k}>
          <rect x={x} y={y} width={b} height={b} rx={6} fill={park ? "#2f4a4a" : rnd(k) > 0.7 ? N3 : N2} />
          {park ? <circle cx={x + b / 2} cy={y + b / 2} r={22} fill="#3d5e58" /> : <rect x={x + 18} y={y + 18} width={b - 36} height={b - 36} rx={4} fill={rnd(k + 3) > 0.5 ? "#33456c" : "#26355a"} />}
        </g>,
      );
    }
  const taxis: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const vert = i % 2 === 0;
    const lane = Math.floor(rnd(i) * 13) - 6;
    const dir = rnd(i + 5) > 0.5 ? 1 : -1;
    const span = 2600;
    const pos = ((((rnd(i + 9) * span + dir * f * (2 + rnd(i) * 2.5)) % span) + span) % span) - span / 2;
    const c = lane * step + step / 2 + (dir > 0 ? 7 : -7);
    const x = vert ? 540 + c : 540 + pos, y = vert ? 960 + pos : 960 + c;
    taxis.push(<rect key={i} x={x - (vert ? 6 : 13)} y={y - (vert ? 13 : 6)} width={vert ? 12 : 26} height={vert ? 26 : 12} rx={3} fill={i % 6 === 0 ? WH : TAXI} />);
  }
  return (
    <g>
      <rect x={-800} y={-800} width={2680} height={3520} fill="#141e36" />
      {blocks}
      {taxis}
    </g>
  );
};

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const drop = ip(f, [52, 72], [0, 1], Easing.in(Easing.cubic));
  const blur = Math.sin(drop * Math.PI) * 16;
  const sway = Math.sin(f / 13) * 1.8;
  const p = pulse(f);
  const s = 3.6, wy = 1000;
  const xw = 300 + f * 3.2;
  const w = walkRig(xw, () => wy, s, 150 * s / 1.6, 136, 16 * s / 2);
  const camX = xw - 560;
  const zoom = ip(f, [70, 150], [1, 1.3]);
  return (
    <AbsoluteFill style={{ background: N0, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${-2100 * drop}px) rotate(${sway}deg)`, filter: `blur(${blur}px)` }}>
        <Full>
          <Sky id="s1" stops={NIGHTSKY} />
          <Stars f={f} h={700} />
          {Array.from({ length: 90 }, (_, i) => (
            <circle key={i} cx={rnd(i + 40) * 1080} cy={1450 + rnd(i + 70) * 470} r={2 + rnd(i) * 3} fill={rnd(i + 1) > 0.5 ? YEL : WH} opacity={0.35} />
          ))}
          {[0, 1, 2, 3].map((i) => <Cloud key={i} x={((((i * 380 - f * (2 + i)) % 1600) + 1600) % 1600) - 260} y={1300 + i * 100} s={1.3 + i * 0.25} o={0.4} />)}
          {Array.from({ length: 7 }, (_, i) => {
            const x = ((((rnd(i) * 1600 - f * (30 + i * 6)) % 1600) + 1600) % 1600) - 260, y = 280 + rnd(i + 5) * 1300;
            return <line key={"w" + i} x1={x} y1={y} x2={x + 140} y2={y} stroke={WH} strokeWidth={3} strokeLinecap="round" opacity={0.22} />;
          })}
          <g transform={`translate(${-camX} 0)`}>
            <Wire x1={-400} x2={3000} y={wy} sag={0} w={18} />
            <Person x={w.hip[0]} y={w.hip[1]} s={s} turn={1} pose={w.pose} feet={w.feet} look={MASCOT} t={f} />
          </g>
        </Full>
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateY(${1920 * (1 - drop)}px)`, filter: `blur(${blur}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${sway * 1.5 + f * 0.05}deg)` }}>
          <Full><CityTop f={f} /></Full>
        </AbsoluteFill>
        <Full>
          {[0, 1, 2, 3, 4].map((i) => <Cloud key={i} x={((i * 300 + f * (6 + i * 2)) % 1700) - 300} y={300 + i * 330} s={2 + (i % 2)} o={0.35} col="#8a9ac4" />)}
          <line x1={540 + sway * 8} y1={-20} x2={540 - sway * 4} y2={1940} stroke="#c9d3e6" strokeWidth={10} />
          {/* герой сверху: шапка, плечи, руки в стороны */}
          <g transform={`translate(${540 + sway * 7} 330) rotate(${sway * 3})`}>
            <ellipse cx={0} cy={66} rx={16} ry={26} fill={MASCOT.shoes} />
            <g transform={`rotate(${Math.sin(f / 6) * 10})`}>
              <rect x={-150} y={-11} width={300} height={22} rx={11} fill={MASCOT.top} />
              <circle cx={-150} cy={0} r={11} fill={MASCOT.skin} />
              <circle cx={150} cy={0} r={11} fill={MASCOT.skin} />
            </g>
            <ellipse cx={0} cy={0} rx={60} ry={38} fill={MASCOT.top} />
            <circle cx={0} cy={0} r={30} fill={MASCOT.hatColor} />
            <circle cx={0} cy={0} r={9} fill={MASCOT.hatColor2} />
          </g>
        </Full>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 45%, rgba(224,82,74,${0.3 * p}) 100%)` }} />
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 2 (5–12 c): паника, стоп-кадр, трещина ===============
const FREEZE = 80;
const S2Frame: React.FC<{ f: number; abs: number }> = ({ f, abs }) => {
  const amp = ip(f, [0, 70], [0.4, 1]);
  const push = ip(f, [10, 78], [1, 1.6], Easing.inOut(Easing.cubic));
  const p = pulse(abs);
  const s = 2, WY = 1060;
  const sx = Math.sin(f / 6.5) * 34 * amp;
  const hipX = 540 + sx, hipY = WY - 124 * s + Math.abs(Math.sin(f / 3.2)) * 8;
  const sag = 6 + 10 * amp;
  const wy = wireY(hipX, 60, 1020, WY, sag, hipX);
  const ph = f / 3.6;
  const pose: Pose = {
    lean: -sx * 0.35, head: -sx * 0.2,
    aL: [-95 - 60 * Math.sin(ph), -150 - 50 * Math.sin(ph + 1)], aR: [95 + 60 * Math.sin(ph + 2), 150 + 50 * Math.sin(ph + 3)],
    lL: [0, 0], lR: [0, 0],
  };
  const feet = { l: toLocal([510, wy], [hipX, hipY], s), r: toLocal([570, wy], [hipX, hipY], s) };
  const face = { eyes: "wide" as const, brows: 1, mouth: (Math.floor(f / 12) % 2 ? "o" : "fear") as "o" | "fear" };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: N0 }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `540px ${hipY - 330}px` }}>
        <Full>
          <Sky id="s2" stops={NIGHTSKY} />
          <Stars f={f} h={900} />
          {[0, 1, 2, 3, 4].map((i) => <Cloud key={i} x={((i * 290 + f * 1.5) % 1500) - 200} y={1350 + (i % 3) * 120} s={1.3 + (i % 2) * 0.5} o={0.4} />)}
          <Tower x={-120} y={WY + 4} w={200} h={900} />
          <Tower x={1000} y={WY + 4} w={200} h={900} />
          <Wire x1={60} x2={1020} y={WY} sag={sag} mid={hipX} w={9} />
          <Person x={hipX} y={hipY} s={s} turn={0.15} pose={pose} feet={feet} look={MASCOT} t={abs} face={face} />
          {Array.from({ length: 8 }, (_, i) => {
            const t0 = 6 + i * 9, tt = f - t0;
            if (tt < 0 || tt > 24) return null;
            const side = i % 2 ? 1 : -1;
            return <path key={i} d="M 0 -14 Q 9 0 0 8 Q -9 0 0 -14 Z" fill="#9cc0ff" transform={`translate(${hipX + side * (80 + tt * 5)} ${hipY - 370 - tt * 3 + tt * tt * 0.3})`} />;
          })}
        </Full>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, transparent 40%, rgba(224,82,74,${0.35 * p}) 100%)` }} />
    </AbsoluteFill>
  );
};

const IMPACT: V = [560, 640];
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

const TitleCard: React.FC<{ f: number }> = ({ f }) => {
  const s = 0.2, WY = 700;
  const xw = 300 + f * 1.2 + 140;
  const w = walkRig(xw, () => WY, s, 26, 134, 4);
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="tc" stops={NIGHTSKY} />
        <Stars f={f} />
        <Tower x={300} y={WY} w={170} h={1400} antenna />
        <Tower x={610} y={WY + 6} w={170} h={1400} />
        <Wire x1={470} x2={610} y={WY} sag={2} w={3} />
        <Person x={w.hip[0]} y={w.hip[1]} s={s} turn={1} pose={w.pose} feet={w.feet} look={PETIT} t={f} pole={{ c: [50, -80], a: 0 }} />
      </Full>
      <div style={{ position: "absolute", top: 300, left: 50, right: 50, textAlign: "center", fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: WH, transform: `scale(${ip(f, [0, 12], [1.25, 1], Easing.out(Easing.back(2)))})`, textShadow: "0 6px 0 rgba(0,0,0,.35)" }}>
        THE MAN WHO WALKED BETWEEN THE <span style={{ color: YEL }}>TOWERS</span>
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
  const grade = frozen ? "grayscale(0.7) contrast(1.15) brightness(0.9)" : "none";
  const scene = <S2Frame f={Math.min(f, FREEZE)} abs={150 + Math.min(f, FREEZE)} />;
  const crackLines = (
    <Full>
      {RAYS.map((r, i) => {
        const pr = i < 5 ? crack1 : crack2;
        return <polyline key={i} points={pts(r)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pr} fill="none" stroke={WH} strokeWidth={4} />;
      })}
      {crack2 > 0 ? [1, 2, 3].map((k) => <polygon key={k} points={pts(RAYS.map((r) => r[k]))} fill="none" stroke={WH} strokeWidth={3} opacity={crack2 * 0.85} />) : null}
      <circle cx={IMPACT[0]} cy={IMPACT[1]} r={16} fill={WH} opacity={crack1} />
    </Full>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {fall >= 0 ? <TitleCard f={fall} /> : null}
      {fall < 0 ? (
        <AbsoluteFill style={{ filter: grade }}>
          {scene}
          {crackLines}
        </AbsoluteFill>
      ) : (
        RAYS.map((r, i) => {
          const r2 = RAYS[(i + 1) % RAYS.length];
          const poly = [...r, ...[...r2].reverse()].map((p) => `${p[0]}px ${p[1]}px`).join(",");
          const t = Math.max(0, fall - rnd(i + 40) * 10);
          const dir = Math.atan2(r[3][1] - IMPACT[1], r[3][0] - IMPACT[0]);
          return (
            <AbsoluteFill key={i} style={{ clipPath: `polygon(${poly})`, transform: `translate(${Math.cos(dir) * t * 6}px, ${t * t * 1.6 + Math.sin(dir) * t * 4}px) rotate(${(rnd(i) - 0.5) * t * 2}deg)`, transformOrigin: `${IMPACT[0]}px ${IMPACT[1]}px`, filter: grade }}>
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

// =============== СЦЕНА 3 (12–22 c): Париж, приёмная, журнал ===============
const Eiffel: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y})`} fill="#222f52">
      <path d={`M ${-w / 2} 0 Q ${-w * 0.18} ${-h * 0.35} ${-w * 0.06} ${-h * 0.85} L 0 ${-h} L ${w * 0.06} ${-h * 0.85} Q ${w * 0.18} ${-h * 0.35} ${w / 2} 0 L ${w * 0.3} 0 Q 0 ${-h * 0.22} ${-w * 0.3} 0 Z`} />
      <rect x={-w * 0.27} y={-h * 0.3} width={w * 0.54} height={12} />
      <rect x={-w * 0.13} y={-h * 0.6} width={w * 0.26} height={10} />
    </g>
  );
};

const Paris: React.FC<{ f: number }> = ({ f }) => {
  const GY = 1080, s = 1.75;
  const P = 13;
  const hip: V = [540, GY - 140 * s];
  const handAt = (side: number): V => {
    const th = (f / P) * Math.PI + (side > 0 ? Math.PI : 0);
    return [side * 50 + Math.cos(th) * 12 * side, -62 + Math.sin(th) * 12];
  };
  const hL = handAt(-1), hR = handAt(1);
  const W = (h: V): V => [hip[0] + h[0] * s, hip[1] + h[1] * s];
  const balls = [0, 1, 2].map((i) => {
    const u = f / P + i * 0.6667 * 1.5;
    const k = Math.floor(u), fr = u - k;
    const fromL = k % 2 === 0;
    const a = W(fromL ? hL : hR), b = W(fromL ? hR : hL);
    return [lerp(a[0], b[0], fr), lerp(a[1], b[1], fr) - 4 * 330 * fr * (1 - fr) - 14] as V;
  });
  const bob = Math.abs(Math.sin((f / P) * Math.PI)) * 4;
  const px = ((f * 2.6) % 1500) - 200;
  const pw = walkRig(px, () => GY + 50, 1.05, 130);
  const clap = Math.abs(Math.sin(f / 4));
  return (
    <AbsoluteFill>
      <Full>
        <Sky id="ps" stops={[[0, "#1d2b4a"], [0.45, "#3d4470"], [0.6, "#7a5a7a"], [0.7, "#c48a74"]]} h={1100} />
        <circle cx={260} cy={830} r={110} fill="#f0c08a" opacity={0.85} />
        <Eiffel x={800} y={860} h={620} />
        {Array.from({ length: 9 }, (_, i) => {
          const x = i * 130 - 40, h = 220 + rnd(i) * 160;
          return (
            <g key={i}>
              <rect x={x} y={940 - h} width={124} height={h + 10} fill={i % 2 ? "#26355a" : "#2d3d64"} />
              <path d={`M ${x - 4} ${940 - h} L ${x + 62} ${940 - h - 46} L ${x + 128} ${940 - h} Z`} fill="#1f2b4c" />
              {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
                <rect key={`${r}${c}`} x={x + 16 + c * 36} y={940 - h + 26 + r * 66} width={20} height={34} rx={3} fill={rnd(i * 9 + r * 3 + c) > 0.45 ? YEL : "#1c2744"} opacity={0.75} />
              )))}
            </g>
          );
        })}
        <rect x={0} y={940} width={1080} height={980} fill="#202c4c" />
        <rect x={0} y={940} width={1080} height={14} fill="#2c3a60" />
        {Array.from({ length: 10 }, (_, r) => <line key={r} x1={0} y1={990 + r * 90} x2={1080} y2={990 + r * 90} stroke="#26335a" strokeWidth={4} />)}
        <path d="M 150 640 L 40 1150 L 260 1150 Z" fill={YEL} opacity={0.12} />
        <rect x={142} y={640} width={14} height={500} fill="#151d33" />
        <rect x={124} y={612} width={50} height={34} rx={6} fill={YEL} />
        <Shadow x={pw.hip[0]} y={GY + 50} w={50} />
        <Person x={pw.hip[0]} y={pw.hip[1]} s={1.05} turn={1} pose={pw.pose} feet={pw.feet} look={PASSER[1]} t={f} seed={3} face={{ mouth: "smile" }} />
        <Shadow x={870} y={GY + 30} w={55} />
        <Person x={870} y={GY + 30 - 140 * 1.1} s={1.1} turn={0.6} dir={-1} pose={STAND} hands={{ l: [16 + clap * 14, -80], r: [44 - clap * 14, -82] }} look={PASSER[0]} t={f} seed={5} face={{ eyes: "happy", mouth: "grin" }} />
        <ellipse cx={720} cy={GY + 4} rx={56} ry={16} fill="#151d33" />
        {[0, 1, 2].map((i) => <circle key={i} cx={700 + i * 20} cy={GY - 2} r={6} fill={YEL} />)}
        <Shadow x={540} y={GY} w={80} />
        <Person x={hip[0]} y={hip[1] + bob} s={s} turn={0.12} pose={STAND} hands={{ l: hL, r: hR }} look={PETIT} t={f} face={{ mouth: "grin", eyes: "happy" }} />
        {balls.map((b, i) => <circle key={i} cx={b[0]} cy={b[1]} r={19} fill={[YEL, RED, "#7fc4ff"][i]} />)}
      </Full>
    </AbsoluteFill>
  );
};

const Waiting: React.FC<{ f: number }> = ({ f }) => {
  const s = 1.7, seatY = 900;
  const sitPose: Pose = { lean: -6, aL: [0, 0], aR: [0, 0], lL: [92, 2], lR: [86, -4] };
  const flip = ip(f, [3, 14], [0, 1]);
  const shock = f > 28;
  const lean = shock ? ip(f, [28, 34], [-6, 10]) : -6;
  const mag: V = [70, -60 - (shock ? 14 : 0)];
  return (
    <AbsoluteFill>
      <Full>
        <rect width={1080} height={1920} fill="#26345a" />
        <rect x={0} y={1000} width={1080} height={920} fill="#1d2848" />
        <rect x={0} y={990} width={1080} height={14} fill="#33456e" />
        <circle cx={800} cy={420} r={70} fill="#e8ecf4" />
        <line x1={800} y1={420} x2={800 + Math.sin(f * 6 * D) * 50} y2={420 - Math.cos(f * 6 * D) * 50} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <line x1={800} y1={420} x2={830} y2={400} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <rect x={150} y={330} width={330} height={110} rx={10} fill="#e8ecf4" />
        <text x={315} y={402} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill={INK}>DENTISTE</text>
        <rect x={940} y={860} width={70} height={90} rx={8} fill="#a0603e" />
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={975 + (i - 1.5) * 22} cy={820 - (i % 2) * 30} rx={20} ry={50} fill="#4f7d63" transform={`rotate(${(i - 1.5) * 18 + Math.sin(f / 10 + i) * 3} ${975 + (i - 1.5) * 22} 860)`} />)}
        <rect x={60} y={seatY} width={960} height={26} rx={8} fill="#7a5a44" />
        <rect x={90} y={seatY + 26} width={18} height={90} fill="#5a4030" />
        <rect x={970} y={seatY + 26} width={18} height={90} fill="#5a4030" />
        <Person x={260} y={seatY - 4} s={s * 0.95} turn={0.4} pose={{ ...sitPose, lean: -2 }} hands={{ l: [10, -70], r: [30, -152] }} look={PASSER[3]} t={f + 100} seed={9} face={{ eyes: "closed", brows: 1, mouth: "fear" }}>
          <circle cx={28} cy={-150} r={17} fill="#e8a088" />
        </Person>
        <Person x={600} y={seatY - 4} s={s} turn={0.7} pose={{ ...sitPose, lean }} hands={{ l: [mag[0] - 34, mag[1]], r: [mag[0] + 30, mag[1] + 4] }} look={PETIT} t={f + 100} face={shock ? { eyes: "wide", brows: 1, mouth: "o" } : { mouth: "flat" }}>
          <g transform={`translate(${mag[0]} ${mag[1]})`}>
            <rect x={-48} y={-46} width={96} height={70} rx={4} fill="#efe6d2" />
            <rect x={-2} y={-46} width={50 * (1 - flip) + 2} height={70} fill="#d9cfb8" />
            <rect x={6} y={-38} width={34} height={50} fill="#2a3a6e" />
            <rect x={12} y={-30} width={8} height={40} fill="#9cc0ff" />
            <rect x={26} y={-28} width={8} height={38} fill="#9cc0ff" />
          </g>
        </Person>
        {shock ? <text x={760} y={470} fontFamily={MONT} fontWeight={900} fontSize={140} fill={YEL} opacity={ip(f, [28, 32], [0, 1])} transform={`rotate(12 760 470)`}>!</text> : null}
      </Full>
    </AbsoluteFill>
  );
};

const Magazine: React.FC<{ f: number }> = ({ f }) => {
  // f = кадр сцены 3 минус 100 (журнал на экране с f=50)
  const draw = ip(f, [56, 104], [0, 1], Easing.inOut(Easing.quad));
  const fig = ip(f, [110, 128], [0, 1]);
  const glow = ip(f, [134, 140], [0, 1]);
  const push = ip(f, [134, 200], [1, 1.35], Easing.inOut(Easing.cubic));
  const A: V = [626, 812], B: V = [878, 832];
  const tip: V = f < 108 ? [A[0] + (B[0] - A[0]) * draw, A[1] + (B[1] - A[1]) * draw] : [752 + Math.cos(fig * 6) * 10, 800 + fig * 30];
  const handIn = ip(f, [44, 56], [600, 0], Easing.out(Easing.cubic)) + ip(f, [150, 180], [0, 700], Easing.in(Easing.cubic));
  const wiggle = Math.sin(f * 1.3) * 3;
  const tower = (x: number, unfinished: number) => (
    <g>
      <rect x={x} y={800} width={74} height={430} fill="#2f4380" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x + 9 * (i + 1)} y={800} width={2} height={430} fill="#9cc0ff" opacity={0.6} />)}
      <rect x={x} y={800 - unfinished} width={74} height={unfinished} fill="none" stroke="#9cc0ff" strokeWidth={3} strokeDasharray="8 8" />
      <path d={`M ${x + 20} ${800 - unfinished} L ${x + 20} ${700 - unfinished} L ${x + 90} ${700 - unfinished} M ${x + 20} ${720 - unfinished} L ${x + 60} ${700 - unfinished}`} stroke={YEL} strokeWidth={5} fill="none" />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "#3a2e2a" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "752px 520px" }}>
        <Full>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={0} y={i * 200} width={1080} height={196} fill={i % 2 ? "#4a3a32" : "#44352e"} />)}
          <g transform="translate(0 -300) rotate(-4 540 960)">
            <rect x={86} y={540} width={950} height={900} rx={8} fill="#000" opacity={0.25} />
            <rect x={70} y={520} width={470} height={900} rx={6} fill="#efe6d2" />
            <text x={100} y={600} fontFamily={PLAYFAIR} fontSize={52} fill={INK}>L&apos;ILLUSTRÉ</text>
            <text x={100} y={640} fontFamily={ELITE} fontSize={22} fill="#6a5a4a">N° 68 · 1968</text>
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x={100} y={690 + i * 42} width={i % 5 === 4 ? 240 : 400} height={12} rx={6} fill="#cbbd9e" />)}
            <rect x={540} y={520} width={480} height={900} rx={6} fill="#f4ecdb" />
            <text x={570} y={590} fontFamily={ANTON} fontSize={44} fill={INK}>NEW YORK</text>
            <text x={570} y={630} fontFamily={ELITE} fontSize={22} fill="#6a5a4a">les tours jumelles — projet</text>
            <rect x={570} y={660} width={420} height={600} rx={6} fill="#1f2c58" />
            {tower(604, 70)}
            {tower(860, 50)}
            <text x={580} y={1250} fontFamily={ELITE} fontSize={18} fill="#9cc0ff">WTC · 110 FL. · 1350 FT</text>
            <rect x={536} y={520} width={8} height={900} fill="#d6cbb2" />
            {draw > 0 ? <line x1={A[0]} y1={A[1]} x2={A[0] + (B[0] - A[0]) * draw} y2={A[1] + (B[1] - A[1]) * draw} stroke={glow ? YEL : "#3a3a44"} strokeWidth={glow ? 7 : 4} strokeLinecap="round" /> : null}
            {fig > 0 ? (
              <g stroke={glow ? YEL : "#3a3a44"} strokeWidth={3} fill="none" opacity={fig} strokeLinecap="round">
                <circle cx={752} cy={792} r={7} />
                <line x1={752} y1={799} x2={752} y2={815} />
                <line x1={730} y1={803} x2={774} y2={803} />
                <line x1={752} y1={815} x2={746} y2={822} />
                <line x1={752} y1={815} x2={758} y2={822} />
              </g>
            ) : null}
            {glow ? [0, 1, 2, 3, 4, 5].map((i) => {
              const a = i * 60 * D, r = 30 + (f - 134) * 3;
              return <circle key={i} cx={752 + Math.cos(a) * r} cy={822 + Math.sin(a) * r} r={5} fill={YEL} opacity={ip(f, [134, 160], [1, 0])} />;
            }) : null}
            <g transform={`translate(${tip[0] + handIn * 0.6} ${tip[1] + handIn}) rotate(${-35 + wiggle})`}>
              <rect x={-7} y={0} width={14} height={200} rx={3} fill={TAXI} />
              <path d="M -7 0 L 0 -26 L 7 0 Z" fill="#e8c9a0" />
              <path d="M -2.5 -16 L 0 -26 L 2.5 -16 Z" fill={INK} />
              <rect x={-7} y={196} width={14} height={20} rx={3} fill="#e88aa0" />
              <ellipse cx={14} cy={120} rx={44} ry={60} fill={PETIT.skin} />
              <rect x={-40} y={165} width={110} height={240} rx={30} fill={PETIT.top} />
            </g>
          </g>
        </Full>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 100) return <Paris f={f} />;
  if (f < 150) return <Waiting f={f - 100} />;
  return <Magazine f={f - 100} />;
};

// =============== СЦЕНА 4 (22–34 c): лестница и лук ===============
const Stairs: React.FC<{ f: number }> = ({ f }) => {
  const RISE = 40, RUN = 60, s = 1.25;
  const base = 2400;
  const ground = (x: number) => base - Math.floor(x / RUN) * RISE;
  const slopeY = (x: number) => base - (x / RUN) * RISE;
  const lead = 420 + f * 4.2;
  const camX = lead - 640, camY = slopeY(lead) - 880;
  const people: [number, Look, number][] = [[lead, PETIT, 0], [lead - 200, FRIEND1, 1], [lead - 400, FRIEND2, 2]];
  const shoulders: V[] = [];
  const figs = people.map(([x, look, i]) => {
    const w = walkRig(x + i * 13, ground, s, 2 * RUN, 128, 30);
    const pose: Pose = { ...w.pose, lean: 18 };
    const sh = go(w.hip, 180 - pose.lean, BODY.torso * s);
    shoulders.push(sh);
    const hand: V = [16, -BODY.torso - 14];
    return <Person key={i} x={w.hip[0]} y={w.hip[1]} s={s} turn={1} pose={pose} feet={w.feet} hands={{ l: [hand[0] + 24, hand[1] + 6], r: hand }} look={look} t={f} seed={i} face={{ brows: i === 0 ? 0 : 1, mouth: i === 0 ? "flat" : "fear" }} />;
  });
  const steps: V[] = [];
  for (let i = 0; i < 70; i++) {
    const x = i * RUN - 180;
    steps.push([x, ground(x + 1)], [x + RUN, ground(x + 1)]);
  }
  const cable = shoulders.reduce((d, p, i) => (i === 0 ? `M ${p[0] + 20} ${p[1] - 18}` : d + ` Q ${(p[0] + shoulders[i - 1][0]) / 2} ${(p[1] + shoulders[i - 1][1]) / 2 + 40} ${p[0]} ${p[1] - 14}`), "");
  const last = shoulders[2];
  const lamp = go(shoulders[0], 162, 50);
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <g transform={`translate(${-camX} ${-camY})`}>
          <rect x={-400} y={-400} width={5000} height={3600} fill="#1a2644" />
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i}>
              <circle cx={i * 260 - 132} cy={slopeY(i * 260) - 625} r={70} fill={YEL} opacity={0.08} />
              <rect x={i * 260 - 160} y={slopeY(i * 260) - 640} width={56} height={30} rx={6} fill={YEL} opacity={0.85} />
              {i % 3 === 0 ? <text x={i * 260 - 40} y={slopeY(i * 260) - 400} fontFamily={MONT} fontWeight={900} fontSize={90} fill={N3} opacity={0.7}>{104 + i / 3}</text> : null}
            </g>
          ))}
          <path d={`M ${lamp[0]} ${lamp[1]} L ${lamp[0] + 620} ${lamp[1] - 520} L ${lamp[0] + 620} ${lamp[1] - 100} Z`} fill={YEL} opacity={0.1} />
          <polygon points={pts([...steps, [steps[steps.length - 1][0], 3400], [-180, 3400]])} fill={N2} />
          {steps.filter((_, i) => i % 2 === 0).map((p, i) => <rect key={i} x={p[0]} y={p[1]} width={RUN} height={6} fill={N4} />)}
          <line x1={-200} y1={slopeY(-200) - 170} x2={4000} y2={slopeY(4000) - 170} stroke={N4} strokeWidth={8} strokeLinecap="round" />
          {Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 120 - 200} y={slopeY(i * 120 - 200) - 170} width={5} height={170} fill={N3} />)}
          {figs}
          <path d={cable} stroke="#aab6cc" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d={`M ${last[0]} ${last[1] - 14} Q ${last[0] - 120} ${last[1] + 20} ${last[0] - 170} ${last[1] + 240}`} stroke="#aab6cc" strokeWidth={13} fill="none" strokeLinecap="round" />
        </g>
      </Full>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 55% 40%, transparent 35%, rgba(5,8,18,0.8) 90%)" }} />
    </AbsoluteFill>
  );
};

const Roof: React.FC<{ f: number }> = ({ f }) => {
  const drawT = ip(f, [18, 46], [0, 1], Easing.inOut(Easing.quad));
  const released = f >= 48;
  const s = 1.3, RY = 1000;
  const archerHip: V = [360, RY - 138 * s];
  const archer: Pose = { lean: -4, aL: [90, 90], aR: released ? [70, 30] : [90 - drawT * 6, 90 - drawT * 172], lL: [-14, -6], lR: [18, 6] };
  const sh = go([0, 0], 184, BODY.torso);
  const bowHand = go(go(sh, 90, BODY.ua), 90, BODY.fa);
  const start: V = [archerHip[0] + (bowHand[0] + 60) * s, archerHip[1] + bowHand[1] * s];
  const end: V = [880, 930];
  const traj = (t: number): V => [lerp(start[0], end[0], t), lerp(start[1], end[1], t) - 4 * 220 * t * (1 - t)];
  const tA = ip(f, [48, 82], [0, 1]);
  const trail = Array.from({ length: 31 }, (_, i) => traj((i / 30) * tA));
  const head = traj(tA), prev = traj(Math.max(0, tA - 0.02));
  const angA = Math.atan2(head[1] - prev[1], head[0] - prev[0]) / D;
  const sag = ip(f, [90, 140], [0, 1]);
  const thick = ip(f, [130, 170], [0, 1]);
  const linePath = sag > 0
    ? `M ${start[0]} ${start[1]} Q ${(start[0] + end[0]) / 2} ${(start[1] + end[1]) / 2 + 50 * sag - 440 * (1 - sag)} ${end[0]} ${end[1]}`
    : `M ${pts(trail).replace(/ /g, " L ")}`;
  const cheer = f > 86;
  const jump = cheer ? Math.abs(Math.sin((f - 86) / 5)) * 30 * ip(f, [86, 150], [1, 0]) : 0;
  const crouch: Pose = { lean: 24, aL: [40, 110], aR: [70, 120], lL: [80, -10], lR: [100, -20] };
  const wave = Math.sin(f / 3) * 12;
  const cheerPose: Pose = { lean: 0, aL: [-160 + wave, -175 + wave], aR: [160 - wave, 175 - wave], lL: [-6, -2], lR: [6, 2] };
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="ns" stops={[[0, "#141f3a"], [1, "#2a3a62"]]} />
        <Stars f={f} n={90} h={900} />
        <circle cx={850} cy={330} r={66} fill="#f2ead2" />
        <circle cx={878} cy={312} r={58} fill="#1a2644" />
        {Array.from({ length: 160 }, (_, i) => <circle key={i} cx={rnd(i + 300) * 1080} cy={1350 + rnd(i + 600) * 570} r={1.5 + rnd(i) * 2.5} fill={rnd(i + 2) > 0.5 ? YEL : WH} opacity={0.5} />)}
        <Tower x={760} y={940} w={340} h={1000} />
        <Tower x={-40} y={RY} w={600} h={1000} />
        <ellipse cx={130} cy={RY - 6} rx={70} ry={20} fill="#6a7694" />
        <ellipse cx={130} cy={RY - 14} rx={46} ry={12} fill="none" stroke="#aab6cc" strokeWidth={8} />
        <Shadow x={200} y={RY} w={60} />
        <Person x={200} y={RY - (cheer ? 138 * 1.15 + jump : 96 * 1.15)} s={1.15} turn={cheer ? 0.4 : 1} pose={cheer ? cheerPose : crouch} look={PETIT} t={f} face={cheer ? { eyes: "happy", mouth: "grin" } : { eyes: "wide", mouth: "flat" }} />
        <Shadow x={360} y={RY} w={70} />
        <Person x={archerHip[0]} y={archerHip[1]} s={s} turn={1} pose={archer} look={FRIEND1} t={f} seed={2} bow={released ? 0 : drawT} face={{ eyes: f > 18 && f < 48 ? "closed" : "open", mouth: cheer ? "grin" : "flat" }} />
        {f >= 48 ? <path d={linePath} stroke={WH} strokeWidth={2.5 + thick * 8} fill="none" opacity={0.9} strokeLinecap="round" /> : null}
        {f >= 48 && f < 140 ? (
          <g transform={`translate(${head[0]} ${head[1]}) rotate(${angA})`}>
            <rect x={-70} y={-3} width={70} height={6} rx={3} fill="#e8d6aa" />
            <path d="M 0 -9 L 20 0 L 0 9 Z" fill="#cfd8e6" />
            <path d="M -70 0 L -86 -12 L -78 0 L -86 12 Z" fill={RED} />
          </g>
        ) : null}
        {f >= 82 && f < 100 ? <circle cx={end[0]} cy={end[1]} r={(f - 82) * 4} fill="none" stroke={YEL} strokeWidth={5} opacity={ip(f, [82, 100], [1, 0])} /> : null}
      </Full>
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  return f < 180 ? <Stairs f={f} /> : <Roof f={f - 180} />;
};

// =============== СЦЕНА 5 (34–48 c): проход по тросу ===============
const Bird: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const w = Math.sin(f / 3) * 10;
  return <path d={`M ${x - 18 * s} ${y - w * s} Q ${x - 8 * s} ${y - 6 * s} ${x} ${y} Q ${x + 8 * s} ${y - 6 * s} ${x + 18 * s} ${y - w * s}`} stroke={INK} strokeWidth={4 * s} fill="none" strokeLinecap="round" />;
};

const WideTowers: React.FC<{ f: number }> = ({ f }) => {
  const zoom = ip(f, [0, 90], [1, 1.15]);
  const s = 0.2, WY = 552;
  const xw = ip(f, [8, 90], [395, 480]);
  const w = walkRig(xw, () => WY, s, 26, 134, 4);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 560px" }}>
      <Full>
        <Sky id="d1" stops={DAWN} />
        <circle cx={540} cy={1500} r={220} fill="#f6d79a" opacity={0.9} />
        <Tower x={150} y={WY} w={280} h={1500} warm antenna />
        <Tower x={650} y={WY + 4} w={280} h={1500} warm />
        <Wire x1={430} x2={650} y={WY} sag={2} w={3} />
        {[0, 1, 2].map((i) => <Cloud key={i} x={((i * 420 + f * 1.4) % 1500) - 200} y={1150 + i * 90} s={1.6} o={0.55} col="#b07a90" />)}
        <Person x={w.hip[0]} y={w.hip[1]} s={s} turn={1} pose={w.pose} feet={w.feet} look={PETIT} t={f} pole={{ c: [50, -80], a: Math.sin(f / 8) * 5 }} />
        {[0, 1, 2, 3].map((i) => <Bird key={i} x={((i * 290 + f * 3) % 1300) - 100} y={760 + i * 60 + Math.sin(f / 5 + i) * 8} f={f + i * 7} />)}
      </Full>
    </AbsoluteFill>
  );
};

const WalkSitLie: React.FC<{ g: number }> = ({ g }) => {
  // g: 0..200 — идёт, садится (85–110), ложится (150–170)
  const s = 1.6, WY = 1000;
  const S = 150, x0 = 300, travel = 225;
  const xw = x0 + Math.min(g, 85) * (travel / 85);
  const w = walkRig(xw, () => WY, s, S, 134, 20);
  const sitT = ip(g, [85, 110], [0, 1], Easing.inOut(Easing.quad));
  const lieT = ip(g, [150, 170], [0, 1], Easing.inOut(Easing.quad));
  const swing = Math.sin(g / 7) * 10 * ip(g, [110, 120], [0, 1]) * (1 - lieT);
  const hangL: V = [34 + swing, 122], hangR: V = [52 - swing, 116];
  const flatL: V = [2, 146], flatR: V = [26, 124 + Math.sin(g / 9) * 8];
  const fL: V = lieT > 0 ? [lerp(hangL[0], flatL[0], lieT), lerp(hangL[1], flatL[1], lieT)] : [lerp(w.feet.l[0], hangL[0], sitT), lerp(w.feet.l[1], hangL[1], sitT)];
  const fR: V = lieT > 0 ? [lerp(hangR[0], flatR[0], lieT), lerp(hangR[1], flatR[1], lieT)] : [lerp(w.feet.r[0], hangR[0], sitT), lerp(w.feet.r[1], hangR[1], sitT)];
  const hipY = lerp(lerp(w.hip[1], WY - 8, sitT), WY - 24 * s, lieT);
  const rot = -90 * lieT;
  const balance = Math.sin(g / 9) * 6 * (1 - sitT);
  const pole = lieT > 0
    ? { c: [lerp(60, 40, lieT), lerp(-70, -78, lieT)] as V, a: lerp(Math.sin(g / 9) * 2, 90, lieT) }
    : { c: [lerp(50, 64, sitT), lerp(-82, -46, sitT)] as V, a: balance };
  const pose: Pose = { ...w.pose, lean: lerp(lerp(5 - balance * 0.6, -6, sitT), 0, lieT) };
  const camX = xw - 540;
  const face = lieT > 0.5 ? { eyes: "closed" as const, mouth: "smile" as const } : g > 100 ? { eyes: "happy" as const, mouth: "grin" as const } : { mouth: "flat" as const };
  const gull = lieT > 0.6;
  return (
    <AbsoluteFill>
      <Full>
        <Sky id="d2" stops={DAWN} />
        <g transform={`translate(${-camX * 0.15} 0)`}>
          <circle cx={600} cy={1620} r={300} fill="#f6d79a" opacity={0.95} />
          {[0, 1, 2, 3, 4, 5].map((i) => <Cloud key={i} x={((i * 260 + g * 0.8) % 1600) - 250} y={1450 + (i % 3) * 120} s={1.8} o={0.7} col={i % 2 ? "#b07a90" : "#8a6a94"} />)}
        </g>
        <g transform={`translate(${-camX} 0)`}>
          <Tower x={-280} y={WY + 6} w={300} h={900} warm />
          <Wire x1={20} x2={1700} y={WY} sag={8 + 4 * Math.sin(g / 6)} mid={xw} w={7} />
          <Person x={xw} y={hipY} s={s} rot={rot} turn={1} pose={pose} feet={{ l: fL, r: fR }} look={PETIT} t={g} face={face} pole={pole} />
          {gull ? <Bird x={xw + Math.cos(g / 12) * 160} y={WY - 330 + Math.sin(g / 12) * 40} f={g} s={1.6} /> : null}
        </g>
      </Full>
    </AbsoluteFill>
  );
};

const Crowd: React.FC<{ g: number }> = ({ g }) => {
  const people = Array.from({ length: 21 }, (_, i) => {
    const row = Math.floor(i / 7), col = i % 7;
    const x = col * 165 + (row % 2) * 82 + 40, y = 1640 + row * 120;
    const look = PASSER[(i * 3) % PASSER.length];
    const kind = Math.floor(rnd(i) * 3);
    const wob = Math.sin(g / 4 + i) * 10;
    const hands = kind === 0 ? { r: [30 + wob, -300] as V } : kind === 1 ? { l: [-22, -150] as V, r: [22, -150] as V } : undefined;
    return (
      <Person key={i} x={x} y={y} s={1.2} turn={0.2} dir={i % 2 ? 1 : -1} pose={{ ...STAND, head: -10 + rnd(i + 2) * 20 }} hands={hands} look={look} t={g + i * 5} seed={i} face={{ eyes: "wide", brows: 1, mouth: kind === 2 ? "o" : "smile" }} />
    );
  });
  return (
    <AbsoluteFill>
      <Full>
        <Sky id="d3" stops={DAWN} />
        <polygon points="40,1920 450,1920 520,200 470,200" fill="#6c6a8e" />
        <polygon points="1040,1920 630,1920 560,200 610,200" fill="#4a4a70" />
        <line x1={520} y1={206} x2={560} y2={206} stroke={WH} strokeWidth={2} />
        <circle cx={536 + Math.sin(g / 10) * 4} cy={202} r={3} fill={INK} />
        {people}
      </Full>
    </AbsoluteFill>
  );
};

const WavePolice: React.FC<{ g: number }> = ({ g }) => {
  const WY = 1000, s = 1.6;
  const bounce = Math.abs(Math.sin(g / 5)) * 14;
  const hip: V = [420, WY - 126 * s + bounce];
  const feet = { l: toLocal([395, WY], hip, s), r: toLocal([450, WY], hip, s) };
  const wave = Math.sin(g / 3.2);
  const copIn = ip(g, [0, 24], [220, 0], Easing.out(Easing.cubic));
  const rs = 1.3, RY = WY + 10;
  const call = Math.sin(g / 4);
  return (
    <AbsoluteFill>
      <Full>
        <Sky id="d4" stops={DAWN} />
        <circle cx={300} cy={1640} r={260} fill="#f6d79a" opacity={0.95} />
        {[0, 1, 2, 3].map((i) => <Cloud key={i} x={((i * 330 + g) % 1500) - 250} y={1500 + (i % 2) * 140} s={1.8} o={0.7} col="#b07a90" />)}
        <Tower x={780} y={RY} w={420} h={900} warm />
        <Wire x1={-20} x2={790} y={WY} sag={10 + bounce * 0.4} mid={420} w={7} />
        <Person x={870 + copIn} y={RY - 138 * rs} s={rs} turn={0.5} dir={-1} pose={STAND} hands={{ r: [70 + call * 20, -110 + call * 30] }} look={COP} t={g} seed={4} face={{ brows: -0.8, mouth: "flat" }} />
        <Person x={1000 + copIn} y={RY - 138 * rs} s={rs} turn={0.5} dir={-1} pose={STAND} hands={{ r: [26, -150], l: [10, -146] }} look={COP} t={g} seed={6} face={{ brows: -0.6, mouth: "o" }} />
        <Person x={hip[0]} y={hip[1]} s={s} turn={0.5} pose={{ ...STAND, lean: -3 }} feet={feet} hands={{ r: [60 + wave * 22, -250 + Math.abs(wave) * 10] }} look={PETIT} t={g} face={{ eyes: "happy", mouth: "grin" }} pole={{ c: [-10, -70], a: Math.sin(g / 8) * 6 }} />
      </Full>
    </AbsoluteFill>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 90) return <WideTowers f={f} />;
  if (f < 290) return <WalkSitLie g={f - 90} />;
  if (f < 330) return <Crowd g={f - 290} />;
  return <WavePolice g={f - 330} />;
};

// =============== СЦЕНА 6 (48–55 c): арест и газеты ===============
const PAPERS = [
  { at: 54, x: 540, y: 1600, r: -8, name: "THE DAILY SKY", head: "MAN WALKS ON AIR!", sub: "Frenchman crosses between the Twin Towers" },
  { at: 87, x: 520, y: 1780, r: 7, name: "LE CIEL DE PARIS", head: "FUNAMBULE ENTRE LES TOURS", sub: "45 minutes au-dessus de New York" },
  { at: 120, x: 560, y: 1680, r: -3, name: "EVENING STAR", head: "ARRESTED… AND ADORED", sub: "Police: “He was dancing on the wire”" },
  { at: 150, x: 545, y: 1840, r: 9, name: "NEW YORK DAILY", head: "1,350 FT. HIGH WIRE WALK", sub: "The city stops to look up" },
];
const FLASHES = [36, 69, 93, 132, 159, 183];

const Paper: React.FC<{ f: number; p: (typeof PAPERS)[number] }> = ({ f, p }) => {
  const t = f - p.at + 8;
  if (t < 0) return null;
  const k = ip(t, [0, 9], [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{
      position: "absolute", left: p.x - 380, top: p.y - 260, width: 760, height: 520, background: "#efe6d2", borderRadius: 6,
      boxShadow: "0 24px 50px rgba(0,0,0,.45)", transform: `rotate(${p.r + (1 - k) * 540}deg) scale(${3 - 2 * k})`, opacity: k,
      padding: "22px 30px", boxSizing: "border-box", fontFamily: ANTON, color: INK,
    }}>
      <div style={{ fontFamily: PLAYFAIR, fontSize: 52, textAlign: "center", borderBottom: `4px double ${INK}`, paddingBottom: 6 }}>{p.name}</div>
      <div style={{ fontFamily: ELITE, fontSize: 18, display: "flex", justifyContent: "space-between", borderBottom: `2px solid ${INK}`, padding: "4px 0" }}>
        <span>AUGUST 8, 1974</span><span>FINAL EDITION</span>
      </div>
      <div style={{ fontSize: 62, lineHeight: 1.05, textAlign: "center", marginTop: 12 }}>{p.head}</div>
      <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
        <svg width={220} height={180} viewBox="0 0 220 180" style={{ background: "#3a4a6e", borderRadius: 4 }}>
          <rect x={30} y={40} width={50} height={150} fill="#9aa6c0" />
          <rect x={140} y={46} width={50} height={150} fill="#9aa6c0" />
          <line x1={80} y1={44} x2={140} y2={50} stroke="#fff" strokeWidth={2} />
          <circle cx={110} cy={36} r={4} fill="#fff" />
          <line x1={96} y1={40} x2={124} y2={42} stroke="#fff" strokeWidth={2} />
        </svg>
        <div style={{ flex: 1, fontFamily: ELITE, fontSize: 24, lineHeight: 1.25 }}>
          {p.sub}
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 10, background: "#cbbd9e", marginTop: 12, borderRadius: 5, width: i === 2 ? "60%" : "100%" }} />)}
        </div>
      </div>
    </div>
  );
};

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const GY = 1090, s = 1.45;
  const xw = 300 + f * 2.4;
  const camX = xw - 540;
  const pw = walkRig(xw, () => GY, s, 150);
  const c1 = walkRig(xw - 160, () => GY, s, 150);
  const c2 = walkRig(xw + 160, () => GY, s, 150);
  const petSh: V = [xw + 6, pw.hip[1] - 80 * s];
  const flash = FLASHES.reduce((m, a) => Math.max(m, ip(f, [a, a + 1, a + 6], [0, 0.8, 0])), 0);
  const glint = ip(f, [16, 20, 30], [0, 1, 0]);
  const lights = Math.floor(f / 6) % 2;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="s6" stops={[[0, "#3d4a78"], [1, "#d59a80"]]} h={1100} />
        <g transform={`translate(${-camX * 0.5} 0)`}>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <rect x={i * 260 - 100} y={260 + rnd(i) * 160} width={230} height={900} fill={i % 2 ? "#3a4a74" : "#33426a"} />
              {Array.from({ length: 12 }, (_, k) => <rect key={k} x={i * 260 - 80 + (k % 4) * 52} y={300 + rnd(i) * 160 + Math.floor(k / 4) * 90} width={30} height={46} rx={3} fill={rnd(i * 12 + k) > 0.6 ? YEL : "#26355a"} opacity={0.7} />)}
            </g>
          ))}
        </g>
        <rect x={0} y={1000} width={1080} height={920} fill="#26324f" />
        {/* толпа за ограждением */}
        <g transform={`translate(${-camX * 0.8} 0)`}>
          {Array.from({ length: 16 }, (_, i) => {
            const up = Math.sin(f / 5 + i * 1.7);
            const hands = i % 3 === 0 ? { l: [-40, -230 + up * 20] as V, r: [40, -230 - up * 20] as V } : i % 3 === 1 ? { r: [30, -150] as V } : undefined;
            return (
              <g key={i}>
                <Person x={i * 150 + 40} y={960 + Math.abs(up) * 6} s={0.95} turn={0.2} pose={STAND} hands={hands} look={PASSER[i % PASSER.length]} t={f + i * 9} seed={i} face={{ eyes: "happy", mouth: i % 2 ? "grin" : "smile" }} />
                {i % 3 === 1 ? <rect x={i * 150 + 40 + 6} y={960 - 158} width={40} height={30} rx={4} fill={INK} /> : null}
              </g>
            );
          })}
        </g>
        <rect x={0} y={1000} width={1080} height={24} fill="#e3c86a" />
        {/* полицейская машина */}
        <g transform={`translate(${1500 - camX} 0)`}>
          <rect x={0} y={1010} width={420} height={110} rx={30} fill={WH} />
          <rect x={60} y={950} width={260} height={80} rx={24} fill={WH} />
          <rect x={0} y={1060} width={420} height={26} fill="#34497f" />
          <rect x={150} y={928} width={40} height={22} rx={6} fill={lights ? RED : "#7a2a2a"} />
          <rect x={190} y={928} width={40} height={22} rx={6} fill={lights ? "#2a3a7a" : "#5aa0ff"} />
          <circle cx={90} cy={1120} r={34} fill={INK} />
          <circle cx={330} cy={1120} r={34} fill={INK} />
        </g>
        <g transform={`translate(${-camX} 0)`}>
          <Shadow x={c1.hip[0]} y={GY} w={60} />
          <Shadow x={pw.hip[0]} y={GY} w={60} />
          <Shadow x={c2.hip[0]} y={GY} w={60} />
          <Person x={c1.hip[0]} y={c1.hip[1]} s={s} turn={0.7} pose={c1.pose} feet={c1.feet} hands={{ r: toLocal(petSh, c1.hip, s) }} look={COP} t={f} seed={1} face={{ brows: -0.6, mouth: "flat" }} />
          <Person x={pw.hip[0]} y={pw.hip[1]} s={s} turn={0.4} pose={{ ...pw.pose, head: Math.sin(f / 10) * 8 }} feet={pw.feet} hands={{ l: [-34, -54], r: [-22, -50] }} cuffs look={PETIT} t={f} face={{ eyes: "happy", mouth: "grin" }} />
          <Person x={c2.hip[0]} y={c2.hip[1]} s={s} turn={0.7} pose={c2.pose} feet={c2.feet} look={COP} t={f} seed={2} face={{ brows: -0.6, mouth: "flat" }} />
          {glint > 0 ? <path d="M 0 -40 L 8 -8 L 40 0 L 8 8 L 0 40 L -8 8 L -40 0 L -8 -8 Z" fill="#fff" transform={`translate(${xw - 40} ${pw.hip[1] - 70}) scale(${glint * 1.3})`} /> : null}
        </g>
      </Full>
      {PAPERS.map((p) => <Paper key={p.name} f={f} p={p} />)}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// =============== СЦЕНА 7 (55–60 c): снова герой, первый шаг, белый ===============
const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const s = 2, WY = 1060;
  const inhale = ip(f, [0, 45], [0, 1]) - ip(f, [48, 80], [0, 1]);
  const step = ip(f, [93, 116], [0, 1], Easing.inOut(Easing.cubic));
  const turn = ip(f, [70, 92], [0.15, 0.85]);
  const hipX = 540 + step * 40;
  const hipY = WY - 132 * s - inhale * 8 - Math.sin(step * Math.PI) * 14;
  const fLw: V = [512, WY];
  const fRw: V = [lerp(568, 650, step), WY - Math.sin(step * Math.PI) * 50];
  const arms = Math.sin(f / 14) * 6;
  const pose: Pose = { lean: Math.sin(f / 16) * 2, aL: [-82 + arms - inhale * 8, -96 + arms], aR: [82 - arms + inhale * 8, 96 - arms], lL: [0, 0], lR: [0, 0] };
  const white = ip(f, [100, 132], [0, 1], Easing.in(Easing.quad));
  const title = ip(f, [124, 140], [0, 1]);
  const puff = ip(f, [50, 64, 86], [0, 1, 0]);
  const face = f < 20 ? { mouth: "flat" as const } : f < 62 ? { eyes: "closed" as const, mouth: "flat" as const } : { brows: -0.4, mouth: "smile" as const };
  return (
    <AbsoluteFill style={{ background: N0, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + step * 0.2})`, transformOrigin: "540px 760px" }}>
        <Full>
          <Sky id="d7" stops={DAWN} />
          <Stars f={f} h={500} n={30} />
          <circle cx={540} cy={1560} r={330} fill="#f6d79a" opacity={0.9} />
          {[0, 1, 2, 3, 4].map((i) => <Cloud key={i} x={((i * 290 + f * 1.2) % 1500) - 200} y={1450 + (i % 3) * 120} s={1.5} o={0.7} col="#b07a90" />)}
          <Tower x={-120} y={WY + 4} w={200} h={900} warm />
          <Tower x={1000} y={WY + 4} w={200} h={900} warm />
          <Wire x1={60} x2={1020} y={WY} sag={8} mid={hipX} w={9} />
          <Person x={hipX} y={hipY} s={s} turn={turn} pose={pose} feet={{ l: toLocal(fLw, [hipX, hipY], s), r: toLocal(fRw, [hipX, hipY], s) }} look={MASCOT} t={f + 1650} face={face} />
          <g opacity={puff}>
            {[0, 1, 2].map((i) => <circle key={i} cx={hipX + 50 + i * 26 + (f - 50) * 1.5} cy={hipY - 330 + i * 6} r={14 + i * 8 + (f - 50) * 0.4} fill={WH} opacity={0.5 - i * 0.12} />)}
          </g>
        </Full>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: title }}>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 70, color: "#1d2b4a", textAlign: "center", padding: "0 70px", lineHeight: 1.1 }}>
          THE MAN WHO WALKED BETWEEN THE <span style={{ color: "#d9a02a" }}>TOWERS</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== сборка ===============
const Grain: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <Img src={staticFile("towers/grain.png")} style={{ position: "absolute", width: 1600, height: 2800, left: -(rnd(f) * 500), top: -(rnd(f + 1) * 860) }} />
  </AbsoluteFill>
);

export const TowersFilm: React.FC = () => {
  const f = useCurrentFrame();
  const retro = f >= 288 && f < 1650;
  const cut = (a: number) => ip(f, [a - 1, a, a + 5], [0, 1, 0]);
  const whip = Math.max(cut(150), cut(360), cut(460), cut(510), cut(660), cut(840), cut(1020), cut(1110), cut(1310), cut(1350), cut(1440), cut(1650));
  const night = f < 288 || (f >= 660 && f < 1020);
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <AbsoluteFill style={{ filter: retro ? "sepia(0.12) saturate(1.05)" : "none" }}>
        <Sequence from={0} durationInFrames={150}><Scene1 /></Sequence>
        <Sequence from={150} durationInFrames={210}><Scene2 /></Sequence>
        <Sequence from={360} durationInFrames={300}><Scene3 /></Sequence>
        <Sequence from={660} durationInFrames={360}><Scene4 /></Sequence>
        <Sequence from={1020} durationInFrames={420}><Scene5 /></Sequence>
        <Sequence from={1440} durationInFrames={210}><Scene6 /></Sequence>
        <Sequence from={1650} durationInFrames={150}><Scene7 /></Sequence>
      </AbsoluteFill>
      {night ? <AbsoluteFill><Full><Dust f={f} /></Full></AbsoluteFill> : null}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px 50px rgba(5,8,18,0.7)", pointerEvents: "none", opacity: ip(f, [1745, 1775], [1, 0]) }} />
      <Grain f={f} o={0.1} />
      <AbsoluteFill style={{ background: "#fff", opacity: whip * 0.18 }} />
      <Rubric f={f} />
      {f < 1750 ? <Subs f={f} /> : null}
      <Audio src={staticFile("towers/sound.wav")} />
    </AbsoluteFill>
  );
};
