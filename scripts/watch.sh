#!/usr/bin/env bash
# Просмотр готового видео: кадры каждые 0,5 с → листы 5×4 out/watch/<имя>_N.png
set -e; cd "$(dirname "$0")/.."
f=$1; n=$(basename "$f" .mp4); mkdir -p out/watch; rm -f out/watch/${n}_*.png
ffmpeg -v error -y -i "$f" -vf "fps=2,scale=384:-1,tile=5x4:padding=3" out/watch/${n}_%d.png
ls out/watch/${n}_*.png
