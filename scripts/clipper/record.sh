#!/bin/bash
# Пишет эфир Twitch кусками по 10 с: buf/<unix-время>.ts. Старше 40 мин — удаляет.
CH=${1:-skywhywalker}; DIR=${2:-/tmp/clipper}; mkdir -p "$DIR/buf"
( while true; do find "$DIR/buf" -name '*.ts' -mmin +40 -delete; sleep 60; done ) &
while true; do
  streamlink --twitch-disable-ads --stream-segment-threads 2 -O "https://www.twitch.tv/$CH" 720p60,720p,best 2>>"$DIR/rec.err" \
  | ffmpeg -v error -i - -c copy -map 0 -f segment -segment_time 10 -strftime 1 -reset_timestamps 1 "$DIR/buf/%s.ts" 2>>"$DIR/rec.err"
  echo "$(date) stream stopped, retry in 30s" >>"$DIR/rec.err"; sleep 30
done
