import { phase, fadeAt, GREED_FALL } from "../edit/people.js";
import * as T from "../edit/timing.js";
import { writeFileSync } from "fs";
const { N, FPS } = T;
const SIL = [T.TURN + 4, T.TURN + 52];          // тишина после трёх нот
const quiet = (F) => F >= SIL[0] && F < SIL[1];
const ev = [[0, "neon", -16, 0, SIL[0] / FPS], [SIL[1], "neon", -16, 0, (N - SIL[1]) / FPS]];
const SF = []; for (let F = 0; F <= N; F++) SF.push(T.sceneTime(F));
// шаги: касание ступни, когда фаза пересекает 0 или 0.5 (только когда время сцены идёт вперёд)
T.RUNNERS.forEach((r, i) => { const pan = { HYPE: -0.5, FEAR: -0.2, FOMO: -0.2, GREED: 0.2, PATIENCE: 0.45 }[r[0]];
  for (let F = 1; F <= N; F++) { if (SF[F] !== SF[F - 1] + 1 || quiet(F)) continue; const a = phase(i, SF[F - 1]) * 2, b = phase(i, SF[F]) * 2;
    const g = fadeAt(i, SF[F]); if (g < 0.15) continue;
    if (r[0] === "FOMO" && SF[F] < T.FOMO.land) continue;
    if (Math.floor(b) > Math.floor(a)) ev.push([F, "run", (r[0] === "PATIENCE" ? -1 : -5) + 20 * Math.log10(g), pan]); } });
// сюжет
ev.push([T.FEAR.stop[0], "slide", 4, -0.2, 0.45], [T.FEAR.turn[0] + 2, "lock", 6, -0.2], [T.FEAR.turn[0] + 4, "beep", -6, -0.2], [T.FEAR.turn[1], "whoosh", 0, -0.4, 0.6]);
ev.push([T.GREED.sprint[0], "whoosh", 4, 0.2, 0.8], [GREED_FALL, "whoosh", 8, 0.3, 0.9], [GREED_FALL + 4, "zap", 4, 0.3], [GREED_FALL + 12, "zap", 0, 0.3], [GREED_FALL + 20, "zap", -4, 0.3]);
ev.push([T.HYPE.turn[0], "tick", -2, -0.5], [T.HYPE.fade[0] + 4, "zap", -6, -0.5]);
ev.push([T.FOMO.show, "whoosh", 6, -0.2, 0.6], [T.FOMO.land, "grabbox", 8, -0.2], [T.FOMO.sold, "lock", 6, -0.2], [T.FOMO.sold + 2, "beep", -6, -0.2], [T.FOMO.fade[0] + 6, "zap", -2, -0.2]);
for (const [f0] of T.STAGES) ev.push([f0 + 2, "tick", 2, 0]);
for (const [f0, Tt] of T.SHOTS.slice(1)) if (!quiet(f0)) ev.push([Math.max(0, f0 - 2), "whoosh", 2, 0, Tt / FPS + 0.15]);
ev.push([T.TURN, "sig3", 22, 0]);
ev.push([T.PULL[0], "whoosh", 9, 0, 1.6], [T.PULL[0] + 24, "unlock", 8, 0], [T.FACT[0] + 8, "ching", 4, 0], [T.FACT[0] + 30, "lock", 8, 0], [T.FACT[0] + 32, "beep", -4, 0]);
ev.push([T.REW[0], "swipe", 6, 0, (T.REW[1] - T.REW[0]) / FPS], [T.PUSH[0] - 2, "whoosh", 8, 0, 0.75]);
const tl = { fps: FPS, duration_sec: N / FPS, sfx: ev.sort((a, b) => a[0] - b[0]).map(([f, kind, gain, pan, dur]) => { const e = { t_sec: +(f / FPS).toFixed(4), kind, gain: +gain.toFixed(1), pan }; if (dur) e.dur_sec = dur; return e; }) };
writeFileSync(new URL("./timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
console.log(tl.sfx.length, "events");
