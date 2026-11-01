#!/usr/bin/env bash
# Готовый шортс одной командой: рендер композиции Fin-<id> + громкость -14 LUFS (как у YouTube/TikTok).
# Если лежит ads/ad.mp4 (зелёный фон) и в engine.tsx AD_FRAMES > 0, реклама встаёт в паузу посередине ролика.
# Запуск: bash scripts/make.sh ikea apple ...   Результат: videos/<id>.mp4 (его коммитим, чтобы скачать с телефона)
set -e
cd "$(dirname "$0")/.."
FF=ffmpeg; command -v ffmpeg >/dev/null || FF="npx remotion ffmpeg"
AD=ads/ad.mp4
AD_SPEED=1.3
mkdir -p out videos

for ID in "$@"; do
  RAW="out/_raw_$ID.mp4"
  npx remotion render "Fin-$ID" "$RAW" --crf=18 --log=error
  if [ -f "$AD" ] && ! grep -q "export const AD_FRAMES = 0;" src/finance/engine.tsx; then
    # Начало рекламы: конец предложения, ближайший к середине озвучки (как buildTopic в engine.tsx).
    AT=$(node -e '
      const s=require("fs").readFileSync("src/finance/topics/"+process.argv[1]+".voice.ts","utf8");
      const V=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1)),W=V.words;
      let b=W[0];W.forEach(w=>{if(w.end&&Math.abs(w.e-V.dur/2)<Math.abs(b.e-V.dur/2))b=w});
      const n=W[W.indexOf(b)+1],cut=n?(b.e+n.t)/2:b.e;console.log(((4+Math.round(cut*30))/30).toFixed(3))' "$ID")
    MS=$(awk "BEGIN{printf \"%d\", $AT*1000}")
    $FF -nostdin -v error -y -i "$RAW" -i "$AD" -filter_complex "
      [1:v]setpts=PTS/$AD_SPEED,fps=30,chromakey=0x00FF00:0.28:0.08,scale=1080:-1,setpts=PTS-STARTPTS+$AT/TB[vp];
      [0:v][vp]overlay=(W-w)/2:(H-h)/2:eof_action=pass,format=yuv420p[v];
      [1:a]aformat=sample_rates=48000:channel_layouts=stereo,atempo=$AD_SPEED,volume=8dB,adelay=$MS|$MS[va];
      [0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0];
      [a0][va]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
      -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 160k -movflags +faststart "videos/$ID.mp4"
  else
    $FF -nostdin -v error -y -i "$RAW" -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
      -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 160k -movflags +faststart "videos/$ID.mp4"
  fi
  rm -f "$RAW"
  echo "готово: videos/$ID.mp4"
done
