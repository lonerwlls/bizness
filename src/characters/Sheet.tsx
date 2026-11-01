// Лист персонажей: проверка внешности и поз. Композиция Char-sheet.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COP, FRIEND1, FRIEND2, MASCOT, PETIT, Person, STAND, Shadow } from "./Rig";

export const CharSheet: React.FC = () => {
  const t = useCurrentFrame();
  const G = 860, G2 = 1700;
  const walkFeet = { l: [-30, 140] as [number, number], r: [34, 128] as [number, number] };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#1c2a48,#0f1729)" }}>
      <svg width={1080} height={1920}>
        {[180, 540, 900].map((x) => <Shadow key={x} x={x} y={G} />)}
        <Person x={180} y={G - 150} s={1.15} pose={STAND} look={MASCOT} t={t} face={{ mouth: "smile" }} />
        <Person x={540} y={G - 150} s={1.15} pose={{ ...STAND, aR: [150, 175], aL: [-20, -10] }} look={MASCOT} t={t} turn={0.4} face={{ eyes: "happy", mouth: "grin" }} />
        <Person x={900} y={G - 150} s={1.15} pose={{ lean: -6, aL: [-120, -170], aR: [120, 170], lL: [-14, 4], lR: [14, -4] }} look={MASCOT} t={t} face={{ eyes: "wide", brows: 1, mouth: "o" }} />
        {[150, 400, 650, 900].map((x) => <Shadow key={x} x={x} y={G2} w={60} />)}
        <Person x={150} y={G2 - 135} s={1} pose={STAND} look={PETIT} turn={1} t={t} face={{ mouth: "smile" }} feet={walkFeet} pole={{ c: [60, -70], a: -3 }} />
        <Person x={400} y={G2 - 140} s={1} pose={{ ...STAND, aR: [60, 100] }} look={FRIEND1} turn={1} t={t} />
        <Person x={650} y={G2 - 140} s={1} pose={STAND} look={FRIEND2} t={t} face={{ mouth: "smile" }} />
        <Person x={900} y={G2 - 140} s={1} pose={{ ...STAND, aL: [-30, 60] }} look={COP} turn={0.5} dir={-1} t={t} />
      </svg>
    </AbsoluteFill>
  );
};
