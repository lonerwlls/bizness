// «What if you were the last man on Earth» — часть 1 из 5: первая неделя. 60 сек, только сцены и звуки.
// Герой — MASCOT, напарник — пёс (появляется в сцене 7 и дальше будет во всех частях).
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MASCOT, Person, Pose, STAND, Shadow, V, lerp } from "../characters/Rig";
import { Bus, Cam, Car, Dog, Full, Grain, INK, MONT, N0, RED, Sky, Stars, WH, YEL, ip, mixHex, rnd, sitPose, toLocal, walkRig } from "../characters/kit";

export const LASTMAN1_FRAMES = 1800;
const Me: React.FC<Omit<React.ComponentProps<typeof Person>, "look">> = (p) => <Person {...p} look={MASCOT} />;

// фон города днём (сцены 1–2)
const City: React.FC<{ f: number; sky?: [string, string] }> = ({ f, sky = ["#8fb0d8", "#c8dcf0"] }) => (
  <>
    <Sky id="cs" stops={[[0, sky[0]], [1, sky[1]]]} h={1500} />
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        <rect x={i * 150 - 60} y={380 + rnd(i) * 300} width={140} height={1200} fill={i % 2 ? "#5a6e98" : "#647aa4"} />
        {Array.from({ length: 18 }, (_, k) => <rect key={k} x={i * 150 - 44 + (k % 3) * 40} y={420 + rnd(i) * 300 + Math.floor(k / 3) * 90} width={26} height={44} rx={3} fill="#46587e" />)}
      </g>
    ))}
    <path d={`M ${((f * 4) % 1400) - 200} 900 q 20 -12 40 0 q -10 14 -40 0`} fill="#ffffff" opacity={0} />
  </>
);

// =============== 1. Пустая улица (0–7) ===============
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const GY = 1640, s = 1.8, S = 170;
  const door = ip(f, [0, 14], [0, 1], Easing.out(Easing.cubic));
  const mx = f < 20 ? 170 : f < 90 ? 170 + (f - 20) * (255 / 70) : 425;
  const w = walkRig(mx, () => GY, s, S);
  const zoom = ip(f, [26, 70], [1.7, 1], Easing.inOut(Easing.cubic));
  const look = f >= 90 && f < 150 ? Math.sin((f - 90) / 9) : 0;
  const shout = f >= 150 && f < 186;
  const shrug = f >= 186;
  const hands = shout ? { l: [14, -150] as V, r: [34, -150] as V } : shrug ? { l: [-70, -60] as V, r: [70, -60] as V } : undefined;
  const pose: Pose = f >= 90 ? { ...STAND, head: look * 12 } : w.pose;
  const face = shout ? { eyes: "closed" as const, mouth: "o" as const } : f >= 60 ? { eyes: "wide" as const, brows: 1, mouth: shrug ? "flat" as const : "o" as const } : { mouth: "smile" as const };
  const light = Math.floor(f / 30) % 3;
  const birdsUp = f >= 152;
  const paper = ((f * 7) % 1600) - 200;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={zoom} ox={200} oy={1300}>
        <Full>
          <City f={f} />
          <rect x={0} y={1180} width={1080} height={300} fill="#3a465e" />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 180 + 20} y={1320} width={100} height={10} rx={5} fill="#cfd8e6" opacity={0.7} />)}
          <Bus x={760} y={1300} s={0.62} />
          <Car x={180} y={1460} s={0.75} col="#5f8fb5" door />
          <Car x={560} y={1470} s={0.75} col="#e47a3c" dir={-1} door />
          <Car x={960} y={1465} s={0.75} col="#7fb08a" door />
          <rect x={0} y={1480} width={1080} height={440} fill="#56658a" />
          <rect x={0} y={1480} width={1080} height={16} fill="#6c7ba0" />
          {/* светофор */}
          <rect x={890} y={760} width={14} height={880} fill="#2a3450" />
          <rect x={866} y={700} width={62} height={170} rx={12} fill="#1b2033" />
          {[RED, YEL, "#5ad08a"].map((c, i) => <circle key={i} cx={897} cy={730 + i * 52} r={20} fill={c} opacity={light === i ? 1 : 0.18} />)}
          {/* подъезд */}
          <rect x={20} y={1150} width={300} height={360} fill="#4a5a80" />
          <rect x={70} y={1220} width={200} height={290} fill="#141b2e" />
          <rect x={70} y={1220} width={200 * (1 - door * 0.85)} height={290} fill="#7a5a44" />
          {/* голуби */}
          {[0, 1, 2, 3].map((i) => {
            const t = Math.max(0, f - 152 - i * 3);
            const x = 640 + i * 46 + t * (6 + i), y = 1636 - (birdsUp ? t * t * 0.25 + t * 4 : Math.abs(Math.sin(f / 5 + i)) * 4);
            return birdsUp ? (
              <path key={i} d={`M ${x - 16} ${y - Math.sin(f) * 10} Q ${x - 8} ${y - 6} ${x} ${y} Q ${x + 8} ${y - 6} ${x + 16} ${y - Math.sin(f) * 10}`} stroke="#5a6a7a" strokeWidth={5} fill="none" strokeLinecap="round" />
            ) : (
              <g key={i}><ellipse cx={x} cy={y - 10} rx={16} ry={10} fill="#7a8a9a" /><circle cx={x + 14} cy={y - 20} r={7} fill="#6a7a8a" /></g>
            );
          })}
          {/* газета катится ветром */}
          <rect x={paper} y={1600 + Math.sin(f / 4) * 10} width={60} height={40} rx={4} fill="#e8e4d8" transform={`rotate(${f * 9} ${paper + 30} ${1620})`} />
          <Shadow x={mx} y={GY} w={75} />
          <Me x={mx} y={f >= 90 ? GY - 140 * s : w.hip[1]} s={s} turn={f >= 90 ? 0.25 : 0.9} pose={pose} feet={f >= 90 ? undefined : w.feet} hands={hands} t={f} face={face} />
          {shout ? [0, 1, 2].map((i) => {
            const r = ((f - 150 + i * 10) % 30) * 12;
            return <path key={i} d={`M ${mx + 60 + r} ${GY - 300 - r * 0.6} Q ${mx + 90 + r * 1.2} ${GY - 300} ${mx + 60 + r} ${GY - 300 + r * 0.6}`} stroke={WH} strokeWidth={5} fill="none" opacity={1 - r / 360} strokeLinecap="round" />;
          }) : null}
        </Full>
      </Cam>
    </AbsoluteFill>
  );
};

// =============== 2. Первый час: звонки без ответа (7–14) ===============
const Phone: React.FC<{ g: number }> = ({ g }) => {
  // g: 0..110 (кадры 100..210 сцены)
  const call = g < 50;
  const scroll = ip(g, [55, 70, 80, 95], [0, -260, -260, -40], Easing.inOut(Easing.quad));
  const spin = g >= 80 ? (g - 80) * 18 : 0;
  return (
    <AbsoluteFill style={{ background: "#3a465e" }}>
      <Full>
        <rect width={1080} height={1920} fill="#56658a" opacity={0.5} />
        <g transform={`translate(540 980) rotate(${-4 + Math.sin(g / 20) * 1.5})`}>
          <rect x={-250} y={-470} width={500} height={940} rx={56} fill="#1b2033" />
          <rect x={-226} y={-446} width={452} height={892} rx={40} fill="#101828" />
          <defs><clipPath id="scr"><rect x={-226} y={-446} width={452} height={892} rx={40} /></clipPath></defs>
          <g clipPath="url(#scr)">
            {call ? (
              <g>
                <rect x={-226} y={-446} width={452} height={892} fill="#1d2b4a" />
                {[0, 1, 2].map((i) => {
                  const r = 90 + ((g * 3 + i * 40) % 120);
                  return <circle key={i} cx={0} cy={-170} r={r} fill="none" stroke="#9cc0ff" strokeWidth={4} opacity={1 - (r - 90) / 120} />;
                })}
                <circle cx={0} cy={-170} r={86} fill="#e8a088" />
                <circle cx={0} cy={-196} r={34} fill="#f2d2b4" />
                <path d="M -60 -110 Q 0 -170 60 -110 Z" fill="#f2d2b4" />
                <text x={0} y={-20} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={64} fill={WH}>Mom</text>
                <text x={0} y={40} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill="#9cb0d0">{g < 40 ? "calling..." : "No answer"}</text>
                <circle cx={0} cy={300} r={60} fill={RED} />
                <rect x={-34} y={290} width={68} height={20} rx={10} fill={WH} />
              </g>
            ) : (
              <g transform={`translate(0 ${scroll})`}>
                <rect x={-226} y={-700} width={452} height={2000} fill="#eef2f8" />
                <g transform={`rotate(${spin} 0 -380)`} opacity={g >= 80 ? 1 : 0}>
                  <path d="M 0 -404 A 24 24 0 1 1 -24 -380" stroke="#5a6a8a" strokeWidth={6} fill="none" strokeLinecap="round" />
                </g>
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} transform={`translate(0 ${-330 + i * 300})`}>
                    <circle cx={-170} cy={0} r={30} fill={["#e47a3c", "#5f8fb5", "#7fb08a", "#b5814a"][i]} />
                    <rect x={-124} y={-16} width={160} height={14} rx={7} fill="#3a465e" />
                    <rect x={-124} y={8} width={100} height={10} rx={5} fill="#aab6cc" />
                    <text x={190} y={8} textAnchor="end" fontFamily={MONT} fontWeight={900} fontSize={26} fill="#8a96b0">{`${6 + i}h`}</text>
                    <rect x={-200} y={46} width={400} height={180} rx={14} fill={["#9cc0e6", "#f2c8a0", "#b8d8b0", "#d8c0e0"][i]} />
                  </g>
                ))}
              </g>
            )}
          </g>
        </g>
        {/* рука героя */}
        <ellipse cx={720} cy={1350} rx={86} ry={64} fill={MASCOT.skin} />
        <rect x={680} y={1370} width={190} height={600} rx={60} fill={MASCOT.top} />
        <ellipse cx={600} cy={1180 + (call ? 0 : Math.sin(g / 3) * 20)} rx={30} ry={22} fill={MASCOT.skin} />
      </Full>
    </AbsoluteFill>
  );
};
const Scene2: React.FC = () => {
  const g = useCurrentFrame();
  if (g >= 100) return <Phone g={g - 100} />;
  const carS = 2.2, cx = 640, GY = 1660;
  const hipY = GY - 104 * carS - 4, s = 1.8, mx = cx - 360;
  const lower = g >= 60;
  const tap = Math.max(0, Math.sin(g / 3)) * 8;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <City f={g} />
        <rect x={0} y={1180} width={1080} height={740} fill="#56658a" />
        <rect x={0} y={1180} width={1080} height={16} fill="#6c7ba0" />
        <Car x={180} y={1250} s={0.6} col="#7fb08a" door />
        <Car x={cx} y={GY} s={carS} col="#e0524a" dir={-1} />
        <Me x={mx} y={hipY} s={s} turn={0.45} pose={sitPose(lower ? 8 : -2, lower ? 10 : 0)} feet={{ l: [40, (GY - hipY) / s - 4], r: [64, (GY - hipY) / s - 4 - tap] }} hands={lower ? { l: [30, -60], r: [44, -84] } : { l: [44, -14], r: [24, -152] }} t={g} face={lower ? { brows: 1, mouth: "flat" } : { eyes: "open", brows: 0.6, mouth: "flat" }}>
          <rect x={lower ? 36 : 14} y={lower ? -112 : -184} width={30} height={52} rx={6} fill={INK} transform={lower ? "rotate(-20 50 -86)" : ""} />
        </Me>
      </Full>
    </AbsoluteFill>
  );
};

// =============== 3. Первые часы: свет ещё горит (14–21) ===============
const Scene3: React.FC = () => {
  const g = useCurrentFrame();
  const t = ip(g, [0, 150], [0, 1]);
  const top = t < 0.5 ? mixHex("#8fb0d8", "#6a5a8a", t * 2) : mixHex("#6a5a8a", "#141f3a", (t - 0.5) * 2);
  const bot = t < 0.5 ? mixHex("#c8dcf0", "#f0a070", t * 2) : mixHex("#f0a070", "#2a3a62", (t - 0.5) * 2);
  const lit = ip(g, [60, 150], [0, 0.85]);
  const flick = (i: number) => g >= 165 && g < 200 && i % 5 === 2 && Math.floor(g / 3) % 2 === 0;
  const s = 1.9, hip: V = [330, 1300];
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="ev" stops={[[0, top], [1, bot]]} />
        <Stars f={g} o={ip(g, [110, 160], [0, 0.8])} />
        <circle cx={760} cy={lerp(700, 1300, t)} r={90} fill="#ffd27a" opacity={1 - ip(g, [100, 140], [0, 1])} />
        {Array.from({ length: 9 }, (_, i) => {
          const x = i * 130 - 40, h = 380 + rnd(i + 3) * 380, y = 1350 - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={120} height={h + 600} fill={mixHex("#5a6e98", "#1d2848", t)} />
              {Array.from({ length: Math.floor(h / 70) * 3 }, (_, k) => (
                <rect key={k} x={x + 14 + (k % 3) * 36} y={y + 20 + Math.floor(k / 3) * 70} width={22} height={36} rx={3} fill={rnd(i * 50 + k) < lit && !flick(i) ? YEL : mixHex("#46587e", "#141b2e", t)} opacity={0.85} />
              ))}
            </g>
          );
        })}
        <rect x={0} y={1300} width={640} height={620} fill="#2f3b5c" />
        <rect x={0} y={1290} width={650} height={22} fill="#46587e" />
        <Me x={hip[0]} y={hip[1] - 8} s={s} turn={0.6} pose={sitPose(-4, -4 + Math.sin(g / 40) * 6)} feet={{ l: [70, 110 + Math.sin(g / 12) * 8], r: [50, 116 - Math.sin(g / 12) * 8] }} hands={{ l: [-40, 0], r: [60, -10] }} t={g} face={{ eyes: g > 130 ? "wide" : "open", mouth: "flat" }} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 4. День 1: магазин твой (21–28) ===============
const Cart: React.FC<{ x: number; y: number; items: number }> = ({ x, y, items }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: items }, (_, i) => <rect key={i} x={-70 + (i % 3) * 46} y={-200 - Math.floor(i / 3) * 34} width={40} height={50} rx={6} fill={["#e0524a", "#5f8fb5", YEL, "#7fb08a"][i % 4]} />)}
    <path d="M -110 -190 L 110 -190 L 90 -60 L -90 -60 Z" fill="none" stroke="#aab6cc" strokeWidth={8} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-100 + i * 66} y1={-190} x2={-84 + i * 58} y2={-60} stroke="#aab6cc" strokeWidth={4} />)}
    <line x1={-110} y1={-190} x2={-150} y2={-230} stroke="#aab6cc" strokeWidth={8} strokeLinecap="round" />
    <line x1={-90} y1={-60} x2={-90} y2={-20} stroke="#aab6cc" strokeWidth={6} />
    <line x1={80} y1={-60} x2={80} y2={-20} stroke="#aab6cc" strokeWidth={6} />
    <circle cx={-90} cy={-12} r={12} fill="#1b2033" />
    <circle cx={80} cy={-12} r={12} fill="#1b2033" />
  </g>
);
const Scene4: React.FC = () => {
  const g = useCurrentFrame();
  const GY = 1660, s = 1.9, S = 170;
  const mx = g < 60 ? 170 + g * (255 / 60) : 425;
  const w = walkRig(mx, () => GY, s, S);
  const hip: V = g < 60 ? w.hip : [425, GY - 140 * s];
  const cartX = mx + 230;
  const handle = toLocal([cartX - 150, GY - 230], hip, s);
  const cyc = Math.floor((g - 60) / 26), ph = ((g - 60) % 26) / 26;
  const grabbing = g >= 60 && g < 138;
  const shelf: V = [mx + 120 + cyc * 50, 980 + cyc * 160];
  const reachT = Math.sin(Math.min(ph, 0.5) * Math.PI);
  const items = g < 60 ? 2 : Math.min(9, 2 + Math.max(0, cyc) * 2 + (ph > 0.6 ? 2 : 0));
  const drinking = g >= 140;
  const fly = grabbing && ph > 0.5 ? (ph - 0.5) / 0.5 : -1;
  const handR: V = drinking ? [30, -150] : grabbing ? toLocal([lerp(cartX - 150, shelf[0], reachT), lerp(GY - 230, shelf[1], reachT)], hip, s) : handle;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <rect width={1080} height={1920} fill="#3d4a72" />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={i * 300 + 40} y={260} width={200} height={20} rx={8} fill="#eef2f8" opacity={i === 2 && Math.floor(g / 4) % 3 === 0 ? 0.3 : 0.9} />)}
        {[540, 700, 860, 1020, 1180, 1340].map((y, r) => (
          <g key={r}>
            <rect x={0} y={y + 90} width={1080} height={20} fill="#6c7ba0" />
            {Array.from({ length: 22 }, (_, i) => <rect key={i} x={10 + i * 50} y={y + 24 + (i % 2) * 8} width={40} height={66 - (i % 2) * 8} rx={6} fill={["#e0524a", "#5f8fb5", YEL, "#7fb08a", "#e8e4d8", "#b5814a"][(i + r * 2) % 6]} />)}
          </g>
        ))}
        <rect x={0} y={1500} width={1080} height={420} fill="#2c3656" />
        <Cart x={cartX} y={GY} items={items} />
        {fly >= 0 ? <rect x={lerp(shelf[0], cartX - 20, fly) - 20} y={lerp(shelf[1], GY - 210, fly) - 25 - Math.sin(fly * Math.PI) * 120} width={40} height={50} rx={6} fill={["#e0524a", "#5f8fb5", YEL][cyc % 3]} /> : null}
        <Shadow x={hip[0]} y={GY} w={75} />
        <Me x={hip[0]} y={hip[1]} s={s} turn={0.8} pose={{ ...(g < 60 ? w.pose : STAND), lean: drinking ? -6 : 8, head: drinking ? -18 : 0 }} feet={g < 60 ? w.feet : undefined} hands={{ l: drinking ? [20, -120] : handle, r: handR }} t={g} face={drinking ? { eyes: "closed", mouth: "o" } : { eyes: "happy", mouth: "grin" }}>
          {drinking ? (
            <g transform={`translate(${handR[0]} ${handR[1]}) rotate(${-40 - Math.sin(g / 4) * 6})`}>
              <rect x={-16} y={-60} width={32} height={60} rx={4} fill={WH} />
              <rect x={-16} y={-40} width={32} height={16} fill="#5f8fb5" />
              <path d="M -16 -60 L 0 -76 L 16 -60 Z" fill={WH} />
            </g>
          ) : null}
        </Me>
      </Full>
    </AbsoluteFill>
  );
};

// =============== 5. День 2: город гаснет, звёзды (28–35) ===============
const OFFS = [30, 45, 60, 75, 90, 105];
const Scene5: React.FC = () => {
  const g = useCurrentFrame();
  const stars = ip(g, [105, 190], [0.3, 1]);
  const band = ip(g, [120, 200], [0, 0.6]);
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="bk" stops={[[0, "#0a1024"], [1, "#1d2848"]]} />
        <Stars f={g} n={120} h={1300} o={stars} />
        <g opacity={band}>
          <ellipse cx={540} cy={600} rx={900} ry={140} fill="#9cb0e0" opacity={0.18} transform="rotate(-30 540 600)" />
          {Array.from({ length: 160 }, (_, i) => {
            const u = rnd(i + 500) * 2 - 1, v = (rnd(i + 900) - 0.5) * 220;
            const x = 540 + u * 900 * Math.cos(-30 * Math.PI / 180) - v * Math.sin(-30 * Math.PI / 180);
            const y = 600 + u * 900 * Math.sin(-30 * Math.PI / 180) + v * Math.cos(-30 * Math.PI / 180);
            return <circle key={i} cx={x} cy={y} r={1 + rnd(i) * 1.6} fill={WH} opacity={0.6} />;
          })}
        </g>
        {Array.from({ length: 12 }, (_, i) => {
          const layer = i % 3, x = i * 95 - 40, h = 300 + rnd(i + 7) * 500 - layer * 60, y = 1500 - h;
          const off = g >= OFFS[i % 6];
          const blink = !off && g >= OFFS[i % 6] - 4;
          return (
            <g key={i}>
              <rect x={x} y={y} width={110} height={h + 400} fill={["#141b2e", "#18203a", "#1d2848"][layer]} />
              {Array.from({ length: Math.floor(h / 60) * 3 }, (_, k) => <rect key={k} x={x + 12 + (k % 3) * 32} y={y + 16 + Math.floor(k / 3) * 60} width={18} height={30} rx={3} fill={YEL} opacity={off ? 0 : rnd(i * 70 + k) > 0.35 ? (blink ? 0.3 : 0.85) : 0} />)}
            </g>
          );
        })}
        {[150, 450, 750].map((x, i) => (
          <g key={i}>
            <rect x={x} y={1260} width={10} height={300} fill="#141b2e" />
            <circle cx={x + 5} cy={1260} r={12} fill={g < 105 ? YEL : "#2a3450"} />
            {g < 105 ? <path d={`M ${x + 5} 1260 L ${x - 80} 1560 L ${x + 90} 1560 Z`} fill={YEL} opacity={0.12} /> : null}
          </g>
        ))}
        <rect x={0} y={1560} width={1080} height={360} fill="#141b2e" />
        <rect x={180} y={1712} width={720} height={26} rx={10} fill="#3a4c74" />
        <Me x={560} y={1700} s={1.5} rot={-90} turn={1} pose={{ lean: 0, aL: [0, 0], aR: [0, 0], lL: [0, 0], lR: [0, 0] }} feet={{ l: [4, 146], r: [30, 120] }} hands={{ l: [-6, -170], r: [10, -176] }} t={g} face={{ eyes: g > 110 ? "wide" : "open", mouth: g > 150 ? "smile" : "flat" }} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 6. День 3: вода кончается (35–42) ===============
const Scene6: React.FC = () => {
  const g = useCurrentFrame();
  const GY = 1700, s = 2.0, hip: V = [330, GY - 140 * 2.0];
  const spout: V = [640, 1048];
  const glass: V = [650, 1170];
  const flow = g < 60 ? 1 : g < 110 ? (rnd(Math.floor(g / 3)) > 0.5 ? 1 : 0) : 0;
  const drip = g >= 110 && g < 150 ? ((g - 110) % 20) / 20 : -1;
  const fill = ip(g, [0, 60], [0.1, 0.55]);
  const tapping = g >= 120 && g < 145;
  const pour = g >= 155;
  const hR: V = pour ? toLocal([700, 1060], hip, s) : toLocal([glass[0] - 30, glass[1] + 20], hip, s);
  const hL: V = tapping ? toLocal([spout[0] - 10, spout[1] - 20 + Math.abs(Math.sin(g / 2)) * -14], hip, s) : pour ? toLocal([640, 1020], hip, s) : [10, -40];
  const face = g < 60 ? { mouth: "smile" as const } : g < 115 ? { eyes: "wide" as const, brows: 1, mouth: "o" as const } : pour ? { mouth: "flat" as const, brows: -0.4 } : { brows: -0.6, mouth: "fear" as const };
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <rect width={1080} height={1920} fill="#3d5478" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={0} y={400 + i * 80} width={1080} height={4} fill="#46608a" />)}
        <rect x={700} y={420} width={300} height={360} rx={10} fill="#9cc0e6" />
        <rect x={846} y={420} width={8} height={360} fill="#3d5478" />
        <rect x={0} y={1200} width={1080} height={720} fill="#2c3c5c" />
        <rect x={420} y={1180} width={660} height={40} rx={10} fill="#dfe6f2" />
        <rect x={540} y={1180} width={220} height={20} fill="#9aa6c0" />
        <path d={`M 600 1180 L 600 1020 Q 600 990 630 990 L 650 990 Q 660 990 660 1010 L 660 ${spout[1] - 8}`} stroke="#aab6cc" strokeWidth={18} fill="none" strokeLinecap="round" />
        {/* бутылки с водой */}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={870 + (i % 3) * 56} y={1080 - Math.floor(i / 3) * 96} width={46} height={96} rx={14} fill="#9cd0f0" opacity={0.85} />)}
        {flow ? <rect x={spout[0] + 14} y={spout[1]} width={10 + (g < 60 ? 4 : 0)} height={glass[1] - spout[1] - 40} fill="#9cd0f0" opacity={0.85} /> : null}
        {drip >= 0 ? <ellipse cx={spout[0] + 19} cy={spout[1] + drip * 110} rx={6} ry={9} fill="#9cd0f0" /> : null}
        {!pour ? (
          <g>
            <rect x={glass[0] - 4} y={glass[1] - 90 + 90 * (1 - fill)} width={56} height={90 * fill} fill="#9cd0f0" opacity={0.8} />
            <rect x={glass[0] - 6} y={glass[1] - 96} width={60} height={96} rx={6} fill="none" stroke={WH} strokeWidth={5} />
          </g>
        ) : (
          <g>
            <rect x={760} y={1080} width={60} height={96} rx={6} fill="none" stroke={WH} strokeWidth={5} />
            <rect x={764} y={1176 - ip(g, [165, 205], [20, 70])} width={52} height={ip(g, [165, 205], [20, 70])} fill="#9cd0f0" opacity={0.8} />
            <g transform={`translate(700 1040) rotate(${ip(g, [155, 165], [0, 100])})`}>
              <rect x={-24} y={-110} width={48} height={110} rx={14} fill="#9cd0f0" opacity={0.9} />
            </g>
            {g >= 165 ? <rect x={782} y={1000} width={10} height={170} fill="#9cd0f0" opacity={0.8} /> : null}
          </g>
        )}
        <Shadow x={hip[0]} y={GY} w={80} />
        <Me x={hip[0]} y={hip[1]} s={s} turn={0.8} pose={{ ...STAND, lean: 8 }} hands={{ l: hL, r: hR }} t={g} face={face} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 7. Дни 4–5: запертые питомцы, пёс (42–49) ===============
const Scene7: React.FC = () => {
  const g = useCurrentFrame();
  const GY = 1640, s = 1.8, S = 170;
  const walkIn = g < 60;
  const mx = walkIn ? 85 + g * (340 / 60) : g < 170 ? 425 : 425 + (g - 170) * 4.25;
  const w = walkRig(mx, () => GY, s, S);
  const door = ip(g, [70, 82], [0, 1], Easing.out(Easing.cubic));
  const out = g >= 82;
  const dogT = ip(g, [82, 112], [0, 1]);
  const kneel = g >= 112 && g < 170;
  const dogX = out ? (g < 170 ? lerp(700, mx + 130, dogT) : mx + 150) : 830;
  const dogY = out ? GY - (g >= 100 && g < 125 ? Math.sin(((g - 100) / 25) * Math.PI) * 140 : 0) : 1330;
  const bark = !out ? Math.max(0, Math.sin(g / 4)) : g < 112 ? 0.6 * Math.max(0, Math.sin(g / 3)) : 0;
  const hip: V = walkIn || g >= 170 ? w.hip : kneel ? [425, GY - 92 * s] : [425, GY - 140 * s];
  const pose: Pose = kneel ? { lean: 20, aL: [0, 0], aR: [0, 0], lL: [70, -10], lR: [100, -20] } : walkIn || g >= 170 ? w.pose : STAND;
  const hands = !walkIn && g < 82 ? { r: toLocal([630, 1420], hip, s) } : kneel ? { r: toLocal([dogX + 40, GY - 120 + Math.sin(g / 3) * 8], hip, s), l: [20, -40] as V } : undefined;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="sb" stops={[[0, "#8fb0d8"], [1, "#d8e4f0"]]} h={1300} />
        {[[-120, "#c48a74"], [560, "#7f9fc4"]].map(([x, c], i) => (
          <g key={i}>
            <rect x={x as number} y={900} width={560} height={740} fill={c as string} />
            <path d={`M ${(x as number) - 30} 910 L ${(x as number) + 280} 650 L ${(x as number) + 590} 910 Z`} fill="#4a3a4a" />
          </g>
        ))}
        {/* дверь и окно с собакой */}
        <rect x={600} y={1300} width={150} height={340} fill="#141b2e" />
        <rect x={600} y={1300} width={150 * (1 - door * 0.85)} height={340} fill="#7a4a3a" />
        <circle cx={600 + 150 * (1 - door * 0.85) - 20} cy={1470} r={8} fill={YEL} />
        <rect x={780} y={1220} width={200} height={170} rx={8} fill="#2a3a5e" />
        <defs><clipPath id="win"><rect x={780} y={1220} width={200} height={170} rx={8} /></clipPath></defs>
        {!out ? <g clipPath="url(#win)"><Dog x={830} y={1440} s={1.1} dir={-1} f={g} bark={bark} sit /></g> : null}
        <rect x={780} y={1220} width={200} height={170} rx={8} fill="#9cc0e6" opacity={0.3} />
        <rect x={876} y={1220} width={8} height={170} fill="#5a6a8a" />
        <rect x={0} y={1640} width={1080} height={280} fill="#5a7a5a" />
        <rect x={0} y={1640} width={1080} height={14} fill="#6a8a6a" />
        {out ? <Dog x={dogX} y={dogY} s={1.1} dir={-1} f={g} bark={bark} wag={1} run={g < 112 || g >= 170} tongue={g >= 112} /> : null}
        <Shadow x={hip[0]} y={GY} w={75} />
        <Me x={hip[0]} y={hip[1]} s={s} turn={0.8} pose={pose} feet={walkIn || g >= 170 ? w.feet : undefined} hands={hands} t={g} face={g < 82 ? { brows: 0.6, mouth: "flat" } : { eyes: "happy", mouth: "grin" }} />
      </Full>
    </AbsoluteFill>
  );
};

// =============== 8. День 6: любая машина, но дороги забиты (49–55) ===============
const Scene8: React.FC = () => {
  const g = useCurrentFrame();
  const speed = g < 100 ? 26 : g < 130 ? ip(g, [100, 130], [26, 0], Easing.out(Easing.quad)) : 0;
  let dist = 0;
  for (let k = 0; k < g; k++) dist += k < 100 ? 26 : k < 130 ? 26 * (1 - Math.pow((k - 100) / 30, 0.5)) : 0;
  const pan = ip(g, [135, 180], [0, 320], Easing.inOut(Easing.cubic));
  const RY = 1500, carX = 380;
  const jamStart = 380 + 2600 + 300 - dist;
  const out = g >= 150;
  const ears = Math.sin(g / 2) * (speed / 26) * 20;
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Full>
        <Sky id="hw" stops={[[0, "#8fb0d8"], [1, "#e8dcc8"]]} h={1400} />
        <path d={`M 0 1180 Q 300 ${1080} 600 1160 T 1200 1150 L 1200 1400 L 0 1400 Z`} fill="#8aa0b8" />
        <g transform={`translate(${-pan} 0)`}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = ((i * 220 - dist * 0.5) % 3080 + 3080) % 3080 - 200;
            return <g key={i}><rect x={x} y={1150} width={16} height={240} fill="#4a5a4a" /><circle cx={x + 8} cy={1130} r={60} fill="#5a8a6a" /></g>;
          })}
          <rect x={-200} y={1380} width={3000} height={240} fill="#4a5470" />
          {Array.from({ length: 20 }, (_, i) => <rect key={i} x={((i * 200 - dist) % 4000 + 4000) % 4000 - 200} y={1495} width={110} height={10} rx={5} fill="#eef2f8" opacity={0.8} />)}
          {/* пробка из брошенных машин */}
          {Array.from({ length: 12 }, (_, i) => <Car key={i} x={jamStart + i * 420} y={RY + 60} s={0.95} col={["#5f8fb5", "#7fb08a", "#b5814a", "#9a8ac0", "#e8e4d8"][i % 5]} door={i % 3 === 0} />)}
          <rect x={-200} y={1620} width={3000} height={300} fill="#6a7a5a" />
          <Car x={carX} y={RY + 60} s={1.25} col={RED} spin={-dist * 0.9} lights uid="drive">
            <Me x={-20} y={-36} s={0.62} turn={0.8} pose={sitPose(-4)} hands={{ l: [70, -70], r: [80, -74] }} t={g} face={{ eyes: g > 100 ? "wide" : "happy", mouth: g > 100 ? "o" : "grin" }} />
          </Car>
          {!out ? (
            <g transform={`translate(${carX - 70} ${RY - 140}) scale(-1 1)`}>
              <circle r={26} fill="#c08a52" />
              <ellipse cx={-22} cy={8} rx={16} ry={10} fill="#c08a52" />
              <circle cx={-36} cy={4} r={6} fill={INK} />
              <circle cx={-6} cy={-6} r={4} fill={INK} />
              <path d={`M 14 -12 Q ${40 + ears} ${-20 - ears * 0.5} ${44 + ears} -2 Z`} fill="#8a5a32" />
              <ellipse cx={-20} cy={22} rx={6} ry={10} fill="#e86a7a" />
            </g>
          ) : null}
          {out ? (
            <>
              <Shadow x={carX + 330} y={RY + 120} w={70} />
              <Me x={carX + 330} y={RY + 120 - 140 * 1.6} s={1.6} turn={0.5} pose={STAND} hands={{ l: [-30, -210], r: [34, -214] }} t={g} face={{ eyes: "wide", brows: 1, mouth: "o" }} />
              <Dog x={carX + 470} y={RY + 120} s={1} f={g} sit wag={0.2} />
            </>
          ) : null}
        </g>
        {Array.from({ length: speed > 5 ? 6 : 0 }, (_, i) => <line key={i} x1={rnd(i + g) * 1080} y1={700 + rnd(i * 3) * 700} x2={rnd(i + g) * 1080 + 140} y2={700 + rnd(i * 3) * 700} stroke={WH} strokeWidth={3} opacity={0.3} />)}
      </Full>
    </AbsoluteFill>
  );
};

// =============== 9. Ночь 7: где-то зажигается свет (55–60) ===============
const Scene9: React.FC = () => {
  const g = useCurrentFrame();
  const LIGHT: V = [860, 860];
  const on = g >= 50;
  const stand = ip(g, [80, 104], [0, 1], Easing.inOut(Easing.quad));
  const s = 1.9, sitHip: V = [330, 1300];
  const hipY = lerp(sitHip[1] - 8, 1300 - 140 * s, stand);
  const feet = { l: [lerp(70, -8, stand), lerp(110, (1300 - hipY) / s, stand)] as V, r: [lerp(50, 14, stand), lerp(116, (1300 - hipY) / s, stand)] as V };
  const zoom = ip(g, [108, 150], [1, 2.0], Easing.in(Easing.cubic));
  const dogUp = g >= 56;
  const bark = [60, 75].reduce((m, a) => Math.max(m, ip(g, [a, a + 2, a + 8], [0, 1, 0])), 0);
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Cam k={zoom} ox={LIGHT[0]} oy={LIGHT[1]}>
        <Full>
          <Sky id="n7" stops={[[0, "#070b1a"], [1, "#141f3a"]]} />
          <Stars f={g} n={140} h={1200} />
          {Array.from({ length: 10 }, (_, i) => {
            const x = i * 120 - 40, h = 350 + rnd(i + 21) * 450, y = 1320 - h;
            return <rect key={i} x={x} y={y} width={112} height={h + 400} fill={i % 2 ? "#0e1424" : "#121a2e"} />;
          })}
          {on ? (
            <g>
              <circle cx={LIGHT[0]} cy={LIGHT[1]} r={60} fill={YEL} opacity={0.18 * ip(g, [50, 60], [0, 1])} />
              <rect x={LIGHT[0] - 12} y={LIGHT[1] - 18} width={24} height={36} rx={3} fill={YEL} opacity={ip(g, [50, 53], [0, 1])} />
            </g>
          ) : null}
          <rect x={0} y={1300} width={640} height={620} fill="#1a2238" />
          <rect x={0} y={1290} width={650} height={22} fill="#2a3450" />
          <circle cx={120} cy={1270} r={70} fill={YEL} opacity={0.15} />
          <rect x={104} y={1240} width={32} height={48} rx={8} fill={YEL} />
          <Dog x={520} y={1290} s={0.9} f={g} sit={!dogUp} bark={bark} wag={dogUp ? 0.6 : 0.1} />
          <Me x={sitHip[0]} y={hipY} s={s} turn={0.6} pose={stand > 0 ? { ...STAND } : sitPose(-2, -2)} feet={feet} hands={stand > 0.5 ? { l: [-30, -40], r: [40, -60] } : { l: [-40, 0], r: [60, -10] }} t={g} face={on ? { eyes: "wide", brows: 1, mouth: "o" } : { eyes: "open", mouth: "flat" }} />
        </Full>
      </Cam>
      <AbsoluteFill style={{ background: "#000", opacity: ip(g, [140, 150], [0, 1]) }} />
    </AbsoluteFill>
  );
};

export const LastMan1: React.FC = () => {
  const f = useCurrentFrame();
  const cut = (a: number) => ip(f, [a - 1, a, a + 5], [0, 1, 0]);
  const whip = Math.max(...[210, 420, 630, 840, 1050, 1260, 1470, 1650].map(cut));
  return (
    <AbsoluteFill style={{ background: N0 }}>
      <Sequence from={0} durationInFrames={210}><Scene1 /></Sequence>
      <Sequence from={210} durationInFrames={210}><Scene2 /></Sequence>
      <Sequence from={420} durationInFrames={210}><Scene3 /></Sequence>
      <Sequence from={630} durationInFrames={210}><Scene4 /></Sequence>
      <Sequence from={840} durationInFrames={210}><Scene5 /></Sequence>
      <Sequence from={1050} durationInFrames={210}><Scene6 /></Sequence>
      <Sequence from={1260} durationInFrames={210}><Scene7 /></Sequence>
      <Sequence from={1470} durationInFrames={180}><Scene8 /></Sequence>
      <Sequence from={1650} durationInFrames={150}><Scene9 /></Sequence>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px 50px rgba(5,8,18,0.55)", pointerEvents: "none" }} />
      <Grain f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: whip * 0.15 }} />
      <Audio src={staticFile("lastman1/sound.wav")} />
    </AbsoluteFill>
  );
};
