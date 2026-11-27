// «Онода» — часть 2 (38 с – конец). Те же правила: камера всё время движется, переходы — пролётом камеры.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, random, Easing } from "remotion";
import { AnimeChar, INK, Look } from "../esport/anime";
import { Vignette, Grain, Dust, Rays, Burst, RedRage, clamp } from "../esport/sample";
import { ONODA_OLD, CMDR, SOLDIERS } from "./looks";
import { VOICE } from "./voice_ru";
import { F, W, H, FPS, LEAD, Key, Layer, Shot, Palm, JungleWall, Leaflet, EZ, PLAN1, P1_END } from "./part1";

export const FULL_FRAMES = Math.ceil((VOICE.dur + LEAD) * FPS) + 36;

const OLD_MATES: Look[] = SOLDIERS.map((l) => ({ ...l, top: "#7d744a", topSh: "#56502f", beard: true }));
const SUZUKI: Look = {
  skin: "#f2c8a2", skinSh: "#d49e7a", hair: "#2a1c14", hairSh: "#120b07", hairStyle: "messy",
  top: "#d8562a", topSh: "#9a3a1a", iris: "#3a2a20", pants: "#3a4a7a", pantsSh: "#202a4a", shoe: "#e8e0d0",
};
const CMDR_OLD: Look = { ...CMDR, hair: "#b8b4b0", hairSh: "#7a7672", top: "#4a4a58", topSh: "#30303c", uniform: false, pants: "#3a3a46" };
const VILL: Look[] = [
  { skin: "#b07850", skinSh: "#8a5a38", hair: "#1a1210", hairSh: "#080504", hairStyle: "short", top: "#e8e0c8", topSh: "#b8ae94", iris: "#2a1a10", adult: true },
  { skin: "#c08860", skinSh: "#9a6644", hair: "#1a1210", hairSh: "#080504", hairStyle: "long", top: "#c84a4a", topSh: "#8a2e2e", iris: "#2a1a10", adult: true },
  { skin: "#b88058", skinSh: "#946040", hair: "#221814", hairSh: "#0c0806", hairStyle: "messy", top: "#4a7ab0", topSh: "#2e5078", iris: "#2a1a10" },
];

const Rain: React.FC<{ f: number; n?: number; o?: number }> = ({ f, n = 120, o = 0.55 }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = (random("rx" + i) * 1300 - 100 + f * 6) % 1300 - 100;
      const y = (random("ry" + i) * 2200 + f * (60 + random("rv" + i) * 30)) % 2200 - 150;
      return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 70} stroke="#cfe6ff" strokeWidth={3} opacity={o} />;
    })}
  </svg>
);
const Fire: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={260} cy={-60} fill="#ffb050" opacity={0.25} style={{ filter: "blur(30px)" }} />
    {[0, 1, 2].map((i) => {
      const h = 160 - i * 40 + Math.sin(f / 2 + i) * 20;
      return <path key={i} d={`M ${-70 + i * 20},0 Q ${-40 + i * 10},${-h * 0.6} ${Math.sin(f / 3 + i) * 15},${-h} Q ${40 - i * 10},${-h * 0.6} ${70 - i * 20},0 Z`} fill={["#ff6a2a", "#ffa83a", "#fff0a0"][i]} stroke={i ? "none" : INK} strokeWidth={4} />;
    })}
    <rect x={-90} y={-6} width={180} height={22} rx={8} fill="#5a3a22" stroke={INK} strokeWidth={4} transform="rotate(12)" />
    <rect x={-90} y={-6} width={180} height={22} rx={8} fill="#6a4426" stroke={INK} strokeWidth={4} transform="rotate(-12)" />
  </g>
);
const Bubble: React.FC<{ x: number; y: number; k: number; children: React.ReactNode }> = ({ x, y, k, children }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${Easing.out(Easing.back(2))(Math.min(1, k))})`}>
      <circle r={190} fill="#fffaf0" stroke={INK} strokeWidth={8} />
      <circle cx={-150} cy={190} r={26} fill="#fffaf0" stroke={INK} strokeWidth={6} />
      <circle cx={-190} cy={250} r={14} fill="#fffaf0" stroke={INK} strokeWidth={5} />
      {children}
    </g>
  );
const Panda = () => (
  <g>
    <circle cx={-70} cy={-80} r={40} fill="#111" /><circle cx={70} cy={-80} r={40} fill="#111" />
    <circle r={110} fill="#fff" stroke={INK} strokeWidth={6} />
    <ellipse cx={-40} cy={-10} rx={26} ry={34} fill="#111" transform="rotate(-20 -40 -10)" /><ellipse cx={40} cy={-10} rx={26} ry={34} fill="#111" transform="rotate(20 40 -10)" />
    <circle cx={-36} cy={-12} r={8} fill="#fff" /><circle cx={36} cy={-12} r={8} fill="#fff" />
    <ellipse cx={0} cy={40} rx={18} ry={12} fill="#111" />
  </g>
);
const Yeti = () => (
  <g>
    <path d="M -110,120 C -130,-40 -80,-130 0,-130 C 80,-130 130,-40 110,120 Z" fill="#e8f0ff" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-100 + i * 22},${-60 + (i % 3) * 30} l 10,20`} stroke="#b0c0e0" strokeWidth={4} />)}
    <ellipse cx={0} cy={-30} rx={60} ry={44} fill="#8aa0c8" stroke={INK} strokeWidth={4} />
    <circle cx={-22} cy={-36} r={8} fill="#111" /><circle cx={22} cy={-36} r={8} fill="#111" />
    <path d="M -24,-4 Q 0,10 24,-4" stroke={INK} strokeWidth={5} fill="none" />
  </g>
);
const Photo: React.FC<{ x: number; y: number; s: number; tear?: number }> = ({ x, y, s, tear = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * tear * 70},${tear * 20 * (sd > 0 ? 1 : -0.4)}) rotate(${sd * tear * 14})`}>
        <clipPath id={"ph" + sd}><rect x={sd < 0 ? -110 : 0} y={-140} width={110} height={280} /></clipPath>
        <g clipPath={`url(#ph${sd})`}>
          <rect x={-100} y={-130} width={200} height={260} fill="#f4ecd6" stroke={INK} strokeWidth={5} />
          <rect x={-84} y={-114} width={168} height={180} fill="#c8b48a" />
          {[-50, 0, 50].map((px, i) => (
            <g key={i}>
              <circle cx={px} cy={-50 + (i === 1 ? 10 : 0)} r={20 - (i === 1 ? 5 : 0)} fill="#e8c09a" stroke={INK} strokeWidth={3} />
              <rect x={px - 24} y={-28 + (i === 1 ? 10 : 0)} width={48} height={80} rx={14} fill={["#6a4a3a", "#8a6a8a", "#4a5a6a"][i]} stroke={INK} strokeWidth={3} />
            </g>
          ))}
        </g>
      </g>
    ))}
  </g>
);
const Hands: React.FC<{ look: Look; spread?: number; y?: number }> = ({ look, spread = 320, y = 160 }) => (
  <g>
    <path d={`M ${-spread - 80},${y + 80} L ${-spread - 140},1300 L ${-spread + 120},1300 L ${-spread + 80},${y + 80} Z`} fill={look.top} stroke={INK} strokeWidth={6} />
    <path d={`M ${spread + 80},${y + 80} L ${spread + 140},1300 L ${spread - 120},1300 L ${spread - 80},${y + 80} Z`} fill={look.top} stroke={INK} strokeWidth={6} />
    <ellipse cx={-spread} cy={y} rx={80} ry={110} fill={look.skin} stroke={INK} strokeWidth={6} />
    <ellipse cx={spread} cy={y} rx={80} ry={110} fill={look.skin} stroke={INK} strokeWidth={6} />
  </g>
);
const night = "linear-gradient(180deg,#0c1a2a 0%,#0a2418 100%)";
const day = "linear-gradient(180deg,#2a6a3a,#0f2a18)";

// ---- 7. Годы: дождь, латают форму, рис ----
const S7: React.FC<{ f: number }> = ({ f }) => {
  const s0 = P1_END, lat = F(86) - s0, ris = F(88) - s0, end = F(92) - s0;
  if (f < lat - 4) {
    const keys: Key[] = [[0, 1400, -500, 0.8], [8, 200, -500, 0.8], [lat - 10, -200, -520, 0.9], [lat - 4, -150, -200, 2.6]];
    return (
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: night }} />
            <Layer c={c} k={0.5} blur={7}><JungleWall seed="rn" w={3000} y={-1400} dark={1} f={f} /></Layer>
            <Layer c={c}>
              <rect x={-3000} y={200} width={6000} height={2000} fill="#1a1410" />
              {[0, 1, 2, 3].map((i) => <AnimeChar key={i} id={"rn" + i} look={i ? OLD_MATES[i - 1] : ONODA_OLD} x={-450 + i * 300} y={-560 + (i % 2) * 40} s={0.5} t={f + i * 13} cap expr={i % 2 ? "sad" : "stern"} headDown={0.6} rim="#9ab8e0" blink={false} />)}
              <path d="M -900,-860 C -400,-1080 400,-1080 900,-860 C 400,-960 -400,-960 -900,-860 Z" fill="#1f6a3a" stroke={INK} strokeWidth={8} />
              <path d="M 0,-1000 L 0,-860" stroke="#0f3a20" strokeWidth={8} />
            </Layer>
            <Rain f={f} n={150} />
          </>
        )}
      </Shot>
    );
  }
  if (f < ris - 4) {
    const g = f - (lat - 4);
    const keys: Key[] = [[0, 0, 300, 2.2], [8, 0, 0, 1.0], [ris - lat - 6, 80, 40, 1.15], [ris - lat, 600, 40, 1.4]];
    const st = Math.sin(g / 4);
    return (
      <Shot f={g} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #3a5a40, #0f1f14)" }} />
            <Layer c={c}>
              <rect x={-420} y={-300} width={840} height={520} rx={40} fill={ONODA_OLD.top} stroke={INK} strokeWidth={8} />
              <path d="M -120,-180 L 140,-120 L 80,120 L -160,60 Z" fill="#5c5532" stroke={INK} strokeWidth={5} />
              {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-130 + i * 45} y1={-170 + i * 8} x2={-110 + i * 45} y2={-120 + i * 8} stroke="#e8dcc0" strokeWidth={6} />)}
              <path d={`M ${-10 + i0(g)},-120 Q 120,${-260 + st * 80} 260,${-120 + st * 120}`} stroke="#e8dcc0" strokeWidth={4} fill="none" />
              <line x1={240 + st * 30} y1={-140 + st * 100} x2={320 + st * 30} y2={-260 + st * 100} stroke="#d0d0d8" strokeWidth={8} strokeLinecap="round" />
              <ellipse cx={-360} cy={60} rx={110} ry={150} fill={ONODA_OLD.skin} stroke={INK} strokeWidth={6} />
              <ellipse cx={300 + st * 30} cy={-120 + st * 100} rx={90} ry={120} fill={ONODA_OLD.skin} stroke={INK} strokeWidth={6} />
            </Layer>
            <Rain f={g} n={60} o={0.3} />
          </>
        )}
      </Shot>
    );
  }
  const h = f - (ris - 4), e = end - (ris - 4);
  const keys: Key[] = [[0, -1400, -400, 0.6], [8, -700, -400, 0.6], [e - 8, 300, -420, 0.7], [e, 300, -2200, 0.7]];
  return (
    <Shot f={h} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#0e1430,#2a2a40 60%,#1a2410)" }} />
          <Layer c={c} k={0.4}><circle cx={600} cy={-1500} r={120} fill="#fff6d8" /><circle cx={600} cy={-1500} r={260} fill="#fff6d8" opacity={0.15} /></Layer>
          <Layer c={c}>
            <rect x={-3000} y={-200} width={6000} height={2200} fill="#3a4a24" />
            {Array.from({ length: 90 }).map((_, i) => {
              const x = -2400 + (i % 30) * 170, y = -150 + Math.floor(i / 30) * 300;
              return <path key={i} d={`M ${x},${y + 140} Q ${x - 20 + Math.sin(h / 10 + i) * 10},${y} ${x - 40},${y - 40} M ${x},${y + 140} Q ${x + 20},${y} ${x + 40},${y - 30}`} stroke="#c8c060" strokeWidth={10} fill="none" />;
            })}
            <g transform="translate(1100,-700)">
              <rect x={-200} y={-120} width={400} height={240} fill="#6a4a2a" stroke={INK} strokeWidth={8} />
              <path d="M -260,-120 L 0,-300 L 260,-120 Z" fill="#a08a4a" stroke={INK} strokeWidth={8} />
              <rect x={-60} y={-60} width={100} height={80} fill="#ffd36a" stroke={INK} strokeWidth={6} />
            </g>
            {[0, 1].map((i) => (
              <g key={i}>
                <AnimeChar id={"rs" + i} look={i ? OLD_MATES[0] : ONODA_OLD} x={-500 + i * 380 + h * 9} y={-720} s={0.42} t={h + i * 9} cap legs={{ ph: h + i * 6, mode: "walk" }} pose="phone" expr="determined" side={0.7} gaze={[0.8, 0]} rim="#9ab8e0" />
                <ellipse cx={-500 + i * 380 + h * 9} cy={-720 + 240} rx={90} ry={70} fill="#d8c8a0" stroke={INK} strokeWidth={6} />
              </g>
            ))}
          </Layer>
        </>
      )}
    </Shot>
  );
};
const i0 = (g: number) => Math.sin(g / 4) * 10;

// ---- 8. Газеты и письма, фото родных — «подделка» ----
const S8: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(92), rod = F(98) - s0, pod = F(102) - s0, end = F(103) - s0;
  if (f < rod - 10) {
    const keys: Key[] = [[0, 0, 1600, 0.6], [8, 0, 0, 0.6], [rod - 16, 0, 1400, 1.0], [rod - 10, 0, 2600, 1.6]];
    const px = -1400 + f * 34;
    return (
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#6aa0e0 0%,#cfe6ff 100%)" }} />
            <Layer c={c}>
              <g transform={`translate(${px},-300)`}>
                <path d="M -200,0 C -120,-40 160,-40 220,0 C 160,30 -120,30 -200,0 Z" fill="#7a8a70" stroke={INK} strokeWidth={6} />
                <path d="M -20,-10 L 60,-160 L 110,-150 L 60,-10 Z" fill="#6a7a60" stroke={INK} strokeWidth={5} />
              </g>
              {Array.from({ length: 16 }).map((_, i) => {
                const k = f - 12 - i * 1.2;
                if (k < 0) return null;
                const x0 = -1400 + (12 + i * 1.2) * 34;
                return (
                  <g key={i} transform={`translate(${x0 + (random("nx" + i) - 0.5) * k * 18},${-280 + k * 22}) rotate(${k * 6 + i * 30})`}>
                    {i % 2 ? (
                      <g><rect x={-90} y={-60} width={180} height={120} fill="#e8e4dc" stroke={INK} strokeWidth={5} />{[0, 1, 2, 3].map((q) => <line key={q} x1={-70} y1={-36 + q * 24} x2={70} y2={-36 + q * 24} stroke="#6a6a6a" strokeWidth={6} />)}</g>
                    ) : (
                      <g><rect x={-70} y={-46} width={140} height={92} fill="#f4ecd6" stroke={INK} strokeWidth={5} /><path d="M -70,-46 L 0,10 L 70,-46" stroke={INK} strokeWidth={4} fill="none" /></g>
                    )}
                  </g>
                );
              })}
              <JungleWall seed="top2" w={4000} y={1800} f={f} />
            </Layer>
          </>
        )}
      </Shot>
    );
  }
  const g = f - (rod - 10), pd = pod - (rod - 10), e = end - (rod - 10);
  const keys: Key[] = [[0, 0, -600, 2.0], [8, 0, 0, 1.0], [pd - 4, 0, -40, 1.15], [pd + 6, 0, 0, 0.95], [e, 0, 0, 1.0]];
  const tear = interpolate(g, [pd - 2, pd + 8], [0, 1], { ...clamp, easing: EZ });
  return (
    <AbsoluteFill>
      <Shot f={g} keys={keys} shake={[pd]}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: day }} />
            <Layer c={c} k={0.4} blur={9}><JungleWall seed="ph" w={2400} y={-1100} f={g} /></Layer>
            <RedRage f={g} k={tear * 0.7} />
            <Layer c={c}>
              <Photo x={0} y={-100} s={2.4} tear={tear} />
              <Hands look={ONODA_OLD} spread={300 + tear * 160} y={120} />
            </Layer>
          </>
        )}
      </Shot>
      <Burst f={g - pd} x={540} y={860} color="#ffc0b0" size={1.1} />
    </AbsoluteFill>
  );
};

// ---- 9. Отряд тает: один уходит, второй погибает, местные боятся ----
const S9: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(103), vt = F(108) - s0, mest = F(112) - s0, gib = F(118) - s0, end = F(120) - s0;
  if (f < vt - 4) {
    const keys: Key[] = [[0, 0, 1600, 0.6], [8, 0, -500, 0.6], [24, 450, -560, 0.95], [vt - 10, 700, -700, 1.0], [vt - 4, 2200, -600, 1.0]];
    const walk = interpolate(f, [14, vt], [0, 1], clamp);
    return (
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#8aa0a0,#2a4a3a)" }} />
            <Layer c={c} k={0.5} blur={6}><JungleWall seed="fg" w={3000} y={-1400} f={f} /></Layer>
            <Layer c={c}>
              <rect x={-3000} y={200} width={6000} height={2000} fill="#3a2a1a" />
              <AnimeChar id="g0" look={ONODA_OLD} x={-420} y={-560} s={0.5} t={f} cap rifle pose="rifle" legs={{ ph: 0, mode: "stand" }} expr="stern" side={0.6} gaze={[0.8, 0]} />
              <AnimeChar id="g1" look={OLD_MATES[1]} x={-160} y={-560} s={0.5} t={f + 5} cap legs={{ ph: 0, mode: "stand" }} expr="sad" side={0.6} gaze={[0.8, 0]} />
              <AnimeChar id="g2" look={OLD_MATES[2]} x={80} y={-560} s={0.5} t={f + 9} cap legs={{ ph: 0, mode: "stand" }} expr="sad" side={0.6} gaze={[0.8, 0]} />
              <g opacity={1 - walk * 0.6}>
                <AnimeChar id="g3" look={OLD_MATES[0]} x={450 + walk * 500} y={-560 - walk * 120} s={0.5 - walk * 0.12} t={f + 3} cap legs={{ ph: f, mode: "walk" }} expr="sad" side={0.7} gaze={[0.9, 0]} headDown={0.6} />
              </g>
            </Layer>
            <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(220,230,230,0) 40%, rgba(220,230,230,0.7) 100%)" }} />
          </>
        )}
      </Shot>
    );
  }
  if (f < mest - 4) {
    const g = f - (vt - 4);
    const keys: Key[] = [[0, -1600, -500, 0.9], [8, 0, -500, 0.9], [mest - vt - 6, 60, -520, 1.05], [mest - vt, -1800, -520, 1.05]];
    const shots = [8, 14, 19, 26, 31];
    const fall = interpolate(g, [27, 40], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return (
      <Shot f={g} keys={keys} shake={shots}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: night }} />
            <Layer c={c} k={0.5} blur={6}><JungleWall seed="ff" w={3000} y={-1400} dark={1} f={g} /></Layer>
            <Layer c={c}>
              <rect x={-3000} y={200} width={6000} height={2000} fill="#141008" />
              <g transform={`translate(0,${fall * 700}) rotate(${fall * 8})`}>
                <AnimeChar id="v2" look={OLD_MATES[1]} x={0} y={-640} s={0.62} t={g} cap expr={g > 18 ? "hurt" : "shocked"} legs={{ ph: 0, mode: "stand" }} rim="#ffd0a0" />
              </g>
              <JungleWall seed="bush" w={2400} y={-60} dark={1} f={g} />
              {shots.map((s, i) => g >= s && g < s + 4 ? <polygon key={i} points="0,-60 18,-18 60,0 18,18 0,60 -18,18 -60,0 -18,-18" transform={`translate(${-700 + i * 360},${-200 + (i % 2) * 80}) scale(2)`} fill="#ffe07a" /> : null)}
            </Layer>
            {shots.map((s, i) => <AbsoluteFill key={i} style={{ background: "#ffd080", opacity: interpolate(g - s, [0, 1, 4], [0, 0.35, 0], clamp) }} />)}
          </>
        )}
      </Shot>
    );
  }
  const h = f - (mest - 4), gb = gib - (mest - 4), e = end - (mest - 4);
  const keys: Key[] = [[0, 1600, -500, 0.75], [8, -300, -480, 0.75], [gb - 6, 300, -480, 0.85], [gb + 6, 600, -200, 1.2], [e - 6, 640, -220, 1.3], [e, 640, -2400, 1.3]];
  return (
    <Shot f={h} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#c8a070,#5a4a3a)" }} />
          <Layer c={c} k={0.5} blur={5}>{[0, 1, 2, 3].map((i) => <Palm key={i} x={-1500 + i * 900} y={-300} h={900} f={h} />)}</Layer>
          <Layer c={c}>
            <rect x={-3000} y={200} width={6000} height={2000} fill="#8a6a44" />
            <g transform="translate(-200,-700)">
              <rect x={-300} y={-150} width={600} height={300} fill="#7a5a3a" stroke={INK} strokeWidth={8} />
              <path d="M -360,-150 L 0,-380 L 360,-150 Z" fill="#b8a060" stroke={INK} strokeWidth={8} />
            </g>
            {VILL.map((v, i) => <AnimeChar key={i} id={"vl" + i} look={v} x={-560 + i * 300} y={-700 + (i === 2 ? 60 : 0)} s={0.42 - (i === 2 ? 0.08 : 0)} t={h + i * 7} legs={{ ph: 0, mode: "stand" }} expr={i === 1 ? "shocked" : "hurt"} gaze={[0.8, 0]} side={0.5} pose={i === 0 ? "crossed" : "down"} />)}
            {/* брошенная шляпа и дым — след стычки */}
            <g transform="translate(640,80)">
              <ellipse cx={0} cy={0} rx={150} ry={40} fill="#c8a050" stroke={INK} strokeWidth={6} />
              <path d="M -70,0 C -60,-80 60,-80 70,0 Z" fill="#d8b060" stroke={INK} strokeWidth={6} />
            </g>
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={700 + Math.sin(h / 12 + i) * 40} cy={-100 - ((h * 3 + i * 120) % 500)} r={60 + i * 20} fill="#6a6058" opacity={0.35} />)}
          </Layer>
        </>
      )}
    </Shot>
  );
};

// ---- 10. 1972: погиб последний друг. Один у костра. Пятьдесят. Ждёт приказа ----
const S10: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(120), pog = F(123) - s0, emu = F(127) - s0, odin = F(129) - s0, zhd = F(131) - s0, end = F(136) - s0;
  const keys: Key[] = [[0, 0, 1800, 0.7], [8, 0, -500, 0.7], [pog + 4, 0, -520, 0.75], [emu - 4, -60, -620, 1.0], [emu + 8, -220, -760, 1.6], [odin + 4, -100, -600, 1.0], [zhd, 0, -500, 0.6], [end - 6, 0, -800, 0.28], [end, 0, -3000, 0.3]];
  const gone = interpolate(f, [pog + 2, pog + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot f={f} keys={keys} shake={[pog + 2]}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: night }} />
            <Layer c={c} k={0.3}>{Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={-1500 + random("st" + i) * 3000} cy={-2000 + random("sy" + i) * 900} r={3} fill="#fff" opacity={0.7} />)}</Layer>
            <Layer c={c} k={0.6} blur={5}><JungleWall seed="cf" w={4000} y={-1500} dark={1} f={f} /></Layer>
            <Layer c={c}>
              <rect x={-4000} y={150} width={8000} height={3000} fill="#120e08" />
              <JungleWall seed="cf2" w={7000} y={-400} dark={1} f={f} />
              <AnimeChar id="old" look={ONODA_OLD} x={-220} y={-620} s={0.55} t={f} cap rifle pose="rifle" legs={{ ph: 0, mode: "stand" }} expr={f > pog ? "sad" : "stern"} side={0.5} gaze={[f > pog ? 0.9 : 0.6, 0.2]} rim="#ffb070" />
              <g opacity={1 - gone}><AnimeChar id="koz" look={OLD_MATES[2]} x={260} y={-620} s={0.52} t={f + 9} cap legs={{ ph: 0, mode: "stand" }} expr="stern" side={-0.5} gaze={[-0.6, 0.2]} rim="#ffb070" /></g>
              <Fire x={20} y={180} s={1} f={f} />
            </Layer>
            <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f - pog - 2, [0, 1, 5], [0, 0.7, 0], clamp) }} />
          </>
        )}
      </Shot>
      <Dust f={f} color="#ffc890" n={30} />
    </AbsoluteFill>
  );
};

// ---- 11. 1974: путешественник; панда и снежный человек ----
const S11: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(136), ne = F(143) - s0, dr = F(149) - s0, lt = F(156) - s0, pn = F(158) - s0, sn = F(160) - s0, end = F(162) - s0;
  if (f < dr - 4) {
    const keys: Key[] = [[0, 0, -2200, 0.5], [10, 0, -600, 0.5], [ne, 0, -600, 0.55], [ne + 10, 0, -760, 0.95], [dr - 10, 0, -760, 1.0], [dr - 4, 1800, -760, 1.0]];
    const army = interpolate(f, [ne - 10, ne - 2, ne + 6], [0, 1, 0], clamp);
    return (
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: day }} />
            <Layer c={c} k={0.4} blur={8}><JungleWall seed="sz" w={3000} y={-1600} f={f} /></Layer>
            <Rays f={f} color="#f0ffd0" o={0.3} />
            <Layer c={c}>
              <rect x={-3000} y={300} width={6000} height={2000} fill="#4a3a22" />
              <g opacity={army}>{[0, 1, 2, 3, 4].map((i) => <AnimeChar key={i} id={"ar" + i} look={{ ...SOLDIERS[i % 3], top: "#3a4a3a", topSh: "#253025", pants: "#3a4a3a" }} x={-600 + i * 300} y={-700} s={0.36} t={f} cap legs={{ ph: f + i * 5, mode: "walk" }} expr="stern" />)}</g>
              <g opacity={1 - army}>
                <AnimeChar id="suz" look={SUZUKI} x={0} y={-720 + interpolate(f, [0, dr], [0, 80], clamp)} s={0.5 + interpolate(f, [0, dr], [0, 0.12], clamp)} t={f} legs={{ ph: f, mode: "walk" }} expr="smile" gaze={[Math.sin(f / 15) * 0.8, -0.2]}>
                  <path d="M -170,180 L -150,700 M 170,180 L 150,700" stroke="#3a2a1a" strokeWidth={26} />
                </AnimeChar>
              </g>
              <JungleWall seed="sz2" w={2600} y={500} f={f} />
            </Layer>
          </>
        )}
      </Shot>
    );
  }
  const g = f - (dr - 4);
  const L = lt - (dr - 4), P = pn - (dr - 4), S = sn - (dr - 4), E = end - (dr - 4);
  const keys: Key[] = [[0, -1600, -500, 0.75], [8, 0, -520, 0.75], [L - 6, 0, -560, 0.8], [L + 4, 180, -760, 0.85], [E - 6, 180, -760, 0.9], [E, 180, -2800, 0.8]];
  return (
    <Shot f={g} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#f2c890,#c87850)" }} />
          <Layer c={c} k={0.5} blur={8}>
            <rect x={-2000} y={-1600} width={4000} height={1400} fill="#8a5a3a" />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-1400 + i * 700} y={-1400} width={300} height={500} fill="#ffe0a0" stroke={INK} strokeWidth={8} />)}
          </Layer>
          <Layer c={c}>
            <rect x={-3000} y={150} width={6000} height={2000} fill="#6a3a22" />
            <AnimeChar id="fr1" look={{ ...VILL[2], skin: "#f0c8a0", skinSh: "#d0a080", top: "#4a8a5a" }} x={-500} y={-560} s={0.45} t={g + 5} expr="laugh" pose="belly" />
            <AnimeChar id="fr2" look={{ ...VILL[1], skin: "#f2cca8", skinSh: "#d2a684", top: "#8a5aa0" }} x={500} y={-560} s={0.45} t={g + 11} expr="laugh" pose="belly" mirror />
            <AnimeChar id="suz" look={SUZUKI} x={0} y={-640} s={0.55} t={g} expr="joy" pose={g > L ? "fist" : "down"} talk={g < L} />
            <rect x={-900} y={-100} width={1800} height={60} fill="#8a5a34" stroke={INK} strokeWidth={6} />
            <Bubble x={-260} y={-1330} k={(g - L) / 8}><AnimeChar id="bo" look={ONODA_OLD} x={0} y={-30} s={0.42} t={g} cap expr="stern" /></Bubble>
            <Bubble x={260} y={-1500} k={(g - P) / 8}><Panda /></Bubble>
            <Bubble x={520} y={-1100} k={(g - S) / 8}><Yeti /></Bubble>
          </Layer>
        </>
      )}
    </Shot>
  );
};

// ---- 12. Находит Оноду. «Сдамся, только если прикажет командир» ----
const S12: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(162), nah = F(164) - s0, no = F(166) - s0, sd = F(169) - s0, end = F(175) - s0;
  const keys: Key[] = [[0, 0, 1800, 0.8], [8, 300, -520, 0.85], [nah + 2, 300, -520, 0.9], [nah + 10, -380, -620, 1.15], [no - 2, -360, -640, 1.2], [no + 8, 330, -620, 1.2], [sd + 6, 360, -680, 1.4], [end - 10, 0, -560, 0.8], [end, -1800, -560, 0.8]];
  const appear = interpolate(f, [nah - 4, nah + 6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: night }} />
            <Layer c={c} k={0.5} blur={6}><JungleWall seed="tn" w={3000} y={-1500} dark={1} f={f} /></Layer>
            <Layer c={c}>
              <rect x={-3000} y={150} width={6000} height={2000} fill="#141008" />
              <path d="M 500,150 L 760,-320 L 1020,150 Z" fill="#d8a040" stroke={INK} strokeWidth={8} />
              <Fire x={0} y={160} s={0.9} f={f} />
              <AnimeChar id="suz" look={SUZUKI} x={330} y={-640} s={0.5} t={f} legs={{ ph: 0, mode: "stand" }} expr={f > nah ? "shocked" : "smile"} side={-0.6} gaze={[-0.9, 0]} rim="#ffb070" />
              <g opacity={appear} transform={`translate(${(1 - appear) * -200},0)`}>
                <AnimeChar id="old" look={ONODA_OLD} x={-380} y={-640} s={0.52} t={f} cap rifle pose="rifle" legs={{ ph: 0, mode: "stand" }} expr="stern" side={0.6} gaze={[0.9, 0]} rim="#ffb070" talk={f > sd && f < end - 14} tilt={f > sd ? Math.sin(f / 4) * 4 : 0} />
              </g>
              <JungleWall seed="tn2" w={2600} y={420} dark={1} f={f} />
            </Layer>
          </>
        )}
      </Shot>
      <Burst f={f - nah} x={360} y={700} size={0.9} color="#ffd8a0" />
    </AbsoluteFill>
  );
};

// ---- 13. Пожилой продавец книг = бывший командир, читает приказ ----
const S13: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(175), knig = F(182) - s0, eto = F(184) - s0, chit = F(190) - s0, end = F(195) - s0;
  if (f < eto - 4) {
    // самолёт садится, потом книжная лавка
    if (f < knig - 6) {
      const keys: Key[] = [[0, 1800, -400, 0.6], [8, 0, -400, 0.6], [knig - 12, -300, -300, 0.7], [knig - 6, -300, 1600, 0.8]];
      const px = 900 - f * 22, py = -700 + f * 7;
      return (
        <Shot f={f} keys={keys}>
          {(c) => (
            <>
              <AbsoluteFill style={{ background: "linear-gradient(180deg,#6aa0e0,#f2d6a0)" }} />
              <Layer c={c} k={0.5}><rect x={-4000} y={0} width={8000} height={2000} fill="#3a8ac0" />{[0, 1, 2].map((i) => <Palm key={i} x={-800 + i * 600} y={0} h={500} f={f} />)}</Layer>
              <Layer c={c}>
                <g transform={`translate(${px},${py}) scale(1.4) rotate(-8)`}>
                  <path d="M -200,0 C -120,-40 160,-40 220,0 C 160,30 -120,30 -200,0 Z" fill="#e8e8e8" stroke={INK} strokeWidth={6} />
                  <path d="M -20,-10 L 60,-160 L 110,-150 L 60,-10 Z" fill="#c8c8d0" stroke={INK} strokeWidth={5} />
                  <circle cx={228} cy={0} r={14} fill="#333" />
                  {[0, 1, 2].map((i) => <circle key={i} cx={-60 + i * 50} cy={-6} r={10} fill="#6ac0ff" />)}
                </g>
              </Layer>
            </>
          )}
        </Shot>
      );
    }
    const g = f - (knig - 6);
    const keys: Key[] = [[0, 0, -2000, 0.9], [8, 0, -620, 0.9], [eto - knig - 2, 0, -660, 1.05]];
    return (
      <Shot f={g} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "#3a2a1e" }} />
            <Layer c={c} k={0.6} blur={6}>
              {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 14 }).map((__, i) => <rect key={r + "-" + i} x={-1400 + i * 200} y={-1700 + r * 260} width={170} height={220} fill={["#a04a3a", "#3a6a8a", "#c8a04a", "#4a7a4a"][(i + r) % 4]} stroke={INK} strokeWidth={5} />))}
            </Layer>
            <Layer c={c}>
              <AnimeChar id="co" look={CMDR_OLD} x={0} y={-640} s={0.6} t={g} expr="neutral" pose="paper" gaze={[0, 0.6]} rim="#ffe0b0">
                <rect x={-130} y={380} width={260} height={180} fill="#a04a3a" stroke={INK} strokeWidth={6} />
              </AnimeChar>
              <rect x={-900} y={0} width={1800} height={600} fill="#5a3a22" stroke={INK} strokeWidth={8} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={-500 + i * 260} y={-90 - i * 10} width={200} height={90 + i * 10} fill={["#3a6a8a", "#c8a04a", "#4a7a4a", "#a04a3a"][i]} stroke={INK} strokeWidth={5} />)}
            </Layer>
          </>
        )}
      </Shot>
    );
  }
  const g = f - (eto - 4), CH = chit - (eto - 4), E = end - (eto - 4);
  const keys: Key[] = [[0, 0, -620, 1.4], [6, -330, -700, 1.4], [CH - 8, -330, -700, 1.35], [CH + 2, 0, -520, 0.85], [E - 6, 330, -600, 1.2], [E, 330, -600, 1.25]];
  const morph = interpolate(g, [10, 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Shot f={g} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#5a8a60,#1f3a24)" }} />
            <Layer c={c} k={0.5} blur={7}><JungleWall seed="rd" w={3000} y={-1500} f={g} /></Layer>
            <Rays f={g} color="#fff0c0" o={0.3} />
            <Layer c={c}>
              <rect x={-3000} y={200} width={6000} height={2000} fill="#4a3a22" />
              <g opacity={1 - morph}><AnimeChar id="cy" look={CMDR} x={-330} y={-640} s={0.55} t={g} cap legs={{ ph: 0, mode: "stand" }} expr="stern" side={0.6} gaze={[0.8, 0]} rim="#fff0c0" /></g>
              <g opacity={morph}><AnimeChar id="co2" look={CMDR_OLD} x={-330} y={-640} s={0.55} t={g} legs={{ ph: 0, mode: "stand" }} expr="stern" side={0.6} gaze={[0.8, 0.3]} pose={g > CH ? "paper" : "down"} talk={g > CH + 4} rim="#fff0c0">
                {g > CH ? <rect x={-120} y={360} width={240} height={160} fill="#f4ecd6" stroke={INK} strokeWidth={5} /> : null}
              </AnimeChar></g>
              <AnimeChar id="old" look={ONODA_OLD} x={330} y={-640} s={0.55} t={g} cap legs={{ ph: 0, mode: "stand" }} expr="stern" side={-0.6} gaze={[-0.8, 0]} pose={g > CH ? "salute" : "rifle"} rifle={g <= CH} rim="#fff0c0" />
            </Layer>
          </>
        )}
      </Shot>
      <Burst f={g - 12} x={330} y={700} size={1.0} color="#fff0c0" />
    </AbsoluteFill>
  );
};

// ---- 14. Сдаёт винтовку — в идеальном порядке ----
const S14: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(195), id = F(203) - s0, end = F(205) - s0;
  const keys: Key[] = [[0, 0, -1600, 1.2], [8, 0, 0, 1.0], [id - 4, 0, 0, 1.1], [id + 6, 120, 40, 1.5], [end - 6, 120, 40, 1.55], [end, 120, 1800, 1.4]];
  const down = interpolate(f, [6, 34], [0, 1], { ...clamp, easing: EZ });
  return (
    <AbsoluteFill>
      <Shot f={f} keys={keys}>
        {(c) => (
          <>
            <AbsoluteFill style={{ background: "linear-gradient(180deg,#4a6a40,#2a3a20)" }} />
            <Layer c={c}>
              <rect x={-2000} y={200} width={4000} height={2000} fill="#5a4a2a" />
              <g transform={`translate(0,${-200 + down * 340}) rotate(${-8 + down * 8})`}>
                <rect x={-620} y={-22} width={1100} height={44} rx={12} fill="#3a2a1c" stroke={INK} strokeWidth={6} />
                <path d="M -620,-22 L -820,-30 L -850,70 L -620,30 Z" fill="#7a5030" stroke={INK} strokeWidth={6} />
                <rect x={-300} y={-34} width={420} height={64} rx={14} fill="#8a5a36" stroke={INK} strokeWidth={6} />
                <rect x={100} y={-26} width={40} height={60} fill={INK} />
                <path d="M -560,-12 L 460,-12" stroke="#fff" strokeWidth={6} opacity={0.5} />
              </g>
              <Hands look={ONODA_OLD} spread={260 + Math.max(0, down - 0.75) * 2400} y={-180 + down * 300} />
            </Layer>
          </>
        )}
      </Shot>
      {f >= id ? [0, 1, 2].map((i) => {
        const k = f - id - i * 5;
        const o = interpolate(k, [0, 4, 12], [0, 1, 0], clamp);
        return <svg key={i} width={W} height={H} style={{ position: "absolute" }}><polygon points="0,-70 14,-14 70,0 14,14 0,70 -14,14 -70,0 -14,-14" transform={`translate(${300 + i * 260},${1080 - i * 20}) scale(${0.6 + o})`} fill="#fff" opacity={o} /></svg>;
      }) : null}
    </AbsoluteFill>
  );
};

// ---- 15. Мир, которого он не узнал → листовка (петля к началу) ----
const City: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-4000} y={-3000} width={8000} height={3000} fill="#120c2a" />
    {Array.from({ length: 18 }).map((_, i) => {
      const x = -2600 + i * 300, h = 900 + random("bh" + i) * 1200;
      return (
        <g key={i}>
          <rect x={x} y={-h} width={260} height={h} fill={i % 2 ? "#1e1a3a" : "#2a2248"} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={x + 30 + (k % 3) * 70} y={-h + 50 + Math.floor(k / 3) * 120} width={40} height={60} fill="#ffd36a" opacity={random("wl" + i + k) > 0.4 ? 0.9 : 0.15} />)}
          <rect x={x + 20} y={-h - 80 + (i % 3) * 200} width={60} height={260} rx={10} fill={["#ff4fa0", "#4fe8ff", "#ffd34a"][i % 3]} opacity={0.85} style={{ filter: "blur(2px)" }} />
        </g>
      );
    })}
    <rect x={-4000} y={0} width={8000} height={2000} fill="#2a2638" />
    {[0, 1, 2, 3].map((i) => {
      const x = ((i * 900 + f * (i % 2 ? 30 : -34)) % 6000 + 6000) % 6000 - 3000;
      return (
        <g key={i} transform={`translate(${x},${180 + (i % 2) * 220})`}>
          <path d="M -220,0 L -180,-90 L 140,-90 L 200,0 L 240,20 L 240,70 L -240,70 L -240,20 Z" fill={["#d84a3a", "#3a8ad8", "#e8c040", "#8a4ad8"][i]} stroke={INK} strokeWidth={6} />
          <circle cx={-140} cy={70} r={40} fill="#1a1a1a" stroke={INK} strokeWidth={5} /><circle cx={140} cy={70} r={40} fill="#1a1a1a" stroke={INK} strokeWidth={5} />
          <circle cx={i % 2 ? 230 : -230} cy={30} r={20} fill="#fff6c0" />
        </g>
      );
    })}
  </g>
);
const S15: React.FC<{ f: number }> = ({ f }) => {
  const s0 = F(205), dv = F(212) - s0, av = F(223) - s0, end = FULL_FRAMES - s0;
  const keys: Key[] = [[0, 0, -2400, 1.0], [10, 0, -700, 0.6], [dv - 4, 0, -700, 0.65], [dv + 30, 0, -800, 0.4], [av - 6, 0, -800, 0.38], [av + 10, 0, -1300, 1.1], [end, 0, -1340, 1.25]];
  const look = Math.sin(f / 18);
  return (
    <Shot f={f} keys={keys}>
      {(c) => (
        <>
          <AbsoluteFill style={{ background: "#120c2a" }} />
          <Layer c={c} k={0.7} blur={3}><City f={f} /></Layer>
          <Layer c={c}>
            {Array.from({ length: 8 }).map((_, i) => <AnimeChar key={i} id={"cw" + i} look={{ ...VILL[i % 3], skin: "#f0c8a0", skinSh: "#d0a080", top: ["#c84a8a", "#4a8ac8", "#e8c040", "#3a3a3a"][i % 4], pants: "#2a2a3a" }} x={-1500 + ((i * 420 + f * (i % 2 ? 6 : -6)) % 3000 + 3000) % 3000} y={-640} s={0.4} t={f + i * 5} legs={{ ph: f + i * 4, mode: "walk" }} expr="neutral" side={i % 2 ? 0.8 : -0.8} gaze={[i % 2 ? 0.9 : -0.9, 0]} />)}
            <AnimeChar id="old" look={ONODA_OLD} x={0} y={-700} s={0.5} t={f} cap legs={{ ph: 0, mode: "stand" }} expr={f > dv ? "sad" : "shocked"} gaze={[look, -0.2]} side={look * 0.5} rim="#ffd0f0" />
            {f > av - 20 ? <Leaflet x={Math.sin(f / 8) * 120} y={-1600 + (f - av + 20) * 8} s={1.4} a={Math.sin(f / 7) * 30} /> : null}
          </Layer>
          <Dust f={f} color="#ffd0f0" n={25} />
        </>
      )}
    </Shot>
  );
};

// ---------- весь ролик ----------
export const PLAN: [number, React.FC<{ f: number }>][] = [
  ...PLAN1,
  [P1_END, S7], [F(92), S8], [F(103), S9], [F(120), S10], [F(136), S11], [F(162), S12], [F(175), S13], [F(195), S14], [F(205), S15],
];
export const OnodaFull: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0;
  for (let j = 0; j < PLAN.length; j++) if (f >= PLAN[j][0]) i = j;
  const S = PLAN[i][1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <S f={f - PLAN[i][0]} />
      <Vignette k={0.7} />
      <Grain f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [FULL_FRAMES - 10, FULL_FRAMES], [0, 1], clamp) }} />
      <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile("onoda/voice_ru.mp3")} /></Sequence>
    </AbsoluteFill>
  );
};
