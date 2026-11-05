// Часть 7/7: смерть — просто возвращение в кровать. Что станет с людьми? Вопрос зрителю и призыв подписаться.
import React from "react";
import { B, Bean, Bed, Cam, Drop, G, GY, Glow, HERO2D, HS, INK, Item, LOOKS, BANKER, Tower, Voice, camLerp, gx, gy, ip, makePart, walkPose } from "./kit";
import { Land, Room, Street } from "./scenes";
import { VOICE } from "./voices/p7";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;
const SCI = { head: "#f8f6f0", body: "#f2f4f8", body2: "#8a86a8", limb: "#262838", shoe: "#2a2a30", hair: "#c8ccdc" };
const Poof: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => <g opacity={1 - p}>{Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <rect key={i} x={x + Math.cos(a) * p * 260 - 40} y={y - 60 + Math.sin(a) * p * 160 - 40} width={80 * (1 - p * 0.5)} height={80 * (1 - p * 0.5)} fill="#f4f6ff" stroke={INK} strokeWidth={5} />; })}</g>;
const Confetti: React.FC<{ f: number }> = ({ f }) => <g>{Array.from({ length: 40 }, (_, i) => <rect key={i} x={gx(-4) + ((i * 137) % 3400)} y={GY - 1400 + ((f * (6 + (i % 5)) + i * 97) % 1400)} width={36} height={36} fill={["#ff6f8f", "#ffd23c", "#5ae0ff", "#6ad86a", "#b45ad8"][i % 5]} stroke={INK} strokeWidth={4} transform={`rotate(${f * 4 + i * 30} ${gx(-4) + ((i * 137) % 3400) + 18} ${GY - 1382 + ((f * (6 + (i % 5)) + i * 97) % 1400)})`} />)}</g>;
const Balcony: React.FC = () => <g>{Array.from({ length: 4 }, (_, i) => <G key={i} c={6 + i} r={6} t="planks" />)}<G c={6} r={7} t="glass" /><G c={9} r={7} t="glass" /></g>;

export const P7 = makePart(V, [
  { at: "", s: (g, f, len) => {
    const fall = ip(g, [len - 34, len - 4], [0, 1], (t) => t * t);
    const y = gy(6) + (GY - gy(6)) * fall;
    return <Street cam={camLerp(g, len, { x: gx(7), y: gy(6) - 100, z: 1.3 }, { x: gx(7), y: GY - 500, z: 0.75 })} f={f} tod="day" cars={false}>
      <Balcony /><Hero x={gx(9) + 60 + fall * 120} y={y} f={f} expr={fall > 0 ? "shock" : "grin"} open={0.8} pose={fall > 0 ? { armL: [160, 20], armR: [160, 20], legL: 20, legR: 20, tilt: 20 } : { armR: [100, 10], lean: 6 }} />
    </Street>;
  } },
  { at: "One", n: 1, s: (g, f, len) => <Street cam={camLerp(g, len, M(9, 1.4, -250), M(9, 1.3, -260))} f={f} tod="day" cars={false} trees={false}>
    <Poof x={gx(9) + 120} y={GY} p={ip(g, [0, 20], [0, 1])} />
    {g > 6 ? (["pick", "bread", "diamond", "torch", "ingot"] as const).map((t, i) => <Drop key={t} t={t} x={gx(8) + i * 120} y={GY - 20} f={f + i * 10} s={0.55} />) : null}
    <rect x={-3000} y={-3000} width={9000} height={9000} fill="#ff3a4a" opacity={ip(g, [0, 3, 10], [0.5, 0.5, 0])} />
  </Street> },
  { at: "next", s: (g, f, len) => <Room cam={camLerp(g, len, M(0, 1.5, -250), M(0, 1.8, -250))} f={f} tod="day">
    <Bed c={-1} /><Glow x={gx(0)} y={GY - 200} r={ip(g, [0, 15], [600, 200])} g="gW" o={ip(g, [0, 15], [1, 0.3])} />
    {g < 15 ? <Bean x={gx(1) - 10} y={GY - 150} s={HS} look={HERO2D} f={f} expr="shock" lying /> : <Hero x={gx(0)} y={GY - 110} f={f} expr={g > 30 ? "laugh" : "shock"} open={0.6} pose={{ armL: [150, 30], armR: [150, 30] }} />}
  </Room> },
  { at: "Everything", s: (g, f, len) => <Street cam={camLerp(g, len, M(9, 1.5, -200), M(9.5, 1.7, -180))} f={f} tod="day" cars={false} trees={false}>
    {(["pick", "bread", "diamond", "torch", "ingot", "log", "steak"] as const).map((t, i) => <Drop key={t} t={t} x={gx(8) + i * 110} y={GY - 20} f={f + i * 10} s={0.55} />)}
  </Street> },
  { at: "Death", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1600, y: 420, z: 0.7 }, { x: 1800, y: 420, z: 0.75 })} f={f} tod="day">
    <Hero x={gx(2) + g * 7} f={f} expr="grin" pose={walkPose(f)} />
  </Street> },
  { at: "lose", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -260), M(4, 2.3, -270))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr={g > len * 0.5 ? "grin" : "sad"} pose={{ armL: [100, -30], armR: [100, -30], tilt: Math.sin(f * 0.2) * 6 }} />
  </Street> },
  { at: "Most", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.2, -320), M(5, 1.3, -320))} f={f} tod="day">
    {[3, 5, 7].map((c, i) => <Bean key={i} x={gx(c) + 60} y={GY} s={HS} look={LOOKS[i + 1]} f={f} expr="grin" pose={{ tilt: Math.sin(f * 0.4 + i) * 10 }} />)}
  </Street> },
  { at: "celebrates", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1600, y: 380, z: 0.62 }, { x: 1700, y: 400, z: 0.68 })} f={f} tod="day">
    {Array.from({ length: 10 }, (_, i) => <Bean key={i} x={gx(-3 + i * 2)} y={GY - Math.abs(Math.sin(f * 0.25 + i)) * 60} s={HS} look={i === 4 ? HERO2D : LOOKS[i % 7]} f={f} expr="laugh" open={0.5} pose={{ armL: [150, 20], armR: [150, 20] }} />)}
    <Confetti f={f} />
  </Street> },
  { at: "funerals", s: (g, f, len) => <Land cam={camLerp(g, len, M(4, 1.0, -350), M(4, 1.1, -340))} f={f} tod="day">
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
    {[2, 4, 6].map((c) => <g key={c} opacity={0.5}><rect x={gx(c) + 40} y={GY - 230} width={120} height={230} fill="#8a86a8" stroke={INK} strokeWidth={5} /></g>)}
    {[2, 4, 6].map((c) => <rect key={"f" + c} x={gx(c) + 70} y={GY - 120} width={60} height={60} fill="#ff6f8f" stroke={INK} strokeWidth={4} />)}
  </Land> },
  { at: "fear", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.3, -300), M(4, 1.4, -300))} f={f} tod="day">
    {[2, 4, 6].map((c, i) => <Bean key={i} x={gx(c) + 60} y={GY - Math.abs(Math.sin(f * 0.3 + i)) * 90} s={HS} look={i === 1 ? HERO2D : LOOKS[i + 3]} f={f} expr="laugh" open={0.5} pose={{ armL: [160, 20], armR: [160, 20] }} />)}
  </Street> },
  { at: "slowly", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1600, y: 400, z: 0.7 }, { x: 1600, y: 400, z: 0.8 })} f={f} tod="dusk" dark={ip(g, [0, len], [0, 0.4])}>
    {[2, 6, 10].map((c, i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={i === 1 ? HERO2D : LOOKS[i + 1]} f={f} expr="neutral" pose={walkPose(f + i * 9, 0.15)} />)}
  </Street> },
  { at: "reckless", s: (g, f, len) => {
    const p = ((g * 1.5) % 45) / 45;
    return <Street cam={camLerp(g, len, { x: gx(5), y: GY - 1100, z: 0.65 }, { x: gx(5), y: GY - 1000, z: 0.7 })} f={f} tod="dusk" cars={false}>
      <Tower c={3} w={3} h={10} col="#5a6ad8" seed={5} />
      <Bean x={gx(6) + 100 + p * 300} y={gy(9) + (GY - gy(9)) * p * p} s={HS} look={LOOKS[4]} f={f} expr="laugh" open={0.6} pose={{ armL: [160, 20], armR: [160, 20], legL: 20, legR: 20 }} />
      <Bean x={gx(4)} y={gy(9)} s={HS} look={LOOKS[2]} f={f} expr="laugh" open={0.4} pose={{ armR: [150, 10] }} />
      {p > 0.9 ? <Poof x={gx(7) + 100} y={GY} p={(p - 0.9) * 10} /> : null}
    </Street>;
  } },
  { at: "Insurance", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.2, -330), M(3, 1.2, -330))} f={f} tod="dusk" trees={false} cars={false}>
    <Tower c={5} w={3} h={5} col="#3a4ab8" seed={8} lit={0.1} />
    <Bean x={gx(4) - g * 6} y={GY} s={HS} look={BANKER} f={f} flip expr="sad" holdR={{ node: <rect x={-70} y={-120} width={140} height={100} fill="#c88a4a" stroke={INK} strokeWidth={6} />, rot: 0 }} pose={{ ...walkPose(f, 0.2), armR: [100, 0] }} />
  </Street> },
  { at: "caring", s: (g, f, len) => <Land cam={camLerp(g, len, M(3, 1.0, -250), M(3, 1.1, -250))} f={f} tod="dusk">
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}
    {[1, 4].map((c, i) => <Bean key={i} x={gx(c) + 250} y={GY - 60} s={HS} look={LOOKS[i + 5]} f={f} expr="neutral" lying />)}
  </Land> },
  { at: "wonder", s: (g, f, len) => <Land cam={camLerp(g, len, { x: gx(4), y: GY - 500, z: 0.8 }, { x: gx(4), y: GY - 450, z: 0.95 })} f={f} tod="dusk" sun={[2100, 300]}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<G c={3} r={0} t="grass" /><G c={4} r={0} t="grass" /><G c={4} r={1} t="grass" />
    <Bean x={gx(4) + B / 2} y={gy(1)} s={HS} look={HERO2D} f={f} expr="neutral" pose={{ legL: 50, legR: 50, armL: [20, 20], armR: [20, 20], tilt: -10 }} />
  </Land> },
  { at: "Without", s: (g, f, len) => <Land cam={camLerp(g, len, { x: gx(4) + 100, y: gy(1) - 250, z: 2.4 }, { x: gx(4) + 100, y: gy(1) - 260, z: 2.8 })} f={f} tod="dusk" sun={[2100, 300]}>
    {Array.from({ length: 22 }, (_, i) => <G key={i} c={-6 + i} r={-1} t="grass" />)}<G c={3} r={0} t="grass" /><G c={4} r={0} t="grass" /><G c={4} r={1} t="grass" />
    <Bean x={gx(4) + B / 2} y={gy(1)} s={HS} look={HERO2D} f={f} expr="sad" pose={{ legL: 50, legR: 50, armL: [20, 20], armR: [20, 20], tilt: -10 }} />
  </Land> },
  { at: "Others", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1600, y: 600, z: 0.7 }, { x: 1600, y: -300, z: 0.45 })} f={f} tod="dusk" cars={false}>
    {[[-8, 3, 14, "glass"], [-3, 2, 18, "gold"], [2, 4, 11, "glass"], [9, 2, 20, "stone"], [14, 3, 15, "glass"], [20, 2, 12, "gold"]].map(([c, w, h, t], i) => Array.from({ length: (w as number) * (h as number) }, (_, k) => <G key={i + "_" + k} c={(c as number) + (k % (w as number))} r={Math.floor(k / (w as number))} t={(k % 7 === 3 ? "gold" : t) as any} />))}
  </Street> },
  { at: "Scientists", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.8, -260), M(4, 2.0, -260))} f={f} tod="dusk">
    <G c={5} r={0} t="stone" />
    <Bean x={gx(4) + 40} y={GY} s={HS} look={SCI} f={f} expr="neutral" holdR={{ node: <g><circle cx={0} cy={-80} r={50} fill="#bfefff" opacity={0.6} stroke={INK} strokeWidth={7} /><rect x={-8} y={-30} width={16} height={60} fill="#7a4a2a" stroke={INK} strokeWidth={4} /></g>, rot: 0 }} pose={{ armR: [110, -10], tilt: Math.sin(f * 0.1) * 12 }} />
  </Street> },
  { at: "question", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.4, -270), M(4, 2.7, -270))} f={f} tod="dusk">
    <Hero x={gx(4) + B / 2} f={f} expr="smirk" pose={{ tilt: 8 }} />
  </Street> },
  { at: "woke", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.6, -300), { x: 1600, y: 300, z: 0.55 })} f={f} tod="dusk" sun={[2600, 100]}>
    <Hero x={gx(4) + B / 2} f={f} expr="grin" pose={{ armL: [150, 30], armR: [150, 30] }} />
  </Street> },
  { at: "comments", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.2, -260), M(4, 2.4, -260))} f={f} tod="dusk">
    <Hero x={gx(4) + B / 2} f={f} expr="grin" pose={{ armR: [80, -50] }} />
  </Street> },
  { at: "subscribe", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.0, -260), { x: 1600, y: 250, z: 0.5 })} f={f} tod="dusk" sun={[2600, 150]}>
    <Hero x={gx(4) + B / 2} f={f} expr="laugh" open={0.5} pose={{ armR: [150 + Math.sin(f * 0.4) * 20, 30] }} />
    <Item t="torch" x={gx(5) + 60} y={GY - 60} f={f} />
  </Street> },
], { id: 7, last: true });
