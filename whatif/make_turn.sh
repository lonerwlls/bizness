#!/usr/bin/env bash
# Рендер «Лишний на турникете», часть N + реклама VisionEx: bash whatif/make_turn.sh N → videos/stories/turnN.mp4
N=${1:?номер части}
set -e; cd "$(dirname "$0")"; mkdir -p out ../videos/stories
python3 -c "import os;os.chdir('..');import subprocess;subprocess.run(['python3','whatif/turn_sound.py','$N'],check=True)"
# кусками по 300 кадров (длинный рендер одной вкладкой падает на загрузке шрифтов), каждый кусок — до 3 попыток
TOTAL=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v c="Turn$N" '$1==c{print $4}'); TOTAL=${TOTAL:-1800}
rm -f out/_parts$N.txt; i=0
for a in $(seq 0 150 $((TOTAL-1))); do
  b=$((a+149)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  for try in 1 2 3; do npx remotion render src/index.ts Turn$N out/_p${N}_$i.mp4 --frames=$a-$b --muted --crf=16 --log=error --concurrency=1 --timeout=300000 && break; done
  echo "file '_p${N}_$i.mp4'" >> out/_parts$N.txt; i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i out/_parts$N.txt -c copy out/_v$N.mp4
npx remotion render src/index.ts Turn$N out/_a$N.wav --codec=wav --log=error   # звук целиком одним проходом
ffmpeg -v error -y -i out/_v$N.mp4 -i out/_a$N.wav -c:v copy -c:a aac -b:a 192k -shortest out/_st$N.mp4
rm -f out/_p${N}_*.mp4 out/_parts$N.txt out/_v$N.mp4 out/_a$N.wav
AD=../ads/visionex2.mp4; OUT=../videos/stories/turn$N.mp4
ADLEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $AD)
A1=$(python3 -c "print({1:28.7,2:24.52,3:21.48}[$N])")
ms() { python3 -c "print(int($1*1000))"; }
ffmpeg -v error -y -i out/_st$N.mp4 -i $AD -filter_complex "
 [1:v]chromakey=0x0de914:0.17:0.07,despill=type=green:mix=0.6:expand=0.2,scale=1306:734,setsar=1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [0:v][a1]overlay=(W-w)/2+5:(H-h)/2+10:eof_action=pass:enable='between(t,$A1,$A1+$ADLEN)'[v];
 [1:a]volume=1.6,adelay=$(ms $A1)|$(ms $A1)[x1];
 [0:a][x1]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart $OUT
rm -f out/_st$N.mp4; echo "готово: $OUT"
