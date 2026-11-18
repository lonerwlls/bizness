// Предметы-«наклейки» для крипто-роликов: всё нарисовано в SVG, с белой обводкой и мягкой тенью, как котик.
import React, { useId } from "react";

export const INK = "#4a2a14";
export const FONT = "KMont", BIG = "KAnton";

// Обёртка: svg с фильтром «наклейка» (белая кайма + тень).
export const Sticker: React.FC<{ vb: string; children: React.ReactNode; edge?: number; style?: React.CSSProperties }> = ({ vb, children, edge = 9, style }) => {
  const id = "s" + useId().replace(/[^a-z0-9]/gi, "");
  return (
    <svg viewBox={vb} width="100%" height="100%" style={{ overflow: "visible", ...style }}>
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={edge} result="d" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="d" operator="in" result="w" />
          <feGaussianBlur in="d" stdDeviation={edge} result="b" />
          <feOffset in="b" dy={edge * 0.9} result="bo" />
          <feFlood floodColor="#000" floodOpacity="0.16" />
          <feComposite in2="bo" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="w" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ffe68a" />
          <stop offset="0.5" stopColor="#f5b820" />
          <stop offset="1" stopColor="#c27c0a" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id})`} stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <GoldCtx.Provider value={`url(#${id}g)`}>{children}</GoldCtx.Provider>
      </g>
    </svg>
  );
};
const GoldCtx = React.createContext("#f5b820");
const useGold = () => React.useContext(GoldCtx);

// Монета биткоина (центр 0,0, радиус 100). face — грустная мордочка.
export const CoinArt: React.FC<{ face?: "sad" | "happy" }> = ({ face }) => {
  const g = useGold();
  return (
    <g>
      <circle r={100} fill="#b8740a" />
      <circle r={92} cy={-4} fill={g} />
      <circle r={72} cy={-4} fill="none" stroke="#c88a12" strokeWidth={5} />
      {!face && <text y={34} textAnchor="middle" fontSize={104} fontWeight={900} fill="#9a5d04" stroke="none" fontFamily="Arial, sans-serif">₿</text>}
      {face && (
        <>
          <circle cx={-28} cy={-14} r={11} fill={INK} stroke="none" />
          <circle cx={28} cy={-14} r={11} fill={INK} stroke="none" />
          <circle cx={-24} cy={-18} r={4} fill="#fff" stroke="none" />
          <circle cx={32} cy={-18} r={4} fill="#fff" stroke="none" />
          {face === "sad" ? <path d="M-22,34 Q0,18 22,34" fill="none" strokeWidth={6} /> : <path d="M-22,22 Q0,42 22,22" fill="none" strokeWidth={6} />}
          {face === "sad" && <path d="M-46,-40 L-14,-32 M46,-40 L14,-32" strokeWidth={6} />}
        </>
      )}
      <path d="M-60,-62 A86,86 0 0 1 10,-88" stroke="#fff" strokeOpacity={0.6} strokeWidth={9} fill="none" />
    </g>
  );
};
export const Coin: React.FC<{ face?: "sad" | "happy" }> = ({ face }) => (
  <Sticker vb="-110 -110 220 220" edge={6}><CoinArt face={face} /></Sticker>
);

// Коробка пиццы (вид спереди-сверху), поле 0 0 300 130.
export const BoxArt: React.FC<{ y?: number }> = ({ y = 0 }) => (
  <g transform={`translate(0 ${y})`}>
    <path d="M10,40 L290,40 L290,120 L10,120 Z" fill="#d49a55" />
    <path d="M10,40 L50,6 L250,6 L290,40 Z" fill="#ecc68e" />
    <path d="M30,62 L270,62" stroke="#b97f3e" strokeWidth={3} />
    <ellipse cx={150} cy={23} rx={42} ry={12} fill="#e2463a" strokeWidth={3} />
    <text x={150} y={29} textAnchor="middle" fontSize={17} fontWeight={900} fill="#fff" stroke="none" fontFamily={FONT}>PIZZA</text>
    <path d="M60,92 L240,92" stroke="#b97f3e" strokeWidth={3} strokeDasharray="10 10" />
  </g>
);
export const Boxes: React.FC<{ n?: number }> = ({ n = 2 }) => (
  <Sticker vb={`0 ${-(n - 1) * 84} 300 ${130 + (n - 1) * 84}`}>
    {Array.from({ length: n }, (_, i) => <BoxArt key={i} y={-(n - 1 - i) * 84} />)}
  </Sticker>
);

// Пицца целиком, вид сверху (центр 0,0, радиус 100).
const PEP: [number, number][] = [[-40, -30], [30, -45], [45, 20], [-20, 40], [-55, 15], [5, -5], [10, 60], [-5, -65], [60, -15]];
export const PizzaArt: React.FC = () => (
  <g>
    <circle r={100} fill="#e3a14a" />
    <circle r={84} fill="#ffd45e" strokeWidth={3} />
    {PEP.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="#d8452f" strokeWidth={3} />)}
    {[[-30, 5], [25, -15], [35, 50], [-50, -45]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill="#4f9a3c" stroke="none" transform={`rotate(${i * 50} ${x} ${y})`} />)}
  </g>
);
export const Pizza: React.FC = () => <Sticker vb="-110 -110 220 220" edge={7}><PizzaArt /></Sticker>;
export const Slice: React.FC = () => (
  <Sticker vb="-10 -10 200 230" edge={7}>
    <path d="M90,210 L10,30 C60,0 120,0 170,30 Z" fill="#ffd45e" />
    <path d="M10,30 C60,0 120,0 170,30 L162,46 C115,20 65,20 18,46 Z" fill="#e3a14a" />
    {[[70, 70], [115, 80], [90, 130], [60, 105]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={13} fill="#d8452f" strokeWidth={3} />)}
    <path d="M70,160 C70,190 76,200 82,200 C88,200 84,180 80,160" fill="#ffe27a" strokeWidth={3} />
  </Sticker>
);

// Ноутбук с экраном; содержимое экрана — children (поле экрана 40..360 × 20..220).
export const Laptop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Sticker vb="0 0 400 290">
    <rect x={30} y={10} width={340} height={222} rx={14} fill="#55585f" />
    <rect x={44} y={22} width={312} height={196} rx={4} fill="#eef3ff" strokeWidth={3} />
    {children}
    <path d="M0,240 L400,240 L384,276 L16,276 Z" fill="#9aa0aa" />
    <rect x={160} y={240} width={80} height={10} rx={4} fill="#7c828c" strokeWidth={3} />
  </Sticker>
);

// Окно форума с печатающимся сообщением. p = 0..1 — сколько напечатано.
export const Forum: React.FC<{ p: number; lines: string[]; cursor: boolean }> = ({ p, lines, cursor }) => {
  const total = lines.join("").length;
  let left = Math.floor(total * p);
  return (
    <Sticker vb="0 0 800 560">
      <rect x={0} y={0} width={800} height={560} rx={26} fill="#ffffff" />
      <path d="M0,26 Q0,0 26,0 L774,0 Q800,0 800,26 L800,74 L0,74 Z" fill="#3d5a99" />
      {[40, 80, 120].map((x, i) => <circle key={x} cx={x} cy={37} r={12} fill={["#ff6b5e", "#ffc93c", "#5fd068"][i]} strokeWidth={3} />)}
      <text x={420} y={50} textAnchor="middle" fontSize={34} fontWeight={800} fill="#fff" stroke="none" fontFamily={FONT}>ФОРУМ · 2010</text>
      <circle cx={80} cy={150} r={44} fill="#f0a35a" strokeWidth={4} />
      <path d="M50,128 l6,-30 l18,20 M110,128 l-6,-30 l-18,20" fill="#f0a35a" strokeWidth={4} />
      <circle cx={66} cy={148} r={6} fill={INK} stroke="none" />
      <circle cx={94} cy={148} r={6} fill={INK} stroke="none" />
      <text x={150} y={142} fontSize={34} fontWeight={800} fill="#3d5a99" stroke="none" fontFamily={FONT}>Ласло</text>
      <text x={150} y={182} fontSize={24} fontWeight={600} fill="#8a93a6" stroke="none" fontFamily={FONT}>18 мая 2010</text>
      <path d="M40,220 L760,220" stroke="#dde3ee" strokeWidth={4} />
      {lines.map((l, i) => {
        const s = l.slice(0, Math.max(0, left));
        left -= l.length;
        const last = left < 0 || i === lines.length - 1;
        return (
          <text key={i} x={50} y={300 + i * 78} fontSize={50} fontWeight={800} fill="#1e2433" stroke="none" fontFamily={FONT}>
            {s}
            {cursor && last && left + l.length >= 0 && left + l.length <= l.length ? "|" : ""}
          </text>
        );
      })}
    </Sticker>
  );
};

// Лист календаря.
export const Calendar: React.FC<{ month: string; big: string; circle?: number }> = ({ month, big, circle = 0 }) => (
  <Sticker vb="0 0 320 360">
    <rect x={0} y={20} width={320} height={340} rx={24} fill="#fff" />
    <path d="M0,44 Q0,20 24,20 L296,20 Q320,20 320,44 L320,110 L0,110 Z" fill="#e2463a" />
    {[70, 250].map((x) => <rect key={x} x={x - 9} y={0} width={18} height={46} rx={9} fill="#6b6f78" strokeWidth={3} />)}
    <text x={160} y={88} textAnchor="middle" fontSize={50} fontWeight={900} fill="#fff" stroke="none" fontFamily={FONT}>{month}</text>
    <text x={160} y={290} textAnchor="middle" fontSize={big.length > 2 ? 128 : 170} fill="#1e2433" stroke="none" fontFamily={BIG}>{big}</text>
    {circle > 0 && <ellipse cx={160} cy={232} rx={110} ry={96} fill="none" stroke="#e2463a" strokeWidth={10} strokeDasharray={`${660 * circle} 700`} transform="rotate(-100 160 232)" />}
  </Sticker>
);

// Ценник с ниткой.
export const Tag: React.FC<{ text: string; color?: string }> = ({ text, color = "#ffde4a" }) => {
  const w = 120 + text.length * 50;
  return (
    <Sticker vb={`-10 -10 ${w + 30} 200`}>
      <path d={`M0,90 L60,10 L${w},10 Q${w + 10},10 ${w + 10},20 L${w + 10},160 Q${w + 10},170 ${w},170 L60,170 Z`} fill={color} />
      <circle cx={52} cy={90} r={14} fill="#fff" />
      <text x={(w + 70) / 2} y={124} textAnchor="middle" fontSize={92} fill="#1e2433" stroke="none" fontFamily={BIG}>{text}</text>
    </Sticker>
  );
};

// Перекати-поле.
export const Tumbleweed: React.FC = () => (
  <Sticker vb="-110 -110 220 220" edge={5}>
    <circle r={92} fill="#e0b979" opacity={0.95} />
    {Array.from({ length: 9 }, (_, i) => (
      <ellipse key={i} rx={88} ry={30 + (i % 3) * 14} fill="none" stroke="#8a5a22" strokeWidth={5} transform={`rotate(${i * 21})`} />
    ))}
  </Sticker>
);

// Музейная тумба.
export const Pedestal: React.FC = () => (
  <Sticker vb="0 0 300 380">
    <rect x={10} y={0} width={280} height={44} rx={8} fill="#f4f1ea" />
    <rect x={40} y={44} width={220} height={290} fill="#ebe6dc" />
    {[80, 130, 170, 220].map((x) => <path key={x} d={`M${x},60 L${x},320`} stroke="#cfc8b8" strokeWidth={6} />)}
    <rect x={0} y={334} width={300} height={44} rx={8} fill="#f4f1ea" />
    <rect x={95} y={160} width={110} height={60} rx={6} fill={"#d7a73b"} />
    <text x={150} y={202} textAnchor="middle" fontSize={34} fill="#5a3a06" stroke="none" fontFamily={BIG}>2010</text>
  </Sticker>
);

// Ракета-монета: монета с огненным хвостом (летит вверх).
export const RocketCoin: React.FC<{ t: number }> = ({ t }) => (
  <Sticker vb="-120 -120 240 460" edge={6}>
    <path d={`M-60,60 Q0,${300 + Math.sin(t / 2) * 30} 60,60 Z`} fill="#ff8a1c" />
    <path d={`M-34,70 Q0,${220 + Math.cos(t / 2) * 24} 34,70 Z`} fill="#ffe14d" strokeWidth={3} />
    <CoinArt />
  </Sticker>
);

// Растущий график; p = 0..1.
const CH: [number, number][] = [[0, 520], [80, 500], [160, 510], [240, 430], [320, 460], [400, 330], [480, 360], [560, 200], [640, 240], [720, 60]];
export const Chart: React.FC<{ p: number }> = ({ p }) => {
  const d = CH.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <Sticker vb="-40 -40 820 620" edge={6}>
      <rect x={-30} y={-30} width={800} height={600} rx={30} fill="#f6f9ff" />
      {[100, 220, 340, 460].map((y) => <path key={y} d={`M0,${y} L740,${y}`} stroke="#dbe3f1" strokeWidth={3} />)}
      <path d={d} fill="none" stroke="#21b35c" strokeWidth={16} strokeDasharray={`${1500 * p} 2000`} />
    </Sticker>
  );
};

// Пачки долларов.
export const Money: React.FC = () => (
  <Sticker vb="0 0 300 160" edge={6}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${100 - i * 40})`}>
        <path d="M10,10 L290,10 L290,56 L10,56 Z" fill="#7fcf7a" />
        <path d="M10,10 L290,10 L280,0 L20,0 Z" fill="#a8e3a1" strokeWidth={3} />
        <rect x={130} y={10} width={40} height={46} fill="#f1e7c4" strokeWidth={3} />
        <text x={60} y={44} fontSize={30} fill="#2f7a2a" stroke="none" fontFamily={BIG}>$</text>
        <text x={225} y={44} fontSize={30} fill="#2f7a2a" stroke="none" fontFamily={BIG}>$</text>
      </g>
    ))}
  </Sticker>
);

// Микрофон в руке репортёра (рука выходит справа).
export const Mic: React.FC = () => (
  <Sticker vb="0 0 420 180">
    <path d="M150,70 L420,52 L420,128 L150,110 Z" fill="#3a3d45" />
    <rect x={90} y={64} width={80} height={52} rx={8} fill="#c8333a" />
    <text x={130} y={100} textAnchor="middle" fontSize={26} fontWeight={900} fill="#fff" stroke="none" fontFamily={FONT}>TV</text>
    <circle cx={60} cy={90} r={52} fill="#8a8f99" />
    {[-30, -10, 10, 30].map((d) => <path key={d} d={`M${60 + d},42 L${60 + d},138`} stroke="#6b707a" strokeWidth={3} />)}
    <circle cx={44} cy={70} r={12} fill="#fff" opacity={0.5} stroke="none" />
  </Sticker>
);

// Облачко с репликой. tail: "left" | "right" | "down".
export const Bubble: React.FC<{ text: string; tail?: "left" | "right" | "down"; size?: number }> = ({ text, tail = "down", size = 86 }) => {
  const w = Math.max(260, text.length * size * 0.62 + 120);
  const tl = tail === "down" ? `M${w / 2 - 30},170 L${w / 2 - 50},240 L${w / 2 + 30},170` : tail === "left" ? `M60,150 L-10,230 L130,168` : `M${w - 60},150 L${w + 10},230 L${w - 130},168`;
  return (
    <Sticker vb={`-20 -10 ${w + 40} 260`}>
      <path d={tl} fill="#fff" />
      <rect x={0} y={0} width={w} height={180} rx={90} fill="#fff" />
      <path d={tl} fill="#fff" stroke="none" transform="translate(0 -6)" />
      <text x={w / 2} y={90 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={900} fill="#1e2433" stroke="none" fontFamily={FONT}>{text}</text>
    </Sticker>
  );
};

// Блёстки-звёздочки.
export const Sparkle: React.FC<{ color?: string }> = ({ color = "#ffd23c" }) => (
  <Sticker vb="-60 -60 120 120" edge={4}>
    <path d="M0,-52 C6,-12 12,-6 52,0 C12,6 6,12 0,52 C-6,12 -12,6 -52,0 C-12,-6 -6,-12 0,-52 Z" fill={color} strokeWidth={3} />
  </Sticker>
);

// Стол (для сцены с ноутбуком).
export const Desk: React.FC = () => (
  <Sticker vb="0 0 900 260" edge={7}>
    <rect x={0} y={0} width={900} height={50} rx={12} fill="#b9773d" />
    <rect x={60} y={50} width={44} height={210} fill="#9a5f2c" />
    <rect x={796} y={50} width={44} height={210} fill="#9a5f2c" />
  </Sticker>
);
