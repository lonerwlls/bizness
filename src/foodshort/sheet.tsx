// Лист персонажа Пети для проверки: npx remotion still src/foodshort/index.tsx PetyaSheet out/petya.png
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Petya, pSquat, pSitFloor, pStand, pWalk } from "./petya";

export const PetyaSheet: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, React.ReactNode][] = [
    ["анфас", <Petya x={0} y={0} s={1} pose={pStand(f)} />],
    ["поворот", <Petya x={0} y={0} s={1} pose={pStand(f, { turn: 0.6, expr: { mouth: "tight" } })} />],
    ["страх", <Petya x={0} y={0} s={1} pose={pStand(f, { turn: -0.3, handL: [-30, -330], handR: [40, -320], expr: { eyes: "wide", mouth: "o", brows: 1 } })} />],
    ["идёт", <Petya x={0} y={0} s={1} pose={pWalk(f, 70, 1)} />],
    ["сидит", <Petya x={0} y={0} s={1} pose={pSitFloor(f, { expr: { eyes: "closed", mouth: "open" } })} />],
    ["присел", <Petya x={0} y={0} s={1} pose={pSquat(f)} />],
  ];
  return <AbsoluteFill style={{ background: "#141b3a" }}>
    <svg width={1800} height={900} viewBox="0 0 1800 900">
      <rect y={720} width={1800} height={180} fill="#10152e" />
      {items.map(([n, el], i) => <g key={n}><g transform={`translate(${160 + i * 296} 720) scale(0.95)`}>{el}</g>
        <text x={160 + i * 296} y={800} textAnchor="middle" fontFamily="sans-serif" fontSize={30} fill="#9fb0e8">{n}</text></g>)}
    </svg>
  </AbsoluteFill>;
};
