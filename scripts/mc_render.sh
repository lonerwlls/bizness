#!/usr/bin/env bash
# Рендер частей «What if Minecraft became real?»: bash scripts/mc_render.sh 1 2 3 4 5 6 7
# → videos/mc/part<N>.mp4 (громкость −14 LUFS) и videos/mc/full.mp4 (все части подряд, если отрендерены все 7)
set -e; cd "$(dirname "$0")/.."
mkdir -p out videos/mc
python3 scripts/mc_sound.py >/dev/null
for N in "$@"; do
  npx remotion render src/mc/index.tsx Fin-mc$N out/_mc$N.mp4 --crf=18 --log=error
  ffmpeg -nostdin -v error -y -i out/_mc$N.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 23 -maxrate 9M -bufsize 16M -c:a aac -b:a 160k -movflags +faststart videos/mc/part$N.mp4
  echo "готово: videos/mc/part$N.mp4"
done
if [ "$(ls out/_mc[1-7].mp4 2>/dev/null | wc -l)" = 7 ]; then
  for i in 1 2 3 4 5 6 7; do echo "file '_mc$i.mp4'"; done > out/_mclist.txt
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/_mclist.txt -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 26 -maxrate 6M -bufsize 12M -c:a aac -b:a 160k -movflags +faststart videos/mc/full.mp4
  echo "готово: videos/mc/full.mp4"
fi
