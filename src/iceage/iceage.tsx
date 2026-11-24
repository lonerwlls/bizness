// Пробный ролик (немецкий): «Wie lange würdest DU in der Eiszeit überleben?» — фото-коллаж, вид от первого лица.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOICE } from "./voice";

const FPS = 30;
const LEAD = 6;
export const ICE_FRAMES = Math.ceil((VOICE.dur + 1.6) * FPS) + LEAD;
const at = (w: string, n = 1) => {
  const x = VOICE.words.filter((v) => v.w === w)[n - 1];
  if (!x) throw new Error("нет слова " + w);
  return Math.round(x.t * FPS) + LEAD;
};

const fh = delayRender("ice fonts");
Promise.all([
  new FontFace("IceMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load(),
  new FontFace("IceType", `url(${staticFile("towers/fonts/SpecialElite.woff2")}) format("woff2")`).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); });

const img = (n: string) => staticFile(`iceage/img/${n}`);
const PAPER = "#F4EFE4";
const INK = "#1E1B18";
const RED = "#D7263D";
const ICE = "#7CC8F2";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, start: number, fps: number, damping = 12) => spring({ frame: f - start, fps, config: { damping, stiffness: 170 } });

// ---------- общие элементы ----------
const Photo: React.FC<{ src: string; from: number; dur: number; z0?: number; z1?: number; x0?: number; x1?: number; y0?: number; y1?: number; blur?: number; filter?: string }> = ({ src, from, dur, z0 = 1.08, z1 = 1.18, x0 = 0, x1 = 0, y0 = 0, y1 = 0, blur = 0, filter = "" }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  const z = z0 + (z1 - z0) * p, x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}%, ${y}%) scale(${z})`, filter: `${blur ? `blur(${blur}px)` : ""} ${filter}` }} />
    </AbsoluteFill>
  );
};

const Snow: React.FC<{ n?: number; wind?: number; fall?: number; size?: number; seed?: string; opacity?: number }> = ({ n = 140, wind = 4, fall = 3, size = 1, seed = "s", opacity = 0.9 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: n }, (_, i) => {
          const d = 0.4 + random(`${seed}d${i}`) * 0.9;
          const x = ((random(`${seed}x${i}`) * 2400 + f * wind * d * 3) % 2400) - 240;
          const y = ((random(`${seed}y${i}`) * 1300 + f * fall * d * 3 + Math.sin(f / 9 + i) * 8) % 1300) - 110;
          const r = (1.5 + d * 3.2) * size;
          const len = Math.min(60, wind * d * 2.2);
          return len > 8
            ? <line key={i} x1={x} y1={y} x2={x - len} y2={y - fall * d} stroke="white" strokeOpacity={opacity * d * 0.8} strokeWidth={r * 0.9} strokeLinecap="round" />
            : <circle key={i} cx={x} cy={y} r={r} fill="white" fillOpacity={opacity * d} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.35 }}>
      <svg width={1920} height={1080}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1920} height={1080} filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ s?: number; frost?: number }> = ({ s = 0.55, frost = 0 }) => (
  <>
    <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${s}) 100%)` }} />
    {frost > 0 && <AbsoluteFill style={{ pointerEvents: "none", opacity: frost, background: "radial-gradient(ellipse at center, rgba(220,240,255,0) 45%, rgba(225,242,255,0.85) 92%)" }} />}
  </>
);

// Бумажная бирка с «скотчем»
const Tag: React.FC<{ x: number; y: number; start: number; rot?: number; size?: number; children: React.ReactNode; color?: string; bg?: string }> = ({ x, y, start, rot = -3, size = 46, children, color = INK, bg = PAPER }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 10);
  if (f < start) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})` }}>
      <div style={{ position: "absolute", left: "50%", top: -16, width: 90, height: 30, marginLeft: -45, background: "rgba(240,225,170,0.75)", transform: "rotate(4deg)" }} />
      <div style={{ background: bg, color, fontFamily: "IceType", fontSize: size, padding: `${size * 0.22}px ${size * 0.5}px`, boxShadow: "0 10px 24px rgba(0,0,0,0.45)", whiteSpace: "nowrap", letterSpacing: 1 }}>{children}</div>
    </div>
  );
};

const Stamp: React.FC<{ x: number; y: number; start: number; rot?: number; size?: number; children: React.ReactNode }> = ({ x, y, start, rot = -12, size = 84, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = interpolate(pop(f, start, fps, 14), [0, 1], [2.2, 1]);
  const o = interpolate(f, [start, start + 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, border: `${size * 0.09}px solid ${RED}`, color: RED, fontFamily: "IceMont", fontWeight: 900, fontSize: size, padding: `${size * 0.05}px ${size * 0.3}px`, letterSpacing: 3, whiteSpace: "nowrap", background: "rgba(255,255,255,0.12)", mixBlendMode: "multiply" }}>{children}</div>
  );
};

const Shake: React.FC<{ start: number; amp?: number; len?: number; children: React.ReactNode }> = ({ start, amp = 18, len = 12, children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [start, start + len], [1, 0], clamp) * (f >= start ? 1 : 0);
  return <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 2.3) * amp * k}px, ${Math.cos(f * 3.1) * amp * k}px)` }}>{children}</AbsoluteFill>;
};

// Таймер выживания
const fmt = (s: number) => { const t = Math.max(0, Math.floor(s)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), x = t % 60; return [h, m, x].map((v) => String(v).padStart(2, "0")).join(":"); };
const Timer: React.FC<{ start: number; move: number }> = ({ start, move }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = pop(f, start, fps, 11);
  const m = spring({ frame: f - move, fps, config: { damping: 16 } });
  const x = interpolate(m, [0, 1], [960, 1640]), y = interpolate(m, [0, 1], [540, 110]), sc = interpolate(m, [0, 1], [1.6, 0.75]) * s;
  const sec = (f - start) / fps;
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${sc})` }}>
      <div style={{ background: "rgba(14,22,34,0.92)", border: `5px solid ${ICE}`, borderRadius: 22, padding: "14px 34px 10px", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ fontFamily: "IceMont", fontWeight: 800, fontSize: 26, letterSpacing: 6, color: ICE, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: blink ? 1 : 0.25 }} />ÜBERLEBT
        </div>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 96, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: 2, lineHeight: 1.05 }}>{fmt(sec)}</div>
      </div>
    </div>
  );
};

// ---------- сцены ----------
const S1Years: React.FC<{ end: number }> = ({ end }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, LEAD - 4, fps, 12);
  const n = Math.round(interpolate(f, [LEAD + 6, at("Jahren") + 2], [0, 20000], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }) / 100) * 100;
  const out = interpolate(f, [end - 6, end], [0, -1400], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #33415a 0%, #141a26 75%)" }}>
      <Snow n={70} wind={0.6} fall={1.6} seed="a" opacity={0.5} />
      <div style={{ position: "absolute", left: 960 + out, top: 540, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s})`, background: PAPER, width: 900, padding: "50px 0 40px", textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: "IceType", fontSize: 54, color: INK, letterSpacing: 8 }}>VOR</div>
        <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 210, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("de-DE")}</div>
        <div style={{ fontFamily: "IceType", fontSize: 54, color: RED, letterSpacing: 8, opacity: interpolate(f, [at("Jahren") - 4, at("Jahren")], [0, 1], clamp) }}>JAHREN</div>
      </div>
    </AbsoluteFill>
  );
};

const S2Map: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = pop(f, start, fps, 14);
  const W = 1000, H = Math.round((W * 1893) / 1920);
  // наезд на южный край льда к слову «Rand»
  const z = interpolate(f, [at("Und") - 4, at("Rand")], [1, 2.1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const ex = 0.585 * W, ey = 0.67 * H;
  const ox = (W / 2 - ex) * (z - 1), oy = (H / 2 - ey) * (z - 1);
  const pulse = f >= at("Eispanzer") ? 1 + 0.06 * Math.max(0, Math.sin((f - at("Eispanzer")) / 4)) * interpolate(f, [at("Eispanzer"), at("Eispanzer") + 30], [1, 0], clamp) : 1;
  const pin = f >= at("genau") ? pop(f, at("genau"), fps, 9) : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #2b3850 0%, #0f141e 80%)" }}>
      <div style={{ position: "absolute", left: 960 + ox, top: 540 + oy + interpolate(inn, [0, 1], [700, 0]), transform: `translate(-50%,-50%) rotate(${interpolate(inn, [0, 1], [6, -2])}deg) scale(${z})`, width: W + 50, padding: 25, background: PAPER, boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "relative", width: W, height: H, background: "#16263a", overflow: "hidden" }}>
          <Img src={img("map_de.png")} style={{ width: W, height: H, filter: `sepia(0.6) hue-rotate(160deg) saturate(2.2) brightness(${pulse})` }} />
          {pin > 0 && (
            <div style={{ position: "absolute", left: ex, top: ey, transform: `translate(-50%,-100%) scale(${pin / z * 1.3})`, transformOrigin: "50% 100%" }}>
              <svg width={80} height={110} viewBox="0 0 80 110"><path d="M40 108 C40 108 6 62 6 40 A34 34 0 1 1 74 40 C74 62 40 108 40 108Z" fill={RED} stroke="white" strokeWidth={6} /><circle cx={40} cy={40} r={13} fill="white" /></svg>
            </div>
          )}
        </div>
      </div>
      {f < at("Und") - 2 && <Tag x={1000} y={300} start={at("Kanada")} rot={-4} size={58}>KANADA</Tag>}
      {f < at("Und") - 2 && <Tag x={1290} y={560} start={at("Eispanzer")} rot={3} size={50}>EISPANZER</Tag>}
      {f < at("Und") && <Stamp x={1450} y={830} start={at("drei")} rot={-8} size={70}>BIS ZU 3 KM DICK</Stamp>}
      <Tag x={960} y={930} start={at("genau") + 3} rot={-2} size={48} bg="#FFF6D6">DU BIST HIER</Tag>
    </AbsoluteFill>
  );
};

const S3Drop: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = at("aus");
  const d = interpolate(f, [start, land], [0, 1], { ...clamp, easing: (t) => t * t });
  const y0 = interpolate(d, [0, 1], [-38, 0]);
  const z = interpolate(d, [0, 1], [1.6, 1.12]);
  const legs = pop(f, land + 2, fps, 15);
  const flash = interpolate(f, [land, land + 6], [0.85, 0], clamp) * (f >= land ? 1 : 0);
  const bob = Math.sin((f - land) / 18) * 6;
  const checkStart = at("Hoodie") - 6;
  const items: [string, number][] = [["Hoodie", at("Hoodie")], ["Jeans", at("Jeans")], ["Turnschuhe", at("Turnschuhe")]];
  return (
    <AbsoluteFill>
      <Shake start={land} amp={26} len={14}>
        <Photo src={img("wall_c.jpg")} from={start} dur={60} z0={z} z1={z} y0={y0} y1={y0} blur={interpolate(d, [0, 0.9, 1], [10, 4, 0])} />
        <Snow n={150} wind={6} fall={3} seed="b" />
        <div style={{ position: "absolute", left: 960 - 330, top: interpolate(legs, [0, 1], [1150, 1080 - 470]) + bob, height: 1010, width: 551 * (1010 / 841), transform: "rotate(-4deg)" }}>
          <div style={{ position: "absolute", left: 40, top: 300, width: 520, height: 90, borderRadius: "50%", background: "rgba(20,40,70,0.35)", filter: "blur(18px)" }} />
          <Img src={img("feet_cut.png")} style={{ position: "absolute", height: 1010, filter: "brightness(1.02) contrast(1.05)" }} />
        </div>
      </Shake>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
      {f >= checkStart && (
        <div style={{ position: "absolute", left: 1490, top: 520, transform: `translate(-50%,-50%) rotate(3deg) scale(${pop(f, checkStart, fps, 12)})`, background: PAPER, width: 560, padding: "34px 44px", boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 40, color: INK, letterSpacing: 2, borderBottom: `4px solid ${INK}`, paddingBottom: 10, marginBottom: 14 }}>DEINE AUSRÜSTUNG</div>
          {items.map(([t, s]) => (
            <div key={t} style={{ fontFamily: "IceType", fontSize: 52, color: INK, height: 74, display: "flex", alignItems: "center", gap: 22, opacity: f >= s ? 1 : 0.0, transform: `translateX(${interpolate(f, [s, s + 6], [-30, 0], clamp)}px)` }}>
              <span style={{ width: 40, height: 40, border: `4px solid ${INK}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: RED, fontFamily: "IceMont", fontWeight: 900, fontSize: 40 }}>{f >= s + 8 ? "✓" : ""}</span>{t}
            </div>
          ))}
        </div>
      )}
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const Phone: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 14);
  const z = at("zwölf");
  const H = 1060, k = H / 953; // hand_cut 694x953, экран 255..613 x 43..801
  const sx = 255 * k, sy = 43 * k, sw = (613 - 255) * k, sh = (801 - 43) * k;
  const red = f >= z;
  const blink = red && Math.floor((f - z) / 8) % 2 === 0;
  const lvl = red ? 0.12 : interpolate(f, [start, z], [0.4, 0.15], clamp);
  return (
    <AbsoluteFill>
      <Photo src={img("wall_c.jpg")} from={start - 40} dur={120} z0={1.25} z1={1.3} x0={-6} x1={-8} blur={8} />
      <Snow n={120} wind={5} fall={3} seed="c" />
      <div style={{ position: "absolute", left: 1010, top: interpolate(s, [0, 1], [1200, 70]) + Math.sin(f / 14) * 5, width: 694 * k, height: H, transform: `rotate(${interpolate(s, [0, 1], [12, -3])}deg)` }}>
        <Img src={img("hand_cut.png")} style={{ position: "absolute", width: 694 * k, height: H }} />
        <div style={{ position: "absolute", left: sx, top: sy, width: sw, height: sh, borderRadius: 46, overflow: "hidden", background: "linear-gradient(160deg,#1b2a44 0%,#33223f 100%)", color: "white", fontFamily: "IceMont" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 34px 0", fontSize: 24, fontWeight: 700 }}>
            <span>Kein Netz</span>
            <span style={{ color: red ? RED : "white" }}>{Math.round(lvl * 100)} %</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 90, fontSize: 120, fontWeight: 700, letterSpacing: 2 }}>??:??</div>
          <div style={{ textAlign: "center", fontSize: 30, opacity: 0.8 }}>Datum unbekannt</div>
          {/* батарея */}
          <div style={{ position: "absolute", left: "50%", top: 520, transform: "translateX(-50%)", display: "flex", alignItems: "center" }}>
            <div style={{ width: 230, height: 110, border: `8px solid ${red ? RED : "white"}`, borderRadius: 20, padding: 8, opacity: blink ? 0.35 : 1 }}>
              <div style={{ width: `${lvl * 100}%`, height: "100%", background: red ? RED : "#6fe38a", borderRadius: 8 }} />
            </div>
            <div style={{ width: 14, height: 44, background: red ? RED : "white", borderRadius: "0 6px 6px 0", marginLeft: 4 }} />
          </div>
          {red && <div style={{ position: "absolute", left: 0, right: 0, top: 680, textAlign: "center", fontSize: 76, fontWeight: 900, color: RED }}>12 %</div>}
        </div>
      </div>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

const Thermo: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps, 13);
  const temp = interpolate(f, [start + 4, at("dreißig") + 6], [0, -30], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const wind = at("Wind");
  const gust = f >= wind ? 1 : 0;
  const frost = interpolate(f, [start, at("auf", 2) + 10], [0.1, 0.7], clamp);
  const lvl = interpolate(temp, [-40, 20], [0, 1]);
  return (
    <AbsoluteFill>
      <Shake start={wind} amp={14} len={30}>
        <Photo src={img("wall_c.jpg")} from={start} dur={130} z0={1.45} z1={1.6} x0={-14} x1={-18} y0={4} y1={4} />
        <Snow n={gust ? 260 : 160} wind={gust ? 22 : 8} fall={3} seed="d" />
      </Shake>
      <div style={{ position: "absolute", left: 420, top: 630, transform: `translate(-50%,-50%) rotate(-3deg) scale(${s * 0.88})`, background: PAPER, width: 380, height: 820, boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}>
        <svg width={380} height={820}>
          <rect x={160} y={70} width={60} height={560} rx={30} fill="white" stroke={INK} strokeWidth={8} />
          <rect x={174} y={70 + 540 * (1 - lvl)} width={32} height={540 * lvl + 30} rx={16} fill={temp < -15 ? "#2f7fd8" : RED} />
          <circle cx={190} cy={680} r={66} fill={temp < -15 ? "#2f7fd8" : RED} stroke={INK} strokeWidth={8} />
          {[20, 0, -20, -40].map((t) => { const y = 70 + 540 * (1 - interpolate(t, [-40, 20], [0, 1])); return <g key={t}><line x1={225} x2={262} y1={y} y2={y} stroke={INK} strokeWidth={5} /><text x={272} y={y + 12} fontFamily="IceType" fontSize={34} fill={INK}>{t}°</text></g>; })}
        </svg>
      </div>
      <div style={{ position: "absolute", left: 420, top: 28, transform: `translateX(-50%) scale(${s})`, fontFamily: "IceMont", fontWeight: 900, fontSize: 110, color: "white", background: "rgba(14,22,34,0.9)", padding: "4px 30px", borderRadius: 16, border: `5px solid ${ICE}`, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{Math.round(temp) < 0 ? "−" : ""}{Math.abs(Math.round(temp))} °C</div>
      <Vignette s={0.55} frost={frost} />
    </AbsoluteFill>
  );
};

const Jeans: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const wet = interpolate(f, [at("nasse"), at("nasse") + 14], [0, 1], clamp);
  const z = interpolate(f, [start, start + 140], [1, 1.12]);
  return (
    <AbsoluteFill style={{ background: "#dfe9f2" }}>
      <Photo src={img("wall_c.jpg")} from={start} dur={140} z0={2.4} z1={2.5} y0={-28} y1={-28} x0={10} blur={6} />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", left: 960 - 520, top: 40 + Math.sin(f / 16) * 6, height: 1600, width: 551 * (1600 / 841), transform: "rotate(-6deg)" }}>
          <Img src={img("feet_cut.png")} style={{ position: "absolute", height: 1600 }} />
          <Img src={img("feet_wet.png")} style={{ position: "absolute", height: 1600, opacity: wet }} />
        </div>
      </AbsoluteFill>
      <Snow n={110} wind={7} fall={3.5} seed="e" />
      {f >= at("nasse") && <Snow n={70} wind={1} fall={9} size={0.7} seed="drops" opacity={0.55} />}
      <Tag x={1350} y={360} start={at("Baumwolle")} rot={5} size={60} bg="white">100 % BAUMWOLLE</Tag>
      <Stamp x={1340} y={720} start={at("wärmt")} rot={-10} size={90}>WÄRMT NICHT</Stamp>
      <Vignette s={0.5} frost={interpolate(f, [at("nasse"), at("mehr") + 10], [0.1, 0.4], clamp)} />
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ start: number }> = ({ start }) => (
  <AbsoluteFill>
    <Photo src={img("fauna.jpg")} from={start} dur={150} z0={1.25} z1={1.45} x0={-6} x1={-10} y0={0} y1={2} filter="saturate(0.85) brightness(0.92)" />
    <Snow n={140} wind={6} fall={2.5} seed="f" />
    <Vignette s={0.6} />
  </AbsoluteFill>
);

export const IceFilm: React.FC = () => {
  const f = useCurrentFrame();
  const c1 = at("Kanada") - 3, c2 = at("setzen") - 4, c3 = at("Dein") - 2, c4 = at("Es") - 2, c5 = at("Deine") - 2, c6 = at("Die") - 2;
  return (
    <AbsoluteFill style={{ background: "#0f141e" }}>
      {f < c1 && <S1Years end={c1} />}
      {f >= c1 && f < c2 && <S2Map start={c1} end={c2} />}
      {f >= c2 && f < c3 && <S3Drop start={c2} />}
      {f >= c3 && f < c4 && <Phone start={c3} />}
      {f >= c4 && f < c5 && <Thermo start={c4} />}
      {f >= c5 && f < c6 && <Jeans start={c5} />}
      {f >= c6 && <Finale start={c6} />}
      <Timer start={at("Uhr")} move={at("Wie") + 4} />
      <Grain />
      <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [ICE_FRAMES - 12, ICE_FRAMES], [0, 1], clamp) }} />
      {/* звук: голос главный, фон тихо */}
      <Sequence from={LEAD}><Audio src={staticFile("iceage/voice.mp3")} /></Sequence>
      <Audio src={staticFile("iceage/wind.mp3")} volume={(fr) => (fr >= at("Wind") && fr < at("Deine") ? 0.32 : 0.16)} />
      <Sequence from={at("setzen") - 6}><Audio src={staticFile("iceage/whoosh.mp3")} volume={0.35} /></Sequence>
      <Sequence from={at("aus")}><Audio src={staticFile("sfx/vine-boom.wav")} volume={0.18} /></Sequence>
      {[at("drei"), at("wärmt")].map((s) => <Sequence key={s} from={s}><Audio src={staticFile("iceage/snap.wav")} volume={0.25} /></Sequence>)}
      {Array.from({ length: Math.ceil((ICE_FRAMES - at("Uhr")) / FPS) }, (_, i) => <Sequence key={i} from={at("Uhr") + i * FPS}><Audio src={staticFile("iceage/tick.wav")} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};

