// Часть 3/7: деньги больше ничего не стоят — ценны дерево, камень, железо, алмазы.
import React from "react";
import { B, BANKER, Bean, Blk, Cam, Drop, Frame, G, GY, Glow, HERO2D, HS, INK, Item, LOOKS, Layer, Torch, Tower, Tree, Voice, camLerp, gx, gy, ip, makePart, walkPose, YEL } from "./kit";
import { Land, Street } from "./scenes";
import { VOICE } from "./voices/p3";

const V = VOICE as Voice;
const M = (c: number, z: number, dy = -200): Cam => ({ x: gx(c) + B / 2, y: GY + dy, z });
const Hero: React.FC<any> = (p) => <Bean y={GY} s={HS} look={HERO2D} {...p} />;
const swing = (f: number, sp = 0.45) => ({ armR: [120 - Math.max(0, Math.sin(f * sp)) * 70, -20] as [number, number], armL: [30, 40] as [number, number], lean: 3 });
const PICK = (t: "pick" | "dpick" = "pick") => ({ node: <Item t={t} />, rot: -40 });
const KID = { head: "#f8f6f0", body: "#4fa36a", body2: "#2f7a4a", limb: "#262838", shoe: "#e0524a", hat: "beanie" as const, hatC: "#3a8af0", hatC2: "#ffffff" };

// разрез под землёй: слои камня, руды, лава, коренная порода
const Under: React.FC<{ cam: Cam; f: number; dark?: number; children?: React.ReactNode; tunnel?: boolean }> = ({ cam, f, dark = 0.3, children, tunnel = true }) => (
  <Frame tod="night" dark={dark}>
    <Layer cam={cam} d={1}>
      <rect x={-3000} y={-3000} width={9000} height={3900} fill="url(#sky-day)" /><rect x={-3000} y={GY} width={9000} height={6000} fill="#2a2448" />
      {Array.from({ length: 22 * 16 }, (_, i) => {
        const c = -6 + (i % 22), r = -1 - Math.floor(i / 22);
        const ore = (c * 7 + r * 13 + 100) % 17;
        let t: any = r === -1 ? "grass" : r > -4 ? "dirt" : r < -14 ? "bedrock" : ore === 3 ? "coal" : ore === 7 && r < -5 ? "iron" : ore === 11 && r < -11 ? "diamond" : ore === 5 && r < -9 ? "gold" : r < -12 && c > 8 ? "lava" : "stone";
        if (tunnel && ((r === -8 && c > -2 && c < 9) || (r === -9 && c > -2 && c < 9) || (c === -1 && r > -9))) return null;
        return <G key={i} c={c} r={r} t={t} f={f} />;
      })}
      <Glow x={gx(12)} y={gy(-13)} r={900} g="gO" o={0.6} />
      {children}
    </Layer>
  </Frame>
);

export const P3 = makePart(V, [
  { at: "", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.0, -400), M(4, 1.2, -380))} f={f} tod="day">
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={gx(1 + i * 0.7) + Math.sin(f * 0.07 + i) * 60} y={GY - 900 + ((g * (5 + (i % 3)) + i * 90) % 900)} width={70} height={70} fill="#7ac87a" stroke={INK} strokeWidth={5} transform={`rotate(${f * 3 + i * 40} ${gx(1 + i * 0.7) + 35} ${GY - 865 + ((g * (5 + (i % 3)) + i * 90) % 900)})`} />)}
    <Bean x={gx(3)} y={GY} s={HS} look={BANKER} f={f} expr="shock" open={0.6} pose={{ armL: [150, 20], armR: [150, 20] }} />
    <Hero x={gx(6)} f={f} expr="sad" pose={{ armR: [90, 0] }} />
  </Street> },
  { at: "Bank", s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 0.85, -500), M(5, 0.95, -480))} f={f} tod="day" trees={false} cars={false}>
    {Array.from({ length: 7 }, (_, i) => <G key={"t" + i} c={2 + i} r={4} t="stone" col="#d8d4e8" />)}
    {[2, 4, 6, 8].map((c) => [0, 1, 2, 3].map((r) => <G key={c + "_" + r} c={c} r={r} t="stone" col="#e8e4f4" />))}
    <rect x={gx(5)} y={gy(1)} width={B} height={B * 2} fill="#1a1428" stroke={INK} strokeWidth={5} />
    <Bean x={gx(3) + B / 2} y={GY} s={HS} look={BANKER} f={f} expr="sad" pose={{ armL: [150, 60], armR: [150, 60], tilt: Math.sin(f * 0.3) * 4 }} />
  </Street> },
  { at: "valuable", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 2.2, -270), M(4, 2.5, -280))} f={f} tod="day">
    <Hero x={gx(4) + B / 2} f={f} expr="neutral" pose={{ armR: [150, 70], armL: [20, 30], tilt: 10 }} />
  </Street> },
  { at: "Wood", n: 1, s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
    <Glow x={960} y={540} r={500} g="gY" o={0.5} /><g transform={`translate(960 560) scale(${3 + Math.sin(f * 0.1) * 0.1}) rotate(${Math.sin(f * 0.06) * 10})`}><Item t="log" /></g>
  </Land> },
  { at: "Every", s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
    {(["log", "plank", "stick", "pick", "sword"] as const).map((t, i) => <g key={t} opacity={ip(g, [i * 6, i * 6 + 6], [0, 1])}><Item t={t} x={360 + i * 300} y={560 - (t === "pick" || t === "sword" ? 20 : 0)} s={1.6} /></g>)}
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${480 + i * 300} 560 l 40 0 l -14 -14 m 14 14 l -14 14`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" opacity={ip(g, [i * 6 + 4, i * 6 + 8], [0, 1])} />)}
  </Land> },
  { at: "Yes", s: (g, f, len) => <Land cam={camLerp(g, len, M(3.5, 2.0, -280), M(3.5, 2.3, -300))} f={f}>
    {Array.from({ length: 14 }, (_, i) => <G key={i} c={-3 + i} r={-1} t="grass" />)}<Tree c={4} h={4} />
    {[0.25, 0.5, 0.75].map((q, i) => (g > (i + 1) * 12 ? <path key={i} d={`M ${gx(4) + B * q} ${gy(0) + 30} l 20 40 l -26 30 l 18 40`} stroke={INK} strokeWidth={6} fill="none" /> : null))}
    <Hero x={gx(3) + 20} f={f} expr="talk" open={0.4} pose={{ armR: [80 + Math.max(0, Math.sin(f * 0.6)) * 15, -60 + Math.max(0, Math.sin(f * 0.6)) * 60], armL: [30, 40], lean: 4 }} />
  </Land> },
  { at: "pops", s: (g, f, len) => <Land cam={camLerp(g, len, M(3.5, 2.0, -280), M(3.3, 2.2, -280))} f={f}>
    {Array.from({ length: 14 }, (_, i) => <G key={i} c={-3 + i} r={-1} t="grass" />)}<Tree c={4} h={4} cut={1} />
    {g < 30 ? <Drop t="log" x={gx(4) + B / 2 - g * 8} y={GY - 40 - Math.sin(g / 30 * Math.PI) * 150} f={f} s={0.6 - g * 0.01} /> : null}
    <Hero x={gx(3) + 20} f={f} expr="grin" pose={{ armR: [30, 60], armL: [30, 40] }} />
  </Land> },
  { at: "Stone", n: 1, s: (g, f, len) => <Under cam={camLerp(g, len, { x: gx(2), y: gy(-9) + 40, z: 1.6 }, { x: gx(3), y: gy(-9) + 40, z: 1.8 })} f={f}>
    <Hero x={gx(3)} y={gy(-10)} f={f} expr="talk" open={0.3} holdR={PICK()} pose={swing(f)} /><Torch x={gx(1) + 100} y={gy(-10)} f={f} />
  </Under> },
  { at: "coal", n: 1, s: (g, f, len) => <Under cam={{ x: gx(3) + 100, y: gy(-5) + 100, z: 2.6 + g * 0.01 }} f={f} tunnel={false}><G c={3} r={-5} t="coal" f={f} /><Glow x={gx(3) + 100} y={gy(-5) + 100} r={300} g="gW" o={0.4} /></Under> },
  { at: "iron", n: 1, s: (g, f, len) => <Under cam={{ x: gx(4) + 100, y: gy(-6) + 100, z: 2.6 + g * 0.01 }} f={f} tunnel={false}><G c={4} r={-6} t="iron" f={f} /><Glow x={gx(4) + 100} y={gy(-6) + 100} r={300} g="gW" o={0.4} /></Under> },
  { at: "deep", s: (g, f, len) => <Under cam={camLerp(g, len, { x: gx(4), y: gy(-2), z: 0.8 }, { x: gx(8), y: gy(-12), z: 1.3 })} f={f} tunnel={false} /> },
  { at: "Finding", s: (g, f, len) => <Under cam={camLerp(g, len, { x: gx(6), y: gy(-9) + 40, z: 1.5 }, { x: gx(7), y: gy(-9) + 40, z: 1.7 })} f={f} dark={0.6}>
    {Array.from({ length: 3 }, (_, i) => <G key={i} c={9} r={-8 - i} t="lava" f={f} />)}<Glow x={gx(9)} y={gy(-10)} r={500} g="gO" />
    <Hero x={gx(7) + B / 2} y={gy(-10)} f={f} expr="shock" open={0.3} sweat holdR={PICK()} pose={swing(f, 0.3)} /><Torch x={gx(5) + 100} y={gy(-10)} f={f} />
  </Under> },
  { at: "Within", s: (g, f, len) => {
    const tilt = ip(g, [5, 25], [0, -14], (t) => 1 - Math.pow(1 - t, 3));
    return <Land cam={{ x: 960, y: 600, z: 1 }} f={f}>
      <rect x={880} y={700} width={160} height={260} fill="#a86a3a" stroke={INK} strokeWidth={6} />
      <g transform={`rotate(${tilt} 960 700)`}>
        <rect x={360} y={680} width={1200} height={40} fill="#c88a4a" stroke={INK} strokeWidth={6} />
        <g transform="translate(470 680)"><Item t="diamond" s={2.2} y={-60} /></g>
        <g transform="translate(1250 680) scale(0.5)">{[0, 1, 2].map((c) => [0, 1].map((r) => <Blk key={c + "_" + r} x={c * B} y={-(r + 1) * B} t={r === 1 ? "brick" : "planks"} />))}</g>
      </g>
    </Land>;
  } },
  { at: "Office", s: (g, f, len) => <Street cam={camLerp(g, len, M(2, 1.1, -320), M(6, 1.1, -320))} f={f} tod="day">
    {[0, 1, 2, 3].map((i) => <Bean key={i} x={gx(1) + i * 230 + g * 6} y={GY} s={HS} look={i === 2 ? BANKER : { ...LOOKS[i], body: "#ffffff", body2: "#3a56c0" }} f={f + i * 8} expr="grin" holdR={PICK()} pose={{ ...walkPose(f + i * 8), armR: [120, -20] }} />)}
  </Street> },
  { at: "Bankers", s: (g, f, len) => <Under cam={camLerp(g, len, { x: gx(0), y: gy(3), z: 0.6 }, { x: gx(1), y: gy(-8), z: 1.1 })} f={f}>
    <g transform={`translate(0 0)`}><Tower c={-3} w={4} h={8} col="#5a6ad8" seed={4} lit={0.3} /></g>
    <Bean x={gx(1)} y={gy(-10)} s={HS} look={BANKER} f={f} expr="talk" open={0.3} holdR={PICK()} pose={swing(f)} />
  </Under> },
  { at: "richest", s: (g, f, len) => <Street cam={camLerp(g, len, M(4, 1.5, -260), M(4, 1.9, -280))} f={f} tod="day">
    {Array.from({ length: 9 }, (_, i) => <Item key={i} t="diamond" x={gx(5) + (i % 3) * 70} y={GY - 50 - Math.floor(i / 3) * 60} s={0.9} />)}
    <Bean x={gx(4)} y={GY} s={HS * 0.85} look={KID} f={f} expr="smirk" holdR={{ node: <Item t="dpick" />, rot: -40 }} pose={{ armR: [120, -20], armL: [20, 30] }} />
  </Street> },
  { at: "Shops", s: (g, f, len) => <Street cam={camLerp(g, len, M(4.5, 1.5, -280), M(4.5, 1.7, -290))} f={f} tod="day" cars={false}>
    <rect x={gx(5)} y={GY - 260} width={B * 2} height={260} fill="#c88a4a" stroke={INK} strokeWidth={5} />
    <path d={`M ${gx(5) - 30} ${GY - 520} H ${gx(7) + 30} L ${gx(7)} ${GY - 440} H ${gx(5)} Z`} fill="#e04a5a" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => <rect key={i} x={gx(5) + i * 133} y={GY - 520} width={66} height={80} fill="#ffffff" opacity={0.9} />)}
    {[gx(5) + 10, gx(7) - 30].map((x, i) => <rect key={"p" + i} x={x} y={GY - 440} width={20} height={180} fill="#8a5428" stroke={INK} strokeWidth={4} />)}
    <Item t="bread" x={gx(5) + 90} y={GY - 300} s={0.9} /><Item t="steak" x={gx(6) + 100} y={GY - 300} s={0.9} />
    <Bean x={gx(6) + 60} y={GY - 120} s={HS} look={LOOKS[5]} f={f} expr="grin" pose={{ armL: [60, 30] }} />
    <Hero x={gx(4)} f={f} expr="smirk" holdR={{ node: <Item t="ingot" />, rot: 0 }} pose={{ armR: [80, 0] }} />
  </Street> },
  { at: "Gold", n: 1, s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
    {Array.from({ length: 6 }, (_, i) => <Item key={i} t="goldingot" x={760 + (i % 3) * 140 + (i > 2 ? 70 : 0)} y={700 - (i > 2 ? 60 : 0)} s={1.4} />)}
    <path d={`M 1300 300 L 1450 ${300 + ip(g, [5, 30], [0, 360])} `} stroke="#ff3a5a" strokeWidth={22} strokeLinecap="round" />
    <path d={`M 1410 ${ip(g, [5, 30], [300, 660])} l 40 40 l 40 -40`} stroke="#ff3a5a" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(-30 -10)`} />
  </Land> },
  { at: "loaf", s: (g, f, len) => <Land cam={{ x: 960, y: 540, z: 1 }} f={f}>
    <Item t="bread" x={620} y={560} s={2.4} /><path d="M 860 520 h 200 m -40 -30 l 40 30 l -40 30 M 1060 600 h -200 m 40 -30 l -40 30 l 40 30" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /><Item t="ingot" x={1300} y={560} s={2.4} />
  </Land> },
  { at: "diamond", n: 2, s: (g, f, len) => <Street cam={camLerp(g, len, { x: 1500, y: 450, z: 0.7 }, { x: 1700, y: 450, z: 0.75 })} f={f} tod="day" cars={false}>
    <g transform={`translate(${gx(3)} ${GY - 500}) scale(2.2)`}><Glow x={0} y={0} r={200} g="gC" /><Item t="dpick" f={f} /></g>
    <path d={`M ${gx(4) + 100} ${GY - 520} h 200 m -40 -30 l 40 30 l -40 30`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Street> },
  { at: "Everyone", s: (g, f, len) => <Under cam={camLerp(g, len, { x: gx(4), y: gy(-4), z: 0.6 }, { x: gx(4), y: gy(-5), z: 0.68 })} f={f} tunnel={false}>
    {[[-3, -3], [0, -5], [3, -4], [6, -7], [9, -3], [12, -6], [-1, -9], [5, -11]].map(([c, r], i) => <g key={i}>
      {[0, 1].map((k) => <rect key={k} x={gx(c) - 40} y={gy(r) - k * B} width={B + 80} height={B + 4} fill="#2a2448" />)}
      <Bean x={gx(c) + B / 2} y={gy(r) + B} s={HS} look={LOOKS[i % 7]} f={f + i * 7} expr="talk" open={0.3} holdR={PICK()} pose={swing(f + i * 7)} /></g>)}
  </Under> },
  { at: "build", n: 2, s: (g, f, len) => <Street cam={camLerp(g, len, M(5, 1.0, -400), M(5, 0.85, -450))} f={f} tod="day" cars={false}>
    {Array.from({ length: 15 }, (_, i) => <G key={i} c={6 + (i % 5)} r={Math.floor(i / 5)} t={(["stone", "planks", "brick", "gold", "glass"] as const)[i % 5]} />)}
    <Hero x={gx(4) + 60} f={f} expr="grin" pose={{ armL: [150, 30], armR: [150, 30] }} />
  </Street> },
], { id: 3 });
export { YEL, Tree };
