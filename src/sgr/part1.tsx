// «Wie lange würdest DU neben einem Schwarzen Loch überleben?» — часть 1: Ankunft.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BatteryHud, FPS, ICE, INK, Notif, PAPER, RED, Shake, Stamp, Tag, Timer, Vignette, clamp, oldImg, pop, Grain } from "../eiszeit/kit";
import { Eyelids } from "../eiszeit/part1";
import { BlackHole, Dust, FloatPhone, Sky, Visor, simg } from "./space";
import { ATS, FRAMES, LEAD } from "./timeline";

const at = ATS[0];
const N = FRAMES[0];
const GC = simg("gc_obs.jpg");

const SWake: React.FC<{ b: number }> = ({ b }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12, 20, 26, 32, at("Augen") + 4, at("Augen") + 14], [0, 0.3, 0.3, 0.05, 0.45, 0.5, 1], clamp);
  const spin = interpolate(f, [0, at("Oben"), at("Unten") + 10, b], [0, 4, 30, 40], clamp);
  return (
    <AbsoluteFill>
      <Sky src={simg("gc_cauldron.jpg")} from={0} dur={b} rot0={spin} rot1={spin} z0={1.9} z1={1.9} />
      <Dust />
      {f >= at("Kein") && f < at("Kein", 3) && <Tag x={960} y={820} start={at("Kein")} rot={-3} size={50}>KEIN BODEN</Tag>}
      {f >= at("Oben") && f < at("Nur") && <Tag x={960} y={240} start={at("Oben")} rot={3} size={50}>KEIN OBEN · KEIN UNTEN</Tag>}
      <Vignette s={0.55} />
      <Eyelids open={o} />
    </AbsoluteFill>
  );
};

const SGalaxy: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, a, fps, 14);
  const z = interpolate(f, [a, b], [0.95, 1.08], clamp);
  const S = 1000;
  const cx = 960, cy = 540;
  const sun = [cx, cy + 0.235 * S * z], ctr = [cx, cy];
  const line = interpolate(f, [at("siebenundzwanzigtausend") - 4, at("Lichtjahre") + 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#02030a" }}>
      <Img src={simg("milkyway.jpg")} style={{ position: "absolute", left: cx - (S * z) / 2, top: cy - (S * z) / 2, width: S * z, height: S * z, transform: `rotate(${(f - a) * 0.05}deg) scale(${s})`, WebkitMaskImage: "radial-gradient(circle, black 58%, transparent 71%)", maskImage: "radial-gradient(circle, black 58%, transparent 71%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={sun[0]} y1={sun[1]} x2={sun[0]} y2={sun[1] - (sun[1] - ctr[1]) * line} stroke={RED} strokeWidth={8} strokeDasharray="18 12" />
        <circle cx={sun[0]} cy={sun[1]} r={14} fill="#7cc8f2" stroke="white" strokeWidth={4} opacity={f >= at("Erde") - 30 ? 1 : 0} />
        <circle cx={ctr[0]} cy={ctr[1]} r={16 + 4 * Math.sin(f / 5)} fill={RED} stroke="white" strokeWidth={5} opacity={f >= at("Zentrum") ? 1 : 0} />
      </svg>
      <Tag x={ctr[0] + 260} y={ctr[1] - 40} start={at("Zentrum")} rot={-3} size={46}>DU: IM ZENTRUM</Tag>
      <Tag x={sun[0] + 230} y={sun[1] + 10} start={at("Erde") - 6} rot={2} size={44}>ERDE</Tag>
      <Stamp x={sun[0] - 330} y={(sun[1] + ctr[1]) / 2} start={at("Lichtjahre")} rot={-6} size={52}>27.000 LICHTJAHRE</Stamp>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SHole: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [a, b], [150, 190], clamp);
  const suns = 10000 * Math.round(interpolate(f, [at("vier") - 2, at("Sonne") + 4], [0, 400], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  return (
    <AbsoluteFill>
      <Sky src={GC} from={a} dur={b - a} z0={1.15} z1={1.22} rot0={2} rot1={5} />
      <BlackHole x={960} y={520} r={r} bg={GC} />
      <Dust seed="h" />
      <Tag x={960} y={160} start={at("Name")} rot={-2} size={56}>SAGITTARIUS A*</Tag>
      {f >= at("vier") - 2 && (
        <div style={{ position: "absolute", left: 960, top: 880, transform: "translate(-50%,-50%) rotate(-1deg)", background: PAPER, padding: "14px 36px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", fontFamily: "IceMont", fontWeight: 900, fontSize: 62, color: INK, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          ≈ {suns.toLocaleString("de-DE")} × <span style={{ color: "#e8a317" }}>☀</span> SONNE
        </div>
      )}
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const SHoodie: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = at("fünfzehn");
  const left = Math.max(0, 15 - Math.floor((f - t0) / (fps * 0.33)));
  const fade = interpolate(f, [at("Bewusstsein"), at("Kein", 3) + 10], [0, 0.65], clamp);
  return (
    <AbsoluteFill>
      <Sky src={GC} from={a} dur={b - a} z0={1.4} z1={1.5} rot0={6} rot1={10} />
      <div style={{ position: "absolute", left: 500, top: interpolate(pop(f, a, fps, 15), [0, 1], [1150, 480]) + Math.sin(f / 18) * 12, height: 760, width: 551 * (760 / 841), transform: `rotate(${-10 + Math.sin(f / 30) * 4}deg)` }}>
        <Img src={oldImg("feet_cut.png")} style={{ position: "absolute", height: 760 }} />
      </div>
      <Tag x={1350} y={250} start={at("Hoodie")} rot={3} size={52}>NUR HOODIE & JEANS</Tag>
      {f >= t0 && (
        <div style={{ position: "absolute", left: 1350, top: 560, transform: "translate(-50%,-50%)", fontFamily: "IceMont", fontWeight: 900, fontSize: 260, color: RED, textShadow: "0 8px 0 #000, 0 0 40px rgba(0,0,0,0.8)", fontVariantNumeric: "tabular-nums" }}>{left}</div>
      )}
      <AbsoluteFill style={{ background: "black", opacity: fade }} />
      <Stamp x={1350} y={860} start={at("Bewusstsein")} rot={-6} size={70}>BEWUSSTLOS</Stamp>
      <Tag x={520} y={180} start={at("Luftdruck")} rot={-3} size={44}>KEIN LUFTDRUCK</Tag>
      <Tag x={520} y={300} start={at("Sauerstoff")} rot={2} size={44}>KEIN SAUERSTOFF</Tag>
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

const SSuit: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at("Raumanzug") - 4, at("Raumanzug") + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Sky src={GC} from={a} dur={b - a} z0={1.2} z1={1.25} rot0={3} rot1={5} />
      <BlackHole x={1250} y={460} r={120} bg={GC} />
      <Dust seed="s" />
      <Visor on={v} o2="100 %" />
      <Tag x={700} y={300} start={at("Raumanzug")} rot={-3} size={56}>RAUMANZUG ✓</Tag>
      <Tag x={700} y={430} start={at("Stunden")} rot={2} size={46} bg="#FFF6D6">LUFT: EIN PAAR STUNDEN</Tag>
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
      <Sky src={GC} from={a} dur={b - a} z0={1.3} z1={1.35} rot0={5} rot1={7} filter="blur(6px) brightness(0.8)" />
      <FloatPhone x={960} y={interpolate(s, [0, 1], [1500, 540])} s={1.05}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "54px 34px 0", fontSize: 24, fontWeight: 700 }}>
          <span>{f >= at("Nachricht") ? "Kein Netz" : "…"}</span><span>{full ? "100 %" : ""}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 190, fontSize: 110, fontWeight: 700 }}>??:??</div>
        {full && <div style={{ textAlign: "center", marginTop: 160, fontSize: 80, fontWeight: 900, color: "#6fe38a" }}>100 %</div>}
        <Notif start={at("Nachricht")} title="Kein Netz" text={f >= at("Funkmast") ? "Nächster Funkmast: 27.000 Lichtjahre" : "Keine Verbindung"} icon="✕" top={100} />
      </FloatPhone>
      <Visor o2="99 %" />
    </AbsoluteFill>
  );
};

const SClock: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sky src={GC} from={a} dur={b - a} z0={1.25} z1={1.3} rot0={4} rot1={6} filter="brightness(0.6)" />
      <BlackHole x={1450} y={700} r={100} bg={GC} />
      {f >= at("Video") && <Tag x={560} y={330} start={at("Video")} rot={-3} size={46} bg="#FFF6D6">= REST DES VIDEOS</Tag>}
      <Visor o2="99 %" />
    </AbsoluteFill>
  );
};

const STafel: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, a + 2, fps, 13);
  return (
    <AbsoluteFill>
      <Sky src={GC} from={a} dur={160} z0={1.3} z1={1.35} filter="blur(8px) brightness(0.55)" />
      <div style={{ position: "absolute", left: 960, top: 540, transform: `translate(-50%,-50%) rotate(-1deg) scale(${s})`, background: PAPER, width: 1100, padding: "40px 60px", boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 64, color: INK, letterSpacing: 6, textAlign: "center", borderBottom: `6px solid ${INK}`, paddingBottom: 12, marginBottom: 20 }}>DIE TAFEL</div>
        {[["DU", at("dich")], ["?????", at("Runden")]].map(([n, st]) => (
          <div key={n as string} style={{ display: "flex", justifyContent: "space-between", fontFamily: "IceMont", fontWeight: 900, fontSize: 70, color: INK, height: 110, alignItems: "center", opacity: f >= (st as number) ? 1 : 0.15, borderBottom: "3px dashed #b8ab90" }}>
            <span>{n}</span><span style={{ color: RED, fontFamily: "IceType" }}>?</span>
          </div>
        ))}
      </div>
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};

const SRun: React.FC<{ a: number }> = ({ a }) => (
  <AbsoluteFill>
    <Sky src={GC} from={a} dur={80} z0={1.15} z1={1.3} rot0={2} rot1={6} />
    <BlackHole x={960} y={540} r={interpolate(useCurrentFrame(), [a, a + 70], [160, 220], clamp)} bg={GC} />
    <Dust seed="r" speed={2} />
    <Visor o2="99 %" />
  </AbsoluteFill>
);

export const SgrPart1: React.FC<{ fade?: boolean }> = ({ fade = true }) => {
  const f = useCurrentFrame();
  const c = { gal: at("Du") - 3, hole: at("Und") - 3, hood: at("Kurze") - 3, suit: at("Also") - 3, phone: at("Und", 2) - 3, clock: at("Wir") - 3, tafel: at("Am") - 3, run: at("Die") - 3 };
  return (
    <AbsoluteFill style={{ background: "#02030a" }}>
      {f < c.gal && <SWake b={c.gal} />}
      {f >= c.gal && f < c.hole && <SGalaxy a={c.gal} b={c.hole} />}
      {f >= c.hole && f < c.hood && <SHole a={c.hole} b={c.hood} />}
      {f >= c.hood && f < c.suit && <SHoodie a={c.hood} b={c.suit} />}
      {f >= c.suit && f < c.phone && <SSuit a={c.suit} b={c.phone} />}
      {f >= c.phone && f < c.clock && <SPhone a={c.phone} b={c.clock} />}
      {f >= c.clock && f < c.tafel && <SClock a={c.clock} b={c.tafel} />}
      {f >= c.tafel && f < c.run && <STafel a={c.tafel} />}
      {f >= c.run && <SRun a={c.run} />}
      {(f < c.tafel || f >= c.run) && <Timer appear={at("Uhr", 1)} run={at("läuft")} move={at("läuft") + 8} />}
      <BatteryHud appear={at("Akku", 2)} pct={interpolate(f, [at("läuft"), N], [100, 99], clamp)} big={interpolate(f, [at("Akku", 2), at("Akku", 2) + 6, at("Am") - 10, at("Am")], [0, 0.8, 0.8, 0], clamp)} />
      <Grain />
      {fade && <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [N - 10, N], [0, 1], clamp) }} />}
      <Sequence from={LEAD}><Audio src={staticFile("sgr/p1/voice.mp3")} /></Sequence>
      <Audio src={staticFile("sgr/hum.mp3")} loop volume={0.12} />
      {Object.values(c).map((s, i) => <Sequence key={i} from={s - 4} durationInFrames={40}><Audio src={staticFile("iceage/whoosh.mp3")} volume={0.15} /></Sequence>)}
      {[at("Lichtjahre"), at("Bewusstsein"), at("Raumanzug")].map((s, i) => <Sequence key={"s" + i} from={s} durationInFrames={15}><Audio src={staticFile("iceage/snap.wav")} volume={0.2} /></Sequence>)}
      <Sequence from={at("Nachricht")} durationInFrames={40}><Audio src={staticFile("sfx/ding.wav")} volume={0.2} /></Sequence>
      {Array.from({ length: 15 }, (_, i) => <Sequence key={"c" + i} from={at("fünfzehn") + Math.round(i * FPS * 0.33)} durationInFrames={5}><Audio src={staticFile("iceage/tick.wav")} volume={0.15} /></Sequence>)}
      {Array.from({ length: Math.ceil((N - at("läuft")) / FPS) }, (_, i) => <Sequence key={"t" + i} from={at("läuft") + i * FPS} durationInFrames={5}><Audio src={staticFile("iceage/tick.wav")} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};

export { ICE, Shake };
