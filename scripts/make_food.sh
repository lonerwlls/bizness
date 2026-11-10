#!/usr/bin/env bash
# Рендер части N сериала про еду: bash scripts/make_food.sh 1 → videos/food/part1.mp4 (только голос, громкость выровнена)
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/food
N=$1
npx remotion render src/food/index.tsx Food-$N out/_food$N.mp4 --crf=18 --log=error
ffmpeg -v error -y -i out/_food$N.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart videos/food/part$N.mp4
rm -f out/_food$N.mp4; echo "готово: videos/food/part$N.mp4"
