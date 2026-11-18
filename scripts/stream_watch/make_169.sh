#!/bin/bash
# 16:9 без субтитров, вебка стримера (слева) размыта
ffmpeg -loglevel error -y -i "$1" -filter_complex "[0:v]split[a][b];[b]crop=268:250:0:282,boxblur=30:3[bl];[a][bl]overlay=0:282" -c:v libx264 -preset medium -crf 18 -c:a copy -movflags +faststart "$2" && echo "SHORT $2"
