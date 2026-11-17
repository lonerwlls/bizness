import * as T from "../edit/timing.js";
import { phaseAt, glowAt } from "../edit/people.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
const outF = (s) => { for (let F = 0; F <= T.REW[0]; F++) if (SF[F] === s) return F; return null; };
const SIL = [T.TURN + 6, T.PULL[0]];
const quiet = (F) => F >= SIL[0] && F < SIL[1];
const ev = [[0, "hum", -22, 0, SIL[0] / FPS], [SIL[1], "hum", -22, 0, (N - SIL[1]) / FPS]];
const PAN = [0.1, -0.25, -0.45], BASE = [-4, -11, -14];
// шаги: касание стопы (фаза пересекает целое или половину)
for (let i = 0; i < 3; i++) for (let F = 1; F <= T.REW[0]; F++) { if (quiet(F)) continue; const a = phaseAt(i, SF[F - 1]), b = phaseAt(i, SF[F]); if (a === null || b === null) continue;
  if (Math.floor(b * 2) > Math.floor(a * 2)) { const g = glowAt(i, SF[F]); if (g < 0.15) continue; const hv = i === 0 ? 1 - Math.min(1, Math.max(0, (T.dayF(SF[F]) - 38) / 25)) : 1; ev.push([F, "step", BASE[i] + 3 * hv + 20 * Math.log10(Math.max(g, 0.05)) * 0.3, PAN[i]]); } }
// смена дня — тик (в монтаже тикает всё чаще)
let last = 1; for (let F = 1; F <= T.TURN; F++) { const d = T.dayAt(SF[F]); if (d !== last) { ev.push([F, "tick", d >= 64 ? 4 : -6, 0]); last = d; } }
for (let i = 1; i < 3; i++) { const q = T.QUIT[i]; ev.push([outF(q + T.AFTER.light[0]), "relay", BASE[i] + 6, PAN[i]]); }
for (let f = 585; f < T.TURN; f += 30) ev.push([outF(f), "heart", -4, 0]);
ev.push([T.TURN + 2, "sig3", 22, 0]);
for (const [f0] of T.CAPS) ev.push([outF(f0) + 2, "tick", 0, 0]);
for (const [f0, Tt] of T.SHOTS.slice(1)) { const F = outF(f0); if (F < SIL[0] || F > SIL[1]) ev.push([Math.max(0, F - 2), "whoosh", -2, 0, Tt / FPS + 0.15]); }
ev.push([T.PULL[0], "whoosh", 8, 0, 1.6], [T.FACT[0] + 4, "tick", 4, 0], [T.FACT[0] + 30, "hitbig", -10, 0], [T.REW[0], "swipe", 6, 0, (T.REW[1] - T.REW[0]) / FPS], [T.PUSH[0] - 2, "whoosh", 8, 0, 0.75]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.filter((e) => e[0] !== null && e[0] >= 0).sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain: +gain.toFixed(1), pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
