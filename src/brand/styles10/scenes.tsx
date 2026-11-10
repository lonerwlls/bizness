// 10 художественных техник — у каждой своя сцена и свой способ рисовать мир и героя.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Hero } from "./hero";

const fh = delayRender("s10 fonts");
Promise.all([
  new FontFace("S10Mont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load(),
  new FontFace("S10Type", `url(${staticFile("towers/fonts/SpecialElite.woff2")}) format("woff2")`).load(),
  new FontFace("S10Serif", `url(${staticFile("towers/fonts/PlayfairDisplay.woff2")}) format("woff2")`, { weight: "400 900" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); });

const W = 1920, H = 1080;
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const Svg: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <AbsoluteFill style={{ background: bg ?? "#000" }}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{children}</svg></AbsoluteFill>
);

// ===================== 1. БУМАЖНАЯ АППЛИКАЦИЯ =====================
export const PaperCut: React.FC = () => {
  const r = rng(11);
  const layer = (d: string, fill: string, k: number) => <path d={d} fill={fill} filter={`url(#pc${k})`} />;
  return (
    <Svg>
      <defs>
        <filter id="paperTex"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="4" /><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
        {[1, 2, 3, 4].map((k) => (
          <filter key={k} id={`pc${k}`} x="-10%" y="-10%" width="120%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={k * 3} result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="6" result="d" />
            <feDropShadow in="d" dx="0" dy={4 + k * 2} stdDeviation={4 + k} floodColor="#0b1430" floodOpacity="0.55" />
          </filter>
        ))}
        <pattern id="fibers" width="400" height="400" patternUnits="userSpaceOnUse">
          {Array.from({ length: 90 }, (_, i) => { const a = r() * 400, b = r() * 400; return <path key={i} d={`M ${a} ${b} q ${r() * 20} ${r() * 10} ${r() * 30} ${r() * 4}`} stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} fill="none" />; })}
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#1d2a5e" />
      <rect width={W} height={H} fill="url(#fibers)" />
      {layer("M 1380 260 m -150 0 a 150 150 0 1 0 300 0 a 150 150 0 1 0 -300 0", "#f6e7b8", 1)}
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={r() * W} cy={r() * 480} r={3 + r() * 4} fill="#f6e7b8" opacity={0.8} />)}
      {layer("M 0 640 Q 300 480 640 600 Q 980 700 1300 560 Q 1600 450 1920 590 L 1920 1080 L 0 1080 Z", "#2f4f86", 1)}
      {layer("M 0 760 Q 380 600 760 720 Q 1120 820 1500 690 Q 1720 630 1920 700 L 1920 1080 L 0 1080 Z", "#3e7a6a", 2)}
      {/* бумажные ёлки */}
      {[[220, 700, 1.2], [420, 740, 0.9], [1540, 690, 1.3], [1760, 720, 1.0], [1180, 760, 0.8]].map(([x, y, s], i) => (
        <g key={i} filter="url(#pc3)" transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x={-12} y={0} width={24} height={60} fill="#6a4630" />
          <path d="M 0 -260 L 90 -120 L 50 -120 L 120 0 L -120 0 L -50 -120 L -90 -120 Z" fill={i % 2 ? "#2e6b4e" : "#3d8a5c"} />
        </g>
      ))}
      {layer("M 0 880 Q 480 790 960 860 Q 1440 930 1920 840 L 1920 1080 L 0 1080 Z", "#5aa36a", 3)}
      {/* грибы и светлячки из бумаги */}
      {[[1260, 900], [1330, 915]].map(([x, y], i) => <g key={i} filter="url(#pc4)"><rect x={x - 10} y={y - 40} width={20} height={44} fill="#f4ead6" /><path d={`M ${x - 46} ${y - 36} Q ${x} ${y - 100} ${x + 46} ${y - 36} Z`} fill="#d8443a" /></g>)}
      {Array.from({ length: 14 }, (_, i) => <circle key={"f" + i} cx={700 + r() * 900} cy={520 + r() * 300} r={7} fill="#ffe36a" filter="url(#pc4)" />)}
      <g filter="url(#pc4)"><Hero x={860} y={905} s={0.95} sw={0} pins armR={[150, 30]} eyes="dot" mouth="smile" /></g>
      <rect width={W} height={H} filter="url(#paperTex)" />
    </Svg>
  );
};

// ===================== 2. АКВАРЕЛЬНАЯ КНИЖКА =====================
export const Watercolor: React.FC = () => {
  const wash = (d: string, c: string, o = 0.55, k = 1) => (
    <g>
      <path d={d} fill={c} opacity={o} filter={`url(#wc${k})`} />
      <path d={d} fill="none" stroke={c} strokeWidth={6} opacity={o * 0.8} filter={`url(#wc${k})`} />
    </g>
  );
  return (
    <Svg bg="#f5eedd">
      <defs>
        {[1, 2, 3].map((k) => (
          <filter key={k} id={`wc${k}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency={0.012 + k * 0.006} numOctaves="4" seed={k * 7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={18 + k * 6} result="d" />
            <feGaussianBlur in="d" stdDeviation="1.6" />
          </filter>
        ))}
        <filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" /></filter>
        <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="9" /><feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.12 0" /></filter>
      </defs>
      {wash("M 0 0 L 1920 0 L 1920 520 Q 960 470 0 540 Z", "#f6b07a", 0.55, 2)}
      {wash("M 0 0 L 1920 0 L 1920 300 Q 960 240 0 330 Z", "#b9a6d8", 0.45, 3)}
      <circle cx={1500} cy={430} r={110} fill="#ffd27a" opacity={0.7} filter="url(#wc2)" />
      {wash("M 0 700 Q 420 520 900 600 Q 1400 690 1920 560 L 1920 1080 L 0 1080 Z", "#9cc98a", 0.6, 1)}
      {wash("M 0 820 Q 600 720 1200 800 Q 1600 850 1920 790 L 1920 1080 L 0 1080 Z", "#6aa56a", 0.55, 2)}
      {/* большое дерево */}
      {wash("M 560 760 Q 580 600 540 480 L 610 470 Q 640 620 650 760 Z", "#8a6248", 0.75, 1)}
      {wash("M 300 480 Q 280 300 450 260 Q 520 140 680 200 Q 850 220 840 380 Q 860 520 680 540 Q 500 580 380 540 Q 300 530 300 480 Z", "#5f9a5a", 0.6, 3)}
      {wash("M 380 420 Q 400 320 520 310 Q 620 280 700 360 Q 760 440 640 470 Q 480 500 380 420 Z", "#7fb46a", 0.5, 2)}
      {/* птицы и подпись */}
      {[[1180, 300], [1250, 260], [1320, 320]].map(([x, y], i) => <path key={i} d={`M ${x - 20} ${y} q 10 -14 20 0 q 10 -14 20 0`} stroke="#5a4636" strokeWidth={3} fill="none" filter="url(#pencil)" />)}
      {/* герой сидит под деревом с книгой */}
      <g filter="url(#pencil)" opacity={0.95}>
        <Hero x={700} y={790} s={0.7} sitting sw={3.2} armL={[60, -80]} armR={[60, -80]} eyes="line" mouth="smile"
          pal={{ ink: "#4a3a30", jacket: "#f0915a", pack: "#f2cf6a", beanie: "#4a5a80", limb: "#4a3a30", head: "#fbf6ea" }} />
        <path transform="translate(-30 150)" d="M 720 560 L 790 548 L 790 610 L 720 622 Z M 790 548 L 860 560 L 860 622 L 790 610 Z" fill="#f8f2e2" stroke="#4a3a30" strokeWidth={3} />
      </g>
      <text x={960} y={1010} textAnchor="middle" fontFamily="S10Serif" fontStyle="italic" fontSize={46} fill="#6a5040">…and that was the day the sky turned orange.</text>
      <rect width={W} height={H} filter="url(#paper)" />
    </Svg>
  );
};

// ===================== 3. ЛИНОГРАВЮРА =====================
export const Linocut: React.FC = () => {
  const INK = "#1b1714", RED = "#c8322a", PAPER = "#efe4cc";
  const r = rng(5);
  const wave = (cx: number, cy: number, s: number, flip = 1) => (
    <g transform={`translate(${cx} ${cy}) scale(${s * flip} ${s})`}>
      <path d="M -300 120 Q -260 -80 -60 -140 Q 120 -190 200 -60 Q 230 0 180 30 Q 140 -40 70 -30 Q 0 -20 30 60 Q 60 130 -20 140 Z" fill={INK} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-250 + i * 18} ${110 - i * 6} Q ${-200 + i * 30} ${-60 + i * 12} ${-40 + i * 20} ${-110 + i * 16}`} stroke={PAPER} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={150 - i * 26} cy={-40 + i * 4} r={12 - i} fill={PAPER} />)}
    </g>
  );
  return (
    <Svg bg={PAPER}>
      <defs>
        <filter id="voids"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" /><feColorMatrix type="matrix" values="0 0 0 0 0.94  0 0 0 0 0.89  0 0 0 0 0.8  0 0 0 -9 4.2" /></filter>
        <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="8" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="5" /></filter>
      </defs>
      <g filter="url(#rough)">
        <circle cx={1450} cy={300} r={190} fill={RED} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M 1270 ${180 + i * 30} L 1630 ${180 + i * 30}`} stroke={PAPER} strokeWidth={5} opacity={i % 2 ? 1 : 0} />)}
        {/* резаные штрихи неба */}
        {Array.from({ length: 40 }, (_, i) => { const y = 60 + r() * 420, x = r() * 1100; return <path key={i} d={`M ${x} ${y} l ${60 + r() * 120} ${-4 + r() * 8}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
        <rect x={0} y={620} width={W} height={460} fill={INK} />
        {Array.from({ length: 18 }, (_, i) => <path key={"w" + i} d={`M ${-50 + (i % 6) * 360} ${660 + Math.floor(i / 6) * 120} q 90 -40 180 0 t 180 0`} stroke={PAPER} strokeWidth={6} fill="none" />)}
        {wave(330, 610, 1.4)}
        {wave(1650, 650, 1.1, -1)}
        {/* лодка и герой */}
        <path d="M 760 760 L 1180 760 Q 1140 840 1030 850 L 900 850 Q 790 840 760 760 Z" fill={RED} stroke={INK} strokeWidth={8} />
        {Array.from({ length: 6 }, (_, i) => <path key={"b" + i} d={`M ${800 + i * 60} 778 L ${830 + i * 60} 832`} stroke={INK} strokeWidth={4} />)}
        <path d="M 860 700 L 700 880" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d="M 700 880 l -50 30 l 30 -60 Z" fill={INK} />
        <Hero x={960} y={790} s={0.62} sw={9} pal={{ ink: INK, jacket: RED, pack: PAPER, beanie: INK, pom: PAPER, limb: INK, shoe: PAPER, head: PAPER }} armL={[110, -40]} armR={[60, 40]} eyes="dot" mouth="o" />
      </g>
      <rect width={W} height={H} filter="url(#voids)" opacity={0.5} />
      <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke={INK} strokeWidth={10} />
    </Svg>
  );
};

// ===================== 4. ЧЕРТЁЖ (BLUEPRINT) =====================
export const Blueprint: React.FC = () => {
  const L = "#eaf4ff";
  const lbl = (x: number, y: number, t: string, tx: number, ty: number) => (
    <g>
      <path d={`M ${x} ${y} L ${tx} ${ty}`} stroke={L} strokeWidth={2} />
      <circle cx={x} cy={y} r={5} fill={L} />
      <text x={tx + (tx > x ? 10 : -10)} y={ty + 8} textAnchor={tx > x ? "start" : "end"} fontFamily="S10Type" fontSize={28} fill={L}>{t}</text>
    </g>
  );
  return (
    <Svg bg="#1f4f93">
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(234,244,255,0.13)" strokeWidth="1.5" /></pattern>
        <pattern id="grid5" width="240" height="240" patternUnits="userSpaceOnUse"><path d="M 240 0 L 0 0 0 240" fill="none" stroke="rgba(234,244,255,0.25)" strokeWidth="2" /></pattern>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M 0 0 L 0 14" stroke="#ff9a52" strokeWidth="4" /></pattern>
      </defs>
      <rect width={W} height={H} fill="url(#grid)" /><rect width={W} height={H} fill="url(#grid5)" />
      {/* подводная лодка в разрезе */}
      <g fill="none" stroke={L} strokeWidth={4}>
        <path d="M 260 560 Q 260 380 520 360 L 1360 360 Q 1640 380 1700 560 Q 1640 740 1360 760 L 520 760 Q 260 740 260 560 Z" />
        <path d="M 760 360 L 800 250 L 1020 250 L 1060 360" />
        <path d="M 900 250 L 900 150 L 960 150" />
        <path d="M 1700 560 L 1790 500 L 1790 620 Z" />
        {[620, 960, 1300].map((x) => <path key={x} d={`M ${x} 372 L ${x} 748`} strokeDasharray="14 10" />)}
        <path d="M 300 640 L 1660 640" strokeDasharray="8 8" />
        {[440, 520].map((x) => <circle key={x} cx={x} cy={470} r={32} />)}
        {[1120, 1200].map((x) => <rect key={x} x={x} y={430} width={50} height={120} rx={8} />)}
        <path d="M 1380 700 L 1380 520 L 1470 520" /><circle cx={1500} cy={520} r={28} />
      </g>
      <Hero x={790} y={638} s={0.42} noFill sw={6} pal={{ ink: L }} armR={[95, -30]} eyes="dot" mouth="smile" />
      <path d="M 755 445 Q 790 400 830 445 L 830 470 L 755 470 Z" fill="url(#hatch)" opacity={0.9} />
      <path d="M 770 470 L 812 470 L 818 555 L 764 555 Z" fill="url(#hatch)" />
      {lbl(790, 400, "POMPOM (WOOL)", 640, 300)}
      {lbl(770, 512, "ORANGE JACKET", 560, 840)}
      {lbl(1225, 490, "OXYGEN TANKS", 1300, 860)}
      {lbl(1500, 520, "PERISCOPE", 1660, 300)}
      {/* размерная линия */}
      <g stroke={L} strokeWidth={2.5}><path d="M 260 820 L 1700 820" /><path d="M 260 800 L 260 840 M 1700 800 L 1700 840" /><path d="M 260 820 l 24 -10 l 0 20 Z M 1700 820 l -24 -10 l 0 20 Z" fill={L} /></g>
      <text x={980} y={808} textAnchor="middle" fontFamily="S10Type" fontSize={30} fill={L}>32.0 m</text>
      {/* штамп */}
      <g transform="translate(1440 900)"><rect width={440} height={140} fill="none" stroke={L} strokeWidth={4} /><path d="M 0 50 L 440 50 M 220 50 L 220 140" stroke={L} strokeWidth={3} />
        <text x={20} y={36} fontFamily="S10Type" fontSize={30} fill={L}>WHAT IF — FIG. 07</text>
        <text x={20} y={96} fontFamily="S10Type" fontSize={22} fill={L}>SCALE 1:120</text><text x={240} y={96} fontFamily="S10Type" fontSize={22} fill={L}>SHEET 3/12</text></g>
    </Svg>
  );
};

// ===================== 5. МУЛЬТФИЛЬМ 1930-Х (RUBBER HOSE) =====================
export const RubberHose: React.FC = () => {
  const r = rng(21);
  const INK = "#151210";
  return (
    <Svg bg="#e9dfc6">
      <defs>
        <filter id="oldfilm"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="6" /><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0.22 0" /></filter>
        <radialGradient id="iris" cx="50%" cy="50%" r="70%"><stop offset="60%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(20,14,8,0.95)" /></radialGradient>
      </defs>
      {/* улица: кирпичная стена, фонарь, улыбающееся облако */}
      <rect width={W} height={760} fill="#d6c8a8" />
      {Array.from({ length: 14 }, (_, row) => Array.from({ length: 13 }, (_, c) => <rect key={`${row}-${c}`} x={(row % 2) * 80 + c * 160 - 40} y={row * 52} width={150} height={44} rx={6} fill="none" stroke="#8a7a5a" strokeWidth={3} />))}
      <rect x={0} y={740} width={W} height={340} fill="#bfae88" stroke={INK} strokeWidth={8} />
      <g transform="translate(1450 760)">
        <path d="M 0 0 Q -20 -300 10 -560" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M -70 -560 Q 10 -660 90 -560 L 60 -500 L -40 -500 Z" fill="#f2ead6" stroke={INK} strokeWidth={8} />
        <ellipse cx={10} cy={-545} rx={18} ry={22} fill={INK} /><ellipse cx={-25} cy={-545} rx={12} ry={18} fill={INK} />
        <path d="M -30 -515 Q 10 -495 45 -520" stroke={INK} strokeWidth={6} fill="none" />
      </g>
      <g transform="translate(420 220)">
        <path d="M -160 40 Q -170 -40 -90 -50 Q -60 -120 20 -100 Q 90 -150 150 -70 Q 210 -60 190 20 Q 200 70 120 60 L -120 60 Q -170 70 -160 40 Z" fill="#f6efe0" stroke={INK} strokeWidth={8} />
        <ellipse cx={-20} cy={-20} rx={14} ry={20} fill={INK} /><ellipse cx={40} cy={-20} rx={14} ry={20} fill={INK} /><path d="M -30 20 Q 10 50 50 20" stroke={INK} strokeWidth={7} fill="none" />
      </g>
      {/* герой в резиновой манере: перчатки, глаза-«пирожки», большие ботинки */}
      <Hero x={860} y={900} s={1.0} sw={9} gloves bigShoes eyes="pie" mouth="grin" armL={[150, -50]} armR={[130, 60]} legL={-14} legR={22} lean={-6}
        pal={{ ink: INK, jacket: "#7a6a58", pack: "#b8a07a", beanie: "#2a2420", pom: "#f2ead6", limb: INK, shoe: "#2a2420", head: "#f2ead6", mouth: "#3a2a20" }} />
      {/* линии движения */}
      {[[600, 520], [600, 580], [1120, 400]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} q -40 -20 -80 0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      {/* царапины плёнки */}
      {Array.from({ length: 9 }, (_, i) => { const x = r() * W; return <path key={i} d={`M ${x} 0 L ${x + r() * 20 - 10} ${H}`} stroke={i % 3 ? "rgba(255,255,255,0.35)" : "rgba(20,14,8,0.35)"} strokeWidth={1 + r() * 2} />; })}
      {Array.from({ length: 30 }, (_, i) => <circle key={"d" + i} cx={r() * W} cy={r() * H} r={1 + r() * 3} fill="rgba(20,14,8,0.4)" />)}
      <rect width={W} height={H} filter="url(#oldfilm)" />
      <rect width={W} height={H} fill="url(#iris)" />
    </Svg>
  );
};

// ===================== 6. ИЗОМЕТРИЧЕСКАЯ ДИОРАМА =====================
const iso = (x: number, y: number, z: number): [number, number] => [960 + (x - y) * 0.866, 560 + (x + y) * 0.5 - z];
const P = (pts: [number, number, number][]) => pts.map((p) => iso(...p).join(",")).join(" ");
const Box: React.FC<{ x: number; y: number; z: number; w: number; d: number; h: number; top: string; left: string; right: string; ol?: string }> = ({ x, y, z, w, d, h, top, left, right, ol = "#2a2440" }) => (
  <g stroke={ol} strokeWidth={3} strokeLinejoin="round">
    <polygon points={P([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={left} />
    <polygon points={P([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={right} />
    <polygon points={P([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={top} />
  </g>
);
export const Isometric: React.FC = () => (
  <Svg bg="#cfe9f2">
    <defs><linearGradient id="isoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bfe2f5" /><stop offset="100%" stopColor="#f6efe4" /></linearGradient></defs>
    <rect width={W} height={H} fill="url(#isoSky)" />
    {[[300, 200], [1600, 160], [1450, 820]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={120} ry={30} fill="#ffffff" opacity={0.8} />)}
    {/* парящий остров */}
    <Box x={-320} y={-320} z={-260} w={640} d={640} h={200} top="#7cc46a" left="#b98a5a" right="#9a6e44" />
    <polygon points={P([[-320, 320, -260], [320, 320, -260], [0, 0, -520]])} fill="#8a6440" stroke="#2a2440" strokeWidth={3} />
    <polygon points={P([[320, -320, -260], [320, 320, -260], [0, 0, -520]])} fill="#6e4e30" stroke="#2a2440" strokeWidth={3} />
    {/* дорожка, домик, дерево, почтовый ящик, забор */}
    <Box x={-60} y={-300} z={-60} w={120} d={600} h={2} top="#e8dcc0" left="#cbb995" right="#bba985" />
    <Box x={-280} y={-280} z={-60} w={200} d={240} h={170} top="#f4efe4" left="#f2b84a" right="#d99a30" />
    <polygon points={P([[-290, -290, 110], [-70, -290, 110], [-180, -290, 200]])} fill="#d8443a" stroke="#2a2440" strokeWidth={3} />
    <polygon points={P([[-70, -290, 110], [-70, -30, 110], [-180, -30, 200], [-180, -290, 200]])} fill="#b8322a" stroke="#2a2440" strokeWidth={3} />
    <Box x={-120} y={-160} z={-60} w={4} d={60} h={100} top="#5a3a2a" left="#5a3a2a" right="#4a2a1a" />
    <Box x={-122} y={-250} z={20} w={4} d={50} h={50} top="#bfe6ff" left="#bfe6ff" right="#9fcbe8" />
    <Box x={160} y={-220} z={-60} w={40} d={40} h={150} top="#7a5236" left="#7a5236" right="#5e3e28" />
    <circle cx={iso(180, -200, 150)[0]} cy={iso(180, -200, 150)[1]} r={110} fill="#5ca64a" stroke="#2a2440" strokeWidth={3} />
    <circle cx={iso(180, -200, 150)[0] - 30} cy={iso(180, -200, 150)[1] - 40} r={40} fill="#7cc46a" />
    <Box x={120} y={170} z={-60} w={14} d={14} h={70} top="#4a4a5a" left="#4a4a5a" right="#3a3a4a" />
    <Box x={105} y={160} z={10} w={44} d={34} h={34} top="#3a7ad8" left="#3a6ac8" right="#2a5aa8" />
    {Array.from({ length: 6 }, (_, i) => <Box key={i} x={-310} y={-20 + i * 60} z={-60} w={10} d={10} h={50} top="#f4efe4" left="#e4dcc8" right="#cfc6b0" />)}
    {/* герой — маленькая фигурка */}
    <g transform={`translate(${iso(0, 120, -60)[0]} ${iso(0, 120, -60)[1]})`}>
      <ellipse cx={0} cy={0} rx={40} ry={16} fill="rgba(42,36,64,0.25)" />
      <Hero x={0} y={0} s={0.3} sw={8} armR={[140, 30]} eyes="dot" mouth="smile" />
    </g>
  </Svg>
);

// ===================== 7. НЕОН-ЛАЙН =====================
export const NeonLine: React.FC = () => {
  const neon = (c: string, w = 5) => ({ stroke: c, strokeWidth: w, fill: "none", filter: "url(#neonGlow)", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
  return (
    <Svg bg="#07061a">
      <defs>
        <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b" /><feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b2" /><feMerge><feMergeNode in="b2" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffd23c" /><stop offset="100%" stopColor="#ff3c8a" /></linearGradient>
      </defs>
      <circle cx={960} cy={500} r={240} fill="url(#sunG)" opacity={0.9} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={700} y={520 + i * 32} width={520} height={6 + i * 3} fill="#07061a" />)}
      <path d="M 0 640 L 260 470 L 420 560 L 640 400 L 860 640 M 1060 640 L 1280 420 L 1460 540 L 1640 450 L 1920 640" {...neon("#b44dff", 4)} />
      <rect x={0} y={640} width={W} height={440} fill="#0c0828" />
      {Array.from({ length: 25 }, (_, i) => <path key={"v" + i} d={`M 960 640 L ${-2400 + i * 200} 1080`} {...neon("#ff3c8a", 2.5)} />)}
      {Array.from({ length: 8 }, (_, i) => { const y = 640 + Math.pow(i / 8, 1.8) * 440; return <path key={"h" + i} d={`M 0 ${y} L ${W} ${y}`} {...neon("#ff3c8a", 2.5)} />; })}
      {/* герой на скейте — одни светящиеся контуры */}
      <g filter="url(#neonGlow)">
        <Hero x={960} y={860} s={0.62} noFill sw={7} pal={{ ink: "#ff9a3c" }} armL={[110, -20]} armR={[100, 30]} legL={-10} legR={14} lean={-8} eyes="glow" mouth="smile" />
      </g>
      <path d="M 850 870 L 1080 870" {...neon("#3cf4ff", 8)} />
      {[880, 1050].map((x) => <circle key={x} cx={x} cy={890} r={14} {...neon("#3cf4ff", 5)} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M ${760 - i * 60} ${700 + i * 50} L ${600 - i * 60} ${700 + i * 50}`} {...neon("#3cf4ff", 4)} />)}
      <text x={960} y={150} textAnchor="middle" fontFamily="S10Mont" fontWeight={900} fontSize={90} {...neon("#3cf4ff", 3)}>WHAT IF?</text>
    </Svg>
  );
};

// ===================== 8. ТЕАТР ТЕНЕЙ =====================
export const Silhouette: React.FC = () => {
  const K = "#0d0a10";
  const curl = (x: number, y: number, s: number, rot: number) => <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M 0 0 Q 30 -40 0 -70 Q -30 -90 -40 -60 Q -45 -40 -25 -40 Q -10 -42 -14 -56" stroke={K} strokeWidth={6} fill="none" strokeLinecap="round" />;
  return (
    <Svg>
      <defs><linearGradient id="dusk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a6f7a" /><stop offset="55%" stopColor="#f2a35a" /><stop offset="100%" stopColor="#ffd8a0" /></linearGradient>
        <radialGradient id="moonG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff6dc" /><stop offset="70%" stopColor="#ffe9b8" /><stop offset="100%" stopColor="rgba(255,233,184,0)" /></radialGradient></defs>
      <rect width={W} height={H} fill="url(#dusk2)" />
      <circle cx={1180} cy={470} r={330} fill="url(#moonG)" />
      {/* ажурное дерево */}
      <g fill={K}>
        <path d="M 260 1080 Q 300 760 250 520 Q 220 400 300 300 L 320 320 Q 260 420 300 540 Q 340 700 330 1080 Z" />
        <path d="M 290 520 Q 420 450 520 470 L 515 485 Q 420 470 300 545 Z" /><path d="M 280 420 Q 170 340 120 360 L 125 345 Q 200 320 290 400 Z" />
      </g>
      {Array.from({ length: 30 }, (_, i) => curl(120 + (i % 10) * 45, 280 + Math.floor(i / 10) * 70 + (i % 3) * 10, 0.7 + (i % 3) * 0.15, (i * 47) % 360))}
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={100 + ((i * 53) % 440)} cy={240 + ((i * 37) % 260)} r={8 + (i % 4) * 4} fill={K} />)}
      {/* скала с резным краем */}
      <path d="M 640 1080 L 700 820 Q 820 760 1000 780 Q 1200 760 1320 820 Q 1500 900 1560 1080 Z" fill={K} />
      {Array.from({ length: 12 }, (_, i) => <circle key={"h" + i} cx={760 + i * 60} cy={880 + (i % 2) * 20} r={10} fill="#ffd8a0" opacity={0.9} />)}
      {Array.from({ length: 8 }, (_, i) => <path key={"g" + i} d={`M ${720 + i * 100} 800 q 10 -40 20 0 q 10 -50 22 0`} fill={K} />)}
      {/* птицы */}
      {[[1380, 300, 1], [1460, 250, 0.8], [1530, 330, 0.7], [1600, 280, 0.6]].map(([x, y, s], i) => <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M -50 0 Q -25 -30 0 0 Q 25 -30 50 0 Q 25 -12 0 8 Q -25 -12 -50 0 Z" fill={K} />)}
      {/* герой силуэтом: узнаётся по помпону, шапке и рюкзаку */}
      <Hero x={1010} y={790} s={0.95} sw={0} eyes="none" mouth="none" armR={[150, 20]} armL={[20, 10]}
        pal={{ head: K, beanie: K, pom: K, jacket: K, pack: K, limb: K, shoe: K, ink: K }} />
    </Svg>
  );
};
