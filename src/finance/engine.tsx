// Движок финансовых шортсов «как зарабатывают гиганты».
// Тема = озвучка (voice.mp3 + тайминги слов) + список битов: на каком слове какой шаблон кадра.
// Картинка меняется на каждом бите с наездом камеры, вспышкой и звуком; субтитры по словам;
// посередине озвучки (ближайший конец предложения) пустой размытый слот под рекламу (AD_FRAMES, scripts/make.sh).
import { loadFont as loadEmoji } from "@remotion/google-fonts/NotoColorEmoji";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FLUENT } from "./fluent";
import { GentOverlay, Gentleman, Pose, autoPose } from "./Gent";

export const { fontFamily: FONT } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin", "cyrillic"] });
const { fontFamily: EMOJI } = loadEmoji();

export const FPS = 30;
export const LEAD = 4;
// Пауза под рекламную вставку посередине ролика (кадры). 0 = без рекламы.
// Чтобы вставлять рекламу: Math.round((7.2 / 1.3) * FPS) и ad.mp4, см. CLAUDE.md.
export const AD_FRAMES = 0;
export const YELLOW = "#FFC72C";
export const RED = "#FF3B30";
export const GREEN = "#3DDC84";

export type Word = { t: number; e: number; w: string; end: boolean; pause: boolean };
export type Voice = { dur: number; words: Word[] };
export type Sfx = "whoosh" | "whip" | "pop" | "boom" | "ding";
type Anim = "bob" | "spin" | "pulse" | "rise" | "wobble" | "shrink";

// Шаблоны кадров. В текстах \n = перенос, *слово* = жёлтым.
export type Spec =
  | { k: "emoji"; e: string; t?: string; c?: string; anim?: Anim; sub?: string }
  | { k: "big"; t: string; c?: string; sub?: string }
  | { k: "counter"; to: number; pre?: string; suf?: string; t?: string; c?: string }
  | { k: "crossed"; e: string; t?: string; gray?: boolean }
  | { k: "row"; es: string[]; t?: string; c?: string }
  | { k: "grid"; e: string; odd?: string; t?: string; c?: string }
  | { k: "bars"; title?: string; items: { v: number; txt: string; label: string; e: string; c?: string }[] }
  | { k: "rain"; e: string; t?: string; c?: string; main?: string }
  | { k: "check"; e: string; t: string; ok: boolean }
  | { k: "brand"; t: string; bg: string; fg: string; sub?: string }
  | { k: "chart"; up: boolean; t?: string }
  | { k: "vs"; a: [string, string]; b: [string, string] }
  | { k: "flow"; from: string; to: string; money?: string; t?: string }
  | { k: "quote"; t: string; e?: string }
  | { k: "price"; e: string; price: string; t?: string; c?: string }
  | { k: "subscribe" }
  // Мини-сценки в карточке-«иллюстрации»: магазин с покупателями, касса, конвейер, делёжка денег.
  | { k: "shop"; label: string; t?: string }
  | { k: "register"; t?: string }
  | { k: "conveyor"; es: string[]; to: string; t?: string }
  | { k: "split"; a: [string, string]; b: [string, string]; t?: string }
  // Выкрик: крупный Уильям в шоке орёт фразу t (на этом бите он не выглядывает из угла).
  | { k: "shout"; t: string };
type Theme = keyof typeof THEMES;
// g = эмоция Уильяма (иначе autoPose); photo = фото-фон из public/finance/photos/<photo>.jpg;
// theme = цвет фона (иначе по настроению кадра); st = 3D-стикер в углу (иначе подбирается сам, "" = без стикера).
// time = начало бита в секундах озвучки вместо слова at (для вставок вроде выкриков).
export type BeatDef = Spec & { at: string; n?: number; time?: number; sfx?: Sfx; g?: Pose; photo?: string; theme?: Theme; st?: string };
export type Topic = { id: string; voice: Voice; beats: BeatDef[]; music?: string };

// ---------- Примитивы ----------
export const pop = (f: number, from = 0) => spring({ frame: f - from, fps: FPS, config: { damping: 11, stiffness: 180 } });
export const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Эмодзи: объёмная 3D-картинка Microsoft Fluent (public/finance/fluent), если есть, иначе шрифт Noto.
const ekey = (c: string) => [...c.replace(/️/g, "")].map((x) => x.codePointAt(0)!.toString(16)).join("-");
export const E: React.FC<{ c: string; s: number; style?: React.CSSProperties }> = ({ c, s, style }) =>
  FLUENT.has(ekey(c)) ? (
    <Img src={staticFile(`finance/fluent/${ekey(c)}.png`)} style={{ width: s * 1.05, height: s * 1.05, objectFit: "contain", display: "inline-block", ...style }} />
  ) : (
    <span style={{ fontFamily: EMOJI, fontSize: s, lineHeight: 1, display: "inline-block", ...style }}>{c}</span>
  );

export const rich = (s: string) =>
  s.split(/(\*[^*]+\*)/).map((p, i) =>
    p.startsWith("*") ? (
      <span key={i} style={{ color: YELLOW }}>
        {p.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );

// Размер шрифта под самую длинную строку, чтобы текст влезал в ширину w (буква ≈ 0.88 em).
export const fit = (s: string, max: number, w = 960) => {
  const longest = Math.max(...s.replace(/\*/g, "").split("\n").map((l) => l.length));
  return Math.min(max, Math.floor(w / (longest * 0.88)));
};

const T: React.FC<{ s: string; size?: number; c?: string; w?: number; style?: React.CSSProperties }> = ({ s, size = 96, c = "#fff", w, style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: fit(s, size, w),
      color: c,
      textTransform: "uppercase",
      textAlign: "center",
      lineHeight: 1.02,
      letterSpacing: -1,
      whiteSpace: "pre-line",
      textShadow: "0 10px 40px rgba(0,0,0,.7)",
      ...style,
    }}
  >
    {rich(s)}
  </div>
);

const Col: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap }}>{children}</div>
);
const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);

const animStyle = (a: Anim | undefined, f: number): React.CSSProperties => {
  switch (a) {
    case "spin":
      return { transform: `rotate(${f * 3}deg)` };
    case "pulse":
      return { transform: `scale(${1 + Math.sin(f / 3) * 0.06})` };
    case "rise":
      return { transform: `translateY(${(1 - pop(f)) * 350}px)` };
    case "wobble":
      return { transform: `rotate(${Math.sin(f / 3) * 10}deg)` };
    case "shrink":
      return { transform: `scale(${1 - 0.45 * ramp(f, 0, 15)}) rotate(${-15 * ramp(f, 0, 15)}deg)` };
    default:
      return { transform: `translateY(${Math.sin(f / 5) * 14}px) rotate(${Math.sin(f / 7) * 5}deg)` };
  }
};

const Cross: React.FC<{ s: number; p: number }> = ({ s, p }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0 }}>
    <path d="M15 15 L85 85" stroke={RED} strokeWidth="12" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 2)} />
    <path d="M85 15 L15 85" stroke={RED} strokeWidth="12" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, p * 2 - 1))} />
  </svg>
);

const MoneyStream: React.FC<{ f: number; e: string; h?: number }> = ({ f, e, h = 360 }) => (
  <div style={{ position: "relative", width: 130, height: h }}>
    {Array.from({ length: 6 }, (_, i) => {
      const p = ((f + i * 7) % 40) / 40;
      return <E key={i} c={e} s={76} style={{ position: "absolute", left: 27, top: h - 80 - p * (h - 40), opacity: Math.sin(p * Math.PI) }} />;
    })}
  </div>
);

const Rain: React.FC<{ f: number; e: string }> = ({ f, e }) => (
  <AbsoluteFill style={{ top: -220, height: 1920, opacity: 0.55 }}>
    {Array.from({ length: 18 }, (_, i) => (
      <E
        key={i}
        c={i % 3 ? e : "💰"}
        s={70 + (i % 4) * 15}
        style={{ position: "absolute", left: (i * 157) % 1000, top: -150 + ((f * (9 + (i % 5) * 2) + i * 113) % 1300), transform: `rotate(${(f * 4 + i * 40) % 360}deg)` }}
      />
    ))}
  </AbsoluteFill>
);

// ---------- Отрисовка шаблона ----------
export const View: React.FC<{ b: Spec; f: number }> = ({ b, f }) => {
  switch (b.k) {
    case "emoji":
      return (
        <Col>
          <E c={b.e} s={b.t ? 400 : 520} style={animStyle(b.anim, f)} />
          {b.t && <T s={b.t} c={b.c} />}
          {b.sub && <T s={b.sub} size={54} />}
        </Col>
      );
    case "big":
      return (
        <Col gap={20}>
          <T s={b.t} size={240} c={b.c ?? YELLOW} />
          {b.sub && <T s={b.sub} size={70} />}
        </Col>
      );
    case "counter": {
      const v = b.to * ramp(f, 0, 22);
      const txt = (b.pre ?? "") + (Number.isInteger(b.to) ? Math.round(v) : v.toFixed(1).replace(".", ",")) + (b.suf ?? "");
      return (
        <Col gap={10}>
          <T s={txt} size={330} c={b.c ?? YELLOW} />
          {b.t && <T s={b.t} size={84} />}
        </Col>
      );
    }
    case "crossed":
      return (
        <Col>
          <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <E c={b.e} s={360} style={{ filter: b.gray ? "grayscale(.9) brightness(.7)" : undefined }} />
            <Cross s={420} p={ramp(f, 3, 15)} />
          </div>
          {b.t && <T s={b.t} />}
        </Col>
      );
    case "row":
      return (
        <Col>
          <Row gap={10}>
            {b.es.map((c, i) => (
              <E key={i} c={c} s={Math.min(260, 900 / b.es.length)} style={{ transform: `scale(${pop(f, i * 3)}) translateY(${Math.sin(f / 4 + i) * 10}px)` }} />
            ))}
          </Row>
          {b.t && <T s={b.t} c={b.c} />}
        </Col>
      );
    case "grid":
      return (
        <Col>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 160px)", gap: 16 }}>
            {Array.from({ length: 20 }, (_, i) => {
              const odd = b.odd && i === 12;
              const lit = f > 4 + i;
              return (
                <div
                  key={i}
                  style={{
                    height: 130,
                    borderRadius: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: lit ? (odd ? "rgba(255,59,48,.3)" : "rgba(61,220,132,.25)") : "rgba(255,255,255,.07)",
                    border: `5px solid ${lit ? (odd ? RED : GREEN) : "rgba(255,255,255,.15)"}`,
                    transform: `scale(${pop(f, i)})`,
                  }}
                >
                  <E c={odd ? b.odd! : b.e} s={74} />
                </div>
              );
            })}
          </div>
          {b.t && <T s={b.t} size={72} c={b.c ?? GREEN} />}
        </Col>
      );
    case "bars": {
      const g = ramp(f, 2, 22);
      const max = Math.max(...b.items.map((x) => x.v));
      return (
        <Col gap={10}>
          {b.title && <T s={b.title} size={46} c="rgba(255,255,255,.75)" />}
          <div style={{ display: "flex", gap: 70, alignItems: "flex-end", height: 820 }}>
            {b.items.map((x, i) => (
              <Col key={i} gap={12}>
                <T s={x.txt} size={60} c={x.c ?? (i ? YELLOW : GREEN)} style={{ opacity: g }} />
                <div style={{ width: 260, height: (540 * x.v * g) / max, borderRadius: "30px 30px 0 0", background: x.c ?? (i ? YELLOW : GREEN) }} />
                <E c={x.e} s={100} />
                <T s={x.label} size={46} />
              </Col>
            ))}
          </div>
        </Col>
      );
    }
    case "rain":
      return (
        <>
          <Rain f={f} e={b.e} />
          <Col>
            <E c={b.main ?? "🏦"} s={340} style={animStyle("pulse", f)} />
            {b.t && <T s={b.t} c={b.c ?? GREEN} size={110} />}
          </Col>
        </>
      );
    case "check":
      return (
        <Col>
          <Row gap={10}>
            <E c={b.e} s={300} style={{ filter: b.ok ? undefined : "grayscale(.8) brightness(.75)" }} />
            <E c={b.ok ? "✅" : "❌"} s={190} style={{ transform: `scale(${pop(f, 5)})` }} />
          </Row>
          <T s={b.t} c={b.ok ? GREEN : RED} size={104} />
        </Col>
      );
    case "brand":
      return (
        <Col gap={40}>
          <div
            style={{
              background: b.bg,
              borderRadius: 50,
              padding: "60px 70px",
              transform: `scale(${pop(f)}) rotate(${Math.sin(f / 6) * 2}deg)`,
              boxShadow: "0 30px 80px rgba(0,0,0,.5)",
            }}
          >
            <T s={b.t} size={150} w={760} c={b.fg} style={{ textShadow: "none" }} />
          </div>
          {b.sub && <T s={b.sub} size={80} />}
        </Col>
      );
    case "chart": {
      const p = ramp(f, 0, 20);
      const ys = b.up ? [300, 240, 260, 170, 190, 90, 110, 10] : [0, 60, 30, 120, 90, 200, 170, 300];
      const pts = ys.map((y, i) => `${i * 100},${b.up ? 320 - (320 - y) * p : 20 + y * p}`).join(" ");
      return (
        <Col>
          <svg width={760} height={360} viewBox="0 0 760 360">
            <polyline points={pts} fill="none" stroke={b.up ? GREEN : RED} strokeWidth="22" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {b.t && <T s={b.t} size={140} c={b.up ? GREEN : RED} />}
        </Col>
      );
    }
    case "vs":
      return (
        <Row gap={40}>
          {[b.a, b.b].map(([e, t], i) => (
            <div
              key={i}
              style={{
                width: 450,
                height: 640,
                borderRadius: 44,
                background: "rgba(255,255,255,.07)",
                border: `6px solid ${i ? GREEN : RED}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 30,
                transform: `scale(${pop(f, i * 8)})`,
              }}
            >
              <E c={e} s={220} />
              <T s={t} size={64} w={400} c={i ? GREEN : RED} />
            </div>
          ))}
        </Row>
      );
    case "flow":
      return (
        <Col gap={10}>
          <E c={b.to} s={240} style={{ transform: `scale(${pop(f, 6)})` }} />
          <Row gap={0}>
            <MoneyStream f={f} e={b.money ?? "💵"} />
            <MoneyStream f={f + 13} e={b.money ?? "💵"} />
            <MoneyStream f={f + 26} e={b.money ?? "💵"} />
          </Row>
          <E c={b.from} s={200} />
          {b.t && <T s={b.t} size={90} c={GREEN} />}
        </Col>
      );
    case "quote":
      return (
        <Col>
          {b.e && <E c={b.e} s={280} style={animStyle("pulse", f)} />}
          <div style={{ borderLeft: `14px solid ${YELLOW}`, background: "rgba(255,255,255,.08)", borderRadius: 30, padding: "40px 44px", maxWidth: 960 }}>
            <T s={b.t} size={84} w={860} style={{ textAlign: "left" }} />
          </div>
        </Col>
      );
    case "price":
      return (
        <Col gap={20}>
          <E c={b.e} s={340} style={animStyle("bob", f)} />
          <div style={{ background: b.c ?? RED, borderRadius: 30, padding: "16px 50px", transform: `rotate(-4deg) scale(${pop(f, 6)})` }}>
            <T s={b.price} size={170} style={{ textShadow: "none" }} />
          </div>
          {b.t && <T s={b.t} size={80} />}
        </Col>
      );
    case "subscribe": {
      const click = f > 14;
      return (
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: click ? "#3a3a3a" : "#FF0033",
              borderRadius: 34,
              padding: "40px 80px",
              transform: `scale(${pop(f) * (click && f < 20 ? 0.92 : 1)})`,
              boxShadow: click ? "none" : "0 20px 70px rgba(255,0,51,.55)",
            }}
          >
            <T s={click ? "вы подписаны" : "подписаться"} size={88} />
          </div>
          <E c="👆" s={150} style={{ position: "absolute", right: -40, bottom: -110, transform: `translate(${(1 - ramp(f, 0, 12)) * 200}px, ${(1 - ramp(f, 0, 12)) * 200}px)` }} />
        </div>
      );
    }
    case "shout": {
      // Крупный план: Уильям в шоке, рот работает ~1.5 с, сверху фраза.
      const talk = f < 45 ? 0.4 + 0.6 * Math.abs(Math.sin(f * 0.9)) : 0;
      return (
        <div style={{ position: "relative", width: 1080, height: 900, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <T s={b.t} size={120} c={YELLOW} style={{ transform: `scale(${pop(f, 2)}) rotate(-3deg)`, zIndex: 2 }} />
          <div style={{ width: 860, height: 975, marginTop: -40, transform: `scale(${1 + Math.sin(f * 1.3) * 0.02})` }}>
            <Gentleman from="shock" to="shock" t={1} talk={talk} squash={Math.sin(f * 0.55) * Math.exp(-f / 8)} />
          </div>
        </div>
      );
    }
    case "shop": {
      // Магазин: покупатели идут к двери и исчезают внутри, над крышей всплывают деньги.
      const people = ["🧑", "👩", "👵", "🧑‍💼", "👩"];
      return (
        <Mini t={b.t} f={f}>
          <svg width={860} height={520} viewBox="0 0 860 520" style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x={0} y={440} width={860} height={80} fill="#9bd27a" />
            <rect x={400} y={170} width={400} height={280} fill="#fff8ec" stroke="#2b2b2b" strokeWidth={8} />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={`M${400 + i * 50} 170 l50 0 l0 46 q-25 22 -50 0 z`} fill={i % 2 ? "#fff" : RED} stroke="#2b2b2b" strokeWidth={5} />
            ))}
            <rect x={430} y={110} width={340} height={64} rx={12} fill="#2b2b2b" />
            <text x={600} y={156} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={YELLOW}>
              {b.label}
            </text>
            <rect x={560} y={290} width={90} height={160} fill="#6b4a2b" stroke="#2b2b2b" strokeWidth={6} />
            <rect x={440} y={250} width={90} height={80} fill="#9fd8ff" stroke="#2b2b2b" strokeWidth={6} />
            <rect x={680} y={250} width={90} height={80} fill="#9fd8ff" stroke="#2b2b2b" strokeWidth={6} />
          </svg>
          {people.map((c, i) => {
            const p = ((f + i * 14) % 70) / 70;
            return <E key={i} c={c} s={110} style={{ position: "absolute", left: -40 + p * 640, top: 320 - Math.abs(Math.sin(p * 30)) * 10, opacity: p > 0.92 ? 0 : 1 }} />;
          })}
          {[0, 1, 2].map((i) => {
            const p = ((f + i * 12) % 36) / 36;
            return <E key={i} c="💵" s={80} style={{ position: "absolute", left: 520 + i * 90, top: 90 - p * 100, opacity: Math.sin(p * Math.PI) }} />;
          })}
        </Mini>
      );
    }
    case "register": {
      // Касса: на экране растёт сумма, ящик выезжает, купюры вылетают вверх.
      const sum = Math.round(ramp(f, 0, 40) * 9999);
      const open = ramp(f, 4, 12) * 70;
      return (
        <Mini t={b.t} f={f}>
          <svg width={860} height={520} viewBox="0 0 860 520" style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x={230} y={430} width={400} height={30 + open} fill="#c9c9c9" stroke="#2b2b2b" strokeWidth={6} />
            <rect x={200} y={230} width={460} height={210} rx={20} fill="#4f5d75" stroke="#2b2b2b" strokeWidth={8} />
            <rect x={300} y={120} width={260} height={110} rx={12} fill="#1b1b1b" stroke="#2b2b2b" strokeWidth={8} />
            <text x={430} y={196} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={GREEN}>
              ${sum}
            </text>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={250 + (i % 4) * 95} y={260 + Math.floor(i / 4) * 55} width={70} height={38} rx={8} fill={(f / 3 + i) % 12 < 1 ? YELLOW : "#e8e8e8"} />
            ))}
          </svg>
          {Array.from({ length: 6 }, (_, i) => {
            const p = ((f + i * 6) % 34) / 34;
            return <E key={i} c={i % 2 ? "💵" : "🪙"} s={80} style={{ position: "absolute", left: 300 + ((i * 97) % 260), top: 420 - p * 420, opacity: Math.sin(p * Math.PI), transform: `rotate(${p * 200 - 100}deg)` }} />;
          })}
        </Mini>
      );
    }
    case "conveyor": {
      // Конвейер: предметы едут по ленте и падают в цель.
      return (
        <Mini t={b.t} f={f}>
          <svg width={860} height={520} viewBox="0 0 860 520" style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x={20} y={330} width={600} height={40} rx={20} fill="#3a3a3a" />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={50 + i * 68} cy={350} r={14} fill="#999" stroke="#2b2b2b" strokeWidth={4} transform={`rotate(${f * 12} ${50 + i * 68} 350)`} />
            ))}
            <rect x={60} y={370} width={20} height={110} fill="#555" />
            <rect x={560} y={370} width={20} height={110} fill="#555" />
          </svg>
          {Array.from({ length: 4 }, (_, i) => {
            const p = ((f + i * 12) % 48) / 48;
            const x = 20 + p * 640;
            const y = p < 0.85 ? 230 : 230 + ((p - 0.85) / 0.15) * 140;
            return <E key={i} c={b.es[i % b.es.length]} s={100} style={{ position: "absolute", left: x, top: y, opacity: p > 0.97 ? 0 : 1 }} />;
          })}
          <E c={b.to} s={220} style={{ position: "absolute", left: 640, top: 260, transform: `scale(${1 + Math.sin(f / 3) * 0.05})` }} />
        </Mini>
      );
    }
    case "split": {
      // Делёжка: куча денег делится на две части с подписями.
      const s = ramp(f, 6, 22);
      return (
        <Mini t={b.t} f={f}>
          <E c="💰" s={190} style={{ position: "absolute", left: 335, top: 20, transform: `scale(${1 - 0.3 * s})` }} />
          {[b.a, b.b].map(([label, pct], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 230,
                left: 430 - 160 + (i ? 1 : -1) * 220 * s,
                width: 320,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                opacity: s,
              }}
            >
              <T s={pct} size={110} c={i ? RED : GREEN} style={{ textShadow: "none", WebkitTextStroke: "6px #2b2b2b", paintOrder: "stroke fill" }} />
              <T s={label} size={50} w={320} c="#2b2b2b" style={{ textShadow: "none" }} />
            </div>
          ))}
        </Mini>
      );
    }
  }
};

// Карточка мини-сценки: светлая «иллюстрация» 860×520 с рамкой, слегка наклонена, подпись снизу.
const Mini: React.FC<{ children: React.ReactNode; t?: string; f: number }> = ({ children, t, f }) => (
  <Col gap={30}>
    <div
      style={{
        position: "relative",
        width: 860,
        height: 520,
        borderRadius: 40,
        overflow: "hidden",
        background: "linear-gradient(#cfeeff, #fff6e0)",
        border: "10px solid #fff",
        boxShadow: "0 30px 80px rgba(0,0,0,.55)",
        transform: `rotate(${Math.sin(f / 20) * 1.5 - 1}deg)`,
      }}
    >
      {children}
    </div>
    {t && <T s={t} size={90} />}
  </Col>
);

// ---------- Таймлайн темы ----------
export const SFX: Record<Sfx, [string, number]> = {
  whoosh: ["sfx/whoosh.wav", 0.22],
  whip: ["sfx/whip.wav", 0.22],
  pop: ["sfx/mouse-click.wav", 0.35],
  boom: ["sfx/vine-boom.wav", 0.28],
  ding: ["sfx/ding.wav", 0.3],
};

export const buildTopic = (topic: Topic) => {
  const W = topic.voice.words;
  const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");
  const cue = (word: string, n = 1) => {
    if (!word) return 0;
    const hits = W.filter((x) => norm(x.w) === norm(word));
    const pre = hits.length >= n ? hits : W.filter((x) => norm(x.w).startsWith(norm(word)));
    if (!pre[n - 1]) throw new Error(`[${topic.id}] нет слова «${word}» #${n}`);
    return pre[n - 1].t;
  };
  let best = W[0];
  W.forEach((w) => {
    if (w.end && Math.abs(w.e - topic.voice.dur / 2) < Math.abs(best.e - topic.voice.dur / 2)) best = w;
  });
  const next = W[W.indexOf(best) + 1];
  const CUT = next ? (best.e + next.t) / 2 : best.e;
  const vf = (t: number) => LEAD + Math.round(t * FPS) + (t >= CUT ? AD_FRAMES : 0);
  const beats = topic.beats.map((b, i) => ({ ...b, sfx: b.sfx ?? (i % 2 ? "whip" : "whoosh"), time: b.time ?? cue(b.at, b.n) }));
  beats.sort((a, b) => a.time - b.time);
  const groups: number[][] = [];
  let cur: number[] = [];
  W.forEach((w, i) => {
    cur.push(i);
    if (w.end || w.pause || cur.length === 3) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  return {
    W,
    CUT,
    vf,
    beats,
    BF: beats.map((b) => vf(b.time)),
    groups,
    AD_START: LEAD + Math.round(CUT * FPS),
    FRAMES: vf(topic.voice.dur) + 20,
    poses: beats.map((b, i) => autoPose(b, i)),
    themes: beats.map((b, i) => moodTheme(b, i)),
  };
};

// Фоны: градиент + узор. Цвет по настроению кадра (плохо = красный, деньги = зелёный), иначе чередуется.
const THEMES = {
  blue: ["#2a3c86", "#0b1020"],
  purple: ["#6a2fa0", "#170a2e"],
  teal: ["#0f7a78", "#041c1f"],
  orange: ["#b8501d", "#2a0f05"],
  red: ["#a01f24", "#220506"],
  green: ["#1f8a4a", "#04200f"],
};
const CYCLE: Theme[] = ["blue", "purple", "teal", "orange"];
const PATTERNS = ["rays", "grid", "dots", "stripes"] as const;

const moodTheme = (b: BeatDef, i: number): Theme => {
  if (b.theme) return b.theme;
  if (b.k === "shout" || b.k === "crossed" || (b.k === "chart" && !b.up) || (b.k === "check" && !b.ok) || (b.k === "big" && b.c === RED)) return "red";
  if (["rain", "flow", "register"].includes(b.k) || (b.k === "chart" && b.up) || (b.k === "check" && b.ok)) return "green";
  return CYCLE[Math.floor(i / 2) % CYCLE.length];
};

const Background: React.FC<{ frame: number; theme: Theme; pattern: number }> = ({ frame: f, theme, pattern }) => {
  const [a, b] = THEMES[theme];
  const kind = PATTERNS[pattern % PATTERNS.length];
  const line = "rgba(255,255,255,.07)";
  const pat: React.CSSProperties =
    kind === "rays"
      ? { background: `repeating-conic-gradient(from ${f * 0.6}deg at 50% 40%, ${line} 0 9deg, transparent 9deg 18deg)` }
      : kind === "grid"
        ? { backgroundImage: `linear-gradient(${line} 3px, transparent 3px), linear-gradient(90deg, ${line} 3px, transparent 3px)`, backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 3) % 90}px` }
        : kind === "dots"
          ? { backgroundImage: `radial-gradient(${line} 7px, transparent 8px)`, backgroundSize: "70px 70px", backgroundPosition: `${(f * 2) % 70}px ${(f * 2) % 70}px` }
          : { background: `repeating-linear-gradient(45deg, ${line} 0 30px, transparent 30px 60px)`, backgroundPosition: `${f * 2}px 0` };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${a} 0%, ${b} 70%, #030409 100%)` }}>
      <AbsoluteFill style={pat} />
      {Array.from({ length: 10 }, (_, i) => (
        <E key={i} c="🪙" s={34 + (i % 3) * 14} style={{ position: "absolute", left: (i * 263) % 1080, top: 1920 - ((f * (3 + (i % 4)) + i * 397) % 2100), opacity: 0.18 }} />
      ))}
    </AbsoluteFill>
  );
};

// Фото-фон: медленный наезд, затемнение и виньетка, чтобы графика и текст читались поверх.
const PhotoBg: React.FC<{ name: string; lf: number }> = ({ name, lf }) => (
  <AbsoluteFill>
    <Img src={staticFile(`finance/photos/${name}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 + lf * 0.0015})`, filter: "brightness(.55) saturate(1.15)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, transparent 30%, rgba(0,0,0,.65) 100%)" }} />
  </AbsoluteFill>
);

// 3D-стикер в верхнем углу: всплывает, покачивается, белая обводка как у наклейки.
const STICKERS: Record<string, string[]> = {
  boom: ["🤯", "😱", "💀", "🔥"],
  money: ["💸", "🤑", "💰", "📈"],
  bad: ["💀", "📉", "🤡", "😳"],
  calm: ["👀", "🧐", "💡", "⚡"],
};
const pickSticker = (b: BeatDef, i: number, theme: Theme): string | null => {
  if (b.st !== undefined) return b.st || null;
  if (b.k === "subscribe" || b.k === "brand") return null;
  const set = b.sfx === "boom" ? "boom" : theme === "green" ? "money" : theme === "red" ? "bad" : i % 2 ? "calm" : null;
  return set ? STICKERS[set][(i * 7) % 4] : null;
};
const Sticker: React.FC<{ c: string; lf: number; right: boolean }> = ({ c, lf, right }) => (
  <div
    style={{
      position: "absolute",
      top: 250,
      left: right ? 760 : 50,
      transform: `scale(${spring({ frame: lf - 5, fps: FPS, config: { damping: 9, stiffness: 200 } })}) rotate(${(right ? 14 : -14) + Math.sin(lf / 5) * 6}deg)`,
      filter: "drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 12px 16px rgba(0,0,0,.45))",
    }}
  >
    <E c={c} s={170} />
  </div>
);

export const FinanceShort: React.FC<{ topic: Topic }> = ({ topic }) => {
  const frame = useCurrentFrame();
  const B = React.useMemo(() => buildTopic(topic), [topic]);
  const adEnd = B.AD_START + AD_FRAMES;
  const inAd = frame >= B.AD_START && frame < adEnd;
  const at = inAd ? B.AD_START - 1 : frame;
  let bi = 0;
  B.BF.forEach((s, i) => {
    if (s <= at) bi = i;
  });
  const lf = at - B.BF[bi];
  const beat = B.beats[bi];
  const sticker = pickSticker(beat, bi, B.themes[bi]);

  const p = spring({ frame: lf, fps: FPS, config: { damping: 14, stiffness: 220 } });
  const scale = interpolate(p, [0, 1], [1.4, 1]) * (1 + lf * 0.0018);
  const rot = interpolate(p, [0, 1], [bi % 2 ? -5 : 5, 0]);
  const amp = beat.sfx === "boom" ? 22 * Math.max(0, 1 - lf / 14) : 0;

  // Субтитры по времени озвучки.
  const vt = (frame - LEAD - (frame >= adEnd ? AD_FRAMES : 0)) / FPS;
  let ci = -1;
  B.W.forEach((w, i) => {
    if (w.t <= vt) ci = i;
  });
  const g = ci >= 0 ? B.groups.find((x) => x.includes(ci))! : null;
  const showCap = !inAd && g && vt <= B.W[g[g.length - 1]].e + 0.6;
  const cutF = Math.round(B.CUT * FPS);
  const voice = staticFile(`finance/${topic.id}/voice.mp3`);

  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <AbsoluteFill style={{ filter: inAd ? "blur(24px) brightness(.65)" : undefined }}>
        {beat.photo ? <PhotoBg name={beat.photo} lf={lf} /> : <Background frame={at} theme={B.themes[bi]} pattern={Math.floor(bi / 2)} />}
        {sticker && !inAd && <Sticker c={sticker} lf={lf} right={bi % 2 === 0} />}
        <AbsoluteFill
          style={{
            top: 220,
            height: 900,
            alignItems: "center",
            justifyContent: "center",
            transform: `translate(${Math.sin(lf * 2.7) * amp}px, ${Math.cos(lf * 3.1) * amp * 0.7}px) scale(${scale}) rotate(${rot}deg)`,
            opacity: ramp(lf, 0, 3),
          }}
        >
          <View b={beat} f={lf} />
        </AbsoluteFill>
      </AbsoluteFill>
      {!inAd && <AbsoluteFill style={{ background: "#fff", opacity: interpolate(lf, [0, 4], [0.2, 0], { extrapolateRight: "clamp" }) }} />}
      {!inAd && beat.k !== "shout" && <GentOverlay frame={frame} BF={B.BF} poses={B.poses} talk={ci >= 0 && vt <= B.W[ci].e ? 0.35 + 0.65 * Math.abs(Math.sin((vt - B.W[ci].t) * 16)) : 0} />}
      {showCap && g && (
        <div
          style={{
            position: "absolute",
            top: 1160,
            left: 60,
            right: 140,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 24,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 82,
            textTransform: "uppercase",
            lineHeight: 1.1,
            transform: `scale(${0.8 + 0.2 * pop(frame, B.vf(B.W[g[0]].t))})`,
          }}
        >
          {g.map((i) => (
            <span key={i} style={{ color: i === ci ? YELLOW : "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill" }}>
              {B.W[i].w.replace(/[.,!?]/g, "")}
            </span>
          ))}
        </div>
      )}

      {/* Музыка ~12 дБ под голосом (голос -21.6 LUFS, бит -17 LUFS), в паузах поднимается; на рекламе выключена */}
      <Audio
        src={staticFile(topic.music ?? "finance/music.mp3")}
        loop
        volume={(f) => {
          if (f >= B.AD_START - 3 && f < adEnd + 3) return 0;
          const t = (f - LEAD - (f >= adEnd ? AD_FRAMES : 0)) / FPS;
          const speaking = B.W.some((w) => t >= w.t - 0.3 && t <= w.e + 0.4);
          return speaking ? 0.15 : 0.35;
        }}
      />
      <Sequence from={LEAD} durationInFrames={cutF}>
        <Audio src={voice} trimAfter={cutF} />
      </Sequence>
      <Sequence from={adEnd}>
        <Audio src={voice} trimBefore={cutF} />
      </Sequence>
      {B.beats.map((b, i) => (
        <Sequence key={i} from={B.BF[i]} durationInFrames={45}>
          <Audio src={staticFile(SFX[b.sfx][0])} volume={SFX[b.sfx][1]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
