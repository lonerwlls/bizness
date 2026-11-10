#!/usr/bin/env bash
# Рендер шортса про еду: bash scripts/make_foodshort.sh → videos/food/short_part1.mp4
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/food
npx remotion render src/foodshort/index.tsx FoodShort out/_fs.mp4 --crf=18 --log=error --concurrency=4
ffmpeg -v error -y -i out/_fs.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart videos/food/short_part1.mp4
rm -f out/_fs.mp4; echo "готово: videos/food/short_part1.mp4"
