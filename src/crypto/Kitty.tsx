// Котик — герой крипто-канала. Плоская «наклейка»: белая обводка вокруг силуэта и мягкая тень.
// <Kitty hat="top" mood="calm" t={frame} />, рисуется в поле 400×600 (центр x=200, ноги на y≈570).
import React from "react";

export type Hat = "top" | "beanie" | "cap" | "none";
export type Mood = "calm" | "happy" | "sad" | "shock";

const COATS = {
  ginger: ["#f0a35a", "#d9803a", "#f8c58c"],
  gray: ["#a9b0bd", "#7d8596", "#d3d8e0"],
} as const;
const CREAM = "#fff3e2", INK = "#4a2a14", PINK = "#f59aa6";

export const Kitty: React.FC<{ hat?: Hat; mood?: Mood; t?: number; id?: string; coat?: keyof typeof COATS; noShadow?: boolean }> = ({ hat = "top", mood = "calm", t = 0, id = "k", coat = "ginger" }) => {
  const [FUR, FUR_D, FUR_L] = COATS[coat];
  // моргание раз в ~3,3 с и лёгкое дыхание
  const bl = t % 100;
  const blink = bl > 94 ? Math.abs(97 - bl) / 3 : 1;
  const br = 1 + Math.sin(t / 9) * 0.012;
  const eyeRy = mood === "happy" ? 0 : 36 * blink;
  return (
    <svg viewBox="0 0 400 600" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <filter id={`${id}-st`} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="d" operator="in" result="w" />
          <feGaussianBlur in="d" stdDeviation="9" result="b" />
          <feOffset in="b" dy="8" result="bo" />
          <feFlood floodColor="#000" floodOpacity="0.18" />
          <feComposite in2="bo" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="w" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-fur`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor={FUR_L} />
          <stop offset="0.55" stopColor={FUR} />
          <stop offset="1" stopColor={FUR_D} />
        </radialGradient>
        <radialGradient id={`${id}-eye`} cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#6b4a22" />
          <stop offset="0.55" stopColor="#2a1a0c" />
          <stop offset="1" stopColor="#120a04" />
        </radialGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="0.5" stopColor="#f2b51e" />
          <stop offset="1" stopColor="#c47f0c" />
        </linearGradient>
      </defs>

      <g filter={`url(#${id}-st)`} stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        {/* хвост */}
        <path d="M268,505 C330,500 345,440 330,385 C324,362 344,350 352,372 C372,440 350,530 270,535 Z" fill={`url(#${id}-fur)`} />
        <path d="M338,392 l14,-4 M343,425 l15,0 M340,460 l15,5" stroke={FUR_D} strokeWidth={7} fill="none" />

        <g transform={`translate(200 565) scale(1 ${br}) translate(-200 -565)`}>
          {/* лапы-ступни */}
          <ellipse cx={160} cy={556} rx={34} ry={20} fill={CREAM} />
          <ellipse cx={240} cy={556} rx={34} ry={20} fill={CREAM} />
          {/* тело */}
          <path d="M200,300 C282,300 298,400 290,480 C283,540 252,562 200,562 C148,562 117,540 110,480 C102,400 118,300 200,300 Z" fill={`url(#${id}-fur)`} />
          <path d="M200,345 C240,345 252,420 248,480 C245,525 228,548 200,548 C172,548 155,525 152,480 C148,420 160,345 200,345 Z" fill={CREAM} stroke="none" />
          {/* полоски на боках */}
          <path d="M118,420 l22,6 M114,455 l24,2 M282,420 l-22,6 M286,455 l-24,2" stroke={FUR_D} strokeWidth={7} fill="none" />
          {/* передние лапки, сложены перед собой */}
          <path d="M150,340 C128,370 138,420 160,428 C178,434 186,420 180,400 C176,382 172,360 170,345 Z" fill={`url(#${id}-fur)`} />
          <path d="M250,340 C272,370 262,420 240,428 C222,434 214,420 220,400 C224,382 228,360 230,345 Z" fill={`url(#${id}-fur)`} />
          <path d="M150,418 C156,432 176,434 181,418" fill={CREAM} />
          <path d="M250,418 C244,432 224,434 219,418" fill={CREAM} />
        </g>

        {/* уши */}
        <path d="M92,175 C88,120 96,72 116,46 C140,64 166,96 178,128 Z" fill={`url(#${id}-fur)`} />
        <path d="M308,175 C312,120 304,72 284,46 C260,64 234,96 222,128 Z" fill={`url(#${id}-fur)`} />
        <path d="M110,150 C110,118 114,88 122,72 C138,88 150,108 158,130 Z" fill={PINK} stroke="none" />
        <path d="M290,150 C290,118 286,88 278,72 C262,88 250,108 242,130 Z" fill={PINK} stroke="none" />

        {/* голова */}
        <path d="M200,108 C290,108 330,160 328,222 C326,290 272,330 200,330 C128,330 74,290 72,222 C70,160 110,108 200,108 Z" fill={`url(#${id}-fur)`} />
        {/* полоски на лбу */}
        <path d="M200,116 l0,30 M178,118 l4,24 M222,118 l-4,24" stroke={FUR_D} strokeWidth={8} fill="none" />
        {/* мордочка */}
        <ellipse cx={178} cy={274} rx={36} ry={28} fill={CREAM} stroke="none" />
        <ellipse cx={222} cy={274} rx={36} ry={28} fill={CREAM} stroke="none" />
        <ellipse cx={200} cy={300} rx={26} ry={16} fill={CREAM} stroke="none" />
        {/* румянец */}
        <ellipse cx={116} cy={268} rx={20} ry={11} fill={PINK} opacity={0.45} stroke="none" />
        <ellipse cx={284} cy={268} rx={20} ry={11} fill={PINK} opacity={0.45} stroke="none" />

        {/* глаза */}
        {mood === "happy" ? (
          <>
            <path d="M120,226 Q148,196 176,226" fill="none" strokeWidth={7} />
            <path d="M224,226 Q252,196 280,226" fill="none" strokeWidth={7} />
          </>
        ) : (
          [148, 252].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={222} rx={mood === "shock" ? 24 : 31} ry={Math.max(2, mood === "shock" ? eyeRy * 0.75 : eyeRy)} fill={`url(#${id}-eye)`} />
              {blink > 0.5 && (
                <>
                  <circle cx={x + 10} cy={206} r={mood === "shock" ? 7 : 11} fill="#fff" stroke="none" />
                  <circle cx={x - 11} cy={236} r={5} fill="#fff" stroke="none" />
                </>
              )}
            </g>
          ))
        )}
        {mood === "sad" && (
          <>
            <path d="M118,186 L170,176 M282,186 L230,176" strokeWidth={6} fill="none" />
            <path d="M130,252 C126,270 124,286 132,296 C140,286 138,270 134,252 Z" fill="#8fd4ff" strokeWidth={3} />
          </>
        )}

        {/* нос и рот */}
        <path d="M188,258 C188,252 212,252 212,258 C212,264 204,270 200,272 C196,270 188,264 188,258 Z" fill={PINK} strokeWidth={3} />
        {mood === "shock" ? (
          <ellipse cx={200} cy={296} rx={10} ry={13} fill="#7a2a2a" strokeWidth={3} />
        ) : mood === "sad" ? (
          <path d="M184,298 Q200,284 216,298" fill="none" strokeWidth={4} />
        ) : (
          <path d="M200,272 L200,282 M200,282 Q190,294 180,286 M200,282 Q210,294 220,286" fill="none" strokeWidth={4} />
        )}
        {/* усы */}
        <path d="M150,282 L92,272 M150,292 L94,298 M250,282 L308,272 M250,292 L306,298" stroke={INK} strokeWidth={2.5} opacity={0.75} fill="none" />

        {/* шапка */}
        {hat === "top" && (
          <g transform="rotate(-9 200 120)">
            <ellipse cx={200} cy={124} rx={86} ry={17} fill="#22201f" />
            <path d="M146,124 L152,28 C175,20 225,20 248,28 L254,124 Z" fill="#2c2a29" />
            <path d="M152,28 C175,36 225,36 248,28 C225,20 175,20 152,28 Z" fill="#3c3937" />
            <path d="M149,92 L251,92 L253,118 L147,118 Z" fill={`url(#${id}-gold)`} strokeWidth={3.5} />
            <circle cx={214} cy={105} r={19} fill={`url(#${id}-gold)`} strokeWidth={3.5} />
            <text x={214} y={114} textAnchor="middle" fontSize={26} fontWeight={900} fill="#8a5206" stroke="none" fontFamily="Arial, sans-serif">₿</text>
            <path d="M162,40 L160,86" stroke="#fff" strokeOpacity={0.18} strokeWidth={8} />
          </g>
        )}
        {hat === "beanie" && (
          <g>
            <path d="M118,150 C112,70 160,40 200,40 C240,40 288,70 282,150 Z" fill="#2563c9" />
            <path d="M140,140 C140,90 160,60 168,52 M200,140 L200,44 M260,140 C260,90 240,60 232,52" stroke="#1b4ea6" strokeWidth={6} fill="none" />
            <path d="M110,130 C150,118 250,118 290,130 L292,162 C250,150 150,150 108,162 Z" fill="#1b4ea6" />
            <circle cx={200} cy={34} r={24} fill="#f5c84c" />
            <path d="M188,26 l6,6 M206,22 l-4,8 M196,44 l6,-6 M212,40 l-6,-4" stroke="#d99a1c" strokeWidth={3} />
            <circle cx={250} cy={143} r={14} fill={`url(#${id}-gold)`} strokeWidth={3} />
            <text x={250} y={150} textAnchor="middle" fontSize={19} fontWeight={900} fill="#8a5206" stroke="none" fontFamily="Arial, sans-serif">₿</text>
          </g>
        )}
        {hat === "cap" && (
          <g transform="rotate(6 200 120)">
            <path d="M120,140 C118,76 160,52 200,52 C240,52 282,76 280,140 Z" fill="#1d1d1f" />
            <path d="M262,128 C300,120 340,124 352,140 C330,150 290,148 262,142 Z" fill="#2d2d30" />
            <path d="M118,140 L282,140" strokeWidth={5} />
            <circle cx={200} cy={52} r={7} fill="#1d1d1f" />
            <circle cx={184} cy={100} r={22} fill={`url(#${id}-gold)`} strokeWidth={3.5} />
            <text x={184} y={110} textAnchor="middle" fontSize={28} fontWeight={900} fill="#8a5206" stroke="none" fontFamily="Arial, sans-serif">₿</text>
          </g>
        )}
      </g>
    </svg>
  );
};
