// Часть 5/7: первая ночь — монстры в темноте, спасение светом, факелы по всей Земле.
import React from "react";
import { B, Bean, Bony, Cam, Earth, Frame, G, GY, Glow, Groaner, HERO2D, HS, INK, Item, LOOKS, Shade, Spawn, Stars, Torch, Tree, Voice, camLerp, gx, gy, ip, makePart, walkPose, Fire } from "./kit";
import { Land, Room, Street } from "./scenes";
import { VOICE } from "./voices/p5";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;
const Night: React.FC<{ cam: Cam; f: number; torches?: boolean; dark?: number; children?: React.ReactNode; cars?: boolean }> = ({ cam, f, torches, dark = 0.55, children, cars }) =>
  <Street cam={cam} f={f} tod="night" sun={[2900, -300]} torches={torches} dark={dark} cars={cars}>{children}</Street>;
const ASTRO = { head: "#f8f6f0", body: "#f4f6ff", body2: "#c8ccdc", limb: "#8a86a8", shoe: "#ffffff" };

export const P5 = makePart(V, [
  { at: "", s: (g, f, len) => <Night cam={camLerp(g, len, { x: 1600, y: 380, z: 0.62 }, { x: 1700, y: 400, z: 0.7 })} f={f}>
    {[1, 5, 9, 14].map((c, i) => <Bean key={i} x={gx(c) + (i % 2 ? -1 : 1) * g * 3} y={GY} s={HS} look={LOOKS[i]} f={f + i * 5} flip={i % 2 === 1} expr="talk" open={0.2} pose={walkPose(f + i * 5, 0.25)} />)}
  </Night> },
  { at: "Wherever", s: (g, f, len) => {
    const p = ip(g, [0, len - 8], [0, 1]);
    return <Night cam={camLerp(g, len, M(6, 1.3, -300), M(6, 1.5, -300))} f={f} dark={0.7}>
      {p < 1 ? <Spawn x={gx(6) + B / 2} y={GY} p={p} f={f} /> : null}{p > 0.8 ? <g opacity={(p - 0.8) * 5}><Shade x={gx(6) + B / 2} f={f} s={0.8} /></g> : null}
    </Night>;
  } },
  { at: "Tall", s: (g, f, len) => <Night cam={camLerp(g, len, { x: gx(6) + 100, y: GY - 450, z: 1.6 }, { x: gx(6) + 100, y: GY - 480, z: 2.1 })} f={f} dark={0.65}><Shade x={gx(6) + B / 2} f={f} /></Night> },
  { at: "Groaning", s: (g, f, len) => <Night cam={camLerp(g, len, M(4, 1.0, -350), M(5, 1.0, -350))} f={f}>
    {[2, 5, 8].map((c, i) => <Groaner key={i} x={gx(c) + g * 4} f={f + i * 10} s={0.85} />)}
  </Night> },
  { at: "Bony", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.85, -600), M(4, 0.95, -560))} f={f} tod="night" dark={0.5}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<Tree c={2} h={4} /><Tree c={8} h={3} />
    <Bony x={gx(2) + B / 2} y={gy(6) + B} f={f} s={0.8} /><Bony x={gx(8) + B / 2} y={gy(5) + B} f={f} s={0.8} flip />
    {[0, 1, 2].map((i) => { const t = ((g * 2 + i * 20) % 60) / 60; return <path key={i} d={`M ${gx(3) + t * 1200} ${gy(5) + t * 900} l 60 45`} stroke={INK} strokeWidth={8} strokeLinecap="round" />; })}
    <Bean x={gx(5)} y={GY} s={HS} look={LOOKS[2]} f={f} expr="shock" open={0.7} pose={{ ...walkPose(f, 0.6), armL: [150, 20], armR: [150, 20] }} />
  </Land> },
  { at: "They", s: (g, f, len) => <Night cam={camLerp(g, len, { x: 1600, y: 420, z: 0.7 }, { x: 1600, y: 420, z: 0.78 })} f={f} dark={0.6}>
    {[[-3, 0], [3, 10], [9, 20], [15, 5]].map(([c, d], i) => { const p = ip(g - d, [0, 30], [0, 1]); return <g key={i}>{p < 1 ? <Spawn x={gx(c)} y={GY} p={p} f={f} /> : null}{p > 0.8 ? <g opacity={(p - 0.8) * 5}>{i % 2 ? <Groaner x={gx(c)} f={f} s={0.85} /> : <Shade x={gx(c)} f={f} s={0.8} />}</g> : null}</g>; })}
  </Night> },
  { at: "bridges", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 1.0, -300), M(4, 1.1, -300))} f={f} tod="night" dark={0.6}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t={i > 7 && i < 13 ? "water" : "grass"} f={f} />)}{Array.from({ length: 8 }, (_, i) => <G key={"b" + i} c={1 + i} r={2} t="stone" />)}
    <Groaner x={gx(3)} f={f} s={0.8} /><Shade x={gx(6)} f={f} s={0.7} />
  </Land> },
  { at: "basements", s: (g, f, len) => <Room cam={camLerp(g, len, M(1, 1.3, -300), M(1, 1.4, -300))} f={f} tod="night" dark={0.8}>
    <G c={-2} r={0} t="planks" col="#7a4a2a" /><G c={-2} r={1} t="planks" col="#7a4a2a" /><Groaner x={gx(1)} f={f} s={0.85} />
  </Room> },
  { at: "parks", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 0.9, -400), M(4.5, 1.0, -400))} f={f} tod="night" dark={0.6}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<Tree c={1} h={3} /><Tree c={9} h={4} />
    <rect x={gx(4)} y={GY - 110} width={B * 2} height={30} fill="#a86a3a" stroke={INK} strokeWidth={5} />{[0, 1].map((k) => <rect key={k} x={gx(4) + 20 + k * 340} y={GY - 80} width={20} height={80} fill="#7a4a2a" stroke={INK} strokeWidth={4} />)}
    <Shade x={gx(7)} f={f} s={0.8} /><Bony x={gx(2)} f={f} s={0.75} />
  </Land> },
  { at: "People", s: (g, f, len) => <Night cam={camLerp(g, len, M(5, 1.0, -350), M(5.5, 1.05, -350))} f={f}>
    {Array.from({ length: 12 }, (_, i) => <G key={i} c={6 + (i % 4)} r={Math.floor(i / 4)} t="planks" />)}
    <rect x={gx(7)} y={gy(1)} width={B} height={B * 2} fill={g > 25 ? "#8a5428" : "#ffd23c"} stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => { const x = gx(1) + i * 180 + g * 26; return x < gx(7) + 50 ? <Bean key={i} x={x} y={GY} s={HS} look={i === 1 ? HERO2D : LOOKS[i + 3]} f={f + i * 4} expr="shock" open={0.6} pose={{ ...walkPose(f + i * 4, 0.7), lean: -10, armL: [150, 20], armR: [150, 20] }} /> : null; })}
  </Night> },
  { at: "doors", n: 2, s: (g, f, len) => <Night cam={camLerp(g, len, M(6.5, 1.5, -300), M(6.8, 1.7, -300))} f={f}>
    {Array.from({ length: 12 }, (_, i) => <G key={i} c={6 + (i % 4)} r={Math.floor(i / 4)} t="planks" />)}
    <g transform={`translate(${Math.sin(f * 1.3) * 6} 0)`}><rect x={gx(7)} y={gy(1)} width={B} height={B * 2} fill="#8a5428" stroke={INK} strokeWidth={5} />
      {g > 15 ? <path d={`M ${gx(7) + 40} ${gy(1) + 60} l 40 50 l -30 40 l 50 60`} stroke={INK} strokeWidth={7} fill="none" /> : null}</g>
    <Groaner x={gx(6) + 40} f={f} s={0.85} />
  </Night> },
  { at: "pound", s: (g, f, len) => <Room cam={camLerp(g, len, M(0, 1.4, -280), M(0, 1.6, -260))} f={f} tod="night" dark={0.5}>
    <g transform={`translate(${Math.sin(f * 1.5) * 8} 0)`}><rect x={gx(-3)} y={gy(1)} width={B} height={B * 2} fill="#8a5428" stroke={INK} strokeWidth={5} /></g>
    <Torch x={gx(1) + 100} y={GY} f={f} /><G c={0} r={0} t="table" />
    <Hero x={gx(1) + 20} f={f} expr="shock" open={0.5} sweat pose={{ armL: [150, 60], armR: [150, 60], tilt: Math.sin(f * 0.5) * 4 }} />
  </Room> },
  { at: "Streets", s: (g, f, len) => <Night cam={camLerp(g, len, { x: 1600, y: 380, z: 0.55 }, { x: 1600, y: 380, z: 0.6 })} f={f} dark={0.75}>
    {[2, 4, 6].map((c) => <Torch key={c} x={gx(c) + 100} y={GY} f={f} />)}
    {[2.5, 5.5].map((c, i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={LOOKS[i + 2]} f={f} expr="grin" />)}
    {[-8, -5, 11, 14, 17].map((c, i) => <g key={c}>{[-1, 1].map((k) => <g key={k}><Glow x={gx(c) + k * 28} y={GY - 290} r={40} g="gM" /><rect x={gx(c) + k * 28 - 14} y={GY - 296} width={28} height={12} fill="#ff6aff" /></g>)}</g>)}
  </Night> },
  { at: "Everywhere", s: (g, f, len) => <Room cam={camLerp(g, len, M(0, 1.6, -200), M(0, 1.9, -200))} f={f} tod="night" dark={0.85}>
    <Bean x={gx(0)} y={GY} s={HS} look={LOOKS[6]} f={f} expr="shock" open={0.3} pose={{ armL: [150, 80], armR: [150, 80], legL: 30, legR: 30 }} />
    <Bean x={gx(1) + 50} y={GY} s={HS * 0.8} look={LOOKS[4]} f={f} expr="sad" pose={{ armL: [60, 60], armR: [60, 60] }} />
  </Room> },
  { at: "trick", s: (g, f, len) => <Night cam={camLerp(g, len, M(4, 2.0, -260), M(4, 2.3, -280))} f={f} dark={0.6}>
    <Hero x={gx(4) + B / 2} f={f} expr="smirk" holdR={{ node: <Item t="torch" f={f} />, rot: 0 }} pose={{ armR: [150, 30] }} />
  </Night> },
  { at: "Light", n: 1, s: (g, f, len) => <Night cam={camLerp(g, len, M(4, 1.5, -300), M(4, 1.0, -350))} f={f} dark={ip(g, [0, 20], [0.6, 0.2])}>
    <Torch x={gx(5) + 100} y={GY} f={f} s={1.2} /><Glow x={gx(5) + 100} y={GY - 200} r={ip(g, [0, 20], [100, 900])} g="gY" />
    <Hero x={gx(4)} f={f} expr="grin" />
  </Night> },
  { at: "Monsters", s: (g, f, len) => <Night cam={camLerp(g, len, M(6, 1.2, -300), M(6, 1.3, -300))} f={f} dark={0.4}>
    <Torch x={gx(5) + 100} y={GY} f={f} s={1.2} /><Glow x={gx(5) + 100} y={GY - 200} r={900} g="gY" />
    {g < 30 ? <g opacity={1 - g / 30}><Spawn x={gx(7)} y={GY} p={0.3 + g / 60} f={f} /></g> : null}
    {g > 15 ? [0, 1, 2, 3].map((i) => <rect key={i} x={gx(7) + Math.cos(i) * (g - 15) * 10} y={GY - 250 - (g - 15) * 8 + i * 30} width={24} height={24} fill="#8a86a8" opacity={Math.max(0, 1 - (g - 15) / 20)} />) : null}
  </Night> },
  { at: "second", s: (g, f, len) => <Night cam={camLerp(g, len, { x: 1200, y: 400, z: 0.65 }, { x: 2000, y: 400, z: 0.7 })} f={f} torches dark={0.2}>
    {[1, 6, 12].map((c, i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={LOOKS[i]} f={f} expr="grin" pose={walkPose(f + i * 6)} />)}
  </Night> },
  { at: "Billions", s: (g, f, len) => <Frame tod="night"><rect width={1920} height={1080} fill="#0a0628" /><Stars f={f} /><Earth x={960} y={560} r={ip(g, [0, len], [700, 520])} f={f} night={1} lights={0.8} /></Frame> },
  { at: "space", s: (g, f, len) => <Frame tod="night"><rect width={1920} height={1080} fill="#0a0628" /><Stars f={f} /><Earth x={960} y={560} r={ip(g, [0, len], [520, 380])} f={f} night={1} lights={0.9} /></Frame> },
  { at: "Astronauts", s: (g, f, len) => <Frame tod="night">
    <rect width={1920} height={1080} fill="#0a0628" /><Stars f={f} /><Earth x={1500} y={1150} r={700} f={f} night={1} lights={0.9} />
    <g transform="translate(560 900) scale(1.2)">
      <Bean x={0} y={0} s={HS} look={ASTRO} f={f} expr="grin" pose={{ armR: [120, -20], tilt: 10 }} />
      <circle cx={0} cy={-268} r={74} fill="#8ae0ff" opacity={0.25} stroke={INK} strokeWidth={6} />
    </g>
  </Frame> },
  { at: "sunrise", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1500, y: 420, z: 0.75 }, { x: 1700, y: 420, z: 0.8 })} f={f} tod="dawn" sun={[2600, 100 - g * 2]}>
    {[[2, 0], [7, 1], [12, 2]].map(([c, k], i) => { const x = gx(c) + (i % 2 ? -1 : 1) * g * 12; const b = ip(g, [0, 15], [0, 0.8]); return k === 0 ? <Groaner key={i} x={x} f={f} s={0.85} burn={b} /> : k === 1 ? <Shade key={i} x={x} f={f} s={0.8} burn={b} /> : <Bony key={i} x={x} f={f} s={0.8} burn={b} flip />; })}
  </Street> },
  { at: "surviving", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -260), M(4, 2.3, -280))} f={f} tod="dawn">
    <Hero x={gx(4) + B / 2} f={f} expr={g > len - 25 ? "sad" : "laugh"} open={0.5} pose={g > len - 25 ? { armL: [20, 50], armR: [20, 50] } : { armL: [150, 30], armR: [150, 30] }} />
  </Street> },
  { at: "eat", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -250), M(4, 2.4, -250))} f={f} tod="dawn">
    <Hero x={gx(4) + B / 2} f={f} expr="sad" pose={{ armL: [20, 60], armR: [20, 60] }} />
    <ellipse cx={gx(5) + 60} cy={GY - 20} rx={90} ry={22} fill="#f4f6ff" stroke={INK} strokeWidth={5} />
  </Street> },
], { id: 5 });
export { Fire };
