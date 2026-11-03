// Широкий формат 16:9 для вертикальных роликов: 3D рисуется на весь кадр,
// а 2D-сцены (вёрстка под 1080×1920) — по центру в уменьшенной «вертикальной сцене».
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { useVideoConfig } from "remotion";

const K = 1080 / 1920, OFF = (1920 - 1080 * K) / 2;
export const useWide = () => { const { width, height } = useVideoConfig(); return width > height; };

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!useWide()) return <>{children}</>;
  return <div style={{ position: "absolute", left: OFF, top: 0, width: 1080, height: 1920, transform: `scale(${K})`, transformOrigin: "0 0" }}>{children}</div>;
};

export const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const c = <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}>{children}</ThreeCanvas>;
  if (width <= height) return c;
  return <div style={{ position: "absolute", left: -OFF / K, top: 0, width, height, transform: `scale(${1 / K})`, transformOrigin: "0 0" }}>{c}</div>;
};
