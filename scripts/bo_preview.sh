#!/usr/bin/env bash
# Предпросмотр части N: рендер в 0.4 размера и кадры из середины каждого плана → out/spN_sheet*.png
set -e; cd "$(dirname "$0")/.."
N=$1; mkdir -p out
npx remotion render src/bo/index.tsx Fin-bo$N out/bo${N}_prev.mp4 --scale=0.4 --log=error --muted
ffmpeg -v error -y -i out/bo${N}_prev.mp4 -vf "fps=1,tile=4x4:padding=4" out/bo${N}_sheet%d.png
ls out/bo${N}_sheet*.png
