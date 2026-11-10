// Локации: кухня, улица, супермаркет (с заполненностью полок), океан с судами, порт, диспетчерская, экран телефона.
import React from "react";
import { P } from "../brand/corridor/rig";
import { H, OL, W, persp, poly } from "./common";

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ================= КУХНЯ =================
export const KIT = { vp: [960, 430] as P, foc: 900, camH: 1.6 };
const kp = persp(KIT.vp, KIT.foc, KIT.camH);
export const kitFloorY = (Z: number) => kp(0, 0, Z)[1];
export const kitX = (X: number, Z: number) => kp(X, 0, Z)[0];
/** open: 0..1 дверь холодильника; light — свет внутри */
export const Kitchen: React.FC<{ open?: number }> = ({ open = 0 }) => {
  const RX = 3.2, RH = 2.8, ZB = 6.5;
  const q = kp;
  const F = { x0: 1.6, x1: 2.6, z0: 3.3, z1: 4.0, h: 1.9 };
  const doorA = open * Math.PI * 0.5; // поворот двери вокруг правого ребра
  const hx = F.x1, hz = F.z0, dw = F.x1 - F.x0;
  const dx = hx - Math.cos(doorA) * dw, dz = hz - Math.sin(doorA) * dw;
  return (
    <g>
      <defs>
        <linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f2dfb8" /><stop offset="100%" stopColor="#e3c896" /></linearGradient>
        <radialGradient id="fridgeGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(220,240,255,0.75)" /><stop offset="100%" stopColor="rgba(220,240,255,0)" /></radialGradient>
        <linearGradient id="kFloor" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#a87a4a" /><stop offset="100%" stopColor="#c99d68" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="#e9d2a6" />
      <polygon points={poly([q(-RX, RH, 1), q(RX, RH, 1), q(RX, RH, ZB), q(-RX, RH, ZB)])} fill="#f4e6c6" />
      <polygon points={poly([q(-RX, RH, 1), q(-RX, RH, ZB), q(-RX, 0, ZB), q(-RX, 0, 1)])} fill="#dcc08e" />
      <polygon points={poly([q(RX, RH, 1), q(RX, RH, ZB), q(RX, 0, ZB), q(RX, 0, 1)])} fill="#d6b884" />
      <polygon points={poly([q(-RX, RH, ZB), q(RX, RH, ZB), q(RX, 0, ZB), q(-RX, 0, ZB)])} fill="url(#kWall)" />
      <polygon points={poly([q(-RX, 0, 1), q(RX, 0, 1), q(RX, 0, ZB), q(-RX, 0, ZB)])} fill="url(#kFloor)" />
      {Array.from({ length: 8 }, (_, i) => -RX + i * 0.8).map((X) => <polyline key={X} points={poly([q(X, 0, 1), q(X, 0, ZB)])} stroke="rgba(90,55,25,0.2)" strokeWidth={2} fill="none" />)}
      {/* окно с городом */}
      <polygon points={poly([q(-1.9, 2.3, ZB), q(-0.3, 2.3, ZB), q(-0.3, 1.2, ZB), q(-1.9, 1.2, ZB)])} fill="#cfe6f2" stroke={OL} strokeWidth={5} />
      {[[-1.8, 1.2, -1.5, 1.75], [-1.45, 1.2, -1.1, 1.95], [-1.05, 1.2, -0.75, 1.6], [-0.7, 1.2, -0.4, 1.85]].map(([a, b, c, d], i) => <polygon key={i} points={poly([q(a, d, ZB), q(c, d, ZB), q(c, b, ZB), q(a, b, ZB)])} fill="#b9a088" />)}
      <polyline points={poly([q(-1.1, 2.3, ZB), q(-1.1, 1.2, ZB)])} stroke={OL} strokeWidth={4} />
      {/* шкафы и столешница вдоль дальней стены */}
      <polygon points={poly([q(-3.0, 2.5, ZB), q(1.2, 2.5, ZB), q(1.2, 1.9, ZB), q(-3.0, 1.9, ZB)])} fill="#9ab8a0" stroke={OL} strokeWidth={4} />
      <polygon points={poly([q(-3.0, 0.9, ZB - 0.6), q(1.2, 0.9, ZB - 0.6), q(1.2, 0, ZB - 0.6), q(-3.0, 0, ZB - 0.6)])} fill="#8aab94" stroke={OL} strokeWidth={4} />
      <polygon points={poly([q(-3.0, 0.92, ZB - 0.65), q(1.2, 0.92, ZB - 0.65), q(1.2, 0.92, ZB), q(-3.0, 0.92, ZB)])} fill="#f2e8d4" stroke={OL} strokeWidth={4} />
      {[-2.5, -1.6, -0.7, 0.2].map((X) => <circle key={X} cx={q(X + 0.4, 0.6, ZB - 0.6)[0]} cy={q(X + 0.4, 0.6, ZB - 0.6)[1]} r={4} fill="#f2e8d4" stroke={OL} strokeWidth={2} />)}
      <g transform={`translate(${q(-2.4, 0.92, ZB - 0.3)[0]} ${q(-2.4, 0.92, ZB - 0.3)[1]})`}><path d="M -18 0 L -14 -36 L 14 -36 L 18 0 Z" fill="#d8443a" stroke={OL} strokeWidth={3} /><path d="M 14 -26 q 12 0 10 14" stroke={OL} strokeWidth={3} fill="none" /></g>
      <g transform={`translate(${q(0.6, 0.92, ZB - 0.3)[0]} ${q(0.6, 0.92, ZB - 0.3)[1]})`}><path d="M -14 0 L -12 -20 L 12 -20 L 14 0 Z" fill="#b07a46" stroke={OL} strokeWidth={3} /><path d="M 0 -20 Q -16 -50 -4 -60 M 0 -20 Q 10 -46 20 -52" stroke="#5a9a4a" strokeWidth={6} fill="none" /></g>
      {/* лампа */}
      <polyline points={poly([q(0, RH, 3.6), q(0, 2.2, 3.6)])} stroke={OL} strokeWidth={3} />
      <path d={`M ${q(-0.25, 2.2, 3.6)[0]} ${q(0, 2.2, 3.6)[1]} L ${q(0.25, 2.2, 3.6)[0]} ${q(0, 2.2, 3.6)[1]} L ${q(0.15, 2.35, 3.6)[0]} ${q(0, 2.35, 3.6)[1]} L ${q(-0.15, 2.35, 3.6)[0]} ${q(0, 2.35, 3.6)[1]} Z`} fill="#e8b23a" stroke={OL} strokeWidth={4} />
      {/* холодильник */}
      <polygon points={poly([q(F.x1, F.h, F.z0), q(F.x1, F.h, F.z1), q(F.x1, 0, F.z1), q(F.x1, 0, F.z0)])} fill="#cfd6dc" stroke={OL} strokeWidth={5} />
      <polygon points={poly([q(F.x0, F.h, F.z0), q(F.x1, F.h, F.z0), q(F.x1, F.h, F.z1), q(F.x0, F.h, F.z1)])} fill="#eef2f4" stroke={OL} strokeWidth={4} />
      {/* внутренность (видна при открытой двери) */}
      <polygon points={poly([q(F.x0, F.h, F.z0), q(F.x1, F.h, F.z0), q(F.x1, 0, F.z0), q(F.x0, 0, F.z0)])} fill={open > 0.05 ? "#f4f8fa" : "#e8eef2"} stroke={OL} strokeWidth={5} />
      {open > 0.05 ? (
        <g>
          {[0.45, 0.85, 1.25, 1.6].map((y) => <polyline key={y} points={poly([q(F.x0 + 0.05, y, F.z0), q(F.x1 - 0.05, y, F.z0)])} stroke="#b8c8d4" strokeWidth={5} />)}
          {/* коробка пиццы, яйца, молоко, банки */}
          <g transform={`translate(${q(F.x0 + 0.4, 0.9, F.z0)[0]} ${q(0, 0.9, F.z0)[1]})`}>
            <path d="M -70 0 L 70 0 L 64 -10 L -64 -10 Z" fill="#d8a860" stroke={OL} strokeWidth={3} />
            <ellipse cx={0} cy={-14} rx={58} ry={16} fill="#f2c25a" stroke={OL} strokeWidth={3} />
            <ellipse cx={0} cy={-14} rx={46} ry={11} fill="#e0703a" />
            {[[-24, -16], [6, -10], [26, -17], [-6, -19]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#a8302a" />)}
            <path d="M 0 -14 L 50 -10 M 0 -14 L -30 -24" stroke="#c8883a" strokeWidth={2} />
          </g>
          {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={q(F.x0 + 0.12 + i * 0.09, 1.3, F.z0)[0]} cy={q(0, 1.3, F.z0)[1]} rx={9} ry={11} fill="#fbf2e0" stroke={OL} strokeWidth={2} />)}
          <polygon points={poly([q(F.x1 - 0.3, 0.75, F.z0), q(F.x1 - 0.12, 0.75, F.z0), q(F.x1 - 0.12, 0.47, F.z0), q(F.x1 - 0.3, 0.47, F.z0)])} fill="#f6f6f6" stroke={OL} strokeWidth={3} />
          <polygon points={poly([q(F.x1 - 0.3, 0.75, F.z0), q(F.x1 - 0.12, 0.75, F.z0), q(F.x1 - 0.12, 0.68, F.z0), q(F.x1 - 0.3, 0.68, F.z0)])} fill="#3a7ad8" />
          {[0, 1, 2].map((i) => <rect key={i} x={q(F.x0 + 0.1 + i * 0.12, 1.85, F.z0)[0]} y={q(0, 1.82, F.z0)[1]} width={22} height={30} rx={4} fill={["#d8443a", "#e8b23a", "#5a9a4a"][i]} stroke={OL} strokeWidth={2} />)}
          <ellipse cx={q((F.x0 + F.x1) / 2, 1.0, F.z0)[0]} cy={q(0, 1.0, F.z0)[1]} rx={260} ry={320} fill="url(#fridgeGlow)" />
        </g>
      ) : null}
      {/* дверь */}
      <polygon points={poly([q(dx, F.h, dz), q(hx, F.h, hz), q(hx, 0.02, hz), q(dx, 0.02, dz)])} fill="#e4eaee" stroke={OL} strokeWidth={5} />
      <polyline points={poly([q(dx + 0.06 * Math.cos(doorA), 1.2, dz + 0.06 * Math.sin(doorA)), q(dx + 0.06 * Math.cos(doorA), 0.9, dz + 0.06 * Math.sin(doorA))])} stroke="#9aa4b2" strokeWidth={8} strokeLinecap="round" />
      {/* стол с телефоном слева спереди */}
      <polygon points={poly([q(-2.4, 0.76, 2.4), q(-0.9, 0.76, 2.4), q(-0.9, 0.76, 3.3), q(-2.4, 0.76, 3.3)])} fill="#b9844e" stroke={OL} strokeWidth={5} />
      <polygon points={poly([q(-2.4, 0.76, 2.4), q(-0.9, 0.76, 2.4), q(-0.9, 0.7, 2.4), q(-2.4, 0.7, 2.4)])} fill="#8a5a30" stroke={OL} strokeWidth={4} />
      {[-2.3, -1.0].map((X) => <polyline key={X} points={poly([q(X, 0.7, 2.45), q(X, 0, 2.45)])} stroke="#6e4a2a" strokeWidth={12} />)}
      <g transform={`translate(${q(-1.95, 0.76, 2.85)[0]} ${q(-1.95, 0.76, 2.85)[1]})`}><circle r={30} fill="#f6efe2" stroke={OL} strokeWidth={4} transform="scale(1 0.35)" /><path d="M -10 -4 L -6 -30 L 10 -30 L 12 -4 Z" fill="#f6efe2" stroke={OL} strokeWidth={3} /></g>
    </g>
  );
};
/** телефон лежит на столе (вибрирует) */
export const kitPhonePos = (): P => kp(-1.35, 0.76, 2.8);

// ================= УЛИЦА (фасады) =================
export const STREET_Y = 830; // линия тротуара (ноги)
const Win: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean }> = ({ x, y, w, h, lit }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={lit ? "#f6e2a8" : "#a8c8d8"} stroke={OL} strokeWidth={5} /><path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`} stroke={OL} strokeWidth={3} />
    <rect x={x - 6} y={y + h - 2} width={w + 12} height={10} fill="#e8dcc4" stroke={OL} strokeWidth={3} /></g>
);
const Awning: React.FC<{ x: number; y: number; w: number; a: string; b: string }> = ({ x, y, w, a, b }) => (
  <g>{Array.from({ length: Math.round(w / 50) }, (_, i) => <path key={i} d={`M ${x + i * 50} ${y} L ${x + i * 50 + 50} ${y} L ${x + i * 50 + 58} ${y + 70} L ${x + i * 50 + 8} ${y + 70} Z`} fill={i % 2 ? b : a} stroke={OL} strokeWidth={3} />)}
    <path d={`M ${x} ${y} L ${x + Math.round(w / 50) * 50} ${y}`} stroke={OL} strokeWidth={5} /></g>
);
export const Sign: React.FC<{ x: number; y: number; w: number; text: string; c?: string; fg?: string; size?: number }> = ({ x, y, w, text, c = "#3a2a1e", fg = "#f6e6c4", size = 40 }) => (
  <g><rect x={x} y={y} width={w} height={size * 1.6} rx={8} fill={c} stroke={OL} strokeWidth={5} /><text x={x + w / 2} y={y + size * 1.15} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={size} fill={fg} letterSpacing={3}>{text}</text></g>
);
/** stock 0..1 — сколько хлеба в витрине пекарни, closed — закрыто */
export const Street: React.FC<{ stock?: number; closedCafe?: boolean; queue?: boolean }> = ({ stock = 1, closedCafe }) => (
  <g>
    <defs><linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f6d9a4" /><stop offset="100%" stopColor="#fbecc8" /></linearGradient></defs>
    <rect width={W * 2} height={H} fill="url(#skyS)" />
    {/* дальний план: силуэты домов */}
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 300 - 40} y={180 + rnd(i) * 120} width={260} height={500} fill="#e2c69a" />)}
    {/* кафе */}
    <rect x={0} y={250} width={760} height={STREET_Y - 250} fill="#c98a5a" stroke={OL} strokeWidth={6} />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M 0 ${280 + i * 50} L 760 ${280 + i * 50}`} stroke="rgba(110,50,20,0.18)" strokeWidth={3} />)}
    <Sign x={170} y={290} w={420} text="CORNER CAFÉ" c="#3a5a3a" />
    <Win x={70} y={420} w={260} h={220} lit={!closedCafe} /><Win x={430} y={420} w={260} h={220} lit={!closedCafe} />
    <Awning x={40} y={380} w={700} a="#3a6a4a" b="#f2e6cc" />
    {closedCafe ? <g><rect x={340} y={520} width={80} height={60} fill="#f6efe0" stroke={OL} strokeWidth={4} /><text x={380} y={558} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={20} fill="#c0302a">CLOSED</text></g> : null}
    {/* пекарня */}
    <rect x={780} y={300} width={520} height={STREET_Y - 300} fill="#e6c27a" stroke={OL} strokeWidth={6} />
    <Sign x={850} y={330} w={380} text="BAKERY" c="#8a3a2a" />
    <rect x={840} y={470} width={400} height={230} fill="#fbe6b4" stroke={OL} strokeWidth={6} />
    {Array.from({ length: Math.round(9 * stock) }, (_, i) => <ellipse key={i} cx={880 + (i % 5) * 75} cy={600 - Math.floor(i / 5) * 60} rx={32} ry={20} fill="#d8954a" stroke={OL} strokeWidth={4} />)}
    <rect x={840} y={630} width={400} height={14} fill="#a87a46" />
    <Awning x={810} y={420} w={460} a="#c84a3a" b="#f6e6cc" />
    {/* супермаркет */}
    <rect x={1320} y={230} width={1100} height={STREET_Y - 230} fill="#d4dad6" stroke={OL} strokeWidth={6} />
    <Sign x={1420} y={270} w={600} text="FRESH MARKET" c="#2e6a9a" size={48} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={1360 + i * 230} y={430} width={200} height={300} fill="#bfdcea" stroke={OL} strokeWidth={5} />)}
    {[0, 1, 2, 3].map((i) => Array.from({ length: 3 }, (_, r) => <rect key={`${i}${r}`} x={1370 + i * 230} y={470 + r * 80} width={180} height={50} fill={["#e8b23a", "#d8443a", "#5a9a4a"][(i + r) % 3]} opacity={0.45 * stock} />))}
    <rect x={1560} y={560} width={150} height={STREET_Y - 560} fill="#9fc8de" stroke={OL} strokeWidth={5} />
    {/* тротуар и дорога */}
    <rect x={-20} y={STREET_Y} width={W * 2} height={70} fill="#d8ccb8" stroke={OL} strokeWidth={6} />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M ${i * 140} ${STREET_Y} L ${i * 140 - 20} ${STREET_Y + 70}`} stroke="rgba(90,60,30,0.2)" strokeWidth={3} />)}
    <rect x={-20} y={STREET_Y + 70} width={W * 2} height={H} fill="#7d7468" stroke={OL} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 260} y={STREET_Y + 160} width={130} height={12} fill="#f2e6c4" />)}
    {/* фонарь и дерево */}
    <rect x={760} y={420} width={14} height={STREET_Y - 420} fill="#4a4038" stroke={OL} strokeWidth={4} />
    <path d="M 767 420 Q 800 390 840 410" stroke="#4a4038" strokeWidth={10} fill="none" /><ellipse cx={842} cy={420} rx={22} ry={12} fill="#f6e2a8" stroke={OL} strokeWidth={4} />
  </g>
);
export const CafeTable: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${STREET_Y})`}>
    <path d="M -112 -140 L 112 -140 L 124 0 L -124 0 Z" fill="#f6efe2" stroke={OL} strokeWidth={5} />
    <path d="M -112 -140 L -124 0 M -40 -140 L -46 0 M 40 -140 L 46 0" stroke="#d8cdb8" strokeWidth={4} />
    <ellipse cx={0} cy={-152} rx={110} ry={16} fill="#f2e8d4" stroke={OL} strokeWidth={5} />
    <rect x={-110} y={-152} width={220} height={20} fill="#f2e8d4" stroke={OL} strokeWidth={5} />
  </g>
);
export const Cup: React.FC<{ x: number; y: number; steam?: number }> = ({ x, y, steam = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -14 -26 L 14 -26 L 11 0 L -11 0 Z" fill="#f6efe2" stroke={OL} strokeWidth={4} /><path d="M 13 -20 q 12 2 6 14" stroke={OL} strokeWidth={4} fill="none" />
    {[0, 1].map((i) => <path key={i} d={`M ${-4 + i * 8} -32 q ${-6 + Math.sin(steam / 6 + i) * 4} -12 0 -24 q 6 -10 0 -20`} stroke="rgba(255,255,255,0.8)" strokeWidth={4} fill="none" strokeLinecap="round" />)}
  </g>
);
/** грузовик у тротуара (вид сбоку), back — открыт кузов */
export const Truck: React.FC<{ x: number; y?: number; boxes?: number; flip?: boolean }> = ({ x, y = STREET_Y + 120, boxes = 6, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-300} y={-330} width={460} height={290} rx={10} fill="#f2eee4" stroke={OL} strokeWidth={6} />
    <text x={-70} y={-170} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={40} fill="#3a6a4a">FOOD CO.</text>
    <rect x={-300} y={-330} width={60} height={290} fill="#3a3028" stroke={OL} strokeWidth={5} />
    {Array.from({ length: boxes }, (_, i) => <rect key={i} x={-292 + (i % 2) * 24} y={-90 - Math.floor(i / 2) * 54} width={44} height={50} fill="#c89a5a" stroke={OL} strokeWidth={3} />)}
    <path d="M 160 -230 L 280 -230 Q 330 -230 340 -170 L 350 -40 L 160 -40 Z" fill="#e0703a" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 190 -210 L 280 -210 Q 315 -205 322 -160 L 190 -160 Z" fill="#bfe0f0" stroke={OL} strokeWidth={4} />
    <rect x={-310} y={-46} width={670} height={20} fill="#4a4038" stroke={OL} strokeWidth={4} />
    {[-200, 60, 260].map((wx) => <g key={wx}><circle cx={wx} cy={-20} r={44} fill="#2e2a2a" stroke={OL} strokeWidth={6} /><circle cx={wx} cy={-20} r={16} fill="#a8a29a" /></g>)}
  </g>
);

// ================= СУПЕРМАРКЕТ: проход (one-point) =================
const MP = persp([960, 470], 900, 1.6);
export const aisleFloorY = (Z: number) => MP(0, 0, Z)[1];
export const aisleX = (X: number, Z: number) => MP(X, 0, Z)[0];
const PROD = ["#d8443a", "#e8b23a", "#5a9a4a", "#3a7ad8", "#e07a3a", "#f2e6cc", "#a85aa8", "#c89a5a"];
/** fill 0..1 — заполненность полок (детерминированно «съедаются» товары), sale — таблички */
export const Aisle: React.FC<{ fill?: number; signs?: boolean; lightsDim?: number }> = ({ fill = 1, signs = true, lightsDim = 0 }) => {
  const SX = 1.6, ZN = 1.2, ZF = 34, levels = [0.15, 0.6, 1.05, 1.5, 1.95];
  const q = MP;
  const items: React.ReactNode[] = [];
  for (const s of [-1, 1]) for (let li = 0; li < levels.length; li++) {
    const y = levels[li];
    for (let z = ZN + 0.2, k = 0; z < ZF; z += 0.32, k++) {
      const id = s * 1000 + li * 100 + k;
      if (rnd(id) > fill) continue;
      const X = s * SX, d = 0.35, hgt = 0.26 + rnd(id + 3) * 0.12;
      const a = q(X, y + hgt, z), b = q(X, y + hgt, z + 0.26), c = q(X, y, z + 0.26), dd = q(X, y, z);
      const inner = q(X - s * d, y + hgt, z);
      items.push(<polygon key={id} points={poly([a, b, c, dd])} fill={PROD[Math.floor(rnd(id + 7) * PROD.length)]} stroke={OL} strokeWidth={Math.max(1, 3 / z * 2)} />);
      if (z < 4) items.push(<polygon key={id + "t"} points={poly([a, b, q(X - s * d, y + hgt, z + 0.26), inner])} fill="rgba(255,255,255,0.25)" />);
    }
  }
  return (
    <g>
      <rect width={W} height={H} fill="#efe2c4" />
      <polygon points={poly([q(-6, 4, ZN), q(6, 4, ZN), q(6, 4, ZF), q(-6, 4, ZF)])} fill="#f6ecd4" />
      <polygon points={poly([q(-6, 0, ZN), q(6, 0, ZN), q(6, 0, ZF), q(-6, 0, ZF)])} fill="#e2d2b0" />
      {[2, 3, 4.5, 6.5, 9.5, 14].map((z) => <polyline key={z} points={poly([q(-6, 0, z), q(6, 0, z)])} stroke="rgba(110,80,40,0.15)" strokeWidth={2} fill="none" />)}
      {[3, 6, 10, 16].map((z) => <g key={z} opacity={1 - lightsDim * (z % 2 ? 0.9 : 0.4)}><polygon points={poly([q(-0.8, 4, z), q(0.8, 4, z), q(0.8, 4, z + 0.5), q(-0.8, 4, z + 0.5)])} fill="#fffbe8" /><ellipse cx={q(0, 0, z + 0.25)[0]} cy={q(0, 0, z + 0.25)[1]} rx={1200 / z} ry={300 / z} fill="rgba(255,250,220,0.35)" /></g>)}
      {/* стеллажи: торцы и задние стенки */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <polygon points={poly([q(s * (SX + 0.4), 2.4, ZN), q(s * (SX + 0.4), 2.4, ZF), q(s * (SX + 0.4), 0, ZF), q(s * (SX + 0.4), 0, ZN)])} fill="#d0b88e" />
          {levels.map((y) => <polygon key={y} points={poly([q(s * SX, y, ZN), q(s * SX, y, ZF), q(s * (SX + 0.4), y, ZF), q(s * (SX + 0.4), y, ZN)])} fill="#b8a07a" stroke={OL} strokeWidth={2} />)}
          {levels.map((y) => <polyline key={"e" + y} points={poly([q(s * SX, y, ZN), q(s * SX, y, ZF)])} stroke="#8a6e4a" strokeWidth={5} fill="none" />)}
        </g>
      ))}
      {items}
      {signs ? [-1, 1].map((s) => [3, 7].map((z) => <g key={`${s}${z}`}><polygon points={poly([q(s * SX, 3.0, z), q(s * SX, 3.0, z + 0.8), q(s * SX, 2.6, z + 0.8), q(s * SX, 2.6, z)])} fill="#d8443a" stroke={OL} strokeWidth={3} /></g>)) : null}
      <defs><radialGradient id="aisleFar" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(250,240,215,1)" /><stop offset="100%" stopColor="rgba(250,240,215,0)" /></radialGradient></defs>
      <ellipse cx={q(0, 1.6, ZF)[0]} cy={q(0, 1.6, ZF)[1]} rx={220} ry={160} fill="url(#aisleFar)" />
    </g>
  );
};
export const Cart: React.FC<{ x: number; y: number; s?: number; items?: number }> = ({ x, y, s = 1, items = 3 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 -200 L 120 -200 L 100 -70 L -90 -70 Z" fill="rgba(200,215,225,0.35)" stroke="#6a7480" strokeWidth={8} strokeLinejoin="round" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-100 + i * 40} -200 L ${-85 + i * 36} -70`} stroke="#6a7480" strokeWidth={4} />)}
    {Array.from({ length: items }, (_, i) => <rect key={"i" + i} x={-80 + i * 55} y={-250 + (i % 2) * 20} width={48} height={70} rx={4} fill={PROD[i % PROD.length]} stroke={OL} strokeWidth={4} />)}
    <path d="M 120 -200 L 160 -240" stroke="#6a7480" strokeWidth={10} strokeLinecap="round" />
    <path d="M -90 -70 L -90 -20 M 100 -70 L 100 -20 M -100 -20 L 110 -20" stroke="#6a7480" strokeWidth={8} />
    {[-80, 95].map((wx) => <circle key={wx} cx={wx} cy={-6} r={16} fill="#3a3a40" stroke={OL} strokeWidth={4} />)}
  </g>
);
export const Product: React.FC<{ x: number; y: number; c?: string; rot?: number }> = ({ x, y, c = "#e8b23a", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-22} y={-34} width={44} height={60} rx={4} fill={c} stroke={OL} strokeWidth={4} /><rect x={-22} y={-12} width={44} height={16} fill="#f6efe2" /></g>
);

// ================= ОКЕАН И СУДА =================
export const Ocean: React.FC<{ t: number; ships?: number }> = ({ t, ships = 1 }) => (
  <g>
    <defs>
      <linearGradient id="skyO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8b884" /><stop offset="100%" stopColor="#fbe0b0" /></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7a9aa0" /><stop offset="100%" stopColor="#3e6470" /></linearGradient>
    </defs>
    <rect x={-W * 2} width={W * 5} height={H * 2} y={-H / 2} fill="url(#skyO)" />
    <circle cx={1500} cy={360} r={90} fill="#fff0c8" opacity={0.9} />
    <rect x={-W * 2} y={520} width={W * 5} height={H * 1.5} fill="url(#sea)" />
    {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${((i * 211) % 3800) - 900 + Math.sin(t / 30 + i) * 6} ${540 + (i % 10) * 50} q 30 -8 60 0`} stroke="rgba(255,240,210,0.35)" strokeWidth={4} fill="none" />)}
    {Array.from({ length: ships - 1 }, (_, i) => <g key={i} transform={`translate(${-600 + i * 520 + (i % 2) * 160} ${528 + (i % 3) * 6}) scale(${0.18 + (i % 3) * 0.04})`}><ShipShape /></g>)}
  </g>
);
export const ShipShape: React.FC = () => (
  <g>
    <path d="M -700 -40 L 760 -40 L 680 120 L -640 120 Z" fill="#9a3a2e" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-700} y={-60} width={1460} height={30} fill="#3a3a44" stroke={OL} strokeWidth={6} />
    {Array.from({ length: 22 }, (_, i) => Array.from({ length: 3 }, (_, r) => <rect key={`${i}${r}`} x={-560 + i * 54} y={-120 - r * 56} width={52} height={54} fill={PROD[(i * 3 + r * 5) % 6]} stroke={OL} strokeWidth={4} />))}
    <rect x={-660} y={-300} width={120} height={240} fill="#f2ead6" stroke={OL} strokeWidth={6} />
    {[0, 1, 2].map((r) => <rect key={r} x={-645} y={-280 + r * 60} width={90} height={26} fill="#a8c8d8" stroke={OL} strokeWidth={3} />)}
    <rect x={-640} y={-360} width={30} height={60} fill="#3a3a44" stroke={OL} strokeWidth={4} />
  </g>
);

// ================= ПОРТ =================
export const Port: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill="#f2d8a8" />
    <rect x={0} y={560} width={W} height={120} fill="#5e8088" />
    <g transform="translate(300 590) scale(0.42)"><ShipShape /></g>
    {/* портальные краны (стоят) */}
    {[260, 820].map((x, i) => (
      <g key={x} stroke={OL} strokeWidth={6} fill="#e0703a">
        <rect x={x} y={170} width={22} height={560} /><rect x={x + 200} y={170} width={22} height={560} />
        <rect x={x - 120} y={150} width={520} height={34} /><rect x={x + 60} y={184} width={70} height={40} fill="#f2ead6" />
        <path d={`M ${x + 95} 224 L ${x + 95} ${330 + i * 40}`} strokeWidth={4} />
        <rect x={x + 60} y={330 + i * 40} width={70} height={50} fill={PROD[i + 1]} />
      </g>
    ))}
    {/* штабели контейнеров */}
    {Array.from({ length: 4 }, (_, c) => Array.from({ length: 3 }, (_, r) => <rect key={`${c}${r}`} x={1180 + c * 170} y={560 - r * 80} width={160} height={78} fill={PROD[(c + r * 2) % 7]} stroke={OL} strokeWidth={5} />))}
    <rect x={0} y={730} width={W} height={H} fill="#a8a094" stroke={OL} strokeWidth={6} />
    {/* шлагбаум закрыт */}
    <rect x={1260} y={640} width={16} height={100} fill="#4a4038" stroke={OL} strokeWidth={4} />
    <rect x={1270} y={650} width={420} height={20} fill="#f2ead6" stroke={OL} strokeWidth={4} />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={1290 + i * 80} y={650} width={40} height={20} fill="#d8443a" />)}
    <circle cx={1268} cy={630} r={14} fill={Math.floor(t / 15) % 2 ? "#ff5a3a" : "#7a2a1a"} stroke={OL} strokeWidth={4} />
  </g>
);

// ================= ДИСПЕТЧЕРСКАЯ =================
export const ControlRoom: React.FC<{ red: number; t: number }> = ({ red, t }) => (
  <g>
    <rect width={W} height={H} fill="#d8c09a" />
    <rect x={160} y={110} width={1600} height={560} rx={10} fill="#3a2e26" stroke={OL} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => {
      const x = 190 + (i % 4) * 390, y = 140 + Math.floor(i / 4) * 175, bad = i / 12 < red;
      return (
        <g key={i}>
          <rect x={x} y={y} width={370} height={160} rx={6} fill={bad ? (Math.floor(t / 8 + i) % 2 ? "#b8302a" : "#8a2420") : "#2a5a5a"} stroke={OL} strokeWidth={5} />
          {bad ? <text x={x + 185} y={y + 95} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={40} fill="#ffe0d0">OFFLINE</text>
            : <g>{[0, 1, 2].map((r) => <rect key={r} x={x + 20} y={y + 24 + r * 40} width={200 - r * 40 + Math.sin(t / 7 + i + r) * 30} height={18} fill="#7ae0c8" opacity={0.8} />)}<circle cx={x + 300} cy={y + 80} r={40} fill="none" stroke="#7ae0c8" strokeWidth={6} /></g>}
        </g>
      );
    })}
    <rect x={0} y={760} width={W} height={H} fill="#a8865a" stroke={OL} strokeWidth={6} />
    <rect x={260} y={700} width={1400} height={70} fill="#6a5240" stroke={OL} strokeWidth={6} />
    {[500, 1000, 1400].map((x) => <g key={x}><rect x={x} y={640} width={150} height={60} rx={6} fill="#2a2a30" stroke={OL} strokeWidth={4} /><rect x={x + 10} y={648} width={130} height={44} fill={red > 0.5 ? "#b8302a" : "#2a5a5a"} /></g>)}
  </g>
);

// ================= ЭКРАН ТЕЛЕФОНА =================
export const PhoneScreen: React.FC<{ t: number }> = ({ t }) => {
  const dots = [[0.22, 0.38], [0.48, 0.3], [0.52, 0.55], [0.7, 0.42], [0.8, 0.62], [0.3, 0.62], [0.62, 0.25], [0.86, 0.35], [0.4, 0.45]];
  return (
    <g>
      <rect x={-260} y={-500} width={520} height={1000} rx={60} fill="#1e1e24" stroke={OL} strokeWidth={10} />
      <rect x={-232} y={-470} width={464} height={940} rx={40} fill="#f6efe2" />
      <rect x={-232} y={-470} width={464} height={130} fill="#c0302a" />
      <text x={0} y={-390} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={54} fill="#ffffff" letterSpacing={4}>BREAKING</text>
      <text x={-200} y={-280} fontFamily="sans-serif" fontWeight={900} fontSize={44} fill="#2a1e16">FOOD SHIPMENTS</text>
      <text x={-200} y={-228} fontFamily="sans-serif" fontWeight={900} fontSize={44} fill="#2a1e16">DISRUPTED</text>
      <text x={-200} y={-176} fontFamily="sans-serif" fontWeight={900} fontSize={44} fill="#c0302a">WORLDWIDE</text>
      <rect x={-200} y={-130} width={400} height={260} rx={14} fill="#cfe2e8" stroke={OL} strokeWidth={4} />
      {[[-170, -90, 120, 70], [-30, -110, 90, 110], [80, -80, 100, 80], [-120, 10, 70, 90], [40, 30, 120, 70]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={30} fill="#d8c08a" />)}
      {dots.map(([u, v], i) => { const k = Math.max(0, Math.min(1, (t - 20 - i * 9) / 8)); return k > 0 ? <g key={i}><circle cx={-200 + u * 400} cy={-130 + v * 260} r={12 * k} fill="#d8443a" stroke={OL} strokeWidth={3} /><circle cx={-200 + u * 400} cy={-130 + v * 260} r={12 + ((t - i * 9) % 30)} fill="none" stroke="#d8443a" strokeWidth={3} opacity={0.5} /></g> : null; })}
      {[0, 1, 2].map((i) => <rect key={i} x={-200} y={170 + i * 46} width={400 - i * 90} height={20} rx={8} fill="#d8cdb8" />)}
    </g>
  );
};
