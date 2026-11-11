// Общая «оболочка» серии (с части 3): картинка по времени истории T, стоп-кадры под рекламу (после 15 с и в конце),
// живая камера, пыль, часы сверху, субтитры с подсветкой слов, голос и фон с паузами на рекламу.
// Баннер поверх стоп-кадров накладывает ffmpeg (scripts/make_story.sh).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Dust, MONO, PH, RED, S, W, live, setLang } from "./FoodShort";

export const FPS = 30, YEL = "#ffc53a";
export type Wd = { t: number; e: number; w: string; end: boolean; pause: boolean };
export type Voice = { dur: number; words: Wd[] };
export type SShot = React.FC<{ t: number; T: number }>; // t — секунды сцены, T — время истории
export const AD_LEN = 5.3, AD_DELAY = 0.6, AD_HOLD = AD_DELAY + AD_LEN + 0.25;
export const END_CARD = 2.8; // сколько после голоса держится финальная карточка

export const words = (v: Voice) => {
  const at = (w: string, n = 1) => { let c = 0; for (const x of v.words) if (x.w === w && ++c === n) return x; throw new Error("нет слова " + w + " #" + n); };
  return { wd: at, at: (w: string, n = 1) => at(w, n).t, b: (w: string, n = 1) => at(w, n).t - 0.1 };
};
/** тайминги ролика: ad1 — время истории, где встаёт первая реклама */
export const timing = (v: Voice, ad1: number, adLen = AD_LEN) => {
  const end = v.dur + END_CARD, hold = AD_DELAY + adLen + 0.25;
  return {
    end, ad1, hold, frames: Math.ceil((end + 2 * hold) * FPS),
    storyT: (s: number) => (s < ad1 ? s : s < ad1 + hold ? ad1 : Math.min(end, s - hold)),
    /** идёт ли сейчас реклама (для затемнения стоп-кадра) */
    inAd: (s: number) => (s >= ad1 + AD_DELAY && s < ad1 + hold) || s >= end + hold + AD_DELAY,
    adTimes: [ad1 + AD_DELAY, end + hold + AD_DELAY],
  };
};

const groupsOf = (v: Voice, ask: Wd[] = []): Wd[][] => {
  const ws = v.words.map((w) => ({ ...w, w: w.w + (ask.includes(w) ? "?" : w.end ? "." : w.pause ? "," : "") }));
  const gs: Wd[][] = []; let cur: Wd[] = [];
  ws.forEach((w) => { cur.push(w); if (w.end || (w.pause && cur.length >= 3) || cur.length >= 8) { gs.push(cur); cur = []; } });
  if (cur.length) gs.push(cur);
  return gs;
};
const Captions: React.FC<{ T: number; G: Wd[][]; dur: number; red: RegExp; yel: RegExp; top: number }> = ({ T, G, dur, red, yel, top }) => {
  const gi = G.findIndex((g, i) => T >= g[0].t - 0.08 && (i === G.length - 1 || T < G[i + 1][0].t - 0.08));
  if (gi < 0 || T > dur + 0.1) return null;
  const grp = G[gi], appear = Math.min(1, (T - grp[0].t + 0.08) / 0.12);
  return <div style={{ position: "absolute", top, left: 50, right: 50, textAlign: "center", fontFamily: "FsMont", fontWeight: 900, fontSize: 78, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: -1, opacity: appear, transform: `scale(${0.94 + 0.06 * appear})` }}>
    {grp.map((w, i) => {
      const said = T >= w.t, now = said && (i === grp.length - 1 || T < grp[i + 1].t);
      const c = red.test(w.w) ? RED : yel.test(w.w) ? YEL : "#fff";
      const k = Math.min(1, (T - w.t) / 0.1);
      return <span key={i} style={{ color: said ? c : c === "#fff" ? "#6a6a72" : c, opacity: said ? 1 : 0.35, filter: said ? (now && c !== "#fff" ? `drop-shadow(0 0 18px ${c})` : "none") : "blur(2px)", display: "inline-block", marginRight: 26, transform: `translateY(${said ? 0 : 6}px) scale(${now ? 1 + 0.06 * (1 - k) : 1})` }}>{w.w}</span>;
    })}
  </div>;
};
const Clock: React.FC<{ T: number; clock: [number, string][]; dur: number }> = ({ T, clock, dur }) => {
  if (T > dur + 0.15) return null;
  const label = [...clock].reverse().find(([a]) => T >= a)![1];
  return <div style={{ position: "absolute", top: 28, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "rgba(40,6,10,0.85)", border: `2px solid ${RED}`, borderRadius: 8, padding: "8px 18px", fontFamily: MONO, fontSize: 30, color: RED, letterSpacing: 3, fontWeight: 700 }}>
      <span style={{ opacity: Math.floor(T * 1.5) % 2 ? 1 : 0.25 }}>●</span> {label}
    </div>
  </div>;
};

export const StoryShell: React.FC<{ voice: Voice; ad1: number; cuts: [SShot, number][]; clock: [number, string][]; red: RegExp; yel: RegExp; dir: string; ask?: Wd[]; adLen?: number; capTop?: number; dimAd?: boolean }> = ({ voice, ad1, cuts, clock, red, yel, dir, ask = [], adLen = AD_LEN, capTop = 1230, dimAd = false }) => {
  setLang("ru");
  const tm = timing(voice, ad1, adLen);
  const G = React.useMemo(() => groupsOf(voice, ask), [voice, ask]);
  const f = useCurrentFrame(), T = tm.storyT(f / FPS);
  const ci = cuts.reduce((acc, [, a], i) => (T >= a ? i : acc), 0);
  const [C, a] = cuts[ci], next = ci + 1 < cuts.length ? cuts[ci + 1][1] : tm.end, t = T - a;
  const ad1F = S(ad1), holdF = S(tm.hold), dim = dimAd && tm.inAd(f / FPS);
  return <AbsoluteFill style={{ background: "#000" }}>
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: "absolute", top: 0 }}>
      <defs><linearGradient id="fadeB3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" /></linearGradient>
        <radialGradient id="vig3" cx="50%" cy="45%" r="70%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
      <svg width={W} height={PH} viewBox={`0 0 ${W} ${PH}`} overflow="hidden">
        <g transform={live(T, t / Math.max(0.1, next - a))}><C key={ci} t={t} T={T} /></g>
        <Dust sec={T} />
        <rect width={W} height={PH} fill="url(#vig3)" />
      </svg>
      <rect y={PH - 260} width={W} height={262} fill="url(#fadeB3)" />
      {t >= 0 && t < 4 / FPS ? <rect width={W} height={PH} fill="#000" opacity={1 - t * FPS / 4} /> : null}
    </svg>
    <Clock T={T} clock={clock} dur={voice.dur} />
    <Captions T={T} G={G} dur={voice.dur} red={red} yel={yel} top={capTop} />
    {dim ? <AbsoluteFill style={{ background: "rgba(0,0,0,0.62)" }} /> : null}
    <Sequence from={0} durationInFrames={ad1F}><Audio src={staticFile(`${dir}/voice.mp3`)} /><Audio src={staticFile(`${dir}/bed.wav`)} volume={0.85} /></Sequence>
    <Sequence from={ad1F + holdF} durationInFrames={S(tm.end) - ad1F}><Audio src={staticFile(`${dir}/voice.mp3`)} startFrom={ad1F} /><Audio src={staticFile(`${dir}/bed.wav`)} volume={0.85} startFrom={ad1F} /></Sequence>
  </AbsoluteFill>;
};
