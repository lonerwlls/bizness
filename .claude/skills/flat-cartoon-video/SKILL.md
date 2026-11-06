---
name: flat-cartoon-video
description: Main channel style (approved 2026-11-05) — flat bright 2D cartoon "what if…" explainer videos, 16:9 1920x1080, English Fish Audio voice, cuts tied to voice words, no captions; long videos made as ~1-min parts joined by a block-wipe transition. Use for ANY new video request from this user ("сделай ролик", "новая тема", "как Minecraft/blind", "в нашем стиле"), unless they name another style.
---

# Flat 2D cartoon video (main style)

Talk to the user in short, plain Russian. The user is a beginner on a phone, so do all the work yourself and give them only results and yes/no questions.

## Working samples (copy these, don't start from zero)
- **10-second sample:** `src/blind/blind.tsx` (composition `Fin-blind`), with sound from `scripts/blind_sound.py`.
- **7-part, 7-minute video:** "What if Minecraft became real?". Copy its whole layout for a new multi-part video:
  - `src/mc/kit.tsx`: camera, layers, blocks, items, animals, monsters, `makePart`, `BlockWipe`.
  - `src/mc/scenes.tsx`: ready scenes `Street`, `Room`, `Land`.
  - `src/mc/partN.tsx`: shot lists. Each shot is `{ at: "word", n?, s: (g, f, len) => JSX }`.
  - `src/mc/index.tsx`: compositions `Fin-mc1`…`Fin-mc7`.
  - `public/mc/pN/script.txt` and `voice.mp3`, plus `src/mc/voices/pN.ts`.
  - `scripts/mc_sound.py` with `scripts/mc_events.json` for music and sound effects; one continuous music track is cut per part.
  - `scripts/mc_preview.sh N` builds a fast contact sheet; `scripts/mc_render.sh 1 2 …` renders the parts and `videos/<id>/full.mp4`.
- **Characters:** `Bean` from `src/toontest/bean.tsx`.
  - The hero is always `HERO2D`: orange jacket, yellow backpack, beanie with pompom.
  - Props: `expr`, `open`, `blind`, `sweat`, `pose`, `holdR` / `holdL`, `lying`.
  - Extra people use the looks in `LOOKS` / `PAJAMA` / `BANKER` / `DOCTOR`.

## Look
- **Drawing:** flat bright 2D cartoon (IFology / Monk Mode Films vibe), drawn as SVG with thick black ink outlines and saturated colours.
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
