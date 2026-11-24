import * as T from "../edit/timing.js";
import { stepPhase, PLANTS, glowAt } from "../edit/people.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
const outF = (s) => { for (let F = 0; F <= T.REW[0]; F++) if (SF[F] === s) return F; return null; };
const SIL = [T.TURN + 6, T.PULL[0] - 30];
const quiet = (F) => F >= SIL[0] && F < SIL[1];
const ev = [[0, "wind", -14, 0, SIL[0] / FPS], [SIL[1], "wind", -14, 0, (N - SIL[1]) / FPS]];
// шаги
const PAN = [0.1, -0.3, -0.45];
for (let i = 0; i < 3; i++) for (let F = 1; F <= T.REW[0]; F++) { if (quiet(F) || SF[F] !== SF[F - 1] + 1) continue; const a = stepPhase(i, SF[F - 1]), b = stepPhase(i, SF[F]); if (a === null || b === null) continue;
  if (Math.floor(b * 2) > Math.floor(a * 2)) { const g = glowAt(i, SF[F]); if (g < 0.15) continue; ev.push([F, "step", (i === 0 ? -10 : -15), PAN[i]]); } }
// посадка: ладони в песке, потом росток звенит (три высоты по кругу)
PLANTS.forEach((s, k) => { const F = outF(s + 10); if (F === null || quiet(F)) return; ev.push([F, "dig", -4, 0.1]); ev.push([F + 14, ["sprout", "sprout2", "sprout3"][k % 3], k === 0 ? 0 : -6, 0.1]); });
// год сменился — тик; лес шелестит всё громче
let last = 1; for (let F = 1; F <= T.TURN; F++) { const y = T.yearAt(SF[F]); if (y !== last) { ev.push([F, "tick", y >= 38 ? 4 : -9, 0]); last = y; } }
ev.push([240, "leaves", -14, 0, 4], [380, "leaves", -10, 0, 5], [520, "leaves", -7, 0, 5]);
for (let f = 585; f < T.TURN; f += 30) ev.push([outF(f), "heart", -4, 0]);
ev.push([T.TURN + 2, "sig3", 22, 0]);
ev.push([T.DBACK + 30, "leaves", -6, 0, 3]);
for (const [f0] of T.CAPS) ev.push([outF(f0) + 2, "tick", 0, 0]);
ev.push([outF(T.AFTER_CAP[0]) + 2, "tick", 0, 0]);
for (const [f0, Tt] of T.SHOTS.slice(1)) { const F = outF(f0); if (F < SIL[0] || F > SIL[1]) ev.push([Math.max(0, F - 2), "whoosh", -2, 0, Tt / FPS + 0.15]); }
ev.push([T.PULL[0], "whoosh", 8, 0, 1.6], [T.FACT[0] + 4, "tick", 4, 0], [T.FACT[0] + 24, "sprout", -4, 0], [T.REW[0], "swipe", 6, 0, (T.REW[1] - T.REW[0]) / FPS], [T.PUSH[0] - 2, "whoosh", 8, 0, 0.75]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.filter((e) => e[0] !== null && e[0] >= 0).sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain: +gain.toFixed(1), pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
