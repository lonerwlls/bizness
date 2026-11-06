// Часть 4/8: видео разлетелось — журналисты, учёные, генералы, весь мир.
import React from "react";
import { Bay, Bean, Cam, Car, DOC, Drone, FlyHero, Flashes, Frame, GENERAL, GY, Glow, HERO2D, HS, HeroHouse, INK, LOOKS, MOM, Mic, NewsVan, Phone, Planet, Room, SUIT, Shield, Sky, SoundRings, Syringe, Tank, Thought, Town, Voice, YEL, atWord, camLerp, floatPose, ip, makePart, shake, walkPose } from "./kit";
import { VOICE } from "./voices/p4";
import { CEIL } from "./kit";
const CEILY = CEIL + 140;

const V = VOICE as Voice;
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const Hero: React.FC<any> = (p) => <Bean s={HS} look={HERO2D} {...p} />;
const since = (w: string, from: string, g: number, n = 1, nf = 1) => g - (atWord(V, w, n) - atWord(V, from, nf) + 3);
const Heart: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#ff4a6a" }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 30 L -34 -4 Q -46 -32 -20 -40 Q 0 -42 0 -18 Q 0 -42 20 -40 Q 46 -32 34 -4 Z" fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
// большой телефон, на экране — ролик с героем над бухтой
const BigPhone: React.FC<{ g: number; f: number; blur?: boolean; likes?: number }> = ({ g, f, blur, likes = 0 }) => (
  <g>
    <rect x={660} y={60} width={600} height={1000} rx={60} fill="#262838" stroke={INK} strokeWidth={10} />
    <clipPath id="bp"><rect x={690} y={110} width={540} height={900} rx={24} /></clipPath>
    <g clipPath="url(#bp)">
      <rect x={690} y={110} width={540} height={900} fill="url(#skyS)" />
      <rect x={690} y={640} width={540} height={400} fill="url(#sea)" />
      <circle cx={1050} cy={600} r={70} fill="#ffe9a0" stroke={INK} strokeWidth={5} />
      <g filter={blur ? "url(#blur4)" : undefined} transform={`translate(${Math.sin(f * 0.9) * 8} ${Math.cos(f * 0.7) * 8})`}>
        <FlyHero cx={720 + ((g * 9) % 600)} cy={420} f={f} s={0.3} />
        {g % 40 > 30 ? <circle cx={720 + ((g * 9) % 600) + 60} cy={430} r={(g % 40 - 30) * 14} fill="none" stroke="#fff" strokeWidth={8} /> : null}
      </g>
      <rect x={690} y={930} width={540} height={14} fill="#3a2a6a" /><rect x={690} y={930} width={540 * ((g % 90) / 90)} height={14} fill="#ff4a6a" />
    </g>
    {Array.from({ length: likes }, (_, i) => { const t = ((g * 2 + i * 17) % 70) / 70; return <Heart key={i} x={1180 + Math.sin(i * 2 + t * 6) * 40} y={950 - t * 700} s={0.8 + (i % 3) * 0.2} c={["#ff4a6a", "#ff6fb5", YEL][i % 3]} />; })}
  </g>
);

export const P4 = makePart(V, [
  { at: "", s: (g, f, len) => <Frame bg="#4a3098"><rect width={1920} height={1080} fill="url(#wall)" /><g transform={`translate(960 540) scale(${ip(g, [0, len], [0.9, 1.0])}) translate(-960 -560)`}><BigPhone g={g} f={f} likes={6} /></g></Frame> },
  { at: "Ten", s: (g, f, len) => <Frame bg="#4a3098"><rect width={1920} height={1080} fill="url(#wall)" />
    {Array.from({ length: 12 }, (_, i) => { const x = 210 + (i % 6) * 300, y = 300 + Math.floor(i / 6) * 460, on = g > i * 3; return on ? <g key={i} transform={`translate(${x} ${y}) scale(2.8)`}><Phone /><Heart x={30} y={-70} s={0.5} /></g> : null; })}
    {Array.from({ length: 10 }, (_, i) => { const t = ((g * 3 + i * 23) % 80) / 80; return <Heart key={"h" + i} x={100 + i * 190} y={1100 - t * 1200} s={0.9} c={["#ff4a6a", "#ff6fb5", YEL][i % 3]} />; })}
  </Frame> },
  { at: "blurry", s: (g, f, len) => <Frame bg="#4a3098"><rect width={1920} height={1080} fill="url(#wall)" /><g transform="translate(960 540) scale(1.25) translate(-960 -560)"><BigPhone g={g} f={f} blur likes={3} /></g></Frame> },
  // дом в осаде
  { at: "morning", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 520, 0.85), C(960, 560, 0.95))} f={f} houses={false}>
    <HeroHouse />
    <NewsVan x={300} y={GY + 40} /><NewsVan x={1650} y={GY + 40} c="#ffd23c" flip />
    {[[520, 2], [620, 3], [1320, 5], [1430, 0]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 50} s={HS * 0.9} look={LOOKS[l]} f={f + i * 5} expr="talk" open={0.4} pose={{ armR: [110, 30] }} holdR={{ node: <Mic c={["#ff4a6a", "#5ae0ff", YEL, "#ff6fb5"][i]} />, k: 1.2 }} />)}
  </Town> },
  { at: "Reporters", s: (g, f, len) => <Town cam={camLerp(g, len, C(1080, 640, 1.6), C(1080, 640, 1.8))} f={f} houses={false}>
    <HeroHouse />
    {[[850, 2], [960, 3], [1250, 5], [1360, 0]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 50} s={HS} look={LOOKS[l]} f={f + i * 5} expr="talk" open={0.3 + 0.4 * Math.abs(Math.sin(f * 0.4 + i))} flip={x > 1100} pose={{ armR: [120, 20], lean: 4 }} holdR={{ node: <Mic c={["#ff4a6a", "#5ae0ff", YEL, "#ff6fb5"][i]} />, k: 1.2 }} />)}
    <Flashes f={f} pts={[[800, 560], [1300, 520], [1000, 480]]} />
  </Town> },
  { at: "Drones", s: (g, f, len) => <Room cam={camLerp(g, len, C(1450, 480, 1.5), C(1450, 480, 1.65))} f={f}>
    <Drone x={1440} y={260} f={f} s={0.6} /><Drone x={1660} y={330} f={f + 9} s={0.5} />
    <Hero x={1300} y={GY} f={f} expr="shock" open={0.4} sweat pose={{ armL: [40, 60] }} />
  </Room> },
  { at: "mom", s: (g, f, len) => <Room cam={camLerp(g, len, C(700, GY - 280, 2.0), C(700, GY - 280, 2.2))} f={f} kind="kitchen" win={false}>
    <Bean x={700} y={GY} s={HS} look={MOM} f={f} expr="shock" open={0.6} sweat pose={{ armR: [150, 30], armL: [130, 60], tilt: Math.sin(f * 0.4) * 6 }} holdR={{ node: <g transform={`rotate(${Math.sin(f * 2) * 8})`}><Phone /></g>, k: 1.3 }} />
    <SoundRings x={830} y={GY - 470} f={f * 2} c={YEL} n={3} />
  </Room> },
  // серьёзные люди
  { at: "serious", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 560, 1.0), C(960, 600, 1.15))} f={f} houses={false}>
    <HeroHouse />
    <Car x={ip(g, [0, 20], [-300, 500])} y={GY + 60} c="#262838" lights />
    {[1300, 1500].map((x, i) => <Bean key={i} x={x} y={GY + 50} s={HS} look={SUIT} f={f} expr="neutral" pose={walkPose(f, 0.2, i)} flip />)}
  </Town> },
  { at: "Scientists", s: (g, f, len) => <Room cam={camLerp(g, len, C(1000, GY - 280, 1.5), C(1000, GY - 280, 1.7))} f={f}>
    <Hero x={700} y={GY} f={f} expr="shock" open={0.5} sweat pose={{ armL: [30, 60], armR: [30, 60] }} />
    {[1050, 1250].map((x, i) => <Bean key={i} x={x - g * 2} y={GY} s={HS} look={DOC} f={f} expr="grin" flip pose={{ armR: [100, 20] }} holdR={{ node: i ? <g><rect x={-14} y={-80} width={28} height={80} rx={12} fill="#bff4ff" stroke={INK} strokeWidth={5} /><rect x={-12} y={-40} width={24} height={36} fill="#ff4a6a" /></g> : <Syringe />, k: 1.3 }} />)}
  </Room> },
  { at: "Generals", s: (g, f, len) => <Room cam={camLerp(g, len, C(960, GY - 300, 1.4), C(960, GY - 300, 1.55))} f={f} win={false} kind="plain">
    <rect x={500} y={CEILY} width={900} height={420} fill="#2a4a3a" stroke={INK} strokeWidth={8} />
    <Planet x={950} y={CEILY + 210} r={170} f={f} pins />
    {[[600, 0], [1300, 1]].map(([x, k]) => <Bean key={x} x={x} y={GY} s={HS} look={GENERAL} f={f} expr={k ? "neutral" : "talk"} open={0.3} flip={!!k} pose={{ armR: [k ? 20 : 120, k ? 10 : 30] }} />)}
  </Room> },
  { at: "countries", s: (g, f, len) => <Frame bg="#0c0838">{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}
    <Planet x={960} y={560} r={360} f={f} pins />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <path key={i} d={`M ${960 + a * 760} ${560 + b * 420} L ${960 + a * 300} ${560 + b * 160}`} stroke={["#ff4a6a", YEL, "#5ae0ff", "#ff6fb5"][i]} strokeWidth={22} strokeLinecap="round" opacity={ip(g, [i * 4, i * 4 + 8], [0, 1])} />)}
    <g transform="translate(960 560)"><FlyHero cx={0} cy={-420} f={f} s={0.3} /></g>
  </Frame> },
  { at: "Others", s: (g, f, len) => <Frame bg="#1a0a20"><rect width={1920} height={1080} fill="#2a1030" />
    <rect x={660} y={200} width={600} height={680} fill="#fff4f0" stroke={INK} strokeWidth={10} />
    <g transform="translate(960 900)"><Bean x={0} y={0} s={1.2} look={HERO2D} f={0} expr="neutral" shadow={false} /></g>
    <g opacity={ip(g, [0, 10], [0, 1])}><circle cx={960} cy={420} r={170} fill="none" stroke="#ff3a4a" strokeWidth={16} /><circle cx={960} cy={420} r={90} fill="none" stroke="#ff3a4a" strokeWidth={12} /><path d="M 960 200 L 960 640 M 740 420 L 1180 420" stroke="#ff3a4a" strokeWidth={10} /></g>
    <Glow x={960} y={420} r={500} g="gR" o={0.4 + 0.2 * Math.sin(f * 0.3)} />
  </Frame> },
  { at: "Think", s: (g, f, len) => <Room cam={camLerp(g, len, C(960, GY - 300, 1.6), C(960, GY - 300, 1.8))} f={f} win={false} kind="plain">
    <rect x={500} y={CEILY} width={900} height={420} fill="#1a2a5a" stroke={INK} strokeWidth={8} />
    <FlyHero cx={950} cy={CEILY + 220} f={f} s={0.4} />
    {[[600, 0], [1300, 1]].map(([x, k]) => <Bean key={x} x={x} y={GY} s={HS} look={k ? SUIT : GENERAL} f={f} expr="neutral" flip={!!k} pose={{ armL: [30, 80], armR: [30, 80] }} />)}
  </Room> },
  // что он может
  { at: "One", n: 2, s: (g, f, len) => <Frame bg="#0c0838">{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}
    <Planet x={960} y={600} r={320} f={f * 3} />
    {(() => { const a = g * 0.08 - 1.6; return <g transform={`translate(${960 + Math.cos(a) * 430} ${600 + Math.sin(a) * 430}) rotate(${a * 57 + 90})`}><FlyHero cx={0} cy={0} f={f} s={0.3} /></g>; })()}
  </Frame> },
  { at: "lift", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 350, 1.4), C(960, GY - 350, 1.5))} f={f}>
    <Hero x={960} y={GY - 40} f={f} expr="grin" pose={{ armL: [175, 0], armR: [175, 0] }} />
    <g transform={`translate(960 ${GY - 370 - ip(g, [0, 10], [0, 10])})`}><Car x={0} y={0} c="#ff4a6a" lights={false} /></g>
  </Bay> },
  { at: "read", s: (g, f, len) => {
    const sh = since("hurt", "read", g);
    return <Town cam={camLerp(g, len, C(960, GY - 250, 1.8), C(960, GY - 250, 2.0))} f={f}>
      <Hero x={960} y={GY + 30} f={f} expr="smirk" />
      {sh < 0 ? [[700, GY - 520, "heart"], [1220, GY - 540, "clock"], [1250, GY - 300, "lock"]].map(([x, y, ic], i) => <Thought key={i} x={x as number} y={y as number} s={0.6} icon={ic as any} p={ip(g, [i * 3, i * 3 + 6], [0, 1])} />)
        : <Shield x={960} y={GY - 180} r={ip(sh, [0, 6], [0, 330])} f={f} />}
      {sh < 0 ? [-26, 26].map((k) => <Glow key={k} x={960 + k} y={GY - 236} r={70} g="gV" />) : null}
    </Town>;
  } },
  { at: "There", n: 1, s: (g, f, len) => <Bay cam={{ ...camLerp(g, len, C(960, 600, 0.95), C(960, 600, 1.05)), ...shake(f, g % 15 < 4 ? 5 : 0) }} f={f}>
    {[300, 650, 1650].map((x, i) => <Tank key={i} x={x} y={GY + 90} s={0.7} flip={x > 960} fire={(g + i * 5) % 15 < 4} />)}
    <Shield x={960} y={GY - 180} r={290} f={f} />
    <Hero x={960} y={GY + 30} f={f} expr="smirk" pose={{ armL: [20, 60], armR: [20, 60] }} />
  </Bay> },
  { at: "prison", s: (g, f, len) => {
    const b = ip(g, [6, 20], [0, 1]);
    return <Frame bg="#3a2a6a"><rect width={1920} height={1080} fill="#4a3a7a" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(i % 6) * 340 - 40} y={Math.floor(i / 6) * 220 + (Math.floor(i / 6) % 2) * 0} width={320} height={200} fill="#5a4a8a" stroke={INK} strokeWidth={5} />)}
      <g transform="translate(960 1000)"><Bean x={0} y={0} s={1.3} look={HERO2D} f={f} expr="grin" pose={{ armL: [90, 0], armR: [90, 0] }} /></g>
      {[-3, -2, -1, 1, 2, 3].map((k) => { const x = 960 + k * 110 + Math.sign(k) * b * (Math.abs(k) === 1 ? 150 : 40); return <path key={k} d={`M ${960 + k * 110} -20 Q ${x} 560 ${960 + k * 110} 1100`} stroke={INK} strokeWidth={46} fill="none" />; })}
      {[-3, -2, -1, 1, 2, 3].map((k) => { const x = 960 + k * 110 + Math.sign(k) * b * (Math.abs(k) === 1 ? 150 : 40); return <path key={"i" + k} d={`M ${960 + k * 110} -20 Q ${x} 560 ${960 + k * 110} 1100`} stroke="#b8b4d0" strokeWidth={28} fill="none" />; })}
    </Frame>;
  } },
  { at: "secret", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, GY - 260, 1.7), C(960, GY - 260, 1.9))} f={f}>
    <Bean x={780} y={GY + 30} s={HS} look={SUIT} f={f} expr="talk" open={0.2} pose={{ armR: [130, 60], lean: 8 }} />
    <Bean x={980} y={GY + 30} s={HS} look={GENERAL} f={f} expr="neutral" flip />
    <Hero x={1500} y={GY + 30} f={f} expr="smirk" pose={{ armL: [150, 75] }} />
    <SoundRings x={1440} y={GY - 260} f={f} c="#5ae0ff" n={3} />
  </Town> },
  { at: "To", n: 2, s: (g, f, len) => <Frame bg="#0c0838">{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 211) % 1080} r={3} fill="#fff" opacity={0.7} />)}
    <Planet x={960} y={1200} r={700} f={f} />
    <Bean x={960} y={510} s={0.6} look={HERO2D} f={f} expr="neutral" />
    <Glow x={960} y={400} r={400} g="gR" o={0.3 + 0.3 * Math.abs(Math.sin(f * 0.25))} />
  </Frame> },
  { at: "biggest", n: 1, s: (g, f, len) => <Room cam={C(960, GY - 300, 1.5)} f={f} win={false} kind="plain">
    <rect x={500} y={CEILY} width={900} height={420} fill="#5a1a3a" stroke={INK} strokeWidth={8} />
    <FlyHero cx={950} cy={CEILY + 220} f={f} s={0.4} />
    <rect x={-1500} y={-1000} width={5000} height={3000} fill="#ff3a4a" opacity={Math.abs(Math.sin(f * 0.25)) * 0.3} />
    {[[600, 0], [1300, 1]].map(([x, k]) => <Bean key={x} x={x} y={GY} s={HS} look={k ? SUIT : GENERAL} f={f} expr="shock" open={0.5} sweat flip={!!k} pose={{ armL: [30, 80], armR: [30, 80] }} />)}
  </Room> },
  // телепатия: страх, планы, надежда
  { at: "With", s: (g, f, len) => <Town cam={camLerp(g, len, C(960, 500, 1.0), C(960, 460, 1.05))} f={f}>
    <Hero x={960} y={GY - 120} f={f} expr="sad" shadow={false} pose={floatPose(f)} />
    {Array.from({ length: 9 }, (_, i) => <Thought key={i} x={200 + (i % 5) * 380 + (i > 4 ? 190 : 0)} y={170 + Math.floor(i / 5) * 230} s={0.5} icon={(["heart", "clock", "lock", "bolt"] as const)[i % 4]} p={ip(g, [i * 3, i * 3 + 6], [0, 1])} />)}
  </Town> },
  { at: "fear", s: (g, f, len) => <Town cam={C(960, GY - 260, 2.0)} f={f}>{[[700, 4], [960, 6], [1220, 2]].map(([x, l], i) => <Bean key={i} x={x} y={GY + 30} s={HS} look={LOOKS[l]} f={f} expr="shock" open={0.5} sweat pose={{ armL: [40, 60], armR: [40, 60] }} />)}</Town> },
  { at: "plans", s: (g, f, len) => <Frame bg="#2a4a3a"><rect width={1920} height={1080} fill="#2a4a3a" />
    <Planet x={960} y={540} r={330} f={f} pins />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${300 + i * 200} ${900 - i * 100} Q 960 ${200 + i * 80} ${1600 - i * 120} ${300 + i * 150}`} stroke="#ff4a6a" strokeWidth={14} strokeDasharray="30 20" fill="none" opacity={ip(g, [i * 3, i * 3 + 6], [0, 1])} />)}
  </Frame> },
  { at: "hoping", s: (g, f, len) => <Town cam={C(960, GY - 300, 2.0)} f={f}>
    <Bean x={900} y={GY + 30} s={HS * 0.8} look={LOOKS[4]} f={f} expr="grin" pose={{ armR: [150, 20], armL: [150, 20] }} />
    <Thought x={1150} y={GY - 480} s={0.7} icon="heart" p={ip(g, [0, 8], [0, 1])} />
  </Town> },
  { at: "first", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, 500, 1.2), C(960, 520, 1.0))} f={f} sun={[1250, 560]}>
    <Hero x={960} y={GY - 46} f={f} expr="neutral" pose={{ legL: 70, legR: 76, armL: [20, 40], armR: [20, 40] }} />
  </Bay> },
  { at: "flight", s: (g, f, len) => <Sky cam={C(960, 540, 1.2)} f={f} alt={0.1} sp={10}>
    <FlyHero cx={960 + g * 4} cy={540} f={f} s={0.5} />
    {since("strength", "flight", g) > 0 ? <g><rect x={-2000} y={-1000} width={6000} height={3000} fill="#4a3098" /><Hero x={1000} y={900} f={f} expr="grin" pose={{ armL: [175, 0], armR: [175, 0] }} /><g transform="translate(1000 570)"><Car x={0} y={0} c="#5a7cf0" lights={false} /></g></g> : null}
  </Sky> },
  { at: "choice", s: (g, f, len) => <Bay cam={camLerp(g, len, C(960, GY - 300, 2.2), C(960, GY - 300, 2.5))} f={f} sun={[1250, 560]}>
    <Hero x={960} y={GY - 40} f={f} expr="neutral" pose={{ armR: [80, 40], armL: [15, 8] }} />
    <Glow x={1090} y={GY - 290} r={140} g="gY" o={0.6 + 0.3 * Math.sin(f * 0.3)} /><circle cx={1090} cy={GY - 290} r={26} fill="#fff6d0" stroke={INK} strokeWidth={5} />
  </Bay> },
], { id: 4 });
