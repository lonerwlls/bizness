#!/usr/bin/env bash
# Вставка баннера ровно в середину ролика: основное видео на паузе (стоп-кадр, затемнён, звук выключен),
# поверх — баннер ads/banner.mp4 без зелёного фона, со своим звуком. Потом ролик продолжается.
# bash scripts/insert_ad.sh <in.mp4> <out.mp4> [ads/banner.mp4]
set -e; cd "$(dirname "$0")/.."
IN=$1; OUT=$2; AD=${3:-ads/banner.mp4}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
A=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AD")
W=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$IN")
M=$(python3 -c "print(round(round($D/2*30)/30,4))")
AW=$(python3 -c "print(int($W*0.92)//2*2)")
echo "середина: $M c, баннер: $A c"
ffmpeg -v error -y -i "$IN" -i "$AD" -filter_complex "
[0:v]split=3[v0][v1][v2];
[v0]trim=0:$M,setpts=PTS-STARTPTS[pa];
[v1]trim=start=$M:duration=0.04,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=$A,trim=0:$A,eq=brightness=-0.18:saturation=0.7,boxblur=6[fr];
[1:v]fps=30,chromakey=0x00ff00:0.28:0.08,scale=$AW:-2,format=yuva420p[ad];
[fr][ad]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p,setpts=PTS-STARTPTS[pb];
[v2]trim=start=$M,setpts=PTS-STARTPTS[pc];
[pa][pb][pc]concat=n=3:v=1:a=0[v];
[0:a]asplit=2[x0][x1];
[x0]atrim=0:$M,asetpts=PTS-STARTPTS[aa];
[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$A,asetpts=PTS-STARTPTS[ab];
[x1]atrim=start=$M,asetpts=PTS-STARTPTS[ac];
[aa]aresample=48000,aformat=channel_layouts=stereo[aa2];[ac]aresample=48000,aformat=channel_layouts=stereo[ac2];
[aa2][ab][ac2]concat=n=3:v=0:a=1[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 160k -movflags +faststart "$OUT"
echo "готово: $OUT"
