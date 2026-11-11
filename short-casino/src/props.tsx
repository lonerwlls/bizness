// Предметы и локации ролика «Почему в казино нет часов» — из Box/Sign, в стиле набора.
import React from "react";
import { Box, Sign, Room, Plant, Bench, Lamp, Clock, Shelf, bonkAt, useSec } from "./kit";
type V3 = [number, number, number];

// ------------------------------------------------------------------ казино
export const Slot: React.FC<{ p: V3; c: string; text?: string; rotY?: number }> = ({ p, c, text = "7 7 7", rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.55, 0]} s={[0.56, 1.1, 0.5]} c={c} r={0.5} />
    <Box p={[0, 1.32, -0.04]} s={[0.56, 0.44, 0.42]} c={c} r={0.5} />
    <Sign p={[0, 1.32, 0.18]} w={0.44} h={0.26} text={text} bg="#fff6dc" fg="#d61f3a" glow={0.9} />
    <Box p={[0, 1.62, -0.04]} s={[0.5, 0.16, 0.36]} c="#ffd34a" e="#ffb52e" ei={1.6} />
    <Box p={[0, 0.92, 0.3]} s={[0.5, 0.06, 0.16]} c="#2a2d33" />
    {[-0.12, 0, 0.12].map((x) => <Box key={x} p={[x, 0.97, 0.32]} s={[0.07, 0.04, 0.07]} c={["#e53b3b", "#3bd16a", "#3b8fe5"][Math.round(x / 0.12) + 1]} e="#ffffff" ei={0.3} line={false} />)}
    <Box p={[0.31, 1.1, 0.05]} s={[0.04, 0.4, 0.04]} c="#c9ccd1" metal={0.7} r={0.3} />
    <Box p={[0.31, 1.32, 0.05]} s={[0.09, 0.09, 0.09]} c="#e53b3b" />
  </group>
);

export const Chips: React.FC<{ p: V3; n: number; c: string }> = ({ p, n, c }) => (
  <group position={p}>
    {Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => <Box key={i} p={[0, 0.012 + i * 0.024, 0]} s={[0.07, 0.022, 0.07]} c={i % 2 ? c : "#f4efe2"} line={false} />)}
  </group>
);

// Игровой стол: зелёное сукно, деревянный борт, карты и фишки. chips — множитель высоты стопок (0..1).
export const CardTable: React.FC<{ p: V3; chips?: number }> = ({ p, chips = 1 }) => (
  <group position={p}>
    <Box p={[0, 0.74, 0]} s={[1.5, 0.08, 0.85]} c="#7a4a2c" r={0.5} />
    <Box p={[0, 0.79, 0]} s={[1.36, 0.03, 0.71]} c="#1f7a4a" r={0.9} line={false} />
    <Box p={[0, 0.36, 0]} s={[0.9, 0.7, 0.5]} c="#4a2a18" />
    {[[-0.3, 0.05], [-0.18, 0.08], [0.25, -0.05]].map(([x, z], i) => <Box key={i} p={[x, 0.81, z]} s={[0.1, 0.006, 0.14]} c="#fbf7ea" rot={[0, i * 0.4, 0]} line={false} />)}
    <Chips p={[0.45, 0.8, 0.12]} n={10 * chips} c="#d61f3a" />
    <Chips p={[0.55, 0.8, 0.0]} n={7 * chips} c="#2f6fd6" />
    <Chips p={[0.38, 0.8, -0.1]} n={5 * chips} c="#1d1f23" />
  </group>
);

// Зал казино без окон и часов: бордовые стены, ковёр, автоматы, лампы, вывески, растения.
export const Casino: React.FC<{ chips?: number; poster?: boolean; table?: boolean }> = ({ chips = 1, poster = false, table = true }) => (<>
  <Room window={false} wall="#7a1f2b" wain="#4a1018" floor="#1f5a4f" ceil="#2a1a1a" />
  {/* золотые молдинги */}
  <Box p={[0, 2.55, -1.94]} s={[6, 0.06, 0.06]} c="#e8b54a" metal={0.5} r={0.35} />
  {/* ряд автоматов у задней стены */}
  {[["#d64545", "7 7 7"], ["#2f6fd6", "BAR"], ["#e8a020", "$$$"], ["#8a3fd6", "7 7 7"]].map(([c, t], i) =>
    <Slot key={i} p={[-2.45 + i * 0.66, 0, -1.65]} c={c} text={t} />)}
  <Sign p={[-1.45, 2.3, -1.98]} w={1.9} h={0.42} text="JACKPOT" bg="#1a0b10" fg="#ffcf3a" glow={1.3} />
  <Sign p={[1.4, 2.25, -1.98]} w={1.2} h={0.36} text="PLAY ON!" bg="#1a0b10" fg="#ff5fa2" glow={1.2} />
  {table ? <CardTable p={[1.45, 0, -0.85]} chips={chips} /> : null}
  {poster ? (<>
    <Box p={[1.5, 1.45, -1.97]} s={[1.05, 1.25, 0.04]} c="#e8b54a" metal={0.4} r={0.4} />
    <Sign p={[1.5, 1.85, -1.94]} w={0.95} h={0.26} text="DESIGNING" bg="#efe3c8" fg="#7a1f2b" glow={0.12} />
    <Sign p={[1.5, 1.6, -1.94]} w={0.95} h={0.26} text="CASINOS" bg="#efe3c8" fg="#7a1f2b" glow={0.12} />
    <Sign p={[1.5, 1.33, -1.94]} w={0.95} h={0.2} text="BILL FRIEDMAN" bg="#efe3c8" fg="#1d1f23" glow={0.12} />
    <Sign p={[1.5, 1.08, -1.94]} w={0.95} h={0.24} text="2000" bg="#efe3c8" fg="#d61f3a" glow={0.12} />
  </>) : null}
  <Plant p={[2.6, 0, -1.6]} h={0.9} /><Plant p={[-2.7, 0, 1.2]} h={0.8} />
  {/* барная стойка справа */}
  <Box p={[2.65, 0.55, 0.3]} s={[0.5, 1.1, 1.6]} c="#4a2a18" />
  <Box p={[2.62, 1.12, 0.3]} s={[0.62, 0.05, 1.7]} c="#e8b54a" metal={0.4} r={0.35} />
  {[0, 0.25, 0.5, 0.75].map((z, i) => <Box key={z} p={[2.75, 1.25, z]} s={[0.07, 0.2, 0.07]} c={["#3f8a4b", "#d64545", "#f2c230", "#2f9e9a"][i]} line={false} />)}
  <Lamp p={[-1.2, 2.97, -0.6]} len={1.6} glow={1.25} /><Lamp p={[1.2, 2.97, -0.6]} len={1.6} glow={1.25} />
  <pointLight position={[-1.5, 2.2, -0.8]} intensity={4} decay={1.3} color="#ff6fa8" />
  <pointLight position={[1.2, 2.4, 0.2]} intensity={6} decay={1.3} color="#ffd08a" castShadow />
</>);

export const Glass: React.FC<{ p: V3; c?: string }> = ({ p, c = "#ff9d2e" }) => (
  <group position={p}>
    <Box p={[0, 0, 0]} s={[0.08, 0.13, 0.08]} c="#e8f4ff" r={0.1} />
    <Box p={[0, -0.015, 0]} s={[0.07, 0.09, 0.07]} c={c} e={c} ei={0.25} line={false} />
    <Box p={[0.02, 0.09, 0]} s={[0.012, 0.12, 0.012]} c="#ff5fa2" rot={[0, 0, -0.3]} line={false} />
  </group>
);

// Телефон в руке: экран светится (on) или чёрный (off).
export const Phone: React.FC<{ p: V3; on?: boolean }> = ({ p, on = false }) => (
  <group position={p}>
    <Box p={[0, 0, 0]} s={[0.09, 0.17, 0.015]} c="#1d1f23" r={0.3} />
    <mesh position={[0, 0, 0.009]}><planeGeometry args={[0.075, 0.15]} />
      <meshBasicMaterial color={on ? "#bfe3ff" : "#0d0e10"} toneMapped={!on} /></mesh>
    {on ? <pointLight position={[0, 0, 0.25]} intensity={1.6} decay={1.5} color="#a9d4ff" /> : null}
  </group>
);

// ------------------------------------------------------------------ улица с остановкой
// mode: evening (закат, фонари) | dawn (рассвет) | morning (пустое утро)
export const Street: React.FC<{ mode: "evening" | "dawn" | "morning"; busBonk?: number }> = ({ mode, busBonk = -1 }) => {
  const sec = useSec();
  const sky = mode === "evening" ? "#ff9a6b" : mode === "dawn" ? "#ffc38a" : "#9fd0ff";
  const winGlow = mode === "evening" ? 1.1 : 0.15;
  return (<>
    <mesh position={[0, 6, -9]}><planeGeometry args={[40, 14]} /><meshBasicMaterial color={sky} /></mesh>
    {mode !== "morning" ? <mesh position={[3, mode === "dawn" ? 0.9 : 1.6, -8.9]}><circleGeometry args={[0.9, 40]} /><meshBasicMaterial color={[1.6, 1.25, 0.8]} toneMapped={false} /></mesh> : null}
    <Box p={[0, -0.05, -1]} s={[14, 0.1, 6]} c="#b9b2a6" line={false} r={0.9} />
    <Box p={[0, 0.06, -0.6]} s={[14, 0.12, 0.12]} c="#8d939b" />
    <Box p={[0, -0.04, 1.6]} s={[14, 0.1, 4]} c="#3a3d44" line={false} r={0.9} />
    {[-4, -2, 0, 2, 4].map((x) => <Box key={x} p={[x, 0.005, 1.6]} s={[0.9, 0.01, 0.12]} c="#f2e9d0" line={false} />)}
    {/* дома за остановкой */}
    {[[-4.2, "#c96f4a", 3.4], [-1.6, "#4f8f95", 4.2], [1.2, "#d9a441", 3.0], [3.9, "#7a5aa6", 3.8]].map(([x, c, h], i) => (
      <group key={i}>
        <Box p={[x as number, (h as number) / 2, -3.6]} s={[2.5, h as number, 1.4]} c={c as string} />
        {[0.9, 1.9, 2.8].filter((y) => y < (h as number) - 0.4).flatMap((y) => [-0.7, 0, 0.7].map((dx) =>
          <Box key={y + "" + dx} p={[(x as number) + dx, y, -2.88]} s={[0.4, 0.5, 0.04]} c="#ffe2a0" e="#ffcf6a" ei={((i + dx * 3 + y) % 2 > 0.6 ? winGlow : 0.05)} />))}
      </group>))}
    {/* навес остановки */}
    <Box p={[0, 2.25, -1.55]} s={[2.4, 0.08, 1.1]} c="#2f6fd6" />
    {[-1.15, 1.15].map((x) => <Box key={x} p={[x, 1.12, -1.95]} s={[0.07, 2.25, 0.07]} c="#8d939b" />)}
    <mesh position={[0, 1.25, -2.0]}><planeGeometry args={[2.3, 1.6]} /><meshStandardMaterial color="#cfe8ff" transparent opacity={0.35} /></mesh>
    <Bench p={[0.2, 0, -1.7]} c="#d07a3a" w={1.4} />
    {/* табличка автобуса */}
    <Box p={[-1.75, 1.1, -1.3]} s={[0.06, 2.2, 0.06]} c="#8d939b" />
    <group position={[-1.75, 2.2, -1.27]} scale={busBonk > 0 ? bonkAt(sec, busBonk, 0.3) : 1}>
      <Sign p={[0, 0, 0]} w={0.9} h={0.5} text="BUS" bg="#2f6fd6" fg="#ffffff" glow={0.5} />
      <Sign p={[0, -0.45, 0]} w={0.9} h={0.4} text={mode === "morning" ? "GONE" : "LAST 9:00"} bg="#f6f3ea" fg={mode === "morning" ? "#d61f3a" : "#1d1f23"} glow={0.4} sz={mode === "morning" ? 110 : 80} />
    </group>
    {/* фонарь */}
    <Box p={[1.9, 1.4, -1.0]} s={[0.07, 2.8, 0.07]} c="#2a2d33" />
    <Box p={[1.7, 2.78, -1.0]} s={[0.45, 0.06, 0.12]} c="#2a2d33" />
    <Box p={[1.55, 2.72, -1.0]} s={[0.2, 0.06, 0.12]} c="#fff1c4" e="#ffd88a" ei={mode === "evening" ? 3 : 0.2} line={false} />
    {mode === "evening" ? <pointLight position={[1.55, 2.5, -0.9]} intensity={3} decay={1.4} color="#ffcf8a" /> : null}
    <Plant p={[-2.6, 0, -1.4]} h={0.7} />
    <Box p={[2.6, 0.45, -1.4]} s={[0.4, 0.9, 0.4]} c="#3f8a4b" />{/* урна */}
    <Box p={[2.6, 0.92, -1.4]} s={[0.46, 0.06, 0.46]} c="#2a2d33" />
  </>);
};

// ------------------------------------------------------------------ спальня ночью
export const Bedroom: React.FC<{ clockAt: number }> = ({ clockAt }) => {
  const sec = useSec();
  const late = sec >= clockAt;
  return (<>
    <Room wall="#3b4f8f" wain="#2c3b6e" floor="#7a4a2c" ceil="#cfcade" sky="#141c3f" />
    <mesh position={[-4.5, 2.1, 0.2]}><circleGeometry args={[0.25, 32]} /><meshBasicMaterial color={[1.4, 1.35, 1.1]} toneMapped={false} /></mesh>
    {/* кровать */}
    <Box p={[0.9, 0.2, -1.0]} s={[1.5, 0.4, 1.9]} c="#7a4a2c" />
    <Box p={[0.9, 0.48, -1.0]} s={[1.42, 0.16, 1.82]} c="#f0ebe0" r={0.9} />
    <Box p={[0.9, 0.6, -0.75]} s={[1.44, 0.1, 1.3]} c="#e46b2b" r={0.9} />
    <Box p={[0.9, 0.64, -1.75]} s={[0.9, 0.16, 0.36]} c="#fbf7ea" r={0.9} />
    <Box p={[0.9, 0.75, -1.93]} s={[1.5, 1.1, 0.08]} c="#7a4a2c" />
    {/* тумбочка с лампой */}
    <Box p={[-0.15, 0.27, -1.65]} s={[0.45, 0.54, 0.45]} c="#b8784a" />
    <Box p={[-0.15, 0.62, -1.65]} s={[0.06, 0.16, 0.06]} c="#2a2d33" />
    <Box p={[-0.15, 0.78, -1.65]} s={[0.26, 0.18, 0.26]} c="#ffe7a8" e="#ffcf6a" ei={0.9} />
    <Clock p={[-0.6, 2.1, -1.94]} r={0.22} hh={late ? 3 : 23} mm={late ? 0 : 40} scale={bonkAt(sec, clockAt, 0.35)} />
    <Shelf p={[-2.3, 0, -1.75]} w={0.9} h={1.6} />
    <Plant p={[2.5, 0, -1.6]} h={0.8} />
    <Sign p={[1.9, 1.95, -1.94]} w={0.6} h={0.8} text="GAME" bg="#ffcf3a" fg="#1d1f23" glow={0.2} sz={90} />
    <Box p={[-1.2, 0.01, -0.3]} s={[1.4, 0.02, 1.0]} c="#2f9e9a" line={false} />{/* коврик */}
    <pointLight position={[-0.15, 1.0, -1.4]} intensity={2.2} decay={1.4} color="#ffc477" />
  </>);
};
