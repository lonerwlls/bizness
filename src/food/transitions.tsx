// Переходы между частями: каждая часть кончается затемнением, следующая начинается карточкой времени.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export const CARD = 54; // длина карточки в начале части (кадры)
export const FadeOut: React.FC<{ total: number; len?: number }> = ({ total, len = 18 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [total - len, total - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return o > 0 ? <AbsoluteFill style={{ background: "#1a0f08", opacity: o }} /> : null;
};
/** карточка «24 HOURS LATER» на тёмном фоне: появляется, держится, растворяется в сцену */
export const TimeCard: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, CARD - 14, CARD], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bg = interpolate(f, [CARD - 14, CARD], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 14], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  if (f >= CARD) return null;
  return (
    <AbsoluteFill style={{ background: `rgba(26,15,8,${bg})`, justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: o, transform: `translateY(${y}px)`, textAlign: "center", fontFamily: "sans-serif", color: "#f6e6c4" }}>
        <div style={{ fontWeight: 900, fontSize: 96, letterSpacing: 8 }}>{text}</div>
        {sub ? <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: 6, color: "#e8b46a", marginTop: 16 }}>{sub}</div> : null}
        <div style={{ height: 6, width: 260, background: "#e8b46a", margin: "26px auto 0" }} />
      </div>
    </AbsoluteFill>
  );
};
