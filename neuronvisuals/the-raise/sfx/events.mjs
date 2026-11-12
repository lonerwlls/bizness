import { phaseAt, standAt, glowAt, vanishF } from "../edit/people.js";
import * as T from "../edit/timing.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const ev = [[0, "neon", -4, 0, T.TURN / FPS], [0, "motor", -6, 0, T.TURN / FPS], [T.RESET - 24, "neon", -4, 0, (N - T.RESET + 24) / FPS], [T.RESET - 24, "motor", -6, 0, (N - T.RESET + 24) / FPS]];
for (let f = 1; f < N; f++) { if (f > T.TURN - 1 && f < T.RESET - 10) continue; const a = phaseAt(f - 1), b = phaseAt(f); for (const off of [0, 0.5]) if (Math.floor(a - off) !== Math.floor(b - off)) ev.push([f, "run", -2, off ? 0.15 : -0.15]); }
for (const [f] of T.RAISES.slice(1, -1)) ev.push([f, "ching", 10, 0]);
ev.push([T.RESET, "ching", 2, 0]);
for (const k of Object.keys(T.ITEMS)) { const [ap, ct] = T.ITEMS[k]; ev.push([ap + 4, "slide", 0, -0.3, (ct - 6 - ap - 4) / FPS], [ct - 2, "grabbox", 4, -0.1]); }
let last = -10; for (let f = T.STRUGGLE[0]; f < T.TURN; f++) if (glowAt(f) < 0.6 && f - last > 3) { ev.push([f, "zap", 2, 0]); last = f; }
ev.push([T.TURN, "sig3", 14, 0]);
ev.push([704, "whoosh", 10, 0, 1.2], [T.TERM[0], "swipe", 12, 0, (T.TERM[1] - T.TERM[0]) / FPS], [vanishF, "zap", 6, 0], [T.APPROVED, "beep", 9, 0], [T.APPROVED + 20, "whoosh", 2, 0.4, 0.9], [832, "whoosh", 11, 0, 2.2]);
for (const [f0, Tt] of T.SHOTS.slice(1)) if (f0 < T.TURN && f0 !== 832) ev.push([f0, "whoosh", 8, 0, Tt / FPS + 0.1]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain, pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
