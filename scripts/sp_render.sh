#!/usr/bin/env bash
# Рендер частей «What If You Woke Up With Every Superpower?»: bash scripts/sp_render.sh 1 2 ... 8
# → videos/sp/part<N>.mp4 (громкость −14 LUFS) и videos/sp/full.mp4 (все части подряд, если отрендерены все 7)
set -e; cd "$(dirname "$0")/.."
mkdir -p out videos/sp
python3 scripts/sp_sound.py >/dev/null
for N in "$@"; do
  npx remotion render src/sp/index.tsx Fin-sp$N out/_sp$N.mp4 --crf=18 --log=error
  ffmpeg -nostdin -v error -y -i out/_sp$N.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 23 -maxrate 9M -bufsize 16M -c:a aac -b:a 160k -movflags +faststart videos/sp/part$N.mp4
  echo "готово: videos/sp/part$N.mp4"
done
if [ "$(ls out/_sp[1-8].mp4 2>/dev/null | wc -l)" = 8 ]; then
  for i in 1 2 3 4 5 6 7 8; do echo "file '_sp$i.mp4'"; done > out/_splist.txt
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/_splist.txt -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 26 -maxrate 6M -bufsize 12M -c:a aac -b:a 160k -movflags +faststart videos/sp/full.mp4
  echo "готово: videos/sp/full.mp4"
fi
