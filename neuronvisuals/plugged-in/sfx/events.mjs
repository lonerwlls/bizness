import { glowAt } from "../edit/people.js";
import { iconPos } from "../edit/world.js";
import * as T from "../edit/timing.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const ev = [[0, "motor", -14, 0, T.TURN / FPS], [T.UNLOCK, "motor", -14, 0, (N - T.UNLOCK) / FPS]];
const cuts = [0, ...T.SUBS.slice(0, -1).map((s) => s[0]), T.TURN];
for (let i = 0; i + 1 < cuts.length; i++) { const g = glowAt(cuts[i] + 15); ev.push([cuts[i], "neon", -4 + 20 * Math.log10(Math.max(0.05, g)), 0, (cuts[i + 1] - cuts[i]) / FPS]); }
ev.push([T.UNLOCK, "neon", -4, 0, (N - T.UNLOCK) / FPS]);
for (const [t0, , , icon] of T.SUBS) { const A = iconPos(icon), pan = Math.max(-0.7, Math.min(0.7, A[0] / 4)); ev.push([t0 - T.FLY, "whoosh", 2, pan, (T.FLY + 3) / FPS], [t0, "plug", 12, pan * 0.5]); if (t0 < T.TURN) ev.push([t0 + 2, "zap", 0, 0], [t0 + 4, "tick", 7, 0]); }
ev.push([T.STAND[0], "cloth", 14, 0, 0.8], [T.STAND[0] + 34, "creak", 14, 0], [T.STAND[1] - 8, "whoosh", 2, 0, 0.3], [T.STAND[1], "grabbox", 6, 0]);
ev.push([T.TURN + 1, "zap", 4, 0], [T.TURN + 3, "sig3", 22, 0]);
ev.push([T.REVEAL, "whoosh", 10, 0, 1.4], [T.LOCK, "lock", 14, 0], [T.UNLOCK, "unlock", 12, 0], [T.UNLOCK + 2, "zap", 0, 0], [T.UNLOCK + 4, "whoosh", 9, 0, 1.6]);
for (const [f0, Tt] of T.SHOTS.slice(1)) if (f0 < T.TURN - 5) ev.push([f0, "whoosh", 4, 0, Tt / FPS + 0.1]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain: +gain.toFixed(1), pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
