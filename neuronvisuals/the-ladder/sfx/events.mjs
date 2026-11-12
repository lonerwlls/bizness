import { CLIMB_EVENTS, heroAt } from "../edit/people.js";
import { PLAQUES, ladderAt } from "../edit/world.js";
import * as T from "../edit/timing.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const ev = [[0, "hum", -2, 0.3, T.LAMP_DIM / FPS], [T.LAMP_DIM, "hum", -9, 0.3, (T.LAMP_DIE[1] - T.LAMP_DIM) / FPS]];
for (const [f, limb] of CLIMB_EVENTS) if (f < T.MANTLE[0] + 2) ev.push([f, limb.endsWith("H") ? "grab" : "mstep", limb.endsWith("H") ? 5 : 1, limb.startsWith("L") ? -0.2 : 0.2]);
const H = []; for (let f = 0; f < N; f++) H.push(heroAt(f));
for (const [, s] of PLAQUES) { const y = ladderAt(s)[1]; const f = H.findIndex((h) => h.chest[1] > y); if (f > 0) ev.push([f, "ding", 3, -0.3]); }
for (const [f0, Tt] of T.SHOTS.slice(1)) ev.push([f0, "whoosh", 4, 0, Tt / FPS + 0.1]);
ev.push([T.KID_PICK[0], "paper", 5, 0.3, 0.3], [T.KID_UP[0], "paper", 5, 0.3, 0.35], [T.KID_WAVE[0] + 4, "paper", 4, 0.3, 0.6], [T.SHAKE[0], "cloth", 4, 0, 0.5], [T.WIFE_LOOK_UP[0], "creak", -2, 0.4]);
// подросток
ev.push([T.TEEN_STAND[0], "creak", 0, 0.2], [T.TEEN_STAND[0] + 2, "cloth", 3, 0.2, 0.5], [T.TEEN_DROP[0], "paper", 4, 0.2, 0.3], [T.TEEN_DROP[1], "paper", 3, 0.2, 0.5]);
for (let f = T.TEEN_WALK[0] + 6 + 13; f < T.TEEN_FADE[1]; f += 13) ev.push([f, "fstep", -1, -0.2]);
// жена
ev.push([T.WIFE_STAND[0], "creak", 0, 0.4], [T.WIFE_STAND[0] + 2, "cloth", 3, 0.4, 0.6], [T.WIFE_REACH[0], "cloth", 2, 0.3, 0.4], [T.LAMP_DIM, "relay", 4, 0.2]);
for (let f = T.WIFE_WALK[0] + 6 + 15; f < T.WIFE_FADE[1]; f += 15) ev.push([f, "fstep", -1, 0.4]);
// верх
ev.push([T.MANTLE[0] + 6, "mstep", 2, 0], [T.MANTLE[0] + 15, "grab", 3, 0], [T.MANTLE[0] + 26, "cloth", 4, 0, 0.5], [T.MANTLE[0] + 38, "fstep", 2, 0.1], [T.TURN, "boom", 7, 0], [T.TURN, "wind", 3, 0, (N - T.TURN) / FPS]);
ev.push([T.TURN_BACK[0] + 4, "fstep", 0, -0.1], [T.TURN_BACK[0] + 11, "fstep", 0, 0.1]);
for (const f of [T.LAMP_DIE[0] + 2, T.LAMP_DIE[0] + 6, T.LAMP_DIE[0] + 11]) ev.push([f, "relay", 0, 0.2]);
ev.push([T.LAMP_DIE[1], "relay", 3, 0.2], [T.SIT[0] + 4, "cloth", 3, 0, 0.6], [T.SIT[1], "mstep", -2, 0]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain, pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
