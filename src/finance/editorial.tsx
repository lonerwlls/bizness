// Стиль «Денежкин» для финансовых шортсов: тёмно-зелёный «денежный» фон со свечением и долларами,
// сверху бейдж канала, номер выпуска и прогресс-монетка, ниже заголовок сцены с мятным акцентом,
// в центре иллюстрация (шаблоны View из engine), внизу крупные субтитры по 1–2 слова без плашки.
// Уильям выглядывает из нижнего угла. Мат в речи: в субтитрах со звёздочкой и красным, тряска, вспышка, бум.
import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { AD_FRAMES, BeatDef, E, FONT, FPS, LEAD, RED, SFX, Topic, View, YELLOW, buildTopic, fit, ramp } from "./engine";
import { GentOverlay, Pose, autoPose } from "./Gent";

// Бит = смена иллюстрации; h (заголовок) держится до следующего бита с h. kick — надзаголовок, sub — пояснение.
export type EdBeat = BeatDef & { kick?: string; h?: string; sub?: string };
export type EdTopic = Topic & { beats: EdBeat[]; ep: string };

const BG = "#04120c";
const MINT = "#5CF29A";
const MUTED = "#86a898";
const MAT = /пизд|^(на|по|за|от|до)?ху[йеёя]|^о?ху[еёи]|бля|^(за|вы|на|по|у|от|до)?[её]б[аоуи]|^сук/i;
const isMat = (w: string) => MAT.test(w.toLowerCase());
// Первая гласная после первой буквы → звёздочка: пиздец → п*здец, охуеть → ох*еть.
const censor = (w: string) => w[0] + w.slice(1).replace(/[аеёиоуыэюя]/i, "∗");
// *слово* → мятным.
const accent = (s: string) => s.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? <span key={i} style={{ color: MINT }}>{p.slice(1, -1)}</span> : p));

const GLOW = { emerald: "#0f7a4a", teal: "#0d6a72", gold: "#8a6c10", red: "#9a1c22" };
type Glow = keyof typeof GLOW;

export const buildEd = (topic: EdTopic) => {
  const B = buildTopic(topic);
  const beats = B.beats as EdBeat[];
  // Субтитры: 1–2 слова (до 16 букв), разрыв на конце предложения или паузе.
  const groups: number[][] = [];
  let cur: number[] = [];
  B.W.forEach((w, i) => {
    cur.push(i);
    const len = cur.reduce((s, k) => s + B.W[k].w.length + 1, 0);
    const next = B.W[i + 1];
    if (w.end || w.pause || cur.length === 2 || (next && len + next.w.length > 16)) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  const mats = B.W.map((w, i) => (isMat(w.w) ? i : -1)).filter((i) => i >= 0);
  const times = B.beats.map((b) => b.time);
  const beatEnd = (i: number) => (i + 1 < times.length ? times[i + 1] : topic.voice.dur);
  const hasMat = (i: number) => mats.some((m) => B.W[m].t >= times[i] && B.W[m].t < beatEnd(i));
  const glows: Glow[] = beats.map((b, i) => {
    if (hasMat(i) || b.k === "crossed" || (b.k === "chart" && !b.up) || (b.k === "check" && !b.ok)) return "red";
    if (["rain", "flow", "register", "counter", "price"].includes(b.k) || (b.k === "chart" && b.up) || (b.k === "check" && b.ok)) return "gold";
    return i % 3 === 2 ? "teal" : "emerald";
  });
  const poses: Pose[] = beats.map((b, i) => (b.g ? b.g : hasMat(i) ? "shock" : autoPose(b, i)));
  const heads = beats.map((_, i) => {
    let h = 0;
    for (let k = 0; k <= i; k++) if (beats[k].h) h = k;
    return h;
  });
  return { ...B, beats, groups, mats, glows, poses, heads };
};

// Еле заметные доллары, медленно всплывают.
const Dollars: React.FC<{ f: number }> = ({ f }) => (
  <>
    {Array.from({ length: 18 }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: (i * 211) % 1040,
          top: 1960 - ((f * (0.8 + (i % 3) * 0.4) + i * 431) % 2100),
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 40 + (i % 4) * 22,
          color: MINT,
          opacity: 0.05 + (i % 3) * 0.02,
          transform: `rotate(${(i % 5) * 12 - 24}deg)`,
        }}
      >
        $
      </div>
    ))}
  </>
);

const Bg: React.FC<{ f: number; glow: Glow; prev: Glow; lf: number }> = ({ f, glow, prev, lf }) => {
  const layer = (g: Glow, o: number) => (
    <AbsoluteFill style={{ opacity: o, background: `radial-gradient(ellipse 80% 45% at 50% ${50 + Math.sin(f / 70) * 3}%, ${GLOW[g]} 0%, transparent 72%)` }} />
  );
  return (
    <AbsoluteFill style={{ background: BG }}>
      {layer(prev, 0.8)}
      {layer(glow, 0.8 * ramp(lf, 0, 12))}
      <Dollars f={f} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// Шапка: бейдж канала, номер выпуска, под ними прогресс с катящейся монеткой.
const Header: React.FC<{ ep: string; progress: number; f: number }> = ({ ep, progress, f }) => (
  <>
    <div style={{ position: "absolute", top: 60, left: 50, right: 50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(16,53,31,.9)", border: `3px solid ${MINT}`, borderRadius: 40, padding: "6px 26px 6px 12px" }}>
        <E c="🪙" s={46} />
        <span style={{ fontWeight: 900, fontSize: 32, color: "#fff", letterSpacing: 2 }}>ДЕНЕЖКИН</span>
      </div>
      <span style={{ fontWeight: 900, fontSize: 34, color: MINT }}>№{ep}</span>
    </div>
    <div style={{ position: "absolute", top: 150, left: 50, width: 980, height: 10, borderRadius: 5, background: "rgba(255,255,255,.08)" }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, #1f9d5c, ${MINT})` }} />
      <E c="🪙" s={44} style={{ position: "absolute", top: -17, left: progress * 980 - 22, transform: `rotate(${f * 9}deg)` }} />
    </div>
  </>
);

// Заголовок сцены: надзаголовок, строки въезжают снизу по очереди, пояснение проявляется.
const Headline: React.FC<{ b: EdBeat; lf: number }> = ({ b, lf }) => {
  const lines = (b.h ?? "").split("\n");
  const size = fit(b.h ?? "", 100, 980);
  const inn = (d: number) => spring({ frame: lf - d, fps: FPS, config: { damping: 16, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", top: 210, left: 50, right: 50, fontFamily: FONT }}>
      {b.kick && (
        <div style={{ color: MINT, fontWeight: 700, fontSize: 30, letterSpacing: 5, textTransform: "uppercase", opacity: inn(0) }}>{b.kick}</div>
      )}
      <div style={{ marginTop: 14 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1.04,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: -1,
                transform: `translateY(${(1 - inn(3 + i * 3)) * 110}%)`,
              }}
            >
              {accent(l)}
            </div>
          </div>
        ))}
      </div>
      {b.sub && <div style={{ marginTop: 18, color: MUTED, fontWeight: 700, fontSize: 34, opacity: ramp(lf, 10, 20) }}>{b.sub}</div>}
    </div>
  );
};

export const EditorialShort: React.FC<{ topic: EdTopic }> = ({ topic }) => {
  const frame = useCurrentFrame();
  const B = React.useMemo(() => buildEd(topic), [topic]);
  const adEnd = B.AD_START + AD_FRAMES;
  const inAd = frame >= B.AD_START && frame < adEnd;
  const at = inAd ? B.AD_START - 1 : frame;
  let bi = 0;
  B.BF.forEach((s, i) => {
    if (s <= at) bi = i;
  });
  const lf = at - B.BF[bi];
  const beat = B.beats[bi];
  const hi = B.heads[bi];

  // Текущее слово озвучки.
  const vt = (frame - LEAD - (frame >= adEnd ? AD_FRAMES : 0)) / FPS;
  let ci = -1;
  B.W.forEach((w, i) => {
    if (w.t <= vt) ci = i;
  });
  const g = ci >= 0 ? B.groups.find((x) => x.includes(ci))! : null;
  const showCap = !inAd && g && vt <= B.W[g[g.length - 1]].e + 1;
  const gf = g ? frame - B.vf(B.W[g[0]].t) : 0;
  // Размер: в одну строку, если влезает крупно (буква ≈ 0.95 em), иначе слова друг под другом.
  const lens = g ? g.map((i) => B.W[i].w.replace(/[.,!?]/g, "").length) : [1];
  const oneLine = Math.floor(960 / ((lens.reduce((a, b) => a + b, 0) + lens.length - 1) * 0.95));
  const stack = oneLine < 92;
  const capSize = Math.min(118, stack ? Math.floor(960 / (Math.max(...lens) * 0.95)) : oneLine);
  const talk = ci >= 0 && vt <= B.W[ci].e ? 0.35 + 0.65 * Math.abs(Math.sin((vt - B.W[ci].t) * 16)) : 0;

  // Мат: тряска и красная вспышка от начала слова.
  const lastMat = [...B.mats].reverse().find((m) => B.vf(B.W[m].t) <= frame);
  const mf = lastMat !== undefined ? frame - B.vf(B.W[lastMat].t) : 99;
  const amp = inAd ? 0 : 16 * Math.max(0, 1 - mf / 12);
  const shake = `translate(${Math.sin(mf * 2.7) * amp}px, ${Math.cos(mf * 3.3) * amp * 0.7}px)`;

  const p = spring({ frame: lf, fps: FPS, config: { damping: 15, stiffness: 160 } });
  const ill = `translateY(${(1 - p) * 70}px) scale(${(0.9 + 0.1 * p) * (1 + lf * 0.0012)})`;
  const progress = Math.min(1, frame / (B.FRAMES - 10));
  const cutF = Math.round(B.CUT * FPS);
  const voice = staticFile(`finance/${topic.id}/voice.mp3`);

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      <AbsoluteFill style={{ filter: inAd ? "blur(24px) brightness(.6)" : undefined, transform: shake }}>
        <Bg f={at} glow={B.glows[bi]} prev={B.glows[Math.max(0, bi - 1)]} lf={lf} />
        <Header ep={topic.ep} progress={progress} f={frame} />
        <Headline key={hi} b={B.beats[hi]} lf={at - B.BF[hi]} />
        {/* Иллюстрация */}
        <div style={{ position: "absolute", top: 450, left: 0, width: 1080, height: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: ramp(lf, 0, 5) }}>
          <div style={{ width: 1080, height: 900, display: "flex", alignItems: "center", justifyContent: "center", transform: `${ill} scale(0.8)`, marginTop: Math.sin(at / 25) * 8 }}>
            <View b={beat} f={lf} />
          </div>
        </div>
        {!inAd && <GentOverlay frame={frame} BF={B.BF} poses={B.poses} talk={talk} top={1985 - 793} scale={0.65} />}
        {/* Субтитры: 1–2 крупных слова с обводкой, текущее жёлтое, мат красный со звёздочкой */}
        {showCap && g && (
          <div
            style={{
              position: "absolute",
              top: 1370,
              left: 40,
              right: 40,
              height: 300,
              display: "flex",
              flexDirection: stack ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              columnGap: 46,
              fontWeight: 900,
              fontSize: capSize,
              lineHeight: 1.02,
              textTransform: "uppercase",
              transform: `scale(${0.55 + 0.45 * spring({ frame: gf, fps: FPS, config: { damping: 10, stiffness: 220 } })}) rotate(${g[0] % 2 ? 2 : -2}deg)`,
            }}
          >
            {g.map((i) => {
              const mat = isMat(B.W[i].w);
              const word = B.W[i].w.replace(/[.,!?]/g, "");
              const on = i === ci;
              return (
                <span
                  key={i}
                  style={{
                    color: mat ? "#ff4b4b" : on ? YELLOW : "#fff",
                    WebkitTextStroke: "18px #000",
                    paintOrder: "stroke fill",
                    textShadow: "0 12px 30px rgba(0,0,0,.6)",
                    display: "inline-block",
                    transform: `scale(${on ? 1.08 : 1})`,
                  }}
                >
                  {mat ? censor(word) : word}
                </span>
              );
            })}
          </div>
        )}
        {/* Красная вспышка по краям на мате */}
        {!inAd && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 45%, ${RED} 130%)`, opacity: Math.max(0, 1 - mf / 14) * 0.8 }} />}
      </AbsoluteFill>

      <Audio
        src={staticFile(topic.music ?? "finance/music.mp3")}
        loop
        volume={(f) => {
          if (f >= B.AD_START - 3 && f < adEnd + 3) return 0;
          const t = (f - LEAD - (f >= adEnd ? AD_FRAMES : 0)) / FPS;
          const speaking = B.W.some((w) => t >= w.t - 0.3 && t <= w.e + 0.4);
          return speaking ? 0.13 : 0.32;
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
          <Audio src={staticFile(SFX[b.sfx!][0])} volume={SFX[b.sfx!][1] * 0.8} />
        </Sequence>
      ))}
      {B.mats.map((m) => (
        <Sequence key={"m" + m} from={B.vf(B.W[m].t)} durationInFrames={45}>
          <Audio src={staticFile(SFX.boom[0])} volume={SFX.boom[1] * 0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
