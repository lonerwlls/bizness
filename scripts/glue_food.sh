#!/usr/bin/env bash
# Склейка 10 частей в один фильм + фоновая музыка: bash scripts/glue_food.sh → videos/food/food_full.mp4
set -e; cd "$(dirname "$0")/.."; mkdir -p out
D=$(for i in $(seq 1 10); do ffprobe -v error -show_entries format=duration -of csv=p=0 videos/food/part$i.mp4; done | tr '\n' ' ')
[ -f public/food/music_full.mp3 ] || python3 scripts/food_music.py $D
rm -f out/food_list.txt; for i in $(seq 1 10); do echo "file '$PWD/videos/food/part$i.mp4'" >> out/food_list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/food_list.txt -c copy out/food_concat.mp4
ffmpeg -v error -y -i out/food_concat.mp4 -i public/food/music_full.mp3 -filter_complex "[1:a]lowpass=f=3500,highpass=f=40,aresample=48000,loudnorm=I=-31:TP=-6:LRA=11[m];[0:a]aresample=48000[v];[v][m]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart videos/food/food_full.mp4
rm -f out/food_concat.mp4; echo "готово: videos/food/food_full.mp4"
