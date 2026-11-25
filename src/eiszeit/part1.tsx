// «Wie lange würdest DU in der Eiszeit überleben?» — часть 1: Ankunft.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOICE } from "./voice1";
import MAP from "./europe.json";
import { BatteryHud, FPS, ICE, INK, Notif, PAPER, PhoneInHand, Photo, RED, Shake, Snow, Stamp, Tag, Timer, Vignette, clamp, img, makeAt, oldImg, pop, Grain } from "./kit";

const LEAD = 6;
const at = makeAt(VOICE, LEAD);
export const P1_FRAMES = Math.ceil((VOICE.dur + 1.6) * FPS) + LEAD;
export const ease = (t: number) => t * t * (3 - 2 * t);

// ---------- карта Европы 20 000 лет назад ----------
export type Cam = { f: number; s: number; x: number; y: number };
export const camAt = (f: number, keys: Cam[]) => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i].f) {
      const a = keys[i - 1], b = keys[i];
      const t = ease((f - a.f) / (b.f - a.f));
      return { f, s: a.s + (b.s - a.s) * t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return keys[keys.length - 1];
};
export const toScreen = (c: Cam, p: number[]) => [960 + (p[0] - c.x) * c.s, 540 + (p[1] - c.y) * c.s];

export const EuropeMap: React.FC<{ cam: Cam; ice: number; alps: number; dogger?: number; deLine?: number }> = ({ cam, ice, alps, dogger = 0, deLine = 1 }) => {
  const f = useCurrentFrame();
  const sk = MAP.skandi, mu = MAP.muenchen;
  return (
    <AbsoluteFill style={{ background: "#16324c", overflow: "hidden" }}>
      <svg width={1920} height={1080}>
        <defs>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale={18} /></filter>
          <pattern id="hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width={14} height={14} fill="#d8c79c" /><line x1={0} y1={0} x2={0} y2={14} stroke="#b59b62" strokeWidth={5} /></pattern>
          <clipPath id="iceclip"><circle cx={sk[0]} cy={sk[1]} r={ice * 1400} /></clipPath>
        </defs>
        <g transform={`translate(${960 - cam.x * cam.s} ${540 - cam.y * cam.s}) scale(${cam.s})`}>
          <path d={MAP.land} fill="#e6dcc4" stroke="#7a6a4c" strokeWidth={2 / cam.s} />
          {dogger > 0 && <path d={MAP.dogger} fill="url(#hatch)" opacity={dogger} stroke="#f2c14e" strokeWidth={(4 + 3 * Math.sin(f / 5)) / cam.s} />}
          <path d={MAP.de} fill="rgba(215,38,61,0.06)" stroke={RED} strokeWidth={4 / cam.s} strokeDasharray={`${12 / cam.s} ${7 / cam.s}`} opacity={deLine} />
          <g clipPath="url(#iceclip)" filter="url(#rough)">
            <path d={MAP.ice} fill="#f5fbff" stroke={ICE} strokeWidth={7 / cam.s} />
          </g>
          <g filter="url(#rough)" transform={`translate(${mu[0]} ${mu[1] + 40}) scale(${alps}) translate(${-mu[0]} ${-mu[1] - 40})`} opacity={alps > 0 ? 1 : 0}>
            <path d={MAP.alps} fill="#f5fbff" stroke={ICE} strokeWidth={7 / cam.s} />
          </g>
        </g>
      </svg>
      {/* бумажная фактура */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(255,250,235,0.08) 0%, rgba(40,30,20,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Dot: React.FC<{ p: number[]; start: number; label: string; dx?: number; dy?: number }> = ({ p, start, label, dx = 0, dy = -70 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = pop(f, start, fps, 9);
  return (
    <>
      <div style={{ position: "absolute", left: p[0], top: p[1], width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: 15, background: RED, border: "5px solid white", transform: `scale(${s})` }} />
      <Tag x={p[0] + dx} y={p[1] + dy} start={start + 2} rot={-3} size={46}>{label}</Tag>
    </>
  );
};

const SMap: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const B = MAP.berlin, M = MAP.muenchen, H = MAP.hier;
  const keys: Cam[] = [
    { f: a, s: 0.8, x: 800, y: 560 },
    { f: at("Skandinavien"), s: 0.85, x: 820, y: 520 },
    { f: at("Brandenburg") - 4, s: 1.7, x: B[0] - 40, y: B[1] - 40 },
    { f: at("Alpen") + 4, s: 1.7, x: M[0], y: M[1] - 60 },
    { f: at("Dazwischen") + 10, s: 2.1, x: H[0] + 20, y: (B[1] + M[1]) / 2 },
    { f: b, s: 2.6, x: H[0] + 20, y: (B[1] + M[1]) / 2 },
  ];
  const cam = camAt(f, keys);
  const ice = interpolate(f, [at("Norden"), at("Brandenburg")], [0, 1], { ...clamp, easing: ease });
  const alps = interpolate(f, [at("Alpen"), at("Gletscher") + 10], [0, 1], { ...clamp, easing: ease });
  const band = interpolate(f, [at("Dazwischen"), at("Dazwischen") + 12], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <EuropeMap cam={cam} ice={ice} alps={alps} />
      {f >= at("Skandinavien") - 6 && f < at("Brandenburg") && <Tag x={toScreen(cam, MAP.skandi)[0]} y={toScreen(cam, MAP.skandi)[1]} start={at("Skandinavien") - 6} size={50}>EIS AUS SKANDINAVIEN</Tag>}
      {f < at("Alpen") + 10 && <Dot p={toScreen(cam, B)} start={at("Brandenburg")} label="BRANDENBURG" dy={70} />}
      <Dot p={toScreen(cam, M)} start={at("München")} label="MÜNCHEN" dy={-80} />
      {band > 0 && <Stamp x={960} y={560} start={at("Steppe")} rot={-6} size={64}>KALTE STEPPE</Stamp>}
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

const SDogger: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const N = MAP.nordsee;
  const cam = camAt(f, [{ f: a, s: 1.2, x: N[0] + 60, y: N[1] + 40 }, { f: a + 120, s: 1.75, x: N[0] + 20, y: N[1] + 20 }]);
  const d = interpolate(f, [at("Nordsee") - 6, at("Nordsee") + 8], [0, 1], clamp);
  const p = toScreen(cam, N);
  return (
    <AbsoluteFill>
      <EuropeMap cam={cam} ice={1} alps={1} dogger={d} deLine={0.6} />
      <Tag x={p[0]} y={p[1] - 30} start={at("Nordsee")} rot={-4} size={52}>NORDSEE</Tag>
      <Stamp x={p[0] + 40} y={p[1] + 90} start={at("Land")} rot={-8} size={58}>TROCKENES LAND</Stamp>
      <Tag x={420} y={940} start={at("Meeresspiegel") + 4} rot={2} size={40} bg="#FFF6D6">MEERESSPIEGEL: ca. 120 m TIEFER</Tag>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ---------- сцены ----------
export const Eyelids: React.FC<{ open: number }> = ({ open }) => {
  const h = interpolate(open, [0, 1], [560, 0]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -200, right: -200, top: 0, height: h + 60, background: "#000", borderRadius: "0 0 50% 50%", filter: "blur(18px)" }} />
      <div style={{ position: "absolute", left: -200, right: -200, bottom: 0, height: h + 60, background: "#000", borderRadius: "50% 50% 0 0", filter: "blur(18px)" }} />
    </AbsoluteFill>
  );
};

const SWake: React.FC<{ b: number }> = ({ b }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14, 24, 30, 36, at("Schnee") - 6, at("Schnee")], [0, 0.25, 0.25, 0.05, 0.4, 0.45, 1], clamp);
  const blur = interpolate(f, [0, at("Schnee")], [22, 0], clamp);
  const rot = interpolate(f, [0, at("Schnee") + 10], [-16, -4], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(1.3)` }}>
        <Photo src={img("steppe.jpg")} from={0} dur={b} z0={1.05} z1={1.12} blur={blur} />
      </AbsoluteFill>
      <Snow n={90} wind={2} fall={2} seed="w" opacity={0.7} />
      <Vignette s={0.6} />
      <Eyelids open={o} />
    </AbsoluteFill>
  );
};

const SToday: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [at("zwanzigtausend") - 4, at("früher")], [1920, 0], { ...clamp, easing: ease }); // граница «сегодня/тогда»
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.1} z1={1.2} />
      <Snow n={90} wind={3} fall={2} seed="t" />
      <div style={{ position: "absolute", left: 1920 - w, top: 0, width: w, height: 1080, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, width: 1920, height: 1080 }}>
          <Photo src={img("berlin2.jpg")} from={a} dur={b - a} z0={1.05} z1={1.12} />
        </div>
      </div>
      {w > 4 && w < 1916 && <div style={{ position: "absolute", left: 1920 - w - 4, top: 0, width: 8, height: 1080, background: "white", boxShadow: "0 0 20px rgba(255,255,255,0.9)" }} />}
      {f < at("früher") && <Tag x={1540} y={170} start={at("Deutschland")} rot={3} size={52}>HEUTE</Tag>}
      <Tag x={420} y={170} start={at("zwanzigtausend") + 4} rot={-3} size={52}>VOR 20.000 JAHREN</Tag>
      <Stamp x={960} y={600} start={at("Eiszeit")} rot={-7} size={150}>EISZEIT</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SSteppe: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [at("mittendrin"), b], [1.15, 1.5], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={z} z1={z} x0={interpolate(f, [a, b], [3, -2])} />
      <Snow n={130} wind={6} fall={2.5} seed="s1" />
      <Tag x={960} y={720} start={at("du", 2)} rot={-2} size={64} bg="#FFF6D6">DU BIST HIER</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SClothes: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const legs = pop(f, a + 2, fps, 15);
  const bob = Math.sin((f - a) / 18) * 6;
  const items: [string, number][] = [["Hoodie", at("Hoodie")], ["Jeans", at("Jeans")], ["Turnschuhe", at("Turnschuhe")]];
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.35} z1={1.42} y0={-6} y1={-6} />
      <Snow n={120} wind={5} fall={3} seed="c1" />
      <div style={{ position: "absolute", left: 960 - 470, top: interpolate(legs, [0, 1], [1150, 1080 - 680]) + bob, height: 1010, width: 551 * (1010 / 841), transform: "rotate(-4deg)" }}>
        <Img src={oldImg("feet_cut.png")} style={{ position: "absolute", height: 1010 }} />
      </div>
      <div style={{ position: "absolute", left: 1420, top: 480, transform: `translate(-50%,-50%) rotate(3deg) scale(${pop(f, at("Hoodie") - 6, fps, 12)})`, background: PAPER, width: 560, padding: "34px 44px", boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 40, color: INK, letterSpacing: 2, borderBottom: `4px solid ${INK}`, paddingBottom: 10, marginBottom: 14 }}>DEINE AUSRÜSTUNG</div>
        {items.map(([t, s]) => (
          <div key={t} style={{ fontFamily: "IceType", fontSize: 52, color: INK, height: 74, display: "flex", alignItems: "center", gap: 22, opacity: f >= s ? 1 : 0, transform: `translateX(${interpolate(f, [s, s + 6], [-30, 0], clamp)}px)` }}>
            <span style={{ width: 40, height: 40, border: `4px solid ${INK}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: RED, fontFamily: "IceMont", fontWeight: 900, fontSize: 40 }}>{f >= s + 8 ? "✓" : ""}</span>{t}
          </div>
        ))}
      </div>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SPhone: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, a, fps, 14);
  const full = f >= at("Hundert");
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.3} z1={1.36} blur={9} />
      <Snow n={110} wind={5} fall={3} seed="p1" />
      <PhoneInHand x={1000} y={interpolate(s, [0, 1], [1200, 50]) + Math.sin(f / 14) * 5} rot={interpolate(s, [0, 1], [12, -3])}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 34px 0", fontSize: 24, fontWeight: 700 }}>
          <span>{f >= at("Nachricht") ? "Kein Netz" : "…"}</span><span>{full ? "100 %" : ""}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 150, fontSize: 120, fontWeight: 700, letterSpacing: 2 }}>??:??</div>
        <div style={{ textAlign: "center", fontSize: 30, opacity: 0.8 }}>Datum unbekannt</div>
        <div style={{ position: "absolute", left: "50%", top: 560, transform: `translateX(-50%) scale(${full ? pop(f, at("Hundert"), fps, 10) : 0})`, display: "flex", alignItems: "center" }}>
          <div style={{ width: 230, height: 110, border: "8px solid white", borderRadius: 20, padding: 8 }}><div style={{ width: "100%", height: "100%", background: "#6fe38a", borderRadius: 8 }} /></div>
          <div style={{ width: 14, height: 44, background: "white", borderRadius: "0 6px 6px 0", marginLeft: 4 }} />
        </div>
        {full && <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontSize: 70, fontWeight: 900, color: "#6fe38a" }}>100 %</div>}
        <Notif start={at("Nachricht")} title="Kein Netz" text={f >= at("Seit") ? "Seit 20.000 Jahren." : "Keine Verbindung"} icon="✕" top={70} />
      </PhoneInHand>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SPermafrost: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, a, fps, 13);
  const fr = interpolate(f, [at("gefroren") - 6, at("gefroren") + 14], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.5} z1={1.6} y0={-14} y1={-16} blur={6} />
      <div style={{ position: "absolute", left: 960, top: 560, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`, background: PAPER, padding: 24, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <svg width={1300} height={760}>
          <rect width={1300} height={120} fill="#b9d3e6" />
          <path d="M0 120 Q 150 100 300 118 T 650 112 T 1000 120 T 1300 110 L1300 160 L0 160Z" fill="#f7fbff" />
          <rect y={150} width={1300} height={130} fill="#6b4f35" />
          <rect y={280} width={1300} height={480} fill={`rgb(${interpolate(fr, [0, 1], [107, 120])},${interpolate(fr, [0, 1], [79, 140])},${interpolate(fr, [0, 1], [53, 165])})`} />
          {Array.from({ length: 9 }, (_, i) => { const x = 80 + i * 145; const h = 140 + (i % 3) * 70; return <path key={i} d={`M${x - 26} 280 L${x + 26} 280 L${x} ${280 + h * fr}Z`} fill="#eef7ff" opacity={0.9} />; })}
          {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 211) % 1300} cy={300 + ((i * 97) % 440)} r={4 + (i % 4)} fill="white" opacity={0.5 * fr} />)}
          <text x={40} y={225} fontFamily="IceType" fontSize={40} fill="#f4efe4">SOMMER: TAUT KURZ AUF</text>
          <text x={40} y={720} fontFamily="IceType" fontSize={44} fill="#f4efe4" opacity={fr}>DAS GANZE JAHR GEFROREN</text>
        </svg>
      </div>
      <Stamp x={1350} y={300} start={at("Permafrost")} rot={-8} size={96}>PERMAFROST</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SNoCity: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const gone = interpolate(f, [at("Nichts") - 4, at("Nichts") + 8], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.2} z1={1.25} />
      <Snow n={120} wind={6} fall={2.5} seed="n1" />
      <AbsoluteFill style={{ opacity: gone }}>
        <Photo src={img("berlin2.jpg")} from={a} dur={b - a} z0={1.08} z1={1.16} filter={`saturate(${interpolate(f, [a, at("Nichts")], [1, 0.3], clamp)})`} />
      </AbsoluteFill>
      {f < at("Nichts") + 4 && (
        <>
          <Stamp x={560} y={300} start={at("Stadt")} rot={-8} size={84}>KEINE STADT</Stamp>
          <Stamp x={1340} y={520} start={at("Keine Straße")} rot={6} size={84}>KEINE STRASSE</Stamp>
          <Stamp x={700} y={790} start={at("Haus")} rot={-4} size={84}>KEIN HAUS</Stamp>
        </>
      )}
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SClock: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={b - a} z0={1.3} z1={1.4} blur={7} filter="brightness(0.75)" />
      <Snow n={110} wind={5} fall={2.5} seed="k1" />
      {f >= at("Video") && f < at("Am") - 2 && <Tag x={560} y={330} start={at("Video")} rot={-3} size={46} bg="#FFF6D6">= REST DES VIDEOS</Tag>}
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};

const STafel: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, a + 2, fps, 13);
  const rows: [string, string, number][] = [["DU", "?", at("dich")], ["?????", "?", at("jemandem")]];
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={a} dur={120} z0={1.3} z1={1.35} blur={8} filter="brightness(0.7)" />
      <Shake start={at("überraschen")} amp={10} len={14}>
        <div style={{ position: "absolute", left: 960, top: 560, transform: `translate(-50%,-50%) rotate(-1deg) scale(${s})`, background: PAPER, width: 1100, padding: "40px 60px", boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}>
          <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 64, color: INK, letterSpacing: 6, textAlign: "center", borderBottom: `6px solid ${INK}`, paddingBottom: 12, marginBottom: 20 }}>DIE TAFEL</div>
          {rows.map(([n, v, st]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "IceMont", fontWeight: 900, fontSize: 70, color: INK, height: 110, opacity: f >= st ? 1 : 0.15, borderBottom: "3px dashed #b8ab90" }}>
              <span>{n}</span><span style={{ color: RED, fontFamily: "IceType" }}>{v} STUNDEN</span>
            </div>
          ))}
        </div>
      </Shake>
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};

const SRun: React.FC<{ a: number }> = ({ a }) => (
  <AbsoluteFill>
    <Photo src={img("steppe.jpg")} from={a} dur={70} z0={1.15} z1={1.3} x0={2} x1={-3} />
    <Snow n={200} wind={14} fall={3} seed="r1" />
    <Vignette s={0.5} frost={0.25} />
  </AbsoluteFill>
);

export const Part1: React.FC<{ fade?: boolean }> = ({ fade = true }) => {
  const f = useCurrentFrame();
  const c = {
    today: at("Genau") - 2, map: at("Von") - 2, steppe: at("Steppe") - 3, clothes: at("Du") - 2, phone: at("Und", 2) - 2,
    perma: at("Der", 1) - 2, dogger: at("Der", 2) - 2, city: at("Und", 3) - 2, clock: at("Wir") - 2, tafel: at("Am") - 2, run: at("Die", 2) - 2,
  };
  const cuts = Object.values(c);
  return (
    <AbsoluteFill style={{ background: "#0f141e" }}>
      {f < c.today && <SWake b={c.today} />}
      {f >= c.today && f < c.map && <SToday a={c.today} b={c.map} />}
      {f >= c.map && f < c.steppe && <SMap a={c.map} b={c.steppe} />}
      {f >= c.steppe && f < c.clothes && <SSteppe a={c.steppe} b={c.clothes} />}
      {f >= c.clothes && f < c.phone && <SClothes a={c.clothes} b={c.phone} />}
      {f >= c.phone && f < c.perma && <SPhone a={c.phone} b={c.perma} />}
      {f >= c.perma && f < c.dogger && <SPermafrost a={c.perma} b={c.dogger} />}
      {f >= c.dogger && f < c.city && <SDogger a={c.dogger} />}
      {f >= c.city && f < c.clock && <SNoCity a={c.city} b={c.clock} />}
      {f >= c.clock && f < c.tafel && <SClock a={c.clock} b={c.tafel} />}
      {f >= c.tafel && f < c.run && <STafel a={c.tafel} />}
      {f >= c.run && <SRun a={c.run} />}
      {(f < c.tafel || f >= c.run) && <Timer appear={at("Uhr", 1)} run={at("läuft")} move={at("läuft") + 8} />}
      <BatteryHud appear={at("Akku", 2)} pct={interpolate(f, [at("läuft"), P1_FRAMES], [100, 99], clamp)} big={interpolate(f, [at("Akku", 2), at("Akku", 2) + 6, at("Am") - 10, at("Am")], [0, 0.8, 0.8, 0], clamp)} />
      <Grain />
      {fade && <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [P1_FRAMES - 10, P1_FRAMES], [0, 1], clamp) }} />}
      {/* звук: голос главный, фон тихо */}
      <Sequence from={LEAD}><Audio src={staticFile("eiszeit/p1/voice.mp3")} /></Sequence>
      <Audio src={staticFile("iceage/wind.mp3")} loop volume={0.15} />
      {cuts.map((s, i) => <Sequence key={i} from={s - 4} durationInFrames={40}><Audio src={staticFile("iceage/whoosh.mp3")} volume={0.18} /></Sequence>)}
      {[at("Eiszeit"), at("Stadt"), at("Keine Straße"), at("Haus"), at("Permafrost"), at("Land"), at("Steppe")].map((s, i) => <Sequence key={"s" + i} from={s} durationInFrames={15}><Audio src={staticFile("iceage/snap.wav")} volume={0.22} /></Sequence>)}
      <Sequence from={at("Nachricht")} durationInFrames={40}><Audio src={staticFile("sfx/ding.wav")} volume={0.2} /></Sequence>
      {Array.from({ length: Math.ceil((P1_FRAMES - at("läuft")) / FPS) }, (_, i) => <Sequence key={"t" + i} from={at("läuft") + i * FPS} durationInFrames={5}><Audio src={staticFile("iceage/tick.wav")} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};
