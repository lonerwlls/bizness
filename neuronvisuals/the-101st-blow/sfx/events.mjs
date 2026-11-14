import * as T from "../edit/timing.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
const fwd = (F) => F > 0 && SF[F] === SF[F - 1] + 1;
const outF = (s) => { for (let F = 0; F <= T.REW[0]; F++) if (SF[F] === s) return F; return null; };   // кадр ролика для времени сцены (прямой проход)
const SIL = [T.TURN + 6, T.PULL[0]];
const ev = [[0, "hum", -20, 0, SIL[0] / FPS], [SIL[1], "hum", -20, 0, (N - SIL[1]) / FPS]];
const PAN = [0.25, 0.45, -0.4, 0.3], BASE = [-1, -6, -9, -11];
T.HITS.forEach((H, i) => { for (const [f, n] of H) { const F = outF(f); if (F === null) continue;
  const mont = f > 176 && f < 540, slow = i === 0 && f >= 548;
  ev.push([F, slow ? "hitbig" : "hit", BASE[i] + (mont ? -4 : 0) + (slow ? 3 : 0), PAN[i]]);
  if (i === 0 && f >= 626 && f < 690) ev.push([F + 2, "crack", 0, PAN[i], 0.5]); } });
for (let f = 552; f < T.TURN; f += 30) ev.push([outF(f), "heart", -3, 0]);
for (let i = 1; i < 4; i++) { const q = T.QUIT[i], A = T.AFTER, g = BASE[i] + 2;
  ev.push([outF(q + A.slump + A.release), "clack", g - 4, PAN[i]]);
  for (let k = 0; k < 4; k++) ev.push([outF(q + A.walk + 11 * k), "step", g - 2 - 3 * k, PAN[i] - 0.2]);
  ev.push([outF(q + A.lightOff), "relay", g, PAN[i]]); }
ev.push([outF(T.QUIT[1] + 35), "crack", -4, PAN[1], 0.7]);
ev.push([T.TURN + 2, "sig3", 22, 0], [T.SPLIT[0] + 2, "crack", -6, 0, 0.4]);
for (const [f0] of T.CAPS) ev.push([outF(f0) + 2, "tick", 0, 0]);
for (const [f0, Tt] of T.SHOTS.slice(1)) { const F = outF(f0); if (F < SIL[0] || F > SIL[1]) ev.push([Math.max(0, F - 2), "whoosh", 0, 0, Tt / FPS + 0.15]); }
ev.push([T.PULL[0], "whoosh", 8, 0, 1.6], [T.FACT[0] + 4, "tick", 4, 0], [T.REW[0], "swipe", 6, 0, (T.REW[1] - T.REW[0]) / FPS], [T.PUSH[0] - 2, "whoosh", 8, 0, 0.75]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.filter((e) => e[0] !== null && e[0] >= 0).sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain: +gain.toFixed(1), pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
