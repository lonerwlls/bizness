#!/usr/bin/env bash
# Рендер частей «Alone in a city after a total blackout»: bash scripts/bo_render.sh 1 2 ... 8
# → videos/bo/part<N>.mp4 (громкость −14 LUFS) и videos/bo/full.mp4 (все части подряд, если отрендерены все 7)
set -e; cd "$(dirname "$0")/.."
mkdir -p out videos/bo
python3 scripts/bo_sound.py >/dev/null
for N in "$@"; do
  npx remotion render src/bo/index.tsx Fin-bo$N out/_bo$N.mp4 --crf=18 --log=error
  ffmpeg -nostdin -v error -y -i out/_bo$N.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 23 -maxrate 9M -bufsize 16M -c:a aac -b:a 160k -movflags +faststart videos/bo/part$N.mp4
  echo "готово: videos/bo/part$N.mp4"
done
if [ "$(ls out/_bo{1,2,3,4,5,6,7,8,9,10}.mp4 2>/dev/null | wc -l)" = 10 ]; then
  for i in 1 2 3 4 5 6 7 8 9 10; do echo "file '_bo$i.mp4'"; done > out/_bolist.txt
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/_bolist.txt -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
    -c:v libx264 -preset veryfast -crf 26 -maxrate 6M -bufsize 12M -c:a aac -b:a 160k -movflags +faststart videos/bo/full.mp4
  echo "готово: videos/bo/full.mp4"
fi
