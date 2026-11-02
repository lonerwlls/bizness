// «Last man on Earth» — часть 2: «The Light» (дни 7–30). 60 сек.
// Как в примере пользователя: счётчик дней сверху, плашки над сценами, карточка главы, крупные субтитры (EN).
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MASCOT, Person, Pose, STAND, Shadow, V, lerp } from "../characters/Rig";
import { Cam, Car, Dog, Full, Grain, INK, MONT, N0, RED, Sky, Stars, WH, YEL, ip, rnd, sitPose, toLocal, walkRig } from "../characters/kit";

export const LASTMAN2_FRAMES = 1800;
const SC = 180; // длина сцены (6 сек)
const Me: React.FC<Omit<React.ComponentProps<typeof Person>, "look">> = (p) => <Person {...p} look={MASCOT} />;
const GREEN = "#3ad08a";

// ---------- озвучка = субтитры (текст отдаём пользователю) ----------
export const VO: [number, string][] = [
  [0, "On the seventh night, a *light* turned on across the dead city — so I ran."],
  [6, "*Three kilometers* of dark streets, with no sound except my steps and my dog's breathing."],
  [12, "But behind the door, *no one* — just a lamp on a timer, running on solar power."],
  [18, "And that gave me an idea: *solar panels* don't need power plants, and they work for decades."],
  [24, "So for *a whole week*, I dragged panels and batteries from empty stores up to my roof."],
  [30, "On day fourteen, my window became *the only light* in a city of millions."],
  [36, "Canned food lasts a few years, not forever — so I planted my first *seeds* on the roof."],
  [42, "Without people, nature moved in fast — *deer* walked down the highway like they owned it."],
  [48, "Every night I sat by an old radio and asked the static: *is anyone out there?*"],
  [54, "And on the thirtieth night… the static *answered.*"],
];
type Chunk = { a: number; b: number; words: { w: string; hi: boolean }[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  VO.forEach(([start], i) => {
    const end = i + 1 < VO.length ? VO[i + 1][0] : 60;
    let hi = false;
    const words = VO[i][1].split(" ").map((raw) => {
      const open = raw.startsWith("*"), close = raw.replace(/[.,?!…—]+$/, "").endsWith("*");
      if (open) hi = true;
      const w = { w: raw.replace(/\*/g, ""), hi };
      if (close) hi = false;
      return w;
    });
    const groups: { w: string; hi: boolean }[][] = [];
    let cur: { w: string; hi: boolean }[] = [];
    words.forEach((w, k) => {
      cur.push(w);
      const brk = /[,.?!—…]$/.test(w.w) || w.w === "—";
      if (cur.length >= 3 || (brk && cur.length >= 2) || k === words.length - 1) { groups.push(cur); cur = []; }
    });
    const a0 = start + 0.15, b0 = end - 0.25, total = words.length;
    let t = a0;
    groups.forEach((g) => {
      const d = ((b0 - a0) * g.length) / total;
      out.push({ a: t, b: t + d, words: g });
      t += d;
    });
  });
  return out;
})();
const Subs: React.FC<{ f: number }> = ({ f }) => {
  const s = f / 30;
  const c = CHUNKS.find((c) => s >= c.a && s < c.b);
  if (!c) return null;
  const local = f - c.a * 30;
  const pop = ip(local, [0, 5], [0.85, 1], Easing.out(Easing.back(3)));
  const glitch = local < 3 ? 6 : 0;
  return (
    <div style={{ position: "absolute", top: 1430, left: 50, right: 50, textAlign: "center", transform: `scale(${pop})` }}>
      <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.12, color: WH, WebkitTextStroke: "12px rgba(10,12,22,0.9)", paintOrder: "stroke fill", textShadow: `${glitch}px 0 0 rgba(255,40,80,.8), ${-glitch}px 0 0 rgba(40,220,255,.8), 0 6px 0 rgba(0,0,0,.35)` }}>
        {c.words.map((w, i) => <span key={i} style={{ color: w.hi ? YEL : WH }}>{w.w.toUpperCase()}{i < c.words.length - 1 ? " " : ""}</span>)}
      </span>
    </div>
  );
};

// ---------- счётчик дней и плашки ----------
const CLOCK: [number, number, number][] = [[7, 23, 41], [7, 23, 52], [8, 0, 21], [8, 0, 30], [12, 14, 5], [14, 21, 10], [18, 9, 30], [22, 7, 15], [29, 23, 2], [30, 23, 59]];
const TAGS: [string, string][] = [["SIGNAL SPOTTED", RED], ["DISTANCE 3.2 KM", RED], ["NO ONE HERE", RED], ["IDEA: SOLAR", GREEN], ["PANELS: 12", GREEN], ["POWER: ON", GREEN], ["FOOD WON'T LAST", RED], ["NATURE RETURNS", GREEN], ["CB CHANNEL 9", YEL], ["INCOMING SIGNAL", RED]];
const Hud: React.FC<{ f: number }> = ({ f }) => {
  const i = Math.min(9, Math.floor(f / SC)), local = f % SC;
  const [d, h, m] = CLOCK[i];
  const sec = Math.floor(local / 30) + (i === 9 ? 55 : 0);
  const t = i === 9 && local > 150 ? "00:00:00" : `${String(h).padStart(2, "0")}:${String(m + Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  const day = i === 9 && local > 150 ? 31 : d;
  const blink = Math.floor(f / 15) % 2 === 0;
  const [tag, col] = TAGS[i];
  const tagIn = ip(local, [4, 10], [0, 1]);
  const gl = local < 4 ? 5 : 0;
  return (
    <>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 34, letterSpacing: 4, color: "#ffe9b0", background: "rgba(10,10,20,0.75)", border: `3px solid ${YEL}`, borderRadius: 8, padding: "6px 20px", textShadow: `${gl}px 0 0 rgba(255,40,80,.8), ${-gl}px 0 0 rgba(40,220,255,.8)` }}>
          <span style={{ color: RED, opacity: blink ? 1 : 0.2 }}>● </span>DAY {String(day).padStart(2, "0")} · {t}
        </span>
      </div>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, textAlign: "center", opacity: tagIn, transform: `translateY(${(1 - tagIn) * -10}px)` }}>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 26, letterSpacing: 3, color: WH, background: col === YEL ? "rgba(120,90,10,0.85)" : col === GREEN ? "rgba(20,110,70,0.85)" : "rgba(150,25,35,0.85)", border: `2px solid ${col}`, borderRadius: 6, padding: "5px 14px" }}>{tag}</span>
      </div>
    </>
  );
};
// карточка главы
const Chapter: React.FC<{ f: number; at: number; n: string; title: string }> = ({ f, at, n, title }) => {
  const l = f - at;
  if (l < 0 || l > 34) return null;
  const o = ip(l, [0, 5, 28, 34], [0, 1, 1, 0]);
  const w = ip(l, [0, 12], [0, 1], Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: `rgba(6,8,16,${0.85 * o})`, justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ textAlign: "center", color: WH }}>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: YEL }}>EPISODE 2 · CHAPTER {n}</div>
        <div style={{ height: 4, width: 520 * w, background: YEL, margin: "22px auto" }} />
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 90, letterSpacing: 4 }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- общие детали ----------
const Skyline: React.FC<{ f: number; lit?: number; base?: number; target?: V; par?: number }> = ({ f, lit = 0, base = 1500, target, par = 0 }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => {
      const x = i * 95 - 60 + par, h = 380 + rnd(i + 31) * 520, y = base - h;
      return (
        <g key={i}>
          <rect x={x} y={y} width={100} height={h + 600} fill={i % 2 ? "#141b30" : "#18213a"} />
          {Array.from({ length: Math.floor(h / 60) * 3 }, (_, k) => <rect key={k} x={x + 12 + (k % 3) * 30} y={y + 16 + Math.floor(k / 3) * 60} width={16} height={28} rx={2} fill={YEL} opacity={rnd(i * 70 + k) < lit ? 0.85 : 0} />)}
        </g>
      );
    })}
    {target ? (
      <g>
        <circle cx={target[0]} cy={target[1]} r={70 + Math.sin(f / 6) * 10} fill={YEL} opacity={0.15} />
        <rect x={target[0] - 10} y={target[1] - 15} width={20} height={30} rx={2} fill={YEL} />
      </g>
    ) : null}
  </g>
);
const PhoneFrame: React.FC<{ g: number; children: React.ReactNode }> = ({ g, children }) => (
  <>
    <g transform={`translate(540 960) rotate(${-3 + Math.sin(g / 18) * 1.5})`}>
      <rect x={-250} y={-470} width={500} height={940} rx={56} fill="#1b2033" />
      <defs><clipPath id="ph2"><rect x={-226} y={-446} width={452} height={892} rx={40} /></clipPath></defs>
      <g clipPath="url(#ph2)">{children}</g>
    </g>
    <ellipse cx={730} cy={1360} rx={86} ry={64} fill={MASCOT.skin} />
    <rect x={690} y={1380} width={190} height={600} rx={60} fill={MASCOT.top} />
  </>
);

// =============== 1. Ночь 7: бег к свету ===============
const S1: React.FC<{ g: number }> = ({ g }) => {
  const GY = 1560, s = 1.6;
  const xw = 300 + g * 8.5;
  const w = walkRig(xw, () => GY, s, 230, 124, 40);
  const pose: Pose = { ...w.pose, lean: 14, aL: [w.pose.aL[0] * 1.6, w.pose.aL[0] * 1.6 + 70], aR: [w.pose.aR[0] * 1.6, w.pose.aR[0] * 1.6 + 70] };
  const camX = xw - 420;
  const hand: V = [60, -90];
  const hw: V = [xw + hand[0] * s, w.hip[1] + hand[1] * s];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="r1" stops={[[0, "#070b1a"], [1, "#16203a"]]} />
        <Stars f={g} n={90} h={900} />
        <circle cx={860} cy={360} r={50} fill="#f2ead2" />
        <g transform={`translate(${-camX * 0.15} 0)`}><Skyline f={g} target={[930 + camX * 0.15 - 40, 760]} base={1420} /></g>
        <rect x={0} y={1420} width={1080} height={500} fill="#141b2e" />
        <g transform={`translate(${-camX} 0)`}>
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 260} y={1600} width={130} height={8} rx={4} fill="#2a3450" />)}
          {Array.from({ length: 12 }, (_, i) => <g key={"l" + i}><rect x={i * 700 + 100} y={1100} width={12} height={460} fill="#0e1424" /><circle cx={i * 700 + 106} cy={1100} r={12} fill="#2a3450" /></g>)}
          <path d={`M ${hw[0]} ${hw[1]} L ${hw[0] + 700} ${hw[1] - 160} L ${hw[0] + 700} ${hw[1] + 240} Z`} fill={YEL} opacity={0.14} />
          <Dog x={xw - 220} y={GY} s={1} f={g} run wag={0.4} tongue />
          <Me x={xw} y={w.hip[1]} s={s} turn={0.9} pose={pose} feet={w.feet} hands={{ r: hand }} t={g} face={{ eyes: "wide", brows: 1, mouth: "o" }}>
            <rect x={hand[0] - 6} y={hand[1] - 10} width={34} height={16} rx={5} fill="#3a3a4a" />
          </Me>
        </g>
      </Full>
    </AbsoluteFill>
  );
};

// =============== 2. Телефон: карта до света ===============
const S2: React.FC<{ g: number }> = ({ g }) => {
  const km = Math.max(0.4, 3.2 - g * 0.0165);
  const t = ip(g, [0, 170], [0, 1]);
  const route: V[] = [[-150, 330], [-150, 120], [40, 120], [40, -120], [150, -120], [150, -300]];
  const segLen = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0);
  let left = total * t, me: V = route[0];
  for (let i = 0; i < segLen.length; i++) {
    if (left <= segLen[i]) { const k = left / segLen[i]; me = [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k)]; break; }
    left -= segLen[i]; me = route[i + 1];
  }
  return (
    <AbsoluteFill style={{ background: "#0e1424" }}>
      <Full>
        <PhoneFrame g={g}>
          <rect x={-226} y={-446} width={452} height={892} fill="#141c30" />
          {Array.from({ length: 9 }, (_, i) => <rect key={"v" + i} x={-220 + i * 55} y={-446} width={14} height={892} fill="#1f2a44" />)}
          {Array.from({ length: 16 }, (_, i) => <rect key={"h" + i} x={-226} y={-440 + i * 60} width={452} height={12} fill="#1f2a44" />)}
          <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke="#5aa0ff" strokeWidth={8} strokeDasharray="16 12" />
          <circle cx={150} cy={-300} r={30 + (g % 30)} fill="none" stroke={YEL} strokeWidth={4} opacity={1 - (g % 30) / 30} />
          <circle cx={150} cy={-300} r={18} fill={YEL} />
          <circle cx={me[0]} cy={me[1]} r={20} fill="#5aa0ff" stroke={WH} strokeWidth={5} />
          <rect x={-200} y={-430} width={400} height={110} rx={18} fill="rgba(10,14,28,0.9)" />
          <text x={-176} y={-382} fontFamily={MONT} fontWeight={900} fontSize={28} fill="#9cb0d0">LIGHT SOURCE</text>
          <text x={-176} y={-338} fontFamily={MONT} fontWeight={900} fontSize={42} fill={WH}>{km.toFixed(1)} km</text>
          <text x={150} y={-340} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill={YEL}>?</text>
          <text x={me[0]} y={me[1] + 52} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill={WH}>YOU</text>
        </PhoneFrame>
      </Full>
    </AbsoluteFill>
  );
};

// =============== 3. Никого: лампа на таймере ===============
const S3: React.FC<{ g: number }> = ({ g }) => {
  const door = ip(g, [10, 30], [0, 1], Easing.out(Easing.cubic));
  const enter = ip(g, [30, 80], [180, 360]);
  const GY = 1600, s = 1.8;
  const w = walkRig(enter, () => GY, s, 170);
  const walking = g >= 30 && g < 80;
  const idea = g >= 130;
  const hip: V = walking ? w.hip : [enter, GY - 140 * s];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <rect width={1080} height={1920} fill="#1d2440" />
        <rect x={0} y={1600} width={1080} height={320} fill="#151a30" />
        <circle cx={760} cy={1250} r={340} fill={YEL} opacity={0.1} />
        <rect x={600} y={760} width={320} height={300} rx={8} fill="#0e1424" />
        <Stars f={g} n={12} h={1050} />
        <rect x={756} y={760} width={8} height={300} fill="#1d2440" />
        <path d="M 760 760 L 760 600 L 1080 600" stroke="#2a3450" strokeWidth={6} fill="none" />
        {/* столик, лампа, таймер в розетке */}
        <rect x={660} y={1380} width={240} height={20} rx={6} fill="#6a4a36" />
        <rect x={690} y={1400} width={14} height={200} fill="#4a3a30" /><rect x={856} y={1400} width={14} height={200} fill="#4a3a30" />
        <rect x={770} y={1240} width={12} height={140} fill="#2a2a3a" />
        <path d="M 720 1250 L 830 1250 L 805 1180 L 745 1180 Z" fill={YEL} />
        <path d="M 776 1380 Q 780 1500 960 1520" stroke="#2a2a3a" strokeWidth={5} fill="none" />
        <rect x={950} y={1480} width={60} height={70} rx={10} fill="#dfe6f2" />
        <circle cx={980} cy={1515} r={20} fill="none" stroke={INK} strokeWidth={4} />
        <line x1={980} y1={1515} x2={980 + Math.sin(g / 10) * 14} y2={1515 - Math.cos(g / 10) * 14} stroke={RED} strokeWidth={4} />
        {/* дверь */}
        <rect x={60} y={1100} width={260} height={500} fill="#0a0e1a" />
        <rect x={60} y={1100} width={260 * (1 - door * 0.85)} height={500} fill="#5a3a2a" />
        <Shadow x={hip[0]} y={GY} w={70} />
        <Dog x={hip[0] + 240 + Math.sin(g / 8) * 10} y={GY} s={0.95} f={g} wag={0.3} sit={g > 100} />
        <Me x={hip[0]} y={hip[1]} s={s} turn={idea ? 0.3 : 0.8} pose={walking ? w.pose : STAND} feet={walking ? w.feet : undefined} hands={idea ? { r: [40, -230] } : { r: [60, -90] }} t={g} face={g < 100 ? { eyes: "wide", brows: 1, mouth: "o" } : idea ? { eyes: "happy", brows: 0.8, mouth: "grin" } : { brows: 1, mouth: "fear" }}>
          {!idea ? <rect x={54} y={-100} width={34} height={16} rx={5} fill="#3a3a4a" /> : null}
        </Me>
        {idea ? <g transform={`translate(${hip[0] + 40} ${hip[1] - 470}) scale(${ip(g, [130, 138], [0.3, 1])})`}><circle r={44} fill={YEL} /><rect x={-16} y={36} width={32} height={26} rx={6} fill="#aab6cc" />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={Math.cos(-Math.PI / 2 + (i - 2) * 0.6) * 60} y1={Math.sin(-Math.PI / 2 + (i - 2) * 0.6) * 60} x2={Math.cos(-Math.PI / 2 + (i - 2) * 0.6) * 84} y2={Math.sin(-Math.PI / 2 + (i - 2) * 0.6) * 84} stroke={YEL} strokeWidth={8} strokeLinecap="round" />)}</g> : null}
      </Full>
    </AbsoluteFill>
  );
};

// =============== 4. Инфографика: солнце → панель → батарея → свет ===============
const S4: React.FC<{ g: number }> = ({ g }) => {
  const step = (i: number) => ip(g, [10 + i * 28, 22 + i * 28], [0, 1], Easing.out(Easing.back(2)));
  const arrow = (i: number) => ip(g, [22 + i * 28, 36 + i * 28], [0, 1]);
  const items: [number, React.ReactNode, string][] = [
    [430, <g key="s">{Array.from({ length: 10 }, (_, k) => <line key={k} x1={Math.cos(k * 0.63 + g / 30) * 70} y1={Math.sin(k * 0.63 + g / 30) * 70} x2={Math.cos(k * 0.63 + g / 30) * 100} y2={Math.sin(k * 0.63 + g / 30) * 100} stroke={YEL} strokeWidth={10} strokeLinecap="round" />)}<circle r={56} fill={YEL} /></g>, "SUN"],
    [660, <g key="p" transform="skewX(-12)"><rect x={-110} y={-70} width={220} height={140} rx={8} fill="#2a4a8a" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-102 + c * 52} y={-62 + r * 44} width={46} height={38} fill="#3d6ac0" />))}</g>, "SOLAR PANEL"],
    [890, <g key="b"><rect x={-60} y={-90} width={120} height={180} rx={14} fill="#2a3450" /><rect x={-24} y={-108} width={48} height={20} rx={4} fill="#2a3450" /><rect x={-46} y={76 - 150 * ip(g, [90, 150], [0.1, 1])} width={92} height={150 * ip(g, [90, 150], [0.1, 1])} rx={8} fill={GREEN} /></g>, "BATTERY"],
    [1120, <g key="l"><circle r={60} fill={g > 110 ? YEL : "#3a4058"} /><rect x={-26} y={50} width={52} height={40} rx={8} fill="#aab6cc" />{g > 110 ? <circle r={110} fill={YEL} opacity={0.15} /> : null}</g>, "LIGHT"],
  ];
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Full>
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={0} y1={i * 70} x2={1080} y2={i * 70} stroke="#121a30" strokeWidth={2} />)}
        {items.map(([y, icon, label], i) => (
          <g key={i}>
            <g transform={`translate(540 ${y}) scale(${step(i)})`}>{icon}</g>
            <text x={540} y={y + 130} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} letterSpacing={4} fill="#9cb0d0" opacity={step(i)}>{label}</text>
            {i < 3 ? <line x1={540} y1={y + 150} x2={540} y2={y + 150 + 70 * arrow(i)} stroke={YEL} strokeWidth={8} strokeDasharray="14 10" /> : null}
          </g>
        ))}
        <g opacity={ip(g, [140, 150], [0, 1])}>
          <rect x={240} y={1420} width={600} height={0} />
        </g>
      </Full>
      <div style={{ position: "absolute", top: 1350, left: 0, right: 0, textAlign: "center", opacity: ip(g, [130, 140], [0, 1]) }}>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 40, color: GREEN, border: `3px solid ${GREEN}`, borderRadius: 12, padding: "10px 24px", background: "rgba(10,40,30,0.8)" }}>✓ WORKS 25+ YEARS</span>
      </div>
    </AbsoluteFill>
  );
};

// =============== 5. День 12: панели на крышу ===============
const Panel: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-6} y={0} width={12} height={60} fill="#5a6a8a" />
    <g transform="skewX(-14)"><rect x={-90} y={-60} width={180} height={64} rx={4} fill="#2a4a8a" />{[0, 1].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-84 + c * 43} y={-54 + r * 28} width={38} height={24} fill="#3d6ac0" />))}</g>
  </g>
);
const S5: React.FC<{ g: number }> = ({ g }) => {
  const GY = 1500, s = 1.7;
  const xw = 120 + g * 2.6;
  const w = walkRig(xw, () => GY, s, 160);
  const placed = Math.min(5, 2 + Math.floor(g / 50));
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="d12" stops={[[0, "#5a8ac0"], [1, "#c8dcf0"]]} h={1500} />
        <circle cx={860} cy={300} r={80} fill="#fff1c0" />
        <Skyline f={g} base={1300} />
        <rect x={0} y={1300} width={1080} height={620} fill="#3a465e" />
        <rect x={0} y={1290} width={1080} height={20} fill="#56658a" />
        {Array.from({ length: placed }, (_, i) => <Panel key={i} x={180 + i * 190} y={1240} />)}
        <Shadow x={xw} y={GY} w={70} />
        <Dog x={xw - 200} y={GY} s={0.95} f={g} run wag={0.6} tongue />
        <Me x={xw} y={w.hip[1]} s={s} turn={0.85} pose={{ ...w.pose, lean: 10 }} feet={w.feet} hands={{ l: [30, -200], r: [70, -200] }} t={g} face={{ eyes: "happy", brows: -0.3, mouth: "flat" }}>
          <g transform="translate(50 -235)"><g transform="skewX(-10)"><rect x={-110} y={-30} width={220} height={60} rx={4} fill="#2a4a8a" />{[0, 1, 2, 3].map((c) => <rect key={c} x={-104 + c * 52} y={-24} width={46} height={48} fill="#3d6ac0" />)}</g></g>
        </Me>
      </Full>
    </AbsoluteFill>
  );
};

// =============== 6. День 14: свет включился ===============
const S6: React.FC<{ g: number }> = ({ g }) => {
  const on = g >= 40;
  const out = ip(g, [110, 160], [0, 1], Easing.inOut(Easing.cubic));
  const s = 1.8, hip: V = [420, 1600 - 140 * 1.8];
  const jump = on && g < 110 ? Math.abs(Math.sin((g - 40) / 5)) * 50 : 0;
  const bark = on && g < 110 ? Math.max(0, Math.sin(g / 3)) : 0;
  if (out > 0) {
    return (
      <AbsoluteFill style={{ background: N0 }}>
        <Cam k={lerp(2.6, 1, out)} ox={600} oy={900}>
          <Full>
            <Sky id="w14" stops={[[0, "#070b1a"], [1, "#141f3a"]]} />
            <Stars f={g} n={110} h={1000} />
            <Skyline f={g} base={1700} />
            <rect x={560} y={820} width={100} height={900} fill="#1a2240" />
            <rect x={590} y={880} width={40} height={56} rx={3} fill={YEL} />
            <circle cx={610} cy={908} r={70} fill={YEL} opacity={0.2} />
          </Full>
        </Cam>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <rect width={1080} height={1920} fill={on ? "#4a4a6e" : "#141a30"} />
        <rect x={0} y={1600} width={1080} height={320} fill={on ? "#3a3a5a" : "#0e1222"} />
        {on ? <circle cx={540} cy={500} r={600} fill={YEL} opacity={0.12} /> : null}
        <line x1={540} y1={0} x2={540} y2={420} stroke="#2a2a3a" strokeWidth={5} />
        <circle cx={540} cy={450} r={40} fill={on ? YEL : "#3a4058"} />
        <rect x={130} y={1000} width={70} height={110} rx={10} fill="#dfe6f2" />
        <rect x={150} y={1030} width={30} height={30} rx={6} fill={on ? GREEN : "#8a96b0"} />
        {/* холодильник */}
        <rect x={760} y={1000} width={240} height={600} rx={16} fill="#dfe6f2" />
        <rect x={760} y={1200} width={240} height={8} fill="#aab6cc" />
        <rect x={970} y={1080} width={10} height={80} rx={5} fill="#8a96b0" />
        {on ? <circle cx={880} cy={1000} r={8} fill={GREEN} /> : null}
        <Shadow x={hip[0]} y={1600} w={75} />
        <Dog x={640} y={1600} s={1} f={g} bark={bark} wag={on ? 1 : 0.2} sit={!on} tongue={on} />
        <Me x={hip[0]} y={hip[1] - jump} s={s} turn={0.6} pose={STAND} hands={on ? { l: [-60, -260], r: [60, -260] } : { r: toLocal([200, 1050], hip, s) }} t={g} face={on ? { eyes: "happy", mouth: "grin" } : { brows: 0.6, mouth: "flat" }} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 7. День 18: еда кончается → семена ===============
const S7: React.FC<{ g: number }> = ({ g }) => {
  if (g < 95) {
    const rows: [string, number, string][] = [["BREAD", 0.06, RED], ["MILK", 0.04, RED], ["EGGS", 0.14, "#e0a050"], ["CANNED FOOD", 0.95, GREEN]];
    const lbl = ["1 week", "days", "3 weeks", "2–5 years"];
    return (
      <AbsoluteFill style={{ background: "#0b1020" }}>
        <Full>
          <text x={540} y={430} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} letterSpacing={6} fill="#9cb0d0">HOW LONG FOOD LASTS</text>
          {rows.map(([n, v, c], i) => {
            const k = ip(g, [10 + i * 12, 40 + i * 12], [0, 1], Easing.out(Easing.cubic));
            const y = 600 + i * 230;
            return (
              <g key={i}>
                <text x={110} y={y} fontFamily={MONT} fontWeight={900} fontSize={40} fill={WH}>{n}</text>
                <rect x={110} y={y + 30} width={860} height={60} rx={30} fill="#1a2238" />
                <rect x={110} y={y + 30} width={Math.max(60, 860 * v * k)} height={60} rx={30} fill={c} />
                <text x={970} y={y} textAnchor="end" fontFamily={MONT} fontWeight={900} fontSize={34} fill={c} opacity={k}>{lbl[i]}</text>
              </g>
            );
          })}
        </Full>
      </AbsoluteFill>
    );
  }
  const h = g - 95, GY = 1560, s = 1.8;
  const hip: V = [360, GY - 96 * s];
  const water = h > 20 && h < 70;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="d18" stops={[[0, "#6a9ad0"], [1, "#e0ecf8"]]} h={1500} />
        <Skyline f={h} base={1350} />
        <rect x={0} y={1350} width={1080} height={570} fill="#3a465e" />
        {[0, 1, 2, 3].map((i) => {
          const x = 520 + i * 130, grow = ip(h, [30 + i * 8, 80 + i * 8], [0, 1]);
          return (
            <g key={i}>
              <path d={`M ${x - 50} 1480 L ${x + 50} 1480 L ${x + 40} 1560 L ${x - 40} 1560 Z`} fill="#b06a4a" />
              <rect x={x - 54} y={1470} width={108} height={16} rx={6} fill="#c07a5a" />
              <line x1={x} y1={1472} x2={x} y2={1472 - 70 * grow} stroke="#4fa36a" strokeWidth={8} strokeLinecap="round" />
              <ellipse cx={x - 18} cy={1472 - 60 * grow} rx={20 * grow} ry={10 * grow} fill="#5ab070" />
              <ellipse cx={x + 18} cy={1472 - 70 * grow} rx={20 * grow} ry={10 * grow} fill="#5ab070" />
            </g>
          );
        })}
        {water ? Array.from({ length: 8 }, (_, i) => <circle key={i} cx={560 + (i * 37 + h * 5) % 120} cy={1400 + ((h * 9 + i * 23) % 80)} r={5} fill="#9cd0f0" />) : null}
        <Shadow x={hip[0]} y={GY} w={70} />
        <Me x={hip[0]} y={hip[1]} s={s} turn={0.8} pose={{ lean: 22, aL: [0, 0], aR: [0, 0], lL: [70, -10], lR: [100, -20] }} hands={{ l: [40, -40], r: water ? [100, -110] : [70, -30] }} t={h} face={{ eyes: "happy", mouth: "smile" }}>
          {water ? <g transform="translate(100 -110)"><rect x={-20} y={-40} width={70} height={60} rx={10} fill="#5f8fb5" /><line x1={50} y1={-30} x2={100} y2={-10} stroke="#5f8fb5" strokeWidth={10} strokeLinecap="round" /></g> : null}
        </Me>
        <Dog x={180} y={GY} s={0.9} f={h} sit wag={0.5} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 8. День 22: олень на шоссе ===============
const Deer: React.FC<{ x: number; y: number; f: number; s?: number; walk?: boolean }> = ({ x, y, f, s = 1, walk }) => {
  const C = "#b07a4a", C2 = "#8a5a32";
  const lg = walk ? Math.sin(f / 4) * 18 : 0;
  const leg = (x0: number, a: number, c: string) => <line x1={x0} y1={-90} x2={x0 + Math.sin(a * Math.PI / 180) * 90} y2={-90 + Math.cos(a * Math.PI / 180) * 90} stroke={c} strokeWidth={12} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {leg(-50, lg, C2)}{leg(-36, -lg, C)}{leg(40, -lg, C2)}{leg(54, lg, C)}
      <ellipse cx={0} cy={-110} rx={80} ry={36} fill={C} />
      <ellipse cx={-70} cy={-118} rx={12} ry={16} fill="#f2e6d6" />
      <path d="M 50 -130 L 80 -210 L 108 -200 L 84 -120 Z" fill={C} />
      <g transform={`translate(98 -215) rotate(${Math.sin(f / 20) * 6})`}>
        <ellipse cx={14} cy={4} rx={34} ry={20} fill={C} />
        <circle cx={44} cy={8} r={6} fill={INK} />
        <circle cx={18} cy={-4} r={4} fill={INK} />
        <path d="M -6 -12 L -20 -36 L -2 -20 Z" fill={C2} />
        <path d="M 6 -14 Q 0 -60 -24 -80 M 2 -40 Q 18 -60 26 -70 M 14 -16 Q 26 -60 50 -74 M 30 -50 Q 40 -64 52 -60" stroke="#e8d6b8" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};
const S8: React.FC<{ g: number }> = ({ g }) => {
  const dx = 1200 - g * 4.2;
  const GY = 1500;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="d22" stops={[[0, "#e0a888"], [1, "#f5dcc0"]]} h={1300} />
        <circle cx={260} cy={900} r={110} fill="#fff1c0" opacity={0.9} />
        <path d="M 0 1180 Q 300 1080 600 1160 T 1200 1150 L 1200 1300 L 0 1300 Z" fill="#a8a0b0" />
        <rect x={0} y={1280} width={1080} height={300} fill="#4a5470" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200 + 20} y={1420} width={110} height={10} rx={5} fill="#eef2f8" opacity={0.6} />)}
        {Array.from({ length: 22 }, (_, i) => <path key={"w" + i} d={`M ${rnd(i) * 1080} ${1300 + rnd(i + 3) * 260} q -10 -30 0 -50 q 10 20 0 50 q 14 -24 26 -36`} stroke="#5a9a5a" strokeWidth={5} fill="none" />)}
        <rect x={0} y={1580} width={1080} height={340} fill="#5a7a5a" />
        <Car x={140} y={1460} s={0.75} col="#5f8fb5" door />
        <Deer x={dx} y={GY - 30} f={g} s={1.1} walk />
        <Deer x={dx + 260} y={GY - 50} f={g + 9} s={0.8} walk />
        <Shadow x={820} y={1720} w={70} />
        <Dog x={690} y={1720} s={1.05} f={g} bark={Math.max(0, Math.sin(g / 5)) * (g > 80 ? 1 : 0)} wag={0.9} />
        <Me x={880} y={1720 - 140 * 1.7} s={1.7} dir={-1} turn={0.6} pose={STAND} hands={g > 70 ? { r: [-30, -60], l: [60, -70] } : undefined} t={g} face={{ eyes: "wide", brows: 1, mouth: "smile" }} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 9–10. Радио ===============
const Radio: React.FC<{ g: number; spike: number }> = ({ g, spike }) => (
  <g transform="translate(640 1180)">
    <rect x={-230} y={-170} width={460} height={260} rx={20} fill="#3a3a4a" />
    <rect x={-200} y={-140} width={260} height={120} rx={10} fill="#0e1a12" />
    <polyline points={Array.from({ length: 52 }, (_, i) => `${-196 + i * 5},${-80 + (rnd(i * 7 + g) - 0.5) * (10 + spike * 90) * (spike > 0.1 ? Math.sin(i / 3 + g) : 1)}`).join(" ")} fill="none" stroke={spike > 0.1 ? RED : GREEN} strokeWidth={3} />
    {[0, 1].map((i) => <g key={i} transform={`translate(${130 + i * 0} ${-110 + i * 70})`}><circle r={28} fill="#22222e" /><line x1={0} y1={0} x2={Math.cos(g / 30 + i) * 22} y2={Math.sin(g / 30 + i) * 22} stroke={WH} strokeWidth={4} /></g>)}
    <circle cx={-170} cy={50} r={10} fill={spike > 0.1 && Math.floor(g / 4) % 2 ? RED : "#5a2a2a"} />
    <text x={-120} y={58} fontFamily="monospace" fontWeight={700} fontSize={28} fill={YEL}>CH 09</text>
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={40 + i * 26} y={20} width={14} height={50} rx={4} fill="#22222e" />)}
  </g>
);
const S9: React.FC<{ g: number; last?: boolean }> = ({ g, last }) => {
  const s = 1.8, hip: V = [300, 1500];
  const talk = !last && Math.floor(g / 6) % 3 !== 0;
  const spike = last ? ip(g, [60, 66], [0, 1]) : 0;
  const lean = last ? ip(g, [66, 90], [0, 18]) : 4;
  const zoom = last ? ip(g, [100, 170], [1, 1.9], Easing.in(Easing.cubic)) : 1;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={zoom} ox={640} oy={1140}>
        <Full>
          <rect width={1080} height={1920} fill="#1a2038" />
          <rect x={0} y={1600} width={1080} height={320} fill="#11152a" />
          <circle cx={640} cy={1150} r={420} fill={spike ? RED : YEL} opacity={0.08} />
          <rect x={700} y={420} width={300} height={360} rx={8} fill="#0a0e1a" />
          <Stars f={g} n={14} h={780} />
          <rect x={846} y={420} width={8} height={360} fill="#1a2038" />
          <rect x={360} y={1270} width={620} height={24} rx={8} fill="#6a4a36" />
          <rect x={390} y={1294} width={20} height={306} fill="#4a3a30" /><rect x={930} y={1294} width={20} height={306} fill="#4a3a30" />
          <Radio g={g} spike={spike} />
          <rect x={150} y={1360} width={300} height={22} rx={6} fill="#3a2a2a" />
          <Me x={hip[0]} y={hip[1] - 120} s={s} turn={0.75} pose={sitPose(lean, last ? -6 : 0)} feet={{ l: [60, 130], r: [40, 134] }} hands={last ? { l: [70, -60], r: [90, -80] } : { l: [60, -40], r: [56, -138] }} t={g} face={last && spike ? { eyes: "wide", brows: 1, mouth: "o" } : { eyes: talk ? "open" : "closed", mouth: talk ? "o" : "flat", brows: 0.5 }}>
            {!last ? <g transform="translate(56 -138)"><rect x={-10} y={-30} width={22} height={42} rx={8} fill="#22222e" /><path d="M 2 12 Q 10 60 60 80" stroke="#22222e" strokeWidth={4} fill="none" /></g> : null}
          </Me>
          <Dog x={150} y={1600} s={0.9} f={g} sit={!(last && spike)} wag={last && spike ? 0.6 : 0.05} />
        </Full>
      </Cam>
      {last ? <AbsoluteFill style={{ background: "#000", opacity: ip(g, [165, 179], [0, 1]) }} /> : null}
    </AbsoluteFill>
  );
};

export const LastMan2: React.FC = () => {
  const f = useCurrentFrame();
  const local = f % SC;
  const gl = f > 4 && local < 5 ? 1 : 0;
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <AbsoluteFill style={{ transform: "translateY(-130px)", filter: gl ? "drop-shadow(8px 0 0 rgba(255,30,70,.7)) drop-shadow(-8px 0 0 rgba(30,220,255,.7))" : "none" }}>
        {scenes.map((S, i) => <Sequence key={i} from={i * SC} durationInFrames={SC}><Scn S={S} /></Sequence>)}
        <Sequence from={8 * SC} durationInFrames={SC}><Scn S={S9} /></Sequence>
        <Sequence from={9 * SC} durationInFrames={SC}><Last /></Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 240px 70px rgba(30,0,10,0.6)", pointerEvents: "none" }} />
      <Grain f={f} o={0.12} />
      <Hud f={f} />
      <Chapter f={f} at={536} n="2" title="POWER" />
      <Chapter f={f} at={1076} n="3" title="FOOD" />
      <Chapter f={f} at={1436} n="4" title="THE RADIO" />
      <Subs f={f} />
      <Audio src={staticFile("lastman2/sound.wav")} />
    </AbsoluteFill>
  );
};
const Scn: React.FC<{ S: React.FC<{ g: number }> }> = ({ S }) => {
  const g = useCurrentFrame();
  return <S g={g} />;
};
const Last: React.FC = () => {
  const g = useCurrentFrame();
  return <S9 g={g} last />;
};
