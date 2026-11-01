// Персонаж канала: английский джентльмен (цилиндр, монокль, усы). 2D, рисуется SVG.
// Поза задаёт руки (точки локтя и кисти), брови, глаза и рот; между позами всё плавно интерполируется,
// при смене позы тело тянется вверх и сжимается (squash & stretch).
import { loadFont } from "@remotion/google-fonts/Montserrat";
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";

const { fontFamily: FONT } = loadFont("normal", { weights: ["900"], subsets: ["latin", "cyrillic"] });

export type Pose = "idle" | "think" | "shock" | "point" | "happy" | "sad";
type Hand = "fist" | "open" | "point" | "thumb";
type P = [number, number];
type Face = { brL: number; brR: number; tilt: number; eye: number; look: P; mouth: "smile" | "hmm" | "o" | "grin" | "frown"; closed?: boolean };
type PoseDef = { L: [P, P, Hand]; R: [P, P, Hand]; face: Face; lean: number };

const SL: P = [150, 640];
const SR: P = [450, 640];
const DOWN_L: [P, P, Hand] = [[120, 740], [140, 830], "fist"];
const DOWN_R: [P, P, Hand] = [[480, 740], [460, 830], "fist"];

export const POSES: Record<Pose, PoseDef> = {
  idle: { L: DOWN_L, R: DOWN_R, face: { brL: 0, brR: 0, tilt: 0, eye: 1, look: [0, 0], mouth: "smile" }, lean: 0 },
  think: {
    L: DOWN_L,
    R: [[500, 700], [385, 575], "fist"],
    face: { brL: -8, brR: 14, tilt: 10, eye: 0.9, look: [8, -9], mouth: "hmm" },
    lean: 4,
  },
  shock: {
    L: [[60, 560], [-10, 440], "open"],
    R: [[540, 560], [610, 440], "open"],
    face: { brL: 26, brR: 26, tilt: -8, eye: 1.3, look: [0, 0], mouth: "o" },
    lean: 0,
  },
  point: {
    L: DOWN_L,
    R: [[560, 560], [590, 420], "point"],
    face: { brL: 6, brR: 16, tilt: 0, eye: 1.05, look: [9, -6], mouth: "grin" },
    lean: -4,
  },
  happy: {
    L: DOWN_L,
    R: [[555, 610], [575, 500], "thumb"],
    face: { brL: 10, brR: 10, tilt: 0, eye: 1, look: [0, 0], mouth: "grin", closed: true },
    lean: -3,
  },
  sad: {
    L: DOWN_L,
    R: [[500, 600], [330, 395], "open"],
    face: { brL: -14, brR: -14, tilt: 12, eye: 0.85, look: [0, 7], mouth: "frown" },
    lean: 6,
  },
};

const NAVY = "#1d2547";
const SKIN = "#F4C8A4";
const HAIR = "#7a4a2c";
const GOLD = "#E3B23C";

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixP = (a: P, b: P, t: number): P => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

const HandShape: React.FC<{ at: P; kind: Hand; flip?: boolean }> = ({ at, kind, flip }) => (
  <g transform={`translate(${at[0]} ${at[1]}) scale(${flip ? -1 : 1} 1)`}>
    {/* Указательный палец смотрит вверх-внутрь, большой палец сбоку: не путать с другими жестами */}
    {kind === "point" && <rect x={-10} y={-88} width={22} height={60} rx={11} fill="#fff" stroke="#222" strokeWidth={5} transform="rotate(-50)" />}
    {kind === "thumb" && <rect x={-12} y={-84} width={26} height={52} rx={13} fill="#fff" stroke="#222" strokeWidth={5} transform="translate(-22 4)" />}
    {kind === "open" &&
      [-50, -20, 10, 40].map((a, i) => (
        <rect key={i} x={-9} y={-78} width={18} height={44} rx={9} fill="#fff" stroke="#222" strokeWidth={5} transform={`rotate(${a})`} />
      ))}
    {kind === "thumb" ? (
      <g>
        <rect x={-34} y={-32} width={78} height={70} rx={24} fill="#fff" stroke="#222" strokeWidth={6} />
        {[-12, 6, 22].map((y) => (
          <path key={y} d={`M10 ${y} L40 ${y}`} stroke="#bbb" strokeWidth={4} />
        ))}
      </g>
    ) : (
      <>
        <circle r={38} fill="#fff" stroke="#222" strokeWidth={6} />
        <path d="M-18 -6 Q0 6 18 -6" stroke="#ccc" strokeWidth={4} fill="none" />
      </>
    )}
  </g>
);

const Arm: React.FC<{ s: P; e: P; h: P; kind: Hand; flip?: boolean }> = ({ s, e, h, kind, flip }) => (
  <g>
    <path d={`M${s[0]} ${s[1]} Q${e[0]} ${e[1]} ${h[0]} ${h[1]}`} stroke="#111" strokeWidth={74} fill="none" strokeLinecap="round" />
    <path d={`M${s[0]} ${s[1]} Q${e[0]} ${e[1]} ${h[0]} ${h[1]}`} stroke={NAVY} strokeWidth={62} fill="none" strokeLinecap="round" />
    <HandShape at={h} kind={kind} flip={flip} />
  </g>
);

const Mouth: React.FC<{ kind: Face["mouth"]; open: number }> = ({ kind, open }) => {
  // open 0..1: разговор (рот открывается под голос поверх выражения).
  const o = kind === "o" ? 1 : kind === "grin" ? Math.max(0.5, open) : open;
  if (kind === "frown" && o < 0.2) return <path d="M262 540 Q300 515 338 540" stroke="#5a1f1f" strokeWidth={9} fill="none" strokeLinecap="round" />;
  if (kind === "hmm" && o < 0.2) return <path d="M275 532 L330 524" stroke="#5a1f1f" strokeWidth={9} strokeLinecap="round" />;
  if (o < 0.15) return <path d="M258 520 Q300 552 342 520" stroke="#5a1f1f" strokeWidth={9} fill="none" strokeLinecap="round" />;
  const w = kind === "o" ? 34 : 46;
  const h = 10 + o * (kind === "o" ? 48 : 34);
  return (
    <g>
      <ellipse cx={300} cy={525 + h / 2} rx={w} ry={h} fill="#5a1f1f" />
      <ellipse cx={300} cy={525 + h * 1.1} rx={w * 0.55} ry={h * 0.4} fill="#e0606a" />
      {kind !== "o" && <rect x={300 - w * 0.7} y={523} width={w * 1.4} height={Math.min(14, h * 0.5)} rx={5} fill="#fff" />}
    </g>
  );
};

// from → to с прогрессом t (0..1); squash = фаза растяжения/сжатия; talk = 0..1 открытие рта; blink = 0..1.
export const Gentleman: React.FC<{ from: Pose; to: Pose; t: number; squash?: number; talk?: number; blink?: number }> = ({
  from,
  to,
  t,
  squash = 0,
  talk = 0,
  blink = 0,
}) => {
  const A = POSES[from];
  const B = POSES[to];
  const L: [P, P] = [mixP(A.L[0], B.L[0], t), mixP(A.L[1], B.L[1], t)];
  const R: [P, P] = [mixP(A.R[0], B.R[0], t), mixP(A.R[1], B.R[1], t)];
  const fa = A.face;
  const fb = B.face;
  const brL = mix(fa.brL, fb.brL, t);
  const brR = mix(fa.brR, fb.brR, t);
  const tilt = mix(fa.tilt, fb.tilt, t);
  const eye = mix(fa.eye, fb.eye, t);
  const look = mixP(fa.look, fb.look, t);
  const face = t < 0.5 ? fa : fb;
  const lean = mix(A.lean, B.lean, t);
  const sy = 1 + 0.2 * squash;
  const sx = 1 - 0.13 * squash;
  const closed = face.closed || blink > 0.5;

  const Eye: React.FC<{ cx: number }> = ({ cx }) =>
    closed ? (
      <path d={`M${cx - 26} 400 Q${cx} ${face.closed ? 378 : 404} ${cx + 26} 400`} stroke="#222" strokeWidth={8} fill="none" strokeLinecap="round" />
    ) : (
      <g transform={`translate(${cx} 398) scale(${eye})`}>
        <ellipse rx={27} ry={31} fill="#fff" stroke="#222" strokeWidth={5} />
        <circle cx={look[0]} cy={look[1]} r={13} fill="#222" />
        <circle cx={look[0] + 5} cy={look[1] - 5} r={4} fill="#fff" />
      </g>
    );

  return (
    <svg viewBox="-80 0 760 860" width="100%" height="100%" style={{ overflow: "visible" }}>
      <g transform={`translate(300 860) rotate(${lean}) scale(${sx} ${sy}) translate(-300 -860)`}>
        {/* Тело: фрак, рубашка, бабочка */}
        <path d="M70 860 Q80 640 190 600 L410 600 Q520 640 530 860 Z" fill={NAVY} stroke="#111" strokeWidth={8} />
        <path d="M245 600 L300 760 L355 600 Z" fill="#fff" stroke="#111" strokeWidth={6} />
        <path d="M245 600 L300 760 L210 700 Z" fill="#2b3566" />
        <path d="M355 600 L300 760 L390 700 Z" fill="#2b3566" />
        <path d="M260 612 L300 632 L340 612 L340 652 L300 632 L260 652 Z" fill="#B3202A" stroke="#111" strokeWidth={5} />
        <circle cx={300} cy={700} r={7} fill="#111" />
        {/* Цепочка монокля */}
        <path d={`M${375 + look[0] * 0.3} 435 Q 420 560 380 700`} stroke={GOLD} strokeWidth={5} fill="none" />

        {/* Голова */}
        <g transform={`rotate(${tilt} 300 600)`}>
          <ellipse cx={168} cy={420} rx={26} ry={36} fill={SKIN} stroke="#111" strokeWidth={6} />
          <ellipse cx={432} cy={420} rx={26} ry={36} fill={SKIN} stroke="#111" strokeWidth={6} />
          <ellipse cx={300} cy={430} rx={135} ry={160} fill={SKIN} stroke="#111" strokeWidth={7} />
          <path d="M172 330 Q160 400 180 450 L195 450 Q190 390 205 335 Z" fill={HAIR} />
          <path d="M428 330 Q440 400 420 450 L405 450 Q410 390 395 335 Z" fill={HAIR} />
          <ellipse cx={220} cy={470} rx={26} ry={16} fill="#F29C8C" opacity={0.55} />
          <ellipse cx={380} cy={470} rx={26} ry={16} fill="#F29C8C" opacity={0.55} />
          <Eye cx={250} />
          <Eye cx={350} />
          {/* Монокль на правом глазу */}
          <circle cx={350} cy={398} r={44} fill="rgba(200,230,255,.18)" stroke={GOLD} strokeWidth={8} />
          {/* Брови */}
          <path d={`M218 ${352 - brL} Q250 ${336 - brL * 1.3} 282 ${350 - brL + (fb.mouth === "frown" ? -10 : 0) * t}`} stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d={`M318 ${350 - brR + (fb.mouth === "frown" ? -10 : 0) * t} Q350 ${336 - brR * 1.3} 382 ${352 - brR}`} stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          {/* Нос */}
          <ellipse cx={300} cy={452} rx={30} ry={34} fill="#EDAA8A" stroke="#111" strokeWidth={6} />
          <Mouth kind={face.mouth} open={talk} />
          {/* Усы-руль */}
          <path
            d="M300 488 C270 470 230 476 214 500 C200 520 180 520 168 500 C175 540 225 545 250 515 C268 500 288 500 300 506 C312 500 332 500 350 515 C375 545 425 540 432 500 C420 520 400 520 386 500 C370 476 330 470 300 488 Z"
            fill={HAIR}
            stroke="#111"
            strokeWidth={5}
          />
          {/* Цилиндр */}
          <g transform="rotate(-7 300 300)">
            <path d="M200 300 L212 90 Q300 70 388 90 L400 300 Z" fill="#17171f" stroke="#000" strokeWidth={7} />
            <rect x={203} y={240} width={194} height={34} fill="#B3202A" />
            <ellipse cx={300} cy={300} rx={185} ry={30} fill="#17171f" stroke="#000" strokeWidth={7} />
            <path d="M228 110 L222 230" stroke="rgba(255,255,255,.18)" strokeWidth={14} strokeLinecap="round" />
          </g>
        </g>

        <Arm s={SL} e={L[0]} h={L[1]} kind={t < 0.5 ? A.L[2] : B.L[2]} flip />
        <Arm s={SR} e={R[0]} h={R[1]} kind={t < 0.5 ? A.R[2] : B.R[2]} />
      </g>
    </svg>
  );
};

// ---------- Референс: все эмоции + аватарка ----------
const LABELS: Record<Pose, string> = { idle: "спокоен", think: "задумался", shock: "в шоке", point: "факт!", happy: "доволен", sad: "facepalm" };

export const GentSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #22306a, #0b1020 70%)", flexDirection: "row", flexWrap: "wrap", padding: 40 }}>
    {(Object.keys(POSES) as Pose[]).map((p) => (
      <div key={p} style={{ width: "33.3%", height: "50%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 560, height: 620 }}>
          <Gentleman from={p} to={p} t={1} talk={p === "point" ? 0.6 : 0} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#FFC72C", textTransform: "uppercase" }}>{LABELS[p]}</div>
      </div>
    ))}
  </AbsoluteFill>
);

export const GentAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #2f6b4f, #123326 75%)", alignItems: "center", justifyContent: "flex-end" }}>
    <div style={{ position: "absolute", inset: 0, background: "repeating-conic-gradient(from 0deg at 50% 60%, rgba(255,199,44,.12) 0 8deg, transparent 8deg 16deg)" }} />
    <div style={{ position: "relative", width: 1000, height: 1130, marginBottom: -230 }}>
      <Gentleman from="point" to="point" t={1} talk={0.5} />
    </div>
  </AbsoluteFill>
);

// Прогресс смены позы с перелётом: 0..1 за ~8 кадров.
export const poseT = (lf: number) => interpolate(lf, [0, 8], [0, 1], { extrapolateRight: "clamp" });

// ---------- Уильям в ролике ----------
type BeatLike = { k: string; sfx?: string; t?: unknown; ok?: boolean; up?: boolean; g?: Pose };

// Эмоция под кадр, если в бите не задана явно (g).
export const autoPose = (b: BeatLike, i: number): Pose => {
  if (b.g) return b.g;
  if (b.sfx === "boom") return "shock";
  if (b.k === "crossed") return i % 2 ? "sad" : "shock";
  if ((b.k === "chart" && !b.up) || (b.k === "check" && !b.ok)) return "sad";
  if (b.k === "subscribe" || b.k === "rain" || (b.k === "chart" && b.up) || (b.k === "check" && b.ok)) return "happy";
  if (["counter", "price", "bars", "big", "brand"].includes(b.k)) return "point";
  if (typeof b.t === "string" && b.t.includes("?")) return "think";
  return i % 2 ? "think" : "idle";
};

const GW = 700;
const GH = 793;
const corner = (i: number) => Math.floor(i / 4) % 2;

// Выглядывает из нижнего угла (меняет угол каждые 4 бита), тянется/сжимается при смене эмоции,
// говорит ртом под озвучку (talk 0..1), моргает.
// top: верх блока 700×793, scale: размер (ноги остаются на линии top + 793).
export const GentOverlay: React.FC<{ frame: number; BF: number[]; poses: Pose[]; talk: number; top?: number; scale?: number }> = ({ frame, BF, poses, talk, top = 1250, scale = 1 }) => {
  let bi = 0;
  BF.forEach((s, i) => {
    if (s <= frame) bi = i;
  });
  const lf = frame - BF[bi];
  const pose = poses[bi];
  const prev = bi > 0 ? poses[bi - 1] : "idle";
  const changed = pose !== prev || bi === 0;
  const side = corner(bi);
  const enters = bi === 0 || corner(bi - 1) !== side;
  const leaves = bi + 1 < BF.length && corner(bi + 1) !== side;
  let dy = 0;
  if (enters) dy += interpolate(spring({ frame: lf, fps: 30, config: { damping: 10, stiffness: 140 } }), [0, 1], [GH, 0]);
  if (leaves) dy += interpolate(frame, [BF[bi + 1] - 7, BF[bi + 1]], [0, GH], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const squash = (changed ? Math.sin(lf * 0.55) * Math.exp(-lf / 7) : 0) + Math.sin(frame / 9) * 0.03;
  const t = changed ? interpolate(lf, [0, 7], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) }) : 1;
  const blink = frame % 95 < 4 ? 1 : 0;
  const left = side === 0;
  return (
    <div
      style={{
        position: "absolute",
        width: GW,
        height: GH,
        top,
        left: left ? -70 : 1080 - GW + 70,
        transformOrigin: left ? "0% 100%" : "100% 100%",
        transform: `translateY(${dy * scale}px) rotate(${left ? 10 : -10}deg) scale(${scale})`,
      }}
    >
      <div style={{ width: "100%", height: "100%", transform: left ? undefined : "scaleX(-1)" }}>
        <Gentleman from={changed ? prev : pose} to={pose} t={t} squash={squash} talk={talk} blink={blink} />
      </div>
    </div>
  );
};

// Шапка YouTube 2560×1440: всё важное в безопасной зоне по центру 1546×423.
export const GentBanner: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #22306a 0%, #0b1020 60%, #05070f 100%)" }}>
    <AbsoluteFill
      style={{
        backgroundImage: "linear-gradient(rgba(255,199,44,.08) 3px, transparent 3px), linear-gradient(90deg, rgba(255,199,44,.08) 3px, transparent 3px)",
        backgroundSize: "120px 120px",
      }}
    />
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", alignItems: "center", gap: 40 }}>
      <div style={{ width: 380, height: 430, flexShrink: 0, marginTop: 40 }}>
        <Gentleman from="point" to="point" t={1} talk={0.5} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.02 }}>
        <div style={{ fontSize: 120, color: "#fff", letterSpacing: -2 }}>Уильям Денежкин</div>
        <div style={{ fontSize: 58, color: "#FFC72C", marginTop: 18 }}>как на самом деле зарабатывают гиганты</div>
      </div>
    </div>
  </AbsoluteFill>
);
