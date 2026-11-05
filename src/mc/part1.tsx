// Часть 1/7: утро, когда всё стало кубическим.
import React from "react";
import { B, Bean, Bed, Blk, Cam, Dog, Drop, Earth, Frame, G, GY, HERO2D, HS, LOOKS, PAJAMA, Phone, Stars, Tree, Voice, camLerp, gx, ip, makePart, walkPose, INK } from "./kit";
import { Room, Street } from "./scenes";
import { VOICE } from "./voices/p1";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<React.ComponentProps<typeof Bean> | any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;

const Clock: React.FC<{ f: number; ring: boolean }> = ({ f, ring }) => {
  const sh = ring ? Math.sin(f * 2.2) * 6 : 0;
  return (
    <g transform={`translate(${gx(1) + B / 2} ${GY - B}) rotate(${sh})`}>
      <rect x={-60} y={-110} width={120} height={110} fill="#e04a5a" stroke={INK} strokeWidth={5} />
      <rect x={-40} y={-92} width={80} height={72} fill="#fff6e0" stroke={INK} strokeWidth={4} />
      <path d="M 0 -56 L 0 -80 M 0 -56 L 20 -50" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {[-1, 1].map((k) => <rect key={k} x={k * 44 - 16} y={-134} width={32} height={22} fill="#ffd23c" stroke={INK} strokeWidth={4} />)}
      {ring ? [-1, 1].map((k) => <path key={"r" + k} d={`M ${k * 80} -120 l ${k * 30} -20 M ${k * 84} -80 l ${k * 36} 0`} stroke={INK} strokeWidth={6} strokeLinecap="round" />) : null}
    </g>
  );
};
const Bedroom: React.FC<{ cam: Cam; f: number; children?: React.ReactNode; ring?: boolean; dark?: number }> = ({ cam, f, children, ring, dark }) => (
  <Room cam={cam} f={f} dark={dark}><Bed c={-1} /><G c={1} r={0} t="planks" col="#a86a3a" /><Clock f={f} ring={!!ring} />{children}</Room>
);
const lyingHero = (f: number, expr: any = "neutral", open = 0) => <Bean x={gx(1) - 10} y={GY - 150} s={HS} look={HERO2D} expr={expr} open={open} f={f} lying />;

// дерево без нижнего блока: висит в воздухе
const FloatTree: React.FC<{ c: number }> = ({ c }) => <Tree c={c} h={4} cut={1} />;

export const P1 = makePart(V, [
  { at: "", s: (g, f, len) => (
    <Street cam={camLerp(g, len, { x: 1600, y: 300, z: 0.5 }, { x: 1700, y: 380, z: 0.62 })} f={f} sun={[2600, -250 + g * -1.5]}>
      {[[2, 0], [5, 3], [9, 5], [13, 1], [17, 2]].map(([c, l], i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={LOOKS[l]} f={f + i * 9} expr="shock" open={0.5} pose={{ armL: [40, 30], armR: [40, 30], tilt: Math.sin(f * 0.05 + i) * 10 }} />)}
    </Street>) },
  { at: "Picture", s: (g, f, len) => <Bedroom cam={camLerp(g, len, M(0, 1.3, -250), M(0, 1.6, -220))} f={f}>{lyingHero(f)}</Bedroom> },
  { at: "alarm", s: (g, f, len) => <Bedroom cam={camLerp(g, len, M(1, 2.4, -230), M(0.6, 2.0, -220))} f={f} ring>{lyingHero(f, g > 25 ? "shock" : "neutral", 0.3)}</Bedroom> },
  { at: "ceiling", s: (g, f, len) => <Bedroom cam={camLerp(g, len, { x: 300, y: GY - 900, z: 1.0 }, { x: 0, y: GY - 260, z: 2.4 })} f={f}>{lyingHero(f, "shock", 0.8)}</Bedroom> },
  { at: "pillow", s: (g, f, len) => <Bedroom cam={camLerp(g, len, M(0, 1.9, -260), M(0, 2.2, -280))} f={f}>
    <Hero x={gx(0)} y={GY - 110} f={f} expr="shock" open={0.5} holdR={{ node: <Blk x={-70} y={-150} s={140} t="wool" c="#ffffff" />, rot: 0 }} pose={{ armR: [150, 20], armL: [30, 20] }} /></Bedroom> },
  { at: "sun", n: 1, s: (g, f, len) => <Bedroom cam={camLerp(g, len, { x: 700, y: GY - 500, z: 1.5 }, { x: 760, y: GY - 600, z: 2.3 })} f={f} /> },
  { at: "pinch", s: (g, f, len) => <Bedroom cam={camLerp(g, len, M(-0.5, 1.8, -230), M(-0.5, 2.3, -260))} f={f}>
    <Hero x={gx(-0.5)} f={f} expr={g > 20 ? "shock" : "talk"} open={0.6} sweat={g > 20} pose={{ armL: [60, 70], armR: [30, -40], tilt: g > 20 ? Math.sin(f * 0.6) * 4 : 0 }} /></Bedroom> },
  { at: "run", n: 1, s: (g, f, len) => <Bedroom cam={camLerp(g, len, M(-1, 1.2, -300), M(1.5, 1.3, -300))} f={f}>
    <Hero x={gx(-2) + Math.min(g, 30) * 25} f={f} expr="shock" open={0.6} pose={{ ...walkPose(f, 0.6), lean: -8 }} /></Bedroom> },
  { at: "whole", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.5, -250), { x: 1800, y: 420, z: 0.55 }, (t) => 1 - Math.pow(1 - t, 3))} f={f}>
    <Hero x={gx(4)} f={f} expr="shock" open={0.8} pose={{ armL: [140, 30], armR: [140, 30] }} /></Street> },
  { at: "Trees", s: (g, f, len) => <Street cam={camLerp(g, len, { x: gx(-4), y: GY - 500, z: 1.0 }, { x: gx(8), y: GY - 1100, z: 0.8 })} f={f} /> },
  { at: "Cars", s: (g, f, len) => <Street cam={camLerp(g, len, M(10, 1.6, -150), M(9.3, 1.8, -170))} f={f}>
    <Bean x={gx(8)} y={GY} s={HS} look={LOOKS[2]} f={f} expr="shock" open={0.4} pose={{ armR: [70, 10] }} /></Street> },
  { at: "still", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.2, -260), M(4, 1.7, -220))} f={f}>
    <Hero x={gx(4) + B / 2} f={f} expr={g > 30 ? "grin" : "neutral"} pose={{ armL: [150 + Math.sin(f * 0.2) * 10, 30], armR: [150 + Math.sin(f * 0.2 + 1) * 10, 30], tilt: Math.sin(f * 0.07) * 8 }} /></Street> },
  { at: "everyone", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.0, -300), M(6, 0.9, -320))} f={f}>
    {[[3, 0], [5, 3], [7, 4], [9, 6]].map(([c, l], i) => <Bean key={i} x={gx(c)} y={GY} s={HS} look={LOOKS[l]} f={f + i * 13} expr={i % 2 ? "shock" : "talk"} open={0.4 + 0.3 * Math.sin(f * 0.3 + i)} pose={{ armL: [30 + i * 10, 40], armR: [60, 30], tilt: Math.sin(f * 0.06 + i * 2) * 10 }} />)}
    <Hero x={gx(4)} f={f} expr="shock" open={0.4} /></Street> },
  { at: "neighbor", s: (g, f, len) => <Street cam={camLerp(g, len, M(14.5, 1.9, -220), M(14.2, 2.2, -240))} f={f} cars={false}>
    <G c={15} r={0} t="leaves" /><G c={16} r={0} t="leaves" />
    <Bean x={gx(14) + 40} y={GY} s={HS} look={PAJAMA} f={f} expr="talk" open={0.3 + 0.3 * Math.sin(f * 0.4)} pose={{ armR: [92 + Math.sin(f * 0.4) * 10, -5], lean: 3 }} /></Street> },
  { at: "dog", s: (g, f, len) => <Street cam={camLerp(g, len, M(6.5, 2.0, -150), M(6.6, 2.2, -150))} f={f} cars={false} trees={false}>
    <G c={8} r={0} t="conc" col="#e04a5a" /><Dog x={gx(7) - 90} f={f} bark /></Street> },
  { at: "Phones", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.6, -280), M(4, 3.0, -290))} f={f}>
    <Hero x={gx(4) + B / 2} f={f} expr="talk" open={0.2} holdR={{ node: <Phone on />, rot: 0, k: 1.2 }} pose={{ armR: [125, 25] }} /></Street> },
  { at: "grid", s: (g, f, len) => {
    const off = ip(g, [10, len - 10], [0, 1]);
    return <Street cam={camLerp(g, len, { x: 1600, y: 300, z: 0.65 }, { x: 1600, y: 330, z: 0.7 })} f={f} tod={off > 0.5 ? "dusk" : "dawn"} dark={off * 0.6} />;
  } },
  { at: "happened", s: (g, f, len) => <Frame tod="night"><rect width={1920} height={1080} fill="#0a0628" /><Stars f={f} /><Earth x={960} y={560} r={ip(g, [0, len], [330, 380])} f={f} /></Frame> },
  { at: "Eight", s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1500, y: 600, z: 1.0 }, { x: 1700, y: 500, z: 0.62 })} f={f} cars={false}>
    {Array.from({ length: 22 }, (_, i) => <Bean key={i} x={gx(-6 + i * 1.2) + (i % 2) * 60} y={GY + (i % 3) * 25} s={HS * (0.95 + (i % 3) * 0.05)} look={i === 9 ? HERO2D : LOOKS[i % 7]} f={f + i * 7} expr={i % 3 ? "shock" : "talk"} open={0.4} pose={{ armL: [20 + (i % 4) * 30, 30], armR: [40 + (i % 3) * 30, 20], tilt: Math.sin(f * 0.06 + i) * 9 }} />)}</Street> },
  { at: "very", s: (g, f, len) => <Street cam={camLerp(g, len, M(5.5, 0.9, -520), M(5.5, 1.05, -500))} f={f} trees={false} cars={false}>
    <FloatTree c={6} /><Hero x={gx(4) + 40} f={f} expr="neutral" pose={{ tilt: -12 }} /></Street> },
  { at: "Gravity", s: (g, f, len) => <Street cam={camLerp(g, len, M(5.5, 0.95, -520), M(5.5, 1.15, -460))} f={f} trees={false} cars={false}>
    <FloatTree c={6} /><Drop t="log" x={gx(6) + B / 2} y={GY - 20} f={f} />
    <Hero x={gx(4) + 40} f={f} expr="shock" open={0.9} sweat pose={{ armL: [150, 40], armR: [150, 40] }} /></Street> },
], { id: 1 });
