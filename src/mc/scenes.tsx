// Общие сцены: улица из кубиков и комната героя.
import React from "react";
import { B, Backdrop, BlockCar, Cam, Frame, G, GY, Ground, Layer, Tod, Torch, Tower, Tree, gx, YEL } from "./kit";

// улица: задник (небо, облака, дальний город), средний план (дома), земля, деревья, машины; children — на переднем плане
export const Street: React.FC<{ cam: Cam; f: number; tod?: Tod; sun?: [number, number]; torches?: boolean; cars?: boolean; trees?: boolean; dark?: number; mid?: React.ReactNode; back?: React.ReactNode; children?: React.ReactNode }> =
  ({ cam, f, tod = "dawn", sun = [2600, -250], torches, cars = true, trees = true, dark, mid, back, children }) => (
  <Frame tod={tod} dark={dark}>
    <Backdrop cam={cam} tod={tod} f={f} sun={sun} />
    <Layer cam={cam} d={0.7} blur={2}>
      <g transform={`translate(0 ${GY - 40}) scale(0.42) translate(0 ${-GY})`}>
        {mid ?? [[-26, 3, 6, "#7a5ac8"], [-19, 2, 9, "#c85a9a"], [-13, 3, 5, "#5a6ad8"], [-6, 2, 8, "#8a4ab0"], [0, 3, 6, "#d8606a"], [7, 2, 10, "#5a5ac8"], [13, 3, 5, "#b85ac0"], [20, 2, 8, "#6a7ae0"], [27, 3, 7, "#c8508a"], [34, 2, 9, "#7a5ac8"], [40, 3, 6, "#c85a9a"], [47, 2, 8, "#5a6ad8"]].map(([c, w, h, col], i) =>
          <Tower key={i} c={c as number} w={w as number} h={h as number} col={col as string} seed={i + 3} lit={tod === "night" ? 0.15 : 0.35} />)}
        <Ground c0={-40} c1={70} top="grass" depth={1} />
      </g>
    </Layer>
    <Haze tod={tod} />
    <Layer cam={cam} d={1}>
      {back}
      {/* тротуар (трава) и дорога */}
      {Array.from({ length: 50 }, (_, i) => <G key={i} c={-20 + i} r={-1} t="conc" col="#4a4472" />)}
      {Array.from({ length: 50 }, (_, i) => <rect key={"d" + i} x={gx(-20 + i) + 50} y={GY + 90} width={100} height={18} fill={YEL} stroke="#16131f" strokeWidth={4} />)}
      {Array.from({ length: 50 }, (_, i) => <G key={"s" + i} c={-20 + i} r={-2} t="stone" />)}
      {trees ? [-11, -3, 6, 14, 22].map((c) => <Tree key={c} c={c} h={3} />) : null}
      {cars ? <><BlockCar x={gx(1)} col="#e04a5a" /><BlockCar x={gx(10)} col="#3cc6d8" flip /><BlockCar x={gx(19)} col="#ffd23c" /></> : null}
      {torches ? [-9, -5, -1, 3, 7, 11, 15, 19, 23].map((c) => <Torch key={c} x={gx(c) + B / 2} y={GY} f={f} />) : null}
      {children}
    </Layer>
  </Frame>
);

// комната: стены из досок, окно с квадратным солнцем и городом, кровать
export const Room: React.FC<{ cam: Cam; f: number; tod?: Tod; dark?: number; children?: React.ReactNode }> = ({ cam, f, tod = "dawn", dark, children }) => (
  <Frame tod={tod} dark={dark}>
    <Layer cam={cam} d={1}>
      <rect x={-2000} y={-2000} width={6000} height={5000} fill="#7a4a2a" />
      {Array.from({ length: 13 * 8 }, (_, i) => { const c = -4 + (i % 13), r = Math.floor(i / 13); return (c >= 2 && c <= 4 && r >= 1 && r <= 3) ? null : <G key={i} c={c} r={r} t="planks" col="#b8804a" />; })}
      {/* окно 3×3: за ним небо, квадратное солнце, кубический город */}
      <svg x={gx(2)} y={gy3()} width={B * 3} height={B * 3} viewBox={`0 0 ${B * 3} ${B * 3}`} overflow="hidden">
        <rect width={B * 3} height={B * 3} fill={`url(#sky-${tod})`} />
        <rect x={360} y={70} width={110} height={110} fill="#fff2a0" stroke="#16131f" strokeWidth={6} />
        {[[0, 3, "#7a5ac8"], [140, 4, "#c85a9a"], [300, 2, "#5a6ad8"], [430, 3, "#8a4ab0"]].map(([x, h, c], i) => Array.from({ length: (h as number) * 2 }, (_, j) => <rect key={i + "_" + j} x={(x as number) + (j % 2) * 60} y={600 - (Math.floor(j / 2) + 1) * 60 - 60} width={60} height={60} fill={c as string} stroke="#16131f" strokeWidth={4} />))}
      </svg>
      {Array.from({ length: 9 }, (_, i) => <G key={"g" + i} c={2 + (i % 3)} r={1 + Math.floor(i / 3)} t="glass" />)}
      {Array.from({ length: 14 }, (_, i) => <G key={"fl" + i} c={-4 + i} r={-1} t="planks" col="#a86a3a" />)}
      {children}
    </Layer>
  </Frame>
);
const gy3 = () => GY - 4 * B;

// природа/любая сцена: небо, облака, дальние холмы (или город), а children — в основном слое
import { Glow, INK as INK2 } from "./kit";
export const Land: React.FC<{ cam: Cam; f: number; tod?: Tod; sun?: [number, number]; city?: boolean; dark?: number; children?: React.ReactNode }> = ({ cam, f, tod = "day", sun = [2600, -250], city = false, dark, children }) => (
  <Frame tod={tod} dark={dark}>
    <Backdrop cam={cam} tod={tod} f={f} sun={sun} city={city} />
    {city ? null : <Layer cam={cam} d={0.55} blur={2}>
      <g transform={`translate(0 ${GY - 40}) scale(0.42) translate(0 ${-GY})`}>
        {Array.from({ length: 120 }, (_, i) => { const h = HH(i); return Array.from({ length: h }, (_, j) => <G key={i + "_" + j} c={-50 + i} r={j - 1} t={j === h - 1 ? "grass" : "dirt"} col={j === h - 1 ? undefined : "#6a4a6a"} />); })}
        {[-40, -28, -15, -2, 9, 21, 33, 47, 60].map((c) => <Tree key={c} c={c} r={HH(c + 50) - 1} h={3} leaves="#2a9a6a" />)}
      </g>
    </Layer>}
    <Haze tod={tod} />
    <Layer cam={cam} d={1}>{children}</Layer>
  </Frame>
);
const HH = (i: number) => 2 + Math.round(2 + Math.sin(i * 0.31) * 1.8 + Math.sin(i * 0.13) * 2);
// мерцающий свет вокруг факела в темноте
export const LightPool: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <Glow x={x} y={y} r={r} g="gY" o={0.5} />;
export { INK2 };

// дымка между дальним и ближним планом
export const Haze: React.FC<{ tod: Tod }> = ({ tod }) => <rect x={0} y={0} width={1920} height={1080} fill={tod === "night" ? "#1a0f4a" : tod === "day" ? "#d8c8ff" : "#f0b0e0"} opacity={tod === "night" ? 0.3 : 0.22} />;
