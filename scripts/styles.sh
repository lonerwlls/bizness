#!/usr/bin/env bash
# Пробники стилей: 9 роликов по 5 сек в videos/styles/ + общий videos/styles/all.mp4
set -e
cd "$(dirname "$0")/.."
mkdir -p out videos/styles
ENC="-c:v libx264 -preset medium -crf 22 -maxrate 11M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart"
for st in flat neon comic paper clay watercolor noir; do
  npx remotion render src/styles/index.ts "Style-$st" "out/_st_$st.mp4" --crf=16 --log=error
  ffmpeg -nostdin -v error -y -i "out/_st_$st.mp4" -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" $ENC "videos/styles/$st.mp4"
done
# пиксель-арт: 180×320, 24 цвета, 12 кадров/с
ffmpeg -nostdin -v error -y -i out/_st_flat.mp4 -vf "fps=12,scale=180:320:flags=area,palettegen=max_colors=40" -frames:v 1 out/_pal.png
ffmpeg -nostdin -v error -y -i out/_st_flat.mp4 -i out/_pal.png -filter_complex "[0:v]fps=12,scale=180:320:flags=area[s];[s][1:v]paletteuse=dither=none,scale=1080:1920:flags=neighbor,fps=30[v]" -map "[v]" -map 0:a -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" $ENC videos/styles/pixel.mp4
# карандашный набросок: контуры + бледный цвет на бумаге
ffmpeg -nostdin -v error -y -i out/_st_flat.mp4 -filter_complex "[0:v]split[a][b];[a]format=gray,edgedetect=low=0.02:high=0.06,negate,erosion,erosion,format=gbrp[e];[b]hue=s=0.6,eq=brightness=0.22:contrast=0.55,format=gbrp[c];[c][e]blend=all_mode=multiply,noise=alls=10:allf=t,format=yuv420p[v]" -map "[v]" -map 0:a -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" $ENC videos/styles/sketch.mp4
# всё подряд одним файлом
: > out/_list.txt
for st in flat neon comic paper clay watercolor noir pixel sketch; do echo "file '../videos/styles/$st.mp4'" >> out/_list.txt; done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/_list.txt $ENC videos/styles/all.mp4
ls -la videos/styles
