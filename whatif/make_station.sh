#!/usr/bin/env bash
# Рендер «Метеостанции» + реклама VisionEx (как scripts/make_tale.sh): bash whatif/make_station.sh → videos/stories/station1.mp4
set -e; cd "$(dirname "$0")"; mkdir -p out ../videos/stories
python3 -c "import os;os.chdir('..');exec(open('whatif/station_sound.py').read())"
npx remotion render src/index.ts Station out/_st.mp4 --crf=16 --log=error --concurrency=1 --timeout=300000
AD=../ads/visionex2.mp4; OUT=../videos/stories/station1.mp4
ADLEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $AD)
A1=30.4   # AD1 (29.8) + 0,6 с стоп-кадра — см. src/station/Station.tsx
ms() { python3 -c "print(int($1*1000))"; }
ffmpeg -v error -y -i out/_st.mp4 -i $AD -filter_complex "
 [1:v]chromakey=0x0de914:0.17:0.07,despill=type=green:mix=0.6:expand=0.2,scale=1306:734,setsar=1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [0:v][a1]overlay=(W-w)/2+5:(H-h)/2+10:eof_action=pass:enable='between(t,$A1,$A1+$ADLEN)'[v];
 [1:a]volume=1.6,adelay=$(ms $A1)|$(ms $A1)[x1];
 [0:a][x1]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart $OUT
rm -f out/_st.mp4; echo "готово: $OUT"
