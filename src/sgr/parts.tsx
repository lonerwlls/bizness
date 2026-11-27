// «Schwarzes Loch» — части 2–7.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BatteryHud, INK, Notif, PAPER, RED, Stamp, Tag, clamp, oldImg, pop, Grain } from "../eiszeit/kit";
import { Card, H, HudTimer, Line, scenes } from "../eiszeit/parts";
import { BlackHole, Dust, FloatPhone, Sky, Visor, simg } from "./space";
import { ATS, FRAMES, LEAD, OFF, STORY, batteryAt } from "./timeline";

const GC = simg("gc_obs.jpg");

const Shell: React.FC<{ i: number; fade?: boolean; o2: [number, number]; snaps?: number[]; dings?: number[]; visor?: (f: number) => boolean; children: React.ReactNode }> = ({ i, fade, o2, snaps = [], dings = [], visor, children }) => {
  const f = useCurrentFrame();
  const N = FRAMES[i];
  const st = STORY[i];
  const showVisor = visor ? visor(f) : true;
  return (
    <AbsoluteFill style={{ background: "#02030a" }}>
      {children}
      {showVisor && <Visor o2={`${Math.round(interpolate(f, [0, N], o2, clamp))} %`} />}
      {st && <HudTimer sec={interpolate(f, [0, N], st, clamp)} />}
      <BatteryHud appear={-100} pct={batteryAt(OFF[i] + f)} />
      <Grain />
      {fade && <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [N - 12, N], [0, 1], clamp) }} />}
      <Sequence from={LEAD}><Audio src={staticFile(`sgr/p${i + 1}/voice.mp3`)} /></Sequence>
      <Audio src={staticFile("sgr/hum.mp3")} loop volume={0.12} />
      {snaps.map((s, k) => <Sequence key={"s" + k} from={s} durationInFrames={15}><Audio src={staticFile("iceage/snap.wav")} volume={0.2} /></Sequence>)}
      {dings.map((s, k) => <Sequence key={"d" + k} from={s} durationInFrames={40}><Audio src={staticFile("sfx/ding.wav")} volume={0.2} /></Sequence>)}
    </AbsoluteFill>
  );
};

// растянутые ноги (спагеттификация, вид от первого лица)
const Stretch: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  const h = 760;
  return (
    <div style={{ position: "absolute", left: 960, top: 1080, transformOrigin: "50% 100%", transform: `translate(-50%, -100%) scaleY(${k}) scaleX(${1 / Math.sqrt(k)}) rotate(${Math.sin(f / 30) * 2}deg)`, height: h, width: 551 * (h / 841) }}>
      <Img src={oldImg("feet_cut.png")} style={{ position: "absolute", height: h, transform: "rotate(180deg)" }} />
    </div>
  );
};

// ================= ЧАСТЬ 2 — Wie groß ist das Ding? =================
export const SgrPart2: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[1];
  const c = [0, at("Und") - 3, at("Die") - 3, at("Forscher") - 3, at("Dein") - 3];
  const seg = interpolate(f, [at("dreißig") - 4, at("Mond") + 10], [0, 30], clamp);
  const flash = interpolate(f, [at("Foto"), at("Foto") + 8], [1, 0], clamp) * (f >= at("Foto") ? 1 : 0);
  const list = [
    <AbsoluteFill key="a">
      <Sky src={GC} from={0} dur={c[1]} z0={1.3} z1={1.35} filter="brightness(0.45) blur(3px)" />
      <Card x={960} y={520} w={1600} start={4} pad={30}>
        <H>DER EREIGNISHORIZONT</H>
        <svg width={1540} height={380}>
          <path d="M40 360 A 330 330 0 0 1 370 30 L370 360Z" fill="#000" />
          <line x1={370} y1={360} x2={1500} y2={360} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 30 }, (_, i) => (
            <g key={i} opacity={i < seg ? 1 : 0}>
              <circle cx={380 + i * 37.5} cy={300} r={9} fill="#2f7fd8" />
              <circle cx={380 + i * 37.5 + 26} cy={300} r={4} fill="#aaa" />
            </g>
          ))}
          <text x={400} y={90} fontFamily="IceMont" fontWeight={900} fontSize={60} fill={INK} opacity={f >= at("zwölf") ? 1 : 0}>Radius ≈ 12 Mio. km</text>
          <text x={400} y={190} fontFamily="IceType" fontSize={44} fill={RED} opacity={f >= at("Mond") ? 1 : 0}>= 30 × Erde–Mond</text>
        </svg>
      </Card>
      <Tag x={420} y={170} start={at("Grenze")} rot={-3} size={44}>GRENZE OHNE RÜCKKEHR</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Sky src={GC} from={c[1]} dur={c[2] - c[1]} z0={1.25} z1={1.3} rot0={1} rot1={3} filter="brightness(0.6)" />
      <BlackHole x={960} y={540} r={230} bg={GC} glow={0.1} />
      <Dust seed="b2" />
      <Stamp x={960} y={860} start={at("leuchtet")} rot={-5} size={80}>LEUCHTET NICHT</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Sky src={GC} from={c[2]} dur={c[3] - c[2]} z0={1.2} z1={1.3} rot0={2} rot1={5} />
      <BlackHole x={960} y={540} r={250} bg={GC} spin={0.15} />
      <Tag x={420} y={200} start={at("verzerrt")} rot={-3} size={48}>VERZERRTE STERNE</Tag>
      <Tag x={1480} y={880} start={at("Ring")} rot={3} size={48}>LICHTRING</Tag>
      <Tag x={1450} y={200} start={at("Lupe")} rot={2} size={44}>WIE EINE RIESIGE LUPE</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Sky src={GC} from={c[3]} dur={c[4] - c[3]} z0={1.3} z1={1.35} filter="brightness(0.4) blur(4px)" />
      <div style={{ position: "absolute", left: 960, top: 500, transform: `translate(-50%,-50%) rotate(-2deg) scale(${pop(f, c[3] + 2, fps, 13)})`, background: PAPER, padding: "26px 26px 16px", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
        <Img src={simg("eht_sgra.jpg")} style={{ width: 620, height: 620, display: "block" }} />
        <div style={{ fontFamily: "IceType", fontSize: 28, color: INK, textAlign: "center", marginTop: 10, width: 620 }}>Sagittarius A* · EHT · 2022</div>
      </div>
      <Tag x={1520} y={300} start={at("zweitausendzweiundzwanzig")} rot={3} size={60}>2022</Tag>
      <Tag x={1480} y={760} start={at("Teleskopen")} rot={-3} size={42}>TELESKOPE AUF DER GANZEN ERDE</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Sky src={GC} from={c[4]} dur={120} z0={1.3} z1={1.35} filter="blur(6px) brightness(0.7)" />
      <FloatPhone x={960} y={interpolate(pop(f, c[4], fps, 14), [0, 1], [1500, 540])} s={1.05}>
        {f < at("schwarz") ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: "#000" }} />
            <div style={{ position: "absolute", left: "50%", top: "45%", width: 120, height: 120, marginLeft: -60, marginTop: -60, border: "3px solid #ffd166" }} />
            <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontSize: 30, fontWeight: 800, color: "#ffd166" }}>FOTO</div>
            <div style={{ position: "absolute", bottom: 40, left: "50%", width: 110, height: 110, marginLeft: -55, borderRadius: 55, border: "8px solid white" }} />
          </>
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: "#000" }} />
            <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800, opacity: 0.8 }}>Foto gespeichert</div>
          </>
        )}
        <AbsoluteFill style={{ background: "white", opacity: flash }} />
      </FloatPhone>
      <Stamp x={1450} y={820} start={at("schwarz")} rot={-7} size={74}>KOMPLETT SCHWARZ</Stamp>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={1} fade={fade} o2={[98, 95]} snaps={[at("leuchtet"), at("schwarz")]} dings={[at("Kamera")]} visor={(fr) => fr < c[3] || fr >= c[4]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 3 — Klein gegen groß =================
export const SgrPart3: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const at = ATS[2];
  const c = [0, at("Wäre") - 3, at("Seine") - 3, at("Aber") - 3, at("Glück") - 3];
  const k = interpolate(f, [at("Füßen"), at("Nudel") + 10], [1, 2.6], { ...clamp, easing: (t) => t * t });
  const list = [
    <AbsoluteFill key="a">
      <Sky src={GC} from={0} dur={c[1]} z0={1.2} z1={1.25} />
      <BlackHole x={960} y={540} r={200} bg={GC} />
      <Stamp x={960} y={300} start={at("gute")} rot={-5} size={90}>GUTE NACHRICHT</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Sky src={GC} from={c[1]} dur={c[2] - c[1]} z0={1.3} z1={1.35} filter="brightness(0.5) blur(3px)" />
      <BlackHole x={600} y={540} r={40} bg={GC} />
      <Card x={1250} y={480} w={900} start={c[1] + 2} rot={2}>
        <H>KLEINES SCHWARZES LOCH</H>
        <Line show={at("paar")}>nur ein paar Mal so schwer wie die Sonne</Line>
      </Card>
      <Stamp x={1250} y={820} start={at("tot")} rot={-6} size={110}>DU: TOT</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Sky src={GC} from={c[2]} dur={c[3] - c[2]} z0={1.3} z1={1.35} rot0={3} rot1={6} filter="brightness(0.7)" />
      <Stretch k={k} />
      <Tag x={1450} y={830} start={at("Füßen")} rot={3} size={46}>FÜSSE: ZIEHT STARK ↓</Tag>
      <Tag x={1450} y={250} start={at("Kopf")} rot={-3} size={46}>KOPF: ZIEHT SCHWÄCHER</Tag>
      <Tag x={480} y={520} start={at("Nudel")} rot={-4} size={56}>WIE EINE NUDEL</Tag>
      <Stamp x={960} y={150} start={at("Spaghettifizierung")} rot={-4} size={84}>SPAGHETTIFIZIERUNG</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Sky src={GC} from={c[3]} dur={c[4] - c[3]} z0={1.2} z1={1.3} />
      <BlackHole x={1350} y={540} r={300} bg={GC} />
      <Card x={560} y={540} w={940} start={at("riesig")} rot={-2}>
        <H size={46}>JE GRÖSSER, DESTO SANFTER</H>
        <Line show={at("riesig")} mark="✗" size={36}>klein: zerreißt dich vorher</Line>
        <Line show={at("sanfter")} mark="✓" size={36}>riesig: am Rand spürst du nichts</Line>
      </Card>
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Sky src={GC} from={c[4]} dur={100} z0={1.2} z1={1.3} rot0={2} rot1={4} />
      <BlackHole x={960} y={540} r={240} bg={GC} />
      <Stamp x={960} y={250} start={at("Glück")} rot={-5} size={90}>GLÜCK IM UNGLÜCK</Stamp>
      <Tag x={960} y={860} start={at("später")} rot={2} size={52}>… SONDERN ERST SPÄTER</Tag>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={2} fade={fade} o2={[95, 90]} snaps={[at("gute"), at("tot"), at("Spaghettifizierung"), at("Glück")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 4 — Die Zeit =================
const Clock: React.FC<{ label: string; sec: number; col: string }> = ({ label, sec, col }) => {
  const a = (sec / 60) * 360;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={300} height={300}>
        <circle cx={150} cy={150} r={130} fill="white" stroke={INK} strokeWidth={10} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={150} y1={30} x2={150} y2={48} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30} 150 150)`} />)}
        <line x1={150} y1={150} x2={150} y2={45} stroke={col} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a} 150 150)`} />
        <circle cx={150} cy={150} r={10} fill={INK} />
      </svg>
      <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 38, color: INK }}>{label}</div>
    </div>
  );
};

export const SgrPart4: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const at = ATS[3];
  const c = [0, at("Je") - 3, at("Für") - 3, at("Dein", 2) - 3];
  const fall = interpolate(f, [0, c[1]], [180, 330], { ...clamp, easing: (t) => t * t });
  const t0 = c[1];
  const red = interpolate(f, [at("röter") - 6, at("dunkler") + 10], [0, 1], clamp);
  const fadeMe = interpolate(f, [at("verblasst"), at("einfach") + 20], [1, 0], clamp);
  const list = [
    <AbsoluteFill key="a">
      <Sky src={GC} from={0} dur={c[1]} z0={1.2} z1={1.5} rot0={2} rot1={8} />
      <BlackHole x={960} y={540} r={fall} bg={GC} spin={0.1} />
      <Dust seed="f4" speed={6} n={110} />
      <Tag x={960} y={900} start={at("fallen")} rot={-2} size={52}>DU LÄSST DICH FALLEN</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Sky src={GC} from={c[1]} dur={c[2] - c[1]} z0={1.3} z1={1.35} filter="brightness(0.4) blur(4px)" />
      <Card x={960} y={480} w={1100} start={c[1] + 2}>
        <H>DIE ZEIT</H>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Clock label="DEINE UHR" sec={(f - t0) * 0.4} col={RED} />
          <Clock label="WEIT DRAUSSEN" sec={(f - t0) * 1.6} col="#2f7fd8" />
        </div>
      </Card>
      <Tag x={420} y={900} start={at("Einstein")} rot={-3} size={52}>EINSTEIN ✓ GEMESSEN ✓</Tag>
      <Tag x={1420} y={900} start={at("GPS-Satelliten")} rot={3} size={44}>GPS-UHREN WERDEN KORRIGIERT</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="c">
      <Sky src={GC} from={c[2]} dur={c[3] - c[2]} z0={1.1} z1={1.12} filter="brightness(0.7)" />
      <BlackHole x={1100} y={560} r={210} bg={GC} />
      <div style={{ position: "absolute", left: 760, top: 470, width: 120, height: 183, opacity: fadeMe, filter: `sepia(${red}) saturate(${1 + 3 * red}) hue-rotate(${-30 * red}deg) brightness(${1 - 0.6 * red})`, transform: `rotate(${(f - c[2]) * (f < at("langsamer", 2) ? 0.6 : 0.15)}deg)` }}>
        <Img src={oldImg("feet_cut.png")} style={{ height: 183 }} />
      </div>
      <Tag x={420} y={150} start={c[2] + 4} rot={-3} size={46}>BLICK VON WEIT WEG</Tag>
      <Tag x={820} y={350} start={at("dich", 3)} rot={2} size={40}>DAS BIST DU</Tag>
      <Stamp x={480} y={900} start={at("röter")} rot={-6} size={64}>RÖTER & DUNKLER</Stamp>
      <Stamp x={1450} y={900} start={at("verblasst")} rot={5} size={64}>… VERBLASST</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Sky src={GC} from={c[3]} dur={120} z0={1.3} z1={1.35} filter="blur(6px) brightness(0.7)" />
      <FloatPhone x={960} y={540} s={1.05}>
        <div style={{ textAlign: "center", marginTop: 380, fontSize: 110, fontWeight: 700 }}>??:??</div>
        <Notif start={at("Akku")} title="Akku: 50 %" text="Energiesparmodus?" icon="!" top={100} />
        <Notif start={at("Erde")} title="Uhrzeit-Abgleich" text="Erde: mehr Zeit vergangen als bei dir" icon="◷" top={240} />
      </FloatPhone>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={3} fade={fade} o2={[90, 60]} snaps={[at("röter"), at("verblasst")]} dings={[at("Akku"), at("Erde")]} visor={(fr) => fr < c[1] || fr >= c[3]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 5 — Der Ereignishorizont =================
export const SgrPart5: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[4];
  const c = [0, at("Aber") - 3, at("Denn") - 3, at("Dein") - 3];
  const zoom = interpolate(f, [0, at("Ereignishorizont") + 10], [330, 1400], { ...clamp, easing: (t) => t * t });
  const hole = interpolate(f, [c[1], c[2]], [220, 90], clamp);
  const list = [
    <AbsoluteFill key="a">
      <Sky src={GC} from={0} dur={c[1]} z0={1.3} z1={1.6} rot0={4} rot1={10} />
      <BlackHole x={960} y={540} r={zoom} bg={GC} spin={0.2} />
      <Dust seed="h5" speed={8} n={90} />
      <Stamp x={560} y={300} start={at("Knall")} rot={-6} size={70}>KEIN KNALL</Stamp>
      <Stamp x={1360} y={460} start={at("Wand")} rot={5} size={70}>KEINE WAND</Stamp>
      <Stamp x={760} y={660} start={at("Warnschild")} rot={-3} size={70}>KEIN WARNSCHILD</Stamp>
      <Tag x={960} y={900} start={at("merkst")} rot={2} size={52}>DU MERKST ES NICHT EINMAL</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="b" style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 960 - hole, top: 260 - hole, width: hole * 2, height: hole * 2, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 60px 20px rgba(255,200,140,0.35)" }}>
        <Img src={GC} style={{ position: "absolute", left: hole - 600, top: hole - 340, width: 1200, height: 680, objectFit: "cover", filter: "brightness(1.4)" }} />
      </div>
      <Tag x={960} y={540} start={at("Grenze")} rot={-2} size={50}>KEIN WEG ZURÜCK</Tag>
      <Card x={960} y={790} w={900} start={at("Nicht")} pad={24}>
        <Line show={at("dich")} mark="✗">für dich</Line>
        <Line show={at("Handy")} mark="✗">für dein Handy</Line>
        <Line show={at("Licht")} mark="✗">nicht einmal für Licht</Line>
      </Card>
      <Stamp x={1520} y={420} start={at("Raketenantrieb")} rot={6} size={56}>RAKETEN: ZWECKLOS</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="c" style={{ background: "#000" }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2, R1 = 470, R2 = 150;
          const p = interpolate(f, [c[2] + i, c[2] + 20 + i], [0, 1], clamp);
          const x1 = 960 + Math.cos(a) * R1, y1 = 540 + Math.sin(a) * R1, x2 = 960 + Math.cos(a) * (R1 - (R1 - R2) * p), y2 = 540 + Math.sin(a) * (R1 - (R1 - R2) * p);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={RED} strokeWidth={8} strokeLinecap="round" /><circle cx={x2} cy={y2} r={9} fill={RED} /></g>;
        })}
        <circle cx={960} cy={540} r={70} fill="#111" stroke="#ffd166" strokeWidth={4} />
      </svg>
      <Tag x={960} y={540} start={at("Mitte")} rot={-2} size={46}>MITTE</Tag>
      <Stamp x={960} y={120} start={at("Richtung")} rot={-3} size={64}>ALLE WEGE → ZUR MITTE</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="d" style={{ background: "#000" }}>
      <FloatPhone x={960} y={interpolate(pop(f, c[3], fps, 14), [0, 1], [1500, 540])} s={1.05}>
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800 }}>Foto wird gesendet …</div>
        <div style={{ position: "absolute", top: 340, left: 40, right: 40, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${interpolate(f, [c[3], at("gesendet")], [5, 97], clamp)}%`, height: "100%", borderRadius: 11, background: "#7cc8f2" }} />
        </div>
        <div style={{ position: "absolute", top: 400, width: "100%", textAlign: "center", fontSize: 30, opacity: f >= at("immer") ? 1 : 0 }}>Verbleibend: ∞</div>
      </FloatPhone>
      <Stamp x={1480} y={820} start={at("immer")} rot={-6} size={80}>FÜR IMMER</Stamp>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={4} fade={fade} o2={[60, 58]} snaps={[at("Knall"), at("Wand"), at("Warnschild"), at("immer")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 6 — Die letzte Minute =================
export const SgrPart6: React.FC<{ fade?: boolean }> = ({ fade }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[5];
  const c = [0, at("Je") - 3, at("Und", 2) - 3];
  const k = interpolate(f, [at("Kräfte"), at("Spaghettifizierung") + 20], [1, 3.2], { ...clamp, easing: (t) => t * t });
  const left = Math.max(0, 60 - Math.floor((f - at("Minute")) / fps * 1.4));
  const list = [
    <AbsoluteFill key="a" style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 960, top: 420, transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 40, color: "#ffd166", letterSpacing: 6 }}>HÖCHSTENS</div>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 240, color: "white", fontVariantNumeric: "tabular-nums", opacity: f >= at("Minute") ? 1 : 0.2 }}>0:{String(f >= at("Minute") ? left : 60).padStart(2, "0")}</div>
      </div>
      <Card x={960} y={860} w={1100} start={at("Raketen")} pad={26}>
        <Line show={at("Raketen")} mark="✗">mit Raketen dagegen? → noch kürzer!</Line>
      </Card>
    </AbsoluteFill>,
    <AbsoluteFill key="b" style={{ background: "#000" }}>
      <Sky src={GC} from={c[1]} dur={c[2] - c[1]} z0={1.5} z1={1.6} filter="brightness(0.25) blur(8px)" />
      <Stretch k={k} />
      <Tag x={1450} y={830} start={at("Füßen")} rot={3} size={46}>FÜSSE ↓↓↓</Tag>
      <Tag x={1450} y={250} start={at("Kopf")} rot={-3} size={46}>KOPF ↓</Tag>
      <Stamp x={960} y={150} start={at("Spaghettifizierung")} rot={-4} size={84}>SPAGHETTIFIZIERUNG</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="c" style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 960, top: 500, transform: "translate(-50%,-50%)", fontFamily: "IceMont", fontWeight: 900, fontSize: 260, color: "#ffd166", textShadow: `0 0 ${40 + 20 * Math.sin(f / 6)}px rgba(255,209,102,0.9)` }}>?</div>
      <Tag x={960} y={180} start={at("Singularität")} rot={-2} size={56}>SINGULARITÄT</Tag>
      <Tag x={500} y={820} start={at("Physik")} rot={-3} size={44}>PHYSIK: FUNKTIONIERT NICHT MEHR</Tag>
      <Tag x={1450} y={820} start={at("erste")} rot={3} size={44}>DU: DER ERSTE MENSCH</Tag>
      <Stamp x={960} y={980} start={at("erzählen")} rot={-4} size={60}>LEIDER: KEIN NETZ</Stamp>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={5} fade={fade} o2={[58, 57]} snaps={[at("Spaghettifizierung"), at("erzählen")]}>
      {scenes(f, c, list)}
    </Shell>
  );
};

// ================= ЧАСТЬ 7 — Das Ergebnis =================
export const SgrPart7: React.FC<{ fade?: boolean }> = ({ fade = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = ATS[6];
  const c = [0, at("Hier") - 3, at("Dein") - 3, at("Und") - 3, at("Und", 2) - 3];
  const rows: [string, string, number][] = [["DU", "1 MINUTE HINTER DEM HORIZONT", at("Horizont")], ["STERN S2", "KREIST SEIT MILLIONEN JAHREN", at("Jahren")], ["DAS LICHT", "KOMMT AUCH NICHT RAUS", at("raus")]];
  const list = [
    <AbsoluteFill key="a">
      <Sky src={GC} from={0} dur={c[1]} z0={1.3} z1={1.35} filter="brightness(0.5) blur(4px)" />
      <Stamp x={960} y={380} start={at("Rand")} rot={-4} size={64}>VOR DEM RAND: SOLANGE DIE LUFT REICHT</Stamp>
      <Stamp x={960} y={640} start={at("Rand", 2)} rot={3} size={74}>DAHINTER: ≤ 1 MINUTE</Stamp>
    </AbsoluteFill>,
    <AbsoluteFill key="b">
      <Sky src={GC} from={c[1]} dur={c[2] - c[1]} z0={1.3} z1={1.35} filter="brightness(0.45) blur(6px)" />
      <Card x={960} y={540} w={1650} start={c[1] + 2}>
        <H size={70}>DIE TAFEL</H>
        {rows.map(([n, v, st]) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "IceMont", fontWeight: 900, fontSize: 56, height: 110, opacity: f >= st - 30 ? 1 : 0.12, borderBottom: "3px dashed #b8ab90" }}>
            <span>{n}</span><span style={{ color: RED, fontFamily: "IceType", fontSize: 48 }}>{v}</span>
          </div>
        ))}
        <div style={{ fontFamily: "IceType", fontSize: 32, textAlign: "center", marginTop: 14, opacity: f >= at("sechzehn") ? 0.75 : 0 }}>S2: alle 16 Jahre eine Runde · über 5.000 km/s</div>
      </Card>
    </AbsoluteFill>,
    <AbsoluteFill key="c" style={{ background: "#000" }}>
      <FloatPhone x={960} y={interpolate(pop(f, c[2], fps, 14), [0, 1], [1500, 540])} s={1.05}>
        <div style={{ textAlign: "center", marginTop: 420, fontSize: 90, fontWeight: 900, color: RED, opacity: Math.floor(f / 8) % 2 ? 1 : 0.4 }}>1 %</div>
        <Notif start={at("Akku")} title="Akku: 1 %" text="Gerät schaltet sich aus." icon="!" top={100} />
        <Notif start={at("Kein")} title="Kein Netz" text="Für immer." icon="✕" top={240} />
      </FloatPhone>
    </AbsoluteFill>,
    <AbsoluteFill key="d">
      <Sky src={GC} from={c[3]} dur={c[4] - c[3]} z0={1.2} z1={1.3} />
      <BlackHole x={1500} y={760} r={150} bg={GC} />
      <Card x={800} y={430} w={1300} start={at("Würdest")}>
        <H size={58}>WÜRDEST DU HINEINSPRINGEN?</H>
        <div style={{ display: "flex", justifyContent: "space-around", fontFamily: "IceMont", fontWeight: 900, fontSize: 70, padding: "10px 0" }}>
          <span style={{ color: "#2a9d4b" }}>JA</span><span style={{ color: RED }}>NEIN</span>
        </div>
      </Card>
      <Tag x={800} y={800} start={at("Kommentare")} rot={-2} size={60} bg="#FFF6D6">↓ SCHREIB'S IN DIE KOMMENTARE</Tag>
    </AbsoluteFill>,
    <AbsoluteFill key="e">
      <Sky src={GC} from={c[4]} dur={100} z0={1.15} z1={1.3} rot0={0} rot1={5} />
      <BlackHole x={960} y={540} r={180} bg={GC} spin={0.1} />
      <Stamp x={960} y={300} start={at("abonniere")} rot={-5} size={110}>ABONNIEREN</Stamp>
      <Tag x={960} y={860} start={at("Abenteuer")} rot={2} size={56}>NÄCHSTES ABENTEUER</Tag>
    </AbsoluteFill>,
  ];
  return (
    <Shell i={6} fade={fade} o2={[57, 57]} snaps={[at("Rand"), at("Rand", 2), at("abonniere")]} dings={[at("Akku"), at("Kein")]} visor={() => false}>
      {scenes(f, c, list)}
    </Shell>
  );
};

export const SGR_PARTS = [SgrPart2, SgrPart3, SgrPart4, SgrPart5, SgrPart6, SgrPart7];
