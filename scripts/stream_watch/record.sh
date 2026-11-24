#!/bin/bash
# Пишет трансляцию кусками по 60 с, имя = время начала (UTC). Перезапускается при обрыве.
CH=${1:-typicalgamer}; D=/home/user/stream_watch/seg
while true; do
  streamlink --twitch-disable-ads --stream-segment-threads 2 -O "https://www.twitch.tv/$CH" best 2>>/home/user/stream_watch/streamlink.log \
  | ffmpeg -loglevel error -i pipe:0 -c copy -f segment -segment_time 60 -reset_timestamps 1 -strftime 1 "$D/%Y%m%d-%H%M%S.ts" 2>>/home/user/stream_watch/ffmpeg.log
  echo "$(date -u) restart" >> /home/user/stream_watch/rec.log; sleep 15
done
