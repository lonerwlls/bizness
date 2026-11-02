// Надписи поверх кадра для серий: счётчик сверху, плашка сцены, карточка главы (без субтитров).
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { MONT, RED, WH, YEL, ip } from "./kit";

export const GREEN = "#3ad08a";
export const Counter: React.FC<{ f: number; text: string; alarm?: boolean }> = ({ f, text, alarm }) => {
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 36, letterSpacing: 4, color: alarm ? "#ffb0b0" : "#ffe9b0", background: "rgba(10,10,20,0.72)", border: `3px solid ${alarm ? RED : YEL}`, borderRadius: 8, padding: "6px 20px" }}>
        <span style={{ color: RED, opacity: blink ? 1 : 0.2 }}>● </span>{text}
      </span>
    </div>
  );
};
export const Tag: React.FC<{ local: number; text: string; col?: string }> = ({ local, text, col = RED }) => {
  const o = ip(local, [4, 10], [0, 1]);
  const bg = col === YEL ? "rgba(120,90,10,0.85)" : col === GREEN ? "rgba(20,110,70,0.85)" : "rgba(150,25,35,0.85)";
  return (
    <div style={{ position: "absolute", top: 202, left: 0, right: 0, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * -10}px)` }}>
      <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 27, letterSpacing: 3, color: WH, background: bg, border: `2px solid ${col}`, borderRadius: 6, padding: "5px 14px" }}>{text}</span>
    </div>
  );
};
export const ChapterCard: React.FC<{ local: number; n: string; title: string; dur?: number }> = ({ local, n, title, dur = 40 }) => {
  if (local < 0 || local > dur) return null;
  const o = ip(local, [0, 5, dur - 6, dur], [0, 1, 1, 0]);
  const w = ip(local, [0, 12], [0, 1], Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: `rgba(6,8,16,${0.82 * o})`, justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ textAlign: "center", color: WH }}>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: YEL }}>CHAPTER {n}</div>
        <div style={{ height: 4, width: 520 * w, background: YEL, margin: "22px auto" }} />
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 84, letterSpacing: 3, padding: "0 40px" }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};
