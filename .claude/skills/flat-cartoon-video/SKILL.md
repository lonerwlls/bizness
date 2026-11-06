---
name: flat-cartoon-video
description: Main channel style = EXACTLY the look of the Minecraft video in src/mc (blocky cube world, flat bright 2D cartoon "what if…" videos, 16:9 1920x1080, English Fish Audio voice, cuts tied to voice words, no captions; long videos made as ~1-min parts joined by a block-wipe transition). Use for ANY new video request from this user ("сделай ролик", "новая тема", "как Minecraft", "в нашем стиле"), unless they name another style.
---

# Flat 2D cartoon video (main style)

Talk to the user in short, plain Russian. The user is a beginner on a phone, so do all the work yourself and give them only results and yes/no questions.

## THE reference: the Minecraft video (`src/mc/`)
The user said: "the same style as the Minecraft video". Every new video must look like `videos/mc/full.mp4`. Do NOT use `src/blind/` as a sample; it was an early test in a different style.

How to start a new video `<id>`:
1. **Copy the code:** `cp -r src/mc src/<id>`, then register the new compositions (`Fin-<id>1…`) in `src/Root.tsx` / `index` the same way `Fin-mc*` are.
2. **Copy the scripts:** copy `scripts/mc_sound.py`, `mc_events.json`, `mc_preview.sh` and `mc_render.sh` to `<id>_*` and change the paths (`public/mc` → `public/<id>`, `Fin-mc` → `Fin-<id>`, `videos/mc` → `videos/<id>`).
3. **Keep the kit as it is:** keep `kit.tsx` and `scenes.tsx` (blocks, `Street` / `Room` / `Land`, sky, haze, glow, `Grade`, `BlockWipe`, animals, items). Change only the story, the shot lists in `partN.tsx`, the scripts and the sound events. New things go in `kit.tsx`, built from blocks and flat shapes in the same style.

What the Minecraft video is made of:
- **`kit.tsx`:**
  - Constants: `B=200` is one block and `GY=900` is the ground.
  - Camera and layers: `Layer` / `Cam` / `camLerp` for parallax.
  - Blocks: `Blk` / `G(c,r)` with `gx` / `gy`.
  - World pieces: `Ground`, `Tree`, `Tower`, `SqSun`, `Cloud`, `Backdrop(tod: dawn/day/dusk/night)`, `BlockCar`.
  - Objects and creatures: `Item`, `Drop`, `Torch`, `Cow` / `Chicken` / `Dog` / `Bee` (blocky), monsters `Shade` / `Groaner` / `Bony`, `Fire`, `Earth`, `Stars`, `Hearts`, `FoodBar`, `Phone`.
  - Assembly: `makePart` and `BlockWipe`.
- **`scenes.tsx`:** `Street` (the blocky town), `Room` (a plank room with a window) and `Land` (nature and hills). Backgrounds are scaled to 0.42 with haze.
- **Characters:** `Bean` from `src/toontest/bean.tsx`.
  - The hero is always `HERO2D`: orange jacket, yellow backpack, beanie with pompom.
  - Props: `expr`, `open`, `blind`, `sweat`, `pose`, `holdR` / `holdL`, `lying`.
  - Extra people use `LOOKS` / `PAJAMA` / `BANKER` / `DOCTOR`.

## Look
- **Drawing:** exactly as in `src/mc`: a world of cubes, flat bright 2D cartoon (IFology / Monk Mode Films vibe), drawn as SVG with thick black ink outlines and saturated colours.
- **Light:** pink, purple and blue light with yellow lights and glow.
- **Depth:** far layers are blurred, the camera has parallax, and there is a vignette. Never 3D, anime or realism.
- **Format:** 16:9, 1920×1080, 30 fps. Everything the viewer sees or hears is in English.
- **No captions or on-screen text**, unless the user asks for them.
- **Backgrounds** stay small and hazy so the characters dominate.
- **Staging:** feet stand exactly on the ground (`GY` / `gy(r)`), so nothing floats and nothing sinks. Animals and objects are drawn in the same style; in Minecraft they are also blocky.
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
- Every part except the last ends with a `BlockWipe` covering the screen and the next part opens with it, so the parts join into one video. The last part fades to black.

## Workflow (user rules)
1. For a long video, write all the scripts, then make **only part 1**, send it, and wait for corrections and a "yes". Only after that do the other parts.
2. Check frames before any full render: run `npx tsc`, then `bash scripts/mc_preview.sh N` (or the copy you made), and look at the sheet yourself.
3. Render, commit and push `videos/...mp4`, and send it with SendUserFile. Every file must be under 100 MB.
4. **No thumbnails** unless the user asks. If they ask: 1280×720, the hero big on the right, a huge title on the left in Montserrat 900 with white and yellow lines.

Setup once per session: `npm install`, plus ffmpeg if it is missing (see CLAUDE.md).
