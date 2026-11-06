// Часть 2/8: силу не выключить — ломается всё, к чему прикасаешься.
import React from "react";
import { Bay, Bean, Bowl, Bubble, Cam, Car, CerealBox, DoorHandle, Frame, GY, Glow, Gull, HERO2D, HS, INK, LOOKS, MilkCarton, MilkSpray, Phone, Puff, Room, Shards, Sink, Skeleton, SoundRings, SpeedLines, TV, Town, Voice, YEL, atWord, camLerp, floatPose, ip, makePart, shake, walkPose } from "./kit";
import { VOICE } from "./voices/p2";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const careful = (f: number) => ({ armL: [60 + Math.sin(f * 0.2) * 4, 50] as [number, number], armR: [60 + Math.sin(f * 0.2 + 1) * 4, 50] as [number, number], tilt: Math.sin(f * 0.1) * 4 });

export const P2 = makePart(V, [
  { at: "", s: (g, f, len) => <Room cam={camLerp(g, len, C(900, 560, 1.0), C(1000, 600, 1.3))} f={f}>
    <Hero x={1100} y={GY} f={f} expr="shock" open={0.3} sweat pose={careful(f)} /></Room> },
  { at: "can", s: (g, f, len) => <Room cam={camLerp(g, len, C(1100, GY - 230, 2.6), C(1100, GY - 240, 2.9))} f={f}>
    <Hero x={1100} y={GY} f={f} expr="shock" open={0.5} sweat pose={{ armL: [140 + Math.sin(f * 0.9) * 5, 30], armR: [140 + Math.sin(f * 0.9 + 1) * 5, 30] }} />
    <Glow x={980} y={GY - 300} r={90} g="gY" o={0.5 + 0.3 * Math.sin(f * 0.6)} /><Glow x={1220} y={GY - 300} r={90} g="gY" o={0.5 + 0.3 * Math.sin(f * 0.6 + 1)} /></Room> },
  // дверная ручка отрывается
  { at: "grab", s: (g, f, len) => {
    const off = since("off", "grab", g) > 0;
    return <Room cam={camLerp(g, len, C(1950, GY - 250, 1.9), C(1990, GY - 250, 2.2))} f={f} handle={!off}>
      <Hero x={1943 - (off ? 30 : 0)} y={GY} f={f} expr={off ? "shock" : "neutral"} open={off ? 0.8 : 0} sweat={off}
        pose={{ armR: [off ? 70 : 90, off ? 40 : 0], armL: [15, 10], lean: off ? 6 : 0 }}
        holdR={off ? { node: <DoorHandle x={0} y={0} rot={-90} />, k: 1.5 } : undefined} />
    </Room>;
  } },
  // раковина трескается
  { at: "lean", s: (g, f, len) => {
    const c = ip(since("cracks", "lean", g), [0, 6], [0, 1]);
    return <Room cam={{ ...camLerp(g, len, C(980, GY - 280, 1.9), C(990, GY - 260, 2.1)), ...shake(f, c > 0 && c < 1 ? 6 : 0) }} f={f} kind="bath" win={false}>
      <Sink x={900} crack={c} />
      <Hero x={1100} y={GY} f={f} expr={c > 0 ? "shock" : "talk"} open={c > 0 ? 0.8 : 0.2} sweat={c > 0} pose={{ armL: [95, 0], armR: [15, 10], lean: c > 0 ? 4 : -8 }} />
      {c > 0 ? <Shards x={900} y={GY - 230} p={since("cracks", "lean", g) * 0.5} /> : null}
    </Room>;
  } },
  { at: "Every", s: (g, f, len) => <Room cam={camLerp(g, len, C(1000, GY - 280, 1.8), C(1100, GY - 300, 2.1))} f={f}>
    <Hero x={ip(g, [0, len], [900, 1200])} y={GY} f={f} expr="neutral" pose={{ ...walkPose(f, 0.12), armL: [20, -80], armR: [20, -80], tilt: 0 }} />
    <Bubble x={ip(g, [0, len], [900, 1200])} y={GY - 168} r={48} f={f} /></Room> },
  { at: "strength", s: (g, f, len) => <Room cam={camLerp(g, len, C(1100, GY - 300, 2.3), C(1100, GY - 300, 2.6))} f={f}>
    <Hero x={1100} y={GY} f={f} expr="sad" pose={{ armL: [150, 30], armR: [150, 30] }} />
    {[0, 1].map((k) => <Glow key={k} x={1100 + (k ? 120 : -120)} y={GY - 420} r={100} g="gY" o={0.7 + 0.3 * Math.sin(f * 0.4)} />)}
    {Array.from({ length: 8 }, (_, i) => { const a = i * 0.8 + f * 0.05; return <path key={i} transform={`translate(${1100 + Math.cos(a) * 260} ${GY - 300 + Math.sin(a) * 200})`} d="M 6 -26 L -12 2 L 0 2 L -6 26 L 14 -4 L 2 -4 Z" fill={YEL} stroke={INK} strokeWidth={3} />; })}
  </Room> },
  // завтрак
  { at: "breakfast", s: (g, f, len) => <Room cam={camLerp(g, len, C(700, 560, 1.0), C(900, 600, 1.15))} f={f} kind="kitchen" win={false}>
    <Bowl x={1170} y={GY - 250} /><CerealBox x={1300} y={GY - 250} /><MilkCarton x={1060} y={GY - 250} />
    <Hero x={850} y={GY} f={f} expr="grin" pose={walkPose(f, 0.25)} /></Room> },
  { at: "with", s: (g, f, len) => <Room cam={camLerp(g, len, C(1120, GY - 330, 2.0), C(1140, GY - 330, 2.2))} f={f} kind="kitchen" win={false}>
    <Bowl x={1170} y={GY - 250} full={ip(g, [4, 12], [0, 1])} /><MilkCarton x={1060} y={GY - 250} />
    {[0, 1, 2, 3].map((k) => <g key={k} opacity={0.2 + k * 0.25}><Hero x={900 + k * 20} y={GY} f={f} expr="laugh" open={0.5} shadow={false} pose={{ armR: [120, -10], armL: [20, 10], lean: -10 }} holdR={{ node: <CerealBox x={0} y={0} rot={100} />, k: 1.4 }} /></g>)}
    <SpeedLines f={f} o={0.4} /></Room> },
  { at: "Milk", s: (g, f, len) => <Room cam={{ ...camLerp(g, len, C(1200, 600, 1.2), C(1300, 620, 1.05)), ...shake(f, g < 10 ? 5 : 0) }} f={f} kind="kitchen" win={false}>
    <Bowl x={1170} y={GY - 250} full={1} />
    <Hero x={900} y={GY} f={f} expr="shock" open={0.9} sweat pose={{ armR: [100, 0], armL: [30, 20] }} holdR={{ node: <MilkCarton x={0} y={0} rot={-100} />, k: 1.4 }} />
    <MilkSpray x={1080} y={GY - 330} p={g} />
  </Room> },
  { at: "To", n: 2, s: (g, f, len) => {
    const a = (g % 24) < 12;
    return <Room cam={camLerp(g, len, C(1100, 600, 1.05), C(1100, 600, 1.15))} f={f} kind="kitchen" win={false}>
      <Bean x={1640} y={GY} s={HS} look={LOOKS[6]} f={f} expr="shock" open={0.8} flip pose={{ armL: [40, 60], armR: [30, 40] }} />
      <Hero x={a ? 500 : 1250} y={GY} f={f} expr="grin" pose={{ armL: [15, 8], armR: [15, 8] }} />
      <Puff x={a ? 1250 : 500} y={GY - 200} p={(g % 12) / 10} s={0.9} />
    </Room>;
  } },
  // телефон
  { at: "phone", n: 1, s: (g, f, len) => <Room cam={camLerp(g, len, C(1170, GY - 300, 3.0), C(1170, GY - 300, 3.3))} f={f} kind="kitchen" win={false}>
    <g transform={`translate(${1170 + Math.sin(f * 2.5) * 4} ${GY - 266})`}><Phone rot={90} /></g>
    {[-1, 1].map((k) => <path key={k} d={`M ${1170 + k * 90} ${GY - 300} l ${k * 20} -16 M ${1170 + k * 96} ${GY - 266} l ${k * 26} 0`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
  </Room> },
  { at: "tap", s: (g, f, len) => {
    const hit = since("through", "tap", g) >= 0;
    const fy = ip(g, [0, len * 0.6], [-420, 40], (t) => t);
    return <Frame bg="#4a3098">
      <rect width={1920} height={1080} fill="url(#wall)" />
      <g transform="translate(960 600) scale(4.2)"><Phone crack={hit} /></g>
      {hit ? <Shards x={960} y={600} p={since("through", "tap", g) * 0.6} /> : null}
      <g transform={`translate(960 ${600 + fy})`}><rect x={-34} y={-900} width={68} height={900} rx={34} fill="#262838" stroke={INK} strokeWidth={8} /><circle cx={0} cy={0} r={40} fill="#262838" stroke={INK} strokeWidth={8} /></g>
    </Frame>;
  } },
  { at: "That", s: (g, f, len) => <Room cam={camLerp(g, len, C(1000, GY - 300, 2.4), C(1000, GY - 300, 2.6))} f={f} kind="kitchen" win={false}>
    <Hero x={1000} y={GY} f={f} expr="smirk" sweat pose={{ armR: [120, 40], armL: [15, 10], tilt: -10 }} holdR={{ node: <Phone crack />, k: 1.4 }} /></Room> },
  { at: "lunch", s: (g, f, len) => <Room cam={camLerp(g, len, C(1170, GY - 300, 2.4), C(1170, GY - 300, 2.7))} f={f} kind="kitchen" win={false}>
    {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${1060 + i * 70} ${GY - 266 - (i % 2) * 6}) rotate(${80 + i * 12})`} opacity={g > i * 5 ? 1 : 0}><Phone crack /></g>)}
    <Hero x={900} y={GY} f={f} expr="sad" pose={{ armL: [15, 8], armR: [40, 60] }} /></Room> },
  // на улице
  { at: "Outside", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 560, 1.0), C(960, 600, 1.2))} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="sad" pose={walkPose(f, 0.18)} />
    <Bean x={300 + g * 3} y={GY + 40} s={HS} look={LOOKS[2]} f={f} pose={walkPose(f, 0.25, 1)} />
  </Town> },
  { at: "hearing", s: (g, f, len) => <Town cam={camLerp(g, len, C(1050, 640, 1.2), C(1050, 640, 1.35))} f={f}>
    <Car x={1500 - g * 3} y={GY + 40} c="#5a7cf0" />
    <SoundRings x={1650 - g * 3} y={GY - 70} f={f * 2} c="#ff5fb0" n={5} />
    <Hero x={800} y={GY + 30} f={f} expr="shock" open={0.9} sweat pose={{ armL: [150, 75], armR: [150, 75], tilt: Math.sin(f * 0.7) * 6 }} />
  </Town> },
  { at: "seagull", s: (g, f, len) => <Bay cam={camLerp(g, len, C(320, GY - 380, 2.0), C(330, GY - 400, 2.3))} f={f} boats={false}>
    <Gull x={300} y={GY - 400} f={f} cry s={0.9} />
    <SoundRings x={420} y={GY - 490} f={f * 2} c="#ffd23c" n={4} />
  </Bay> },
  { at: "x-ray", s: (g, f, len) => {
    const on = Math.floor(g / 4) % 2 === 0;
    return <Town cam={camLerp(g, len, C(960, GY - 250, 2.8), C(960, GY - 250, 3.0))} f={f}>
      <Hero x={960} y={GY + 30} f={f} expr="shock" open={0.4} />
      {on ? [-26, 26].map((k) => <Glow key={k} x={960 + k} y={GY - 236} r={90} g="gC" />) : null}
    </Town>;
  } },
  { at: "whole", s: (g, f, len) => {
    const on = Math.floor(g / 5) % 2 === 0;
    const P = [[300, 2], [700, 0], [1250, 3], [1650, 5]];
    return <Town cam={camLerp(g, len, C(960, 560, 1.0), C(960, 560, 1.08))} f={f}>
      {on ? <rect x={-2000} y={-1000} width={6000} height={3000} fill="#06163a" opacity={0.8} /> : null}
      {P.map(([x, l], i) => on ? <Skeleton key={i} x={x + g * 2} y={GY + 30} s={HS} f={f} a={i} /> : <Bean key={i} x={x + g * 2} y={GY + 30} s={HS} look={LOOKS[l]} f={f} pose={walkPose(f, 0.25, i)} />)}
      {on ? <path d="M -2000 940 L 4000 940" stroke="#5ae0ff" strokeWidth={14} opacity={0.6} /> : null}
    </Town>;
  } },
  { at: "scary", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, GY - 260, 2.4), C(960, GY - 260, 2.8))} f={f}>
    <Hero x={960} y={GY + 30} f={f} expr="sad" sweat pose={{ armL: [30, 80], armR: [30, 80] }} /></Town> },
  { at: "Heroes", s: (g, f, len) => <Frame bg="#2a1a60">
    <rect width={1920} height={1080} fill="url(#wall)" />
    <g transform="translate(960 760) scale(1.4)"><TV x={0} y={0}>
      <rect x={-276} y={-80} width={552} height={70} fill="#5a3ac0" />
      <path d={`M -20 -300 L -120 -120 L ${80 + Math.sin(f * 0.3) * 10} -150 Z`} fill="#ff4a6a" stroke={INK} strokeWidth={5} />
      <Bean x={0} y={-80} s={0.4} look={LOOKS[2]} f={f} expr="grin" pose={{ armL: [170, 0], armR: [170, 0], bob: Math.abs(Math.sin(f * 0.2)) * 20 }} holdR={{ node: <g><rect x={-200} y={-12} width={200} height={24} fill="#b8b4d0" stroke={INK} strokeWidth={5} /><rect x={-230} y={-50} width={40} height={100} rx={8} fill={INK} /></g> }} />
    </TV></g>
    {Array.from({ length: 6 }, (_, i) => { const t = ((g * 2 + i * 30) % 120); return <g key={i} transform={`translate(${200 + i * 300 + t * 2} ${80 + t * 4}) rotate(${t * 3})`}><rect x={-50} y={-60} width={100} height={120} fill="#fff4f0" stroke={INK} strokeWidth={5} /><rect x={-50} y={-60} width={100} height={26} fill="#ff4a6a" stroke={INK} strokeWidth={5} />{[0, 1, 2].map((r) => <path key={r} d={`M -36 ${-16 + r * 24} L 36 ${-16 + r * 24}`} stroke="#c8b8e8" strokeWidth={6} />)}</g>; })}
  </Frame> },
  { at: "got", s: (g, f, len) => <Room cam={camLerp(g, len, C(1450, GY - 300, 1.7), C(1450, GY - 300, 1.9))} f={f}>
    <Hero x={1440} y={GY} f={f} expr="sad" pose={{ armL: [15, 8], armR: [15, 8], tilt: -6 }} /></Room> },
  { at: "sneeze", s: (g, f, len) => {
    const k = since("now", "sneeze", g);
    return <Room cam={{ ...camLerp(g, len, C(1000, GY - 280, 2.6), C(1000, GY - 280, 2.2)), ...shake(f, k > 0 && k < 14 ? 14 : 0) }} f={f}>
      <Hero x={1000} y={GY} f={f} expr={k > 0 ? "shock" : "laugh"} open={k > 0 ? 1 : 0.2} pose={{ lean: k > 0 ? 10 : -10, tilt: k > 0 ? 14 : -10, armL: [40, 60], armR: [40, 60] }} />
      {k > 0 ? <SoundRings x={1000} y={GY - 260} f={k * 3} c="#ffffff" n={4} /> : null}
    </Room>;
  } },
  { at: "house", s: (g, f, len) => {
    const j = ip(g, [0, 8], [0, 1], (t) => t) - ip(g, [8, 22], [0, 1]);
    return <Town cam={{ ...camLerp(g, len, C(960, 520, 0.95), C(960, 540, 1.0)), ...shake(f, g < 20 ? 8 : 0) }} f={f} houses={false}>
      <g transform={`translate(0 ${-j * 160}) rotate(${j * 4} 960 860)`}>
        <rect x={700} y={360} width={520} height={500} fill="#ff9a5a" stroke={INK} strokeWidth={9} />
        <path d="M 660 370 L 960 140 L 1260 370 Z" fill="#a8306a" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
        {[[770, 430], [1060, 430], [770, 640]].map(([x, y], i) => <rect key={i} x={x} y={y} width={90} height={110} fill={YEL} stroke={INK} strokeWidth={7} />)}
        <rect x={1020} y={640} width={120} height={220} fill="#c87a4a" stroke={INK} strokeWidth={7} />
      </g>
      {g > 6 ? Array.from({ length: 10 }, (_, i) => <circle key={i} cx={680 + i * 62} cy={880 - ((g * 3 + i * 9) % 60)} r={26 + (i % 3) * 10} fill="#c8b8e8" stroke={INK} strokeWidth={5} opacity={Math.max(0, 1 - g / 40)} />) : null}
    </Town>;
  } },
  { at: "So", n: 2, s: (g, f, len) => <Room cam={camLerp(g, len, C(1000, GY - 300, 2.2), C(1000, GY - 300, 2.4))} f={f}>
    <Hero x={1000} y={GY} f={f} expr="smirk" pose={{ armL: [15, 8], armR: [100, 60], tilt: Math.sin(g * 0.3) * 8 }} /></Room> },
  { at: "somewhere", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, 560, 1.0), C(1500, 520, 1.1))} f={f} promenade={false}>
    <Hero x={ip(g, [0, len + 18], [700, 2100])} y={ip(g, [0, len + 18], [760, 520])} f={f} s={HS * ip(g, [0, len + 18], [1, 0.4])} expr="grin" shadow={false} pose={{ ...floatPose(f), lean: -30, armL: [170, 0], armR: [60, 20] }} />
    <Glow x={ip(g, [0, len + 18], [700, 2100])} y={ip(g, [0, len + 18], [660, 470])} r={150} g="gY" o={0.5} />
  </Bay> },
], { id: 2 });
