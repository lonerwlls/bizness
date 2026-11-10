// 6 анимационных техник: короткие ожившие сцены (по 6 с) с нашим героем.
// npx remotion render src/brand/anim7/index.tsx A7-<id> out.mp4   (A7-cgi — с --gl=swangle)
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, Composition, Easing, interpolate, registerRoot, useCurrentFrame } from "remotion";
import { CamRig, Human, MOODS, NPCS, STAND3D, Street, WALK_Y, World, walkPose } from "../../lowpoly/kit3d";
import { Bean, BeanDefs, HERO2D, NEIGHBOR_B } from "../../toontest/bean";
import { Hero } from "../styles10/hero";

const W = 1920, H = 1080, LEN = 180, INK = "#16131f";
const ip = (f: number, a: number[], b: number[], e = Easing.inOut(Easing.cubic)) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const D = Math.PI / 180;
const talk = (f: number) => Math.max(0, Math.sin(f * 0.9) * 0.6 + Math.sin(f * 2.3) * 0.4);
/** кисть персонажа Bean (s — масштаб, side 1 = правая рука) */
const beanHand = (x: number, y: number, s: number, side: 1 | -1, a: [number, number], flip = false): [number, number] => {
  const lx = side * 58 + side * Math.sin(a[0] * D) * 78 + side * Math.sin((a[0] + a[1]) * D) * 72;
  const ly = -318 + Math.cos(a[0] * D) * 78 + Math.cos((a[0] + a[1]) * D) * 72;
  return [x + (flip ? -lx : lx) * s, y + ly * s];
};
const Cam: React.FC<{ s: number; cx: number; cy: number; children: React.ReactNode }> = ({ s, cx, cy, children }) => (
  <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);
const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#000" }) => (
  <AbsoluteFill style={{ background: bg }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><BeanDefs />{children}</svg></AbsoluteFill>
);

// ================= 1. ВЕКТОРНАЯ ПЕРСОНАЖНАЯ (РИГГИНГ) — как в референсах =================
const KITCHEN_FLOOR = 900;
const Kitchen: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#f4e6cf" />
    <rect x={0} y={560} width={W} height={340} fill="#e9d6b6" />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70} y={560} width={68} height={68} fill="none" stroke="rgba(22,19,31,0.07)" strokeWidth={2} />)}
    <rect x={260} y={140} width={420} height={300} rx={8} fill="#bfe4f7" stroke={INK} strokeWidth={7} />
    <path d="M 260 360 Q 400 300 520 340 Q 600 300 680 330 L 680 440 L 260 440 Z" fill="#a9d99a" />
    <rect x={466} y={140} width={8} height={300} fill={INK} /><rect x={240} y={430} width={460} height={22} fill="#f6efe2" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <rect key={i} x={900 + i * 190} y={120} width={180} height={220} rx={10} fill="#7fb7a8" stroke={INK} strokeWidth={7} />)}
    <rect x={880} y={600} width={600} height={300} fill="#7fb7a8" stroke={INK} strokeWidth={7} />
    <rect x={860} y={580} width={640} height={36} rx={8} fill="#f6efe2" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => <circle key={i} cx={980 + i * 200} cy={700} r={10} fill="#f6efe2" stroke={INK} strokeWidth={4} />)}
    <rect x={1580} y={220} width={260} height={680} rx={20} fill="#eef2f6" stroke={INK} strokeWidth={7} />
    <path d="M 1580 470 L 1840 470" stroke={INK} strokeWidth={6} /><rect x={1600} y={380} width={14} height={70} rx={6} fill="#9aa4b2" />
    <rect x={1000} y={520} width={60} height={60} rx={8} fill="#d8443a" stroke={INK} strokeWidth={6} />
    <rect x={0} y={KITCHEN_FLOOR - 4} width={W} height={H} fill="#c79a6a" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${i * 170} ${KITCHEN_FLOOR} L ${i * 170 - 80} ${H}`} stroke="rgba(22,19,31,0.15)" strokeWidth={4} />)}
  </g>
);
const Mug: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -24 -44 L 24 -44 L 20 0 L -20 0 Z" fill="#ffd23c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 22 -34 Q 42 -30 36 -14 Q 32 -6 20 -8" fill="none" stroke={INK} strokeWidth={6} />
    {[0, 1].map((i) => <path key={i} d={`M ${-8 + i * 14} -54 q -8 -14 0 -26 q 8 -12 0 -24`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={5} strokeLinecap="round" />)}
  </g>
);
export const VectorRig: React.FC = () => {
  const f = useCurrentFrame();
  const walk = ip(f, [0, 48], [0, 1], Easing.out(Easing.quad));
  const hx = lerp(260, 820, walk), moving = f < 48;
  const ph = f * 0.42, swing = moving ? Math.sin(ph) : 0;
  const reach = ip(f, [52, 66], [0, 1]) * (1 - ip(f, [70, 84], [0, 0.55]));
  const armR: [number, number] = [lerp(10 + swing * 18, 75, reach), lerp(6, -10, reach)];
  const holding = f >= 66;
  const MUG_TABLE: [number, number] = [1010, 582];
  const hand = beanHand(hx, KITCHEN_FLOOR, 1.0, 1, armR);
  const mug: [number, number] = holding ? [hand[0] + 6, hand[1] + 24] : MUG_TABLE;
  const shot2 = f >= 96;
  const cam = shot2 ? { s: lerp(1.75, 1.85, (f - 96) / 84), cx: 1080, cy: 520 } : { s: lerp(1.0, 1.05, f / 96), cx: W / 2, cy: H / 2 };
  const friendExpr = f < 140 ? "neutral" : "shock";
  const heroTalk = shot2 && f < 138;
  return (
    <Stage>
      <Cam {...cam}>
        <Kitchen />
        {/* стол перед гарнитуром (на него ставится кружка) */}
        <Bean x={1420} y={KITCHEN_FLOOR} s={1.0} look={NEIGHBOR_B} expr={friendExpr} open={f > 140 ? 1 : 0} f={f + 40} flip sweat={f > 150}
          pose={{ armL: f > 140 ? [150, 60] : [14, 8], armR: f > 140 ? [150, 60] : [14, 8], lean: f > 140 ? 6 : 0, tilt: shot2 ? -6 : 0 }} />
        <Bean x={hx} y={KITCHEN_FLOOR - Math.abs(swing) * 6} s={1.0} look={HERO2D} expr={heroTalk ? "talk" : f > 140 ? "grin" : "smirk"} open={heroTalk ? talk(f) : 0} f={f}
          pose={{ legL: 4 + swing * 24, legR: 4 - swing * 24, armL: [12 - swing * 18, 8], armR, lean: moving ? 3 : 0, tilt: shot2 ? 5 : 0 }} />
        <Mug x={mug[0]} y={mug[1]} />
      </Cam>
    </Stage>
  );
};

// ================= 2. CUT-OUT (вырезная бумажная анимация, 8 кадров/с) =================
export const CutOut: React.FC = () => {
  const f0 = useCurrentFrame(), f = Math.floor(f0 / 4) * 4; // шаг 4 кадра — «рывками», как у вырезок
  const march = f * 3.2, step = Math.sin(f * 0.35);
  const pal = (c: string) => ({ jacket: c, pack: "#c8a86a", beanie: "#7a1f1f", pom: "#e8c060", limb: "#3a2a20", shoe: "#3a2a20", head: "#f4ead6", ink: "#3a2a20" });
  return (
    <AbsoluteFill style={{ background: "#e8d6a8" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="cut" x="-10%" y="-10%" width="120%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={Math.floor(f0 / 4) % 3} result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="5" result="d" />
            <feDropShadow in="d" dx="5" dy="7" stdDeviation="3" floodColor="#3a2410" floodOpacity="0.45" />
          </filter>
          <filter id="tex"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="5" /><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.16 0" /></filter>
        </defs>
        <rect width={W} height={H} fill="#f0dcae" />
        <g filter="url(#cut)">
          <circle cx={1600 - f * 0.4} cy={200} r={110} fill="#f2b04a" />
          {[[300, 180], [900, 130]].map(([x, y], i) => <path key={i} transform={`translate(${x - f * (0.8 + i * 0.4)} ${y})`} d="M -110 20 Q -110 -30 -60 -30 Q -40 -70 10 -60 Q 60 -80 90 -30 Q 130 -20 120 20 Z" fill="#fbf2dc" />)}
          {/* замок из бумаги */}
          <g transform={`translate(${1250 - f * 1.2} 0)`}>
            <rect x={0} y={330} width={520} height={460} fill="#b7a58a" />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 90} y={300} width={60} height={40} fill="#b7a58a" />)}
            <rect x={-80} y={220} width={150} height={570} fill="#a8967a" /><path d="M -100 220 L -5 100 L 90 220 Z" fill="#7a2f2f" />
            <rect x={450} y={220} width={150} height={570} fill="#a8967a" /><path d="M 430 220 L 525 100 L 620 220 Z" fill="#7a2f2f" />
            <path d="M 180 790 L 180 600 Q 260 520 340 600 L 340 790 Z" fill="#4a3424" />
            <rect x={-5} y={60} width={6} height={60} fill="#3a2a20" /><path d="M 0 62 L 60 75 L 0 92 Z" fill="#d8443a" />
          </g>
          <path d="M 0 790 Q 480 760 960 790 Q 1440 820 1920 780 L 1920 1080 L 0 1080 Z" fill="#7ea05a" />
          <path d="M 0 900 Q 600 860 1200 900 Q 1600 930 1920 890 L 1920 1080 L 0 1080 Z" fill="#6a8a48" />
          {/* отряд: солдаты-вырезки и герой с флагом, шагают рывками */}
          {[0, 1, 2].map((k) => {
            const x = 180 + march * 0.9 - k * 210, st = Math.sin(f * 0.35 + k);
            return <Hero key={k} x={x} y={880 - Math.abs(st) * 8} s={0.62} sw={0} pins eyes="dot" mouth="none" legL={4 + st * 18} legR={4 - st * 18} armL={[10, 6]} armR={[40, -20]}
              pal={pal(["#5a6a3a", "#4a5a7a", "#7a4a3a"][k])} />;
          })}
          <g>
            <Hero x={460 + march * 0.9} y={880 - Math.abs(step) * 10} s={0.72} sw={0} pins eyes="dot" mouth="o" legL={4 + step * 20} legR={4 - step * 20} armL={[10, 6]} armR={[150, 20]}
              pal={{ ...pal("#f27a2a"), beanie: "#2c3552", pom: "#f4f2ec", pack: "#f4c430" }} />
            <rect x={460 + march * 0.9 + 58} y={880 - Math.abs(step) * 10 - 520} width={8} height={300} fill="#5a3a20" />
            <path d={`M ${460 + march * 0.9 + 66} ${880 - Math.abs(step) * 10 - 520} l 90 ${20 + step * 8} l -90 34 Z`} fill="#d8443a" />
          </g>
        </g>
        <rect width={W} height={H} filter="url(#tex)" />
      </svg>
    </AbsoluteFill>
  );
};

// ================= 3. РИСОВАННАЯ «ДЫШАЩАЯ» ЛИНИЯ (frame-by-frame sketch) =================
export const Sketch: React.FC = () => {
  const f = useCurrentFrame(), boil = Math.floor(f / 3);
  const walk = f * 4.2, ph = f * 0.36, sw = Math.sin(ph);
  const rainR = (i: number) => { const x = ((i * 137) % W + f * 6) % W, y = ((i * 251) % H + f * 38) % H; return [x, y]; };
  const splash = (f % 45) / 45;
  return (
    <AbsoluteFill style={{ background: "#f1e8d6" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="boil"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={boil % 4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="6" /></filter>
          <filter id="pap"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="9" /><feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0.12 0" /></filter>
          <pattern id="hatchS" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M 0 0 L 0 16" stroke="#6a6a7a" strokeWidth="2" /></pattern>
        </defs>
        <g filter="url(#boil)" stroke="#2a2a33" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          {/* дома от руки */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${i * 420 - 60} 0)`}>
              <path d={`M 0 820 L 0 ${300 + (i % 2) * 80} L 360 ${300 + (i % 2) * 80} L 360 820`} fill={["#d9cbb4", "#cfd5d8", "#e0c8b8", "#cdd6c4", "#d8cfe0"][i]} />
              <path d={`M 0 ${300 + (i % 2) * 80} L 180 ${200 + (i % 2) * 80} L 360 ${300 + (i % 2) * 80}`} fill="url(#hatchS)" />
              {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={50 + c * 170} y={380 + (i % 2) * 80 + r * 170} width={90} height={110} fill={(i + r + c) % 3 ? "#f6d98a" : "#b9c8d8"} />))}
            </g>
          ))}
          <path d="M 0 820 L 1920 820" /><rect x={0} y={820} width={W} height={260} fill="#a8a8b4" />
          <ellipse cx={1180} cy={960} rx={200} ry={26} fill="#c8d4e4" />
        </g>
        {/* герой под зонтом идёт по лужам */}
        <g filter="url(#boil)">
          <Hero x={200 + walk} y={940 - Math.abs(sw) * 8} s={0.78} sw={4} legL={4 + sw * 24} legR={4 - sw * 24} armL={[12 - sw * 16, 8]} armR={[150, -40]} eyes="dot" mouth="smile"
            pal={{ ink: "#2a2a33", limb: "#2a2a33" }} />
          <g transform={`translate(${200 + walk + 129} ${940 - Math.abs(sw) * 8 - 546})`} stroke="#2a2a33" strokeWidth={4}>
            <path d="M -170 0 Q 0 -150 170 0 Q 128 -16 85 0 Q 42 -16 0 0 Q -42 -16 -85 0 Q -128 -16 -170 0 Z" fill="#d8443a" />
            <path d="M 0 0 L 0 240 Q 0 262 -20 256" fill="none" />
          </g>
        </g>
        {Array.from({ length: 90 }, (_, i) => { const [x, y] = rainR(i); return <path key={i} d={`M ${x} ${y} l -6 34`} stroke="#5a6a8a" strokeWidth={2.5} opacity={0.7} />; })}
        {splash < 0.5 ? <g filter="url(#boil)" stroke="#5a6a8a" strokeWidth={3} fill="none">{[-1, 1].map((s) => <path key={s} d={`M ${1180 + s * 20} 950 q ${s * 30} ${-40 * (1 - splash * 2)} ${s * 60} 0`} />)}</g> : null}
        <rect width={W} height={H} filter="url(#pap)" />
      </svg>
    </AbsoluteFill>
  );
};

// ================= 4. МОУШН-ГРАФИКА / ИНФОГРАФИКА (космос, геометрия) =================
export const Motion: React.FC = () => {
  const f = useCurrentFrame();
  const stars = Array.from({ length: 140 }, (_, i) => ({ x: (i * 397) % W, y: (i * 211) % H, r: 1 + (i % 3), d: 0.3 + (i % 4) * 0.4 }));
  const rot = Math.sin(f / 40) * 12, drift = Math.sin(f / 30) * 18;
  const draw = ip(f, [60, 100], [0, 1]);
  const pr = ip(f, [0, 180], [0, 360], Easing.linear);
  return (
    <AbsoluteFill style={{ background: "#0d1430" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="pl" cx="35%" cy="35%" r="70%"><stop offset="0%" stopColor="#ffb36a" /><stop offset="100%" stopColor="#d2543a" /></radialGradient>
          <radialGradient id="sunM" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(120,180,255,0.35)" /><stop offset="100%" stopColor="rgba(120,180,255,0)" /></radialGradient>
        </defs>
        <circle cx={1500} cy={300} r={500} fill="url(#sunM)" />
        {stars.map((s, i) => <circle key={i} cx={(s.x - f * s.d + W) % W} cy={s.y} r={s.r} fill="#dfe8ff" opacity={0.4 + (i % 5) * 0.12} />)}
        {/* планета с кольцами и спутником */}
        <g transform="translate(1420 380)">
          <ellipse rx={330} ry={70} fill="none" stroke="#ffd9a8" strokeWidth={14} opacity={0.6} transform="rotate(-15)" />
          <circle r={210} fill="url(#pl)" />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${-200} ${-60 + i * 60} Q 0 ${-80 + i * 60 + Math.sin(f / 20 + i) * 10} 200 ${-60 + i * 60}`} stroke="rgba(120,30,20,0.25)" strokeWidth={22} fill="none" />)}
          <path d="M -330 0 A 330 70 0 0 0 330 0" fill="none" stroke="#ffd9a8" strokeWidth={14} transform="rotate(-15)" />
          <g transform={`rotate(${pr})`}><circle cx={400} cy={0} r={32} fill="#cfd8ea" /></g>
        </g>
        {/* корабль и трос */}
        <g transform="translate(260 260)">
          <rect x={-120} y={-40} width={240} height={80} rx={40} fill="#e8eef8" /><circle cx={60} cy={0} r={22} fill="#5ab4ff" />
          <rect x={-170} y={-12} width={60} height={24} fill="#9aa8c0" /><path d="M -170 -12 L -230 0 L -170 12 Z" fill="#ff7a3a" opacity={0.6 + 0.4 * Math.sin(f)} />
        </g>
        <path d={`M 380 270 Q 620 ${520 + drift} 840 ${560 + drift}`} stroke="#cfd8ea" strokeWidth={5} fill="none" />
        {/* герой-астронавт плавает и вращается */}
        <g transform={`translate(860 ${700 + drift}) rotate(${rot})`}>
          <Hero x={0} y={0} s={0.7} sw={6} eyes="dot" mouth="o" armL={[120, 30]} armR={[130 + Math.sin(f / 10) * 20, 20]} legL={18 + Math.sin(f / 12) * 10} legR={-6}
            pal={{ jacket: "#f27a2a", limb: "#e8eef8", shoe: "#e8eef8", ink: "#0b1020" }} />
          <ellipse cx={0} cy={-432 * 0.7} rx={92 * 0.7 + 22} ry={86 * 0.7 + 30} fill="rgba(150,210,255,0.22)" stroke="#e8eef8" strokeWidth={6} />
        </g>
        {/* выноска-факт рисуется линией */}
        <g opacity={draw > 0 ? 1 : 0}>
          <path d={`M 760 ${640 + drift} L ${760 - 160 * draw} ${820 + drift} L ${760 - 460 * draw} ${820 + drift}`} stroke="#5af0ff" strokeWidth={4} fill="none" />
          <circle cx={760} cy={640 + drift} r={8} fill="#5af0ff" />
          <text x={300} y={800 + drift} fontFamily="sans-serif" fontWeight={800} fontSize={64} fill="#5af0ff" opacity={ip(f, [95, 110], [0, 1])}>0 g</text>
          <text x={300} y={870 + drift} fontFamily="sans-serif" fontWeight={600} fontSize={36} fill="#a8c4e8" opacity={ip(f, [100, 115], [0, 1])}>NO UP. NO DOWN.</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ================= 5. ТЕАТР ТЕНЕЙ (шарнирные силуэты на палочках) =================
export const Shadow: React.FC = () => {
  const f = useCurrentFrame(), K = "#120d0a";
  const rise = ip(f, [20, 90], [0, 1], Easing.out(Easing.cubic)), wave = (o: number) => Math.sin(f / 14 + o) * 18;
  const jit = Math.sin(f * 0.7) * 1.5;
  return (
    <AbsoluteFill style={{ background: "#2a1408" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs><radialGradient id="lampS" cx="50%" cy="45%" r="70%"><stop offset="0%" stopColor="#ffe9b8" /><stop offset="60%" stopColor="#f2a85a" /><stop offset="100%" stopColor="#5a2a10" /></radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation={1.2} /></filter></defs>
        <rect width={W} height={H} fill="url(#lampS)" />
        <g filter="url(#soft)" fill={K}>
          {/* кит поднимается из волн */}
          <g transform={`translate(1250 ${lerp(900, 560, rise)}) rotate(${-8 + Math.sin(f / 25) * 4})`}>
            <path d="M -360 40 Q -300 -170 0 -180 Q 260 -180 330 -40 Q 380 40 300 90 L -300 90 Q -380 80 -360 40 Z" />
            <path d="M 300 20 Q 420 -60 460 -150 Q 470 -60 520 -110 Q 500 0 330 70 Z" />
            <circle cx={-220} cy={-60} r={16} fill="#ffe9b8" />
            {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-300 + i * 70} y={40} width={30} height={10} fill="#ffe9b8" opacity={0.7} />)}
            <path d={`M -60 -180 q -20 ${-60 - rise * 40} -60 ${-90 - rise * 60} M -60 -180 q 20 ${-60 - rise * 40} 60 ${-90 - rise * 60}`} stroke={K} strokeWidth={10} fill="none" opacity={rise} />
          </g>
          {[0, 1, 2].map((i) => <path key={i} d={`M -40 ${830 + i * 70} ${Array.from({ length: 12 }, (_, k) => `q 90 ${-50 + wave(i + k * 0.3) * 0.5} 180 0`).join(" ")} L 1960 1080 L -40 1080 Z`} transform={`translate(${Math.sin(f / 20 + i * 2) * 40} 0)`} opacity={0.75 + i * 0.12} />)}
          {/* лодка и герой на палочке */}
          <g transform={`translate(560 ${800 + wave(0) * 0.6}) rotate(${wave(1) * 0.15})`}>
            <path d="M -200 0 L 200 0 Q 160 70 0 80 Q -160 70 -200 0 Z" />
            <Hero x={-20} y={0} s={0.55} sw={0} eyes="none" mouth="none" armL={[20, 10]} armR={[lerp(40, 160, rise), lerp(10, 30, rise)]} lean={-4 - rise * 6}
              pal={{ head: K, beanie: K, pom: K, jacket: K, pack: K, limb: K, shoe: K, ink: K }} />
            <path d={`M -20 -150 L ${-30 + jit} 420`} stroke={K} strokeWidth={5} opacity={0.6} />
          </g>
          <path d={`M ${1250 + jit} ${lerp(990, 650, rise)} L ${1240 + jit} 1080`} stroke={K} strokeWidth={6} opacity={0.6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ================= 6. СТИЛИЗОВАННАЯ 3D-АНИМАЦИЯ =================
export const CGI: React.FC = () => {
  const f = useCurrentFrame();
  const dist = f * 0.028, z = -3 + dist;
  const wave = f > 110;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true }} camera={{ fov: 40, near: 0.05, far: 1000 }}>
        <CamRig pos={[-2.2 + f * 0.004, 1.6, z + 3.8 - f * 0.006]} look={[1.3, 1.0, z - 0.6]} fov={38} />
        <World m={MOODS.morning} focus={[1.3, 0, z]} />
        <Street />
        <Human p={[1.35, WALK_Y, z]} pose={{ ...walkPose(dist), headYaw: wave ? 35 : 0 }} f={f} mouth={wave ? "smile" : "flat"} />
        <Human p={[3.2, 0.03, -2.2]} rotY={-1.9} look={NPCS[1]} f={f + 20} mouth="smile"
          pose={{ ...STAND3D, armR: wave ? [150 + Math.sin(f / 4) * 15, 30] : [4, 12] }} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const LIST: [string, React.FC][] = [["vector", VectorRig], ["cutout", CutOut], ["sketch", Sketch], ["motion", Motion], ["shadow", Shadow], ["cgi", CGI]];
const Root: React.FC = () => <>{LIST.map(([id, C]) => <Composition key={id} id={`A7-${id}`} component={C} durationInFrames={LEN} fps={30} width={W} height={H} />)}</>;
registerRoot(Root);
