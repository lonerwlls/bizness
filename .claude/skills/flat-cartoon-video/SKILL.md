---
name: flat-cartoon-video
description: Main channel style = EXACTLY the look of the 10-second sample src/blind/blind.tsx (normal night city, flat bright 2D cartoon "what if…" videos; NOT blocky like Minecraft, 16:9 1920x1080, English Fish Audio voice, cuts tied to voice words, no captions; long videos made as ~1-min parts joined by a transition). Use for ANY new video request from this user ("сделай ролик", "новая тема", "как пример про слепоту", "в нашем стиле"), unless they name another style.
---

# Flat 2D cartoon video (main style)

Talk to the user in short, plain Russian. The user is a beginner on a phone, so do all the work yourself and give them only results and yes/no questions.

## THE picture reference: `src/blind/blind.tsx` (10-second sample)
The user said: "I need this style", meaning the 10-second sample where everyone goes blind and cars crash (`videos/blind.mp4`, composition `Fin-blind`). Every new video must look like it:
- **The city:** a normal night city, not blocks.
  - Two layers of buildings: `FAR` / `MID` from `makeBlds`, purple and blue with lit yellow windows.
  - On the street: lamps, traffic lights, cars (`Car`, which can show a `dent`), `Smoke` and a crowd of `Bean` people.
  - Lighting and finish: `Glow` gradients, blurred far layers, `Layer` / `Cam` parallax, `Grade` with a vignette.
- **Start from its code:** copy `blind.tsx` (`World`, `Building`, `Lamp`, `TrafficLight`, `Car`, `Smoke`, `Crowd`, `Defs`, `Grade`) into a shared kit for the new video. Add new places and objects drawn the same way (flat SVG, thick ink outline, the same palette).
- **Characters:** `Bean` from `src/toontest/bean.tsx`.
  - The hero is always `HERO2D`: orange jacket, yellow backpack, beanie with pompom.
  - Props: `expr`, `open`, `blind`, `sweat`, `pose`, `holdR` / `holdL`, `lying`.

## Backgrounds and story format (user decisions, 2026-11-10)
- **Backgrounds:** do not reuse one shared world. Each scene gets its own background for the place the hero is in right now (apartment, stairwell, street, store, rooftop, hospital…), drawn in the same flat style. The seaside town from `src/sp` is retired.
- **"Disaster, day by day" format:**
  - Narrated in second person.
  - Shape: a normal day, then the disaster, then the hero lives through it day by day (day 1 … day 30), then the ending and a question to viewers.
  - The voice names the days. Nothing is written on screen; show passing time with visuals such as tally marks.
- **Reusable code:** `src/sp/kit.tsx`, from the 8-part "superpowers" video, provides `makePart` with a `dir` option, `Bean` helpers, `Layer`/`Cam`, `Glow`, the flare transition, and props. Example of a new topic: `src/bo/` (blackout).

## What to take from the Minecraft video (`src/mc/`): only the way a long video is built
- **Reuse the machinery:**
  - Shot lists: `{ at: "word", n?, s: (g, f, len) => JSX }`.
  - Assembly: `makePart(V, shots, {id, last})`.
  - Sound: one continuous music track cut per part (`scripts/mc_sound.py` + `mc_events.json`).
  - Checks and output: `mc_preview.sh` contact sheet; `mc_render.sh` renders the parts and `full.mp4`.
- **Do NOT reuse the look:** no cube world, no Minecraft blocks or animals. For the join between parts, use a transition that fits a normal city instead of `BlockWipe`: a dark flash, or the camera flying into a window or light.

## Look
- **Drawing:** exactly as in `src/blind/blind.tsx`: a normal (not blocky) world, flat bright 2D cartoon (IFology / Monk Mode Films vibe), drawn as SVG with thick black ink outlines and saturated colours.
- **Light:** pink, purple and blue light with yellow lights and glow.
- **Depth:** far layers are blurred, the camera has parallax, and there is a vignette. Never 3D, anime or realism.
- **Format:** 16:9, 1920×1080, 30 fps. Everything the viewer sees or hears is in English.
- **No captions or on-screen text**, unless the user asks for them.
- **Backgrounds** stay small and hazy so the characters dominate.
- **Staging:** feet stand exactly on the ground (`GY` / `gy(r)`), so nothing floats and nothing sinks. Animals and objects are drawn in the same style.
- **No copied characters or textures** from real games or channels. All designs are our own.

## Voice (Fish Audio)
- **Script:** each part is about 170–190 words, which is about 60 s. Write numbers as words, check the facts, and do not repeat the previous part's last line.
- **Command:**
  `node scripts/tts_fish.mjs full public/<id>/pN src/<id>/voices/pN.ts public/<id>/pN/script.txt b5f4515fd395410b9ed3aef6fa51d9a0`
- **Speed:** normal. Never set `FISH_SPEED`, because speed-up sounds robotic.
- **Word timings** come from `scripts/fish_align.py`. It needs `pip install faster-whisper` once.
- **Mix:** the voice is loud and on top. Sound effects are quiet (about 0.2), and music is quiet too.

## Editing
- Cut every 1–2 s, and tie cuts and events to voice words with `atWord(V, "word", n)`.
- Every part except the last ends with a transition (not cubes) and the next part opens with it, so the parts join into one video. The last part fades to black.

## Workflow (user rules)
1. For a long video, write all the scripts, then make **only part 1**, send it, and wait for corrections and a "yes". Only after that do the other parts.
2. Check frames before any full render: run `npx tsc`, then `bash scripts/mc_preview.sh N` (or the copy you made), and look at the sheet yourself.
3. Render, commit and push `videos/...mp4`, and send it with SendUserFile. Every file must be under 100 MB.
4. **No thumbnails** unless the user asks. If they ask: 1280×720, the hero big on the right, a huge title on the left in Montserrat 900 with white and yellow lines.

Setup once per session: `npm install`, plus ffmpeg if it is missing (see CLAUDE.md).
