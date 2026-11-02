#!/usr/bin/env bash
# Пиксель-арт из обычного рендера: контуры → 270×480 → палитра 48 цветов → увеличение ×4, 15 кадров/с.
# Запуск: bash scripts/pixel.sh <вход.mp4> <выход.mp4>
set -e
IN=$1; OUT=$2; T=out/_px
PRE="[0:v]split[a][b];[a]format=gray,edgedetect=low=0.03:high=0.09,negate,erosion,format=gbrp[e];[b]format=gbrp[c];[c][e]blend=all_mode=multiply,fps=15,scale=270:480:flags=area"
ffmpeg -nostdin -v error -y -i "$IN" -filter_complex "$PRE,palettegen=max_colors=48:stats_mode=full" -frames:v 1 ${T}_pal.png
ffmpeg -nostdin -v error -y -i "$IN" -i ${T}_pal.png -filter_complex "$PRE[s];[s][1:v]paletteuse=dither=bayer:bayer_scale=4,scale=1080:1920:flags=neighbor,fps=30,format=yuv420p[v]" \
  -map "[v]" -map 0:a -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k -movflags +faststart "$OUT"
