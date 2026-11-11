// Часть 10/10: дни 29–30 — голос по радио, вертолёт, спасение, огни возвращаются.
import React from "react";
import { Bean, BeanLook, Cam, Glow, HERO2D, Layer, SoundRings, Voice, camLerp, ip, makePart } from "../sp/kit";
import { Apartment, ChalkHero, GY, HS, Hero, INK, Skyline, Svg, YEL, chalkCam, walk, walkDx } from "./scenes";
import { BikeRig, RIDER } from "./part5";
import { Beacon, Mirror, RY, TopRoof } from "./part9";
import { VOICE } from "./voices/p10";

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const RESCUER: BeanLook = { head: "#f2e2c8", body: "#e04a3a", body2: "#f4f2ff", limb: "#262838", shoe: "#1a1a22", hat: "bowler", hatC: "#f4f2ff", hatC2: "#ff4a3a" };
const Night: React.FC<{ o: number }> = ({ o }) => <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect width={1920} height={1080} fill="#03020c" opacity={o} /></svg>;
// вертолёт (смотрит вправо); rot — винт
const Heli: React.FC<{ x: number; y: number; s?: number; f: number; flip?: boolean }> = ({ x, y, s = 1, f, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -420 -60 L -160 -80 L -160 -40 L -420 -40 Z" fill="#e8e4ff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -440 -130 L -400 -130 L -380 -40 L -420 -40 Z" fill="#ff4a3a" stroke={INK} strokeWidth={7} />
    <path d="M -200 -120 Q -200 -200 -60 -200 L 120 -200 Q 260 -190 270 -80 Q 270 0 160 0 L -140 0 Q -200 0 -200 -60 Z" fill="#ff4a3a" stroke={INK} strokeWidth={9} />
    <path d="M 80 -180 Q 230 -170 240 -90 L 80 -90 Z" fill="#9fdcff" stroke={INK} strokeWidth={7} />
    <rect x={-120} y={-170} width={150} height={100} rx={12} fill="#9fdcff" stroke={INK} strokeWidth={6} />
    <rect x={-190} y={-90} width={460} height={18} fill="#f4f2ff" />
    <rect x={-20} y={-240} width={40} height={40} fill="#3a3a5a" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-246} rx={420 * Math.abs(Math.cos(f * 1.1))} ry={14} fill="#c8c4e0" stroke={INK} strokeWidth={5} />
    <path d="M -150 30 L 210 30 M -100 0 L -110 30 M 160 0 L 170 30" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
    <circle cx={-420} cy={-60} r={24 * Math.abs(Math.sin(f * 1.4))} fill="#c8c4e0" opacity={0.7} />
  </g>
);
// палаточный лагерь спасателей
const Camp: React.FC<{ f: number }> = ({ f }) => <g>
  {[200, 700, 1300, 1800].map((x, i) => <g key={x}><path d={`M ${x - 200} ${GY} L ${x} ${GY - 260} L ${x + 200} ${GY} Z`} fill={["#5ac84a", "#ff8a3a", "#5a7cf0", "#ffd23c"][i]} stroke={INK} strokeWidth={7} strokeLinejoin="round" /><path d={`M ${x} ${GY - 260} L ${x - 40} ${GY} L ${x + 40} ${GY} Z`} fill="#1a1a3a" stroke={INK} strokeWidth={5} /></g>)}
  <g transform={`translate(1000 ${GY})`}><Glow x={0} y={-60} r={200} g="gO" />{[[-30, 0.9], [20, 1.1], [0, 1.3]].map(([dx, k], i) => <path key={i} d={`M ${dx - 30} 0 Q ${dx - 30} ${-60 * k} ${dx + Math.sin(f * 0.4 + i) * 8} ${-110 * k} Q ${dx + 30} ${-60 * k} ${dx + 30} 0 Z`} fill={["#ff4a3a", "#ff8a3a", YEL][i]} stroke={INK} strokeWidth={5} />)}</g>
</g>;
const Tears: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => <g>{[-1, 1].map((k) => <ellipse key={k} cx={x + k * 20} cy={y + ((g * 3) % 50)} rx={8} ry={12} fill="#8fd4ff" stroke={INK} strokeWidth={3} />)}</g>;
const Mic: React.FC = () => <g><rect x={-14} y={-40} width={28} height={40} rx={12} fill="#262838" stroke={INK} strokeWidth={4} /><path d="M 0 0 Q 20 60 70 40" stroke={INK} strokeWidth={5} fill="none" /></g>;
const BX = 1700;

export const P10 = makePart(V, [
  // день 29: снова радио
  { at: "", s: (g, f, len) => <Apartment cam={C(1500, GY - 260, 1.5)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={g * 0.25} on f={f} front />{RIDER(BX, g * 0.25, f, "tired")}</Apartment> },
  { at: "Static", n: 1, s: (g, f, len) => <Apartment cam={C(1180, GY - 140, 2.6)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={g * 0.25} on f={f} />
    {[0, 1].map((i) => <path key={i} d={`M ${1180 + i * 50} ${GY - 260 - i * 40} ${Array.from({ length: 6 }, (_, k) => `l 14 ${((f + k + i) % 2 ? -1 : 1) * (14 + ((f * 7 + k * 3) % 10))}`).join(" ")}`} stroke="#e8e4ff" strokeWidth={5} fill="none" />)}</Apartment> },
  // голос!
  { at: "And", n: 2, s: (g, f, len) => <Apartment cam={C(1180, GY - 140, 2.6)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={0.6} on f={f} /><SoundRings x={1180} y={GY - 160} f={f} c={YEL} n={3} /><Glow x={1180} y={GY - 100} r={200} g="gY" o={0.6} /></Apartment> },
  { at: "Broken", s: (g, f, len) => <Apartment cam={C(BX - 60, GY - 330, 2.4)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={0.6} on f={f} front />{RIDER(BX, 0.6, f, "shock")}</Apartment> },
  { at: "pedal", n: 2, s: (g, f, len) => <Apartment cam={C(1500, GY - 280, 1.6)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={g * 0.5} on f={f} front />
    <g>{RIDER(BX, g * 0.5, f, "determined", true)}</g></Apartment> },
  { at: "shouting", s: (g, f, len) => <Apartment cam={C(1000, GY - 230, 1.9)} f={f} tally={29} dark={0.3}><BikeRig x={BX} ped={0.6} on f={f} />
    <Hero x={950} y={GY} f={f} expr="talk" open={0.5 + 0.4 * Math.abs(Math.sin(f * 0.6))} sweat pose={{ armR: [120, 70], armL: [60, 40] }} holdR={{ node: <Mic />, k: 1.3 }} /></Apartment> },
  { at: "radio", n: 2, s: (g, f, len) => <Apartment cam={C(1180, GY - 140, 2.6)} f={f} tally={29} dark={0.45}><BikeRig x={BX} ped={0.6} f={f} /></Apartment> },
  { at: "sleep", s: (g, f, len) => <Apartment cam={C(700, GY - 250, 1.8)} f={f} tally={29} tod="night" dark={0.55}>
    <Bean x={640} y={GY} s={HS} look={HERO2D} f={f} expr="worried" gaze={1} sit={70 / HS} pose={{ armL: [30, 40], armR: [30, 40] }} /></Apartment> },
  // день 30
  { at: "Day", n: 2, s: (g, f, len) => <Apartment cam={chalkCam(29)} f={f} tally={g > 15 ? 30 : 29} tod="dawn" dark={0.2}><ChalkHero i={29} g={g} f={f} expr="determined" /></Apartment> },
  { at: "sunrise", s: (g, f, len) => <Apartment cam={C(1450, 520, 1.6)} f={f} tally={30} tod="dawn" dark={0.1}>
    <Hero x={1360} y={GY} f={f} expr={g > 20 ? "shock" : "neutral"} open={0.4} gaze={1} pose={{ tilt: 12, armL: [15, 8], armR: [15, 8] }} /><SoundRings x={1700} y={GY - 550} f={f} c="#ffffff" n={3} /></Apartment> },
  { at: "run", s: (g, f, len) => <TopRoof cam={C(900 + walkDx(g, 0.35) * 0.8, RY - 250, 1.0)} f={f} tod="dawn" sos={3}><Beacon x={1700} f={f} />
    <Hero x={500 + walkDx(g, 0.35)} y={RY} f={f} expr="determined" pose={{ ...walk(g, 0.35), lean: 10 }} /></TopRoof> },
  { at: "mirror", s: (g, f, len) => <TopRoof cam={C(960, RY - 250, 1.4)} f={f} tod="dawn" sos={3}>
    <Hero x={960} y={RY} f={f} expr="determined" pose={{ armR: [150 + Math.sin(f * 0.6) * 15, 10], armL: [15, 8] }} holdR={{ node: <Mirror k={0.7} />, k: 1 }} />{g % 16 < 6 ? <Glow x={1060} y={RY - 380} r={240} g="gW" /> : null}</TopRoof> },
  { at: "beacon", s: (g, f, len) => <TopRoof cam={C(1400, RY - 250, 1.3)} f={f} tod="dawn" sos={3}><Beacon x={1600} f={f} on={(f % 10) < 5 ? 1 : 0} /><Hero x={1350} y={RY} f={f} expr="determined" pose={{ armR: [90, 20] }} /></TopRoof> },
  { at: "arms", s: (g, f, len) => <TopRoof cam={C(960, RY - 260, 1.6)} f={f} tod="dawn" sos={3}>
    <Hero x={960} y={RY} f={f} expr="talk" open={0.6} pose={{ armL: [160 + Math.sin(f * 0.5) * 15, 10], armR: [160 - Math.sin(f * 0.5) * 15, 10], bob: Math.abs(Math.sin(f * 0.25)) * 12 }} /></TopRoof> },
  // вертолёт
  { at: "there", n: 1, s: (g, f, len) => <Svg><Skyline cam={C(960, 600, 0.6)} f={f} tod="dawn" midBase={GY + 100} /><Heli x={ip(g, [0, len], [2200, 1500])} y={300} s={0.6} f={f} flip /></Svg> },
  { at: "helicopter", s: (g, f, len) => <Svg><Skyline cam={C(960, 600, 0.6)} f={f} tod="dawn" midBase={GY + 100} /><Heli x={ip(g, [0, len], [1500, 800])} y={ip(g, [0, len], [300, 380])} s={0.7} f={f} flip /></Svg> },
  { at: "turning", s: (g, f, len) => <TopRoof cam={C(900, RY - 150, 0.75)} f={f} tod="dawn" sos={3}><Heli x={ip(g, [0, len], [1700, 1100])} y={ip(g, [0, len], [RY - 900, RY - 600])} s={0.9} f={f} flip />
    <Hero x={500} y={RY} f={f} expr="grin" pose={{ armL: [165, 10], armR: [165, 10] }} /></TopRoof> },
  { at: "lands", s: (g, f, len) => <TopRoof cam={C(1000, RY - 250, 0.9)} f={f} tod="dawn" sos={3}><Heli x={1300} y={RY - ip(g, [0, 20], [300, 30])} s={0.9} f={f} flip />
    <Hero x={500} y={RY} f={f} expr="shock" open={0.5} pose={{ armL: [40, 30], armR: [40, 30] }} /></TopRoof> },
  { at: "stranger", s: (g, f, len) => <TopRoof cam={C(900, RY - 250, 1.2)} f={f} tod="dawn" sos={3}><Heli x={1400} y={RY - 30} s={0.9} f={f} flip />
    <Bean x={ip(g, [0, 20], [1180, 1020])} y={RY} s={HS} look={RESCUER} f={f} expr="grin" flip pose={{ armR: [70, 40], armL: [20, 10] }} />
    <Hero x={650} y={RY} f={f} expr="shock" open={0.4} pose={{ armL: [30, 30], armR: [30, 30] }} /></TopRoof> },
  { at: "first", s: (g, f, len) => <TopRoof cam={C(840, RY - 270, 2.0)} f={f} tod="dawn" sos={3}>
    <Bean x={980} y={RY} s={HS} look={RESCUER} f={f} expr="grin" flip pose={{ armR: [80, 30] }} />
    <Hero x={720} y={RY} f={f} expr="sad" open={0.3} pose={{ armL: [40, 60], armR: [40, 60] }} /></TopRoof> },
  { at: "crying", s: (g, f, len) => <TopRoof cam={C(720, RY - 280, 3.0)} f={f} tod="dawn" sos={3}>
    <Bean x={980} y={RY} s={HS} look={RESCUER} f={f} expr="grin" flip pose={{ armR: [80, 30] }} />
    <Hero x={720} y={RY} f={f} expr="sad" open={0.4} pose={{ armL: [40, 60], armR: [40, 60] }} /><Tears x={720} y={RY - 270} g={g} /></TopRoof> },
  { at: "They", s: (g, f, len) => <TopRoof cam={C(850, RY - 260, 1.6)} f={f} tod="dawn" sos={3}>
    <Bean x={980} y={RY} s={HS} look={RESCUER} f={f} expr="talk" open={0.3 + 0.3 * Math.abs(Math.sin(f * 0.4))} flip pose={{ armR: [90 + Math.sin(f * 0.2) * 20, 40] }} />
    <Hero x={720} y={RY} f={f} expr="neutral" pose={{ armL: [15, 8], armR: [15, 8] }} /></TopRoof> },
  { at: "next", s: (g, f, len) => <Svg><Skyline cam={C(960, 520, 0.8)} f={f} tod="dawn" midBase={GY + 100} lights={0.15} />
    <Heli x={ip(g, [0, len], [700, 1500])} y={ip(g, [0, len], [500, 250])} s={0.6} f={f} flip={false} /></Svg> },
  // лагерь, огни возвращаются
  { at: "That", n: 5, s: (g, f, len) => <><Svg><Layer cam={C(1000, 560, 0.9)} d={0.05}><rect x={-3000} y={-2500} width={9000} height={4000} fill="url(#bo-night)" /></Layer>
    <Layer cam={C(1000, 560, 0.9)} d={1}><rect x={-3000} y={GY} width={9000} height={800} fill="#3a4a3a" stroke={INK} strokeWidth={6} /><Camp f={f} />
      <rect x={1130} y={GY - 70} width={140} height={70} rx={30} fill="#8a5a3a" stroke={INK} strokeWidth={6} /><Bean x={1200} y={GY} s={HS} look={HERO2D} f={f} expr="neutral" sit={70 / HS} pose={{ armL: [60, 40], armR: [60, 40] }} /></Layer></Svg><Night o={0.2} /></> },
  { at: "watch", s: (g, f, len) => <Svg><Skyline cam={C(960, 520, 0.8)} f={f} tod="night" midBase={GY + 60} lights={0} /></Svg> },
  { at: "one", n: 3, s: (g, f, len) => <Svg><Skyline cam={camLerp(g, len, C(960, 520, 0.8), C(960, 520, 0.7))} f={f} tod="night" midBase={GY + 60} lights={ip(g, [0, len], [0, 1])} /></Svg> },
  { at: "Could", s: (g, f, len) => <><Svg><Layer cam={C(1200, GY - 200, 1.6)} d={0.05}><rect x={-3000} y={-2500} width={9000} height={4000} fill="url(#bo-night)" /></Layer>
    <Layer cam={C(1200, GY - 200, 1.6)} d={1}><rect x={-3000} y={GY} width={9000} height={800} fill="#3a4a3a" stroke={INK} strokeWidth={6} /><Camp f={f} />
      <rect x={1130} y={GY - 70} width={140} height={70} rx={30} fill="#8a5a3a" stroke={INK} strokeWidth={6} /><Bean x={1200} y={GY} s={HS} look={HERO2D} f={f} expr="grin" sit={70 / HS} pose={{ armL: [60, 40], armR: [60, 40] }} /></Layer></Svg><Night o={0.15} /></> },
  { at: "Tell", n: 2, s: (g, f, len) => <Svg><Skyline cam={camLerp(g, len, C(960, 520, 0.7), C(960, 500, 0.6))} f={f} tod="night" midBase={GY + 60} lights={1} /></Svg> },
], { id: 10, dir: "bo", last: true });
