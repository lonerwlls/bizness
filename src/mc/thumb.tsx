// Обложка 1280×720 для «What if Minecraft became real?»: кубический город, герой в шоке справа, заголовок слева сверху.
import React from "react";
import { AbsoluteFill } from "remotion";
import { B, Bean, Drop, GY, Groaner, HERO2D, HS, INK, Shade, Tree, YEL, gx } from "./kit";
import { Street } from "./scenes";

const Title: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode }> = ({ x, y, size, fill, children }) => (
  <g>
    <text x={x + size * 0.05} y={y + size * 0.09} fontFamily="McMont" fontWeight={900} fontSize={size} fill={INK} stroke={INK} strokeWidth={size * 0.22} strokeLinejoin="round" letterSpacing={-size * 0.03}>{children}</text>
    <text x={x} y={y} fontFamily="McMont" fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.14} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-size * 0.03}>{children}</text>
  </g>
);
export const ThumbMc: React.FC = () => {
  const f = 20;
  return (
    <AbsoluteFill style={{ background: "#120a30" }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>
        <Street cam={{ x: gx(6.5), y: GY - 520, z: 0.82 }} f={f} tod="dusk" sun={[2700, -150]} trees={false}>
          <Tree c={9} h={4} cut={1} /><Drop t="log" x={gx(9) + B / 2} y={GY - 20} f={f} />
          <Shade x={gx(11) + 60} f={f} s={0.8} /><Groaner x={gx(1)} f={f} s={0.8} />
          <Bean x={gx(8)} y={GY + 520} s={HS * 2.6} look={HERO2D} f={f} expr="shock" open={1} sweat pose={{ armL: [150, 40], armR: [150, 40], tilt: 6 }} />
        </Street>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <Title x={60} y={220} size={180} fill="#ffffff">WHAT IF</Title>
          <Title x={60} y={420} size={180} fill={YEL}>MINECRAFT</Title>
          <Title x={60} y={620} size={150} fill="#ffffff">BECAME</Title>
          <Title x={60} y={790} size={150} fill="#ffffff">REAL?</Title>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
