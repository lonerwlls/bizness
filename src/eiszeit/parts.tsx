// «Wie lange würdest DU in der Eiszeit überleben?» — части 2–7.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import MAP from "./europe.json";
import { BatteryHud, FPS, ICE, INK, Notif, PAPER, PhoneInHand, Photo, RED, Shake, Snow, Stamp, Tag, Vignette, clamp, fmt, img, oldImg, pop, Grain } from "./kit";
import { Cam, EuropeMap, Eyelids, camAt, ease, toScreen } from "./part1";
import { ATS, FRAMES, LEAD, OFF, STORY, batteryAt } from "./timeline";


// ---------- общие куски ----------
const Card: React.FC<{ x: number; y: number; w: number; start: number; rot?: number; pad?: number; children: React.ReactNode }> = ({ x, y, w, start, rot = -1.5, pad = 40, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = pop(f, start, fps, 13);
  return <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: PAPER, padding: pad, boxShadow: "0 26px 56px rgba(0,0,0,0.55)", color: INK }}>{children}</div>;
};
const H: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 52 }) => (
  <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: size, letterSpacing: 3, textAlign: "center", borderBottom: `5px solid ${INK}`, paddingBottom: 10, marginBottom: 16 }}>{children}</div>
);
const Line: React.FC<{ show: number; mark?: "✓" | "✗" | ""; children: React.ReactNode; size?: number }> = ({ show, mark = "", children, size = 50 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: "IceType", fontSize: size, height: size * 1.45, display: "flex", alignItems: "center", gap: 20, opacity: f >= show ? 1 : 0, transform: `translateX(${interpolate(f, [show, show + 6], [-30, 0], clamp)}px)` }}>
      {mark !== "" && <span style={{ width: size * 0.8, height: size * 0.8, border: `4px solid ${INK}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: mark === "✓" ? "#2a9d4b" : RED, fontFamily: "IceMont", fontWeight: 900, fontSize: size * 0.8 }}>{f >= show + 8 ? mark : ""}</span>}
      <span>{children}</span>
    </div>
  );
};

const Thermo: React.FC<{ x: number; y: number; start: number; from: number; to: number; t0: number; t1: number; sc?: number }> = ({ x, y, start, from, to, t0, t1, sc = 0.8 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = pop(f, start, fps, 13) * sc;
  const temp = interpolate(f, [t0, t1], [from, to], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const lvl = interpolate(temp, [-40, 20], [0, 1]);
  const col = temp < -10 ? "#2f7fd8" : RED;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(-3deg) scale(${s})` }}>
      <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 96, color: "white", background: "rgba(14,22,34,0.9)", padding: "2px 26px", borderRadius: 16, border: `5px solid ${ICE}`, textAlign: "center", marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>{Math.round(temp) < 0 ? "−" : ""}{Math.abs(Math.round(temp))} °C</div>
      <div style={{ background: PAPER, width: 300, height: 640, margin: "0 auto", boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}>
        <svg width={300} height={640}>
          <rect x={120} y={40} width={60} height={470} rx={30} fill="white" stroke={INK} strokeWidth={8} />
          <rect x={134} y={40 + 450 * (1 - lvl)} width={32} height={450 * lvl + 30} rx={16} fill={col} />
          <circle cx={150} cy={560} r={62} fill={col} stroke={INK} strokeWidth={8} />
          {[20, 0, -20, -40].map((t) => { const yy = 40 + 450 * (1 - interpolate(t, [-40, 20], [0, 1])); return <g key={t}><line x1={185} x2={220} y1={yy} y2={yy} stroke={INK} strokeWidth={5} /><text x={228} y={yy + 11} fontFamily="IceType" fontSize={30} fill={INK}>{t}°</text></g>; })}
        </svg>
      </div>
    </div>
  );
};

const HudTimer: React.FC<{ sec: number; stopped?: boolean }> = ({ sec, stopped }) => {
  const f = useCurrentFrame();
  const blink = !stopped && Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 1690, top: 92, transform: "translate(-50%,-50%) scale(0.62)" }}>
      <div style={{ background: "rgba(14,22,34,0.92)", border: `5px solid ${stopped ? RED : ICE}`, borderRadius: 22, padding: "14px 34px 10px", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ fontFamily: "IceMont", fontWeight: 800, fontSize: 26, letterSpacing: 6, color: stopped ? RED : ICE, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: blink || stopped ? 1 : 0.25 }} />ÜBERLEBT
        </div>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 96, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: 2, lineHeight: 1.05 }}>{fmt(sec)}</div>
      </div>
    </div>
  );
};

// Оболочка части: голос, ветер, батарея, таймер, зерно, звуки.
const Shell: React.FC<{ i: number; fade?: boolean; wind?: number; noHud?: boolean; snaps?: number[]; dings?: number[]; children: React.ReactNode }> = ({ i, fade, wind = 0.15, noHud, snaps = [], dings = [], children }) => {
  const f = useCurrentFrame();
  const N = FRAMES[i];
  const st = STORY[i];
  return (
    <AbsoluteFill style={{ background: "#0f141e" }}>
      {children}
      {st && !noHud && <HudTimer sec={interpolate(f, [0, N], st, clamp)} stopped={i === 4 && f > N - 40} />}
      {!noHud && <BatteryHud appear={-100} pct={batteryAt(OFF[i] + f)} />}
      <Grain />
      {fade && <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [N - 12, N], [0, 1], clamp) }} />}
      <Sequence from={LEAD}><Audio src={staticFile(`eiszeit/p${i + 1}/voice.mp3`)} /></Sequence>
      <Audio src={staticFile("iceage/wind.mp3")} loop volume={wind} />
      {snaps.map((s, k) => <Sequence key={"s" + k} from={s} durationInFrames={15}><Audio src={staticFile("iceage/snap.wav")} volume={0.22} /></Sequence>)}
      {dings.map((s, k) => <Sequence key={"d" + k} from={s} durationInFrames={40}><Audio src={staticFile("sfx/ding.wav")} volume={0.2} /></Sequence>)}
    </AbsoluteFill>
  );
};

const scenes = (f: number, cuts: number[], list: React.ReactNode[]) => {
  let k = 0;
  while (k + 1 < cuts.length && f >= cuts[k + 1]) k++;
  return list[k];
};

// фигура человека: кровь уходит из рук и ног
const Body: React.FC<{ cold: number; shiver: number }> = ({ cold, shiver }) => {
  const f = useCurrentFrame();
  const limb = `rgb(${interpolate(cold, [0, 1], [215, 70])},${interpolate(cold, [0, 1], [60, 130])},${interpolate(cold, [0, 1], [70, 220])})`;
  const dx = Math.sin(f * 2.7) * 6 * shiver;
  return (
    <svg width={520} height={760} style={{ transform: `translateX(${dx}px)` }}>
      <g strokeLinecap="round" fill="none">
        <line x1={190} y1={300} x2={110} y2={480} stroke={limb} strokeWidth={46} />
        <line x1={330} y1={300} x2={410} y2={480} stroke={limb} strokeWidth={46} />
        <line x1={220} y1={500} x2={190} y2={720} stroke={limb} strokeWidth={54} />
        <line x1={300} y1={500} x2={330} y2={720} stroke={limb} strokeWidth={54} />
      </g>
      <rect x={175} y={240} width={170} height={290} rx={70} fill={RED} />
      <circle cx={260} cy={160} r={78} fill={RED} />
      <path d="M260 330 c-20 -26 -62 -8 -40 26 l40 38 l40 -38 c22 -34 -20 -52 -40 -26z" fill="white" opacity={0.9} />
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={[110, 410, 190, 330][k]} cy={[480, 480, 720, 720][k]} r={30 + 10 * Math.sin(f / 6 + k)} fill="none" stroke="#7cc8f2" strokeWidth={5} opacity={cold} />)}
    </svg>
  );
};

// ================= ЧАСТЬ 2 — Die Kälte =================
export const Part2: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const at = ATS[1];
  const c = [0, at("Kälte") - 3, at("Forscher") - 3, at("Aber") - 3, at("Dann") - 3, at("Dein", 3) - 3, at("Du", 2) - 3];
  const handy = at("Handy");
  const list = [
    <AbsoluteFill key="a">
      <Photo src={oldImg("fauna.jpg")} from={0} dur={c[1]} z0={2.1} z1={2.3} x0={4} x1={4} y0={-22} y1={-24} />
      <Stamp x={1350} y={280} start={at("kein")} rot={-8} size={90}>KEIN RAUBTIER</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Photo src={img("steppe.jpg")} from={c[1]} dur={c[2] - c[1]} z0={1.25} z1={1.35} filter="saturate(0.6) brightness(0.9)" />
      <Snow n={200} wind={12} fall={3} seed="k2" />
      <Stamp x={700} y={330} start={at("Kälte")} rot={-7} size={140}>DIE KÄLTE</Stamp>
      <Thermo x={1450} y={560} start={at("Nehmen")} from={0} to={-20} t0={at("minus")} t1={at("Grad") + 6} />
      <Vignette s={0.5} frost={0.35} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Photo src={img("steppe.jpg")} from={c[2]} dur={c[3] - c[2]} z0={1.4} z1={1.45} blur={8} filter="brightness(0.7)" />
      <Card x={960} y={540} w={1100} start={c[2] + 2}>
        <H>KÄLTE-MODELL DER FORSCHER</H>
        <Line show={c[2] + 4}>Wie lange hält ein Mensch das aus?</Line>
        <Line show={at("Mit")} mark="✓">−20 °C</Line>
        <Line show={at("zwei")} mark="✓">2 lockere Kleidungsschichten</Line>
        <Line show={at("Wind")} mark="✓">fast kein Wind</Line>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 110, textAlign: "center", color: RED, marginTop: 10, opacity: f >= at("fünfzehn") ? 1 : 0 }}>≈ 15 STUNDEN</div>
        <div style={{ fontFamily: "IceType", fontSize: 24, textAlign: "right", opacity: 0.6 }}>Modellrechnung (Tikuisis, 1995)</div>
      </Card>
      <Stamp x={1480} y={880} start={at("Mehr")} rot={-9} size={80}>MEHR NICHT</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Shake start={at("Wind", 2)} amp={16} len={40}>
        <Photo src={img("steppe.jpg")} from={c[3]} dur={c[4] - c[3]} z0={1.3} z1={1.5} x0={4} x1={-4} filter="saturate(0.6)" />
        <Snow n={300} wind={26} fall={3} seed="k3" />
      </Shake>
      {f >= handy - 4 && (
        <PhoneInHand x={900} y={interpolate(pop(f, handy - 4, 30, 14), [0, 1], [1200, 60])} rot={-4}>
          <div style={{ padding: "60px 30px", textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.8 }}>Wetter · Hier</div>
            <div style={{ fontSize: 170, fontWeight: 300, lineHeight: 1 }}>−20°</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: f >= at("gefühlt") ? "#7cc8f2" : "transparent" }}>gefühlt −35°</div>
            <div style={{ fontSize: 30, marginTop: 30, opacity: 0.8 }}>Wind: stark</div>
          </div>
        </PhoneInHand>
      )}
      <Vignette s={0.55} frost={0.45} />
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Photo src={img("steppe.jpg")} from={c[4]} dur={c[5] - c[4]} z0={2.2} z1={2.3} y0={-25} y1={-25} blur={6} />
      <div style={{ position: "absolute", left: 300, top: -60, height: 1500, width: 551 * (1500 / 841), transform: "rotate(-6deg)" }}>
        <Img src={oldImg("feet_cut.png")} style={{ position: "absolute", height: 1500 }} />
        <Img src={oldImg("feet_wet.png")} style={{ position: "absolute", height: 1500, opacity: interpolate(f, [at("Jeans") - 4, at("Jeans") + 16], [0, 1], clamp) }} />
      </div>
      <Snow n={120} wind={6} fall={3} seed="k4" />
      <Card x={1380} y={430} w={860} start={at("Trockene")} rot={2}>
        <Line show={at("Trockene")} mark="✓">trocken: Luft hält warm</Line>
        <Line show={at("Nasse")} mark="✗">nass: hält kaum warm</Line>
      </Card>
      <Stamp x={1180} y={880} start={at("fünfundzwanzig")} rot={-6} size={56}>WASSER LEITET WÄRME ≈ 25× BESSER</Stamp>
      <Vignette s={0.5} frost={0.3} />
    </AbsoluteFill>,
    <AbsoluteFill key="f">
      <Photo src={img("steppe.jpg")} from={c[5]} dur={c[6] - c[5]} z0={1.4} z1={1.45} blur={9} filter="brightness(0.6)" />
      <div style={{ position: "absolute", left: 560, top: 540, transform: "translate(-50%,-50%) rotate(-2deg)", background: PAPER, padding: 30, boxShadow: "0 26px 56px rgba(0,0,0,0.55)" }}>
        <Body cold={interpolate(f, [at("Blut"), at("zurück") + 10], [0, 1], clamp)} shiver={f >= at("zittern") && f < at("aufhört") ? 1 : 0} />
      </div>
      <Tag x={1350} y={260} start={at("Blut")} rot={-3} size={46}>BLUT ZURÜCK ZUM HERZ</Tag>
      <Tag x={1350} y={500} start={at("zittern")} rot={2} size={46} bg="#E9F7EC">ZITTERN = WÄRME ✓</Tag>
      <Stamp x={1350} y={760} start={at("aufhört")} rot={-8} size={80}>WENN ES AUFHÖRT: GEFAHR</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="g">
      <Photo src={img("steppe.jpg")} from={c[6]} dur={80} z0={1.2} z1={1.3} filter="brightness(0.8)" />
      <Snow n={200} wind={14} fall={3} seed="k5" />
      <Card x={960} y={560} w={900} start={at("Dinge")}>
        <H>DU BRAUCHST JETZT</H>
        <Line show={at("Schutz")}>1. Schutz vor dem Wind</Line>
        <Line show={at("Feuer")}>2. Feuer</Line>
      </Card>
      <Vignette s={0.5} frost={0.3} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={1} fade={fade} snaps={[at("kein"), at("Kälte"), at("Mehr"), at("fünfundzwanzig"), at("aufhört")]} dings={[handy]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 3 — Schutz und Feuer =================
const Sparks: React.FC<{ start: number; x: number; y: number }> = ({ start, x, y }) => {
  const f = useCurrentFrame();
  if (f < start || f > start + 40) return null;
  const t = f - start;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: 40 }, (_, i) => {
        const a = random("a" + i) * Math.PI * 2, v = 8 + random("v" + i) * 22;
        const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 0.6 * t * t;
        return <circle key={i} cx={px} cy={py} r={4 + random("r" + i) * 5} fill={i % 3 ? "#ffd166" : "#ff8c42"} opacity={interpolate(t, [0, 40], [1, 0])} />;
      })}
    </svg>
  );
};

export const Part3: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[2];
  const c = [0, at("Aber") - 3, at("Also") - 3, at("Und", 2) - 3, at("Die") - 3, at("Du") - 3, at("Die", 2) - 3];
  const hit = at("Funken");
  const strike = interpolate(f, [at("schlugen"), hit - 2, hit, hit + 10], [0, 0.6, 1, 0.3], clamp);
  const list = [
    <AbsoluteFill key="a">
      <Photo src={img("steppe.jpg")} from={0} dur={c[1]} z0={1.5} z1={1.6} y0={-12} y1={-14} />
      <Snow n={110} wind={6} fall={2.5} seed="q1" />
      <Stamp x={960} y={300} start={at("kaum")} rot={-6} size={90}>KAUM BÄUME</Stamp>
      <Tag x={500} y={780} start={at("Gras")} rot={-4}>GRAS</Tag>
      <Tag x={960} y={850} start={at("Moos")} rot={3}>MOOS</Tag>
      <Tag x={1420} y={780} start={at("Sträucher")} rot={-2}>STRÄUCHER</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Photo src={img("steppe.jpg")} from={c[1]} dur={c[2] - c[1]} z0={1.4} z1={1.45} blur={8} filter="brightness(0.7)" />
      <Card x={960} y={540} w={1300} start={c[1] + 2} pad={24}>
        <svg width={1252} height={640}>
          <rect width={1252} height={640} fill="#b9d3e6" />
          <path d="M0 640 L0 420 Q 330 120 626 110 Q 920 120 1252 420 L1252 640Z" fill="#f7fbff" stroke="#9cc1dc" strokeWidth={4} />
          <path d="M420 600 Q 420 330 626 320 Q 832 330 832 600Z" fill="#e7a35a" opacity={interpolate(f, [at("Schneehöhle"), at("Schneehöhle") + 12], [0, 0.55], clamp)} />
          <path d="M420 600 Q 420 330 626 320 Q 832 330 832 600Z" fill="none" stroke="#5d7f99" strokeWidth={6} strokeDasharray="14 8" opacity={f >= at("Schneehöhle") ? 1 : 0} />
          {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={120 + ((i * 263) % 1010)} cy={330 + ((i * 71) % 260)} r={6} fill="none" stroke="#7cc8f2" strokeWidth={3} opacity={f >= at("Luft") ? 0.9 : 0} />)}
          {[0, 1, 2].map((k) => <g key={k} opacity={f >= at("Wind") ? 1 : 0}><line x1={40} y1={120 + k * 60} x2={260} y2={130 + k * 60} stroke="#2f5f86" strokeWidth={8} strokeLinecap="round" /><path d={`M250 ${118 + k * 60} l24 12 l-26 10`} fill="#2f5f86" /></g>)}
          <text x={60} y={80} fontFamily="IceType" fontSize={40} fill={INK}>draußen: −20 °C + Wind</text>
          <text x={626} y={520} textAnchor="middle" fontFamily="IceMont" fontWeight={900} fontSize={44} fill={INK} opacity={f >= at("wärmer") ? 1 : 0}>VIEL WÄRMER</text>
        </svg>
      </Card>
      <Tag x={1500} y={170} start={at("Luft")} rot={3} size={44}>SCHNEE = VOLLER LUFT</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Shake start={c[2]} amp={8} len={200}>
        <Photo src={img("steppe.jpg")} from={c[2]} dur={c[3] - c[2]} z0={3} z1={3.4} y0={-30} y1={-32} />
        <Snow n={60} wind={2} fall={-6} size={2.2} seed="dig" opacity={0.9} />
      </Shake>
      <Stamp x={960} y={300} start={at("Händen")} rot={-5} size={84}>MIT BLOSSEN HÄNDEN</Stamp>
      <Stamp x={960} y={760} start={at("Finger")} rot={6} size={84}>FINGER: TAUB</Stamp>
      <Vignette s={0.5} frost={interpolate(f, [c[2], c[3]], [0.2, 0.7], clamp)} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Photo src={img("steppe.jpg")} from={c[3]} dur={c[4] - c[3]} z0={1.3} z1={1.35} blur={9} filter="brightness(0.6)" />
      <Card x={520} y={540} w={680} start={c[3] + 2} rot={-3}>
        <H>FEUER?</H>
        <Line show={at("Feuerzeug")} mark="✗">Feuerzeug</Line>
        <Line show={at("Streichhölzer")} mark="✗">Streichhölzer</Line>
      </Card>
      {f >= at("Dein") - 4 && (
        <PhoneInHand x={900} y={interpolate(pop(f, at("Dein") - 4, fps, 14), [0, 1], [1200, 60])} rot={-3}>
          <div style={{ position: "absolute", left: 24, right: 24, top: 280, background: "rgba(245,245,250,0.96)", color: INK, borderRadius: 26, padding: "26px 20px", textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 32 }}>Taschenlampe einschalten?</div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 24, fontWeight: 800, fontSize: 30, color: "#2f7fd8" }}><span>Nein</span><span>Ja</span></div>
          </div>
          {f >= at("Danke") && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 20%, rgba(255,255,220,0.9), rgba(255,255,220,0) 60%)" }} />}
        </PhoneInHand>
      )}
      <Stamp x={1500} y={900} start={at("hilfreich")} rot={-8} size={64}>SEHR HILFREICH …</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="e" style={{ background: "#2a2622" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, #4a4038 0%, #1b1815 80%)" }} />
      <Img src={img("pyrite_cut.png")} style={{ position: "absolute", left: 1060, top: 380, width: 520, transform: `rotate(6deg) scale(${pop(f, c[4] + 8, fps, 12)})` }} />
      <Img src={img("biface_cut.png")} style={{ position: "absolute", left: interpolate(strike, [0, 1], [320, 720]), top: interpolate(strike, [0, 1], [300, 360]), width: 380, transform: `rotate(${interpolate(strike, [0, 1], [-30, 20])}deg) scale(${pop(f, c[4] + 2, fps, 12)})` }} />
      <Sparks start={hit} x={1080} y={560} />
      <Sparks start={hit + 14} x={1080} y={560} />
      <Tag x={960} y={120} start={at("Trick")} rot={-2} size={56} bg="#FFF6D6">DER TRICK DER EISZEIT</Tag>
      <Tag x={520} y={250} start={at("Feuerstein")} rot={-4}>FEUERSTEIN</Tag>
      <Tag x={1330} y={300} start={at("Pyrit")} rot={3}>PYRIT</Tag>
      <Card x={960} y={900} w={1200} start={at("Forscher")} pad={26} rot={-1}>
        <div style={{ fontFamily: "IceType", fontSize: 44, textAlign: "center" }}>mögliche Spuren an ≈ 50.000 Jahre alten Neandertaler-Werkzeugen</div>
      </Card>
      <Vignette s={0.55} />
    </AbsoluteFill>,
    <AbsoluteFill key="f">
      <Photo src={img("steppe.jpg")} from={c[5]} dur={c[6] - c[5]} z0={1.3} z1={1.35} blur={8} filter="brightness(0.55)" />
      <Card x={960} y={520} w={900} start={c[5] + 2}>
        <Line show={at("keinen")} mark="✗">Feuerstein</Line>
        <Line show={at("Zunder")} mark="✗">trockener Zunder</Line>
      </Card>
      <Stamp x={960} y={860} start={at("nichts")} rot={-6} size={84}>KEIN FEUER</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="g">
      <Photo src={img("steppe.jpg")} from={c[6]} dur={110} z0={1.15} z1={1.25} filter={`brightness(${interpolate(f, [c[6], c[6] + 100], [0.9, 0.35], clamp)}) saturate(${interpolate(f, [c[6], c[6] + 100], [1, 0.5], clamp)})`} />
      <Snow n={180} wind={10} fall={3} seed="q7" />
      <Vignette s={0.7} frost={interpolate(f, [at("kalt") - 10, at("kalt") + 20], [0.1, 0.35], clamp)} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={2} fade={fade} snaps={[at("kaum"), at("Händen"), at("Finger"), at("hilfreich"), at("nichts")]} dings={[at("Dein")]}>
      {scenes(f, c, list)}
      {f >= hit - 2 && f < hit + 30 && <Sequence from={hit - 2} durationInFrames={15}><Audio src={staticFile("sfx/whip.wav")} volume={0.2} /></Sequence>}
    </Shell>
  );
};

// ночь: та же степь, затемнённая, со звёздами (без деревьев — как в ледниковой степи)
const Night: React.FC<{ from: number; dur: number; z0?: number; z1?: number; blur?: number; extra?: string }> = ({ from, dur, z0 = 1.2, z1 = 1.3, blur = 0, extra = "" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src={img("steppe.jpg")} from={from} dur={dur} z0={z0} z1={z1} blur={blur} filter={`brightness(0.28) saturate(0.6) hue-rotate(10deg) ${extra}`} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,10,30,0.9) 0%, rgba(5,10,30,0.55) 45%, rgba(0,0,0,0) 62%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, filter: blur ? `blur(${blur / 2}px)` : undefined }}>
        {Array.from({ length: 260 }, (_, i) => <circle key={i} cx={random("sx" + i) * 1920} cy={random("sy" + i) * 560} r={0.6 + random("sr" + i) * 2.2} fill="white" opacity={0.35 + 0.65 * Math.abs(Math.sin(f / (20 + (i % 13)) + i))} />)}
      </svg>
    </AbsoluteFill>
  );
};

// ================= ЧАСТЬ 4 — Die Nacht =================
const Eyes: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const pairs = [[420, 820, 1], [760, 760, 0.7], [1240, 800, 0.85], [1560, 860, 1.1], [1020, 720, 0.55]];
  return (
    <>
      {pairs.map(([x, y, s], k) => {
        const o = interpolate(f, [start + k * 6, start + k * 6 + 8], [0, 1], clamp) * (Math.floor((f + k * 13) / 40) % 7 === 0 ? 0.1 : 1);
        return (
          <div key={k} style={{ position: "absolute", left: x + Math.sin(f / 30 + k) * 10, top: y, opacity: o, display: "flex", gap: 26 * s }}>
            {[0, 1].map((e) => <div key={e} style={{ width: 22 * s, height: 13 * s, borderRadius: "50%", background: "#ffe36e", boxShadow: "0 0 18px 6px rgba(255,220,90,0.8)" }} />)}
          </div>
        );
      })}
    </>
  );
};

export const Part4: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[3];
  const c = [0, at("Sie") - 3, at("Wildpferde") - 3, at("Dein") - 3, at("Du", 1) - 3, at("Irgendwann") - 3];
  const list = [
    <AbsoluteFill key="a">
      <Night from={0} dur={c[1]} z0={1.15} z1={1.25} />
      <Eyes start={at("Heulen")} />
      <Stamp x={960} y={280} start={at("Wölfe")} rot={-6} size={110}>WÖLFE</Stamp>
      <Vignette s={0.75} />
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Photo src={img("reindeer2.jpg")} from={c[1]} dur={c[2] - c[1]} z0={1.15} z1={1.25} filter="brightness(0.8)" />
      <Tag x={520} y={200} start={c[1] + 4} rot={-3}>IN DER EISZEIT: FAST ÜBERALL IN EUROPA</Tag>
      <Tag x={1300} y={880} start={at("Rentiere")} rot={2} size={56}>RENTIERE</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Photo src={oldImg("fauna.jpg")} from={c[2]} dur={c[3] - c[2]} z0={2.4} z1={2.5} x0={44} x1={44} y0={6} y1={6} />
      <Tag x={700} y={240} start={at("Wildpferde")} rot={-3} size={56}>WILDPFERDE</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Night from={c[3]} dur={c[4] - c[3]} blur={10} />
      <PhoneInHand x={860} y={interpolate(pop(f, c[3], fps, 14), [0, 1], [1200, 60])} rot={-3}>
        <div style={{ textAlign: "center", marginTop: 300, fontSize: 120, fontWeight: 700 }}>??:??</div>
        <Notif start={at("Akku")} title="Akku: 50 %" text="Energiesparmodus?" icon="!" top={60} />
        <Notif start={at("Google")} title="Google Maps" text="Route nicht gefunden." icon="✕" top={190} />
      </PhoneInHand>
      <Vignette s={0.7} />
    </AbsoluteFill>,
    <AbsoluteFill key="e" style={{ background: "#05070c" }}>
      <div style={{ position: "absolute", left: 960 - 360, top: 120, width: 720, height: 420, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 80px 40px #05070c inset" }}>
        <div style={{ position: "absolute", left: -600, top: -300, width: 1920, height: 1080 }}><Night from={c[4]} dur={200} /></div>
      </div>
      <Shake start={c[4]} amp={5} len={400}><AbsoluteFill /></Shake>
      <Tag x={960} y={700} start={at("Schneeloch")} rot={-2}>DEIN SCHNEELOCH</Tag>
      <Tag x={960} y={830} start={at("Achseln")} rot={2} size={42}>HÄNDE UNTER DEN ACHSELN</Tag>
      <Stamp x={960} y={960} start={at("Nacht", 2)} rot={-4} size={60}>1 STUNDE = 1 NACHT</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="f">
      <Night from={c[5]} dur={140} z0={1.3} z1={1.6} blur={interpolate(f, [c[5], c[5] + 120], [2, 14], clamp)} extra={`sepia(${interpolate(f, [at("warm") - 6, at("warm") + 20], [0, 0.8], clamp)})`} />
      <Stamp x={960} y={540} start={at("gefährlichste")} rot={-6} size={84}>GEFÄHRLICHSTES ZEICHEN</Stamp>
      <Eyelids open={interpolate(f, [at("müde"), at("Kräfte") + 10], [1, 0.25], clamp)} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={3} fade={fade} wind={0.2} snaps={[at("Wölfe"), at("gefährlichste")]} dings={[at("Akku"), at("Google")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 5 — Tag zwei =================
export const Part5: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[4];
  const c = [0, at("Dein") - 3, at("Dann") - 3, at("Eine") - 3, at("Deine") - 3, at("Dein", 2) - 3];
  const list = [
    <AbsoluteFill key="a">
      <Photo src={img("steppe.jpg")} from={0} dur={c[1]} z0={1.1} z1={1.2} filter="brightness(1.1)" />
      <Snow n={60} wind={2} fall={2} seed="t2" />
      <Stamp x={960} y={480} start={at("Tag")} rot={-6} size={150}>TAG 2</Stamp>
      <Eyelids open={interpolate(f, [0, at("Sonne"), at("auf") + 10], [0, 0.4, 1], clamp)} />
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Photo src={img("steppe.jpg")} from={c[1]} dur={c[2] - c[1]} z0={1.4} z1={1.45} blur={8} filter="brightness(0.65)" />
      <Card x={960} y={500} w={1200} start={at("Schnee")}>
        <H>SCHNEE ESSEN?</H>
        <Line show={at("isst")}>Mund trocken → du isst Schnee</Line>
        <Line show={at("Schlechte")} mark="✗">kostet Körperwärme</Line>
        <Line show={at("Feuer")} mark="✓">besser: am Feuer schmelzen</Line>
      </Card>
      <Stamp x={1450} y={880} start={at("Idee")} rot={-8} size={74}>SCHLECHTE IDEE</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Photo src={img("steppe.jpg")} from={c[2]} dur={c[3] - c[2]} z0={1.6} z1={1.7} y0={-14} y1={-15} />
      <Card x={960} y={500} w={900} start={at("Hunger")}>
        <H>ESSEN IM WINTER</H>
        <Line show={at("nichts")} mark="✗">Pflanzen: wächst nichts</Line>
        <Line show={at("Beeren")} mark="✗">Beeren</Line>
        <Line show={at("Früchte")} mark="✗">Früchte</Line>
        <Line show={at("Beinen")} mark="✓">nur auf vier Beinen</Line>
      </Card>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Photo src={img("reindeer2.jpg")} from={c[3]} dur={c[4] - c[3]} z0={1.1} z1={1.3} y0={4} y1={2} />
      <Tag x={1350} y={200} start={at("hundert")} rot={3} size={52}>≈ 100 m</Tag>
      <Stamp x={480} y={330} start={at("Speer")} rot={-6} size={64}>KEIN SPEER</Stamp>
      <Stamp x={480} y={530} start={at("Gruppe")} rot={4} size={64}>KEINE GRUPPE</Stamp>
      <Stamp x={480} y={730} start={at("Plan")} rot={-3} size={64}>KEIN PLAN</Stamp>
      <Stamp x={1350} y={850} start={at("Chance")} rot={-8} size={100}>0 % CHANCE</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Photo src={img("steppe.jpg")} from={c[4]} dur={c[5] - c[4]} z0={2.2} z1={2.3} y0={-25} y1={-25} blur={6} />
      <div style={{ position: "absolute", left: 300, top: -100, height: 1500, width: 551 * (1500 / 841), transform: "rotate(-6deg)" }}>
        <Img src={oldImg("feet_wet.png")} style={{ position: "absolute", height: 1500, filter: "saturate(0.6) brightness(0.9)" }} />
      </div>
      <Tag x={1400} y={300} start={at("Erfrierungen")} rot={2} size={56}>ERFRIERUNGEN</Tag>
      <Tag x={1400} y={520} start={at("durchnässt")} rot={-3} size={52}>SCHUHE: DURCHNÄSST</Tag>
      <Tag x={1400} y={740} start={at("Füße")} rot={2} size={52}>FÜSSE: TAUB</Tag>
      <Vignette s={0.5} frost={0.7} />
    </AbsoluteFill>,
    <AbsoluteFill key="f">
      <Photo src={img("steppe.jpg")} from={c[5]} dur={120} z0={1.3} z1={1.35} blur={9} filter="brightness(0.7)" />
      <PhoneInHand x={860} y={interpolate(pop(f, c[5], fps, 14), [0, 1], [1200, 60])} rot={-3}>
        <div style={{ textAlign: "center", marginTop: 420, fontSize: 120, fontWeight: 700 }}>??:??</div>
        <Notif start={at("Akku")} title="Akku: 30 %" text="Bitte bald aufladen." icon="!" top={60} />
        <Notif start={at("Bildschirmzeit")} title="Bildschirmzeit" text="Gestern: 0 Minuten" icon="◷" top={190} />
        <Notif start={at("Rekord")} title="Neuer Rekord!" text="Persönliche Bestleistung ★" icon="★" top={320} />
      </PhoneInHand>
      <Vignette s={0.5} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={4} fade={fade} snaps={[at("Tag"), at("Idee"), at("Speer"), at("Gruppe"), at("Plan"), at("Chance")]} dings={[at("Akku"), at("Bildschirmzeit"), at("Rekord")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 6 — Wie die echten Eiszeitmenschen überlebten =================
const Needle: React.FC<{ draw: number }> = ({ draw }) => (
  <svg width={1100} height={260}>
    <path d="M60 130 Q 500 96 1020 128 Q 500 168 60 130Z" fill="#efe3c6" stroke="#8b7a55" strokeWidth={6} strokeDasharray={2400} strokeDashoffset={2400 * (1 - draw)} />
    <ellipse cx={170} cy={130} rx={26} ry={10} fill={PAPER} stroke="#8b7a55" strokeWidth={5} opacity={draw} />
  </svg>
);

export const Part6: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const at = ATS[5];
  const c = [0, at("Sie") - 3, at("Ihre") - 3, at("Sie", 2) - 3, at("Und", 2) - 3];
  const M = MAP;
  const keys: Cam[] = [{ f: c[4], s: 1.1, x: 700, y: 760 }, { f: at("Südwesten"), s: 1.5, x: 600, y: 860 }];
  const cam = camAt(f, keys);
  const arrow = interpolate(f, [at("zogen"), at("zurück") + 6], [0, 1], { ...clamp, easing: ease });
  const A = toScreen(cam, M.mitte), B = toScreen(cam, M.sw), C = toScreen(cam, M.spain);
  const list = [
    <AbsoluteFill key="a">
      <Photo src={oldImg("fauna.jpg")} from={0} dur={c[1]} z0={1.2} z1={1.3} filter="brightness(0.75)" />
      <Tag x={960} y={300} start={at("Menschen")} rot={-3} size={56}>DIE MENSCHEN DER EISZEIT</Tag>
      <Stamp x={960} y={760} start={at("Recht")} rot={-7} size={90}>ZU RECHT</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="b" style={{ background: "#2a2622" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, #4a4038 0%, #1b1815 80%)" }} />
      <Card x={960} y={480} w={1240} start={c[1] + 2} pad={30}>
        <H>NADEL AUS KNOCHEN</H>
        <Needle draw={interpolate(f, [at("Nadeln"), at("Knochen") + 14], [0, 1], clamp)} />
        <div style={{ fontFamily: "IceType", fontSize: 44, textAlign: "center", opacity: f >= at("sechsundzwanzigtausend") ? 1 : 0 }}>in Europa seit ≈ 26.000 Jahren</div>
      </Card>
      <Tag x={460} y={680} start={at("Öhr")} rot={-4} size={52}>MIT ÖHR!</Tag>
      <Tag x={1450} y={180} start={at("Fell")} rot={3}>FELL & LEDER</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Photo src={img("steppe.jpg")} from={c[2]} dur={c[3] - c[2]} z0={1.4} z1={1.45} blur={9} filter="brightness(0.6)" />
      <Card x={540} y={540} w={720} start={c[2] + 2} rot={-2}>
        <H>SIE</H>
        <Line show={at("eng")} mark="✓">eng anliegend</Line>
        <Line show={at("Schichten")} mark="✓">mehrere Schichten</Line>
        <Line show={at("draußen")} mark="✓">wind- und schneedicht</Line>
      </Card>
      <Card x={1400} y={540} w={620} start={at("Kleidung", 2) + 4} rot={2}>
        <H>DU</H>
        <Line show={at("eng") + 4} mark="✗">Hoodie</Line>
        <Line show={at("Schichten") + 4} mark="✗">nasse Jeans</Line>
        <Line show={at("draußen") + 4} mark="✗">Turnschuhe</Line>
      </Card>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Photo src={oldImg("fauna.jpg")} from={c[3]} dur={c[4] - c[3]} z0={1.35} z1={1.45} blur={6} filter="brightness(0.6)" />
      <Card x={960} y={540} w={1400} start={c[3] + 2}>
        <H>IHR GEHEIMNIS</H>
        <Line show={at("Gruppen")} mark="✓">Leben in Gruppen</Line>
        <Line show={at("Pflanze")} mark="✓">kannten jedes Tier und jede Pflanze</Line>
        <Line show={at("Wasser")} mark="✓">wussten, wo es Wasser gab</Line>
        <Line show={at("schwächsten")} mark="✓">… und wo kein Wind war</Line>
      </Card>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <EuropeMap cam={cam} ice={1} alps={1} deLine={0.8} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {[B, C].map((T, k) => {
          const mx = (A[0] + T[0]) / 2 - 80, my = (A[1] + T[1]) / 2 - 60;
          return <path key={k} d={`M${A[0]} ${A[1]} Q ${mx} ${my} ${T[0]} ${T[1]}`} fill="none" stroke={RED} strokeWidth={12} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - arrow)} />;
        })}
      </svg>
      <Tag x={B[0]} y={B[1] - 60} start={at("Frankreich")} rot={-3} size={46}>FRANKREICH</Tag>
      <Tag x={C[0]} y={C[1] + 60} start={at("Spanien")} rot={3} size={46}>SPANIEN</Tag>
      <Stamp x={1350} y={200} start={at("Überraschende")} rot={-6} size={70}>SELBST SIE GINGEN</Stamp>
      <Stamp x={1250} y={880} start={at("verlassen")} rot={-8} size={70}>SOGAR DIE PROFIS: WEG</Stamp>
      <Vignette s={0.45} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={5} fade={fade} snaps={[at("Recht"), at("Überraschende"), at("verlassen")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 7 — Das Ergebnis =================
export const Part7: React.FC<{ fade?: boolean }> = ({ fade = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[6];
  const c = [0, at("Hier") - 3, at("Dein") - 3, at("Und", 1) - 3, at("Und", 2) - 3];
  const rows: [string, string, number][] = [["DU", "EINE NACHT", at("Nacht", 2)], ["RENTIER", "LEBT ENTSPANNT", at("entspannt")], ["EISZEITMENSCH", "ZOG NACH SÜDFRANKREICH", at("gezogen")]];
  const list = [
    <AbsoluteFill key="a">
      <Photo src={img("steppe.jpg")} from={0} dur={c[1]} z0={1.3} z1={1.4} blur={6} filter="brightness(0.6)" />
      <div style={{ position: "absolute", left: 960, top: 380, transform: `translate(-50%,-50%) scale(${1.4 * pop(f, 4, fps, 12)})` }}>
        <div style={{ background: "rgba(14,22,34,0.92)", border: `5px solid ${RED}`, borderRadius: 22, padding: "14px 34px 10px", textAlign: "center" }}>
          <div style={{ fontFamily: "IceMont", fontWeight: 800, fontSize: 26, letterSpacing: 6, color: RED }}>ÜBERLEBT</div>
          <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 96, color: "white", fontVariantNumeric: "tabular-nums" }}>{fmt(108000)}</div>
        </div>
      </div>
      <Stamp x={960} y={700} start={at("Nacht")} rot={-5} size={80}>MIT GLÜCK: EINE NACHT</Stamp>
      <Stamp x={960} y={880} start={at("Stunden")} rot={4} size={64}>OHNE GLÜCK: EIN PAAR STUNDEN</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Photo src={img("steppe.jpg")} from={c[1]} dur={c[2] - c[1]} z0={1.35} z1={1.4} blur={8} filter="brightness(0.6)" />
      <Card x={960} y={540} w={1500} start={c[1] + 2}>
        <H size={70}>DIE TAFEL</H>
        {rows.map(([n, v, st]) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "IceMont", fontWeight: 900, fontSize: 60, height: 110, opacity: f >= st - 6 ? 1 : 0.12, borderBottom: "3px dashed #b8ab90" }}>
            <span>{n}</span><span style={{ color: RED, fontFamily: "IceType", fontSize: 54 }}>{v}</span>
          </div>
        ))}
      </Card>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Photo src={img("steppe.jpg")} from={c[2]} dur={c[3] - c[2]} z0={1.3} z1={1.35} blur={9} filter="brightness(0.55)" />
      <PhoneInHand x={860} y={interpolate(pop(f, c[2], fps, 14), [0, 1], [1200, 60])} rot={-3}>
        <div style={{ textAlign: "center", marginTop: 420, fontSize: 90, fontWeight: 900, color: RED, opacity: Math.floor(f / 8) % 2 ? 1 : 0.4 }}>1 %</div>
        <Notif start={at("Akku")} title="Akku: 1 %" text="Gerät schaltet sich aus." icon="!" top={60} />
        <Notif start={at("Möchtest")} title="iCloud" text="Möchtest du ein Backup erstellen?" icon="☁" top={190} />
      </PhoneInHand>
      <Vignette s={0.55} />
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Photo src={img("steppe.jpg")} from={c[3]} dur={c[4] - c[3]} z0={1.2} z1={1.3} filter="brightness(0.75)" />
      <Snow n={120} wind={6} fall={2.5} seed="z4" />
      <Card x={960} y={480} w={1300} start={at("dran")}>
        <H size={58}>WELCHE EINE SACHE NIMMST DU MIT?</H>
        <div style={{ display: "flex", justifyContent: "space-around", fontFamily: "IceType", fontSize: 50, padding: "10px 0" }}>
          <span>Feuerzeug?</span><span>Schlafsack?</span><span>Powerbank?</span>
        </div>
      </Card>
      <Tag x={960} y={850} start={at("Kommentare")} rot={-2} size={60} bg="#FFF6D6">↓ SCHREIB'S IN DIE KOMMENTARE</Tag>
      <Vignette s={0.5} />
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Photo src={oldImg("fauna.jpg")} from={c[4]} dur={100} z0={1.2} z1={1.35} filter="brightness(0.7)" />
      <Stamp x={960} y={420} start={at("abonniere")} rot={-5} size={110}>ABONNIEREN</Stamp>
      <Tag x={960} y={720} start={at("Dinosauriern")} rot={2} size={60}>NÄCHSTES MAL: DINOSAURIER</Tag>
      <Vignette s={0.55} />
    </AbsoluteFill>,
  ];
  return (
    <Shell i={6} fade={fade} snaps={[at("Nacht"), at("Stunden"), at("abonniere")]} dings={[at("Akku"), at("Möchtest")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

export const PARTS = [Part2, Part3, Part4, Part5, Part6, Part7];
export { FRAMES, FPS };
