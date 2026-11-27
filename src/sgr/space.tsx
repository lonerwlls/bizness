// Космические детали для ролика «Schwarzes Loch»: чёрная дыра (с линзой), визор шлема, плавающий телефон, пыль.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ICE, INK, RED, clamp } from "../eiszeit/kit";

export const simg = (n: string) => staticFile(`sgr/img/${n}`);

// Фон-«небо» с медленным дрейфом и вращением (невесомость)
export const Sky: React.FC<{ src: string; from: number; z0?: number; z1?: number; rot0?: number; rot1?: number; dur?: number; filter?: string; x?: number; y?: number }> = ({ src, from, z0 = 1.15, z1 = 1.25, rot0 = 0, rot1 = 4, dur = 300, filter = "", x = 0, y = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#02030a" }}>
      <Img src={src} style={{ position: "absolute", left: "50%", top: "50%", width: 1920 * 1.2, height: 1080 * 1.2, objectFit: "cover", transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot0 + (rot1 - rot0) * p}deg) scale(${z0 + (z1 - z0) * p})`, filter }} />
    </AbsoluteFill>
  );
};

// Чёрная дыра: тень, кольцо фотонов, слабое оранжевое свечение, «линза» — искажённая копия фона вокруг
export const BlackHole: React.FC<{ x: number; y: number; r: number; bg: string; glow?: number; spin?: number }> = ({ x, y, r, bg, glow = 0.6, spin = 0 }) => {
  const f = useCurrentFrame();
  const R = r * 2.8;
  const mask = `radial-gradient(circle, transparent ${r * 0.98}px, black ${r * 1.12}px, black ${r * 2.0}px, transparent ${R}px)`;
  return (
    <>
      <div style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%", overflow: "hidden", WebkitMaskImage: mask, maskImage: mask }}>
        <Img src={bg} style={{ position: "absolute", left: R - 1100, top: R - 700, width: 2200, height: 1400, objectFit: "cover", transform: `rotate(${180 + f * spin}deg) scale(1.6)`, filter: "brightness(1.4) contrast(1.15)" }} />
      </div>
      <div style={{ position: "absolute", left: x - r * 1.6, top: y - r * 1.6, width: r * 3.2, height: r * 3.2, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,150,60,${0.55 * glow}) 30%, rgba(255,120,40,${0.25 * glow}) 45%, rgba(0,0,0,0) 70%)`, filter: "blur(6px)" }} />
      <div style={{ position: "absolute", left: x - r * 1.08, top: y - r * 1.08, width: r * 2.16, height: r * 2.16, borderRadius: "50%", border: `${Math.max(2, r * 0.035)}px solid rgba(255,236,200,0.95)`, boxShadow: `0 0 ${r * 0.25}px ${r * 0.06}px rgba(255,190,110,0.9), inset 0 0 ${r * 0.2}px rgba(255,190,110,0.6)` }} />
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "#000", boxShadow: `0 0 ${r * 0.15}px ${r * 0.05}px #000` }} />
    </>
  );
};

// Визор шлема: тёмная рамка по краям, блики и строка показаний
export const Visor: React.FC<{ o2?: string; on?: number }> = ({ o2 = "100 %", on = 1 }) => {
  const f = useCurrentFrame();
  if (on <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: on }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 62% 60% at 50% 48%, rgba(0,0,0,0) 78%, rgba(10,14,22,0.85) 92%, rgba(6,8,12,1) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(200,230,255,0.07) 38%, rgba(255,255,255,0) 46%)" }} />
      <div style={{ position: "absolute", left: 120, bottom: 70, fontFamily: "IceMont", fontWeight: 800, fontSize: 30, color: ICE, letterSpacing: 3, textShadow: "0 0 10px rgba(124,200,242,0.8)" }}>
        O₂ {o2} · DRUCK OK <span style={{ opacity: Math.floor(f / 20) % 2 ? 1 : 0.3 }}>●</span>
      </div>
    </AbsoluteFill>
  );
};

// Плавающий телефон (без руки: невесомость)
export const FloatPhone: React.FC<{ x: number; y: number; s?: number; rot?: number; children: React.ReactNode }> = ({ x, y, s = 1, rot = -6, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y + Math.sin(f / 22) * 14, width: 420, height: 860, transform: `translate(-50%,-50%) rotate(${rot + Math.sin(f / 37) * 3}deg) scale(${s})`, borderRadius: 64, background: "#111", border: "10px solid #2a2a2e", boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 3px #555" }}>
      <div style={{ position: "absolute", left: 14, top: 14, right: 14, bottom: 14, borderRadius: 50, overflow: "hidden", background: "linear-gradient(160deg,#1b2a44 0%,#33223f 100%)", color: "white", fontFamily: "IceMont" }}>
        <div style={{ position: "absolute", left: "50%", top: 10, width: 120, height: 30, marginLeft: -60, borderRadius: 16, background: "#000" }} />
        {children}
      </div>
    </div>
  );
};

// Мелкая пыль, медленно плывущая (вместо снега)
export const Dust: React.FC<{ n?: number; seed?: string; speed?: number }> = ({ n = 70, seed = "d", speed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: n }, (_, i) => {
          const d = 0.3 + random(`${seed}d${i}`);
          const x = (random(`${seed}x${i}`) * 2100 + f * 0.6 * d * speed) % 2100 - 90;
          const y = (random(`${seed}y${i}`) * 1200 + f * 0.25 * d * speed) % 1200 - 60;
          return <circle key={i} cx={x} cy={y} r={1 + d * 2} fill="white" opacity={0.25 * d} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export { INK, RED };
