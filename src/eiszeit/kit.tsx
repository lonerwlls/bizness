// Общие детали канала «Eiszeit / Epochen» (фото-коллаж): фото, снег, бирки, штампы, таймер, телефон, батарея.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;
export const makeAt = (VOICE: { words: { w: string; t: number }[] }, lead: number) => (w: string, n = 1) => {
  const x = VOICE.words.filter((v) => v.w === w)[n - 1];
  if (!x) throw new Error("нет слова " + w + " #" + n);
  return Math.round(x.t * FPS) + lead;
};
const fh = delayRender("eis fonts");
Promise.all([
  new FontFace("IceMont", `url(${staticFile("towers/fonts/Montserrat-latin.woff2")}) format("woff2")`, { weight: "100 900" }).load(),
  new FontFace("IceType", `url(${staticFile("towers/fonts/SpecialElite.woff2")}) format("woff2")`).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); });

export const img = (n: string) => staticFile(`eiszeit/img/${n}`);
export const oldImg = (n: string) => staticFile(`iceage/img/${n}`);
export const PAPER = "#F4EFE4";
export const INK = "#1E1B18";
export const RED = "#D7263D";
export const ICE = "#7CC8F2";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const pop = (f: number, start: number, fps: number, damping = 12) => spring({ frame: f - start, fps, config: { damping, stiffness: 170 } });

// ---------- общие элементы ----------
export const Photo: React.FC<{ src: string; from: number; dur: number; z0?: number; z1?: number; x0?: number; x1?: number; y0?: number; y1?: number; blur?: number; filter?: string }> = ({ src, from, dur, z0 = 1.08, z1 = 1.18, x0 = 0, x1 = 0, y0 = 0, y1 = 0, blur = 0, filter = "" }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  const z = z0 + (z1 - z0) * p, x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}%, ${y}%) scale(${z})`, filter: `${blur ? `blur(${blur}px)` : ""} ${filter}` }} />
    </AbsoluteFill>
  );
};

export const Snow: React.FC<{ n?: number; wind?: number; fall?: number; size?: number; seed?: string; opacity?: number }> = ({ n = 140, wind = 4, fall = 3, size = 1, seed = "s", opacity = 0.9 }) => {
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

export const Grain: React.FC = () => {
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

export const Vignette: React.FC<{ s?: number; frost?: number }> = ({ s = 0.55, frost = 0 }) => (
  <>
    <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${s}) 100%)` }} />
    {frost > 0 && <AbsoluteFill style={{ pointerEvents: "none", opacity: frost, background: "radial-gradient(ellipse at center, rgba(220,240,255,0) 45%, rgba(225,242,255,0.85) 92%)" }} />}
  </>
);

// Бумажная бирка с «скотчем»
export const Tag: React.FC<{ x: number; y: number; start: number; rot?: number; size?: number; children: React.ReactNode; color?: string; bg?: string }> = ({ x, y, start, rot = -3, size = 46, children, color = INK, bg = PAPER }) => {
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

export const Stamp: React.FC<{ x: number; y: number; start: number; rot?: number; size?: number; children: React.ReactNode }> = ({ x, y, start, rot = -12, size = 84, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = interpolate(pop(f, start, fps, 14), [0, 1], [2.2, 1]);
  const o = interpolate(f, [start, start + 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, border: `${size * 0.09}px solid ${RED}`, color: RED, fontFamily: "IceMont", fontWeight: 900, fontSize: size, padding: `${size * 0.05}px ${size * 0.3}px`, letterSpacing: 3, whiteSpace: "nowrap", background: "rgba(250,246,236,0.9)", boxShadow: "0 10px 26px rgba(0,0,0,0.4)" }}>{children}</div>
  );
};

export const Shake: React.FC<{ start: number; amp?: number; len?: number; children: React.ReactNode }> = ({ start, amp = 18, len = 12, children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [start, start + len], [1, 0], clamp) * (f >= start ? 1 : 0);
  return <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 2.3) * amp * k}px, ${Math.cos(f * 3.1) * amp * k}px)` }}>{children}</AbsoluteFill>;
};

// Таймер выживания

// Таймер выживания: появляется (appear), идёт с run, переезжает в угол на move. sec0 — сколько уже прошло (для следующих частей).
export const fmt = (s: number) => { const t = Math.max(0, Math.floor(s)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), x = t % 60; return [h, m, x].map((v) => String(v).padStart(2, "0")).join(":"); };
export const Timer: React.FC<{ appear: number; run: number; move: number; sec0?: number; speed?: number }> = ({ appear, run, move, sec0 = 0, speed = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < appear) return null;
  const s = pop(f, appear, fps, 11);
  const m = spring({ frame: f - move, fps, config: { damping: 16 } });
  const x = interpolate(m, [0, 1], [960, 1690]), y = interpolate(m, [0, 1], [540, 92]), sc = interpolate(m, [0, 1], [1.6, 0.62]) * s;
  const sec = sec0 + Math.max(0, f - run) / fps * speed;
  const live = f >= run;
  const blink = live && Math.floor(f / 15) % 2 === 0;
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

// Батарея-индикатор (фишка канала): в левом верхнем углу, показывает, сколько ролика осталось.
export const BatteryHud: React.FC<{ appear: number; pct: number; big?: number }> = ({ appear, pct, big = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < appear) return null;
  const s = pop(f, appear, fps, 12);
  const low = pct <= 20;
  const col = low ? RED : pct <= 50 ? "#f2c14e" : "#6fe38a";
  const sc = (1 + big) * s;
  return (
    <div style={{ position: "absolute", left: 70, top: 60, transform: `scale(${sc})`, transformOrigin: "0 0", display: "flex", alignItems: "center", gap: 14, background: "rgba(14,22,34,0.85)", padding: "12px 20px", borderRadius: 18, border: "4px solid rgba(255,255,255,0.85)" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 86, height: 42, border: "5px solid white", borderRadius: 10, padding: 4 }}>
          <div style={{ width: `${Math.max(3, pct)}%`, height: "100%", background: col, borderRadius: 4 }} />
        </div>
        <div style={{ width: 7, height: 18, background: "white", borderRadius: "0 4px 4px 0", marginLeft: 3 }} />
      </div>
      <div style={{ fontFamily: "IceMont", fontWeight: 900, fontSize: 40, color: low ? RED : "white", fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)} %</div>
    </div>
  );
};

// Рука с телефоном (вид от первого лица). Экран рисуется детьми (children) в координатах экрана sw×sh.
export const HAND = { w: 694, h: 953, sx: 255, sy: 43, sw: 358, sh: 758 };
export const PhoneInHand: React.FC<{ x: number; y: number; H?: number; rot?: number; children: React.ReactNode }> = ({ x, y, H = 1060, rot = -3, children }) => {
  const k = H / HAND.h;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: HAND.w * k, height: H, transform: `rotate(${rot}deg)` }}>
      <Img src={oldImg("hand_cut.png")} style={{ position: "absolute", width: HAND.w * k, height: H }} />
      <div style={{ position: "absolute", left: HAND.sx * k, top: HAND.sy * k, width: HAND.sw * k, height: HAND.sh * k, borderRadius: 46, overflow: "hidden", background: "linear-gradient(160deg,#1b2a44 0%,#33223f 100%)", color: "white", fontFamily: "IceMont" }}>
        {children}
      </div>
    </div>
  );
};

// Уведомление на экране телефона
export const Notif: React.FC<{ start: number; title: string; text: string; icon?: string; top?: number }> = ({ start, title, text, icon = "!", top = 40 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = pop(f, start, fps, 14);
  return (
    <div style={{ position: "absolute", left: 18, right: 18, top: top + interpolate(s, [0, 1], [-160, 0]), background: "rgba(245,245,250,0.96)", color: INK, borderRadius: 26, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
      <div style={{ width: 58, height: 58, borderRadius: 14, background: RED, color: "white", fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontWeight: 900, fontSize: 25 }}>{title}</div>
        <div style={{ fontWeight: 600, fontSize: 23, opacity: 0.85 }}>{text}</div>
      </div>
    </div>
  );
};
