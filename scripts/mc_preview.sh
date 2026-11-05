#!/usr/bin/env bash
# Быстрый предпросмотр части N: рендер в 1/4 размера и лист кадров (каждые 2 сек) → out/mc<N>_sheet.png
set -e; cd "$(dirname "$0")/.."
N=$1; mkdir -p out
npx remotion render src/mc/index.tsx Fin-mc$N out/mc${N}_prev.mp4 --scale=0.25 --log=error --muted
ffmpeg -v error -y -i out/mc${N}_prev.mp4 -vf "fps=1/2,tile=5x6:padding=4" -frames:v 1 out/mc${N}_sheet.png
echo out/mc${N}_sheet.png
