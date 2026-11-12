import { SFX, N, FPS } from "./timing_tmp.mjs";
import { writeFileSync } from "fs";
const tl = { fps: FPS, duration_sec: N / FPS, sfx: SFX.map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain, pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
